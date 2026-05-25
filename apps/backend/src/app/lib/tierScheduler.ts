/**
 * Tier Scheduler
 *
 * Predicts when users will cross tier boundaries and schedules
 * smart contract updates for exact times.
 *
 * Strategy:
 * - Calculate days until next tier (31, 91, 181, 271, 361, 541, 721)
 * - Schedule tier update at predicted time
 * - Process scheduled updates hourly
 * - Update contract only when tier actually changes
 *
 * Benefits:
 * - No 24-hour delay for tier changes
 * - Minimal gas waste (only update when crossing boundary)
 * - Fair and predictable
 */

import prisma from '../db/prisma_client';
import { ethers } from 'ethers';
import { walletBalanceMonitor } from './walletBalanceMonitor';
import { alertContractUpdateFailed } from './discordAlerts';
import {
    QUICKNODE_HTTP_RPC_URL,
    TIER_RELAYER_PRIVATE_KEY,
    TIER_UPDATER_CONTRACT_ADDRESS
} from '../config/env';
import {
    createTierBatchId,
    estimateTierSyncGas,
    getMilestoneTier,
    getNextTierDays,
    sendTierSyncTransaction,
    TierSyncContext,
    TIER_UPDATER_ABI
} from './tierSync';


export { getMilestoneTier, getNextTierDays };

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



    } catch (error) {
        const errorName = error instanceof Error ? error.name : typeof error;

    }
};

/**
 * Process scheduled tier updates
 *
 * Runs hourly to check for users whose tier boundaries are approaching
 */
export const processScheduledTierUpdates = async (): Promise<void> => {
    try {


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

            return;
        }



        for (const scheduled of upcomingUpdates) {
            try {
                // Recalculate current holding days (accounts for passive time increase)
                const timeSinceUpdate = Date.now() - scheduled.user.updatedAt.getTime();
                const additionalDays = timeSinceUpdate / (24 * 60 * 60 * 1000);
                const currentHoldingDays = scheduled.user.held_amount + additionalDays;

                const currentTier = getMilestoneTier(currentHoldingDays);



                // Check if user has crossed the tier boundary
                if (currentTier >= scheduled.expectedTier) {


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

                }

            } catch (error) {
                const errorName = error instanceof Error ? error.name : typeof error;

            }
        }



    } catch (error) {
        const errorName = error instanceof Error ? error.name : typeof error;

    }
};

/**
 * Update user's tier in smart contract with balance monitoring and retry logic
 */
export const updateUserContractTier = async (
    userId: number,
    retries: number = 3,
    syncContext: TierSyncContext = {}
): Promise<void> => {
    let lastError: Error | null = null;
    let user: { wallet_address: string; holdingDate: number; disco_balance: number; held_amount: number } | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            if (!TIER_RELAYER_PRIVATE_KEY || !QUICKNODE_HTTP_RPC_URL || !TIER_UPDATER_CONTRACT_ADDRESS) {

                return;
            }

            user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    wallet_address: true,
                    holdingDate: true,
                    disco_balance: true,
                    held_amount: true
                }
            });

            if (!user) {

                return;
            }

            // Initialize provider and contract
            const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
            const wallet = new ethers.Wallet(TIER_RELAYER_PRIVATE_KEY, provider);
            const contract = new ethers.Contract(TIER_UPDATER_CONTRACT_ADDRESS, TIER_UPDATER_ABI, wallet);

            const milestoneTier = getMilestoneTier(user.holdingDate);
            const batchId = createTierBatchId('SCHEDULED_TIER_SYNC', userId);
            const tierContext = {
                tokenBalance: syncContext.tokenBalance ?? user.disco_balance,
                holdingDays: syncContext.holdingDays ?? user.holdingDate,
                explicitReason: syncContext.explicitReason
            };

            // Check current contract state
            const currentContractTier = await contract.holdingDate(user.wallet_address);

            if (Number(currentContractTier) === milestoneTier) {

                return;
            }



            // Estimate gas and get current gas price
            const estimatedGas = await estimateTierSyncGas(
                contract,
                user.wallet_address,
                milestoneTier,
                batchId,
                Number(currentContractTier),
                tierContext
            );
            const feeData = await provider.getFeeData();

            // Use EIP-1559 fees if available; otherwise fall back to legacy gasPrice (e.g. some RPCs/chains don't always return EIP-1559)
            const useEip1559 = feeData.maxFeePerGas != null && feeData.maxPriorityFeePerGas != null;
            const gasPriceForCost = useEip1559 ? feeData.maxFeePerGas! : feeData.gasPrice;

            if (!gasPriceForCost || gasPriceForCost === BigInt(0)) {
                throw new Error('Failed to fetch gas price from provider');
            }

            // ============================================================
            // CRITICAL: Check tier relayer wallet balance before transaction
            // ============================================================
            const estimatedCost = estimatedGas * gasPriceForCost;
            const relayerBalance = await provider.getBalance(wallet.address);
            const remainingTransactions = estimatedCost > 0n
                ? Number(relayerBalance / estimatedCost)
                : 0;

            if (relayerBalance < estimatedCost) {

                throw new Error('Insufficient tier relayer wallet balance');
            }



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
            const tx = await sendTierSyncTransaction(
                contract,
                user.wallet_address,
                milestoneTier,
                batchId,
                Number(currentContractTier),
                tierContext,
                txOptions
            );



            const receipt = await tx.wait();

            if (!receipt) {
                throw new Error('Transaction receipt is null');
            }



            // Record gas usage for future predictions
            const gasUsed = receipt.gasUsed;
            const gasCost = gasUsed * gasPriceForCost;
            walletBalanceMonitor.recordGasUsage(gasUsed, gasCost, 'tier_update');

            // Success - exit retry loop
            return;

        } catch (error) {
            lastError = error as Error;
            const errorName = error instanceof Error ? error.name : typeof error;


            // If insufficient balance, no point retrying
            if (error instanceof Error && error.message.includes('Insufficient tier relayer wallet balance')) {

                await alertContractUpdateFailed(userId, user?.wallet_address || '', error, attempt + 1);
                throw error;
            }

            // If not the last attempt, wait before retrying
            if (attempt < retries - 1) {
                const delay = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // All retries exhausted
    if (lastError) {

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { wallet_address: true }
        });
        await alertContractUpdateFailed(userId, user?.wallet_address || '', new Error('Tier update failed'), retries);
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


    } catch (error) {

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
