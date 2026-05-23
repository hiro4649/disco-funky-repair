import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction, coinWithBalance } from '@mysten/sui/transactions';
import getTokenBalance from "../lib/getToken";
import getTokenPrice from "../lib/getTokenPrice";
import { adminWalletAddress, platformKeypair } from "../config/env";
import prisma from '../db/prisma_client';
import { string } from 'zod';

export const calculateTokenQuantity = async (ca: string, price: number): Promise<number> => {
    try {
        let priceUsd = 0;
        let flagReqSuccess = false;
        do {
            const getPrice = await getTokenPrice(ca) as number | null;
            if(getPrice !== null) {
                flagReqSuccess = true;
                priceUsd = getPrice;
            }else {
                flagReqSuccess = false;
            }
        }
        while (!flagReqSuccess);

        return Math.floor(price / priceUsd);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching token quantity:", error);
    }
    return 0;
};

export const fetchTokenBalance = async (ca: string): Promise<number> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        if (!adminWalletAddress) {
            throw new Error('Admin wallet address is not defined');
        }
        const balance = await getTokenBalance(adminWalletAddress, ca);
        if (typeof balance !== 'number') {
            throw new Error('Token balance is not a number');
        }
        return balance;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching token balance:", error);
        return 0.0;
    }
};

export const sendTokensToWallet = async (
    userWalletAddress: string,
    tokenAmount: bigint,
    tokenType: string
) => {
    const rpcUrl = getFullnodeUrl('mainnet');
    const client = new SuiClient({ url: rpcUrl });

    const OPERATOR_PRIVATE_KEY = platformKeypair; // Use env variable in production
    if (!OPERATOR_PRIVATE_KEY) {
        throw new Error('Operator private key is not defined');
    }
    const operatorKeypair = Ed25519Keypair.fromSecretKey(OPERATOR_PRIVATE_KEY);
    const operatorAddress = operatorKeypair.getPublicKey().toSuiAddress();

    if (!userWalletAddress || !tokenAmount) {
        return 'Specify the recipient address and amount.';
    }

    // Create a transaction
    const txb = new Transaction();
    txb.setSender(operatorAddress);

    // Split the coin and transfer to the recipient
    txb.transferObjects([coinWithBalance({ balance: tokenAmount, type: tokenType }),], txb.pure.address(userWalletAddress));

    // Build and sign the transaction
    const bytes = await txb.build({client}); // Pass client explicitly to resolve transaction data
    const { signature } = await operatorKeypair.signTransaction(bytes);

    // Execute the transaction
    const res = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true, showEvents: true },
    });

    return res;
};

export const requestRPC = 'https://api.dexscreener.com/latest/dex/tokens/';
export const requestAPI = 'https://suiscan.xyz/api/sui-backend/mainnet/api/coins/';