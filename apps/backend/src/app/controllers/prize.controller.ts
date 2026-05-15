import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { number, symbol, TypeOf, z } from 'zod';
import prizeSchema from '../validation/prizeValidate';
import getTokenPrice from '../lib/getTokenPrice';
import moment from 'moment';
import { calculateTokenQuantity, fetchTokenBalance } from '../utils/tokenHeplers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { sendTokensToWallet } from '../utils/tokenHeplers';
import getDiscoNFTEVM from '../lib/getDiscoNFTEVM';
import { getTotalNFTCount } from '../lib/trialNftService';

enum Status {
    READY = 'READY',
    SENDING = 'SENDING',
    RECEIVED = 'RECEIVED',
    EXPIRED = 'EXPIRED'
}

const prisma = new PrismaClient();

interface User extends JwtPayload {
    address: string;
}

export class PrizeController {
    static async adminGetPrize(req: Request, res: Response) {
        try {
            const prizes = await prisma.prize.findMany({
                orderBy: [
                    {
                        balance: 'desc'
                    }
                ]
            });
            res.status(200).json({ data: prizes, success: true }); // Set status code to 200 for a successful response
        } catch (err) {
            res.status(500).json({
                error: 'An error occurred while fetching prizes.'
            }); // Send a meaningful error response
        }
    }

    static async getPrize(req: Request, res: Response) {
        try {
            const prizes = await prisma.prize.findMany({
                where: {
                    flag: true
                },
                orderBy: [
                    {
                        ranking: 'asc'
                    }
                ]
            });
            const returnData = await Promise.all(
                prizes.map(async (prize: typeof prizes[0]) => {
                    const tokenDetail = await prisma.tokenDetail.findUnique({
                        where: {
                            ca: prize.ca,
                        }
                    });
                    return {
                        ...prize,
                        tokenDetail: tokenDetail,
                    }
                })
            )

            res.status(200).json({ data: returnData, success: true }); // Set status code to 200 for a successful response
        } catch (err) {
            console.error('Error fetching prizes:', err); // Log the error for debugging
            res.status(500).json({
                error: 'An error occurred while fetching prizes.'
            }); // Send a meaningful error response
        }
    }

    static async editPrize(req: Request, res: Response) {
        try {
            const prizeId = Number(req.params.prize_id); // Ensure id is a number
            if (isNaN(prizeId)) {
                return res.status(400).json({ error: 'Invalid prize ID' });
            }
            const updatePrizeData = req.body;
            updatePrizeData.quantity = Number(req.body.quantity);
            updatePrizeData.real_probability = Number(req.body.real_probability);
            updatePrizeData.fake_probability = Number(req.body.fake_probability);
            updatePrizeData.earned_pts = Number(req.body.earned_pts);
            updatePrizeData.flag = req.body.flag === 'false' ? Boolean(false) : Boolean(true);
            updatePrizeData.dance = req.body.dance === 'false' ? Boolean(false) : Boolean(true);
            if (!updatePrizeData || Object.keys(updatePrizeData).length === 0) {
                return res.status(400).json({ error: 'No data provided for update' });
            }
            // Update prize in the database
            const updatedPrize = await prisma.prize.update({
                where: {
                    id: prizeId
                },
                data: updatePrizeData, // Use the actual data from the request body
            });
            res.status(200).json({ success: true, data: updatedPrize });
        } catch (err) {
            console.error(err); // Log the error for debugging
            res.status(404).json({ error: 'Prize not found or invalid data' });
        }
    }
    static async createNewPrize(req: Request, res: Response) {
        try {
            const prizeId = req.params.prize_id ? Number(req.params.prize_id) : null;

            if (prizeId && isNaN(prizeId)) {
                return res.status(400).json({ error: 'Invalid prize ID' });
            }

            let updatePrizeData: any;

            if (prizeId) {
                // Create new prize based on existing prize
                const prizeData = await prisma.prize.findUnique({
                    where: {
                        id: prizeId
                    }
                });

                updatePrizeData = {
                    ...prizeData
                };
                updatePrizeData.quantity = Number(req.body.quantity);
                updatePrizeData.real_probability = Number(req.body.real_probability);
                updatePrizeData.fake_probability = Number(req.body.fake_probability);
                updatePrizeData.earned_pts = Number(req.body.earned_pts);
                updatePrizeData.flag = req.body.flag === 'false' ? Boolean(false) : Boolean(true);
                updatePrizeData.dance = req.body.dance === 'false' ? Boolean(false) : Boolean(true);
                updatePrizeData.id = undefined;
            } else {
                // Create completely new prize
                updatePrizeData = {
                    ranking: Number(req.body.ranking) || 0,
                    token_name: req.body.tokenName || '',
                    symbol: req.body.symbol || '',
                    quantity: Number(req.body.price) || 0,
                    price: Number(req.body.price) || 0,
                    real_probability: Number(req.body.real_probability) || 0,
                    probability: Number(req.body.probability) || 0,
                    fake_probability: Number(req.body.fake_probability) || 0,
                    earned_pts: Number(req.body.earned_pts) || 0,
                    dance: req.body.dance === 'false' ? Boolean(false) : Boolean(true),
                    ca: req.body.ca || '',
                    telegram: req.body.telegram || '',
                    twitter: req.body.twitter || '',
                    listed_dex: req.body.listed_dex || '',
                    listed_DEX: req.body.listed_dex || '',
                    default_image: req.body.defaultImage || 'chain-logo.svg',
                    saved_probability: Number(req.body.real_probability) || 0,
                    flag: false,
                    balance: 0,
                    decimals: 18
                };

                // Handle file upload if present
                if (req.file) {
                    updatePrizeData.icon = req.file.filename;
                } else {
                    updatePrizeData.icon = updatePrizeData.default_image;
                }
            }

            if (!updatePrizeData || Object.keys(updatePrizeData).length === 0) {
                return res.status(400).json({ error: 'No data provided for update' });
            }

            // Create prize in the database
            const newPrize = await prisma.prize.create({
                data: updatePrizeData,
            });
            res.status(201).json({ success: true, data: newPrize });
        } catch (err) {
            console.error(err); // Log the error for debugging
            res.status(500).json({ error: 'Error creating prize' });
        }
    }
    static async getEditPrize(req: Request, res: Response) {
        const prize_id = req.params.prize_id;
        try {
            const data = await prisma.prize.findFirst({
                where: {
                    id: Number(prize_id)
                }
            });
            if (!data) {
                res.status(404).json({ error: 'Not found' });
            }
            res.status(200).json({ success: true, data: data });
        } catch (err) { }
    }

    static async deletePrize(req: Request, res: Response) {
        try {
            const prizeId = Number(req.params.prize_id);
            const deletePrize = await prisma.prize.delete({
                where: {
                    id: prizeId
                }
            });
            res.status(200).json({
                success: true,
                message: 'Prize deleted successfully'
            });
        } catch (err) {
            console.error('Error deleting prize:', err);
            res.status(500).json({
                message: 'An error occurred while deleting the prize'
            });
        }
    }

    static async drawPrize(req: Request, res: Response) {
        const userId = Number(req.params.user_id);
        try {
            // check user is exist or not
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
            });
            if (!user)
                return res
                    .status(404)
                    .json({ success: true, msg: 'User not found' });
            if (Number(user.tickets) > 0) {

                // Fetch all product tokens with their probabilities
                const prizes = await prisma.prize.findMany({
                    where: { flag: true }
                });

                if (prizes.length === 0) {
                    res.status(404).json({ msg: 'No Prizes found' }); // Send a meaningful error response
                }

                const bestPrizeCandidates = prizes.reduce((best: typeof prizes, current: typeof prizes[0]) => {
                    if (
                        best.length === 0 ||
                        current.probability > best[0].probability ||
                        (current.probability === best[0].probability && current.real_probability < best[0].real_probability)
                    ) {
                        return [current];
                    } else if (
                        current.probability === best[0].probability &&
                        current.real_probability === best[0].real_probability
                    ) {
                        best.push(current);
                    }
                    return best;
                }, []);

                const winningPrize = bestPrizeCandidates[Math.floor(Math.random() * bestPrizeCandidates.length)];
                if (winningPrize) {
                    const prizeTransaction =
                        await prisma.prizeTransactions.create({
                            data: {
                                prizeId: winningPrize.id,
                                userId: userId,
                                probability_time: moment.utc().toDate(),
                                end_time: moment.utc().add(24, 'hours').toDate()
                            }
                        });

                    // await prisma.pointHistory.create({
                    //     data: {
                    //         userId: userId,
                    //         point: winningPrize.earned_pts,
                    //         reason: 2,
                    //         receivedDate: new Date(new Date().toISOString().split('.')[0]+"Z")
                    //     }
                    // });
                    // await prisma.user.update({
                    //     where: {
                    //         id: userId
                    //     },
                    //     data: {
                    // fan_points: {
                    //     increment: winningPrize.earned_pts
                    // },
                    //         tickets: {
                    //             decrement: 1,
                    //         }
                    //     }
                    // });
                    
                    // Deduct 1 ticket from user
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            tickets: {
                                decrement: 1
                            }
                        }
                    });

                    res.status(200).json({ success: true });
                } else {
                    res.status(200).json({
                        success: false,
                        msg: 'Failed to determine a winner'
                    });
                }
            } else {
                res.status(200).json({ ticket: false, msg: 'There are no Lottery Ticket' });
            }
        } catch (err) {
            console.error('Error drawing a lottery winner:', err); // Log the error for debugging
            return res.status(500).json({ error: 'Internal Server Error' }); // Send a meaningful error response
        }
    }

    static async withDrawPrizeToken(req: Request, res: Response) {
        const { userId, prizeId } = req.params;

        try {
            // Ensure userId and prizeId are valid numbers
            const userIdNum = Number(userId);
            const prizeIdNum = Number(prizeId);

            if (isNaN(userIdNum) || isNaN(prizeIdNum)) {
                return res.status(400).json({ msg: 'Invalid userId or prizeId' });
            }

            // Find user by userId
            const user = await prisma.user.findUnique({
                where: { id: userIdNum },
            });
            if (!user) return res.status(404).json({ msg: 'User not found' });

            // Find prize transaction by prizeId
            const prize = await prisma.prizeTransactions.findUnique({
                where: { id: prizeIdNum },
            });
            if (!prize) return res.status(404).json({ msg: 'Prize transaction not found' });

            return res.status(200).json({ msg: 'Prize token withdrawn successfully' });

        } catch (error) {
            console.error('Error withdrawing prize token:', error);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    }

    static async getPrizeTransactions(req: Request, res: Response) {
        try {
            const userId = Number(req.params.user_id);
            const prizeTransactions = await prisma.prizeTransactions.findMany({
                where: {
                    userId
                },
                orderBy: [
                    {
                        probability_time: 'desc'
                    }
                ],
                include: {
                    prize: {
                        select: {
                            token_name: true,
                            symbol: true,
                            quantity: true,
                            ca: true,
                            telegram: true,
                            earned_pts: true,
                            twitter: true,
                            icon: true,
                            default_image: true,
                            price: true,
                        }
                    }
                }
            });

            if (!prizeTransactions) {
                res.status(404).json({
                    msg: 'No Prize Transactions found for this user'
                }); // Send a meaningful error response
            }

            if (prizeTransactions != null || undefined) {
                res.status(200).json({
                    data: prizeTransactions.map((transaction: typeof prizeTransactions[0]) => {
                        if (moment.utc().diff(moment.utc(transaction.end_time ?? "")) > 24 * 60 * 60 * 1000 && transaction.status === Status.READY) {
                            return {
                                ...transaction,
                                status: Status.EXPIRED,
                            }
                        } else {
                            return transaction;
                        }
                    }),
                    success: true
                }); // Set status code to 200 for a successful response
            }
        } catch (err) {
            console.error('Error fetching prize transactions:', err); // Log the error for debugging
            res.status(500).json({
                error: 'An error occurred while fetching prize transactions.'
            }); // Send a meaningful error response
        }
    }

    static async sendToWallet(req: Request, res: Response) {
        try {
            const token = req.cookies.userAuth;
            const prizeId = req.params.prize_id;
            const today = moment.utc().format("YYYY-MM-DD HH:mm");

            // Validate user token
            if (!token) {
                return res.status(401).json({ msg: "Unauthorized: Missing token" });
            }

            // Decode the JWT token to extract user details
            const decoded: any = jwtDecode(token);
            if (!decoded?.address) {
                return res.status(400).json({ msg: "Invalid token: Address not found" });
            }

            // Fetch the user by wallet address
            const user = await prisma.user.findUnique({
                where: { wallet_address: decoded.address.toLowerCase() },
            });
            if (!user) {
                return res.status(403).json({ msg: "User not found" });
            }

            // Fetch the prize transaction details
            const prizeTransaction = await prisma.prizeTransactions.findFirst({
                where: { id: Number(prizeId) },
                include: {
                    prize: {
                        select: { quantity: true, ca: true, price: true, decimals: true },
                    },
                },
            });

            if (!prizeTransaction) {
                return res.status(404).json({ msg: "Prize transaction not found" });
            }

            // Validate transaction timing
            const referenceTime = moment.utc(prizeTransaction.end_time).format("YYYY-MM-DD HH:mm");
            const todayMoment = moment.utc(today, "YYYY-MM-DD HH:mm");
            const referenceMoment = moment.utc(referenceTime, "YYYY-MM-DD HH:mm");

            if (todayMoment.isAfter(referenceMoment)) {
                return res.status(400).json({ msg: "Prize transaction has expired" });
            }

            // Prepare transaction details

            const amount = Number(
                (prizeTransaction.prize.quantity / prizeTransaction.prize.price).toFixed(3)
            );
            const tokenAmountInSmallestUnit = BigInt(Math.round(amount * 10 ** prizeTransaction.prize.decimals));
            const coinType = prizeTransaction.prize.ca;

            if (!tokenAmountInSmallestUnit || !coinType) {
                return res.status(400).json({ msg: "Invalid prize data: Missing quantity or coin type" });
            }

            // Update the prize transaction status to "SENDING"
            await prisma.prizeTransactions.update({
                where: { id: Number(prizeId) },
                data: { status: Status.SENDING },
            });

            // Send tokens to the user's wallet using EVM with balance check and detailed errors
            try {
                const txHash = await sendTokensToWallet(user.wallet_address, tokenAmountInSmallestUnit, coinType);
                if (!txHash || typeof txHash !== 'string') {
                    return res.status(500).json({ msg: "Failed to send tokens to wallet" });
                }
                // Update the prize transaction status to "RECEIVED"
                await prisma.prizeTransactions.update({
                    where: { id: Number(prizeId) },
                    data: { status: Status.RECEIVED, tx_hash: txHash },
                });

                // Return success response
                return res.status(200).json({ success: true, txHash });
            } catch (transferErr: any) {
                // Rollback SENDING status on failure
                await prisma.prizeTransactions.update({
                    where: { id: Number(prizeId) },
                    data: { status: Status.READY },
                });
                const msg = transferErr?.message || 'Failed to send tokens to wallet';
                return res.status(400).json({ msg });
            }
        } catch (err) {
            console.error("Error in sendToWallet:", err);

            // Handle unexpected errors gracefully
            return res.status(500).json({ msg: "Internal server error", error: err });
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
                                        receivedDate: now.toDate(),
                                    },
                                });
                            }
                        } else {
                            // Add a new ticket for today
                            await prisma.lotteryTickets.create({
                                data: {
                                    userId: id,
                                    ticket: Nfts,
                                    receivedDate: now.toDate(),
                                },
                            });
                        }
                    } catch (error) {
                        console.error(`Error distributing ticket to user ${id}:`, error);
                    }
                })
            );

            res.status(200).json({ success: true, message: 'Tickets distributed successfully' });
        } catch (error) {
            console.error('Error distributing tickets:', error);
            res.status(500).json({ error: 'An error occurred while distributing tickets' });
        }
    }

}
