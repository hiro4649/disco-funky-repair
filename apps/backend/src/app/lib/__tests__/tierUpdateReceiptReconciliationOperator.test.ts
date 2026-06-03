import fs from 'fs';
import path from 'path';
import type { TierUpdateReadOnlyReceiptClient } from '../tierUpdateReceiptFetcher';
import type { RunManualTierUpdateReceiptReconciliationResult } from '../tierUpdateReceiptReconciliationManual';
import type { TierUpdateReceiptFetcher } from '../tierUpdateReceiptReconciliationService';
import type { TierUpdateTxStatePrismaClient } from '../tierUpdateTxStateService';

const mockCreateTierUpdateReceiptFetcher = jest.fn();
const mockRunManualTierUpdateReceiptReconciliation = jest.fn();

jest.mock('../tierUpdateReceiptFetcher', () => ({
  createTierUpdateReceiptFetcher: mockCreateTierUpdateReceiptFetcher
}));

jest.mock('../tierUpdateReceiptReconciliationManual', () => ({
  runManualTierUpdateReceiptReconciliation: mockRunManualTierUpdateReceiptReconciliation
}));

import { runOperatorControlledTierUpdateReceiptReconciliation } from '../tierUpdateReceiptReconciliationOperator';

const fixedNow = new Date('2026-06-03T00:00:00.000Z');
const contractAddress = '0x0000000000000000000000000000000000000001';
const backendRoot = path.resolve(__dirname, '../../../../');
const operatorBoundaryPath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateReceiptReconciliationOperator.ts'
);

const buildPrisma = (): TierUpdateTxStatePrismaClient => ({
  scheduledTierUpdate: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  }
});

const buildReadOnlyClient = (): jest.Mocked<TierUpdateReadOnlyReceiptClient> => ({
  getTransactionReceipt: jest.fn()
});

const buildReceiptFetcher = (): jest.MockedFunction<TierUpdateReceiptFetcher> => (
  jest.fn(async (_txHash: string) => null) as jest.MockedFunction<TierUpdateReceiptFetcher>
);

const buildManualResult = (
  overrides: Partial<RunManualTierUpdateReceiptReconciliationResult> = {}
): RunManualTierUpdateReceiptReconciliationResult => ({
  mode: 'manual',
  jobName: 'tier_update_receipt_reconciliation',
  runKey: 'window-001',
  status: 'succeeded',
  jobRunStatus: 'SUCCEEDED',
  claimed: true,
  skipped: false,
  reason: 'receipt_reconciliation_completed',
  dryRun: true,
  scannedCount: 1,
  confirmedCount: 0,
  failedCount: 0,
  pendingCount: 1,
  manualReviewCount: 0,
  skippedCount: 0,
  safeErrorCount: 0,
  stateMutationAttempted: false,
  safeSummaryOnly: true,
  checkpointSummary: {
    reason: 'receipt_reconciliation_completed',
    dryRun: true,
    scannedCount: 1,
    confirmedCount: 0,
    failedCount: 0,
    pendingCount: 1,
    manualReviewCount: 0,
    skippedCount: 0,
    safeErrorCount: 0,
    stateMutationAttempted: false,
    safeSummaryOnly: true
  },
  ...overrides
});

describe('tierUpdateReceiptReconciliationOperator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateTierUpdateReceiptFetcher.mockReturnValue(buildReceiptFetcher());
    mockRunManualTierUpdateReceiptReconciliation.mockResolvedValue(buildManualResult());
  });

  it('creates a safe receiptFetcher and delegates to the manual entrypoint', async () => {
    const prisma = buildPrisma();
    const readOnlyReceiptClient = buildReadOnlyClient();
    const logger = { warn: jest.fn() };

    const result = await runOperatorControlledTierUpdateReceiptReconciliation({
      prisma,
      readOnlyReceiptClient,
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      operatorId: 'operator-a',
      limit: 10,
      chainId: 56,
      contractAddress,
      logger
    });

    expect(mockCreateTierUpdateReceiptFetcher).toHaveBeenCalledWith({
      readOnlyReceiptClient,
      expectedChainId: 56,
      expectedContractAddress: contractAddress,
      logger
    });
    expect(mockRunManualTierUpdateReceiptReconciliation).toHaveBeenCalledWith({
      prisma,
      receiptFetcher: expect.any(Function),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      limit: 10,
      chainId: 56,
      contractAddress,
      dryRun: true,
      logger
    });
    expect(result).toEqual(expect.objectContaining({
      mode: 'operator_controlled',
      runKey: 'window-001',
      status: 'succeeded',
      dryRun: true,
      safeSummaryOnly: true,
      operatorSummary: {
        provided: true,
        safeSummaryOnly: true
      },
      workerIdSummary: {
        provided: true,
        safeSummaryOnly: true
      }
    }));
  });

  it('passes dryRun false only when explicitly requested', async () => {
    mockRunManualTierUpdateReceiptReconciliation.mockResolvedValue(buildManualResult({
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

    const result = await runOperatorControlledTierUpdateReceiptReconciliation({
      prisma: buildPrisma(),
      readOnlyReceiptClient: buildReadOnlyClient(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      operatorId: 'operator-a',
      chainId: 56,
      contractAddress,
      dryRun: false
    });

    expect(mockRunManualTierUpdateReceiptReconciliation).toHaveBeenCalledWith(
      expect.objectContaining({ dryRun: false })
    );
    expect(result).toEqual(expect.objectContaining({
      mode: 'operator_controlled',
      dryRun: false,
      stateMutationAttempted: true
    }));
  });

  it.each([
    ['readOnlyReceiptClient', { readOnlyReceiptClient: undefined }, 'read_only_receipt_client_required'],
    ['chainId', { chainId: undefined }, 'chain_id_required'],
    ['contractAddress', { contractAddress: undefined }, 'contract_address_required'],
    ['runKey', { runKey: undefined }, 'run_key_required'],
    ['workerId', { workerId: undefined }, 'worker_id_required'],
    ['operatorId', { operatorId: undefined }, 'operator_id_required']
  ])('fails closed when %s is missing', async (_field, override, safeErrorReason) => {
    const result = await runOperatorControlledTierUpdateReceiptReconciliation({
      prisma: buildPrisma(),
      readOnlyReceiptClient: buildReadOnlyClient(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      operatorId: 'operator-a',
      limit: 10,
      chainId: 56,
      contractAddress,
      ...override
    });

    expect(mockCreateTierUpdateReceiptFetcher).not.toHaveBeenCalled();
    expect(mockRunManualTierUpdateReceiptReconciliation).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({
      mode: 'operator_controlled',
      status: 'failed',
      claimed: false,
      skipped: true,
      safeErrorReason,
      safeErrorCount: 1,
      safeSummaryOnly: true
    }));
  });

  it('does not return raw operatorId, workerId, receipt, error, or endpoint data', async () => {
    const result = await runOperatorControlledTierUpdateReceiptReconciliation({
      prisma: buildPrisma(),
      readOnlyReceiptClient: buildReadOnlyClient(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-secret-value',
      operatorId: 'operator-secret-value',
      chainId: 56,
      contractAddress
    });

    const serialized = JSON.stringify(result);
    expect(result.safeSummaryOnly).toBe(true);
    expect(serialized).not.toContain('worker-secret-value');
    expect(serialized).not.toContain('operator-secret-value');
    expect(serialized).not.toContain('rawReceipt');
    expect(serialized).not.toContain('rawError');
    expect(serialized).not.toContain('providerResponse');
    expect(serialized).not.toContain('rpcUrl');
    expect(serialized).not.toContain('endpoint');
    expect(serialized).not.toContain('privateKey');
    expect(serialized).not.toContain('stack');
  });

  it('keeps the operator boundary disconnected from routes, CLI, cron, main, trackingService, real RPC, and tx send code', () => {
    const source = fs.readFileSync(operatorBoundaryPath, 'utf8');

    expect(source).toContain('createTierUpdateReceiptFetcher');
    expect(source).toContain('runManualTierUpdateReceiptReconciliation');
    expect(source).not.toContain('express.Router');
    expect(source).not.toContain('router.');
    expect(source).not.toContain('process.argv');
    expect(source).not.toContain('require.main');
    expect(source).not.toContain('node-cron');
    expect(source).not.toContain('trackingService');
    expect(source).not.toContain('main.ts');
    expect(source).not.toContain('JsonRpcProvider');
    expect(source).not.toContain('new ethers');
    expect(source).not.toContain('Wallet(');
    expect(source).not.toContain('Contract(');
    expect(source).not.toContain('sendTierSyncTransaction');
    expect(source).not.toContain('recordTierUpdateTxSent');
    expect(source).not.toContain('tx.wait');
  });
});
