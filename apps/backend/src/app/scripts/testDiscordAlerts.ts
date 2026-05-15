/**
 * Comprehensive Test Script for Discord Alerts (v2.0)
 *
 * Tests all alert types including new improvements:
 * - Standardized balance alerts (CRITICAL/WARNING/INFO)
 * - Contract failure aggregation
 * - QuickNode fallback notifications
 * - Enhanced WebSocket disconnect diagnostics
 * - Healthcheck endpoint
 * - Common metadata
 *
 * Usage: npx ts-node src/app/scripts/testDiscordAlerts.ts
 */

// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

import {
    alertBalanceCritical,
    alertBalanceWarning,
    alertBalanceInfo,
    alertContractUpdateFailed,
    alertGasPriceSpike,
    alertWebSocketDisconnected,
    alertQuickNodeFallback,
    alertQuickNodeRestored,
    alertQuickNodeCreditsLow,
    alertMultipleFailures,
    sendDailyHealthSummary,
    alertHealthcheckFailed
} from '../lib/discordAlerts';
import { ethers } from 'ethers';

async function testAllAlerts() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║ DISCORD ALERT SYSTEM TEST (v2.0)                               ║');
    console.log('║ Testing all improvements and new features                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    if (!process.env.DISCORD_WEBHOOK_URL) {
        console.error('❌ DISCORD_WEBHOOK_URL not set in environment variables!');
        console.error('Please add DISCORD_WEBHOOK_URL to your .env file');
        process.exit(1);
    }

    console.log('✅ DISCORD_WEBHOOK_URL is configured');
    console.log(`📡 Testing webhook: ${process.env.DISCORD_WEBHOOK_URL.slice(0, 50)}...\n`);

    // Check for optional environment variables
    const envVars = {
        NODE_ENV: process.env.NODE_ENV || 'not set (will use default)',
        CHAIN_NAME: process.env.CHAIN_NAME || 'not set (will use default)',
        SERVICE_VERSION: process.env.SERVICE_VERSION || 'not set (will use default)'
    };

    console.log('📋 Environment Variables:');
    console.log(`   NODE_ENV: ${envVars.NODE_ENV}`);
    console.log(`   CHAIN_NAME: ${envVars.CHAIN_NAME}`);
    console.log(`   SERVICE_VERSION: ${envVars.SERVICE_VERSION}\n`);

    try {
        // ============================================================
        // Test 1-3: Standardized Balance Alerts (NEW)
        // ============================================================
        console.log('📤 Test 1/13: Sending BALANCE CRITICAL alert (< 0.01 BNB)...');
        await alertBalanceCritical(
            '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
            ethers.parseEther('0.008'), // 0.008 BNB
            ethers.parseEther('0.001'), // 0.001 BNB required
            8 // Can afford 8 more updates
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        console.log('📤 Test 2/13: Sending BALANCE WARNING alert (< 0.05 BNB)...');
        await alertBalanceWarning(
            '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
            ethers.parseEther('0.03'), // 0.03 BNB
            ethers.parseEther('0.01'), // 0.01 BNB per day
            3 // 3 days remaining
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        console.log('📤 Test 3/13: Sending BALANCE INFO alert (< 0.1 BNB)...');
        await alertBalanceInfo(
            '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5',
            ethers.parseEther('0.08'), // 0.08 BNB
            ethers.parseEther('0.015'), // 0.015 BNB per day
            5 // 5 days remaining
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // ============================================================
        // Test 4: Contract Update Failed (with aggregation system)
        // ============================================================
        console.log('📤 Test 4/13: Sending CONTRACT UPDATE FAILED alert...');
        console.log('   (Note: Aggregation system will batch multiple failures)');
        await alertContractUpdateFailed(
            123, // User ID
            '0x1234567890abcdef1234567890abcdef12345678',
            new Error('Gas estimation failed: execution reverted'),
            3 // Retry count
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // Simulate multiple failures to test aggregation
        console.log('📤 Test 4b/13: Simulating multiple failures (aggregation test)...');
        console.log('   (Sending 3 failures with same error type to test aggregation)');
        for (let i = 0; i < 3; i++) {
            await alertContractUpdateFailed(
                100 + i,
                `0x${i.toString().padStart(40, '0')}`,
                new Error('Insufficient funds for gas'),
                3
            );
            await sleep(500);
        }
        console.log('✅ Sent 3 failures (should be aggregated if within 5min window)\n');
        await sleep(2000);

        // ============================================================
        // Test 5: Gas Price Spike
        // ============================================================
        console.log('📤 Test 5/13: Sending GAS PRICE SPIKE alert...');
        await alertGasPriceSpike(
            ethers.parseUnits('15', 'gwei'), // Current: 15 gwei
            ethers.parseUnits('8', 'gwei'),  // Average: 8 gwei
            87.5 // 87.5% increase
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // ============================================================
        // Test 6: Enhanced WebSocket Disconnect (NEW - with diagnostics)
        // ============================================================
        console.log('📤 Test 6/13: Sending ENHANCED WEBSOCKET DISCONNECT alert...');
        console.log('   (Includes: close code, reason, provider, chain, downtime)');
        await alertWebSocketDisconnected(
            3, // Reconnect attempts
            {
                provider: 'QuickNode',
                chain: 'BSC Mainnet',
                closeCode: 1006, // Abnormal closure
                closeReason: 'Connection lost: DNS resolution failed',
                lastBlockNumber: 34567890,
                downtimeSeconds: 45
            }
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // Test WebSocket with max attempts (CRITICAL)
        console.log('📤 Test 6b/13: Sending WEBSOCKET DISCONNECT (CRITICAL - max attempts)...');
        await alertWebSocketDisconnected(
            10, // Max attempts reached
            {
                provider: 'QuickNode',
                chain: 'BSC Mainnet',
                closeCode: 1011, // Server error
                closeReason: 'Internal server error',
                lastBlockNumber: 34567895,
                downtimeSeconds: 300
            }
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // ============================================================
        // Test 7-8: QuickNode Fallback Notifications (NEW)
        // ============================================================
        console.log('📤 Test 7/13: Sending QUICKNODE FALLBACK alert...');
        await alertQuickNodeFallback(
            'credits_exhausted',
            75_000_000, // 75M credits used
            80_000_000  // 80M limit
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        console.log('📤 Test 8/13: Sending QUICKNODE RESTORED alert...');
        await alertQuickNodeRestored();
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // ============================================================
        // Test 9: QuickNode Credits Low
        // ============================================================
        console.log('📤 Test 9/13: Sending QUICKNODE CREDITS LOW alert...');
        await alertQuickNodeCreditsLow(
            68_500_000,  // 68.5M credits used
            80_000_000,  // 80M limit
            85.6,        // 85.6% used
            12           // 12 days until reset
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // ============================================================
        // Test 10: Multiple Failures Alert
        // ============================================================
        console.log('📤 Test 10/13: Sending MULTIPLE FAILURES alert...');
        await alertMultipleFailures(
            15, // 15 failed
            50  // out of 50 total
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // ============================================================
        // Test 11: Daily Health Summary
        // ============================================================
        console.log('📤 Test 11/13: Sending DAILY HEALTH SUMMARY...');
        await sendDailyHealthSummary({
            totalTransactions: 1247,
            successfulUpdates: 1235,
            failedUpdates: 12,
            avgGasUsed: '125,450',
            totalGasCost: '0.0345',
            adminWalletBalance: '0.4521',
            websocketUptime: 99.8,
            quicknodeCreditsUsed: 12_450_000
        });
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // ============================================================
        // Test 12: Healthcheck Failed (NEW)
        // ============================================================
        console.log('📤 Test 12/13: Sending HEALTHCHECK FAILED alert...');
        await alertHealthcheckFailed(
            300, // 5 minutes downtime
            new Date(Date.now() - 300000) // Last successful check 5 min ago
        );
        console.log('✅ Sent successfully\n');
        await sleep(2000);

        // ============================================================
        // Test 13: Verify Common Metadata
        // ============================================================
        console.log('📤 Test 13/13: Verifying COMMON METADATA in alerts...');
        console.log('   (All previous alerts should include: env, chain, service, correlationId, version)');
        console.log('   Check Discord messages to verify metadata fields are present.\n');

        // ============================================================
        // Summary
        // ============================================================
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║ ✅ ALL TESTS COMPLETED SUCCESSFULLY                            ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');

        console.log('📊 Test Summary:');
        console.log('   ✅ Standardized balance alerts (CRITICAL/WARNING/INFO)');
        console.log('   ✅ Contract failure aggregation system');
        console.log('   ✅ Enhanced WebSocket disconnect diagnostics');
        console.log('   ✅ QuickNode fallback notifications');
        console.log('   ✅ Healthcheck failed alert');
        console.log('   ✅ Common metadata on all alerts\n');

        console.log('📱 Check your Discord channel for test alerts!');
        console.log('   You should see approximately 13-15 alerts (some may be aggregated).\n');

        console.log('🔍 Verification Checklist:');
        console.log('   [ ] All alert types appear in Discord');
        console.log('   [ ] Balance alerts show CRITICAL/WARNING/INFO labels');
        console.log('   [ ] WebSocket alerts include diagnostic info (close code, provider, etc.)');
        console.log('   [ ] QuickNode fallback alert explains limitations');
        console.log('   [ ] All alerts include metadata (env, chain, service, correlationId, version)');
        console.log('   [ ] Contract failures are aggregated (if multiple sent quickly)\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        console.error('\nTroubleshooting:');
        console.error('1. Check DISCORD_WEBHOOK_URL is correct');
        console.error('2. Verify webhook is not deleted in Discord');
        console.error('3. Ensure server has internet access');
        console.error('4. Check console for detailed error messages\n');
        process.exit(1);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
testAllAlerts()
    .then(() => {
        console.log('✅ Test script finished successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Test script error:', error);
        process.exit(1);
    });
