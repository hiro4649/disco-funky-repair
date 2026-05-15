import "dotenv/config";
import http, { Server } from "http";
import app from "./app";
import { ConfigService } from "./config";
import { CronService } from "./app/services/cron.service";

// ConfigService.load();

function listenAsync(server: Server, port: number) {
    return new Promise((resolve, reject) => {
        server.listen(port)
            .once('listening', resolve)
            .once('error', reject);
    });
}

async function main() {
    console.log('Starting server.............');
    const server = http.createServer(app);

    const port = process.env.PORT && parseInt(process.env.PORT);
    
    // Start cron jobs for referral system
    CronService.startAllCronJobs();

    await listenAsync(server, port || 5000);
}

main().catch(err => console.error);