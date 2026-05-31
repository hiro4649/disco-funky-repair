import type { Prisma } from '@prisma/client';
import {
  claimJobRun,
  completeJobRun,
  createOrGetPendingJobRun,
  failJobRun,
  heartbeatJobRun,
  type JobRunSafeErrorKind
} from '../services/jobRun.service';
import {
  runTierUpdateReceiptReconciliation,
  type RunTierUpdateReceiptReconciliationResult
} from './tierUpdateReceiptReconciliationRunner';
import type {
  TierUpdateReceiptFetcher,
  TierUpdateReceiptReconciliationLogger
} from './tierUpdateReceiptReconciliationService';
import type { TierUpdateTxStatePrismaClient } from './tierUpdateTxStateService';

export const TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME =
  'tier_update_receipt_reconciliation';
export const DEFAULT_TIER_UPDATE_RECEIPT_RECONCILIATION_RUN_KEY = 'manual';

export type TierUpdateReceiptReconciliationJobRunner = typeof runTierUpdateReceiptReconciliation;

export type RunTierUpdateReceiptReconciliationJobInput = {
  prisma: TierUpdateTxStatePrismaClient;
  receiptFetcher?: TierUpdateReceiptFetcher;
  now?: Date;
  runKey?: string;
  workerId: string;
  limit?: number;
  chainId?: number;
  contractAddress?: string;
  dryRun?: boolean;
  logger?: TierUpdateReceiptReconciliationLogger;
  runner?: TierUpdateReceiptReconciliationJobRunner;
};

export type TierUpdateReceiptReconciliationJobStatus =
  | 'succeeded'
  | 'failed'
  | 'skipped';

export type TierUpdateReceiptReconciliationJobCheckpoint = {
  reason: string;
  dryRun: boolean;
  scannedCount: number;
  confirmedCount: number;
  failedCount: number;
  pendingCount: number;
  manualReviewCount: number;
  skippedCount: number;
  safeErrorCount: number;
  stateMutationAttempted: boolean;
  safeSummaryOnly: true;
  safeErrorReason?: string;
};

export type RunTierUpdateReceiptReconciliationJobResult =
  TierUpdateReceiptReconciliationJobCheckpoint & {
    jobName: typeof TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME;
    runKey: string;
    status: TierUpdateReceiptReconciliationJobStatus;
    jobRunStatus?: string;
    claimed: boolean;
    skipped: boolean;
    checkpointSummary: TierUpdateReceiptReconciliationJobCheckpoint;
  };

const makeCheckpointSummary = (
  reason: string,
  dryRun: boolean,
  overrides: Partial<Omit<TierUpdateReceiptReconciliationJobCheckpoint, 'reason' | 'dryRun' | 'safeSummaryOnly'>> = {}
): TierUpdateReceiptReconciliationJobCheckpoint => ({
  reason,
  dryRun,
  scannedCount: overrides.scannedCount ?? 0,
  confirmedCount: overrides.confirmedCount ?? 0,
  failedCount: overrides.failedCount ?? 0,
  pendingCount: overrides.pendingCount ?? 0,
  manualReviewCount: overrides.manualReviewCount ?? 0,
  skippedCount: overrides.skippedCount ?? 0,
  safeErrorCount: overrides.safeErrorCount ?? 0,
  stateMutationAttempted: overrides.stateMutationAttempted ?? false,
  safeSummaryOnly: true,
  ...(overrides.safeErrorReason === undefined
    ? {}
    : { safeErrorReason: overrides.safeErrorReason })
});

const makeCheckpointSummaryFromRunnerResult = (
  result: RunTierUpdateReceiptReconciliationResult
): TierUpdateReceiptReconciliationJobCheckpoint => makeCheckpointSummary(
  result.status === 'pass'
    ? 'receipt_reconciliation_completed'
    : 'receipt_reconciliation_failed',
  result.dryRun,
  {
    scannedCount: result.scannedCount,
    confirmedCount: result.confirmedCount,
    failedCount: result.failedCount,
    pendingCount: result.pendingCount,
    manualReviewCount: result.manualReviewCount,
    skippedCount: result.skippedCount,
    safeErrorCount: result.safeErrorCount,
    stateMutationAttempted: result.stateMutationAttempted,
    safeErrorReason: result.safeErrorReason
  }
);

const makeResult = (
  input: {
    runKey: string;
    status: TierUpdateReceiptReconciliationJobStatus;
    claimed: boolean;
    skipped: boolean;
    checkpointSummary: TierUpdateReceiptReconciliationJobCheckpoint;
    jobRunStatus?: string;
  }
): RunTierUpdateReceiptReconciliationJobResult => ({
  jobName: TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
  runKey: input.runKey,
  status: input.status,
  ...(input.jobRunStatus === undefined ? {} : { jobRunStatus: input.jobRunStatus }),
  claimed: input.claimed,
  skipped: input.skipped,
  ...input.checkpointSummary,
  checkpointSummary: input.checkpointSummary
});

const safeCheckpoint = (
  checkpointSummary: TierUpdateReceiptReconciliationJobCheckpoint
): Prisma.InputJsonValue => checkpointSummary as unknown as Prisma.InputJsonValue;

const mapRunnerFailureToJobRunSafeErrorKind = (
  safeErrorReason?: string
): JobRunSafeErrorKind => {
  if (safeErrorReason === 'receipt_fetcher_required') {
    return 'provider_unavailable';
  }

  return 'job_failed';
};

export const runTierUpdateReceiptReconciliationJob = async (
  input: RunTierUpdateReceiptReconciliationJobInput
): Promise<RunTierUpdateReceiptReconciliationJobResult> => {
  const now = input.now ?? new Date();
  const runKey = input.runKey ?? DEFAULT_TIER_UPDATE_RECEIPT_RECONCILIATION_RUN_KEY;
  const dryRun = input.dryRun ?? true;
  const runner = input.runner ?? runTierUpdateReceiptReconciliation;

  await createOrGetPendingJobRun(
    TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
    runKey,
    {
      now,
      checkpoint: safeCheckpoint(makeCheckpointSummary(
        'receipt_reconciliation_job_created',
        dryRun
      ))
    }
  );

  const claimResult = await claimJobRun(
    TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
    runKey,
    input.workerId,
    { now }
  );

  if (claimResult.status !== 'claimed') {
    const checkpointSummary = makeCheckpointSummary(
      claimResult.status === 'manual_review'
        ? 'job_run_manual_review'
        : 'job_run_not_claimed',
      dryRun,
      {
        safeErrorCount: claimResult.status === 'manual_review' ? 1 : 0,
        safeErrorReason: claimResult.status === 'manual_review'
          ? 'job_run_manual_review'
          : undefined
      }
    );

    return makeResult({
      runKey,
      status: 'skipped',
      claimed: false,
      skipped: true,
      checkpointSummary,
      jobRunStatus: 'jobRun' in claimResult ? claimResult.jobRun.status : claimResult.status
    });
  }

  await heartbeatJobRun(claimResult.jobRun.id, input.workerId, { now });

  if (input.receiptFetcher === undefined) {
    const checkpointSummary = makeCheckpointSummary(
      'receipt_reconciliation_failed',
      dryRun,
      {
        safeErrorCount: 1,
        safeErrorReason: 'receipt_fetcher_required'
      }
    );

    const failed = await failJobRun(
      claimResult.jobRun.id,
      input.workerId,
      'provider_unavailable',
      safeCheckpoint(checkpointSummary),
      {
        now,
        checkpoint: safeCheckpoint(checkpointSummary)
      }
    );

    return makeResult({
      runKey,
      status: 'failed',
      claimed: true,
      skipped: false,
      checkpointSummary,
      jobRunStatus: failed.jobRun?.status ?? 'FAILED'
    });
  }

  try {
    const runnerResult = await runner({
      prisma: input.prisma,
      receiptFetcher: input.receiptFetcher,
      now,
      limit: input.limit,
      chainId: input.chainId,
      contractAddress: input.contractAddress,
      dryRun,
      logger: input.logger
    });
    const checkpointSummary = makeCheckpointSummaryFromRunnerResult(runnerResult);

    if (runnerResult.status === 'pass') {
      const completed = await completeJobRun(
        claimResult.jobRun.id,
        input.workerId,
        safeCheckpoint(checkpointSummary),
        {
          now,
          checkpoint: safeCheckpoint(checkpointSummary)
        }
      );

      return makeResult({
        runKey,
        status: 'succeeded',
        claimed: true,
        skipped: false,
        checkpointSummary,
        jobRunStatus: completed.jobRun?.status ?? 'SUCCEEDED'
      });
    }

    const failed = await failJobRun(
      claimResult.jobRun.id,
      input.workerId,
      mapRunnerFailureToJobRunSafeErrorKind(runnerResult.safeErrorReason),
      safeCheckpoint(checkpointSummary),
      {
        now,
        checkpoint: safeCheckpoint(checkpointSummary)
      }
    );

    return makeResult({
      runKey,
      status: 'failed',
      claimed: true,
      skipped: false,
      checkpointSummary,
      jobRunStatus: failed.jobRun?.status ?? 'FAILED'
    });
  } catch {
    const checkpointSummary = makeCheckpointSummary(
      'receipt_reconciliation_failed',
      dryRun,
      {
        safeErrorCount: 1,
        safeErrorReason: 'reconciliation_job_failed'
      }
    );

    const failed = await failJobRun(
      claimResult.jobRun.id,
      input.workerId,
      'job_failed',
      safeCheckpoint(checkpointSummary),
      {
        now,
        checkpoint: safeCheckpoint(checkpointSummary)
      }
    );

    return makeResult({
      runKey,
      status: 'failed',
      claimed: true,
      skipped: false,
      checkpointSummary,
      jobRunStatus: failed.jobRun?.status ?? 'FAILED'
    });
  }
};
