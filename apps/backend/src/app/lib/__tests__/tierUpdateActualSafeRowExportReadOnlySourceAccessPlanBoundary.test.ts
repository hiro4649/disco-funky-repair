import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary
} from '../tierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary';

const reviewDecisionGate = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_review_decision_gate',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_REVIEW_DECISION_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8ac_actual_safe_row_export_read_only_source_candidate_review_decision_gate',
  decisionGateId: 'decision-gate-safe-1',
  reviewPacketId: 'review-packet-safe-1',
  sourceHeadSha: 'source-head-safe',
  ownerIntentMode: 'owner_review_boundary',
  decisionRequestLabel: 'review_decision_boundary_only',
  blockers: [],
  needsReviewReasons: [],
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
  ],
  operatorChecklist: ['verify no source access']
};

const plannedForbiddenFields = [
  'actual_db_query',
  'actual_db_export',
  'source_access',
  'prisma_client',
  'database_url_read',
  'env_read',
  'network_rpc_wallet_contract_tx_access',
  'file_export',
  'jsonl_file_export',
  'artifact_upload',
  'docker_smoke_change',
  'staging_no_tx_pass',
  'runtime_readiness',
  'production_readiness'
];

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput => ({
  reviewDecisionGate: reviewDecisionGate as any,
  sourceAccessPlanId: 'source-access-plan-safe-1',
  plannedExecutionMode: 'plan_only',
  plannedAccessMode: 'no_access',
  plannedSourceTables: ['scheduled_tier_update_safe_summary', 'job_run_safe_summary'],
  plannedEntityTypes: ['scheduled_tier_update', 'job_run'],
  plannedSafeFields: [
    'schema_version',
    'audit_export_id',
    'source_head_sha',
    'source_hash',
    'exported_at',
    'row_id',
    'entity_type',
    'source_table',
    'status',
    'evidence_origin',
    'readiness_claim'
  ],
  plannedPublicEvidenceFields: ['schema_version', 'row_id', 'entity_type', 'source_table', 'status'],
  plannedRedactedFields: ['wallet_summary', 'local_path', 'private_path'],
  plannedForbiddenFields,
  requiredPreconditions: ['future_owner_confirmation_required', 'same_head_remote_quality_gate_required'],
  ownerIntentMode: 'owner_review_boundary',
  decisionRequestLabel: 'source_access_plan_boundary_only',
  allowedDecisionOptions: reviewDecisionGate.allowedDecisionOptions,
  forbiddenDecisionOptions: reviewDecisionGate.forbiddenDecisionOptions,
  operatorChecklist: reviewDecisionGate.operatorChecklist
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary', () => {
  it('returns SOURCE_ACCESS_PLAN_BOUNDARY_READY for valid D8AC review decision gate', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_ACCESS_PLAN_BOUNDARY_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_access_plan_boundary');
    expect(result.traceLabel).toBe('d8ad_actual_safe_row_export_read_only_source_access_plan_boundary');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.planSummary.actualSourceAccessReady).toBe(false);
    expect(result.planSummary.actualDbReadReady).toBe(false);
    expect(result.planSummary.jsonlExportReady).toBe(false);
    expect(result.planSummary.runtimeReady).toBe(false);
    expect(result.nextSafeAction).toBe('prepare_pr_d8ae_actual_safe_row_export_read_only_source_candidate_mock_plan');
  });

  it.each([
    ['D8AC missing', { reviewDecisionGate: null, reviewDecisionGateStatus: null }],
    ['D8AC blocked', { reviewDecisionGate: { ...reviewDecisionGate, status: 'BLOCKED' } as any }],
    ['missing source access plan id', { sourceAccessPlanId: null }],
    ['missing decision gate id', { reviewDecisionGate: { ...reviewDecisionGate, decisionGateId: null } as any }],
    ['missing review packet id', { reviewDecisionGate: { ...reviewDecisionGate, reviewPacketId: null } as any }],
    ['missing source head sha', { reviewDecisionGate: { ...reviewDecisionGate, sourceHeadSha: null } as any }],
    ['execution mode execute', { plannedExecutionMode: 'execute' }],
    ['execution mode query', { plannedExecutionMode: 'query' }],
    ['access mode actual db read', { plannedAccessMode: 'actual_db_read' }],
    ['access mode actual source access', { plannedAccessMode: 'actual_source_access' }],
    ['access mode prisma client', { plannedAccessMode: 'prisma_client' }],
    ['access mode database url', { plannedAccessMode: 'database_url' }],
    ['unsafe source table', { plannedSourceTables: ['raw_secret_safe_summary'] }],
    ['unsupported source table', { plannedSourceTables: ['Prize'] }],
    ['unsafe safe field', { plannedSafeFields: ['schema_version', 'raw_secret'] }],
    ['private public evidence field', { plannedPublicEvidenceFields: ['wallet_summary'] }],
    ['missing redaction plan', { plannedSafeFields: ['schema_version', 'wallet_summary'], plannedRedactedFields: [] }],
    ['missing forbidden categories', { plannedForbiddenFields: ['actual_db_query'] }],
    ['D8AC next action attempts source access', { d8acNextSafeAction: 'actual_source_access' }],
    ['direct owner source access intent', { ownerIntentMode: 'direct_source_access' }],
    ['allowed decision option attempts actual query', { allowedDecisionOptions: ['run_actual_db_query'] }],
    ['actual DB query flag', { actualDbQueryEnabled: true }],
    ['actual DB export flag', { actualDbExportEnabled: true }],
    ['source access flag', { sourceAccessEnabled: true }],
    ['Prisma flag', { prismaClientEnabled: true }],
    ['DATABASE_URL flag', { databaseUrlReadEnabled: true }],
    ['env read flag', { envReadEnabled: true }],
    ['network/RPC/wallet/contract/tx flag', { networkRpcWalletContractTxAccessEnabled: true }],
    ['file export flag', { fileExportEnabled: true }],
    ['JSONL file export flag', { jsonlFileExportEnabled: true }],
    ['artifact upload flag', { artifactUploadEnabled: true }],
    ['Docker smoke flag', { dockerSmokeChanged: true }],
    ['staging no-tx PASS flag', { stagingNoTxPassClaimed: true }],
    ['runtime readiness flag', { runtimeReadinessClaimed: true }],
    ['production readiness flag', { productionReadinessClaimed: true }],
    ['runtime readiness label', { decisionRequestLabel: 'runtime_ready' }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it('maps upstream NEEDS_REVIEW to NEEDS_REVIEW', () => {
    const result = build({
      reviewDecisionGate: { ...reviewDecisionGate, status: 'NEEDS_REVIEW' } as any
    });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.nextSafeAction).toBe('collect_operator_source_access_plan_boundary_review');
  });

  it.each([
    ['deferred Prize entity', { plannedEntityTypes: ['prize'] }],
    ['deferred NFT metadata entity', { plannedEntityTypes: ['nft_metadata'] }],
    ['deferred TokenDetail entity', { plannedEntityTypes: ['token_detail'] }],
    ['deferred TicketCode entity', { plannedEntityTypes: ['ticket_code'] }],
    ['candidate safe summary table not yet approved', { plannedSourceTables: ['candidate_review_safe_summary'] }],
    ['missing future owner confirmation precondition', { requiredPreconditions: ['same_head_remote_quality_gate_required'] }]
  ])('returns NEEDS_REVIEW for %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('NEEDS_REVIEW');
  });

  it('retains required forbidden action categories and preconditions', () => {
    const result = build();

    plannedForbiddenFields.forEach((field) => expect(result.plannedForbiddenFields).toContain(field));
    expect(result.requiredPreconditions).toContain('future_owner_confirmation_required');
    expect(result.requiredPreconditions).toContain('same_head_remote_quality_gate_required');
    expect(result.operatorChecklist.join(' ')).toContain('verify no actual DB export');
    expect(result.operatorChecklist.join(' ')).toContain('verify no source access');
    expect(result.forbiddenActionSummary).toContain('actual_db_query');
    expect(result.forbiddenActionSummary).toContain('runtime_readiness');
  });

  it('keeps nextSafeAction singular and never points to execution or export', () => {
    const result = build();

    expect(typeof result.nextSafeAction).toBe('string');
    expect(result.nextSafeAction).not.toContain('actual_db_query');
    expect(result.nextSafeAction).not.toContain('actual_db_export');
    expect(result.nextSafeAction).not.toContain('source_access');
    expect(result.nextSafeAction).not.toContain('file_export');
    expect(result.nextSafeAction).not.toContain('artifact_upload');
    expect(result.nextSafeAction).not.toContain('runtime_readiness');
  });

  it('does not claim actual source, DB, JSONL, runtime, staging, or production readiness', () => {
    const resultText = JSON.stringify(build());

    expect(resultText).not.toContain('"actualSourceAccessReady":true');
    expect(resultText).not.toContain('"actualDbReadReady":true');
    expect(resultText).not.toContain('"jsonlExportReady":true');
    expect(resultText).not.toContain('"runtimeReady":true');
    expect(resultText).not.toContain('STAGING_NO_TX_PASS');
    expect(resultText).not.toContain('PRODUCTION_READY');
  });

  it('source file does not import Prisma, read env, use network, or write files', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'tierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary.ts'),
      'utf8'
    );

    expect(source).not.toContain('@prisma/client');
    expect(source).not.toContain('PrismaClient');
    expect(source).not.toContain('process.env');
    expect(source).not.toContain('process.env.DATABASE_URL');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('axios');
    expect(source).not.toContain('ethers');
    expect(source).not.toContain('fs.write');
    expect(source).not.toContain('createWriteStream');
  });
});
