import express from 'express';
import cors from 'cors';
import path from 'path';
import { Router } from './routes/routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import * as http from 'http';
import { configureSecurityMiddleware } from './middlewares/security';
import { handleReferralUrl } from './middlewares/referralMiddleware';
import './services/trackingService';
import './lib/validateEnvs';

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://disco.fan',
    'https://www.disco.fan'
];

// Cookie parser should come first to ensure cookies are parsed before any middleware uses them
app.use(cookieParser());

// CORS configuration - must come before other middleware
app.use(
    cors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true, // This is important for cookies
        maxAge: 86400 // Cache preflight request for 1 day
    })
);

// Apply security middleware
configureSecurityMiddleware(app);

// Body parsers and cookie handling
app.use(express.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ limit: "1gb", extended: true }));

// Initialize passport
app.use(passport.initialize());

// Handle referral URLs
app.use(handleReferralUrl);

// Static file serving
app.use(express.static(path.join(__dirname, '../../../uploads')));
app.use('/api/icons', express.static(path.join(__dirname, '../../../uploads')));

// API routes
app.use('/api', Router);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

export default app;
