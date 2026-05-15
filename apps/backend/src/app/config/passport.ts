import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import prisma from '../db/prisma_client';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

dotenv.config({ path: '.env' });

const key = process.env.JWT_SECRET;

interface User extends JwtPayload {
    address: string;
    user_id: number;
}

interface Admin extends JwtPayload {
    id: number;
    email: string;
}

if (!key) {
    throw new Error('JWT_SECRET environment variable not set');
}

type SafeAuthLogMetadata = Record<string, string | number | boolean | undefined>;

const safeAuthLog = (message: string, metadata?: SafeAuthLogMetadata) => {
    if (metadata && Object.keys(metadata).length > 0) {
        console.log(message, metadata);
        return;
    }

    console.log(message);
};

const safeAuthError = (message: string, error: unknown, metadata?: SafeAuthLogMetadata) => {
    const errorName = error instanceof Error ? error.name : typeof error;
    console.error(message, { ...(metadata || {}), errorName });
};

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check for token in cookies first
        let token = req.cookies.userAuth;

        // If no token in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            safeAuthLog('User authentication token missing', {
                cookiePresent: Boolean(req.cookies.userAuth),
                authorizationHeaderPresent: Boolean(req.headers.authorization)
            });
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        try {
            const decoded = jwt.verify(token, key) as User;
            
            const userId = Number(decoded.user_id);
            if (!Number.isInteger(userId)) {
                return res.status(403).json({ success: false, message: 'Invalid token subject' });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                safeAuthLog('Authenticated user not found', { userId });
                return res.status(403).json({ success: false, message: 'User not found' });
            }

            if (decoded.address && user.wallet_address.toLowerCase() !== decoded.address.toLowerCase()) {
                return res.status(403).json({ success: false, message: 'Invalid token subject' });
            }

            req.user = {
                ...decoded,
                user_id: user.id,
                address: user.wallet_address
            };
            next();
        } catch (jwtError) {
            safeAuthError('User JWT verification failed', jwtError);
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
    } catch (err) {
        safeAuthError('User authentication failed', err);
        return res.status(403).json({ success: false, message: 'Authentication failed' });
    }
};

export const AuthAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check for token in cookies first
        let token = req.cookies.adminAuth;

        // If no token in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            safeAuthLog('Admin authentication token missing', {
                cookiePresent: Boolean(req.cookies.adminAuth),
                authorizationHeaderPresent: Boolean(req.headers.authorization)
            });
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        try {
            const decoded = jwt.verify(token, key) as Admin;
            
            const admin = await prisma.admin.findUnique({
                where: { email: decoded.email },
            });

            if (!admin) {
                safeAuthLog('Authenticated admin not found', {
                    adminId: Number.isFinite(Number(decoded.id)) ? Number(decoded.id) : undefined,
                    emailPresent: Boolean(decoded.email)
                });
                return res.status(403).json({ success: false, message: 'Admin not found' });
            }

            req.user = decoded;
            next();
        } catch (jwtError) {
            safeAuthError('Admin JWT verification failed', jwtError);
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
    } catch (err) {
        safeAuthError('Admin authentication failed', err);
        return res.status(403).json({ success: false, message: 'Authentication failed' });
    }
};
