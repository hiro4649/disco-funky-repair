import cron from 'node-cron';
import { fetchDiscoTokenBalance } from '../lib/trackingTokenBalance';
import { setProbability, registerAllObjects } from '../lib/trackingTokens';
import WebSocket from 'ws';
import moment from 'moment-timezone';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const wss = new WebSocket.Server({ port: 5001 });

let currentCronJob: cron.ScheduledTask | null = null;
let currentCronJob2: cron.ScheduledTask | null = null;

export const setupDynamicCron = async () => {
    try {
        // Get the latest SetTicketDistribute record
        const latestSettings = await prisma.setTicketDistribute.findFirst({
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`latestSettings: ${JSON.stringify(latestSettings)}`);
        if (latestSettings) {
            // Stop existing cron jobs if they exist
            if (currentCronJob) {
                currentCronJob.stop();
            }
            if (currentCronJob2) {
                currentCronJob2.stop();
            }

            let cronExpression = '0 0 */6 * * *'; // Default expression checking schedule - every 5 minutes
            let cronExpression2 = '0 0 */6 * * *'; // Default expression checking schedule

            if (latestSettings.hour && latestSettings.hour !== 0) {
                if (latestSettings.hour < 4) {
                    // Convert hours to minutes for small values
                    const minutesInterval = (latestSettings.hour * 60) / 4;
                    cronExpression = `0 */${minutesInterval} * * * *`;
                } else {
                    const interval = latestSettings.hour / 4;
                    cronExpression = `0 0 */${interval} * * *`;
                }
                cronExpression2 = `0 0 */${latestSettings.hour} * * *`;
            } else if (latestSettings.day && latestSettings.day !== 0) {
                if (latestSettings.day < 4) {
                    // Convert days to hours for small values
                    const hoursInterval = (latestSettings.day * 24) / 4;
                    cronExpression = `0 0 */${hoursInterval} * * *`;
                } else {
                    const interval = latestSettings.day / 4;
                    cronExpression = `0 0 0 */${interval} * *`;
                }
                cronExpression2 = `0 0 0 */${latestSettings.day} * *`;
            } else if (latestSettings.minutes && latestSettings.minutes !== 0) {
                const interval = latestSettings.minutes / 4;
                cronExpression = `0 */${interval} * * * *`;
                cronExpression2 = `0 */${latestSettings.minutes} * * * *`;;
            }
            // Create new cron jobs
            console.log('cronExpression: ', cronExpression, 'cronExpression2: ', cronExpression2);
            currentCronJob = cron.schedule(cronExpression, async () => {
                // wss.clients.forEach((client) => {
                //     client.send("checkingDiscoTokenBalance");
                // });
                const currentTime = moment().utc().format('HH:mm:ss');
                console.log(`Running fetchDiscoTokenBalance at UTC time: ${currentTime}`);
                await fetchDiscoTokenBalance(1);
                // wss.clients.forEach((client) => {
                //     client.send("checkingDiscoTokenBalance: completed at " + currentTime);
                // });
            }, { timezone: 'UTC' });
            currentCronJob2 = cron.schedule(cronExpression2, async () => {
                const currentTime = moment().utc().format('HH:mm:ss');
                console.log(`Running Ticket Distribute at UTC time: ${currentTime}`);
                await fetchDiscoTokenBalance(2);
            }, { timezone: 'UTC' });
        }
    } catch (error) {
        console.error('Error setting up dynamic CRON:', error);
    }
}

// Initial setup
setupDynamicCron();

// Monitor for changes in SetTicketDistribute model
prisma.$use(async (params: any, next: any) => {
    const result = await next(params);
    if (params.model === 'SetTicketDistribute' && 
        ['create', 'update', 'delete'].includes(params.action)) {
        await setupDynamicCron();
    }
    console.log(`params========== ${JSON.stringify(params)}`);
    return result;
});
prisma.$use(async (params: any, next: any) => {
    const result = await next(params);
    if (params.model === 'AirdropTokens' && 
        ['create', 'update', 'delete'].includes(params.action)) {
        await setupDynamicCron();
    }
    console.log(`params========== ${JSON.stringify(params)}`);
    return result;
});

// WebSocket connection handling
// wss.on('connection', (ws) => {
//     console.log('WS Client connected ===========>', wss.address());

//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });

//     ws.on('error', (error) => {
//         console.error('WebSocket error:', error);
//     });
// });

// Weekly schedule for weekly task
const weeklyCronJob = cron.schedule('0 0 * * 1', async () => {
    const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    console.log(`Running Weekly Bonus Distribution at UTC time: ${currentTime}`);
    try {
        await fetchDiscoTokenBalance(3);
        console.log(`Weekly Bonus Distribution completed at ${currentTime}`);
    } catch (error) {
        console.error(`Error in Weekly Bonus Distribution at ${currentTime}:`, error);
    }
}, { timezone: "UTC" });

console.log('Weekly bonus cron job scheduled for every Monday at 00:00 UTC');

// Referral bonus check - run every 6 hours
const referralBonusCronJob = cron.schedule('*/30 * * * *', async () => {
    const currentTime = moment().utc().format('YYYY-MM-DD HH:mm:ss');
    console.log(`Running Referral Bonus Check at UTC time: ${currentTime}`);
    
    try {
        // Import ReferralController dynamically to avoid circular dependency
        console.log('Importing ReferralController...');
        const { ReferralController } = await import('../controllers/referral.controller');
        console.log('ReferralController imported successfully');
        
        // Create a mock request and response for the referral check
        const mockReq = {} as any;
        const mockRes = {
            status: (code: number) => ({
                json: (data: any) => {
                    if (code === 200) {
                        console.log(`Referral Bonus Check completed: ${data.message}`);
                    } else {
                        console.error(`Referral Bonus Check failed: ${data.message}`);
                    }
                }
            })
        } as any;
        
        console.log('Starting referral bonus check process...');
        await ReferralController.checkAndAwardReferralBonuses(mockReq, mockRes);
        console.log('Referral bonus check process completed successfully');
        
    } catch (error) {
        console.error(`Error in Referral Bonus Check at ${currentTime}:`, error);
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : 'No stack trace'
        });
    }
}, { timezone: "UTC" });

// Start the referral bonus cron job
referralBonusCronJob.start();
console.log('Referral bonus check cron job scheduled for every 6 hours and STARTED');

// Function to manually test referral bonus cron job (for immediate testing)
export const testReferralBonusCronJob = async () => {
    console.log('Manually testing referral bonus cron job...');
    try {
        const { ReferralController } = await import('../controllers/referral.controller');
        console.log('ReferralController imported successfully for manual test');
        
        const mockReq = {} as any;
        const mockRes = {
            status: (code: number) => ({
                json: (data: any) => {
                    if (code === 200) {
                        console.log(`Manual Referral Bonus Check completed: ${data.message}`);
                    } else {
                        console.error(`Manual Referral Bonus Check failed: ${data.message}`);
                    }
                }
            })
        } as any;
        
        await ReferralController.checkAndAwardReferralBonuses(mockReq, mockRes);
        console.log('Manual referral bonus check completed successfully');
        return true;
    } catch (error) {
        console.error('Error in manual referral bonus check:', error);
        return false;
    }
};

// Set probability of prize every custom interval
cron.schedule('*/30 * * * *', async () => {
    console.log('Setting probability');
    await setProbability();
}, { timezone: "UTC" });

// Start to track all token that hold admin wallet address every custom interval
cron.schedule('*/30 * * * *', async () => {
    await registerAllObjects();
}, { timezone: "UTC" });
