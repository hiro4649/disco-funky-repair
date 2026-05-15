import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomInt } from 'crypto';
import moment from 'moment';
import getDiscoNFTEVM from '../lib/getDiscoNFTEVM';
import { getTrialNFTBonusPoints } from '../lib/trialNftService';

const prisma = new PrismaClient();

class DrawIllustrationError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

export class IllustrationController {
    // Create a new illustration
    static async create(req: Request, res: Response) {
        try {
            const { image_url, earned_pts, rarity, probability } = req.body;
            const illustration = await prisma.illustration.create({
                data: {
                    image_url,
                    earned_pts: earned_pts || 0,
                    rarity: rarity || 0,
                    probability: probability || 0,
                }
            });
            return res.status(201).json({
                success: true,
                data: illustration
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error creating illustration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get all illustrations
    static async getAll(req: Request, res: Response) {
        try {
            const illustrations = await prisma.illustration.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return res.status(200).json({
                success: true,
                data: illustrations
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching illustrations',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get a single illustration by ID
    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const illustration = await prisma.illustration.findUnique({
                where: { id: parseInt(id) }
            });

            if (!illustration) {
                return res.status(404).json({
                    success: false,
                    message: 'Illustration not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: illustration
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching illustration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Update an illustration
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { image_url, earned_pts, rarity, probability } = req.body;

            const illustration = await prisma.illustration.update({
                where: { id: parseInt(id) },
                data: {
                    image_url,
                    earned_pts,
                    rarity,
                    probability,
                }
            });

            return res.status(200).json({
                success: true,
                data: illustration
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error updating illustration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Delete an illustration
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await prisma.illustration.delete({
                where: { id: parseInt(id) }
            });

            return res.status(200).json({
                success: true,
                message: 'Illustration deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error deleting illustration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get user's illustration history
    static async getUserIllustrations(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const userIllustrations = await prisma.illustrationHistory.findMany({
                where: { userId: parseInt(userId) },
                include: {
                    illustration: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.status(200).json({
                success: true,
                data: userIllustrations
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching user illustrations',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Add illustration to user
    static async addIllustrationToUser(req: Request, res: Response) {
        try {
            const { userId, illustrationId } = req.body;

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if illustration exists
            const illustration = await prisma.illustration.findUnique({
                where: { id: parseInt(illustrationId) }
            });

            if (!illustration) {
                return res.status(404).json({
                    success: false,
                    message: 'Illustration not found'
                });
            }

            // Check if user already has this illustration
            const existingRecord = await prisma.illustrationHistory.findFirst({
                where: {
                    userId: parseInt(userId),
                    illustrationId: parseInt(illustrationId)
                }
            });

            if (existingRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'User already has this illustration'
                });
            }

            // Add illustration to user
            const illustrationHistory = await prisma.illustrationHistory.create({
                data: {
                    userId: parseInt(userId),
                    illustrationId: parseInt(illustrationId)
                },
                include: {
                    illustration: true
                }
            });

            // Add earned points to user if illustration has points
            if (illustration.earned_pts > 0) {
                // Check if user has NFT balance before giving NFT bonus
                try {
                    const nftBalance = await getDiscoNFTEVM(user.wallet_address);
                    
                    if (nftBalance > 0) {
                        await prisma.pointHistory.create({
                            data: {
                                userId: parseInt(userId),
                                point: illustration.earned_pts,
                                reason: 3, // NFT Bonus as per schema
                                receivedDate: moment.utc().toDate()
                            }
                        });

                        // Update user fan_points
                        await prisma.user.update({
                            where: { id: parseInt(userId) },
                            data: {
                                fan_points: {
                                    increment: illustration.earned_pts
                                }
                            }
                        });
                    } else {
                        console.log(`User ${user.wallet_address} has no NFT balance, skipping NFT bonus`);
                    }
                } catch (error) {
                    console.error('Error checking NFT balance:', error);
                    // Still give the bonus even if NFT check fails (fallback behavior)
                }
            }

            return res.status(201).json({
                success: true,
                data: illustrationHistory,
                message: 'Illustration added to user successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error adding illustration to user',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get illustrations by rarity level
    static async getByRarity(req: Request, res: Response) {
        try {
            const { rarity } = req.params;
            const illustrations = await prisma.illustration.findMany({
                where: {
                    rarity: parseInt(rarity)
                },
                orderBy: {
                    probability: 'desc'
                }
            });

            return res.status(200).json({
                success: true,
                data: illustrations
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching illustrations by rarity',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Draw a random illustration based on fan points (earned_pts)
    // Lower fan points have higher probability of being selected
    static async drawIllustration(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const userIdNum = parseInt(userId);

            const drawResult = await prisma.$transaction(async (tx) => {
                const ticketUpdate = await tx.user.updateMany({
                    where: {
                        id: userIdNum,
                        tickets: { gt: 0 }
                    },
                    data: {
                        tickets: { decrement: 1 }
                    }
                });

                if (ticketUpdate.count !== 1) {
                    const existingUser = await tx.user.findUnique({
                        where: { id: userIdNum },
                        select: { id: true }
                    });

                    if (!existingUser) {
                        throw new DrawIllustrationError(404, 'User not found');
                    }

                    throw new DrawIllustrationError(400, 'User has no tickets');
                }

                const user = await tx.user.findUnique({
                    where: { id: userIdNum },
                    select: {
                        id: true,
                        wallet_address: true
                    }
                });

                if (!user) {
                    throw new DrawIllustrationError(404, 'User not found');
                }

            // Get all illustrations grouped by earned_pts (1-9)
            // Weight distribution: lower points = higher weight
            // 1 point (30 illustrations) → weight 9 (highest chance)
            // 2 points (30 illustrations) → weight 8
            // 3 points (30 illustrations) → weight 7
            // 4 points (20 illustrations) → weight 6
            // 5 points (20 illustrations) → weight 5
            // 6 points (20 illustrations) → weight 4
            // 7 points (10 illustrations) → weight 3
            // 8 points (10 illustrations) → weight 2
            // 9 points (10 illustrations) → weight 1 (lowest chance)
            const fanPointWeights: { [key: number]: number } = {
                1: 9,  // Highest weight (30 illustrations)
                2: 8,  // High weight (30 illustrations)
                3: 7,  // High weight (30 illustrations)
                4: 6,  // Medium weight (20 illustrations)
                5: 5,  // Medium weight (20 illustrations)
                6: 4,  // Medium weight (20 illustrations)
                7: 3,  // Lower weight (10 illustrations)
                8: 2,  // Lower weight (10 illustrations)
                9: 1   // Lowest weight (10 illustrations)
            };

            // Get all illustrations with probability > 0, grouped by earned_pts
            const allIllustrations = await tx.illustration.findMany({
                where: {
                    probability: {
                        gt: 0
                    },
                    earned_pts: {
                        gte: 1,
                        lte: 9
                    }
                }
            });

            if (allIllustrations.length === 0) {
                throw new DrawIllustrationError(404, 'No illustrations available for drawing');
            }

            // Group illustrations by earned_pts
            const illustrationsByFanPoints: { [key: number]: typeof allIllustrations } = {};
            for (const illustration of allIllustrations) {
                const points = illustration.earned_pts;
                if (!illustrationsByFanPoints[points]) {
                    illustrationsByFanPoints[points] = [];
                }
                illustrationsByFanPoints[points].push(illustration);
            }

            // Calculate weighted probabilities for each fan point level
            const fanPointLevels: Array<{ points: number; weight: number; illustrations: typeof allIllustrations }> = [];
            let totalWeight = 0;

            for (let points = 1; points <= 9; points++) {
                if (illustrationsByFanPoints[points] && illustrationsByFanPoints[points].length > 0) {
                    const weight = fanPointWeights[points] || 0;
                    fanPointLevels.push({
                        points,
                        weight,
                        illustrations: illustrationsByFanPoints[points]
                    });
                    totalWeight += weight;
                }
            }

            if (fanPointLevels.length === 0) {
                throw new DrawIllustrationError(404, 'No illustrations available for drawing');
            }

            // Select a fan point level based on weighted probability
            const randomValue = randomInt(totalWeight) + 1;
            let cumulativeWeight = 0;
            let selectedFanPointLevel = fanPointLevels[0];

            for (const level of fanPointLevels) {
                cumulativeWeight += level.weight;
                if (randomValue <= cumulativeWeight) {
                    selectedFanPointLevel = level;
                    break;
                }
            }

            // From the selected fan point level, select the illustration with the highest probability
            const illustrationsAtLevel = selectedFanPointLevel.illustrations;
            const selectedIllustration = illustrationsAtLevel.reduce((prev, current) => {
                return (prev.probability > current.probability) ? prev : current;
            });

            // Process the draw after ticket consumption: update fan_points and add history
            await this.processDraw(userIdNum, selectedIllustration, user.wallet_address, tx);

            const prizeTransaction = await tx.prizeTransactions.findFirst({
                where: {
                    userId: userIdNum
                },
                orderBy: [
                    {
                        probability_time: 'desc'
                    }
                ],
                include: {
                    prize: {
                        select: {
                            ca: true,
                            dance: true
                        }
                    }
                }
            });

            return { selectedIllustration, prizeTransaction };
            });

            return res.status(200).json({
                success: true,
                data: {
                    image_url: drawResult.selectedIllustration.image_url,
                    earned_pts: drawResult.selectedIllustration.earned_pts,
                    jumpStatus: false,
                    dance: drawResult.prizeTransaction?.prize.dance || false,
                },
                message: 'Illustration drawn successfully'
            });
        } catch (error) {
            if (error instanceof DrawIllustrationError) {
                return res.status(error.statusCode).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error drawing illustration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }

    }
    
    static async processDraw(userId: number, illustration: any, userWalletAddress: string, db: any = prisma) {
        if (!userWalletAddress) {
            throw new Error('User wallet address is required');
        }

        // Add earned points to user if illustration has points
        if (illustration.earned_pts > 0) {
            // Get user's wallet address to check NFT balance
                // Check if user has NFT balance before giving NFT bonus
                try {
                    await db.pointHistory.create({
                        data: {
                            userId: userId,
                            point: illustration.earned_pts,
                            reason: 2, // Prize Bonus as per schema
                            receivedDate: moment.utc().toDate()
                        }
                    });

                    await db.user.update({
                        where: { id: userId },
                        data: {
                            fan_points: {
                                increment: illustration.earned_pts
                            }
                        }
                    });

                    // Get real NFT count from blockchain
                    const realNFTCount = await getDiscoNFTEVM(userWalletAddress);

                    // Get Trial NFT bonus points (progressive: Day 1=1pt, Day 2=2pts, etc.)
                    const trialBonus = await getTrialNFTBonusPoints(userId);

                    // Calculate total bonus: real NFTs (1pt each) + trial NFT (day-based)
                    const totalBonus = realNFTCount + trialBonus.points;

                    if (totalBonus > 0) {
                        // Record real NFT bonus if any
                        if (realNFTCount > 0) {
                            await db.pointHistory.create({
                                data: {
                                    userId: userId,
                                    point: realNFTCount,
                                    reason: 3, // NFT Bonus
                                    receivedDate: moment.utc().toDate()
                                }
                            });
                            console.log(`User ${userWalletAddress} received ${realNFTCount} real NFT bonus points`);
                        }

                        // Record trial NFT bonus if any (with day info)
                        if (trialBonus.points > 0) {
                            await db.pointHistory.create({
                                data: {
                                    userId: userId,
                                    point: trialBonus.points,
                                    reason: 4, // Trial NFT Bonus (Day-based)
                                    receivedDate: moment.utc().toDate()
                                }
                            });
                            // Update bonusApplied counter
                            if (trialBonus.trialNftId) {
                                await db.trialNft.update({
                                    where: { id: trialBonus.trialNftId },
                                    data: {
                                        bonusApplied: {
                                            increment: trialBonus.points
                                        }
                                    }
                                });
                            }
                            console.log(`User ${userWalletAddress} received ${trialBonus.points} trial NFT bonus points (Day ${trialBonus.dayOfHolding})`);
                        }

                        // Update user fan_points with total bonus
                        await db.user.update({
                            where: { id: userId },
                            data: {
                                fan_points: {
                                    increment: totalBonus
                                }
                            }
                        });

                        console.log(`User ${userWalletAddress} total NFT bonus: ${totalBonus} points (Real: ${realNFTCount}, Trial Day ${trialBonus.dayOfHolding}: ${trialBonus.points})`);
                    } else {
                        console.log(`User ${userWalletAddress} has no NFT balance, skipping NFT bonus`);
                    }
                } catch (error) {
                    console.error('Error checking NFT balance:', error);
                }
        }

        // Add illustration to user's history
        await db.illustrationHistory.create({
            data: {
                userId: userId,
                illustrationId: illustration.id
            },
            include: {
                illustration: true
            }
        });
    }
}
