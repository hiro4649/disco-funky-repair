import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifier
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifier';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifier';

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

const mockReviewDecisionPacketSummary = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8al_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary',
  summaryId: 'mock-review-decision-packet-summary-safe-1',
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
  mockReviewDecisionPacketVerifierStatus: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY',
  mockReviewDecisionPacketVerifierKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier',
  mockReviewDecisionPacketVerifierTraceLabel: 'd8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier',
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
  summaryCounts: {
    sectionCount: 6,
    boundaryLabelCount: 5,
    notAuthorizedLabelCount: 14,
    preconditionCount: 2,
    checklistLabelCount: 4,
    safeSummaryOnly: true
  },
  mockOnlySummary: { verified: true, safeSummaryOnly: true },
  noActualAccessSummary: { verified: true, safeSummaryOnly: true },
  noRuntimeReadinessSummary: { verified: true, safeSummaryOnly: true },
  safeEvidenceSummary: {
    sourceHeadShaPresent: true,
    sameHeadRemoteQualityGateRequired: true,
    futureOwnerConfirmationRequired: true,
    safeSummaryOnly: true
  },
  decisionPacketSummary: {
    verifierReady: true,
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
    safeSummaryOnly: true
  },
  boundarySummary,
  blockerCount: 0,
  blockers: [],
  needsReviewReasonCount: 0,
  needsReviewReasons: [],
  unsafeReasonCount: 0,
  unsafeReasonCodes: [],
  nextSafeAction: 'prepare_pr_d8am_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier'
};

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput => ({
  mockReviewDecisionPacketSummary: mockReviewDecisionPacketSummary as any,
  summaryVerifierId: 'mock-review-decision-packet-summary-verifier-safe-1',
  verificationMode: 'mock_summary_static_verification',
  nextSafeAction: 'prepare_pr_d8an_actual_safe_row_export_read_only_source_candidate_mock_lane_closure'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifier({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifier', () => {
  it('returns SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_READY for valid D8AL summary', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier');
    expect(result.traceLabel).toBe('d8am_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.nextSafeAction).toBe('prepare_pr_d8an_actual_safe_row_export_read_only_source_candidate_mock_lane_closure');
  });

  it('ready status does not claim actual DB/source/export/runtime readiness', () => {
    const result = build();

    expect(result.boundarySummary.actualDbQueryEnabled).toBe(false);
    expect(result.boundarySummary.actualDbExportEnabled).toBe(false);
    expect(result.boundarySummary.realDbQueryEnabled).toBe(false);
    expect(result.boundarySummary.sourceAccessEnabled).toBe(false);
    expect(result.boundarySummary.prismaClientEnabled).toBe(false);
    expect(result.boundarySummary.databaseUrlReadEnabled).toBe(false);
    expect(result.boundarySummary.envReadEnabled).toBe(false);
    expect(result.boundarySummary.networkAccessEnabled).toBe(false);
    expect(result.boundarySummary.rpcAccessEnabled).toBe(false);
    expect(result.boundarySummary.walletAccessEnabled).toBe(false);
    expect(result.boundarySummary.contractAccessEnabled).toBe(false);
    expect(result.boundarySummary.txSendEnabled).toBe(false);
    expect(result.boundarySummary.fileExportEnabled).toBe(false);
    expect(result.boundarySummary.jsonlFileExportEnabled).toBe(false);
    expect(result.boundarySummary.artifactUploadEnabled).toBe(false);
    expect(result.boundarySummary.dockerSmokeChanged).toBe(false);
    expect(result.boundarySummary.stagingNoTxPassClaimed).toBe(false);
    expect(result.boundarySummary.runtimeReadinessClaimed).toBe(false);
    expect(result.boundarySummary.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing D8AL summary', { mockReviewDecisionPacketSummary: null, mockReviewDecisionPacketSummaryStatus: null }],
    ['D8AL BLOCKED', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, status: 'BLOCKED' } as any }],
    ['missing summaryVerifierId', { summaryVerifierId: null }],
    ['missing summaryId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, summaryId: null } as any }],
    ['missing packetVerifierId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, packetVerifierId: null } as any }],
    ['missing mockReviewDecisionPacketId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, mockReviewDecisionPacketId: null } as any }],
    ['missing decisionVerifierId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, decisionVerifierId: null } as any }],
    ['missing mockReviewDecisionGateId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, mockReviewDecisionGateId: null } as any }],
    ['missing mockReviewPacketId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, mockReviewPacketId: null } as any }],
    ['missing verifierId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, verifierId: null } as any }],
    ['missing mockPlanId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, mockPlanId: null } as any }],
    ['missing sourceAccessPlanId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, sourceAccessPlanId: null } as any }],
    ['missing decisionGateId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, decisionGateId: null } as any }],
    ['missing reviewPacketId', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, reviewPacketId: null } as any }],
    ['missing sourceHeadSha', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, sourceHeadSha: null } as any }],
    ['forbidden mode execute', { verificationMode: 'execute' }],
    ['forbidden mode query', { verificationMode: 'query' }],
    ['forbidden mode read_source', { verificationMode: 'read_source' }],
    ['forbidden mode db_read', { verificationMode: 'db_read' }],
    ['forbidden mode export', { verificationMode: 'export' }],
    ['forbidden mode jsonl_export', { verificationMode: 'jsonl_export' }],
    ['forbidden mode file_write', { verificationMode: 'file_write' }],
    ['forbidden mode artifact_upload', { verificationMode: 'artifact_upload' }],
    ['forbidden mode runtime', { verificationMode: 'runtime' }],
    ['forbidden mode worker', { verificationMode: 'worker' }],
    ['forbidden mode cron', { verificationMode: 'cron' }],
    ['forbidden mode route', { verificationMode: 'route' }],
    ['forbidden mode cli', { verificationMode: 'cli' }],
    ['forbidden mode docker_smoke', { verificationMode: 'docker_smoke' }],
    ['forbidden mode staging', { verificationMode: 'staging' }],
    ['forbidden mode production', { verificationMode: 'production' }],
    ['forbidden audience', { summaryAudience: 'runtime_worker' }],
    ['forbidden purpose', { summaryPurpose: 'execute' }],
    ['forbidden readiness actual_source_ready', { summaryReadinessLabel: 'actual_source_ready' }],
    ['forbidden readiness actual_db_ready', { summaryReadinessLabel: 'actual_db_ready' }],
    ['forbidden readiness export_ready', { summaryReadinessLabel: 'export_ready' }],
    ['forbidden readiness jsonl_ready', { summaryReadinessLabel: 'jsonl_ready' }],
    ['forbidden readiness runtime_ready', { summaryReadinessLabel: 'runtime_ready' }],
    ['forbidden readiness staging_ready', { summaryReadinessLabel: 'staging_ready' }],
    ['forbidden readiness production_ready', { summaryReadinessLabel: 'production_ready' }],
    ['missing summary sections', { summarySections: [] }],
    ['missing boundary labels', { summaryBoundaryLabels: [] }],
    ['missing not-authorized labels', { summaryNotAuthorizedLabels: [] }],
    ['missing preconditions', { summaryPreconditions: [] }],
    ['missing checklist', { summaryChecklistLabels: [] }],
    ['packet completeness false', { packetCompletenessVerified: false }],
    ['audience false', { audienceVerified: false }],
    ['purpose false', { purposeVerified: false }],
    ['not-authorized false', { notAuthorizedActionsVerified: false }],
    ['preconditions false', { requiredPreconditionsVerified: false }],
    ['checklist false', { packetChecklistVerified: false }],
    ['mock boundary false', { mockOnlyBoundaryVerified: false }],
    ['no actual access false', { noActualAccessBoundaryVerified: false }],
    ['no runtime readiness false', { noRuntimeReadinessBoundaryVerified: false }],
    ['summary static false', { summaryStaticShapeVerified: false }],
    ['safe summary false', { safeSummaryOnlyVerified: false }],
    ['mock only summary false', { mockOnlySummaryVerified: false }],
    ['no actual access summary false', { noActualAccessSummaryVerified: false }],
    ['no runtime readiness summary false', { noRuntimeReadinessSummaryVerified: false }],
    ['next safe action false', { nextSafeActionVerified: false }],
    ['upstream blocker', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, blockers: ['upstream_blocker'] } as any }],
    ['actual DB query flag', { actualDbQueryEnabled: true }],
    ['actual DB export flag', { actualDbExportEnabled: true }],
    ['real DB query flag', { realDbQueryEnabled: true }],
    ['source access flag', { sourceAccessEnabled: true }],
    ['Prisma flag', { prismaClientEnabled: true }],
    ['DATABASE_URL flag', { databaseUrlReadEnabled: true }],
    ['env flag', { envReadEnabled: true }],
    ['network flag', { networkAccessEnabled: true }],
    ['RPC flag', { rpcAccessEnabled: true }],
    ['wallet flag', { walletAccessEnabled: true }],
    ['contract flag', { contractAccessEnabled: true }],
    ['tx flag', { txSendEnabled: true }],
    ['file export flag', { fileExportEnabled: true }],
    ['JSONL export flag', { jsonlFileExportEnabled: true }],
    ['artifact upload flag', { artifactUploadEnabled: true }],
    ['Docker smoke flag', { dockerSmokeChanged: true }],
    ['staging no-tx flag', { stagingNoTxPassClaimed: true }],
    ['runtime readiness flag', { runtimeReadinessClaimed: true }],
    ['production readiness flag', { productionReadinessClaimed: true }],
    ['raw secret label', { summaryVerifierId: 'raw-secret-verifier' }],
    ['raw env label', { summaryVerifierId: 'raw_env_verifier' }],
    ['raw log label', { summaryVerifierId: 'raw_log_verifier' }],
    ['raw payload label', { summaryVerifierId: 'raw_payload_verifier' }],
    ['raw endpoint label', { summaryVerifierId: 'raw_endpoint_verifier' }],
    ['private path label', { summaryVerifierId: 'private_path_verifier' }],
    ['local path label', { summaryVerifierId: 'local_path_verifier' }],
    ['nextSafeAction actual source access', { nextSafeAction: 'actual_source_access' }],
    ['public readiness overclaim', { summaryVerifierId: 'runtime_ready_verifier' }]
  ])('blocks unsafe verifier input: %s', (_label, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput>);

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).not.toBe('prepare_pr_d8an_actual_safe_row_export_read_only_source_candidate_mock_lane_closure');
  });

  it.each([
    ['D8AL NEEDS_REVIEW', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, status: 'NEEDS_REVIEW' } as any }],
    ['verification mode missing', { verificationMode: null }],
    ['deferred entity isolated safely', { deferredEntityTypes: ['Prize'] }],
    ['upstream needs review', { mockReviewDecisionPacketSummary: { ...mockReviewDecisionPacketSummary, needsReviewReasons: ['operator_review'] } as any }]
  ])('returns NEEDS_REVIEW for reviewable verifier input: %s', (_label, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput>);

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.nextSafeAction).toBe('collect_operator_mock_review_decision_packet_summary_verifier_review');
  });

  it('keeps nextSafeAction singular', () => {
    const result = build();

    expect(typeof result.nextSafeAction).toBe('string');
    expect(result.nextSafeAction).not.toContain(',');
  });

  it('does not include forbidden runtime primitives in product source', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifier.ts'),
      'utf8'
    );

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
