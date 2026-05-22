import prisma from '../db/prisma_client';
import { Prisma } from '@prisma/client';
import moment from 'moment';
import getDiscoNFTEVM from './getDiscoNFTEVM';
import { safeLogError } from '../utils/safeLogger';

/**
 * Trial NFT Service
 * Handles trial NFT claiming, expiration, and bonus calculations
 * 
 * IMPORTANT: Trial NFTs are NOT real blockchain NFTs!
 * They are simulated NFTs stored in the database that allow users
 * to experience NFT benefits for a limited time.
 * 
 * FLOW:
 * 1. Admin creates Trial NFT templates with name, description, image
 * 2. Users can mint (claim) ONE Trial NFT per month from available templates
 * 3. Trial NFT is valid for X days (default 5)
 * 4. Daily cron job gives bonus points: Day 1=1pt, Day 2=2pts, etc.
 * 5. After expiration, Trial NFT becomes inactive
 */

// Default values (used if no template)
// Default image should be an IPFS URL or full URL, not a local path
const DEFAULT_TRIAL_NFT_IMAGE = process.env.TRIAL_NFT_IMAGE_URL || 'https://gateway.lighthouse.storage/ipfs/QmDefaultTrialNFT';
const DEFAULT_TRIAL_NFT_DURATION_DAYS = 5;

type TrialNftClaimResult = { success: boolean; data?: any; message: string };
type TrialNftPrismaClient = typeof prisma | Prisma.TransactionClient;

const findExistingTrialNftClaim = async (
    client: TrialNftPrismaClient,
    userId: number,
    now: moment.Moment = moment.utc()
) => {
    const startOfMonth = now.clone().startOf('month').toDate();
    const endOfMonth = now.clone().endOf('month').toDate();

    const existingThisMonth = await client.trialNft.findFirst({
        where: {
            userId: userId,
            receivedDate: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });

    if (existingThisMonth) {
        return {
            reason: 'You have already claimed a Trial NFT this month',
            existingNft: existingThisMonth
        };
    }

    const activeTrialNFT = await client.trialNft.findFirst({
        where: {
            userId: userId,
            isActive: true,
            expiresAt: {
                gt: now.toDate()
            }
        }
    });

    if (activeTrialNFT) {
        return {
            reason: 'You already have an active Trial NFT',
            existingNft: activeTrialNFT
        };
    }

    return null;
};

const isPrismaTransactionConflict = (error: unknown): boolean => (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2034'
);

/**
 * Get total NFT count for a user (real NFTs from blockchain + active trial NFTs)
 * @param walletAddress - User's wallet address
 * @param userId - User's database ID
 * @returns Total NFT count (real + trial)
 */
export const getTotalNFTCount = async (walletAddress: string, userId: number): Promise<number> => {
    try {
        // Get real NFT count from blockchain
        const realNFTCount = await getDiscoNFTEVM(walletAddress);

        // Get active trial NFT count from database
        const activeTrialNFTs = await prisma.trialNft.count({
            where: {
                userId: userId,
                isActive: true,
                expiresAt: {
                    gt: moment.utc().toDate() // Not expired yet
                }
            }
        });

        const totalCount = realNFTCount + activeTrialNFTs;
        console.log(`User ${userId}: Real NFTs: ${realNFTCount}, Trial NFTs: ${activeTrialNFTs}, Total: ${totalCount}`);

        return totalCount;
    } catch (error) {
        safeLogError('trial_nft_get_total_count', error, { userId });
        // Fallback to real NFTs only
        return await getDiscoNFTEVM(walletAddress);
    }
};

/**
 * Check if user can claim a trial NFT this month
 * Users can only claim ONE trial NFT per month
 * @param userId - User's database ID
 * @returns Object with canClaim status and reason
 */
export const canClaimTrialNFT = async (userId: number): Promise<{ canClaim: boolean; reason: string; existingNft?: any }> => {
    try {
        const existingClaim = await findExistingTrialNftClaim(prisma, userId);
        if (existingClaim) {
            return {
                canClaim: false,
                reason: existingClaim.reason,
                existingNft: existingClaim.existingNft
            };
        }
        return { canClaim: true, reason: 'Eligible to claim' };
    } catch (error) {
        safeLogError('trial_nft_check_claim_eligibility', error, { userId });
        return { canClaim: false, reason: 'Error checking eligibility' };
    }
};

/**
 * User claims their monthly trial NFT from a template
 * @param userId - User's database ID
 * @param templateId - Optional template ID (uses first available if not specified)
 * @returns Created trial NFT or error
 */
export const claimTrialNFT = async (userId: number, templateId?: number): Promise<{ success: boolean; data?: any; message: string }> => {
    try {
        return await prisma.$transaction(async (tx) => {
            const now = moment.utc();
            const existingClaim = await findExistingTrialNftClaim(tx, userId, now);
            if (existingClaim) {
                return {
                    success: false,
                    message: existingClaim.reason,
                    data: existingClaim.existingNft
                };
            }

            // Get template (specified or first available)
            let template = null;
            if (templateId) {
                template = await tx.trialNftTemplate.findFirst({
                    where: {
                        id: templateId,
                        isAvailable: true
                    }
                });
            } else {
                // Get first available template
                template = await tx.trialNftTemplate.findFirst({
                    where: {
                        isAvailable: true,
                        OR: [
                            { maxMints: 0 },
                            { mintCount: { lt: prisma.trialNftTemplate.fields.maxMints } }
                        ]
                    },
                    orderBy: { createdAt: 'desc' }
                });
            }

            // Use template data or defaults
            const name = template?.name || 'Monthly Free Trial NFT';
            const description = template?.description || 'Free trial NFT that boosts FanPoints for 5 days. This is a simulated NFT experience.';
            // Template image is now an IPFS URL, use it directly
            const image = template?.image || DEFAULT_TRIAL_NFT_IMAGE;
            const validDays = template?.validDays || DEFAULT_TRIAL_NFT_DURATION_DAYS;

            // Check if template has reached max mints
            if (template && template.maxMints > 0 && template.mintCount >= template.maxMints) {
                return { success: false, message: 'This Trial NFT template has reached maximum mints' };
            }

            if (template) {
                const templateMintReservation = await tx.trialNftTemplate.updateMany({
                    where: {
                        id: template.id,
                        isAvailable: true,
                        ...(template.maxMints > 0 ? { mintCount: { lt: template.maxMints } } : {})
                    },
                    data: { mintCount: { increment: 1 } }
                });

                if (templateMintReservation.count !== 1) {
                    return { success: false, message: 'This Trial NFT template has reached maximum mints' };
                }
            }

            const receivedDate = now.toDate();
            const expiresAt = now.clone().add(validDays, 'days').toDate();

            // Create new trial NFT
            const trialNft = await tx.trialNft.create({
                data: {
                    userId: userId,
                    templateId: template?.id || null,
                    name: name,
                    description: description,
                    image: image,
                    receivedDate: receivedDate,
                    expiresAt: expiresAt,
                    isActive: true,
                    bonusApplied: 1 // Day 1 bonus already applied
                }
            });

            // Give immediate 1 fan-point for Day 1 of Trial NFT
            await tx.pointHistory.create({
                data: {
                    userId: userId,
                    point: 1,
                    reason: 5, // Trial NFT Bonus
                    receivedDate: now.toDate()
                }
            });

            await tx.user.update({
                where: { id: userId },
                data: { fan_points: { increment: 1 } }
            });

            console.log(`Trial NFT claimed for user ${userId}, expires at ${expiresAt.toISOString()}`);
            console.log(`User ${userId} received 1 fan-point immediately for Trial NFT mint (Day 1)`);
            return { success: true, data: trialNft, message: 'Trial NFT claimed successfully! +1 Fan Point' };
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });
    } catch (error) {
        if (isPrismaTransactionConflict(error)) {
            const existingClaim = await findExistingTrialNftClaim(prisma, userId);
            if (existingClaim) {
                return {
                    success: false,
                    message: existingClaim.reason,
                    data: existingClaim.existingNft
                };
            }
        }

        safeLogError('trial_nft_claim', error, { userId, templateId });
        return { success: false, message: 'Failed to claim trial NFT' };
    }
};


/**
 * Expire trial NFTs that have passed their expiration date
 */
export const expireOldTrialNFTs = async () => {
    try {
        const now = moment.utc().toDate();

        // Find all active trial NFTs that have expired
        const expiredTrialNFTs = await prisma.trialNft.findMany({
            where: {
                isActive: true,
                expiresAt: {
                    lte: now
                }
            }
        });

        if (expiredTrialNFTs.length === 0) {
            console.log('No trial NFTs to expire');
            return 0;
        }

        // Mark them as inactive
        const result = await prisma.trialNft.updateMany({
            where: {
                isActive: true,
                expiresAt: {
                    lte: now
                }
            },
            data: {
                isActive: false
            }
        });

        console.log(`🗑️ Expired ${result.count} trial NFT(s)`);
        return result.count;
    } catch (error) {
        safeLogError('trial_nft_expire_old', error);
        return 0;
    }
};

/**
 * Get active trial NFTs for a user (for display purposes)
 * @param userId - User's database ID
 * @returns Array of active trial NFTs
 */
export const getActiveTrialNFTs = async (userId: number) => {
    try {
        const activeTrialNFTs = await prisma.trialNft.findMany({
            where: {
                userId: userId,
                isActive: true,
                expiresAt: {
                    gt: moment.utc().toDate()
                }
            },
            orderBy: {
                receivedDate: 'desc'
            }
        });

        return activeTrialNFTs;
    } catch (error) {
        safeLogError('trial_nft_get_active_for_user', error, { userId });
        return [];
    }
};

/**
 * Check if a user can receive trial NFT bonus
 * (Trial NFT is active and hasn't expired)
 * @param userId - User's database ID
 * @returns Number of active trial NFTs
 */
export const getActiveTrialNFTCount = async (userId: number): Promise<number> => {
    try {
        const count = await prisma.trialNft.count({
            where: {
                userId: userId,
                isActive: true,
                expiresAt: {
                    gt: moment.utc().toDate()
                }
            }
        });

        return count;
    } catch (error) {
        safeLogError('trial_nft_get_active_count', error, { userId });
        return 0;
    }
};

/**
 * Calculate Trial NFT bonus points based on holding days
 * Point system (for daily cron job):
 *   Day 1: SKIP (1 point given immediately at mint)
 *   Day 2: 2 points
 *   Day 3: 3 points
 *   Day 4: 4 points
 *   Day 5: 5 points
 * 
 * @param userId - User's database ID
 * @param isForDailyCron - If true, skips Day 1 since it's given at mint time
 * @returns Bonus points for the current day of holding
 */
export const getTrialNFTBonusPoints = async (userId: number, isForDailyCron: boolean = true): Promise<{ points: number; dayOfHolding: number; trialNftId: number | null }> => {
    try {
        const now = moment.utc();
        
        // Get active trial NFT for user
        const activeTrialNFT = await prisma.trialNft.findFirst({
            where: {
                userId: userId,
                isActive: true,
                expiresAt: {
                    gt: now.toDate()
                }
            },
            orderBy: {
                receivedDate: 'desc'
            }
        });

        if (!activeTrialNFT) {
            return { points: 0, dayOfHolding: 0, trialNftId: null };
        }

        // Calculate which day of holding (1-5)
        const receivedDate = moment.utc(activeTrialNFT.receivedDate);
        const dayOfHolding = Math.min(
            Math.ceil(now.diff(receivedDate, 'hours') / 24) || 1, // At least day 1
            DEFAULT_TRIAL_NFT_DURATION_DAYS // Max 5 days
        );

        // For daily cron job: Day 1 bonus is already given at mint time, so skip it
        // Only give bonus for Day 2-5
        if (isForDailyCron && dayOfHolding === 1) {
            console.log(`📊 Trial NFT for user ${userId}: Day 1 - skipping (already given at mint)`);
            return { points: 0, dayOfHolding: 1, trialNftId: activeTrialNFT.id };
        }

        // Points = day of holding (Day 2 = 2pts, Day 3 = 3pts, etc.)
        const points = dayOfHolding;

        console.log(`📊 Trial NFT bonus for user ${userId}: Day ${dayOfHolding} = ${points} points`);

        return { 
            points, 
            dayOfHolding, 
            trialNftId: activeTrialNFT.id 
        };
    } catch (error) {
        safeLogError('trial_nft_calculate_bonus', error, { userId });
        return { points: 0, dayOfHolding: 0, trialNftId: null };
    }
};

/**
 * Apply Trial NFT bonus and update bonusApplied counter
 * @param userId - User's database ID
 * @param isForDailyCron - If true, skips Day 1 since it's given at mint time
 * @returns Applied bonus points
 */
export const applyTrialNFTBonus = async (userId: number, isForDailyCron: boolean = true): Promise<number> => {
    try {
        const { points, dayOfHolding, trialNftId } = await getTrialNFTBonusPoints(userId, isForDailyCron);

        if (points === 0 || !trialNftId) {
            return 0;
        }

        // Update bonusApplied counter on the trial NFT
        await prisma.trialNft.update({
            where: { id: trialNftId },
            data: {
                bonusApplied: {
                    increment: points
                }
            }
        });

        console.log(`✅ Applied ${points} trial NFT bonus points to user ${userId} (Day ${dayOfHolding})`);
        return points;
    } catch (error) {
        safeLogError('trial_nft_apply_bonus', error, { userId });
        return 0;
    }
};

/**
 * Process daily NFT holder bonus for all users
 * This should be called by a daily cron job at midnight UTC
 * 
 * Real NFT holders: +1 point per NFT per day
 * Trial NFT holders: Day 1=+1pt, Day 2=+2pts, Day 3=+3pts, Day 4=+4pts, Day 5=+5pts
 * 
 * @returns Summary of processed users and points
 */
export const processDailyNFTHolderBonus = async (): Promise<{
    processedUsers: number;
    totalRealNFTBonus: number;
    totalTrialNFTBonus: number;
    errors: number;
}> => {
    console.log('🎁 Starting daily NFT holder bonus processing...');
    
    let processedUsers = 0;
    let totalRealNFTBonus = 0;
    let totalTrialNFTBonus = 0;
    let errors = 0;

    try {
        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                wallet_address: true
            }
        });

        console.log(`📊 Processing ${users.length} users for daily NFT bonus...`);

        for (const user of users) {
            try {
                let userRealNFTBonus = 0;
                let userTrialNFTBonus = 0;

                // 1. Check real NFT holdings from blockchain
                const realNFTCount = await getDiscoNFTEVM(user.wallet_address);
                
                if (realNFTCount > 0) {
                    // Check if user already received Real NFT bonus TODAY (from immediate mint bonus)
                    // If they minted today, skip the daily bonus for today
                    const todayStart = moment.utc().startOf('day').toDate();
                    const todayEnd = moment.utc().endOf('day').toDate();
                    
                    const alreadyReceivedToday = await prisma.pointHistory.findFirst({
                        where: {
                            userId: user.id,
                            reason: 3, // Real NFT Bonus
                            receivedDate: {
                                gte: todayStart,
                                lte: todayEnd
                            }
                        }
                    });

                    if (alreadyReceivedToday) {
                        // User already received Real NFT bonus today (from mint), skip daily bonus
                        console.log(`  ⏭️ User ${user.id}: Skipping Real NFT daily bonus (already received mint bonus today)`);
                    } else {
                        // Real NFT holders get 1 point per NFT per day
                        userRealNFTBonus = realNFTCount;
                        
                        await prisma.pointHistory.create({
                            data: {
                                userId: user.id,
                                point: userRealNFTBonus,
                                reason: 3, // NFT Holder Bonus
                                receivedDate: moment.utc().toDate()
                            }
                        });

                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                fan_points: { increment: userRealNFTBonus }
                            }
                        });

                        totalRealNFTBonus += userRealNFTBonus;
                    }
                }

                // 2. Check Trial NFT holdings
                const { points: trialPoints, dayOfHolding, trialNftId } = await getTrialNFTBonusPoints(user.id);
                
                if (trialPoints > 0 && trialNftId) {
                    userTrialNFTBonus = trialPoints;
                    
                    await prisma.pointHistory.create({
                        data: {
                            userId: user.id,
                            point: userTrialNFTBonus,
                            reason: 5, // Trial NFT Daily Bonus
                            receivedDate: moment.utc().toDate()
                        }
                    });

                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            fan_points: { increment: userTrialNFTBonus }
                        }
                    });

                    // Update bonusApplied counter
                    await prisma.trialNft.update({
                        where: { id: trialNftId },
                        data: {
                            bonusApplied: { increment: userTrialNFTBonus }
                        }
                    });

                    totalTrialNFTBonus += userTrialNFTBonus;
                }

                if (userRealNFTBonus > 0 || userTrialNFTBonus > 0) {
                    processedUsers++;
                    console.log(`  ✓ User ${user.id}: Real NFT +${userRealNFTBonus}pts, Trial NFT Day ${dayOfHolding || 0} +${userTrialNFTBonus}pts`);
                }

            } catch (userError) {
                safeLogError('trial_nft_daily_bonus_user', userError, { userId: user.id });
                errors++;
            }
        }

        console.log(`\n📊 Daily NFT Holder Bonus Summary:`);
        console.log(`   Users processed: ${processedUsers}`);
        console.log(`   Real NFT bonus total: ${totalRealNFTBonus} pts`);
        console.log(`   Trial NFT bonus total: ${totalTrialNFTBonus} pts`);
        console.log(`   Errors: ${errors}`);

        return {
            processedUsers,
            totalRealNFTBonus,
            totalTrialNFTBonus,
            errors
        };

    } catch (error) {
        safeLogError('trial_nft_daily_bonus_processing', error);
        throw error;
    }
};
