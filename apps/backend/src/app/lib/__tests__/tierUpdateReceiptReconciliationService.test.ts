import fs from 'fs';
import path from 'path';
import { SCHEDULED_TIER_UPDATE_STATUSES } from '../tierUpdateState';
import type { TierUpdateTxStatePrismaClient } from '../tierUpdateTxStateService';

const mockFindPendingReceiptTierUpdates = jest.fn();
const mockRecordTierUpdateConfirmed = jest.fn();
const mockRecordTierUpdateFailed = jest.fn();

jest.mock('../tierUpdateTxStateService', () => ({
  findPendingReceiptTierUpdates: mockFindPendingReceiptTierUpdates,
  recordTierUpdateConfirmed: mockRecordTierUpdateConfirmed,
  recordTierUpdateFailed: mockRecordTierUpdateFailed
}));

import {
  reconcilePendingTierUpdateReceipts,
  type TierUpdateReceiptFetcher
} from '../tierUpdateReceiptReconciliationService';

const txHash = `0x${'a'.repeat(64)}`;
const otherTxHash = `0x${'b'.repeat(64)}`;
const contractAddress = '0x0000000000000000000000000000000000000001';
const otherContractAddress = '0x0000000000000000000000000000000000000002';
const fixedNow = new Date('2026-05-31T00:00:00.000Z');

const backendRoot = path.resolve(__dirname, '../../../../');
const servicePath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateReceiptReconciliationService.ts'
);

const prisma = {} as TierUpdateTxStatePrismaClient;

const buildRow = (overrides: Record<string, unknown> = {}) => ({
  id: 12,
  txHash,
  txChainId: 56,
  txContractAddress: contractAddress,
  status: SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT,
  ...overrides
});

const buildFetcher = (
  receipt: Awaited<ReturnType<TierUpdateReceiptFetcher>>
): jest.MockedFunction<TierUpdateReceiptFetcher> => (
  jest.fn(async (_txHash: string) => receipt) as jest.MockedFunction<TierUpdateReceiptFetcher>
);

const reconcile = async (
  receiptFetcher: jest.MockedFunction<TierUpdateReceiptFetcher>,
  overrides: Record<string, unknown> = {}
) => reconcilePendingTierUpdateReceipts({
  prisma,
  receiptFetcher,
  now: fixedNow,
  limit: 10,
  chainId: 56,
  contractAddress,
  ...overrides
});

describe('tierUpdateReceiptReconciliationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindPendingReceiptTierUpdates.mockResolvedValue([]);
    mockRecordTierUpdateConfirmed.mockResolvedValue({});
    mockRecordTierUpdateFailed.mockResolvedValue({});
  });

  it('fetches TX_SENT rows through findPendingReceiptTierUpdates and leaves missing receipts unchanged', async () => {
    mockFindPendingReceiptTierUpdates.mockResolvedValue([buildRow()]);
    const receiptFetcher = buildFetcher(null);

    const result = await reconcile(receiptFetcher);

    expect(mockFindPendingReceiptTierUpdates).toHaveBeenCalledWith({
      prisma,
      limit: 10
    });
    expect(receiptFetcher).toHaveBeenCalledWith(txHash);
    expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateFailed).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      scannedCount: 1,
      pendingCount: 1,
      confirmedCount: 0,
      failedCount: 0,
      manualReviewCount: 0
    }));
    expect(result.items).toContainEqual({
      scheduledTierUpdateId: 12,
      outcome: 'pending',
      reason: 'receipt_pending_or_not_found',
      stateChanged: false
    });
  });

  it('records confirmed evidence for status 1 receipts', async () => {
    mockFindPendingReceiptTierUpdates.mockResolvedValue([buildRow()]);
    const receiptFetcher = buildFetcher({
      status: 1,
      transactionHash: txHash,
      blockNumber: 123456n,
      gasUsed: '21000',
      chainId: 56,
      to: contractAddress
    });

    const result = await reconcile(receiptFetcher);

    expect(mockRecordTierUpdateConfirmed).toHaveBeenCalledWith({
      prisma,
      scheduledTierUpdateId: 12,
      txHash,
      txReceiptStatus: 1,
      txBlockNumber: 123456n,
      txReceiptTimestamp: fixedNow,
      txGasUsed: '21000',
      confirmedAt: fixedNow
    });
    expect(mockRecordTierUpdateFailed).not.toHaveBeenCalled();
    expect(result.confirmedCount).toBe(1);
  });

  it('records safe failed evidence for status 0 receipts', async () => {
    mockFindPendingReceiptTierUpdates.mockResolvedValue([buildRow()]);
    const receiptFetcher = buildFetcher({
      status: 0,
      transactionHash: txHash,
      blockNumber: 123456n,
      gasUsed: '21000',
      chainId: 56,
      to: contractAddress
    });

    const result = await reconcile(receiptFetcher);

    expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateFailed).toHaveBeenCalledWith({
      prisma,
      scheduledTierUpdateId: 12,
      safeErrorKind: 'tx_reverted',
      safeSummary: {
        reason: 'receipt_status_failed',
        retryable: false,
        receiptStatus: 0
      },
      failedAt: fixedNow,
      status: SCHEDULED_TIER_UPDATE_STATUSES.FAILED
    });
    expect(result.failedCount).toBe(1);
  });

  it('does not confirm txHash mismatches', async () => {
    mockFindPendingReceiptTierUpdates.mockResolvedValue([buildRow()]);
    const receiptFetcher = buildFetcher({
      status: 1,
      transactionHash: otherTxHash,
      blockNumber: 123456n,
      gasUsed: '21000',
      chainId: 56,
      to: contractAddress
    });

    const result = await reconcile(receiptFetcher);

    expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateFailed).toHaveBeenCalledWith(expect.objectContaining({
      scheduledTierUpdateId: 12,
      safeErrorKind: 'manual_review_required',
      safeSummary: {
        reason: 'receipt_tx_hash_mismatch',
        retryable: false
      },
      status: SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
    }));
    expect(result.manualReviewCount).toBe(1);
  });

  it('does not confirm chain or contract mismatches', async () => {
    mockFindPendingReceiptTierUpdates.mockResolvedValueOnce([buildRow()]);
    const chainMismatchFetcher = buildFetcher({
      status: 1,
      transactionHash: txHash,
      blockNumber: 123456n,
      gasUsed: '21000',
      chainId: 97,
      to: contractAddress
    });

    await reconcile(chainMismatchFetcher);

    expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateFailed).toHaveBeenCalledWith(expect.objectContaining({
      safeErrorKind: 'chain_mismatch',
      safeSummary: {
        reason: 'chain_mismatch',
        retryable: false
      },
      status: SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
    }));

    jest.clearAllMocks();
    mockFindPendingReceiptTierUpdates.mockResolvedValueOnce([buildRow()]);
    const contractMismatchFetcher = buildFetcher({
      status: 1,
      transactionHash: txHash,
      blockNumber: 123456n,
      gasUsed: '21000',
      chainId: 56,
      to: otherContractAddress
    });

    await reconcile(contractMismatchFetcher);

    expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateFailed).toHaveBeenCalledWith(expect.objectContaining({
      safeErrorKind: 'manual_review_required',
      safeSummary: {
        reason: 'contract_address_mismatch',
        retryable: false
      },
      status: SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
    }));
  });

  it('classifies missing txHash without fetching a receipt', async () => {
    mockFindPendingReceiptTierUpdates.mockResolvedValue([
      buildRow({ txHash: null })
    ]);
    const receiptFetcher = buildFetcher(null);

    const result = await reconcile(receiptFetcher);

    expect(receiptFetcher).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateFailed).toHaveBeenCalledWith(expect.objectContaining({
      scheduledTierUpdateId: 12,
      safeErrorKind: 'manual_review_required',
      safeSummary: {
        reason: 'missing_tx_hash',
        retryable: false
      },
      status: SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
    }));
    expect(result.manualReviewCount).toBe(1);
  });

  it('classifies invalid txHash and invalid receipt evidence without confirming', async () => {
    mockFindPendingReceiptTierUpdates.mockResolvedValueOnce([
      buildRow({ txHash: 'not-a-tx-hash' })
    ]);
    const invalidTxHashFetcher = buildFetcher(null);

    await reconcile(invalidTxHashFetcher);

    expect(invalidTxHashFetcher).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateFailed).toHaveBeenCalledWith(expect.objectContaining({
      safeErrorKind: 'manual_review_required',
      safeSummary: {
        reason: 'invalid_tx_hash',
        retryable: false
      },
      status: SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
    }));

    jest.clearAllMocks();
    mockFindPendingReceiptTierUpdates.mockResolvedValueOnce([buildRow()]);
    const invalidReceiptFetcher = buildFetcher({
      status: 1,
      transactionHash: txHash,
      blockNumber: 'not-a-block',
      gasUsed: '21000',
      chainId: 56,
      to: contractAddress
    });

    await reconcile(invalidReceiptFetcher);

    expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
    expect(mockRecordTierUpdateFailed).toHaveBeenCalledWith(expect.objectContaining({
      safeErrorKind: 'manual_review_required',
      safeSummary: {
        reason: 'invalid_receipt_evidence',
        retryable: false
      },
      status: SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
    }));
  });

  it('does not store raw receipt payloads in safe summaries', async () => {
    mockFindPendingReceiptTierUpdates.mockResolvedValue([buildRow()]);
    const receiptFetcher = buildFetcher({
      status: 0,
      transactionHash: txHash,
      blockNumber: 123456n,
      gasUsed: '21000',
      chainId: 56,
      to: contractAddress,
      from: otherContractAddress,
      effectiveGasPrice: 2n
    });

    await reconcile(receiptFetcher);

    const failedCall = mockRecordTierUpdateFailed.mock.calls[0][0];
    expect(failedCall.safeSummary).toEqual({
      reason: 'receipt_status_failed',
      retryable: false,
      receiptStatus: 0
    });
    const serializedSummary = JSON.stringify(failedCall.safeSummary);
    expect(serializedSummary).not.toContain(txHash);
    expect(serializedSummary).not.toContain(contractAddress);
    expect(serializedSummary).not.toContain('rawPayload');
    expect(serializedSummary).not.toContain('providerResponse');
  });

  it('keeps reconciliation disconnected from tx send, runtime wiring, and real connections', () => {
    const serviceSource = fs.readFileSync(servicePath, 'utf8');

    expect(serviceSource).toContain('receiptFetcher');
    expect(serviceSource).toContain('findPendingReceiptTierUpdates');
    expect(serviceSource).toContain('recordTierUpdateConfirmed');
    expect(serviceSource).toContain('recordTierUpdateFailed');
    expect(serviceSource).not.toContain('recordTierUpdateTxSent');
    expect(serviceSource).not.toContain('sendTierSyncTransaction');
    expect(serviceSource).not.toContain('JsonRpcProvider');
    expect(serviceSource).not.toContain('new ethers');
    expect(serviceSource).not.toContain('Wallet(');
    expect(serviceSource).not.toContain('JobRun');
    expect(serviceSource).not.toContain('trackingService');
    expect(serviceSource).not.toContain('main.ts');
  });
});
