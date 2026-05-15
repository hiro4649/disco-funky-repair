import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
    expireOldTrialNFTs,
    getActiveTrialNFTs,
    getTotalNFTCount,
    getActiveTrialNFTCount,
    claimTrialNFT,
    canClaimTrialNFT
} from '../lib/trialNftService';
import getDiscoNFTEVM from '../lib/getDiscoNFTEVM';

const prisma = new PrismaClient();

type AuthenticatedTrialNftUser = {
    user_id?: number;
};

const getAuthenticatedTrialNftUserId = (req: Request): number | null => {
    const userId = Number((req.user as AuthenticatedTrialNftUser | undefined)?.user_id);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
};

export class TrialNftController {
    /**
     * Check if user can claim trial NFT this month
     * GET /api/trial-nfts/can-claim/:userId
     */
    static async checkCanClaim(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            const result = await canClaimTrialNFT(userId);

            return res.status(200).json({
                success: true,
                canClaim: result.canClaim,
                reason: result.reason,
                existingNft: result.existingNft
            });
        } catch (error) {
            console.error('Error checking claim eligibility:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking eligibility',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * User claims their monthly trial NFT
     * POST /api/trial-nfts/claim/:userId
     * Body: { templateId?: number } - Optional template ID
     */
    static async claimTrialNFT(req: Request, res: Response) {
        try {
            const authenticatedUserId = getAuthenticatedTrialNftUserId(req);
            if (!authenticatedUserId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthenticated'
                });
            }

            const routeUserId = parseInt(req.params.userId);
            const { templateId } = req.body;

            if (isNaN(routeUserId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            if (routeUserId !== authenticatedUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Forbidden'
                });
            }

            const userId = authenticatedUserId;

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Pass templateId if provided
            const result = await claimTrialNFT(userId, templateId ? parseInt(templateId) : undefined);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                    data: result.data
                });
            }

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        } catch (error) {
            console.error('Error claiming trial NFT:', error);
            return res.status(500).json({
                success: false,
                message: 'Error claiming trial NFT',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get active trial NFTs for a user
     * GET /api/trial-nfts/user/:userId
     */
    static async getUserTrialNFTs(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            const trialNFTs = await getActiveTrialNFTs(userId);

            return res.status(200).json({
                success: true,
                data: trialNFTs,
                count: trialNFTs.length
            });
        } catch (error) {
            console.error('Error getting user trial NFTs:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching trial NFTs',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get total NFT count for a user (real + trial)
     * GET /api/trial-nfts/total/:userId
     */
    static async getTotalNFTCount(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { wallet_address: true }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const realNFTCount = await getDiscoNFTEVM(user.wallet_address);
            const trialNFTCount = await getActiveTrialNFTCount(userId);
            const totalCount = realNFTCount + trialNFTCount;

            return res.status(200).json({
                success: true,
                data: {
                    realNFTs: realNFTCount,
                    trialNFTs: trialNFTCount,
                    total: totalCount
                }
            });
        } catch (error) {
            console.error('Error getting total NFT count:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching NFT count',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get trial NFT statistics for admin dashboard
     * GET /api/trial-nfts/stats
     */
    static async getStats(req: Request, res: Response) {
        try {
            const now = new Date();
            
            // Total trial NFTs ever created
            const total = await prisma.trialNft.count();
            
            // Currently active trial NFTs (not expired)
            const active = await prisma.trialNft.count({
                where: {
                    isActive: true,
                    expiresAt: { gt: now }
                }
            });
            
            // Expired trial NFTs
            const expired = total - active;
            
            // Unique users who have claimed trial NFTs
            const uniqueUsersResult = await prisma.trialNft.groupBy({
                by: ['userId'],
                _count: { userId: true }
            });

            return res.status(200).json({
                success: true,
                data: {
                    total,
                    active,
                    expired,
                    uniqueUsers: uniqueUsersResult.length
                }
            });
        } catch (error) {
            console.error('Error getting trial NFT stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Error getting statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Expire old trial NFTs (Admin/Cron job)
     * POST /api/trial-nfts/expire
     */
    static async expireOldNFTs(req: Request, res: Response) {
        try {
            const expiredCount = await expireOldTrialNFTs();

            return res.status(200).json({
                success: true,
                message: `Expired ${expiredCount} trial NFT(s)`,
                expiredCount
            });
        } catch (error) {
            console.error('Error expiring trial NFTs:', error);
            return res.status(500).json({
                success: false,
                message: 'Error expiring trial NFTs',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get all trial NFTs (Admin only)
     * GET /api/trial-nfts/all
     */
    static async getAllTrialNFTs(req: Request, res: Response) {
        try {
            const { active, page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};
            if (active !== undefined) {
                where.isActive = active === 'true';
            }

            const [trialNFTs, total] = await Promise.all([
                prisma.trialNft.findMany({
                    where,
                    include: {
                        user: {
                            select: {
                                id: true,
                                wallet_address: true
                            }
                        }
                    },
                    skip,
                    take: Number(limit),
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                prisma.trialNft.count({ where })
            ]);

            return res.status(200).json({
                success: true,
                data: trialNFTs,
                pagination: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Error getting all trial NFTs:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching trial NFTs',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
