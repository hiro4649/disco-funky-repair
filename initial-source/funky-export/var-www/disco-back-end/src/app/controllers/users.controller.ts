import { Request, Response } from 'express';
import prisma from '../db/prisma_client';
import moment from 'moment-timezone';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import { jwtDecode } from 'jwt-decode'
// import { number } from 'zod';

export class UserController {
    static async getAllUserData(req: Request, res: Response) {
        try {
            const user = await prisma.user.findMany({
                select: {
                    id: true,
                    wallet_address: true,
                    createdAt: true,
                    updatedAt: true,
                    tickets: true,
                    experience: true,
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
            console.log(err);
        }
    }
    static async getUserPrizeTransaction(req: Request, res: Response) {
        try {
            const wallet_address = req.params.wallet_address;
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
        const user_id = Number(req.params.user_id);
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
                    experience: true
                }
            });
            if (!data)
                res.status(404).json({ success: false, msg: 'Not found data' });
            res.status(200).json({ success: true, data: data, pts: pts });
        } catch (e) {
            return res.status(404).json({ msg: 'Not found' });
        }
    }

    static async setUserDailyPointBonus(req: Request, res: Response) {
        const user_id = Number(req.params.user_id);
        try {
            // Use moment with EST timezone
            const now = moment().tz('Etc/GMT');
            const startOfDay = now.clone().startOf('day').toDate();
            const endOfDay = now.clone().endOf('day').toDate();
            
            // Determine current time window (AM: 00:00-12:00 or PM: 12:01-23:59)
            const hour = now.hour();
            const isAMWindow = hour < 12;
            const startOfWindow = isAMWindow ? 
                now.clone().startOf('day').toDate() : 
                now.clone().startOf('day').add(12, 'hours').toDate();
            const endOfWindow = isAMWindow ? 
                now.clone().startOf('day').add(12, 'hours').toDate() : 
                now.clone().endOf('day').toDate();
    
            console.log(`User ${user_id} requesting daily point bonus. Time window: ${isAMWindow ? 'AM' : 'PM'} (${startOfWindow.toISOString()} to ${endOfWindow.toISOString()})`);
    
            // Find if user already received a DAILY fan-point in current time window
            // Only check for reason: 1 (Daily Bonus), not prize or NFT bonuses
            const receivedDailyInWindow = await prisma.pointHistory.findFirst({
                where: {
                    userId: user_id,
                    reason: 1, // Only check for Daily Bonus
                    receivedDate: {
                        gte: startOfWindow,
                        lte: endOfWindow
                    }
                },
                orderBy: {
                    receivedDate: 'desc'
                }
            });
    
            let dailyLogined = false;
    
            // Check if the user has already received a DAILY fan-point in this time window
            if (receivedDailyInWindow) {
                console.log(`User ${user_id} already received daily point bonus in current time window. Last received: ${receivedDailyInWindow.receivedDate}`);
                // User already received a daily fan-point in this time window
                res.status(202).json({
                    msg: `You can only receive a daily fan-point once in the ${isAMWindow ? 'morning (00:00-12:00)' : 'afternoon (12:01-23:59)'} window.`,
                    dailyLogined: false
                });
                return;
            }
    
            // User can receive a daily fan-point in the current time window
            const data = await prisma.pointHistory.create({
                data: {
                    userId: user_id,
                    point: 1,
                    reason: 1, // Daily Bonus
                    receivedDate: now.toDate()
                }
            });
    
            // Update user experience
            await prisma.user.update({
                where: {
                    id: user_id
                },
                data: {
                    experience: {
                        increment: 1
                    }
                }
            });
    
            if (data) {
                dailyLogined = true;
                console.log(`User ${user_id} successfully received daily point bonus. Point ID: ${data.id}`);
            }
    
            res.status(200).json({ success: true, dailyLogined: dailyLogined });
        } catch (e) {
            console.error(`Error in setUserDailyPointBonus for user ${user_id}:`, e);
            return res.status(404).json({ msg: 'Not found' });
        }
    }
    

    static async getUserDailyPointBonus(req: Request, res: Response) {
        const user_id = Number(req.params.user_id);
        try {
            const now = moment().tz('Etc/GMT');
            const startOfDay = now.clone().startOf('day').toDate();
            const endOfDay = now.clone().endOf('day').toDate();
            const result = await prisma.pointHistory.findMany({
                where: {
                    userId: user_id,
                    reason: 1, // Only check for Daily Bonus points
                    receivedDate: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            });
            let dailyLogined = false;
            if (result.length !== 0) {
                dailyLogined = true;
            }
            res.status(200).json({ success: true, dailyLogined: dailyLogined });
        } catch (e) {
            console.log(e);
            return res.status(404).json({ msg: 'Not found' });
        }
    }

    static async setTokenBalance(req: Request, res: Response) {
        const { token_balance, id } = req.body;
        console.log(req.body);

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
            console.log(e);
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
}
