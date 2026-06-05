import fs from 'fs';
import path from 'path';

import {
  buildOperatorControlledTierUpdateSafeRowPackage
} from '../tierUpdateSafeRowOperatorPackage';
import {
  buildJobRunSafeRowExportRecord,
  buildTierUpdateReceiptEvidenceSafeRow,
  buildTierUpdateSafeRowExportRecord,
  buildTierUpdateStagingEvidenceSafeRow,
  type TierUpdateSafeRowExportRecord
} from '../tierUpdateSafeRowExport';
import type {
  TierUpdateStagingNoTxPreflightEvidence
} from '../tierUpdateStagingNoTxPreflightEvidence';

const exportedAt = new Date('2026-06-04T00:00:00.000Z');
const sourceHeadSha = 'ef491c6730d9050aae6e753f13470f51d1753623';
const sourceHash = 'dddddddddddddddddddddddddddddddddddddddd';
const auditExportId = 'audit-operator-package-001';
const operatorId = 'operator.alpha';
const workerId = 'worker.alpha';
const runKey = 'run.package.001';
const auditMeta = {
  auditExportId,
  evidenceOrigin: 'local_test' as const,
  readinessClaim: 'local_ready' as const
};
const backendRoot = path.resolve(__dirname, '../../../../');
const operatorPackageSourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateSafeRowOperatorPackage.ts');

const makeRecords = (): TierUpdateSafeRowExportRecord[] => {
  const scheduled = buildTierUpdateSafeRowExportRecord({
    row: {
      id: 1,
      userId: 2,
      status: 'TX_SENT',
      scheduledAt: exportedAt,
      expectedTier: 180,
      currentTier: 30,
      processed: false,
      txChainId: 56,
      txReceiptStatus: 1
    },
    auditMeta,
    sourceHeadSha,
    sourceHash,
    exportedAt
  });

  const jobRun = buildJobRunSafeRowExportRecord({
    row: {
      id: 3,
      jobName: 'tier_update_receipt_reconciliation',
      runKey: 'manual-run',
      status: 'SUCCEEDED',
      attempt: 1,
      maxAttempts: 3,
      checkpoint: {
        reason: 'safe'
      }
    },
    auditMeta,
    sourceHeadSha,
    sourceHash,
    exportedAt
  });

  const receipt = buildTierUpdateReceiptEvidenceSafeRow({
    evidence: {
      scheduledTierUpdateId: 1,
      txChainId: 56,
      txReceiptStatus: 1,
      confirmationDepth: 3,
      finalityStatus: 'observed',
      reconciliationStatus: 'confirmed'
    },
    auditMeta,
    sourceHeadSha,
    sourceHash,
    exportedAt
  });

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

  const staging = buildTierUpdateStagingEvidenceSafeRow({
    evidence: stagingEvidence,
    auditMeta: {
      ...auditMeta,
      evidenceOrigin: 'staging_no_tx_evidence',
      readinessClaim: 'staging_no_tx_evidence'
    },
    sourceHeadSha,
    sourceHash,
    exportedAt
  });

  return [scheduled, jobRun, receipt, staging];
};

const buildOperatorPackage = (
  records: TierUpdateSafeRowExportRecord[],
  includeJsonl = false
) => buildOperatorControlledTierUpdateSafeRowPackage({
  records,
  auditExportId,
  sourceHeadSha,
  sourceHash,
  exportedAt,
  operatorId,
  workerId,
  runKey,
  includeJsonl
});

const expectOperatorFailure = (
  records: TierUpdateSafeRowExportRecord[],
  expectedReason: string
) => {
  const result = buildOperatorPackage(records, true);

  expect(result.status).toBe('fail');
  expect(result.jsonl).toBeNull();
  expect(result.jsonlSha256Summary).toBeNull();
  expect(result.safeSummaryOnly).toBe(true);
  expect(result.unsafeReasonCodes.some((reason) => reason.includes(expectedReason))).toBe(true);
};

describe('tierUpdateSafeRowOperatorPackage', () => {
  it('packages valid safe rows through the D8C package boundary without returning JSONL by default', () => {
    const result = buildOperatorPackage(makeRecords());

    expect(result).toEqual(expect.objectContaining({
      status: 'pass',
      packageKind: 'operator_controlled_tier_update_safe_row_package',
      mode: 'operator_controlled',
      includeJsonl: false,
      auditExportId,
      sourceHeadSha,
      sourceHash,
      exportedAt: exportedAt.toISOString(),
      recordCount: 4,
      jsonlLineCount: 4,
      jsonl: null,
      noDbQuery: true,
      noFileWrite: true,
      noArtifactUpload: true,
      noAutoStart: true,
      noCronWiring: true,
      noMainAutoStart: true,
      noTrackingServiceAutoStart: true,
      noRpcUrlEnvReading: true,
      noProviderConstruction: true,
      noWalletConstruction: true,
      noContractConstruction: true,
      readinessClaim: 'none',
      stagingNoTxPreflightStatus: 'BLOCKED',
      unsafeReasonCodes: [],
      duplicateRowIds: [],
      missingMetadata: [],
      safeSummaryOnly: true
    }));
    expect(result.operatorSummary).toEqual({
      provided: true,
      kind: 'operator_id',
      safeSummaryOnly: true
    });
    expect(result.workerSummary).toEqual({
      provided: true,
      kind: 'worker_id',
      safeSummaryOnly: true
    });
    expect(result.runKeySummary).toEqual({
      provided: true,
      kind: 'run_key',
      safeSummaryOnly: true
    });
    expect(result.jsonlSha256Summary).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(result.entityCounts).toEqual({
      job_run: 1,
      scheduled_tier_update: 1,
      staging_evidence: 1,
      tx_receipt_evidence: 1
    });
    expect(result.readinessClaimCounts).toEqual({
      local_ready: 3,
      staging_no_tx_evidence: 1
    });
    expect(result.evidenceOriginCounts).toEqual({
      local_test: 3,
      staging_no_tx_evidence: 1
    });
  });

  it('returns JSONL only when includeJsonl is true', () => {
    const withoutJsonl = buildOperatorPackage(makeRecords());
    const withJsonl = buildOperatorPackage(makeRecords(), true);

    expect(withoutJsonl.status).toBe('pass');
    expect(withoutJsonl.jsonl).toBeNull();
    expect(withJsonl.status).toBe('pass');
    expect(withJsonl.includeJsonl).toBe(true);
    expect(withJsonl.jsonl).not.toBeNull();
    expect(withJsonl.jsonl?.trimEnd().split('\n')).toHaveLength(4);
    expect(withJsonl.jsonlSha256Summary).toBe(withoutJsonl.jsonlSha256Summary);
  });

  it('does not return raw operatorId, workerId, or runKey values', () => {
    const result = buildOperatorPackage(makeRecords(), true);
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain(operatorId);
    expect(serialized).not.toContain(workerId);
    expect(serialized).not.toContain(runKey);
    expect(result.operatorSummary).toEqual(expect.objectContaining({ provided: true, safeSummaryOnly: true }));
    expect(result.workerSummary).toEqual(expect.objectContaining({ provided: true, safeSummaryOnly: true }));
    expect(result.runKeySummary).toEqual(expect.objectContaining({ provided: true, safeSummaryOnly: true }));
  });

  it('fails closed when operatorId, workerId, or runKey is missing', () => {
    const missingInputs = [
      { key: 'operatorId', reason: 'operator_id_required' },
      { key: 'workerId', reason: 'worker_id_required' },
      { key: 'runKey', reason: 'run_key_required' }
    ] as const;

    for (const missingInput of missingInputs) {
      const result = buildOperatorControlledTierUpdateSafeRowPackage({
        records: makeRecords(),
        auditExportId,
        sourceHeadSha,
        sourceHash,
        exportedAt,
        operatorId,
        workerId,
        runKey,
        [missingInput.key]: undefined
      });

      expect(result.status).toBe('fail');
      expect(result.jsonl).toBeNull();
      expect(result.unsafeReasonCodes).toContain(missingInput.reason);
      expect(result.missingMetadata).toContain(missingInput.key);
    }
  });

  it('fails closed when operatorId, workerId, or runKey contains unsafe values', () => {
    const unsafeInputs = [
      { key: 'operatorId', value: 'https://example.invalid/operator', reason: 'operator_id_unsafe' },
      { key: 'workerId', value: 'Bearer token', reason: 'worker_id_unsafe' },
      { key: 'runKey', value: 'C:\\Users\\example\\run', reason: 'run_key_unsafe' }
    ] as const;

    for (const unsafeInput of unsafeInputs) {
      const result = buildOperatorControlledTierUpdateSafeRowPackage({
        records: makeRecords(),
        auditExportId,
        sourceHeadSha,
        sourceHash,
        exportedAt,
        operatorId,
        workerId,
        runKey,
        [unsafeInput.key]: unsafeInput.value
      });

      expect(result.status).toBe('fail');
      expect(result.jsonl).toBeNull();
      expect(result.unsafeReasonCodes).toContain(unsafeInput.reason);
      expect(JSON.stringify(result)).not.toContain(unsafeInput.value);
    }
  });

  it('fails closed when records are missing or empty', () => {
    const missingRecords = buildOperatorControlledTierUpdateSafeRowPackage({
      records: undefined as unknown as TierUpdateSafeRowExportRecord[],
      auditExportId,
      sourceHeadSha,
      sourceHash,
      exportedAt,
      operatorId,
      workerId,
      runKey
    });
    const emptyRecords = buildOperatorControlledTierUpdateSafeRowPackage({
      records: [],
      auditExportId,
      sourceHeadSha,
      sourceHash,
      exportedAt,
      operatorId,
      workerId,
      runKey
    });

    expect(missingRecords.status).toBe('fail');
    expect(missingRecords.unsafeReasonCodes).toContain('records_array_required');
    expect(emptyRecords.status).toBe('fail');
    expect(emptyRecords.unsafeReasonCodes).toContain('records_required');
  });

  it('fails closed when record metadata does not match operator package metadata', () => {
    const metadataMutations: Array<[keyof TierUpdateSafeRowExportRecord, unknown, string]> = [
      ['audit_export_id', 'other-audit', 'audit_export_id_mismatch'],
      ['source_head_sha', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'source_head_sha_mismatch'],
      ['source_hash', 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'source_hash_mismatch'],
      ['exported_at', '2026-06-05T00:00:00.000Z', 'exported_at_mismatch']
    ];

    for (const [key, value, expectedReason] of metadataMutations) {
      const records = makeRecords();
      records[0] = {
        ...records[0],
        [key]: value
      };

      expectOperatorFailure(records, expectedReason);
    }
  });

  it('fails closed for duplicate row ids and unsafe safe-row inputs from D8C/D8B validation', () => {
    const unsafeCases: Array<{
      mutate: (records: TierUpdateSafeRowExportRecord[]) => void;
      reason: string;
    }> = [
      {
        mutate: (records) => {
          records[1] = {
            ...records[1],
            row_id: records[0].row_id
          };
        },
        reason: 'duplicate_row_id'
      },
      {
        mutate: (records) => {
          records[0] = {
            ...records[0],
            safeSummaryOnly: false as true
          };
        },
        reason: 'safe_summary_only_required'
      },
      {
        mutate: (records) => {
          records[0] = {
            ...records[0],
            source_hash: null as unknown as string
          };
        },
        reason: 'missing_required_metadata:source_hash'
      },
      {
        mutate: (records) => {
          records[0] = {
            ...records[0],
            record: {
              ...records[0].record,
              rawReceipt: 'redacted'
            }
          };
        },
        reason: 'forbidden_key'
      },
      {
        mutate: (records) => {
          records[0] = {
            ...records[0],
            record: {
              ...records[0].record,
              unsafe_summary: '0x1111111111111111111111111111111111111111111111111111111111111111'
            }
          };
        },
        reason: 'unsafe_value'
      },
      {
        mutate: (records) => {
          records[0] = {
            ...records[0],
            readiness_claim: 'production_ready' as TierUpdateSafeRowExportRecord['readiness_claim']
          };
        },
        reason: 'readiness_claim'
      }
    ];

    for (const unsafeCase of unsafeCases) {
      const records = makeRecords();
      unsafeCase.mutate(records);
      expectOperatorFailure(records, unsafeCase.reason);
    }
  });

  it('delegates to the D8C package builder and remains disconnected from runtime/export machinery', () => {
    const source = fs.readFileSync(operatorPackageSourcePath, 'utf8');

    expect(source).toContain('buildTierUpdateSafeRowEvidencePackage');
    expect(source).not.toContain('findMany');
    expect(source).not.toContain('findUnique');
    expect(source).not.toContain('prisma.');
    expect(source).not.toContain('PrismaClient');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('createWriteStream');
    expect(source).not.toContain('uploadArtifact');
    expect(source).not.toContain('downloadArtifact');
    expect(source).not.toContain('artifactPath');
    expect(source).not.toContain('artifactUrl');
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
