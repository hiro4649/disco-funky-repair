import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier';

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

const mockPlan = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_plan',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_MOCK_PLAN_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8ae_actual_safe_row_export_read_only_source_candidate_mock_plan',
  mockPlanId: 'mock-plan-safe-1',
  sourceAccessPlanId: 'source-access-plan-safe-1',
  decisionGateId: 'decision-gate-safe-1',
  reviewPacketId: 'review-packet-safe-1',
  sourceHeadSha: 'source-head-safe',
  sourceAccessPlanBoundaryStatus: 'SOURCE_ACCESS_PLAN_BOUNDARY_READY',
  sourceAccessPlanKind: 'tier_update_actual_safe_row_export_read_only_source_access_plan_boundary',
  sourceAccessPlanTraceLabel: 'd8ad_actual_safe_row_export_read_only_source_access_plan_boundary',
  mockPlanMode: 'mock_only',
  mockScenarioLabel: 'mock_plan_boundary_only',
  mockRowCount: { syntheticRowCount: 2, realRowCount: 0, realRowsClaimed: false },
  mockEntityCoverage: {
    mode: 'mock_only',
    mockOnly: true,
    incomplete: false,
    claimsRealCoverage: false,
    entities: ['scheduled_tier_update', 'job_run']
  },
  mockEvidenceOrigins: ['fixture', 'local_test', 'remote_gate', 'safe_summary_shape', 'review_packet', 'mock_plan'],
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
  mockRedactedFields: ['wallet_summary', 'local_path', 'private_path'],
  mockForbiddenFields,
  mockExecutionSummary: {
    mockOnly: true,
    sourceAccessReady: false,
    actualDbReadReady: false,
    actualDbExportReady: false,
    jsonlExportReady: false,
    fileExportReady: false,
    runtimeReady: false,
    stagingReady: false,
    productionReady: false
  },
  mockBoundarySummary: {
    actualDbQueryEnabled: false,
    realDbQueryEnabled: false,
    actualDbExportEnabled: false,
    sourceAccessEnabled: false,
    prismaClientEnabled: false,
    databaseUrlReadEnabled: false,
    envReadEnabled: false,
    networkRpcWalletContractTxAccessEnabled: false,
    networkAccessEnabled: false,
    rpcAccessEnabled: false,
    walletAccessEnabled: false,
    contractAccessEnabled: false,
    txSendEnabled: false,
    fileExportEnabled: false,
    jsonlFileExportEnabled: false,
    artifactUploadEnabled: false,
    dockerSmokeChanged: false,
    stagingNoTxPassClaimed: false,
    runtimeReadinessClaimed: false,
    productionReadinessClaimed: false
  },
  requiredPreconditions: ['future_owner_confirmation_required', 'same_head_remote_quality_gate_required'],
  operatorChecklist: [
    'verify no actual DB export',
    'verify no real DB query',
    'verify no source access',
    'verify no runtime readiness'
  ],
  blockerCount: 0,
  blockers: [],
  needsReviewReasonCount: 0,
  needsReviewReasons: [],
  unsafeReasonCount: 0,
  unsafeReasonCodes: [],
  nextSafeAction: 'prepare_pr_d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier'
};

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput => ({
  mockPlan: mockPlan as any,
  verifierId: 'mock-plan-verifier-safe-1',
  verificationMode: 'mock_plan_static_verification',
  expectedMockOnly: true,
  expectedZeroRealRows: true,
  expectedNoActualAccess: true,
  mockOnlyVerified: true,
  zeroRealRowsVerified: true,
  noActualAccessVerified: true,
  safeEvidenceOriginsVerified: true,
  forbiddenFieldsVerified: true,
  redactionPlanVerified: true,
  preconditionsVerified: true,
  operatorChecklistVerified: true,
  verifierNextSafeAction: 'prepare_pr_d8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier', () => {
  it('returns SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY for valid D8AE mock plan', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier');
    expect(result.traceLabel).toBe('d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.mockOnlyVerified).toBe(true);
    expect(result.zeroRealRowsVerified).toBe(true);
    expect(result.noActualAccessVerified).toBe(true);
    expect(result.verificationSummary.sourceAccessAuthorized).toBe(false);
    expect(result.verificationSummary.actualDbReadAuthorized).toBe(false);
    expect(result.verificationSummary.actualDbExportAuthorized).toBe(false);
    expect(result.verificationSummary.jsonlExportAuthorized).toBe(false);
    expect(result.verificationSummary.runtimeReady).toBe(false);
    expect(result.nextSafeAction).toBe('prepare_pr_d8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet');
  });

  it.each([
    ['missing D8AE status', { mockPlan: null, mockPlanStatus: null }],
    ['D8AE BLOCKED', { mockPlan: { ...mockPlan, status: 'BLOCKED' } as any }],
    ['missing verifierId', { verifierId: null }],
    ['missing mockPlanId', { mockPlan: { ...mockPlan, mockPlanId: null } as any }],
    ['missing sourceAccessPlanId', { mockPlan: { ...mockPlan, sourceAccessPlanId: null } as any }],
    ['missing decisionGateId', { mockPlan: { ...mockPlan, decisionGateId: null } as any }],
    ['missing reviewPacketId', { mockPlan: { ...mockPlan, reviewPacketId: null } as any }],
    ['missing sourceHeadSha', { mockPlan: { ...mockPlan, sourceHeadSha: null } as any }],
    ['verificationMode execute', { verificationMode: 'execute' }],
    ['verificationMode query', { verificationMode: 'query' }],
    ['verificationMode read_source', { verificationMode: 'read_source' }],
    ['verificationMode db_read', { verificationMode: 'db_read' }],
    ['verificationMode jsonl_export', { verificationMode: 'jsonl_export' }],
    ['verificationMode file_write', { verificationMode: 'file_write' }],
    ['mockPlanMode execute', { mockPlanMode: 'execute' }],
    ['mockPlanMode query', { mockPlanMode: 'query' }],
    ['mockPlanMode read_source', { mockPlanMode: 'read_source' }],
    ['mockPlanMode db_read', { mockPlanMode: 'db_read' }],
    ['mockPlanMode jsonl_export', { mockPlanMode: 'jsonl_export' }],
    ['mockOnlyVerified false', { mockOnlyVerified: false }],
    ['zeroRealRowsVerified false', { zeroRealRowsVerified: false }],
    ['noActualAccessVerified false', { noActualAccessVerified: false }],
    ['safeEvidenceOriginsVerified false', { safeEvidenceOriginsVerified: false }],
    ['forbiddenFieldsVerified false', { forbiddenFieldsVerified: false }],
    ['preconditionsVerified false', { preconditionsVerified: false }],
    ['operatorChecklistVerified false', { operatorChecklistVerified: false }],
    ['redactionPlanVerified false with sensitive labels', { redactionPlanVerified: false, mockSafeFields: ['wallet_summary'] }],
    ['mockEvidenceOrigins raw_db', { mockEvidenceOrigins: ['raw_db'] }],
    ['mockEvidenceOrigins source_access', { mockEvidenceOrigins: ['source_access'] }],
    ['mockEvidenceOrigins runtime', { mockEvidenceOrigins: ['runtime'] }],
    ['mockEvidenceOrigins staging', { mockEvidenceOrigins: ['staging'] }],
    ['mockEvidenceOrigins production', { mockEvidenceOrigins: ['production'] }],
    ['forbidden mockSourceTables', { mockSourceTables: ['actual_wallet'] }],
    ['unsafe mockSafeFields', { mockSafeFields: ['raw_secret'] }],
    ['real row count claim', { mockPlan: { ...mockPlan, mockRowCount: { syntheticRowCount: 0, realRowCount: 1, realRowsClaimed: true } } as any }],
    ['real entity coverage claim', { mockPlan: { ...mockPlan, mockEntityCoverage: { ...mockPlan.mockEntityCoverage, mode: 'real_coverage', claimsRealCoverage: true } } as any }],
    ['nextSafeAction actual source access', { verifierNextSafeAction: 'actual_source_access' }],
    ['blockers present', { mockPlan: { ...mockPlan, blockers: ['upstream_blocker'] } as any }],
    ['actual DB export flag', { actualDbExportEnabled: true }],
    ['real DB query flag', { realDbQueryEnabled: true }],
    ['source access flag', { sourceAccessEnabled: true }],
    ['Prisma client flag', { prismaClientEnabled: true }],
    ['DATABASE_URL flag', { databaseUrlReadEnabled: true }],
    ['env read flag', { envReadEnabled: true }],
    ['network/RPC/wallet/contract/tx flag', { networkRpcWalletContractTxAccessEnabled: true }],
    ['file export flag', { fileExportEnabled: true }],
    ['JSONL export flag', { jsonlFileExportEnabled: true }],
    ['artifact upload flag', { artifactUploadEnabled: true }],
    ['Docker smoke flag', { dockerSmokeChanged: true }],
    ['staging no-tx PASS flag', { stagingNoTxPassClaimed: true }],
    ['runtime readiness flag', { runtimeReadinessClaimed: true }],
    ['production readiness flag', { productionReadinessClaimed: true }],
    ['raw secret label', { verifierId: 'raw-secret-verifier' }],
    ['raw env label', { verifierId: 'raw_env_verifier' }],
    ['raw log label', { verifierId: 'raw_log_verifier' }],
    ['raw payload label', { verifierId: 'raw_payload_verifier' }],
    ['raw endpoint label', { verifierId: 'raw_endpoint_verifier' }],
    ['private path label', { verifierId: 'private_path_verifier' }],
    ['local path label', { verifierId: 'local_path_verifier' }],
    ['public readiness overclaim', { verifierId: 'runtime_ready_verifier' }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it('returns NEEDS_REVIEW for D8AE NEEDS_REVIEW', () => {
    expect(build({ mockPlan: { ...mockPlan, status: 'NEEDS_REVIEW' } as any }).status).toBe('NEEDS_REVIEW');
  });

  it.each([
    ['deferred entity safely isolated', { mockPlan: { ...mockPlan, mockEntityCoverage: { ...mockPlan.mockEntityCoverage, entities: ['prize'] } } as any }],
    ['incomplete mock coverage without unsafe boundary', { mockPlan: { ...mockPlan, mockEntityCoverage: { ...mockPlan.mockEntityCoverage, incomplete: true } } as any }],
    ['redaction unknown without sensitive labels', { redactionPlanVerified: 'unknown' as const }],
    ['unknown but safe evidence origin', { mockEvidenceOrigins: ['operator_review'] }],
    ['incomplete mock safe fields', { mockSafeFields: [] }]
  ])('returns NEEDS_REVIEW for %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('NEEDS_REVIEW');
  });

  it('retains required forbidden categories, preconditions, and operator no-access checks', () => {
    const result = build();

    mockForbiddenFields.forEach((field) => expect(result.mockForbiddenFields).toContain(field));
    expect(result.requiredPreconditions).toContain('future_owner_confirmation_required');
    expect(result.requiredPreconditions).toContain('same_head_remote_quality_gate_required');
    expect(result.operatorChecklist.join(' ')).toContain('verify no actual DB export');
    expect(result.operatorChecklist.join(' ')).toContain('verify no source access');
    expect(result.operatorChecklist.join(' ')).toContain('verify no runtime readiness');
  });

  it('keeps nextSafeAction singular and away from actual access or readiness', () => {
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

    expect(resultText).not.toContain('"sourceAccessAuthorized":true');
    expect(resultText).not.toContain('"actualDbReadAuthorized":true');
    expect(resultText).not.toContain('"actualDbExportAuthorized":true');
    expect(resultText).not.toContain('"jsonlExportAuthorized":true');
    expect(resultText).not.toContain('"runtimeReady":true');
    expect(resultText).not.toContain('STAGING_NO_TX_PASS');
    expect(resultText).not.toContain('PRODUCTION_READY');
  });

  it('source file does not import Prisma, read env, touch filesystem, or call network', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier.ts'),
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
