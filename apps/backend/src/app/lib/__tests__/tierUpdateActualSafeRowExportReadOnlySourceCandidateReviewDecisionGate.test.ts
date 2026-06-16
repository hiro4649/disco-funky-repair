import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGateInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate';

const reviewPacket = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_review_packet',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_REVIEW_PACKET_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8ab_actual_safe_row_export_read_only_source_candidate_review_packet',
  reviewPacketId: 'review-packet-safe-1',
  sourceHeadSha: 'source-head-safe',
  rowCount: 1,
  readyRowCount: 1,
  blockers: [],
  needsReviewReasons: [],
  deferredEntityTypes: [],
  unsupportedEntityTypes: [],
  operatorChecklist: ['verify no actual DB export'],
  reviewSections: {
    scopeSummary: { status: 'present', safeSummaryOnly: true },
    boundarySummary: { status: 'present', safeSummaryOnly: true }
  }
};

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGateInput => ({
  reviewPacket: reviewPacket as any,
  decisionGateId: 'decision-gate-safe-1',
  ownerIntentMode: 'owner_review_boundary',
  decisionRequestLabel: 'review_decision_boundary_only',
  manualDecisionRequired: true,
  allowedDecisionOptions: [
    'request_d8ad_safe_source_access_plan_boundary',
    'request_more_fixture_review',
    'block_until_scope_repaired',
    'leave_open_no_source_access'
  ],
  forbiddenDecisionOptions: [
    'run_actual_db_query',
    'run_actual_db_export',
    'open_source_access',
    'use_prisma_client',
    'read_database_url',
    'read_env',
    'write_file_export',
    'write_jsonl_export',
    'upload_artifact',
    'run_docker_smoke',
    'claim_staging_no_tx_pass',
    'claim_runtime_readiness',
    'claim_production_readiness'
  ]
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGateInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate', () => {
  it('returns SOURCE_CANDIDATE_REVIEW_DECISION_READY for valid D8AB review packet', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_REVIEW_DECISION_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_review_decision_gate');
    expect(result.traceLabel).toBe('d8ac_actual_safe_row_export_read_only_source_candidate_review_decision_gate');
    expect(result.decisionReadiness).toBe('ready_for_owner_decision_boundary');
    expect(result.safeSummaryOnly).toBe(true);
  });

  it.each([
    ['D8AB status missing', { reviewPacket: null, reviewPacketStatus: null }],
    ['D8AB status not ready', { reviewPacket: { ...reviewPacket, status: 'BLOCKED' } as any }],
    ['missing reviewPacketId', { reviewPacket: { ...reviewPacket, reviewPacketId: '' } as any, reviewPacketId: '' }],
    ['missing sourceHeadSha', { reviewPacket: { ...reviewPacket, sourceHeadSha: '' } as any, sourceHeadSha: '' }],
    ['missing safe allowed decision options', { allowedDecisionOptions: [] }],
    ['allowedDecisionOptions include run_actual_db_query', { allowedDecisionOptions: ['run_actual_db_query'] }],
    ['allowedDecisionOptions include open_source_access', { allowedDecisionOptions: ['open_source_access'] }],
    ['allowedDecisionOptions include write_jsonl_export', { allowedDecisionOptions: ['write_jsonl_export'] }],
    ['nextSafeAction suggests actual source access', { d8abNextSafeAction: 'open_source_access' }],
    ['ownerIntentMode suggests direct source access', { ownerIntentMode: 'direct_source_access' }],
    ['blockers are present', { reviewPacket: { ...reviewPacket, blockers: ['upstream_blocked'] } as any }]
  ])('blocks when %s', (_label, overrides) => {
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
    ['raw secret label', { decisionGateId: 'raw-secret-gate' }],
    ['raw env label', { decisionRequestLabel: 'raw_env_review' }],
    ['raw log label', { ownerIntentMode: 'raw_log_review' }],
    ['raw payload label', { decisionRequestLabel: 'raw_payload_check' }],
    ['raw endpoint label', { decisionRequestLabel: 'raw_endpoint_check' }],
    ['private path label', { decisionRequestLabel: 'private_path_review' }],
    ['local path label', { decisionRequestLabel: 'local_path_review' }]
  ])('blocks %s', (_label, overrides) => {
    const result = build(overrides);

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain('unsafe_decision_label');
  });

  it('blocks public readiness overclaim', () => {
    const result = build({ decisionRequestLabel: 'runtime_ready' });

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain('public_readiness_or_execution_overclaim');
  });

  it('returns NEEDS_REVIEW when deferred entity types are isolated', () => {
    const result = build({ deferredEntityTypes: ['nft_metadata'] });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.needsReviewReasons).toContain('deferred_or_unsupported_entity_isolated');
  });

  it('returns NEEDS_REVIEW when manualDecisionRequired is true and review-only reasons exist', () => {
    const result = build({
      reviewPacket: { ...reviewPacket, needsReviewReasons: ['operator_review_required'] } as any,
      manualDecisionRequired: true
    });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.needsReviewReasons).toContain('upstream_needs_review:operator_review_required');
  });

  it('allowedDecisionOptions never include forbidden actions in ready case', () => {
    const options = build().allowedDecisionOptions.join('\n');

    [
      'run_actual_db_query',
      'run_actual_db_export',
      'open_source_access',
      'write_jsonl_export'
    ].forEach((option) => expect(options).not.toContain(option));
  });

  it('forbiddenDecisionOptions include actual DB/source/export/runtime forbidden actions', () => {
    const options = build().forbiddenDecisionOptions.join('\n');

    [
      'run_actual_db_query',
      'run_actual_db_export',
      'open_source_access',
      'use_prisma_client',
      'read_database_url',
      'read_env',
      'write_file_export',
      'write_jsonl_export',
      'upload_artifact',
      'run_docker_smoke',
      'claim_staging_no_tx_pass',
      'claim_runtime_readiness',
      'claim_production_readiness'
    ].forEach((option) => expect(options).toContain(option));
  });

  it('operatorChecklist includes owner decision boundaries', () => {
    const checklist = build().operatorChecklist.join('\n');

    expect(checklist).toContain('verify owner decision remains boundary-only');
    expect(checklist).toContain('verify manual owner decision is required before future source plan');
    expect(checklist).toContain('verify no source access');
  });

  it('nextSafeAction is singular', () => {
    const nextSafeAction = build().nextSafeAction;

    expect(nextSafeAction.split(',')).toHaveLength(1);
    expect(nextSafeAction).toBe('prepare_pr_d8ad_actual_safe_row_export_read_only_source_access_plan_boundary');
    expect(nextSafeAction).not.toBe('open_source_access');
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
      'tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate.ts'
    );
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|PrismaClient/);
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/from ['"]fs['"]|readFile|writeFile|createWriteStream/);
    expect(source).not.toMatch(/fetch\(|axios|http\.|https\./);
  });
});
