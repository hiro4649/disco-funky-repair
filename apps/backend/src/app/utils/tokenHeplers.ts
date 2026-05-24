import { ethers } from 'ethers';
import getTokenBalance from "../lib/getToken";
import getTokenPrice from "../lib/getTokenPrice";
import {
    adminWalletAddress,
    CHAIN_ID,
    PRIZE_HOT_WALLET_PRIVATE_KEY,
    PRIZE_TRANSFER_TOKEN_ALLOWLIST,
    QUICKNODE_HTTP_RPC_URL,
    TOKEN_CONTRACT_ADDRESS
} from "../config/env";
import { safeLogError } from "./safeLogger";

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

type PrizeTransferReceiptLike = {
    blockNumber?: number | null;
    status?: number | null;
    from?: string | null;
    logs?: readonly {
        address?: string | null;
        topics?: readonly string[];
        data?: string | null;
    }[];
};

const ERC20_TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export class PrizeChainIdMismatchError extends Error {
    constructor(actualChainId: number, expectedChainId: number) {
        super(`Provider chainId ${actualChainId} does not match expected CHAIN_ID ${expectedChainId}`);
        this.name = 'PrizeChainIdMismatchError';
    }
}

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
        safeLogError('calculate_token_quantity', error);
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
        safeLogError('fetch_token_balance', error);
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

const getExpectedChainId = (): number => {
    const expectedChainId = Number(CHAIN_ID);
    if (!Number.isInteger(expectedChainId) || expectedChainId <= 0) {
        throw new Error('CHAIN_ID is not configured');
    }
    return expectedChainId;
};

const assertExpectedProviderChainId = (actualChainId: number): void => {
    const expectedChainId = getExpectedChainId();
    if (actualChainId !== expectedChainId) {
        throw new PrizeChainIdMismatchError(actualChainId, expectedChainId);
    }
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

const normalizeAddress = (address?: string | null): string | null => {
    if (!address || !ethers.isAddress(address)) {
        return null;
    }
    return address.toLowerCase();
};

const addressesEqual = (left?: string | null, right?: string | null): boolean => {
    const normalizedLeft = normalizeAddress(left);
    const normalizedRight = normalizeAddress(right);
    return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
};

const normalizePublicAmount = (amount?: bigint | string | null): bigint | null => {
    if (amount === null || amount === undefined) {
        return null;
    }

    if (typeof amount === 'bigint') {
        return amount > 0n ? amount : null;
    }

    const normalizedAmount = amount.trim();
    if (!/^\d+$/.test(normalizedAmount)) {
        return null;
    }

    const amountValue = BigInt(normalizedAmount);
    return amountValue > 0n ? amountValue : null;
};

const topicToAddress = (topic?: string): string | null => {
    if (!topic || !/^0x[0-9a-fA-F]{64}$/.test(topic)) {
        return null;
    }
    return `0x${topic.slice(-40).toLowerCase()}`;
};

const hasExpectedTransferLog = (
    receipt: PrizeTransferReceiptLike,
    tokenAddress: string,
    recipientAddress?: string | null,
    publicAmount?: bigint | string | null
): boolean => {
    const expectedTokenAddress = normalizeAddress(tokenAddress);
    const expectedRecipientAddress = normalizeAddress(recipientAddress);
    const expectedAmount = normalizePublicAmount(publicAmount);

    if (!expectedTokenAddress || !expectedRecipientAddress || expectedAmount === null) {
        return false;
    }

    return (receipt.logs ?? []).some((log) => {
        if (!addressesEqual(log.address, expectedTokenAddress)) {
            return false;
        }
        if (log.topics?.[0]?.toLowerCase() !== ERC20_TRANSFER_EVENT_TOPIC) {
            return false;
        }
        if (topicToAddress(log.topics[2]) !== expectedRecipientAddress) {
            return false;
        }
        if (!log.data || !/^0x[0-9a-fA-F]+$/.test(log.data)) {
            return false;
        }

        try {
            return BigInt(log.data) === expectedAmount;
        } catch {
            return false;
        }
    });
};

const prizeTransferEvidenceMatchesExpected = (
    evidence: PrizeTransferEvidence,
    context: PrizeTransferEvidenceContext,
    expectedChainId: number
): boolean => {
    const expectedTokenAddress = context.tokenAddress || TOKEN_CONTRACT_ADDRESS || '';
    const expectedAmount = normalizePublicAmount(context.publicAmount);

    return (
        evidence.chainId === expectedChainId &&
        addressesEqual(evidence.contractAddress, expectedTokenAddress) &&
        addressesEqual(evidence.to, context.recipientAddress ?? null) &&
        expectedAmount !== null &&
        evidence.publicAmount === expectedAmount.toString()
    );
};

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
    assertExpectedProviderChainId(chainId);
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
        if (!hasExpectedTransferLog(receipt, erc20, userWalletAddress, tokenAmount)) {
            const receiptError = new Error('Token transfer receipt evidence did not match expected transfer') as PrizeTransferError;
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
    const expectedChainId = getExpectedChainId();
    const receipt = await provider.getTransactionReceipt(txHash);
    const tokenAddress = context.tokenAddress || TOKEN_CONTRACT_ADDRESS || '';
    const publicAmount = context.publicAmount ?? '';

    if (!receipt) {
        const evidence = buildPrizeTransferEvidence(
            txHash,
            chainId,
            null,
            context.recipientAddress ?? null,
            tokenAddress,
            publicAmount
        );
        return {
            status: chainId === expectedChainId ? 'BROADCASTED' : 'MANUAL_REVIEW',
            evidence
        };
    }

    const receiptTimestamp = await getReceiptTimestamp(provider, receipt.blockNumber);
    const evidence = buildPrizeTransferEvidence(
        txHash,
        chainId,
        receipt.from ?? null,
        context.recipientAddress ?? null,
        tokenAddress,
        publicAmount,
        receipt,
        receiptTimestamp
    );
    const status = receipt.status === 1 &&
        prizeTransferEvidenceMatchesExpected(evidence, context, expectedChainId) &&
        hasExpectedTransferLog(receipt, tokenAddress, context.recipientAddress, publicAmount)
        ? 'RECEIVED'
        : 'MANUAL_REVIEW';

    return {
        status,
        evidence
    };
};

export const getTransactionReceiptStatus = async (txHash: string): Promise<PrizeTransferReceiptStatus> => {
    const receiptResult = await getPrizeTransferReceiptEvidence(txHash);
    return receiptResult.status;
};

export const requestRPC = 'https://api.dexscreener.com/latest/dex/tokens/';
