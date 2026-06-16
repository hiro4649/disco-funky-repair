import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacketInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket';

const fixtureVerifier = {
  status: 'FIXTURE_VERIFIER_READY',
  verifierKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_fixture_verifier',
  traceLabel: 'd8aa_actual_safe_row_export_read_only_source_candidate_fixture_verifier'
};

const row = {
  schema_version: '1',
  audit_export_id: 'audit-safe-1',
  source_head_sha: 'source-head-safe',
  source_hash: 'source-hash-safe',
  exported_at: '2026-06-16T00:00:00.000Z',
  row_id: 'row-1',
  entity_type: 'scheduled_tier_update',
  source_table: 'scheduled_tier_update',
  status: 'safe_summary_fixture',
  evidence_origin: 'fixture',
  readiness_claim: 'none'
};

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacketInput => ({
  fixtureVerifier: fixtureVerifier as any,
  fixtureVerifierKind: fixtureVerifier.verifierKind,
  fixtureVerifierTraceLabel: fixtureVerifier.traceLabel,
  rows: [{ ...row }],
  sourceHeadSha: 'source-head-safe',
  reviewPacketId: 'review-packet-safe-1',
  operatorIntentLabel: 'review_only_boundary',
  expectedRowCount: 1,
  readyRowCount: 1,
  blockedRowCount: 0,
  needsReviewRowCount: 0,
  optionalDisplayLabel: 'D8AB review packet',
  entityCoverageComplete: true,
  evidenceOrigins: ['fixture']
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacketInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket', () => {
  it('returns SOURCE_CANDIDATE_REVIEW_PACKET_READY for valid D8AA verifier result', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_REVIEW_PACKET_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_review_packet');
    expect(result.traceLabel).toBe('d8ab_actual_safe_row_export_read_only_source_candidate_review_packet');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.rowCount).toBe(1);
    expect(result.readyRowCount).toBe(1);
  });

  it.each([
    ['D8AA status missing', { fixtureVerifier: null }],
    ['D8AA status not ready', { fixtureVerifier: { status: 'BLOCKED' } as any }],
    ['missing sourceHeadSha', { sourceHeadSha: null }],
    ['missing reviewPacketId', { reviewPacketId: null, auditReviewId: null }],
    ['rows absent', { rows: [] }],
    ['rowCount mismatch', { expectedRowCount: 2 }],
    ['readyRowCount mismatch', { readyRowCount: 0 }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it.each([
    ['actual DB export flag', { actualDbExportEnabled: true }],
    ['real DB query flag', { actualDbQueryEnabled: true }],
    ['source access flag', { sourceAccessEnabled: true }],
    ['Prisma client flag', { prismaClientEnabled: true }],
    ['DATABASE_URL read flag', { databaseUrlReadEnabled: true }],
    ['env read flag', { envReadEnabled: true }],
    ['network/RPC/wallet/contract/tx access flag', { networkRpcWalletContractTxAccessEnabled: true }],
    ['file export flag', { fileExportEnabled: true }],
    ['JSONL file export flag', { jsonlFileExportEnabled: true }],
    ['artifact upload flag', { artifactUploadEnabled: true }],
    ['Docker smoke change flag', { dockerSmokeChanged: true }],
    ['staging no-tx PASS claim', { stagingNoTxPassClaimed: true }],
    ['runtime readiness claim', { runtimeReadinessClaimed: true }],
    ['production readiness claim', { productionReadinessClaimed: true }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it.each([
    ['raw secret label', { reviewPacketId: 'raw-secret-value' }],
    ['raw env label', { operatorIntentLabel: 'raw_env_review' }],
    ['raw log label', { optionalDisplayLabel: 'raw_log_review' }],
    ['raw payload label', { evidenceOrigins: ['raw_payload'] }],
    ['raw endpoint label', { evidenceOrigins: ['raw_endpoint'] }],
    ['private path label', { optionalDisplayLabel: 'private_path_review' }],
    ['local path label', { optionalDisplayLabel: 'local_path_review' }]
  ])('blocks %s', (_label, overrides) => {
    const result = build(overrides);

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain('unsafe_review_packet_label');
  });

  it('blocks public readiness overclaim', () => {
    const result = build({ safeNextActionOverride: 'runtime_ready' });

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain('public_readiness_overclaim');
  });

  it('returns NEEDS_REVIEW for deferred unsupported entity isolated safely', () => {
    const result = build({
      deferredEntityTypes: ['nft_metadata'],
      unsupportedEntityTypes: ['nft_metadata']
    });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.needsReviewReasons).toContain('deferred_or_unsupported_entity_isolated');
  });

  it('returns NEEDS_REVIEW for incomplete optional coverage without unsafe boundary', () => {
    const result = build({ entityCoverageComplete: false });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.needsReviewReasons).toContain('entity_coverage_incomplete');
  });

  it('operator checklist includes all forbidden boundary checks', () => {
    const checklist = build().operatorChecklist.join('\n');

    [
      'verify no actual DB export',
      'verify no real DB query',
      'verify no source access',
      'verify no Prisma client',
      'verify no DATABASE_URL read',
      'verify no env read',
      'verify no network/RPC/wallet/contract/tx access',
      'verify no file export',
      'verify no JSONL file export',
      'verify no artifact upload',
      'verify no Docker smoke change',
      'verify no staging no-tx PASS',
      'verify no runtime readiness',
      'verify no production readiness',
      'verify next step is D8AC boundary only, not source access'
    ].forEach((item) => expect(checklist).toContain(item));
  });

  it('nextSafeAction is singular and does not authorize D8AC actual source access', () => {
    const nextSafeAction = build().nextSafeAction;

    expect(nextSafeAction.split(',')).toHaveLength(1);
    expect(nextSafeAction).toBe('prepare_pr_d8ac_actual_safe_row_export_read_only_source_candidate_review_packet_shape_or_dry_run_boundary');
    expect(nextSafeAction).not.toContain('source_access');
    expect(nextSafeAction).not.toContain('actual_db_query');
  });

  it('ready status text does not claim actual DB/source/export/runtime readiness', () => {
    const serialized = JSON.stringify(build());

    expect(serialized).not.toContain('actual_db_export_ready');
    expect(serialized).not.toContain('source_access_ready');
    expect(serialized).not.toContain('jsonl_export_ready');
    expect(serialized).not.toContain('runtime_ready');
  });

  it('does not import Prisma, read process.env, touch filesystem, or call network', () => {
    const sourcePath = path.join(
      __dirname,
      '..',
      'tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket.ts'
    );
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|PrismaClient/);
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/from ['"]fs['"]|readFile|writeFile|createWriteStream/);
    expect(source).not.toMatch(/fetch\(|axios|http\.|https\./);
  });
});
