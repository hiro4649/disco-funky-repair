/**
 * Transaction History Controller
 *
 * Provides API endpoints for users to view their transaction classifications
 * and understand how their holding date is calculated.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
    getUserTransactionHistory,
    explainHoldingDateCalculation
} from '../lib/enhancedHoldingDateProcessor';

const prisma = new PrismaClient();

type AuthenticatedUser = {
    user_id?: number;
    address?: string;
};

const getAuthenticatedUserId = (req: Request): number | null => {
    const userId = Number((req.user as AuthenticatedUser | undefined)?.user_id);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
};

const normalizeWalletAddress = (value: unknown): string | null => {
    return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
};

const requestedWalletMatchesAuthenticatedUser = (req: Request, walletAddress: unknown): boolean => {
    const requestedWalletAddress = normalizeWalletAddress(walletAddress);
    const authenticatedWalletAddress = normalizeWalletAddress((req.user as AuthenticatedUser | undefined)?.address);

    return Boolean(requestedWalletAddress && authenticatedWalletAddress && requestedWalletAddress === authenticatedWalletAddress);
};

export class TransactionHistoryController {
    /**
     * GET /api/transaction-history/:walletAddress
     * Get classified transaction history for a wallet
     */
    static async getTransactionHistory(req: Request, res: Response): Promise<Response> {
        try {
            const { walletAddress } = req.params;
            const { page = 1, limit = 50, type, fifoImpact } = req.query;
            const authenticatedUserId = getAuthenticatedUserId(req);

            if (!authenticatedUserId) {
                return res.status(401).json({ success: false, message: 'Unauthenticated' });
            }

            if (!requestedWalletMatchesAuthenticatedUser(req, walletAddress)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            // Find user by wallet address (case-insensitive for Ethereum addresses)
            const user = await prisma.user.findFirst({
                where: {
                    wallet_address: {
                        equals: walletAddress,
                        mode: 'insensitive'
                    }
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get transaction history
            const { transactions, summary } = await getUserTransactionHistory(user.id);

            // Apply filters
            let filteredTransactions = transactions;
            if (type) {
                filteredTransactions = filteredTransactions.filter(tx => tx.transaction_type === type);
            }
            if (fifoImpact) {
                filteredTransactions = filteredTransactions.filter(tx => tx.fifo_impact === fifoImpact);
            }

            // Paginate
            const skip = (Number(page) - 1) * Number(limit);
            const paginatedTransactions = filteredTransactions.slice(skip, skip + Number(limit));

            return res.status(200).json({
                success: true,
                data: {
                    transactions: paginatedTransactions,
                    summary,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: filteredTransactions.length,
                        pages: Math.ceil(filteredTransactions.length / Number(limit))
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching transaction history:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transaction history',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * GET /api/holding-date/explain/:walletAddress
     * Get detailed explanation of holding date calculation
     */
    static async explainHoldingDate(req: Request, res: Response): Promise<Response> {
        try {
            const { walletAddress } = req.params;
            const authenticatedUserId = getAuthenticatedUserId(req);

            if (!authenticatedUserId) {
                return res.status(401).json({ success: false, message: 'Unauthenticated' });
            }

            if (!requestedWalletMatchesAuthenticatedUser(req, walletAddress)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            // Find user by wallet address (case-insensitive for Ethereum addresses)
            const user = await prisma.user.findFirst({
                where: {
                    wallet_address: {
                        equals: walletAddress,
                        mode: 'insensitive'
                    }
                }
            });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get explanation
            const explanation = await explainHoldingDateCalculation(user.id);

            return res.status(200).json({
                success: true,
                data: explanation
            });

        } catch (error) {
            console.error('Error explaining holding date:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to explain holding date',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * GET /api/transaction-types
     * Get list of all transaction types with descriptions
     */
    static async getTransactionTypes(req: Request, res: Response): Promise<Response> {
        try {
            const transactionTypes = [
                {
                    type: 'PURCHASE',
                    description: 'Regular token purchase or transfer received',
                    fifoImpact: 'INCREASE',
                    affects_holding: true
                },
                {
                    type: 'SALE',
                    description: 'Regular token sale or transfer sent',
                    fifoImpact: 'DECREASE',
                    affects_holding: true
                },
                {
                    type: 'SWAP_IN',
                    description: 'Tokens received from DEX swap',
                    fifoImpact: 'INCREASE',
                    affects_holding: true
                },
                {
                    type: 'SWAP_OUT',
                    description: 'Tokens sent to DEX for swap',
                    fifoImpact: 'DECREASE',
                    affects_holding: true
                },
                {
                    type: 'LP_ADD',
                    description: 'Tokens added to liquidity pool',
                    fifoImpact: 'DECREASE',
                    affects_holding: true
                },
                {
                    type: 'LP_REMOVE',
                    description: 'Tokens removed from liquidity pool',
                    fifoImpact: 'INCREASE',
                    affects_holding: true
                },
                {
                    type: 'AIRDROP',
                    description: 'Tokens received from airdrop or minting',
                    fifoImpact: 'INCREASE',
                    affects_holding: true
                },
                {
                    type: 'INTERNAL_TRANSFER',
                    description: 'Transfer between your own wallets',
                    fifoImpact: 'IGNORE',
                    affects_holding: false
                },
                {
                    type: 'CONTRACT_INTERACTION',
                    description: 'Interaction with smart contract',
                    fifoImpact: 'VARIES',
                    affects_holding: true
                },
                {
                    type: 'UNKNOWN',
                    description: 'Unclassified transaction',
                    fifoImpact: 'NEUTRAL',
                    affects_holding: false
                }
            ];

            return res.status(200).json({
                success: true,
                data: transactionTypes
            });

        } catch (error) {
            console.error('Error fetching transaction types:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transaction types',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * GET /api/transaction/:txHash
     * Get details about a specific transaction classification
     */
    static async getTransactionDetail(req: Request, res: Response): Promise<Response> {
        try {
            const { txHash } = req.params;
            const authenticatedUserId = getAuthenticatedUserId(req);

            if (!authenticatedUserId) {
                return res.status(401).json({ success: false, message: 'Unauthenticated' });
            }

            const transaction = await prisma.transactionAudit.findFirst({
                where: {
                    tx_hash: txHash,
                    userId: authenticatedUserId
                },
                include: {
                    user: {
                        select: {
                            wallet_address: true,
                            holdingDate: true
                        }
                    }
                }
            });

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transaction not found in audit log'
                });
            }

            return res.status(200).json({
                success: true,
                data: transaction
            });

        } catch (error) {
            console.error('Error fetching transaction detail:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transaction detail',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * GET /api/fifo-snapshot/:walletAddress
     * Get current FIFO queue snapshot showing active purchases
     */
    static async getFIFOSnapshot(req: Request, res: Response): Promise<Response> {
        try {
            const { walletAddress } = req.params;
            const authenticatedUserId = getAuthenticatedUserId(req);

            if (!authenticatedUserId) {
                return res.status(401).json({ success: false, message: 'Unauthenticated' });
            }

            if (!requestedWalletMatchesAuthenticatedUser(req, walletAddress)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            const user = await prisma.user.findFirst({
                where: {
                    wallet_address: {
                        equals: walletAddress,
                        mode: 'insensitive'
                    }
                },
                include: {
                    HoldDateHistory: {
                        orderBy: { purchase_date: 'asc' }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Convert Prisma Decimal to Number for calculations and response
            const snapshot = user.HoldDateHistory.map(h => {
                const daysHeld = Math.floor((Date.now() - h.purchase_date.getTime()) / (1000 * 60 * 60 * 24));
                const amount = Number(h.purchase_amount); // Prisma Decimal → Number
                return {
                    txHash: h.tx_hash,
                    purchaseDate: h.purchase_date,
                    amount,
                    daysHeld,
                    contributionToAverage: (amount * daysHeld)
                };
            });

            const totalTokens = snapshot.reduce((sum, s) => sum + s.amount, 0);
            const weightedSum = snapshot.reduce((sum, s) => sum + s.contributionToAverage, 0);
            const calculatedAverage = totalTokens > 0 ? weightedSum / totalTokens : 0;

            return res.status(200).json({
                success: true,
                data: {
                    currentHoldingDate: user.holdingDate,
                    calculatedAverage: Math.floor(calculatedAverage),
                    totalActiveTokens: totalTokens,
                    activePurchases: snapshot.length,
                    fifoQueue: snapshot
                }
            });

        } catch (error) {
            console.error('Error fetching FIFO snapshot:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch FIFO snapshot',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
