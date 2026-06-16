import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifierInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier';

const readyFixture = { status: 'SAFE_SUMMARY_FIXTURE_READY' };
const readyShape = { status: 'SAFE_SUMMARY_SHAPE_READY' };
const readyContract = { status: 'SOURCE_CANDIDATE_CONTRACT_READY' };
const readyProbe = { status: 'SOURCE_CANDIDATE_DISABLED_PROBE_READY' };
const readyGate = { status: 'REAL_SOURCE_GATE_READY' };

const validRow = {
  schema_version: '1',
  audit_export_id: 'audit-safe-1',
  source_head_sha: 'safe-head-summary',
  source_hash: 'safe-source-hash',
  exported_at: '2026-06-16T00:00:00.000Z',
  row_id: 'row-1',
  entity_type: 'scheduled_tier_update',
  source_table: 'scheduled_tier_update',
  status: 'safe_summary_fixture',
  evidence_origin: 'fixture',
  readiness_claim: 'none',
  checkpoint_summary: 'summary-only'
};

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifierInput => ({
  safeSummaryFixture: readyFixture as any,
  safeSummaryShape: readyShape as any,
  sourceCandidateContract: readyContract as any,
  sourceCandidateDisabledProbe: readyProbe as any,
  realSourceGate: readyGate as any,
  fixtureRows: [{ ...validRow }],
  expectedEntities: ['scheduled_tier_update'],
  expectedFieldAllowlist: Object.keys(validRow)
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifierInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier', () => {
  it('returns FIXTURE_VERIFIER_READY for valid D8Z fixture rows', () => {
    const result = build();

    expect(result.status).toBe('FIXTURE_VERIFIER_READY');
    expect(result.verifierKind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_fixture_verifier');
    expect(result.traceLabel).toBe('d8aa_actual_safe_row_export_read_only_source_candidate_fixture_verifier');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.verifierSummary).toMatchObject({
      fixtureOnly: true,
      actualExportReady: false,
      actualSourceAccessReady: false,
      runtimeReady: false
    });
  });

  it('keeps ready status separate from actual export, source, staging, runtime, and production readiness', () => {
    const result = build();

    expect(result.actualDbExportEnabled).toBe(false);
    expect(result.actualDbQueryEnabled).toBe(false);
    expect(result.sourceAccessEnabled).toBe(false);
    expect(result.fileExportEnabled).toBe(false);
    expect(result.jsonlFileExportEnabled).toBe(false);
    expect(result.runtimeReadinessClaimed).toBe(false);
    expect(result.productionReadinessClaimed).toBe(false);
    expect(result.stagingNoTxPreflightStatus).toBe('BLOCKED');
  });

  it.each([
    ['missing D8Z', { safeSummaryFixture: null }],
    ['blocked D8Z', { safeSummaryFixture: { status: 'BLOCKED' } as any }],
    ['missing D8Y', { safeSummaryShape: null }],
    ['missing D8W', { sourceCandidateContract: null }],
    ['missing D8X', { sourceCandidateDisabledProbe: null }],
    ['missing D8V', { realSourceGate: null }]
  ])('blocks when upstream is not ready: %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it('blocks duplicate row_id', () => {
    expect(build({ fixtureRows: [{ ...validRow }, { ...validRow }] }).compactBlockerCodes).toContain('duplicate_row_id');
  });

  it.each([
    'row_id',
    'schema_version',
    'audit_export_id',
    'source_head_sha',
    'source_hash',
    'exported_at'
  ])('blocks missing required field %s', (field) => {
    const row = { ...validRow } as Record<string, unknown>;
    delete row[field];

    const result = build({ fixtureRows: [row as any] });

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain(`missing_required_field:${field}`);
  });

  it('blocks unsupported entity', () => {
    const result = build({
      expectedEntities: ['unsupported_entity'],
      fixtureRows: [{ ...validRow, entity_type: 'unsupported_entity' }]
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('unsupported_entity_for_d8aa_boundary');
  });

  it.each(['runtime_ready', 'staging_ready', 'production_ready'])('blocks %s readiness claim', (claim) => {
    const result = build({ fixtureRows: [{ ...validRow, readiness_claim: claim }] });

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('forbidden_readiness_claim');
  });

  it.each([
    ['actual DB export flag', { actualDbExportEnabled: true }],
    ['real DB query flag', { actualDbQueryEnabled: true }],
    ['source access flag', { sourceAccessEnabled: true }],
    ['Prisma client flag', { prismaClientEnabled: true }],
    ['DATABASE_URL read flag', { databaseUrlReadEnabled: true }],
    ['env read flag', { envReadEnabled: true }],
    ['network access flag', { networkAccessEnabled: true }],
    ['RPC access flag', { rpcAccessEnabled: true }],
    ['wallet access flag', { walletAccessEnabled: true }],
    ['contract access flag', { contractAccessEnabled: true }],
    ['tx send flag', { txSendEnabled: true }],
    ['file export flag', { fileExportEnabled: true }],
    ['JSONL file export flag', { jsonlFileExportEnabled: true }],
    ['artifact upload flag', { artifactUploadEnabled: true }],
    ['Docker smoke change flag', { dockerSmokeChanged: true }],
    ['staging no-tx PASS flag', { stagingNoTxPassClaimed: true }],
    ['runtime readiness flag', { runtimeReadinessClaimed: true }],
    ['production readiness flag', { productionReadinessClaimed: true }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it.each([
    ['raw secret label', { secret: 'blocked' }],
    ['raw env label', { rawEnv: 'blocked' }],
    ['raw log label', { rawLog: 'blocked' }],
    ['raw payload label', { rawPayload: 'blocked' }],
    ['raw endpoint label', { rawEndpoint: 'blocked' }],
    ['private path label', { privatePath: 'blocked' }],
    ['local path label', { localPath: 'blocked' }]
  ])('blocks %s', (_label, extraField) => {
    const result = build({ fixtureRows: [{ ...validRow, ...extraField }] });

    expect(result.status).toBe('BLOCKED');
    expect(result.forbiddenFieldStatus).toBe('blocked');
  });

  it.each(['Prize', 'Nft', 'TokenDetail', 'TicketCode'])('marks %s as deferred or unsupported', (entity) => {
    const result = build({
      expectedEntities: [entity],
      fixtureRows: [{ ...validRow, entity_type: entity }]
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('deferred_entity_for_d8aa_boundary');
  });

  it('keeps nextSafeAction singular', () => {
    expect(build().nextSafeAction.split(',')).toHaveLength(1);
  });

  it('ready status text does not claim actual DB export, source, or runtime readiness', () => {
    const result = build();
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain('actual_db_export_ready');
    expect(serialized).not.toContain('source_access_ready');
    expect(serialized).not.toContain('runtime_ready');
  });

  it('does not import Prisma, read process.env, touch filesystem, or call network', () => {
    const sourcePath = path.join(
      __dirname,
      '..',
      'tierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier.ts'
    );
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|PrismaClient/);
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/from ['"]fs['"]|readFile|writeFile|createWriteStream/);
    expect(source).not.toMatch(/fetch\(|axios|http\.|https\./);
  });
});
