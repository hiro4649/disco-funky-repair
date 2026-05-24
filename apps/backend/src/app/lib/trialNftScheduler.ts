import cron from 'node-cron';
import { expireOldTrialNFTs, processDailyNFTHolderBonus } from './trialNftService';

/**
 * Trial NFT & NFT Holder Bonus Scheduler
 *
 * Daily tasks at midnight UTC:
 * 1. Process daily NFT holder bonus (real NFTs + trial NFTs)
 * 2. Expire old trial NFTs
 *
 * Point System:
 * - Real NFT holders: +1 point per NFT per day
 * - Trial NFT holders: Day 1=1pt, Day 2=2pts, Day 3=3pts, Day 4=4pts, Day 5=5pts
 */

let dailyBonusScheduler: cron.ScheduledTask | null = null;
let expirationScheduler: cron.ScheduledTask | null = null;

/**
 * Start the daily NFT holder bonus scheduler
 * Runs daily at 00:01 UTC (1 minute after midnight to allow expiration to complete first)
 */
export const startDailyNFTBonusScheduler = () => {
    if (dailyBonusScheduler) {

        return;
    }

    // Run daily at 00:01 UTC (after expiration)
    dailyBonusScheduler = cron.schedule('1 0 * * *', async () => {

        try {
            const result = await processDailyNFTHolderBonus();

        } catch (error) {

        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });


};

/**
 * Start the trial NFT expiration scheduler
 * Runs daily at 00:00 UTC to expire old trial NFTs
 */
export const startTrialNFTExpirationScheduler = () => {
    if (expirationScheduler) {

        return;
    }

    // Run daily at midnight UTC
    expirationScheduler = cron.schedule('0 0 * * *', async () => {

        try {
            const expiredCount = await expireOldTrialNFTs();

        } catch (error) {

        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });


};

/**
 * Start all NFT-related schedulers
 */
export const startTrialNFTSchedulers = () => {

    startTrialNFTExpirationScheduler(); // First: expire old trial NFTs
    startDailyNFTBonusScheduler();      // Second: process daily bonus

};

/**
 * Stop the daily NFT bonus scheduler
 */
export const stopDailyNFTBonusScheduler = () => {
    if (dailyBonusScheduler) {
        dailyBonusScheduler.stop();
        dailyBonusScheduler = null;

    }
};

/**
 * Stop the trial NFT expiration scheduler
 */
export const stopTrialNFTExpirationScheduler = () => {
    if (expirationScheduler) {
        expirationScheduler.stop();
        expirationScheduler = null;

    }
};

/**
 * Stop all NFT schedulers
 */
export const stopTrialNFTSchedulers = () => {

    stopTrialNFTExpirationScheduler();
    stopDailyNFTBonusScheduler();

};

/**
 * Get scheduler status
 */
export const getSchedulerStatus = () => {
    return {
        expiration: {
            running: expirationScheduler !== null,
            schedule: 'Daily at 00:00 UTC'
        },
        dailyBonus: {
            running: dailyBonusScheduler !== null,
            schedule: 'Daily at 00:01 UTC',
            description: 'Real NFT: +1pt/NFT/day, Trial NFT: Day N = +N pts'
        },
        manualClaim: {
            enabled: true,
            description: 'Users can claim one trial NFT per month from available templates'
        }
    };
};
