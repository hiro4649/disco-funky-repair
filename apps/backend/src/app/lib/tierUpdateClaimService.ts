import type { Prisma } from '@prisma/client';
import {
  buildClaimScheduledTierUpdateData,
  buildFailedUpdateData,
  DEFAULT_TIER_UPDATE_LOCK_MS,
  SCHEDULED_TIER_UPDATE_STATUSES,
  type TierUpdateSafeErrorKind
} from './tierUpdateState';

const SAFE_WORKER_ID_PATTERN = /^[a-z0-9_.:-]+$/i;
const DEFAULT_CLAIM_LIMIT = 25;
const MAX_CLAIM_LIMIT = 100;
const DEFAULT_CLAIM_ATTEMPT_LIMIT = 3;
const MAX_LOCK_DURATION_MS = 24 * 60 * 60 * 1000;

const CLAIMABLE_STATUSES = [
  SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
  SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
  SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT
] as const;

type ScheduledTierUpdateDelegate = {
  fields?: {
    maxAttempts?: unknown;
  };
  findMany(args: {
    where: Record<string, unknown>;
    orderBy?: Array<Record<string, 'asc' | 'desc'>>;
    take?: number;
  }): Promise<unknown[]>;
  updateMany(args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
};

export type TierUpdateClaimPrismaClient = {
  scheduledTierUpdate: ScheduledTierUpdateDelegate;
};

type TierUpdateByIdInput = {
  prisma: TierUpdateClaimPrismaClient;
  scheduledTierUpdateId: number;
};

export type TierUpdateClaimWindowInput = {
  now: Date;
  scheduledAtBefore?: Date;
  attemptLimit?: number;
  maxAttemptsField?: unknown;
};

export type FindClaimableTierUpdatesInput = TierUpdateClaimWindowInput & {
  prisma: TierUpdateClaimPrismaClient;
  limit?: number;
};

export type ClaimScheduledTierUpdateInput = TierUpdateByIdInput &
  TierUpdateClaimWindowInput & {
    workerId: string;
    lockDurationMs?: number;
  };

export type RefreshScheduledTierUpdateHeartbeatInput = TierUpdateByIdInput & {
  workerId: string;
  now: Date;
  lockDurationMs?: number;
};

export type MarkScheduledTierUpdateTimedOutInput = TierUpdateByIdInput & {
  now: Date;
  safeSummary?: Prisma.InputJsonValue;
};

export type MarkScheduledTierUpdateFailedInput = TierUpdateByIdInput & {
  workerId: string;
  safeErrorKind: TierUpdateSafeErrorKind;
  safeSummary?: Prisma.InputJsonValue;
  failedAt: Date;
};

export type ReleaseScheduledTierUpdateClaimInput = TierUpdateByIdInput & {
  workerId: string;
};

const assertPositiveId = (id: number): void => {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('invalid_scheduled_tier_update_id');
  }
};

const assertDate = (value: Date, errorCode: string): void => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(errorCode);
  }
};

const assertWorkerId = (workerId: string): void => {
  if (
    typeof workerId !== 'string' ||
    workerId.length === 0 ||
    workerId.length > 128 ||
    !SAFE_WORKER_ID_PATTERN.test(workerId)
  ) {
    throw new Error('invalid_tier_update_worker_id');
  }
};

const assertLimit = (limit: number): void => {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_CLAIM_LIMIT) {
    throw new Error('invalid_tier_update_claim_limit');
  }
};

const normalizeAttemptLimit = (attemptLimit?: number): number => {
  const value = attemptLimit ?? DEFAULT_CLAIM_ATTEMPT_LIMIT;
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('invalid_tier_update_attempt_limit');
  }
  return value;
};

const normalizeLockDurationMs = (lockDurationMs?: number): number => {
  const value = lockDurationMs ?? DEFAULT_TIER_UPDATE_LOCK_MS;
  if (!Number.isInteger(value) || value <= 0 || value > MAX_LOCK_DURATION_MS) {
    throw new Error('invalid_tier_update_lock_duration');
  }
  return value;
};

const lockAvailableWhere = (now: Date): Record<string, unknown>[] => [
  { lockExpiresAt: null },
  { lockExpiresAt: { lte: now } }
];

const attemptBelowMaxAttemptsWhere = (
  input: TierUpdateClaimWindowInput
): Record<string, unknown> => {
  if (input.maxAttemptsField) {
    return { lt: input.maxAttemptsField };
  }

  return { lt: normalizeAttemptLimit(input.attemptLimit) };
};

export const buildClaimWhereClause = (
  input: TierUpdateClaimWindowInput
): Record<string, unknown> => {
  assertDate(input.now, 'invalid_tier_update_now');
  const scheduledAtBefore = input.scheduledAtBefore ?? input.now;
  assertDate(scheduledAtBefore, 'invalid_tier_update_scheduled_before');

  return {
    processed: false,
    status: { in: [...CLAIMABLE_STATUSES] },
    scheduledAt: { lte: scheduledAtBefore },
    attempt: attemptBelowMaxAttemptsWhere(input),
    OR: lockAvailableWhere(input.now)
  };
};

export const buildClaimUpdateData = (
  input: {
    workerId: string;
    now: Date;
    lockDurationMs?: number;
  }
): Record<string, unknown> => {
  assertWorkerId(input.workerId);
  assertDate(input.now, 'invalid_tier_update_now');
  const lockDurationMs = normalizeLockDurationMs(input.lockDurationMs);
  const claimData = buildClaimScheduledTierUpdateData({
    workerId: input.workerId,
    now: input.now,
    nextAttempt: 1,
    lockDurationMs
  });

  const { attempt: _attempt, ...data } = claimData;
  return {
    ...data,
    attempt: { increment: 1 }
  };
};

export const buildTimeoutUpdateData = (
  input: {
    now: Date;
    safeSummary?: Prisma.InputJsonValue;
  }
): Record<string, unknown> => {
  assertDate(input.now, 'invalid_tier_update_now');
  return buildFailedUpdateData({
    safeErrorKind: 'lock_timeout',
    safeSummary: input.safeSummary ?? {
      reason: 'claim_lock_expired',
      retryable: true
    },
    failedAt: input.now,
    status: SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT
  });
};

export const findClaimableTierUpdates = async (
  input: FindClaimableTierUpdatesInput
): Promise<unknown[]> => {
  const limit = input.limit ?? DEFAULT_CLAIM_LIMIT;
  assertLimit(limit);

  return input.prisma.scheduledTierUpdate.findMany({
    where: buildClaimWhereClause({
      ...input,
      maxAttemptsField: input.prisma.scheduledTierUpdate.fields?.maxAttempts
    }),
    orderBy: [
      { scheduledAt: 'asc' },
      { id: 'asc' }
    ],
    take: limit
  });
};

export const claimScheduledTierUpdate = async (
  input: ClaimScheduledTierUpdateInput
): Promise<{ count: number }> => {
  assertPositiveId(input.scheduledTierUpdateId);
  return input.prisma.scheduledTierUpdate.updateMany({
    where: {
      id: input.scheduledTierUpdateId,
      ...buildClaimWhereClause({
        ...input,
        maxAttemptsField: input.prisma.scheduledTierUpdate.fields?.maxAttempts
      })
    },
    data: buildClaimUpdateData(input)
  });
};

export const refreshScheduledTierUpdateHeartbeat = async (
  input: RefreshScheduledTierUpdateHeartbeatInput
): Promise<{ count: number }> => {
  assertPositiveId(input.scheduledTierUpdateId);
  assertWorkerId(input.workerId);
  assertDate(input.now, 'invalid_tier_update_now');
  const lockDurationMs = normalizeLockDurationMs(input.lockDurationMs);

  return input.prisma.scheduledTierUpdate.updateMany({
    where: {
      id: input.scheduledTierUpdateId,
      status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
      processed: false,
      lockedBy: input.workerId
    },
    data: {
      heartbeatAt: input.now,
      lockExpiresAt: new Date(input.now.getTime() + lockDurationMs)
    }
  });
};

export const markScheduledTierUpdateTimedOut = async (
  input: MarkScheduledTierUpdateTimedOutInput
): Promise<{ count: number }> => {
  assertPositiveId(input.scheduledTierUpdateId);
  assertDate(input.now, 'invalid_tier_update_now');

  return input.prisma.scheduledTierUpdate.updateMany({
    where: {
      id: input.scheduledTierUpdateId,
      status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
      processed: false,
      lockExpiresAt: { lte: input.now }
    },
    data: {
      ...buildTimeoutUpdateData({
        now: input.now,
        safeSummary: input.safeSummary
      }),
      lockedBy: null,
      lockedAt: null,
      lockExpiresAt: null
    }
  });
};

export const markScheduledTierUpdateFailed = async (
  input: MarkScheduledTierUpdateFailedInput
): Promise<{ count: number }> => {
  assertPositiveId(input.scheduledTierUpdateId);
  assertWorkerId(input.workerId);
  assertDate(input.failedAt, 'invalid_tier_update_failed_at');

  return input.prisma.scheduledTierUpdate.updateMany({
    where: {
      id: input.scheduledTierUpdateId,
      status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
      processed: false,
      lockedBy: input.workerId
    },
    data: {
      ...buildFailedUpdateData({
        safeErrorKind: input.safeErrorKind,
        safeSummary: input.safeSummary,
        failedAt: input.failedAt,
        status: SCHEDULED_TIER_UPDATE_STATUSES.FAILED
      }),
      lockedBy: null,
      lockedAt: null,
      lockExpiresAt: null
    }
  });
};

export const releaseScheduledTierUpdateClaim = async (
  input: ReleaseScheduledTierUpdateClaimInput
): Promise<{ count: number }> => {
  assertPositiveId(input.scheduledTierUpdateId);
  assertWorkerId(input.workerId);

  return input.prisma.scheduledTierUpdate.updateMany({
    where: {
      id: input.scheduledTierUpdateId,
      status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
      processed: false,
      lockedBy: input.workerId
    },
    data: {
      status: SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
      lockedBy: null,
      lockedAt: null,
      heartbeatAt: null,
      lockExpiresAt: null
    }
  });
};
