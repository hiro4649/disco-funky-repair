import { createHash } from 'node:crypto';
import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema,
  D8AO_CANONICAL_FIELD_ORDER
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

const sha256Hex = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');

const withSchema = (overrides: Record<string, unknown>) => ({
  d8aoSchema: {
    ...d8aoSchema,
    ...overrides
  }
});

const withJsonlContract = (overrides: Record<string, unknown>) => withSchema({
  jsonlContract: {
    ...d8aoSchema.jsonlContract,
    ...overrides
  }
});

const withIdentifierPolicies = (overrides: Record<string, unknown>) => withSchema({
  identifierPolicies: {
    ...d8aoSchema.identifierPolicies,
    ...overrides
  }
});

const withRowValuePolicy = (overrides: Record<string, unknown>) => withSchema({
  rowValuePolicy: {
    ...d8aoSchema.rowValuePolicy,
    ...overrides
  }
});

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

  it('uses real SHA-256 digest semantics for source_hash', () => {
    const result = build();
    const expectedDigest = sha256Hex('fixture-build-safe-1:fixture:0');

    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(result.rows[0].source_hash).toBe(`sha256:${expectedDigest}`);
    expect(result.rows[0].source_hash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('keeps source_hash deterministic without repeated chunk digest behavior', () => {
    const first = build();
    const second = build();
    const digest = first.rows[0].source_hash.replace('sha256:', '');

    expect(first.rows[0].source_hash).toBe(second.rows[0].source_hash);
    expect(first.rows[0].source_hash).not.toBe(first.rows[1].source_hash);
    expect(first.rows[0].source_hash).not.toBe(first.rows[2].source_hash);
    expect(digest).not.toBe(digest.slice(0, 8).repeat(8));
  });

  it('does not expose source_hash seed inputs or unsafe labels', () => {
    const result = build();

    expect(result.rows[0].source_hash).not.toContain('fixture-build-safe-1');
    expect(result.rows[0].source_hash).not.toContain('fixture');
    expect(result.rows[0].source_hash).not.toContain(sourceHeadSha);
    expect(result.rows[0].source_hash).not.toContain('path');
    expect(result.rows[0].source_hash).not.toContain('endpoint');
    expect(result.rows[0].source_hash).not.toContain('secret');
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
    ['entityTypeAllowlist unsafe replacement', withSchema({ entityTypeAllowlist: ['unsafe_runtime_entity'] })],
    ['entityTypeAllowlist missing item', withSchema({ entityTypeAllowlist: d8aoSchema.entityTypeAllowlist.slice(1) })],
    ['entityTypeAllowlist extra item', withSchema({ entityTypeAllowlist: [...d8aoSchema.entityTypeAllowlist, 'unsafe_runtime_entity'] })],
    ['wallet allowlist extra full address', withSchema({ walletAddressSummaryAllowlist: [...d8aoSchema.walletAddressSummaryAllowlist, 'full_address'] })],
    ['chain allowlist unknown chain', withSchema({ chainIdAllowlist: [...d8aoSchema.chainIdAllowlist, 1] })],
    ['network label runtime addition', withSchema({ networkLabelAllowlist: [...d8aoSchema.networkLabelAllowlist, 'runtime'] })],
    ['evidence origin raw db addition', withSchema({ evidenceOriginAllowlist: [...d8aoSchema.evidenceOriginAllowlist, 'raw_db'] })],
    ['readiness claim runtime ready addition', withSchema({ readinessClaimAllowlist: [...d8aoSchema.readinessClaimAllowlist, 'runtime_ready'] })],
    ['safety flag executable addition', withSchema({ safetyFlagAllowlist: [...d8aoSchema.safetyFlagAllowlist, 'executable'] })]
  ])('blocks canonical allowlist weakening: %s', (_name, overrides) => {
    const result = build(overrides);

    expect(result.status).toBe('BLOCKED');
    expect(result.rows).toEqual([]);
  });

  it.each([
    ['field definition type mutation', withSchema({ fieldDefinitions: d8aoSchema.fieldDefinitions.map((field, index) => index === 0 ? { ...field, type: 'number' } : field) })],
    ['field definition required mutation', withSchema({ fieldDefinitions: d8aoSchema.fieldDefinitions.map((field, index) => index === 0 ? { ...field, required: false } : field) })],
    ['field definition policy mutation', withSchema({ fieldDefinitions: d8aoSchema.fieldDefinitions.map((field, index) => index === 0 ? { ...field, policy: 'weakened policy' } : field) })],
    ['field definition duplicate key', withSchema({ fieldDefinitions: d8aoSchema.fieldDefinitions.map((field, index) => index === 1 ? { ...field, key: D8AO_CANONICAL_FIELD_ORDER[0] } : field) })]
  ])('blocks canonical field definition weakening: %s', (_name, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput>);

    expect(result.status).toBe('BLOCKED');
    expect(result.rows).toEqual([]);
  });

  it.each([
    ['utf8Required false', withJsonlContract({ utf8Required: false })],
    ['oneJsonObjectPerLineContract false', withJsonlContract({ oneJsonObjectPerLineContract: false })],
    ['canonicalFieldOrderRequired false', withJsonlContract({ canonicalFieldOrderRequired: false })],
    ['multilineStringForbidden false', withJsonlContract({ multilineStringForbidden: false })],
    ['commentsForbidden false', withJsonlContract({ commentsForbidden: false })],
    ['jsonlLinesReturned true', withJsonlContract({ jsonlLinesReturned: true })],
    ['fileWriteEnabled true', withJsonlContract({ fileWriteEnabled: true })],
    ['maxFixtureRowBytes mutation', withJsonlContract({ maxFixtureRowBytes: 32767 })],
    ['rowIdStrategy mutation', withIdentifierPolicies({ rowIdStrategy: 'caller_controlled' })],
    ['auditExportIdStrategy mutation', withIdentifierPolicies({ auditExportIdStrategy: 'caller_controlled' })],
    ['rowValuesAccepted true', withRowValuePolicy({ rowValuesAccepted: true })],
    ['fixtureRowsAccepted true', withRowValuePolicy({ fixtureRowsAccepted: true })],
    ['actualRowsAccepted true', withRowValuePolicy({ actualRowsAccepted: true })],
    ['rawRowsAccepted true', withRowValuePolicy({ rawRowsAccepted: true })],
    ['recordsAccepted true', withRowValuePolicy({ recordsAccepted: true })],
    ['jsonlLinesAccepted true', withRowValuePolicy({ jsonlLinesAccepted: true })]
  ])('blocks canonical policy weakening: %s', (_name, overrides) => {
    const result = build(overrides);

    expect(result.status).toBe('BLOCKED');
    expect(result.rows).toEqual([]);
  });

  it.each([
    ['different valid fixtureSchemaId', { fixtureSchemaId: 'different-safe-schema' }],
    ['different valid sourceHeadSha', { sourceHeadSha: 'c'.repeat(40) }],
    ['different d8aoSchemaStatus', { d8aoSchemaStatus: 'BLOCKED' }]
  ])('blocks explicit schema binding mismatch: %s', (_name, overrides) => {
    const result = build(overrides);

    expect(result.status).toBe('BLOCKED');
    expect(result.rows).toEqual([]);
  });

  it('keeps same explicit schema binding values ready', () => {
    const result = build({
      fixtureSchemaId: d8aoSchema.fixtureSchemaId,
      sourceHeadSha: d8aoSchema.sourceHeadSha,
      d8aoSchemaStatus: d8aoSchema.status
    });

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY');
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
    ['actualRows empty', { actualRows: [] }],
    ['rawRows empty', { rawRows: [] }],
    ['dbRows empty', { dbRows: [] }],
    ['sourceRows empty', { sourceRows: [] }],
    ['records empty', { records: [] }],
    ['jsonlLines empty', { jsonlLines: [] }],
    ['filePath empty', { filePath: '' }],
    ['outputPath empty', { outputPath: '' }],
    ['artifactName empty', { artifactName: '' }],
    ['sql empty', { sql: '' }],
    ['query empty', { query: '' }],
    ['rawPayload empty object', { rawPayload: {} }],
    ['endpoint empty', { endpoint: '' }]
  ])('blocks forbidden input presence even when value is empty: %s', (_name, overrides) => {
    const result = build(overrides);

    expect(result.status).toBe('BLOCKED');
    expect(result.rows).toEqual([]);
  });

  it.each([
    ['secret blocker', { blockers: ['secret=example'] }, 'secret=example'],
    ['path blocker', { blockers: ['C:\\private\\path'] }, 'C:\\private\\path'],
    ['endpoint blocker', { blockers: ['https://private.example.invalid'] }, 'https://private.example.invalid'],
    ['wallet blocker', { blockers: ['0x1234567890abcdef1234567890abcdef12345678'] }, '0x1234567890abcdef1234567890abcdef12345678'],
    ['safe blocker code', { blockers: ['caller_safe_code'] }, 'caller_safe_code']
  ])('redacts upstream blocker text: %s', (_name, overrides, unsafeValue) => {
    const result = build(overrides);
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toEqual(expect.arrayContaining(['upstream_blocker_present']));
    expect(result.blockers).not.toContain(unsafeValue);
    expect(serialized).not.toContain(unsafeValue);
    expect(result.rows).toEqual([]);
  });

  it('does not block when upstream blockers is an empty array', () => {
    expect(build({ blockers: [] }).status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY');
  });

  it('blocks non-array upstream blockers without throwing', () => {
    const input = { blockers: 'secret=example' } as unknown as BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput;

    expect(() => build(input)).not.toThrow();
    expect(build(input).status).toBe('BLOCKED');
    expect(JSON.stringify(build(input))).not.toContain('secret=example');
  });

  it.each([
    'unknown_network_label_isolated_review',
    'incomplete_safe_fixture_coverage'
  ])('preserves safe review reason %s', (reason) => {
    const result = build({ needsReviewReasons: [reason] });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.needsReviewReasons).toEqual(expect.arrayContaining([reason]));
  });

  it('redacts unsafe upstream review reason', () => {
    const result = build({ needsReviewReasons: ['raw_secret=value'] });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.needsReviewReasons).toEqual(['upstream_review_reason_redacted']);
    expect(serialized).not.toContain('raw_secret=value');
  });

  it('blocks non-array upstream review reasons without throwing', () => {
    const input = { needsReviewReasons: 'raw_secret=value' } as unknown as BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput;

    expect(() => build(input)).not.toThrow();
    expect(build(input).status).toBe('BLOCKED');
    expect(JSON.stringify(build(input))).not.toContain('raw_secret=value');
  });

  it.each([
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
    ['1.5', 1.5],
    ['0.5', 0.5],
    ['-1', -1],
    ['0', 0],
    ['SAFE_ROW_CAP+1', 13]
  ])('blocks invalid fixtureRowsRequested %s', (_name, fixtureRowsRequested) => {
    const result = build({ fixtureRowsRequested });

    expect(result.status).toBe('BLOCKED');
    expect(result.rows).toEqual([]);
  });

  it.each([1, 12])('allows valid fixtureRowsRequested %s', (fixtureRowsRequested) => {
    const result = build({
      fixtureRowsRequested,
      fixtureEntityTypes: ['fixture']
    });

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY');
    expect(result.rowCount).toBe(fixtureRowsRequested);
  });

  it('uses safe default dataset only when fixtureDatasetName is absent', () => {
    const result = build();

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY');
    expect(result.rows[0].dataset_name).toBe('safe_summary_jsonl_fixture_dataset');
  });

  it.each([
    ['empty string', ''],
    ['null', null],
    ['undefined', undefined],
    ['whitespace', '   ']
  ])('blocks explicit empty fixtureDatasetName %s', (_name, fixtureDatasetName) => {
    const input = { fixtureDatasetName } as unknown as Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput>;
    const result = build(input);

    expect(result.status).toBe('BLOCKED');
    expect(result.rows).toEqual([]);
  });

  it('uses fixture_only readiness only when overrideReadinessClaim is absent', () => {
    const result = build();

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY');
    expect(result.rows[0].readiness_claim).toBe('fixture_only');
  });

  it.each([
    ['empty string', ''],
    ['null', null],
    ['undefined', undefined],
    ['runtime ready', 'runtime_ready']
  ])('blocks unsafe explicit overrideReadinessClaim %s', (_name, overrideReadinessClaim) => {
    const input = { overrideReadinessClaim } as unknown as Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput>;
    const result = build(input);

    expect(result.status).toBe('BLOCKED');
    expect(result.rows).toEqual([]);
  });

  it('allows needs_review override without runtime readiness claim', () => {
    const result = build({ overrideReadinessClaim: 'needs_review' });

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY');
    expect(result.rows[0].readiness_claim).toBe('needs_review');
    expect(result.boundarySummary.runtimeReadinessClaimed).toBe(false);
  });

  it.each([
    ['dataset whitespace', { fixtureDatasetName: 'bad dataset' }],
    ['dataset newline', { fixtureDatasetName: 'bad\ndataset' }],
    ['dataset URL', { fixtureDatasetName: 'https://example.invalid/dataset' }],
    ['dataset slash', { fixtureDatasetName: 'bad/dataset' }],
    ['dataset over 96 chars', { fixtureDatasetName: `a${'b'.repeat(96)}` }],
    ['override row ID whitespace', { overrideRowIds: ['row one', 'row-two', 'row-three'] }],
    ['override row ID newline', { overrideRowIds: ['row-one', 'row\ntwo', 'row-three'] }],
    ['override row ID path', { overrideRowIds: ['row-one', '../row-two', 'row-three'] }],
    ['override row ID full wallet', { overrideRowIds: ['row-one', '0x1234567890abcdef1234567890abcdef12345678', 'row-three'] }],
    ['override row ID over 128 chars', { overrideRowIds: [`a${'b'.repeat(128)}`, 'row-two', 'row-three'] }],
    ['override row IDs length mismatch', { overrideRowIds: ['row-one'] }]
  ])('blocks unsafe dataset or row id: %s', (_name, overrides) => {
    const result = build(overrides);

    expect(result.status).toBe('BLOCKED');
    expect(result.rows).toEqual([]);
  });

  it('valid safe override row IDs remain ready', () => {
    const result = build({ overrideRowIds: ['row-one', 'row-two', 'row-three'] });

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY');
    expect(result.rowIds).toEqual(['row-one', 'row-two', 'row-three']);
  });

  it('blocks non-array fixtureEntityTypes without throwing', () => {
    const input = { fixtureEntityTypes: 'fixture' } as unknown as BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput;

    expect(() => build(input)).not.toThrow();
    expect(build(input).status).toBe('BLOCKED');
    expect(build(input).rows).toEqual([]);
  });

  it('returns NEEDS_REVIEW without rows for unknown_review_only entity', () => {
    const result = build({ fixtureEntityTypes: ['unknown_review_only'] });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.needsReviewReasons).toEqual(expect.arrayContaining(['unknown_entity_type_isolated_review']));
    expect(result.rowCount).toBe(0);
    expect(result.rows).toEqual([]);
    expect(result.rowIds).toEqual([]);
    expect(result.entityTypes).toEqual([]);
    expect(d8aoSchema.entityTypeAllowlist).not.toContain('unknown_review_only');
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

  it('reflects forbidden boundary flag attempts in safe boundary summary', () => {
    const result = build({
      actualDbQueryEnabled: true,
      boundarySummary: { actualDbQueryEnabled: false }
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.boundarySummary.actualDbQueryEnabled).toBe(true);
    expect(result.rows).toEqual([]);
  });

  it('keeps all forbidden boundary flags false for READY output', () => {
    const result = build();

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY');
    expect(result.boundarySummary.actualDbQueryEnabled).toBe(false);
    expect(result.boundarySummary.actualDbExportEnabled).toBe(false);
    expect(result.boundarySummary.sourceAccessEnabled).toBe(false);
    expect(result.boundarySummary.prismaClientEnabled).toBe(false);
    expect(result.boundarySummary.databaseUrlReadEnabled).toBe(false);
    expect(result.boundarySummary.envReadEnabled).toBe(false);
    expect(result.boundarySummary.fileExportEnabled).toBe(false);
    expect(result.boundarySummary.jsonlFileExportEnabled).toBe(false);
    expect(result.boundarySummary.artifactUploadEnabled).toBe(false);
    expect(result.boundarySummary.runtimeReadinessClaimed).toBe(false);
    expect(result.boundarySummary.productionReadinessClaimed).toBe(false);
  });

  it('blocks duplicate row_id', () => {
    expect(build({ overrideRowIds: ['duplicate', 'duplicate', 'third'] }).status).toBe('BLOCKED');
  });

  it('blocks unsafe readiness claim', () => {
    expect(build({ overrideReadinessClaim: 'runtime_ready' }).status).toBe('BLOCKED');
  });

  it.each([
    ['unsafe dataset', { fixtureDatasetName: 'bad dataset' }, 'bad dataset'],
    ['full wallet override', { overrideRowIds: ['row-one', '0x1234567890abcdef1234567890abcdef12345678', 'row-three'] }, '0x1234567890abcdef1234567890abcdef12345678'],
    ['private path input', { fixtureBuildId: 'private_path_build' }, 'private_path_build'],
    ['runtime readiness override', { overrideReadinessClaim: 'runtime_ready' }, 'runtime_ready'],
    ['actual row object input', { actualRows: [{ unsafe: 'raw_secret_value' }] }, 'raw_secret_value']
  ])('blocked output strips unsafe supplied value: %s', (_name, overrides, unsafeValue) => {
    const result = build(overrides);
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('BLOCKED');
    expect(result.rowCount).toBe(0);
    expect(result.rows).toEqual([]);
    expect(result.rowIds).toEqual([]);
    expect(result.entityTypes).toEqual([]);
    expect(serialized).not.toContain(unsafeValue);
  });

  it('does not echo invalid top-level identifiers', () => {
    const result = build({
      fixtureBuildId: 'private_path_build',
      fixtureSchemaId: 'different-safe-schema',
      sourceHeadSha: 'c'.repeat(40)
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.fixtureBuildId).toBe('');
    expect(result.fixtureSchemaId).toBe('');
    expect(result.sourceHeadSha).toBe('');
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

  it('source file uses deterministic SHA-256 and no random or time behavior', () => {
    const sourcePath = path.join(__dirname, '..', 'tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder.ts');
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).toMatch(/from ['"]node:crypto['"]/);
    expect(source).toMatch(/createHash\(['"]sha256['"]\)/);
    expect(source).toMatch(/update\(value, ['"]utf8['"]\)/);
    expect(source).toMatch(/digest\(['"]hex['"]\)/);
    expect(source).toMatch(/row\.source_hash !== `sha256:\$[{]sha256Hex\(`\$[{]fixtureBuildId[}]:\$[{]row\.entity_type[}]:\$[{]index[}]`[)][}]`/);
    expect(source).not.toMatch(/randomBytes|randomUUID|Date\.now|Math\.random/);
  });
});
