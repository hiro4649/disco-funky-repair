import type { Prisma } from '@prisma/client';
import {
  buildConfirmedUpdateData,
  buildFailedUpdateData,
  buildTxSentUpdateData,
  SCHEDULED_TIER_UPDATE_STATUSES,
  type ScheduledTierUpdateStateStatus,
  type TierUpdateSafeErrorKind
} from './tierUpdateState';

const TX_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const BYTES32_PATTERN = /^0x[a-fA-F0-9]{64}$/;
const SUPPORTED_TIER_UPDATE_CHAIN_IDS = new Set([56, 97]);
const MAX_PENDING_RECEIPT_LIMIT = 100;

type ScheduledTierUpdateDelegate = {
  update(args: {
    where: { id: number };
    data: Record<string, unknown>;
  }): Promise<unknown>;
  findUnique(args: {
    where: { id: number };
    select?: Record<string, boolean>;
  }): Promise<{ id: number; txHash: string | null } | null>;
  findFirst(args: {
    where: Record<string, unknown>;
  }): Promise<unknown>;
  findMany(args: {
    where: Record<string, unknown>;
    orderBy?: Array<Record<string, 'asc' | 'desc'>>;
    take?: number;
  }): Promise<unknown[]>;
};

export type TierUpdateTxStatePrismaClient = {
  scheduledTierUpdate: ScheduledTierUpdateDelegate;
};

type TierUpdateByIdInput = {
  prisma: TierUpdateTxStatePrismaClient;
  scheduledTierUpdateId: number;
};

export type RecordTierUpdateTxSentInput = TierUpdateByIdInput & {
  txHash: string;
  txChainId: number;
  txContractAddress: string;
  txFrom: string;
  txTo: string;
  batchId: string;
  sentAt: Date;
};

export type TierUpdateReceiptEvidenceInput = {
  txHash: string;
  txReceiptStatus: number;
  txBlockNumber: bigint | number | string;
  txReceiptTimestamp: Date;
  txGasUsed: bigint | number | string;
};

export type TierUpdateReceiptEvidence = {
  txHash: string;
  txReceiptStatus: number;
  txBlockNumber: bigint;
  txReceiptTimestamp: Date;
  txGasUsed: string;
};

export type RecordTierUpdateConfirmedInput = TierUpdateByIdInput &
  TierUpdateReceiptEvidenceInput & {
    confirmedAt: Date;
  };

export type RecordTierUpdateFailedInput = TierUpdateByIdInput & {
  safeErrorKind: TierUpdateSafeErrorKind;
  safeSummary?: Prisma.InputJsonValue;
  failedAt: Date;
  status?: Extract<
    ScheduledTierUpdateStateStatus,
    'FAILED' | 'TIMED_OUT' | 'MANUAL_REVIEW'
  >;
};

export type FindTierUpdateByTxHashInput = {
  prisma: TierUpdateTxStatePrismaClient;
  txHash: string;
};

export type FindPendingReceiptTierUpdatesInput = {
  prisma: TierUpdateTxStatePrismaClient;
  limit?: number;
};

const assertPositiveId = (id: number): void => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('invalid_scheduled_tier_update_id');
  }
};

const assertSupportedChainId = (chainId: number): void => {
  if (!Number.isInteger(chainId) || !SUPPORTED_TIER_UPDATE_CHAIN_IDS.has(chainId)) {
    throw new Error('invalid_tier_update_chain_id');
  }
};

const assertTxHash = (txHash: string): void => {
  if (!TX_HASH_PATTERN.test(txHash)) {
    throw new Error('invalid_tier_update_tx_hash');
  }
};

const assertAddress = (address: string, errorCode: string): void => {
  if (!ADDRESS_PATTERN.test(address)) {
    throw new Error(errorCode);
  }
};

const assertBatchId = (batchId: string): void => {
  if (!BYTES32_PATTERN.test(batchId)) {
    throw new Error('invalid_tier_update_batch_id');
  }
};

const assertReceiptStatus = (status: number): void => {
  if (status !== 0 && status !== 1) {
    throw new Error('invalid_tier_update_receipt_status');
  }
};

const normalizeBlockNumber = (value: bigint | number | string): bigint => {
  try {
    const blockNumber = BigInt(value);
    if (blockNumber < 0n) {
      throw new Error('invalid_tier_update_block_number');
    }
    return blockNumber;
  } catch {
    throw new Error('invalid_tier_update_block_number');
  }
};

const normalizeGasUsed = (value: bigint | number | string): string => {
  try {
    const gasUsed = BigInt(value);
    if (gasUsed < 0n) {
      throw new Error('invalid_tier_update_gas_used');
    }
    return gasUsed.toString();
  } catch {
    throw new Error('invalid_tier_update_gas_used');
  }
};

const assertReceiptTimestamp = (value: Date): void => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error('invalid_tier_update_receipt_timestamp');
  }
};

const assertDate = (value: Date, errorCode: string): void => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(errorCode);
  }
};

const assertLimit = (limit: number): void => {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PENDING_RECEIPT_LIMIT) {
    throw new Error('invalid_tier_update_receipt_limit');
  }
};

export const buildTierUpdateReceiptEvidence = (
  input: TierUpdateReceiptEvidenceInput
): TierUpdateReceiptEvidence => {
  assertTxHash(input.txHash);
  assertReceiptStatus(input.txReceiptStatus);
  assertReceiptTimestamp(input.txReceiptTimestamp);

  return {
    txHash: input.txHash,
    txReceiptStatus: input.txReceiptStatus,
    txBlockNumber: normalizeBlockNumber(input.txBlockNumber),
    txReceiptTimestamp: input.txReceiptTimestamp,
    txGasUsed: normalizeGasUsed(input.txGasUsed)
  };
};

export const recordTierUpdateTxSent = async (
  input: RecordTierUpdateTxSentInput
): Promise<unknown> => {
  assertPositiveId(input.scheduledTierUpdateId);
  assertTxHash(input.txHash);
  assertSupportedChainId(input.txChainId);
  assertAddress(input.txContractAddress, 'invalid_tier_update_contract_address');
  assertAddress(input.txFrom, 'invalid_tier_update_from_address');
  assertAddress(input.txTo, 'invalid_tier_update_to_address');
  assertBatchId(input.batchId);
  assertDate(input.sentAt, 'invalid_tier_update_sent_at');

  return input.prisma.scheduledTierUpdate.update({
    where: { id: input.scheduledTierUpdateId },
    data: buildTxSentUpdateData({
      txHash: input.txHash,
      txChainId: input.txChainId,
      txContractAddress: input.txContractAddress,
      txFrom: input.txFrom,
      txTo: input.txTo,
      batchId: input.batchId,
      sentAt: input.sentAt
    })
  });
};

export const recordTierUpdateConfirmed = async (
  input: RecordTierUpdateConfirmedInput
): Promise<unknown> => {
  assertPositiveId(input.scheduledTierUpdateId);
  const receiptEvidence = buildTierUpdateReceiptEvidence(input);
  assertDate(input.confirmedAt, 'invalid_tier_update_confirmed_at');

  const existing = await input.prisma.scheduledTierUpdate.findUnique({
    where: { id: input.scheduledTierUpdateId },
    select: { id: true, txHash: true }
  });
  if (!existing?.txHash) {
    throw new Error('tier_update_tx_hash_required_for_confirmation');
  }
  if (existing.txHash.toLowerCase() !== receiptEvidence.txHash.toLowerCase()) {
    throw new Error('tier_update_tx_hash_mismatch');
  }

  return input.prisma.scheduledTierUpdate.update({
    where: { id: input.scheduledTierUpdateId },
    data: buildConfirmedUpdateData({
      txReceiptStatus: receiptEvidence.txReceiptStatus,
      txBlockNumber: receiptEvidence.txBlockNumber,
      txReceiptTimestamp: receiptEvidence.txReceiptTimestamp,
      txGasUsed: receiptEvidence.txGasUsed,
      confirmedAt: input.confirmedAt
    })
  });
};

export const recordTierUpdateFailed = async (
  input: RecordTierUpdateFailedInput
): Promise<unknown> => {
  assertPositiveId(input.scheduledTierUpdateId);
  assertDate(input.failedAt, 'invalid_tier_update_failed_at');

  return input.prisma.scheduledTierUpdate.update({
    where: { id: input.scheduledTierUpdateId },
    data: buildFailedUpdateData({
      safeErrorKind: input.safeErrorKind,
      safeSummary: input.safeSummary,
      failedAt: input.failedAt,
      status: input.status
    })
  });
};

export const findTierUpdateByTxHash = async (
  input: FindTierUpdateByTxHashInput
): Promise<unknown> => {
  assertTxHash(input.txHash);

  return input.prisma.scheduledTierUpdate.findFirst({
    where: { txHash: input.txHash }
  });
};

export const findPendingReceiptTierUpdates = async (
  input: FindPendingReceiptTierUpdatesInput
): Promise<unknown[]> => {
  const limit = input.limit ?? 25;
  assertLimit(limit);

  return input.prisma.scheduledTierUpdate.findMany({
    where: {
      status: SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT,
      txHash: { not: null }
    },
    orderBy: [
      { sentAt: 'asc' },
      { id: 'asc' }
    ],
    take: limit
  });
};
