import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateSafeRowJsonl
} from '../tierUpdateSafeRowExportJsonl';
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
const sourceHeadSha = '6ebf2d2f85256f140e0b0568da37456522ab02aa';
const sourceHash = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const auditMeta = {
  auditExportId: 'audit-jsonl-001',
  evidenceOrigin: 'local_test' as const,
  readinessClaim: 'local_ready' as const
};
const backendRoot = path.resolve(__dirname, '../../../../');
const jsonlSourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateSafeRowExportJsonl.ts');

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

const expectFailure = (
  records: TierUpdateSafeRowExportRecord[],
  expectedReason: string
) => {
  const result = buildTierUpdateSafeRowJsonl({
    records,
    auditExportId: auditMeta.auditExportId,
    sourceHeadSha,
    sourceHash,
    exportedAt
  });

  expect(result.status).toBe('fail');
  expect(result.jsonl).toBeNull();
  expect(result.safeSummaryOnly).toBe(true);
  expect(result.unsafeReasonCodes.some((reason) => reason.includes(expectedReason))).toBe(true);
};

describe('tierUpdateSafeRowExportJsonl', () => {
  it('serializes valid safe rows to newline-terminated JSONL', () => {
    const records = makeRecords();
    const result = buildTierUpdateSafeRowJsonl({
      records,
      auditExportId: auditMeta.auditExportId,
      sourceHeadSha,
      sourceHash,
      exportedAt
    });

    expect(result).toEqual(expect.objectContaining({
      status: 'pass',
      recordCount: 4,
      rowIdCount: 4,
      duplicateRowIds: [],
      unsafeReasonCodes: [],
      newlineTerminated: true,
      safeSummaryOnly: true
    }));
    expect(result.jsonl).not.toBeNull();
    expect(result.jsonl?.endsWith('\n')).toBe(true);

    const lines = result.jsonl?.trimEnd().split('\n') ?? [];
    expect(lines).toHaveLength(4);
    for (const line of lines) {
      const parsed = JSON.parse(line);
      expect(parsed.safeSummaryOnly).toBe(true);
      expect(parsed.schema_version).toBe('funky_safe_row_v1');
      expect(parsed.audit_export_id).toBe(auditMeta.auditExportId);
      expect(parsed.source_head_sha).toBe(sourceHeadSha);
      expect(parsed.source_hash).toBe(sourceHash);
    }
  });

  it('fails closed when duplicate row_id values are present', () => {
    const records = makeRecords();
    records[1] = {
      ...records[1],
      row_id: records[0].row_id
    };

    const result = buildTierUpdateSafeRowJsonl({
      records,
      auditExportId: auditMeta.auditExportId,
      sourceHeadSha,
      sourceHash,
      exportedAt
    });

    expect(result.status).toBe('fail');
    expect(result.jsonl).toBeNull();
    expect(result.duplicateRowIds).toEqual([records[0].row_id]);
    expect(result.unsafeReasonCodes).toContain('duplicate_row_id');
  });

  it('fails closed when safeSummaryOnly is false', () => {
    const records = makeRecords();
    records[0] = {
      ...records[0],
      safeSummaryOnly: false as true
    };

    expectFailure(records, 'safe_summary_only_required');
  });

  it('fails closed when required metadata is missing', () => {
    const records = makeRecords();
    records[0] = {
      ...records[0],
      source_hash: null as unknown as string
    };

    expectFailure(records, 'missing_required_metadata:source_hash');
  });

  it('fails closed when forbidden keys are present', () => {
    const records = makeRecords();
    records[0] = {
      ...records[0],
      record: {
        ...records[0].record,
        rawReceipt: {
          safeSummaryOnly: true
        }
      }
    };

    expectFailure(records, 'forbidden_key');
  });

  it('fails closed when unsafe value patterns are present', () => {
    const unsafeValues = [
      'DATABASE_URL=redacted',
      'Authorization: Bearer redacted',
      'Bearer redacted-token',
      ['-----', 'BEGIN TEST BLOCK-----'].join(''),
      ['private', '_key'].join(''),
      'https://example.invalid',
      'C:\\Users\\example\\secret.txt',
      '/home/example/secret.txt',
      '0x1111111111111111111111111111111111111111111111111111111111111111',
      'raw receipt payload'
    ];

    for (const unsafeValue of unsafeValues) {
      const records = makeRecords();
      records[0] = {
        ...records[0],
        record: {
          ...records[0].record,
          unsafe_summary: unsafeValue
        }
      };

      expectFailure(records, 'unsafe_value');
    }
  });

  it('fails closed for runtime, staging, or production readiness claims', () => {
    for (const readinessClaim of ['runtime_ready', 'staging_ready', 'production_ready']) {
      const records = makeRecords();
      records[0] = {
        ...records[0],
        readiness_claim: readinessClaim as TierUpdateSafeRowExportRecord['readiness_claim']
      };

      expectFailure(records, 'readiness_claim');
    }
  });

  it('keeps the serializer disconnected from DB export, files, routes, CLI, cron, main, trackingService, RPC, and tx code', () => {
    const source = fs.readFileSync(jsonlSourcePath, 'utf8');

    expect(source).not.toContain('findMany');
    expect(source).not.toContain('findUnique');
    expect(source).not.toContain('prisma.');
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
