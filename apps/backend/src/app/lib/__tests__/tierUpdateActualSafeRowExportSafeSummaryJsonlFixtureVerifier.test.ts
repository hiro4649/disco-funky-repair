import { createHash } from 'node:crypto';
import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema
} from '../tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema';
import {
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder
} from '../tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder';
import {
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier
} from '../tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier';
import type {
  BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput
} from '../tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier';

const sourceHeadSha = 'c'.repeat(40);

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

const d8apBuild = () => buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder({
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

const baseInput = (): BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput => ({
  d8apBuild: d8apBuild(),
  fixtureVerifierId: 'fixture-verifier-safe-1',
  verificationMode: 'in_memory_fixture_verification',
  fixtureOnlyRequired: true,
  inMemoryOnlyRequired: true,
  zeroRealRowsRequired: true,
  noFileOutputRequired: true,
  noJsonlFileOutputRequired: true,
  noArtifactUploadRequired: true,
  nextSafeAction: 'request_owner_scope_for_d8ar_actual_source_candidate_field_allowlist'
});

const verify = (overrides: Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput> = {}) => (
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier({
    ...baseInput(),
    ...overrides
  })
);

const withBuild = (overrides: Record<string, unknown>) => ({
  d8apBuild: {
    ...d8apBuild(),
    ...overrides
  }
});

const withFirstRow = (overrides: Record<string, unknown>) => {
  const build = d8apBuild();
  return {
    d8apBuild: {
      ...build,
      rows: [
        { ...build.rows[0], ...overrides },
        ...build.rows.slice(1)
      ]
    }
  };
};

const removeFirstRowKey = (key: string) => {
  const build = d8apBuild();
  const row = { ...build.rows[0] } as Record<string, unknown>;
  delete row[key];
  return {
    d8apBuild: {
      ...build,
      rows: [row, ...build.rows.slice(1)]
    }
  };
};

const withUnsafeString = (value: string) => withFirstRow({ record_summary: value });
const sha256Hex = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');

describe('tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier', () => {
  it('valid D8AP result returns SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_READY without returning rows', () => {
    const result = verify();

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_safe_summary_jsonl_fixture_verifier');
    expect(result.traceLabel).toBe('d8aq_actual_safe_row_export_safe_summary_jsonl_fixture_verifier');
    expect(result.verifiedRowCount).toBe(3);
    expect(result.verifiedEntityTypes).toEqual(['fixture', 'scheduled_tier_update', 'job_run']);
    expect(result.nextSafeAction).toBe('request_owner_scope_for_d8ar_actual_source_candidate_field_allowlist');
    expect(result).not.toHaveProperty('rows');
    expect(result).not.toHaveProperty('public_visible_fields');
    expect(result).not.toHaveProperty('record_summary');
    expect(result).not.toHaveProperty('expected_safe_summary');
  });

  it('ready output verifies all expected booleans and keeps forbidden boundaries false', () => {
    const result = verify();

    expect(result.schemaContractVerified).toBe(true);
    expect(result.buildMetadataVerified).toBe(true);
    expect(result.canonicalKeysVerified).toBe(true);
    expect(result.rowTypesVerified).toBe(true);
    expect(result.rowIdsUniqueVerified).toBe(true);
    expect(result.sourceHashesVerified).toBe(true);
    expect(result.timestampsVerified).toBe(true);
    expect(result.safeStringsVerified).toBe(true);
    expect(result.publicFieldsVerified).toBe(true);
    expect(result.internalLabelsVerified).toBe(true);
    expect(result.requiredSafetyFlagsVerified).toBe(true);
    expect(result.boundarySummary.actualDbQueryEnabled).toBe(false);
    expect(result.boundarySummary.fileExportEnabled).toBe(false);
    expect(result.boundarySummary.jsonlFileExportEnabled).toBe(false);
    expect(result.boundarySummary.artifactUploadEnabled).toBe(false);
  });

  it('uses independent SHA-256 semantic verification for source_hash', () => {
    const result = verify();

    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(result.sourceHashesVerified).toBe(true);
  });

  it.each([
    ['missing d8apBuild', { d8apBuild: null }],
    ['malformed d8apBuild primitive', { d8apBuild: 'bad' as unknown as never }],
    ['D8AP blocked status', withBuild({ status: 'BLOCKED' })],
    ['D8AP needs review status', withBuild({ status: 'NEEDS_REVIEW' })],
    ['kind mismatch', withBuild({ kind: 'wrong_kind' })],
    ['traceLabel mismatch', withBuild({ traceLabel: 'wrong_trace' })],
    ['schemaVersion mismatch', withBuild({ schemaVersion: '2' })],
    ['skill profile mismatch', withBuild({ skillProfileId: 'WRONG' })],
    ['safeSummaryOnly false', withBuild({ safeSummaryOnly: false })],
    ['fixtureBuildId missing', withBuild({ fixtureBuildId: '' })],
    ['fixtureSchemaId missing', withBuild({ fixtureSchemaId: '' })],
    ['sourceHeadSha missing', withBuild({ sourceHeadSha: '' })],
    ['fixtureOnly false', withBuild({ fixtureOnly: false })],
    ['inMemoryOnly false', withBuild({ inMemoryOnly: false })],
    ['zeroRealRows false', withBuild({ zeroRealRows: false })],
    ['rowCount non-integer', withBuild({ rowCount: 1.5 })],
    ['rowCount below one', withBuild({ rowCount: 0, rows: [], rowIds: [], entityTypes: [] })],
    ['rowCount above cap', withBuild({ rowCount: 13 })],
    ['rows primitive', withBuild({ rows: 'bad' })],
    ['rowIds primitive', withBuild({ rowIds: 'bad' })],
    ['entityTypes primitive', withBuild({ entityTypes: 'bad' })],
    ['canonicalFieldOrder mismatch', withBuild({ canonicalFieldOrder: ['row_id'] })],
    ['jsonlLinesReturned true', withBuild({ jsonlContract: { ...d8apBuild().jsonlContract, jsonlLinesReturned: true } })],
    ['fileWriteEnabled true', withBuild({ jsonlContract: { ...d8apBuild().jsonlContract, fileWriteEnabled: true } })],
    ['inMemoryRowsOnly false', withBuild({ jsonlContract: { ...d8apBuild().jsonlContract, inMemoryRowsOnly: false } })],
    ['D8AP blockers present', withBuild({ blockerCount: 1, blockers: ['safe_blocker'] })],
    ['D8AP nextSafeAction mismatch', withBuild({ nextSafeAction: 'actual_source_access' })]
  ])('blocks top-level build issue: %s', (_name, overrides) => {
    const result = verify(overrides);

    expect(result.status).toBe('BLOCKED');
    expect(result.verifiedRowCount).toBe(0);
  });

  it.each([
    ['fixtureVerifierId missing', { fixtureVerifierId: '' }],
    ['verificationMode missing', { verificationMode: null }],
    ['verificationMode execute', { verificationMode: 'execute' }],
    ['verificationMode query', { verificationMode: 'query' }],
    ['verificationMode read_source', { verificationMode: 'read_source' }],
    ['verificationMode db_read', { verificationMode: 'db_read' }],
    ['verificationMode export', { verificationMode: 'export' }],
    ['verificationMode jsonl_export', { verificationMode: 'jsonl_export' }],
    ['verificationMode file_write', { verificationMode: 'file_write' }],
    ['verificationMode artifact_upload', { verificationMode: 'artifact_upload' }],
    ['verificationMode runtime', { verificationMode: 'runtime' }],
    ['verificationMode worker', { verificationMode: 'worker' }],
    ['verificationMode cron', { verificationMode: 'cron' }],
    ['verificationMode route', { verificationMode: 'route' }],
    ['verificationMode cli', { verificationMode: 'cli' }],
    ['verificationMode docker_smoke', { verificationMode: 'docker_smoke' }],
    ['verificationMode staging', { verificationMode: 'staging' }],
    ['verificationMode production', { verificationMode: 'production' }],
    ['fixtureOnlyRequired false', { fixtureOnlyRequired: false }],
    ['inMemoryOnlyRequired false', { inMemoryOnlyRequired: false }],
    ['zeroRealRowsRequired false', { zeroRealRowsRequired: false }],
    ['noFileOutputRequired false', { noFileOutputRequired: false }],
    ['noJsonlFileOutputRequired false', { noJsonlFileOutputRequired: false }],
    ['noArtifactUploadRequired false', { noArtifactUploadRequired: false }],
    ['next action suggests DB', { nextSafeAction: 'actual_db_query' }]
  ])('blocks verifier policy issue: %s', (_name, overrides) => {
    expect(verify(overrides).status).toBe('BLOCKED');
  });

  it.each([
    ['actualRows', { actualRows: [] }],
    ['rawRows', { rawRows: [] }],
    ['dbRows', { dbRows: [] }],
    ['sourceRows', { sourceRows: [] }],
    ['records', { records: [] }],
    ['jsonlLines', { jsonlLines: [] }],
    ['filePath', { filePath: '' }],
    ['outputPath', { outputPath: '' }],
    ['artifactName', { artifactName: '' }],
    ['sql', { sql: '' }],
    ['query', { query: '' }],
    ['rawPayload', { rawPayload: {} }],
    ['endpoint', { endpoint: '' }]
  ])('blocks forbidden top-level input presence: %s', (_name, overrides) => {
    expect(verify(overrides).status).toBe('BLOCKED');
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
    const result = verify({ [flag]: true } as Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput>);

    expect(result.status).toBe('BLOCKED');
    expect(result.boundarySummary[flag as keyof typeof result.boundarySummary]).toBe(true);
  });

  it.each([
    ['row null', { d8apBuild: { ...d8apBuild(), rows: [null, ...d8apBuild().rows.slice(1)] } }],
    ['row array', { d8apBuild: { ...d8apBuild(), rows: [[], ...d8apBuild().rows.slice(1)] } }],
    ['missing key', removeFirstRowKey('source_hash')],
    ['extra key', { d8apBuild: { ...d8apBuild(), rows: [{ ...d8apBuild().rows[0], extra_key: 'x' }, ...d8apBuild().rows.slice(1)] } }],
    ['row ids order mismatch', withBuild({ rowIds: ['wrong-row', ...d8apBuild().rowIds.slice(1)] })],
    ['duplicate row id', { d8apBuild: { ...d8apBuild(), rows: [{ ...d8apBuild().rows[0], row_id: 'duplicate' }, { ...d8apBuild().rows[1], row_id: 'duplicate' }, d8apBuild().rows[2]], rowIds: ['duplicate', 'duplicate', d8apBuild().rowIds[2]] } }],
    ['unsafe row id', withFirstRow({ row_id: '../row' })],
    ['schema version mismatch', withFirstRow({ schema_version: '2' })],
    ['audit export mismatch', withFirstRow({ audit_export_id: 'audit-other' })],
    ['source head mismatch', withFirstRow({ source_head_sha: 'd'.repeat(40) })],
    ['hash format mismatch', withFirstRow({ source_hash: 'sha256:nothex' })],
    ['semantic hash mismatch', withFirstRow({ source_hash: `sha256:${'a'.repeat(64)}` })],
    ['hash swapped', { d8apBuild: { ...d8apBuild(), rows: [{ ...d8apBuild().rows[0], source_hash: d8apBuild().rows[1].source_hash }, ...d8apBuild().rows.slice(1)] } }],
    ['invalid timestamp', withFirstRow({ exported_at: 'not-a-date' })],
    ['non UTC timestamp', withFirstRow({ exported_at: '2026-01-01T00:00:00.000+09:00' })],
    ['date only timestamp', withFirstRow({ exported_at: '2026-01-01' })],
    ['unsafe dataset', withFirstRow({ dataset_name: 'bad dataset' })],
    ['unknown entity', withFirstRow({ entity_type: 'unsafe_entity' })],
    ['unsafe source table', withFirstRow({ source_table: 'public.table' })],
    ['source file path', withFirstRow({ source_file: 'C:\\private\\file.json' })],
    ['wrong status', withFirstRow({ status: 'runtime_ready' })],
    ['unsafe evidence origin', withFirstRow({ evidence_origin: 'raw_db' })],
    ['unsafe readiness claim', withFirstRow({ readiness_claim: 'runtime_ready' })],
    ['multiline summary', withFirstRow({ record_summary: 'line one\nline two' })],
    ['oversized summary', withFirstRow({ record_summary: 'a'.repeat(241) })],
    ['nested public object', withFirstRow({ public_visible_fields: { nested: { unsafe: true } } })],
    ['public array', withFirstRow({ public_visible_fields: { items: ['x'] } })],
    ['non finite public number', withFirstRow({ public_visible_fields: { amount: Infinity } })],
    ['unsafe public key', withFirstRow({ public_visible_fields: { 'bad key': 'x' } })],
    ['full wallet public value', withFirstRow({ public_visible_fields: { wallet: '0x1234567890abcdef1234567890abcdef12345678' } })],
    ['internal labels malformed', withFirstRow({ internal_only_field_labels: 'label' })],
    ['internal label value-like', withFirstRow({ internal_only_field_labels: ['secret=value'] })],
    ['wallet summary unsafe', withFirstRow({ wallet_address_summary: '0x1234567890abcdef1234567890abcdef12345678' })],
    ['chain id unsafe', withFirstRow({ chain_id: 1 })],
    ['network label unsafe', withFirstRow({ network_label: 'private_network' })],
    ['expected summary unsafe', withFirstRow({ expected_safe_summary: 'DATABASE_URL=value' })],
    ['required safety flag missing', withFirstRow({ safety_flags: d8apBuild().rows[0].safety_flags.slice(1) })],
    ['duplicate safety flag', withFirstRow({ safety_flags: [...d8apBuild().rows[0].safety_flags, d8apBuild().rows[0].safety_flags[0]] })],
    ['unknown executable safety flag', withFirstRow({ safety_flags: [...d8apBuild().rows[0].safety_flags, 'executes_query'] })],
    ['oversized row', withFirstRow({ record_summary: 'a'.repeat(33000) })],
    ['raw secret string', withUnsafeString('raw_secret=value')],
    ['raw env string', withUnsafeString('raw_env=value')],
    ['raw log string', withUnsafeString('raw_log=value')],
    ['raw payload string', withUnsafeString('raw_payload=value')],
    ['endpoint string', withUnsafeString('https://private.example.invalid')],
    ['windows path', withUnsafeString('C:\\Users\\private\\file.txt')],
    ['unix path', withUnsafeString('/home/private/file.txt')],
    ['path traversal', withUnsafeString('../private/file.txt')],
    ['JWT value', withUnsafeString('jwt=value')],
    ['cookie value', withUnsafeString('cookie=value')],
    ['Authorization value', withUnsafeString('Authorization: Bearer token')],
    ['database URL value', withUnsafeString('DATABASE_URL=postgresql://example')],
    ['RPC secret value', withUnsafeString('rpc_secret=value')],
    ['runtime overclaim', withUnsafeString('runtime_ready')]
  ])('blocks malformed or unsafe row: %s', (_name, overrides) => {
    const result = verify(overrides as Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput>);

    expect(result.status).toBe('BLOCKED');
    expect(result.verifiedRowCount).toBe(0);
    expect(result).not.toHaveProperty('rows');
  });

  it.each([
    ['needs_review readiness', withFirstRow({ readiness_claim: 'needs_review' })],
    ['unknown network label', withFirstRow({ network_label: 'unknown' })],
    ['deferred entity safety flag', withFirstRow({ safety_flags: [...d8apBuild().rows[0].safety_flags, 'deferred_entity'] })],
    ['needs review safety flag', withFirstRow({ safety_flags: [...d8apBuild().rows[0].safety_flags, 'needs_review'] })],
    ['safe upstream review reason', { needsReviewReasons: ['optional_fixture_metadata_incomplete'] }]
  ])('returns NEEDS_REVIEW for safe review-only condition: %s', (_name, overrides) => {
    const result = verify(overrides as Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput>);

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.verifiedRowCount).toBeGreaterThan(0);
    expect(result.nextSafeAction).toBe('collect_safe_summary_fixture_review');
    expect(result).not.toHaveProperty('rows');
  });

  it('redacts upstream blockers and unsafe review reasons without echoing raw values', () => {
    const result = verify({
      blockers: ['secret=example'],
      needsReviewReasons: ['raw_secret=value']
    });
    const serialized = JSON.stringify(result);

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toEqual(expect.arrayContaining(['upstream_blocker_present']));
    expect(result.needsReviewReasons).toEqual(expect.arrayContaining(['upstream_review_reason_redacted']));
    expect(serialized).not.toContain('secret=example');
    expect(serialized).not.toContain('raw_secret=value');
  });

  it('blocks malformed blocker/review collections without throwing', () => {
    const input = {
      blockers: 'secret=example',
      needsReviewReasons: 'raw_secret=value'
    } as unknown as BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput;

    expect(() => verify(input)).not.toThrow();
    expect(verify(input).status).toBe('BLOCKED');
    expect(JSON.stringify(verify(input))).not.toContain('secret=example');
  });

  it('handles cyclic malformed inputs without throwing or stringifying raw data', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const result = verify({
      rawPayload: cyclic,
      d8apBuild: {
        ...d8apBuild(),
        rows: [
          { ...d8apBuild().rows[0], public_visible_fields: cyclic },
          ...d8apBuild().rows.slice(1)
        ]
      }
    });

    expect(result.status).toBe('BLOCKED');
    expect(JSON.stringify(result)).not.toContain('self');
  });

  it('does not execute getter-based row properties', () => {
    const row = { ...d8apBuild().rows[0] } as Record<string, unknown>;
    Object.defineProperty(row, 'record_summary', {
      enumerable: true,
      get() {
        throw new Error('getter executed');
      }
    });

    expect(() => verify({
      d8apBuild: {
        ...d8apBuild(),
        rows: [row, ...d8apBuild().rows.slice(1)]
      }
    })).not.toThrow();
    expect(verify({
      d8apBuild: {
        ...d8apBuild(),
        rows: [row, ...d8apBuild().rows.slice(1)]
      }
    }).status).toBe('BLOCKED');
  });

  it('source file does not import Prisma, read env, touch filesystem, network, routes, or runtime wiring', () => {
    const sourcePath = path.join(__dirname, '..', 'tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier.ts');
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/from ['"]@prisma\/client['"]/);
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/from ['"]fs['"]|require\(['"]fs['"]\)/);
    expect(source).not.toMatch(/fetch\(|axios|http\.|https\./);
    expect(source).not.toMatch(/from ['"].*(controller|route|trackingService|main)['"]|trackingService|main\.ts/);
    expect(source).not.toMatch(/Date\.now|Math\.random|randomUUID|randomBytes/);
    expect(source).toMatch(/from ['"]node:crypto['"]/);
  });
});
