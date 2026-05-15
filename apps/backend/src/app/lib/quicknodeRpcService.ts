/**
 * QuickNode RPC Service
 *
 * Provides QuickNode HTTP RPC methods with credit-aware rate limiting
 * and automatic fallback to Etherscan API.
 *
 * QuickNode Build Plan Limits:
 * - 10 endpoints available
 * - 80 million API credits per month
 * - 50 RPS per endpoint (not the bottleneck - credits are!)
 *
 * Credit Costs (per request):
 * - eth_call: 16 credits
 * - eth_getLogs: 6 credits
 * - eth_getBlockByNumber: 16 credits
 *
 * Strategy:
 * - Use QuickNode as primary for real-time data
 * - Keep Etherscan as fallback for historical/bulk queries
 * - Monitor credit usage to avoid hitting monthly limit
 */

import { ethers } from 'ethers';
import { QUICKNODE_HTTP_RPC_URL, ETHERSCAN_API_URL, ETHERSCAN_API_KEY, TOKEN_CONTRACT_ADDRESS } from '../config/env';
import { etherscanRateLimiter } from '../utils/rateLimiter';
import { alertQuickNodeFallback, alertQuickNodeRestored } from './discordAlerts';

// ERC20 ABI for balance and transfer events
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'event Transfer(address indexed from, address indexed to, uint256 value)'
];

/**
 * Credit-Aware Rate Limiter for QuickNode
 *
 * Build Plan: 80M credits/month = ~2.6M credits/day = ~1,800 credits/min
 * Conservative limit: 1,500 credits/min to leave buffer
 */
class QuickNodeCreditLimiter {
    private creditWindow: { timestamp: number; credits: number }[] = [];
    private readonly WINDOW_MS = 60 * 1000; // 1 minute
    private readonly MAX_CREDITS_PER_MINUTE = 1500; // Conservative limit

    // Track monthly usage
    private monthlyCredits = 0;
    private monthStart = new Date().getMonth();

    async waitForCredits(creditsNeeded: number): Promise<void> {
        // Reset monthly counter if new month
        const currentMonth = new Date().getMonth();
        if (currentMonth !== this.monthStart) {
            this.monthlyCredits = 0;
            this.monthStart = currentMonth;
            console.log(`📊 QuickNode: Monthly credit counter reset`);
        }

        // Clean old entries outside the window
        const now = Date.now();
        this.creditWindow = this.creditWindow.filter(
            entry => now - entry.timestamp < this.WINDOW_MS
        );

        // Calculate current credits in window
        const creditsInWindow = this.creditWindow.reduce((sum, entry) => sum + entry.credits, 0);

        // Wait if adding this request would exceed limit
        if (creditsInWindow + creditsNeeded > this.MAX_CREDITS_PER_MINUTE) {
            const oldestEntry = this.creditWindow[0];
            const waitTime = this.WINDOW_MS - (now - oldestEntry.timestamp);

            console.log(`⏳ QuickNode rate limit: Waiting ${(waitTime / 1000).toFixed(1)}s (${creditsInWindow}/${this.MAX_CREDITS_PER_MINUTE} credits used)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));

            // Recurse to re-check after waiting
            return this.waitForCredits(creditsNeeded);
        }

        // Record this request
        this.creditWindow.push({ timestamp: now, credits: creditsNeeded });
        this.monthlyCredits += creditsNeeded;
    }

    getMonthlyUsage(): { used: number; limit: number; percentage: number } {
        const limit = 80_000_000;
        return {
            used: this.monthlyCredits,
            limit,
            percentage: (this.monthlyCredits / limit) * 100
        };
    }

    logUsage(): void {
        const usage = this.getMonthlyUsage();
        console.log(`💳 QuickNode Credits: ${(usage.used / 1_000_000).toFixed(2)}M / 80M (${usage.percentage.toFixed(2)}%)`);
    }
}

const creditLimiter = new QuickNodeCreditLimiter();

/**
 * QuickNode RPC Service Class
 */
class QuickNodeRpcService {
    private provider: ethers.JsonRpcProvider | null = null;
    private contract: ethers.Contract | null = null;
    private isAvailable = false;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        if (!QUICKNODE_HTTP_RPC_URL) {
            console.warn('⚠️  QUICKNODE_HTTP_RPC_URL not configured. QuickNode RPC disabled.');
            return;
        }

        try {
            this.provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
            this.contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, this.provider);
            this.isAvailable = true;
            console.log('✅ QuickNode RPC Service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize QuickNode RPC:', error);
            this.isAvailable = false;
        }
    }

    /**
     * Get ERC-20 token balance using QuickNode RPC
     * Cost: 16 credits per call (eth_call)
     *
     * @param walletAddress - User's wallet address
     * @returns Token balance in wei
     */
    async getTokenBalance(walletAddress: string): Promise<bigint | null> {
        if (!this.isAvailable || !this.contract || !this.provider) {
            throw new Error('QuickNode RPC not available');
        }

        try {
            // Wait for credit limit
            await creditLimiter.waitForCredits(16);

            const balance = await this.contract.balanceOf(walletAddress);

            console.log(`✅ QuickNode: Balance fetched for ${walletAddress.slice(0, 10)}... (16 credits)`);

            return balance;
        } catch (error) {
            console.error(`❌ QuickNode getTokenBalance failed:`, error);
            throw error;
        }
    }

    /**
     * Get token transactions using eth_getLogs
     * Cost: 6 credits per call
     *
     * This is MUCH more efficient than Etherscan's pagination!
     *
     * @param walletAddress - User's wallet address
     * @param fromBlock - Start block (default: 0)
     * @param toBlock - End block (default: 'latest')
     * @returns Array of transactions
     */
    async getTokenTransactions(
        walletAddress: string,
        fromBlock: number | string = 0,
        toBlock: number | string = 'latest'
    ): Promise<any[]> {
        if (!this.isAvailable || !this.contract || !this.provider) {
            throw new Error('QuickNode RPC not available');
        }

        try {
            const walletLower = walletAddress.toLowerCase();

            // Get contract decimals
            const decimals = 18; // Standard ERC20

            // Build filter for Transfer events involving this wallet
            const transferEvent = this.contract.filters.Transfer();
            const topicFilter = await transferEvent.getTopicFilter();

            // QuickNode has block range limits (typically 5000 blocks per query)
            // We'll handle this by chunking if needed
            const MAX_BLOCK_RANGE = 5000;

            const latestBlock = toBlock === 'latest'
                ? await this.provider.getBlockNumber()
                : typeof toBlock === 'string' ? parseInt(toBlock) : toBlock;

            const startBlock = typeof fromBlock === 'string' ? parseInt(fromBlock) : fromBlock;

            let allLogs: ethers.Log[] = [];

            // Chunk into 5000-block ranges
            for (let currentBlock = startBlock; currentBlock <= latestBlock; currentBlock += MAX_BLOCK_RANGE) {
                const endBlock = Math.min(currentBlock + MAX_BLOCK_RANGE - 1, latestBlock);

                // Wait for credit limit (6 credits per eth_getLogs)
                await creditLimiter.waitForCredits(6);

                const logs = await this.provider.getLogs({
                    address: TOKEN_CONTRACT_ADDRESS,
                    topics: topicFilter,
                    fromBlock: currentBlock,
                    toBlock: endBlock
                });

                allLogs.push(...logs);

                console.log(`✅ QuickNode: Fetched ${logs.length} events from blocks ${currentBlock}-${endBlock} (6 credits)`);
            }

            // Parse logs and filter for this wallet
            const iface = new ethers.Interface(ERC20_ABI);
            const transactions: any[] = [];

            for (const log of allLogs) {
                try {
                    const parsed = iface.parseLog({
                        topics: [...log.topics],
                        data: log.data
                    });

                    if (!parsed) continue;

                    const from = parsed.args[0].toLowerCase();
                    const to = parsed.args[1].toLowerCase();
                    const value = parsed.args[2];

                    // Only include transactions involving this wallet
                    if (from !== walletLower && to !== walletLower) {
                        continue;
                    }

                    // Get block timestamp (costs 16 credits per unique block)
                    // We'll batch these to minimize credit usage
                    const block = await this.provider.getBlock(log.blockNumber);
                    await creditLimiter.waitForCredits(16);

                    transactions.push({
                        hash: log.transactionHash,
                        from,
                        to,
                        value: value.toString(),
                        timeStamp: block?.timestamp.toString() || '0',
                        blockNumber: log.blockNumber.toString(),
                        tokenDecimal: decimals.toString(),
                        tokenSymbol: 'TOKEN'
                    });

                    console.log(`✅ QuickNode: Fetched block ${log.blockNumber} timestamp (16 credits)`);
                } catch (parseError) {
                    console.error('Error parsing log:', parseError);
                }
            }

            console.log(`✅ QuickNode: Fetched ${transactions.length} transactions for ${walletAddress.slice(0, 10)}...`);
            creditLimiter.logUsage();

            return transactions;

        } catch (error) {
            console.error(`❌ QuickNode getTokenTransactions failed:`, error);
            throw error;
        }
    }

    /**
     * Get transactions in a specific time window (optimized for 6-hour/24-hour checks)
     *
     * @param walletAddress - User's wallet address
     * @param hours - Number of hours to look back (default: 24)
     * @returns Array of transactions
     */
    async getTokenTransactionsInTimeWindow(
        walletAddress: string,
        hours: number = 24
    ): Promise<any[]> {
        if (!this.isAvailable || !this.provider) {
            throw new Error('QuickNode RPC not available');
        }

        try {
            // Calculate block range based on time
            // BSC: ~3 second block time
            const blocksPerHour = 60 * 60 / 3; // ~1200 blocks/hour
            const blockRange = Math.ceil(hours * blocksPerHour);

            const latestBlock = await this.provider.getBlockNumber();
            const fromBlock = Math.max(0, latestBlock - blockRange);

            console.log(`🔍 QuickNode: Fetching last ${hours}h of transactions (blocks ${fromBlock}-${latestBlock})...`);

            const transactions = await this.getTokenTransactions(walletAddress, fromBlock, latestBlock);

            // Filter by actual timestamp (blocks are estimate)
            const cutoffTime = Math.floor(Date.now() / 1000) - (hours * 3600);
            const filteredTransactions = transactions.filter(tx =>
                parseInt(tx.timeStamp) >= cutoffTime
            );

            console.log(`✅ QuickNode: Filtered to ${filteredTransactions.length} transactions within ${hours}h window`);

            return filteredTransactions;

        } catch (error) {
            console.error(`❌ QuickNode getTokenTransactionsInTimeWindow failed:`, error);
            throw error;
        }
    }

    /**
     * Get block data by block number
     * Used for real-time event processing to get timestamps
     *
     * @param blockNumber - Block number to fetch
     * @returns Block data with timestamp
     */
    async getBlock(blockNumber: number): Promise<{ timestamp: number; number: number } | null> {
        if (!this.isAvailable || !this.provider) {
            throw new Error('QuickNode RPC not available');
        }

        try {
            // Wait for credit limit (16 credits per eth_getBlockByNumber)
            await creditLimiter.waitForCredits(16);

            const block = await this.provider.getBlock(blockNumber);

            if (!block) {
                throw new Error(`Block ${blockNumber} not found`);
            }

            console.log(`✅ QuickNode: Fetched block ${blockNumber}, timestamp: ${block.timestamp} (16 credits)`);

            return {
                timestamp: block.timestamp,
                number: block.number
            };

        } catch (error) {
            console.error(`❌ QuickNode getBlock failed for block ${blockNumber}:`, error);
            throw error;
        }
    }

    /**
     * Check if QuickNode RPC is available
     */
    isServiceAvailable(): boolean {
        return this.isAvailable;
    }

    /**
     * Get credit usage stats
     */
    getCreditUsage() {
        return creditLimiter.getMonthlyUsage();
    }
}

/**
 * Fallback to Etherscan API
 */
class EtherscanFallbackService {
    /**
     * Get token balance via Etherscan API
     */
    async getTokenBalance(walletAddress: string): Promise<bigint | null> {
        try {
            await etherscanRateLimiter.waitForRateLimit();

            const url = `${ETHERSCAN_API_URL}&module=account&action=tokenbalance&contractaddress=${TOKEN_CONTRACT_ADDRESS}&address=${walletAddress}&tag=latest&apikey=${ETHERSCAN_API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== '1') {
                throw new Error(data.result || 'Etherscan returned error');
            }

            console.log(`✅ Etherscan (fallback): Balance fetched for ${walletAddress.slice(0, 10)}...`);

            return BigInt(data.result);
        } catch (error) {
            console.error('❌ Etherscan getTokenBalance failed:', error);
            throw error;
        }
    }

    /**
     * Get token transactions via Etherscan API
     */
    async getTokenTransactions(
        walletAddress: string,
        hours: number = 24
    ): Promise<any[]> {
        try {
            const endTime = Math.floor(Date.now() / 1000);
            const startTime = endTime - (hours * 3600);

            await etherscanRateLimiter.waitForRateLimit();

            const url = `${ETHERSCAN_API_URL}&module=account&action=tokentx&contractaddress=${TOKEN_CONTRACT_ADDRESS}&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === '1' && data.result) {
                const filtered = data.result.filter((tx: any) => {
                    const txTime = parseInt(tx.timeStamp);
                    return txTime >= startTime && txTime <= endTime;
                });

                console.log(`✅ Etherscan (fallback): Fetched ${filtered.length} transactions for ${walletAddress.slice(0, 10)}...`);
                return filtered;
            }

            return [];
        } catch (error) {
            console.error('❌ Etherscan getTokenTransactions failed:', error);
            throw error;
        }
    }
}

/**
 * Unified Token Service with automatic failover
 */
export class TokenBalanceService {
    private quickNode: QuickNodeRpcService;
    private etherscan: EtherscanFallbackService;
    private failureCount = 0;
    private readonly MAX_FAILURES = 3;
    private isInFallbackMode = false;
    private lastFallbackAlertTime = 0;
    private readonly FALLBACK_ALERT_COOLDOWN = 60 * 60 * 1000; // 1 hour

    constructor() {
        this.quickNode = new QuickNodeRpcService();
        this.etherscan = new EtherscanFallbackService();
    }

    /**
     * Get token balance with automatic failover
     */
    async getTokenBalance(walletAddress: string): Promise<number> {
        // Try QuickNode first
        if (this.quickNode.isServiceAvailable() && this.failureCount < this.MAX_FAILURES) {
            try {
                const balance = await this.quickNode.getTokenBalance(walletAddress);
                this.failureCount = 0; // Reset on success
                
                // Check if we're recovering from fallback
                if (this.isInFallbackMode) {
                    this.isInFallbackMode = false;
                    await alertQuickNodeRestored();
                }
                
                return Number(balance);
            } catch (error) {
                console.warn('⚠️  QuickNode failed, falling back to Etherscan...', error);
                this.failureCount++;
                
                // Determine fallback reason
                const errorMsg = (error as Error).message.toLowerCase();
                let reason: 'credits_exhausted' | 'service_unavailable' | 'rate_limit' = 'service_unavailable';
                
                if (errorMsg.includes('credit') || errorMsg.includes('limit')) {
                    reason = 'credits_exhausted';
                } else if (errorMsg.includes('rate') || errorMsg.includes('too many')) {
                    reason = 'rate_limit';
                }
                
                // Enter fallback mode and send alert if transitioning
                if (!this.isInFallbackMode || (Date.now() - this.lastFallbackAlertTime) >= this.FALLBACK_ALERT_COOLDOWN) {
                    this.isInFallbackMode = true;
                    this.lastFallbackAlertTime = Date.now();
                    
                    const creditUsage = this.quickNode.getCreditUsage();
                    await alertQuickNodeFallback(
                        reason,
                        creditUsage.used,
                        creditUsage.limit
                    );
                }
            }
        }

        // Fallback to Etherscan
        if (this.isInFallbackMode) {
            console.log('📡 Using Etherscan API (fallback)');
        }
        const balance = await this.etherscan.getTokenBalance(walletAddress);
        return Number(balance);
    }

    /**
     * Get transactions in time window with automatic failover
     */
    async getTokenTransactions(walletAddress: string, hours: number = 24): Promise<any[]> {
        // Try QuickNode first
        if (this.quickNode.isServiceAvailable() && this.failureCount < this.MAX_FAILURES) {
            try {
                const transactions = await this.quickNode.getTokenTransactionsInTimeWindow(walletAddress, hours);
                this.failureCount = 0; // Reset on success
                
                // Check if we're recovering from fallback
                if (this.isInFallbackMode) {
                    this.isInFallbackMode = false;
                    await alertQuickNodeRestored();
                }
                
                return transactions;
            } catch (error) {
                console.warn('⚠️  QuickNode failed, falling back to Etherscan...', error);
                this.failureCount++;
                
                // Determine fallback reason
                const errorMsg = (error as Error).message.toLowerCase();
                let reason: 'credits_exhausted' | 'service_unavailable' | 'rate_limit' = 'service_unavailable';
                
                if (errorMsg.includes('credit') || errorMsg.includes('limit')) {
                    reason = 'credits_exhausted';
                } else if (errorMsg.includes('rate') || errorMsg.includes('too many')) {
                    reason = 'rate_limit';
                }
                
                // Enter fallback mode and send alert if transitioning
                if (!this.isInFallbackMode || (Date.now() - this.lastFallbackAlertTime) >= this.FALLBACK_ALERT_COOLDOWN) {
                    this.isInFallbackMode = true;
                    this.lastFallbackAlertTime = Date.now();
                    
                    const creditUsage = this.quickNode.getCreditUsage();
                    await alertQuickNodeFallback(
                        reason,
                        creditUsage.used,
                        creditUsage.limit
                    );
                }
            }
        }

        // Fallback to Etherscan
        if (this.isInFallbackMode) {
            console.log('📡 Using Etherscan API (fallback)');
        }
        return await this.etherscan.getTokenTransactions(walletAddress, hours);
    }

    /**
     * Get block data from QuickNode RPC (for real-time event processing)
     * Used by real-time event listener to get block timestamps
     */
    async getQuickNodeBlock(blockNumber: number): Promise<{ timestamp: number; number: number } | null> {
        // Try QuickNode first
        if (this.quickNode.isServiceAvailable() && this.failureCount < this.MAX_FAILURES) {
            try {
                const block = await this.quickNode.getBlock(blockNumber);
                this.failureCount = 0; // Reset on success
                return block;
            } catch (error) {
                console.warn(`⚠️  QuickNode getBlock failed for block ${blockNumber}, falling back to Etherscan...`, error);
                this.failureCount++;
            }
        }

        // Fallback: Etherscan doesn't have a direct block API, so we'll throw error
        // The caller should handle this by using Etherscan transaction API instead
        throw new Error('QuickNode block fetch failed and Etherscan does not support block API. Use Etherscan transaction API instead.');
    }

    /**
     * Get service health status
     */
    getHealthStatus() {
        return {
            quickNode: {
                available: this.quickNode.isServiceAvailable(),
                failureCount: this.failureCount,
                creditUsage: this.quickNode.getCreditUsage()
            },
            etherscan: {
                available: true // Always available as fallback
            }
        };
    }

    /**
     * Log current status
     */
    logStatus() {
        const status = this.getHealthStatus();
        console.log('\n📊 Token Balance Service Status:');
        console.log(`  QuickNode: ${status.quickNode.available ? '✅ Available' : '❌ Unavailable'}`);
        console.log(`  Failures: ${status.quickNode.failureCount}/${this.MAX_FAILURES}`);
        console.log(`  Credits: ${(status.quickNode.creditUsage.used / 1_000_000).toFixed(2)}M / 80M (${status.quickNode.creditUsage.percentage.toFixed(2)}%)`);
        console.log(`  Etherscan: ✅ Available (fallback)\n`);
    }
}

// Export singleton instance
export const tokenBalanceService = new TokenBalanceService();

export default tokenBalanceService;
