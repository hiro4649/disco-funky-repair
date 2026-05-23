import { Request, Response } from 'express';
import prisma from '../db/prisma_client';
import moment from 'moment';
import { Prisma } from '@prisma/client';
import { safeLogError } from '../utils/safeLogger';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import { jwtDecode } from 'jwt-decode'
// import { number } from 'zod';

type AuthenticatedUser = {
    user_id?: number;
};

const DAILY_FAN_POINT_REASON = 1;
const DAILY_FAN_POINT_AMOUNT = 1;

const getDailyFanPointWindow = (now = moment.utc()) => {
    const isAMWindow = now.hour() < 12;
    const windowName = isAMWindow ? 'AM' : 'PM';
    const startOfDay = now.clone().startOf('day');

    return {
        isAMWindow,
        dailyWindowKey: `${now.format('YYYY-MM-DD')}-${windowName}`,
        startOfWindow: isAMWindow
            ? startOfDay.toDate()
            : startOfDay.clone().add(12, 'hours').toDate(),
        endOfWindow: isAMWindow
            ? startOfDay.clone().add(12, 'hours').toDate()
            : startOfDay.clone().add(1, 'day').toDate()
    };
};

const isPrismaUniqueConstraintError = (error: unknown): boolean =>
    Boolean(error && typeof error === 'object' && (error as { code?: string }).code === 'P2002');

const getAuthenticatedUserId = (req: Request): number | null => {
    const userId = Number((req.user as AuthenticatedUser | undefined)?.user_id);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
};

const routeUserIdMatchesAuthenticatedUser = (
    req: Request,
    paramName: string,
    authenticatedUserId: number
): boolean => {
    const routeUserId = Number(req.params[paramName]);
    return Number.isInteger(routeUserId) && routeUserId === authenticatedUserId;
};

export class UserController {
    static async getAllUsers(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};
            
            if (search) {
                where.wallet_address = { 
                    contains: search as string, 
                    mode: 'insensitive' 
                };
            }

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        wallet_address: true,
                        tickets: true,
                        createdAt: true
                    },
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.user.count({ where })
            ]);

            res.json({
                success: true,
                data: {
                    users,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit))
                    }
                }
            });
        } catch (error) {
            safeLogError('User list fetch', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    static async getAllUserData(req: Request, res: Response) {
        try {
            const user = await prisma.user.findMany({
                select: {
                    id: true,
                    wallet_address: true,
                    createdAt: true,
                    updatedAt: true,
                    tickets: true,
                    fan_points: true,
                    PrizeTransactions: {
                        orderBy: {
                            probability_time: 'desc'
                        }
                    },
                    LotteryTickets: true,
                    ownedToken: true
                },
                orderBy: {
                    id: 'asc'
                }
            });
            // Calculate the ticket count per user after fetching
            user.forEach((userData: typeof user[0]) => {
                userData.tickets = userData.LotteryTickets.reduce(
                    (acc: number, ticket: { ticket: number }) => acc + ticket.ticket,
                    0
                );
            });
            if (!user) {
                res.status(404).json({ msg: 'Not found' });
            }
            res.status(200).json({ data: user });
        } catch (err) {
            safeLogError('All user data fetch', err);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    static async getUserPrizeTransaction(req: Request, res: Response) {
        try {
            const wallet_address = req.params.wallet_address.toLowerCase();
            const userId = await prisma.user.findUnique({
                where: {
                    wallet_address: wallet_address
                }
            });
            if (!userId) {
                return res.status(404).json({ msg: 'Not found' });
            }
            const data = await prisma.prizeTransactions.findMany({
                where: {
                    userId: userId.id
                },
                include: {
                    prize: {
                        select: {
                            token_name: true,
                            symbol: true,
                            quantity: true,
                            ca: true
                        }
                    }
                }
            });
            res.status(200).json({ data: data });
        } catch (err) {
            return res.status(404).json({ msg: 'Not found' });
        }
    }
    static async getUserPointHistory(req: Request, res: Response) {
        const user_id = getAuthenticatedUserId(req);
        if (!user_id) {
            return res.status(401).json({ success: false, msg: 'Unauthenticated' });
        }

        if (!routeUserIdMatchesAuthenticatedUser(req, 'user_id', user_id)) {
            return res.status(403).json({ success: false, msg: 'Forbidden' });
        }

        try {
            const data = await prisma.pointHistory.findMany({
                where: {
                    userId: user_id
                },
                take: 20,
                orderBy: {
                    receivedDate: 'desc'
                }
            });
            const pts = await prisma.user.findUnique({
                where: {
                    id: user_id
                },
                select: {
                    fan_points: true
                }
            });
            if (!data)
                res.status(404).json({ success: false, msg: 'Not found data' });
            res.status(200).json({ success: true, data: data, pts: pts });
        } catch (e) {
            return res.status(404).json({ msg: 'Not found' });
        }
    }

    static async getAverageHoldingDate(req: Request, res: Response) {
        const user_id = getAuthenticatedUserId(req);
        if (!user_id) {
            return res.status(401).json({ success: false, msg: 'Unauthenticated' });
        }

        if (!routeUserIdMatchesAuthenticatedUser(req, 'user_id', user_id)) {
            return res.status(403).json({ success: false, msg: 'Forbidden' });
        }

        try {
            // Get FIFO-adjusted purchase history to calculate weighted average
            // Note: purchase_amount in HoldDateHistory is already FIFO-adjusted
            // (reduced by sales using First-In-First-Out method)
            const historyRecords = await prisma.holdDateHistory.findMany({
                where: {
                    userId: user_id
                },
                select: {
                    purchase_amount: true,
                    purchase_date: true
                }
            });

            if (!historyRecords.length) {
                return res.status(200).json({
                    success: true,
                    data: {
                        averageDays: 0,
                        averageHours: 0,
                        formatted: '0 days 0 hrs'
                    }
                });
            }

            const currentTimeMs = Date.now();
            let totalWeightedMinutes = 0;
            let totalAmount = 0;

            // Calculate weighted average in minutes
            // Convert Prisma Decimal to Number for calculation
            for (const record of historyRecords) {
                const purchaseTimeMs = new Date(record.purchase_date).getTime();
                const minutesHeld = Math.floor((currentTimeMs - purchaseTimeMs) / (1000 * 60));
                const amount = Number(record.purchase_amount); // Prisma Decimal → Number

                totalWeightedMinutes += amount * minutesHeld;
                totalAmount += amount;
            }

            if (totalAmount === 0) {
                return res.status(200).json({
                    success: true,
                    data: {
                        averageDays: 0,
                        averageHours: 0,
                        formatted: '0 days 0 hrs'
                    }
                });
            }

            // Calculate average in minutes, then convert to days and hours
            const averageMinutes = totalWeightedMinutes / totalAmount;
            const avgDays = Math.floor(averageMinutes / (60 * 24));
            const avgHours = Math.floor((averageMinutes % (60 * 24)) / 60);

            // Get user's last updated timestamp
            const user = await prisma.user.findUnique({
                where: { id: user_id },
                select: { updatedAt: true }
            });

            res.status(200).json({
                success: true,
                data: {
                    averageDays: avgDays,
                    averageHours: avgHours,
                    formatted: `${avgDays} days ${avgHours} hrs`,
                    lastUpdated: user?.updatedAt || new Date()
                }
            });
        } catch (error) {
            safeLogError('User average holding date fetch', error, { userId: user_id });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async getHoldDateHistory(req: Request, res: Response) {
        const user_id = getAuthenticatedUserId(req);
        if (!user_id) {
            return res.status(401).json({ success: false, msg: 'Unauthenticated' });
        }

        if (!routeUserIdMatchesAuthenticatedUser(req, 'user_id', user_id)) {
            return res.status(403).json({ success: false, msg: 'Forbidden' });
        }

        try {
            // Fetch FIFO-adjusted purchase records
            // Note: Amounts shown are remaining after applying FIFO reduction for sales
            const historyRecords = await prisma.holdDateHistory.findMany({
                where: {
                    userId: user_id
                },
                orderBy: {
                    purchase_date: 'desc'
                }
            });

            const now = moment.utc();
            const formattedRecords = historyRecords.map((record: any) => {
                // Calculate hold time from purchase date to now
                const purchaseDate = moment.utc(record.purchase_date);
                const diffDays = now.diff(purchaseDate, 'days');
                const diffHours = now.diff(purchaseDate, 'hours') % 24;

                let holdTimeFormatted = '';
                if (diffDays > 0 && diffHours > 0) {
                    holdTimeFormatted = `${diffDays}d ${diffHours}h`;
                } else if (diffDays > 0) {
                    holdTimeFormatted = `${diffDays}d`;
                } else if (diffHours > 0) {
                    holdTimeFormatted = `${diffHours}h`;
                } else {
                    const diffMinutes = now.diff(purchaseDate, 'minutes');
                    holdTimeFormatted = `${diffMinutes}m`;
                }

                return {
                    id: record.id,
                    holdStart: moment.utc(record.purchase_date).format('YYYY-MM-DD HH:mm'),
                    amount: Number(record.purchase_amount).toLocaleString(),
                    holdDuration: holdTimeFormatted,
                    tx_hash: record.tx_hash
                };
            });

            res.status(200).json({
                success: true,
                data: formattedRecords
            });
        } catch (error) {
            safeLogError('User hold date history fetch', error, { userId: user_id });
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async setUserDailyPointBonus(req: Request, res: Response) {
        const user_id = getAuthenticatedUserId(req);
        if (!user_id) {
            return res.status(401).json({ success: false, msg: 'Unauthenticated' });
        }

        if (!routeUserIdMatchesAuthenticatedUser(req, 'user_id', user_id)) {
            return res.status(403).json({ success: false, msg: 'Forbidden' });
        }

        try {
            const now = moment.utc();
            const { isAMWindow, dailyWindowKey, startOfWindow, endOfWindow } = getDailyFanPointWindow(now);

            const result = await prisma.$transaction(async (tx) => {
                const receivedInWindow = await tx.pointHistory.findFirst({
                    where: {
                        userId: user_id,
                        reason: DAILY_FAN_POINT_REASON,
                        receivedDate: {
                            gte: startOfWindow,
                            lt: endOfWindow
                        }
                    },
                    orderBy: {
                        receivedDate: 'desc'
                    }
                });

                if (receivedInWindow) {
                    return 'already-received' as const;
                }

                await tx.pointHistory.create({
                    data: {
                        userId: user_id,
                        point: DAILY_FAN_POINT_AMOUNT,
                        reason: DAILY_FAN_POINT_REASON,
                        receivedDate: now.toDate(),
                        dailyWindowKey
                    }
                });

                await tx.user.update({
                    where: {
                        id: user_id
                    },
                    data: {
                        fan_points: {
                            increment: DAILY_FAN_POINT_AMOUNT
                        }
                    }
                });

                return 'created' as const;
            }, {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable
            });

            if (result === 'already-received') {
                return res.status(202).json({
                    success: true,
                    msg: `You can only receive a fan-point once in the ${isAMWindow ? 'morning (00:00-12:00)' : 'afternoon (12:00-23:59)'} window.`,
                    dailyLogined: false
                });
            }

            return res.status(200).json({ success: true, dailyLogined: false });
        } catch (error) {
            if (isPrismaUniqueConstraintError(error)) {
                return res.status(409).json({
                    success: false,
                    code: 'DAILY_POINT_ALREADY_RECEIVED',
                    msg: 'Daily FanPoint already received for this window',
                    dailyLogined: false
                });
            }

            return res.status(500).json({
                success: false,
                msg: 'Failed to apply daily FanPoint'
            });
        }
    }
    

    static async getUserDailyPointBonus(req: Request, res: Response) {
        const user_id = getAuthenticatedUserId(req);
        if (!user_id) {
            return res.status(401).json({ success: false, msg: 'Unauthenticated' });
        }

        if (!routeUserIdMatchesAuthenticatedUser(req, 'user_id', user_id)) {
            return res.status(403).json({ success: false, msg: 'Forbidden' });
        }

        try {
            const now = moment.utc();
            const { startOfWindow, endOfWindow } = getDailyFanPointWindow(now);
            const result = await prisma.pointHistory.findMany({
                where: {
                    userId: user_id,
                    reason: DAILY_FAN_POINT_REASON,
                    receivedDate: {
                        gte: startOfWindow,
                        lt: endOfWindow
                    }
                }
            });

            let dailyLogined = false;
            if (result.length === 0) {
                dailyLogined = true;
            }
            res.status(200).json({ success: true, dailyLogined: dailyLogined });
        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: 'Failed to read daily FanPoint state'
            });
        }
    }

    static async setTokenBalance(req: Request, res: Response) {
        const { token_balance, id } = req.body;

        try {
            const token = await prisma.airdropTokens.update({
                where: {
                    id: id
                },
                data: {
                    balance: token_balance
                }
            });
            return res.status(200).json({ success: true, data: token });
        } catch (e) {
            safeLogError('Token balance update', e, {
                airdropTokenId: Number.isInteger(Number(id)) ? Number(id) : undefined
            });
            return res.status(404).json({ success: true, msg: 'Not found' });
        }
    }

    static async getTokenBalance(req: Request, res: Response) {
        try {
            const admin = await prisma.admin.findFirst({
                where: {
                    email: process.env.ADMIN_EMAIL
                }
            });
            const balance = await prisma.airdropTokens.findFirst({
                where: {
                    userId: admin?.id
                }
            });
            if (!balance) {
                res.status(404).json({
                    success: false,
                    msg: 'Not found the data.'
                });
            }
            res.status(200).json({ success: true, data: balance });
        } catch (e) {
            return res
                .status(404)
                .json({ msg: 'An unexpected error occurred.' });
        }
    }

    static async getUserInfo(req: Request, res: Response) {
        const authenticatedUserId = getAuthenticatedUserId(req);
        if (!authenticatedUserId) {
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        try {
            const { user_id } = req.body;
            if (user_id !== undefined && Number(user_id) !== authenticatedUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden'
                });
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: authenticatedUserId
                },
                select: {
                    tickets: true,
                    claimTickets: true,
                    fan_points: true,
                    ownedToken: {
                        select: {
                            sixHourTokenBalance: true,
                            tallyTokenBalance: true
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const ownedToken = user.ownedToken && user.ownedToken.length > 0 ? user.ownedToken[0] : null;

            res.status(200).json({
                success: true,
                data: {
                    tickets: user.tickets,
                    claimTickets: user.claimTickets,
                    fan_points: user.fan_points,
                    sixHourTokenBalance: ownedToken ? ownedToken.sixHourTokenBalance : 0,
                    tallyTokenBalance: ownedToken ? ownedToken.tallyTokenBalance : 0
                }
            });
        } catch (error) {
            safeLogError('User info fetch', error, { userId: authenticatedUserId });
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
