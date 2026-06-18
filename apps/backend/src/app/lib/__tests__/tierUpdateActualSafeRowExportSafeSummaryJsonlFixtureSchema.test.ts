import fs from 'fs';
import path from 'path';
import {
  D8AO_CANONICAL_FIELD_ORDER,
  D8AO_ENTITY_TYPE_ALLOWLIST,
  D8AO_EVIDENCE_ORIGIN_ALLOWLIST,
  D8AO_READINESS_CLAIM_ALLOWLIST,
  D8AO_SAFETY_FLAG_ALLOWLIST,
  D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST,
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema
} from '../tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema';
import type {
  BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput
} from '../tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema';

const sourceHeadSha = 'a'.repeat(40);

const mockLaneClosure = {
  status: 'SOURCE_CANDIDATE_MOCK_LANE_CLOSED',
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_lane_closure',
  traceLabel: 'd8an_actual_safe_row_export_read_only_source_candidate_mock_lane_closure',
  closureId: 'mock-lane-closure-safe-1',
  sourceHeadSha,
  mockLaneClosed: true,
  zeroRealRowsVerified: true,
  noActualAccessVerified: true,
  noDbQueryVerified: true,
  noDbExportVerified: true,
  noPrismaVerified: true,
  noDatabaseUrlReadVerified: true,
  noEnvReadVerified: true,
  noNetworkRpcWalletContractTxVerified: true,
  noFileExportVerified: true,
  noJsonlFileExportVerified: true,
  noArtifactUploadVerified: true,
  noDockerSmokeChangeVerified: true,
  noStagingNoTxPassVerified: true,
  noRuntimeReadinessVerified: true,
  noProductionReadinessVerified: true,
  sameHeadRequirementPreserved: true,
  futureOwnerScopeRequired: true,
  blockers: [],
  needsReviewReasons: [],
  nextSafeAction: 'prepare_pr_d8ao_safe_summary_jsonl_fixture_schema'
};

const baseInput = (): BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput => ({
  mockLaneClosure,
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

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput> = {}) => (
  buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema', () => {
  it('returns SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_READY for a valid D8AN closure', () => {
    const result = build();

    expect(result.status).toBe('SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_safe_summary_jsonl_fixture_schema');
    expect(result.traceLabel).toBe('d8ao_actual_safe_row_export_safe_summary_jsonl_fixture_schema');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.fixtureOnly).toBe(true);
    expect(result.inMemoryOnly).toBe(true);
    expect(result.zeroRealRows).toBe(true);
    expect(result.nextSafeAction).toBe('prepare_pr_d8ap_safe_summary_jsonl_fixture_in_memory_builder');
  });

  it('ready output contains exact canonical field order and all 21 required keys', () => {
    const result = build();

    expect(result.canonicalFieldOrder).toEqual([
      'schema_version',
      'audit_export_id',
      'source_head_sha',
      'source_hash',
      'exported_at',
      'row_id',
      'dataset_name',
      'entity_type',
      'source_table',
      'source_file',
      'status',
      'evidence_origin',
      'readiness_claim',
      'record_summary',
      'public_visible_fields',
      'internal_only_field_labels',
      'wallet_address_summary',
      'chain_id',
      'network_label',
      'expected_safe_summary',
      'safety_flags'
    ]);
    expect(result.canonicalFieldOrder).toHaveLength(21);
    expect(result.fieldDefinitions.map((field) => field.key)).toEqual(result.canonicalFieldOrder);
  });

  it('ready output does not return row values, JSONL lines, or readiness overclaims', () => {
    const result = build();

    expect(result.rowValuePolicy.fixtureRowsAccepted).toBe(false);
    expect(result.rowValuePolicy.actualRowsAccepted).toBe(false);
    expect(result.rowValuePolicy.rawRowsAccepted).toBe(false);
    expect(result.rowValuePolicy.recordsAccepted).toBe(false);
    expect(result.rowValuePolicy.jsonlLinesAccepted).toBe(false);
    expect(result.jsonlContract.jsonlLinesReturned).toBe(false);
    expect(result.jsonlContract.fileWriteEnabled).toBe(false);
    expect(result.boundarySummary.actualDbQueryEnabled).toBe(false);
    expect(result.boundarySummary.actualDbExportEnabled).toBe(false);
    expect(result.boundarySummary.sourceAccessEnabled).toBe(false);
    expect(result.boundarySummary.runtimeReadinessClaimed).toBe(false);
    expect(result.boundarySummary.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing D8AN', { mockLaneClosure: null }],
    ['non-ready D8AN', { mockLaneClosure: { ...mockLaneClosure, status: 'BLOCKED' } }],
    ['mockLaneClosed false', { mockLaneClosure: { ...mockLaneClosure, mockLaneClosed: false } }],
    ['zero real rows false', { mockLaneClosure: { ...mockLaneClosure, zeroRealRowsVerified: false } }],
    ['missing fixtureSchemaId', { fixtureSchemaId: null }],
    ['missing closureId', { mockLaneClosure: { ...mockLaneClosure, closureId: null } }],
    ['missing sourceHeadSha', { sourceHeadSha: null, mockLaneClosure: { ...mockLaneClosure, sourceHeadSha: null } }],
    ['malformed sourceHeadSha', { sourceHeadSha: 'source-head-safe', mockLaneClosure: { ...mockLaneClosure, sourceHeadSha: 'source-head-safe' } }],
    ['inMemoryOnly false', { inMemoryOnly: false }],
    ['fixtureOnly false', { fixtureOnly: false }],
    ['zeroRealRowsRequired false', { zeroRealRowsRequired: false }],
    ['oneJsonObjectPerLine false', { oneJsonObjectPerLineContract: false }],
    ['utf8 false', { utf8Required: false }],
    ['canonical order false', { canonicalFieldOrderRequired: false }],
    ['multiline strings allowed', { multilineStringForbidden: false }],
    ['non-sha256 source hash algorithm', { sourceHashAlgorithm: 'md5' }],
    ['unsafe row id strategy', { rowIdStrategy: 'raw_db_primary_key' }],
    ['actual export id strategy', { auditExportIdStrategy: 'actual_export_batch_id' }]
  ])('blocks %s', (_name, overrides) => {
    const result = build(overrides);

    expect(result.status).toBe('BLOCKED');
  });

  it.each(['execute', 'query', 'read_source', 'db_read', 'export', 'jsonl_export', 'file_write', 'artifact_upload', 'runtime', 'worker', 'cron', 'route', 'cli', 'docker_smoke', 'staging', 'production'])(
    'blocks unsafe schemaContractMode %s',
    (schemaContractMode) => {
      expect(build({ schemaContractMode }).status).toBe('BLOCKED');
    }
  );

  it.each(D8AO_CANONICAL_FIELD_ORDER)('blocks missing required field %s', (missingField) => {
    const requiredFields = D8AO_CANONICAL_FIELD_ORDER.filter((field) => field !== missingField);

    expect(build({ requiredFields }).status).toBe('BLOCKED');
  });

  it('blocks duplicate field and canonical order mismatch', () => {
    expect(build({ requiredFields: [...D8AO_CANONICAL_FIELD_ORDER, 'schema_version'] }).status).toBe('BLOCKED');
    expect(build({ canonicalFieldOrder: [...D8AO_CANONICAL_FIELD_ORDER].reverse() }).status).toBe('BLOCKED');
  });

  it('blocks unsafe field type', () => {
    const fieldDefinitions = D8AO_CANONICAL_FIELD_ORDER.map((key) => ({
      key,
      required: true as const,
      type: key === 'public_visible_fields' ? 'nested_raw_object' : 'string',
      policy: 'safe'
    }));

    expect(build({ fieldDefinitions }).status).toBe('BLOCKED');
  });

  it.each([
    ['source_file Windows path policy', { sourceFilePolicy: 'C:\\Users\\name\\secret.txt' }],
    ['source_file Unix path policy', { sourceFilePolicy: '/home/name/secret.txt' }],
    ['path traversal policy', { sourceFilePolicy: '../secret.txt' }],
    ['nested public visible object', { publicVisibleFieldsPolicy: 'nested raw object allowed' }],
    ['public visible array', { publicVisibleFieldsPolicy: 'array allowed' }],
    ['public visible binary', { publicVisibleFieldsPolicy: 'binary payload allowed' }],
    ['full wallet policy', { walletAddressSummaryPolicy: 'full_address' }]
  ])('blocks %s', (_name, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it.each(['raw_db', 'actual_db', 'db_query', 'source_access', 'runtime', 'staging_runtime', 'production', 'wallet_rpc', 'raw_log', 'raw_payload'])(
    'blocks forbidden evidence origin %s',
    (origin) => {
      expect(build({ evidenceOriginAllowlist: [...D8AO_EVIDENCE_ORIGIN_ALLOWLIST, origin] }).status).toBe('BLOCKED');
    }
  );

  it.each(['actual_source_ready', 'actual_db_ready', 'db_read_ready', 'export_ready', 'jsonl_ready', 'artifact_ready', 'docker_ready', 'staging_ready', 'staging_no_tx_pass', 'runtime_ready', 'production_ready', 'mainnet_ready'])(
    'blocks forbidden readiness label %s',
    (claim) => {
      expect(build({ readinessClaimAllowlist: [...D8AO_READINESS_CLAIM_ALLOWLIST, claim] }).status).toBe('BLOCKED');
    }
  );

  it('blocks executable safety flag and weakened wallet allowlist', () => {
    expect(build({ safetyFlagAllowlist: [...D8AO_SAFETY_FLAG_ALLOWLIST, 'executes_query'] }).status).toBe('BLOCKED');
    expect(build({ walletAddressSummaryAllowlist: [...D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST, 'full_address'] }).status).toBe('BLOCKED');
  });

  it.each([
    ['fixtureRows input', { fixtureRows: [{}] }],
    ['actualRows input', { actualRows: [{}] }],
    ['rawRows input', { rawRows: [{}] }],
    ['records input', { records: [{}] }],
    ['jsonlLines input', { jsonlLines: ['{}'] }],
    ['raw payload input', { rawPayload: { raw_payload: true } }],
    ['SQL input', { sql: 'select * from table' }],
    ['query input', { query: 'select * from table' }],
    ['blockers present', { blockers: ['manual_blocker'] }],
    ['multiple next actions', { nextSafeAction: 'prepare_pr_d8ap_safe_summary_jsonl_fixture_in_memory_builder,actual_source' }],
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
    expect(build({ [flag]: true } as Partial<BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput>).status).toBe('BLOCKED');
    expect(build({ boundarySummary: { [flag]: true } }).status).toBe('BLOCKED');
  });

  it.each([
    ['raw secret separator variants', { recordSummary: 'raw secret: value' }],
    ['raw env separator variants', { recordSummary: 'raw_env=value' }],
    ['raw log separator variants', { recordSummary: 'raw log included' }],
    ['raw payload separator variants', { expectedSafeSummary: 'raw_payload=value' }],
    ['endpoint separator variants', { expectedSafeSummary: 'raw endpoint: value' }],
    ['Windows path', { recordSummary: 'C:\\Users\\name\\file.txt' }],
    ['Unix path', { recordSummary: '/home/name/file.txt' }],
    ['full wallet', { recordSummary: '0x1234567890abcdef1234567890abcdef12345678' }],
    ['private key label with value', { recordSummary: 'private key=value' }],
    ['JWT label with value', { recordSummary: 'jwt=value' }],
    ['cookie label with value', { recordSummary: 'cookie=value' }],
    ['Authorization label with value', { recordSummary: 'Authorization: Bearer value' }],
    ['readiness overclaim', { expectedSafeSummary: 'runtime_ready' }]
  ])('blocks %s', (_name, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it('returns NEEDS_REVIEW for optional description omission without unsafe boundary', () => {
    expect(build({ sourceFilePolicy: 'optional_description_missing' }).status).toBe('NEEDS_REVIEW');
  });

  it('returns NEEDS_REVIEW for isolated unknown network label', () => {
    expect(build({ networkLabelAllowlist: ['unknown'] }).status).toBe('NEEDS_REVIEW');
  });

  it('returns NEEDS_REVIEW for isolated deferred entity', () => {
    expect(build({ entityTypeAllowlist: ['deferred_entity'] }).status).toBe('NEEDS_REVIEW');
  });

  it('asserts canonical allowlists independently', () => {
    expect(D8AO_ENTITY_TYPE_ALLOWLIST).toContain('scheduled_tier_update');
    expect(D8AO_ENTITY_TYPE_ALLOWLIST).toContain('wallet_summary');
    expect(D8AO_EVIDENCE_ORIGIN_ALLOWLIST).toEqual(['fixture', 'local_test', 'remote_gate', 'mock_lane_closure', 'safe_summary_shape']);
    expect(D8AO_READINESS_CLAIM_ALLOWLIST).toEqual(['none', 'fixture_only', 'fixture_schema_ready', 'fixture_validation_pass', 'needs_review']);
    expect(D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST).toEqual(['none', 'synthetic', 'masked', 'hash_summary']);
    expect(D8AO_SAFETY_FLAG_ALLOWLIST).toContain('no_jsonl_file_export');
  });

  it('keeps nextSafeAction singular', () => {
    const result = build();

    expect(result.nextSafeAction).toBe('prepare_pr_d8ap_safe_summary_jsonl_fixture_in_memory_builder');
    expect(result.nextSafeAction).not.toContain(',');
  });

  it('source file does not import Prisma, read env, touch filesystem, or call network', () => {
    const sourcePath = path.join(__dirname, '..', 'tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema.ts');
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/from ['"]@prisma\/client['"]/);
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/from ['"]fs['"]|require\(['"]fs['"]\)/);
    expect(source).not.toMatch(/fetch\(|axios|http\.|https\./);
  });
});
