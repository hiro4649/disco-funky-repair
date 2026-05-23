/**
 * Test Script for Healthcheck Endpoint
 *
 * Tests the external healthcheck endpoint used for monitoring services
 * (UptimeRobot, Pingdom, etc.)
 *
 * Usage: npx ts-node src/app/scripts/testHealthcheck.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

async function testHealthcheck() {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║ HEALTHCHECK ENDPOINT TEST                                     ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const healthcheckUrl = `${API_BASE_URL}/api/monitoring/healthcheck`;

    console.log(`📡 Testing healthcheck endpoint: ${healthcheckUrl}\n`);

    try {
        const response = await fetch(healthcheckUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const status = response.status;
        const data = await response.json();

        console.log(`📊 Response Status: ${status}`);
        console.log(`📋 Response Data:`, JSON.stringify(data, null, 2));

        if (status === 200) {
            console.log('\n✅ Healthcheck PASSED - Service is healthy');
            console.log(`   Status: ${data.status}`);
            console.log(`   Services:`, data.services);
        } else if (status === 503) {
            console.log('\n⚠️  Healthcheck WARNING - Service is degraded');
            console.log(`   Status: ${data.status}`);
            console.log(`   Services:`, data.services);
            console.log(`   Message: ${data.message || 'N/A'}`);
        } else {
            console.log('\n❌ Healthcheck FAILED - Unexpected status code');
        }

        console.log('\n📋 For External Monitoring Setup:');
        console.log(`   URL: ${healthcheckUrl}`);
        console.log(`   Expected Status: 200 OK (healthy) or 503 (degraded)`);
        console.log(`   Recommended Interval: Every 5 minutes`);
        console.log(`   Alert Threshold: Alert if down for 5+ minutes\n`);

        console.log('💡 Monitoring Service Configuration:');
        console.log('   UptimeRobot: Add URL with 5-minute interval');
        console.log('   Pingdom: Add HTTP(S) check with 5-minute interval');
        console.log('   StatusCake: Add URL monitor with 5-minute interval\n');

    } catch (error) {
        console.error('\n❌ Healthcheck test FAILED:', error);
        console.error('\nTroubleshooting:');
        console.error('1. Ensure the server is running');
        console.error('2. Check API_BASE_URL is correct (default: http://localhost:8000)');
        console.error('3. Verify the endpoint is accessible');
        console.error('4. Check server logs for errors\n');
        process.exit(1);
    }
}

// Run test
testHealthcheck()
    .then(() => {
        console.log('✅ Healthcheck test finished');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Healthcheck test error:', error);
        process.exit(1);
    });
