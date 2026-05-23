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
        console.log('⚠️ Daily NFT bonus scheduler already running');
        return;
    }

    // Run daily at 00:01 UTC (after expiration)
    dailyBonusScheduler = cron.schedule('1 0 * * *', async () => {
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║ 🎁 DAILY NFT HOLDER BONUS PROCESSING                           ║');
        console.log('║ Real NFT: +1pt per NFT | Trial NFT: Day N = +N pts             ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');
        
        try {
            const result = await processDailyNFTHolderBonus();
            console.log('\n╔════════════════════════════════════════════════════════════════╗');
            console.log('║ ✅ DAILY NFT BONUS COMPLETED                                   ║');
            console.log(`║ Users: ${result.processedUsers} | Real: +${result.totalRealNFTBonus}pts | Trial: +${result.totalTrialNFTBonus}pts ║`);
            console.log('╚════════════════════════════════════════════════════════════════╝\n');
        } catch (error) {
            console.error('❌ Error in daily NFT bonus scheduler:', error);
        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });

    console.log('✅ Daily NFT bonus scheduler started (runs daily at 00:01 UTC)');
};

/**
 * Start the trial NFT expiration scheduler
 * Runs daily at 00:00 UTC to expire old trial NFTs
 */
export const startTrialNFTExpirationScheduler = () => {
    if (expirationScheduler) {
        console.log('⚠️ Trial NFT expiration scheduler already running');
        return;
    }

    // Run daily at midnight UTC
    expirationScheduler = cron.schedule('0 0 * * *', async () => {
        console.log('🗑️ Running trial NFT expiration check...');
        try {
            const expiredCount = await expireOldTrialNFTs();
            console.log(`✅ Trial NFT expiration completed: ${expiredCount} NFTs expired`);
        } catch (error) {
            console.error('❌ Error in trial NFT expiration scheduler:', error);
        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });

    console.log('✅ Trial NFT expiration scheduler started (runs daily at 00:00 UTC)');
};

/**
 * Start all NFT-related schedulers
 */
export const startTrialNFTSchedulers = () => {
    console.log('🚀 Starting NFT schedulers...');
    startTrialNFTExpirationScheduler(); // First: expire old trial NFTs
    startDailyNFTBonusScheduler();      // Second: process daily bonus
    console.log('✅ All NFT schedulers started');
    console.log('   - Trial NFT expiration: 00:00 UTC');
    console.log('   - Daily NFT holder bonus: 00:01 UTC');
};

/**
 * Stop the daily NFT bonus scheduler
 */
export const stopDailyNFTBonusScheduler = () => {
    if (dailyBonusScheduler) {
        dailyBonusScheduler.stop();
        dailyBonusScheduler = null;
        console.log('🛑 Daily NFT bonus scheduler stopped');
    }
};

/**
 * Stop the trial NFT expiration scheduler
 */
export const stopTrialNFTExpirationScheduler = () => {
    if (expirationScheduler) {
        expirationScheduler.stop();
        expirationScheduler = null;
        console.log('🛑 Trial NFT expiration scheduler stopped');
    }
};

/**
 * Stop all NFT schedulers
 */
export const stopTrialNFTSchedulers = () => {
    console.log('🛑 Stopping NFT schedulers...');
    stopTrialNFTExpirationScheduler();
    stopDailyNFTBonusScheduler();
    console.log('✅ All NFT schedulers stopped');
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
