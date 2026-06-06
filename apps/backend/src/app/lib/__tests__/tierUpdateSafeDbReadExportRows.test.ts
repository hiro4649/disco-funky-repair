import { readFileSync } from 'fs';
import path from 'path';
import {
  assertTierUpdateSafeDbReadExportMockRowsPolicy,
  buildTierUpdateSafeDbReadExportMockRowsPlan,
  runTierUpdateSafeDbReadExportMockRowsFromSource,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_ENTITIES,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_FORBIDDEN_KEYS
} from '../tierUpdateSafeDbReadExportRows';
import {
  TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT
} from '../tierUpdateSafeDbReadExport';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = new Date('2026-06-06T00:00:00.000Z');

const buildPlan = (overrides: Partial<Parameters<typeof buildTierUpdateSafeDbReadExportMockRowsPlan>[0]> = {}) => (
  buildTierUpdateSafeDbReadExportMockRowsPlan({
    rowLimit: 10,
    auditExportId: 'audit-export-d8h',
    sourceHeadSha: SOURCE_HEAD_SHA,
    sourceHash: SOURCE_HASH,
    exportedAt: EXPORTED_AT,
    ...overrides
  })
);

const buildScheduledTierUpdateRow = () => ({
  id: 11,
  userId: 101,
  scheduledAt: EXPORTED_AT,
  expectedTier: 180,
  currentTier: 30,
  processed: false,
  status: 'PENDING',
  attempt: 0,
  maxAttempts: 3,
  lockedBy: 'worker-1',
  lockedAt: null,
  heartbeatAt: null,
  lockExpiresAt: null,
  batchId: 'batch-d8h',
  txHash: 'tx-summary-d8h',
  txChainId: 11155111,
  txContractAddress: '0x' + '2'.repeat(40),
  txFrom: '0x' + '3'.repeat(40),
  txTo: '0x' + '4'.repeat(40),
  txBlockNumber: 123,
  txReceiptStatus: 1,
  txReceiptTimestamp: EXPORTED_AT,
  txGasUsed: 456,
  sentAt: null,
  confirmedAt: null,
  failedAt: null,
  safeErrorKind: null,
  safeSummary: { kind: 'scheduled_tier_update_mock_safe_summary' }
});

const buildJobRunRow = () => ({
  id: 22,
  jobName: 'tier_update_safe_db_read_export_mock_rows',
  runKey: 'run-key-d8h',
  status: 'SUCCEEDED',
  startedAt: EXPORTED_AT,
  finishedAt: EXPORTED_AT,
  heartbeatAt: EXPORTED_AT,
  attempt: 1,
  maxAttempts: 3,
  lockedBy: 'worker-1',
  checkpoint: { kind: 'checkpoint_summary', page: 1 },
  safeErrorKind: null,
  safeSummary: { kind: 'job_run_mock_safe_summary' }
});

const buildReadOnlySource = () => ({
  readScheduledTierUpdates: jest.fn(() => [buildScheduledTierUpdateRow()]),
  readJobRuns: jest.fn(() => [buildJobRunRow()])
});

const runValidRows = async () => runTierUpdateSafeDbReadExportMockRowsFromSource({
  plan: buildPlan(),
  readOnlySource: buildReadOnlySource(),
  operatorId: 'operator-1',
  reviewerId: 'reviewer-1',
  runKey: 'run-key-1'
});

const stringify = (value: unknown) => JSON.stringify(value);

describe('tierUpdateSafeDbReadExportRows', () => {
  it('creates a safe ScheduledTierUpdate mock row', async () => {
    const result = await runValidRows();
    const row = result.safeRows.find((entry) => entry.entity_type === 'scheduled_tier_update');

    expect(result.status).toBe('MOCK_ROWS_READY');
    expect(row).toEqual(expect.objectContaining({
      schema_version: 'funky_safe_row_v1',
      audit_export_id: 'audit-export-d8h',
      source_head_sha: SOURCE_HEAD_SHA,
      source_hash: SOURCE_HASH,
      exported_at: EXPORTED_AT.toISOString(),
      row_id: 'scheduled_tier_update:11',
      entity_type: 'scheduled_tier_update',
      source_table: 'ScheduledTierUpdate',
      status: 'PENDING',
      evidence_origin: 'db_safe_summary',
      readiness_claim: 'none',
      safeSummaryOnly: true,
      expected_tier: 180,
      current_tier: 30,
      processed: false,
      attempt: 0,
      max_attempts: 3,
      safe_error_kind: null,
      runtime_wiring_status: 'not_connected',
      stagingNoTxPreflightStatus: 'BLOCKED'
    }));
    expect(row?.scheduled_tier_update_id_summary).toEqual(expect.objectContaining({ provided: true, safeSummaryOnly: true }));
    expect(row?.user_identity_summary).toEqual(expect.objectContaining({ provided: true, safeSummaryOnly: true }));
    expect(row?.tx_hash_summary).toEqual(expect.objectContaining({ provided: false, safeSummaryOnly: true, kind: 'tx_hash' }));
  });

  it('creates a safe JobRun mock row', async () => {
    const result = await runValidRows();
    const row = result.safeRows.find((entry) => entry.entity_type === 'job_run');

    expect(row).toEqual(expect.objectContaining({
      schema_version: 'funky_safe_row_v1',
      audit_export_id: 'audit-export-d8h',
      source_head_sha: SOURCE_HEAD_SHA,
      source_hash: SOURCE_HASH,
      exported_at: EXPORTED_AT.toISOString(),
      row_id: 'job_run:22',
      entity_type: 'job_run',
      source_table: 'JobRun',
      status: 'SUCCEEDED',
      evidence_origin: 'db_safe_summary',
      readiness_claim: 'none',
      safeSummaryOnly: true,
      job_name: 'tier_update_safe_db_read_export_mock_rows',
      job_status: 'SUCCEEDED',
      attempt: 1,
      max_attempts: 3,
      safe_error_kind: null,
      worker_readiness_claim: 'none',
      runtime_wiring_status: 'not_connected',
      stagingNoTxPreflightStatus: 'BLOCKED'
    }));
    expect(row?.checkpoint_summary).toEqual(expect.objectContaining({ provided: true, safeSummaryOnly: true, kind: 'json' }));
  });

  it('requires row_id and required safe metadata', async () => {
    const result = await runTierUpdateSafeDbReadExportMockRowsFromSource({
      plan: buildPlan({
        sourceHeadSha: undefined,
        sourceHash: undefined,
        exportedAt: undefined
      }),
      readOnlySource: {
        readScheduledTierUpdates: jest.fn(() => [{ ...buildScheduledTierUpdateRow(), id: undefined }]),
        readJobRuns: jest.fn(() => [])
      }
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.missingEvidence).toEqual(expect.arrayContaining([
      'sourceHeadSha',
      'sourceHash',
      'exportedAt'
    ]));
    expect(result.safeRows).toEqual([]);
  });

  it('requires row_id when source metadata is otherwise valid', async () => {
    const result = await runTierUpdateSafeDbReadExportMockRowsFromSource({
      plan: buildPlan(),
      readOnlySource: {
        readScheduledTierUpdates: jest.fn(() => [{ ...buildScheduledTierUpdateRow(), id: undefined }]),
        readJobRuns: jest.fn(() => [])
      }
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.missingEvidence).toContain('row_id');
  });

  it('keeps safeSummaryOnly true, readiness none, and staging preflight BLOCKED', async () => {
    const result = await runValidRows();

    expect(result.safeSummaryOnly).toBe(true);
    expect(result.readinessClaim).toBe('none');
    expect(result.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(result.runtimeReadinessClaimed).toBe(false);
    expect(result.productionReadinessClaimed).toBe(false);
    expect(result.safeRows.every((row) => row.safeSummaryOnly === true)).toBe(true);
    expect(result.safeRows.every((row) => row.readiness_claim === 'none')).toBe(true);
    expect(result.safeRows.every((row) => row.stagingNoTxPreflightStatus === 'BLOCKED')).toBe(true);
  });

  it.each(['runtime_ready', 'staging_ready', 'production_ready'])(
    'blocks forbidden readiness claim %s',
    async (readinessClaim) => {
      const result = await runTierUpdateSafeDbReadExportMockRowsFromSource({
        plan: buildPlan({ readinessClaim }),
        readOnlySource: buildReadOnlySource()
      });

      expect(result.status).toBe('BLOCKED');
      expect(result.unsafeReasonCodes).toContain('readiness_claim_forbidden');
    }
  );

  it('does not return raw wallet, raw txHash, raw checkpoint, raw provider error, env, or path values', async () => {
    const result = await runValidRows();
    const text = stringify(result.safeRows);

    expect(text).not.toContain('walletAddressRaw');
    expect(text).not.toContain('rawTxHash');
    expect(text).not.toContain('rawCheckpoint');
    expect(text).not.toContain('rawProviderError');
    expect(text).not.toContain('DATABASE_URL=');
    expect(text).not.toContain('C:\\Users\\');
    expect(text).not.toContain('0x' + '9'.repeat(64));
  });

  it('fails closed on forbidden keys', async () => {
    const result = await runTierUpdateSafeDbReadExportMockRowsFromSource({
      plan: buildPlan(),
      readOnlySource: {
        readScheduledTierUpdates: jest.fn(() => [{
          ...buildScheduledTierUpdateRow(),
          rawTxHash: '0x' + '9'.repeat(64)
        }]),
        readJobRuns: jest.fn(() => [{
          ...buildJobRunRow(),
          rawCheckpoint: { rawPayload: 'raw payload' }
        }])
      }
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.unsafeReasonCodes).toEqual(expect.arrayContaining([
      'forbidden_key:scheduled_tier_update.rawTxHash',
      'forbidden_key:job_run.rawCheckpoint'
    ]));
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_FORBIDDEN_KEYS).toEqual(expect.arrayContaining([
      'rawTxHash',
      'rawCheckpoint',
      'rawWallet',
      'rawDbRow'
    ]));
  });

  it('fails closed on unsafe values', async () => {
    const result = await runTierUpdateSafeDbReadExportMockRowsFromSource({
      plan: buildPlan(),
      readOnlySource: {
        readScheduledTierUpdates: jest.fn(() => [{
          ...buildScheduledTierUpdateRow(),
          safeSummary: { note: 'DATABASE_URL=postgres://unsafe' }
        }]),
        readJobRuns: jest.fn(() => [{
          ...buildJobRunRow(),
          safeSummary: { note: 'private path C:\\Users\\HIRO-002\\secret' }
        }])
      }
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.unsafeReasonCodes).toEqual(expect.arrayContaining([
      'unsafe_value:scheduled_tier_update.safeSummary.note',
      'unsafe_value:job_run.safeSummary.note'
    ]));
  });

  it('preserves rowLimit max 100', async () => {
    const policy = assertTierUpdateSafeDbReadExportMockRowsPolicy();
    const tooLarge = buildPlan({ rowLimit: TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT + 1 });

    expect(policy.maxRowLimit).toBe(100);
    expect(policy.allowedEntities).toEqual(TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_ENTITIES);
    expect(tooLarge.foundationPlan.status).toBe('BLOCKED');
    expect(tooLarge.foundationPlan.blockers).toContain('row_limit_exceeds_max');
  });

  it('does not call actual DB query methods and rejects Prisma-like source keys', async () => {
    const findMany = jest.fn();
    const result = await runTierUpdateSafeDbReadExportMockRowsFromSource({
      plan: buildPlan(),
      readOnlySource: {
        readScheduledTierUpdates: jest.fn(() => [buildScheduledTierUpdateRow()]),
        readJobRuns: jest.fn(() => [buildJobRunRow()]),
        findMany,
        prisma: {}
      }
    });

    expect(result.status).toBe('BLOCKED');
    expect(findMany).not.toHaveBeenCalled();
    expect(result.sourceSummary.prismaClientAccepted).toBe(false);
    expect(result.sourceSummary.dbQueryExecutedByThisModule).toBe(false);
    expect(result.unsafeReasonCodes).toEqual(expect.arrayContaining([
      'read_only_source_forbidden_key:findMany',
      'read_only_source_forbidden_key:prisma'
    ]));
  });

  it('does not import Prisma, read DATABASE_URL, write files, or upload artifacts', () => {
    const sourcePath = path.join(__dirname, '..', 'tierUpdateSafeDbReadExportRows.ts');
    const source = readFileSync(sourcePath, 'utf8');

    expect(source).not.toContain('@prisma/client');
    expect(source).not.toMatch(/new\s+PrismaClient|PrismaClient\s*\(/);
    expect(source).not.toContain('process.env');
    expect(source).not.toContain('process.env.DATABASE_URL');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('createWriteStream');
    expect(source).not.toContain('upload');
  });

  it('connects D8A-D8E through mock-only package and review boundaries', async () => {
    const result = await runValidRows();

    expect(result.foundationSummary.packageRecordCount).toBe(2);
    expect(result.foundationSummary.status).toBe('BLOCKED');
    expect(result.foundationSummary.reviewPacketStatus).toBe('BLOCKED');
    expect(result.foundationSummary.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(result.foundationSummary.readinessClaim).toBe('none');
    expect(result.noActualDbExport).toBe(true);
    expect(result.noDbQueryByModule).toBe(true);
    expect(result.noPrismaClient).toBe(true);
    expect(result.noFileWrite).toBe(true);
    expect(result.noArtifactUpload).toBe(true);
    expect(result.noRoute).toBe(true);
    expect(result.noCron).toBe(true);
    expect(result.noMainAutoStart).toBe(true);
    expect(result.noTrackingServiceAutoStart).toBe(true);
    expect(result.noRpcUrlEnvReading).toBe(true);
    expect(result.noProviderConstruction).toBe(true);
    expect(result.noWalletConstruction).toBe(true);
    expect(result.noContractConstruction).toBe(true);
  });

  it('does not use PASS or readiness-ready labels for staging or runtime status', async () => {
    const result = await runValidRows();
    const text = stringify(result);

    expect(text).not.toContain('PASS');
    expect(text).not.toContain('runtime_ready');
    expect(text).not.toContain('staging_ready');
    expect(text).not.toContain('production_ready');
    expect(result.runtimeReadinessClaimed).toBe(false);
    expect(result.productionReadinessClaimed).toBe(false);
  });
});
