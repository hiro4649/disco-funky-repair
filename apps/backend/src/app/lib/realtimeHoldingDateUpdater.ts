/**
 * Real-Time Holding Date Updater
 *
 * Processes individual users immediately when transactions are detected.
 *
 * Flow:
 * 1. Triggered by Transfer event
 * 2. Get transaction data from QuickNode RPC (FAST) or Etherscan API (fallback)
 * 3. Apply incremental FIFO update
 * 4. Update database
 * 5. Check if tier changed → schedule tier update
 *
 * Performance: QuickNode RPC (~5-10s) vs Etherscan API (~15-120s)
 */

import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import apiKeyManager from './dualApiKeyManager';
import { processIncrementalFIFO, saveFIFOQueue } from './incrementalFIFOProcessor';
import { processUserWithClassification } from './enhancedHoldingDateProcessor';
import { updateCheckpoint } from './incrementalHoldingDateProcessor';
import { scheduleTierUpdate, updateUserContractTier, getMilestoneTier } from './tierScheduler';
import { tokenBalanceService } from './quicknodeRpcService';
import { withUserLock } from './userProcessingLock';
import { ETHERSCAN_API_URL as CONFIGURED_ETHERSCAN_API_URL, TOKEN_CONTRACT_ADDRESS } from '../config/env';
import { safeLogError } from '../utils/safeLogger';
import { fetchJsonWithTimeout } from '../utils/externalCallTimeout';

const prisma = new PrismaClient();

const ETHERSCAN_API_URL = CONFIGURED_ETHERSCAN_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'https://api.bscscan.com/api');

// ERC20 ABI for balance checking
const TOKEN_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
];

// Event data structure from WebSocket
interface EventData {
    hash: string;
    from: string;
    to: string;
    value: bigint;
    blockNumber: number;
}

/**
 * Fetch transaction data from QuickNode RPC (FAST PATH)
 * Uses centralized tokenBalanceService with credit tracking and automatic Etherscan fallback
 */
const fetchTransactionFromQuickNode = async (eventData: EventData): Promise<any> => {
    try {


        // Use centralized service with credit-aware rate limiting (16 credits per eth_getBlockByNumber)
        const block = await tokenBalanceService.getQuickNodeBlock(eventData.blockNumber);

        if (!block) {
            throw new Error(`Block ${eventData.blockNumber} not found`);
        }



        // Format transaction data in Etherscan-compatible format
        const transaction = {
            hash: eventData.hash,
            from: eventData.from,
            to: eventData.to,
            value: eventData.value.toString(),
            timeStamp: block.timestamp.toString(),
            blockNumber: eventData.blockNumber.toString(),
            tokenSymbol: 'TOKEN', // Will be fetched from contract if needed
            tokenDecimal: '18'    // Standard for most ERC20 tokens
        };



        return transaction;

    } catch (error) {
        safeLogError('quicknode_fetch_transaction', error, {
            blockNumber: eventData.blockNumber,
            txHashPrefix: eventData.hash.slice(0, 10)
        });
        throw error; // Will trigger fallback to Etherscan API
    }
};

/**
 * Fetch transactions for a specific user with API key rotation (FALLBACK PATH)
 * Used for historical data and when QuickNode RPC fails
 */
const fetchUserTransactions = async (
    walletAddress: string,
    startBlock: number = 0
): Promise<any[]> => {
    const transactions: any[] = [];
    const offset = 1000;
    let page = 1;
    let hasMore = true;

    try {
        if (!ETHERSCAN_API_URL) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('ETHERSCAN_API_URL is not configured');
            }

            return [];
        }

        while (hasMore) {
            // Get API key with automatic rate limiting and rotation
            const url = await apiKeyManager.buildUrl(ETHERSCAN_API_URL, {
                module: 'account',
                action: 'tokentx',
                contractaddress: TOKEN_CONTRACT_ADDRESS,
                address: walletAddress,
                startblock: startBlock,
                endblock: 99999999,
                page,
                offset,
                sort: 'asc'
            });

            const data = await fetchJsonWithTimeout<any>(
                url,
                {},
                undefined,
                'etherscan_realtime_user_transactions'
            );


            if (data.status === '1' && Array.isArray(data.result) && data.result.length > 0) {
                transactions.push(...data.result);

                if (data.result.length < offset) {
                    hasMore = false;
                } else {
                    page += 1;
                }
            } else {
                hasMore = false;
            }
        }
    } catch (error) {
        safeLogError('fetch_user_transactions', error, {
            walletAddressPrefix: walletAddress.slice(0, 10),
            startBlock,
            page
        });
    }

    return transactions;
};

/**
 * Process user in real-time (triggered by Transfer event)
 *
 * @param userId - User ID in database
 * @param walletAddress - User's wallet address
 * @param eventData - Optional event data from WebSocket (enables fast path via QuickNode RPC)
 */
export const processUserRealtime = async (
    userId: number,
    walletAddress: string,
    eventData?: EventData
): Promise<void> => {
    await withUserLock(userId, async () => {
    try {


        // ============================================================
        // WebSocket: Notify frontend that processing has started
        // ============================================================
        try {
            const { io } = await import('../index');
            const eventData = {
                userId,
                walletAddress
            };
            io.emit('holding-date-processing', eventData);

        } catch (error) {
            safeLogError('emit_holding_date_processing', error, { userId });
        }

        const startTime = Date.now();

        // Get user's checkpoint
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { TransactionCheckpoint: true }
        });

        if (!user) {

            return;
        }

        const checkpoint = user.TransactionCheckpoint;
        const isFirstTime = !checkpoint;
        const startBlock = checkpoint?.lastProcessedBlock || 0;

        let newTransactions: any[] = [];

        // FAST PATH: Use QuickNode RPC if event data is provided
        if (eventData && !isFirstTime) {
            try {


                // Get transaction from QuickNode RPC (no waiting for indexing!)
                const transaction = await fetchTransactionFromQuickNode(eventData);
                newTransactions = [transaction];



            } catch (error) {
                safeLogError('quicknode_realtime_fallback', error, {
                    userId,
                    blockNumber: eventData.blockNumber
                });
                // Fall through to Etherscan API fallback below
            }
        }

        // FALLBACK PATH: Use Etherscan API if QuickNode RPC failed or no event data
        if (newTransactions.length === 0) {


            // Exponential backoff for BSC's variable indexing time
            // BSC indexing: 10-60s normal, 1-3min during congestion, up to 5min rare cases
            const delays = [10000, 30000, 60000, 120000]; // 10s, 30s, 60s, 120s

            for (let attempt = 0; attempt < delays.length; attempt++) {
                const delaySeconds = delays[attempt] / 1000;


                await new Promise(resolve => setTimeout(resolve, delays[attempt]));

                // Fetch transactions
                newTransactions = await fetchUserTransactions(walletAddress, startBlock);


                if (newTransactions.length > 0) {

                    break; // Success!
                }

                if (attempt < delays.length - 1) {

                }
            }

            if (newTransactions.length === 0 && !isFirstTime) {
                const totalWaitTime = delays.reduce((a, b) => a + b, 0) / 1000;

                return;
            }
        }



        let averageDays: number;
        let fifoAdjustedPurchases: any[];

        if (isFirstTime) {
            // FIRST TIME: Process full history


            const result = await processUserWithClassification(userId, walletAddress, newTransactions);
            averageDays = result.averageDays;
            fifoAdjustedPurchases = result.fifoAdjustedPurchases;



        } else {
            // INCREMENTAL: Process only new transactions


            const result = await processIncrementalFIFO(userId, walletAddress, newTransactions);
            averageDays = result.averageDays;
            fifoAdjustedPurchases = result.updatedFIFOQueue.map(p => ({
                timestamp: p.timestamp,
                amount: Number(p.amount) / Math.pow(10, 18),
                hash: p.hash
            }));


        }

        // Handle edge case
        const safeAverageDays = isNaN(averageDays) || !isFinite(averageDays) ? 0 : averageDays;

        // Get current tier before update
        const oldTier = getMilestoneTier(user.holdingDate);
        const newTier = getMilestoneTier(safeAverageDays);

        // Update user's holdingDate in database
        await prisma.user.update({
            where: { id: userId },
            data: {
                holdingDate: Math.floor(safeAverageDays),
                held_amount: safeAverageDays,
                updatedAt: new Date()
            }
        });

        // Save updated FIFO queue (HoldDateHistory table)
        const fifoQueueToSave = fifoAdjustedPurchases.map((p: any) => ({
            timestamp: p.timestamp,
            amount: BigInt(Math.floor(p.amount * Math.pow(10, 18))),
            hash: p.hash
        }));


        await saveFIFOQueue(userId, fifoQueueToSave);


        // Update checkpoint
        const lastTransaction = newTransactions.length > 0
            ? newTransactions[newTransactions.length - 1]
            : null;

        const lastBlock = lastTransaction
            ? parseInt(lastTransaction.blockNumber || '0', 10)
            : checkpoint?.lastProcessedBlock || 0;

        const lastActivityDate = lastTransaction
            ? new Date(parseInt(lastTransaction.timeStamp, 10) * 1000)
            : checkpoint?.lastActivityDate || new Date();

        const currentBalance = fifoAdjustedPurchases.reduce((sum: number, p: any) => sum + p.amount, 0);

        const transactionsToCount = isFirstTime
            ? newTransactions.length
            : (checkpoint?.transactionCount || 0) + newTransactions.length;

        await updateCheckpoint(
            userId,
            lastBlock,
            lastTransaction?.hash || checkpoint?.lastTransactionHash || null,
            currentBalance,
            transactionsToCount,
            lastActivityDate
        );

        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);



        // Check if tier changed
        if (oldTier !== newTier) {

            await updateUserContractTier(userId, 3, {
                tokenBalance: currentBalance,
                holdingDays: safeAverageDays
            });
        }

        // Schedule next tier update
        await scheduleTierUpdate(userId, safeAverageDays);

        // ============================================================
        // WebSocket: Notify frontend that holding date was updated
        // ============================================================
        try {
            const { io } = await import('../index');
            const updateEventData = {
                userId,
                walletAddress,
                averageDays: safeAverageDays,
                timestamp: new Date().toISOString(),
                processingTime: parseFloat(processingTime),
                tierChanged: oldTier !== newTier,
                newTier
            };
            io.emit('holding-date-updated', updateEventData);

        } catch (error) {
            safeLogError('emit_holding_date_updated', error, { userId });
        }

    } catch (error) {
        safeLogError('process_user_realtime', error, { userId });
        throw error;
    }
    });
};

/**
 * Process multiple users in batch (for background processing)
 */
export const processUsersBatch = async (userIds: number[]): Promise<void> => {


    const results = {
        success: 0,
        failed: 0,
        skipped: 0
    };

    for (const userId of userIds) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { wallet_address: true }
            });

            if (!user) {
                results.skipped++;
                continue;
            }

            await processUserRealtime(userId, user.wallet_address);
            results.success++;

        } catch (error) {
            safeLogError('process_users_batch_user', error, { userId });
            results.failed++;
        }
    }


};

export default {
    processUserRealtime,
    processUsersBatch
};
