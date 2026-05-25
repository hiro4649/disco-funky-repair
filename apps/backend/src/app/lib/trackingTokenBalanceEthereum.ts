import prisma from '../db/prisma_client';
import { Prisma } from '@prisma/client';
import moment from 'moment';
import { TOKEN_CONTRACT_ADDRESS, ETHERSCAN_API_KEY, ETHERSCAN_API_URL } from '../config/env';
import { etherscanRateLimiter } from '../utils/rateLimiter';
import { tokenBalanceService } from './quicknodeRpcService';
import { safeLogError, safeLogWarn } from '../utils/safeLogger';
import { fetchJsonWithTimeout } from '../utils/externalCallTimeout';
const rewardAmount = 100;

type HoldDateSummaryData = {
    holdingDate: number;
    held_amount: number;
};

type HoldDateHistoryRow = {
    userId: number;
    tx_hash: string;
    purchase_amount: Prisma.Decimal;
    purchase_date: Date;
};

type HoldDatePersistenceClient = {
    $transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
};

// Add tickets to claim the user's claim tickets.
const handleUserTickets = async (userId: number, ticketCount: number) => {
    const now = moment.utc();
    const startOfDay = now.clone().startOf('day').toDate();
    const endOfDay = now.clone().endOf('day').toDate();

    try {

        const todayTicket = await prisma.lotteryTickets.findFirst({
            where: {
                userId: Number(userId),
                receivedDate: { gte: startOfDay.toISOString(), lte: endOfDay.toISOString() },
            },
        });

        if (todayTicket) {
            await prisma.lotteryTickets.update({
                where: { id: todayTicket.id },
                data: { ticket: { increment: ticketCount } },
            });
        } else {
            await prisma.lotteryTickets.create({
                data: {
                    userId: Number(userId),
                    ticket: ticketCount,
                    receivedDate: moment.utc().toDate()
                },
            });
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                claimTickets: {
                    increment: ticketCount
                }
            }
        });

        //The claim tickets will expire if not used within 14 days after they are distributed.
        const userTickets = await prisma.lotteryTickets.findMany({
            where: { userId: Number(userId) },
            orderBy: { receivedDate: 'desc' },
        });

        if (userTickets.length > 7) {
            // Keep only the 7 most recent tickets (since they're ordered by receivedDate desc)
            const ticketsToDelete = userTickets.slice(7);

            // Calculate the total ticket count to be removed
            const totalTicketsToRemove = ticketsToDelete.reduce((sum: number, ticket: typeof ticketsToDelete[0]) => sum + ticket.ticket, 0);

            // Log how many tickets will be deleted

            if (totalTicketsToRemove > 0) {
                // Delete each ticket record
                await Promise.all(
                    ticketsToDelete.map((ticket: typeof ticketsToDelete[0]) =>
                        prisma.lotteryTickets.delete({ where: { id: ticket.id } })
                    )
                );
                // Adjust the user's claimTickets and total tickets accordingly
                const currentUser = await prisma.user.findUnique({
                    where: { id: Number(userId) },
                    select: { claimTickets: true, tickets: true }
                });
                if (currentUser) {
                    if (currentUser.tickets < totalTicketsToRemove) {
                        await prisma.user.update({
                            where: { id: Number(userId) },
                            data: { tickets: 0 }
                        });
                    } else {
                        // Decrease the user's total tickets count
                        await prisma.user.update({
                            where: { id: Number(userId) },
                            data: {
                                tickets: {
                                    decrement: totalTicketsToRemove
                                }
                            }

                        });
                    }
                    // Decrease the user's total tickets count if there are tickets to remove

                }
            }
        }
    } catch (error) {
        safeLogError('handle_user_tickets', error, { userId });
    }
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_TOKEN_DECIMALS = 18;
const MAX_INT_FIELD_VALUE = 2147483647;

type FifoPurchase = {
    timestamp: number;
    amountBaseUnits: bigint;
    amount: string;
    hash: string;
    tokenDecimal: number;
};

type FifoSale = {
    timestamp: number;
    amountBaseUnits: bigint;
    tokenDecimal: number;
};

const parseTokenDecimals = (rawDecimals: unknown): number => {
    const decimals = parseInt(String(rawDecimals ?? DEFAULT_TOKEN_DECIMALS), 10);
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 77) {
        return DEFAULT_TOKEN_DECIMALS;
    }
    return decimals;
};

const parseBaseUnitValue = (rawValue: unknown): bigint => {
    const normalized = String(rawValue ?? '0').trim();
    if (!/^\d+$/.test(normalized)) {
        return 0n;
    }
    return BigInt(normalized);
};

const tokenDecimalsFactor = (decimals: number): bigint => (
    10n ** BigInt(parseTokenDecimals(decimals))
);

const tokenBaseUnitsToDecimalString = (
    amountBaseUnits: bigint,
    decimals: number = DEFAULT_TOKEN_DECIMALS
): string => {
    const safeDecimals = parseTokenDecimals(decimals);
    const sign = amountBaseUnits < 0n ? '-' : '';
    const absoluteAmount = amountBaseUnits < 0n ? -amountBaseUnits : amountBaseUnits;
    const amountText = absoluteAmount.toString();

    if (safeDecimals === 0) {
        return `${sign}${amountText}`;
    }

    if (amountText.length <= safeDecimals) {
        const fraction = amountText.padStart(safeDecimals, '0').replace(/0+$/, '');
        return fraction ? `${sign}0.${fraction}` : '0';
    }

    const whole = amountText.slice(0, -safeDecimals);
    const fraction = amountText.slice(-safeDecimals).replace(/0+$/, '');
    return fraction ? `${sign}${whole}.${fraction}` : `${sign}${whole}`;
};

const tokenBaseUnitsToNumber = (
    amountBaseUnits: bigint,
    decimals: number = DEFAULT_TOKEN_DECIMALS
): number => {
    const decimalText = tokenBaseUnitsToDecimalString(amountBaseUnits, decimals);
    return Number(decimalText);
};

const tokenWholeUnitsToBaseUnits = (
    amountTokens: number,
    decimals: number = DEFAULT_TOKEN_DECIMALS
): bigint => {
    if (!Number.isSafeInteger(amountTokens) || amountTokens <= 0) {
        return 0n;
    }
    return BigInt(amountTokens) * tokenDecimalsFactor(decimals);
};

const tokenNumberToBaseUnits = (
    amountTokens: number,
    decimals: number = DEFAULT_TOKEN_DECIMALS
): bigint => {
    if (!Number.isFinite(amountTokens) || amountTokens <= 0) {
        return 0n;
    }

    const fixed = amountTokens.toFixed(Math.min(parseTokenDecimals(decimals), 18));
    const [whole, fraction = ''] = fixed.split('.');
    const safeDecimals = parseTokenDecimals(decimals);
    const paddedFraction = fraction.padEnd(safeDecimals, '0').slice(0, safeDecimals);
    return BigInt(`${whole}${paddedFraction}`.replace(/^0+(?=\d)/, '') || '0');
};

const weightedAverageMinutesFromBaseUnits = (
    weightedMinutesNumerator: bigint,
    totalAmountBaseUnits: bigint
): number => {
    if (totalAmountBaseUnits <= 0n) {
        return 0;
    }

    const wholeMinutes = weightedMinutesNumerator / totalAmountBaseUnits;
    const remainder = weightedMinutesNumerator % totalAmountBaseUnits;
    const fractionalMicros = (remainder * 1_000_000n) / totalAmountBaseUnits;
    return Number(wholeMinutes) + Number(fractionalMicros) / 1_000_000;
};

const safeTicketCountFromBaseUnits = (
    amountBaseUnits: bigint,
    thresholdBaseUnits: bigint
): number => {
    if (thresholdBaseUnits <= 0n) {
        return 0;
    }

    const ticketCount = amountBaseUnits / thresholdBaseUnits;
    return ticketCount > BigInt(MAX_INT_FIELD_VALUE)
        ? MAX_INT_FIELD_VALUE
        : Number(ticketCount);
};

// Helper function to get token transactions using QuickNode RPC (with Etherscan fallback)
const getTokenTransactions = async (walletAddress: string, tokenAddress: string, hours: number = 24) => {
    try {

        // Use new QuickNode service with automatic Etherscan fallback
        const transactions = await tokenBalanceService.getTokenTransactions(walletAddress, hours);

        return transactions;
    } catch (error) {
        safeLogError('fetch_recent_token_transactions', error, {
            walletAddressPrefix: walletAddress.slice(0, 10),
            tokenAddressPrefix: tokenAddress.slice(0, 10),
            hours
        });
        return [];
    }
};

// Fetch the full token history for a wallet (handles pagination)
const fetchAllTokenTransactions = async (walletAddress: string, tokenAddress: string) => {
    const transactions: any[] = [];
    const offset = 1000;
    let page = 1;
    let hasMore = true;

    try {
        while (hasMore) {
            await etherscanRateLimiter.waitForRateLimit();

            const url = `${ETHERSCAN_API_URL}&module=account&action=tokentx&contractaddress=${tokenAddress}&address=${walletAddress}&page=${page}&offset=${offset}&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
            const data = await fetchJsonWithTimeout<any>(
                url,
                {},
                undefined,
                'etherscan_full_token_transactions'
            );

            if (data.status === '1' && Array.isArray(data.result) && data.result.length > 0) {
                transactions.push(...data.result);
                if (data.result.length < offset) {
                    hasMore = false;
                } else {
                    page += 1;
                }
            } else {
                hasMore = false;
            }
        }
    } catch (error) {
        safeLogError('fetch_all_token_transactions', error, {
            walletAddressPrefix: walletAddress.slice(0, 10),
            tokenAddressPrefix: tokenAddress.slice(0, 10),
            page
        });
    }

    return transactions;
};

// Calculate holding days from historical all token transactions
const calculateHoldingDaysFromHistory = (transactions: any[], thresholdAmount: number, walletAddress: string) => {
    if (!transactions.length || thresholdAmount <= 0) {
        return 0;
    }

    const walletLower = walletAddress.toLowerCase();
    const decimals = parseInt(transactions[0]?.tokenDecimal || '18', 10);
    const decimalsFactor = BigInt(10) ** BigInt(decimals);
    const thresholdWei = BigInt(Math.floor(thresholdAmount)) * decimalsFactor;

    let balance = BigInt(0);
    let holdingStart: number | null = null;
    let holdingDurationMs = 0;

    for (const tx of transactions) {
        const timestampMs = parseInt(tx.timeStamp, 10) * 1000;
        const from = (tx.from || '').toLowerCase();
        const to = (tx.to || '').toLowerCase();
        const value = BigInt(tx.value || '0');

        if (to === walletLower) {
            balance += value;
        }
        if (from === walletLower) {
            balance -= value;
        }

        if (balance >= thresholdWei && holdingStart === null) {
            holdingStart = timestampMs;
        } else if (balance < thresholdWei && holdingStart !== null) {
            holdingDurationMs += timestampMs - holdingStart;
            holdingStart = null;
        }
    }

    if (holdingStart !== null && balance >= thresholdWei) {
        holdingDurationMs += Date.now() - holdingStart;
    }

    return Math.floor(holdingDurationMs / MS_IN_DAY);
};

// Calculate minimum balance by analyzing transaction flow
export const calculateMinimumBalance = (
    currentBalanceBaseUnits: bigint,
    transactions: any[],
    walletAddress: string
): bigint => {
    let minBalance = currentBalanceBaseUnits;
    let runningBalance = currentBalanceBaseUnits;

    // Sort transactions by timestamp (newest first)
    const sortedTransactions = transactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));

    // If no transactions, the minimum balance is the current balance at the current time
    if (sortedTransactions.length === 0) {
        return currentBalanceBaseUnits > 0n ? currentBalanceBaseUnits : 0n;
    }

    for (const tx of sortedTransactions) {
        const value = parseBaseUnitValue(tx.value);

        if (tx.from.toLowerCase() === tx.to.toLowerCase()) {
            // Skip self-transfers
            continue;
        }

        // Determine if this is an incoming or outgoing transaction
        const isIncoming = tx.to.toLowerCase() === walletAddress.toLowerCase();

        if (isIncoming) {
            // Incoming transaction - subtract from running balance (going backwards in time)
            runningBalance -= value;
        } else {
            // Outgoing transaction - add to running balance (going backwards in time)
            runningBalance += value;
        }

        if (runningBalance < minBalance) {
            minBalance = runningBalance;
        }
    }

    return minBalance > 0n ? minBalance : 0n;
};

// Global flag to track if six-hour update is in progress
let isSixHourUpdateInProgress = 'inited';

// Six-hour token balance update function
export const processSixHourTokenBalance = async () => {
    if (isSixHourUpdateInProgress === 'processing') {
        return;
    }

    isSixHourUpdateInProgress = 'processing';

    try {
        const users = await prisma.user.findMany({
            select: {
                wallet_address: true,
                id: true,
                held_amount: true,
                held_updates: true,
                holdingDate: true
            }
        });

        if (!users.length) {
            return;
        }

        const now = moment.utc();
        const hourUTC = now.hours();

        const discoTokenAmount = await prisma.airdropTokens.findFirst({});
        const airdropDiscoAmount = discoTokenAmount?.balance ?? 10000;


        await Promise.all(
            users.map(async (user: any, index: number) => {
                try {
                    // Get current balance of user using QuickNode RPC (with Etherscan fallback)
                    const tokenBalanceBaseUnits = await tokenBalanceService.getTokenBalance(user.wallet_address);
                    const currentBalance = tokenBaseUnitsToNumber(tokenBalanceBaseUnits, DEFAULT_TOKEN_DECIMALS);

                    const holdData = await prisma.ownedToken.findUnique({
                        where: { userId: user.id },
                        select: {
                            dailyCheckTimes: true,
                            tallyTokenBalance: true,
                            sixHourTokenBalance: true
                        }
                    });

                    if ((hourUTC <= 3 && hourUTC >= 0) || (hourUTC >= 21 && hourUTC <= 23)) {
                        // 2. Get all transactions for last 24 hours
                        const transactions = await getTokenTransactions(user.wallet_address, TOKEN_CONTRACT_ADDRESS, 24);
                        // 3. Calculate minimum balance by analyzing transaction flow
                        const minBalanceBaseUnits = calculateMinimumBalance(
                            tokenBalanceBaseUnits,
                            transactions,
                            user.wallet_address
                        );
                        const minBalance = tokenBaseUnitsToNumber(minBalanceBaseUnits, DEFAULT_TOKEN_DECIMALS);
                        const requiredAirdropBaseUnits = tokenWholeUnitsToBaseUnits(
                            airdropDiscoAmount,
                            DEFAULT_TOKEN_DECIMALS
                        );

                        let tallyTokenBalance = holdData?.tallyTokenBalance ?? 0;

                        // 5. Update user's holding date if they have minimum required balance
                        if (requiredAirdropBaseUnits > 0n && minBalanceBaseUnits >= requiredAirdropBaseUnits) {

                            const heldAmount = user.held_amount + minBalance;
                            const tallyTokenBalanceBaseUnits = tokenNumberToBaseUnits(
                                tallyTokenBalance,
                                DEFAULT_TOKEN_DECIMALS
                            );
                            if (tallyTokenBalanceBaseUnits !== minBalanceBaseUnits) {
                                await prisma.user.update({
                                    where: { id: user.id },
                                    data: {
                                        held_amount: heldAmount,
                                        held_updates: { increment: minBalance - tallyTokenBalance }
                                    }
                                });
                            } else {
                                await prisma.user.update({
                                    where: { id: user.id },
                                    data: {
                                        held_amount: heldAmount,
                                    }
                                });
                            }
                        }

                        if ((holdData?.dailyCheckTimes || 0) >= 3) {
                            // 4. Update user's token balance record (excluding sixHourTokenBalance which is handled separately)
                            await prisma.ownedToken.upsert({
                                where: { userId: user.id },
                                create: {
                                    userId: user.id,
                                    tallyTokenBalance: minBalance,
                                    sixHourTokenBalance: 0,
                                    weeklyTokenBalance: minBalance,
                                    dailyCheckTimes: 0
                                },
                                update: {
                                    sixHourTokenBalance: 0,
                                    tallyTokenBalance: minBalance,
                                    weeklyTokenBalance: minBalance,
                                    dailyCheckTimes: 0
                                }
                            });

                            tallyTokenBalance = minBalance;
                        }

                        // 6. Calculate and distribute tickets based on minimum balance
                        const tallyTokenBalanceBaseUnits = tokenNumberToBaseUnits(
                            tallyTokenBalance,
                            DEFAULT_TOKEN_DECIMALS
                        );
                        if (
                            requiredAirdropBaseUnits > 0n &&
                            minBalanceBaseUnits >= requiredAirdropBaseUnits &&
                            tallyTokenBalanceBaseUnits >= requiredAirdropBaseUnits
                        ) {
                            const ticketCount = safeTicketCountFromBaseUnits(
                                minBalanceBaseUnits,
                                requiredAirdropBaseUnits
                            );
                            if (ticketCount > 0) {
                                await handleUserTickets(user.id, ticketCount);
                                const now = moment.utc().toDate();
                                // Check if user has a referral reward
                                const referral = await prisma.referralRewards.findFirst({
                                    where: {
                                        referred_wallet: user.wallet_address,
                                        rewarded: false,
                                        expires_at: {
                                            gt: now
                                        }
                                    }
                                });

                                if (!referral) return;

                                // Get referrer user
                                const referrerUser = await prisma.user.findUnique({
                                    where: { wallet_address: referral.referrer_wallet }
                                });

                                // Get referred user
                                const referredUser = await prisma.user.findUnique({
                                    where: { wallet_address: referral.referred_wallet }
                                });

                                // Check if referrer and referred user exist
                                if (!referrerUser || !referredUser) {
                                    safeLogWarn('referral_reward_user_missing', new Error('Referral reward user lookup failed'), {
                                        referralId: referral.id
                                    });
                                    return;
                                }

                                // Update referrer's fan_points by adding 100 fan points
                                // 
                                await prisma.user.update({
                                    where: { wallet_address: referral.referrer_wallet },
                                    data: {
                                        fan_points: { increment: rewardAmount }
                                    }
                                });

                                // Update referred user's fan_points by adding 100 fan points
                                await prisma.user.update({
                                    where: { wallet_address: referral.referred_wallet },
                                    data: {
                                        fan_points: { increment: rewardAmount }
                                    }
                                });

                                // Create point history records for referrer and referred user
                                await prisma.pointHistory.createMany({
                                    data: [
                                        {
                                            userId: referrerUser.id,
                                            reason: 4, // Referral bonus
                                            point: rewardAmount,
                                            receivedDate: moment.utc().toDate()
                                        },
                                        {
                                            userId: referredUser.id,
                                            reason: 4, // Referral bonus
                                            point: rewardAmount,
                                            receivedDate: moment.utc().toDate()
                                        }
                                    ]
                                });

                                // Mark referral reward as rewarded
                                await prisma.referralRewards.update({
                                    where: { id: referral.id },
                                    data: {
                                        rewarded: true,
                                        updated_at: moment.utc().toDate()
                                    }
                                });
                            }
                        }
                    } else {
                        if (currentBalance > (holdData?.tallyTokenBalance ?? 0)) {
                            // Update only the sixHourTokenBalance
                            await prisma.ownedToken.upsert({
                                where: { userId: user.id },
                                create: {
                                    userId: user.id,
                                    tallyTokenBalance: 0,
                                    sixHourTokenBalance: currentBalance,
                                    weeklyTokenBalance: 0,
                                    dailyCheckTimes: 0
                                },
                                update: {
                                    sixHourTokenBalance: currentBalance - (holdData?.tallyTokenBalance ?? 0),
                                    dailyCheckTimes: { increment: 1 }
                                }
                            });
                        } else {
                            await prisma.ownedToken.upsert({
                                where: { userId: user.id },
                                create: {
                                    userId: user.id,
                                    tallyTokenBalance: 0,
                                    sixHourTokenBalance: currentBalance,
                                    weeklyTokenBalance: 0,
                                    dailyCheckTimes: 0
                                },
                                update: {
                                    tallyTokenBalance: currentBalance,
                                    dailyCheckTimes: 0
                                }
                            });
                        }
                    }
                } catch (error) {
                    safeLogError('update_six_hour_token_balance_user', error, { userId: user.id });
                }
            })
        );


        // Log QuickNode credit usage and service health
        tokenBalanceService.logStatus();

        // Emit WebSocket event to notify frontend clients
        try {
            const { io } = await import('../index');
            io.emit('ticket-balance-updated', {
                timestamp: moment.utc().toISOString(),
                message: '6-hour token balance update completed',
                affectedUsers: users.length
            });
        } catch (error) {
            safeLogError('emit_ticket_balance_updated', error);
        }
    } catch (error) {
        safeLogError('process_six_hour_token_balance', error);
    } finally {
        isSixHourUpdateInProgress = 'finished';
        setTimeout(() => {
            isSixHourUpdateInProgress = 'inited';
        }, 1000 * 60 * 30 * 1);
    }
};

// Function to check if six-hour update is in progress
export const isSixHourUpdateRunning = () => {
    return isSixHourUpdateInProgress;
};

// Weekly bonus function (simplified from mode 3)
export const processWeeklyBonus = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                wallet_address: true,
                id: true
            }
        });

        if (!users.length) {
            return;
        }


        await Promise.all(
            users.map(async (user: any, index: number) => {
                try {
                    // Get current balance using QuickNode RPC (with Etherscan fallback)
                    const tokenBalanceBaseUnits = await tokenBalanceService.getTokenBalance(user.wallet_address);
                    const currentBalance = tokenBaseUnitsToNumber(tokenBalanceBaseUnits, DEFAULT_TOKEN_DECIMALS);

                    // Get existing token record
                    const existingToken = await prisma.ownedToken.findFirst({
                        where: { userId: user.id }
                    });

                    // Track the minimum token balance over the 6-day period
                    let newWeeklyBalance;

                    if (!existingToken?.weeklyTokenBalance) {
                        newWeeklyBalance = currentBalance;
                    } else if (currentBalance < existingToken.weeklyTokenBalance) {
                        newWeeklyBalance = currentBalance;
                    } else {
                        newWeeklyBalance = existingToken.weeklyTokenBalance;
                    }

                    // Update weekly token balance
                    await prisma.ownedToken.update({
                        where: { userId: user.id },
                        data: {
                            weeklyTokenBalance: newWeeklyBalance,
                            tallyTokenBalance: currentBalance
                        }
                    });

                    // Get tickets from last 7 days
                    const sixDaysAgo = moment.utc().subtract(6, 'days').startOf('day').toDate();

                    const ticketsFromLast6Days = await prisma.lotteryTickets.findMany({
                        where: {
                            userId: user.id,
                            receivedDate: {
                                gte: sixDaysAgo,
                                lte: moment.utc().toDate(),
                            },
                        },
                        orderBy: {
                            receivedDate: "desc",
                        }
                    });

                    if (ticketsFromLast6Days.length > 0) {
                        // Create an array of the last 7 days
                        const last7Days = [];
                        for (let i = 0; i <= 6; i++) {
                            const day = moment.utc().subtract(i, 'days').startOf('day').toDate();
                            last7Days.push(day.toISOString().split('T')[0]);
                        }

                        // Create a map of dates when tickets were received
                        const receivedDates = new Set();
                        for (const ticket of ticketsFromLast6Days) {
                            const ticketDate = moment.utc(ticket.receivedDate);
                            receivedDates.add(ticketDate.toISOString().split('T')[0]);
                        }

                        // Check if user received tickets on all 7 days
                        const hasTicketsEveryday = last7Days.every(date => receivedDates.has(date));

                        if (hasTicketsEveryday) {
                            // Find the smallest ticket value among the tickets
                            let smallestTicket = ticketsFromLast6Days[0].ticket;
                            for (const ticketEntry of ticketsFromLast6Days) {
                                if (ticketEntry.ticket < smallestTicket) {
                                    smallestTicket = ticketEntry.ticket;
                                }
                            }

                            await handleUserTickets(user.id, smallestTicket);
                        }
                    }
                } catch (error) {
                    safeLogError('process_weekly_bonus_user', error, { userId: user.id });
                }
            })
        );

    } catch (error) {
        safeLogError('process_weekly_bonus', error);
    }
};

// Apply FIFO (First In First Out) method to reduce purchases by sales
// Returns array of remaining purchases after applying all sales
export const applyFIFOReduction = (purchases: any[], sales: any[], walletAddress: string): FifoPurchase[] => {
    if (!purchases.length) {
        return [];
    }

    // Sort purchases by timestamp (oldest first)
    const sortedPurchases: FifoPurchase[] = purchases
        .map((tx: any) => {
            const decimals = parseTokenDecimals(tx.tokenDecimal);
            const amountBaseUnits = parseBaseUnitValue(tx.value);
            return {
                ...tx,
                amountBaseUnits,
                amount: tokenBaseUnitsToDecimalString(amountBaseUnits, decimals),
                tokenDecimal: decimals,
                timestamp: parseInt(tx.timeStamp, 10)
            };
        })
        .sort((a: any, b: any) => a.timestamp - b.timestamp);

    if (!sales.length) {
        return sortedPurchases;
    }

    // Sort sales by timestamp (oldest first)
    const sortedSales: FifoSale[] = sales
        .map((tx: any) => {
            const decimals = parseTokenDecimals(tx.tokenDecimal);
            return {
                ...tx,
                amountBaseUnits: parseBaseUnitValue(tx.value),
                tokenDecimal: decimals,
                timestamp: parseInt(tx.timeStamp, 10)
            };
        })
        .sort((a: any, b: any) => a.timestamp - b.timestamp);

    // Apply FIFO: Reduce oldest purchases first when sales occur
    const remainingPurchases: any[] = [];
    let purchaseIndex = 0;
    let currentPurchase = { ...sortedPurchases[0] };

    for (const sale of sortedSales) {
        let remainingSaleAmount = sale.amountBaseUnits;

        while (remainingSaleAmount > 0n && purchaseIndex < sortedPurchases.length) {
            if (!currentPurchase || currentPurchase.amountBaseUnits === 0n) {
                purchaseIndex++;
                if (purchaseIndex >= sortedPurchases.length) break;
                currentPurchase = { ...sortedPurchases[purchaseIndex] };
            }

            if (currentPurchase.amountBaseUnits <= remainingSaleAmount) {
                // This purchase is fully consumed by the sale
                remainingSaleAmount -= currentPurchase.amountBaseUnits;
                currentPurchase.amountBaseUnits = 0n;
                currentPurchase.amount = '0';
                purchaseIndex++;
                if (purchaseIndex < sortedPurchases.length) {
                    currentPurchase = { ...sortedPurchases[purchaseIndex] };
                }
            } else {
                // Partial reduction of this purchase
                currentPurchase.amountBaseUnits -= remainingSaleAmount;
                currentPurchase.amount = tokenBaseUnitsToDecimalString(
                    currentPurchase.amountBaseUnits,
                    currentPurchase.tokenDecimal
                );
                remainingSaleAmount = 0n;
            }
        }
    }

    // Collect remaining purchases (those not fully consumed)
    if (currentPurchase && currentPurchase.amountBaseUnits > 0n) {
        remainingPurchases.push(currentPurchase);
    }

    for (let i = purchaseIndex + 1; i < sortedPurchases.length; i++) {
        if (sortedPurchases[i].amountBaseUnits > 0n) {
            remainingPurchases.push(sortedPurchases[i]);
        }
    }

    return remainingPurchases;
};

// Calculate weighted average holding date (in days with decimal precision)
// Now uses FIFO-adjusted purchases
export const calculateWeightedAverageHoldingDate = (
    allTransactions: any[],
    walletAddress: string,
    currentTimeMs: number
) => {
    if (!allTransactions.length) {
        return { averageDays: 0, fifoAdjustedPurchases: [] };
    }

    const walletLower = walletAddress.toLowerCase();

    // Separate incoming and outgoing transactions
    const incomingTransactions = allTransactions.filter((tx: any) => {
        const to = (tx.to || '').toLowerCase();
        return to === walletLower;
    });

    const outgoingTransactions = allTransactions.filter((tx: any) => {
        const from = (tx.from || '').toLowerCase();
        const to = (tx.to || '').toLowerCase();
        // Exclude self-transfers
        return from === walletLower && to !== walletLower;
    });

    // Apply FIFO reduction
    const fifoAdjustedPurchases = applyFIFOReduction(
        incomingTransactions,
        outgoingTransactions,
        walletAddress
    );

    if (!fifoAdjustedPurchases.length) {
        return { averageDays: 0, fifoAdjustedPurchases: [] };
    }

    // Calculate weighted average on FIFO-adjusted amounts
    let totalWeightedMinutes = 0n;
    let totalAmountBaseUnits = 0n;

    for (const purchase of fifoAdjustedPurchases) {
        const purchaseTimeMs = purchase.timestamp * 1000;
        const minutesHeld = Math.floor((currentTimeMs - purchaseTimeMs) / (1000 * 60));
        const amountBaseUnits = purchase.amountBaseUnits; // FIFO-adjusted amount

        totalWeightedMinutes += amountBaseUnits * BigInt(Math.max(0, minutesHeld));
        totalAmountBaseUnits += amountBaseUnits;
    }

    if (totalAmountBaseUnits === 0n) {
        return { averageDays: 0, fifoAdjustedPurchases: [] };
    }

    // Calculate average in minutes, then convert to days with decimal precision
    const averageMinutes = weightedAverageMinutesFromBaseUnits(
        totalWeightedMinutes,
        totalAmountBaseUnits
    );
    const averageDays = averageMinutes / (60 * 24);

    return { averageDays, fifoAdjustedPurchases };
};

export const persistHoldDateRecalculation = async (
    prismaClient: HoldDatePersistenceClient,
    userId: number,
    summaryData: HoldDateSummaryData,
    historyRows: HoldDateHistoryRow[]
) => {
    await prismaClient.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: summaryData
        });

        await tx.holdDateHistory.deleteMany({
            where: { userId }
        });

        if (historyRows.length > 0) {
            await tx.holdDateHistory.createMany({
                data: historyRows,
                skipDuplicates: true
            });
        }
    });
};

export const checkingHoldingDateFromOnChain = async () => {
    try {
        const users = await prisma.user.findMany({
            select: {
                wallet_address: true,
                id: true
            }
        });

        if (!users.length) {
            return;
        }


        const currentTimeMs = Date.now();

        for (const user of users) {
            let historyRowCount = 0;
            try {
                // Fetch all token transactions
                const allTransactions = await fetchAllTokenTransactions(user.wallet_address, TOKEN_CONTRACT_ADDRESS);

                if (!allTransactions.length) {
                    continue;
                }

                // Calculate weighted average holding date with FIFO
                const { averageDays, fifoAdjustedPurchases } = calculateWeightedAverageHoldingDate(
                    allTransactions,
                    user.wallet_address,
                    currentTimeMs
                );

                // Handle edge case: user sold all tokens or has invalid data
                const safeAverageDays = isNaN(averageDays) || !isFinite(averageDays) ? 0 : averageDays;

                // Insert FIFO-adjusted purchases into HoldDateHistory
                // Convert float amounts to Prisma Decimal for exact precision storage
                const historyRecords = fifoAdjustedPurchases.map((purchase: any) => {
                    const purchaseDate = new Date(purchase.timestamp * 1000);
                    // Convert float to Decimal string with full precision
                    const amountDecimal = new Prisma.Decimal(purchase.amount.toString());

                    return {
                        userId: user.id,
                        tx_hash: purchase.hash,
                        purchase_amount: amountDecimal, // FIFO-adjusted amount as Decimal
                        purchase_date: purchaseDate
                    };
                });
                historyRowCount = historyRecords.length;

                await persistHoldDateRecalculation(
                    prisma,
                    user.id,
                    {
                        holdingDate: Math.floor(safeAverageDays),
                        held_amount: safeAverageDays // Store precise value for internal calculations
                    },
                    historyRecords
                );

            } catch (error) {
                safeLogError('update_holding_days_from_chain_user', error, {
                    userId: user.id,
                    historyRowCount
                });
            }
        }

    }
    catch (error) {
        safeLogError('checking_holding_date_from_on_chain', error);
    }
};

export default { processSixHourTokenBalance, processWeeklyBonus, isSixHourUpdateRunning };
