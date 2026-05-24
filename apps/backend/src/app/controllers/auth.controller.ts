import { Request, Response } from "express";
import prisma from "../db/prisma_client";
import { Prisma } from "@prisma/client";
import moment from 'moment';
import { WalletNonceRequestSchema, WalletSignatureLoginSchema } from "../validation/walletAddressValidate";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { ETHERSCAN_API_URL, ETHERSCAN_API_KEY, TOKEN_CONTRACT_ADDRESS } from "../config/env";
import { etherscanRateLimiter } from "../utils/rateLimiter";
import { safeLogError } from "../utils/safeLogger";
import { createHash, randomBytes } from "crypto";
import { verifyMessage } from "ethers";

const WALLET_LOGIN_NONCE_TTL_MINUTES = 5;

const hashNonce = (nonce: string): string => createHash('sha256').update(nonce).digest('hex');

const normalizeDomain = (req: Request, requestedDomain?: string): string => {
    const origin = req.get('origin');
    const host = req.get('host');
    const rawDomain = (requestedDomain || origin || host || 'unknown').trim();

    try {
        const url = new URL(rawDomain.includes('://') ? rawDomain : `https://${rawDomain}`);
        return url.host.toLowerCase().slice(0, 255);
    } catch (_err) {
        const sanitized = rawDomain.replace(/[^a-zA-Z0-9:._-]/g, '').toLowerCase();
        return (sanitized || 'unknown').slice(0, 255);
    }
};

const normalizeChainId = (chainId?: string | number): string => {
    const rawChainId = String(chainId || process.env.CHAIN_ID || '56').trim();
    return /^\d+$/.test(rawChainId) ? rawChainId : '56';
};

const createWalletLoginMessage = ({
    walletAddress,
    nonce,
    issuedAt,
    expiresAt,
    domain,
    chainId
}: {
    walletAddress: string;
    nonce: string;
    issuedAt: string;
    expiresAt: string;
    domain: string;
    chainId: string;
}): string => [
    'DISCO.fan / FUNKY.fan wallet login',
    '',
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
    `Expires At: ${expiresAt}`,
    `Domain: ${domain}`,
    `Chain ID: ${chainId}`
].join('\n');

// Helper function to get token transactions from Etherscan with rate limiting
const getTokenTransactions = async (walletAddress: string, tokenAddress: string) => {
    try {
        // Wait for rate limit before making request
        await etherscanRateLimiter.waitForRateLimit();

        const url = `${ETHERSCAN_API_URL}&module=account&action=tokentx&contractaddress=${tokenAddress}&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === '1' && data.result) {
            return data.result;
        }

        return [];
    } catch (error) {
        safeLogError('auth_fetch_token_transactions', error, {
            walletAddressPrefix: walletAddress.slice(0, 10),
            tokenAddressPrefix: tokenAddress.slice(0, 10)
        });
        return [];
    }
};

export class AuthController {
    static async issueWalletNonce(req: Request, res: Response) {
        try {
            const validatedData = WalletNonceRequestSchema.parse(req.body);
            const walletAddress = validatedData.wallet_address.toLowerCase();
            const nonce = randomBytes(32).toString('hex');
            const issuedAt = moment.utc();
            const expiresAt = issuedAt.clone().add(WALLET_LOGIN_NONCE_TTL_MINUTES, 'minutes');
            const domain = normalizeDomain(req, validatedData.domain);
            const chainId = normalizeChainId(validatedData.chainId);
            const issuedAtIso = issuedAt.toISOString();
            const expiresAtIso = expiresAt.toISOString();
            const message = createWalletLoginMessage({
                walletAddress,
                nonce,
                issuedAt: issuedAtIso,
                expiresAt: expiresAtIso,
                domain,
                chainId
            });

            await prisma.walletLoginNonce.create({
                data: {
                    wallet_address: walletAddress,
                    nonce_hash: hashNonce(nonce),
                    message,
                    issued_at: issuedAt.toDate(),
                    expires_at: expiresAt.toDate()
                }
            });

            return res.status(200).json({
                success: true,
                wallet_address: walletAddress,
                nonce,
                message,
                issuedAt: issuedAtIso,
                expiresAt: expiresAtIso,
                domain,
                chainId
            });
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

    static async processReferral(walletAddress: string, referralCode: string) {
        try {
            // Find the referrer by referral code
            const referrer = await prisma.user.findUnique({
                where: { referral_code: referralCode }
            });

            if (!referrer) {
                return;
            }

            // Check if referral already exists
            const existingReferral = await prisma.referralRewards.findFirst({
                where: {
                    referrer_wallet: referrer.wallet_address,
                    referred_wallet: walletAddress
                }
            });

            if (existingReferral) {
                return;
            }

            // Create referral reward record with 7-day expiration
            const expiresAt = moment.utc().add(7, 'days').toDate();

            await prisma.referralRewards.create({
                data: {
                    referrer_wallet: referrer.wallet_address,
                    referred_wallet: walletAddress,
                    snapshot_verified: false,
                    rewarded: false,
                    expires_at: expiresAt
                }
            });
        } catch (error) {
            safeLogError('auth_process_referral', error, {
                hasReferralCode: Boolean(referralCode),
                walletAddressPrefix: walletAddress.slice(0, 10)
            });
        }
    }
    
    // User signup/signin endpoint
    static async signup(req: Request, res: Response) {

        try {
            // Validate request body
            const validatedData = WalletSignatureLoginSchema.parse(req.body);
            const wallet_address = validatedData.wallet_address.toLowerCase();

            let recoveredAddress: string;
            try {
                recoveredAddress = verifyMessage(validatedData.message, validatedData.signature).toLowerCase();
            } catch (_err) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid wallet signature"
                });
            }

            if (recoveredAddress !== wallet_address) {
                return res.status(401).json({
                    success: false,
                    message: "Wallet signature does not match wallet address"
                });
            }

            const nonceConsumed = await prisma.$transaction(async (tx) => {
                const now = moment.utc().toDate();
                const nonceRecord = await tx.walletLoginNonce.findFirst({
                    where: {
                        wallet_address,
                        message: validatedData.message
                    },
                    select: {
                        id: true,
                        expires_at: true,
                        used_at: true
                    }
                });

                if (!nonceRecord || nonceRecord.used_at || nonceRecord.expires_at <= now) {
                    return false;
                }

                const updateResult = await tx.walletLoginNonce.updateMany({
                    where: {
                        id: nonceRecord.id,
                        used_at: null,
                        expires_at: { gt: now }
                    },
                    data: {
                        used_at: now,
                        updated_at: now
                    }
                });

                return updateResult.count === 1;
            });

            if (!nonceConsumed) {
                return res.status(401).json({
                    success: false,
                    message: "Wallet login nonce is invalid, expired, or already used"
                });
            }

             // Check for referral code in request body or cookies
             const referralCode = req.body.referralCode || req.cookies?.ref;

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
                        updatedAt: moment.utc().toDate()
                    }
                })
                // Ensure JWT_SECRET is defined
                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) {
                    // Handle the case where the JWT_SECRET is not set
                    return res.status(500).json({ message: "Internal server error" });
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
                // User doesn't exist, create new user with referral if available
                const userData: any = {
                    wallet_address,
                    level: 1,
                    fan_points: 0
                };

                // Add referral if available
                if (referralCode) {
                    userData.referred_by = referralCode;
                }

                user = await prisma.user.create({
                    data: userData
                });

                // Fetch ALL token transactions for FIFO calculation
                const transactions = await getTokenTransactions(wallet_address, TOKEN_CONTRACT_ADDRESS);

                if (transactions && Array.isArray(transactions) && transactions.length > 0) {
                    const userId = user.id;
                    const currentTimeMs = Date.now();
                    const walletLower = wallet_address.toLowerCase();

                    // Separate incoming and outgoing transactions
                    const incomingTransactions = transactions.filter((tx: any) => {
                        const to = (tx.to || '').toLowerCase();
                        return to === walletLower;
                    });

                    const outgoingTransactions = transactions.filter((tx: any) => {
                        const from = (tx.from || '').toLowerCase();
                        const to = (tx.to || '').toLowerCase();
                        // Exclude self-transfers
                        return from === walletLower && to !== walletLower;
                    });

                    // Apply FIFO reduction (using the same logic as trackingTokenBalanceEthereum.ts)
                    const applyFIFOReduction = (purchases: any[], sales: any[]) => {
                        if (!purchases.length || !sales.length) {
                            return purchases;
                        }

                        const sortedPurchases = purchases
                            .map((tx: any) => {
                                const decimals = parseInt(tx.tokenDecimal || '18', 10);
                                return {
                                    ...tx,
                                    amount: parseFloat(tx.value) / Math.pow(10, decimals),
                                    timestamp: parseInt(tx.timeStamp, 10)
                                };
                            })
                            .sort((a: any, b: any) => a.timestamp - b.timestamp);

                        const sortedSales = sales
                            .map((tx: any) => {
                                const decimals = parseInt(tx.tokenDecimal || '18', 10);
                                return {
                                    ...tx,
                                    amount: parseFloat(tx.value) / Math.pow(10, decimals),
                                    timestamp: parseInt(tx.timeStamp, 10)
                                };
                            })
                            .sort((a: any, b: any) => a.timestamp - b.timestamp);

                        const remainingPurchases: any[] = [];
                        let purchaseIndex = 0;
                        let currentPurchase = { ...sortedPurchases[0] };

                        for (const sale of sortedSales) {
                            let remainingSaleAmount = sale.amount;

                            while (remainingSaleAmount > 0 && purchaseIndex < sortedPurchases.length) {
                                if (!currentPurchase || currentPurchase.amount === 0) {
                                    purchaseIndex++;
                                    if (purchaseIndex >= sortedPurchases.length) break;
                                    currentPurchase = { ...sortedPurchases[purchaseIndex] };
                                }

                                if (currentPurchase.amount <= remainingSaleAmount) {
                                    remainingSaleAmount -= currentPurchase.amount;
                                    currentPurchase.amount = 0;
                                    purchaseIndex++;
                                    if (purchaseIndex < sortedPurchases.length) {
                                        currentPurchase = { ...sortedPurchases[purchaseIndex] };
                                    }
                                } else {
                                    currentPurchase.amount -= remainingSaleAmount;
                                    remainingSaleAmount = 0;
                                }
                            }
                        }

                        if (currentPurchase && currentPurchase.amount > 0) {
                            remainingPurchases.push(currentPurchase);
                        }

                        for (let i = purchaseIndex + 1; i < sortedPurchases.length; i++) {
                            if (sortedPurchases[i].amount > 0) {
                                remainingPurchases.push(sortedPurchases[i]);
                            }
                        }

                        return remainingPurchases;
                    };

                    // Get FIFO-adjusted purchases
                    const fifoAdjustedPurchases = applyFIFOReduction(incomingTransactions, outgoingTransactions);

                    if (fifoAdjustedPurchases.length > 0) {
                        // Calculate weighted average on FIFO-adjusted amounts
                        let totalWeightedMinutes = 0;
                        let totalAmount = 0;

                        for (const purchase of fifoAdjustedPurchases) {
                            const purchaseTimeMs = purchase.timestamp * 1000;
                            const minutesHeld = Math.floor((currentTimeMs - purchaseTimeMs) / (1000 * 60));
                            const amount = purchase.amount; // FIFO-adjusted amount

                            totalWeightedMinutes += amount * minutesHeld;
                            totalAmount += amount;
                        }

                        // Calculate weighted average in days
                        let averageHoldingDays = 0;
                        if (totalAmount > 0) {
                            const averageMinutes = totalWeightedMinutes / totalAmount;
                            averageHoldingDays = averageMinutes / (60 * 24);
                        }

                        // Update user's holdingDate with FIFO-adjusted weighted average
                        await prisma.user.update({
                            where: { id: userId },
                            data: {
                                holdingDate: Math.floor(averageHoldingDays),
                                held_amount: averageHoldingDays
                            }
                        });

                        // Insert FIFO-adjusted purchase records with Decimal precision
                        const historyRecords = fifoAdjustedPurchases.map((purchase: any) => {
                            const purchaseDate = moment.unix(purchase.timestamp).utc().toDate();
                            // Convert float to Prisma Decimal for exact precision storage
                            const amountDecimal = new Prisma.Decimal(purchase.amount.toString());

                            return {
                                userId: userId,
                                tx_hash: purchase.hash,
                                purchase_amount: amountDecimal, // FIFO-adjusted amount as Decimal
                                purchase_date: purchaseDate
                            };
                        });

                        for (const record of historyRecords) {
                            try {
                                await prisma.holdDateHistory.upsert({
                                    where: {
                                        userId_tx_hash: {
                                            userId: userId,
                                            tx_hash: record.tx_hash
                                        }
                                    },
                                    create: record,
                                    update: {
                                        purchase_amount: record.purchase_amount,
                                        purchase_date: record.purchase_date
                                    }
                                });
                            } catch (error: any) {
                                if (error.code !== 'P2002') {
                                    safeLogError('auth_hold_date_history_upsert', error, {
                                        userId,
                                        hasTxHash: Boolean(record.tx_hash)
                                    });
                                }
                            }
                        }
                    }
                }

                // Process referral if code was provided
                if (referralCode) {
                    await this.processReferral(wallet_address, referralCode);
                }

                // Ensure JWT_SECRET is defined
                const jwtSecret = process.env.JWT_SECRET;
                if (!jwtSecret) {
                    // Handle the case where the JWT_SECRET is not set
                    return res.status(500).json({ message: "Internal server error" });
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
                    return res.status(500).json({ message: "Internal server error" });
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
                return res.status(200).json({ 
                    message: "Signin successful",
                    success: true
                });
            } else {
                return res.status(404).json({ message: "Admin not found or password hash is undefined" });
            }
        } catch (error) {
            safeLogError('admin_signin', error, { emailPresent: Boolean(email) });
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
                return res.status(500).json({ message: "Internal server error" });
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
                    message: 'Internal server error'
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
                    message: 'Internal server error'
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
