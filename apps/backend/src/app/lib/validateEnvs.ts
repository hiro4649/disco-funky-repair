import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'JWT_SECRET',
    'ADMIN_WALLET_ADDRESS',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.log(process.env[envVar]);
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}