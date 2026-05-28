import type { Prisma } from '@prisma/client';
import { ethers } from 'ethers';
import { sanitizeLogText } from '../utils/safeLogger';

export const SCHEDULED_TIER_UPDATE_STATUSES = {
  PENDING: 'PENDING',
  CLAIMED: 'CLAIMED',
  TX_SENT: 'TX_SENT',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
  TIMED_OUT: 'TIMED_OUT',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  CANCELED: 'CANCELED'
} as const;

export type ScheduledTierUpdateStateStatus =
  typeof SCHEDULED_TIER_UPDATE_STATUSES[keyof typeof SCHEDULED_TIER_UPDATE_STATUSES];

export const TIER_UPDATE_SAFE_ERROR_KINDS = [
  'provider_timeout',
  'provider_unavailable',
  'tx_broadcast_failed',
  'tx_receipt_timeout',
  'tx_reverted',
  'insufficient_balance',
  'chain_mismatch',
  'invalid_wallet',
  'lock_timeout',
  'max_attempts_exceeded',
  'manual_review_required',
  'unknown'
] as const;

export type TierUpdateSafeErrorKind = typeof TIER_UPDATE_SAFE_ERROR_KINDS[number];

export const DEFAULT_TIER_UPDATE_LOCK_MS = 15 * 60 * 1000;

type TierUpdateData = Record<string, unknown>;

type DeterministicTierUpdateBatchIdInput = {
  scheduledTierUpdateId: number;
  userId: number;
  expectedTier: number;
  scheduledAt: Date | string;
  source?: string;
};

type ClaimScheduledTierUpdateDataInput = {
  workerId: string;
  now: Date;
  nextAttempt: number;
  lockDurationMs?: number;
};

type TxSentUpdateDataInput = {
  txHash: string;
  txChainId: number;
  txContractAddress: string;
  txFrom: string;
  txTo: string;
  batchId: string;
  sentAt: Date;
};

type ConfirmedUpdateDataInput = {
  txReceiptStatus: number;
  txBlockNumber: bigint | number | string;
  txReceiptTimestamp: Date;
  txGasUsed: bigint | number | string;
  confirmedAt: Date;
};

type FailedUpdateDataInput = {
  safeErrorKind: TierUpdateSafeErrorKind;
  safeSummary?: Prisma.InputJsonValue;
  failedAt: Date;
  status?: Extract<
    ScheduledTierUpdateStateStatus,
    'FAILED' | 'TIMED_OUT' | 'MANUAL_REVIEW'
  >;
};

const TERMINAL_STATUSES: ScheduledTierUpdateStateStatus[] = [
  SCHEDULED_TIER_UPDATE_STATUSES.CONFIRMED,
  SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
  SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT,
  SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW,
  SCHEDULED_TIER_UPDATE_STATUSES.CANCELED
];

const RETRYABLE_STATUSES: ScheduledTierUpdateStateStatus[] = [
  SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
  SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
  SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT
];

const SAFE_IDENTIFIER_PATTERN = /^[a-z0-9_.:-]+$/i;
const UNSAFE_SUMMARY_KEY_PATTERN =
  /^(?:authorization|cookie|databaseUrl|database_url|dbUrl|db_url|endpoint|error|errorMessage|error_message|jwt|message|password|payload|privateKey|private_key|providerResponse|provider_response|rawPayload|raw_payload|rawTx|raw_tx|secret|stack|txHash|tx_hash|url|walletAddress|wallet_address)$/i;
const UNSAFE_SUMMARY_TEXT_PATTERN =
  /\b(?:Bearer\s+[A-Za-z0-9._~+/=-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|postgres(?:ql)?:\/\/|https?:\/\/|wss?:\/\/|raw\s+payload)\b|0x[a-fA-F0-9]{40,}/i;

const normalizeScheduledAt = (scheduledAt: Date | string): string => {
  const value = scheduledAt instanceof Date ? scheduledAt : new Date(scheduledAt);
  if (Number.isNaN(value.getTime())) {
    throw new Error('invalid_tier_update_scheduled_at');
  }

  return value.toISOString();
};

const normalizeWorkerId = (workerId: string): string => {
  if (
    workerId.length === 0 ||
    workerId.length > 128 ||
    !SAFE_IDENTIFIER_PATTERN.test(workerId)
  ) {
    throw new Error('invalid_tier_update_worker_id');
  }

  return workerId;
};

const assertSafeErrorKind: (
  safeErrorKind: string
) => asserts safeErrorKind is TierUpdateSafeErrorKind = (safeErrorKind) => {
  if (!TIER_UPDATE_SAFE_ERROR_KINDS.includes(safeErrorKind as TierUpdateSafeErrorKind)) {
    throw new Error('invalid_tier_update_safe_error_kind');
  }
};

const assertSafeSummary = (value: Prisma.InputJsonValue): void => {
  if (typeof value === 'string') {
    if (
      sanitizeLogText(value) !== value ||
      UNSAFE_SUMMARY_TEXT_PATTERN.test(value)
    ) {
      throw new Error('unsafe_tier_update_safe_summary');
    }
    return;
  }

  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => assertSafeSummary(entry));
    return;
  }

  Object.entries(value).forEach(([key, entry]) => {
    if (UNSAFE_SUMMARY_KEY_PATTERN.test(key)) {
      throw new Error('unsafe_tier_update_safe_summary');
    }
    assertSafeSummary(entry as Prisma.InputJsonValue);
  });
};

const assertTxHash = (txHash: string): void => {
  if (!ethers.isHexString(txHash, 32)) {
    throw new Error('invalid_tier_update_tx_hash');
  }
};

const assertAddress = (address: string, errorCode: string): void => {
  if (!ethers.isAddress(address)) {
    throw new Error(errorCode);
  }
};

const normalizeBigInt = (value: bigint | number | string, errorCode: string): bigint => {
  try {
    return BigInt(value);
  } catch {
    throw new Error(errorCode);
  }
};

export const buildDeterministicTierUpdateBatchId = (
  input: DeterministicTierUpdateBatchIdInput
): string => {
  const source = input.source ?? 'scheduled-tier-update';
  const scheduledAt = normalizeScheduledAt(input.scheduledAt);

  return ethers.id([
    source,
    `scheduledTierUpdate:${input.scheduledTierUpdateId}`,
    `user:${input.userId}`,
    `expectedTier:${input.expectedTier}`,
    `scheduledAt:${scheduledAt}`
  ].join('|'));
};

export const isTerminalScheduledTierStatus = (
  status: ScheduledTierUpdateStateStatus
): boolean => TERMINAL_STATUSES.includes(status);

export const isRetryableScheduledTierStatus = (
  status: ScheduledTierUpdateStateStatus
): boolean => RETRYABLE_STATUSES.includes(status);

export const isLockExpired = (
  lockExpiresAt: Date | string | null | undefined,
  now: Date
): boolean => {
  if (!lockExpiresAt) {
    return true;
  }

  const lockExpiry = lockExpiresAt instanceof Date ? lockExpiresAt : new Date(lockExpiresAt);
  if (Number.isNaN(lockExpiry.getTime())) {
    throw new Error('invalid_tier_update_lock_expiry');
  }

  return lockExpiry.getTime() <= now.getTime();
};

export const buildClaimScheduledTierUpdateData = (
  input: ClaimScheduledTierUpdateDataInput
): TierUpdateData => {
  if (!Number.isInteger(input.nextAttempt) || input.nextAttempt < 1) {
    throw new Error('invalid_tier_update_attempt');
  }

  const workerId = normalizeWorkerId(input.workerId);
  const lockDurationMs = input.lockDurationMs ?? DEFAULT_TIER_UPDATE_LOCK_MS;
  if (!Number.isInteger(lockDurationMs) || lockDurationMs <= 0) {
    throw new Error('invalid_tier_update_lock_duration');
  }

  return {
    status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
    attempt: input.nextAttempt,
    lockedBy: workerId,
    lockedAt: input.now,
    heartbeatAt: input.now,
    lockExpiresAt: new Date(input.now.getTime() + lockDurationMs),
    safeErrorKind: null,
    safeSummary: null
  };
};

export const buildTxSentUpdateData = (
  input: TxSentUpdateDataInput
): TierUpdateData => {
  assertTxHash(input.txHash);
  assertAddress(input.txContractAddress, 'invalid_tier_update_contract_address');
  assertAddress(input.txFrom, 'invalid_tier_update_from_address');
  assertAddress(input.txTo, 'invalid_tier_update_to_address');

  return {
    status: SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT,
    txHash: input.txHash,
    txChainId: input.txChainId,
    txContractAddress: input.txContractAddress,
    txFrom: input.txFrom,
    txTo: input.txTo,
    batchId: input.batchId,
    sentAt: input.sentAt,
    heartbeatAt: input.sentAt
  };
};

export const buildConfirmedUpdateData = (
  input: ConfirmedUpdateDataInput
): TierUpdateData => {
  return {
    status: SCHEDULED_TIER_UPDATE_STATUSES.CONFIRMED,
    processed: true,
    txReceiptStatus: input.txReceiptStatus,
    txBlockNumber: normalizeBigInt(input.txBlockNumber, 'invalid_tier_update_block_number'),
    txReceiptTimestamp: input.txReceiptTimestamp,
    txGasUsed: String(input.txGasUsed),
    confirmedAt: input.confirmedAt,
    heartbeatAt: input.confirmedAt
  };
};

export const buildFailedUpdateData = (
  input: FailedUpdateDataInput
): TierUpdateData => {
  assertSafeErrorKind(input.safeErrorKind);
  const data: TierUpdateData = {
    status: input.status ?? SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
    safeErrorKind: input.safeErrorKind,
    failedAt: input.failedAt,
    heartbeatAt: input.failedAt
  };

  if (input.safeSummary !== undefined) {
    assertSafeSummary(input.safeSummary);
    data.safeSummary = input.safeSummary;
  }

  return data;
};

export const normalizeTierUpdateSafeError = (
  error: unknown
): TierUpdateSafeErrorKind => {
  const text = error instanceof Error
    ? error.message.toLowerCase()
    : typeof error === 'string'
      ? error.toLowerCase()
      : '';

  if (/(timeout|timed out|deadline)/i.test(text)) {
    return 'provider_timeout';
  }
  if (/(insufficient|funds|balance)/i.test(text)) {
    return 'insufficient_balance';
  }
  if (/(revert|reverted|receipt.*failed)/i.test(text)) {
    return 'tx_reverted';
  }
  if (/(chain|network id|wrong network)/i.test(text)) {
    return 'chain_mismatch';
  }
  if (/(unavailable|network|connection|econnreset)/i.test(text)) {
    return 'provider_unavailable';
  }
  if (/(invalid.*wallet|invalid.*address|bad address)/i.test(text)) {
    return 'invalid_wallet';
  }

  return 'unknown';
};
