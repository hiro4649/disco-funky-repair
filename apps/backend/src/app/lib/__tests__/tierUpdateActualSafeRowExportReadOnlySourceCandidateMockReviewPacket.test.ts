import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket';

const notAuthorizedActions = [
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

const mockPlanVerifier = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier',
  verifierId: 'mock-plan-verifier-safe-1',
  mockPlanId: 'mock-plan-safe-1',
  sourceAccessPlanId: 'source-access-plan-safe-1',
  decisionGateId: 'decision-gate-safe-1',
  reviewPacketId: 'review-packet-safe-1',
  sourceHeadSha: 'source-head-safe',
  mockPlanStatus: 'SOURCE_CANDIDATE_MOCK_PLAN_READY',
  mockPlanKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_plan',
  mockPlanTraceLabel: 'd8ae_actual_safe_row_export_read_only_source_candidate_mock_plan',
  verificationMode: 'mock_plan_static_verification',
  mockOnlyVerified: true,
  zeroRealRowsVerified: true,
  noActualAccessVerified: true,
  safeEvidenceOriginsVerified: true,
  forbiddenFieldsVerified: true,
  redactionPlanVerified: true,
  preconditionsVerified: true,
  operatorChecklistVerified: true,
  verificationSummary: {
    mockOnly: true,
    zeroRealRows: true,
    noActualAccess: true,
    sourceAccessAuthorized: false,
    actualDbReadAuthorized: false,
    actualDbExportAuthorized: false,
    jsonlExportAuthorized: false,
    runtimeReady: false,
    stagingReady: false,
    productionReady: false
  },
  boundarySummary: {
    actualDbQueryEnabled: false,
    actualDbExportEnabled: false,
    realDbQueryEnabled: false,
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
    productionReadinessClaimed: false,
    safeSummaryOnly: true
  },
  mockEvidenceOrigins: ['fixture', 'local_test', 'remote_gate', 'safe_summary_shape', 'review_packet', 'mock_plan'],
  mockSourceTables: ['scheduled_tier_update_safe_summary_mock'],
  mockSafeFields: ['schema_version', 'row_id', 'entity_type', 'source_table', 'status'],
  mockRedactedFields: ['wallet_summary', 'local_path', 'private_path'],
  mockForbiddenFields: notAuthorizedActions,
  requiredPreconditions: ['future_owner_confirmation_required', 'same_head_remote_quality_gate_required'],
  operatorChecklist: ['verify no actual DB export', 'verify no real DB query', 'verify no source access', 'verify no runtime readiness'],
  blockerCount: 0,
  blockers: [],
  needsReviewReasonCount: 0,
  needsReviewReasons: [],
  unsafeReasonCount: 0,
  unsafeReasonCodes: [],
  nextSafeAction: 'prepare_pr_d8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet'
};

const reviewSections = [
  'scope_summary',
  'mock_plan_verifier_summary',
  'mock_only_summary',
  'zero_real_rows_summary',
  'no_actual_access_summary',
  'not_authorized_summary',
  'next_safe_action'
];

const requiredReviewerChecks = [
  'confirm no actual access',
  'confirm no db',
  'confirm no export',
  'confirm no runtime readiness'
];

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput => ({
  mockPlanVerifier: mockPlanVerifier as any,
  mockReviewPacketId: 'mock-review-packet-safe-1',
  operatorReviewMode: 'mock_review_only',
  reviewAudience: 'owner',
  reviewPurpose: 'mock review packet only',
  reviewSections,
  requiredReviewerChecks,
  notAuthorizedActions,
  nextSafeAction: 'prepare_pr_d8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket', () => {
  it('returns SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY for valid D8AF verifier', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_packet');
    expect(result.traceLabel).toBe('d8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.verificationSummary.sourceAccessAuthorized).toBe(false);
    expect(result.verificationSummary.actualDbReadAuthorized).toBe(false);
    expect(result.verificationSummary.actualDbExportAuthorized).toBe(false);
    expect(result.verificationSummary.jsonlExportAuthorized).toBe(false);
    expect(result.nextSafeAction).toBe('prepare_pr_d8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate');
  });

  it.each([
    ['missing D8AF status', { mockPlanVerifier: null, mockPlanVerifierStatus: null }],
    ['D8AF BLOCKED', { mockPlanVerifier: { ...mockPlanVerifier, status: 'BLOCKED' } as any }],
    ['missing mockReviewPacketId', { mockReviewPacketId: null }],
    ['missing verifierId', { mockPlanVerifier: { ...mockPlanVerifier, verifierId: null } as any }],
    ['missing mockPlanId', { mockPlanVerifier: { ...mockPlanVerifier, mockPlanId: null } as any }],
    ['missing sourceAccessPlanId', { mockPlanVerifier: { ...mockPlanVerifier, sourceAccessPlanId: null } as any }],
    ['missing decisionGateId', { mockPlanVerifier: { ...mockPlanVerifier, decisionGateId: null } as any }],
    ['missing reviewPacketId', { mockPlanVerifier: { ...mockPlanVerifier, reviewPacketId: null } as any }],
    ['missing sourceHeadSha', { mockPlanVerifier: { ...mockPlanVerifier, sourceHeadSha: null } as any }],
    ['operatorReviewMode execute', { operatorReviewMode: 'execute' }],
    ['operatorReviewMode query', { operatorReviewMode: 'query' }],
    ['operatorReviewMode read_source', { operatorReviewMode: 'read_source' }],
    ['operatorReviewMode db_read', { operatorReviewMode: 'db_read' }],
    ['operatorReviewMode jsonl_export', { operatorReviewMode: 'jsonl_export' }],
    ['operatorReviewMode file_write', { operatorReviewMode: 'file_write' }],
    ['reviewAudience runtime_worker', { reviewAudience: 'runtime_worker' }],
    ['reviewAudience scheduler', { reviewAudience: 'scheduler' }],
    ['reviewAudience public_user', { reviewAudience: 'public_user' }],
    ['reviewAudience frontend', { reviewAudience: 'frontend' }],
    ['reviewAudience admin_action_runner', { reviewAudience: 'admin_action_runner' }],
    ['reviewPurpose actual execution', { reviewPurpose: 'execute actual source access' }],
    ['absent reviewSections', { reviewSections: [] }],
    ['absent requiredReviewerChecks', { requiredReviewerChecks: [] }],
    ['absent notAuthorizedActions', { notAuthorizedActions: [] }],
    ['notAuthorizedActions missing category', { notAuthorizedActions: ['actual_db_query'] }],
    ['mockOnlyVerified false', { mockPlanVerifier: { ...mockPlanVerifier, mockOnlyVerified: false } as any }],
    ['zeroRealRowsVerified false', { mockPlanVerifier: { ...mockPlanVerifier, zeroRealRowsVerified: false } as any }],
    ['noActualAccessVerified false', { mockPlanVerifier: { ...mockPlanVerifier, noActualAccessVerified: false } as any }],
    ['safeEvidenceOriginsVerified false', { mockPlanVerifier: { ...mockPlanVerifier, safeEvidenceOriginsVerified: false } as any }],
    ['forbiddenFieldsVerified false', { mockPlanVerifier: { ...mockPlanVerifier, forbiddenFieldsVerified: false } as any }],
    ['preconditionsVerified false', { mockPlanVerifier: { ...mockPlanVerifier, preconditionsVerified: false } as any }],
    ['operatorChecklistVerified false', { mockPlanVerifier: { ...mockPlanVerifier, operatorChecklistVerified: false } as any }],
    ['redactionPlanVerified false with sensitive labels', { mockPlanVerifier: { ...mockPlanVerifier, redactionPlanVerified: false, mockSafeFields: ['wallet_summary'] } as any }],
    ['nextSafeAction actual source access', { nextSafeAction: 'actual_source_access' }],
    ['blockers present', { mockPlanVerifier: { ...mockPlanVerifier, blockers: ['upstream_blocker'] } as any }],
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
    ['raw secret label', { mockReviewPacketId: 'raw-secret-packet' }],
    ['raw env label', { mockReviewPacketId: 'raw_env_packet' }],
    ['raw log label', { mockReviewPacketId: 'raw_log_packet' }],
    ['raw payload label', { mockReviewPacketId: 'raw_payload_packet' }],
    ['raw endpoint label', { mockReviewPacketId: 'raw_endpoint_packet' }],
    ['private path label', { mockReviewPacketId: 'private_path_packet' }],
    ['local path label', { mockReviewPacketId: 'local_path_packet' }],
    ['public readiness overclaim', { mockReviewPacketId: 'runtime_ready_packet' }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('BLOCKED');
  });

  it('returns NEEDS_REVIEW for D8AF NEEDS_REVIEW', () => {
    expect(build({ mockPlanVerifier: { ...mockPlanVerifier, status: 'NEEDS_REVIEW' } as any }).status).toBe('NEEDS_REVIEW');
  });

  it.each([
    ['deferred entities isolated safely', { deferredEntityTypes: ['prize'] }],
    ['incomplete reviewSections without unsafe boundary', { reviewSections: reviewSections.slice(0, 3) }],
    ['redaction unknown without sensitive labels', { mockPlanVerifier: { ...mockPlanVerifier, redactionPlanVerified: 'unknown', mockSafeFields: ['schema_version'] } as any }],
    ['missing operatorReviewMode without unsafe action', { operatorReviewMode: null }],
    ['missing reviewAudience without unsafe action', { reviewAudience: null }],
    ['incomplete requiredReviewerChecks without unsafe boundary', { requiredReviewerChecks: ['confirm no actual access'] }]
  ])('returns NEEDS_REVIEW for %s', (_label, overrides) => {
    expect(build(overrides).status).toBe('NEEDS_REVIEW');
  });

  it('retains notAuthorizedActions and reviewer no-access checks', () => {
    const result = build();

    notAuthorizedActions.forEach((action) => expect(result.notAuthorizedActions).toContain(action));
    expect(result.requiredReviewerChecks.join(' ')).toContain('no actual access');
    expect(result.requiredReviewerChecks.join(' ')).toContain('no db');
    expect(result.requiredReviewerChecks.join(' ')).toContain('no export');
    expect(result.requiredReviewerChecks.join(' ')).toContain('no runtime readiness');
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
      path.join(__dirname, '..', 'tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket.ts'),
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
