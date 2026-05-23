import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import getDiscoNFT from '../lib/getDiscoNFT';
import moment from 'moment-timezone';

const prisma = new PrismaClient();

export class LotteryController {
    static async checkDiscoBalance(req: Request, res: Response) {
        const userId = req.params.user_id;
        try {
            const data = await prisma.ownedToken.findUnique({
                where: {
                    userId: Number(userId)
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
            console.error(err);
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
        const userId = req.params.user_id;

        try {


            const [user, ownedToken] = await Promise.all([
                prisma.user.findUnique({ where: { id: Number(userId) } }),
                prisma.ownedToken.findUnique({
                    where: { userId: Number(userId) }
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
            console.error(
                `Error fetching lottery ticket for user ${userId}:`,
                error
            );
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

            const now = new Date();
            const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
            const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

            if (!user) {
                await prisma.lotteryTickets.create({
                    data: {
                        userId: Number(id),
                        ticket: Number(ticketCount),
                        receivedDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()))
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
                            receivedDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()))
                        }
                    });
                } else {
                    await prisma.lotteryTickets.create({
                        data: {
                            userId: Number(id),
                            ticket: Number(ticketCount),
                            receivedDate: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()))
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
            console.error('Error in testTicket:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating lottery tickets'
            });
        }
    }

    static async getLotteryTicketDate(req: Request, res: Response) {
        const id = req.params.user_id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input'
            });
        }
        try {
            const data = await prisma.lotteryTickets.findMany({
                where: {
                    userId: Number(id),
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
        } catch (e) { }
    }

    static async checkAndUpdateLotteryTicket(req: Request, res: Response) {
        const userId = req.params.user_id;
        try {
            const totalTickets = await prisma.user.findUnique({
                where: {
                    id: Number(userId)
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
            console.error(
                `Error fetching lottery ticket for user ${userId}:`,
                e
            );
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching data'
            });
        }

    }


    static async distributeTicketToAllUser(req: Request, res: Response) {
        const discoNFTType = "0xf39a7e6dba30a0c34470cfc166165363e3ae001ddb17fd000a1fb4be4ca14686::sui_nft::DiscoNFT";
        try {
            // Fetch all users
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    wallet_address: true,
                },
            });

            const now = moment().utc();
            const startOfDay = now.clone().startOf('day').toDate();
            const endOfDay = now.clone().endOf('day').toDate();

            await Promise.all(
                users.map(async ({ id, wallet_address }: { id: number, wallet_address: string }) => {
                    try {
                        const Nfts = await getDiscoNFT(wallet_address, discoNFTType);

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
                        console.error(`Error processing user ${id}:`, e);
                    }
                })
            );

            res.status(200).json({ success: true, message: 'Tickets distributed successfully.' });
        } catch (e) {
            console.error('Error fetching users or processing tickets:', e);
            res.status(500).json({ success: false, message: 'Failed to distribute tickets.' });
        }
    }

}
