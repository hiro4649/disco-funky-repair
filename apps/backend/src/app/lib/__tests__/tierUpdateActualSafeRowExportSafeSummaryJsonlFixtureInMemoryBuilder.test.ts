import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema
} from '../tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema';
import {
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder
} from '../tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder';
import type {
  BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput
} from '../tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder';

const sourceHeadSha = 'b'.repeat(40);

const d8aoSchema = buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema({
  mockLaneClosure: {
    status: 'SOURCE_CANDIDATE_MOCK_LANE_CLOSED',
    closureId: 'mock-lane-closure-safe-1',
    sourceHeadSha,
    mockLaneClosed: true,
    zeroRealRowsVerified: true
  },
  fixtureSchemaId: 'safe-summary-jsonl-fixture-schema-v1',
  sourceHeadSha,
  schemaContractMode: 'fixture_schema_only',
  inMemoryOnly: true,
  fixtureOnly: true,
  zeroRealRowsRequired: true,
  oneJsonObjectPerLineContract: true,
  utf8Required: true,
  canonicalFieldOrderRequired: true,
  multilineStringForbidden: true,
  sourceHashAlgorithm: 'sha256',
  rowIdStrategy: 'synthetic_deterministic_safe_id',
  auditExportIdStrategy: 'synthetic_fixture_batch_id',
  nextSafeAction: 'prepare_pr_d8ap_safe_summary_jsonl_fixture_in_memory_builder'
});

const baseInput = (): BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput => ({
  d8aoSchema,
  fixtureBuildId: 'fixture-build-safe-1',
  fixtureRowsRequested: 3,
  fixtureEntityTypes: ['fixture', 'scheduled_tier_update', 'job_run'],
  syntheticSeedLabel: 'safe-seed',
  inMemoryOnly: true,
  fixtureOnly: true,
  zeroRealRowsRequired: true,
  noFileOutputRequired: true,
  noJsonlFileOutputRequired: true,
  nextSafeAction: 'prepare_pr_d8aq_safe_summary_jsonl_fixture_verifier'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput> = {}) => (
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder', () => {
  it('ready builds synthetic in-memory rows', () => {
    const result = build();

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_safe_summary_jsonl_fixture_in_memory_builder');
    expect(result.traceLabel).toBe('d8ap_actual_safe_row_export_safe_summary_jsonl_fixture_in_memory_builder');
    expect(result.fixtureOnly).toBe(true);
    expect(result.inMemoryOnly).toBe(true);
    expect(result.zeroRealRows).toBe(true);
    expect(result.nextSafeAction).toBe('prepare_pr_d8aq_safe_summary_jsonl_fixture_verifier');
  });

  it('ready row count matches request and rows have exact canonical keys', () => {
    const result = build();

    expect(result.rowCount).toBe(3);
    for (const row of result.rows) {
      expect(Object.keys(row)).toEqual(result.canonicalFieldOrder);
    }
  });

  it('ready rows have unique row_id and source_head_sha matches schema', () => {
    const result = build();

    expect(new Set(result.rowIds).size).toBe(result.rowIds.length);
    for (const row of result.rows) {
      expect(row.source_head_sha).toBe(sourceHeadSha);
      expect(row.source_hash).toMatch(/^sha256:[a-f0-9]{64}$/);
    }
  });

  it('ready rows use safe evidence origin, readiness claim, and required safety flags', () => {
    const result = build();

    for (const row of result.rows) {
      expect(['fixture', 'local_test', 'remote_gate', 'mock_lane_closure', 'safe_summary_shape']).toContain(row.evidence_origin);
      expect(['none', 'fixture_only', 'fixture_schema_ready', 'fixture_validation_pass', 'needs_review']).toContain(row.readiness_claim);
      expect(row.safety_flags).toEqual(expect.arrayContaining([
        'fixture_only',
        'synthetic_only',
        'no_actual_source_access',
        'no_db_query',
        'no_db_export',
        'no_file_export',
        'no_jsonl_file_export',
        'no_artifact_upload',
        'no_runtime_readiness'
      ]));
    }
  });

  it('ready does not return JSONL lines, write files, or enable file output', () => {
    const result = build();

    expect(result).not.toHaveProperty('jsonlLines');
    expect(result.jsonlContract.jsonlLinesReturned).toBe(false);
    expect(result.jsonlContract.fileWriteEnabled).toBe(false);
    expect(result.boundarySummary.fileExportEnabled).toBe(false);
    expect(result.boundarySummary.jsonlFileExportEnabled).toBe(false);
    expect(result.boundarySummary.artifactUploadEnabled).toBe(false);
  });

  it.each([
    ['missing D8AO', { d8aoSchema: null }],
    ['D8AO not ready', { d8aoSchema: { ...d8aoSchema, status: 'BLOCKED' } }],
    ['missing fixtureBuildId', { fixtureBuildId: null }],
    ['missing sourceHeadSha', { sourceHeadSha: null, d8aoSchema: { ...d8aoSchema, sourceHeadSha: null } }],
    ['invalid sourceHeadSha', { sourceHeadSha: 'not-a-sha', d8aoSchema: { ...d8aoSchema, sourceHeadSha: 'not-a-sha' } }],
    ['schema missing required field', { d8aoSchema: { ...d8aoSchema, canonicalFieldOrder: d8aoSchema.canonicalFieldOrder.slice(1) } }],
    ['canonical order mismatch', { d8aoSchema: { ...d8aoSchema, canonicalFieldOrder: [...d8aoSchema.canonicalFieldOrder].reverse() } }],
    ['missing allowlists', { d8aoSchema: { ...d8aoSchema, evidenceOriginAllowlist: undefined } }],
    ['fixtureRowsRequested too high', { fixtureRowsRequested: 13 }],
    ['fixtureRowsRequested zero', { fixtureRowsRequested: 0 }],
    ['unsafe entity type', { fixtureEntityTypes: ['unsafe_runtime_entity'] }],
    ['actualRows', { actualRows: [{}] }],
    ['rawRows', { rawRows: [{}] }],
    ['dbRows', { dbRows: [{}] }],
    ['sourceRows', { sourceRows: [{}] }],
    ['records', { records: [{}] }],
    ['jsonlLines', { jsonlLines: ['{}'] }],
    ['filePath', { filePath: 'safe-output.jsonl' }],
    ['outputPath', { outputPath: 'safe-output.jsonl' }],
    ['artifactName', { artifactName: 'artifact' }],
    ['SQL', { sql: 'select * from table' }],
    ['query', { query: 'select * from table' }],
    ['raw payload', { rawPayload: { raw_payload: true } }],
    ['endpoint', { endpoint: 'raw_endpoint=value' }],
    ['private path', { fixtureBuildId: 'private_path_build' }],
    ['full wallet', { fixtureBuildId: '0x1234567890abcdef1234567890abcdef12345678' }],
    ['actual source next action', { nextSafeAction: 'actual_source_access' }]
  ])('blocks %s', (_name, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it.each([
    'actualDbQueryEnabled',
    'actualDbExportEnabled',
    'realDbQueryEnabled',
    'sourceAccessEnabled',
    'prismaClientEnabled',
    'databaseUrlReadEnabled',
    'envReadEnabled',
    'networkRpcWalletContractTxAccessEnabled',
    'networkAccessEnabled',
    'rpcAccessEnabled',
    'walletAccessEnabled',
    'contractAccessEnabled',
    'txSendEnabled',
    'fileExportEnabled',
    'jsonlFileExportEnabled',
    'artifactUploadEnabled',
    'dockerSmokeChanged',
    'stagingNoTxPassClaimed',
    'runtimeReadinessClaimed',
    'productionReadinessClaimed'
  ])('blocks forbidden boundary flag %s', (flag) => {
    expect(build({ [flag]: true } as Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput>).status).toBe('BLOCKED');
    expect(build({ boundarySummary: { [flag]: true } }).status).toBe('BLOCKED');
  });

  it('blocks duplicate row_id', () => {
    expect(build({ overrideRowIds: ['duplicate', 'duplicate', 'third'] }).status).toBe('BLOCKED');
  });

  it('blocks unsafe readiness claim', () => {
    expect(build({ overrideReadinessClaim: 'runtime_ready' }).status).toBe('BLOCKED');
  });

  it('returns NEEDS_REVIEW for isolated unknown network label', () => {
    expect(build({ needsReviewReasons: ['unknown_network_label_isolated_review'] }).status).toBe('NEEDS_REVIEW');
  });

  it('returns NEEDS_REVIEW for incomplete safe fixture coverage', () => {
    expect(build({ needsReviewReasons: ['incomplete_safe_fixture_coverage'] }).status).toBe('NEEDS_REVIEW');
  });

  it('source file does not import Prisma, read env, touch filesystem, or call network', () => {
    const sourcePath = path.join(__dirname, '..', 'tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder.ts');
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/from ['"]@prisma\/client['"]/);
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/from ['"]fs['"]|require\(['"]fs['"]\)/);
    expect(source).not.toMatch(/fetch\(|axios|http\.|https\./);
    expect(source).not.toMatch(/controller|route|trackingService|main\.ts/);
  });
});
