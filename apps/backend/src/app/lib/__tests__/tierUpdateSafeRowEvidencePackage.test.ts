import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateSafeRowEvidencePackage
} from '../tierUpdateSafeRowEvidencePackage';
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

const exportedAt = new Date('2026-06-03T00:00:00.000Z');
const sourceHeadSha = '3a911982b2e953d2eb8d76f19f5a46aa21264ca0';
const sourceHash = 'cccccccccccccccccccccccccccccccccccccccc';
const auditExportId = 'audit-package-001';
const auditMeta = {
  auditExportId,
  evidenceOrigin: 'local_test' as const,
  readinessClaim: 'local_ready' as const
};
const backendRoot = path.resolve(__dirname, '../../../../');
const packageSourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateSafeRowEvidencePackage.ts');

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

const buildPackage = (records: TierUpdateSafeRowExportRecord[], includeJsonl = false) => (
  buildTierUpdateSafeRowEvidencePackage({
    records,
    auditExportId,
    sourceHeadSha,
    sourceHash,
    exportedAt,
    includeJsonl
  })
);

const expectPackageFailure = (
  records: TierUpdateSafeRowExportRecord[],
  expectedReason: string
) => {
  const result = buildPackage(records, true);

  expect(result.status).toBe('fail');
  expect(result.jsonl).toBeNull();
  expect(result.jsonlSha256Summary).toBeNull();
  expect(result.safeSummaryOnly).toBe(true);
  expect(result.unsafeReasonCodes.some((reason) => reason.includes(expectedReason))).toBe(true);
};

describe('tierUpdateSafeRowEvidencePackage', () => {
  it('builds a safe package summary without returning JSONL by default', () => {
    const result = buildPackage(makeRecords());

    expect(result).toEqual(expect.objectContaining({
      status: 'pass',
      packageKind: 'tier_update_safe_row_evidence_package',
      schemaVersion: 'funky_safe_row_package_v1',
      auditExportId,
      sourceHeadSha,
      sourceHash,
      exportedAt: exportedAt.toISOString(),
      recordCount: 4,
      jsonlLineCount: 4,
      jsonl: null,
      unsafeReasonCodes: [],
      duplicateRowIds: [],
      missingMetadata: [],
      readinessClaim: 'none',
      stagingNoTxPreflightStatus: 'BLOCKED',
      safeSummaryOnly: true
    }));
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
    const withoutJsonl = buildPackage(makeRecords());
    const withJsonl = buildPackage(makeRecords(), true);

    expect(withoutJsonl.status).toBe('pass');
    expect(withoutJsonl.jsonl).toBeNull();
    expect(withJsonl.status).toBe('pass');
    expect(withJsonl.jsonl).not.toBeNull();
    expect(withJsonl.jsonl?.trimEnd().split('\n')).toHaveLength(4);
    expect(withJsonl.jsonlSha256Summary).toBe(withoutJsonl.jsonlSha256Summary);
  });

  it('uses stable empty-record semantics without claiming readiness', () => {
    const result = buildPackage([]);

    expect(result).toEqual(expect.objectContaining({
      status: 'pass',
      recordCount: 0,
      entityCounts: {},
      readinessClaimCounts: {},
      evidenceOriginCounts: {},
      jsonlLineCount: 0,
      jsonlSha256Summary: null,
      jsonl: null,
      readinessClaim: 'none',
      stagingNoTxPreflightStatus: 'BLOCKED'
    }));
  });

  it('fails closed when record metadata does not match package metadata', () => {
    const metadataMutations: Array<[keyof TierUpdateSafeRowExportRecord, unknown, string]> = [
      ['audit_export_id', 'other-audit', 'audit_export_id_mismatch'],
      ['source_head_sha', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'source_head_sha_mismatch'],
      ['source_hash', 'dddddddddddddddddddddddddddddddddddddddd', 'source_hash_mismatch'],
      ['exported_at', '2026-06-04T00:00:00.000Z', 'exported_at_mismatch']
    ];

    for (const [key, value, expectedReason] of metadataMutations) {
      const records = makeRecords();
      records[0] = {
        ...records[0],
        [key]: value
      };

      expectPackageFailure(records, expectedReason);
    }
  });

  it('fails closed when duplicate row_id values are present', () => {
    const records = makeRecords();
    records[1] = {
      ...records[1],
      row_id: records[0].row_id
    };

    const result = buildPackage(records, true);

    expect(result.status).toBe('fail');
    expect(result.jsonl).toBeNull();
    expect(result.duplicateRowIds).toEqual([records[0].row_id]);
    expect(result.unsafeReasonCodes).toContain('duplicate_row_id');
  });

  it('fails closed for unsafe serializer inputs', () => {
    const unsafeCases: Array<{
      mutate: (records: TierUpdateSafeRowExportRecord[]) => void;
      reason: string;
    }> = [
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
              rawProviderError: 'redacted'
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
              unsafe_summary: 'https://example.invalid'
            }
          };
        },
        reason: 'unsafe_value'
      },
      {
        mutate: (records) => {
          records[0] = {
            ...records[0],
            readiness_claim: 'runtime_ready' as TierUpdateSafeRowExportRecord['readiness_claim']
          };
        },
        reason: 'readiness_claim'
      }
    ];

    for (const unsafeCase of unsafeCases) {
      const records = makeRecords();
      unsafeCase.mutate(records);
      expectPackageFailure(records, unsafeCase.reason);
    }
  });

  it('does not return unsafe raw package metadata when metadata is invalid', () => {
    const result = buildTierUpdateSafeRowEvidencePackage({
      records: makeRecords(),
      auditExportId: 'https://example.invalid/raw',
      sourceHeadSha: 'not-a-sha',
      sourceHash: 'not-a-hash',
      exportedAt: new Date('invalid')
    });

    expect(result.status).toBe('fail');
    expect(result.auditExportId).toBe('unknown');
    expect(result.sourceHeadSha).toBeNull();
    expect(result.sourceHash).toBeNull();
    expect(result.exportedAt).toBe('unknown');
    expect(result.jsonl).toBeNull();
    expect(result.unsafeReasonCodes).toEqual(expect.arrayContaining([
      'invalid_audit_export_id',
      'invalid_source_head_sha',
      'invalid_source_hash',
      'invalid_exported_at'
    ]));
  });

  it('keeps the packager disconnected from DB export, files, artifacts, routes, CLI, cron, main, trackingService, RPC, and tx code', () => {
    const source = fs.readFileSync(packageSourcePath, 'utf8');

    expect(source).not.toContain('findMany');
    expect(source).not.toContain('findUnique');
    expect(source).not.toContain('prisma.');
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
