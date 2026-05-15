import cron from 'node-cron';
import moment from 'moment';
import { PrismaClient } from '@prisma/client';
// import WebSocket from 'ws';
import { processSixHourTokenBalance, processWeeklyBonus } from '../lib/trackingTokenBalanceEthereum';
import { setProbability, registerAllEthereumTokens } from '../lib/trackingTokensEthereum';
import { updateHoldingDateMilestones } from '../lib/holdingDateService';
import { checkingHoldingDateFromOnChain } from '../lib/optimizedHoldingDateChecker';
import { startRealtimeEventListener } from '../lib/realtimeEventListener';
import { processScheduledTierUpdates, cleanupOldScheduledUpdates } from '../lib/tierScheduler';
import { updateAllUsersHoldingDuration } from '../lib/hourlyHoldingDurationUpdater';
import { walletBalanceMonitor } from '../lib/walletBalanceMonitor';

const prisma = new PrismaClient();
// const wss = new WebSocket.Server({ port: 5001 });

// Six-hour token balance update - runs every 6 hours
cron.schedule('0 */6 * * *', async () => {
    const currentTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    console.log(`Running six-hour token balance update at UTC time: ${currentTime}`);
    await processSixHourTokenBalance();
}, { timezone: "UTC" });
// ============================================================================
// DAILY BATCH FALLBACK SYSTEM (Safety Net at 22:00 UTC)
// ============================================================================
// NOTE: With the real-time event-driven system now active, this daily batch
// serves as a SAFETY NET to catch any users that were missed by real-time
// processing due to:
// - WebSocket connection issues
// - Transactions before real-time system deployment
// - Any edge cases or bugs
//
// The real-time system handles 99%+ of updates instantly. This batch only
// processes users whose database hasn't been updated recently (> 24 hours).
//
// IMPORTANT: You can disable this cron job entirely if you trust the real-time
// system. To disable, comment out the entire cron.schedule block below.
// ============================================================================

// RE-ENABLED: Safety net for WebSocket/Etherscan misses (catches missed transactions)
cron.schedule('0 22 * * *', async () => {
    const startTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║ DAILY BATCH FALLBACK (Safety Net)                             ║');
    console.log(`║ Started at: ${startTime} UTC                            ║`);
    console.log('║ NOTE: Real-time system handles most updates instantly         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    try {
        // STEP 1: Calculate holding dates for users NOT recently updated by real-time
        console.log('→ STEP 1/2: Checking for users missed by real-time system...');
        const calcStartTime = Date.now();

        // Only process users whose updatedAt is older than 24 hours
        // (Real-time system updates this field immediately)
        const oneDayAgo = moment.utc().subtract(24, 'hours').toDate();
        const staleUsers = await prisma.user.count({
            where: {
                updatedAt: {
                    lt: oneDayAgo
                },
                holdingDate: {
                    gt: 0
                }
            }
        });

        console.log(`Found ${staleUsers} users not updated by real-time system in last 24 hours`);

        if (staleUsers > 0) {
            await checkingHoldingDateFromOnChain();
            const calcDuration = ((Date.now() - calcStartTime) / 1000).toFixed(2);
            console.log(`✓ STEP 1 Complete (${calcDuration}s)\n`);

            // STEP 2: Update smart contract with fee tiers for fallback users
            console.log('→ STEP 2/2: Updating smart contract fee tiers for fallback users...');
            const contractStartTime = Date.now();
            await updateHoldingDateMilestones();
            const contractDuration = ((Date.now() - contractStartTime) / 1000).toFixed(2);
            console.log(`✓ STEP 2 Complete (${contractDuration}s)\n`);
        } else {
            console.log('✓ All users processed by real-time system. No fallback needed.\n');
        }

        const totalDuration = ((Date.now() - Date.parse(startTime)) / 1000).toFixed(2);
        const endTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');

        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║ DAILY FALLBACK CHECK COMPLETE                                 ║');
        console.log(`║ Completed at: ${endTime} UTC                         ║`);
        console.log(`║ Total duration: ${totalDuration}s                                      ║`);
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        const errorTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
        console.error('\n╔════════════════════════════════════════════════════════════════╗');
        console.error('║ ⚠️  DAILY FALLBACK FAILED                                      ║');
        console.error(`║ Failed at: ${errorTime} UTC                            ║`);
        console.error('╚════════════════════════════════════════════════════════════════╝');
        console.error('Error details:', error);
    }
}, { timezone: "UTC" });
// Weekly bonus schedule - runs every Monday at midnight UTC
// cron.schedule('0 0 * * 1', async () => {
//     const currentTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
//     console.log(`Running weekly bonus at UTC time: ${currentTime}`);
//     await processWeeklyBonus();
// }, { timezone: "UTC" });

// Set probability of prize every custom interval
cron.schedule('0 */8 * * *', async () => {
    console.log('Setting probability');
    await setProbability();
}, { timezone: "UTC" });

// Start to track all token that hold admin wallet address every custom interval
cron.schedule('0 1-23/8 * * *', async () => {
    await registerAllEthereumTokens();
}, { timezone: "UTC" });

// Expire old ticket codes daily at midnight UTC
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Running daily ticket code expiration check...');
        const thirtyDaysAgo = moment.utc().subtract(30, 'days').toDate();

        const expiredCount = await prisma.ticketCode.updateMany({
            where: {
                status: 'PENDING',
                created_at: {
                    lt: thirtyDaysAgo
                }
            },
            data: {
                status: 'EXPIRED'
            }
        });

        console.log(`Expired ${expiredCount.count} ticket codes older than 30 days`);
    } catch (error) {
        console.error('Error expiring old ticket codes:', error);
    }
}, { timezone: "UTC" });

// ============================================================================
// REAL-TIME HOLDING DATE SYSTEM (Event-Driven + Scheduled Updates)
// ============================================================================
// This provides near-instant fee tier updates by:
// 1. Real-Time Event Listener: Detects Transfer events via WebSocket
// 2. Scheduled Tier Updates: Processes tier boundary crossings hourly
// 3. Cleanup: Removes old scheduled updates daily
// ============================================================================

// Start real-time event listener for Transfer events
console.log('🚀 Starting real-time event listener...');
startRealtimeEventListener();

// Process scheduled tier updates every hour
cron.schedule('0 * * * *', async () => {
    const currentTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n⏰ Processing scheduled tier updates at ${currentTime}`);

    try {
        await processScheduledTierUpdates();
    } catch (error) {
        console.error('❌ Error processing scheduled tier updates:', error);
    }
}, { timezone: "UTC" });

// Cleanup old scheduled updates daily at 2 AM UTC
cron.schedule('0 2 * * *', async () => {
    const currentTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n🧹 Cleaning up old scheduled tier updates at ${currentTime}`);

    try {
        await cleanupOldScheduledUpdates();
    } catch (error) {
        console.error('❌ Error cleaning up old scheduled updates:', error);
    }
}, { timezone: "UTC" });

// ============================================================================
// HOURLY HOLDING DURATION UPDATE
// ============================================================================
// Calculates average holding duration for all users every hour
// Updates user.updatedAt timestamp for "Last updated" display on frontend
// Emits WebSocket event to refresh frontend my-wallet page in real-time
// ============================================================================

// Update average holding duration for all users every hour
cron.schedule('0 * * * *', async () => {
    const currentTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n⏰ Running hourly holding duration update at ${currentTime}`);

    try {
        await updateAllUsersHoldingDuration();
    } catch (error) {
        console.error('❌ Error updating hourly holding duration:', error);
    }
}, { timezone: "UTC" });

// ============================================================================
// DAILY ADMIN WALLET BALANCE CHECK (3 AM UTC)
// ============================================================================
// Monitors admin wallet balance and predicts when gas fees will be insufficient
// Sends Discord alerts proactively before running out of funds
// ============================================================================

// Check admin wallet balance daily at 3 AM UTC
cron.schedule('0 3 * * *', async () => {
    const currentTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    console.log(`\n💰 Running daily admin wallet balance check at ${currentTime}`);

    try {
        await walletBalanceMonitor.performDailyBalanceCheck();
    } catch (error) {
        console.error('❌ Error checking admin wallet balance:', error);
    }
}, { timezone: "UTC" });
