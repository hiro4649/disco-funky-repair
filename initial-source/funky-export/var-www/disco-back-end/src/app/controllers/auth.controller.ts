import { Request, Response } from "express";
import prisma from "../db/prisma_client";
import WalletSchema from "../validation/walletAddressValidate";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';

export class AuthController {
    // User signup/signin endpoint
    static async signup(req: Request, res: Response) {

        try {
            // Validate request body
            const validatedData = WalletSchema.parse(req.body);
            const { wallet_address } = validatedData;

            // Check if wallet address already exists
            let user = await prisma.user.findUnique({
                where: { wallet_address },
            });

            if (user) {
                await prisma.user.update({
                    where: {
                        wallet_address: user.wallet_address
                    },
                    data: {
                        updatedAt: new Date(new Date().toISOString().split('.')[0]+"Z")
                    }
                })
                // Ensure JWT_SECRET is defined
                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) {
                    // Handle the case where the JWT_SECRET is not set
                    return res.status(500).json({ message: "Internal server error: JWT secret is not set." });
                }
                const payload = { user_id: user.id, address: user.wallet_address };
                const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
                // Secure cookie settings to prevent XSS
                res.cookie('userAuth', token, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === 'production', // Only use secure in production
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Use lax in development
                    maxAge: 3600000 // 1 hour in milliseconds
                });
                
                return res.status(200).json({ success: true });
            } else {
                // User doesn't exist, create new user
                user = await prisma.user.create({
                    data: {
                        wallet_address,
                        level: 1,
                        experience: 0
                    }
                });

                // Process referral if referral code exists in cookies
                const referralCode = req.cookies.ref;
                if (referralCode) {
                    try {
                        // Import ReferralController dynamically to avoid circular dependency
                        const { ReferralController } = await import('./referral.controller');
                        
                        // Create a mock request for referral processing
                        const referralReq = {
                            body: {
                                wallet_address: wallet_address,
                                referral_code: referralCode
                            }
                        } as Request;
                        
                        const referralRes = {
                            status: (code: number) => ({
                                json: (data: any) => {
                                    if (code !== 200) {
                                        console.error('Referral processing failed:', data);
                                    } else {
                                        console.log('Referral processed successfully:', data);
                                    }
                                }
                            })
                        } as Response;

                        await ReferralController.processReferral(referralReq, referralRes);
                    } catch (error) {
                        console.error('Error processing referral during signup:', error);
                        // Don't fail the signup if referral processing fails
                    }
                }

                // Ensure JWT_SECRET is defined
                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) {
                    // Handle the case where the JWT_SECRET is not set
                    return res.status(500).json({ message: "Internal server error: JWT secret is not set." });
                }
                const payload = { user_id: user.id, address: user.wallet_address };
                const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
                // Secure cookie settings to prevent XSS
                res.cookie('userAuth', token, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === 'production', // Only use secure in production
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Use lax in development
                    maxAge: 3600000 // 1 hour in milliseconds
                });
                return res.status(201).json({ success: true });
            }

        } catch (err) {
            if (err instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: err.errors
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Admin login
    static async signin(req: Request, res: Response) {
        const { email, password } = req.body;


        try {
            const admin = await prisma.admin.findUnique({
                where: { email },
            });

            // Check if admin exists and password_hash is defined
            if (admin && admin.password_hash) {
                const matchPassword = await bcrypt.compare(password, admin.password_hash);

                if (!matchPassword) {
                    return res.status(401).json({ message: "Invalid credentials" });
                }

                // Ensure JWT_SECRET is defined
                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) {
                    // Handle the case where the JWT_SECRET is not set
                    return res.status(500).json({ message: "Internal server error: JWT secret is not set." });
                }

                // Sign the JWT token
                const token = jwt.sign(
                    { id: admin.id, email: admin.email }, // payload
                    jwtSecret, // secret key
                    { expiresIn: '1h' } // options
                );

                // Set the auth cookie with enhanced security settings
                res.cookie('adminAuth', token, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                    maxAge: 3600000 // 1 hour in milliseconds
                });
                // Respond with the signed token
                return res.status(200).json({ message: "Signin successful",success: true});
            } else {
                return res.status(404).json({ message: "Admin not found or password hash is undefined" });
            }
        } catch (error) {
            console.error("Error creating admin:", error);
            res.status(500).json({ message: "An error occurred while creating admin" });
        }
    }
    // Admin logout
    static async logout(req: Request, res: Response) {
        res.clearCookie('adminAuth', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });
        res.json({ success: true, message: 'Logged out' });
    }

    // User logout
    static async userLogout(req: Request, res: Response) {
        res.clearCookie('userAuth', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });
        res.json({ success: true, message: 'Logged out' });
    }
    
    // Refresh token endpoint
    static async refreshToken(req: Request, res: Response) {
        try {
            const token = req.cookies.userAuth;
            
            if (!token) {
                return res.status(401).json({ success: false, message: 'No token provided' });
            }
            
            // Ensure JWT_SECRET is defined
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                return res.status(500).json({ message: "Internal server error: JWT secret is not set." });
            }
            
            try {
                // Verify the existing token
                const decoded = jwt.verify(token, jwtSecret) as { user_id: number, address: string };
                
                // Check if the user still exists
                const user = await prisma.user.findUnique({
                    where: { id: decoded.user_id },
                });
                
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found' });
                }
                
                // Create a new token
                const payload = { user_id: user.id, address: user.wallet_address };
                const newToken = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
                
                // Set secure cookie with the new token
                res.cookie('userAuth', newToken, { 
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === 'production', // Only use secure in production
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Use lax in development
                    maxAge: 7200000 // 2 hours in milliseconds
                });
                
                return res.status(200).json({ success: true, token: newToken });
            } catch (err) {
                // Token verification failed
                return res.status(403).json({ success: false, message: 'Invalid token' });
            }
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // User verification endpoint
    static async verifyUser(req: Request, res: Response) {
        const token = req.cookies.userAuth;
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        try {
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                return res.status(500).json({ 
                    success: false,
                    message: 'Internal server error: JWT secret is not set.' 
                });
            }

            const decoded = jwt.verify(token, jwtSecret) as { user_id: number, address: string };
            
            // Verify user still exists in database
            const user = await prisma.user.findUnique({
                where: { id: decoded.user_id },
                select: {
                    id: true,
                    wallet_address: true,
                }
            });

            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }

            return res.status(200).json({ 
                success: true,
                user: {
                    user_id: user.id,
                    address: user.wallet_address,
                }
            });
        } catch (err) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
    }

    static async verifyAdmin(req: Request, res: Response) {
        const token = req.cookies.adminAuth;
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        try {
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                return res.status(500).json({ 
                    success: false,
                    message: 'Internal server error: JWT secret is not set.' 
                });
            }

            const decoded = jwt.verify(token, jwtSecret) as { id: number, email: string };
            
            // Verify admin still exists in database
            const admin = await prisma.admin.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    email: true,
                }
            });

            if (!admin) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Admin not found' 
                });
            }

            return res.status(200).json({ 
                success: true,
                admin: {
                    admin_id: admin.id,
                    email: admin.email,
                }
            });
        } catch (err) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }
    }
}