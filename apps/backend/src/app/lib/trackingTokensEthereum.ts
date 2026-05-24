import axios from 'axios';
import { ethers, getAddress } from 'ethers';
import moment from 'moment';
import {
    adminWalletAddress,
    QUICKNODE_HTTP_RPC_URL,
    ETHERSCAN_API_KEY,
    ETHERSCAN_API_URL
} from "../config/env";
import prisma from '../db/prisma_client';
import getTokenPrice, { getTokenMarketData, calculateScarcityScore } from '../lib/getTokenPrice';
import { coinIcons } from '../config/coin-icons';
import { safeLogError } from '../utils/safeLogger';

// ERC20 ABI for basic token operations
const erc20Abi = [
    'function balanceOf(address owner) view returns (uint256)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)'
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const registerAllEthereumTokens = async () => {
    try {
        if (!QUICKNODE_HTTP_RPC_URL) {
            throw new Error('QUICKNODE_HTTP_RPC_URL is not configured');
        }

        const url = `${ETHERSCAN_API_URL}&module=account&action=tokentx&address=${adminWalletAddress}&page=1&offset=100&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

        const { data } = await axios.get(url);

        if (data.status === "1" && data.result) {
            // Extract unique tokens from transactions
            const uniqueTokens: string[] = [];

            data.result.forEach((tx: any) => {
                // Use contract address as unique key
                if (!uniqueTokens.includes(tx.contractAddress)) {
                    uniqueTokens.push(tx.contractAddress);
                }
            });



            const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);

            // Get admin wallet balance for each token
            for (const [index, tokenAddress] of uniqueTokens.entries()) {
                try {

                    if (index > 0) {
                        await delay(500);
                    }

                    const tokenData = await fetchEthereumTokenData(tokenAddress, provider);
                    if (tokenData === null) {

                        continue;
                    }

                    // Check if token already exists in database
                    const existingPrizes = await prisma.prize.findMany({
                        where: {
                            ca: tokenAddress
                        }
                    });

                    if (existingPrizes.length === 0) {
                        // Create new prize entry
                        await prisma.prize.create({
                            data: {
                                ...tokenData.prizeDatas,
                                ranking: 0,
                                quantity: 0,
                                real_probability: 0,
                                probability: 0,
                                saved_probability: 0,
                                earned_pts: 0,
                                fake_probability: 0,
                                balance: tokenData.balance,
                                balance_amount: tokenData.balanceAmount,
                            }
                        });

                    } else {
                        // Update existing entries
                        for (const existingPrize of existingPrizes) {
                            await prisma.prize.update({
                                where: {
                                    id: existingPrize.id,
                                },
                                data: {
                                    ...tokenData.prizeDatas,
                                    balance: tokenData.balance,
                                    balance_amount: tokenData.balanceAmount,
                                    flag: (tokenData.balance > 0 && tokenData.prizeDatas.price > 0 && existingPrize.flag === true) ? true : false,
                                }
                            });
                        }

                    }

                    // Update token details
                    await prisma.tokenDetail.upsert({
                        where: { ca: tokenAddress },
                        create: tokenData.tokenDetails,
                        update: tokenData.tokenDetails,
                    });

                    // Add delay to avoid rate limiting
                    await sleep(2000);

                } catch (error) {
                    safeLogError('register_ethereum_token', error, {
                        tokenAddressPrefix: tokenAddress.slice(0, 10)
                    });
                }
            }
        } else {

        }
    } catch (error) {
        safeLogError('register_all_ethereum_tokens', error);
    }
};

const fetchEthereumTokenData = async (tokenAddress: string, provider: ethers.JsonRpcProvider) => {
    try {
        const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);

        // Fetch token metadata
        const [name, symbol] = await Promise.all([
            contract.name(),
            contract.symbol(),
        ]);

        const [decimals, totalSupply] = await Promise.all([
            contract.decimals(),
            contract.totalSupply()
        ]);

        // Get admin wallet balance
        let balance = BigInt(0);
        if (adminWalletAddress) {
            balance = await contract.balanceOf(adminWalletAddress);
        }

        // Get token market data from DexScreener
        const marketData = await getTokenMarketData(tokenAddress);
        const priceUsd = marketData.price ? parseFloat(marketData.price) : 0;

        // Get additional transaction count from Etherscan as fallback/supplement
        const etherscanTxCount = await getTokenTransactionCount24h(tokenAddress);
        const finalTxCount = marketData.txns24h > 0 ? marketData.txns24h : etherscanTxCount;

        // Calculate scarcity score
        const scarcityScore = calculateScarcityScore(
            Number(totalSupply), // Using total supply as circulating supply for now
            Number(totalSupply), // Max supply (same as total for most ERC20 tokens)
            marketData.marketCap,
            marketData.fdv
        );

        // Prepare prize data
        const prizeDatas = {
            ca: tokenAddress,
            token_name: name,
            symbol: symbol,
            decimals: Number(decimals),
            price: priceUsd,
            default_image: "chain-logo.svg", // You can update this
            icon: coinIcons[tokenAddress] || `https://tokens.pancakeswap.finance/images/${getAddress(tokenAddress)}.png`,
            listed_DEX: "PancakeSwap", // Default DEX
            telegram: "",
            twitter: "",
            discord: "",
        };

        // Prepare token details
        const tokenDetails = {
            ca: tokenAddress,
            listed_DEX: "PancakeSwap",
            token_symbol: symbol,
            max_supply: Number(totalSupply),
            total_supply: Number(totalSupply),
            circulating_supply: Number(totalSupply), // You might want to get this from an API
            fdv: marketData.fdv > 0 ? marketData.fdv : Number(totalSupply) * priceUsd,
            market_cap: marketData.marketCap > 0 ? marketData.marketCap : Number(totalSupply) * priceUsd,
            scarcityScore: scarcityScore,
            totalVolume: marketData.volume24h,
            holders: 0, // You might want to get this from an API
            price: priceUsd,
            price_usd: priceUsd,
            liquidity: marketData.liquidity,
            volume_24h: marketData.volume24h,
            tradeVolumeRatio: marketData.liquidity > 0 ? marketData.volume24h / marketData.liquidity : 0,
            tradeVolumeRatio_dex: marketData.liquidity > 0 ? marketData.volume24h / marketData.liquidity : 0,
            txns: finalTxCount,
            txns_24h: finalTxCount,
        };

        return {
            prizeDatas,
            tokenDetails,
            balance: Number(balance),
            balanceAmount: balance.toString()
        };
    } catch (error) {
        safeLogError('fetch_ethereum_token_data', error, {
            tokenAddressPrefix: tokenAddress.slice(0, 10)
        });
        return null;
    }
};

// Keep the existing setProbability function as it's network-agnostic
export const setProbability = async () => {
    const prizes = await prisma.prize.findMany({
        where: {
            flag: true,
        }
    });
    const probability = 100 / prizes.length;
    for (const prize of prizes) {
        const onetimeBalance = prize.quantity / (prize.price || 1);
        const real_balance = prize.balance / (10 ** prize.decimals);
        if (onetimeBalance >= real_balance) {
            prize.probability = 0.0001;
        } else {
            prize.probability = probability;
        }
        const updatedData = {
            ...prize,
        };
        await prisma.prize.update({
            where: {
                id: prize.id
            },
            data: updatedData
        });
    }
};

// Function to get 24h transaction count from Etherscan API
const getTokenTransactionCount24h = async (tokenAddress: string): Promise<number> => {
    try {
        const endTime = Math.floor(moment.utc().valueOf() / 1000);
        const startTime = endTime - (24 * 3600); // 24 hours ago

        const url = `${ETHERSCAN_API_URL}&module=account&action=tokentx&address=${adminWalletAddress}&page=1&offset=100&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

        const response = await axios.get(url);
        const data = response.data;

        if (data.status === '1' && data.result) {
            // Filter transactions within the last 24 hours
            const recentTransactions = data.result.filter((tx: any) => {
                const txTime = parseInt(tx.timeStamp);
                return txTime >= startTime && txTime <= endTime;
            });

            return recentTransactions.length;
        }

        return 0;
    } catch (error) {
        safeLogError('fetch_token_transaction_count_24h', error, {
            tokenAddressPrefix: tokenAddress.slice(0, 10)
        });
        return 0;
    }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default { registerAllEthereumTokens, setProbability };
