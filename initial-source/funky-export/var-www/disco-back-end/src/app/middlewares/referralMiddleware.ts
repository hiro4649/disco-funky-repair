import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleReferralUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Check if this is a referral URL (format: /r/{referralCode}/)
        const referralMatch = req.path.match(/^\/r\/([a-zA-Z0-9]+)\/?$/);
        
        if (referralMatch) {
            const referralCode = referralMatch[1];
            
            // Verify the referral code exists
            const referralCodeRecord = await prisma.referralCode.findUnique({
                where: { code: referralCode }
            });
            
            if (referralCodeRecord) {
                // Set referral cookie with 7-day expiration
                const sevenDaysInSeconds = 60 * 60 * 24 * 7;
                res.cookie('ref', referralCode, {
                    path: '/',
                    maxAge: sevenDaysInSeconds * 1000, // Convert to milliseconds
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
                });
                
                console.log(`Referral cookie set for code: ${referralCode}`);
            } else {
                console.log(`Invalid referral code: ${referralCode}`);
            }
        }
        
        next();
    } catch (error) {
        console.error('Error in referral middleware:', error);
        next();
    }
}; 