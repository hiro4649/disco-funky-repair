import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { Router } from './routes/routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import * as http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { configureSecurityMiddleware } from './middlewares/security';
import { getCorsOrigins, getRequestBodyLimit } from './config/runtime';
import './lib/validateEnvs';
import './services/trackingService';

export const app = express();
export const server = http.createServer(app);

const allowedOrigins = getCorsOrigins();
const requestBodyLimit = getRequestBodyLimit();

// Initialize Socket.IO
export const io = new SocketIOServer(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// WebSocket connection logging for wallet data updates
io.on('connection', (socket) => {
    console.log(`🔌 Client connected to WebSocket: ${socket.id}`);
    console.log(`   Total connected clients: ${io.engine.clientsCount}`);

    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        console.log(`   Total connected clients: ${io.engine.clientsCount}`);
    });
});

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
app.use(express.json({ limit: requestBodyLimit }));
app.use(bodyParser.urlencoded({ limit: requestBodyLimit, extended: true }));

// Initialize passport
app.use(passport.initialize());

// Static file serving - use project root, not dist folder
// This ensures files are served from the same location where multer saves them
const uploadsPath = path.resolve(process.cwd(), 'uploads');
const imagesPath = path.resolve(uploadsPath, 'images');
console.log('📂 Static files served from:', uploadsPath);

// Ensure upload directories exist
if (!fs.existsSync(imagesPath)) {
    fs.mkdirSync(imagesPath, { recursive: true });
    console.log('📁 Created uploads/images directory');
}

app.use(express.static(uploadsPath));
app.use('/api/icons', express.static(uploadsPath));

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

export default app;
