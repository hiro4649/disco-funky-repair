import { ethers } from 'ethers';
import getTokenBalance from "../lib/getToken";
import getTokenPrice from "../lib/getTokenPrice";
import {
    adminWalletAddress,
    PRIZE_HOT_WALLET_PRIVATE_KEY,
    PRIZE_TRANSFER_TOKEN_ALLOWLIST,
    QUICKNODE_HTTP_RPC_URL,
    TOKEN_CONTRACT_ADDRESS
} from "../config/env";

export type PrizeTransferReceiptStatus = 'RECEIVED' | 'BROADCASTED' | 'MANUAL_REVIEW';

export type PrizeTransferEvidence = {
    txHash: string;
    chainId: number;
    from: string | null;
    to: string | null;
    contractAddress: string;
    blockNumber: string | null;
    receiptStatus: number | null;
    receiptTimestamp: Date | null;
    publicAmount: string;
};

export type PrizeTransferResult = {
    txHash: string;
    evidence: PrizeTransferEvidence;
};

export type PrizeTransferReceiptResult = {
    status: PrizeTransferReceiptStatus;
    evidence: PrizeTransferEvidence;
};

type PrizeTransferError = Error & {
    txHash?: string;
    evidence?: PrizeTransferEvidence;
};

type PrizeTransferEvidenceContext = {
    recipientAddress?: string | null;
    tokenAddress?: string | null;
    publicAmount?: bigint | string | null;
};

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

const getPrizeTransferTokenAllowlist = (): Set<string> => new Set(
    PRIZE_TRANSFER_TOKEN_ALLOWLIST
        .split(',')
        .map((address) => address.trim().toLowerCase())
        .filter(Boolean)
);

export const isPrizeTransferTokenAllowed = (tokenAddress?: string): boolean => {
    const erc20 = tokenAddress || TOKEN_CONTRACT_ADDRESS;
    if (!erc20 || !ethers.isAddress(erc20)) {
        return false;
    }

    return getPrizeTransferTokenAllowlist().has(erc20.toLowerCase());
};

const getProviderChainId = async (provider: ethers.JsonRpcProvider): Promise<number> => {
    const network = await provider.getNetwork();
    return Number(network.chainId);
};

const getReceiptTimestamp = async (
    provider: ethers.JsonRpcProvider,
    blockNumber: number
): Promise<Date | null> => {
    const block = await provider.getBlock(blockNumber);
    return block ? new Date(Number(block.timestamp) * 1000) : null;
};

const buildPrizeTransferEvidence = (
    txHash: string,
    chainId: number,
    from: string | null,
    to: string | null,
    contractAddress: string,
    publicAmount: bigint | string,
    receipt?: { blockNumber?: number | null; status?: number | null } | null,
    receiptTimestamp?: Date | null
): PrizeTransferEvidence => ({
    txHash,
    chainId,
    from,
    to,
    contractAddress,
    blockNumber: receipt?.blockNumber === undefined || receipt?.blockNumber === null
        ? null
        : receipt.blockNumber.toString(),
    receiptStatus: receipt?.status === undefined ? null : receipt.status,
    receiptTimestamp: receiptTimestamp ?? null,
    publicAmount: publicAmount.toString()
});

export const sendTokensToWallet = async (
    userWalletAddress: string,
    tokenAmount: bigint,
    tokenAddress?: string
): Promise<PrizeTransferResult> => {
    if (!QUICKNODE_HTTP_RPC_URL) {
        throw new Error('Missing QUICKNODE_HTTP_RPC_URL');
    }
    if (!PRIZE_HOT_WALLET_PRIVATE_KEY) {
        throw new Error('Prize hot wallet private key is not configured');
    }
    if (!userWalletAddress || !tokenAmount) {
        throw new Error('Specify the recipient address and amount');
    }

    const erc20 = tokenAddress || TOKEN_CONTRACT_ADDRESS;
    if (!erc20) {
        throw new Error('ERC-20 token address is not configured');
    }
    if (!isPrizeTransferTokenAllowed(erc20)) {
        throw new Error('Prize transfer token is not allowlisted');
    }

    const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
    const wallet = new ethers.Wallet(PRIZE_HOT_WALLET_PRIVATE_KEY, provider);
    const chainId = await getProviderChainId(provider);
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
        if (!receipt || receipt.status !== 1) {
            const receiptError = new Error('Token transfer receipt was not successful') as PrizeTransferError;
            receiptError.txHash = tx.hash;
            receiptError.evidence = buildPrizeTransferEvidence(
                tx.hash,
                chainId,
                wallet.address,
                userWalletAddress,
                erc20,
                tokenAmount,
                receipt
            );
            throw receiptError;
        }
        const receiptTimestamp = await getReceiptTimestamp(provider, receipt.blockNumber);
        if (!receiptTimestamp) {
            const receiptError = new Error('Token transfer receipt block was not available') as PrizeTransferError;
            receiptError.txHash = tx.hash;
            receiptError.evidence = buildPrizeTransferEvidence(
                tx.hash,
                chainId,
                wallet.address,
                userWalletAddress,
                erc20,
                tokenAmount,
                receipt
            );
            throw receiptError;
        }
        return {
            txHash: receipt.hash,
            evidence: buildPrizeTransferEvidence(
                receipt.hash,
                chainId,
                wallet.address,
                userWalletAddress,
                erc20,
                tokenAmount,
                receipt,
                receiptTimestamp
            )
        };
    } catch (error) {
        if (error instanceof Error && !('txHash' in error)) {
            const transferError = error as PrizeTransferError;
            transferError.txHash = tx.hash;
            transferError.evidence = buildPrizeTransferEvidence(
                tx.hash,
                chainId,
                wallet.address,
                userWalletAddress,
                erc20,
                tokenAmount
            );
        }
        throw error;
    }
};

export const getPrizeTransferReceiptEvidence = async (
    txHash: string,
    context: PrizeTransferEvidenceContext = {}
): Promise<PrizeTransferReceiptResult> => {
    if (!QUICKNODE_HTTP_RPC_URL) {
        throw new Error('Missing QUICKNODE_HTTP_RPC_URL');
    }
    const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
    const chainId = await getProviderChainId(provider);
    const receipt = await provider.getTransactionReceipt(txHash);
    const tokenAddress = context.tokenAddress || TOKEN_CONTRACT_ADDRESS || '';
    const publicAmount = context.publicAmount ?? '';

    if (!receipt) {
        return {
            status: 'BROADCASTED',
            evidence: buildPrizeTransferEvidence(
                txHash,
                chainId,
                null,
                context.recipientAddress ?? null,
                tokenAddress,
                publicAmount
            )
        };
    }

    const receiptTimestamp = await getReceiptTimestamp(provider, receipt.blockNumber);
    const status = receipt.status === 1 ? 'RECEIVED' : 'MANUAL_REVIEW';

    return {
        status,
        evidence: buildPrizeTransferEvidence(
            txHash,
            chainId,
            receipt.from ?? null,
            context.recipientAddress ?? null,
            tokenAddress,
            publicAmount,
            receipt,
            receiptTimestamp
        )
    };
};

export const getTransactionReceiptStatus = async (txHash: string): Promise<PrizeTransferReceiptStatus> => {
    const receiptResult = await getPrizeTransferReceiptEvidence(txHash);
    return receiptResult.status;
};

export const requestRPC = 'https://api.dexscreener.com/latest/dex/tokens/';
export const requestAPI = 'https://suiscan.xyz/api/sui-backend/mainnet/api/coins/';
