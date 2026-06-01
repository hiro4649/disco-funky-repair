import fs from 'fs';
import path from 'path';
import {
    createTierUpdateReceiptFetcher,
    fetchTierUpdateReceiptSafe,
    type TierUpdateReadOnlyReceiptClient
} from '../tierUpdateReceiptFetcher';

const txHash = `0x${'a'.repeat(64)}`;
const otherTxHash = `0x${'b'.repeat(64)}`;
const contractAddress = '0x0000000000000000000000000000000000000001';
const otherContractAddress = '0x0000000000000000000000000000000000000002';
const fromAddress = '0x0000000000000000000000000000000000000003';

const backendRoot = path.resolve(__dirname, '../../../../');
const fetcherPath = path.join(
    backendRoot,
    'src/app/lib/tierUpdateReceiptFetcher.ts'
);

const buildClient = (
    receipt: unknown
): jest.Mocked<TierUpdateReadOnlyReceiptClient> => ({
    getTransactionReceipt: jest.fn(async (_txHash: string) => receipt)
});

const fetchSafe = (client: TierUpdateReadOnlyReceiptClient, hash = txHash) =>
    fetchTierUpdateReceiptSafe({
        client,
        txHash: hash,
        expectedChainId: 56,
        expectedContractAddress: contractAddress
    });

describe('tierUpdateReceiptFetcher', () => {
    it('normalizes a valid status 1 receipt to the safe receipt shape', async () => {
        const client = buildClient({
            status: 1,
            transactionHash: txHash,
            chainId: 56,
            blockNumber: 123456,
            confirmations: 3,
            gasUsed: 21000n,
            effectiveGasPrice: '1000000000',
            to: contractAddress,
            from: fromAddress
        });

        const receipt = await fetchSafe(client);

        expect(client.getTransactionReceipt).toHaveBeenCalledWith(txHash);
        expect(receipt).toEqual({
            found: true,
            status: 1,
            transactionHash: txHash,
            chainId: 56,
            blockNumber: 123456,
            confirmations: 3,
            gasUsed: '21000',
            effectiveGasPrice: '1000000000',
            to: contractAddress,
            from: fromAddress,
            contractAddress: null,
            safeErrorKind: null,
            safeSummaryOnly: true
        });
    });

    it('normalizes a valid status 0 receipt without changing it to success', async () => {
        const client = buildClient({
            status: 0,
            transactionHash: txHash,
            chainId: 56,
            blockNumber: '123456',
            confirmations: '1',
            gasUsed: '21000',
            to: contractAddress
        });

        const receipt = await fetchSafe(client);

        expect(receipt).toEqual(
            expect.objectContaining({
                found: true,
                status: 0,
                transactionHash: txHash,
                safeErrorKind: null,
                safeSummaryOnly: true
            })
        );
    });

    it('returns found false for missing receipts', async () => {
        const client = buildClient(null);

        const receipt = await fetchSafe(client);

        expect(receipt).toEqual(
            expect.objectContaining({
                found: false,
                status: null,
                transactionHash: null,
                safeErrorKind: 'receipt_not_found',
                safeSummaryOnly: true
            })
        );
    });

    it('rejects invalid txHash before calling the client', async () => {
        const client = buildClient(null);

        const receipt = await fetchSafe(client, 'not-a-tx-hash');

        expect(client.getTransactionReceipt).not.toHaveBeenCalled();
        expect(receipt).toEqual(
            expect.objectContaining({
                found: false,
                safeErrorKind: 'invalid_tx_hash',
                safeSummaryOnly: true
            })
        );
    });

    it('classifies transactionHash mismatches without returning the original receipt object', async () => {
        const originalReceipt = {
            status: 1,
            transactionHash: otherTxHash,
            chainId: 56,
            blockNumber: 123456,
            gasUsed: 21000,
            to: contractAddress,
            extraField: 'not-returned'
        };
        const client = buildClient(originalReceipt);

        const receipt = await fetchSafe(client);

        expect(receipt).toEqual(
            expect.objectContaining({
                found: true,
                transactionHash: otherTxHash,
                safeErrorKind: 'tx_hash_mismatch',
                safeSummaryOnly: true
            })
        );
        expect(receipt).not.toHaveProperty('extraField');
        expect(receipt).not.toBe(originalReceipt);
    });

    it('classifies chain and contract mismatches as safe errors', async () => {
        const chainMismatch = await fetchSafe(
            buildClient({
                status: 1,
                transactionHash: txHash,
                chainId: 97,
                blockNumber: 123456,
                gasUsed: 21000,
                to: contractAddress
            })
        );

        expect(chainMismatch).toEqual(
            expect.objectContaining({
                safeErrorKind: 'chain_mismatch'
            })
        );

        const contractMismatch = await fetchSafe(
            buildClient({
                status: 1,
                transactionHash: txHash,
                chainId: 56,
                blockNumber: 123456,
                gasUsed: 21000,
                to: otherContractAddress
            })
        );

        expect(contractMismatch).toEqual(
            expect.objectContaining({
                safeErrorKind: 'contract_mismatch'
            })
        );
    });

    it('classifies invalid receipt status and unsafe receipt payloads', async () => {
        const invalidStatus = await fetchSafe(
            buildClient({
                status: 2,
                transactionHash: txHash,
                chainId: 56,
                blockNumber: 123456,
                gasUsed: 21000,
                to: contractAddress
            })
        );

        expect(invalidStatus).toEqual(
            expect.objectContaining({
                found: true,
                status: null,
                safeErrorKind: 'invalid_receipt_status'
            })
        );

        const unsafeReceipt = await fetchSafe(
            buildClient('unexpected-response')
        );

        expect(unsafeReceipt).toEqual(
            expect.objectContaining({
                found: true,
                status: null,
                transactionHash: null,
                safeErrorKind: 'unsafe_receipt_payload',
                safeSummaryOnly: true
            })
        );
    });

    it('classifies provider throw and timeout without returning raw error details', async () => {
        const throwingClient: TierUpdateReadOnlyReceiptClient = {
            getTransactionReceipt: jest.fn(async () => {
                throw new Error(
                    'provider failed with sensitive implementation detail'
                );
            })
        };
        const logger = { warn: jest.fn() };

        const failed = await fetchTierUpdateReceiptSafe({
            client: throwingClient,
            txHash,
            logger
        });

        expect(failed).toEqual(
            expect.objectContaining({
                found: false,
                safeErrorKind: 'receipt_fetch_failed',
                safeSummaryOnly: true
            })
        );
        expect(JSON.stringify(failed)).not.toContain(
            'sensitive implementation detail'
        );
        expect(logger.warn).toHaveBeenCalledWith(
            'tier_update_receipt_fetch_failed',
            { safeErrorKind: 'receipt_fetch_failed' }
        );

        const pendingClient: TierUpdateReadOnlyReceiptClient = {
            getTransactionReceipt: jest.fn(() => new Promise(() => undefined))
        };
        const timeoutLogger = { warn: jest.fn() };
        const timedOut = await fetchTierUpdateReceiptSafe({
            client: pendingClient,
            txHash,
            timeoutMs: 1,
            logger: timeoutLogger
        });

        expect(timedOut).toEqual(
            expect.objectContaining({
                found: false,
                safeErrorKind: 'receipt_fetch_timeout',
                safeSummaryOnly: true
            })
        );
        expect(timeoutLogger.warn).toHaveBeenCalledWith(
            'tier_update_receipt_fetch_timeout',
            { safeErrorKind: 'receipt_fetch_timeout' }
        );
    });

    it('creates a D5A-compatible receiptFetcher from an injected read-only client', async () => {
        const client = buildClient({
            status: 1,
            transactionHash: txHash,
            chainId: 56,
            blockNumber: 123456,
            gasUsed: 21000,
            to: contractAddress
        });

        const receiptFetcher = createTierUpdateReceiptFetcher({
            readOnlyReceiptClient: client,
            expectedChainId: 56,
            expectedContractAddress: contractAddress
        });

        const receipt = await receiptFetcher(txHash);

        expect(receipt).toEqual(
            expect.objectContaining({
                status: 1,
                transactionHash: txHash,
                chainId: 56,
                safeSummaryOnly: true
            })
        );

        const missingReceiptFetcher = createTierUpdateReceiptFetcher({
            readOnlyReceiptClient: buildClient(null),
            expectedChainId: 56,
            expectedContractAddress: contractAddress
        });
        expect(await missingReceiptFetcher(otherTxHash)).toBeNull();
    });

    it('keeps the adapter disconnected from RPC construction, routes, cron, runtime startup, and tx send code', () => {
        const source = fs.readFileSync(fetcherPath, 'utf8');

        expect(source).toContain('readOnlyReceiptClient');
        expect(source).toContain('getTransactionReceipt');
        expect(source).not.toContain('process.env');
        expect(source).not.toContain('JsonRpcProvider');
        expect(source).not.toContain('new ethers');
        expect(source).not.toContain('Wallet(');
        expect(source).not.toContain('Contract(');
        expect(source).not.toContain('express.Router');
        expect(source).not.toContain('router.');
        expect(source).not.toContain('process.argv');
        expect(source).not.toContain('require.main');
        expect(source).not.toContain('node-cron');
        expect(source).not.toContain('trackingService');
        expect(source).not.toContain('main.ts');
        expect(source).not.toContain('sendTierSyncTransaction');
        expect(source).not.toContain('recordTierUpdateTxSent');
        expect(source).not.toContain('tx.wait');
    });
});
