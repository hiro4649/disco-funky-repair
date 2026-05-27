import "dotenv/config";
import { Server } from "http";
import { server } from "./app";
import { CronService } from "./app/services/cron.service";
import { startTrialNFTSchedulers } from "./app/lib/trialNftScheduler";
import { startTrackingSchedulers } from "./app/services/trackingService";

function listenAsync(server: Server, port: number) {
    return new Promise((resolve, reject) => {
        server.listen(port)
            .once('listening', resolve)
            .once('error', reject);
    });
}

async function main() {
    console.log('Starting server.............');
    const port = process.env.PORT && parseInt(process.env.PORT);

    await listenAsync(server, port || 5000);
    console.log(`Server is running on port: ${port || 5000}`);

    // Start cron jobs after the single runtime entrypoint is listening.
    CronService.startAllCronJobs();
    startTrialNFTSchedulers();
    startTrackingSchedulers();
}

main().catch((err) => {
    const errorName = err instanceof Error ? err.name : typeof err;
    console.error('Failed to start server:', { errorName });
    process.exit(1);
});
