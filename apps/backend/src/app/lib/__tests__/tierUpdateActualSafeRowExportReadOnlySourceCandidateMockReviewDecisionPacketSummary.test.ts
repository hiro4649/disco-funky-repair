import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary';

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

const summaryNotAuthorizedLabels = [
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

const summaryChecklistLabels = [
  'confirm no actual access',
  'confirm no db',
  'confirm no export',
  'confirm no runtime readiness'
];

const mockReviewDecisionPacketVerifier = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier',
  packetVerifierId: 'mock-review-decision-packet-verifier-safe-1',
  mockReviewDecisionPacketId: 'mock-review-decision-packet-safe-1',
  decisionVerifierId: 'mock-review-decision-verifier-safe-1',
  mockReviewDecisionGateId: 'mock-review-decision-gate-safe-1',
  mockReviewPacketId: 'mock-review-packet-safe-1',
  verifierId: 'mock-plan-verifier-safe-1',
  mockPlanId: 'mock-plan-safe-1',
  sourceAccessPlanId: 'source-access-plan-safe-1',
  decisionGateId: 'decision-gate-safe-1',
  reviewPacketId: 'review-packet-safe-1',
  sourceHeadSha: 'source-head-safe',
  mockReviewDecisionPacketStatus: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY',
  mockReviewDecisionPacketKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet',
  mockReviewDecisionPacketTraceLabel: 'd8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet',
  verificationMode: 'mock_decision_packet_static_verification',
  packetAudience: 'owner',
  packetPurpose: 'mock_decision_packet_only',
  packetCompletenessVerified: true,
  audienceVerified: true,
  purposeVerified: true,
  notAuthorizedActionsVerified: true,
  requiredPreconditionsVerified: true,
  packetChecklistVerified: true,
  mockOnlyBoundaryVerified: true,
  noActualAccessBoundaryVerified: true,
  noRuntimeReadinessBoundaryVerified: true,
  nextSafeActionVerified: true,
  verificationSummary: {
    packetCompleteness: true,
    audience: true,
    purpose: true,
    notAuthorizedActions: true,
    requiredPreconditions: true,
    packetChecklist: true,
    mockOnlyBoundary: true,
    noActualAccessBoundary: true,
    noRuntimeReadinessBoundary: true,
    nextSafeAction: true,
    safeSummaryOnly: true
  },
  packetSections: [
    'scope_summary',
    'verified_mock_decision_summary',
    'owner_decision_summary',
    'operator_decision_summary',
    'not_authorized_summary',
    'next_safe_action'
  ],
  ownerDecisionSummary: 'owner mock decision packet verifier only',
  operatorDecisionSummary: 'operator mock decision packet verifier only',
  notAuthorizedActions: summaryNotAuthorizedLabels,
  requiredPreconditions: [
    'future_owner_confirmation_required',
    'same_head_remote_quality_gate_required'
  ],
  packetChecklist: summaryChecklistLabels,
  mockOnlyDecisionSummary: { verified: true, safeSummaryOnly: true },
  noActualAccessSummary: { verified: true, safeSummaryOnly: true },
  noRuntimeReadinessSummary: { verified: true, safeSummaryOnly: true },
  boundarySummary,
  blockerCount: 0,
  blockers: [],
  needsReviewReasonCount: 0,
  needsReviewReasons: [],
  unsafeReasonCount: 0,
  unsafeReasonCodes: [],
  nextSafeAction: 'prepare_pr_d8al_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary'
};

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput => ({
  mockReviewDecisionPacketVerifier: mockReviewDecisionPacketVerifier as any,
  summaryId: 'mock-review-decision-packet-summary-safe-1',
  summaryAudience: 'owner',
  summaryPurpose: 'mock_decision_packet_summary_only',
  summaryReadinessLabel: 'mock_summary_ready',
  summarySections: [
    'scope_summary',
    'verified_mock_decision_packet_summary',
    'boundary_summary',
    'not_authorized_summary',
    'precondition_summary',
    'next_safe_action'
  ],
  summaryBoundaryLabels: [
    'mock_only',
    'no_actual_access',
    'no_db',
    'no_export',
    'no_runtime_readiness'
  ],
  summaryNotAuthorizedLabels,
  summaryPreconditions: [
    'future_owner_confirmation_required',
    'same_head_remote_quality_gate_required'
  ],
  summaryChecklistLabels,
  nextSafeAction: 'prepare_pr_d8am_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary', () => {
  it('returns SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY for valid D8AK verifier', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary');
    expect(result.traceLabel).toBe('d8al_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.nextSafeAction).toBe('prepare_pr_d8am_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier');
  });

  it('ready status text does not claim actual DB/source/export/runtime readiness', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY');
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
    ['missing D8AK status', { mockReviewDecisionPacketVerifier: null, mockReviewDecisionPacketVerifierStatus: null }],
    ['D8AK BLOCKED', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, status: 'BLOCKED' } as any }],
    ['missing summaryId', { summaryId: null }],
    ['missing packetVerifierId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, packetVerifierId: null } as any }],
    ['missing mockReviewDecisionPacketId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, mockReviewDecisionPacketId: null } as any }],
    ['missing decisionVerifierId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, decisionVerifierId: null } as any }],
    ['missing mockReviewDecisionGateId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, mockReviewDecisionGateId: null } as any }],
    ['missing mockReviewPacketId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, mockReviewPacketId: null } as any }],
    ['missing verifierId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, verifierId: null } as any }],
    ['missing mockPlanId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, mockPlanId: null } as any }],
    ['missing sourceAccessPlanId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, sourceAccessPlanId: null } as any }],
    ['missing decisionGateId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, decisionGateId: null } as any }],
    ['missing reviewPacketId', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, reviewPacketId: null } as any }],
    ['missing sourceHeadSha', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, sourceHeadSha: null } as any }],
    ['forbidden summaryAudience runtime_worker', { summaryAudience: 'runtime_worker' }],
    ['forbidden summaryAudience scheduler', { summaryAudience: 'scheduler' }],
    ['forbidden summaryAudience public_user', { summaryAudience: 'public_user' }],
    ['forbidden summaryAudience frontend', { summaryAudience: 'frontend' }],
    ['forbidden summaryAudience admin_action_runner', { summaryAudience: 'admin_action_runner' }],
    ['forbidden summaryPurpose execute', { summaryPurpose: 'execute' }],
    ['forbidden summaryPurpose query', { summaryPurpose: 'query' }],
    ['forbidden summaryPurpose read_source', { summaryPurpose: 'read_source' }],
    ['forbidden summaryPurpose db_read', { summaryPurpose: 'db_read' }],
    ['forbidden summaryPurpose jsonl_export', { summaryPurpose: 'jsonl_export' }],
    ['forbidden summaryPurpose file_write', { summaryPurpose: 'file_write' }],
    ['forbidden summaryReadinessLabel actual_source_ready', { summaryReadinessLabel: 'actual_source_ready' }],
    ['forbidden summaryReadinessLabel runtime_ready', { summaryReadinessLabel: 'runtime_ready' }],
    ['forbidden summaryReadinessLabel staging_ready', { summaryReadinessLabel: 'staging_ready' }],
    ['forbidden summaryReadinessLabel production_ready', { summaryReadinessLabel: 'production_ready' }],
    ['absent summarySections', { summarySections: [] }],
    ['absent summaryBoundaryLabels', { summaryBoundaryLabels: [] }],
    ['absent summaryNotAuthorizedLabels', { summaryNotAuthorizedLabels: [] }],
    ['summaryNotAuthorizedLabels missing actual DB query', { summaryNotAuthorizedLabels: summaryNotAuthorizedLabels.filter((item) => item !== 'actual_db_query') }],
    ['summaryNotAuthorizedLabels missing source access', { summaryNotAuthorizedLabels: summaryNotAuthorizedLabels.filter((item) => item !== 'source_access') }],
    ['summaryNotAuthorizedLabels missing runtime readiness', { summaryNotAuthorizedLabels: summaryNotAuthorizedLabels.filter((item) => item !== 'runtime_readiness') }],
    ['absent summaryPreconditions', { summaryPreconditions: [] }],
    ['summaryPreconditions missing future owner confirmation', { summaryPreconditions: ['same_head_remote_quality_gate_required'] }],
    ['summaryPreconditions missing same-head remote gate', { summaryPreconditions: ['future_owner_confirmation_required'] }],
    ['absent summaryChecklistLabels', { summaryChecklistLabels: [] }],
    ['summaryChecklistLabels missing no actual access', { summaryChecklistLabels: ['confirm no db', 'confirm no export', 'confirm no runtime readiness'] }],
    ['summaryChecklistLabels missing no DB', { summaryChecklistLabels: ['confirm no actual access', 'confirm no export', 'confirm no runtime readiness'] }],
    ['summaryChecklistLabels missing no export', { summaryChecklistLabels: ['confirm no actual access', 'confirm no db', 'confirm no runtime readiness'] }],
    ['summaryChecklistLabels missing no runtime readiness', { summaryChecklistLabels: ['confirm no actual access', 'confirm no db', 'confirm no export'] }],
    ['packetCompletenessVerified false', { packetCompletenessVerified: false }],
    ['audienceVerified false', { audienceVerified: false }],
    ['purposeVerified false', { purposeVerified: false }],
    ['notAuthorizedActionsVerified false', { notAuthorizedActionsVerified: false }],
    ['requiredPreconditionsVerified false', { requiredPreconditionsVerified: false }],
    ['packetChecklistVerified false', { packetChecklistVerified: false }],
    ['mockOnlyBoundaryVerified false', { mockOnlyBoundaryVerified: false }],
    ['noActualAccessBoundaryVerified false', { noActualAccessBoundaryVerified: false }],
    ['noRuntimeReadinessBoundaryVerified false', { noRuntimeReadinessBoundaryVerified: false }],
    ['nextSafeActionVerified false', { nextSafeActionVerified: false }],
    ['nextSafeAction actual source access', { nextSafeAction: 'actual_source_access' }],
    ['blockers present', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, blockers: ['upstream_blocker'] } as any }],
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
    ['raw secret label', { summaryId: 'raw-secret-summary' }],
    ['raw env label', { summaryId: 'raw_env_summary' }],
    ['raw log label', { summaryId: 'raw_log_summary' }],
    ['raw payload label', { summaryId: 'raw_payload_summary' }],
    ['raw endpoint label', { summaryId: 'raw_endpoint_summary' }],
    ['private path label', { summaryId: 'private_path_summary' }],
    ['local path label', { summaryId: 'local_path_summary' }],
    ['public readiness overclaim', { summaryId: 'runtime_ready_summary' }]
  ])('blocks unsafe summary input: %s', (_name, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput>);

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).not.toBe('prepare_pr_d8am_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier');
  });

  it.each([
    ['D8AK NEEDS_REVIEW', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, status: 'NEEDS_REVIEW' } as any }],
    ['deferred entity isolated safely', { deferredEntityTypes: ['Prize'] }],
    ['incomplete summary sections without unsafe boundary', { summarySections: ['scope_summary'] }],
    ['incomplete boundary labels without unsafe boundary', { summaryBoundaryLabels: ['mock_only'] }],
    ['incomplete summary checklist without unsafe boundary', { summaryChecklistLabels: ['confirm no actual access'] }],
    ['summaryAudience missing', { summaryAudience: null }],
    ['summaryPurpose missing', { summaryPurpose: null }],
    ['summaryReadinessLabel missing', { summaryReadinessLabel: null }],
    ['upstream needs review', { mockReviewDecisionPacketVerifier: { ...mockReviewDecisionPacketVerifier, needsReviewReasons: ['operator_review'] } as any }]
  ])('returns NEEDS_REVIEW for reviewable summary input: %s', (_name, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput>);

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.nextSafeAction).toBe('collect_operator_mock_review_decision_packet_summary_review');
  });

  it('summaryNotAuthorizedLabels include actual DB/source/export/runtime categories', () => {
    const result = build();

    expect(result.summaryNotAuthorizedLabels).toEqual(expect.arrayContaining([
      'actual_db_query',
      'actual_db_export',
      'source_access',
      'runtime_readiness',
      'production_readiness'
    ]));
  });

  it('summaryPreconditions include future owner confirmation and same-head remote gate', () => {
    const result = build();

    expect(result.summaryPreconditions).toEqual(expect.arrayContaining([
      'future_owner_confirmation_required',
      'same_head_remote_quality_gate_required'
    ]));
    expect(result.safeEvidenceSummary.futureOwnerConfirmationRequired).toBe(true);
    expect(result.safeEvidenceSummary.sameHeadRemoteQualityGateRequired).toBe(true);
  });

  it('summaryChecklistLabels include no actual access, no DB, no export, no runtime readiness', () => {
    const result = build();
    const checklist = result.summaryChecklistLabels.join(' ');

    expect(checklist).toContain('no actual access');
    expect(checklist).toContain('no db');
    expect(checklist).toContain('no export');
    expect(checklist).toContain('no runtime readiness');
  });

  it('keeps nextSafeAction singular', () => {
    const result = build();

    expect(typeof result.nextSafeAction).toBe('string');
    expect(result.nextSafeAction).not.toContain(',');
  });

  it('does not include forbidden runtime primitives in product source', () => {
    const sourcePath = path.resolve(
      __dirname,
      '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary.ts'
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
