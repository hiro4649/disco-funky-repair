import { ethers } from 'ethers';
import getTokenBalance from "../lib/getToken";
import getTokenPrice from "../lib/getTokenPrice";
import { adminWalletAddress, ADMIN_PRIVATE_KEY, QUICKNODE_HTTP_RPC_URL, TOKEN_CONTRACT_ADDRESS } from "../config/env";
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
    tokenAddress?: string
): Promise<string> => {
    if (!QUICKNODE_HTTP_RPC_URL) {
        throw new Error('Missing QUICKNODE_HTTP_RPC_URL');
    }
    if (!ADMIN_PRIVATE_KEY) {
        throw new Error('Operator private key is not defined');
    }
    if (!userWalletAddress || !tokenAmount) {
        throw new Error('Specify the recipient address and amount');
    }

    const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

    const erc20 = tokenAddress || TOKEN_CONTRACT_ADDRESS;
    if (!erc20) {
        throw new Error('ERC-20 token address is not configured');
    }
    const erc20Abi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function balanceOf(address account) view returns (uint256)'
    ];
    const contract = new ethers.Contract(erc20, erc20Abi, wallet);

    // Check operator token balance first
    const operatorBalance: bigint = await contract.balanceOf(wallet.address);
    if (operatorBalance < tokenAmount) {
        throw new Error('Insufficient token balance for transfer');
    }

    // Optional: ensure operator has gas balance
    const nativeBalance: bigint = await provider.getBalance(wallet.address);
    if (nativeBalance === BigInt(0)) {
        throw new Error('Insufficient native balance to pay gas');
    }

    const estimatedGas = await contract.transfer.estimateGas(userWalletAddress, tokenAmount);
    const feeData = await provider.getFeeData();

    const tx = await contract.transfer(userWalletAddress, tokenAmount, {
        gasLimit: estimatedGas,
        gasPrice: feeData.gasPrice || undefined
    });
    try {
        const receipt = await tx.wait();
        if (receipt?.status !== 1) {
            const receiptError = new Error('Token transfer receipt was not successful') as Error & { txHash?: string };
            receiptError.txHash = tx.hash;
            throw receiptError;
        }
        return receipt.hash;
    } catch (error) {
        if (error instanceof Error && !('txHash' in error)) {
            (error as Error & { txHash?: string }).txHash = tx.hash;
        }
        throw error;
    }
};

export const getTransactionReceiptStatus = async (txHash: string): Promise<'RECEIVED' | 'BROADCASTED' | 'MANUAL_REVIEW'> => {
    if (!QUICKNODE_HTTP_RPC_URL) {
        throw new Error('Missing QUICKNODE_HTTP_RPC_URL');
    }
    const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
        return 'BROADCASTED';
    }

    return receipt.status === 1 ? 'RECEIVED' : 'MANUAL_REVIEW';
};

export const requestRPC = 'https://api.dexscreener.com/latest/dex/tokens/';
export const requestAPI = 'https://suiscan.xyz/api/sui-backend/mainnet/api/coins/';
