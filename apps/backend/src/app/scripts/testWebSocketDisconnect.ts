/**
 * Test Script for WebSocket Disconnect Alert
 *
 * This script tests the WebSocket disconnect alert by simulating a disconnection
 * Usage: npx ts-node src/app/scripts/testWebSocketDisconnect.ts
 */

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import { alertWebSocketDisconnected } from '../lib/discordAlerts';

async function testWebSocketDisconnectAlert() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║ WEBSOCKET DISCONNECT ALERT TEST                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    if (!process.env.DISCORD_WEBHOOK_URL) {
        console.error('❌ DISCORD_WEBHOOK_URL not set!');
        process.exit(1);
    }

    console.log('✅ Discord webhook configured');
    console.log('\n📤 Simulating WebSocket disconnect scenarios...\n');

    // Scenario 1: First disconnect attempt
    console.log('📤 Scenario 1: Initial disconnect (attempt 1/10)');
    await alertWebSocketDisconnected(1);
    console.log('✅ Alert sent\n');
    await sleep(2000);

    // Scenario 2: Failed reconnection attempt
    console.log('📤 Scenario 2: Reconnection failed (attempt 3/10)');
    await alertWebSocketDisconnected(3);
    console.log('✅ Alert sent\n');
    await sleep(2000);

    // Scenario 3: Multiple failures
    console.log('📤 Scenario 3: Multiple failures (attempt 7/10)');
    await alertWebSocketDisconnected(7);
    console.log('✅ Alert sent\n');
    await sleep(2000);

    // Scenario 4: Near max attempts
    console.log('📤 Scenario 4: Near max attempts (attempt 10/10)');
    await alertWebSocketDisconnected(10);
    console.log('✅ Alert sent\n');

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║ ✅ ALL WEBSOCKET DISCONNECT TESTS COMPLETED                    ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📱 Check your Discord channel for 4 WebSocket disconnect alerts!');
    console.log('   Each alert shows different reconnection attempt numbers.\n');
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run test
testWebSocketDisconnectAlert()
    .then(() => {
        console.log('✅ Test completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
