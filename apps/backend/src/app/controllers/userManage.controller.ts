import { Request, Response } from 'express';
import prisma from '../db/prisma_client';
import { safeLogError } from '../utils/safeLogger';

export class UserManageController {
    // Get user DISCO balance
    static async getBalance(req: Request, res: Response) {
        try {
            const { wallet_address } = req.params;
            
            const user = await prisma.user.findUnique({
                where: {
                    wallet_address: wallet_address.toLowerCase()
                },
                select: {
                    id: true,
                    wallet_address: true,
                    disco_balance: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: {
                    balance: user.disco_balance,
                    wallet_address: user.wallet_address
                }
            });
        } catch (error) {
            safeLogError('user_manage_get_balance', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Deposit DISCO tokens
    static async deposit(req: Request, res: Response) {
        try {
            const { wallet_address, amount, tx_hash } = req.body;

            if (!wallet_address || !amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid wallet address or amount'
                });
            }

            // Find or create user
            let user = await prisma.user.findUnique({
                where: {
                    wallet_address: wallet_address.toLowerCase()
                }
            });

            if (!user) {
                // Create new user with default values
                user = await prisma.user.create({
                    data: {
                        wallet_address: wallet_address.toLowerCase(),
                        level: 1,
                        fan_points: 0,
                        disco_balance: 0,
                        tickets: 0,
                        rarity: 1
                    }
                });
            }

            const balance_before = user.disco_balance;
            const balance_after = balance_before + amount;

            // Update user balance
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    disco_balance: balance_after
                }
            });

            // Create transaction record
            await prisma.discoTransactions.create({
                data: {
                    userId: user.id,
                    type: 'DEPOSIT',
                    amount: amount,
                    balance_before: balance_before,
                    balance_after: balance_after,
                    tx_hash: tx_hash,
                    status: 'COMPLETED'
                }
            });

            res.json({
                success: true,
                data: {
                    balance: balance_after,
                    amount_deposited: amount
                }
            });
        } catch (error) {
            safeLogError('user_manage_deposit', error, { hasTxHash: Boolean(req.body?.tx_hash) });
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Withdraw DISCO tokens
    static async withdraw(req: Request, res: Response) {
        try {
            const { wallet_address, amount, tx_hash } = req.body;

            if (!wallet_address || !amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid wallet address or amount'
                });
            }

            const user = await prisma.user.findUnique({
                where: {
                    wallet_address: wallet_address.toLowerCase()
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.disco_balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient balance'
                });
            }

            const balance_before = user.disco_balance;
            const balance_after = balance_before - amount;

            // Update user balance
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    disco_balance: balance_after
                }
            });

            // Create transaction record
            await prisma.discoTransactions.create({
                data: {
                    userId: user.id,
                    type: 'WITHDRAW',
                    amount: amount,
                    balance_before: balance_before,
                    balance_after: balance_after,
                    tx_hash: tx_hash,
                    status: 'COMPLETED'
                }
            });

            res.json({
                success: true,
                data: {
                    balance: balance_after,
                    amount_withdrawn: amount
                }
            });
        } catch (error) {
            safeLogError('user_manage_withdraw', error, { hasTxHash: Boolean(req.body?.tx_hash) });
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Place bet (deduct from balance)
    static async bet(req: Request, res: Response) {
        try {
            const { wallet_address, currency, amount, game } = req.body;

            if (!wallet_address || !amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid wallet address or amount'
                });
            }

            if (currency !== 'DISCO') {
                return res.status(400).json({
                    success: false,
                    message: 'Only DISCO currency is supported'
                });
            }

            const user = await prisma.user.findUnique({
                where: {
                    wallet_address: wallet_address.toLowerCase()
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.disco_balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient balance'
                });
            }

            const balance_before = user.disco_balance;
            const balance_after = balance_before - amount;

            // Update user balance
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    disco_balance: balance_after
                }
            });

            // Create transaction record
            await prisma.discoTransactions.create({
                data: {
                    userId: user.id,
                    type: 'BET',
                    amount: amount,
                    balance_before: balance_before,
                    balance_after: balance_after,
                    game: game || 'Crash',
                    status: 'COMPLETED'
                }
            });

            res.json({
                success: true,
                data: {
                    balance: balance_after,
                    bet_amount: amount
                }
            });
        } catch (error) {
            safeLogError('user_manage_bet', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Cashout (add winnings to balance)
    static async cashout(req: Request, res: Response) {
        try {
            const { wallet_address, currency, amount, game } = req.body;

            if (!wallet_address || !amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid wallet address or amount'
                });
            }

            if (currency !== 'DISCO') {
                return res.status(400).json({
                    success: false,
                    message: 'Only DISCO currency is supported'
                });
            }

            const user = await prisma.user.findUnique({
                where: {
                    wallet_address: wallet_address.toLowerCase()
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const balance_before = user.disco_balance;
            const balance_after = balance_before + amount;

            // Update user balance
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    disco_balance: balance_after
                }
            });

            // Create transaction record
            await prisma.discoTransactions.create({
                data: {
                    userId: user.id,
                    type: 'CASHOUT',
                    amount: amount,
                    balance_before: balance_before,
                    balance_after: balance_after,
                    game: game || 'Crash',
                    status: 'COMPLETED'
                }
            });

            res.json({
                success: true,
                data: {
                    balance: balance_after,
                    winnings: amount
                }
            });
        } catch (error) {
            safeLogError('user_manage_cashout', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get transaction history
    static async getTransactionHistory(req: Request, res: Response) {
        try {
            const { wallet_address } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const user = await prisma.user.findUnique({
                where: {
                    wallet_address: wallet_address.toLowerCase()
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const skip = (Number(page) - 1) * Number(limit);

            const [transactions, total] = await Promise.all([
                prisma.discoTransactions.findMany({
                    where: {
                        userId: user.id
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip,
                    take: Number(limit)
                }),
                prisma.discoTransactions.count({
                    where: {
                        userId: user.id
                    }
                })
            ]);

            res.json({
                success: true,
                data: {
                    transactions,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit))
                    }
                }
            });
        } catch (error) {
            safeLogError('user_manage_transaction_history', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
