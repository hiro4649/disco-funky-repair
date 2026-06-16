import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_TRACE_LABEL =
  'd8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate' as const;

type MockReviewDecisionGateStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY';
type DecisionReadiness = 'blocked' | 'needs_review' | 'ready_for_mock_owner_decision_boundary';
type OwnerIntentMode = 'mock_review_decision_only' | 'fixture_review_decision_only' | 'plan_shape_decision_only' | 'owner_scope_decision_only';
type AllowedDecisionOption =
  | 'request_d8ai_mock_decision_verifier'
  | 'request_more_mock_review'
  | 'block_until_scope_repaired'
  | 'leave_open_no_source_access';
type ForbiddenDecisionOption =
  | 'run_actual_db_query'
  | 'run_actual_db_export'
  | 'open_source_access'
  | 'use_prisma_client'
  | 'read_database_url'
  | 'read_env'
  | 'write_file_export'
  | 'write_jsonl_export'
  | 'upload_artifact'
  | 'run_docker_smoke'
  | 'claim_staging_no_tx_pass'
  | 'claim_runtime_readiness'
  | 'claim_production_readiness';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_mock_review_packet'
  | 'provide_mock_review_decision_gate_id'
  | 'provide_mock_review_packet_id'
  | 'provide_mock_review_identifiers'
  | 'provide_safe_allowed_decision_options'
  | 'remove_forbidden_decision_option'
  | 'add_forbidden_decision_option_categories'
  | 'add_mock_decision_checklist'
  | 'require_manual_mock_owner_decision'
  | 'remove_forbidden_owner_intent_mode'
  | 'remove_forbidden_operator_review_mode'
  | 'remove_forbidden_review_audience'
  | 'remove_execution_review_purpose'
  | 'remove_forbidden_boundary_flag'
  | 'remove_unsafe_decision_label'
  | 'collect_operator_mock_review_decision_boundary_review'
  | 'prepare_pr_d8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier';

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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput = BoundaryFlagInput & {
  mockReviewPacket?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket | null;
  mockReviewPacketStatus?: string | null;
  mockReviewPacketKind?: string | null;
  mockReviewPacketTraceLabel?: string | null;
  mockReviewPacketId?: string | null;
  verifierId?: string | null;
  mockPlanId?: string | null;
  sourceAccessPlanId?: string | null;
  decisionGateId?: string | null;
  reviewPacketId?: string | null;
  sourceHeadSha?: string | null;
  mockReviewDecisionGateId?: string | null;
  ownerIntentMode?: string | null;
  decisionRequestLabel?: string | null;
  manualDecisionRequired?: boolean;
  allowedDecisionOptions?: string[];
  forbiddenDecisionOptions?: string[];
  decisionChecklist?: string[];
  operatorReviewMode?: string | null;
  reviewAudience?: string | null;
  reviewPurpose?: string | null;
  reviewSections?: string[];
  requiredReviewerChecks?: string[];
  notAuthorizedActions?: string[];
  verificationSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket['verificationSummary'] | null;
  mockOnlySummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket['mockOnlySummary'] | null;
  zeroRealRowsSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket['zeroRealRowsSummary'] | null;
  noActualAccessSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket['noActualAccessSummary'] | null;
  safeEvidenceOriginSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket['safeEvidenceOriginSummary'] | null;
  forbiddenFieldsSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket['forbiddenFieldsSummary'] | null;
  redactionPlanSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket['redactionPlanSummary'] | null;
  preconditionSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket['preconditionSummary'] | null;
  boundarySummary?: BoundaryFlagInput | null;
  blockers?: string[];
  needsReviewReasons?: string[];
  deferredEntityTypes?: string[];
  nextSafeAction?: string | null;
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_SCHEMA_VERSION;
  status: MockReviewDecisionGateStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_TRACE_LABEL;
  mockReviewDecisionGateId: string;
  mockReviewPacketId: string;
  verifierId: string;
  mockPlanId: string;
  sourceAccessPlanId: string;
  decisionGateId: string;
  reviewPacketId: string;
  sourceHeadSha: string;
  mockReviewPacketStatus: string;
  mockReviewPacketKind: string;
  mockReviewPacketTraceLabel: string;
  ownerIntentMode: string;
  decisionRequestLabel: string;
  manualDecisionRequired: boolean;
  allowedDecisionOptions: AllowedDecisionOption[];
  forbiddenDecisionOptions: ForbiddenDecisionOption[];
  decisionChecklist: string[];
  operatorReviewMode: string;
  reviewAudience: string;
  reviewPurpose: string;
  decisionReadiness: DecisionReadiness;
  mockOnlyDecisionSummary: { verified: boolean; safeSummaryOnly: true };
  zeroRealRowsDecisionSummary: { verified: boolean; safeSummaryOnly: true };
  noActualAccessDecisionSummary: { verified: boolean; safeSummaryOnly: true };
  forbiddenActionSummary: string[];
  boundarySummary: Required<BoundaryFlagInput> & { safeSummaryOnly: true };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const ALLOWED_OWNER_INTENT_MODES: OwnerIntentMode[] = [
  'mock_review_decision_only',
  'fixture_review_decision_only',
  'plan_shape_decision_only',
  'owner_scope_decision_only'
];
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
const ALLOWED_OPERATOR_REVIEW_MODES = new Set(['mock_review_only', 'fixture_review_only', 'plan_shape_review_only', 'owner_scope_review_only']);
const ALLOWED_REVIEW_AUDIENCES = new Set(['owner', 'operator', 'reviewer', 'codex_summary_only']);
const FORBIDDEN_REVIEW_AUDIENCES = new Set(['runtime_worker', 'scheduler', 'public_user', 'frontend', 'admin_action_runner']);
const SAFE_ALLOWED_DECISION_OPTIONS: AllowedDecisionOption[] = [
  'request_d8ai_mock_decision_verifier',
  'request_more_mock_review',
  'block_until_scope_repaired',
  'leave_open_no_source_access'
];
const REQUIRED_FORBIDDEN_DECISION_OPTIONS: ForbiddenDecisionOption[] = [
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
const UNSAFE_LABELS = ['secret', 'privatekey', 'rawenv', 'rawlog', 'rawpayload', 'rawendpoint', 'endpoint', 'privatepath', 'localpath', 'databaseurl', 'dburl'];
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
const unique = <T extends string>(values: Iterable<T>): T[] => Array.from(new Set(Array.from(values).filter(Boolean))).sort();

function addBoundaryFlagBlockers(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput,
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
    if (input[flag] === true || input.boundaryFlags?.[flag] === true || input.boundarySummary?.[flag] === true || input.mockReviewPacket?.boundarySummary?.[flag] === true) {
      blockers.add(code);
    }
  });
}

function buildBoundarySummary(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput): Required<BoundaryFlagInput> & { safeSummaryOnly: true } {
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
    ...(input.mockReviewPacket?.boundarySummary || {}),
    ...(input.boundarySummary || {}),
    ...(input.boundaryFlags || {}),
    safeSummaryOnly: true
  };
}

function collectUnsafeLabels(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput, blockers: Set<string>): void {
  const labels = [
    input.mockReviewDecisionGateId,
    input.mockReviewPacketId,
    input.verifierId,
    input.mockPlanId,
    input.sourceAccessPlanId,
    input.decisionGateId,
    input.reviewPacketId,
    input.ownerIntentMode,
    input.decisionRequestLabel,
    input.reviewPurpose,
    input.nextSafeAction,
    ...(input.allowedDecisionOptions || []),
    ...(input.decisionChecklist || []),
    ...(input.reviewSections || []),
    ...(input.requiredReviewerChecks || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const action = normalize(label);
    const safeNegativeLabel = action.includes('no_actual_access')
      || action.includes('no_db')
      || action.includes('no_export')
      || action.includes('no_source_access')
      || action.includes('not_authorized')
      || action.includes('confirm_no')
      || action.includes('mock_review')
      || action.includes('mock_plan')
      || action.includes('source_access_plan')
      || action.includes('review_packet')
      || action.includes('source_head')
      || action.includes('verifier')
      || action.includes('decision_gate')
      || action.includes('source_candidate')
      || action.includes('actual_safe_row_export_read_only')
      || action === 'prepare_pr_d8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier';
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_mock_review_decision_label');
    if (!safeNegativeLabel && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
    }
  });
}

function evaluateOwnerIntent(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput, blockers: Set<string>, needsReview: Set<string>): string {
  const mode = normalize(String(input.ownerIntentMode || 'missing'));
  if (!input.ownerIntentMode) needsReview.add('owner_intent_mode_missing');
  else if (!(ALLOWED_OWNER_INTENT_MODES as readonly string[]).includes(mode)) blockers.add('owner_intent_mode_unsupported');
  if (FORBIDDEN_OWNER_INTENT_MODES.has(mode)) blockers.add('owner_intent_mode_forbidden');
  return mode;
}

function evaluateReviewSurface(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput, blockers: Set<string>, needsReview: Set<string>): void {
  const mode = normalize(String(input.operatorReviewMode || input.mockReviewPacket?.operatorReviewMode || 'missing'));
  const audience = normalize(String(input.reviewAudience || input.mockReviewPacket?.reviewAudience || 'missing'));
  const purpose = normalizeLabel(String(input.reviewPurpose || input.mockReviewPacket?.reviewPurpose || ''));
  if (!ALLOWED_OPERATOR_REVIEW_MODES.has(mode)) blockers.add('operator_review_mode_unsupported');
  if (!ALLOWED_REVIEW_AUDIENCES.has(audience)) blockers.add('review_audience_unsupported');
  if (FORBIDDEN_REVIEW_AUDIENCES.has(audience)) blockers.add('review_audience_forbidden');
  if (FORBIDDEN_ACTION_LABELS.some((forbidden) => purpose.includes(normalizeLabel(forbidden)))) blockers.add('review_purpose_execution_forbidden');
  if ((input.reviewSections || input.mockReviewPacket?.reviewSections || []).length === 0) needsReview.add('review_sections_missing');
  if ((input.requiredReviewerChecks || input.mockReviewPacket?.requiredReviewerChecks || []).length === 0) needsReview.add('required_reviewer_checks_missing');
}

function evaluateDecisionOptions(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput,
  blockers: Set<string>,
  missing: Set<string>
): void {
  const allowed = input.allowedDecisionOptions || [];
  if (allowed.length === 0) {
    blockers.add('allowed_decision_options_missing');
    missing.add('allowed_decision_options');
  }
  allowed.forEach((option) => {
    const normalized = normalize(option);
    if (!(SAFE_ALLOWED_DECISION_OPTIONS as readonly string[]).includes(normalized)) blockers.add('unsupported_allowed_decision_option');
    if ((REQUIRED_FORBIDDEN_DECISION_OPTIONS as readonly string[]).includes(normalized)) blockers.add('forbidden_allowed_decision_option');
  });

  const forbidden = new Set((input.forbiddenDecisionOptions || []).map(normalize));
  if (forbidden.size === 0) blockers.add('forbidden_decision_options_missing');
  REQUIRED_FORBIDDEN_DECISION_OPTIONS.forEach((option) => {
    if (!forbidden.has(option)) {
      blockers.add(`forbidden_decision_option_missing:${option}`);
      missing.add(`forbidden_decision_option:${option}`);
    }
  });
}

function evaluateDecisionChecklist(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput,
  blockers: Set<string>,
  needsReview: Set<string>
): void {
  const checklist = input.decisionChecklist || [];
  const text = checklist.join(' ').toLowerCase();
  if (checklist.length === 0) blockers.add('decision_checklist_missing');
  REQUIRED_DECISION_CHECKS.forEach((item) => {
    if (!text.includes(item)) needsReview.add(`decision_checklist_incomplete:${normalize(item)}`);
  });
}

function evaluateSummaries(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput, blockers: Set<string>, needsReview: Set<string>): void {
  const packet = input.mockReviewPacket;
  const verification = (input.verificationSummary || packet?.verificationSummary) as Record<string, unknown> | undefined;
  if (verification?.sourceAccessAuthorized === true) blockers.add('source_access_authorized_forbidden');
  if (verification?.actualDbReadAuthorized === true) blockers.add('actual_db_read_authorized_forbidden');
  if (verification?.actualDbExportAuthorized === true) blockers.add('actual_db_export_authorized_forbidden');
  if (verification?.jsonlExportAuthorized === true) blockers.add('jsonl_export_authorized_forbidden');
  if (verification?.runtimeReady === true) blockers.add('runtime_readiness_claim_forbidden');
  if (verification?.stagingReady === true) blockers.add('staging_no_tx_pass_claim_forbidden');
  if (verification?.productionReady === true) blockers.add('production_readiness_claim_forbidden');
  if ((input.mockOnlySummary?.verified ?? packet?.mockOnlySummary.verified) !== true) blockers.add('mock_only_summary_not_verified');
  if ((input.zeroRealRowsSummary?.verified ?? packet?.zeroRealRowsSummary.verified) !== true) blockers.add('zero_real_rows_summary_not_verified');
  if ((input.noActualAccessSummary?.verified ?? packet?.noActualAccessSummary.verified) !== true) blockers.add('no_actual_access_summary_not_verified');
  const redaction = input.redactionPlanSummary?.verified ?? packet?.redactionPlanSummary.verified;
  if (redaction === 'unknown') needsReview.add('redaction_plan_verification_unknown');
}

function determineStatus(blockers: Set<string>, missing: Set<string>, needsReview: Set<string>): MockReviewDecisionGateStatus {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || needsReview.size > 0) return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY';
}

function determineNextSafeAction(
  blockers: Set<string>,
  missing: Set<string>,
  needsReview: Set<string>,
  status: MockReviewDecisionGateStatus
): NextSafeAction {
  if (blockers.has('mock_review_packet_missing') || blockers.has('mock_review_packet_not_ready')) return 'build_actual_safe_row_export_read_only_source_candidate_mock_review_packet';
  if (blockers.has('mock_review_decision_gate_id_missing')) return 'provide_mock_review_decision_gate_id';
  if (blockers.has('mock_review_packet_id_missing')) return 'provide_mock_review_packet_id';
  if (blockers.has('verifier_id_missing') || blockers.has('mock_plan_id_missing') || blockers.has('source_access_plan_id_missing') || blockers.has('decision_gate_id_missing') || blockers.has('review_packet_id_missing') || blockers.has('source_head_sha_missing')) return 'provide_mock_review_identifiers';
  if (blockers.has('allowed_decision_options_missing') || missing.has('allowed_decision_options')) return 'provide_safe_allowed_decision_options';
  if (blockers.has('forbidden_allowed_decision_option') || blockers.has('unsupported_allowed_decision_option')) return 'remove_forbidden_decision_option';
  if (Array.from(blockers).some((code) => code.startsWith('forbidden_decision_option_missing'))) return 'add_forbidden_decision_option_categories';
  if (blockers.has('decision_checklist_missing')) return 'add_mock_decision_checklist';
  if (blockers.has('manual_decision_required_for_needs_review')) return 'require_manual_mock_owner_decision';
  if (blockers.has('owner_intent_mode_forbidden') || blockers.has('owner_intent_mode_unsupported')) return 'remove_forbidden_owner_intent_mode';
  if (blockers.has('operator_review_mode_unsupported')) return 'remove_forbidden_operator_review_mode';
  if (blockers.has('review_audience_forbidden') || blockers.has('review_audience_unsupported')) return 'remove_forbidden_review_audience';
  if (blockers.has('review_purpose_execution_forbidden')) return 'remove_execution_review_purpose';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_mock_review_decision_label') || blockers.has('public_readiness_or_execution_overclaim')) return 'remove_unsafe_decision_label';
  if (needsReview.size > 0 || missing.size > 0) return 'collect_operator_mock_review_decision_boundary_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY') {
    return 'prepare_pr_d8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier';
  }
  return 'collect_operator_mock_review_decision_boundary_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGateInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionGate {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const needsReview = new Set<string>();
  const packet = input.mockReviewPacket;
  const packetStatus = String(input.mockReviewPacketStatus || packet?.status || 'missing');
  if (!packet && !hasText(input.mockReviewPacketStatus)) blockers.add('mock_review_packet_missing');
  if (packetStatus !== 'SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY') {
    if (packetStatus === 'NEEDS_REVIEW') needsReview.add('mock_review_packet_needs_review');
    else blockers.add('mock_review_packet_not_ready');
  }

  const mockReviewDecisionGateId = String(input.mockReviewDecisionGateId || 'missing');
  const mockReviewPacketId = String(input.mockReviewPacketId || packet?.mockReviewPacketId || 'missing');
  const verifierId = String(input.verifierId || packet?.verifierId || 'missing');
  const mockPlanId = String(input.mockPlanId || packet?.mockPlanId || 'missing');
  const sourceAccessPlanId = String(input.sourceAccessPlanId || packet?.sourceAccessPlanId || 'missing');
  const decisionGateId = String(input.decisionGateId || packet?.decisionGateId || 'missing');
  const reviewPacketId = String(input.reviewPacketId || packet?.reviewPacketId || 'missing');
  const sourceHeadSha = String(input.sourceHeadSha || packet?.sourceHeadSha || 'missing');
  if (!hasText(input.mockReviewDecisionGateId)) blockers.add('mock_review_decision_gate_id_missing');
  if (mockReviewPacketId === 'missing' || !hasText(mockReviewPacketId)) blockers.add('mock_review_packet_id_missing');
  if (verifierId === 'missing' || !hasText(verifierId)) blockers.add('verifier_id_missing');
  if (mockPlanId === 'missing' || !hasText(mockPlanId)) blockers.add('mock_plan_id_missing');
  if (sourceAccessPlanId === 'missing' || !hasText(sourceAccessPlanId)) blockers.add('source_access_plan_id_missing');
  if (decisionGateId === 'missing' || !hasText(decisionGateId)) blockers.add('decision_gate_id_missing');
  if (reviewPacketId === 'missing' || !hasText(reviewPacketId)) blockers.add('review_packet_id_missing');
  if (sourceHeadSha === 'missing' || !hasText(sourceHeadSha)) blockers.add('source_head_sha_missing');

  [...(packet?.blockers || []), ...(input.blockers || [])].forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  [...(packet?.needsReviewReasons || []), ...(input.needsReviewReasons || [])].forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });
  (input.deferredEntityTypes || []).forEach((entity) => {
    if (hasText(entity)) needsReview.add(`deferred_entity:${normalize(String(entity))}`);
  });

  if (input.manualDecisionRequired === false && (needsReview.size > 0 || (input.needsReviewReasons || []).length > 0)) {
    blockers.add('manual_decision_required_for_needs_review');
  }
  if (input.manualDecisionRequired === undefined) needsReview.add('manual_decision_requirement_unspecified');

  const ownerIntentMode = evaluateOwnerIntent(input, blockers, needsReview);
  evaluateReviewSurface(input, blockers, needsReview);
  evaluateDecisionOptions(input, blockers, missing);
  evaluateDecisionChecklist(input, blockers, needsReview);
  evaluateSummaries(input, blockers, needsReview);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const nextAction = String(input.nextSafeAction || '');
  if (nextAction && nextAction !== 'prepare_pr_d8ai_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier') {
    const label = normalizeLabel(nextAction);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => label.includes(normalizeLabel(forbidden)))) blockers.add('next_safe_action_forbidden');
  }

  const blockerList = compact(blockers);
  const needsReviewList = compact(needsReview);
  const status = determineStatus(blockers, missing, needsReview);
  const safeOptions = unique((input.allowedDecisionOptions || []).map((option) => normalize(option)).filter((option): option is AllowedDecisionOption => (
    (SAFE_ALLOWED_DECISION_OPTIONS as readonly string[]).includes(option)
  )));
  const forbiddenOptions = unique(REQUIRED_FORBIDDEN_DECISION_OPTIONS);

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_TRACE_LABEL,
    mockReviewDecisionGateId,
    mockReviewPacketId,
    verifierId,
    mockPlanId,
    sourceAccessPlanId,
    decisionGateId,
    reviewPacketId,
    sourceHeadSha,
    mockReviewPacketStatus: packetStatus,
    mockReviewPacketKind: String(input.mockReviewPacketKind || packet?.kind || 'missing'),
    mockReviewPacketTraceLabel: String(input.mockReviewPacketTraceLabel || packet?.traceLabel || 'missing'),
    ownerIntentMode,
    decisionRequestLabel: String(input.decisionRequestLabel || 'mock review decision boundary only'),
    manualDecisionRequired: input.manualDecisionRequired !== false,
    allowedDecisionOptions: safeOptions,
    forbiddenDecisionOptions: forbiddenOptions,
    decisionChecklist: unique(input.decisionChecklist || []),
    operatorReviewMode: normalize(String(input.operatorReviewMode || packet?.operatorReviewMode || 'missing')),
    reviewAudience: normalize(String(input.reviewAudience || packet?.reviewAudience || 'missing')),
    reviewPurpose: String(input.reviewPurpose || packet?.reviewPurpose || 'mock review decision gate only'),
    decisionReadiness: status === 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY'
      ? 'ready_for_mock_owner_decision_boundary'
      : status === 'NEEDS_REVIEW'
        ? 'needs_review'
        : 'blocked',
    mockOnlyDecisionSummary: { verified: input.mockOnlySummary?.verified ?? packet?.mockOnlySummary.verified ?? false, safeSummaryOnly: true },
    zeroRealRowsDecisionSummary: { verified: input.zeroRealRowsSummary?.verified ?? packet?.zeroRealRowsSummary.verified ?? false, safeSummaryOnly: true },
    noActualAccessDecisionSummary: { verified: input.noActualAccessSummary?.verified ?? packet?.noActualAccessSummary.verified ?? false, safeSummaryOnly: true },
    forbiddenActionSummary: forbiddenOptions,
    boundarySummary: buildBoundarySummary(input),
    blockerCount: blockerList.length,
    blockers: blockerList,
    needsReviewReasonCount: needsReviewList.length,
    needsReviewReasons: needsReviewList,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')).length,
    unsafeReasonCodes: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')),
    nextSafeAction: determineNextSafeAction(blockers, missing, needsReview, status)
  };
}
