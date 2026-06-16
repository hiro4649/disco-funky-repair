import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_TRACE_LABEL =
  'd8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier' as const;

type Status =
  | 'BLOCKED'
  | 'NEEDS_REVIEW'
  | 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY';
type VerificationMode =
  | 'mock_decision_packet_static_verification'
  | 'fixture_decision_packet_verification'
  | 'plan_shape_decision_packet_verification'
  | 'review_only_packet_verification';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet'
  | 'provide_mock_review_decision_packet_verifier_id'
  | 'provide_mock_review_decision_packet_identifiers'
  | 'remove_forbidden_verification_mode'
  | 'remove_forbidden_packet_audience'
  | 'remove_forbidden_packet_purpose'
  | 'add_mock_review_decision_packet_sections'
  | 'add_owner_decision_summary'
  | 'add_operator_decision_summary'
  | 'add_not_authorized_action_categories'
  | 'add_required_preconditions'
  | 'add_mock_decision_packet_checklist'
  | 'verify_mock_review_decision_packet_boundary'
  | 'remove_forbidden_boundary_flag'
  | 'remove_unsafe_decision_packet_verifier_label'
  | 'collect_operator_mock_review_decision_packet_verifier_review'
  | 'prepare_pr_d8al_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary';

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

type SafeSummary = { verified: boolean; safeSummaryOnly: true };

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput = BoundaryFlagInput & {
  mockReviewDecisionPacket?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket | null;
  mockReviewDecisionPacketStatus?: string | null;
  mockReviewDecisionPacketKind?: string | null;
  mockReviewDecisionPacketTraceLabel?: string | null;
  packetVerifierId?: string | null;
  mockReviewDecisionPacketId?: string | null;
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
  packetAudience?: string | null;
  packetPurpose?: string | null;
  packetSections?: string[];
  ownerDecisionSummary?: string | null;
  operatorDecisionSummary?: string | null;
  notAuthorizedActions?: string[];
  requiredPreconditions?: string[];
  packetChecklist?: string[];
  mockOnlyDecisionSummary?: SafeSummary | null;
  noActualAccessSummary?: SafeSummary | null;
  noRuntimeReadinessSummary?: SafeSummary | null;
  packetCompletenessVerified?: boolean;
  audienceVerified?: boolean;
  purposeVerified?: boolean;
  notAuthorizedActionsVerified?: boolean;
  requiredPreconditionsVerified?: boolean;
  packetChecklistVerified?: boolean;
  mockOnlyBoundaryVerified?: boolean;
  noActualAccessBoundaryVerified?: boolean;
  noRuntimeReadinessBoundaryVerified?: boolean;
  nextSafeActionVerified?: boolean;
  boundarySummary?: BoundaryFlagInput | null;
  blockers?: string[];
  needsReviewReasons?: string[];
  deferredEntityTypes?: string[];
  nextSafeAction?: string | null;
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_SCHEMA_VERSION;
  status: Status;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_TRACE_LABEL;
  packetVerifierId: string;
  mockReviewDecisionPacketId: string;
  decisionVerifierId: string;
  mockReviewDecisionGateId: string;
  mockReviewPacketId: string;
  verifierId: string;
  mockPlanId: string;
  sourceAccessPlanId: string;
  decisionGateId: string;
  reviewPacketId: string;
  sourceHeadSha: string;
  mockReviewDecisionPacketStatus: string;
  mockReviewDecisionPacketKind: string;
  mockReviewDecisionPacketTraceLabel: string;
  verificationMode: string;
  packetAudience: string;
  packetPurpose: string;
  packetCompletenessVerified: boolean;
  audienceVerified: boolean;
  purposeVerified: boolean;
  notAuthorizedActionsVerified: boolean;
  requiredPreconditionsVerified: boolean;
  packetChecklistVerified: boolean;
  mockOnlyBoundaryVerified: boolean;
  noActualAccessBoundaryVerified: boolean;
  noRuntimeReadinessBoundaryVerified: boolean;
  nextSafeActionVerified: boolean;
  verificationSummary: {
    packetCompleteness: boolean;
    audience: boolean;
    purpose: boolean;
    notAuthorizedActions: boolean;
    requiredPreconditions: boolean;
    packetChecklist: boolean;
    mockOnlyBoundary: boolean;
    noActualAccessBoundary: boolean;
    noRuntimeReadinessBoundary: boolean;
    nextSafeAction: boolean;
    safeSummaryOnly: true;
  };
  packetSections: string[];
  ownerDecisionSummary: string;
  operatorDecisionSummary: string;
  notAuthorizedActions: string[];
  requiredPreconditions: string[];
  packetChecklist: string[];
  mockOnlyDecisionSummary: SafeSummary;
  noActualAccessSummary: SafeSummary;
  noRuntimeReadinessSummary: SafeSummary;
  boundarySummary: Required<BoundaryFlagInput> & { safeSummaryOnly: true };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const ALLOWED_VERIFICATION_MODES: VerificationMode[] = [
  'mock_decision_packet_static_verification',
  'fixture_decision_packet_verification',
  'plan_shape_decision_packet_verification',
  'review_only_packet_verification'
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
const ALLOWED_PACKET_AUDIENCES = new Set(['owner', 'operator', 'reviewer', 'codex_summary_only']);
const ALLOWED_PACKET_PURPOSES = new Set([
  'mock_decision_packet_only',
  'fixture_decision_packet_only',
  'plan_shape_decision_packet_only',
  'owner_scope_decision_packet_only'
]);
const REQUIRED_NOT_AUTHORIZED_ACTIONS = [
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
const REQUIRED_PRECONDITIONS = [
  'future_owner_confirmation_required',
  'same_head_remote_quality_gate_required'
];
const REQUIRED_CHECKLIST_ITEMS = [
  'no actual access',
  'no db',
  'no export',
  'no runtime readiness'
];
const REQUIRED_PACKET_SECTIONS = [
  'scope_summary',
  'verified_mock_decision_summary',
  'owner_decision_summary',
  'operator_decision_summary',
  'not_authorized_summary',
  'next_safe_action'
];
const D8AJ_NEXT_ACTION =
  'prepare_pr_d8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier';
const SAFE_NEXT_ACTION_READY =
  'prepare_pr_d8al_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary';
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
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort().slice(0, 22);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort();

function requireText(value: unknown, code: string, blockers: Set<string>): string {
  if (!hasText(value)) blockers.add(code);
  return hasText(value) ? String(value) : 'missing';
}

function safeSummary(value: SafeSummary | null | undefined, fallback = false): SafeSummary {
  return { verified: value?.verified === true || fallback, safeSummaryOnly: true };
}

function buildBoundarySummary(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput
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
    ...(input.mockReviewDecisionPacket?.boundarySummary || {}),
    ...(input.boundarySummary || {}),
    ...(input.boundaryFlags || {}),
    safeSummaryOnly: true
  };
}

function addBoundaryFlagBlockers(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput,
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
    if (input[flag] === true
      || input.boundaryFlags?.[flag] === true
      || input.boundarySummary?.[flag] === true
      || input.mockReviewDecisionPacket?.boundarySummary?.[flag] === true) {
      blockers.add(code);
    }
  });
}

function collectUnsafeLabels(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput,
  blockers: Set<string>
): void {
  const labels = [
    input.packetVerifierId,
    input.mockReviewDecisionPacketId,
    input.decisionVerifierId,
    input.mockReviewDecisionGateId,
    input.mockReviewPacketId,
    input.verifierId,
    input.mockPlanId,
    input.sourceAccessPlanId,
    input.decisionGateId,
    input.reviewPacketId,
    input.packetAudience,
    input.packetPurpose,
    input.verificationMode,
    input.ownerDecisionSummary,
    input.operatorDecisionSummary,
    input.nextSafeAction,
    ...(input.packetSections || []),
    ...(input.requiredPreconditions || []),
    ...(input.packetChecklist || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const action = normalize(label);
    const explicitReadinessOverclaim = action.includes('runtime_ready')
      || action.includes('staging_ready')
      || action.includes('production_ready')
      || normalized.includes('runtimeready')
      || normalized.includes('stagingready')
      || normalized.includes('productionready');
    if (explicitReadinessOverclaim) {
      blockers.add('public_readiness_or_execution_overclaim');
      return;
    }
    const isSafeNegative = action.includes('no_actual_access')
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
      || action.includes('decision_packet')
      || action.includes('source_candidate')
      || action.includes('actual_safe_row_export_read_only')
      || action === D8AJ_NEXT_ACTION
      || action === SAFE_NEXT_ACTION_READY;
    if (!isSafeNegative && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
      return;
    }
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_mock_review_decision_packet_verifier_label');
  });
}

function evaluatePacketStatus(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput,
  blockers: Set<string>,
  needsReview: Set<string>
): string {
  const packet = input.mockReviewDecisionPacket;
  const status = String(input.mockReviewDecisionPacketStatus || packet?.status || 'missing');
  if (!packet && !hasText(input.mockReviewDecisionPacketStatus)) blockers.add('mock_review_decision_packet_missing');
  if (status !== 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY') {
    if (status === 'NEEDS_REVIEW') needsReview.add('mock_review_decision_packet_needs_review');
    else blockers.add('mock_review_decision_packet_not_ready');
  }
  [...(packet?.blockers || []), ...(input.blockers || [])].forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  [...(packet?.needsReviewReasons || []), ...(input.needsReviewReasons || [])].forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });
  (input.deferredEntityTypes || []).forEach((entity) => {
    if (hasText(entity)) needsReview.add(`deferred_entity:${normalize(String(entity))}`);
  });
  return status;
}

function evaluateVerificationMode(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput, blockers: Set<string>): string {
  const mode = normalize(String(input.verificationMode || 'missing'));
  if (!(ALLOWED_VERIFICATION_MODES as readonly string[]).includes(mode)) blockers.add('verification_mode_unsupported');
  if (FORBIDDEN_VERIFICATION_MODES.has(mode)) blockers.add('verification_mode_forbidden');
  return mode;
}

function evaluateAudiencePurpose(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput,
  blockers: Set<string>,
  needsReview: Set<string>
): { packetAudience: string; packetPurpose: string } {
  const packet = input.mockReviewDecisionPacket;
  const packetAudience = input.packetAudience === null ? 'missing' : normalize(String(input.packetAudience || packet?.packetAudience || 'missing'));
  const packetPurpose = input.packetPurpose === null ? 'missing' : normalize(String(input.packetPurpose || packet?.packetPurpose || 'missing'));
  if (packetAudience === 'missing') needsReview.add('packet_audience_missing');
  else if (!ALLOWED_PACKET_AUDIENCES.has(packetAudience)) blockers.add('packet_audience_forbidden');
  if (packetPurpose === 'missing') needsReview.add('packet_purpose_missing');
  else if (!ALLOWED_PACKET_PURPOSES.has(packetPurpose)) blockers.add('packet_purpose_forbidden');
  if (FORBIDDEN_ACTION_LABELS.some((label) => normalizeLabel(packetPurpose).includes(label))) blockers.add('packet_purpose_forbidden');
  return { packetAudience, packetPurpose };
}

function evaluateRequiredList(
  provided: string[] | undefined,
  fallback: string[] | undefined,
  required: string[],
  absentCode: string,
  missingPrefix: string,
  blockers: Set<string>
): string[] {
  const values = provided || fallback || [];
  const normalized = new Set(values.map(normalize));
  if (values.length === 0) blockers.add(absentCode);
  required.forEach((item) => {
    if (!normalized.has(normalize(item))) blockers.add(`${missingPrefix}:${normalize(item)}`);
  });
  return unique(values);
}

function evaluatePacketSections(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput,
  blockers: Set<string>,
  needsReview: Set<string>
): string[] {
  const values = input.packetSections || input.mockReviewDecisionPacket?.packetSections || [];
  const sections = evaluateRequiredList(values, [], REQUIRED_PACKET_SECTIONS, 'packet_sections_missing', 'packet_section_missing', blockers);
  if (values.length > 0 && values.length < REQUIRED_PACKET_SECTIONS.length) {
    [...blockers].forEach((code) => {
      if (code.startsWith('packet_section_missing:')) blockers.delete(code);
    });
    needsReview.add('packet_sections_incomplete');
  }
  return sections;
}

function evaluatePacketChecklist(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput,
  blockers: Set<string>,
  needsReview: Set<string>
): string[] {
  const values = input.packetChecklist || input.mockReviewDecisionPacket?.packetChecklist || [];
  const text = values.join(' ').toLowerCase();
  if (values.length === 0) blockers.add('packet_checklist_missing');
  REQUIRED_CHECKLIST_ITEMS.forEach((item) => {
    if (!text.includes(item)) {
      if (values.length <= 1) needsReview.add(`packet_checklist_incomplete:${normalize(item)}`);
      else blockers.add(`packet_checklist_missing_required:${normalize(item)}`);
    }
  });
  return unique(values);
}

function evaluateVerificationBooleans(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput,
  blockers: Set<string>
): void {
  const checks: Array<[boolean | undefined, string]> = [
    [input.packetCompletenessVerified, 'packet_completeness_not_verified'],
    [input.audienceVerified, 'audience_not_verified'],
    [input.purposeVerified, 'purpose_not_verified'],
    [input.notAuthorizedActionsVerified, 'not_authorized_actions_not_verified'],
    [input.requiredPreconditionsVerified, 'required_preconditions_not_verified'],
    [input.packetChecklistVerified, 'packet_checklist_not_verified'],
    [input.mockOnlyBoundaryVerified, 'mock_only_boundary_not_verified'],
    [input.noActualAccessBoundaryVerified, 'no_actual_access_boundary_not_verified'],
    [input.noRuntimeReadinessBoundaryVerified, 'no_runtime_readiness_boundary_not_verified'],
    [input.nextSafeActionVerified, 'next_safe_action_not_verified']
  ];
  checks.forEach(([value, code]) => {
    if (value !== true) blockers.add(code);
  });
}

function evaluateSummaries(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput,
  blockers: Set<string>
): void {
  const packet = input.mockReviewDecisionPacket;
  if (!(input.mockOnlyDecisionSummary?.verified === true || packet?.mockOnlyDecisionSummary.verified === true)) blockers.add('mock_only_decision_summary_not_verified');
  if (!(input.noActualAccessSummary?.verified === true || packet?.noActualAccessSummary.verified === true)) blockers.add('no_actual_access_summary_not_verified');
  if (!(input.noRuntimeReadinessSummary?.verified === true || packet?.noRuntimeReadinessSummary.verified === true)) blockers.add('no_runtime_readiness_summary_not_verified');
}

function evaluateNextSafeAction(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput,
  blockers: Set<string>
): void {
  const action = String(input.nextSafeAction || input.mockReviewDecisionPacket?.nextSafeAction || '');
  if (!action) {
    blockers.add('next_safe_action_missing');
    return;
  }
  if (action !== D8AJ_NEXT_ACTION && action !== SAFE_NEXT_ACTION_READY) {
    const label = normalizeLabel(action);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => label.includes(normalizeLabel(forbidden)))) blockers.add('next_safe_action_forbidden');
  }
}

function determineStatus(blockers: Set<string>, needsReview: Set<string>): Status {
  if (blockers.size > 0) return 'BLOCKED';
  if (needsReview.size > 0) return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY';
}

function determineNextSafeAction(blockers: Set<string>, needsReview: Set<string>, status: Status): NextSafeAction {
  if (blockers.has('mock_review_decision_packet_missing') || blockers.has('mock_review_decision_packet_not_ready')) return 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet';
  if (blockers.has('packet_verifier_id_missing')) return 'provide_mock_review_decision_packet_verifier_id';
  if (Array.from(blockers).some((code) => code.endsWith('_id_missing') || code === 'source_head_sha_missing')) return 'provide_mock_review_decision_packet_identifiers';
  if (blockers.has('verification_mode_forbidden') || blockers.has('verification_mode_unsupported')) return 'remove_forbidden_verification_mode';
  if (blockers.has('packet_audience_forbidden')) return 'remove_forbidden_packet_audience';
  if (blockers.has('packet_purpose_forbidden')) return 'remove_forbidden_packet_purpose';
  if (blockers.has('packet_sections_missing') || Array.from(blockers).some((code) => code.startsWith('packet_section_missing'))) return 'add_mock_review_decision_packet_sections';
  if (blockers.has('owner_decision_summary_missing')) return 'add_owner_decision_summary';
  if (blockers.has('operator_decision_summary_missing')) return 'add_operator_decision_summary';
  if (blockers.has('not_authorized_actions_missing') || Array.from(blockers).some((code) => code.startsWith('not_authorized_action_missing'))) return 'add_not_authorized_action_categories';
  if (blockers.has('required_preconditions_missing') || Array.from(blockers).some((code) => code.startsWith('required_precondition_missing'))) return 'add_required_preconditions';
  if (blockers.has('packet_checklist_missing') || Array.from(blockers).some((code) => code.startsWith('packet_checklist_missing_required'))) return 'add_mock_decision_packet_checklist';
  if (Array.from(blockers).some((code) => code.endsWith('_not_verified') || code.endsWith('_summary_not_verified'))) return 'verify_mock_review_decision_packet_boundary';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_mock_review_decision_packet_verifier_label') || blockers.has('public_readiness_or_execution_overclaim')) return 'remove_unsafe_decision_packet_verifier_label';
  if (needsReview.size > 0) return 'collect_operator_mock_review_decision_packet_verifier_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY') return SAFE_NEXT_ACTION_READY;
  return 'collect_operator_mock_review_decision_packet_verifier_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifierInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier {
  const blockers = new Set<string>();
  const needsReview = new Set<string>();
  const packet = input.mockReviewDecisionPacket;
  const mockReviewDecisionPacketStatus = evaluatePacketStatus(input, blockers, needsReview);
  const packetVerifierId = requireText(input.packetVerifierId, 'packet_verifier_id_missing', blockers);
  const mockReviewDecisionPacketId = requireText(input.mockReviewDecisionPacketId || packet?.mockReviewDecisionPacketId, 'mock_review_decision_packet_id_missing', blockers);
  const decisionVerifierId = requireText(input.decisionVerifierId || packet?.decisionVerifierId, 'decision_verifier_id_missing', blockers);
  const mockReviewDecisionGateId = requireText(input.mockReviewDecisionGateId || packet?.mockReviewDecisionGateId, 'mock_review_decision_gate_id_missing', blockers);
  const mockReviewPacketId = requireText(input.mockReviewPacketId || packet?.mockReviewPacketId, 'mock_review_packet_id_missing', blockers);
  const verifierId = requireText(input.verifierId || packet?.verifierId, 'verifier_id_missing', blockers);
  const mockPlanId = requireText(input.mockPlanId || packet?.mockPlanId, 'mock_plan_id_missing', blockers);
  const sourceAccessPlanId = requireText(input.sourceAccessPlanId || packet?.sourceAccessPlanId, 'source_access_plan_id_missing', blockers);
  const decisionGateId = requireText(input.decisionGateId || packet?.decisionGateId, 'decision_gate_id_missing', blockers);
  const reviewPacketId = requireText(input.reviewPacketId || packet?.reviewPacketId, 'review_packet_id_missing', blockers);
  const sourceHeadSha = requireText(input.sourceHeadSha || packet?.sourceHeadSha, 'source_head_sha_missing', blockers);
  const verificationMode = evaluateVerificationMode(input, blockers);
  const { packetAudience, packetPurpose } = evaluateAudiencePurpose(input, blockers, needsReview);
  const packetSections = evaluatePacketSections(input, blockers, needsReview);
  const ownerDecisionSummary = requireText(input.ownerDecisionSummary ?? packet?.ownerDecisionSummary, 'owner_decision_summary_missing', blockers);
  const operatorDecisionSummary = requireText(input.operatorDecisionSummary ?? packet?.operatorDecisionSummary, 'operator_decision_summary_missing', blockers);
  const notAuthorizedActions = evaluateRequiredList(
    input.notAuthorizedActions,
    packet?.notAuthorizedActions,
    REQUIRED_NOT_AUTHORIZED_ACTIONS,
    'not_authorized_actions_missing',
    'not_authorized_action_missing',
    blockers
  );
  const requiredPreconditions = evaluateRequiredList(
    input.requiredPreconditions,
    packet?.requiredPreconditions,
    REQUIRED_PRECONDITIONS,
    'required_preconditions_missing',
    'required_precondition_missing',
    blockers
  );
  const packetChecklist = evaluatePacketChecklist(input, blockers, needsReview);
  evaluateVerificationBooleans(input, blockers);
  evaluateSummaries(input, blockers);
  evaluateNextSafeAction(input, blockers);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const blockerList = compact(blockers);
  const needsReviewList = compact(needsReview);
  const status = determineStatus(blockers, needsReview);
  const packetCompletenessVerified = input.packetCompletenessVerified === true;
  const audienceVerified = input.audienceVerified === true;
  const purposeVerified = input.purposeVerified === true;
  const notAuthorizedActionsVerified = input.notAuthorizedActionsVerified === true;
  const requiredPreconditionsVerified = input.requiredPreconditionsVerified === true;
  const packetChecklistVerified = input.packetChecklistVerified === true;
  const mockOnlyBoundaryVerified = input.mockOnlyBoundaryVerified === true;
  const noActualAccessBoundaryVerified = input.noActualAccessBoundaryVerified === true;
  const noRuntimeReadinessBoundaryVerified = input.noRuntimeReadinessBoundaryVerified === true;
  const nextSafeActionVerified = input.nextSafeActionVerified === true;

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_TRACE_LABEL,
    packetVerifierId,
    mockReviewDecisionPacketId,
    decisionVerifierId,
    mockReviewDecisionGateId,
    mockReviewPacketId,
    verifierId,
    mockPlanId,
    sourceAccessPlanId,
    decisionGateId,
    reviewPacketId,
    sourceHeadSha,
    mockReviewDecisionPacketStatus,
    mockReviewDecisionPacketKind: String(input.mockReviewDecisionPacketKind || packet?.kind || 'missing'),
    mockReviewDecisionPacketTraceLabel: String(input.mockReviewDecisionPacketTraceLabel || packet?.traceLabel || 'missing'),
    verificationMode,
    packetAudience,
    packetPurpose,
    packetCompletenessVerified,
    audienceVerified,
    purposeVerified,
    notAuthorizedActionsVerified,
    requiredPreconditionsVerified,
    packetChecklistVerified,
    mockOnlyBoundaryVerified,
    noActualAccessBoundaryVerified,
    noRuntimeReadinessBoundaryVerified,
    nextSafeActionVerified,
    verificationSummary: {
      packetCompleteness: packetCompletenessVerified,
      audience: audienceVerified,
      purpose: purposeVerified,
      notAuthorizedActions: notAuthorizedActionsVerified,
      requiredPreconditions: requiredPreconditionsVerified,
      packetChecklist: packetChecklistVerified,
      mockOnlyBoundary: mockOnlyBoundaryVerified,
      noActualAccessBoundary: noActualAccessBoundaryVerified,
      noRuntimeReadinessBoundary: noRuntimeReadinessBoundaryVerified,
      nextSafeAction: nextSafeActionVerified,
      safeSummaryOnly: true
    },
    packetSections,
    ownerDecisionSummary,
    operatorDecisionSummary,
    notAuthorizedActions,
    requiredPreconditions,
    packetChecklist,
    mockOnlyDecisionSummary: safeSummary(input.mockOnlyDecisionSummary, packet?.mockOnlyDecisionSummary.verified === true),
    noActualAccessSummary: safeSummary(input.noActualAccessSummary, packet?.noActualAccessSummary.verified === true),
    noRuntimeReadinessSummary: safeSummary(input.noRuntimeReadinessSummary, packet?.noRuntimeReadinessSummary.verified === true),
    boundarySummary: buildBoundarySummary(input),
    blockerCount: blockerList.length,
    blockers: blockerList,
    needsReviewReasonCount: needsReviewList.length,
    needsReviewReasons: needsReviewList,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')).length,
    unsafeReasonCodes: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')),
    nextSafeAction: determineNextSafeAction(blockers, needsReview, status)
  };
}
