/**
 * Advanced Transaction Classifier
 *
 * Properly categorizes token transactions into:
 * - PURCHASE (buy): User receives tokens (should increase holding date)
 * - SALE (sell): User sends tokens (should decrease via FIFO)
 * - LP_ADD: Adding liquidity to DEX
 * - LP_REMOVE: Removing liquidity from DEX
 * - AIRDROP: Receiving tokens from null/dead address or contract
 * - INTERNAL_TRANSFER: Moving between own wallets (optional to ignore)
 * - SWAP_IN: Receiving from DEX swap
 * - SWAP_OUT: Sending to DEX for swap
 * - CONTRACT_INTERACTION: Other contract-related transfers
 * - UNKNOWN: Unclassified transactions
 *
 * Why this matters:
 * - Accurate FIFO calculation for holding periods
 * - Transparent logic users can understand
 * - Proper handling of DEX interactions
 * - Distinguishes between trading and liquidity provision
 */

import prisma from '../db/prisma_client';


// Known contract addresses (lowercase)
const KNOWN_ADDRESSES = {
    NULL: '0x0000000000000000000000000000000000000000',
    DEAD: '0x000000000000000000000000000000000000dead',

    // Uniswap V2/V3
    UNISWAP_V2_ROUTER: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    UNISWAP_V3_ROUTER: '0xe592427a0aece92de3edee1f18e0157c05861564',
    UNISWAP_V3_ROUTER2: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',

    // PancakeSwap
    PANCAKE_ROUTER_V2: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
    PANCAKE_ROUTER_V3: '0x1b81d678ffb9c0263b24a97847620c99d213eb14',

    // SushiSwap
    SUSHI_ROUTER: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',

    // 1inch
    ONEINCH_V5: '0x1111111254eeb25477b68fb85ed929f73a960582',
};

export enum TransactionType {
    PURCHASE = 'PURCHASE',           // Regular buy/receive
    SALE = 'SALE',                   // Regular sell/send
    LP_ADD = 'LP_ADD',               // Add liquidity to DEX pool
    LP_REMOVE = 'LP_REMOVE',         // Remove liquidity from DEX pool
    AIRDROP = 'AIRDROP',             // Airdrop or minting
    INTERNAL_TRANSFER = 'INTERNAL_TRANSFER', // Between own wallets
    SWAP_IN = 'SWAP_IN',             // Receiving from DEX swap
    SWAP_OUT = 'SWAP_OUT',           // Sending to DEX for swap
    CONTRACT_INTERACTION = 'CONTRACT_INTERACTION', // Other contract calls
    UNKNOWN = 'UNKNOWN'              // Unclassified
}

export enum FIFOImpact {
    INCREASE = 'INCREASE',  // Increases token holdings (buy)
    DECREASE = 'DECREASE',  // Decreases token holdings (sell)
    NEUTRAL = 'NEUTRAL',    // No impact on FIFO (e.g., LP operations if ignored)
    IGNORE = 'IGNORE'       // Completely ignore for holding calculation
}

export interface ClassifiedTransaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    timestamp: number;
    blockNumber: number;
    /** Transaction index within the block (0-based). Used to order same-block txns. */
    transactionIndex?: number;
    type: TransactionType;
    fifoImpact: FIFOImpact;
    reason: string; // Explanation for classification
    metadata?: {
        isDexRouter?: boolean;
        isDexPair?: boolean;
        isContract?: boolean;
        isOwnWallet?: boolean;
        pairAddress?: string;
    };
}

export interface TransactionClassifierConfig {
    userWalletAddresses: string[]; // All known user wallets
    tokenAddress: string;
    treatLPAsNeutral: boolean; // If true, LP operations don't affect FIFO
    treatInternalTransfersAsNeutral: boolean; // If true, ignore transfers between own wallets
    ignoreAirdrops: boolean; // If true, airdrops don't count as purchases
}

/**
 * Get all active DEX addresses from database
 */
async function getActiveDexAddresses(): Promise<Set<string>> {
    const dexList = await prisma.dexList.findMany({
        where: { isActive: true },
        select: { address: true }
    });

    const addresses = new Set<string>();

    // Add known routers
    Object.values(KNOWN_ADDRESSES).forEach(addr => addresses.add(addr.toLowerCase()));

    // Add database DEX addresses
    dexList.forEach(dex => addresses.add(dex.address.toLowerCase()));

    return addresses;
}

/**
 * Check if an address is a contract (heuristic: has code or is known contract)
 */
function isLikelyContract(address: string, knownContracts: Set<string>): boolean {
    const lowerAddr = address.toLowerCase();

    // Check if it's a known contract
    if (knownContracts.has(lowerAddr)) return true;

    // Check if it's null/dead address
    if (lowerAddr === KNOWN_ADDRESSES.NULL || lowerAddr === KNOWN_ADDRESSES.DEAD) return true;

    // Heuristic: if the address appears in multiple transactions as "to" but never as "from",
    // it's likely a contract (this requires transaction history analysis)
    // For now, we'll rely on known addresses and DEX list

    return false;
}

/**
 * Check if transaction involves a DEX pair
 * DEX pairs typically have addresses that start with specific patterns or are in our DEX list
 */
function isDexPair(address: string, dexAddresses: Set<string>): boolean {
    return dexAddresses.has(address.toLowerCase());
}

/**
 * Classify a single transaction
 */
export async function classifyTransaction(
    tx: any,
    config: TransactionClassifierConfig,
    dexAddresses: Set<string>
): Promise<ClassifiedTransaction> {

    const from = tx.from.toLowerCase();
    const to = tx.to.toLowerCase();
    const userWallets = config.userWalletAddresses.map(w => w.toLowerCase());

    const isUserSender = userWallets.includes(from);
    const isUserReceiver = userWallets.includes(to);
    const isFromDex = dexAddresses.has(from);
    const isToDex = dexAddresses.has(to);
    const isFromNull = from === KNOWN_ADDRESSES.NULL || from === KNOWN_ADDRESSES.DEAD;
    const isToNull = to === KNOWN_ADDRESSES.NULL || to === KNOWN_ADDRESSES.DEAD;

    // Parse transaction index (Etherscan: transactionIndex; some APIs: transaction_index)
    const txIndexRaw = tx.transactionIndex ?? tx.transaction_index;
    const txIndex = txIndexRaw != null ? parseInt(String(txIndexRaw), 10) : undefined;
    const transactionIndex = txIndex != null && Number.isInteger(txIndex) ? txIndex : undefined;

    // Base classification object
    const classification: ClassifiedTransaction = {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp: parseInt(tx.timeStamp, 10),
        blockNumber: parseInt(tx.blockNumber, 10),
        transactionIndex,
        type: TransactionType.UNKNOWN,
        fifoImpact: FIFOImpact.NEUTRAL,
        reason: '',
        metadata: {
            isDexRouter: isFromDex || isToDex,
            isContract: isLikelyContract(from, dexAddresses) || isLikelyContract(to, dexAddresses),
            isOwnWallet: isUserSender && isUserReceiver
        }
    };

    // Classification logic (order matters!)

    // 1. BURNING (send to dead address)
    if (isUserSender && isToNull) {
        classification.type = TransactionType.SALE;
        classification.fifoImpact = FIFOImpact.DECREASE;
        classification.reason = 'Token burned (sent to null/dead address)';
        return classification;
    }

    // 2. AIRDROP / MINTING (from null/dead address)
    if (isUserReceiver && isFromNull) {
        classification.type = TransactionType.AIRDROP;
        classification.fifoImpact = config.ignoreAirdrops ? FIFOImpact.IGNORE : FIFOImpact.INCREASE;
        classification.reason = 'Airdrop or token minting';
        return classification;
    }

    // 3. INTERNAL TRANSFER (between own wallets)
    if (isUserSender && isUserReceiver) {
        classification.type = TransactionType.INTERNAL_TRANSFER;
        classification.fifoImpact = config.treatInternalTransfersAsNeutral ? FIFOImpact.IGNORE : FIFOImpact.NEUTRAL;
        classification.reason = 'Transfer between own wallets';
        return classification;
    }

    // 4. DEX SWAP - User receiving from DEX
    if (isUserReceiver && isFromDex) {
        classification.type = TransactionType.SWAP_IN;
        classification.fifoImpact = FIFOImpact.INCREASE;
        classification.reason = `Received tokens from DEX swap (${from.slice(0, 10)}...)`;
        classification.metadata!.pairAddress = from;
        return classification;
    }

    // 5. DEX SWAP - User sending to DEX
    if (isUserSender && isToDex) {
        classification.type = TransactionType.SWAP_OUT;
        classification.fifoImpact = FIFOImpact.DECREASE;
        classification.reason = `Sent tokens to DEX for swap (${to.slice(0, 10)}...)`;
        classification.metadata!.pairAddress = to;
        return classification;
    }

    // 6. LP ADD - Sending tokens to DEX pair (liquidity provision)
    // This is tricky: need to distinguish between LP add and regular swap
    // Heuristic: If sending to DEX pair and NOT a router, likely LP add
    if (isUserSender && isDexPair(to, dexAddresses) && !isDexPair(to, new Set(Object.values(KNOWN_ADDRESSES)))) {
        classification.type = TransactionType.LP_ADD;
        classification.fifoImpact = config.treatLPAsNeutral ? FIFOImpact.NEUTRAL : FIFOImpact.DECREASE;
        classification.reason = `Added liquidity to DEX pair (${to.slice(0, 10)}...)`;
        classification.metadata!.pairAddress = to;
        classification.metadata!.isDexPair = true;
        return classification;
    }

    // 7. LP REMOVE - Receiving tokens from DEX pair
    if (isUserReceiver && isDexPair(from, dexAddresses) && !isDexPair(from, new Set(Object.values(KNOWN_ADDRESSES)))) {
        classification.type = TransactionType.LP_REMOVE;
        classification.fifoImpact = config.treatLPAsNeutral ? FIFOImpact.NEUTRAL : FIFOImpact.INCREASE;
        classification.reason = `Removed liquidity from DEX pair (${from.slice(0, 10)}...)`;
        classification.metadata!.pairAddress = from;
        classification.metadata!.isDexPair = true;
        return classification;
    }

    // 8. CONTRACT INTERACTION - Receiving from contract
    if (isUserReceiver && isLikelyContract(from, dexAddresses)) {
        classification.type = TransactionType.CONTRACT_INTERACTION;
        classification.fifoImpact = FIFOImpact.INCREASE;
        classification.reason = `Received from contract (${from.slice(0, 10)}...)`;
        return classification;
    }

    // 9. CONTRACT INTERACTION - Sending to contract
    if (isUserSender && isLikelyContract(to, dexAddresses)) {
        classification.type = TransactionType.CONTRACT_INTERACTION;
        classification.fifoImpact = FIFOImpact.DECREASE;
        classification.reason = `Sent to contract (${to.slice(0, 10)}...)`;
        return classification;
    }

    // 10. REGULAR PURCHASE - Receiving from EOA
    if (isUserReceiver) {
        classification.type = TransactionType.PURCHASE;
        classification.fifoImpact = FIFOImpact.INCREASE;
        classification.reason = `Purchased/received from ${from.slice(0, 10)}...`;
        return classification;
    }

    // 11. REGULAR SALE - Sending to EOA
    if (isUserSender) {
        classification.type = TransactionType.SALE;
        classification.fifoImpact = FIFOImpact.DECREASE;
        classification.reason = `Sold/sent to ${to.slice(0, 10)}...`;
        return classification;
    }

    // 12. UNKNOWN - Should rarely happen
    classification.type = TransactionType.UNKNOWN;
    classification.fifoImpact = FIFOImpact.NEUTRAL;
    classification.reason = 'Transaction does not involve user wallet';
    return classification;
}

/**
 * Classify all transactions for a user
 */
export async function classifyAllTransactions(
    transactions: any[],
    config: TransactionClassifierConfig
): Promise<ClassifiedTransaction[]> {

    // Load DEX addresses once
    const dexAddresses = await getActiveDexAddresses();

    const classified: ClassifiedTransaction[] = [];

    for (const tx of transactions) {
        const classification = await classifyTransaction(tx, config, dexAddresses);
        classified.push(classification);
    }

    return classified;
}

/**
 * Filter classified transactions for FIFO calculation
 * Returns only transactions that should impact FIFO (purchases and sales)
 */
export function getTransactionsForFIFO(
    classifiedTransactions: ClassifiedTransaction[]
): {
    purchases: ClassifiedTransaction[];
    sales: ClassifiedTransaction[];
    ignored: ClassifiedTransaction[];
} {

    const purchases: ClassifiedTransaction[] = [];
    const sales: ClassifiedTransaction[] = [];
    const ignored: ClassifiedTransaction[] = [];

    for (const tx of classifiedTransactions) {
        if (tx.fifoImpact === FIFOImpact.INCREASE) {
            purchases.push(tx);
        } else if (tx.fifoImpact === FIFOImpact.DECREASE) {
            sales.push(tx);
        } else {
            ignored.push(tx);
        }
    }

    return { purchases, sales, ignored };
}

/**
 * Generate human-readable transaction report
 */
export function generateTransactionReport(
    classified: ClassifiedTransaction[]
): {
    summary: Record<TransactionType, number>;
    fifoImpactSummary: Record<FIFOImpact, number>;
    details: ClassifiedTransaction[];
} {

    const summary: Record<TransactionType, number> = {} as any;
    const fifoImpactSummary: Record<FIFOImpact, number> = {} as any;

    // Initialize counts
    Object.values(TransactionType).forEach(type => summary[type] = 0);
    Object.values(FIFOImpact).forEach(impact => fifoImpactSummary[impact] = 0);

    // Count transactions
    classified.forEach(tx => {
        summary[tx.type]++;
        fifoImpactSummary[tx.fifoImpact]++;
    });

    return {
        summary,
        fifoImpactSummary,
        details: classified
    };
}

export default {
    classifyTransaction,
    classifyAllTransactions,
    getTransactionsForFIFO,
    generateTransactionReport,
    TransactionType,
    FIFOImpact
};