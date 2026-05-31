import fs from 'fs';
import path from 'path';
import type {
  ReconcilePendingTierUpdateReceiptsInput,
  TierUpdateReceiptFetcher,
  TierUpdateReceiptReconciliationResult
} from '../tierUpdateReceiptReconciliationService';
import type { TierUpdateTxStatePrismaClient } from '../tierUpdateTxStateService';

const mockReconcilePendingTierUpdateReceipts = jest.fn();

jest.mock('../tierUpdateReceiptReconciliationService', () => ({
  reconcilePendingTierUpdateReceipts: mockReconcilePendingTierUpdateReceipts
}));

import { runTierUpdateReceiptReconciliation } from '../tierUpdateReceiptReconciliationRunner';

const fixedNow = new Date('2026-05-31T00:00:00.000Z');
const txHash = `0x${'a'.repeat(64)}`;
const contractAddress = '0x0000000000000000000000000000000000000001';
const backendRoot = path.resolve(__dirname, '../../../../');
const runnerPath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateReceiptReconciliationRunner.ts'
);

const buildServiceResult = (
  overrides: Partial<TierUpdateReceiptReconciliationResult> = {}
): TierUpdateReceiptReconciliationResult => ({
  scannedCount: 0,
  confirmedCount: 0,
  failedCount: 0,
  manualReviewCount: 0,
  pendingCount: 0,
  skippedCount: 0,
  items: [],
  ...overrides
});

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

describe('tierUpdateReceiptReconciliationRunner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates to reconcilePendingTierUpdateReceipts with explicit runtime boundary arguments', async () => {
    const prisma = buildPrisma();
    const receiptFetcher = buildReceiptFetcher();
    const logger = { warn: jest.fn() };
    mockReconcilePendingTierUpdateReceipts.mockResolvedValue(buildServiceResult({
      scannedCount: 1,
      pendingCount: 1,
      items: [{
        scheduledTierUpdateId: 12,
        outcome: 'pending',
        reason: 'receipt_pending_or_not_found',
        stateChanged: false
      }]
    }));

    const result = await runTierUpdateReceiptReconciliation({
      prisma,
      receiptFetcher,
      now: fixedNow,
      limit: 5,
      chainId: 56,
      contractAddress,
      dryRun: false,
      logger
    });

    expect(mockReconcilePendingTierUpdateReceipts).toHaveBeenCalledWith({
      prisma,
      receiptFetcher,
      now: fixedNow,
      limit: 5,
      chainId: 56,
      contractAddress,
      logger
    });
    expect(result).toEqual(expect.objectContaining({
      status: 'pass',
      scannedCount: 1,
      pendingCount: 1,
      dryRun: false,
      safeSummaryOnly: true,
      stateMutationAttempted: false
    }));
  });

  it('defaults to dryRun and prevents state mutation through the Prisma boundary', async () => {
    const prisma = buildPrisma();
    (prisma.scheduledTierUpdate.findMany as jest.Mock).mockResolvedValue([
      { id: 12, txHash }
    ]);
    (prisma.scheduledTierUpdate.findUnique as jest.Mock).mockResolvedValue({
      id: 12,
      txHash
    });
    mockReconcilePendingTierUpdateReceipts.mockImplementation(
      async (input: ReconcilePendingTierUpdateReceiptsInput) => {
        const rows = await input.prisma.scheduledTierUpdate.findMany({
          where: { status: 'TX_SENT' },
          take: 1
        });
        const existing = await input.prisma.scheduledTierUpdate.findUnique({
          where: { id: 12 },
          select: { id: true, txHash: true }
        });
        await input.prisma.scheduledTierUpdate.update({
          where: { id: 12 },
          data: { status: 'CONFIRMED' }
        });

        return buildServiceResult({
          scannedCount: rows.length,
          confirmedCount: existing?.txHash === txHash ? 1 : 0,
          items: [{
            scheduledTierUpdateId: 12,
            outcome: 'confirmed',
            reason: 'receipt_status_confirmed',
            stateChanged: true
          }]
        });
      }
    );

    const result = await runTierUpdateReceiptReconciliation({
      prisma,
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      limit: 1,
      chainId: 56,
      contractAddress
    });

    const serviceInput = mockReconcilePendingTierUpdateReceipts.mock.calls[0][0];
    expect(serviceInput.prisma).not.toBe(prisma);
    expect(prisma.scheduledTierUpdate.update).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      status: 'pass',
      dryRun: true,
      confirmedCount: 1,
      stateMutationAttempted: false
    }));
    expect(result.items).toEqual([{
      scheduledTierUpdateId: 12,
      outcome: 'confirmed',
      reason: 'receipt_status_confirmed',
      stateChanged: false
    }]);
  });

  it('passes the real Prisma client through when dryRun is false', async () => {
    const prisma = buildPrisma();
    mockReconcilePendingTierUpdateReceipts.mockResolvedValue(buildServiceResult({
      scannedCount: 1,
      confirmedCount: 1,
      items: [{
        scheduledTierUpdateId: 12,
        outcome: 'confirmed',
        reason: 'receipt_status_confirmed',
        stateChanged: true
      }]
    }));

    const result = await runTierUpdateReceiptReconciliation({
      prisma,
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      dryRun: false
    });

    const serviceInput = mockReconcilePendingTierUpdateReceipts.mock.calls[0][0];
    expect(serviceInput.prisma).toBe(prisma);
    expect(result).toEqual(expect.objectContaining({
      dryRun: false,
      confirmedCount: 1,
      stateMutationAttempted: true
    }));
  });

  it('requires an injected receiptFetcher and returns only a safe error reason', async () => {
    const result = await runTierUpdateReceiptReconciliation({
      prisma: buildPrisma(),
      now: fixedNow
    });

    expect(mockReconcilePendingTierUpdateReceipts).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      status: 'fail',
      dryRun: true,
      safeErrorCount: 1,
      safeErrorReason: 'receipt_fetcher_required',
      safeSummaryOnly: true,
      stateMutationAttempted: false
    }));
  });

  it('does not return raw receipt payload fields or runtime connection details', async () => {
    mockReconcilePendingTierUpdateReceipts.mockResolvedValue(buildServiceResult({
      scannedCount: 1,
      failedCount: 1,
      items: [{
        scheduledTierUpdateId: 12,
        outcome: 'failed',
        reason: 'receipt_status_failed',
        stateChanged: true
      }]
    }));

    const result = await runTierUpdateReceiptReconciliation({
      prisma: buildPrisma(),
      receiptFetcher: buildReceiptFetcher(),
      now: fixedNow,
      chainId: 56,
      contractAddress,
      dryRun: false
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain(txHash);
    expect(serialized).not.toContain(contractAddress);
    expect(serialized).not.toContain('rawPayload');
    expect(serialized).not.toContain('providerResponse');
    expect(serialized).not.toContain('rpcUrl');
    expect(serialized).not.toContain('privateKey');
  });

  it('keeps the runner disconnected from real RPC, cron, workers, and tx send code', () => {
    const runnerSource = fs.readFileSync(runnerPath, 'utf8');

    expect(runnerSource).toContain('receiptFetcher');
    expect(runnerSource).toContain('reconcilePendingTierUpdateReceipts');
    expect(runnerSource).not.toContain('JsonRpcProvider');
    expect(runnerSource).not.toContain('new ethers');
    expect(runnerSource).not.toContain('Wallet(');
    expect(runnerSource).not.toContain('Contract(');
    expect(runnerSource).not.toContain('node-cron');
    expect(runnerSource).not.toContain('JobRun');
    expect(runnerSource).not.toContain('trackingService');
    expect(runnerSource).not.toContain('main.ts');
    expect(runnerSource).not.toContain('sendTierSyncTransaction');
    expect(runnerSource).not.toContain('recordTierUpdateTxSent');
  });
});
