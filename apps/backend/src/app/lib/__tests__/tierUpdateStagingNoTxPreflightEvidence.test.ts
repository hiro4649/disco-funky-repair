import fs from 'fs';
import path from 'path';
import type {
  OperatorControlledReceiptReconciliationEvidence
} from '../tierUpdateReceiptReconciliationEvidence';
import {
  buildTierUpdateStagingNoTxPreflightEvidence
} from '../tierUpdateStagingNoTxPreflightEvidence';

const fixedNow = new Date('2026-06-03T00:00:00.000Z');
const sourceHeadSha = 'ae20f1126fa150e640a25a182fa922bf705b74a9';
const backendRoot = path.resolve(__dirname, '../../../../');
const preflightEvidencePath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateStagingNoTxPreflightEvidence.ts'
);

const buildOperatorEvidence = (
  overrides: Record<string, unknown> = {}
): OperatorControlledReceiptReconciliationEvidence => ({
  evidenceKind: 'operator_controlled_receipt_reconciliation_dry_run',
  mode: 'operator_controlled',
  dryRun: true,
  noTxExecution: true,
  noRpcUrlEnvReading: true,
  noProviderConstruction: true,
  noWalletConstruction: true,
  noContractConstruction: true,
  noAutoStart: true,
  noCronWiring: true,
  noMainAutoStart: true,
  noTrackingServiceAutoStart: true,
  runKeySummary: {
    provided: true,
    safeSummaryOnly: true
  },
  workerSummary: {
    provided: true,
    safeSummaryOnly: true
  },
  operatorSummary: {
    provided: true,
    safeSummaryOnly: true
  },
  chainId: 56,
  contractAddressSummary: {
    provided: true,
    format: 'evm_address',
    safeSummaryOnly: true
  },
  limit: 10,
  resultStatus: 'pass',
  jobName: 'tier_update_receipt_reconciliation',
  claimed: true,
  skipped: false,
  jobRunStatus: 'SUCCEEDED',
  counts: {
    scannedCount: 1,
    confirmedCount: 0,
    failedCount: 0,
    pendingCount: 1,
    manualReviewCount: 0,
    safeErrorCount: 0
  },
  safeErrorKind: null,
  safeSummaryOnly: true,
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  ...overrides
} as OperatorControlledReceiptReconciliationEvidence);

describe('tierUpdateStagingNoTxPreflightEvidence', () => {
  it('classifies complete no-tx evidence as EVIDENCE_READY without marking staging no-tx as complete', () => {
    const evidence = buildTierUpdateStagingNoTxPreflightEvidence({
      operatorEvidence: buildOperatorEvidence(),
      now: fixedNow,
      sourceHeadSha,
      runId: 26872019428
    });

    expect(evidence).toEqual(expect.objectContaining({
      evidenceKind: 'tier_update_staging_no_tx_preflight_evidence',
      status: 'EVIDENCE_READY',
      readinessClaim: 'none',
      stagingNoTxPreflightStatus: 'BLOCKED',
      sourceHeadSha,
      safeSummaryOnly: true,
      missingEvidence: [],
      blockers: []
    }));
    expect(evidence.checks).toEqual({
      noTxExecution: true,
      noFundedTx: true,
      noMint: true,
      noSendToWallet: true,
      noGovernanceTx: true,
      noTierUpdaterTx: true,
      noDeploy: true,
      noStagingRollout: true,
      noRpcUrlEnvReading: true,
      noProviderConstruction: true,
      noWalletConstruction: true,
      noContractConstruction: true,
      noAutoStart: true,
      noCronWiring: true,
      noMainAutoStart: true,
      noTrackingServiceAutoStart: true,
      safeOutputOnly: true
    });
    expect(evidence.status).not.toBe('PASS');
  });

  it.each([
    ['noTxExecution', { noTxExecution: false }],
    ['noRpcUrlEnvReading', { noRpcUrlEnvReading: false }],
    ['noProviderConstruction', { noProviderConstruction: false }],
    ['noAutoStart', { noAutoStart: false }]
  ])('blocks when operator evidence check %s is false', (blocker, override) => {
    const evidence = buildTierUpdateStagingNoTxPreflightEvidence({
      operatorEvidence: buildOperatorEvidence(override),
      now: fixedNow,
      sourceHeadSha,
      runId: 'run-001'
    });

    expect(evidence.status).toBe('BLOCKED');
    expect(evidence.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(evidence.blockers).toContain(blocker);
  });

  it.each([
    ['fundedTx', 'noFundedTx'],
    ['mint', 'noMint'],
    ['sendToWallet', 'noSendToWallet'],
    ['governanceTx', 'noGovernanceTx'],
    ['tierUpdaterTx', 'noTierUpdaterTx'],
    ['deploy', 'noDeploy'],
    ['stagingRollout', 'noStagingRollout']
  ])('blocks when %s execution is reported', (operation, blocker) => {
    const evidence = buildTierUpdateStagingNoTxPreflightEvidence({
      operatorEvidence: buildOperatorEvidence(),
      now: fixedNow,
      sourceHeadSha,
      runId: 'run-001',
      executedOperations: {
        [operation]: true
      }
    });

    expect(evidence.status).toBe('BLOCKED');
    expect(evidence.blockers).toContain(blocker);
  });

  it('keeps missing source head evidence out of ready classification', () => {
    const evidence = buildTierUpdateStagingNoTxPreflightEvidence({
      operatorEvidence: buildOperatorEvidence(),
      now: fixedNow,
      runId: 'run-001'
    });

    expect(evidence.status).toBe('NEEDS_REVIEW');
    expect(evidence.missingEvidence).toContain('source_head_sha');
    expect(evidence.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(evidence.readinessClaim).toBe('none');
  });

  it('blocks failed operator evidence and keeps skipped evidence at review-only', () => {
    const failed = buildTierUpdateStagingNoTxPreflightEvidence({
      operatorEvidence: buildOperatorEvidence({ resultStatus: 'fail' }),
      now: fixedNow,
      sourceHeadSha,
      runId: 'run-001'
    });
    const skipped = buildTierUpdateStagingNoTxPreflightEvidence({
      operatorEvidence: buildOperatorEvidence({ resultStatus: 'skipped' }),
      now: fixedNow,
      sourceHeadSha,
      runId: 'run-001'
    });

    expect(failed.status).toBe('BLOCKED');
    expect(failed.blockers).toContain('operator_evidence_failed');
    expect(skipped.status).toBe('NEEDS_REVIEW');
  });

  it('does not return raw receipt, error, endpoint, env, operator, worker, or wallet values', () => {
    const evidence = buildTierUpdateStagingNoTxPreflightEvidence({
      operatorEvidence: buildOperatorEvidence({
        operatorSummary: {
          provided: true,
          safeSummaryOnly: true
        },
        workerSummary: {
          provided: true,
          safeSummaryOnly: true
        }
      }),
      now: fixedNow,
      sourceHeadSha,
      runId: 'run-secret-value'
    });

    const serialized = JSON.stringify(evidence);
    expect(evidence.safeSummaryOnly).toBe(true);
    expect(serialized).not.toContain('run-secret-value');
    expect(serialized).not.toContain('operator-secret-value');
    expect(serialized).not.toContain('worker-secret-value');
    expect(serialized).not.toContain('wallet-secret-value');
    expect(serialized).not.toContain('rawReceipt');
    expect(serialized).not.toContain('rawError');
    expect(serialized).not.toContain('providerResponse');
    expect(serialized).not.toContain('rpcUrl');
    expect(serialized).not.toContain('endpoint');
    expect(serialized).not.toContain('process.env');
    expect(serialized).not.toContain('privateKey');
  });

  it('keeps the preflight evidence helper disconnected from routes, CLI, cron, main, trackingService, real RPC, and tx code', () => {
    const source = fs.readFileSync(preflightEvidencePath, 'utf8');

    expect(source).not.toContain("'PASS'");
    expect(source).not.toContain('"PASS"');
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
