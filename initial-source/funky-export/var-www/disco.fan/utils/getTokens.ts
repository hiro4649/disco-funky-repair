import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';



async function getTokenBalance(walletAddress?: string, coinType?: string) {
    const rpcUrl = getFullnodeUrl('mainnet');

    // create a client connected to devnet
    const client = new SuiClient({ url: rpcUrl });

    if (!walletAddress) {
        throw new Error('Wallet address is required');
    }

    try {
        // // Fetch all coins in the wallet
        // const coinsResponse = await client.getAllCoins({ owner: walletAddress });
        // // Process the response to find the Disco token (adjust based on the structure of your token)
        // const discoCoin = coinsResponse.data.filter((coin: any) => {
        //     return coin.coinType === coinType; // Replace with actual Disco token type ID '0x1512fbf99602795c86a2a50bef34d1d6774bb1274cdc6cc21d2af0d6ea11aec9::disco::DISCO'
        // });
        
        // if (discoCoin) {
        //     const balances = discoCoin.map(item => BigInt(item.balance));
        //     const totalBalance = balances.reduce((sum, balance) => sum + BigInt((balance)), BigInt(0));
        //     return totalBalance; // Return the balance of Disco token
        // } else {
        //     return null
        // }
        const balance = await client.getBalance({
            owner: walletAddress,
            coinType: coinType!,

        })
        // Process the response to find the Disco token (adjust based on the structure of your token)
        // const discoCoin = coinsResponse.data.filter((coin: any) => {
        //     return coin.coinType === coinType; // Replace with actual Disco token type ID '0x1512fbf99602795c86a2a50bef34d1d6774bb1274cdc6cc21d2af0d6ea11aec9::disco::DISCO'
        // });
        console.log(balance);
        const totalBalance = balance.totalBalance;

        return totalBalance;
    } catch (error) {
        console.error('Error fetching Disco token balance:', error);
        return null;
    }
}
export default getTokenBalance;
