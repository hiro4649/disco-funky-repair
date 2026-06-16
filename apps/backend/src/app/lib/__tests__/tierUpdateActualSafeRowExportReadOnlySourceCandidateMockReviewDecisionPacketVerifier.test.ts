import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier';

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

const mockReviewDecisionPacket = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet',
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
  mockReviewDecisionVerifierStatus: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY',
  mockReviewDecisionVerifierKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier',
  mockReviewDecisionVerifierTraceLabel: 'd8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier',
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
  mockOnlyDecisionSummary: { verified: true, safeSummaryOnly: true },
  noActualAccessSummary: { verified: true, safeSummaryOnly: true },
  noRuntimeReadinessSummary: { verified: true, safeSummaryOnly: true },
  allowedDecisionOptionsSummary: { verified: true, safeSummaryOnly: true },
  forbiddenDecisionOptionsSummary: { verified: true, safeSummaryOnly: true },
  decisionChecklistSummary: { verified: true, safeSummaryOnly: true },
  boundarySummary,
  blockerCount: 0,
  blockers: [],
  needsReviewReasonCount: 0,
  needsReviewReasons: [],
  unsafeReasonCount: 0,
  unsafeReasonCodes: [],
  nextSafeAction: 'prepare_pr_d8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier'
};

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput => ({
  mockReviewDecisionPacket: mockReviewDecisionPacket as any,
  packetVerifierId: 'mock-review-decision-packet-verifier-safe-1',
  verificationMode: 'mock_decision_packet_static_verification',
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
  nextSafeAction: 'prepare_pr_d8al_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier', () => {
  it('returns SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY for valid D8AJ packet', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier');
    expect(result.traceLabel).toBe('d8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.nextSafeAction).toBe('prepare_pr_d8al_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary');
  });

  it('ready status does not claim actual DB/source/export/runtime readiness', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY');
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
    ['missing D8AJ packet', { mockReviewDecisionPacket: null, mockReviewDecisionPacketStatus: null }],
    ['D8AJ BLOCKED', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, status: 'BLOCKED' } as any }],
    ['missing packetVerifierId', { packetVerifierId: null }],
    ['missing mockReviewDecisionPacketId', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, mockReviewDecisionPacketId: null } as any }],
    ['missing decisionVerifierId', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, decisionVerifierId: null } as any }],
    ['missing mockReviewDecisionGateId', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, mockReviewDecisionGateId: null } as any }],
    ['missing mockReviewPacketId', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, mockReviewPacketId: null } as any }],
    ['missing verifierId', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, verifierId: null } as any }],
    ['missing mockPlanId', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, mockPlanId: null } as any }],
    ['missing sourceAccessPlanId', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, sourceAccessPlanId: null } as any }],
    ['missing decisionGateId', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, decisionGateId: null } as any }],
    ['missing reviewPacketId', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, reviewPacketId: null } as any }],
    ['missing sourceHeadSha', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, sourceHeadSha: null } as any }],
    ['verificationMode execute', { verificationMode: 'execute' }],
    ['verificationMode query', { verificationMode: 'query' }],
    ['verificationMode read_source', { verificationMode: 'read_source' }],
    ['verificationMode db_read', { verificationMode: 'db_read' }],
    ['verificationMode jsonl_export', { verificationMode: 'jsonl_export' }],
    ['verificationMode file_write', { verificationMode: 'file_write' }],
    ['unsafe packetAudience', { packetAudience: 'public_endpoint' }],
    ['packetPurpose actual execution', { packetPurpose: 'actual_source_access' }],
    ['absent packetSections', { packetSections: [] }],
    ['absent ownerDecisionSummary', { ownerDecisionSummary: null, mockReviewDecisionPacket: { ...mockReviewDecisionPacket, ownerDecisionSummary: null } as any }],
    ['absent operatorDecisionSummary', { operatorDecisionSummary: null, mockReviewDecisionPacket: { ...mockReviewDecisionPacket, operatorDecisionSummary: null } as any }],
    ['absent notAuthorizedActions', { notAuthorizedActions: [], mockReviewDecisionPacket: { ...mockReviewDecisionPacket, notAuthorizedActions: [] } as any }],
    ['notAuthorizedActions missing DB query', { notAuthorizedActions: notAuthorizedActions.filter((item) => item !== 'actual_db_query') }],
    ['notAuthorizedActions missing DB export', { notAuthorizedActions: notAuthorizedActions.filter((item) => item !== 'actual_db_export') }],
    ['notAuthorizedActions missing source access', { notAuthorizedActions: notAuthorizedActions.filter((item) => item !== 'source_access') }],
    ['notAuthorizedActions missing runtime readiness', { notAuthorizedActions: notAuthorizedActions.filter((item) => item !== 'runtime_readiness') }],
    ['absent requiredPreconditions', { requiredPreconditions: [], mockReviewDecisionPacket: { ...mockReviewDecisionPacket, requiredPreconditions: [] } as any }],
    ['requiredPreconditions missing owner confirmation', { requiredPreconditions: ['same_head_remote_quality_gate_required'] }],
    ['requiredPreconditions missing same-head remote gate', { requiredPreconditions: ['future_owner_confirmation_required'] }],
    ['absent packetChecklist', { packetChecklist: [], mockReviewDecisionPacket: { ...mockReviewDecisionPacket, packetChecklist: [] } as any }],
    ['packetChecklist missing no actual access', { packetChecklist: ['confirm no db', 'confirm no export', 'confirm no runtime readiness'] }],
    ['packetChecklist missing no DB', { packetChecklist: ['confirm no actual access', 'confirm no export', 'confirm no runtime readiness'] }],
    ['packetChecklist missing no export', { packetChecklist: ['confirm no actual access', 'confirm no db', 'confirm no runtime readiness'] }],
    ['packetChecklist missing no runtime readiness', { packetChecklist: ['confirm no actual access', 'confirm no db', 'confirm no export'] }],
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
    ['blockers present', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, blockers: ['upstream_blocker'] } as any }],
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
    ['raw secret label', { packetVerifierId: 'raw-secret-verifier' }],
    ['raw env label', { packetVerifierId: 'raw_env_verifier' }],
    ['raw log label', { packetVerifierId: 'raw_log_verifier' }],
    ['raw payload label', { packetVerifierId: 'raw_payload_verifier' }],
    ['raw endpoint label', { packetVerifierId: 'raw_endpoint_verifier' }],
    ['private path label', { packetVerifierId: 'private_path_verifier' }],
    ['local path label', { packetVerifierId: 'local_path_verifier' }],
    ['public readiness overclaim', { packetVerifierId: 'runtime_ready_verifier' }]
  ])('blocks unsafe verifier input: %s', (_name, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput>);

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).not.toBe('prepare_pr_d8al_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary');
  });

  it.each([
    ['D8AJ NEEDS_REVIEW', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, status: 'NEEDS_REVIEW' } as any }],
    ['deferred entity isolated safely', { deferredEntityTypes: ['Prize'] }],
    ['incomplete packet sections without unsafe boundary', { packetSections: ['scope_summary'] }],
    ['incomplete packet checklist without unsafe boundary', { packetChecklist: ['confirm no actual access'] }],
    ['audience missing', { packetAudience: null }],
    ['purpose missing', { packetPurpose: null }],
    ['upstream needs review', { mockReviewDecisionPacket: { ...mockReviewDecisionPacket, needsReviewReasons: ['operator_review'] } as any }]
  ])('returns NEEDS_REVIEW for reviewable verifier input: %s', (_name, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput>);

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.nextSafeAction).toBe('collect_operator_mock_review_decision_packet_verifier_review');
  });

  it('retains required not-authorized action categories', () => {
    const result = build();

    expect(result.notAuthorizedActions).toEqual(expect.arrayContaining([
      'actual_db_query',
      'actual_db_export',
      'source_access',
      'runtime_readiness',
      'production_readiness'
    ]));
  });

  it('retains required preconditions', () => {
    const result = build();

    expect(result.requiredPreconditions).toEqual(expect.arrayContaining([
      'future_owner_confirmation_required',
      'same_head_remote_quality_gate_required'
    ]));
  });

  it('retains no-access packet checklist', () => {
    const result = build();

    expect(result.packetChecklist.join(' ')).toContain('no actual access');
    expect(result.packetChecklist.join(' ')).toContain('no db');
    expect(result.packetChecklist.join(' ')).toContain('no export');
    expect(result.packetChecklist.join(' ')).toContain('no runtime readiness');
  });

  it('keeps nextSafeAction singular', () => {
    const result = build();

    expect(typeof result.nextSafeAction).toBe('string');
    expect(result.nextSafeAction).not.toContain(',');
  });

  it('does not include forbidden runtime primitives in product source', () => {
    const sourcePath = path.resolve(
      __dirname,
      '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier.ts'
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
