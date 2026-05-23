import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import getDiscoNFTEVM from '../lib/getDiscoNFTEVM';
import moment from 'moment';
import { isSixHourUpdateRunning } from '../lib/trackingTokenBalanceEthereum';
import { safeLogError, safeLogWarn } from '../utils/safeLogger';

const prisma = new PrismaClient();

type AuthenticatedLotteryUser = {
    user_id?: number;
};

const getAuthenticatedLotteryUserId = (req: Request): number | null => {
    const userId = Number((req.user as AuthenticatedLotteryUser | undefined)?.user_id);
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

export class LotteryController {
    static async checkDiscoBalance(req: Request, res: Response) {
        const userId = getAuthenticatedLotteryUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        if (!routeUserIdMatchesAuthenticatedUser(req, 'user_id', userId)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        try {
            const data = await prisma.ownedToken.findUnique({
                where: {
                    userId
                }
            });

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'No data found'
                });
            }
            return res.status(200).json({
                success: true,
                waitToken: data.sixHourTokenBalance
            });
        } catch (err) {
            safeLogError('lottery_check_disco_balance', err, { userId });
            return res.status(500).json({
                success: false,
                message: 'Error checking token balance'
            });
        }
    }

    static async checkLotteryTicket(
        req: Request,
        res: Response
    ): Promise<Response> {
        const userId = getAuthenticatedLotteryUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        if (!routeUserIdMatchesAuthenticatedUser(req, 'user_id', userId)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        try {


            const [user, ownedToken] = await Promise.all([
                prisma.user.findUnique({ where: { id: userId } }),
                prisma.ownedToken.findUnique({
                    where: { userId }
                })
            ]);

            if (!user || !ownedToken) {
                return res.status(404).json({
                    success: false,
                    message: 'User or token data not found'
                });
            }

            // const totalTickets = await prisma.lotteryTickets.aggregate({
            //     where: {
            //         userId: Number(userId)
            //     },
            //     _sum: {
            //         ticket: true
            //     }
            // });
            // if (!totalTickets)
            //     return res
            //         .status(200)
            //         .json({ success: false, msg: 'Not found and operator' });

            // await prisma.user.update({
            //     where: {
            //         id: Number(userId)
            //     },
            //     data: {
            //         tickets: Number(totalTickets._sum.ticket)
            //     }
            // });

            return res.status(200).json({
                success: true,
                ticket: user.tickets,
                totalBalance: ownedToken.tallyTokenBalance,
                waitToken: ownedToken.sixHourTokenBalance,
                weeklyBalance: ownedToken.weeklyTokenBalance
            });
        } catch (error) {
            safeLogError('lottery_check_ticket', error, { userId });
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching data'
            });
        }
    }

    static async addLotteryTicket(req: Request, res: Response) {
        const { id, ticketCount } = req.body;

        if (!id || !ticketCount) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input'
            });
        }

        try {
            const user = await prisma.lotteryTickets.findFirst({
                where: { userId: Number(id) }
            });

            const now = moment.utc();
            const startOfDay = now.clone().startOf('day').toDate();
            const endOfDay = now.clone().endOf('day').toDate();

            if (!user) {
                await prisma.lotteryTickets.create({
                    data: {
                        userId: Number(id),
                        ticket: Number(ticketCount),
                        receivedDate: now.toDate()
                    }
                });
            } else {
                const todayTicket = await prisma.lotteryTickets.findFirst({
                    where: {
                        userId: user.userId,
                        receivedDate: {
                            gte: startOfDay,
                            lte: endOfDay
                        }
                    }
                });

                if (todayTicket) {
                    await prisma.lotteryTickets.update({
                        where: { id: todayTicket.id },
                        data: {
                            ticket: { increment: Number(ticketCount) },
                            receivedDate: now.toDate()
                        }
                    });
                } else {
                    await prisma.lotteryTickets.create({
                        data: {
                            userId: Number(id),
                            ticket: Number(ticketCount),
                            receivedDate: now.toDate()
                        }
                    });
                }
            }
            await prisma.user.update({
                where: {id: id},
                data : {
                    tickets: {
                        increment: ticketCount
                    }
                }
            })
            return res.status(200).json({ success: true, message: 'Saved!' });
        } catch (error) {
            safeLogError('lottery_add_ticket', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating lottery tickets'
            });
        }
    }

    static async getLotteryTicketDate(req: Request, res: Response) {
        const id = getAuthenticatedLotteryUserId(req);
        if (!id) {
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        if (!routeUserIdMatchesAuthenticatedUser(req, 'user_id', id)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        try {
            const data = await prisma.lotteryTickets.findMany({
                where: {
                    userId: id,
                },
                orderBy: {
                    receivedDate: 'desc'
                }
            });
            if (!data)
                return res
                    .status(404)
                    .json({ success: false, msg: 'Not found' });

            return res.status(200).json({ success: true, data: data });
        } catch (e) {
            safeLogError('lottery_get_ticket_date', e, { userId: id });
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching data'
            });
        }
    }

    static async checkAndUpdateLotteryTicket(req: Request, res: Response) {
        const userId = getAuthenticatedLotteryUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        if (!routeUserIdMatchesAuthenticatedUser(req, 'user_id', userId)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        try {
            const totalTickets = await prisma.user.findUnique({
                where: {
                    id: userId
                },
            });
            if (!totalTickets)
                return res
                    .status(404)
                    .json({ success: false, msg: 'Not found and operator' });

            // const ticket = await prisma.user.update({
            //     where: {
            //         id: Number(userId)
            //     },
            //     data: {
            //         tickets: Number(totalTickets._sum.ticket)
            //     }
            // });
            return res.status(200).json({ ticket: totalTickets.tickets })
        } catch (e) {
            safeLogError('lottery_check_update_ticket', e, { userId });
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching data'
            });
        }

    }


    static async distributeTicketToAllUser(req: Request, res: Response) {
        try {
            // Fetch all users
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    wallet_address: true,
                },
            });

            const now = moment.utc();
            const startOfDay = now.clone().startOf('day').toDate();
            const endOfDay = now.clone().endOf('day').toDate();

            await Promise.all(
                users.map(async ({ id, wallet_address }: { id: number, wallet_address: string }) => {
                    try {
                        const Nfts = await getDiscoNFTEVM(wallet_address);

                        // Check if user already has a ticket
                        const todayTicket = await prisma.lotteryTickets.findFirst({
                            where: {
                                userId: id,
                                receivedDate: {
                                    gte: startOfDay,
                                    lte: endOfDay,
                                },
                            },
                        });

                        if (todayTicket) {
                            // Update today's ticket
                            if (Nfts > todayTicket.ticket) {
                                await prisma.lotteryTickets.update({
                                    where: { id: todayTicket.id },
                                    data: {
                                        ticket: todayTicket.ticket + Nfts, // Increment ticket count
                                        receivedDate: now.toISOString(),
                                    },
                                });
                            }
                        } else {
                            // Add a new ticket for today
                            await prisma.lotteryTickets.create({
                                data: {
                                    userId: id,
                                    ticket: Nfts,
                                    receivedDate: now.toISOString(),
                                },
                            });
                        }

                        // Ensure the user has only the last 14 days of tickets
                        const userTickets = await prisma.lotteryTickets.findMany({
                            where: { userId: id },
                            orderBy: { receivedDate: 'asc' },
                        });
                        if (userTickets.length > 14) {
                            const oldestTicket = userTickets[0];
                            await prisma.lotteryTickets.delete({
                                where: { id: oldestTicket.id },
                            });
                        }
                    } catch (e) {
                        safeLogWarn('lottery_distribute_ticket_user', e, { userId: id });
                    }
                })
            );

            res.status(200).json({ success: true, message: 'Tickets distributed successfully.' });
        } catch (e) {
            safeLogError('lottery_distribute_tickets', e);
            res.status(500).json({ success: false, message: 'Failed to distribute tickets.' });
        }
    }

    static async checkUpdateStatus(req: Request, res: Response) {
        try {
            const isUpdating = isSixHourUpdateRunning();
            return res.status(200).json({
                success: true,
                isUpdating: isUpdating
            });
        } catch (error) {
            safeLogError('lottery_check_update_status', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking update status'
            });
        }
    }

    static async lotteryClaimTicketToUser(req: Request, res: Response) {
        try {
            const authenticatedUserId = getAuthenticatedLotteryUserId(req);
            if (!authenticatedUserId) {
                return res.status(401).json({ success: false, message: 'Unauthenticated' });
            }

            const rawUserId = req.body.userId;
            if (rawUserId !== undefined && Number(rawUserId) !== authenticatedUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden'
                });
            }

            const userId = authenticatedUserId;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    claimTickets: true,
                    tickets: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    claimTickets: 0,
                    tickets: { increment: user.claimTickets }
                }
            });

            return res.status(200).json({
                success: true,
                data: {
                    userId,
                    remainingClaimTickets: user.claimTickets,
                    totalTickets: user.tickets + user.claimTickets
                }
            });
        } catch (error) {
            safeLogError('lottery_claim_tickets', error, {
                userId: getAuthenticatedLotteryUserId(req)
            });
            return res.status(500).json({
                success: false,
                message: 'Error claiming tickets'
            });
        }
    }
}
