import { ethers } from 'ethers';
import { QUICKNODE_HTTP_RPC_URL, NFT_CONTRACT_ADDRESS } from '../config/env';
import { safeLogError } from '../utils/safeLogger';
import { withRpcReadTimeout } from '../utils/externalCallTimeout';

// ERC721 ABI for NFT operations
const erc721Abi = [
    'function balanceOf(address owner) view returns (uint256)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function ownerOf(uint256 tokenId) view returns (address)'
];

async function getDiscoNFTEVM(walletAddress: string): Promise<number> {
    if (!QUICKNODE_HTTP_RPC_URL) {
        throw new Error('QUICKNODE_HTTP_RPC_URL is not configured');
    }

    if (!NFT_CONTRACT_ADDRESS) {
        throw new Error('NFT_CONTRACT_ADDRESS is not configured');
    }

    if (!walletAddress) {
        throw new Error('Wallet address is required');
    }

    try {
        const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, erc721Abi, provider);

        // Get the balance of NFTs owned by the wallet
        const balance = await withRpcReadTimeout<bigint>(
            contract.balanceOf(walletAddress),
            'nft_balance_of'
        );
        return Number(balance);
    } catch (error) {
        safeLogError('fetch_disco_nft_balance', error, {
            walletAddressPrefix: walletAddress.slice(0, 10)
        });
        return 0;
    }
}

export default getDiscoNFTEVM;
