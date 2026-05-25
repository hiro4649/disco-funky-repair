/**
 * Hourly Holding Duration Updater
 *
 * Calculates and updates average holding duration for all users every hour.
 * Stores the last update timestamp for frontend display.
 * Emits WebSocket events to notify frontend of updates.
 */

import prisma from '../db/prisma_client';
import moment from 'moment';


/**
 * Calculate average holding duration for a user based on FIFO queue
 *
 * IMPORTANT: HoldDateHistory already contains FIFO-adjusted amounts
 * (reduced by sales using First-In-First-Out method via realtimeHoldingDateUpdater)
 * We just need to recalculate the average as time passes (duration increases hourly)
 *
 * PRECISION NOTE: purchase_amount is now Decimal(38,18) for exact ERC20 precision.
 * Prisma returns Decimal objects which we convert to Number for the weighted average.
 */
const calculateAverageHoldingDuration = async (userId: number): Promise<{ averageDays: number; averageHours: number }> => {
    try {
        // Get user's FIFO-adjusted purchase history
        // Note: purchase_amount is already FIFO-adjusted by the real-time system
        const holdDateRecords = await prisma.holdDateHistory.findMany({
            where: { userId },
            orderBy: { purchase_date: 'asc' },
            select: {
                purchase_amount: true,
                purchase_date: true
            }
        });

        if (holdDateRecords.length === 0) {
            return { averageDays: 0, averageHours: 0 };
        }

        const currentTimeMs = Date.now();
        let totalWeightedMinutes = 0;
        let totalAmount = 0;

        // Calculate weighted average in minutes
        // Convert Prisma Decimal to Number for calculation (acceptable precision loss for time calculation)
        for (const record of holdDateRecords) {
            const purchaseTimeMs = new Date(record.purchase_date).getTime();
            const minutesHeld = Math.floor((currentTimeMs - purchaseTimeMs) / (1000 * 60));
            // Prisma Decimal can be converted to Number via .toNumber() or Number()
            const amount = Number(record.purchase_amount);

            totalWeightedMinutes += amount * minutesHeld;
            totalAmount += amount;
        }

        if (totalAmount === 0) {
            return { averageDays: 0, averageHours: 0 };
        }

        // Calculate average in minutes, then convert to days and hours
        const averageMinutes = totalWeightedMinutes / totalAmount;
        const averageDays = Math.floor(averageMinutes / (60 * 24));
        const averageHours = Math.floor((averageMinutes % (60 * 24)) / 60);

        return {
            averageDays,
            averageHours
        };

    } catch (error) {

        return { averageDays: 0, averageHours: 0 };
    }
};

/**
 * Update average holding duration for all users
 * Runs every hour via cron job
 */
export const updateAllUsersHoldingDuration = async (): Promise<void> => {
    const startTime = Date.now();


    try {
        // Get all users who have tokens (holdingDate > 0)
        const users = await prisma.user.findMany({
            where: {
                holdingDate: {
                    gt: 0
                }
            },
            select: {
                id: true,
                wallet_address: true
            }
        });



        let successCount = 0;
        let failedCount = 0;
        const updatedUsers: number[] = [];

        for (const user of users) {
            try {
                // Calculate average holding duration
                const { averageDays, averageHours } = await calculateAverageHoldingDuration(user.id);

                // Update user record with new calculation and timestamp
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        holdingDate: averageDays,
                        held_amount: averageDays + (averageHours / 24), // Store precise value
                        updatedAt: new Date()
                    }
                });

                updatedUsers.push(user.id);
                successCount++;

                if (successCount % 100 === 0) {

                }

            } catch (error) {

                failedCount++;
            }
        }

        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);



        // ============================================================
        // WebSocket: Notify frontend that hourly update completed
        // ============================================================
        try {
            const { io } = await import('../index');
            io.emit('hourly-holding-duration-updated', {
                timestamp: moment.utc().toISOString(),
                message: 'Hourly holding duration update completed',
                affectedUsers: successCount,
                updatedUserIds: updatedUsers
            });

        } catch (error) {

        }

    } catch (error) {
        const errorTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

    }
};

export default {
    updateAllUsersHoldingDuration,
    calculateAverageHoldingDuration
};
