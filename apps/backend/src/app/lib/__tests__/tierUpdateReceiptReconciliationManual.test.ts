import fs from 'fs';
import path from 'path';
import type {
  RunTierUpdateReceiptReconciliationJobInput,
  RunTierUpdateReceiptReconciliationJobResult
} from '../tierUpdateReceiptReconciliationJob';
import type { TierUpdateReceiptFetcher } from '../tierUpdateReceiptReconciliationService';
import type { TierUpdateTxStatePrismaClient } from '../tierUpdateTxStateService';

const mockRunTierUpdateReceiptReconciliationJob = jest.fn();

jest.mock('../tierUpdateReceiptReconciliationJob', () => ({
  TIER_UPDATE_RECEIPT_RECONCILIATION_JOB_NAME: 'tier_update_receipt_reconciliation',
  runTierUpdateReceiptReconciliationJob: mockRunTierUpdateReceiptReconciliationJob
}));

import { runManualTierUpdateReceiptReconciliation } from '../tierUpdateReceiptReconciliationManual';

const fixedNow = new Date('2026-06-01T00:00:00.000Z');
const contractAddress = '0x0000000000000000000000000000000000000001';
const backendRoot = path.resolve(__dirname, '../../../../');
const manualBoundaryPath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateReceiptReconciliationManual.ts'
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

const buildJobResult = (
  overrides: Partial<RunTierUpdateReceiptReconciliationJobResult> = {}
): RunTierUpdateReceiptReconciliationJobResult => ({
  jobName: 'tier_update_receipt_reconciliation',
  runKey: 'window-001',
  status: 'succeeded',
  jobRunStatus: 'SUCCEEDED',
  claimed: true,
  skipped: false,
  reason: 'receipt_reconciliation_completed',
  dryRun: true,
  scannedCount: 0,
  confirmedCount: 0,
  failedCount: 0,
  pendingCount: 0,
  manualReviewCount: 0,
  skippedCount: 0,
  safeErrorCount: 0,
  stateMutationAttempted: false,
  safeSummaryOnly: true,
  checkpointSummary: {
    reason: 'receipt_reconciliation_completed',
    dryRun: true,
    scannedCount: 0,
    confirmedCount: 0,
    failedCount: 0,
    pendingCount: 0,
    manualReviewCount: 0,
    skippedCount: 0,
    safeErrorCount: 0,
    stateMutationAttempted: false,
    safeSummaryOnly: true
  },
  ...overrides
});

describe('tierUpdateReceiptReconciliationManual', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRunTierUpdateReceiptReconciliationJob.mockResolvedValue(buildJobResult());
  });

  it('delegates manual execution to the JobRun-backed receipt reconciliation worker', async () => {
    const prisma = buildPrisma();
    const receiptFetcher = buildReceiptFetcher();
    const logger = { warn: jest.fn() };

    const result = await runManualTierUpdateReceiptReconciliation({
      prisma,
      receiptFetcher,
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      limit: 5,
      chainId: 56,
      contractAddress,
      logger
    });

    expect(mockRunTierUpdateReceiptReconciliationJob).toHaveBeenCalledWith({
      prisma,
      receiptFetcher,
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      limit: 5,
      chainId: 56,
      contractAddress,
      logger,
      dryRun: true
    } satisfies RunTierUpdateReceiptReconciliationJobInput);
    expect(result).toEqual(expect.objectContaining({
      mode: 'manual',
      jobName: 'tier_update_receipt_reconciliation',
      runKey: 'window-001',
      status: 'succeeded',
      claimed: true,
      skipped: false,
      dryRun: true,
      safeSummaryOnly: true
    }));
  });

  it('defaults to dryRun true for manual invocation', async () => {
    await runManualTierUpdateReceiptReconciliation({
      prisma: buildPrisma(),
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a'
    });

    expect(mockRunTierUpdateReceiptReconciliationJob).toHaveBeenCalledWith(
      expect.objectContaining({
        dryRun: true
      })
    );
  });

  it('passes dryRun false only when manual invocation explicitly asks for it', async () => {
    mockRunTierUpdateReceiptReconciliationJob.mockResolvedValue(buildJobResult({
      dryRun: false,
      stateMutationAttempted: true,
      checkpointSummary: {
        reason: 'receipt_reconciliation_completed',
        dryRun: false,
        scannedCount: 1,
        confirmedCount: 1,
        failedCount: 0,
        pendingCount: 0,
        manualReviewCount: 0,
        skippedCount: 0,
        safeErrorCount: 0,
        stateMutationAttempted: true,
        safeSummaryOnly: true
      }
    }));

    const result = await runManualTierUpdateReceiptReconciliation({
      prisma: buildPrisma(),
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      dryRun: false
    });

    expect(mockRunTierUpdateReceiptReconciliationJob).toHaveBeenCalledWith(
      expect.objectContaining({
        dryRun: false
      })
    );
    expect(result).toEqual(expect.objectContaining({
      mode: 'manual',
      dryRun: false,
      stateMutationAttempted: true
    }));
  });

  it('returns a safe failure from the JobRun boundary when receiptFetcher is missing', async () => {
    mockRunTierUpdateReceiptReconciliationJob.mockResolvedValue(buildJobResult({
      status: 'failed',
      jobRunStatus: 'FAILED',
      safeErrorCount: 1,
      safeErrorReason: 'receipt_fetcher_required',
      reason: 'receipt_reconciliation_failed',
      checkpointSummary: {
        reason: 'receipt_reconciliation_failed',
        dryRun: true,
        scannedCount: 0,
        confirmedCount: 0,
        failedCount: 0,
        pendingCount: 0,
        manualReviewCount: 0,
        skippedCount: 0,
        safeErrorCount: 1,
        stateMutationAttempted: false,
        safeSummaryOnly: true,
        safeErrorReason: 'receipt_fetcher_required'
      }
    }));

    const result = await runManualTierUpdateReceiptReconciliation({
      prisma: buildPrisma(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a'
    });

    expect(mockRunTierUpdateReceiptReconciliationJob).toHaveBeenCalledWith(
      expect.objectContaining({
        dryRun: true
      })
    );
    expect(
      mockRunTierUpdateReceiptReconciliationJob.mock.calls[0][0]
    ).not.toHaveProperty('receiptFetcher');
    expect(result).toEqual(expect.objectContaining({
      mode: 'manual',
      status: 'failed',
      safeErrorReason: 'receipt_fetcher_required',
      safeErrorCount: 1,
      safeSummaryOnly: true
    }));
  });

  it('returns safe summary fields without raw receipt or raw error details', async () => {
    mockRunTierUpdateReceiptReconciliationJob.mockResolvedValue(buildJobResult({
      scannedCount: 1,
      failedCount: 1,
      safeErrorCount: 1,
      checkpointSummary: {
        reason: 'receipt_reconciliation_failed',
        dryRun: true,
        scannedCount: 1,
        confirmedCount: 0,
        failedCount: 1,
        pendingCount: 0,
        manualReviewCount: 0,
        skippedCount: 0,
        safeErrorCount: 1,
        stateMutationAttempted: false,
        safeSummaryOnly: true,
        safeErrorReason: 'reconciliation_job_failed'
      }
    }));

    const result = await runManualTierUpdateReceiptReconciliation({
      prisma: buildPrisma(),
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a'
    });

    const serialized = JSON.stringify(result);
    expect(result.safeSummaryOnly).toBe(true);
    expect(serialized).not.toContain(contractAddress);
    expect(serialized).not.toContain('rawReceipt');
    expect(serialized).not.toContain('rawError');
    expect(serialized).not.toContain('providerResponse');
    expect(serialized).not.toContain('rpcUrl');
    expect(serialized).not.toContain('privateKey');
    expect(serialized).not.toContain('stack');
  });

  it('keeps the manual entrypoint disconnected from routes, CLI, cron, main, trackingService, real RPC, and tx send code', () => {
    const manualBoundarySource = fs.readFileSync(manualBoundaryPath, 'utf8');

    expect(manualBoundarySource).toContain('runTierUpdateReceiptReconciliationJob');
    expect(manualBoundarySource).not.toContain('express.Router');
    expect(manualBoundarySource).not.toContain('router.');
    expect(manualBoundarySource).not.toContain('process.argv');
    expect(manualBoundarySource).not.toContain('require.main');
    expect(manualBoundarySource).not.toContain('node-cron');
    expect(manualBoundarySource).not.toContain('trackingService');
    expect(manualBoundarySource).not.toContain('main.ts');
    expect(manualBoundarySource).not.toContain('JsonRpcProvider');
    expect(manualBoundarySource).not.toContain('new ethers');
    expect(manualBoundarySource).not.toContain('Wallet(');
    expect(manualBoundarySource).not.toContain('Contract(');
    expect(manualBoundarySource).not.toContain('sendTierSyncTransaction');
    expect(manualBoundarySource).not.toContain('recordTierUpdateTxSent');
    expect(manualBoundarySource).not.toContain('tx.wait');
  });
});
