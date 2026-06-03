import fs from 'fs';
import path from 'path';
import type { TierUpdateReadOnlyReceiptClient } from '../tierUpdateReceiptFetcher';
import type {
  RunOperatorControlledTierUpdateReceiptReconciliationResult
} from '../tierUpdateReceiptReconciliationOperator';
import type { TierUpdateTxStatePrismaClient } from '../tierUpdateTxStateService';

const mockRunOperatorControlledTierUpdateReceiptReconciliation = jest.fn();

jest.mock('../tierUpdateReceiptReconciliationOperator', () => ({
  runOperatorControlledTierUpdateReceiptReconciliation:
    mockRunOperatorControlledTierUpdateReceiptReconciliation
}));

import {
  buildOperatorControlledReceiptReconciliationEvidence
} from '../tierUpdateReceiptReconciliationEvidence';

const fixedNow = new Date('2026-06-03T00:00:00.000Z');
const contractAddress = '0x0000000000000000000000000000000000000001';
const backendRoot = path.resolve(__dirname, '../../../../');
const evidenceBoundaryPath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateReceiptReconciliationEvidence.ts'
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

const buildOperatorResult = (
  overrides: Partial<RunOperatorControlledTierUpdateReceiptReconciliationResult> = {}
): RunOperatorControlledTierUpdateReceiptReconciliationResult => ({
  mode: 'operator_controlled',
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
  operatorSummary: {
    provided: true,
    safeSummaryOnly: true
  },
  workerIdSummary: {
    provided: true,
    safeSummaryOnly: true
  },
  ...overrides
});

describe('tierUpdateReceiptReconciliationEvidence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRunOperatorControlledTierUpdateReceiptReconciliation.mockResolvedValue(buildOperatorResult());
  });

  it('delegates to the operator boundary with dryRun forced true', async () => {
    const prisma = buildPrisma();
    const readOnlyReceiptClient = buildReadOnlyClient();
    const logger = { warn: jest.fn() };

    const evidence = await buildOperatorControlledReceiptReconciliationEvidence({
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

    expect(mockRunOperatorControlledTierUpdateReceiptReconciliation).toHaveBeenCalledWith({
      prisma,
      readOnlyReceiptClient,
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      operatorId: 'operator-a',
      limit: 10,
      chainId: 56,
      contractAddress,
      dryRun: true,
      logger
    });
    expect(evidence).toEqual(expect.objectContaining({
      evidenceKind: 'operator_controlled_receipt_reconciliation_dry_run',
      mode: 'operator_controlled',
      dryRun: true,
      resultStatus: 'pass',
      noTxExecution: true,
      noRpcUrlEnvReading: true,
      noProviderConstruction: true,
      noAutoStart: true,
      readinessClaim: 'none',
      stagingNoTxPreflightStatus: 'BLOCKED',
      safeSummaryOnly: true,
      counts: {
        scannedCount: 1,
        confirmedCount: 0,
        failedCount: 0,
        pendingCount: 1,
        manualReviewCount: 0,
        safeErrorCount: 0
      }
    }));
  });

  it('ignores a caller supplied dryRun false and still runs evidence mode as dryRun true', async () => {
    await buildOperatorControlledReceiptReconciliationEvidence({
      prisma: buildPrisma(),
      readOnlyReceiptClient: buildReadOnlyClient(),
      now: fixedNow,
      runKey: 'window-001',
      workerId: 'worker-a',
      operatorId: 'operator-a',
      limit: 10,
      chainId: 56,
      contractAddress,
      dryRun: false
    });

    expect(mockRunOperatorControlledTierUpdateReceiptReconciliation).toHaveBeenCalledWith(
      expect.objectContaining({ dryRun: true })
    );
  });

  it.each([
    ['readOnlyReceiptClient', { readOnlyReceiptClient: undefined }, 'read_only_receipt_client_required'],
    ['runKey', { runKey: undefined }, 'run_key_required'],
    ['workerId', { workerId: undefined }, 'worker_id_required'],
    ['operatorId', { operatorId: undefined }, 'operator_id_required'],
    ['chainId', { chainId: undefined }, 'chain_id_required'],
    ['contractAddress', { contractAddress: undefined }, 'contract_address_required']
  ])('returns safe failure evidence when %s is missing', async (_field, override, safeErrorReason) => {
    mockRunOperatorControlledTierUpdateReceiptReconciliation.mockResolvedValue(buildOperatorResult({
      status: 'failed',
      claimed: false,
      skipped: true,
      safeErrorReason,
      safeErrorCount: 1,
      scannedCount: 0,
      confirmedCount: 0,
      failedCount: 0,
      pendingCount: 0,
      manualReviewCount: 0
    }));

    const evidence = await buildOperatorControlledReceiptReconciliationEvidence({
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

    expect(evidence).toEqual(expect.objectContaining({
      resultStatus: 'fail',
      safeErrorKind: safeErrorReason,
      safeSummaryOnly: true,
      dryRun: true,
      noTxExecution: true,
      readinessClaim: 'none',
      stagingNoTxPreflightStatus: 'BLOCKED'
    }));
  });

  it('does not return raw operatorId, workerId, contract address, receipt, error, endpoint, or env data', async () => {
    const evidence = await buildOperatorControlledReceiptReconciliationEvidence({
      prisma: buildPrisma(),
      readOnlyReceiptClient: buildReadOnlyClient(),
      now: fixedNow,
      runKey: 'run-secret-value',
      workerId: 'worker-secret-value',
      operatorId: 'operator-secret-value',
      limit: 10,
      chainId: 56,
      contractAddress
    });

    const serialized = JSON.stringify(evidence);
    expect(evidence.safeSummaryOnly).toBe(true);
    expect(serialized).not.toContain('run-secret-value');
    expect(serialized).not.toContain('worker-secret-value');
    expect(serialized).not.toContain('operator-secret-value');
    expect(serialized).not.toContain(contractAddress);
    expect(serialized).not.toContain('rawReceipt');
    expect(serialized).not.toContain('rawError');
    expect(serialized).not.toContain('providerResponse');
    expect(serialized).not.toContain('rpcUrl');
    expect(serialized).not.toContain('endpoint');
    expect(serialized).not.toContain('process.env');
    expect(serialized).not.toContain('privateKey');
    expect(serialized).not.toContain('stack');
  });

  it('keeps evidence boundary disconnected from routes, CLI, cron, main, trackingService, real RPC, and tx code', () => {
    const source = fs.readFileSync(evidenceBoundaryPath, 'utf8');

    expect(source).toContain('runOperatorControlledTierUpdateReceiptReconciliation');
    expect(source).not.toContain('express.Router');
    expect(source).not.toContain('router.');
    expect(source).not.toContain('process.argv');
    expect(source).not.toContain('require.main');
    expect(source).not.toContain('node-cron');
    expect(source).not.toContain('trackingService');
    expect(source).not.toContain('main.ts');
    expect(source).not.toContain('process.env');
    expect(source).not.toContain('JsonRpcProvider');
    expect(source).not.toContain('new ethers');
    expect(source).not.toContain('Wallet(');
    expect(source).not.toContain('Contract(');
    expect(source).not.toContain('sendTierSyncTransaction');
    expect(source).not.toContain('recordTierUpdateTxSent');
    expect(source).not.toContain('tx.wait');
  });
});
