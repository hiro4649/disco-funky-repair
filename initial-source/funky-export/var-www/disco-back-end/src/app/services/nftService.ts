import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction, coinWithBalance } from '@mysten/sui/transactions';
import { NFTStorage, File } from 'nft.storage';
import fs from 'fs';
import path from 'path';
import { lookup as getType } from 'mime-types';

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_API_KEY || '4903b97b.7c59b042758f4bba81619e6c38f38140';

/**
 * A helper to read a file from a location on disk and return a File object.
 * @param {string} filePath - The path to a file to store
 * @returns {Promise<File>} a File object containing the file content
 */
export const fileFromPath = async (filePath: string): Promise<File> => {
    const content = await fs.promises.readFile(filePath);
    const type = getType(filePath) || 'application/octet-stream';
    return new File([content], path.basename(filePath), { type });
};

/**
 * Uploads the NFT metadata and image to NFTStorage and returns the metadata URI.
 * @param {string} name - The name of the NFT
 * @param {string} description - A description of the NFT
 * @param {string} imagePath - The file path to the image
 * @returns {Promise<string>} - The metadata URI of the stored NFT
 */
export const uploadNFT = async (
    name: string,
    description: string,
    imagePath: string
): Promise<string> => {
    const image = await fileFromPath(imagePath);

    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

    const nftResponse = await nftstorage.store({
        image,
        name,
        description
    });

    return nftResponse.url; // Return the metadata URI
};

// export const mintNFT = async (
//     name: string,
//     description: string,
//     imagePath: string,
//     wallet: string
// ): Promise<string> => {
//     const tx = new Transaction();
//     const payAmount = 1e8;

//     const requiredAmount = mintFee * Number(nftCount) * 1e9;
//     if (Number(balance) < requiredAmount) {
//         return;
//     }
//     tx.setGasBudget(requiredAmount);
//     for (let i = 0; i < Number(nftCount); i++) {
//         const [sui] = tx.splitCoins(tx.gas, [payAmount]);
//         tx.moveCall({
//             target: `${NFT_MINT_PACKAGE_ID}::sui_nft::mint`,
//             arguments: [
//                 tx.object(NFT_PACKAGE_CONFIG_ID),
//                 tx.pure.string('test nft' + i),
//                 tx.pure.string('this field is for description' + i),
//                 tx.pure.string(
//                     'https://ipfs.io/ipfs/QmeMh6arMC7n5Y9SSpvJw9P9ZRokoWAoHbh9VKgCDjMKaV'
//                 ),
//                 sui
//             ]
//         });
//     }

//     await wallet.signAndExecuteTransaction({
//         transaction: tx
//     });
// };
