/**
 * Enhanced Holding Date Processor with Transaction Classification
 *
 * Combines the optimized incremental processing with advanced transaction classification
 * for transparent, accurate holding date calculations.
 *
 * Key features:
 * - Proper transaction type detection (buy/sell/LP/airdrop/etc.)
 * - Audit trail for every transaction
 * - User-explainable holding date calculations
 * - DEX interaction awareness
 */

import { PrismaClient } from '@prisma/client';
import {
    classifyAllTransactions,
    getTransactionsForFIFO,
    generateTransactionReport,
    TransactionClassifierConfig,
    ClassifiedTransaction,
    FIFOImpact
} from './transactionClassifier';
import { TOKEN_CONTRACT_ADDRESS } from '../config/env';

const prisma = new PrismaClient();

/**
 * Calculate weighted average holding date with classified transactions
 */
export const calculateWeightedAverageWithClassification = (
    classifiedTransactions: ClassifiedTransaction[],
    walletAddress: string,
    currentTimeMs: number
): {
    averageDays: number;
    fifoAdjustedPurchases: any[];
    report: ReturnType<typeof generateTransactionReport>;
} => {

    // Generate report for transparency
    const report = generateTransactionReport(classifiedTransactions);

    // Get only transactions that affect FIFO
    const { purchases, sales, ignored } = getTransactionsForFIFO(classifiedTransactions);



    if (purchases.length === 0) {
        return { averageDays: 0, fifoAdjustedPurchases: [], report };
    }

    const decimals = 18; // Assuming 18 decimals
    const decimalsFactor = BigInt(10) ** BigInt(decimals);

    // Same-block order: timestamp then transactionIndex
    const byBlockOrder = (a: { timestamp: number; transactionIndex?: number }, b: { timestamp: number; transactionIndex?: number }) =>
        a.timestamp - b.timestamp || (a.transactionIndex ?? 0) - (b.transactionIndex ?? 0);

    // Convert to FIFO-compatible format (sorted by block order)
    const purchaseQueue: Array<{ timestamp: number; amount: bigint; hash: string }> = [...purchases]
        .sort(byBlockOrder)
        .map(tx => ({
            timestamp: tx.timestamp,
            amount: BigInt(tx.value),
            hash: tx.hash
        }));

    const saleList: Array<{ timestamp: number; amount: bigint }> = [...sales]
        .sort(byBlockOrder)
        .map(tx => ({
            timestamp: tx.timestamp,
            amount: BigInt(tx.value)
        }));

    // Apply FIFO: Deduct sales from oldest purchases first
    const fifoQueue = [...purchaseQueue];
    let remainingSale = BigInt(0);

    for (const sale of saleList) {
        remainingSale = sale.amount;

        while (remainingSale > BigInt(0) && fifoQueue.length > 0) {
            const oldest = fifoQueue[0];

            if (oldest.amount <= remainingSale) {
                remainingSale -= oldest.amount;
                fifoQueue.shift();
            } else {
                oldest.amount -= remainingSale;
                remainingSale = BigInt(0);
            }
        }
    }

    // Calculate weighted average from remaining purchases
    if (fifoQueue.length === 0) {
        return { averageDays: 0, fifoAdjustedPurchases: [], report };
    }

    let totalWeightedDays = 0;
    let totalRemainingTokens = BigInt(0);

    for (const purchase of fifoQueue) {
        const holdingDurationMs = currentTimeMs - purchase.timestamp * 1000;
        const holdingDays = holdingDurationMs / (1000 * 60 * 60 * 24);
        const tokensFloat = Number(purchase.amount) / Number(decimalsFactor);

        totalWeightedDays += holdingDays * tokensFloat;
        totalRemainingTokens += purchase.amount;
    }

    const totalTokensFloat = Number(totalRemainingTokens) / Number(decimalsFactor);
    const averageDays = totalTokensFloat > 0 ? totalWeightedDays / totalTokensFloat : 0;

    // Convert FIFO-adjusted purchases for database storage
    const fifoAdjustedPurchases = fifoQueue.map(p => ({
        timestamp: p.timestamp,
        amount: Number(p.amount) / Number(decimalsFactor),
        hash: p.hash
    }));

    return { averageDays, fifoAdjustedPurchases, report };
};

/**
 * Process user transactions with classification and audit logging
 */
export const processUserWithClassification = async (
    userId: number,
    walletAddress: string,
    allTransactions: any[]
): Promise<{
    averageDays: number;
    fifoAdjustedPurchases: any[];
    report: any;
}> => {

    const currentTimeMs = Date.now();

    // Configuration for transaction classifier
    const config: TransactionClassifierConfig = {
        userWalletAddresses: [walletAddress], // Could expand to include linked wallets
        tokenAddress: TOKEN_CONTRACT_ADDRESS,
        treatLPAsNeutral: false, // LP operations affect holdings
        treatInternalTransfersAsNeutral: true, // Ignore transfers between own wallets
        ignoreAirdrops: false // Include airdrops as purchases
    };

    // Classify all transactions
    const classifiedTransactions = await classifyAllTransactions(allTransactions, config);

    // Calculate holding date with classification
    const { averageDays, fifoAdjustedPurchases, report } = calculateWeightedAverageWithClassification(
        classifiedTransactions,
        walletAddress,
        currentTimeMs
    );

    // Save audit records for transparency
    await saveTransactionAudit(userId, classifiedTransactions);

    return { averageDays, fifoAdjustedPurchases, report };
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
            amount: parseFloat(tx.value) / Math.pow(10, 18), // Convert to token units
            transaction_type: tx.type,
            fifo_impact: tx.fifoImpact,
            classification_reason: tx.reason,
            metadata: tx.metadata || {},
            block_number: tx.blockNumber,
            transaction_date: new Date(tx.timestamp * 1000)
        }));

        // Upsert audit records (update if exists, insert if not)
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

        // Don't fail the entire process if audit logging fails
    }
}

/**
 * Get user's transaction history with classifications
 */
export const getUserTransactionHistory = async (userId: number): Promise<{
    transactions: any[];
    summary: any;
}> => {
    const auditRecords = await prisma.transactionAudit.findMany({
        where: { userId },
        orderBy: { transaction_date: 'desc' }
    });

    const summary = {
        total: auditRecords.length,
        byType: {} as Record<string, number>,
        byFIFOImpact: {} as Record<string, number>
    };

    auditRecords.forEach(record => {
        summary.byType[record.transaction_type] = (summary.byType[record.transaction_type] || 0) + 1;
        summary.byFIFOImpact[record.fifo_impact] = (summary.byFIFOImpact[record.fifo_impact] || 0) + 1;
    });

    return {
        transactions: auditRecords,
        summary
    };
};

/**
 * Explain holding date calculation for a user
 */
export const explainHoldingDateCalculation = async (userId: number): Promise<{
    currentHoldingDate: number;
    activePurchases: number;
    totalTransactions: number;
    breakdown: {
        purchases: number;
        sales: number;
        lpOperations: number;
        airdrops: number;
        ignored: number;
    };
    fifoSnapshot: any[];
}> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { HoldDateHistory: true }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const auditRecords = await prisma.transactionAudit.findMany({
        where: { userId },
        orderBy: { transaction_date: 'asc' }
    });

    const breakdown = {
        purchases: auditRecords.filter(r => r.fifo_impact === FIFOImpact.INCREASE).length,
        sales: auditRecords.filter(r => r.fifo_impact === FIFOImpact.DECREASE).length,
        lpOperations: auditRecords.filter(r => r.transaction_type.includes('LP_')).length,
        airdrops: auditRecords.filter(r => r.transaction_type === 'AIRDROP').length,
        ignored: auditRecords.filter(r => r.fifo_impact === FIFOImpact.IGNORE).length
    };

    // Convert Prisma Decimal to Number for display and calculation
    const fifoSnapshot = user.HoldDateHistory.map(h => ({
        purchaseDate: h.purchase_date,
        amount: Number(h.purchase_amount), // Prisma Decimal → Number
        daysHeld: Math.floor((Date.now() - h.purchase_date.getTime()) / (1000 * 60 * 60 * 24)),
        txHash: h.tx_hash
    }));

    // Calculate actual weighted average based on current FIFO snapshot
    let currentHoldingDate = 0;
    if (fifoSnapshot.length > 0) {
        const totalWeight = fifoSnapshot.reduce((sum, p) => sum + (p.amount * p.daysHeld), 0);
        const totalAmount = fifoSnapshot.reduce((sum, p) => sum + p.amount, 0);
        currentHoldingDate = totalAmount > 0 ? Math.floor(totalWeight / totalAmount) : 0;
    }

    return {
        currentHoldingDate,
        activePurchases: user.HoldDateHistory.length,
        totalTransactions: auditRecords.length,
        breakdown,
        fifoSnapshot
    };
};

export default {
    calculateWeightedAverageWithClassification,
    processUserWithClassification,
    getUserTransactionHistory,
    explainHoldingDateCalculation
};
