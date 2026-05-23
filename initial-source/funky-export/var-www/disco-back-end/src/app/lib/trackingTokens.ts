import axios from 'axios';
import {
    adminWalletAddress,
    REGISTER_ALLTOKEN_ADMIN,
    BLOCKBERRY_API_KEY,
    BLOCKBERRY_API_URL
} from "../config/env";
import prisma from '../db/prisma_client';
import { requestRPC, requestAPI } from '../utils/tokenHeplers';

export const registerAllObjects = async () => {
    let allCoins: any;
    const options = {
        method: 'POST',
        url: `${BLOCKBERRY_API_URL ?? ''}accounts/${adminWalletAddress ?? ''}/objects`,
        headers: {
            accept: '*/*',
            'content-type': 'application/json',
            'x-api-key': BLOCKBERRY_API_KEY
        },
        data: { objectTypes: ['coin', 'nft', 'unknown', 'kiosk', 'domains'] }
    };

    try {
        const res = await axios.request(options);
        if (res.data.coins.length < 1) {
            return;
        }
        allCoins = res.data.coins;
        for (const coin of allCoins) {
            console.log('Sleeping for 10 seconds...');
            await sleep(30000); // The reason that status of res is 429 or 403.
            const prizeTokenDatas: any = await fetchTokenData(coin.coinType);
            if (prizeTokenDatas === -1) {
                console.log("Token Data Fetch Failed");
                continue;
            }
            const existPrizes = await prisma.prize.findMany({
                where: {
                    ca: coin.coinType
                }
            });
            if (existPrizes.length === 0) {
                await prisma.prize.create({
                    data: {
                        ...prizeTokenDatas.prizeDatas,
                        ranking: 0,
                        quantity: 0,
                        real_probability: 0,
                        probability: 0,
                        saved_probability: 0,
                        earned_pts: 0,
                        balance: coin.totalBalance,
                    }
                });
            } else {
                for (const existPrize of existPrizes) {
                    await prisma.prize.update({
                        where: {
                            id: existPrize.id,
                        },
                        data: {
                            ...prizeTokenDatas.prizeDatas,
                            balance: coin.totalBalance,
                        }
                    });
                }
            }
            await prisma.tokenDetail.upsert({
                where: { ca: coin.coinType },
                create: prizeTokenDatas.tokenDetails,
                update: prizeTokenDatas.tokenDetails,
            });
        }
    } catch (err: any) {
        console.error(err);
    }
};

const fetchTokenData = async (coinType: string) => {
    try {
        let resTokenData: any;
        let resDEXdata: any;
        const nessessoryTokenDatas: any = { prizeDatas: {}, tokenDetails: {} };

        const options = {
            method: 'GET',
            url: `${BLOCKBERRY_API_URL}coins/${coinType}`,
            headers: { accept: '*/*', 'x-api-key': BLOCKBERRY_API_KEY }
        };
        const response = await axios.request(options);
        resTokenData = response.data;

        let flagReqSuccess = false;
        do {
            const responseRPC = await axios.get(`${requestRPC + coinType}`);
            if (responseRPC.status === 200) {
                flagReqSuccess = true;
                resDEXdata = responseRPC.data.pairs ? responseRPC.data.pairs[0] : -1;
            }
        } while (!flagReqSuccess);

        nessessoryTokenDatas.prizeDatas.ca = resTokenData.coinType;
        nessessoryTokenDatas.prizeDatas.token_name = resTokenData.coinName;
        nessessoryTokenDatas.prizeDatas.symbol = resTokenData.coinSymbol;
        nessessoryTokenDatas.prizeDatas.decimals = resTokenData.decimals;
        nessessoryTokenDatas.prizeDatas.price = resTokenData.price;
        nessessoryTokenDatas.prizeDatas.default_image = "sui-logo.png";
        nessessoryTokenDatas.prizeDatas.icon = resTokenData.imgUrl;
        nessessoryTokenDatas.prizeDatas.listed_DEX = resDEXdata === -1 ? '' : resDEXdata.dexId;
        nessessoryTokenDatas.prizeDatas.telegram = resDEXdata === -1 ? '' : resDEXdata.info?.socials.find((ele: any) => ele.type === 'telegram')?.url ?? '';
        nessessoryTokenDatas.prizeDatas.twitter = resDEXdata === -1 ? '' : resDEXdata.info?.socials.find((ele: any) => ele.type === 'twitter')?.url ?? '';
        nessessoryTokenDatas.prizeDatas.discord = resDEXdata === -1 ? '' : resDEXdata.info?.socials.find((ele: any) => ele.type === 'discord')?.url ?? '';
        // Here is Dex detail of token
        nessessoryTokenDatas.tokenDetails.ca = coinType;
        nessessoryTokenDatas.tokenDetails.listed_DEX = resDEXdata === -1 ? '' : resDEXdata.dexId;
        nessessoryTokenDatas.tokenDetails.token_symbol = resTokenData.coinSymbol;
        nessessoryTokenDatas.tokenDetails.max_supply = resTokenData.maxSupply ?? resTokenData.supply ?? 0;
        nessessoryTokenDatas.tokenDetails.total_supply = resTokenData.supply ?? 0;
        nessessoryTokenDatas.tokenDetails.circulating_supply = resTokenData.circulatingSupply ?? resTokenData.supply ?? 0;
        nessessoryTokenDatas.tokenDetails.fdv = Number(nessessoryTokenDatas.tokenDetails.max_supply) * Number(resTokenData.price);
        nessessoryTokenDatas.tokenDetails.market_cap = Number(nessessoryTokenDatas.tokenDetails.circulating_supply) * Number(resTokenData.price); // all marketCap of token
        const forscarcityScore: number = (Number(nessessoryTokenDatas.tokenDetails.circulating_supply) / Number(nessessoryTokenDatas.tokenDetails.max_supply));
        nessessoryTokenDatas.tokenDetails.scarcityScore = 1 - (Number.isNaN(forscarcityScore) ? 1 : forscarcityScore);
        nessessoryTokenDatas.tokenDetails.totalVolume = resTokenData.totalVolume ?? 0;
        nessessoryTokenDatas.tokenDetails.holders = resTokenData.holdersCount;
        nessessoryTokenDatas.tokenDetails.price = resDEXdata === -1 ? 0 : Number(resDEXdata.priceNative);
        nessessoryTokenDatas.tokenDetails.price_usd = resDEXdata === -1 ? 0 : Number(resDEXdata.priceUsd);
        nessessoryTokenDatas.tokenDetails.liquidity = resDEXdata === -1 ? 0 : Number(resDEXdata.liquidity.usd);
        nessessoryTokenDatas.tokenDetails.volume_24h = resDEXdata === -1 ? 0 : resDEXdata.volume.h24;
        nessessoryTokenDatas.tokenDetails.txns_24h = Number(resDEXdata === -1 ? 0 : resDEXdata.txns.h24.sells) + Number(resDEXdata === -1 ? 0 : resDEXdata.txns.h24.buys); // dex
        nessessoryTokenDatas.tokenDetails.tradeVolumeRatio = (nessessoryTokenDatas.tokenDetails.market_cap === 0) ? 0 : (nessessoryTokenDatas.tokenDetails.volume_24h === 0 ? 0 : nessessoryTokenDatas.tokenDetails.volume_24h) / nessessoryTokenDatas.tokenDetails.market_cap; // all tradeVolumeRatio
        nessessoryTokenDatas.tokenDetails.tradeVolumeRatio_dex = nessessoryTokenDatas.tokenDetails.volume_24h === 0 ? 0 : nessessoryTokenDatas.tokenDetails.volume_24h / nessessoryTokenDatas.tokenDetails.liquidity; // tradeVolumeRatio of DEX
        nessessoryTokenDatas.tokenDetails.txns = await getAllTXNs(coinType);

        return nessessoryTokenDatas;
    } catch (error: any) {
        console.error("Error fetching token data:", error);
        return -1;
    }
};

const getAllTXNs = async (coinType: string): Promise<number> => {
    try {
        const apiUrl = `${requestAPI}${coinType}/transactions/`;
        let reqFlag = false;
        let countTXNs = 0;
        let pageCount = 0;
        const payload = {
            size: 50,
            orderBy: "DESC",
            sortBy: "AGE",
        };
        while (!reqFlag) {
            try {
                const response = await axios.get(apiUrl, {
                    params: { ...payload, page: pageCount },
                    headers: { "Content-Type": "application/json" },
                });
                const transactions = response.data?.content || [];
                countTXNs += transactions.length;
                if (transactions.length < 50) {
                    reqFlag = true;
                }
                pageCount++;
            } catch (error) {
                console.error("API request failed:", error);
                return -1;
            }
        }
        return countTXNs;
    } catch (error) {
        console.error("Unexpected error:", error);
        return -1;
    }
};

const getAllTokensAddress = async () => {
    let requestFlag = false;
    const maxRetries = 10; // Prevent infinite loop
    let attempts = 0;

    const apiUrl = `${REGISTER_ALLTOKEN_ADMIN}${adminWalletAddress}/objects`;
    const payload = {
        objectTypes: ["coin", "nft", "unknown", "kiosk", "domains"],
    };

    while (!requestFlag && attempts < maxRetries) {
        try {
            const response: any = await axios.post(apiUrl, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 200) {
                requestFlag = true;
                return response.data.coins;
            }
        } catch (error) {
            console.error(`API Request Failed (Attempt ${attempts + 1}):`, error);
        }

        attempts++;
    }
    console.warn("Max retry limit reached. Returning empty result.");
    return [];
};

export const setProbability = async () => {
    const prizes = await prisma.prize.findMany({
        where: {
            flag: true,
        }
    });
    const probability = 100 / prizes.length;
    for (const prize of prizes) {
        const onetimeBalance = prize.quantity / prize.price;
        const real_balance = prize.balance / (10 ** prize.decimals);
        if (onetimeBalance >= real_balance) {
            prize.probability = 0.0001;
        } else {
            prize.probability = probability;
        }
        const updatedData = {
            ...prize,
        };
        console.log(updatedData);
        await prisma.prize.update({
            where: {
                id: prize.id
            },
            data: updatedData
        });
    }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { registerAllObjects, setProbability };