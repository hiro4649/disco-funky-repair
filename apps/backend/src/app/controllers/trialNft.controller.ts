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
import { safeLogError } from '../utils/safeLogger';

const prisma = new PrismaClient();

type AuthenticatedTrialNftUser = {
    user_id?: number;
};

const getAuthenticatedTrialNftUserId = (req: Request): number | null => {
    const userId = Number((req.user as AuthenticatedTrialNftUser | undefined)?.user_id);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
};

const getSafePositiveInteger = (value: unknown): number | undefined => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const getOwnedTrialNftRouteUserId = (req: Request, res: Response): number | null => {
    const authenticatedUserId = getAuthenticatedTrialNftUserId(req);
    if (!authenticatedUserId) {
        res.status(401).json({
            success: false,
            message: 'Unauthenticated'
        });
        return null;
    }

    const routeUserId = parseInt(req.params.userId);
    if (isNaN(routeUserId)) {
        res.status(400).json({
            success: false,
            message: 'Invalid user ID'
        });
        return null;
    }

    if (routeUserId !== authenticatedUserId) {
        res.status(403).json({
            success: false,
            message: 'Forbidden'
        });
        return null;
    }

    return authenticatedUserId;
};

export class TrialNftController {
    /**
     * Check if user can claim trial NFT this month
     * GET /api/trial-nfts/can-claim/:userId
     */
    static async checkCanClaim(req: Request, res: Response) {
        try {
            const userId = getOwnedTrialNftRouteUserId(req, res);
            if (!userId) return res;

            const result = await canClaimTrialNFT(userId);

            return res.status(200).json({
                success: true,
                canClaim: result.canClaim,
                reason: result.reason,
                existingNft: result.existingNft
            });
        } catch (error) {
            safeLogError('check_trial_nft_claim_eligibility', error, {
                userId: getSafePositiveInteger(req.params.userId)
            });
            return res.status(500).json({
                success: false,
                message: 'Failed to check Trial NFT eligibility'
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
            const userId = getOwnedTrialNftRouteUserId(req, res);
            if (!userId) return res;
            const { templateId } = req.body;

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
            safeLogError('claim_trial_nft_controller', error, {
                userId: getSafePositiveInteger(req.params.userId),
                templateId: getSafePositiveInteger(req.body?.templateId)
            });
            return res.status(500).json({
                success: false,
                message: 'Failed to claim Trial NFT'
            });
        }
    }

    /**
     * Get active trial NFTs for a user
     * GET /api/trial-nfts/user/:userId
     */
    static async getUserTrialNFTs(req: Request, res: Response) {
        try {
            const userId = getOwnedTrialNftRouteUserId(req, res);
            if (!userId) return res;

            const trialNFTs = await getActiveTrialNFTs(userId);

            return res.status(200).json({
                success: true,
                data: trialNFTs,
                count: trialNFTs.length
            });
        } catch (error) {
            safeLogError('get_user_trial_nfts', error, {
                userId: getSafePositiveInteger(req.params.userId)
            });
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch Trial NFTs'
            });
        }
    }

    /**
     * Get total NFT count for a user (real + trial)
     * GET /api/trial-nfts/total/:userId
     */
    static async getTotalNFTCount(req: Request, res: Response) {
        try {
            const userId = getOwnedTrialNftRouteUserId(req, res);
            if (!userId) return res;

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
            safeLogError('get_total_nft_count_controller', error, {
                userId: getSafePositiveInteger(req.params.userId)
            });
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch NFT count'
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
            safeLogError('get_trial_nft_stats', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get Trial NFT statistics'
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
            safeLogError('expire_old_trial_nfts_controller', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to expire Trial NFTs'
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
            safeLogError('get_all_trial_nfts', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch Trial NFTs'
            });
        }
    }
}
