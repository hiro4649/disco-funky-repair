/**
 * True Incremental FIFO Processor
 *
 * This implements genuine incremental FIFO processing:
 * 1. Load existing FIFO queue from database
 * 2. Fetch only NEW transactions since last checkpoint
 * 3. Classify NEW transactions only
 * 4. Apply NEW transactions to existing FIFO queue
 * 5. Recalculate holding date from updated queue
 * 6. Save updated FIFO queue
 *
 * This avoids re-classifying all historical transactions every time.
 *
 * PRECISION NOTE: Uses Decimal(38,18) in database for exact ERC20 token amounts.
 * All internal calculations use BigInt (wei) for zero precision loss.
 */

import { Prisma } from '@prisma/client';
import prisma from '../db/prisma_client';
import {
    classifyAllTransactions,
    getTransactionsForFIFO,
    ClassifiedTransaction,
    FIFOImpact,
    TransactionClassifierConfig
} from './transactionClassifier';
import { TOKEN_CONTRACT_ADDRESS } from '../config/env';

const DECIMALS = 18;
const DECIMALS_FACTOR = BigInt(10) ** BigInt(DECIMALS);

interface FIFOPurchase {
    timestamp: number;
    amount: bigint;
    hash: string;
    /** Transaction index within block (0-based). Used to order same-block txns. */
    transactionIndex?: number;
}

interface IncrementalFIFOResult {
    averageDays: number;
    updatedFIFOQueue: FIFOPurchase[];
    newTransactionsProcessed: number;
    classificationSummary: {
        purchases: number;
        sales: number;
        ignored: number;
    };
}

/**
 * Load existing FIFO queue from database
 *
 * Converts Decimal(38,18) from database to BigInt (wei) for precise calculations.
 * Prisma Decimal is converted via string to avoid any floating-point precision loss.
 */
const loadExistingFIFOQueue = async (userId: number): Promise<FIFOPurchase[]> => {
    const history = await prisma.holdDateHistory.findMany({
        where: { userId },
        orderBy: { purchase_date: 'asc' }
    });

    return history.map(h => {
        // Convert Decimal to BigInt via string multiplication to preserve precision
        // Prisma Decimal.toString() gives exact decimal representation
        const decimalStr = h.purchase_amount.toString();
        const [intPart, fracPart = ''] = decimalStr.split('.');

        // Pad or trim fractional part to exactly 18 digits
        const paddedFrac = fracPart.padEnd(DECIMALS, '0').slice(0, DECIMALS);
        const weiStr = intPart + paddedFrac;

        return {
            timestamp: Math.floor(h.purchase_date.getTime() / 1000),
            amount: BigInt(weiStr), // Exact conversion, no precision loss
            hash: h.tx_hash
        };
    });
};

/**
 * Apply new classified transactions to existing FIFO queue
 */
const applyTransactionsToFIFO = (
    existingQueue: FIFOPurchase[],
    newPurchases: ClassifiedTransaction[],
    newSales: ClassifiedTransaction[]
): FIFOPurchase[] => {
    // Copy existing queue
    const fifoQueue = [...existingQueue];

    // Add new purchases to queue (chronologically; same-block order by transactionIndex)
    const newPurchaseEntries: FIFOPurchase[] = newPurchases.map(tx => ({
        timestamp: tx.timestamp,
        amount: BigInt(tx.value),
        hash: tx.hash,
        transactionIndex: tx.transactionIndex
    }));

    // Merge and sort by timestamp, then by transactionIndex for same-block txns
    const byBlockOrder = (a: { timestamp: number; transactionIndex?: number }, b: { timestamp: number; transactionIndex?: number }) =>
        a.timestamp - b.timestamp || (a.transactionIndex ?? 0) - (b.transactionIndex ?? 0);
    const allPurchases = [...fifoQueue, ...newPurchaseEntries].sort(byBlockOrder);

    // Apply FIFO: Process sales in block order (timestamp, then transactionIndex)
    const sortedSales = [...newSales].sort(byBlockOrder);

    const finalQueue = [...allPurchases];

    for (const sale of sortedSales) {
        let remainingSale = BigInt(sale.value);

        // Deduct from oldest purchases first
        let i = 0;
        while (remainingSale > BigInt(0) && i < finalQueue.length) {
            const purchase = finalQueue[i];

            if (purchase.amount <= remainingSale) {
                // Fully consumed - remove from queue
                remainingSale -= purchase.amount;
                finalQueue.splice(i, 1);
                // Don't increment i because we removed an element
            } else {
                // Partially consumed - reduce amount
                purchase.amount -= remainingSale;
                remainingSale = BigInt(0);
                i++;
            }
        }

        if (remainingSale > BigInt(0)) {

        }
    }

    return finalQueue;
};

/**
 * Convert BigInt wei to token amount (Number) with maximum available precision.
 * For amounts up to ~9 quadrillion tokens, this provides 15-16 significant digits.
 * The weighted average calculation is inherently floating-point, so some precision
 * loss is acceptable here since we're calculating days, not exact token amounts.
 */
const bigIntToTokens = (amountWei: bigint): number => {
    // For very large amounts, we might lose precision in the least significant digits
    // but for holding day calculations, this is acceptable
    return Number(amountWei) / Number(DECIMALS_FACTOR);
};

/**
 * Calculate weighted average holding days from FIFO queue
 *
 * Uses BigInt for token amounts until the final calculation.
 * The weighted average result is inherently floating-point (days can be fractional).
 */
const calculateHoldingDaysFromQueue = (
    fifoQueue: FIFOPurchase[],
    currentTimeMs: number
): number => {
    if (fifoQueue.length === 0) {
        return 0;
    }

    let totalWeightedDays = 0;
    let totalRemainingTokens = BigInt(0);

    for (const purchase of fifoQueue) {
        const holdingDurationMs = currentTimeMs - purchase.timestamp * 1000;
        const holdingDays = holdingDurationMs / (1000 * 60 * 60 * 24);
        const tokensFloat = bigIntToTokens(purchase.amount);

        totalWeightedDays += holdingDays * tokensFloat;
        totalRemainingTokens += purchase.amount;
    }

    const totalTokensFloat = bigIntToTokens(totalRemainingTokens);
    return totalTokensFloat > 0 ? totalWeightedDays / totalTokensFloat : 0;
};

/**
 * Process new transactions incrementally
 */
export const processIncrementalFIFO = async (
    userId: number,
    walletAddress: string,
    newTransactions: any[]
): Promise<IncrementalFIFOResult> => {
    const currentTimeMs = Date.now();

    // 1. Load existing FIFO queue from database
    const existingQueue = await loadExistingFIFOQueue(userId);


    // 2. Classify NEW transactions only
    const config: TransactionClassifierConfig = {
        userWalletAddresses: [walletAddress],
        tokenAddress: TOKEN_CONTRACT_ADDRESS,
        treatLPAsNeutral: false,
        treatInternalTransfersAsNeutral: true,
        ignoreAirdrops: false
    };

    const classifiedNew = await classifyAllTransactions(newTransactions, config);
    const { purchases: newPurchases, sales: newSales, ignored } = getTransactionsForFIFO(classifiedNew);



    // 3. Apply new transactions to existing FIFO queue
    const updatedQueue = applyTransactionsToFIFO(existingQueue, newPurchases, newSales);


    // 4. Calculate holding date from updated queue
    const averageDays = calculateHoldingDaysFromQueue(updatedQueue, currentTimeMs);

    // 5. Save audit records for new transactions only
    await saveTransactionAudit(userId, classifiedNew);

    return {
        averageDays,
        updatedFIFOQueue: updatedQueue,
        newTransactionsProcessed: newTransactions.length,
        classificationSummary: {
            purchases: newPurchases.length,
            sales: newSales.length,
            ignored: ignored.length
        }
    };
};

/**
 * Save transaction classification audit records
 */
async function saveTransactionAudit(userId: number, classifiedTransactions: ClassifiedTransaction[]): Promise<void> {
    try {
        const auditRecords = classifiedTransactions.map(tx => ({
            userId,
            tx_hash: tx.hash,
            from_address: tx.from,
            to_address: tx.to,
            amount: parseFloat(tx.value) / Math.pow(10, 18),
            transaction_type: tx.type,
            fifo_impact: tx.fifoImpact,
            classification_reason: tx.reason,
            metadata: tx.metadata || {},
            block_number: tx.blockNumber,
            transaction_date: new Date(tx.timestamp * 1000)
        }));

        for (const record of auditRecords) {
            await prisma.transactionAudit.upsert({
                where: {
                    userId_tx_hash: {
                        userId: record.userId,
                        tx_hash: record.tx_hash
                    }
                },
                create: record,
                update: {
                    transaction_type: record.transaction_type,
                    fifo_impact: record.fifo_impact,
                    classification_reason: record.classification_reason,
                    metadata: record.metadata,
                    processed_at: new Date()
                }
            });
        }


    } catch (error) {

    }
}

/**
 * Convert BigInt wei to Decimal string for database storage.
 * This preserves full precision by using string manipulation instead of floating-point.
 */
const bigIntToDecimalString = (amountWei: bigint): string => {
    const weiStr = amountWei.toString();

    if (weiStr.length <= DECIMALS) {
        // Amount is less than 1 token, pad with leading zeros
        return '0.' + weiStr.padStart(DECIMALS, '0');
    }

    // Insert decimal point at the correct position
    const intPart = weiStr.slice(0, -DECIMALS);
    const fracPart = weiStr.slice(-DECIMALS);
    return intPart + '.' + fracPart;
};

/**
 * Save updated FIFO queue to database
 *
 * Uses a database transaction so that delete + insert are atomic:
 * - Either both succeed, or both roll back (no partial state).
 * - Prevents race conditions where another process reads between delete and insert.
 *
 * Converts BigInt (wei) to Decimal string for exact precision storage.
 * No floating-point conversion means zero precision loss.
 */
export const saveFIFOQueue = async (userId: number, fifoQueue: FIFOPurchase[]): Promise<void> => {
    await prisma.$transaction(async (tx) => {
        // Clear old FIFO queue (inside transaction)
        await tx.holdDateHistory.deleteMany({
            where: { userId }
        });

        if (fifoQueue.length === 0) {
            return;
        }

        // Insert updated FIFO queue with Decimal precision (inside same transaction)
        const historyRecords = fifoQueue.map(purchase => ({
            userId,
            tx_hash: purchase.hash,
            purchase_amount: new Prisma.Decimal(bigIntToDecimalString(purchase.amount)),
            purchase_date: new Date(purchase.timestamp * 1000)
        }));

        await tx.holdDateHistory.createMany({
            data: historyRecords,
            skipDuplicates: true
        });
    });

    if (fifoQueue.length > 0) {

    }
};

export default {
    processIncrementalFIFO,
    saveFIFOQueue
};
