import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomInt } from 'crypto';
import moment from 'moment';
import getDiscoNFTEVM from '../lib/getDiscoNFTEVM';
import { getTrialNFTBonusPoints } from '../lib/trialNftService';
import { safeLogError } from '../utils/safeLogger';

const prisma = new PrismaClient();

class DrawIllustrationError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
    }
}

type AuthenticatedIllustrationUser = {
    user_id?: number;
};

const getAuthenticatedIllustrationUserId = (req: Request): number | null => {
    const userId = Number((req.user as AuthenticatedIllustrationUser | undefined)?.user_id);
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
            safeLogError('illustration_create', error);
            return res.status(500).json({
                success: false,
                message: 'Error creating illustration'
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
            safeLogError('illustration_get_all', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching illustrations'
            });
        }
    }

    // Get a single illustration by ID
    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const illustration = await prisma.illustration.findUnique({
                where: { id: parseInt(id) },
                select: {
                    id: true,
                    image_url: true,
                    earned_pts: true,
                    rarity: true
                }
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
            safeLogError('illustration_get_by_id', error, { illustrationId: req.params.id });
            return res.status(500).json({
                success: false,
                message: 'Error fetching illustration'
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
            safeLogError('illustration_update', error, { illustrationId: req.params.id });
            return res.status(500).json({
                success: false,
                message: 'Error updating illustration'
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
            safeLogError('illustration_delete', error, { illustrationId: req.params.id });
            return res.status(500).json({
                success: false,
                message: 'Error deleting illustration'
            });
        }
    }

    // Get user's illustration history
    static async getUserIllustrations(req: Request, res: Response) {
        try {
            const authenticatedUserId = getAuthenticatedIllustrationUserId(req);
            if (!authenticatedUserId) {
                return res.status(401).json({ success: false, message: 'Unauthenticated' });
            }

            if (!routeUserIdMatchesAuthenticatedUser(req, 'userId', authenticatedUserId)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            const userIllustrations = await prisma.illustrationHistory.findMany({
                where: { userId: authenticatedUserId },
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
            safeLogError('illustration_get_user_illustrations', error, { userId: getAuthenticatedIllustrationUserId(req) });
            return res.status(500).json({
                success: false,
                message: 'Error fetching user illustrations'
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
                    }
                } catch (error) {
                    safeLogError('illustration_add_user_nft_balance_check', error, { userId: parseInt(userId) });
                    // Still give the bonus even if NFT check fails (fallback behavior)
                }
            }

            return res.status(201).json({
                success: true,
                data: illustrationHistory,
                message: 'Illustration added to user successfully'
            });
        } catch (error) {
            safeLogError('illustration_add_to_user', error, {
                userId: Number(req.body?.userId) || undefined,
                illustrationId: Number(req.body?.illustrationId) || undefined
            });
            return res.status(500).json({
                success: false,
                message: 'Error adding illustration to user'
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
                select: {
                    id: true,
                    image_url: true,
                    earned_pts: true,
                    rarity: true
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
            safeLogError('illustration_get_by_rarity', error, { rarity: req.params.rarity });
            return res.status(500).json({
                success: false,
                message: 'Error fetching illustrations by rarity'
            });
        }
    }

    // Draw a random illustration based on fan points (earned_pts)
    // Lower fan points have higher probability of being selected
    static async drawIllustration(req: Request, res: Response) {
        try {
            const userIdNum = getAuthenticatedIllustrationUserId(req);
            if (!userIdNum) {
                return res.status(401).json({ success: false, message: 'Unauthenticated' });
            }

            if (!routeUserIdMatchesAuthenticatedUser(req, 'userId', userIdNum)) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

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

            safeLogError('illustration_draw', error, { userId: getAuthenticatedIllustrationUserId(req) });
            return res.status(500).json({
                success: false,
                message: 'Error drawing illustration'
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

                    }
                } catch (error) {
                    safeLogError('illustration_process_draw_nft_bonus', error, { userId });
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
