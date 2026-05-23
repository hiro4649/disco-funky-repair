import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';



async function getDiscoNFT(walletAddress: string, discoNFTType: string): Promise<number> {
    const rpcUrl = getFullnodeUrl('testnet');

    // create a client connected to devnet
    const client = new SuiClient({ url: rpcUrl });

    if (!walletAddress) {
        throw new Error('Wallet address is required');
    }

    try {
        // Fetch all coins in the wallet
        const objects = await client.getOwnedObjects({
            owner: walletAddress,
            options: { showType: true, showContent: true, showDisplay: true },
        });

        // Process the response to find the Disco token (adjust based on the structure of your token)
        const discoNFTs = objects.data.filter((object: any) => {
            return object.data.type === discoNFTType;
        });
        if (discoNFTs) {
            return discoNFTs.length; // Return the balance of Disco token
        } else {
            return 0
        }
    } catch (error) {
        console.error('Error fetching Disco token balance:', error);
        return 0;
    }
}
export default getDiscoNFT;
