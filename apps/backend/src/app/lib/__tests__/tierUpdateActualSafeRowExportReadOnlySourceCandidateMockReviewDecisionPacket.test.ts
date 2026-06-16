import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket';

const boundarySummary = {
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
};

const forbiddenDecisionOptions = [
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
];

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

const packetChecklist = [
  'confirm no actual access',
  'confirm no db',
  'confirm no export',
  'confirm no runtime readiness'
];

const mockReviewDecisionVerifier = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier',
  decisionVerifierId: 'mock-review-decision-verifier-safe-1',
  mockReviewDecisionGateId: 'mock-review-decision-gate-safe-1',
  mockReviewPacketId: 'mock-review-packet-safe-1',
  verifierId: 'mock-plan-verifier-safe-1',
  mockPlanId: 'mock-plan-safe-1',
  sourceAccessPlanId: 'source-access-plan-safe-1',
  decisionGateId: 'decision-gate-safe-1',
  reviewPacketId: 'review-packet-safe-1',
  sourceHeadSha: 'source-head-safe',
  mockReviewDecisionGateStatus: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY',
  mockReviewDecisionGateKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate',
  mockReviewDecisionGateTraceLabel: 'd8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate',
  verificationMode: 'mock_decision_static_verification',
  mockOnlyDecisionVerified: true,
  noActualAccessVerified: true,
  noRuntimeReadinessVerified: true,
  allowedDecisionOptionsVerified: true,
  forbiddenDecisionOptionsVerified: true,
  decisionChecklistVerified: true,
  ownerIntentVerified: true,
  manualDecisionBoundaryVerified: true,
  nextSafeActionVerified: true,
  verificationSummary: {
    mockOnlyDecision: true,
    noActualAccess: true,
    noRuntimeReadiness: true,
    allowedDecisionOptions: true,
    forbiddenDecisionOptions: true,
    decisionChecklist: true,
    ownerIntent: true,
    manualDecisionBoundary: true,
    nextSafeAction: true,
    safeSummaryOnly: true
  },
  boundarySummary,
  allowedDecisionOptions: [
    'request_d8ai_mock_decision_verifier',
    'request_more_mock_review',
    'block_until_scope_repaired',
    'leave_open_no_source_access'
  ],
  forbiddenDecisionOptions,
  decisionChecklist: packetChecklist,
  blockerCount: 0,
  blockers: [],
  needsReviewReasonCount: 0,
  needsReviewReasons: [],
  unsafeReasonCount: 0,
  unsafeReasonCodes: [],
  nextSafeAction: 'prepare_pr_d8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet'
};

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput => ({
  mockReviewDecisionVerifier: mockReviewDecisionVerifier as any,
  mockReviewDecisionPacketId: 'mock-review-decision-packet-safe-1',
  packetAudience: 'owner',
  packetPurpose: 'mock_decision_packet_only',
  packetSections: [
    'scope_summary',
    'verified_mock_decision_summary',
    'owner_decision_summary',
    'operator_decision_summary',
    'not_authorized_summary',
    'next_safe_action'
  ],
  ownerDecisionSummary: 'owner mock decision packet only',
  operatorDecisionSummary: 'operator mock decision packet only',
  notAuthorizedActions,
  requiredPreconditions: [
    'future_owner_confirmation_required',
    'same_head_remote_quality_gate_required'
  ],
  packetChecklist,
  nextSafeAction: 'prepare_pr_d8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket', () => {
  it('returns SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY for a valid D8AI verifier packet', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet');
    expect(result.traceLabel).toBe('d8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.nextSafeAction).toBe('prepare_pr_d8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier');
  });

  it('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY does not authorize actual access or readiness', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY');
    expect(result.boundarySummary.actualDbQueryEnabled).toBe(false);
    expect(result.boundarySummary.actualDbExportEnabled).toBe(false);
    expect(result.boundarySummary.sourceAccessEnabled).toBe(false);
    expect(result.boundarySummary.prismaClientEnabled).toBe(false);
    expect(result.boundarySummary.databaseUrlReadEnabled).toBe(false);
    expect(result.boundarySummary.envReadEnabled).toBe(false);
    expect(result.boundarySummary.fileExportEnabled).toBe(false);
    expect(result.boundarySummary.jsonlFileExportEnabled).toBe(false);
    expect(result.boundarySummary.artifactUploadEnabled).toBe(false);
    expect(result.boundarySummary.dockerSmokeChanged).toBe(false);
    expect(result.boundarySummary.stagingNoTxPassClaimed).toBe(false);
    expect(result.boundarySummary.runtimeReadinessClaimed).toBe(false);
    expect(result.boundarySummary.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing D8AI verifier', { mockReviewDecisionVerifier: null, mockReviewDecisionVerifierStatus: null }],
    ['D8AI BLOCKED', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, status: 'BLOCKED' } as any }],
    ['missing mockReviewDecisionPacketId', { mockReviewDecisionPacketId: null }],
    ['missing decisionVerifierId', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, decisionVerifierId: null } as any }],
    ['missing mockReviewDecisionGateId', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, mockReviewDecisionGateId: null } as any }],
    ['missing mockReviewPacketId', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, mockReviewPacketId: null } as any }],
    ['missing verifierId', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, verifierId: null } as any }],
    ['missing mockPlanId', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, mockPlanId: null } as any }],
    ['missing sourceAccessPlanId', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, sourceAccessPlanId: null } as any }],
    ['missing decisionGateId', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, decisionGateId: null } as any }],
    ['missing reviewPacketId', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, reviewPacketId: null } as any }],
    ['missing sourceHeadSha', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, sourceHeadSha: null } as any }],
    ['packetAudience execute', { packetAudience: 'execute' }],
    ['packetAudience public_endpoint', { packetAudience: 'public_endpoint' }],
    ['packetPurpose execute', { packetPurpose: 'execute' }],
    ['packetPurpose source_access', { packetPurpose: 'source_access' }],
    ['packetSections absent', { packetSections: [] }],
    ['ownerDecisionSummary absent', { ownerDecisionSummary: null }],
    ['operatorDecisionSummary absent', { operatorDecisionSummary: null }],
    ['notAuthorizedActions absent', { notAuthorizedActions: [] }],
    ['notAuthorizedActions missing DB query', { notAuthorizedActions: notAuthorizedActions.filter((item) => item !== 'actual_db_query') }],
    ['notAuthorizedActions missing source access', { notAuthorizedActions: notAuthorizedActions.filter((item) => item !== 'source_access') }],
    ['notAuthorizedActions missing JSONL export', { notAuthorizedActions: notAuthorizedActions.filter((item) => item !== 'jsonl_file_export') }],
    ['notAuthorizedActions missing runtime readiness', { notAuthorizedActions: notAuthorizedActions.filter((item) => item !== 'runtime_readiness') }],
    ['requiredPreconditions absent', { requiredPreconditions: [] }],
    ['requiredPreconditions missing future owner confirmation', { requiredPreconditions: ['same_head_remote_quality_gate_required'] }],
    ['requiredPreconditions missing same head remote gate', { requiredPreconditions: ['future_owner_confirmation_required'] }],
    ['packetChecklist absent', { packetChecklist: [] }],
    ['packetChecklist missing no actual access', { packetChecklist: ['confirm no db', 'confirm no export', 'confirm no runtime readiness'] }],
    ['packetChecklist missing no DB', { packetChecklist: ['confirm no actual access', 'confirm no export', 'confirm no runtime readiness'] }],
    ['packetChecklist missing no export', { packetChecklist: ['confirm no actual access', 'confirm no db', 'confirm no runtime readiness'] }],
    ['packetChecklist missing no runtime readiness', { packetChecklist: ['confirm no actual access', 'confirm no db', 'confirm no export'] }],
    ['mockOnlyDecisionSummary false', { mockOnlyDecisionSummary: { verified: false, safeSummaryOnly: true } as any, mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, verificationSummary: { ...mockReviewDecisionVerifier.verificationSummary, mockOnlyDecision: false } } as any }],
    ['noActualAccessSummary false', { noActualAccessSummary: { verified: false, safeSummaryOnly: true } as any, mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, verificationSummary: { ...mockReviewDecisionVerifier.verificationSummary, noActualAccess: false } } as any }],
    ['noRuntimeReadinessSummary false', { noRuntimeReadinessSummary: { verified: false, safeSummaryOnly: true } as any, mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, verificationSummary: { ...mockReviewDecisionVerifier.verificationSummary, noRuntimeReadiness: false } } as any }],
    ['allowedDecisionOptionsSummary false', { allowedDecisionOptionsSummary: { verified: false, safeSummaryOnly: true } as any, mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, verificationSummary: { ...mockReviewDecisionVerifier.verificationSummary, allowedDecisionOptions: false } } as any }],
    ['forbiddenDecisionOptionsSummary false', { forbiddenDecisionOptionsSummary: { verified: false, safeSummaryOnly: true } as any, mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, verificationSummary: { ...mockReviewDecisionVerifier.verificationSummary, forbiddenDecisionOptions: false } } as any }],
    ['decisionChecklistSummary false', { decisionChecklistSummary: { verified: false, safeSummaryOnly: true } as any, mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, verificationSummary: { ...mockReviewDecisionVerifier.verificationSummary, decisionChecklist: false } } as any }],
    ['nextSafeAction actual source access', { nextSafeAction: 'actual_source_access' }],
    ['upstream blockers present', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, blockers: ['upstream_blocker'] } as any }],
    ['actual DB query flag', { actualDbQueryEnabled: true }],
    ['actual DB export flag', { actualDbExportEnabled: true }],
    ['real DB query flag', { realDbQueryEnabled: true }],
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
    ['production readiness claim', { productionReadinessClaimed: true }],
    ['raw secret label', { mockReviewDecisionPacketId: 'raw-secret-packet' }],
    ['raw env label', { mockReviewDecisionPacketId: 'raw_env_packet' }],
    ['raw log label', { mockReviewDecisionPacketId: 'raw_log_packet' }],
    ['raw payload label', { mockReviewDecisionPacketId: 'raw_payload_packet' }],
    ['raw endpoint label', { mockReviewDecisionPacketId: 'raw_endpoint_packet' }],
    ['private path label', { mockReviewDecisionPacketId: 'private_path_packet' }],
    ['local path label', { mockReviewDecisionPacketId: 'local_path_packet' }],
    ['public readiness overclaim', { mockReviewDecisionPacketId: 'runtime_ready_packet' }]
  ])('blocks unsafe packet input: %s', (_name, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput>);

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).not.toBe('prepare_pr_d8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier');
  });

  it.each([
    ['D8AI NEEDS_REVIEW', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, status: 'NEEDS_REVIEW' } as any }],
    ['packetAudience missing', { packetAudience: null }],
    ['packetPurpose missing', { packetPurpose: null }],
    ['packetSections incomplete', { packetSections: ['scope_summary'] }],
    ['packetChecklist incomplete', { packetChecklist: ['confirm no actual access'] }],
    ['upstream needs review', { mockReviewDecisionVerifier: { ...mockReviewDecisionVerifier, needsReviewReasons: ['operator_review'] } as any }],
    ['deferred entity type', { deferredEntityTypes: ['Prize'] }]
  ])('returns NEEDS_REVIEW for reviewable packet input: %s', (_name, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput>);

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.nextSafeAction).toBe('collect_operator_mock_review_decision_packet_review');
  });

  it('keeps nextSafeAction singular', () => {
    const result = build();

    expect(typeof result.nextSafeAction).toBe('string');
    expect(result.nextSafeAction).not.toContain(',');
  });

  it('does not include forbidden runtime primitives in product source', () => {
    const sourcePath = path.resolve(
      __dirname,
      '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket.ts'
    );
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toContain('@prisma/client');
    expect(source).not.toContain('PrismaClient');
    expect(source).not.toContain('process.env');
    expect(source).not.toContain('process.');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('createWriteStream');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('axios');
    expect(source).not.toContain('ethers');
  });
});
