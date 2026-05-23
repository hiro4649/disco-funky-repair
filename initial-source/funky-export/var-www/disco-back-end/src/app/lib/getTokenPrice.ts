import axios from 'axios';

interface DexScreenerResponse {
    pairs: {
        baseToken: {
            address: string;
        };
        priceUsd: string;
    }[];
}
async function getTokenPrice(token_address: string): Promise<string | null> {
    try {
        const response = await axios.get<DexScreenerResponse>(
            `https://api.dexscreener.com/latest/dex/tokens/${token_address}`
        );
        // console.log("response===========>",token_address, response.data.pairs[0].priceUsd);
        
        if(response.status == 200) {
            const data: DexScreenerResponse = response.data;
            const pair = data.pairs.find(pair => pair.baseToken.address === token_address);
            return pair ? pair.priceUsd : null;
        }
        return null;
    } catch (error) {
        return null;
    }
}

export default getTokenPrice;
