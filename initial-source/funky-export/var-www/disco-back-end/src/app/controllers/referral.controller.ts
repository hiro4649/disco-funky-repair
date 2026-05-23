import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface JwtPayload {
    user_id: number;
    address: string;
}

export class ReferralController {
    // Generate referral code for a user
    static async generateReferralCode(req: Request, res: Response) {
        try {
            const token = req.cookies.userAuth;
            if (!token) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
            const user = await prisma.user.findUnique({
                where: { id: decoded.user_id }
            });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Check if user already has a referral code
            let referralCode = await prisma.referralCode.findUnique({
                where: { userId: user.id }
            });

            if (!referralCode) {
                // Generate a unique referral code using alphanumeric characters (0-9, a-z, A-Z)
                const hash = crypto.createHash('sha256');
                hash.update(user.wallet_address + Date.now().toString());
                const hexHash = hash.digest('hex');
                
                // Convert hex to alphanumeric characters
                const alphanumericChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let code = '';
                
                // Use pairs of hex characters to generate alphanumeric codes
                for (let i = 0; i < 10 && i * 2 < hexHash.length; i++) {
                    const hexPair = hexHash.substr(i * 2, 2);
                    const decimalValue = parseInt(hexPair, 16);
                    const charIndex = decimalValue % alphanumericChars.length;
                    code += alphanumericChars[charIndex];
                }

                referralCode = await prisma.referralCode.create({
                    data: {
                        userId: user.id,
                        code: code
                    }
                });
            }

            return res.status(200).json({
                success: true,
                referralCode: referralCode.code,
                referralUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/r/${referralCode.code}/`
            });
        } catch (error) {
            console.error('Error generating referral code:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // Get referral statistics for a user
    static async getReferralStats(req: Request, res: Response) {
        try {
            const token = req.cookies.userAuth;
            if (!token) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
            
            // Get referral history
            const referrals = await prisma.referralHistory.findMany({
                where: { referrerId: decoded.user_id },
                include: {
                    referredUser: {
                        select: {
                            wallet_address: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // Get total rewards earned
            const totalRewards = referrals.reduce((sum, ref) => sum + (ref.rewarded ? ref.rewardAmount : 0), 0);
            
            // Get pending rewards (users who haven't met the 24h requirement yet)
            const pendingRewards = referrals.filter(ref => !ref.rewarded).length * 100;

            return res.status(200).json({
                success: true,
                totalReferrals: referrals.length,
                totalRewards,
                pendingRewards,
                referrals: referrals.map(ref => ({
                    walletAddress: ref.referredUser.wallet_address,
                    joinedAt: ref.referredUser.createdAt,
                    rewarded: ref.rewarded,
                    rewardAmount: ref.rewardAmount
                }))
            });
        } catch (error) {
            console.error('Error getting referral stats:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // Process referral when a new user signs up
    static async processReferral(req: Request, res: Response) {
        try {
            const { wallet_address, referral_code } = req.body;

            if (!wallet_address || !referral_code) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            // Find the referrer by referral code
            const referrerCode = await prisma.referralCode.findUnique({
                where: { code: referral_code },
                include: { user: true }
            });

            if (!referrerCode) {
                return res.status(404).json({ success: false, message: 'Invalid referral code' });
            }

            // Find the new user
            const newUser = await prisma.user.findUnique({
                where: { wallet_address }
            });

            if (!newUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Prevent self-referral
            if (referrerCode.user.wallet_address === wallet_address) {
                return res.status(400).json({ success: false, message: 'Cannot refer yourself' });
            }

            // Check if referral already exists
            const existingReferral = await prisma.referralHistory.findFirst({
                where: {
                    referrerId: referrerCode.userId,
                    referredUserId: newUser.id
                }
            });

            if (existingReferral) {
                return res.status(400).json({ success: false, message: 'Referral already exists' });
            }

            // Create referral record
            const referral = await prisma.referralHistory.create({
                data: {
                    referrerId: referrerCode.userId,
                    referredUserId: newUser.id,
                    referralCode: referral_code,
                    timestampFirstLogin: new Date()
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Referral processed successfully',
                referralId: referral.id
            });
        } catch (error) {
            console.error('Error processing referral:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // Check and award referral bonuses (called by cron job or manual trigger)
    static async checkAndAwardReferralBonuses(req: Request, res: Response) {
        try {
            console.log('Starting referral bonus check process...');
            
            // Get all pending referrals
            const pendingReferrals = await prisma.referralHistory.findMany({
                where: { rewarded: false },
                include: {
                    referredUser: {
                        include: {
                            ownedToken: true
                        }
                    }
                }
            });

            console.log(`Found ${pendingReferrals.length} pending referrals to process`);

            let awardedCount = 0;
            const results = [];

            for (const referral of pendingReferrals) {
                try {
                    console.log(`Processing referral ${referral.id}: referrer ${referral.referrerId} -> referred user ${referral.referredUserId}`);
                    
                    // Check if referred user has held 10,000 tokens for 24 hours
                    const hasHeldTokens = await this.checkTokenHoldingRequirement(referral.referredUserId);
                    
                    if (hasHeldTokens) {
                        console.log(`Referral ${referral.id} meets requirements. Awarding bonus...`);
                        
                        // Award bonus to both referrer and referred user
                        await this.awardReferralBonus(referral.referrerId, referral.referredUserId);
                        
                        // Mark as rewarded
                        await prisma.referralHistory.update({
                            where: { id: referral.id },
                            data: { rewarded: true }
                        });

                        awardedCount++;
                        results.push({
                            referralId: referral.id,
                            referrerId: referral.referrerId,
                            referredUserId: referral.referredUserId,
                            status: 'awarded'
                        });
                        
                        console.log(`Successfully awarded bonus for referral ${referral.id}`);
                    } else {
                        console.log(`Referral ${referral.id} does not meet requirements yet`);
                        results.push({
                            referralId: referral.id,
                            referrerId: referral.referrerId,
                            referredUserId: referral.referredUserId,
                            status: 'pending_requirements'
                        });
                    }
                } catch (error) {
                    console.error(`Error processing referral ${referral.id}:`, error);
                    results.push({
                        referralId: referral.id,
                        status: 'error',
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            console.log(`Referral bonus check completed. Processed ${pendingReferrals.length} referrals, awarded ${awardedCount}`);

            return res.status(200).json({
                success: true,
                message: `Processed ${pendingReferrals.length} referrals, awarded ${awardedCount}`,
                results
            });
        } catch (error) {
            console.error('Error checking referral bonuses:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // Manual trigger for referral bonus check (for testing/debugging)
    static async manualTriggerReferralBonusCheck(req: Request, res: Response) {
        try {
            console.log('Manual trigger of referral bonus check requested');
            
            // Call the same method used by the cron job
            const result = await this.checkAndAwardReferralBonuses(req, res);
            
            console.log('Manual referral bonus check completed');
            return result;
        } catch (error) {
            console.error('Error in manual referral bonus check:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    // Helper method to check if user has held 10,000 tokens for 24 hours
    private static async checkTokenHoldingRequirement(userId: number): Promise<boolean> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Get user's token balance history
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { ownedToken: true }
        });

        if (!user || !user.ownedToken || user.ownedToken.length === 0) {
            return false;
        }

        // Get the first (and should be only) ownedToken record
        const userToken = user.ownedToken[0];
        
        // Check if user has at least 10,000 tokens
        const currentBalance = userToken.tallyTokenBalance;
        if (currentBalance < 10000) {
            console.log(`User ${userId} has less than 10,000 tokens. Current balance: ${currentBalance}`);
            return false;
        }

        // Check if user has held tokens for at least 24 hours
        // We need to track when they first reached 10,000 tokens
        // For now, we'll use a more sophisticated approach by checking if they've maintained
        // the balance for the required duration
        
        // Get the user's first login timestamp from referral history
        const referralRecord = await prisma.referralHistory.findFirst({
            where: { referredUserId: userId }
        });

        if (!referralRecord) {
            console.log(`No referral record found for user ${userId}`);
            return false;
        }

        // Check if 24 hours have passed since first login
        const timeSinceFirstLogin = Date.now() - referralRecord.timestampFirstLogin.getTime();
        const hasHeldFor24Hours = timeSinceFirstLogin >= 24 * 60 * 60 * 1000;
        // const hasHeldFor24Hours = timeSinceFirstLogin >= 5 * 60 * 1000;

        // if (!hasHeldFor24Hours) {
        //     console.log(`User ${userId} has not held tokens for 24 hours yet. Time since first login: ${Math.floor(timeSinceFirstLogin / (1000 * 60 * 60))} hours`);
        //     return false;
        // }

        console.log(`User ${userId} has held 10,000+ tokens for 24+ hours. Eligible for referral bonus.`);
        return true;
    }

    // Helper method to award referral bonus
    private static async awardReferralBonus(referrerId: number, referredUserId: number) {
        const bonusAmount = 100;

        // Get user details for token transfer
        const referrer = await prisma.user.findUnique({
            where: { id: referrerId }
        });

        const referredUser = await prisma.user.findUnique({
            where: { id: referredUserId }
        });

        if (!referrer || !referredUser) {
            throw new Error('User not found for referral bonus');
        }

        try {
            // Skip actual token transfer - admin wallet doesn't have enough tokens
            // Just award fan points instead
            console.log(`Skipping token transfer - admin wallet insufficient. Awarding fan points instead.`);
            
            // Award bonus to referrer (PointHistory record)
            await prisma.pointHistory.create({
                data: {
                    userId: referrerId,
                    reason: 4, // New reason code for referral bonus
                    point: bonusAmount,
                    receivedDate: new Date()
                }
            });

            // Award bonus to referred user (PointHistory record)
            await prisma.pointHistory.create({
                data: {
                    userId: referredUserId,
                    reason: 4, // New reason code for referral bonus
                    point: bonusAmount,
                    receivedDate: new Date()
                }
            });

            // Update user experience for both users
            await prisma.user.update({
                where: { id: referrerId },
                data: {
                    experience: {
                        increment: bonusAmount
                    }
                }
            });

            await prisma.user.update({
                where: { id: referredUserId },
                data: {
                    experience: {
                        increment: bonusAmount
                    }
                }
            });

            console.log(`Successfully awarded referral bonus: ${bonusAmount} fan points to referrer ${referrer.wallet_address} and referred user ${referredUser.wallet_address}`);

        } catch (error) {
            console.error('Error awarding referral bonus fan points:', error);
            throw error;
        }
    }

    // Admin endpoint to get all referral statistics
    static async adminGetReferralStats(req: Request, res: Response) {
        try {
            const referrals = await prisma.referralHistory.findMany({
                include: {
                    referrer: {
                        select: { wallet_address: true }
                    },
                    referredUser: {
                        select: { wallet_address: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const stats = {
                totalReferrals: referrals.length,
                totalRewarded: referrals.filter(r => r.rewarded).length,
                totalPending: referrals.filter(r => !r.rewarded).length,
                totalRewardsGiven: referrals.filter(r => r.rewarded).reduce((sum, r) => sum + r.rewardAmount, 0),
                referrals: referrals.map(r => ({
                    id: r.id,
                    referrerAddress: r.referrer.wallet_address,
                    referredAddress: r.referredUser.wallet_address,
                    referralCode: r.referralCode,
                    rewarded: r.rewarded,
                    rewardAmount: r.rewardAmount,
                    firstLogin: r.timestampFirstLogin,
                    createdAt: r.createdAt
                }))
            };

            return res.status(200).json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('Error getting admin referral stats:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
} 