import type { JobRun, Prisma } from '@prisma/client';
import prisma from '../db/prisma_client';

export const JOB_RUN_STATUSES = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  TIMED_OUT: 'TIMED_OUT',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  CANCELED: 'CANCELED'
} as const;

export const JOB_RUN_SAFE_ERROR_KINDS = [
  'provider_timeout',
  'provider_unavailable',
  'rate_limited',
  'receipt_pending',
  'receipt_failed',
  'insufficient_funds',
  'chain_mismatch',
  'stale_checkpoint',
  'manual_review_required',
  'max_attempts_exceeded',
  'job_failed',
  'job_timed_out',
  'job_canceled'
] as const;

export const DEFAULT_JOB_RUN_MAX_ATTEMPTS = 3;
export const DEFAULT_JOB_RUN_TIMEOUT_MS = 15 * 60 * 1000;

type JobRunStatusValue = typeof JOB_RUN_STATUSES[keyof typeof JOB_RUN_STATUSES];
export type JobRunSafeErrorKind = typeof JOB_RUN_SAFE_ERROR_KINDS[number];

type JobRunClient = typeof prisma;

type JobRunCreateOptions = {
  maxAttempts?: number;
  checkpoint?: Prisma.InputJsonValue;
  safeSummary?: Prisma.InputJsonValue;
  now?: Date;
};

type JobRunServiceOptions = {
  now?: Date;
};

type MarkTimedOutJobRunsOptions = {
  timeoutMs?: number;
  now?: Date;
};

export type ClaimJobRunResult =
  | { status: 'claimed'; jobRun: JobRun }
  | { status: 'not_found' }
  | { status: 'not_claimable'; jobRun: JobRun }
  | { status: 'manual_review'; jobRun: JobRun };

export type JobRunTransitionResult =
  | { status: 'updated'; jobRun: JobRun }
  | { status: 'skipped'; jobRun: JobRun | null };

const SAFE_IDENTIFIER_PATTERN = /^[a-z0-9_.:-]+$/i;
const MAX_JOB_NAME_LENGTH = 128;
const MAX_RUN_KEY_LENGTH = 255;
const MAX_WORKER_ID_LENGTH = 128;
const MAX_REASON_LENGTH = 100;
const MAX_MAX_ATTEMPTS = 100;

const CLAIMABLE_STATUSES: JobRunStatusValue[] = [
  JOB_RUN_STATUSES.PENDING,
  JOB_RUN_STATUSES.FAILED,
  JOB_RUN_STATUSES.TIMED_OUT
];

const TERMINAL_STATUSES: JobRunStatusValue[] = [
  JOB_RUN_STATUSES.SUCCEEDED,
  JOB_RUN_STATUSES.MANUAL_REVIEW,
  JOB_RUN_STATUSES.CANCELED
];

const UNSAFE_SUMMARY_KEY_PATTERN =
  /^(?:authorization|cookie|databaseUrl|dbUrl|endpoint|error|errorMessage|jwt|message|password|payload|privateKey|providerResponse|rawPayload|rawTx|secret|stack|txHash|url|walletAddress)$/i;
const UNSAFE_SUMMARY_TEXT_PATTERN =
  /\b(?:Bearer\s+[A-Za-z0-9._~+/=-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|postgres(?:ql)?:\/\/|https?:\/\/|wss?:\/\/|raw\s+payload)\b|0x[a-fA-F0-9]{40,}/i;

const assertSafeIdentifier = (
  value: string,
  maxLength: number,
  errorCode: string
): void => {
  if (
    value.length === 0 ||
    value.length > maxLength ||
    !SAFE_IDENTIFIER_PATTERN.test(value)
  ) {
    throw new Error(errorCode);
  }
};

const normalizeMaxAttempts = (value: number | undefined): number => {
  const maxAttempts = value ?? DEFAULT_JOB_RUN_MAX_ATTEMPTS;
  if (
    !Number.isInteger(maxAttempts) ||
    maxAttempts < 1 ||
    maxAttempts > MAX_MAX_ATTEMPTS
  ) {
    throw new Error('invalid_job_run_max_attempts');
  }

  return maxAttempts;
};

const assertSafeErrorKind: (
  safeErrorKind: string
) => asserts safeErrorKind is JobRunSafeErrorKind = (safeErrorKind) => {
  if (!JOB_RUN_SAFE_ERROR_KINDS.includes(safeErrorKind as JobRunSafeErrorKind)) {
    throw new Error('invalid_job_run_safe_error_kind');
  }
};

const assertSafeSummary = (value: Prisma.InputJsonValue, path = 'safeSummary'): void => {
  if (typeof value === 'string') {
    if (UNSAFE_SUMMARY_TEXT_PATTERN.test(value)) {
      throw new Error('unsafe_job_run_safe_summary');
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
    value.forEach((entry, index) => assertSafeSummary(entry, `${path}[${index}]`));
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    if (UNSAFE_SUMMARY_KEY_PATTERN.test(key)) {
      throw new Error('unsafe_job_run_safe_summary');
    }
    assertSafeSummary(entry as Prisma.InputJsonValue, `${path}.${key}`);
  }
};

const validateJobRunKey = (jobName: string, runKey: string): void => {
  assertSafeIdentifier(jobName, MAX_JOB_NAME_LENGTH, 'invalid_job_run_job_name');
  assertSafeIdentifier(runKey, MAX_RUN_KEY_LENGTH, 'invalid_job_run_run_key');
};

const validateWorkerId = (workerId: string): void => {
  assertSafeIdentifier(workerId, MAX_WORKER_ID_LENGTH, 'invalid_job_run_worker_id');
};

const validateCancelReason = (reason: string): void => {
  assertSafeIdentifier(reason, MAX_REASON_LENGTH, 'invalid_job_run_cancel_reason');
};

const safeSummaryData = (safeSummary?: Prisma.InputJsonValue) => {
  if (safeSummary === undefined) {
    return {};
  }

  assertSafeSummary(safeSummary);
  return { safeSummary };
};

const getJobRunById = async (client: Pick<JobRunClient, 'jobRun'>, jobRunId: number) => {
  return client.jobRun.findUnique({
    where: { id: jobRunId }
  });
};

export const createOrGetPendingJobRun = async (
  jobName: string,
  runKey: string,
  options: JobRunCreateOptions = {}
): Promise<JobRun> => {
  validateJobRunKey(jobName, runKey);
  const maxAttempts = normalizeMaxAttempts(options.maxAttempts);
  const now = options.now ?? new Date();

  return prisma.jobRun.upsert({
    where: {
      jobName_runKey: {
        jobName,
        runKey
      }
    },
    update: {},
    create: {
      jobName,
      runKey,
      status: JOB_RUN_STATUSES.PENDING,
      maxAttempts,
      createdAt: now,
      updatedAt: now,
      ...(options.checkpoint !== undefined ? { checkpoint: options.checkpoint } : {}),
      ...safeSummaryData(options.safeSummary)
    }
  });
};

export const claimJobRun = async (
  jobName: string,
  runKey: string,
  workerId: string,
  options: JobRunServiceOptions = {}
): Promise<ClaimJobRunResult> => {
  validateJobRunKey(jobName, runKey);
  validateWorkerId(workerId);
  const now = options.now ?? new Date();

  return prisma.$transaction(async (tx) => {
    const current = await tx.jobRun.findUnique({
      where: {
        jobName_runKey: {
          jobName,
          runKey
        }
      }
    });

    if (!current) {
      return { status: 'not_found' };
    }

    if (!CLAIMABLE_STATUSES.includes(current.status as JobRunStatusValue)) {
      return { status: 'not_claimable', jobRun: current };
    }

    if (current.attempt >= current.maxAttempts) {
      await tx.jobRun.updateMany({
        where: {
          id: current.id,
          status: current.status,
          attempt: current.attempt
        },
        data: {
          status: JOB_RUN_STATUSES.MANUAL_REVIEW,
          finishedAt: now,
          safeErrorKind: 'max_attempts_exceeded',
          safeSummary: {
            reason: 'max_attempts_exceeded',
            attempt: current.attempt,
            maxAttempts: current.maxAttempts
          }
        }
      });

      const jobRun = await getJobRunById(tx, current.id);
      return { status: 'manual_review', jobRun: jobRun ?? current };
    }

    const updated = await tx.jobRun.updateMany({
      where: {
        id: current.id,
        status: current.status,
        attempt: current.attempt
      },
      data: {
        status: JOB_RUN_STATUSES.RUNNING,
        startedAt: current.startedAt ?? now,
        finishedAt: null,
        heartbeatAt: now,
        lockedBy: workerId,
        attempt: {
          increment: 1
        },
        safeErrorKind: null
      }
    });

    const jobRun = await getJobRunById(tx, current.id);
    if (updated.count !== 1 || !jobRun || jobRun.status !== JOB_RUN_STATUSES.RUNNING) {
      return { status: 'not_claimable', jobRun: jobRun ?? current };
    }

    return { status: 'claimed', jobRun };
  });
};

export const heartbeatJobRun = async (
  jobRunId: number,
  workerId: string,
  options: JobRunServiceOptions = {}
): Promise<JobRunTransitionResult> => {
  validateWorkerId(workerId);
  const now = options.now ?? new Date();

  const updated = await prisma.jobRun.updateMany({
    where: {
      id: jobRunId,
      status: JOB_RUN_STATUSES.RUNNING,
      lockedBy: workerId
    },
    data: {
      heartbeatAt: now
    }
  });

  const jobRun = await getJobRunById(prisma, jobRunId);
  return updated.count === 1
    ? { status: 'updated', jobRun: jobRun as JobRun }
    : { status: 'skipped', jobRun };
};

export const completeJobRun = async (
  jobRunId: number,
  workerId: string,
  safeSummary?: Prisma.InputJsonValue,
  options: JobRunServiceOptions = {}
): Promise<JobRunTransitionResult> => {
  validateWorkerId(workerId);
  const now = options.now ?? new Date();

  const updated = await prisma.jobRun.updateMany({
    where: {
      id: jobRunId,
      status: JOB_RUN_STATUSES.RUNNING,
      lockedBy: workerId
    },
    data: {
      status: JOB_RUN_STATUSES.SUCCEEDED,
      finishedAt: now,
      heartbeatAt: now,
      ...safeSummaryData(safeSummary)
    }
  });

  const jobRun = await getJobRunById(prisma, jobRunId);
  return updated.count === 1
    ? { status: 'updated', jobRun: jobRun as JobRun }
    : { status: 'skipped', jobRun };
};

export const failJobRun = async (
  jobRunId: number,
  workerId: string,
  safeErrorKind: JobRunSafeErrorKind,
  safeSummary?: Prisma.InputJsonValue,
  options: JobRunServiceOptions = {}
): Promise<JobRunTransitionResult> => {
  validateWorkerId(workerId);
  assertSafeErrorKind(safeErrorKind);
  const now = options.now ?? new Date();
  const summaryData = safeSummaryData(safeSummary);

  return prisma.$transaction(async (tx) => {
    const current = await getJobRunById(tx, jobRunId);
    if (!current || current.status !== JOB_RUN_STATUSES.RUNNING || current.lockedBy !== workerId) {
      return { status: 'skipped', jobRun: current };
    }

    const nextStatus = current.attempt >= current.maxAttempts
      ? JOB_RUN_STATUSES.MANUAL_REVIEW
      : JOB_RUN_STATUSES.FAILED;

    const updated = await tx.jobRun.updateMany({
      where: {
        id: jobRunId,
        status: JOB_RUN_STATUSES.RUNNING,
        lockedBy: workerId
      },
      data: {
        status: nextStatus,
        finishedAt: now,
        heartbeatAt: now,
        safeErrorKind,
        ...summaryData
      }
    });

    const jobRun = await getJobRunById(tx, jobRunId);
    return updated.count === 1
      ? { status: 'updated', jobRun: jobRun as JobRun }
      : { status: 'skipped', jobRun };
  });
};

export const markTimedOutJobRuns = async (
  now: Date,
  options: MarkTimedOutJobRunsOptions = {}
): Promise<{ timedOutCount: number }> => {
  const timeoutMs = options.timeoutMs ?? DEFAULT_JOB_RUN_TIMEOUT_MS;
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error('invalid_job_run_timeout');
  }

  const effectiveNow = options.now ?? now;
  const staleBefore = new Date(effectiveNow.getTime() - timeoutMs);
  const updated = await prisma.jobRun.updateMany({
    where: {
      status: JOB_RUN_STATUSES.RUNNING,
      OR: [
        {
          heartbeatAt: {
            lt: staleBefore
          }
        },
        {
          heartbeatAt: null,
          startedAt: {
            lt: staleBefore
          }
        }
      ]
    },
    data: {
      status: JOB_RUN_STATUSES.TIMED_OUT,
      finishedAt: effectiveNow,
      safeErrorKind: 'job_timed_out',
      safeSummary: {
        reason: 'worker_heartbeat_stale'
      }
    }
  });

  return { timedOutCount: updated.count };
};

export const cancelJobRun = async (
  jobRunId: number,
  reason: string,
  options: JobRunServiceOptions = {}
): Promise<JobRunTransitionResult> => {
  validateCancelReason(reason);
  const now = options.now ?? new Date();

  const updated = await prisma.jobRun.updateMany({
    where: {
      id: jobRunId,
      status: {
        notIn: TERMINAL_STATUSES
      }
    },
    data: {
      status: JOB_RUN_STATUSES.CANCELED,
      finishedAt: now,
      safeErrorKind: 'job_canceled',
      safeSummary: {
        reason
      }
    }
  });

  const jobRun = await getJobRunById(prisma, jobRunId);
  return updated.count === 1
    ? { status: 'updated', jobRun: jobRun as JobRun }
    : { status: 'skipped', jobRun };
};
