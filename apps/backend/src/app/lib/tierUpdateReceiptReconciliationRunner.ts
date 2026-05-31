import {
  reconcilePendingTierUpdateReceipts,
  type TierUpdateReceiptFetcher,
  type TierUpdateReceiptReconciliationItem,
  type TierUpdateReceiptReconciliationLogger,
  type TierUpdateReceiptReconciliationResult
} from './tierUpdateReceiptReconciliationService';
import type { TierUpdateTxStatePrismaClient } from './tierUpdateTxStateService';

type ScheduledTierUpdateDelegate = TierUpdateTxStatePrismaClient['scheduledTierUpdate'];

export type RunTierUpdateReceiptReconciliationInput = {
  prisma: TierUpdateTxStatePrismaClient;
  receiptFetcher?: TierUpdateReceiptFetcher;
  now?: Date;
  limit?: number;
  chainId?: number;
  contractAddress?: string;
  dryRun?: boolean;
  logger?: TierUpdateReceiptReconciliationLogger;
};

export type RunTierUpdateReceiptReconciliationStatus = 'pass' | 'fail';

export type RunTierUpdateReceiptReconciliationResult = {
  status: RunTierUpdateReceiptReconciliationStatus;
  scannedCount: number;
  confirmedCount: number;
  failedCount: number;
  pendingCount: number;
  manualReviewCount: number;
  skippedCount: number;
  safeErrorCount: number;
  dryRun: boolean;
  stateMutationAttempted: boolean;
  safeSummaryOnly: true;
  safeErrorReason?: string;
  items: TierUpdateReceiptReconciliationItem[];
};

type DryRunFindUniqueRow = {
  id: number;
  txHash: string | null;
};

const makeEmptyServiceResult = (): TierUpdateReceiptReconciliationResult => ({
  scannedCount: 0,
  confirmedCount: 0,
  failedCount: 0,
  manualReviewCount: 0,
  pendingCount: 0,
  skippedCount: 0,
  items: []
});

const isObjectRecord = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object'
);

const captureFindUniqueRow = (row: unknown): DryRunFindUniqueRow | null => {
  if (!isObjectRecord(row) || typeof row.id !== 'number') {
    return null;
  }

  const txHash = typeof row.txHash === 'string' ? row.txHash : null;
  return {
    id: row.id,
    txHash
  };
};

const normalizeFindUniqueId = (args: {
  where: { id: number };
  select?: Record<string, boolean>;
}): number | null => (
  Number.isInteger(args.where.id) && args.where.id > 0 ? args.where.id : null
);

const hasStateTransitionCandidate = (
  result: TierUpdateReceiptReconciliationResult
): boolean => (
  result.confirmedCount + result.failedCount + result.manualReviewCount > 0
);

const countSafeErrors = (
  result: TierUpdateReceiptReconciliationResult
): number => (
  result.failedCount + result.manualReviewCount + result.skippedCount
);

const makeSafeResult = (
  serviceResult: TierUpdateReceiptReconciliationResult,
  dryRun: boolean,
  status: RunTierUpdateReceiptReconciliationStatus = 'pass',
  safeErrorReason?: string
): RunTierUpdateReceiptReconciliationResult => ({
  status,
  scannedCount: serviceResult.scannedCount,
  confirmedCount: serviceResult.confirmedCount,
  failedCount: serviceResult.failedCount,
  pendingCount: serviceResult.pendingCount,
  manualReviewCount: serviceResult.manualReviewCount,
  skippedCount: serviceResult.skippedCount,
  safeErrorCount: safeErrorReason === undefined ? countSafeErrors(serviceResult) : 1,
  dryRun,
  stateMutationAttempted: !dryRun && hasStateTransitionCandidate(serviceResult),
  safeSummaryOnly: true,
  ...(safeErrorReason === undefined ? {} : { safeErrorReason }),
  items: dryRun
    ? serviceResult.items.map((item) => ({ ...item, stateChanged: false }))
    : serviceResult.items
});

const createDryRunPrisma = (
  prisma: TierUpdateTxStatePrismaClient
): TierUpdateTxStatePrismaClient => {
  const delegate: ScheduledTierUpdateDelegate = prisma.scheduledTierUpdate;
  const rowsById = new Map<number, DryRunFindUniqueRow>();

  return {
    scheduledTierUpdate: {
      findMany: async (args) => {
        const rows = await delegate.findMany(args);
        for (const row of rows) {
          const captured = captureFindUniqueRow(row);
          if (captured !== null) {
            rowsById.set(captured.id, captured);
          }
        }
        return rows;
      },
      findUnique: async (args) => {
        const id = normalizeFindUniqueId(args);
        if (id !== null) {
          const captured = rowsById.get(id);
          if (captured !== undefined) {
            return captured;
          }
        }
        return delegate.findUnique(args);
      },
      findFirst: (args) => delegate.findFirst(args),
      update: async () => ({ dryRun: true })
    }
  };
};

export const runTierUpdateReceiptReconciliation = async (
  input: RunTierUpdateReceiptReconciliationInput
): Promise<RunTierUpdateReceiptReconciliationResult> => {
  const dryRun = input.dryRun ?? true;

  if (input.receiptFetcher === undefined) {
    return makeSafeResult(
      makeEmptyServiceResult(),
      dryRun,
      'fail',
      'receipt_fetcher_required'
    );
  }

  try {
    const serviceResult = await reconcilePendingTierUpdateReceipts({
      prisma: dryRun ? createDryRunPrisma(input.prisma) : input.prisma,
      receiptFetcher: input.receiptFetcher,
      now: input.now ?? new Date(),
      limit: input.limit,
      chainId: input.chainId,
      contractAddress: input.contractAddress,
      logger: input.logger
    });

    return makeSafeResult(serviceResult, dryRun);
  } catch {
    return makeSafeResult(
      makeEmptyServiceResult(),
      dryRun,
      'fail',
      'reconciliation_runner_failed'
    );
  }
};
