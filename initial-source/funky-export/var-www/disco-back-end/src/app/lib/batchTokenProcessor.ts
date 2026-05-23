import { getBatchTokenBalances, getBatchTokenBalancesWithRetry } from './getToken';
import { discoCoinType } from '../config/env';

/**
 * Utility class for processing token balances in batches
 * This helps handle large numbers of wallet addresses efficiently
 */
export class BatchTokenProcessor {
    private coinType: string;
    private maxRetries: number;
    private retryDelay: number;
    private chunkSize: number;

    constructor(
        coinType: string = discoCoinType!,
        maxRetries: number = 3,
        retryDelay: number = 1000,
        chunkSize: number = 30
    ) {
        this.coinType = coinType;
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
        this.chunkSize = chunkSize;
    }

    /**
     * Process a large batch of wallet addresses with automatic retry and rate limiting
     * @param walletAddresses Array of wallet addresses to process
     * @returns Array of results with balance and error information
     */
    async processBatch(walletAddresses: string[]) {
        console.log(`Starting batch processing for ${walletAddresses.length} addresses`);
        console.log(`Configuration: maxRetries=${this.maxRetries}, retryDelay=${this.retryDelay}ms, chunkSize=${this.chunkSize}`);
        
        const startTime = Date.now();
        
        try {
            const results = await getBatchTokenBalancesWithRetry(
                walletAddresses,
                this.coinType,
                this.maxRetries,
                this.retryDelay
            );
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Calculate statistics
            const successCount = results.filter(r => !r.error).length;
            const errorCount = results.filter(r => r.error).length;
            const totalRetries = results.reduce((sum, r) => sum + (r.retries || 0), 0);
            
            console.log(`Batch processing completed in ${duration}ms`);
            console.log(`Results: ${successCount} successful, ${errorCount} failed, ${totalRetries} total retries`);
            console.log(`Average time per address: ${(duration / walletAddresses.length).toFixed(2)}ms`);
            
            return {
                results,
                statistics: {
                    total: walletAddresses.length,
                    successful: successCount,
                    failed: errorCount,
                    totalRetries,
                    duration,
                    averageTimePerAddress: duration / walletAddresses.length
                }
            };
        } catch (error) {
            console.error('Batch processing failed:', error);
            throw error;
        }
    }

    /**
     * Process wallet addresses in smaller chunks for better control
     * @param walletAddresses Array of wallet addresses
     * @param customChunkSize Optional custom chunk size
     * @returns Array of results
     */
    async processInChunks(walletAddresses: string[], customChunkSize?: number) {
        const chunkSize = customChunkSize || this.chunkSize;
        const results: any[] = [];
        
        console.log(`Processing ${walletAddresses.length} addresses in chunks of ${chunkSize}`);
        
        for (let i = 0; i < walletAddresses.length; i += chunkSize) {
            const chunk = walletAddresses.slice(i, i + chunkSize);
            console.log(`Processing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(walletAddresses.length / chunkSize)}`);
            
            try {
                const chunkResults = await getBatchTokenBalances(chunk, this.coinType);
                results.push(...chunkResults);
                
                // Add delay between chunks
                if (i + chunkSize < walletAddresses.length) {
                    const delay = Math.ceil((chunkSize / 1.5) * 1000);
                    console.log(`Waiting ${delay}ms before next chunk...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            } catch (error) {
                console.error(`Error processing chunk starting at index ${i}:`, error);
                // Add failed results for this chunk
                chunk.forEach(address => {
                    results.push({
                        address,
                        balance: BigInt(0),
                        error: 'Chunk processing failed'
                    });
                });
            }
        }
        
        return results;
    }

    /**
     * Get balance for a single wallet address (fallback method)
     * @param walletAddress Single wallet address
     * @returns Balance result
     */
    async getSingleBalance(walletAddress: string) {
        const results = await getBatchTokenBalances([walletAddress], this.coinType);
        return results[0];
    }

    /**
     * Validate wallet addresses before processing
     * @param walletAddresses Array of wallet addresses
     * @returns Object with valid and invalid addresses
     */
    validateAddresses(walletAddresses: string[]) {
        const valid: string[] = [];
        const invalid: string[] = [];
        
        walletAddresses.forEach(address => {
            if (address && address.length === 66 && address.startsWith('0x')) {
                valid.push(address);
            } else {
                invalid.push(address);
            }
        });
        
        return { valid, invalid };
    }

    /**
     * Estimate processing time based on address count
     * @param addressCount Number of addresses to process
     * @returns Estimated time in milliseconds
     */
    estimateProcessingTime(addressCount: number): number {
        // Base time per address: 200ms (including RPC call and processing)
        // Rate limiting delay: ~1.67 req/sec = ~600ms per request
        // Chunk processing overhead: 100ms per chunk
        
        const baseTime = addressCount * 200;
        const rateLimitDelay = Math.ceil(addressCount / this.chunkSize) * 600;
        const chunkOverhead = Math.ceil(addressCount / this.chunkSize) * 100;
        
        return baseTime + rateLimitDelay + chunkOverhead;
    }
}

/**
 * Factory function to create a BatchTokenProcessor with default settings
 */
export const createBatchProcessor = (coinType?: string) => {
    return new BatchTokenProcessor(coinType);
};

/**
 * Quick batch processing function for simple use cases
 */
export const quickBatchProcess = async (
    walletAddresses: string[], 
    coinType: string = discoCoinType!
) => {
    const processor = new BatchTokenProcessor(coinType);
    return await processor.processBatch(walletAddresses);
};
