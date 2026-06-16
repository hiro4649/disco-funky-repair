import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan';

const sourceAccessPlanBoundary = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_access_plan_boundary',
  schemaVersion: '1',
  status: 'SOURCE_ACCESS_PLAN_BOUNDARY_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8ad_actual_safe_row_export_read_only_source_access_plan_boundary',
  sourceAccessPlanId: 'source-access-plan-safe-1',
  decisionGateId: 'decision-gate-safe-1',
  reviewPacketId: 'review-packet-safe-1',
  sourceHeadSha: 'source-head-safe',
  plannedExecutionMode: 'plan_only',
  plannedAccessMode: 'no_access',
  plannedSourceTables: ['scheduled_tier_update_safe_summary'],
  plannedEntityTypes: ['scheduled_tier_update'],
  plannedSafeFields: ['schema_version', 'row_id', 'entity_type', 'source_table', 'status'],
  plannedPublicEvidenceFields: ['schema_version', 'row_id', 'status'],
  plannedRedactedFields: ['wallet_summary', 'local_path', 'private_path'],
  plannedForbiddenFields: [
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
  ],
  planSummary: {
    planOnly: true,
    actualSourceAccessReady: false,
    actualDbReadReady: false,
    jsonlExportReady: false,
    runtimeReady: false,
    safeSummaryOnly: true
  },
  operatorChecklist: [
    'verify no actual DB export',
    'verify no real DB query',
    'verify no source access',
    'verify no runtime readiness'
  ],
  requiredPreconditions: ['future_owner_confirmation_required', 'same_head_remote_quality_gate_required'],
  blockers: [],
  needsReviewReasons: [],
  nextSafeAction: 'prepare_pr_d8ae_actual_safe_row_export_read_only_source_candidate_mock_plan'
};

const mockForbiddenFields = [
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

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput => ({
  sourceAccessPlanBoundary: sourceAccessPlanBoundary as any,
  mockPlanId: 'mock-plan-safe-1',
  mockScenarioLabel: 'mock_plan_boundary_only',
  mockRowCount: { value: 2, kind: 'synthetic_mock' },
  mockEntityCoverage: {
    mode: 'mock_only',
    mockOnly: true,
    incomplete: false,
    claimsRealCoverage: false,
    entities: ['scheduled_tier_update', 'job_run']
  },
  mockEvidenceOrigins: ['fixture', 'local_test', 'remote_gate', 'safe_summary_shape', 'review_packet', 'mock_plan'],
  mockPlanMode: 'mock_only',
  mockSourceTables: ['scheduled_tier_update_safe_summary_mock', 'job_run_safe_summary_mock'],
  mockSafeFields: [
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
  mockPublicEvidenceFields: ['schema_version', 'row_id', 'entity_type', 'source_table', 'status'],
  mockRedactedFields: ['wallet_summary', 'local_path', 'private_path'],
  mockForbiddenFields,
  requiredPreconditions: ['future_owner_confirmation_required', 'same_head_remote_quality_gate_required'],
  operatorChecklist: [
    'verify no actual DB export',
    'verify no real DB query',
    'verify no source access',
    'verify no runtime readiness'
  ],
  mockNextSafeAction: 'prepare_pr_d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan', () => {
  it('returns SOURCE_CANDIDATE_MOCK_PLAN_READY for valid D8AD source access plan boundary', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_PLAN_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_plan');
    expect(result.traceLabel).toBe('d8ae_actual_safe_row_export_read_only_source_candidate_mock_plan');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.mockExecutionSummary.sourceAccessReady).toBe(false);
    expect(result.mockExecutionSummary.actualDbReadReady).toBe(false);
    expect(result.mockExecutionSummary.actualDbExportReady).toBe(false);
    expect(result.mockExecutionSummary.jsonlExportReady).toBe(false);
    expect(result.mockExecutionSummary.runtimeReady).toBe(false);
    expect(result.nextSafeAction).toBe('prepare_pr_d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier');
  });

  it.each([
    ['D8AD missing', { sourceAccessPlanBoundary: null, sourceAccessPlanBoundaryStatus: null }],
    ['D8AD blocked', { sourceAccessPlanBoundary: { ...sourceAccessPlanBoundary, status: 'BLOCKED' } as any }],
    ['missing mockPlanId', { mockPlanId: null }],
    ['missing sourceAccessPlanId', { sourceAccessPlanBoundary: { ...sourceAccessPlanBoundary, sourceAccessPlanId: null } as any }],
    ['missing decisionGateId', { sourceAccessPlanBoundary: { ...sourceAccessPlanBoundary, decisionGateId: null } as any }],
    ['missing reviewPacketId', { sourceAccessPlanBoundary: { ...sourceAccessPlanBoundary, reviewPacketId: null } as any }],
    ['missing sourceHeadSha', { sourceAccessPlanBoundary: { ...sourceAccessPlanBoundary, sourceHeadSha: null } as any }],
    ['mockPlanMode execute', { mockPlanMode: 'execute' }],
    ['mockPlanMode query', { mockPlanMode: 'query' }],
    ['mockPlanMode read_source', { mockPlanMode: 'read_source' }],
    ['mockPlanMode db_read', { mockPlanMode: 'db_read' }],
    ['mockPlanMode jsonl_export', { mockPlanMode: 'jsonl_export' }],
    ['plannedExecutionMode execute', { plannedExecutionMode: 'execute' }],
    ['plannedExecutionMode query', { plannedExecutionMode: 'query' }],
    ['plannedExecutionMode export', { plannedExecutionMode: 'export' }],
    ['plannedExecutionMode runtime', { plannedExecutionMode: 'runtime' }],
    ['plannedAccessMode actual_db_read', { plannedAccessMode: 'actual_db_read' }],
    ['plannedAccessMode actual_source_access', { plannedAccessMode: 'actual_source_access' }],
    ['plannedAccessMode prisma_client', { plannedAccessMode: 'prisma_client' }],
    ['plannedAccessMode database_url', { plannedAccessMode: 'database_url' }],
    ['forbidden mockSourceTables', { mockSourceTables: ['actual_wallet'] }],
    ['unsafe mockSafeFields', { mockSafeFields: ['schema_version', 'raw_secret'] }],
    ['missing redaction', { mockSafeFields: ['schema_version', 'wallet_summary'], mockRedactedFields: [] }],
    ['missing mock forbidden fields', { mockForbiddenFields: ['actual_db_query'] }],
    ['raw db evidence origin', { mockEvidenceOrigins: ['raw_db'] }],
    ['source access evidence origin', { mockEvidenceOrigins: ['source_access'] }],
    ['runtime evidence origin', { mockEvidenceOrigins: ['runtime'] }],
    ['staging evidence origin', { mockEvidenceOrigins: ['staging'] }],
    ['production evidence origin', { mockEvidenceOrigins: ['production'] }],
    ['real row count claim', { mockRowCount: { value: 1, kind: 'real_rows' } }],
    ['real entity coverage claim', { mockEntityCoverage: { mode: 'real_coverage', claimsRealCoverage: true, entities: ['scheduled_tier_update'] } }],
    ['nextSafeAction actual source access', { mockNextSafeAction: 'actual_source_access' }],
    ['missing future owner confirmation', { requiredPreconditions: ['same_head_remote_quality_gate_required'] }],
    ['missing same-head remote gate', { requiredPreconditions: ['future_owner_confirmation_required'] }],
    ['actual DB export flag', { actualDbExportEnabled: true }],
    ['real DB query flag', { realDbQueryEnabled: true }],
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
    ['raw secret label', { mockPlanId: 'raw-secret-plan' }],
    ['raw env label', { mockScenarioLabel: 'raw_env_case' }],
    ['raw log label', { mockScenarioLabel: 'raw_log_case' }],
    ['raw payload label', { mockScenarioLabel: 'raw_payload_case' }],
    ['raw endpoint label', { mockScenarioLabel: 'raw_endpoint_case' }],
    ['private path label', { mockScenarioLabel: 'private_path_case' }],
    ['local path label', { mockScenarioLabel: 'local_path_case' }],
    ['public readiness overclaim', { mockScenarioLabel: 'runtime_ready' }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it('maps D8AD NEEDS_REVIEW to NEEDS_REVIEW', () => {
    expect(build({
      sourceAccessPlanBoundary: { ...sourceAccessPlanBoundary, status: 'NEEDS_REVIEW' } as any
    }).status).toBe('NEEDS_REVIEW');
  });

  it.each([
    ['deferred prize entity', { mockEntityCoverage: { mode: 'mock_only', entities: ['prize'] } }],
    ['deferred nft metadata entity', { mockEntityCoverage: { mode: 'mock_only', entities: ['nft_metadata'] } }],
    ['deferred token detail entity', { mockEntityCoverage: { mode: 'mock_only', entities: ['token_detail'] } }],
    ['deferred ticket code entity', { mockEntityCoverage: { mode: 'mock_only', entities: ['ticket_code'] } }],
    ['deferred wallet summary entity', { mockEntityCoverage: { mode: 'mock_only', entities: ['wallet_summary'] } }],
    ['incomplete mock coverage', { mockEntityCoverage: { mode: 'mock_only', incomplete: true, entities: ['scheduled_tier_update'] } }],
    ['incomplete mock safe fields', { mockSafeFields: [] }],
    ['unknown but safe evidence origin', { mockEvidenceOrigins: ['operator_review'] }],
    ['missing scenario label', { mockScenarioLabel: null }]
  ])('returns NEEDS_REVIEW for %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('NEEDS_REVIEW');
  });

  it('retains required forbidden action categories and preconditions', () => {
    const result = build();

    mockForbiddenFields.forEach((field) => expect(result.mockForbiddenFields).toContain(field));
    expect(result.requiredPreconditions).toContain('future_owner_confirmation_required');
    expect(result.requiredPreconditions).toContain('same_head_remote_quality_gate_required');
    expect(result.operatorChecklist.join(' ')).toContain('verify no actual DB export');
    expect(result.operatorChecklist.join(' ')).toContain('verify no source access');
    expect(result.operatorChecklist.join(' ')).toContain('verify no runtime readiness');
  });

  it('keeps nextSafeAction singular and never points to actual access or readiness', () => {
    const result = build();

    expect(typeof result.nextSafeAction).toBe('string');
    expect(result.nextSafeAction).not.toContain('actual_db_query');
    expect(result.nextSafeAction).not.toContain('actual_db_export');
    expect(result.nextSafeAction).not.toContain('source_access');
    expect(result.nextSafeAction).not.toContain('file_export');
    expect(result.nextSafeAction).not.toContain('artifact_upload');
    expect(result.nextSafeAction).not.toContain('runtime_readiness');
  });

  it('ready status text does not claim actual DB/source/export/runtime readiness', () => {
    const resultText = JSON.stringify(build());

    expect(resultText).not.toContain('"sourceAccessReady":true');
    expect(resultText).not.toContain('"actualDbReadReady":true');
    expect(resultText).not.toContain('"actualDbExportReady":true');
    expect(resultText).not.toContain('"jsonlExportReady":true');
    expect(resultText).not.toContain('"runtimeReady":true');
    expect(resultText).not.toContain('STAGING_NO_TX_PASS');
    expect(resultText).not.toContain('PRODUCTION_READY');
  });

  it('source file does not import Prisma, read env, touch filesystem, or call network', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan.ts'),
      'utf8'
    );

    expect(source).not.toContain('@prisma/client');
    expect(source).not.toContain('PrismaClient');
    expect(source).not.toContain('process.env');
    expect(source).not.toContain('process.');
    expect(source).not.toContain('fs.');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('createWriteStream');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('axios');
    expect(source).not.toContain('ethers');
  });
});
