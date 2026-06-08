import fs from 'fs';
import path from 'path';

import { buildTierUpdateSafeDbReadExportJsonlPackage } from '../tierUpdateSafeDbReadExportJsonlPackage';
import {
  buildTierUpdateSafeDbReadExportMockRowsPlan,
  runTierUpdateSafeDbReadExportMockRowsFromSource,
  type TierUpdateSafeDbReadExportMockSafeRow
} from '../tierUpdateSafeDbReadExportRows';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = new Date('2026-06-06T00:00:00.000Z');
const AUDIT_EXPORT_ID = 'audit-export-d8i';
const OPERATOR_ID = 'operator-d8i';
const REVIEWER_ID = 'reviewer-d8i';
const RUN_KEY = 'run-key-d8i';

const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateSafeDbReadExportJsonlPackage.ts');

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
  batchId: 'batch-d8i',
  txHash: 'tx-summary-d8i',
  txChainId: 11155111,
  txContractAddress: `0x${'2'.repeat(40)}`,
  txFrom: `0x${'3'.repeat(40)}`,
  txTo: `0x${'4'.repeat(40)}`,
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
  jobName: 'tier_update_safe_db_read_export_jsonl_package',
  runKey: RUN_KEY,
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

const buildRows = async () => {
  const plan = buildTierUpdateSafeDbReadExportMockRowsPlan({
    rowLimit: 10,
    auditExportId: AUDIT_EXPORT_ID,
    sourceHeadSha: SOURCE_HEAD_SHA,
    sourceHash: SOURCE_HASH,
    exportedAt: EXPORTED_AT
  });
  const result = await runTierUpdateSafeDbReadExportMockRowsFromSource({
    plan,
    readOnlySource: {
      readScheduledTierUpdates: jest.fn(() => [buildScheduledTierUpdateRow()]),
      readJobRuns: jest.fn(() => [buildJobRunRow()])
    },
    operatorId: OPERATOR_ID,
    reviewerId: REVIEWER_ID,
    runKey: RUN_KEY
  });

  expect(result.status).toBe('MOCK_ROWS_READY');
  return result.safeRows;
};

const buildPackage = async (
  overrides: Partial<Parameters<typeof buildTierUpdateSafeDbReadExportJsonlPackage>[0]> = {}
) =>
  buildTierUpdateSafeDbReadExportJsonlPackage({
    rows: await buildRows(),
    auditExportId: AUDIT_EXPORT_ID,
    sourceHeadSha: SOURCE_HEAD_SHA,
    sourceHash: SOURCE_HASH,
    exportedAt: EXPORTED_AT,
    operatorId: OPERATOR_ID,
    reviewerId: REVIEWER_ID,
    runKey: RUN_KEY,
    ...overrides
  });

const stringify = (value: unknown) => JSON.stringify(value);

describe('tierUpdateSafeDbReadExportJsonlPackage', () => {
  it('packages ScheduledTierUpdate and JobRun mock safe rows', async () => {
    const result = await buildPackage();

    expect(result.status).toBe('EXPORT_PACKAGE_READY');
    expect(result.packageKind).toBe('tier_update_safe_db_read_export_jsonl_package');
    expect(result.mode).toBe('mock_or_injected_safe_rows_only');
    expect(result.recordCount).toBe(2);
    expect(result.entityCounts).toEqual({ scheduled_tier_update: 1, job_run: 1 });
    expect(result.readinessClaimCounts).toEqual({ none: 2 });
    expect(result.evidenceOriginCounts).toEqual({ db_safe_summary: 2 });
    expect(result.serializerSummary.status).toBe('pass');
    expect(result.evidencePackageSummary.status).toBe('pass');
    expect(result.operatorPackageSummary.status).toBe('pass');
    expect(result.reviewPacketSummary.status).toBe('OWNER_REVIEW_READY');
    expect(result.reviewPacketSummary.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(result.readinessClaim).toBe('none');
    expect(result.stagingNoTxPreflightStatus).toBe('BLOCKED');
  });

  it('defaults includeJsonl to false and returns jsonl null', async () => {
    const result = await buildPackage();
    expect(result.includeJsonl).toBe(false);
    expect(result.jsonl).toBeNull();
    expect(result.operatorPackageSummary.includeJsonl).toBe(false);
    expect(result.jsonlSha256Summary).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('returns newline-terminated safe JSONL only when includeJsonl is true', async () => {
    const result = await buildPackage({ includeJsonl: true });
    expect(result.status).toBe('EXPORT_PACKAGE_READY');
    expect(result.includeJsonl).toBe(true);
    expect(result.jsonl).toEqual(expect.any(String));
    expect(result.jsonl?.endsWith('\n')).toBe(true);
    expect(result.jsonl?.split('\n').filter(Boolean)).toHaveLength(2);
    expect(result.jsonlSha256Summary).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(result.jsonl).not.toContain('rawDbRow');
  });

  it('keeps jsonlSha256Summary stable for the same safe rows', async () => {
    const first = await buildPackage({ includeJsonl: true });
    const second = await buildPackage({ includeJsonl: true });
    expect(first.jsonlSha256Summary).toBe(second.jsonlSha256Summary);
  });

  it('fails closed on duplicate row_id', async () => {
    const rows = await buildRows();
    const duplicate = { ...rows[1], row_id: rows[0].row_id };
    const result = await buildPackage({ rows: [rows[0], duplicate] });
    expect(result.status).toBe('BLOCKED');
    expect(result.unsafeReasonCodes).toContain('duplicate_row_id');
    expect(result.jsonl).toBeNull();
  });

  it.each([
    ['auditExportId', { auditExportId: undefined }, 'audit_export_id_required'],
    ['sourceHeadSha', { sourceHeadSha: undefined }, 'source_head_sha_required'],
    ['sourceHash', { sourceHash: undefined }, 'source_hash_required'],
    ['exportedAt', { exportedAt: undefined }, 'exported_at_required']
  ])('fails closed when %s is missing', async (_label, override, reason) => {
    const result = await buildPackage(override);
    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain(reason);
  });

  it('fails closed on metadata mismatch', async () => {
    const rows = await buildRows();
    const result = await buildPackage({ rows: [{ ...rows[0], source_hash: 'c'.repeat(40) }, rows[1]] });
    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain('source_hash_mismatch');
  });

  it.each(['runtime_ready', 'staging_ready', 'production_ready'])(
    'rejects forbidden readiness claim %s',
    async (readinessClaim) => {
      const rows = await buildRows();
      const result = await buildPackage({ rows: [{ ...rows[0], readiness_claim: readinessClaim as 'none' }, rows[1]] });
      expect(result.status).toBe('BLOCKED');
      expect(result.unsafeReasonCodes).toContain('readiness_claim_forbidden');
      expect(result.runtimeReadinessClaimed).toBe(false);
      expect(result.productionReadinessClaimed).toBe(false);
    }
  );

  it.each([
    ['rawCheckpoint', 'rawCheckpoint'],
    ['rawTxHash', 'rawTxHash'],
    ['rawWallet', 'rawWallet'],
    ['rawDbRow', 'rawDbRow'],
    ['raw provider error', 'rawProviderError'],
    ['raw env', 'rawEnv'],
    ['raw path', 'privatePath'],
    ['endpoint', 'endpoint']
  ])('fails closed on forbidden key %s', async (_label, key) => {
    const rows = await buildRows();
    const unsafeRow = { ...rows[0], [key]: 'unsafe-summary' } as TierUpdateSafeDbReadExportMockSafeRow;
    const result = await buildPackage({ rows: [unsafeRow, rows[1]] });
    expect(result.status).toBe('BLOCKED');
    expect(result.unsafeReasonCodes.join('|')).toContain('forbidden_key');
  });

  it('fails closed on unsafe values', async () => {
    const rows = await buildRows();
    const unsafeRow = { ...rows[0], safe_summary: { kind: 'DATABASE_URL=unsafe' } } as TierUpdateSafeDbReadExportMockSafeRow;
    const result = await buildPackage({ rows: [unsafeRow, rows[1]] });
    expect(result.status).toBe('BLOCKED');
    expect(result.unsafeReasonCodes.join('|')).toContain('unsafe_value');
  });

  it('preserves safe aliases in JSONL', async () => {
    const result = await buildPackage({ includeJsonl: true });
    const text = result.jsonl ?? '';
    expect(text).toContain('checkpoint_summary');
    expect(text).toContain('tx_hash_summary');
    expect(text).toContain('tx_contract_address_summary');
    expect(text).toContain('tx_from_summary');
    expect(text).toContain('tx_to_summary');
    expect(text).toContain('user_identity_summary');
  });

  it('does not return raw wallet, raw txHash, raw checkpoint, env, path, or provider error values', async () => {
    const result = await buildPackage({ includeJsonl: true });
    const text = stringify(result);
    expect(text).not.toContain('rawWallet');
    expect(text).not.toContain('rawTxHash');
    expect(text).not.toContain('rawCheckpoint');
    expect(text).not.toContain('DATABASE_URL=');
    expect(text).not.toContain('C:\\Users\\');
    expect(text).not.toContain('raw provider');
  });

  it('does not perform DB query, Prisma client, file write, artifact upload, Docker smoke, or readiness claims', async () => {
    const result = await buildPackage();
    const source = fs.readFileSync(sourcePath, 'utf8');
    expect(result.actualDbExport).toBe(false);
    expect(result.realDbQuery).toBe(false);
    expect(result.prismaClientUsed).toBe(false);
    expect(result.prismaClientAccepted).toBe(false);
    expect(result.databaseUrlRead).toBe(false);
    expect(result.fileExported).toBe(false);
    expect(result.artifactUploaded).toBe(false);
    expect(result.dockerSmoke).toBe(false);
    expect(result.runtimeReadinessClaimed).toBe(false);
    expect(result.productionReadinessClaimed).toBe(false);
    expect(source).not.toMatch(/@prisma\/client|PrismaClient|process\.env\.DATABASE_URL|writeFile|upload[A-Z(]|queryRaw|executeRaw/);
  });
});
