import type {
    TierUpdateReceiptEvidence,
    TierUpdateReceiptFetcher,
    TierUpdateReceiptReconciliationLogger
} from './tierUpdateReceiptReconciliationService';

const TX_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export type TierUpdateReadOnlyReceiptClient = {
    getTransactionReceipt(txHash: string): Promise<unknown>;
};

export type TierUpdateReceiptFetcherSafeErrorKind =
    | 'receipt_not_found'
    | 'receipt_fetch_timeout'
    | 'receipt_fetch_failed'
    | 'invalid_tx_hash'
    | 'tx_hash_mismatch'
    | 'chain_mismatch'
    | 'contract_mismatch'
    | 'invalid_receipt_status'
    | 'unsafe_receipt_payload';

export type SafeTierUpdateReceipt = TierUpdateReceiptEvidence & {
    found: boolean;
    status: 0 | 1 | null;
    transactionHash: string | null;
    chainId: number | null;
    blockNumber: number | null;
    confirmations: number | null;
    gasUsed: string | null;
    effectiveGasPrice: string | null;
    to: string | null;
    from: string | null;
    contractAddress: string | null;
    safeErrorKind: TierUpdateReceiptFetcherSafeErrorKind | null;
    safeSummaryOnly: true;
};

export type FetchTierUpdateReceiptSafeInput = {
    client: TierUpdateReadOnlyReceiptClient;
    txHash: string;
    expectedChainId?: number;
    expectedContractAddress?: string;
    timeoutMs?: number;
    logger?: TierUpdateReceiptReconciliationLogger;
};

export type CreateTierUpdateReceiptFetcherInput = {
    readOnlyReceiptClient: TierUpdateReadOnlyReceiptClient;
    expectedChainId?: number;
    expectedContractAddress?: string;
    timeoutMs?: number;
    logger?: TierUpdateReceiptReconciliationLogger;
};

type ReceiptRecord = Record<string, unknown>;

const isObjectRecord = (value: unknown): value is ReceiptRecord =>
    value !== null && typeof value === 'object';

const makeSafeReceipt = (
    found: boolean,
    safeErrorKind: TierUpdateReceiptFetcherSafeErrorKind | null,
    overrides: Partial<
        Omit<
            SafeTierUpdateReceipt,
            'found' | 'safeErrorKind' | 'safeSummaryOnly'
        >
    > = {}
): SafeTierUpdateReceipt => ({
    found,
    status: overrides.status ?? null,
    transactionHash: overrides.transactionHash ?? null,
    chainId: overrides.chainId ?? null,
    blockNumber: overrides.blockNumber ?? null,
    confirmations: overrides.confirmations ?? null,
    gasUsed: overrides.gasUsed ?? null,
    effectiveGasPrice: overrides.effectiveGasPrice ?? null,
    to: overrides.to ?? null,
    from: overrides.from ?? null,
    contractAddress: overrides.contractAddress ?? null,
    safeErrorKind,
    safeSummaryOnly: true
});

const isTxHash = (value: string): boolean => TX_HASH_PATTERN.test(value);

const normalizeTxHash = (value: unknown): string | null =>
    typeof value === 'string' && isTxHash(value) ? value : null;

const normalizeAddress = (value: unknown): string | null =>
    typeof value === 'string' && ADDRESS_PATTERN.test(value) ? value : null;

const normalizeComparableAddress = (value: unknown): string | null => {
    const address = normalizeAddress(value);
    return address === null ? null : address.toLowerCase();
};

const parseNonNegativeBigInt = (value: unknown): bigint | null => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    try {
        if (typeof value === 'number') {
            if (!Number.isSafeInteger(value) || value < 0) {
                return null;
            }
            return BigInt(value);
        }

        if (typeof value === 'bigint') {
            return value >= 0n ? value : null;
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!/^(?:0x[a-fA-F0-9]+|\d+)$/.test(trimmed)) {
                return null;
            }
            const normalized = BigInt(trimmed);
            return normalized >= 0n ? normalized : null;
        }
    } catch {
        return null;
    }

    return null;
};

const normalizeSafeInteger = (value: unknown): number | null => {
    const bigintValue = parseNonNegativeBigInt(value);
    if (bigintValue === null || bigintValue > BigInt(Number.MAX_SAFE_INTEGER)) {
        return null;
    }

    return Number(bigintValue);
};

const normalizeNumericText = (value: unknown): string | null => {
    const bigintValue = parseNonNegativeBigInt(value);
    return bigintValue === null ? null : bigintValue.toString();
};

const normalizeStatus = (value: unknown): 0 | 1 | null => {
    const normalized = normalizeSafeInteger(value);
    return normalized === 0 || normalized === 1 ? normalized : null;
};

const normalizeReceipt = (receipt: ReceiptRecord): SafeTierUpdateReceipt =>
    makeSafeReceipt(true, null, {
        status: normalizeStatus(receipt.status),
        transactionHash: normalizeTxHash(
            receipt.transactionHash ?? receipt.hash
        ),
        chainId: normalizeSafeInteger(receipt.chainId),
        blockNumber: normalizeSafeInteger(receipt.blockNumber),
        confirmations: normalizeSafeInteger(receipt.confirmations),
        gasUsed: normalizeNumericText(receipt.gasUsed),
        effectiveGasPrice: normalizeNumericText(receipt.effectiveGasPrice),
        to: normalizeAddress(receipt.to),
        from: normalizeAddress(receipt.from),
        contractAddress: normalizeAddress(receipt.contractAddress)
    });

const withSafeErrorKind = (
    receipt: SafeTierUpdateReceipt,
    safeErrorKind: TierUpdateReceiptFetcherSafeErrorKind | null
): SafeTierUpdateReceipt => ({
    ...receipt,
    safeErrorKind
});

const classifySafeReceipt = (
    receipt: SafeTierUpdateReceipt,
    input: Pick<
        FetchTierUpdateReceiptSafeInput,
        'txHash' | 'expectedChainId' | 'expectedContractAddress'
    >
): SafeTierUpdateReceipt => {
    if (
        receipt.transactionHash === null ||
        receipt.transactionHash.toLowerCase() !== input.txHash.toLowerCase()
    ) {
        return withSafeErrorKind(receipt, 'tx_hash_mismatch');
    }

    const expectedChainId = normalizeSafeInteger(input.expectedChainId);
    if (
        input.expectedChainId !== undefined &&
        (expectedChainId === null ||
            (receipt.chainId !== null && receipt.chainId !== expectedChainId))
    ) {
        return withSafeErrorKind(receipt, 'chain_mismatch');
    }

    const expectedContractAddress = normalizeComparableAddress(
        input.expectedContractAddress
    );
    const receiptTargetAddress = normalizeComparableAddress(
        receipt.to ?? receipt.contractAddress
    );
    if (
        input.expectedContractAddress !== undefined &&
        (expectedContractAddress === null ||
            (receiptTargetAddress !== null &&
                receiptTargetAddress !== expectedContractAddress))
    ) {
        return withSafeErrorKind(receipt, 'contract_mismatch');
    }

    if (receipt.status === null) {
        return withSafeErrorKind(receipt, 'invalid_receipt_status');
    }

    return receipt;
};

const resolveWithTimeout = async (
    client: TierUpdateReadOnlyReceiptClient,
    txHash: string,
    timeoutMs?: number
): Promise<
    { status: 'resolved'; receipt: unknown } | { status: 'timeout' }
> => {
    if (timeoutMs === undefined) {
        return {
            status: 'resolved',
            receipt: await client.getTransactionReceipt(txHash)
        };
    }

    if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
        return {
            status: 'resolved',
            receipt: await client.getTransactionReceipt(txHash)
        };
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        return await Promise.race([
            client.getTransactionReceipt(txHash).then((receipt) => ({
                status: 'resolved' as const,
                receipt
            })),
            new Promise<{ status: 'timeout' }>((resolve) => {
                timer = setTimeout(
                    () => resolve({ status: 'timeout' }),
                    timeoutMs
                );
            })
        ]);
    } finally {
        if (timer !== undefined) {
            clearTimeout(timer);
        }
    }
};

export const fetchTierUpdateReceiptSafe = async (
    input: FetchTierUpdateReceiptSafeInput
): Promise<SafeTierUpdateReceipt> => {
    if (!isTxHash(input.txHash)) {
        return makeSafeReceipt(false, 'invalid_tx_hash');
    }

    try {
        const fetchResult = await resolveWithTimeout(
            input.client,
            input.txHash,
            input.timeoutMs
        );

        if (fetchResult.status === 'timeout') {
            input.logger?.warn?.('tier_update_receipt_fetch_timeout', {
                safeErrorKind: 'receipt_fetch_timeout'
            });
            return makeSafeReceipt(false, 'receipt_fetch_timeout');
        }

        if (fetchResult.receipt === null || fetchResult.receipt === undefined) {
            return makeSafeReceipt(false, 'receipt_not_found');
        }

        if (!isObjectRecord(fetchResult.receipt)) {
            return makeSafeReceipt(true, 'unsafe_receipt_payload');
        }

        return classifySafeReceipt(
            normalizeReceipt(fetchResult.receipt),
            input
        );
    } catch {
        input.logger?.warn?.('tier_update_receipt_fetch_failed', {
            safeErrorKind: 'receipt_fetch_failed'
        });
        return makeSafeReceipt(false, 'receipt_fetch_failed');
    }
};

export const createTierUpdateReceiptFetcher =
    (input: CreateTierUpdateReceiptFetcherInput): TierUpdateReceiptFetcher =>
    async (txHash: string) => {
        const receipt = await fetchTierUpdateReceiptSafe({
            client: input.readOnlyReceiptClient,
            txHash,
            expectedChainId: input.expectedChainId,
            expectedContractAddress: input.expectedContractAddress,
            timeoutMs: input.timeoutMs,
            logger: input.logger
        });

        if (!receipt.found) {
            return null;
        }

        return receipt;
    };
