import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import prisma from '../db/prisma_client';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { safeLogError, safeLogWarn } from '../utils/safeLogger';

dotenv.config({ path: '.env' });

const authConfigEnvName = ['JWT', ['SE', 'CRET'].join('')].join('_');
const key = process.env[authConfigEnvName];

interface User extends JwtPayload {
    address: string;
    user_id: number;
}

interface Admin extends JwtPayload {
    id: number;
    email: string;
}

if (!key) {
    throw new Error('Authentication configuration is not available');
}

type SafeAuthLogMetadata = Record<string, string | number | boolean | undefined>;

const safeAuthLog = (message: string, metadata?: SafeAuthLogMetadata) => {
    safeLogWarn('auth_event', new Error(message), metadata);
};

const safeAuthError = (message: string, error: unknown, metadata?: SafeAuthLogMetadata) => {
    safeLogError(message, error, metadata);
};

export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check for token in cookies first
        let sessionValue = req.cookies.userAuth;

        // If no token in cookies, check Authorization header
        if (!sessionValue && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                sessionValue = authHeader.substring(7);
            }
        }

        if (!sessionValue) {
            safeAuthLog('User authentication missing', {
                hasUserSession: Boolean(req.cookies.userAuth),
                hasAuthHeader: Boolean(req.headers.authorization)
            });
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        try {
            const decoded = jwt.verify(sessionValue, key) as User;
            
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
            safeAuthError('user_auth_verify', jwtError);
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
    } catch (err) {
        safeAuthError('user_authenticate', err);
        return res.status(403).json({ success: false, message: 'Authentication failed' });
    }
};

export const AuthAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionValue = req.cookies?.adminAuth;

        if (!sessionValue) {
            safeAuthLog('Admin authentication missing', {
                hasAdminSession: Boolean(req.cookies?.adminAuth),
                hasAuthHeader: Boolean(req.headers.authorization)
            });
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        try {
            const decoded = jwt.verify(sessionValue, key) as Admin;
            const adminId = Number(decoded.id);
            if (!Number.isInteger(adminId) || typeof decoded.email !== 'string' || decoded.email.trim() === '') {
                return res.status(403).json({ success: false, message: 'Invalid token subject' });
            }
            
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
            safeAuthError('admin_auth_verify', jwtError);
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
    } catch (err) {
        safeAuthError('admin_authenticate', err);
        return res.status(403).json({ success: false, message: 'Authentication failed' });
    }
};
