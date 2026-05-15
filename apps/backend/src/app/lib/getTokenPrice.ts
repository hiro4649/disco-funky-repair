import axios from 'axios';
import { TOKEN_CONTRACT_ADDRESS } from '../config/env';

interface DexScreenerResponse {
    pairs: {
        baseToken: {
            address: string;
            symbol?: string;
            name?: string;
        };
        priceUsd: string;
        liquidity?: {
            usd?: number;
        };
        volume?: {
            h24?: number;
        };
        txns?: {
            h24?: {
                buys?: number;
                sells?: number;
            };
        };
        fdv?: number;
        marketCap?: number;
    }[];
}

interface TokenMarketData {
    price: string | null;
    liquidity: number;
    volume24h: number;
    txns24h: number;
    marketCap: number;
    fdv: number;
}

// Function to calculate scarcity score based on supply dynamics
function calculateScarcityScore(circulatingSupply: number, maxSupply: number, marketCap: number, fdv: number): number {
    try {
        // If we have both circulating supply and max supply
        if (maxSupply > 0 && circulatingSupply > 0) {
            // Basic scarcity: 1 - (circulating / max)
            const basicScarcity = 1 - (circulatingSupply / maxSupply);
            
            // Additional factor: FDV vs Market Cap ratio (lower ratio = more scarcity)
            const fdvRatio = marketCap > 0 ? Math.min(fdv / marketCap, 10) : 1; // Cap at 10x
            const fdvScarcity = 1 / fdvRatio;
            
            // Combine both factors (weighted average)
            const scarcityScore = (basicScarcity * 0.7) + (fdvScarcity * 0.3);
            
            // Normalize to 0-1 range
            return Math.max(0, Math.min(1, scarcityScore));
        }
        
        // If we only have market cap and FDV
        if (marketCap > 0 && fdv > 0) {
            // Use FDV/MarketCap ratio as scarcity indicator
            const ratio = fdv / marketCap;
            return Math.max(0, Math.min(1, 1 / ratio));
        }
        
        // Default scarcity score for tokens with unlimited supply
        return 0.1; // Slight scarcity for uncapped tokens
    } catch (error) {
        console.error('Error calculating scarcity score:', error);
        return 0.5; // Default fallback
    }
}

async function getTokenPrice(token_address?: string): Promise<string | null> {
    try {
        const address = token_address || TOKEN_CONTRACT_ADDRESS;
        const response = await axios.get<DexScreenerResponse>(
            `https://api.dexscreener.com/latest/dex/tokens/${address}`
        );
        // console.log("response===========>",token_address, response.data.pairs[0].priceUsd);
        
        if(response.status == 200) {
            const data: DexScreenerResponse = response.data;
            const pair = data.pairs.find(pair => pair.baseToken.address.toLowerCase() === address.toLowerCase());
            return pair ? pair.priceUsd : null;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function getTokenMarketData(token_address?: string): Promise<TokenMarketData> {
    try {
        const address = token_address || TOKEN_CONTRACT_ADDRESS;
        const response = await axios.get<DexScreenerResponse>(
            `https://api.dexscreener.com/latest/dex/tokens/${address}`
        );
        
        if(response.status == 200 && response.data.pairs  !== null) {
            const data: DexScreenerResponse = response.data;
            const pair = data.pairs.find(pair => pair.baseToken.address.toLowerCase() === address.toLowerCase());
            
            if (pair) {
                return {
                    price: pair.priceUsd,
                    liquidity: pair.liquidity?.usd || 0,
                    volume24h: pair.volume?.h24 || 0,
                    txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
                    marketCap: pair.marketCap || 0,
                    fdv: pair.fdv || 0
                };
            }
        }
        
        return {
            price: null,
            liquidity: 0,
            volume24h: 0,
            txns24h: 0,
            marketCap: 0,
            fdv: 0
        };
    } catch (error) {
        console.error('Error fetching token market data:', error);
        return {
            price: null,
            liquidity: 0,
            volume24h: 0,
            txns24h: 0,
            marketCap: 0,
            fdv: 0
        };
    }
}

export default getTokenPrice;
export { getTokenMarketData, calculateScarcityScore };
