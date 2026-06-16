import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_TRACE_LABEL =
  'd8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier' as const;

type MockReviewDecisionVerifierStatus =
  | 'BLOCKED'
  | 'NEEDS_REVIEW'
  | 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY';
type VerificationMode =
  | 'mock_decision_static_verification'
  | 'fixture_decision_verification'
  | 'plan_shape_decision_verification'
  | 'review_only_decision_verification';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate'
  | 'provide_mock_review_decision_verifier_id'
  | 'provide_mock_review_decision_identifiers'
  | 'remove_forbidden_verification_mode'
  | 'remove_forbidden_owner_intent_mode'
  | 'provide_safe_allowed_decision_options'
  | 'add_forbidden_decision_option_categories'
  | 'add_mock_decision_checklist'
  | 'verify_mock_review_decision_boundary'
  | 'require_manual_mock_owner_decision'
  | 'remove_forbidden_boundary_flag'
  | 'remove_unsafe_decision_label'
  | 'collect_operator_mock_review_decision_verifier_review'
  | 'prepare_pr_d8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet';

type BoundaryFlagInput = {
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
  realDbQueryEnabled?: boolean;
  sourceAccessEnabled?: boolean;
  prismaClientEnabled?: boolean;
  databaseUrlReadEnabled?: boolean;
  envReadEnabled?: boolean;
  networkRpcWalletContractTxAccessEnabled?: boolean;
  networkAccessEnabled?: boolean;
  rpcAccessEnabled?: boolean;
  walletAccessEnabled?: boolean;
  contractAccessEnabled?: boolean;
  txSendEnabled?: boolean;
  fileExportEnabled?: boolean;
  jsonlFileExportEnabled?: boolean;
  artifactUploadEnabled?: boolean;
  dockerSmokeChanged?: boolean;
  stagingNoTxPassClaimed?: boolean;
  runtimeReadinessClaimed?: boolean;
  productionReadinessClaimed?: boolean;
};

type VerificationSummary = {
  mockOnlyDecision: boolean;
  noActualAccess: boolean;
  noRuntimeReadiness: boolean;
  allowedDecisionOptions: boolean;
  forbiddenDecisionOptions: boolean;
  decisionChecklist: boolean;
  ownerIntent: boolean;
  manualDecisionBoundary: boolean;
  nextSafeAction: boolean;
  safeSummaryOnly: true;
};

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput = BoundaryFlagInput & {
  mockReviewDecisionGate?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate | null;
  mockReviewDecisionGateStatus?: string | null;
  mockReviewDecisionGateKind?: string | null;
  mockReviewDecisionGateTraceLabel?: string | null;
  decisionVerifierId?: string | null;
  mockReviewDecisionGateId?: string | null;
  mockReviewPacketId?: string | null;
  verifierId?: string | null;
  mockPlanId?: string | null;
  sourceAccessPlanId?: string | null;
  decisionGateId?: string | null;
  reviewPacketId?: string | null;
  sourceHeadSha?: string | null;
  verificationMode?: string | null;
  expectedMockOnlyDecision?: boolean;
  expectedNoActualAccess?: boolean;
  expectedNoRuntimeReadiness?: boolean;
  ownerIntentMode?: string | null;
  decisionRequestLabel?: string | null;
  manualDecisionRequired?: boolean;
  allowedDecisionOptions?: string[];
  forbiddenDecisionOptions?: string[];
  decisionChecklist?: string[];
  decisionReadiness?: string | null;
  mockOnlyDecisionSummary?: { verified?: boolean; safeSummaryOnly?: boolean } | null;
  zeroRealRowsDecisionSummary?: { verified?: boolean; safeSummaryOnly?: boolean } | null;
  noActualAccessDecisionSummary?: { verified?: boolean; safeSummaryOnly?: boolean } | null;
  forbiddenActionSummary?: string[];
  boundarySummary?: BoundaryFlagInput | null;
  mockOnlyDecisionVerified?: boolean;
  noActualAccessVerified?: boolean;
  noRuntimeReadinessVerified?: boolean;
  allowedDecisionOptionsVerified?: boolean;
  forbiddenDecisionOptionsVerified?: boolean;
  decisionChecklistVerified?: boolean;
  ownerIntentVerified?: boolean;
  manualDecisionBoundaryVerified?: boolean;
  nextSafeActionVerified?: boolean;
  blockers?: string[];
  needsReviewReasons?: string[];
  deferredEntityTypes?: string[];
  nextSafeAction?: string | null;
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_SCHEMA_VERSION;
  status: MockReviewDecisionVerifierStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_TRACE_LABEL;
  decisionVerifierId: string;
  mockReviewDecisionGateId: string;
  mockReviewPacketId: string;
  verifierId: string;
  mockPlanId: string;
  sourceAccessPlanId: string;
  decisionGateId: string;
  reviewPacketId: string;
  sourceHeadSha: string;
  mockReviewDecisionGateStatus: string;
  mockReviewDecisionGateKind: string;
  mockReviewDecisionGateTraceLabel: string;
  verificationMode: string;
  mockOnlyDecisionVerified: boolean;
  noActualAccessVerified: boolean;
  noRuntimeReadinessVerified: boolean;
  allowedDecisionOptionsVerified: boolean;
  forbiddenDecisionOptionsVerified: boolean;
  decisionChecklistVerified: boolean;
  ownerIntentVerified: boolean;
  manualDecisionBoundaryVerified: boolean;
  nextSafeActionVerified: boolean;
  verificationSummary: VerificationSummary;
  boundarySummary: Required<BoundaryFlagInput> & { safeSummaryOnly: true };
  allowedDecisionOptions: string[];
  forbiddenDecisionOptions: string[];
  decisionChecklist: string[];
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const ALLOWED_VERIFICATION_MODES: VerificationMode[] = [
  'mock_decision_static_verification',
  'fixture_decision_verification',
  'plan_shape_decision_verification',
  'review_only_decision_verification'
];
const FORBIDDEN_VERIFICATION_MODES = new Set([
  'execute',
  'query',
  'read_source',
  'db_read',
  'export',
  'jsonl_export',
  'file_write',
  'artifact_upload',
  'runtime',
  'worker',
  'cron',
  'route',
  'cli',
  'docker_smoke',
  'staging',
  'production'
]);
const ALLOWED_OWNER_INTENT_MODES = new Set([
  'mock_review_decision_only',
  'fixture_review_decision_only',
  'plan_shape_decision_only',
  'owner_scope_decision_only'
]);
const FORBIDDEN_OWNER_INTENT_MODES = new Set([
  'execute',
  'query',
  'read_source',
  'db_read',
  'export',
  'jsonl_export',
  'file_write',
  'artifact_upload',
  'runtime',
  'worker',
  'cron',
  'route',
  'cli',
  'docker_smoke',
  'staging',
  'production'
]);
const SAFE_ALLOWED_DECISION_OPTIONS = new Set([
  'request_d8ai_mock_decision_verifier',
  'request_more_mock_review',
  'block_until_scope_repaired',
  'leave_open_no_source_access'
]);
const REQUIRED_FORBIDDEN_DECISION_OPTIONS = [
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
const REQUIRED_DECISION_CHECKS = [
  'no actual access',
  'no db',
  'no export',
  'no runtime readiness'
];
const SAFE_NEXT_ACTION_READY =
  'prepare_pr_d8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet';
const D8AH_NEXT_ACTION =
  'prepare_pr_d8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier';
const UNSAFE_LABELS = [
  'secret',
  'privatekey',
  'rawenv',
  'rawlog',
  'rawpayload',
  'rawendpoint',
  'endpoint',
  'privatepath',
  'localpath',
  'databaseurl',
  'dburl'
];
const FORBIDDEN_ACTION_LABELS = [
  'actualdbquery',
  'actualdbexport',
  'sourceaccess',
  'opensourceaccess',
  'readsource',
  'dbread',
  'useprismaclient',
  'readdatabaseurl',
  'readenv',
  'writefileexport',
  'writejsonlexport',
  'uploadartifact',
  'rundockersmoke',
  'claimstagingnotxpass',
  'claimruntimereadiness',
  'claimproductionreadiness',
  'runtime_ready',
  'staging_ready',
  'production_ready'
];

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
const normalizeLabel = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
const hasText = (value: unknown): boolean => value !== undefined && value !== null && String(value).trim().length > 0;
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort().slice(0, 18);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort();

function buildBoundarySummary(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput
): Required<BoundaryFlagInput> & { safeSummaryOnly: true } {
  return {
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
    ...(input.mockReviewDecisionGate?.boundarySummary || {}),
    ...(input.boundarySummary || {}),
    ...(input.boundaryFlags || {}),
    safeSummaryOnly: true
  };
}

function addBoundaryFlagBlockers(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput,
  blockers: Set<string>
): void {
  const flags: Array<[keyof BoundaryFlagInput, string]> = [
    ['actualDbQueryEnabled', 'real_db_query_forbidden'],
    ['realDbQueryEnabled', 'real_db_query_forbidden'],
    ['actualDbExportEnabled', 'actual_db_export_forbidden'],
    ['sourceAccessEnabled', 'source_access_forbidden'],
    ['prismaClientEnabled', 'prisma_client_forbidden'],
    ['databaseUrlReadEnabled', 'database_url_read_forbidden'],
    ['envReadEnabled', 'env_read_forbidden'],
    ['networkRpcWalletContractTxAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['networkAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['rpcAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['walletAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['contractAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['txSendEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['fileExportEnabled', 'file_export_forbidden'],
    ['jsonlFileExportEnabled', 'jsonl_file_export_forbidden'],
    ['artifactUploadEnabled', 'artifact_upload_forbidden'],
    ['dockerSmokeChanged', 'docker_smoke_change_forbidden'],
    ['stagingNoTxPassClaimed', 'staging_no_tx_pass_claim_forbidden'],
    ['runtimeReadinessClaimed', 'runtime_readiness_claim_forbidden'],
    ['productionReadinessClaimed', 'production_readiness_claim_forbidden']
  ];
  flags.forEach(([flag, code]) => {
    if (input[flag] === true || input.boundaryFlags?.[flag] === true || input.boundarySummary?.[flag] === true || input.mockReviewDecisionGate?.boundarySummary?.[flag] === true) {
      blockers.add(code);
    }
  });
}

function collectUnsafeLabels(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput,
  blockers: Set<string>
): void {
  const labels = [
    input.decisionVerifierId,
    input.mockReviewDecisionGateId,
    input.mockReviewPacketId,
    input.verifierId,
    input.mockPlanId,
    input.sourceAccessPlanId,
    input.decisionGateId,
    input.reviewPacketId,
    input.ownerIntentMode,
    input.decisionRequestLabel,
    input.nextSafeAction,
    ...(input.allowedDecisionOptions || []),
    ...(input.decisionChecklist || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const action = normalize(label);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
      return;
    }
    const safeNegativeLabel = action.includes('no_actual_access')
      || action.includes('no_db')
      || action.includes('no_export')
      || action.includes('no_source_access')
      || action.includes('not_authorized')
      || action.includes('confirm_no')
      || action.includes('mock_review')
      || action.includes('mock_decision')
      || action.includes('mock_plan')
      || action.includes('source_access_plan')
      || action.includes('review_packet')
      || action.includes('source_head')
      || action.includes('verifier')
      || action.includes('decision_gate')
      || action.includes('source_candidate')
      || action.includes('actual_safe_row_export_read_only')
      || action === D8AH_NEXT_ACTION
      || action === SAFE_NEXT_ACTION_READY;
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_mock_review_decision_verifier_label');
  });
}

function evaluateMode(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput,
  blockers: Set<string>
): string {
  const mode = normalize(String(input.verificationMode || 'missing'));
  if (!(ALLOWED_VERIFICATION_MODES as readonly string[]).includes(mode)) blockers.add('verification_mode_unsupported');
  if (FORBIDDEN_VERIFICATION_MODES.has(mode)) blockers.add('verification_mode_forbidden');
  return mode;
}

function evaluateOwnerIntent(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput,
  blockers: Set<string>,
  needsReview: Set<string>
): void {
  const mode = input.ownerIntentMode === null
    ? 'missing'
    : normalize(String(input.ownerIntentMode || input.mockReviewDecisionGate?.ownerIntentMode || 'missing'));
  if (mode === 'missing') needsReview.add('owner_intent_mode_missing');
  else if (!ALLOWED_OWNER_INTENT_MODES.has(mode)) blockers.add('owner_intent_mode_unsupported');
  if (FORBIDDEN_OWNER_INTENT_MODES.has(mode)) blockers.add('owner_intent_mode_forbidden');
}

function evaluateDecisionOptions(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput,
  blockers: Set<string>,
  missing: Set<string>
): void {
  const allowed = input.allowedDecisionOptions || input.mockReviewDecisionGate?.allowedDecisionOptions || [];
  if (allowed.length === 0) blockers.add('allowed_decision_options_missing');
  allowed.forEach((option) => {
    const normalized = normalize(option);
    if (!SAFE_ALLOWED_DECISION_OPTIONS.has(normalized)) blockers.add('unsupported_allowed_decision_option');
    if (REQUIRED_FORBIDDEN_DECISION_OPTIONS.includes(normalized)) blockers.add('forbidden_allowed_decision_option');
  });

  const forbidden = new Set((input.forbiddenDecisionOptions || input.mockReviewDecisionGate?.forbiddenDecisionOptions || []).map(normalize));
  REQUIRED_FORBIDDEN_DECISION_OPTIONS.forEach((option) => {
    if (!forbidden.has(option)) {
      missing.add(`forbidden_decision_option:${option}`);
      blockers.add(`forbidden_decision_option_missing:${option}`);
    }
  });
}

function evaluateDecisionChecklist(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput,
  blockers: Set<string>,
  needsReview: Set<string>
): void {
  const checklist = input.decisionChecklist || input.mockReviewDecisionGate?.decisionChecklist || [];
  const text = checklist.join(' ').toLowerCase();
  if (checklist.length === 0) blockers.add('decision_checklist_missing');
  REQUIRED_DECISION_CHECKS.forEach((item) => {
    if (!text.includes(item)) {
      if (checklist.length <= 1) needsReview.add(`decision_checklist_incomplete:${normalize(item)}`);
      else blockers.add(`decision_checklist_missing_required:${normalize(item)}`);
    }
  });
}

function evaluateVerifierChecks(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput,
  blockers: Set<string>
): void {
  const checks: Array<[boolean | undefined, string]> = [
    [input.mockOnlyDecisionVerified, 'mock_only_decision_not_verified'],
    [input.noActualAccessVerified, 'no_actual_access_not_verified'],
    [input.noRuntimeReadinessVerified, 'no_runtime_readiness_not_verified'],
    [input.allowedDecisionOptionsVerified, 'allowed_decision_options_not_verified'],
    [input.forbiddenDecisionOptionsVerified, 'forbidden_decision_options_not_verified'],
    [input.decisionChecklistVerified, 'decision_checklist_not_verified'],
    [input.ownerIntentVerified, 'owner_intent_not_verified'],
    [input.manualDecisionBoundaryVerified, 'manual_decision_boundary_not_verified'],
    [input.nextSafeActionVerified, 'next_safe_action_not_verified']
  ];
  checks.forEach(([value, code]) => {
    if (value !== true) blockers.add(code);
  });
  if (input.expectedMockOnlyDecision === false) blockers.add('expected_mock_only_decision_false');
  if (input.expectedNoActualAccess === false) blockers.add('expected_no_actual_access_false');
  if (input.expectedNoRuntimeReadiness === false) blockers.add('expected_no_runtime_readiness_false');
}

function evaluateGateSummaries(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput,
  blockers: Set<string>,
  needsReview: Set<string>
): void {
  const gate = input.mockReviewDecisionGate;
  if ((input.mockOnlyDecisionSummary?.verified ?? gate?.mockOnlyDecisionSummary.verified) !== true) blockers.add('mock_only_decision_summary_not_verified');
  if ((input.noActualAccessDecisionSummary?.verified ?? gate?.noActualAccessDecisionSummary.verified) !== true) blockers.add('no_actual_access_decision_summary_not_verified');
  if (gate?.zeroRealRowsDecisionSummary.verified !== true && input.zeroRealRowsDecisionSummary?.verified !== true) blockers.add('zero_real_rows_decision_summary_not_verified');
  if (gate?.decisionReadiness === 'blocked') blockers.add('decision_readiness_blocked');
  if (gate?.decisionReadiness === 'needs_review' || input.decisionReadiness === 'needs_review') needsReview.add('decision_readiness_needs_review');
}

function evaluateNextSafeAction(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput,
  blockers: Set<string>
): void {
  const action = String(input.nextSafeAction || input.mockReviewDecisionGate?.nextSafeAction || '');
  if (action && action !== D8AH_NEXT_ACTION && action !== SAFE_NEXT_ACTION_READY) {
    const label = normalizeLabel(action);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => label.includes(normalizeLabel(forbidden)))) blockers.add('next_safe_action_forbidden');
  }
}

function determineStatus(
  blockers: Set<string>,
  missing: Set<string>,
  needsReview: Set<string>
): MockReviewDecisionVerifierStatus {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || needsReview.size > 0) return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY';
}

function determineNextSafeAction(
  blockers: Set<string>,
  missing: Set<string>,
  needsReview: Set<string>,
  status: MockReviewDecisionVerifierStatus
): NextSafeAction {
  if (blockers.has('mock_review_decision_gate_missing') || blockers.has('mock_review_decision_gate_not_ready')) return 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate';
  if (blockers.has('decision_verifier_id_missing')) return 'provide_mock_review_decision_verifier_id';
  if (blockers.has('mock_review_decision_gate_id_missing') || blockers.has('mock_review_packet_id_missing') || blockers.has('verifier_id_missing') || blockers.has('mock_plan_id_missing') || blockers.has('source_access_plan_id_missing') || blockers.has('decision_gate_id_missing') || blockers.has('review_packet_id_missing') || blockers.has('source_head_sha_missing')) return 'provide_mock_review_decision_identifiers';
  if (blockers.has('verification_mode_forbidden') || blockers.has('verification_mode_unsupported')) return 'remove_forbidden_verification_mode';
  if (blockers.has('owner_intent_mode_forbidden') || blockers.has('owner_intent_mode_unsupported')) return 'remove_forbidden_owner_intent_mode';
  if (blockers.has('allowed_decision_options_missing') || blockers.has('unsupported_allowed_decision_option') || blockers.has('forbidden_allowed_decision_option')) return 'provide_safe_allowed_decision_options';
  if (missing.size > 0 || Array.from(blockers).some((code) => code.startsWith('forbidden_decision_option_missing'))) return 'add_forbidden_decision_option_categories';
  if (blockers.has('decision_checklist_missing')) return 'add_mock_decision_checklist';
  if (Array.from(blockers).some((code) => code.endsWith('_not_verified') || code.startsWith('expected_'))) return 'verify_mock_review_decision_boundary';
  if (blockers.has('manual_decision_required_for_needs_review')) return 'require_manual_mock_owner_decision';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_mock_review_decision_verifier_label') || blockers.has('public_readiness_or_execution_overclaim')) return 'remove_unsafe_decision_label';
  if (needsReview.size > 0) return 'collect_operator_mock_review_decision_verifier_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY') return SAFE_NEXT_ACTION_READY;
  return 'collect_operator_mock_review_decision_verifier_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifierInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const needsReview = new Set<string>();
  const gate = input.mockReviewDecisionGate;
  const gateStatus = String(input.mockReviewDecisionGateStatus || gate?.status || 'missing');
  if (!gate && !hasText(input.mockReviewDecisionGateStatus)) blockers.add('mock_review_decision_gate_missing');
  if (gateStatus !== 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY') {
    if (gateStatus === 'NEEDS_REVIEW') needsReview.add('mock_review_decision_gate_needs_review');
    else blockers.add('mock_review_decision_gate_not_ready');
  }

  const decisionVerifierId = String(input.decisionVerifierId || 'missing');
  const mockReviewDecisionGateId = String(input.mockReviewDecisionGateId || gate?.mockReviewDecisionGateId || 'missing');
  const mockReviewPacketId = String(input.mockReviewPacketId || gate?.mockReviewPacketId || 'missing');
  const verifierId = String(input.verifierId || gate?.verifierId || 'missing');
  const mockPlanId = String(input.mockPlanId || gate?.mockPlanId || 'missing');
  const sourceAccessPlanId = String(input.sourceAccessPlanId || gate?.sourceAccessPlanId || 'missing');
  const decisionGateId = String(input.decisionGateId || gate?.decisionGateId || 'missing');
  const reviewPacketId = String(input.reviewPacketId || gate?.reviewPacketId || 'missing');
  const sourceHeadSha = String(input.sourceHeadSha || gate?.sourceHeadSha || 'missing');
  if (!hasText(input.decisionVerifierId)) blockers.add('decision_verifier_id_missing');
  if (mockReviewDecisionGateId === 'missing' || !hasText(mockReviewDecisionGateId)) blockers.add('mock_review_decision_gate_id_missing');
  if (mockReviewPacketId === 'missing' || !hasText(mockReviewPacketId)) blockers.add('mock_review_packet_id_missing');
  if (verifierId === 'missing' || !hasText(verifierId)) blockers.add('verifier_id_missing');
  if (mockPlanId === 'missing' || !hasText(mockPlanId)) blockers.add('mock_plan_id_missing');
  if (sourceAccessPlanId === 'missing' || !hasText(sourceAccessPlanId)) blockers.add('source_access_plan_id_missing');
  if (decisionGateId === 'missing' || !hasText(decisionGateId)) blockers.add('decision_gate_id_missing');
  if (reviewPacketId === 'missing' || !hasText(reviewPacketId)) blockers.add('review_packet_id_missing');
  if (sourceHeadSha === 'missing' || !hasText(sourceHeadSha)) blockers.add('source_head_sha_missing');

  [...(gate?.blockers || []), ...(input.blockers || [])].forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  [...(gate?.needsReviewReasons || []), ...(input.needsReviewReasons || [])].forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });
  (input.deferredEntityTypes || []).forEach((entity) => {
    if (hasText(entity)) needsReview.add(`deferred_entity:${normalize(String(entity))}`);
  });
  if (input.manualDecisionRequired === false && (needsReview.size > 0 || (input.needsReviewReasons || []).length > 0)) {
    blockers.add('manual_decision_required_for_needs_review');
  }

  const verificationMode = evaluateMode(input, blockers);
  evaluateOwnerIntent(input, blockers, needsReview);
  evaluateDecisionOptions(input, blockers, missing);
  evaluateDecisionChecklist(input, blockers, needsReview);
  evaluateVerifierChecks(input, blockers);
  evaluateGateSummaries(input, blockers, needsReview);
  evaluateNextSafeAction(input, blockers);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const blockerList = compact(blockers);
  const needsReviewList = compact(needsReview);
  const status = determineStatus(blockers, missing, needsReview);
  const allowedDecisionOptions = unique((input.allowedDecisionOptions || gate?.allowedDecisionOptions || []).filter((option) => SAFE_ALLOWED_DECISION_OPTIONS.has(normalize(option))));
  const decisionChecklist = unique(input.decisionChecklist || gate?.decisionChecklist || []);

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_TRACE_LABEL,
    decisionVerifierId,
    mockReviewDecisionGateId,
    mockReviewPacketId,
    verifierId,
    mockPlanId,
    sourceAccessPlanId,
    decisionGateId,
    reviewPacketId,
    sourceHeadSha,
    mockReviewDecisionGateStatus: gateStatus,
    mockReviewDecisionGateKind: String(input.mockReviewDecisionGateKind || gate?.kind || 'missing'),
    mockReviewDecisionGateTraceLabel: String(input.mockReviewDecisionGateTraceLabel || gate?.traceLabel || 'missing'),
    verificationMode,
    mockOnlyDecisionVerified: input.mockOnlyDecisionVerified === true,
    noActualAccessVerified: input.noActualAccessVerified === true,
    noRuntimeReadinessVerified: input.noRuntimeReadinessVerified === true,
    allowedDecisionOptionsVerified: input.allowedDecisionOptionsVerified === true,
    forbiddenDecisionOptionsVerified: input.forbiddenDecisionOptionsVerified === true,
    decisionChecklistVerified: input.decisionChecklistVerified === true,
    ownerIntentVerified: input.ownerIntentVerified === true,
    manualDecisionBoundaryVerified: input.manualDecisionBoundaryVerified === true,
    nextSafeActionVerified: input.nextSafeActionVerified === true,
    verificationSummary: {
      mockOnlyDecision: input.mockOnlyDecisionVerified === true && input.expectedMockOnlyDecision !== false,
      noActualAccess: input.noActualAccessVerified === true && input.expectedNoActualAccess !== false,
      noRuntimeReadiness: input.noRuntimeReadinessVerified === true && input.expectedNoRuntimeReadiness !== false,
      allowedDecisionOptions: input.allowedDecisionOptionsVerified === true,
      forbiddenDecisionOptions: input.forbiddenDecisionOptionsVerified === true,
      decisionChecklist: input.decisionChecklistVerified === true,
      ownerIntent: input.ownerIntentVerified === true,
      manualDecisionBoundary: input.manualDecisionBoundaryVerified === true,
      nextSafeAction: input.nextSafeActionVerified === true,
      safeSummaryOnly: true
    },
    boundarySummary: buildBoundarySummary(input),
    allowedDecisionOptions,
    forbiddenDecisionOptions: unique(REQUIRED_FORBIDDEN_DECISION_OPTIONS),
    decisionChecklist,
    blockerCount: blockerList.length,
    blockers: blockerList,
    needsReviewReasonCount: needsReviewList.length,
    needsReviewReasons: needsReviewList,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')).length,
    unsafeReasonCodes: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')),
    nextSafeAction: determineNextSafeAction(blockers, missing, needsReview, status)
  };
}
