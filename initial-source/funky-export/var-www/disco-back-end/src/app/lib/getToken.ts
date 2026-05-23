import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

async function getTokenBalance(walletAddress: string, coinType: string) {
    const rpcUrl = getFullnodeUrl('mainnet');

    // create a client connected to devnet
    const client = new SuiClient({ url: rpcUrl });

    if (!walletAddress) {
        throw new Error('Wallet address is required');
    }

    try {
        // Fetch all coins in the wallet
        // const coinsResponse = await client.getAllCoins({ owner: walletAddress });
        const balance = await client.getBalance({
            owner: walletAddress,
            coinType: coinType,

        })
        // Process the response to find the Disco token (adjust based on the structure of your token)
        // const discoCoin = coinsResponse.data.filter((coin: any) => {
        //     return coin.coinType === coinType; // Replace with actual Disco token type ID '0x1512fbf99602795c86a2a50bef34d1d6774bb1274cdc6cc21d2af0d6ea11aec9::disco::DISCO'
        // });
        const totalBalance = balance.totalBalance;

        return totalBalance;

        // if (discoCoin) {
        //     const balances = discoCoin.map((item: { balance: any }) => BigInt(item.balance));
        //     console.log(totalBalance, walletAddress);

        //     return totalBalance; // Return the balance of Disco token
        // } else {
        //     return null
        // }
    } catch (error) {
        console.error('Error fetching Disco token balance:', error);
        return 0;
    }
}

// Batch processing function for multiple wallet addresses
async function getBatchTokenBalances(walletAddresses: string[], coinType: string) {
    const rpcUrl = getFullnodeUrl('mainnet');
    const client = new SuiClient({ url: rpcUrl });
    
    try {
        // Process in chunks to avoid overwhelming the RPC
        const chunkSize = 50; // Adjust based on provider limits
        const results: Array<{ address: string; balance: bigint; error?: string }> = [];
        
        console.log(`Processing ${walletAddresses.length} wallet addresses in chunks of ${chunkSize}`);
        
        for (let i = 0; i < walletAddresses.length; i += chunkSize) {
            const chunk = walletAddresses.slice(i, i + chunkSize);
            console.log(`Processing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(walletAddresses.length / chunkSize)} (${chunk.length} addresses)`);
            
            // Process chunk in parallel
            const chunkPromises = chunk.map(async (address) => {
                try {
                    const balance = await client.getBalance({
                        owner: address,
                        coinType: coinType,
                    });
                    return { address, balance: BigInt(balance.totalBalance) };
                } catch (error) {
                    console.error(`Error fetching balance for ${address}:`, error);
                    return { address, balance: BigInt(0), error: error instanceof Error ? error.message : 'Unknown error' };
                }
            });
            
            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);
            
            // Add delay between chunks to respect rate limits (100 req/min = ~1.67 req/sec)
            if (i + chunkSize < walletAddresses.length) {
                const delay = Math.ceil((chunkSize / 1.5) * 1000); // Conservative delay
                console.log(`Waiting ${delay}ms before next chunk to respect rate limits...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        console.log(`Batch processing completed. Successfully processed ${results.filter(r => !r.error).length}/${results.length} addresses`);
        return results;
    } catch (error) {
        console.error('Error in batch token balance fetch:', error);
        return [];
    }
}

// Enhanced batch processing with retry logic and better error handling
async function getBatchTokenBalancesWithRetry(
    walletAddresses: string[], 
    coinType: string, 
    maxRetries: number = 3,
    retryDelay: number = 1000
) {
    const rpcUrl = getFullnodeUrl('mainnet');
    const client = new SuiClient({ url: rpcUrl });
    
    try {
        const chunkSize = 30; // Smaller chunks for better reliability
        const results: Array<{ address: string; balance: bigint; error?: string; retries?: number }> = [];
        
        console.log(`Processing ${walletAddresses.length} wallet addresses with retry logic (max ${maxRetries} retries)`);
        
        for (let i = 0; i < walletAddresses.length; i += chunkSize) {
            const chunk = walletAddresses.slice(i, i + chunkSize);
            console.log(`Processing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(walletAddresses.length / chunkSize)} (${chunk.length} addresses)`);
            
            // Process chunk with retry logic
            const chunkPromises = chunk.map(async (address) => {
                let retries = 0;
                let lastError: Error | null = null;
                
                while (retries <= maxRetries) {
                    try {
                        const balance = await client.getBalance({
                            owner: address,
                            coinType: coinType,
                        });
                        return { address, balance: BigInt(balance.totalBalance), retries };
                    } catch (error) {
                        lastError = error instanceof Error ? error : new Error(String(error));
                        retries++;
                        
                        if (retries <= maxRetries) {
                            console.warn(`Retry ${retries}/${maxRetries} for ${address} after error: ${lastError.message}`);
                            await new Promise(resolve => setTimeout(resolve, retryDelay * retries)); // Exponential backoff
                        } else {
                            console.error(`Failed to fetch balance for ${address} after ${maxRetries} retries:`, lastError.message);
                            return { address, balance: BigInt(0), error: lastError.message, retries };
                        }
                    }
                }
                
                return { address, balance: BigInt(0), error: 'Max retries exceeded', retries };
            });
            
            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);
            
            // Rate limiting delay
            if (i + chunkSize < walletAddresses.length) {
                const delay = Math.ceil((chunkSize / 1.5) * 1000);
                console.log(`Rate limiting: waiting ${delay}ms before next chunk...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        const successCount = results.filter(r => !r.error).length;
        const retryCount = results.reduce((sum, r) => sum + (r.retries || 0), 0);
        
        console.log(`Batch processing completed. Success: ${successCount}/${results.length}, Total retries: ${retryCount}`);
        return results;
    } catch (error) {
        console.error('Error in batch token balance fetch with retry:', error);
        return [];
    }
}

export { getBatchTokenBalances, getBatchTokenBalancesWithRetry };
export default getTokenBalance;
