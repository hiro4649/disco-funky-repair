import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier';

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

const decisionChecklist = [
  'confirm no actual access',
  'confirm no db',
  'confirm no export',
  'confirm no runtime readiness'
];

const mockReviewDecisionGate = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate',
  mockReviewDecisionGateId: 'mock-review-decision-gate-safe-1',
  mockReviewPacketId: 'mock-review-packet-safe-1',
  verifierId: 'mock-plan-verifier-safe-1',
  mockPlanId: 'mock-plan-safe-1',
  sourceAccessPlanId: 'source-access-plan-safe-1',
  decisionGateId: 'decision-gate-safe-1',
  reviewPacketId: 'review-packet-safe-1',
  sourceHeadSha: 'source-head-safe',
  mockReviewPacketStatus: 'SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY',
  mockReviewPacketKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_packet',
  mockReviewPacketTraceLabel: 'd8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet',
  ownerIntentMode: 'mock_review_decision_only',
  decisionRequestLabel: 'mock review decision boundary only',
  manualDecisionRequired: true,
  allowedDecisionOptions: [
    'request_d8ai_mock_decision_verifier',
    'request_more_mock_review',
    'block_until_scope_repaired',
    'leave_open_no_source_access'
  ],
  forbiddenDecisionOptions,
  decisionChecklist,
  operatorReviewMode: 'mock_review_only',
  reviewAudience: 'owner',
  reviewPurpose: 'mock review decision gate only',
  decisionReadiness: 'ready_for_mock_owner_decision_boundary',
  mockOnlyDecisionSummary: { verified: true, safeSummaryOnly: true },
  zeroRealRowsDecisionSummary: { verified: true, safeSummaryOnly: true },
  noActualAccessDecisionSummary: { verified: true, safeSummaryOnly: true },
  forbiddenActionSummary: forbiddenDecisionOptions,
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
  blockerCount: 0,
  blockers: [],
  needsReviewReasonCount: 0,
  needsReviewReasons: [],
  unsafeReasonCount: 0,
  unsafeReasonCodes: [],
  nextSafeAction: 'prepare_pr_d8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier'
};

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput => ({
  mockReviewDecisionGate: mockReviewDecisionGate as any,
  decisionVerifierId: 'mock-review-decision-verifier-safe-1',
  verificationMode: 'mock_decision_static_verification',
  expectedMockOnlyDecision: true,
  expectedNoActualAccess: true,
  expectedNoRuntimeReadiness: true,
  mockOnlyDecisionVerified: true,
  noActualAccessVerified: true,
  noRuntimeReadinessVerified: true,
  allowedDecisionOptionsVerified: true,
  forbiddenDecisionOptionsVerified: true,
  decisionChecklistVerified: true,
  ownerIntentVerified: true,
  manualDecisionBoundaryVerified: true,
  nextSafeActionVerified: true,
  nextSafeAction: 'prepare_pr_d8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier', () => {
  it('returns SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY for valid D8AH decision gate', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier');
    expect(result.traceLabel).toBe('d8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.verificationSummary.safeSummaryOnly).toBe(true);
    expect(result.nextSafeAction).toBe('prepare_pr_d8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet');
  });

  it('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY does not authorize real execution', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY');
    expect(result.boundarySummary.actualDbQueryEnabled).toBe(false);
    expect(result.boundarySummary.actualDbExportEnabled).toBe(false);
    expect(result.boundarySummary.sourceAccessEnabled).toBe(false);
    expect(result.boundarySummary.prismaClientEnabled).toBe(false);
    expect(result.boundarySummary.databaseUrlReadEnabled).toBe(false);
    expect(result.boundarySummary.fileExportEnabled).toBe(false);
    expect(result.boundarySummary.jsonlFileExportEnabled).toBe(false);
    expect(result.boundarySummary.runtimeReadinessClaimed).toBe(false);
    expect(result.boundarySummary.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['D8AH status missing', { mockReviewDecisionGate: null, mockReviewDecisionGateStatus: null }],
    ['D8AH BLOCKED', { mockReviewDecisionGate: { ...mockReviewDecisionGate, status: 'BLOCKED' } as any }],
    ['missing decisionVerifierId', { decisionVerifierId: null }],
    ['missing mockReviewDecisionGateId', { mockReviewDecisionGate: { ...mockReviewDecisionGate, mockReviewDecisionGateId: null } as any }],
    ['missing mockReviewPacketId', { mockReviewDecisionGate: { ...mockReviewDecisionGate, mockReviewPacketId: null } as any }],
    ['missing verifierId', { mockReviewDecisionGate: { ...mockReviewDecisionGate, verifierId: null } as any }],
    ['missing mockPlanId', { mockReviewDecisionGate: { ...mockReviewDecisionGate, mockPlanId: null } as any }],
    ['missing sourceAccessPlanId', { mockReviewDecisionGate: { ...mockReviewDecisionGate, sourceAccessPlanId: null } as any }],
    ['missing decisionGateId', { mockReviewDecisionGate: { ...mockReviewDecisionGate, decisionGateId: null } as any }],
    ['missing reviewPacketId', { mockReviewDecisionGate: { ...mockReviewDecisionGate, reviewPacketId: null } as any }],
    ['missing sourceHeadSha', { mockReviewDecisionGate: { ...mockReviewDecisionGate, sourceHeadSha: null } as any }],
    ['verificationMode execute', { verificationMode: 'execute' }],
    ['verificationMode query', { verificationMode: 'query' }],
    ['verificationMode read_source', { verificationMode: 'read_source' }],
    ['verificationMode db_read', { verificationMode: 'db_read' }],
    ['verificationMode jsonl_export', { verificationMode: 'jsonl_export' }],
    ['verificationMode file_write', { verificationMode: 'file_write' }],
    ['ownerIntentMode execute', { ownerIntentMode: 'execute' }],
    ['ownerIntentMode query', { ownerIntentMode: 'query' }],
    ['ownerIntentMode read_source', { ownerIntentMode: 'read_source' }],
    ['ownerIntentMode db_read', { ownerIntentMode: 'db_read' }],
    ['ownerIntentMode jsonl_export', { ownerIntentMode: 'jsonl_export' }],
    ['decisionRequestLabel actual execution', { decisionRequestLabel: 'execute actual source access' }],
    ['allowedDecisionOptions run_actual_db_query', { allowedDecisionOptions: ['run_actual_db_query'] }],
    ['allowedDecisionOptions open_source_access', { allowedDecisionOptions: ['open_source_access'] }],
    ['allowedDecisionOptions write_jsonl_export', { allowedDecisionOptions: ['write_jsonl_export'] }],
    ['forbiddenDecisionOptions missing actual DB/source/export/runtime categories', { forbiddenDecisionOptions: ['run_actual_db_query'] }],
    ['decisionChecklist missing no actual access', { decisionChecklist: ['confirm no db', 'confirm no export', 'confirm no runtime readiness'] }],
    ['decisionChecklist missing no DB', { decisionChecklist: ['confirm no actual access', 'confirm no export', 'confirm no runtime readiness'] }],
    ['decisionChecklist missing no export', { decisionChecklist: ['confirm no actual access', 'confirm no db', 'confirm no runtime readiness'] }],
    ['decisionChecklist missing no runtime readiness', { decisionChecklist: ['confirm no actual access', 'confirm no db', 'confirm no export'] }],
    ['mockOnlyDecisionVerified false', { mockOnlyDecisionVerified: false }],
    ['noActualAccessVerified false', { noActualAccessVerified: false }],
    ['noRuntimeReadinessVerified false', { noRuntimeReadinessVerified: false }],
    ['allowedDecisionOptionsVerified false', { allowedDecisionOptionsVerified: false }],
    ['forbiddenDecisionOptionsVerified false', { forbiddenDecisionOptionsVerified: false }],
    ['decisionChecklistVerified false', { decisionChecklistVerified: false }],
    ['ownerIntentVerified false', { ownerIntentVerified: false }],
    ['manualDecisionBoundaryVerified false', { manualDecisionBoundaryVerified: false }],
    ['nextSafeActionVerified false', { nextSafeActionVerified: false }],
    ['nextSafeAction actual source access', { nextSafeAction: 'actual_source_access' }],
    ['manualDecisionRequired false with needsReviewReasons', { manualDecisionRequired: false, needsReviewReasons: ['operator_review'] }],
    ['blockers present', { mockReviewDecisionGate: { ...mockReviewDecisionGate, blockers: ['upstream_blocker'] } as any }],
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
    ['raw secret label', { decisionVerifierId: 'raw-secret-verifier' }],
    ['raw env label', { decisionVerifierId: 'raw_env_verifier' }],
    ['raw log label', { decisionVerifierId: 'raw_log_verifier' }],
    ['raw payload label', { decisionVerifierId: 'raw_payload_verifier' }],
    ['raw endpoint label', { decisionVerifierId: 'raw_endpoint_verifier' }],
    ['private path label', { decisionVerifierId: 'private_path_verifier' }],
    ['local path label', { decisionVerifierId: 'local_path_verifier' }],
    ['public readiness overclaim', { decisionVerifierId: 'runtime_ready_verifier' }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput>).status).toBe('BLOCKED');
  });

  it('returns NEEDS_REVIEW for D8AH NEEDS_REVIEW', () => {
    expect(build({ mockReviewDecisionGate: { ...mockReviewDecisionGate, status: 'NEEDS_REVIEW' } as any }).status).toBe('NEEDS_REVIEW');
  });

  it.each([
    ['deferred entities isolated safely', { deferredEntityTypes: ['prize'] }],
    ['manualDecisionRequired true with safe review reasons', { needsReviewReasons: ['operator_review_only'] }],
    ['incomplete decisionChecklist without unsafe boundary', { decisionChecklist: ['confirm no actual access'] }],
    ['ownerIntentMode missing without unsafe boundary', { ownerIntentMode: null }]
  ])('returns NEEDS_REVIEW for %s', (_label, overrides) => {
    expect(build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput>).status).toBe('NEEDS_REVIEW');
  });

  it('allowedDecisionOptions never include forbidden actions in ready case', () => {
    const result = build();

    expect(result.allowedDecisionOptions).not.toContain('run_actual_db_query');
    expect(result.allowedDecisionOptions).not.toContain('open_source_access');
    expect(result.allowedDecisionOptions).not.toContain('write_jsonl_export');
    expect(result.allowedDecisionOptions).toContain('request_d8ai_mock_decision_verifier');
  });

  it('forbiddenDecisionOptions include actual DB/source/export/runtime categories', () => {
    const result = build();

    forbiddenDecisionOptions.forEach((option) => expect(result.forbiddenDecisionOptions).toContain(option));
  });

  it('decisionChecklist includes no actual access, no DB, no export, and no runtime readiness', () => {
    const text = build().decisionChecklist.join(' ');

    expect(text).toContain('no actual access');
    expect(text).toContain('no db');
    expect(text).toContain('no export');
    expect(text).toContain('no runtime readiness');
  });

  it('nextSafeAction is singular and not actual access or readiness', () => {
    const result = build();

    expect(typeof result.nextSafeAction).toBe('string');
    expect(result.nextSafeAction).toBe('prepare_pr_d8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet');
    expect(result.nextSafeAction).not.toContain('actual_db_query');
    expect(result.nextSafeAction).not.toContain('actual_db_export');
    expect(result.nextSafeAction).not.toContain('source_access');
    expect(result.nextSafeAction).not.toContain('file_export');
    expect(result.nextSafeAction).not.toContain('artifact_upload');
    expect(result.nextSafeAction).not.toContain('runtime_readiness');
  });

  it('ready status text does not claim actual DB/source/export/runtime readiness', () => {
    const resultText = JSON.stringify(build());

    expect(resultText).not.toContain('"actualDbQueryEnabled":true');
    expect(resultText).not.toContain('"actualDbExportEnabled":true');
    expect(resultText).not.toContain('"sourceAccessEnabled":true');
    expect(resultText).not.toContain('"jsonlFileExportEnabled":true');
    expect(resultText).not.toContain('"runtimeReadinessClaimed":true');
    expect(resultText).not.toContain('"productionReadinessClaimed":true');
  });

  it('source file does not import Prisma, read env, touch filesystem, or call network', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier.ts'),
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
