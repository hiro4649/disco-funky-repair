import fs from 'fs';
import path from 'path';
import {
  buildJobRunSafeRowExportRecord,
  buildTierUpdateReceiptEvidenceSafeRow,
  buildTierUpdateSafeRowExportRecord,
  buildTierUpdateStagingEvidenceSafeRow
} from '../tierUpdateSafeRowExport';
import type {
  OperatorControlledReceiptReconciliationEvidence
} from '../tierUpdateReceiptReconciliationEvidence';
import type {
  TierUpdateStagingNoTxPreflightEvidence
} from '../tierUpdateStagingNoTxPreflightEvidence';

const exportedAt = new Date('2026-06-03T00:00:00.000Z');
const sourceHeadSha = '5dfaf25399d7e1543631a777f38b7b4c745e5dfa';
const sourceHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const txHash = '0x1111111111111111111111111111111111111111111111111111111111111111';
const fullAddress = '0x0000000000000000000000000000000000000001';
const backendRoot = path.resolve(__dirname, '../../../../');
const safeRowExportPath = path.join(backendRoot, 'src/app/lib/tierUpdateSafeRowExport.ts');

const auditMeta = {
  auditExportId: 'audit-001',
  evidenceOrigin: 'local_test' as const,
  readinessClaim: 'local_ready' as const
};

const assertCommonSafeRow = (
  record: ReturnType<typeof buildTierUpdateSafeRowExportRecord>,
  entityType: string,
  sourceTable: string,
  overrides: {
    evidenceOrigin?: string;
    readinessClaim?: string;
  } = {}
) => {
  expect(record).toEqual(expect.objectContaining({
    schema_version: 'funky_safe_row_v1',
    audit_export_id: 'audit-001',
    source_head_sha: sourceHeadSha,
    source_hash: sourceHash,
    exported_at: exportedAt.toISOString(),
    entity_type: entityType,
    source_table: sourceTable,
    evidence_origin: overrides.evidenceOrigin ?? 'local_test',
    readiness_claim: overrides.readinessClaim ?? 'local_ready',
    safeSummaryOnly: true
  }));
};

const expectNoUnsafeRawValues = (value: unknown) => {
  const serialized = JSON.stringify(value);
  expect(serialized).not.toContain(fullAddress);
  expect(serialized).not.toContain(txHash);
  expect(serialized).not.toContain('worker-secret-value');
  expect(serialized).not.toContain('wallet-secret-value');
  expect(serialized).not.toContain('run-secret-value');
  expect(serialized).not.toContain('rawReceipt');
  expect(serialized).not.toContain('rawError');
  expect(serialized).not.toContain('providerResponse');
  expect(serialized).not.toContain('rpcUrl');
  expect(serialized).not.toContain('endpoint');
  expect(serialized).not.toContain('process.env');
  expect(serialized).not.toContain('privateKey');
  expect(serialized).not.toContain('C:\\Users');
  expect(serialized).not.toContain('/home/');
};

describe('tierUpdateSafeRowExport', () => {
  it('maps a ScheduledTierUpdate row to a safe row summary', () => {
    const record = buildTierUpdateSafeRowExportRecord({
      row: {
        id: 12,
        userId: 34,
        scheduledAt: exportedAt,
        expectedTier: 180,
        currentTier: 30,
        processed: false,
        status: 'TX_SENT',
        attempt: 1,
        maxAttempts: 3,
        lockedBy: 'worker-secret-value',
        lockedAt: exportedAt,
        heartbeatAt: exportedAt,
        lockExpiresAt: exportedAt,
        batchId: txHash,
        txHash,
        txChainId: 56,
        txContractAddress: fullAddress,
        txFrom: fullAddress,
        txTo: fullAddress,
        txBlockNumber: 123n,
        txReceiptStatus: 1,
        txReceiptTimestamp: exportedAt,
        txGasUsed: '21000',
        sentAt: exportedAt,
        confirmedAt: exportedAt,
        failedAt: null,
        safeErrorKind: null,
        safeSummary: {
          reason: 'receipt_status_confirmed'
        }
      },
      auditMeta,
      sourceHeadSha,
      sourceHash,
      exportedAt
    });

    assertCommonSafeRow(record, 'scheduled_tier_update', 'ScheduledTierUpdate');
    expect(record.row_id).toBe('scheduled_tier_update:12');
    expect(record.status).toBe('TX_SENT');
    expect(record.record).toEqual(expect.objectContaining({
      expected_tier: 180,
      current_tier: 30,
      processed: false,
      attempt: 1,
      max_attempts: 3,
      tx_chain_id: 56,
      tx_receipt_status: 1,
      readiness_claim: 'none',
      runtime_wiring_status: 'not_connected'
    }));
    expect(record.public_chain_evidence).toEqual(expect.objectContaining({
      tx_chain_id: 56,
      tx_receipt_status: 1
    }));
    expectNoUnsafeRawValues(record);
  });

  it('maps a JobRun row without returning raw checkpoint or worker values', () => {
    const record = buildJobRunSafeRowExportRecord({
      row: {
        id: 7,
        jobName: 'tier_update_receipt_reconciliation',
        runKey: 'run-secret-value',
        status: 'SUCCEEDED',
        startedAt: exportedAt,
        finishedAt: exportedAt,
        heartbeatAt: exportedAt,
        attempt: 1,
        maxAttempts: 3,
        lockedBy: 'worker-secret-value',
        checkpoint: {
          reason: 'receipt_reconciliation_completed'
        },
        safeErrorKind: null,
        safeSummary: {
          reason: 'safe'
        }
      },
      auditMeta,
      sourceHeadSha,
      sourceHash,
      exportedAt
    });

    assertCommonSafeRow(record, 'job_run', 'JobRun');
    expect(record.row_id).toBe('job_run:7');
    expect(record.record).toEqual(expect.objectContaining({
      job_name: 'tier_update_receipt_reconciliation',
      job_status: 'SUCCEEDED',
      attempt: 1,
      max_attempts: 3,
      worker_readiness_claim: 'none',
      runtime_wiring_status: 'not_connected'
    }));
    expect(record.record.checkpoint_summary).toEqual({
      provided: true,
      kind: 'json',
      safeSummaryOnly: true
    });
    expectNoUnsafeRawValues(record);
  });

  it('maps receipt reconciliation evidence to public-chain safe summaries only', () => {
    const record = buildTierUpdateReceiptEvidenceSafeRow({
      evidence: {
        scheduledTierUpdateId: 12,
        txHash,
        txChainId: 56,
        txContractAddress: fullAddress,
        txFrom: fullAddress,
        txTo: fullAddress,
        txBlockNumber: 123n,
        txReceiptStatus: 1,
        confirmationDepth: 3,
        finalityStatus: 'observed',
        lastCheckedAt: exportedAt,
        safeErrorKind: null,
        reconciliationStatus: 'confirmed',
        manualReviewReason: null,
        resumeKey: 'run-secret-value'
      },
      auditMeta,
      sourceHeadSha,
      sourceHash,
      exportedAt
    });

    assertCommonSafeRow(record, 'tx_receipt_evidence', 'none');
    expect(record.row_id).toBe('tx_receipt_evidence:12');
    expect(record.record).toEqual(expect.objectContaining({
      tx_chain_id: 56,
      tx_receipt_status: 1,
      confirmation_depth: 3,
      finality_status: 'observed',
      reconciliation_status: 'confirmed'
    }));
    expectNoUnsafeRawValues(record);
  });

  it('maps staging no-tx evidence while preserving BLOCKED and no readiness claim', () => {
    const stagingEvidence: TierUpdateStagingNoTxPreflightEvidence = {
      evidenceKind: 'tier_update_staging_no_tx_preflight_evidence',
      status: 'EVIDENCE_READY',
      readinessClaim: 'none',
      stagingNoTxPreflightStatus: 'BLOCKED',
      sourceHeadSha,
      runIdSummary: {
        provided: true,
        safeSummaryOnly: true
      },
      evaluatedAt: exportedAt.toISOString(),
      checks: {
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
      },
      missingEvidence: [],
      blockers: [],
      safeSummaryOnly: true
    };

    const record = buildTierUpdateStagingEvidenceSafeRow({
      evidence: stagingEvidence,
      auditMeta: {
        ...auditMeta,
        evidenceOrigin: 'staging_no_tx_evidence',
        readinessClaim: 'staging_ready'
      },
      sourceHeadSha,
      sourceHash,
      exportedAt
    });

    assertCommonSafeRow(record, 'staging_evidence', 'none', {
      evidenceOrigin: 'staging_no_tx_evidence',
      readinessClaim: 'none'
    });
    expect(record.readiness_claim).toBe('none');
    expect(record.record).toEqual(expect.objectContaining({
      stagingNoTxPreflightStatus: 'BLOCKED',
      readinessClaim: 'none',
      noTxExecution: true,
      noFundedTx: true,
      noRpcUrlEnvReading: true,
      noProviderConstruction: true,
      noAutoStart: true,
      safeOutputOnly: true
    }));
    expectNoUnsafeRawValues(record);
  });

  it('maps operator evidence as staging evidence without marking staging preflight complete', () => {
    const operatorEvidence: OperatorControlledReceiptReconciliationEvidence = {
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
      stagingNoTxPreflightStatus: 'BLOCKED'
    };

    const record = buildTierUpdateStagingEvidenceSafeRow({
      evidence: operatorEvidence,
      auditMeta,
      sourceHeadSha,
      sourceHash,
      exportedAt
    });

    expect(record.record).toEqual(expect.objectContaining({
      stagingNoTxPreflightStatus: 'BLOCKED',
      readinessClaim: 'none',
      noTxExecution: true,
      noFundedTx: true,
      noMint: true
    }));
    expectNoUnsafeRawValues(record);
  });

  it('does not allow runtime, staging, or production readiness claims', () => {
    for (const readinessClaim of ['runtime_ready', 'staging_ready', 'production_ready']) {
      const record = buildTierUpdateSafeRowExportRecord({
        row: {
          id: 1,
          status: 'PENDING'
        },
        auditMeta: {
          auditExportId: 'audit-001',
          readinessClaim
        },
        sourceHeadSha,
        sourceHash,
        exportedAt
      });

      expect(record.readiness_claim).toBe('none');
      expect(JSON.stringify(record)).not.toContain(readinessClaim);
    }
  });

  it('keeps the mapper disconnected from DB export, files, routes, CLI, cron, main, trackingService, RPC, and tx code', () => {
    const source = fs.readFileSync(safeRowExportPath, 'utf8');

    expect(source).not.toContain('findMany');
    expect(source).not.toContain('findUnique');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('createWriteStream');
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
