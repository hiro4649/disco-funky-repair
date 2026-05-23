import prisma from '../db/prisma_client';
import getTokenBalance, { getBatchTokenBalances, getBatchTokenBalancesWithRetry } from './getToken';
import displaySuiBalance from './displaySuiBalance';
import { discoCoinType, adminWalletAddress } from '../config/env';

const handleUserTickets = async (userId: number, ticketCount: number) => {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    try {
        console.log("Handle User Tickets",'userId: ', userId, 'ticketCount: ', ticketCount);

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
                    receivedDate: new Date(new Date().toISOString().split('.')[0]+"Z") 
                },
            });
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                tickets: {
                    increment: ticketCount
                }
            }
        });

        //The tickets will expire if not used within 14 days after they are distributed.
        const userTickets = await prisma.lotteryTickets.findMany({
            where: { userId: Number(userId) },
            orderBy: { receivedDate: 'desc' },
        });

        if (userTickets.length >= 15) {
            // Keep only the 15 most recent tickets (since they're ordered by receivedDate desc)
            const ticketsToDelete = userTickets.slice(15);
            
            // Calculate the total ticket count to be removed
            const totalTicketsToRemove = ticketsToDelete.reduce((sum: number, ticket: any) => sum + ticket.ticket, 0);
            
            // Log how many tickets will be deleted
            console.log(`Deleting ${ticketsToDelete.length} old tickets for user ${userId}, removing ${totalTicketsToRemove} ticket points`);
            
            // Delete each ticket record
            await Promise.all(
                ticketsToDelete.map((ticket: any) => 
                    prisma.lotteryTickets.delete({ where: { id: ticket.id } })
                )
            );
            
            // Decrease the user's total ticket count if there are tickets to remove
            if (totalTicketsToRemove > 0) {
                await prisma.user.update({
                    where: { id: Number(userId) },
                    data: {
                        tickets: {
                            decrement: totalTicketsToRemove
                        }
                    }
                });
                
                console.log(`Decreased user ${userId} total ticket count by ${totalTicketsToRemove}`);
            }
        }
    } catch (error) {
        console.error('Error handling user tickets:', error);
    }
};

export const fetchDiscoTokenBalance = async (mode: number) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                wallet_address: true,
                id: true
            }
        });

        if (!users.length) {
            console.log('No users found.');
            return;
        }

        const discoTokenAmount = await prisma.airdropTokens.findFirst({});
        console.log('discoTokenAmount: ', discoTokenAmount);
        const airdropDiscoAmount = discoTokenAmount?.balance ?? 10000;

        // Use batch processing for better performance
        console.log(`Starting batch processing for ${users.length} users...`);
        
        // Extract wallet addresses for batch processing
        const walletAddresses = users.map(user => user.wallet_address);
        
        // Use the enhanced batch processing with retry logic
        const batchResults = await getBatchTokenBalancesWithRetry(
            walletAddresses, 
            discoCoinType!, 
            3, // max retries
            1000 // retry delay
        );
        
        // Create a map for quick lookup
        const balanceMap = new Map<string, bigint>();
        batchResults.forEach(result => {
            if (!result.error) {
                balanceMap.set(result.address, result.balance);
            } else {
                console.warn(`Failed to get balance for ${result.address}: ${result.error}`);
                balanceMap.set(result.address, BigInt(0));
            }
        });

        // Process users with the batch results
        await Promise.all(
            users.map(async (user: typeof users[0]) => {
                const wallet_address = user.wallet_address;

                try {
                    // Get disco token balance from batch results
                    const discoTokenBalance = balanceMap.get(wallet_address) || BigInt(0);
                    console.log(`${user.id} - ${user.wallet_address} - discoTokenBalance: ${discoTokenBalance}`);
                    
                    //get existing token balance this user has from database
                    const existingToken = await prisma.ownedToken.findFirst({
                        where: { user: { wallet_address } }
                    });
                    //create a new object to store the balance data
                    const balanceData = {
                        userId: user.id,
                        sixHourTokenBalance: 0,
                        tallyTokenBalance: existingToken?.tallyTokenBalance ?? 0,
                        weeklyTokenBalance: existingToken?.weeklyTokenBalance ?? 0,
                    };
                    console.log(`${user.id} - ${user.wallet_address} - existingToken: ${existingToken?.tallyTokenBalance}`);
                    //convert the disco token balance to a number
                    const currentBalance = Number(displaySuiBalance(discoTokenBalance.toString()));
                    console.log(`${user.id} - ${user.wallet_address} - currentBalance: ${currentBalance}`);
                    
                    // Log the balance data being prepared
                    console.log(`${user.id} - ${user.wallet_address} - balanceData:`, balanceData);
                    
                    // Validate balanceData before upsert
                    if (balanceData.userId <= 0) {
                        console.error(`${user.id} - ${user.wallet_address} - Invalid userId in balanceData:`, balanceData.userId);
                        throw new Error(`Invalid userId: ${balanceData.userId}`);
                    }
                    
                    if (isNaN(balanceData.tallyTokenBalance) || isNaN(balanceData.sixHourTokenBalance) || isNaN(balanceData.weeklyTokenBalance)) {
                        console.error(`${user.id} - ${user.wallet_address} - Invalid numeric values in balanceData:`, balanceData);
                        throw new Error(`Invalid numeric values in balanceData`);
                    }
                    
                    //if mode is 1, then update the balance data
                    if (mode === 1) {
                        //if the existing token balance is greater than or equal to the current balance, then update the balance data
                        if ((existingToken?.tallyTokenBalance ?? 0) >= currentBalance) {
                            //if the existing token balance is greater than or equal to the current balance, then update the balance data
                            balanceData.tallyTokenBalance = currentBalance;
                            balanceData.sixHourTokenBalance = 0;
                        } else if ((existingToken?.tallyTokenBalance ?? 0) < currentBalance) {
                            //if the existing token balance is less than the current balance, then update the six hour token balance
                            balanceData.sixHourTokenBalance = currentBalance - (existingToken?.tallyTokenBalance ?? 0);
                        }
                        
                        // Weekly token balance remains unchanged in mode 1
                    }
                    //if mode is 2, then update the balance data
                    let ticketBalance = (existingToken?.tallyTokenBalance ?? 0);
                    if (mode === 2) {
                        //if the existing token balance plus the six hour token balance is less than or equal to the current balance, then update the balance data
                        if ((existingToken?.tallyTokenBalance ?? 0) + (existingToken?.sixHourTokenBalance ?? 0) <= currentBalance) {
                            balanceData.tallyTokenBalance = (existingToken?.tallyTokenBalance ?? 0) + (existingToken?.sixHourTokenBalance ?? 0);
                            balanceData.sixHourTokenBalance = currentBalance - (existingToken?.tallyTokenBalance ?? 0) - (existingToken?.sixHourTokenBalance ?? 0);
                        } else if ((existingToken?.tallyTokenBalance ?? 0) >= currentBalance) {
                            balanceData.sixHourTokenBalance = 0;
                            balanceData.tallyTokenBalance = currentBalance;
                        } else if ((existingToken?.tallyTokenBalance ?? 0) < currentBalance) {
                            balanceData.tallyTokenBalance = currentBalance;
                            balanceData.sixHourTokenBalance = 0;
                            ticketBalance = currentBalance;
                        }
                        
                        // Also update weeklyTokenBalance with the tallyTokenBalance in mode 2
                        balanceData.weeklyTokenBalance = balanceData.tallyTokenBalance;
                    }

                    try {
                        await prisma.ownedToken.upsert({
                            where: { userId: user.id },
                            create: balanceData,
                            update: balanceData,
                        });
                        console.log(`${user.id} - ${user.wallet_address} - Successfully upserted ownedToken record`);
                    } catch (upsertError) {
                        console.error(`${user.id} - ${user.wallet_address} - Error upserting ownedToken:`, upsertError);
                        console.error(`${user.id} - ${user.wallet_address} - balanceData:`, balanceData);
                        throw upsertError;
                    }
                    console.log('ticketBalance: ', ticketBalance, 'airdropDiscoAmount: ', airdropDiscoAmount);
                    if (mode === 2 && ticketBalance >= airdropDiscoAmount) {
                        //calculate the ticket count
                        console.log('--------------------------------');
                        console.log('ticketBalance: ', ticketBalance, 'airdropDiscoAmount: ', airdropDiscoAmount);
                        const ticketCount = Math.floor(ticketBalance / airdropDiscoAmount);
                        console.log(`${user.id} - ${user.wallet_address} - ttttttttttticketCount: ${ticketCount}`);
                        await handleUserTickets(user.id, ticketCount);
                    }

                    if (mode === 3) {
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
                        sevenDaysAgo.setUTCHours(0, 0, 0, 0);

                        // Track the minimum token balance over the 7-day period
                        let newWeeklyBalance;
                        
                        // If this is the first check or no existing record
                        if (!existingToken?.weeklyTokenBalance) {
                            newWeeklyBalance = currentBalance;
                        } 
                        // If current balance is less than the recorded weekly balance, use current (decreased) balance
                        else if (currentBalance < existingToken.weeklyTokenBalance) {
                            newWeeklyBalance = currentBalance;
                            console.log(`User ${user.id} - Token decreased, setting weekly balance to: ${newWeeklyBalance}`);
                        } 
                        // Otherwise keep the existing weekly balance
                        else {
                            newWeeklyBalance = existingToken.weeklyTokenBalance;
                        }
                        
                        // Update weekly token balance
                        await prisma.ownedToken.update({
                            where: { userId: user.id },
                            data: { 
                                weeklyTokenBalance: newWeeklyBalance,
                                // Always update tally token balance to current
                                tallyTokenBalance: currentBalance
                            }
                        });
                        
                        // Check if user has held tokens for at least 7 days
                        const hasHeldTokensForWeek = newWeeklyBalance >= airdropDiscoAmount;
                        
                        if (hasHeldTokensForWeek) {
                            // Calculate weekly bonus tickets based on minimum weekly balance
                            const weeklyTicketCount = Math.floor(newWeeklyBalance / airdropDiscoAmount);
                            
                            if (weeklyTicketCount > 0) {
                                await handleUserTickets(user.id, weeklyTicketCount);
                                console.log(`Added ${weeklyTicketCount} weekly bonus tickets to user ${user.id} based on weekly minimum balance: ${newWeeklyBalance}`);
                            } else {
                                console.log(`User ${user.id} weekly balance ${newWeeklyBalance} is below threshold ${airdropDiscoAmount}. No weekly bonus tickets awarded.`);
                            }
                        } else {
                            console.log(`User ${user.id} has not held sufficient tokens for a week. Weekly balance: ${newWeeklyBalance}, Required: ${airdropDiscoAmount}`);
                        }
                        
                        // Additional bonus: Check if user received tickets every day for the past week
                        const ticketsFromLast7Days = await prisma.lotteryTickets.findMany({
                            where: {
                                userId: user.id,
                                receivedDate: {
                                    gte: sevenDaysAgo.toISOString(),
                                    lte: new Date().toISOString(),
                                },
                            },
                            orderBy: {
                                receivedDate: "desc",
                            }
                        });

                        if (ticketsFromLast7Days.length > 0) {
                            console.log('Tickets from last 7 days:', ticketsFromLast7Days);
                            
                            // Create an array of the last 7 days
                            const last7Days = [];
                            for (let i = 0; i <= 6; i++) {
                                const day = new Date();
                                day.setUTCDate(day.getUTCDate() - i);
                                day.setUTCHours(0, 0, 0, 0);
                                last7Days.push(day.toISOString().split('T')[0]); // Just get the date part YYYY-MM-DD
                            }
                            
                            // Create a map of dates when tickets were received
                            const receivedDates = new Set();
                            for (const ticket of ticketsFromLast7Days) {
                                const ticketDate = new Date(ticket.receivedDate);
                                receivedDates.add(ticketDate.toISOString().split('T')[0]);
                            }
                            
                            // Check if user received tickets on all 7 days
                            const hasTicketsEveryday = last7Days.every(date => receivedDates.has(date));
                            
                            if (hasTicketsEveryday) {
                                // Find the smallest ticket value among the tickets
                                let smallestTicket = ticketsFromLast7Days[0].ticket;
                                for (const ticketEntry of ticketsFromLast7Days) {
                                    if (ticketEntry.ticket < smallestTicket) {
                                        smallestTicket = ticketEntry.ticket;
                                    }
                                }
                                
                                await handleUserTickets(user.id, smallestTicket);
                                console.log(`Added ${smallestTicket} additional bonus tickets to user ${user.id} for receiving tickets every day for the past week`);
                            } else {
                                console.log(`User ${user.id} did not receive tickets every day for the last 7 days. No additional bonus tickets awarded.`);
                            }
                        }
                    }
                } catch (err) {
                    console.error(
                        `Error fetching token balance for wallet ${wallet_address}:`,
                        err
                    );
                }
            })
        );
        
        console.log(`Batch processing and database updates completed for ${users.length} users`);
    } catch (err) {
        console.error('Error fetching DISCO token balance:', err);
    }
};



