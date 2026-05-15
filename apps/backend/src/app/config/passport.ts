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
            console.log('No token found in cookies or Authorization header');
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
                console.log('User not found with id:', userId);
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
            console.error('JWT verification error:', jwtError);
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(403).json({ success: false, message: 'Authentication failed' });
    }
};

export const AuthAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check for token in cookies first
        let token = req.cookies.adminAuth;
        console.log('token', token, req.headers.authorization);

        // If no token in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            console.log('No admin token found in cookies or Authorization header');
            return res.status(401).json({ success: false, message: 'Unauthenticated' });
        }

        try {
            const decoded = jwt.verify(token, key) as Admin;
            
            const admin = await prisma.admin.findUnique({
                where: { email: decoded.email },
            });

            if (!admin) {
                console.log('Admin not found with email:', decoded.email);
                return res.status(403).json({ success: false, message: 'Admin not found' });
            }

            req.user = decoded;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
    } catch (err) {
        console.error('Authentication error:', err);
        return res.status(403).json({ success: false, message: 'Authentication failed' });
    }
};
