import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_TRACE_LABEL =
  'd8am_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary_verifier' as const;

type Status =
  | 'BLOCKED'
  | 'NEEDS_REVIEW'
  | 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_READY';

type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary'
  | 'provide_mock_review_decision_packet_summary_verifier_id'
  | 'provide_mock_review_decision_packet_summary_identifiers'
  | 'remove_forbidden_summary_verification_mode'
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
  | 'remove_unsafe_mock_review_decision_packet_summary_verifier_label'
  | 'collect_operator_mock_review_decision_packet_summary_verifier_review'
  | 'prepare_pr_d8an_actual_safe_row_export_read_only_source_candidate_mock_lane_closure';

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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput =
  BoundaryFlagInput & {
    mockReviewDecisionPacketSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary | null;
    mockReviewDecisionPacketSummaryStatus?: string | null;
    mockReviewDecisionPacketSummaryKind?: string | null;
    mockReviewDecisionPacketSummaryTraceLabel?: string | null;
    summaryVerifierId?: string | null;
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
    verificationMode?: string | null;
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
    summaryStaticShapeVerified?: boolean;
    safeSummaryOnlyVerified?: boolean;
    mockOnlySummaryVerified?: boolean;
    noActualAccessSummaryVerified?: boolean;
    noRuntimeReadinessSummaryVerified?: boolean;
    boundarySummary?: BoundaryFlagInput | null;
    boundaryFlags?: BoundaryFlagInput | null;
    blockers?: string[];
    needsReviewReasons?: string[];
    deferredEntityTypes?: string[];
    nextSafeAction?: string | null;
  };

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifier = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_SCHEMA_VERSION;
  status: Status;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_TRACE_LABEL;
  summaryVerifierId: string;
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
  mockReviewDecisionPacketSummaryStatus: string;
  mockReviewDecisionPacketSummaryKind: string;
  mockReviewDecisionPacketSummaryTraceLabel: string;
  verificationMode: string;
  summaryAudience: string;
  summaryPurpose: string;
  summaryReadinessLabel: string;
  summarySections: string[];
  summaryBoundaryLabels: string[];
  summaryNotAuthorizedLabels: string[];
  summaryPreconditions: string[];
  summaryChecklistLabels: string[];
  summaryVerification: {
    upstreamReady: boolean;
    summaryStaticShapeVerified: boolean;
    safeSummaryOnlyVerified: boolean;
    packetCompletenessVerified: boolean;
    audienceVerified: boolean;
    purposeVerified: boolean;
    notAuthorizedActionsVerified: boolean;
    requiredPreconditionsVerified: boolean;
    packetChecklistVerified: boolean;
    mockOnlyBoundaryVerified: boolean;
    noActualAccessBoundaryVerified: boolean;
    noRuntimeReadinessBoundaryVerified: boolean;
    mockOnlySummaryVerified: boolean;
    noActualAccessSummaryVerified: boolean;
    noRuntimeReadinessSummaryVerified: boolean;
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

const READY_UPSTREAM_STATUS = 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY';
const READY_NEXT_SAFE_ACTION =
  'prepare_pr_d8an_actual_safe_row_export_read_only_source_candidate_mock_lane_closure';

const ALLOWED_VERIFICATION_MODES = new Set([
  'mock_summary_static_verification',
  'fixture_summary_verification',
  'plan_shape_summary_verification',
  'review_only_summary_verification'
]);

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

const ALLOWED_SUMMARY_AUDIENCES = new Set(['owner', 'operator', 'reviewer', 'codex_summary_only']);
const ALLOWED_SUMMARY_PURPOSES = new Set([
  'mock_decision_packet_summary_only',
  'fixture_decision_packet_summary_only',
  'plan_shape_decision_packet_summary_only',
  'owner_scope_decision_packet_summary_only'
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
  'actualsourceready',
  'actualdbready',
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

function sourceSummary(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummary | undefined {
  return input.mockReviewDecisionPacketSummary || undefined;
}

function buildBoundarySummary(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput
): Required<BoundaryFlagInput> & { safeSummaryOnly: true } {
  const summary = sourceSummary(input);
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
    ...(summary?.boundarySummary || {}),
    ...(input.boundarySummary || {}),
    ...(input.boundaryFlags || {}),
    safeSummaryOnly: true
  };
}

function addBoundaryFlagBlockers(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput,
  blockers: Set<string>
): void {
  const summary = sourceSummary(input);
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
      || input.boundarySummary?.[flag] === true
      || input.boundaryFlags?.[flag] === true
      || summary?.boundarySummary?.[flag] === true) {
      blockers.add(code);
    }
  });
}

function evaluateUpstreamStatus(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput,
  blockers: Set<string>,
  needsReview: Set<string>
): string {
  const summary = sourceSummary(input);
  const status = String(input.mockReviewDecisionPacketSummaryStatus || summary?.status || 'missing');
  if (!summary && !hasText(input.mockReviewDecisionPacketSummaryStatus)) blockers.add('mock_review_decision_packet_summary_missing');
  if (status !== READY_UPSTREAM_STATUS) {
    if (status === 'NEEDS_REVIEW') needsReview.add('mock_review_decision_packet_summary_needs_review');
    else blockers.add('mock_review_decision_packet_summary_not_ready');
  }
  [...(summary?.blockers || []), ...(input.blockers || [])].forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  [...(summary?.needsReviewReasons || []), ...(input.needsReviewReasons || [])].forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });
  (input.deferredEntityTypes || []).forEach((entity) => {
    if (hasText(entity)) needsReview.add(`deferred_entity:${normalize(String(entity))}`);
  });
  return status;
}

function evaluateModeAudiencePurposeReadiness(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput,
  blockers: Set<string>,
  needsReview: Set<string>
): { verificationMode: string; summaryAudience: string; summaryPurpose: string; summaryReadinessLabel: string } {
  const summary = sourceSummary(input);
  const verificationMode = normalize(String(input.verificationMode || 'missing'));
  const summaryAudience = normalize(String(input.summaryAudience || summary?.summaryAudience || 'missing'));
  const summaryPurpose = normalize(String(input.summaryPurpose || summary?.summaryPurpose || 'missing'));
  const summaryReadinessLabel = normalize(String(input.summaryReadinessLabel || summary?.summaryReadinessLabel || 'missing'));

  if (verificationMode === 'missing') needsReview.add('verification_mode_missing');
  else if (!ALLOWED_VERIFICATION_MODES.has(verificationMode) || FORBIDDEN_VERIFICATION_MODES.has(verificationMode)) blockers.add('verification_mode_forbidden');

  if (summaryAudience === 'missing') needsReview.add('summary_audience_missing');
  else if (!ALLOWED_SUMMARY_AUDIENCES.has(summaryAudience)) blockers.add('summary_audience_forbidden');

  if (summaryPurpose === 'missing') needsReview.add('summary_purpose_missing');
  else if (!ALLOWED_SUMMARY_PURPOSES.has(summaryPurpose)) blockers.add('summary_purpose_forbidden');

  if (summaryReadinessLabel === 'missing') needsReview.add('summary_readiness_label_missing');
  else if (!ALLOWED_READINESS_LABELS.has(summaryReadinessLabel) || FORBIDDEN_READINESS_LABELS.has(summaryReadinessLabel)) blockers.add('summary_readiness_label_forbidden');

  return { verificationMode, summaryAudience, summaryPurpose, summaryReadinessLabel };
}

function requireList(
  values: string[] | undefined,
  fallback: string[] | undefined,
  required: string[],
  absentCode: string,
  missingPrefix: string,
  blockers: Set<string>
): string[] {
  const list = values || fallback || [];
  const normalized = new Set(list.map(normalize));
  if (list.length === 0) blockers.add(absentCode);
  required.forEach((item) => {
    if (!normalized.has(normalize(item))) blockers.add(`${missingPrefix}:${normalize(item)}`);
  });
  return unique(list);
}

function requireChecklist(
  values: string[] | undefined,
  fallback: string[] | undefined,
  blockers: Set<string>
): string[] {
  const list = values || fallback || [];
  const text = list.join(' ').toLowerCase();
  if (list.length === 0) blockers.add('summary_checklist_labels_missing');
  REQUIRED_CHECKLIST_LABELS.forEach((item) => {
    if (!text.includes(item)) blockers.add(`summary_checklist_label_missing:${normalize(item)}`);
  });
  return unique(list);
}

function requireVerified(value: boolean | undefined, fallback: boolean | undefined, code: string, blockers: Set<string>): boolean {
  const verified = (value ?? fallback) === true;
  if (!verified) blockers.add(code);
  return verified;
}

function collectUnsafeLabels(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput,
  blockers: Set<string>
): void {
  const summary = sourceSummary(input);
  const labels = [
    input.summaryVerifierId,
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
    input.verificationMode,
    input.summaryAudience,
    input.summaryPurpose,
    input.summaryReadinessLabel,
    input.nextSafeAction,
    ...(input.summarySections || summary?.summarySections || []),
    ...(input.summaryBoundaryLabels || summary?.summaryBoundaryLabels || []),
    ...(input.summaryNotAuthorizedLabels || summary?.summaryNotAuthorizedLabels || []),
    ...(input.summaryPreconditions || summary?.summaryPreconditions || []),
    ...(input.summaryChecklistLabels || summary?.summaryChecklistLabels || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const readinessOverclaim = normalize(label).includes('runtime_ready')
      || normalize(label).includes('staging_ready')
      || normalize(label).includes('production_ready')
      || normalized.includes('actualsourceready')
      || normalized.includes('actualdbready')
      || normalized.includes('exportrready')
      || normalized.includes('runtimeready')
      || normalized.includes('stagingready')
      || normalized.includes('productionready');
    if (readinessOverclaim) {
      blockers.add('public_readiness_or_execution_overclaim');
      return;
    }
    const isRequiredSafeCategory = REQUIRED_NOT_AUTHORIZED_LABELS.some((item) => normalize(item) === normalize(label))
      || REQUIRED_CHECKLIST_LABELS.some((item) => normalize(item) === normalize(label));
    const safeNegative = normalize(label).includes('no_actual_access')
      || normalize(label).includes('no_db')
      || normalize(label).includes('no_export')
      || normalize(label).includes('not_authorized')
      || normalize(label).includes('confirm_no')
      || normalize(label).includes('mock_review')
      || normalize(label).includes('mock_decision')
      || normalize(label).includes('mock_plan')
      || normalize(label).includes('summary')
      || normalize(label).includes('source_access_plan')
      || normalize(label).includes('review_packet')
      || normalize(label).includes('source_head')
      || normalize(label).includes('verifier')
      || normalize(label).includes('decision_gate')
      || normalize(label).includes('source_candidate')
      || normalize(label).includes('actual_safe_row_export_read_only')
      || normalize(label) === READY_NEXT_SAFE_ACTION
      || isRequiredSafeCategory;
    if (!isRequiredSafeCategory && UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) {
      blockers.add('unsafe_mock_review_decision_packet_summary_verifier_label');
    }
    if (!safeNegative && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
    }
  });
}

function evaluateNextSafeAction(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput,
  blockers: Set<string>
): void {
  const action = String(input.nextSafeAction || READY_NEXT_SAFE_ACTION);
  if (action !== READY_NEXT_SAFE_ACTION) {
    const normalized = normalizeLabel(action);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('next_safe_action_forbidden');
    }
  }
}

function determineStatus(blockers: Set<string>, needsReview: Set<string>): Status {
  if (blockers.size > 0) return 'BLOCKED';
  if (needsReview.size > 0) return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_READY';
}

function determineNextSafeAction(blockers: Set<string>, needsReview: Set<string>, status: Status): NextSafeAction {
  if (blockers.has('mock_review_decision_packet_summary_missing') || blockers.has('mock_review_decision_packet_summary_not_ready')) {
    return 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_summary';
  }
  if (blockers.has('summary_verifier_id_missing')) return 'provide_mock_review_decision_packet_summary_verifier_id';
  if (Array.from(blockers).some((code) => code.endsWith('_id_missing') || code === 'source_head_sha_missing')) return 'provide_mock_review_decision_packet_summary_identifiers';
  if (blockers.has('verification_mode_forbidden')) return 'remove_forbidden_summary_verification_mode';
  if (blockers.has('summary_audience_forbidden')) return 'remove_forbidden_summary_audience';
  if (blockers.has('summary_purpose_forbidden')) return 'remove_forbidden_summary_purpose';
  if (blockers.has('summary_readiness_label_forbidden')) return 'remove_forbidden_summary_readiness_label';
  if (blockers.has('summary_sections_missing') || Array.from(blockers).some((code) => code.startsWith('summary_section_missing'))) return 'add_mock_review_decision_packet_summary_sections';
  if (blockers.has('summary_boundary_labels_missing') || Array.from(blockers).some((code) => code.startsWith('summary_boundary_label_missing'))) return 'add_summary_boundary_labels';
  if (blockers.has('summary_not_authorized_labels_missing') || Array.from(blockers).some((code) => code.startsWith('summary_not_authorized_label_missing'))) return 'add_summary_not_authorized_labels';
  if (blockers.has('summary_preconditions_missing') || Array.from(blockers).some((code) => code.startsWith('summary_precondition_missing'))) return 'add_summary_preconditions';
  if (blockers.has('summary_checklist_labels_missing') || Array.from(blockers).some((code) => code.startsWith('summary_checklist_label_missing'))) return 'add_summary_checklist_labels';
  if (Array.from(blockers).some((code) => code.endsWith('_not_verified'))) return 'verify_mock_review_decision_packet_summary_boundary';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_mock_review_decision_packet_summary_verifier_label') || blockers.has('public_readiness_or_execution_overclaim')) {
    return 'remove_unsafe_mock_review_decision_packet_summary_verifier_label';
  }
  if (needsReview.size > 0) return 'collect_operator_mock_review_decision_packet_summary_verifier_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_READY') return READY_NEXT_SAFE_ACTION;
  return 'collect_operator_mock_review_decision_packet_summary_verifier_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifier(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifierInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketSummaryVerifier {
  const blockers = new Set<string>();
  const needsReview = new Set<string>();
  const summary = sourceSummary(input);
  const mockReviewDecisionPacketSummaryStatus = evaluateUpstreamStatus(input, blockers, needsReview);
  const summaryVerifierId = requireText(input.summaryVerifierId, 'summary_verifier_id_missing', blockers);
  const summaryId = requireText(input.summaryId || summary?.summaryId, 'summary_id_missing', blockers);
  const packetVerifierId = requireText(input.packetVerifierId || summary?.packetVerifierId, 'packet_verifier_id_missing', blockers);
  const mockReviewDecisionPacketId = requireText(input.mockReviewDecisionPacketId || summary?.mockReviewDecisionPacketId, 'mock_review_decision_packet_id_missing', blockers);
  const decisionVerifierId = requireText(input.decisionVerifierId || summary?.decisionVerifierId, 'decision_verifier_id_missing', blockers);
  const mockReviewDecisionGateId = requireText(input.mockReviewDecisionGateId || summary?.mockReviewDecisionGateId, 'mock_review_decision_gate_id_missing', blockers);
  const mockReviewPacketId = requireText(input.mockReviewPacketId || summary?.mockReviewPacketId, 'mock_review_packet_id_missing', blockers);
  const verifierId = requireText(input.verifierId || summary?.verifierId, 'verifier_id_missing', blockers);
  const mockPlanId = requireText(input.mockPlanId || summary?.mockPlanId, 'mock_plan_id_missing', blockers);
  const sourceAccessPlanId = requireText(input.sourceAccessPlanId || summary?.sourceAccessPlanId, 'source_access_plan_id_missing', blockers);
  const decisionGateId = requireText(input.decisionGateId || summary?.decisionGateId, 'decision_gate_id_missing', blockers);
  const reviewPacketId = requireText(input.reviewPacketId || summary?.reviewPacketId, 'review_packet_id_missing', blockers);
  const sourceHeadSha = requireText(input.sourceHeadSha || summary?.sourceHeadSha, 'source_head_sha_missing', blockers);
  const { verificationMode, summaryAudience, summaryPurpose, summaryReadinessLabel } = evaluateModeAudiencePurposeReadiness(input, blockers, needsReview);
  const summarySections = requireList(input.summarySections, summary?.summarySections, REQUIRED_SUMMARY_SECTIONS, 'summary_sections_missing', 'summary_section_missing', blockers);
  const summaryBoundaryLabels = requireList(input.summaryBoundaryLabels, summary?.summaryBoundaryLabels, REQUIRED_BOUNDARY_LABELS, 'summary_boundary_labels_missing', 'summary_boundary_label_missing', blockers);
  const summaryNotAuthorizedLabels = requireList(input.summaryNotAuthorizedLabels, summary?.summaryNotAuthorizedLabels, REQUIRED_NOT_AUTHORIZED_LABELS, 'summary_not_authorized_labels_missing', 'summary_not_authorized_label_missing', blockers);
  const summaryPreconditions = requireList(input.summaryPreconditions, summary?.summaryPreconditions, REQUIRED_PRECONDITIONS, 'summary_preconditions_missing', 'summary_precondition_missing', blockers);
  const summaryChecklistLabels = requireChecklist(input.summaryChecklistLabels, summary?.summaryChecklistLabels, blockers);
  const upstreamVerification = summary?.decisionPacketSummary;
  const summaryStaticShapeVerified = requireVerified(input.summaryStaticShapeVerified, true, 'summary_static_shape_not_verified', blockers);
  const safeSummaryOnlyVerified = requireVerified(input.safeSummaryOnlyVerified, summary?.safeSummaryOnly, 'safe_summary_only_not_verified', blockers);
  const packetCompletenessVerified = requireVerified(input.packetCompletenessVerified, upstreamVerification?.packetCompletenessVerified, 'packet_completeness_not_verified', blockers);
  const audienceVerified = requireVerified(input.audienceVerified, upstreamVerification?.audienceVerified, 'audience_not_verified', blockers);
  const purposeVerified = requireVerified(input.purposeVerified, upstreamVerification?.purposeVerified, 'purpose_not_verified', blockers);
  const notAuthorizedActionsVerified = requireVerified(input.notAuthorizedActionsVerified, upstreamVerification?.notAuthorizedActionsVerified, 'not_authorized_actions_not_verified', blockers);
  const requiredPreconditionsVerified = requireVerified(input.requiredPreconditionsVerified, upstreamVerification?.requiredPreconditionsVerified, 'required_preconditions_not_verified', blockers);
  const packetChecklistVerified = requireVerified(input.packetChecklistVerified, upstreamVerification?.packetChecklistVerified, 'packet_checklist_not_verified', blockers);
  const mockOnlyBoundaryVerified = requireVerified(input.mockOnlyBoundaryVerified, upstreamVerification?.mockOnlyBoundaryVerified, 'mock_only_boundary_not_verified', blockers);
  const noActualAccessBoundaryVerified = requireVerified(input.noActualAccessBoundaryVerified, upstreamVerification?.noActualAccessBoundaryVerified, 'no_actual_access_boundary_not_verified', blockers);
  const noRuntimeReadinessBoundaryVerified = requireVerified(input.noRuntimeReadinessBoundaryVerified, upstreamVerification?.noRuntimeReadinessBoundaryVerified, 'no_runtime_readiness_boundary_not_verified', blockers);
  const mockOnlySummaryVerified = requireVerified(input.mockOnlySummaryVerified, summary?.mockOnlySummary.verified, 'mock_only_summary_not_verified', blockers);
  const noActualAccessSummaryVerified = requireVerified(input.noActualAccessSummaryVerified, summary?.noActualAccessSummary.verified, 'no_actual_access_summary_not_verified', blockers);
  const noRuntimeReadinessSummaryVerified = requireVerified(input.noRuntimeReadinessSummaryVerified, summary?.noRuntimeReadinessSummary.verified, 'no_runtime_readiness_summary_not_verified', blockers);
  const nextSafeActionVerified = requireVerified(input.nextSafeActionVerified, upstreamVerification?.nextSafeActionVerified, 'next_safe_action_not_verified', blockers);
  addBoundaryFlagBlockers(input, blockers);
  evaluateNextSafeAction(input, blockers);
  collectUnsafeLabels(input, blockers);

  const blockerList = compact(blockers);
  const needsReviewList = compact(needsReview);
  const status = determineStatus(blockers, needsReview);

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_TRACE_LABEL,
    summaryVerifierId,
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
    mockReviewDecisionPacketSummaryStatus,
    mockReviewDecisionPacketSummaryKind: String(input.mockReviewDecisionPacketSummaryKind || summary?.kind || 'missing'),
    mockReviewDecisionPacketSummaryTraceLabel: String(input.mockReviewDecisionPacketSummaryTraceLabel || summary?.traceLabel || 'missing'),
    verificationMode,
    summaryAudience,
    summaryPurpose,
    summaryReadinessLabel,
    summarySections,
    summaryBoundaryLabels,
    summaryNotAuthorizedLabels,
    summaryPreconditions,
    summaryChecklistLabels,
    summaryVerification: {
      upstreamReady: mockReviewDecisionPacketSummaryStatus === READY_UPSTREAM_STATUS,
      summaryStaticShapeVerified,
      safeSummaryOnlyVerified,
      packetCompletenessVerified,
      audienceVerified,
      purposeVerified,
      notAuthorizedActionsVerified,
      requiredPreconditionsVerified,
      packetChecklistVerified,
      mockOnlyBoundaryVerified,
      noActualAccessBoundaryVerified,
      noRuntimeReadinessBoundaryVerified,
      mockOnlySummaryVerified,
      noActualAccessSummaryVerified,
      noRuntimeReadinessSummaryVerified,
      nextSafeActionVerified,
      safeSummaryOnly: true
    },
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
