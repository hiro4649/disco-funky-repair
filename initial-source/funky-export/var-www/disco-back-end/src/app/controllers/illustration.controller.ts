import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class IllustrationController {
    // Create a new illustration
    static async create(req: Request, res: Response) {
        try {
            const { name, description, image_url, earned_pts, rarity, rarity_style, probability, jumpStatus } = req.body;
            const illustration = await prisma.illustration.create({
                data: {
                    name,
                    description,
                    image_url,
                    earned_pts: earned_pts || 0,
                    rarity: rarity || 0,
                    rarity_style: rarity_style || "",
                    probability: probability || 0,
                    jumpStatus: jumpStatus || false
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
            const { name, description, image_url, earned_pts, rarity, rarity_style, probability, jumpStatus } = req.body;

            const illustration = await prisma.illustration.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    description,
                    image_url,
                    earned_pts,
                    rarity,
                    rarity_style,
                    probability,
                    jumpStatus
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
                await prisma.pointHistory.create({
                    data: {
                        userId: parseInt(userId),
                        point: illustration.earned_pts,
                        reason: 3, // NFT Bonus as per schema
                        receivedDate: new Date()
                    }
                });

                // Update user experience
                await prisma.user.update({
                    where: { id: parseInt(userId) },
                    data: {
                        experience: {
                            increment: illustration.earned_pts
                        }
                    }
                });
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

    // Draw a random illustration based on probability and user rarity
    static async drawIllustration(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            // Check if user exists and get their rarity level
            const user = await prisma.user.findUnique({
                where: { id: parseInt(userId) }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (Number(user.tickets) < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'User has no tickets'
                });
            }

            // Get user's current rarity level
            const userRarity = user.rarity || 0;

            // Find illustrations with the same rarity as the user
            let illustrations = await prisma.illustration.findMany({
                where: {
                    rarity: userRarity,
                    probability: {
                        gt: 0
                    }
                }
            });

            // If still no illustrations found, return error
            if (illustrations.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No illustrations available for drawing with the current rarity level'
                });
            }

            // Calculate total probability
            const totalProbability = illustrations.reduce((sum: number, item: any) => sum + item.probability, 0);

            // Generate a random number between 0 and totalProbability
            const randomValue = Math.random() * totalProbability;

            // Select an illustration based on probability
            let cumulativeProbability = 0;
            let selectedIllustration = null;

            for (const illustration of illustrations) {
                cumulativeProbability += illustration.probability;
                if (randomValue <= cumulativeProbability) {
                    selectedIllustration = illustration;
                    break;
                }
            }

            if (!selectedIllustration) {
                selectedIllustration = illustrations[illustrations.length - 1];
            }

            // Update user's rarity based on the jumpStatus of the drawn illustration
            if (selectedIllustration.jumpStatus) {
                // Increase rarity by 1 if jumpStatus is true and there is an illustrator with increased 1
                // Check if there is an illustrator with increased 1
                const illustrator = await prisma.illustration.findFirst({
                    where: {
                        rarity: userRarity + 1,
                        probability: {
                            gt: 0
                        }
                    }
                });

                if (illustrator) {
                    await prisma.user.update({
                        where: { id: parseInt(userId) },
                        data: {
                            rarity: {
                                increment: 1
                            }
                        }
                    });
                }
            } else {
                // Reset rarity to 0 if jumpStatus is false
                await prisma.user.update({
                    where: { id: parseInt(userId) },
                    data: {
                        rarity: 1
                    }
                });

                // Add earned points to user if illustration has points
                if (selectedIllustration.earned_pts > 0) {
                    await prisma.pointHistory.create({
                        data: {
                            userId: parseInt(userId),
                            point: selectedIllustration.earned_pts,
                            reason: 2, // prize airdrop
                            receivedDate: new Date()
                        }
                    });

                    // Update user experience
                    await prisma.user.update({
                        where: { id: parseInt(userId) },
                        data: {
                            experience: {
                                increment: selectedIllustration.earned_pts
                            }
                        }
                    });
                }

                // Add illustration to illustration's history
                await prisma.illustrationHistory.create({
                    data: {
                        userId: parseInt(userId),
                        illustrationId: selectedIllustration.id
                    },
                    include: {
                        illustration: true
                    }
                });
            }
            // Return the drawn illustration with required fields
            return res.status(200).json({
                success: true,
                data: {
                    name: selectedIllustration.name,
                    description: selectedIllustration.description,
                    image_url: selectedIllustration.image_url,
                    earned_pts: selectedIllustration.earned_pts,
                    jumpStatus: selectedIllustration.jumpStatus,
                    rarity_style: selectedIllustration.rarity_style
                },
                message: 'Illustration drawn successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error drawing illustration',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 