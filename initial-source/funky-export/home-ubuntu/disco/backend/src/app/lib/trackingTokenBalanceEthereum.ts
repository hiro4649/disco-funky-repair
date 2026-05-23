import prisma from '../db/prisma_client';
import { Prisma } from '@prisma/client';
import moment from 'moment';
import displayEthereumBalance from './displayEthereumBalance';
import { TOKEN_CONTRACT_ADDRESS, ETHERSCAN_API_KEY, ETHERSCAN_API_URL } from '../config/env';
import { etherscanRateLimiter } from '../utils/rateLimiter';
import { tokenBalanceService } from './quicknodeRpcService';
const rewardAmount = 100;

// Add tickets to claim the user's claim tickets.
const handleUserTickets = async (userId: number, ticketCount: number) => {
    const now = moment.utc();
    const startOfDay = now.clone().startOf('day').toDate();
    const endOfDay = now.clone().endOf('day').toDate();

    try {
        console.log("Handle User Tickets", 'userId: ', userId, 'ticketCount: ', ticketCount);

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
            console.log(`Deleting ${ticketsToDelete.length} old tickets for user ${userId}, removing ${totalTicketsToRemove} ticket points`);

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
                        console.log(`User ${userId} has only ${currentUser.tickets} total tickets, which is less than the ${totalTicketsToRemove} tickets to remove. Setting total tickets to 0.`);
                        await prisma.user.update({
                            where: { id: Number(userId) },
                            data: { tickets: 0 }
                        });
                    } else {
                        console.log(`User ${userId} has ${currentUser.tickets} total tickets. Proceeding to remove ${totalTicketsToRemove} tickets.`);
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
        console.error('Error handling user tickets:', error);
    }
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;

// Helper function to get token transactions using QuickNode RPC (with Etherscan fallback)
const getTokenTransactions = async (walletAddress: string, tokenAddress: string, hours: number = 24) => {
    try {
        console.log(`🔍 Fetching transactions for ${walletAddress.slice(0, 10)}... (last ${hours}h) via QuickNode RPC...`);

        // Use new QuickNode service with automatic Etherscan fallback
        const transactions = await tokenBalanceService.getTokenTransactions(walletAddress, hours);

        console.log(`✅ Retrieved ${transactions.length} transaction(s) for ${walletAddress.slice(0, 10)}...`);
        return transactions;
    } catch (error) {
        console.error('Error fetching token transactions:', error);
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
            const response = await fetch(url);
            const data = await response.json();

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
        console.error(`Error fetching full transaction history for ${walletAddress}:`, error);
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
const calculateMinimumBalance = (currentBalance: number, transactions: any[], walletAddress: string) => {
    let minBalance = currentBalance;
    let runningBalance = currentBalance;

    // Sort transactions by timestamp (newest first)
    const sortedTransactions = transactions.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));

    // If no transactions, the minimum balance is the current balance at the current time
    if (sortedTransactions.length === 0) {
        return Math.max(0, currentBalance);
    }

    for (const tx of sortedTransactions) {
        const value = parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal));

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

    return Math.max(0, minBalance);
};

// Global flag to track if six-hour update is in progress
let isSixHourUpdateInProgress = 'inited';

// Six-hour token balance update function
export const processSixHourTokenBalance = async () => {
    if (isSixHourUpdateInProgress === 'processing') {
        console.log('Six-hour token balance update already in progress, skipping...');
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
            console.log('No users found for six-hour token balance update.');
            return;
        }

        const now = moment.utc();
        const hourUTC = now.hours();

        const discoTokenAmount = await prisma.airdropTokens.findFirst({});
        const airdropDiscoAmount = discoTokenAmount?.balance ?? 10000;

        console.log(`Processing six-hour token balance update for ${users.length} users`);

        await Promise.all(
            users.map(async (user: any, index: number) => {
                try {
                    // Get current balance of user using QuickNode RPC (with Etherscan fallback)
                    console.log(`💰 Fetching balance for user ${user.id} (${user.wallet_address.slice(0, 10)}...) via QuickNode RPC...`);
                    const tokenBalance = await tokenBalanceService.getTokenBalance(user.wallet_address);
                    console.log('tokenBalance:', tokenBalance)
                    // Convert balance to human readable format with 18 decimals
                    const currentBalance = Number(displayEthereumBalance(tokenBalance, 18));

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
                        console.log("transactions:", transactions)
                        // 3. Calculate minimum balance by analyzing transaction flow
                        const minBalance = calculateMinimumBalance(currentBalance, transactions, user.wallet_address);

                        let tallyTokenBalance = holdData?.tallyTokenBalance ?? 0;

                        // 5. Update user's holding date if they have minimum required balance
                        if (minBalance >= airdropDiscoAmount) {

                            const heldAmount = user.held_amount + minBalance;
                            if (tallyTokenBalance !== minBalance) {
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
                        if (minBalance >= airdropDiscoAmount && tallyTokenBalance >= airdropDiscoAmount) {
                            const ticketCount = Math.floor(minBalance / airdropDiscoAmount);
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
                                    console.error(`User not found for referral ${referral.id}`);
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
                    console.error(`Error updating six-hour token balance for user ${user.id}:`, error);
                }
            })
        );

        console.log('Six-hour token balance update completed successfully');

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
            console.log(`📡 WebSocket event emitted: ticket-balance-updated (${users.length} users)`);
        } catch (error) {
            console.error('Failed to emit WebSocket event:', error);
        }
    } catch (error) {
        console.error('Error in processSixHourTokenBalance:', error);
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
            console.log('No users found for weekly bonus.');
            return;
        }

        console.log(`Processing weekly bonus for ${users.length} users`);

        await Promise.all(
            users.map(async (user: any, index: number) => {
                try {
                    // Get current balance using QuickNode RPC (with Etherscan fallback)
                    const tokenBalance = await tokenBalanceService.getTokenBalance(user.wallet_address);
                    const currentBalance = Number(displayEthereumBalance(tokenBalance, 18));

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
                    console.error(`Error processing weekly bonus for user ${user.id}:`, error);
                }
            })
        );

        console.log('Weekly bonus processing completed successfully');
    } catch (error) {
        console.error('Error in processWeeklyBonus:', error);
    }
};

// Apply FIFO (First In First Out) method to reduce purchases by sales
// Returns array of remaining purchases after applying all sales
const applyFIFOReduction = (purchases: any[], sales: any[], walletAddress: string) => {
    if (!purchases.length || !sales.length) {
        return purchases; // No sales to apply
    }

    const walletLower = walletAddress.toLowerCase();

    // Sort purchases by timestamp (oldest first)
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

    // Sort sales by timestamp (oldest first)
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

    // Apply FIFO: Reduce oldest purchases first when sales occur
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
                // This purchase is fully consumed by the sale
                remainingSaleAmount -= currentPurchase.amount;
                currentPurchase.amount = 0;
                purchaseIndex++;
                if (purchaseIndex < sortedPurchases.length) {
                    currentPurchase = { ...sortedPurchases[purchaseIndex] };
                }
            } else {
                // Partial reduction of this purchase
                currentPurchase.amount -= remainingSaleAmount;
                remainingSaleAmount = 0;
            }
        }
    }

    // Collect remaining purchases (those not fully consumed)
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

// Calculate weighted average holding date (in days with decimal precision)
// Now uses FIFO-adjusted purchases
const calculateWeightedAverageHoldingDate = (
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
    let totalWeightedMinutes = 0;
    let totalAmount = 0;

    for (const purchase of fifoAdjustedPurchases) {
        const purchaseTimeMs = purchase.timestamp * 1000;
        const minutesHeld = Math.floor((currentTimeMs - purchaseTimeMs) / (1000 * 60));
        const amount = purchase.amount; // FIFO-adjusted amount

        totalWeightedMinutes += amount * minutesHeld;
        totalAmount += amount;
    }

    if (totalAmount === 0) {
        return { averageDays: 0, fifoAdjustedPurchases: [] };
    }

    // Calculate average in minutes, then convert to days with decimal precision
    const averageMinutes = totalWeightedMinutes / totalAmount;
    const averageDays = averageMinutes / (60 * 24);

    return { averageDays, fifoAdjustedPurchases };
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
            console.log('No users found for checking holding date from on chain.');
            return;
        }

        console.log(`Checking weighted average holding date from on-chain history for ${users.length} users`);

        const currentTimeMs = Date.now();

        for (const user of users) {
            try {
                // Fetch all token transactions
                const allTransactions = await fetchAllTokenTransactions(user.wallet_address, TOKEN_CONTRACT_ADDRESS);

                if (!allTransactions.length) {
                    console.log(`No transactions found for user ${user.id}`);
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

                // Update user's holdingDate (stored as integer days, but calculated with precision)
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        holdingDate: Math.floor(safeAverageDays),
                        held_amount: safeAverageDays // Store precise value for internal calculations
                    }
                });

                // Clear old HoldDateHistory and insert FIFO-adjusted purchases
                await prisma.holdDateHistory.deleteMany({
                    where: { userId: user.id }
                });

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

                if (historyRecords.length > 0) {
                    await prisma.holdDateHistory.createMany({
                        data: historyRecords,
                        skipDuplicates: true
                    });
                }

                console.log(`Updated weighted average holding days for user ${user.id} -> ${averageDays.toFixed(2)} days (${fifoAdjustedPurchases.length} FIFO-adjusted purchases tracked)`);
            } catch (error) {
                console.error(`Failed to update holding days for user ${user.id}:`, error);
            }
        }

        console.log('Weighted average holding date calculation completed');
    }
    catch (error) {
        console.error('Error in checkingHoldingDateFromOnChain:', error);
    }
};

export default { processSixHourTokenBalance, processWeeklyBonus, isSixHourUpdateRunning };
