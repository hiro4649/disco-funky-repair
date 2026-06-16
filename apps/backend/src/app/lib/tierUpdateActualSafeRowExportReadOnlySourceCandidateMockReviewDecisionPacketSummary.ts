import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_TRACE_LABEL =
  'd8al_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary' as const;

type Status =
  | 'BLOCKED'
  | 'NEEDS_REVIEW'
  | 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY';

type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier'
  | 'provide_mock_review_decision_packet_summary_id'
  | 'provide_mock_review_decision_packet_summary_identifiers'
  | 'remove_forbidden_summary_audience'
  | 'remove_forbidden_summary_purpose'
  | 'remove_forbidden_summary_readiness_label'
  | 'add_mock_review_decision_packet_summary_sections'
  | 'add_summary_boundary_labels'
  | 'add_summary_not_authorized_labels'
  | 'add_summary_preconditions'
  | 'add_summary_checklist_labels'
  | 'verify_mock_review_decision_packet_summary_boundary'
  | 'remove_forbidden_boundary_flag'
  | 'remove_unsafe_mock_review_decision_packet_summary_label'
  | 'collect_operator_mock_review_decision_packet_summary_review'
  | 'prepare_pr_d8am_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier';

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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput =
  BoundaryFlagInput & {
    mockReviewDecisionPacketVerifier?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketVerifier | null;
    mockReviewDecisionPacketVerifierStatus?: string | null;
    mockReviewDecisionPacketVerifierKind?: string | null;
    mockReviewDecisionPacketVerifierTraceLabel?: string | null;
    summaryId?: string | null;
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
    summaryAudience?: string | null;
    summaryPurpose?: string | null;
    summaryReadinessLabel?: string | null;
    summarySections?: string[];
    summaryBoundaryLabels?: string[];
    summaryNotAuthorizedLabels?: string[];
    summaryPreconditions?: string[];
    summaryChecklistLabels?: string[];
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
    verificationSummary?: Record<string, boolean | string | number | null | undefined> | null;
    mockOnlySummary?: SafeSummary | null;
    noActualAccessSummary?: SafeSummary | null;
    noRuntimeReadinessSummary?: SafeSummary | null;
    boundarySummary?: BoundaryFlagInput | null;
    boundaryFlags?: BoundaryFlagInput | null;
    blockers?: string[];
    needsReviewReasons?: string[];
    deferredEntityTypes?: string[];
    nextSafeAction?: string | null;
  };

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_SCHEMA_VERSION;
  status: Status;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_TRACE_LABEL;
  summaryId: string;
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
  mockReviewDecisionPacketVerifierStatus: string;
  mockReviewDecisionPacketVerifierKind: string;
  mockReviewDecisionPacketVerifierTraceLabel: string;
  summaryAudience: string;
  summaryPurpose: string;
  summaryReadinessLabel: string;
  summarySections: string[];
  summaryBoundaryLabels: string[];
  summaryNotAuthorizedLabels: string[];
  summaryPreconditions: string[];
  summaryChecklistLabels: string[];
  summaryCounts: {
    sectionCount: number;
    boundaryLabelCount: number;
    notAuthorizedLabelCount: number;
    preconditionCount: number;
    checklistLabelCount: number;
    safeSummaryOnly: true;
  };
  mockOnlySummary: SafeSummary;
  noActualAccessSummary: SafeSummary;
  noRuntimeReadinessSummary: SafeSummary;
  safeEvidenceSummary: {
    sourceHeadShaPresent: boolean;
    sameHeadRemoteQualityGateRequired: boolean;
    futureOwnerConfirmationRequired: boolean;
    safeSummaryOnly: true;
  };
  decisionPacketSummary: {
    verifierReady: boolean;
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
    safeSummaryOnly: true;
  };
  boundarySummary: Required<BoundaryFlagInput> & { safeSummaryOnly: true };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const READY_UPSTREAM_STATUS = 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY';
const SAFE_NEXT_ACTION_READY =
  'prepare_pr_d8am_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier';

const ALLOWED_SUMMARY_AUDIENCES = new Set(['owner', 'operator', 'reviewer', 'codex_summary_only']);
const FORBIDDEN_SUMMARY_AUDIENCES = new Set(['runtime_worker', 'scheduler', 'public_user', 'frontend', 'admin_action_runner']);
const ALLOWED_SUMMARY_PURPOSES = new Set([
  'mock_decision_packet_summary_only',
  'fixture_decision_packet_summary_only',
  'plan_shape_decision_packet_summary_only',
  'owner_scope_decision_packet_summary_only'
]);
const FORBIDDEN_SUMMARY_PURPOSES = new Set([
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
const ALLOWED_READINESS_LABELS = new Set([
  'mock_summary_ready',
  'review_summary_ready',
  'planning_summary_ready',
  'owner_scope_summary_ready'
]);
const FORBIDDEN_READINESS_LABELS = new Set([
  'actual_source_ready',
  'actual_db_ready',
  'export_ready',
  'jsonl_ready',
  'runtime_ready',
  'staging_ready',
  'production_ready'
]);

const REQUIRED_NOT_AUTHORIZED_LABELS = [
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
const REQUIRED_CHECKLIST_LABELS = [
  'no actual access',
  'no db',
  'no export',
  'no runtime readiness'
];
const REQUIRED_SUMMARY_SECTIONS = [
  'scope_summary',
  'verified_mock_decision_packet_summary',
  'boundary_summary',
  'not_authorized_summary',
  'precondition_summary',
  'next_safe_action'
];
const REQUIRED_BOUNDARY_LABELS = [
  'mock_only',
  'no_actual_access',
  'no_db',
  'no_export',
  'no_runtime_readiness'
];
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
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort().slice(0, 24);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort();

function requireText(value: unknown, code: string, blockers: Set<string>): string {
  if (!hasText(value)) blockers.add(code);
  return hasText(value) ? String(value) : 'missing';
}

function safeSummary(value: SafeSummary | null | undefined, fallback = false): SafeSummary {
  return { verified: value?.verified === true || fallback, safeSummaryOnly: true };
}

function buildBoundarySummary(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput
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
    ...(input.mockReviewDecisionPacketVerifier?.boundarySummary || {}),
    ...(input.boundarySummary || {}),
    ...(input.boundaryFlags || {}),
    safeSummaryOnly: true
  };
}

function addBoundaryFlagBlockers(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput,
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
      || input.mockReviewDecisionPacketVerifier?.boundarySummary?.[flag] === true) {
      blockers.add(code);
    }
  });
}

function evaluateUpstreamStatus(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput,
  blockers: Set<string>,
  needsReview: Set<string>
): string {
  const verifier = input.mockReviewDecisionPacketVerifier;
  const status = String(input.mockReviewDecisionPacketVerifierStatus || verifier?.status || 'missing');
  if (!verifier && !hasText(input.mockReviewDecisionPacketVerifierStatus)) blockers.add('mock_review_decision_packet_verifier_missing');
  if (status !== READY_UPSTREAM_STATUS) {
    if (status === 'NEEDS_REVIEW') needsReview.add('mock_review_decision_packet_verifier_needs_review');
    else blockers.add('mock_review_decision_packet_verifier_not_ready');
  }
  [...(verifier?.blockers || []), ...(input.blockers || [])].forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  [...(verifier?.needsReviewReasons || []), ...(input.needsReviewReasons || [])].forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });
  (input.deferredEntityTypes || []).forEach((entity) => {
    if (hasText(entity)) needsReview.add(`deferred_entity:${normalize(String(entity))}`);
  });
  return status;
}

function evaluateAudiencePurposeReadiness(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput,
  blockers: Set<string>,
  needsReview: Set<string>
): { summaryAudience: string; summaryPurpose: string; summaryReadinessLabel: string } {
  const summaryAudience = input.summaryAudience === null ? 'missing' : normalize(String(input.summaryAudience || 'missing'));
  const summaryPurpose = input.summaryPurpose === null ? 'missing' : normalize(String(input.summaryPurpose || 'missing'));
  const summaryReadinessLabel = input.summaryReadinessLabel === null ? 'missing' : normalize(String(input.summaryReadinessLabel || 'missing'));

  if (summaryAudience === 'missing') needsReview.add('summary_audience_missing');
  else if (!ALLOWED_SUMMARY_AUDIENCES.has(summaryAudience) || FORBIDDEN_SUMMARY_AUDIENCES.has(summaryAudience)) blockers.add('summary_audience_forbidden');

  if (summaryPurpose === 'missing') needsReview.add('summary_purpose_missing');
  else if (!ALLOWED_SUMMARY_PURPOSES.has(summaryPurpose) || FORBIDDEN_SUMMARY_PURPOSES.has(summaryPurpose)) blockers.add('summary_purpose_forbidden');

  if (summaryReadinessLabel === 'missing') needsReview.add('summary_readiness_label_missing');
  else if (!ALLOWED_READINESS_LABELS.has(summaryReadinessLabel) || FORBIDDEN_READINESS_LABELS.has(summaryReadinessLabel)) blockers.add('summary_readiness_label_forbidden');

  return { summaryAudience, summaryPurpose, summaryReadinessLabel };
}

function evaluateRequiredExactList(
  values: string[] | undefined,
  required: string[],
  absentCode: string,
  missingPrefix: string,
  blockers: Set<string>,
  needsReview?: Set<string>,
  incompleteReviewCode?: string
): string[] {
  const list = values || [];
  const normalized = new Set(list.map(normalize));
  if (list.length === 0) blockers.add(absentCode);
  required.forEach((item) => {
    if (!normalized.has(normalize(item))) blockers.add(`${missingPrefix}:${normalize(item)}`);
  });
  if (needsReview && incompleteReviewCode && list.length > 0 && list.length < required.length) {
    [...blockers].forEach((code) => {
      if (code.startsWith(`${missingPrefix}:`)) blockers.delete(code);
    });
    needsReview.add(incompleteReviewCode);
  }
  return unique(list);
}

function evaluateChecklistLabels(
  values: string[] | undefined,
  blockers: Set<string>,
  needsReview: Set<string>
): string[] {
  const list = values || [];
  const text = list.join(' ').toLowerCase();
  if (list.length === 0) blockers.add('summary_checklist_labels_missing');
  REQUIRED_CHECKLIST_LABELS.forEach((item) => {
    if (!text.includes(item)) {
      if (list.length <= 1) needsReview.add(`summary_checklist_labels_incomplete:${normalize(item)}`);
      else blockers.add(`summary_checklist_label_missing:${normalize(item)}`);
    }
  });
  return unique(list);
}

function evaluateVerificationBooleans(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput,
  blockers: Set<string>
): void {
  const verifier = input.mockReviewDecisionPacketVerifier;
  const checks: Array<[boolean | undefined, boolean | undefined, string]> = [
    [input.packetCompletenessVerified, verifier?.packetCompletenessVerified, 'packet_completeness_not_verified'],
    [input.audienceVerified, verifier?.audienceVerified, 'audience_not_verified'],
    [input.purposeVerified, verifier?.purposeVerified, 'purpose_not_verified'],
    [input.notAuthorizedActionsVerified, verifier?.notAuthorizedActionsVerified, 'not_authorized_actions_not_verified'],
    [input.requiredPreconditionsVerified, verifier?.requiredPreconditionsVerified, 'required_preconditions_not_verified'],
    [input.packetChecklistVerified, verifier?.packetChecklistVerified, 'packet_checklist_not_verified'],
    [input.mockOnlyBoundaryVerified, verifier?.mockOnlyBoundaryVerified, 'mock_only_boundary_not_verified'],
    [input.noActualAccessBoundaryVerified, verifier?.noActualAccessBoundaryVerified, 'no_actual_access_boundary_not_verified'],
    [input.noRuntimeReadinessBoundaryVerified, verifier?.noRuntimeReadinessBoundaryVerified, 'no_runtime_readiness_boundary_not_verified'],
    [input.nextSafeActionVerified, verifier?.nextSafeActionVerified, 'next_safe_action_not_verified']
  ];
  checks.forEach(([value, fallback, code]) => {
    if ((value ?? fallback) !== true) blockers.add(code);
  });
}

function evaluateNextSafeAction(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput,
  blockers: Set<string>
): void {
  const action = String(input.nextSafeAction || SAFE_NEXT_ACTION_READY);
  if (!action) {
    blockers.add('next_safe_action_missing');
    return;
  }
  const normalized = normalizeLabel(action);
  if (action !== SAFE_NEXT_ACTION_READY
    && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
    blockers.add('next_safe_action_forbidden');
  }
}

function collectUnsafeLabels(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput,
  blockers: Set<string>
): void {
  const labels = [
    input.summaryId,
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
    input.sourceHeadSha,
    input.summaryAudience,
    input.summaryPurpose,
    input.summaryReadinessLabel,
    input.nextSafeAction,
    ...(input.summarySections || []),
    ...(input.summaryBoundaryLabels || []),
    ...(input.summaryNotAuthorizedLabels || []),
    ...(input.summaryPreconditions || []),
    ...(input.summaryChecklistLabels || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const action = normalize(label);
    const explicitReadinessOverclaim = action.includes('runtime_ready')
      || action.includes('staging_ready')
      || action.includes('production_ready')
      || normalized.includes('actualsourceready')
      || normalized.includes('actualdbready')
      || normalized.includes('exportrready')
      || normalized.includes('runtimeready')
      || normalized.includes('stagingready')
      || normalized.includes('productionready');
    if (explicitReadinessOverclaim) {
      blockers.add('public_readiness_or_execution_overclaim');
      return;
    }
    const isRequiredSafeCategory = REQUIRED_NOT_AUTHORIZED_LABELS.some((label) => action === normalize(label))
      || REQUIRED_CHECKLIST_LABELS.some((label) => action === normalize(label));
    const isSafeNegative = action.includes('no_actual_access')
      || action.includes('no_db')
      || action.includes('no_export')
      || action.includes('no_source_access')
      || action.includes('not_authorized')
      || action.includes('confirm_no')
      || isRequiredSafeCategory
      || action.includes('mock_review')
      || action.includes('mock_decision')
      || action.includes('mock_plan')
      || action.includes('summary')
      || action.includes('source_access_plan')
      || action.includes('review_packet')
      || action.includes('source_head')
      || action.includes('verifier')
      || action.includes('decision_gate')
      || action.includes('decision_packet')
      || action.includes('source_candidate')
      || action.includes('actual_safe_row_export_read_only')
      || action === SAFE_NEXT_ACTION_READY;
    if (!isSafeNegative && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
      return;
    }
    if (!isRequiredSafeCategory && UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_mock_review_decision_packet_summary_label');
  });
}

function determineStatus(blockers: Set<string>, needsReview: Set<string>): Status {
  if (blockers.size > 0) return 'BLOCKED';
  if (needsReview.size > 0) return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY';
}

function determineNextSafeAction(blockers: Set<string>, needsReview: Set<string>, status: Status): NextSafeAction {
  if (blockers.has('mock_review_decision_packet_verifier_missing') || blockers.has('mock_review_decision_packet_verifier_not_ready')) {
    return 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier';
  }
  if (blockers.has('summary_id_missing')) return 'provide_mock_review_decision_packet_summary_id';
  if (Array.from(blockers).some((code) => code.endsWith('_id_missing') || code === 'source_head_sha_missing')) {
    return 'provide_mock_review_decision_packet_summary_identifiers';
  }
  if (blockers.has('summary_audience_forbidden')) return 'remove_forbidden_summary_audience';
  if (blockers.has('summary_purpose_forbidden')) return 'remove_forbidden_summary_purpose';
  if (blockers.has('summary_readiness_label_forbidden')) return 'remove_forbidden_summary_readiness_label';
  if (blockers.has('summary_sections_missing') || Array.from(blockers).some((code) => code.startsWith('summary_section_missing'))) {
    return 'add_mock_review_decision_packet_summary_sections';
  }
  if (blockers.has('summary_boundary_labels_missing') || Array.from(blockers).some((code) => code.startsWith('summary_boundary_label_missing'))) {
    return 'add_summary_boundary_labels';
  }
  if (blockers.has('summary_not_authorized_labels_missing') || Array.from(blockers).some((code) => code.startsWith('summary_not_authorized_label_missing'))) {
    return 'add_summary_not_authorized_labels';
  }
  if (blockers.has('summary_preconditions_missing') || Array.from(blockers).some((code) => code.startsWith('summary_precondition_missing'))) {
    return 'add_summary_preconditions';
  }
  if (blockers.has('summary_checklist_labels_missing') || Array.from(blockers).some((code) => code.startsWith('summary_checklist_label_missing'))) {
    return 'add_summary_checklist_labels';
  }
  if (Array.from(blockers).some((code) => code.endsWith('_not_verified'))) return 'verify_mock_review_decision_packet_summary_boundary';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_mock_review_decision_packet_summary_label') || blockers.has('public_readiness_or_execution_overclaim')) {
    return 'remove_unsafe_mock_review_decision_packet_summary_label';
  }
  if (needsReview.size > 0) return 'collect_operator_mock_review_decision_packet_summary_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY') return SAFE_NEXT_ACTION_READY;
  return 'collect_operator_mock_review_decision_packet_summary_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary {
  const blockers = new Set<string>();
  const needsReview = new Set<string>();
  const verifier = input.mockReviewDecisionPacketVerifier;

  const mockReviewDecisionPacketVerifierStatus = evaluateUpstreamStatus(input, blockers, needsReview);
  const summaryId = requireText(input.summaryId, 'summary_id_missing', blockers);
  const packetVerifierId = requireText(input.packetVerifierId || verifier?.packetVerifierId, 'packet_verifier_id_missing', blockers);
  const mockReviewDecisionPacketId = requireText(input.mockReviewDecisionPacketId || verifier?.mockReviewDecisionPacketId, 'mock_review_decision_packet_id_missing', blockers);
  const decisionVerifierId = requireText(input.decisionVerifierId || verifier?.decisionVerifierId, 'decision_verifier_id_missing', blockers);
  const mockReviewDecisionGateId = requireText(input.mockReviewDecisionGateId || verifier?.mockReviewDecisionGateId, 'mock_review_decision_gate_id_missing', blockers);
  const mockReviewPacketId = requireText(input.mockReviewPacketId || verifier?.mockReviewPacketId, 'mock_review_packet_id_missing', blockers);
  const verifierId = requireText(input.verifierId || verifier?.verifierId, 'verifier_id_missing', blockers);
  const mockPlanId = requireText(input.mockPlanId || verifier?.mockPlanId, 'mock_plan_id_missing', blockers);
  const sourceAccessPlanId = requireText(input.sourceAccessPlanId || verifier?.sourceAccessPlanId, 'source_access_plan_id_missing', blockers);
  const decisionGateId = requireText(input.decisionGateId || verifier?.decisionGateId, 'decision_gate_id_missing', blockers);
  const reviewPacketId = requireText(input.reviewPacketId || verifier?.reviewPacketId, 'review_packet_id_missing', blockers);
  const sourceHeadSha = requireText(input.sourceHeadSha || verifier?.sourceHeadSha, 'source_head_sha_missing', blockers);
  const { summaryAudience, summaryPurpose, summaryReadinessLabel } = evaluateAudiencePurposeReadiness(input, blockers, needsReview);
  const summarySections = evaluateRequiredExactList(input.summarySections, REQUIRED_SUMMARY_SECTIONS, 'summary_sections_missing', 'summary_section_missing', blockers, needsReview, 'summary_sections_incomplete');
  const summaryBoundaryLabels = evaluateRequiredExactList(input.summaryBoundaryLabels, REQUIRED_BOUNDARY_LABELS, 'summary_boundary_labels_missing', 'summary_boundary_label_missing', blockers, needsReview, 'summary_boundary_labels_incomplete');
  const summaryNotAuthorizedLabels = evaluateRequiredExactList(input.summaryNotAuthorizedLabels, REQUIRED_NOT_AUTHORIZED_LABELS, 'summary_not_authorized_labels_missing', 'summary_not_authorized_label_missing', blockers);
  const summaryPreconditions = evaluateRequiredExactList(input.summaryPreconditions, REQUIRED_PRECONDITIONS, 'summary_preconditions_missing', 'summary_precondition_missing', blockers);
  const summaryChecklistLabels = evaluateChecklistLabels(input.summaryChecklistLabels, blockers, needsReview);
  evaluateVerificationBooleans(input, blockers);
  evaluateNextSafeAction(input, blockers);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const blockerList = compact(blockers);
  const needsReviewList = compact(needsReview);
  const status = determineStatus(blockers, needsReview);
  const boundarySummary = buildBoundarySummary(input);
  const packetCompletenessVerified = (input.packetCompletenessVerified ?? verifier?.packetCompletenessVerified) === true;
  const audienceVerified = (input.audienceVerified ?? verifier?.audienceVerified) === true;
  const purposeVerified = (input.purposeVerified ?? verifier?.purposeVerified) === true;
  const notAuthorizedActionsVerified = (input.notAuthorizedActionsVerified ?? verifier?.notAuthorizedActionsVerified) === true;
  const requiredPreconditionsVerified = (input.requiredPreconditionsVerified ?? verifier?.requiredPreconditionsVerified) === true;
  const packetChecklistVerified = (input.packetChecklistVerified ?? verifier?.packetChecklistVerified) === true;
  const mockOnlyBoundaryVerified = (input.mockOnlyBoundaryVerified ?? verifier?.mockOnlyBoundaryVerified) === true;
  const noActualAccessBoundaryVerified = (input.noActualAccessBoundaryVerified ?? verifier?.noActualAccessBoundaryVerified) === true;
  const noRuntimeReadinessBoundaryVerified = (input.noRuntimeReadinessBoundaryVerified ?? verifier?.noRuntimeReadinessBoundaryVerified) === true;
  const nextSafeActionVerified = (input.nextSafeActionVerified ?? verifier?.nextSafeActionVerified) === true;

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_TRACE_LABEL,
    summaryId,
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
    mockReviewDecisionPacketVerifierStatus,
    mockReviewDecisionPacketVerifierKind: String(input.mockReviewDecisionPacketVerifierKind || verifier?.kind || 'missing'),
    mockReviewDecisionPacketVerifierTraceLabel: String(input.mockReviewDecisionPacketVerifierTraceLabel || verifier?.traceLabel || 'missing'),
    summaryAudience,
    summaryPurpose,
    summaryReadinessLabel,
    summarySections,
    summaryBoundaryLabels,
    summaryNotAuthorizedLabels,
    summaryPreconditions,
    summaryChecklistLabels,
    summaryCounts: {
      sectionCount: summarySections.length,
      boundaryLabelCount: summaryBoundaryLabels.length,
      notAuthorizedLabelCount: summaryNotAuthorizedLabels.length,
      preconditionCount: summaryPreconditions.length,
      checklistLabelCount: summaryChecklistLabels.length,
      safeSummaryOnly: true
    },
    mockOnlySummary: safeSummary(input.mockOnlySummary, verifier?.mockOnlyDecisionSummary.verified === true),
    noActualAccessSummary: safeSummary(input.noActualAccessSummary, verifier?.noActualAccessSummary.verified === true),
    noRuntimeReadinessSummary: safeSummary(input.noRuntimeReadinessSummary, verifier?.noRuntimeReadinessSummary.verified === true),
    safeEvidenceSummary: {
      sourceHeadShaPresent: hasText(sourceHeadSha),
      sameHeadRemoteQualityGateRequired: summaryPreconditions.includes('same_head_remote_quality_gate_required'),
      futureOwnerConfirmationRequired: summaryPreconditions.includes('future_owner_confirmation_required'),
      safeSummaryOnly: true
    },
    decisionPacketSummary: {
      verifierReady: mockReviewDecisionPacketVerifierStatus === READY_UPSTREAM_STATUS,
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
      safeSummaryOnly: true
    },
    boundarySummary,
    blockerCount: blockerList.length,
    blockers: blockerList,
    needsReviewReasonCount: needsReviewList.length,
    needsReviewReasons: needsReviewList,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')).length,
    unsafeReasonCodes: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')),
    nextSafeAction: determineNextSafeAction(blockers, needsReview, status)
  };
}
