/**
 * Dual (Triple) API Key Manager
 *
 * Rotates between 3 Etherscan API keys to maximize throughput:
 * - Each key: 5 calls/second (Lite Plan)
 * - 3 keys total: 15 calls/second theoretical
 * - Safe limit: 13 calls/second (accounting for rate limit buffer)
 *
 * Strategy:
 * - Round-robin rotation between keys
 * - Independent rate limiting per key
 * - Automatic failover if one key hits rate limit
 */

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';
const ETHERSCAN_API_KEY1 = process.env.ETHERSCAN_API_KEY1 || '';
const ETHERSCAN_API_KEY2 = process.env.ETHERSCAN_API_KEY2 || '';

// Validate that we have keys
if (!ETHERSCAN_API_KEY || !ETHERSCAN_API_KEY1 || !ETHERSCAN_API_KEY2) {
    console.error('⚠️  Missing Etherscan API keys! Please set ETHERSCAN_API_KEY, ETHERSCAN_API_KEY1, ETHERSCAN_API_KEY2 in .env');
}

interface RateLimitState {
    lastRequestTime: number;
    requestCount: number;
    minInterval: number; // Milliseconds between requests
}

class DualApiKeyManager {
    private apiKeys: string[];
    private currentKeyIndex: number = 0;
    private rateLimitStates: Map<string, RateLimitState> = new Map();
    private readonly MIN_INTERVAL_PER_KEY = 200; // 5 calls/second = 200ms between calls

    constructor() {
        this.apiKeys = [ETHERSCAN_API_KEY, ETHERSCAN_API_KEY1, ETHERSCAN_API_KEY2].filter(key => key.length > 0);

        if (this.apiKeys.length === 0) {
            throw new Error('No Etherscan API keys configured!');
        }

        // Initialize rate limit state for each key
        this.apiKeys.forEach(key => {
            this.rateLimitStates.set(key, {
                lastRequestTime: 0,
                requestCount: 0,
                minInterval: this.MIN_INTERVAL_PER_KEY
            });
        });

        console.log(`✅ Dual API Key Manager initialized with ${this.apiKeys.length} keys`);
    }

    /**
     * Get next available API key (round-robin with rate limiting)
     */
    async getNextApiKey(): Promise<string> {
        const startIndex = this.currentKeyIndex;

        // Try each key in round-robin fashion
        while (true) {
            const key = this.apiKeys[this.currentKeyIndex];
            const state = this.rateLimitStates.get(key)!;

            const now = Date.now();
            const timeSinceLastRequest = now - state.lastRequestTime;

            // Check if this key is ready
            if (timeSinceLastRequest >= state.minInterval) {
                // Update state
                state.lastRequestTime = now;
                state.requestCount++;

                // Move to next key for next request (round-robin)
                this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

                return key;
            }

            // Try next key
            this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

            // If we've tried all keys and none are ready, wait for the earliest one
            if (this.currentKeyIndex === startIndex) {
                const waitTime = state.minInterval - timeSinceLastRequest;
                await this.sleep(waitTime);
            }
        }
    }

    /**
     * Get API key with automatic rate limiting
     */
    async getRateLimitedKey(): Promise<string> {
        return await this.getNextApiKey();
    }

    /**
     * Build BscScan URL with automatic key rotation
     */
    async buildUrl(baseUrl: string, params: Record<string, string | number>): Promise<string> {
        const apiKey = await this.getNextApiKey();
        const queryParams = new URLSearchParams({
            chainid: '56',  // BSC mainnet chain ID (required for Etherscan API V2)
            ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
            apikey: apiKey
        });

        return `${baseUrl}?${queryParams.toString()}`;
    }

    /**
     * Get statistics about API key usage
     */
    getStats(): { totalKeys: number; stats: Array<{ key: string; requestCount: number }> } {
        return {
            totalKeys: this.apiKeys.length,
            stats: this.apiKeys.map((key, idx) => {
                const state = this.rateLimitStates.get(key)!;
                return {
                    key: `Key ${idx + 1} (***${key.slice(-4)})`,
                    requestCount: state.requestCount
                };
            })
        };
    }

    /**
     * Reset statistics
     */
    resetStats(): void {
        this.apiKeys.forEach(key => {
            const state = this.rateLimitStates.get(key)!;
            state.requestCount = 0;
        });
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
const apiKeyManager = new DualApiKeyManager();

export default apiKeyManager;
export { DualApiKeyManager };
