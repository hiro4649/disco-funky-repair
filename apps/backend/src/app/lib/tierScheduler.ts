/**
 * Tier Scheduler
 *
 * Predicts when users will cross tier boundaries and schedules
 * smart contract updates for exact times.
 *
 * Strategy:
 * - Calculate days until next tier (30, 180, 360, 720)
 * - Schedule tier update at predicted time
 * - Process scheduled updates hourly
 * - Update contract only when tier actually changes
 *
 * Benefits:
 * - No 24-hour delay for tier changes
 * - Minimal gas waste (only update when crossing boundary)
 * - Fair and predictable
 */

import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import { walletBalanceMonitor } from './walletBalanceMonitor';
import { alertContractUpdateFailed } from './discordAlerts';

const prisma = new PrismaClient();

const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '';
const QUICKNODE_HTTP_RPC_URL = process.env.QUICKNODE_HTTP_RPC_URL || '';
const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS || '';

// Contract ABI for holding date updates
const TOKEN_ABI = [
    "function update_holding_date(address user, uint16 _holdingDate)",
    "function holdingDate(address) view returns (uint16)"
];

/**
 * Get milestone tier from holding days
 */
export const getMilestoneTier = (actualDays: number): number => {
    if (actualDays >= 720) return 720;
    if (actualDays >= 360) return 360;
    if (actualDays >= 180) return 180;
    if (actualDays >= 30) return 30;
    return 0;
};

/**
 * Get next tier boundary
 */
export const getNextTierDays = (currentTier: number): number | null => {
    if (currentTier < 30) return 30;
    if (currentTier < 180) return 180;
    if (currentTier < 360) return 360;
    if (currentTier < 720) return 720;
    return null; // Already at max tier
};

/**
 * Schedule tier update for a user
 *
 * Calculates when user will cross next tier boundary and schedules update
 */
export const scheduleTierUpdate = async (userId: number, currentHoldingDays: number): Promise<void> => {
    try {
        const currentTier = getMilestoneTier(currentHoldingDays);
        const nextTierDays = getNextTierDays(currentTier);

        // If already at max tier, remove any scheduled updates
        if (nextTierDays === null) {
            await prisma.scheduledTierUpdate.deleteMany({
                where: { userId }
            });
            return;
        }

        const daysUntilNextTier = nextTierDays - currentHoldingDays;

        // If user has already passed the tier (edge case), update immediately
        if (daysUntilNextTier <= 0) {
            console.log(`⚡ User ${userId} already passed tier ${nextTierDays}, triggering immediate update`);
            await updateUserContractTier(userId);
            return;
        }

        // Schedule update for when user crosses tier boundary
        const scheduledAt = new Date(Date.now() + daysUntilNextTier * 24 * 60 * 60 * 1000);

        await prisma.scheduledTierUpdate.upsert({
            where: { userId },
            create: {
                userId,
                scheduledAt,
                expectedTier: nextTierDays,
                currentTier,
                processed: false
            },
            update: {
                scheduledAt,
                expectedTier: nextTierDays,
                currentTier,
                processed: false,
                updatedAt: new Date()
            }
        });

        console.log(`📅 Scheduled tier update for user ${userId}: ${currentTier} → ${nextTierDays} in ${daysUntilNextTier.toFixed(2)} days`);

    } catch (error) {
        console.error(`Failed to schedule tier update for user ${userId}:`, error);
    }
};

/**
 * Process scheduled tier updates
 *
 * Runs hourly to check for users whose tier boundaries are approaching
 */
export const processScheduledTierUpdates = async (): Promise<void> => {
    try {
        console.log('🔍 Checking for scheduled tier updates...');

        // Get all scheduled updates that should be processed in the next hour
        const upcomingUpdates = await prisma.scheduledTierUpdate.findMany({
            where: {
                scheduledAt: {
                    lte: new Date(Date.now() + 60 * 60 * 1000) // Next hour
                },
                processed: false
            },
            include: {
                user: {
                    select: {
                        id: true,
                        wallet_address: true,
                        holdingDate: true,
                        held_amount: true,
                        updatedAt: true
                    }
                }
            }
        });

        if (upcomingUpdates.length === 0) {
            console.log('✅ No tier updates scheduled for the next hour');
            return;
        }

        console.log(`📋 Found ${upcomingUpdates.length} scheduled tier update(s)`);

        for (const scheduled of upcomingUpdates) {
            try {
                // Recalculate current holding days (accounts for passive time increase)
                const timeSinceUpdate = Date.now() - scheduled.user.updatedAt.getTime();
                const additionalDays = timeSinceUpdate / (24 * 60 * 60 * 1000);
                const currentHoldingDays = scheduled.user.held_amount + additionalDays;

                const currentTier = getMilestoneTier(currentHoldingDays);

                console.log(`👤 User ${scheduled.userId}: Current ${currentHoldingDays.toFixed(2)} days (tier ${currentTier}), Expected tier ${scheduled.expectedTier}`);

                // Check if user has crossed the tier boundary
                if (currentTier >= scheduled.expectedTier) {
                    console.log(`✅ User ${scheduled.userId} reached tier ${scheduled.expectedTier}, updating contract...`);

                    await updateUserContractTier(scheduled.userId);

                    // Mark as processed
                    await prisma.scheduledTierUpdate.update({
                        where: { id: scheduled.id },
                        data: {
                            processed: true,
                            updatedAt: new Date()
                        }
                    });

                    // Schedule next tier update if applicable
                    await scheduleTierUpdate(scheduled.userId, currentHoldingDays);
                } else {
                    console.log(`⏳ User ${scheduled.userId} hasn't reached tier ${scheduled.expectedTier} yet`);
                }

            } catch (error) {
                console.error(`Failed to process scheduled update for user ${scheduled.userId}:`, error);
            }
        }

        console.log('✅ Scheduled tier updates processing complete');

    } catch (error) {
        console.error('Error processing scheduled tier updates:', error);
    }
};

/**
 * Update user's tier in smart contract with balance monitoring and retry logic
 */
export const updateUserContractTier = async (userId: number, retries: number = 3): Promise<void> => {
    let lastError: Error | null = null;
    let user: { wallet_address: string; holdingDate: number } | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            if (!ADMIN_PRIVATE_KEY || !QUICKNODE_HTTP_RPC_URL) {
                console.error('Missing required environment variables for contract update');
                return;
            }

            user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    wallet_address: true,
                    holdingDate: true
                }
            });

            if (!user) {
                console.error(`User ${userId} not found`);
                return;
            }

            // Initialize provider and contract
            const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
            const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
            const contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, wallet);

            const milestoneTier = getMilestoneTier(user.holdingDate);

            // Check current contract state
            const currentContractTier = await contract.holdingDate(user.wallet_address);

            if (Number(currentContractTier) === milestoneTier) {
                console.log(`User ${userId} already has correct tier ${milestoneTier} in contract`);
                return;
            }

            console.log(`🔄 Updating contract tier for user ${userId}: ${currentContractTier} → ${milestoneTier} (attempt ${attempt + 1}/${retries})`);

            // Estimate gas and get current gas price
            const estimatedGas = await contract.update_holding_date.estimateGas(user.wallet_address, milestoneTier);
            const feeData = await provider.getFeeData();

            // Use EIP-1559 fees if available; otherwise fall back to legacy gasPrice (e.g. some RPCs/chains don't always return EIP-1559)
            const useEip1559 = feeData.maxFeePerGas != null && feeData.maxPriorityFeePerGas != null;
            const gasPriceForCost = useEip1559 ? feeData.maxFeePerGas! : feeData.gasPrice;

            if (!gasPriceForCost || gasPriceForCost === BigInt(0)) {
                throw new Error('Failed to fetch gas price from provider');
            }

            // ============================================================
            // CRITICAL: Check admin wallet balance before transaction
            // ============================================================
            const balanceCheck = await walletBalanceMonitor.checkBalanceBeforeTransaction(
                estimatedGas,
                gasPriceForCost
            );

            if (!balanceCheck) {
                throw new Error('Failed to check admin wallet balance');
            }

            if (!balanceCheck.sufficient) {
                console.error(`❌ Insufficient balance for user ${userId} contract update`);
                console.error(`   Required: ${ethers.formatEther(balanceCheck.estimatedCost)} BNB`);
                console.error(`   Available: ${ethers.formatEther(balanceCheck.balance)} BNB`);
                throw new Error('Insufficient admin wallet balance');
            }

            console.log(`💰 Balance check passed: ${ethers.formatEther(balanceCheck.balance)} BNB (can afford ${balanceCheck.remainingTransactions} more updates)`);

            // Check for gas price spikes
            await walletBalanceMonitor.checkGasPriceSpike(gasPriceForCost);

            // Send transaction (EIP-1559 or legacy gasPrice)
            const txOptions = useEip1559
                ? {
                    gasLimit: estimatedGas,
                    maxFeePerGas: feeData.maxFeePerGas,
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
                  }
                : { gasLimit: estimatedGas, gasPrice: feeData.gasPrice };
            const tx = await contract.update_holding_date(user.wallet_address, milestoneTier, txOptions);

            console.log(`📡 Transaction sent: ${tx.hash}`);
            console.log(`⏳ Waiting for confirmation...`);

            const receipt = await tx.wait();

            if (!receipt) {
                throw new Error('Transaction receipt is null');
            }

            console.log(`✅ Contract updated for user ${userId}. TX: ${receipt.hash}`);
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

            // Record gas usage for future predictions
            const gasUsed = receipt.gasUsed;
            const gasCost = gasUsed * gasPriceForCost;
            walletBalanceMonitor.recordGasUsage(gasUsed, gasCost, 'tier_update');

            // Success - exit retry loop
            return;

        } catch (error) {
            lastError = error as Error;
            console.error(`❌ Attempt ${attempt + 1}/${retries} failed for user ${userId}:`, error);

            // If insufficient balance, no point retrying
            if (error instanceof Error && error.message.includes('Insufficient admin wallet balance')) {
                console.error(`💰 Admin wallet out of funds - stopping retries`);
                await alertContractUpdateFailed(userId, user?.wallet_address || '', error, attempt + 1);
                throw error;
            }

            // If not the last attempt, wait before retrying
            if (attempt < retries - 1) {
                const delay = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s
                console.log(`⏳ Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // All retries exhausted
    if (lastError) {
        console.error(`❌ All ${retries} attempts failed for user ${userId}`);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { wallet_address: true }
        });
        await alertContractUpdateFailed(userId, user?.wallet_address || '', lastError, retries);
        throw lastError;
    }
};

/**
 * Cleanup old processed scheduled updates (runs daily)
 */
export const cleanupOldScheduledUpdates = async (): Promise<void> => {
    try {
        const result = await prisma.scheduledTierUpdate.deleteMany({
            where: {
                processed: true,
                updatedAt: {
                    lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Older than 7 days
                }
            }
        });

        console.log(`🧹 Cleaned up ${result.count} old scheduled tier updates`);
    } catch (error) {
        console.error('Error cleaning up old scheduled updates:', error);
    }
};

export default {
    getMilestoneTier,
    getNextTierDays,
    scheduleTierUpdate,
    processScheduledTierUpdates,
    updateUserContractTier,
    cleanupOldScheduledUpdates
};
