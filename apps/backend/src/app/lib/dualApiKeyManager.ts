/**
 * Dual API Key Manager
 *
 * Rotates between configured explorer API keys to maximize throughput.
 * Key values must never be logged or returned to clients.
 */

import { EXPLORER_API_KEY_ENV_ORDER, getExplorerApiKeys } from '../config/explorerApiKeys';
import { safeLogWarn } from '../utils/safeLogger';

if (getExplorerApiKeys().length === 0) {
    safeLogWarn('explorer_api_key_missing', new Error('Explorer API key configuration missing'), {
        configuredKeyCount: 0,
        acceptedEnvNameCount: EXPLORER_API_KEY_ENV_ORDER.length
    });
}

interface RateLimitState {
    lastRequestTime: number;
    requestCount: number;
    minInterval: number;
}

class DualApiKeyManager {
    private apiKeys: string[];
    private currentKeyIndex: number = 0;
    private rateLimitStates: Map<string, RateLimitState> = new Map();
    private readonly MIN_INTERVAL_PER_KEY = 200;

    constructor() {
        this.apiKeys = getExplorerApiKeys();

        if (this.apiKeys.length === 0) {
            throw new Error('No explorer API keys configured!');
        }

        this.apiKeys.forEach(key => {
            this.rateLimitStates.set(key, {
                lastRequestTime: 0,
                requestCount: 0,
                minInterval: this.MIN_INTERVAL_PER_KEY
            });
        });

    }

    async getNextApiKey(): Promise<string> {
        const startIndex = this.currentKeyIndex;

        while (true) {
            const key = this.apiKeys[this.currentKeyIndex];
            const state = this.rateLimitStates.get(key)!;

            const now = Date.now();
            const timeSinceLastRequest = now - state.lastRequestTime;

            if (timeSinceLastRequest >= state.minInterval) {
                state.lastRequestTime = now;
                state.requestCount++;

                this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

                return key;
            }

            this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

            if (this.currentKeyIndex === startIndex) {
                const waitTime = state.minInterval - timeSinceLastRequest;
                await this.sleep(waitTime);
            }
        }
    }

    async getRateLimitedKey(): Promise<string> {
        return await this.getNextApiKey();
    }

    async buildUrl(baseUrl: string, params: Record<string, string | number>): Promise<string> {
        const apiKey = await this.getNextApiKey();
        const queryParams = new URLSearchParams({
            chainid: '56',
            ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
            apikey: apiKey
        });

        return `${baseUrl}?${queryParams.toString()}`;
    }

    getStats(): { totalKeys: number; stats: Array<{ key: string; requestCount: number }> } {
        return {
            totalKeys: this.apiKeys.length,
            stats: this.apiKeys.map((key, idx) => {
                const state = this.rateLimitStates.get(key)!;
                return {
                    key: `Key ${idx + 1}`,
                    requestCount: state.requestCount
                };
            })
        };
    }

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

const apiKeyManager = new DualApiKeyManager();

export default apiKeyManager;
export { DualApiKeyManager };
