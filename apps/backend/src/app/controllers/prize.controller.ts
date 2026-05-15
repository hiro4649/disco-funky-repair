import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { number, symbol, TypeOf, z } from 'zod';
import prizeSchema from '../validation/prizeValidate';
import getTokenPrice from '../lib/getTokenPrice';
import moment from 'moment';
import { calculateTokenQuantity, fetchTokenBalance } from '../utils/tokenHeplers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';
import { randomUUID } from 'crypto';
import { ethers } from 'ethers';
import { getTransactionReceiptStatus, sendTokensToWallet } from '../utils/tokenHeplers';
import getDiscoNFTEVM from '../lib/getDiscoNFTEVM';
import { getTotalNFTCount } from '../lib/trialNftService';

enum Status {
    READY = 'READY',
    SENDING = 'SENDING',
    BROADCASTED = 'BROADCASTED',
    MANUAL_REVIEW = 'MANUAL_REVIEW',
    RECEIVED = 'RECEIVED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED'
}

const prisma = new PrismaClient();

const PRIZE_TRANSFER_AMOUNT_SCALE = 3;

const logPrizeTransferError = (
    message: string,
    correlationId: string,
    err: unknown,
    txHash?: string | null
) => {
    const errorName = err instanceof Error ? err.name : typeof err;
    console.error(message, {
        correlationId,
        errorName,
        hasTxHash: Boolean(txHash)
    });
};

const decimalNumberToParts = (value: number): { units: bigint; scale: number } => {
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error('Invalid positive decimal number');
    }

    const decimal = value.toString().includes('e')
        ? value.toFixed(20).replace(/\.?0+$/, '')
        : value.toString();

    if (!/^\d+(\.\d+)?$/.test(decimal)) {
        throw new Error('Invalid decimal format');
    }

    const [whole, fraction = ''] = decimal.split('.');
    const units = BigInt(`${whole}${fraction}`);
    if (units <= 0n) {
        throw new Error('Invalid decimal value');
    }

    return { units, scale: fraction.length };
};

const calculatePrizeTransferAmount = (
    quantity: number,
    price: number,
    decimals: number
): string => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Invalid prize quantity');
    }
    if (!Number.isInteger(decimals) || decimals < 0) {
        throw new Error('Invalid prize decimals');
    }

    const priceParts = decimalNumberToParts(price);
    const scaleFactor = 10n ** BigInt(priceParts.scale + PRIZE_TRANSFER_AMOUNT_SCALE);
    const numerator = BigInt(quantity) * scaleFactor;
    const denominator = priceParts.units;
    const roundedScaledAmount = (numerator + denominator / 2n) / denominator;

    if (decimals >= PRIZE_TRANSFER_AMOUNT_SCALE) {
        return (roundedScaledAmount * 10n ** BigInt(decimals - PRIZE_TRANSFER_AMOUNT_SCALE)).toString();
    }

    const divisor = 10n ** BigInt(PRIZE_TRANSFER_AMOUNT_SCALE - decimals);
    return ((roundedScaledAmount + divisor / 2n) / divisor).toString();
};

const parseStoredTransferAmount = (amount?: string | null): bigint | null => {
    if (!amount || !/^\d+$/.test(amount)) {
        return null;
    }

    const transferAmount = BigInt(amount);
    return transferAmount > 0n ? transferAmount : null;
};

const parseInventoryAmount = (amount: unknown): bigint | null => {
    if (amount === null || amount === undefined) {
        return null;
    }

    const text = typeof amount === 'string' ? amount : amount.toString();
    if (!/^\d+$/.test(text)) {
        return null;
    }

    return BigInt(text);
};

type PrizeCandidate = {
    id: number;
    ca: string;
    quantity: number;
    price: number;
    decimals: number;
    probability: number;
    real_probability: number;
    balance_amount: unknown;
    reserved_amount: unknown;
};

type EligiblePrizeCandidate = PrizeCandidate & {
    transferAmount: string;
    transferAmountValue: bigint;
    currentReservedAmount: string;
    nextReservedAmount: string;
};

const getEligiblePrizeCandidate = (prize: PrizeCandidate): EligiblePrizeCandidate | null => {
    if (!ethers.isAddress(prize.ca)) {
        return null;
    }

    const totalAmount = parseInventoryAmount(prize.balance_amount);
    const reservedAmount = parseInventoryAmount(prize.reserved_amount);
    if (totalAmount === null || reservedAmount === null) {
        return null;
    }

    const transferAmount = calculatePrizeTransferAmount(
        prize.quantity,
        prize.price,
        prize.decimals
    );
    const transferAmountValue = parseStoredTransferAmount(transferAmount);
    if (!transferAmountValue) {
        return null;
    }

    const availableAmount = totalAmount - reservedAmount;
    if (availableAmount < transferAmountValue) {
        return null;
    }

    return {
        ...prize,
        transferAmount,
        transferAmountValue,
        currentReservedAmount: reservedAmount.toString(),
        nextReservedAmount: (reservedAmount + transferAmountValue).toString()
    };
};

class PrizeInventoryRaceError extends Error {
    constructor() {
        super('Prize inventory reservation changed during draw');
    }
}

class PrizeInventoryDepletionError extends Error {
    constructor() {
        super('Prize inventory is lower than the confirmed transfer amount');
    }
}

class PrizeReservationReleaseError extends Error {
    constructor() {
        super('Prize reserved inventory is lower than the release amount');
    }
}

const releasePrizeReservation = async (
    tx: Prisma.TransactionClient,
    prizeTransactionId: number,
    prizeId: number,
    transferAmount: bigint
) => {
    const releaseUpdate = await tx.prizeTransactions.updateMany({
        where: {
            id: prizeTransactionId,
            reservation_released_at: null
        },
        data: {
            reservation_released_at: moment.utc().toDate()
        }
    });

    if (releaseUpdate.count === 1) {
        const inventoryUpdate = await tx.prize.updateMany({
            where: {
                id: prizeId,
                balance_amount: { gte: transferAmount.toString() },
                reserved_amount: { gte: transferAmount.toString() }
            },
            data: {
                balance_amount: {
                    decrement: transferAmount.toString()
                },
                reserved_amount: {
                    decrement: transferAmount.toString()
                }
            }
        });

        if (inventoryUpdate.count !== 1) {
            throw new PrizeInventoryDepletionError();
        }
    }
};

const releaseUnpaidPrizeReservation = async (
    tx: Prisma.TransactionClient,
    prizeTransactionId: number,
    prizeId: number,
    transferAmount: bigint,
    finalStatus: Status.EXPIRED | Status.CANCELLED | Status.FAILED
): Promise<boolean> => {
    const finalStatusValue = finalStatus as string;
    const releaseUpdate = await tx.prizeTransactions.updateMany({
        where: {
            id: prizeTransactionId,
            status: { in: [Status.READY, finalStatusValue] as any },
            tx_hash: null,
            reservation_released_at: null
        },
        data: {
            status: finalStatusValue as any,
            reservation_released_at: moment.utc().toDate()
        }
    });

    if (releaseUpdate.count !== 1) {
        return false;
    }

    const inventoryUpdate = await tx.prize.updateMany({
        where: {
            id: prizeId,
            reserved_amount: { gte: transferAmount.toString() }
        },
        data: {
            reserved_amount: {
                decrement: transferAmount.toString()
            }
        }
    });

    if (inventoryUpdate.count !== 1) {
        throw new PrizeReservationReleaseError();
    }

    return true;
};

type UnpaidReservationFinalStatus = Status.EXPIRED | Status.CANCELLED | Status.FAILED;

type UnpaidReservationFinalizeResult =
    | { status: 'FINALIZED' | 'ALREADY_RELEASED' }
    | { status: 'NOT_FOUND' | 'NOT_FINALIZABLE' | 'RACE' | 'MANUAL_REVIEW' };

const finalizeUnpaidPrizeReservation = async (
    prizeTransactionId: number,
    finalStatus: UnpaidReservationFinalStatus
): Promise<UnpaidReservationFinalizeResult> => {
    try {
        return await prisma.$transaction(async (tx) => {
            const prizeTransaction = await tx.prizeTransactions.findFirst({
                where: { id: prizeTransactionId },
                select: {
                    id: true,
                    prizeId: true,
                    status: true,
                    tx_hash: true,
                    transfer_amount: true,
                    reservation_released_at: true
                }
            });

            if (!prizeTransaction) {
                return { status: 'NOT_FOUND' as const };
            }

            const currentStatus = prizeTransaction.status as string;

            if (currentStatus === Status.RECEIVED) {
                return { status: 'NOT_FINALIZABLE' as const };
            }

            if (
                prizeTransaction.tx_hash ||
                currentStatus === Status.SENDING ||
                currentStatus === Status.BROADCASTED
            ) {
                await tx.prizeTransactions.update({
                    where: { id: prizeTransactionId },
                    data: { status: Status.MANUAL_REVIEW }
                });
                return { status: 'MANUAL_REVIEW' as const };
            }

            if (prizeTransaction.reservation_released_at) {
                return { status: 'ALREADY_RELEASED' as const };
            }

            if (currentStatus !== Status.READY && currentStatus !== finalStatus) {
                return { status: 'NOT_FINALIZABLE' as const };
            }

            const storedTransferAmount = parseStoredTransferAmount(prizeTransaction.transfer_amount);
            if (!storedTransferAmount) {
                await tx.prizeTransactions.update({
                    where: { id: prizeTransactionId },
                    data: { status: Status.MANUAL_REVIEW }
                });
                return { status: 'MANUAL_REVIEW' as const };
            }

            const released = await releaseUnpaidPrizeReservation(
                tx,
                prizeTransaction.id,
                prizeTransaction.prizeId,
                storedTransferAmount,
                finalStatus
            );

            return released
                ? { status: 'FINALIZED' as const }
                : { status: 'RACE' as const };
        });
    } catch (err) {
        if (err instanceof PrizeReservationReleaseError) {
            await prisma.prizeTransactions.update({
                where: { id: prizeTransactionId },
                data: { status: Status.MANUAL_REVIEW }
            });
            return { status: 'MANUAL_REVIEW' };
        }
        throw err;
    }
};

const isPrizeTransactionExpired = (endTime?: Date | string | null): boolean => {
    if (!endTime) {
        return false;
    }

    return moment.utc().isAfter(moment.utc(endTime));
};

interface User extends JwtPayload {
    address: string;
}

export class PrizeController {
    static async adminGetPrize(req: Request, res: Response) {
        try {
            const prizes = await prisma.prize.findMany({
                orderBy: [
                    {
                        balance: 'desc'
                    }
                ]
            });
            res.status(200).json({ data: prizes, success: true }); // Set status code to 200 for a successful response
        } catch (err) {
            res.status(500).json({
                error: 'An error occurred while fetching prizes.'
            }); // Send a meaningful error response
        }
    }

    static async getPrize(req: Request, res: Response) {
        try {
            const prizes = await prisma.prize.findMany({
                where: {
                    flag: true
                },
                orderBy: [
                    {
                        ranking: 'asc'
                    }
                ]
            });
            const returnData = await Promise.all(
                prizes.map(async (prize: typeof prizes[0]) => {
                    const tokenDetail = await prisma.tokenDetail.findUnique({
                        where: {
                            ca: prize.ca,
                        }
                    });
                    return {
                        ...prize,
                        tokenDetail: tokenDetail,
                    }
                })
            )

            res.status(200).json({ data: returnData, success: true }); // Set status code to 200 for a successful response
        } catch (err) {
            console.error('Error fetching prizes:', err); // Log the error for debugging
            res.status(500).json({
                error: 'An error occurred while fetching prizes.'
            }); // Send a meaningful error response
        }
    }

    static async editPrize(req: Request, res: Response) {
        try {
            const prizeId = Number(req.params.prize_id); // Ensure id is a number
            if (isNaN(prizeId)) {
                return res.status(400).json({ error: 'Invalid prize ID' });
            }
            const updatePrizeData = req.body;
            updatePrizeData.quantity = Number(req.body.quantity);
            updatePrizeData.real_probability = Number(req.body.real_probability);
            updatePrizeData.fake_probability = Number(req.body.fake_probability);
            updatePrizeData.earned_pts = Number(req.body.earned_pts);
            updatePrizeData.flag = req.body.flag === 'false' ? Boolean(false) : Boolean(true);
            updatePrizeData.dance = req.body.dance === 'false' ? Boolean(false) : Boolean(true);
            if (!updatePrizeData || Object.keys(updatePrizeData).length === 0) {
                return res.status(400).json({ error: 'No data provided for update' });
            }
            // Update prize in the database
            const updatedPrize = await prisma.prize.update({
                where: {
                    id: prizeId
                },
                data: updatePrizeData, // Use the actual data from the request body
            });
            res.status(200).json({ success: true, data: updatedPrize });
        } catch (err) {
            console.error(err); // Log the error for debugging
            res.status(404).json({ error: 'Prize not found or invalid data' });
        }
    }
    static async createNewPrize(req: Request, res: Response) {
        try {
            const prizeId = req.params.prize_id ? Number(req.params.prize_id) : null;

            if (prizeId && isNaN(prizeId)) {
                return res.status(400).json({ error: 'Invalid prize ID' });
            }

            let updatePrizeData: any;

            if (prizeId) {
                // Create new prize based on existing prize
                const prizeData = await prisma.prize.findUnique({
                    where: {
                        id: prizeId
                    }
                });

                updatePrizeData = {
                    ...prizeData
                };
                updatePrizeData.quantity = Number(req.body.quantity);
                updatePrizeData.real_probability = Number(req.body.real_probability);
                updatePrizeData.fake_probability = Number(req.body.fake_probability);
                updatePrizeData.earned_pts = Number(req.body.earned_pts);
                updatePrizeData.flag = req.body.flag === 'false' ? Boolean(false) : Boolean(true);
                updatePrizeData.dance = req.body.dance === 'false' ? Boolean(false) : Boolean(true);
                updatePrizeData.id = undefined;
            } else {
                // Create completely new prize
                updatePrizeData = {
                    ranking: Number(req.body.ranking) || 0,
                    token_name: req.body.tokenName || '',
                    symbol: req.body.symbol || '',
                    quantity: Number(req.body.price) || 0,
                    price: Number(req.body.price) || 0,
                    real_probability: Number(req.body.real_probability) || 0,
                    probability: Number(req.body.probability) || 0,
                    fake_probability: Number(req.body.fake_probability) || 0,
                    earned_pts: Number(req.body.earned_pts) || 0,
                    dance: req.body.dance === 'false' ? Boolean(false) : Boolean(true),
                    ca: req.body.ca || '',
                    telegram: req.body.telegram || '',
                    twitter: req.body.twitter || '',
                    listed_dex: req.body.listed_dex || '',
                    listed_DEX: req.body.listed_dex || '',
                    default_image: req.body.defaultImage || 'chain-logo.svg',
                    saved_probability: Number(req.body.real_probability) || 0,
                    flag: false,
                    balance: 0,
                    decimals: 18
                };

                // Handle file upload if present
                if (req.file) {
                    updatePrizeData.icon = req.file.filename;
                } else {
                    updatePrizeData.icon = updatePrizeData.default_image;
                }
            }

            if (!updatePrizeData || Object.keys(updatePrizeData).length === 0) {
                return res.status(400).json({ error: 'No data provided for update' });
            }

            // Create prize in the database
            const newPrize = await prisma.prize.create({
                data: updatePrizeData,
            });
            res.status(201).json({ success: true, data: newPrize });
        } catch (err) {
            console.error(err); // Log the error for debugging
            res.status(500).json({ error: 'Error creating prize' });
        }
    }
    static async getEditPrize(req: Request, res: Response) {
        const prize_id = req.params.prize_id;
        try {
            const data = await prisma.prize.findFirst({
                where: {
                    id: Number(prize_id)
                }
            });
            if (!data) {
                res.status(404).json({ error: 'Not found' });
            }
            res.status(200).json({ success: true, data: data });
        } catch (err) { }
    }

    static async deletePrize(req: Request, res: Response) {
        try {
            const prizeId = Number(req.params.prize_id);
            const deletePrize = await prisma.prize.delete({
                where: {
                    id: prizeId
                }
            });
            res.status(200).json({
                success: true,
                message: 'Prize deleted successfully'
            });
        } catch (err) {
            console.error('Error deleting prize:', err);
            res.status(500).json({
                message: 'An error occurred while deleting the prize'
            });
        }
    }

    static async drawPrize(req: Request, res: Response) {
        const userId = Number(req.params.user_id);
        try {
            const drawResult = await prisma.$transaction(async (tx) => {
                const user = await tx.user.findUnique({
                    where: { id: userId },
                });

                if (!user) {
                    return { status: 'USER_NOT_FOUND' as const };
                }

                if (Number(user.tickets) <= 0) {
                    return { status: 'NO_TICKET' as const };
                }

                const prizes = await tx.prize.findMany({
                    where: { flag: true }
                });

                const eligiblePrizes = prizes
                    .map((prize: typeof prizes[0]) => getEligiblePrizeCandidate(prize))
                    .filter((prize): prize is EligiblePrizeCandidate => prize !== null);

                if (eligiblePrizes.length === 0) {
                    return { status: 'NO_PRIZES' as const };
                }

                const bestPrizeCandidates = eligiblePrizes.reduce((best: EligiblePrizeCandidate[], current) => {
                    if (
                        best.length === 0 ||
                        current.probability > best[0].probability ||
                        (current.probability === best[0].probability && current.real_probability < best[0].real_probability)
                    ) {
                        return [current];
                    } else if (
                        current.probability === best[0].probability &&
                        current.real_probability === best[0].real_probability
                    ) {
                        best.push(current);
                    }
                    return best;
                }, []);

                const winningPrize = bestPrizeCandidates[Math.floor(Math.random() * bestPrizeCandidates.length)];
                if (!winningPrize) {
                    return { status: 'NO_WINNER' as const };
                }

                const ticketUpdate = await tx.user.updateMany({
                    where: { id: userId, tickets: { gt: 0 } },
                    data: {
                        tickets: {
                            decrement: 1
                        }
                    }
                });

                if (ticketUpdate.count !== 1) {
                    return { status: 'NO_TICKET' as const };
                }

                const reserveUpdate = await tx.prize.updateMany({
                    where: {
                        id: winningPrize.id,
                        reserved_amount: winningPrize.currentReservedAmount
                    },
                    data: {
                        reserved_amount: winningPrize.nextReservedAmount
                    }
                });

                if (reserveUpdate.count !== 1) {
                    throw new PrizeInventoryRaceError();
                }

                await tx.prizeTransactions.create({
                    data: {
                        prizeId: winningPrize.id,
                        userId: userId,
                        transfer_token_address: winningPrize.ca,
                        transfer_amount: winningPrize.transferAmount,
                        probability_time: moment.utc().toDate(),
                        end_time: moment.utc().add(24, 'hours').toDate()
                    }
                });

                return { status: 'SUCCESS' as const };
            });

            if (drawResult.status === 'USER_NOT_FOUND') {
                return res.status(404).json({ success: true, msg: 'User not found' });
            }

            if (drawResult.status === 'NO_TICKET') {
                return res.status(200).json({ ticket: false, msg: 'There are no Lottery Ticket' });
            }

            if (drawResult.status === 'NO_PRIZES') {
                return res.status(404).json({ msg: 'No Prizes found' });
            }

            if (drawResult.status === 'NO_WINNER') {
                return res.status(200).json({
                    success: false,
                    msg: 'Failed to determine a winner'
                });
            }

            return res.status(200).json({ success: true });
        } catch (err) {
            if (err instanceof PrizeInventoryRaceError) {
                return res.status(409).json({
                    success: false,
                    msg: 'Prize inventory changed during draw. Please try again.'
                });
            }
            console.error('Error drawing a lottery winner:', err); // Log the error for debugging
            return res.status(500).json({ error: 'Internal Server Error' }); // Send a meaningful error response
        }
    }

    static async withDrawPrizeToken(req: Request, res: Response) {
        const { userId, prizeId } = req.params;

        try {
            // Ensure userId and prizeId are valid numbers
            const userIdNum = Number(userId);
            const prizeIdNum = Number(prizeId);

            if (isNaN(userIdNum) || isNaN(prizeIdNum)) {
                return res.status(400).json({ msg: 'Invalid userId or prizeId' });
            }

            // Find user by userId
            const user = await prisma.user.findUnique({
                where: { id: userIdNum },
            });
            if (!user) return res.status(404).json({ msg: 'User not found' });

            // Find prize transaction by prizeId
            const prize = await prisma.prizeTransactions.findUnique({
                where: { id: prizeIdNum },
            });
            if (!prize) return res.status(404).json({ msg: 'Prize transaction not found' });

            return res.status(200).json({ msg: 'Prize token withdrawn successfully' });

        } catch (error) {
            console.error('Error withdrawing prize token:', error);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    }

    static async cancelPrizeTransaction(req: Request, res: Response) {
        const prizeId = Number(req.params.prize_id);

        if (Number.isNaN(prizeId)) {
            return res.status(400).json({ success: false, msg: 'Invalid prize transaction id' });
        }

        try {
            const result = await finalizeUnpaidPrizeReservation(prizeId, Status.CANCELLED);

            if (result.status === 'NOT_FOUND') {
                return res.status(404).json({ success: false, msg: 'Prize transaction not found' });
            }

            if (result.status === 'MANUAL_REVIEW') {
                return res.status(202).json({
                    success: false,
                    msg: 'Prize transaction requires manual review before cancellation.'
                });
            }

            if (result.status === 'NOT_FINALIZABLE' || result.status === 'RACE') {
                return res.status(409).json({
                    success: false,
                    msg: 'Prize transaction cannot be cancelled automatically.'
                });
            }

            return res.status(200).json({
                success: true,
                status: Status.CANCELLED
            });
        } catch (err) {
            console.error('Error cancelling prize transaction:', err);
            return res.status(500).json({ success: false, msg: 'Internal server error' });
        }
    }

    static async failPrizeTransaction(req: Request, res: Response) {
        const prizeId = Number(req.params.prize_id);

        if (Number.isNaN(prizeId)) {
            return res.status(400).json({ success: false, msg: 'Invalid prize transaction id' });
        }

        try {
            const result = await finalizeUnpaidPrizeReservation(prizeId, Status.FAILED);

            if (result.status === 'NOT_FOUND') {
                return res.status(404).json({ success: false, msg: 'Prize transaction not found' });
            }

            if (result.status === 'MANUAL_REVIEW') {
                return res.status(202).json({
                    success: false,
                    msg: 'Prize transaction requires manual review before marking failed.'
                });
            }

            if (result.status === 'NOT_FINALIZABLE' || result.status === 'RACE') {
                return res.status(409).json({
                    success: false,
                    msg: 'Prize transaction cannot be marked failed automatically.'
                });
            }

            return res.status(200).json({
                success: true,
                status: Status.FAILED
            });
        } catch (err) {
            console.error('Error marking prize transaction failed:', err);
            return res.status(500).json({ success: false, msg: 'Internal server error' });
        }
    }

    static async getPrizeTransactions(req: Request, res: Response) {
        try {
            const userId = Number(req.params.user_id);
            let prizeTransactions = await prisma.prizeTransactions.findMany({
                where: {
                    userId
                },
                orderBy: [
                    {
                        probability_time: 'desc'
                    }
                ],
                include: {
                    prize: {
                        select: {
                            token_name: true,
                            symbol: true,
                            quantity: true,
                            ca: true,
                            telegram: true,
                            earned_pts: true,
                            twitter: true,
                            icon: true,
                            default_image: true,
                            price: true,
                        }
                    }
                }
            });

            const expiredReadyTransactions = prizeTransactions.filter((transaction: typeof prizeTransactions[0]) => (
                transaction.status === Status.READY &&
                !transaction.tx_hash &&
                isPrizeTransactionExpired(transaction.end_time)
            ));

            if (expiredReadyTransactions.length > 0) {
                for (const transaction of expiredReadyTransactions) {
                    await finalizeUnpaidPrizeReservation(transaction.id, Status.EXPIRED);
                }

                prizeTransactions = await prisma.prizeTransactions.findMany({
                    where: {
                        userId
                    },
                    orderBy: [
                        {
                            probability_time: 'desc'
                        }
                    ],
                    include: {
                        prize: {
                            select: {
                                token_name: true,
                                symbol: true,
                                quantity: true,
                                ca: true,
                                telegram: true,
                                earned_pts: true,
                                twitter: true,
                                icon: true,
                                default_image: true,
                                price: true,
                            }
                        }
                    }
                });
            }

            if (!prizeTransactions) {
                res.status(404).json({
                    msg: 'No Prize Transactions found for this user'
                }); // Send a meaningful error response
            }

            if (prizeTransactions != null || undefined) {
                res.status(200).json({
                    data: prizeTransactions,
                    success: true
                }); // Set status code to 200 for a successful response
            }
        } catch (err) {
            console.error('Error fetching prize transactions:', err); // Log the error for debugging
            res.status(500).json({
                error: 'An error occurred while fetching prize transactions.'
            }); // Send a meaningful error response
        }
    }

    static async sendToWallet(req: Request, res: Response) {
        const correlationId = randomUUID();
        try {
            const token = req.cookies.userAuth;
            const prizeId = req.params.prize_id;
            const today = moment.utc().format("YYYY-MM-DD HH:mm");

            // Validate user token
            if (!token) {
                return res.status(401).json({ msg: "Unauthorized: Missing token" });
            }

            // Decode the JWT token to extract user details
            const decoded: any = jwtDecode(token);
            if (!decoded?.address) {
                return res.status(400).json({ msg: "Invalid token: Address not found" });
            }

            // Fetch the user by wallet address
            const user = await prisma.user.findUnique({
                where: { wallet_address: decoded.address.toLowerCase() },
            });
            if (!user) {
                return res.status(403).json({ msg: "User not found" });
            }

            // Fetch the prize transaction details
            const prizeTransaction = await prisma.prizeTransactions.findFirst({
                where: { id: Number(prizeId), userId: user.id },
                include: {
                    prize: {
                        select: { quantity: true, ca: true, price: true, decimals: true },
                    },
                },
            });

            if (!prizeTransaction) {
                return res.status(404).json({ msg: "Prize transaction not found" });
            }

            if (prizeTransaction.tx_hash) {
                try {
                    const receiptStatus = await getTransactionReceiptStatus(prizeTransaction.tx_hash);

                    if (receiptStatus === Status.RECEIVED) {
                        const storedTransferAmount = parseStoredTransferAmount(prizeTransaction.transfer_amount);
                        try {
                            await prisma.$transaction(async (tx) => {
                                if (storedTransferAmount) {
                                    await releasePrizeReservation(
                                        tx,
                                        prizeTransaction.id,
                                        prizeTransaction.prizeId,
                                        storedTransferAmount
                                    );
                                }
                                await tx.prizeTransactions.update({
                                    where: { id: Number(prizeId) },
                                    data: { status: receiptStatus },
                                });
                            });
                        } catch (releaseErr) {
                            if (releaseErr instanceof PrizeInventoryDepletionError) {
                                await prisma.prizeTransactions.update({
                                    where: { id: Number(prizeId) },
                                    data: { status: Status.MANUAL_REVIEW },
                                });
                                return res.status(202).json({
                                    success: false,
                                    msg: 'Prize transfer was confirmed but inventory requires manual review.',
                                    correlationId
                                });
                            }
                            throw releaseErr;
                        }
                        return res.status(200).json({ success: true, txHash: prizeTransaction.tx_hash });
                    }

                    await prisma.prizeTransactions.update({
                        where: { id: Number(prizeId) },
                        data: { status: receiptStatus },
                    });

                    return res.status(202).json({
                        success: false,
                        msg: 'Prize transfer is already broadcasted and is awaiting confirmation.',
                        status: receiptStatus,
                        correlationId
                    });
                } catch (receiptErr) {
                    logPrizeTransferError(
                        'Prize transfer receipt check failed',
                        correlationId,
                        receiptErr,
                        prizeTransaction.tx_hash
                    );
                    await prisma.prizeTransactions.update({
                        where: { id: Number(prizeId) },
                        data: { status: Status.MANUAL_REVIEW },
                    });
                    return res.status(202).json({
                        success: false,
                        msg: 'Prize transfer requires manual review.',
                        correlationId
                    });
                }
            }

            if (prizeTransaction.status !== Status.READY) {
                return res.status(409).json({
                    success: false,
                    msg: 'Prize transaction is not ready for transfer.',
                    status: prizeTransaction.status,
                    correlationId
                });
            }

            // Validate transaction timing
            const referenceTime = moment.utc(prizeTransaction.end_time).format("YYYY-MM-DD HH:mm");
            const todayMoment = moment.utc(today, "YYYY-MM-DD HH:mm");
            const referenceMoment = moment.utc(referenceTime, "YYYY-MM-DD HH:mm");

            if (todayMoment.isAfter(referenceMoment)) {
                const expirationResult = await finalizeUnpaidPrizeReservation(Number(prizeId), Status.EXPIRED);

                if (expirationResult.status === 'MANUAL_REVIEW') {
                    return res.status(202).json({
                        success: false,
                        msg: 'Expired prize transaction requires manual review.',
                        correlationId
                    });
                }

                if (expirationResult.status === 'RACE') {
                    return res.status(409).json({
                        success: false,
                        msg: 'Prize transaction changed during expiration handling.',
                        correlationId
                    });
                }

                return res.status(410).json({
                    success: false,
                    msg: 'Prize transaction has expired.',
                    status: Status.EXPIRED,
                    correlationId
                });
            }

            const tokenAmountInSmallestUnit = parseStoredTransferAmount(prizeTransaction.transfer_amount);
            const coinType = prizeTransaction.transfer_token_address;

            if (!tokenAmountInSmallestUnit || !coinType || !ethers.isAddress(coinType)) {
                await prisma.prizeTransactions.update({
                    where: { id: Number(prizeId) },
                    data: { status: Status.MANUAL_REVIEW },
                });
                return res.status(202).json({
                    success: false,
                    msg: 'Prize transfer snapshot is missing or invalid and requires manual review.',
                    correlationId
                });
            }

            const sendingUpdate = await prisma.prizeTransactions.updateMany({
                where: {
                    id: Number(prizeId),
                    userId: user.id,
                    status: Status.READY,
                    tx_hash: null
                },
                data: { status: Status.SENDING },
            });

            if (sendingUpdate.count !== 1) {
                return res.status(409).json({
                    success: false,
                    msg: 'Prize transaction is not ready for transfer.',
                    correlationId
                });
            }

            let txHash: string | null = null;

            // Send tokens to the user's wallet using EVM with balance check and detailed errors
            try {
                txHash = await sendTokensToWallet(user.wallet_address, tokenAmountInSmallestUnit, coinType);
                if (!txHash || typeof txHash !== 'string') {
                    await prisma.prizeTransactions.update({
                        where: { id: Number(prizeId) },
                        data: { status: Status.MANUAL_REVIEW },
                    });
                    return res.status(202).json({
                        success: false,
                        msg: 'Prize transfer requires manual review.',
                        correlationId
                    });
                }
                try {
                    await prisma.$transaction(async (tx) => {
                        await releasePrizeReservation(
                            tx,
                            prizeTransaction.id,
                            prizeTransaction.prizeId,
                            tokenAmountInSmallestUnit
                        );
                        await tx.prizeTransactions.update({
                            where: { id: Number(prizeId) },
                            data: { status: Status.RECEIVED, tx_hash: txHash },
                        });
                    });
                } catch (releaseErr) {
                    if (releaseErr instanceof PrizeInventoryDepletionError) {
                        await prisma.prizeTransactions.update({
                            where: { id: Number(prizeId) },
                            data: {
                                status: Status.MANUAL_REVIEW,
                                tx_hash: txHash
                            },
                        });
                        return res.status(202).json({
                            success: false,
                            msg: 'Prize transfer was confirmed but inventory requires manual review.',
                            correlationId
                        });
                    }
                    throw releaseErr;
                }

                // Return success response
                return res.status(200).json({ success: true, txHash });
            } catch (transferErr: any) {
                const broadcastTxHash = txHash || (typeof transferErr?.txHash === 'string' ? transferErr.txHash : null);
                logPrizeTransferError(
                    'Prize transfer failed',
                    correlationId,
                    transferErr,
                    broadcastTxHash
                );

                if (broadcastTxHash) {
                    await prisma.prizeTransactions.update({
                        where: { id: Number(prizeId) },
                        data: {
                            status: Status.MANUAL_REVIEW,
                            tx_hash: broadcastTxHash
                        },
                    });
                    return res.status(202).json({
                        success: false,
                        msg: 'Prize transfer was broadcasted and requires manual review.',
                        correlationId
                    });
                }

                await prisma.prizeTransactions.updateMany({
                    where: {
                        id: Number(prizeId),
                        userId: user.id,
                        status: Status.SENDING,
                        tx_hash: null
                    },
                    data: { status: Status.READY },
                });
                return res.status(400).json({
                    success: false,
                    msg: 'Prize transfer could not be started.',
                    correlationId
                });
            }
        } catch (err) {
            logPrizeTransferError('Error in sendToWallet', correlationId, err);

            // Handle unexpected errors gracefully
            return res.status(500).json({ msg: "Internal server error", correlationId });
        }
    }

    static async distributeTicketToAllUser(req: Request, res: Response) {
        try {
            // Fetch all users
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    wallet_address: true,
                },
            });

            const now = moment.utc();
            const startOfDay = now.clone().startOf('day').toDate();
            const endOfDay = now.clone().endOf('day').toDate();

            await Promise.all(
                users.map(async ({ id, wallet_address }: { id: number, wallet_address: string }) => {
                    try {
                        const Nfts = await getDiscoNFTEVM(wallet_address);

                        // Check if user already has a ticket
                        const todayTicket = await prisma.lotteryTickets.findFirst({
                            where: {
                                userId: id,
                                receivedDate: {
                                    gte: startOfDay,
                                    lte: endOfDay,
                                },
                            },
                        });

                        if (todayTicket) {
                            // Update today's ticket
                            if (Nfts > todayTicket.ticket) {
                                await prisma.lotteryTickets.update({
                                    where: { id: todayTicket.id },
                                    data: {
                                        ticket: todayTicket.ticket + Nfts, // Increment ticket count
                                        receivedDate: now.toDate(),
                                    },
                                });
                            }
                        } else {
                            // Add a new ticket for today
                            await prisma.lotteryTickets.create({
                                data: {
                                    userId: id,
                                    ticket: Nfts,
                                    receivedDate: now.toDate(),
                                },
                            });
                        }
                    } catch (error) {
                        console.error(`Error distributing ticket to user ${id}:`, error);
                    }
                })
            );

            res.status(200).json({ success: true, message: 'Tickets distributed successfully' });
        } catch (error) {
            console.error('Error distributing tickets:', error);
            res.status(500).json({ error: 'An error occurred while distributing tickets' });
        }
    }

}
