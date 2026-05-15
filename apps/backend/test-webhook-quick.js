// Quick Discord webhook test
require('dotenv').config();

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

if (!WEBHOOK_URL) {
    console.error('❌ DISCORD_WEBHOOK_URL not found in .env file!');
    process.exit(1);
}

console.log('✅ DISCORD_WEBHOOK_URL found in environment');
console.log('📡 Webhook URL:', WEBHOOK_URL.slice(0, 50) + '...');
console.log('\n📤 Sending test message to Discord...\n');

fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        embeds: [{
            title: '🎉 Discord Webhook Test',
            description: 'If you see this message, your Discord webhook is working correctly!',
            color: 65280, // Green
            fields: [
                { name: 'Status', value: '✅ Connected', inline: true },
                { name: 'Backend', value: '✅ Online', inline: true },
                { name: 'Test Time', value: new Date().toLocaleString(), inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'FUNKY RAVE Gas Fee Monitoring System'
            }
        }]
    })
})
.then(res => {
    if (res.ok) {
        console.log('✅ SUCCESS! Discord webhook is working!');
        console.log('📱 Check your Discord channel for the test message.');
        console.log('\n✨ You can now run the full test script:');
        console.log('   npx ts-node src/app/scripts/testDiscordAlerts.ts\n');
        process.exit(0);
    } else {
        console.error('❌ Discord API returned error:', res.status, res.statusText);
        process.exit(1);
    }
})
.catch(err => {
    console.error('❌ Failed to send Discord message:', err.message);
    console.error('\nPossible issues:');
    console.error('1. Webhook URL is incorrect');
    console.error('2. Webhook was deleted in Discord');
    console.error('3. No internet connection');
    process.exit(1);
});
