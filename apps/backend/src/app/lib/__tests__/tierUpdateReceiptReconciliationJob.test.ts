import fs from 'fs';
import path from 'path';
import type { RunTierUpdateReceiptReconciliationResult } from '../tierUpdateReceiptReconciliationRunner';
import type { TierUpdateReceiptFetcher } from '../tierUpdateReceiptReconciliationService';
import type { TierUpdateTxStatePrismaClient } from '../tierUpdateTxStateService';

const mockCreateOrGetPendingJobRun = jest.fn();
const mockClaimJobRun = jest.fn();
const mockHeartbeatJobRun = jest.fn();
const mockCompleteJobRun = jest.fn();
const mockFailJobRun = jest.fn();

jest.mock('../../services/jobRun.service', () => ({
  createOrGetPendingJobRun: mockCreateOrGetPendingJobRun,
  claimJobRun: mockClaimJobRun,
  heartbeatJobRun: mockHeartbeatJobRun,
  completeJobRun: mockCompleteJobRun,
  failJobRun: mockFailJobRun
}));

import {
  DEFAULT_TIER_UPDATE_RECEIPT_RECONCILIATION_RUN_KEY,
  TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
  runTierUpdateReceiptReconciliationJob
} from '../tierUpdateReceiptReconciliationJob';

const fixedNow = new Date('2026-06-01T00:00:00.000Z');
const contractAddress = '0x0000000000000000000000000000000000000001';
const backendRoot = path.resolve(__dirname, '../../../../');
const jobPath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateReceiptReconciliationJob.ts'
);

const buildPrisma = (): TierUpdateTxStatePrismaClient => ({
  scheduledTierUpdate: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  }
});

const buildReceiptFetcher = (): jest.MockedFunction<TierUpdateReceiptFetcher> => (
  jest.fn(async (_txHash: string) => null) as jest.MockedFunction<TierUpdateReceiptFetcher>
);

const buildJobRun = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  jobName: TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
  runKey: 'window-001',
  status: 'RUNNING',
  startedAt: fixedNow,
  finishedAt: null,
  heartbeatAt: fixedNow,
  attempt: 1,
  maxAttempts: 3,
  lockedBy: 'worker-a',
  checkpoint: null,
  safeErrorKind: null,
  safeSummary: null,
  createdAt: fixedNow,
  updatedAt: fixedNow,
  ...overrides
});

const buildRunnerResult = (
  overrides: Partial<RunTierUpdateReceiptReconciliationResult> = {}
): RunTierUpdateReceiptReconciliationResult => ({
  status: 'pass',
  scannedCount: 0,
  confirmedCount: 0,
  failedCount: 0,
  pendingCount: 0,
  manualReviewCount: 0,
  skippedCount: 0,
  safeErrorCount: 0,
  dryRun: true,
  stateMutationAttempted: false,
  safeSummaryOnly: true,
  items: [],
  ...overrides
});

const installClaimedJobRunMocks = () => {
  mockCreateOrGetPendingJobRun.mockResolvedValue(buildJobRun({
    status: 'PENDING',
    attempt: 0,
    lockedBy: null
  }));
  mockClaimJobRun.mockResolvedValue({
    status: 'claimed',
    jobRun: buildJobRun()
  });
  mockHeartbeatJobRun.mockResolvedValue({
    status: 'updated',
    jobRun: buildJobRun()
  });
  mockCompleteJobRun.mockResolvedValue({
    status: 'updated',
    jobRun: buildJobRun({ status: 'SUCCEEDED', finishedAt: fixedNow })
  });
  mockFailJobRun.mockResolvedValue({
    status: 'updated',
    jobRun: buildJobRun({ status: 'FAILED', finishedAt: fixedNow })
  });
};

describe('tierUpdateReceiptReconciliationJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    installClaimedJobRunMocks();
  });

  it('claims a JobRun before invoking the receipt reconciliation runner', async () => {
    const prisma = buildPrisma();
    const receiptFetcher = buildReceiptFetcher();
    const runner = jest.fn(async () => buildRunnerResult({
      scannedCount: 2,
      confirmedCount: 1,
      pendingCount: 1,
      dryRun: true
    }));

    const result = await runTierUpdateReceiptReconciliationJob({
      prisma,
      receiptFetcher,
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      limit: 5,
      chainId: 56,
      contractAddress,
      runner
    });

    expect(mockCreateOrGetPendingJobRun).toHaveBeenCalledWith(
      TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
      'window-001',
      expect.objectContaining({
        now: fixedNow,
        checkpoint: expect.objectContaining({
          reason: 'receipt_reconciliation_job_created',
          safeSummaryOnly: true
        })
      })
    );
    expect(mockClaimJobRun).toHaveBeenCalledWith(
      TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
      'window-001',
      'worker-a',
      { now: fixedNow }
    );
    expect(mockHeartbeatJobRun).toHaveBeenCalledWith(7, 'worker-a', { now: fixedNow });
    expect(runner).toHaveBeenCalledWith({
      prisma,
      receiptFetcher,
      now: fixedNow,
      limit: 5,
      chainId: 56,
      contractAddress,
      dryRun: true,
      logger: undefined
    });
    expect(mockCompleteJobRun).toHaveBeenCalledWith(
      7,
      'worker-a',
      expect.objectContaining({
        reason: 'receipt_reconciliation_completed',
        scannedCount: 2,
        confirmedCount: 1,
        pendingCount: 1,
        safeSummaryOnly: true
      }),
      expect.objectContaining({
        now: fixedNow,
        checkpoint: expect.objectContaining({
          reason: 'receipt_reconciliation_completed',
          scannedCount: 2
        })
      })
    );
    expect(result).toEqual(expect.objectContaining({
      jobName: TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
      runKey: 'window-001',
      status: 'succeeded',
      claimed: true,
      skipped: false,
      dryRun: true,
      scannedCount: 2,
      confirmedCount: 1,
      pendingCount: 1,
      safeSummaryOnly: true
    }));
  });

  it('skips without invoking the runner when the JobRun is already locked', async () => {
    const lockedJobRun = buildJobRun({
      status: 'RUNNING',
      lockedBy: 'worker-b'
    });
    mockClaimJobRun.mockResolvedValue({
      status: 'not_claimable',
      jobRun: lockedJobRun
    });
    const runner = jest.fn(async () => buildRunnerResult());

    const result = await runTierUpdateReceiptReconciliationJob({
      prisma: buildPrisma(),
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      runner
    });

    expect(runner).not.toHaveBeenCalled();
    expect(mockHeartbeatJobRun).not.toHaveBeenCalled();
    expect(mockCompleteJobRun).not.toHaveBeenCalled();
    expect(mockFailJobRun).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      status: 'skipped',
      claimed: false,
      skipped: true,
      jobRunStatus: 'RUNNING',
      reason: 'job_run_not_claimed'
    }));
  });

  it('fails safely without invoking the runner when receiptFetcher is missing', async () => {
    const runner = jest.fn(async () => buildRunnerResult());

    const result = await runTierUpdateReceiptReconciliationJob({
      prisma: buildPrisma(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      runner
    });

    expect(runner).not.toHaveBeenCalled();
    expect(mockFailJobRun).toHaveBeenCalledWith(
      7,
      'worker-a',
      'provider_unavailable',
      expect.objectContaining({
        reason: 'receipt_reconciliation_failed',
        safeErrorReason: 'receipt_fetcher_required',
        safeSummaryOnly: true
      }),
      expect.objectContaining({
        now: fixedNow,
        checkpoint: expect.objectContaining({
          safeErrorReason: 'receipt_fetcher_required'
        })
      })
    );
    expect(result).toEqual(expect.objectContaining({
      status: 'failed',
      claimed: true,
      skipped: false,
      safeErrorReason: 'receipt_fetcher_required',
      safeErrorCount: 1
    }));
  });

  it('passes dryRun false through to the injected runner without creating real runtime connections', async () => {
    const runner = jest.fn(async () => buildRunnerResult({
      dryRun: false,
      stateMutationAttempted: true,
      scannedCount: 1,
      confirmedCount: 1
    }));

    const result = await runTierUpdateReceiptReconciliationJob({
      prisma: buildPrisma(),
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      dryRun: false,
      runner
    });

    expect(runner).toHaveBeenCalledWith(expect.objectContaining({
      dryRun: false
    }));
    expect(result).toEqual(expect.objectContaining({
      status: 'succeeded',
      dryRun: false,
      stateMutationAttempted: true
    }));
  });

  it('persists runner failures as safe JobRun failure summaries and checkpoints', async () => {
    const runner = jest.fn(async () => buildRunnerResult({
      status: 'fail',
      safeErrorReason: 'reconciliation_runner_failed',
      safeErrorCount: 1
    }));

    const result = await runTierUpdateReceiptReconciliationJob({
      prisma: buildPrisma(),
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      runner
    });

    expect(mockFailJobRun).toHaveBeenCalledWith(
      7,
      'worker-a',
      'job_failed',
      expect.objectContaining({
        reason: 'receipt_reconciliation_failed',
        safeErrorReason: 'reconciliation_runner_failed'
      }),
      expect.objectContaining({
        checkpoint: expect.objectContaining({
          reason: 'receipt_reconciliation_failed',
          safeErrorReason: 'reconciliation_runner_failed'
        })
      })
    );
    expect(result).toEqual(expect.objectContaining({
      status: 'failed',
      safeErrorReason: 'reconciliation_runner_failed',
      safeErrorCount: 1
    }));
  });

  it('does not store raw thrown errors in JobRun failure summaries', async () => {
    const runner = jest.fn(async () => {
      throw new Error('raw payload with private key and 0x0000000000000000000000000000000000000001');
    });

    await runTierUpdateReceiptReconciliationJob({
      prisma: buildPrisma(),
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      runner
    });

    const failedSummary = mockFailJobRun.mock.calls[0][3];
    const serialized = JSON.stringify(failedSummary);
    expect(serialized).toContain('reconciliation_job_failed');
    expect(serialized).not.toContain('raw payload');
    expect(serialized).not.toContain('private key');
    expect(serialized).not.toContain('0x0000000000000000000000000000000000000001');
  });

  it('uses a deterministic default runKey when none is provided', async () => {
    const runner = jest.fn(async () => buildRunnerResult());

    const result = await runTierUpdateReceiptReconciliationJob({
      prisma: buildPrisma(),
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      workerId: 'worker-a',
      runner
    });

    expect(mockCreateOrGetPendingJobRun).toHaveBeenCalledWith(
      TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME,
      DEFAULT_TIER_UPDATE_RECEIPT_RECONCILIATION_RUN_KEY,
      expect.any(Object)
    );
    expect(result.runKey).toBe(DEFAULT_TIER_UPDATE_RECEIPT_RECONCILIATION_RUN_KEY);
  });

  it('keeps the JobRun boundary disconnected from real RPC, cron, main, trackingService, and tx send code', () => {
    const jobSource = fs.readFileSync(jobPath, 'utf8');

    expect(jobSource).toContain('runTierUpdateReceiptReconciliation');
    expect(jobSource).toContain('receiptFetcher');
    expect(jobSource).toContain('claimJobRun');
    expect(jobSource).not.toContain('JsonRpcProvider');
    expect(jobSource).not.toContain('new ethers');
    expect(jobSource).not.toContain('Wallet(');
    expect(jobSource).not.toContain('Contract(');
    expect(jobSource).not.toContain('node-cron');
    expect(jobSource).not.toContain('trackingService');
    expect(jobSource).not.toContain('main.ts');
    expect(jobSource).not.toContain('sendTierSyncTransaction');
    expect(jobSource).not.toContain('recordTierUpdateTxSent');
    expect(jobSource).not.toContain('tx.wait');
  });
});
