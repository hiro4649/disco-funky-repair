import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate';

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

const mockReviewPacket = {
  kind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_packet',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet',
  mockReviewPacketId: 'mock-review-packet-safe-1',
  verifierId: 'mock-plan-verifier-safe-1',
  mockPlanId: 'mock-plan-safe-1',
  sourceAccessPlanId: 'source-access-plan-safe-1',
  decisionGateId: 'decision-gate-safe-1',
  reviewPacketId: 'review-packet-safe-1',
  sourceHeadSha: 'source-head-safe',
  mockPlanVerifierStatus: 'SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY',
  mockPlanVerifierKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier',
  mockPlanVerifierTraceLabel: 'd8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier',
  operatorReviewMode: 'mock_review_only',
  reviewAudience: 'owner',
  reviewPurpose: 'mock review packet only',
  reviewSections: [
    'scope_summary',
    'mock_plan_verifier_summary',
    'mock_only_summary',
    'zero_real_rows_summary',
    'no_actual_access_summary',
    'not_authorized_summary',
    'next_safe_action'
  ],
  requiredReviewerChecks: [
    'confirm no actual access',
    'confirm no db',
    'confirm no export',
    'confirm no runtime readiness'
  ],
  notAuthorizedActions,
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
  mockOnlySummary: { verified: true, safeSummaryOnly: true },
  zeroRealRowsSummary: { verified: true, safeSummaryOnly: true },
  noActualAccessSummary: { verified: true, safeSummaryOnly: true },
  safeEvidenceOriginSummary: { verified: true, safeSummaryOnly: true },
  forbiddenFieldsSummary: { verified: true, notAuthorizedActionCount: 14, safeSummaryOnly: true },
  redactionPlanSummary: { verified: true, safeSummaryOnly: true },
  preconditionSummary: { verified: true, safeSummaryOnly: true },
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
  nextSafeAction: 'prepare_pr_d8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate'
};

const decisionChecklist = [
  'confirm no actual access',
  'confirm no db',
  'confirm no export',
  'confirm no runtime readiness'
];

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput => ({
  mockReviewPacket: mockReviewPacket as any,
  mockReviewDecisionGateId: 'mock-review-decision-gate-safe-1',
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
  nextSafeAction: 'prepare_pr_d8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate', () => {
  it('returns SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY for valid D8AG packet', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate');
    expect(result.traceLabel).toBe('d8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.decisionReadiness).toBe('ready_for_mock_owner_decision_boundary');
    expect(result.nextSafeAction).toBe('prepare_pr_d8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier');
  });

  it.each([
    ['missing D8AG status', { mockReviewPacket: null, mockReviewPacketStatus: null }],
    ['D8AG BLOCKED', { mockReviewPacket: { ...mockReviewPacket, status: 'BLOCKED' } as any }],
    ['missing mockReviewDecisionGateId', { mockReviewDecisionGateId: null }],
    ['missing mockReviewPacketId', { mockReviewPacket: { ...mockReviewPacket, mockReviewPacketId: null } as any }],
    ['missing verifierId', { mockReviewPacket: { ...mockReviewPacket, verifierId: null } as any }],
    ['missing mockPlanId', { mockReviewPacket: { ...mockReviewPacket, mockPlanId: null } as any }],
    ['missing sourceAccessPlanId', { mockReviewPacket: { ...mockReviewPacket, sourceAccessPlanId: null } as any }],
    ['missing decisionGateId', { mockReviewPacket: { ...mockReviewPacket, decisionGateId: null } as any }],
    ['missing reviewPacketId', { mockReviewPacket: { ...mockReviewPacket, reviewPacketId: null } as any }],
    ['missing sourceHeadSha', { mockReviewPacket: { ...mockReviewPacket, sourceHeadSha: null } as any }],
    ['ownerIntentMode execute', { ownerIntentMode: 'execute' }],
    ['ownerIntentMode query', { ownerIntentMode: 'query' }],
    ['ownerIntentMode read_source', { ownerIntentMode: 'read_source' }],
    ['ownerIntentMode db_read', { ownerIntentMode: 'db_read' }],
    ['ownerIntentMode jsonl_export', { ownerIntentMode: 'jsonl_export' }],
    ['ownerIntentMode file_write', { ownerIntentMode: 'file_write' }],
    ['decisionRequestLabel actual execution', { decisionRequestLabel: 'execute actual source access' }],
    ['manualDecisionRequired false with needsReviewReasons', { manualDecisionRequired: false, needsReviewReasons: ['operator_review'] }],
    ['absent allowedDecisionOptions', { allowedDecisionOptions: [] }],
    ['allowedDecisionOptions run_actual_db_query', { allowedDecisionOptions: ['run_actual_db_query'] }],
    ['allowedDecisionOptions open_source_access', { allowedDecisionOptions: ['open_source_access'] }],
    ['allowedDecisionOptions write_jsonl_export', { allowedDecisionOptions: ['write_jsonl_export'] }],
    ['absent forbiddenDecisionOptions', { forbiddenDecisionOptions: [] }],
    ['forbiddenDecisionOptions missing actual DB/source/export/runtime categories', { forbiddenDecisionOptions: ['run_actual_db_query'] }],
    ['absent decisionChecklist', { decisionChecklist: [] }],
    ['operatorReviewMode execute', { operatorReviewMode: 'execute' }],
    ['operatorReviewMode query', { operatorReviewMode: 'query' }],
    ['operatorReviewMode read_source', { operatorReviewMode: 'read_source' }],
    ['operatorReviewMode db_read', { operatorReviewMode: 'db_read' }],
    ['operatorReviewMode jsonl_export', { operatorReviewMode: 'jsonl_export' }],
    ['reviewAudience runtime_worker', { reviewAudience: 'runtime_worker' }],
    ['reviewAudience scheduler', { reviewAudience: 'scheduler' }],
    ['reviewAudience public_user', { reviewAudience: 'public_user' }],
    ['reviewAudience frontend', { reviewAudience: 'frontend' }],
    ['reviewAudience admin_action_runner', { reviewAudience: 'admin_action_runner' }],
    ['reviewPurpose actual execution', { reviewPurpose: 'execute actual source access' }],
    ['blockers present', { mockReviewPacket: { ...mockReviewPacket, blockers: ['upstream_blocker'] } as any }],
    ['nextSafeAction actual source access', { nextSafeAction: 'actual_source_access' }],
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
    ['raw secret label', { mockReviewDecisionGateId: 'raw-secret-gate' }],
    ['raw env label', { mockReviewDecisionGateId: 'raw_env_gate' }],
    ['raw log label', { mockReviewDecisionGateId: 'raw_log_gate' }],
    ['raw payload label', { mockReviewDecisionGateId: 'raw_payload_gate' }],
    ['raw endpoint label', { mockReviewDecisionGateId: 'raw_endpoint_gate' }],
    ['private path label', { mockReviewDecisionGateId: 'private_path_gate' }],
    ['local path label', { mockReviewDecisionGateId: 'local_path_gate' }],
    ['public readiness overclaim', { mockReviewDecisionGateId: 'runtime_ready_gate' }],
    ['sourceAccessAuthorized true', { verificationSummary: { ...mockReviewPacket.verificationSummary, sourceAccessAuthorized: true } as any }],
    ['actualDbReadAuthorized true', { verificationSummary: { ...mockReviewPacket.verificationSummary, actualDbReadAuthorized: true } as any }],
    ['actualDbExportAuthorized true', { verificationSummary: { ...mockReviewPacket.verificationSummary, actualDbExportAuthorized: true } as any }],
    ['jsonlExportAuthorized true', { verificationSummary: { ...mockReviewPacket.verificationSummary, jsonlExportAuthorized: true } as any }],
    ['runtimeReady true', { verificationSummary: { ...mockReviewPacket.verificationSummary, runtimeReady: true } as any }],
    ['mockOnlySummary false', { mockOnlySummary: { verified: false, safeSummaryOnly: true } }],
    ['zeroRealRowsSummary false', { zeroRealRowsSummary: { verified: false, safeSummaryOnly: true } }],
    ['noActualAccessSummary false', { noActualAccessSummary: { verified: false, safeSummaryOnly: true } }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput>).status).toBe('BLOCKED');
  });

  it('returns NEEDS_REVIEW for D8AG NEEDS_REVIEW', () => {
    expect(build({ mockReviewPacket: { ...mockReviewPacket, status: 'NEEDS_REVIEW' } as any }).status).toBe('NEEDS_REVIEW');
  });

  it.each([
    ['deferred entities isolated safely', { deferredEntityTypes: ['prize'] }],
    ['manualDecisionRequired true with safe review reasons', { needsReviewReasons: ['operator_review_only'] }],
    ['incomplete decisionChecklist without unsafe boundary', { decisionChecklist: ['confirm no actual access'] }],
    ['missing ownerIntentMode without unsafe boundary', { ownerIntentMode: null }],
    ['redaction unknown without sensitive labels', { redactionPlanSummary: { verified: 'unknown', safeSummaryOnly: true } as any }]
  ])('returns NEEDS_REVIEW for %s', (_label, overrides) => {
    expect(build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput>).status).toBe('NEEDS_REVIEW');
  });

  it('keeps allowed options safe and forbidden options complete in ready case', () => {
    const result = build();

    expect(result.allowedDecisionOptions).toEqual([
      'block_until_scope_repaired',
      'leave_open_no_source_access',
      'request_d8ai_mock_decision_verifier',
      'request_more_mock_review'
    ]);
    forbiddenDecisionOptions.forEach((option) => expect(result.forbiddenDecisionOptions).toContain(option));
    expect(result.allowedDecisionOptions).not.toContain('run_actual_db_query');
    expect(result.allowedDecisionOptions).not.toContain('open_source_access');
  });

  it('decisionChecklist includes no actual access, no DB, no export, and no runtime readiness', () => {
    const text = build().decisionChecklist.join(' ');

    expect(text).toContain('no actual access');
    expect(text).toContain('no db');
    expect(text).toContain('no export');
    expect(text).toContain('no runtime readiness');
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
      path.join(__dirname, '..', 'tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate.ts'),
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
