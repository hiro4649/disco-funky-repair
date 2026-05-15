import { Request, Response } from 'express';
import moment from 'moment';
import prisma from '../db/prisma_client';
import { generateRandomCode } from '../utils/ticketCodeGenerator';

// Utility function to check if a ticket code is expired (older than 30 days)
const isTicketCodeExpired = (createdAt: Date): boolean => {
    const thirtyDaysAgo = moment.utc().subtract(30, 'days').toDate();
    return createdAt < thirtyDaysAgo;
};

// Generate a new global ticket code (admin only)
export const generateGlobalTicketCode = async (req: Request, res: Response) => {
    try {
        // Generate unique ticket code
        let code: string;
        let isUnique = false;
        
        while (!isUnique) {
            code = generateRandomCode(10);
            const existingCode = await prisma.ticketCode.findUnique({
                where: { code }
            });
            if (!existingCode) {
                isUnique = true;
            }
        }
        // Create new global ticket code (wallet_address is empty for global codes)
        const ticketCode = await prisma.ticketCode.create({
            data: {
                wallet_address: '', // empty string means it's a global code
                code: code!,
                status: 'PENDING'
            }
        });
        res.status(201).json({
            success: true,
            message: 'Global ticket code generated successfully',
            data: ticketCode
        });
    } catch (error) {
        console.error('Error generating global ticket code:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all ticket codes with history (admin)
export const getAllTicketCodes = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        
        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { wallet_address: { contains: search as string, mode: 'insensitive' } },
                { code: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const [ticketCodes, total] = await Promise.all([
            prisma.ticketCode.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { created_at: 'desc' }
            }),
            prisma.ticketCode.count({ where })
        ]);

        // Get user information for each ticket code
        const ticketCodesWithUserInfo = await Promise.all(
            ticketCodes.map(async (ticketCode) => {
                let userInfo = null;
                if (ticketCode.wallet_address) {
                    const user = await prisma.user.findFirst({
                        where: { wallet_address: ticketCode.wallet_address },
                        select: { 
                            id: true,
                            tickets: true,
                            wallet_address: true
                        }
                    });
                    userInfo = user;
                }

                return {
                    ...ticketCode,
                    is_global: ticketCode.wallet_address === '',
                    claimed_by: userInfo ? {
                        id: userInfo.id,
                        wallet_address: userInfo.wallet_address,
                        current_tickets: userInfo.tickets
                    } : null
                };
            })
        );

        res.json({
            success: true,
            data: {
                ticketCodes: ticketCodesWithUserInfo,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching ticket codes:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Claim global ticket code (user)
export const claimTicketCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;
        const walletAddressInput = req.body.wallet_address;

        if (typeof code !== 'string' || !code || typeof walletAddressInput !== 'string' || !walletAddressInput) {
            return res.status(400).json({
                success: false,
                message: 'Code and wallet address are required'
            });
        }

        const wallet_address = walletAddressInput.toLowerCase();

        const claimResult = await prisma.$transaction(async (tx) => {
            const ticketCode = await tx.ticketCode.findUnique({
                where: { code }
            });

            if (!ticketCode) {
                return {
                    statusCode: 404,
                    body: {
                        success: false,
                        message: 'Invalid ticket code. Please check your code and try again.'
                    }
                };
            }

            if (ticketCode.status !== 'PENDING') {
                return {
                    statusCode: 400,
                    body: {
                        success: false,
                        message: 'Ticket code has already been claimed or expired'
                    }
                };
            }

            if (isTicketCodeExpired(ticketCode.created_at)) {
                await tx.ticketCode.updateMany({
                    where: {
                        id: ticketCode.id,
                        status: 'PENDING'
                    },
                    data: { status: 'EXPIRED' }
                });

                return {
                    statusCode: 400,
                    body: {
                        success: false,
                        message: 'Ticket code has expired'
                    }
                };
            }

            const user = await tx.user.findFirst({
                where: { wallet_address }
            });

            if (!user) {
                return {
                    statusCode: 404,
                    body: {
                        success: false,
                        message: 'User not found'
                    }
                };
            }

            const claimedAt = moment.utc().toDate();
            const ticketCodeUpdate = await tx.ticketCode.updateMany({
                where: {
                    id: ticketCode.id,
                    status: 'PENDING'
                },
                data: {
                    status: 'CLAIMED',
                    claimed_at: claimedAt,
                    wallet_address
                }
            });

            if (ticketCodeUpdate.count !== 1) {
                return {
                    statusCode: 400,
                    body: {
                        success: false,
                        message: 'Ticket code has already been claimed or expired'
                    }
                };
            }

            const updatedUser = await tx.user.update({
                where: { id: user.id },
                data: {
                    tickets: {
                        increment: 1
                    }
                },
                select: { tickets: true }
            });

            return {
                statusCode: 200,
                body: {
                    success: true,
                    message: 'Ticket code claimed successfully',
                    data: {
                        new_ticket_balance: updatedUser.tickets
                    }
                }
            };
        });

        return res.status(claimResult.statusCode).json(claimResult.body);
    } catch (error) {
        console.error('Error claiming ticket code:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get current global ticket code (for users)
export const getCurrentGlobalTicketCode = async (req: Request, res: Response) => {
    try {
        const globalTicketCode = await prisma.ticketCode.findFirst({
            where: {
                status: 'PENDING',
                wallet_address: '' // Global codes have empty wallet_address
            },
            orderBy: { created_at: 'desc' }
        });

        if (!globalTicketCode) {
            return res.status(404).json({
                success: false,
                message: 'No active global ticket code available'
            });
        }

        // Check if the ticket code is expired (older than 30 days)
        if (isTicketCodeExpired(globalTicketCode.created_at)) {
            // Update the status to EXPIRED
            await prisma.ticketCode.update({
                where: { id: globalTicketCode.id },
                data: { status: 'EXPIRED' }
            });

            return res.status(404).json({
                success: false,
                message: 'Current ticket code has expired'
            });
        }

        res.json({
            success: true,
            data: {
                code: globalTicketCode.code,
                created_at: globalTicketCode.created_at,
                expires_at: moment.utc(globalTicketCode.created_at).add(30, 'days').toDate() // 30 days from creation
            }
        });
    } catch (error) {
        console.error('Error fetching current global ticket code:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user's latest ticket code (any status)
export const getUserLatestTicketCode = async (req: Request, res: Response) => {
    try {
        const wallet_address = req.params.wallet_address.toLowerCase();

        const latestTicketCode = await prisma.ticketCode.findFirst({
            where: {
                wallet_address
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        if (!latestTicketCode) {
            return res.status(404).json({
                success: false,
                message: 'No ticket code found'
            });
        }

        // Check if the ticket code is PENDING and expired (older than 30 days)
        if (latestTicketCode.status === 'PENDING' && isTicketCodeExpired(latestTicketCode.created_at)) {
            // Update the status to EXPIRED
            const expiredTicketCode = await prisma.ticketCode.update({
                where: { id: latestTicketCode.id },
                data: { status: 'EXPIRED' }
            });

            return res.json({
                success: true,
                data: expiredTicketCode
            });
        }

        res.json({
            success: true,
            data: latestTicketCode
        });
    } catch (error) {
        console.error('Error fetching latest ticket code:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user's current ticket balance
export const getUserTicketBalance = async (req: Request, res: Response) => {
    try {
        const wallet_address = req.params.wallet_address.toLowerCase();

        const user = await prisma.user.findFirst({
            where: { wallet_address },
            select: { tickets: true }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                tickets: user.tickets
            }
        });
    } catch (error) {
        console.error('Error fetching user ticket balance:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
