import type { Prisma } from '@prisma/client';
import {
  SCHEDULED_TIER_UPDATE_STATUSES,
  type TierUpdateSafeErrorKind
} from './tierUpdateState';
import {
  findPendingReceiptTierUpdates,
  recordTierUpdateConfirmed,
  recordTierUpdateFailed,
  type TierUpdateTxStatePrismaClient
} from './tierUpdateTxStateService';

type ReceiptNumberLike = bigint | number | string;
const TX_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;

export type TierUpdateReceiptEvidence = {
  status?: ReceiptNumberLike | null;
  transactionHash?: string | null;
  blockNumber?: ReceiptNumberLike | null;
  confirmations?: ReceiptNumberLike | null;
  gasUsed?: ReceiptNumberLike | null;
  effectiveGasPrice?: ReceiptNumberLike | null;
  to?: string | null;
  from?: string | null;
  contractAddress?: string | null;
  chainId?: ReceiptNumberLike | null;
  timestamp?: Date | string | number | null;
};

export type TierUpdateReceiptFetcher = (
  txHash: string
) => Promise<TierUpdateReceiptEvidence | null>;

export type TierUpdateReceiptReconciliationLogger = {
  warn?: (message: string, metadata?: Record<string, unknown>) => void;
};

export type ReconcilePendingTierUpdateReceiptsInput = {
  prisma: TierUpdateTxStatePrismaClient;
  receiptFetcher: TierUpdateReceiptFetcher;
  now: Date;
  limit?: number;
  chainId?: number;
  contractAddress?: string;
  logger?: TierUpdateReceiptReconciliationLogger;
};

export type TierUpdateReceiptReconciliationOutcome =
  | 'confirmed'
  | 'failed'
  | 'manual_review'
  | 'pending'
  | 'skipped';

export type TierUpdateReceiptReconciliationItem = {
  scheduledTierUpdateId: number | null;
  outcome: TierUpdateReceiptReconciliationOutcome;
  reason: string;
  stateChanged: boolean;
};

export type TierUpdateReceiptReconciliationResult = {
  scannedCount: number;
  confirmedCount: number;
  failedCount: number;
  manualReviewCount: number;
  pendingCount: number;
  skippedCount: number;
  items: TierUpdateReceiptReconciliationItem[];
};

type PendingReceiptTierUpdateRow = {
  id: number;
  txHash: string | null;
  txChainId?: number | bigint | string | null;
  txContractAddress?: string | null;
};

type NormalizedRow = {
  id: number;
  txHash: string | null;
  txChainId: number | null;
  txContractAddress: string | null;
};

const normalizePositiveId = (value: unknown): number | null => {
  const normalized = Number(value);
  return Number.isSafeInteger(normalized) && normalized > 0 ? normalized : null;
};

const normalizeChainId = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const normalized = typeof value === 'bigint' ? Number(value) : Number(value);
  return Number.isSafeInteger(normalized) && normalized > 0 ? normalized : null;
};

const normalizeText = (value: unknown): string | null => (
  typeof value === 'string' && value.length > 0 ? value : null
);

const normalizeComparableText = (value: unknown): string | null => (
  typeof value === 'string' && value.length > 0 ? value.toLowerCase() : null
);

const normalizeStatus = (value: unknown): 0 | 1 | null => {
  const normalized = typeof value === 'bigint' ? Number(value) : Number(value);
  return normalized === 0 || normalized === 1 ? normalized : null;
};

const isTxHash = (value: string): boolean => TX_HASH_PATTERN.test(value);

const hasReceiptNumber = (value: unknown): value is ReceiptNumberLike => {
  if (value === undefined || value === null || value === '') {
    return false;
  }

  try {
    return BigInt(value as ReceiptNumberLike) >= 0n;
  } catch {
    return false;
  }
};

const normalizeReceiptTimestamp = (
  value: TierUpdateReceiptEvidence['timestamp'],
  fallback: Date
): Date => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = value instanceof Date ? value : new Date(value);
  return Number.isNaN(normalized.getTime()) ? fallback : normalized;
};

const normalizeRow = (row: unknown): NormalizedRow | null => {
  if (row === null || typeof row !== 'object') {
    return null;
  }

  const candidate = row as PendingReceiptTierUpdateRow;
  const id = normalizePositiveId(candidate.id);
  if (id === null) {
    return null;
  }

  return {
    id,
    txHash: normalizeText(candidate.txHash),
    txChainId: normalizeChainId(candidate.txChainId),
    txContractAddress: normalizeText(candidate.txContractAddress)
  };
};

const buildSafeSummary = (
  reason: string,
  retryable: boolean,
  receiptStatus?: 0 | 1
): Prisma.InputJsonObject => ({
  reason,
  retryable,
  ...(receiptStatus === undefined ? {} : { receiptStatus })
});

const markManualReview = async (
  input: ReconcilePendingTierUpdateReceiptsInput,
  row: NormalizedRow,
  reason: string,
  safeErrorKind: TierUpdateSafeErrorKind = 'manual_review_required'
): Promise<void> => {
  await recordTierUpdateFailed({
    prisma: input.prisma,
    scheduledTierUpdateId: row.id,
    safeErrorKind,
    safeSummary: buildSafeSummary(reason, false),
    failedAt: input.now,
    status: SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
  });
};

const markFailed = async (
  input: ReconcilePendingTierUpdateReceiptsInput,
  row: NormalizedRow,
  reason: string,
  receiptStatus: 0
): Promise<void> => {
  await recordTierUpdateFailed({
    prisma: input.prisma,
    scheduledTierUpdateId: row.id,
    safeErrorKind: 'tx_reverted',
    safeSummary: buildSafeSummary(reason, false, receiptStatus),
    failedAt: input.now,
    status: SCHEDULED_TIER_UPDATE_STATUSES.FAILED
  });
};

const shouldManualReviewForExpectedContext = (
  row: NormalizedRow,
  input: ReconcilePendingTierUpdateReceiptsInput
): { reason: string; safeErrorKind: TierUpdateSafeErrorKind } | null => {
  const expectedChainId = normalizeChainId(input.chainId);
  if (
    expectedChainId !== null &&
    row.txChainId !== null &&
    row.txChainId !== expectedChainId
  ) {
    return { reason: 'chain_mismatch', safeErrorKind: 'chain_mismatch' };
  }

  const expectedContractAddress = normalizeComparableText(input.contractAddress);
  const rowContractAddress = normalizeComparableText(row.txContractAddress);
  if (
    expectedContractAddress !== null &&
    rowContractAddress !== null &&
    rowContractAddress !== expectedContractAddress
  ) {
    return {
      reason: 'contract_address_mismatch',
      safeErrorKind: 'manual_review_required'
    };
  }

  return null;
};

const shouldManualReviewForReceipt = (
  row: NormalizedRow,
  receipt: TierUpdateReceiptEvidence,
  input: ReconcilePendingTierUpdateReceiptsInput
): { reason: string; safeErrorKind: TierUpdateSafeErrorKind } | null => {
  const receiptTxHash = normalizeComparableText(receipt.transactionHash);
  if (receiptTxHash === null || receiptTxHash !== row.txHash?.toLowerCase()) {
    return {
      reason: 'receipt_tx_hash_mismatch',
      safeErrorKind: 'manual_review_required'
    };
  }

  const expectedChainId = row.txChainId ?? normalizeChainId(input.chainId);
  const receiptChainId = normalizeChainId(receipt.chainId);
  if (
    expectedChainId !== null &&
    receiptChainId !== null &&
    receiptChainId !== expectedChainId
  ) {
    return { reason: 'chain_mismatch', safeErrorKind: 'chain_mismatch' };
  }

  const expectedContractAddress = normalizeComparableText(
    row.txContractAddress ?? input.contractAddress
  );
  const receiptTargetAddress = normalizeComparableText(
    receipt.to ?? receipt.contractAddress
  );
  if (
    expectedContractAddress !== null &&
    receiptTargetAddress !== null &&
    receiptTargetAddress !== expectedContractAddress
  ) {
    return {
      reason: 'contract_address_mismatch',
      safeErrorKind: 'manual_review_required'
    };
  }

  return null;
};

const makeResult = (): TierUpdateReceiptReconciliationResult => ({
  scannedCount: 0,
  confirmedCount: 0,
  failedCount: 0,
  manualReviewCount: 0,
  pendingCount: 0,
  skippedCount: 0,
  items: []
});

export const reconcilePendingTierUpdateReceipts = async (
  input: ReconcilePendingTierUpdateReceiptsInput
): Promise<TierUpdateReceiptReconciliationResult> => {
  const result = makeResult();
  const rows = await findPendingReceiptTierUpdates({
    prisma: input.prisma,
    limit: input.limit
  });

  result.scannedCount = rows.length;

  for (const rowValue of rows) {
    const row = normalizeRow(rowValue);
    if (row === null) {
      result.skippedCount += 1;
      result.items.push({
        scheduledTierUpdateId: null,
        outcome: 'skipped',
        reason: 'invalid_pending_receipt_row',
        stateChanged: false
      });
      continue;
    }

    if (row.txHash === null || !isTxHash(row.txHash)) {
      const reason = row.txHash === null ? 'missing_tx_hash' : 'invalid_tx_hash';
      await markManualReview(input, row, reason);
      result.manualReviewCount += 1;
      result.items.push({
        scheduledTierUpdateId: row.id,
        outcome: 'manual_review',
        reason,
        stateChanged: true
      });
      continue;
    }

    const contextReview = shouldManualReviewForExpectedContext(row, input);
    if (contextReview !== null) {
      await markManualReview(
        input,
        row,
        contextReview.reason,
        contextReview.safeErrorKind
      );
      result.manualReviewCount += 1;
      result.items.push({
        scheduledTierUpdateId: row.id,
        outcome: 'manual_review',
        reason: contextReview.reason,
        stateChanged: true
      });
      continue;
    }

    let receipt: TierUpdateReceiptEvidence | null;
    try {
      receipt = await input.receiptFetcher(row.txHash);
    } catch {
      input.logger?.warn?.('tier_update_receipt_fetch_failed', {
        scheduledTierUpdateId: row.id
      });
      result.pendingCount += 1;
      result.items.push({
        scheduledTierUpdateId: row.id,
        outcome: 'pending',
        reason: 'receipt_fetch_failed',
        stateChanged: false
      });
      continue;
    }

    if (receipt === null) {
      result.pendingCount += 1;
      result.items.push({
        scheduledTierUpdateId: row.id,
        outcome: 'pending',
        reason: 'receipt_pending_or_not_found',
        stateChanged: false
      });
      continue;
    }

    const receiptReview = shouldManualReviewForReceipt(row, receipt, input);
    if (receiptReview !== null) {
      await markManualReview(
        input,
        row,
        receiptReview.reason,
        receiptReview.safeErrorKind
      );
      result.manualReviewCount += 1;
      result.items.push({
        scheduledTierUpdateId: row.id,
        outcome: 'manual_review',
        reason: receiptReview.reason,
        stateChanged: true
      });
      continue;
    }

    const receiptStatus = normalizeStatus(receipt.status);
    if (receiptStatus === null) {
      await markManualReview(input, row, 'invalid_receipt_status');
      result.manualReviewCount += 1;
      result.items.push({
        scheduledTierUpdateId: row.id,
        outcome: 'manual_review',
        reason: 'invalid_receipt_status',
        stateChanged: true
      });
      continue;
    }

    if (receiptStatus === 0) {
      await markFailed(input, row, 'receipt_status_failed', receiptStatus);
      result.failedCount += 1;
      result.items.push({
        scheduledTierUpdateId: row.id,
        outcome: 'failed',
        reason: 'receipt_status_failed',
        stateChanged: true
      });
      continue;
    }

    if (!hasReceiptNumber(receipt.blockNumber) || !hasReceiptNumber(receipt.gasUsed)) {
      await markManualReview(input, row, 'invalid_receipt_evidence');
      result.manualReviewCount += 1;
      result.items.push({
        scheduledTierUpdateId: row.id,
        outcome: 'manual_review',
        reason: 'invalid_receipt_evidence',
        stateChanged: true
      });
      continue;
    }

    await recordTierUpdateConfirmed({
      prisma: input.prisma,
      scheduledTierUpdateId: row.id,
      txHash: row.txHash,
      txReceiptStatus: receiptStatus,
      txBlockNumber: receipt.blockNumber,
      txReceiptTimestamp: normalizeReceiptTimestamp(receipt.timestamp, input.now),
      txGasUsed: receipt.gasUsed,
      confirmedAt: input.now
    });
    result.confirmedCount += 1;
    result.items.push({
      scheduledTierUpdateId: row.id,
      outcome: 'confirmed',
      reason: 'receipt_status_confirmed',
      stateChanged: true
    });
  }

  return result;
};
