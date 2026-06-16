import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_packet' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_TRACE_LABEL =
  'd8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet' as const;

type MockReviewPacketStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY';
type OperatorReviewMode = 'mock_review_only' | 'fixture_review_only' | 'plan_shape_review_only' | 'owner_scope_review_only';
type ReviewAudience = 'owner' | 'operator' | 'reviewer' | 'codex_summary_only';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier'
  | 'provide_mock_review_packet_id'
  | 'provide_mock_verifier_identifiers'
  | 'remove_forbidden_operator_review_mode'
  | 'remove_forbidden_review_audience'
  | 'remove_execution_review_purpose'
  | 'add_mock_review_sections'
  | 'add_required_reviewer_checks'
  | 'add_not_authorized_action_categories'
  | 'verify_mock_plan_before_review_packet'
  | 'add_required_redaction_plan'
  | 'remove_forbidden_boundary_flag'
  | 'collect_operator_mock_review_packet_review'
  | 'prepare_pr_d8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate';

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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput = BoundaryFlagInput & {
  mockPlanVerifier?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier | null;
  mockPlanVerifierStatus?: string | null;
  mockPlanVerifierKind?: string | null;
  mockPlanVerifierTraceLabel?: string | null;
  mockReviewPacketId?: string | null;
  verifierId?: string | null;
  mockPlanId?: string | null;
  sourceAccessPlanId?: string | null;
  decisionGateId?: string | null;
  reviewPacketId?: string | null;
  sourceHeadSha?: string | null;
  operatorReviewMode?: string | null;
  reviewAudience?: string | null;
  reviewPurpose?: string | null;
  reviewSections?: string[];
  requiredReviewerChecks?: string[];
  notAuthorizedActions?: string[];
  mockOnlyVerified?: boolean;
  zeroRealRowsVerified?: boolean;
  noActualAccessVerified?: boolean;
  safeEvidenceOriginsVerified?: boolean;
  forbiddenFieldsVerified?: boolean;
  redactionPlanVerified?: boolean | 'unknown' | null;
  preconditionsVerified?: boolean;
  operatorChecklistVerified?: boolean;
  verificationSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier['verificationSummary'] | null;
  boundarySummary?: BoundaryFlagInput | null;
  blockers?: string[];
  needsReviewReasons?: string[];
  deferredEntityTypes?: string[];
  nextSafeAction?: string | null;
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_SCHEMA_VERSION;
  status: MockReviewPacketStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_TRACE_LABEL;
  mockReviewPacketId: string;
  verifierId: string;
  mockPlanId: string;
  sourceAccessPlanId: string;
  decisionGateId: string;
  reviewPacketId: string;
  sourceHeadSha: string;
  mockPlanVerifierStatus: string;
  mockPlanVerifierKind: string;
  mockPlanVerifierTraceLabel: string;
  operatorReviewMode: string;
  reviewAudience: string;
  reviewPurpose: string;
  reviewSections: string[];
  requiredReviewerChecks: string[];
  notAuthorizedActions: string[];
  verificationSummary: {
    mockOnly: boolean;
    zeroRealRows: boolean;
    noActualAccess: boolean;
    sourceAccessAuthorized: false;
    actualDbReadAuthorized: false;
    actualDbExportAuthorized: false;
    jsonlExportAuthorized: false;
    runtimeReady: false;
    stagingReady: false;
    productionReady: false;
  };
  mockOnlySummary: { verified: boolean; safeSummaryOnly: true };
  zeroRealRowsSummary: { verified: boolean; safeSummaryOnly: true };
  noActualAccessSummary: { verified: boolean; safeSummaryOnly: true };
  safeEvidenceOriginSummary: { verified: boolean; safeSummaryOnly: true };
  forbiddenFieldsSummary: { verified: boolean; notAuthorizedActionCount: number; safeSummaryOnly: true };
  redactionPlanSummary: { verified: boolean | 'unknown'; safeSummaryOnly: true };
  preconditionSummary: { verified: boolean; safeSummaryOnly: true };
  boundarySummary: Required<BoundaryFlagInput> & { safeSummaryOnly: true };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const ALLOWED_OPERATOR_REVIEW_MODES: OperatorReviewMode[] = ['mock_review_only', 'fixture_review_only', 'plan_shape_review_only', 'owner_scope_review_only'];
const FORBIDDEN_OPERATOR_REVIEW_MODES = new Set(['execute', 'query', 'read_source', 'db_read', 'export', 'jsonl_export', 'file_write', 'artifact_upload', 'runtime', 'worker', 'cron', 'route', 'cli', 'docker_smoke', 'staging', 'production']);
const ALLOWED_REVIEW_AUDIENCES: ReviewAudience[] = ['owner', 'operator', 'reviewer', 'codex_summary_only'];
const FORBIDDEN_REVIEW_AUDIENCES = new Set(['runtime_worker', 'scheduler', 'public_user', 'frontend', 'admin_action_runner']);
const REQUIRED_REVIEW_SECTIONS = ['scope_summary', 'mock_plan_verifier_summary', 'mock_only_summary', 'zero_real_rows_summary', 'no_actual_access_summary', 'not_authorized_summary', 'next_safe_action'];
const REQUIRED_REVIEWER_CHECKS = ['no actual access', 'no db', 'no export', 'no runtime readiness'];
const REQUIRED_NOT_AUTHORIZED = [
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
const UNSAFE_LABELS = ['secret', 'privatekey', 'rawenv', 'rawlog', 'rawpayload', 'rawendpoint', 'endpoint', 'privatepath', 'localpath', 'databaseurl', 'dburl'];
const FORBIDDEN_ACTION_LABELS = ['actualdbquery', 'actualdbexport', 'sourceaccess', 'readsource', 'dbread', 'useprismaclient', 'readdatabaseurl', 'readenv', 'writefileexport', 'writejsonlexport', 'uploadartifact', 'rundockersmoke', 'claimstagingnotxpass', 'claimruntimereadiness', 'claimproductionreadiness', 'runtime_ready', 'staging_ready', 'production_ready'];

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
const normalizeLabel = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
const hasText = (value: unknown): boolean => value !== undefined && value !== null && String(value).trim().length > 0;
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort().slice(0, 18);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort();

function addBoundaryFlagBlockers(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput, blockers: Set<string>): void {
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
    if (input[flag] === true || input.boundaryFlags?.[flag] === true || input.boundarySummary?.[flag] === true || input.mockPlanVerifier?.boundarySummary?.[flag] === true) {
      blockers.add(code);
    }
  });
}

function buildBoundarySummary(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput): Required<BoundaryFlagInput> & { safeSummaryOnly: true } {
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
    ...(input.mockPlanVerifier?.boundarySummary || {}),
    ...(input.boundarySummary || {}),
    ...(input.boundaryFlags || {}),
    safeSummaryOnly: true
  };
}

function collectUnsafeLabels(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput, blockers: Set<string>): void {
  const labels = [
    input.mockReviewPacketId,
    input.verifierId,
    input.mockPlanId,
    input.sourceAccessPlanId,
    input.decisionGateId,
    input.reviewPacketId,
    input.reviewPurpose,
    input.nextSafeAction,
    ...(input.reviewSections || []),
    ...(input.requiredReviewerChecks || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const normalizedAction = normalize(label);
    const allowed = normalizedAction === 'prepare_pr_d8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate'
      || normalizedAction.includes('mock_review')
      || normalizedAction.includes('no_source_access')
      || normalizedAction.includes('no_actual_access')
      || normalizedAction.includes('no_db')
      || normalizedAction.includes('no_export')
      || normalizedAction.includes('not_authorized')
      || normalizedAction.includes('confirm_no')
      || normalizedAction.includes('not_authorized');
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_mock_review_packet_label');
    if (!allowed && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) blockers.add('public_readiness_or_execution_overclaim');
  });
}

function verifyModeAndAudience(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput, blockers: Set<string>, needsReview: Set<string>): void {
  const mode = normalize(String(input.operatorReviewMode || 'missing'));
  const audience = normalize(String(input.reviewAudience || 'missing'));
  if (!input.operatorReviewMode) needsReview.add('operator_review_mode_missing');
  else if (!(ALLOWED_OPERATOR_REVIEW_MODES as readonly string[]).includes(mode)) blockers.add('operator_review_mode_unsupported');
  if (FORBIDDEN_OPERATOR_REVIEW_MODES.has(mode)) blockers.add('operator_review_mode_forbidden');
  if (!input.reviewAudience) needsReview.add('review_audience_missing');
  else if (!(ALLOWED_REVIEW_AUDIENCES as readonly string[]).includes(audience)) blockers.add('review_audience_unsupported');
  if (FORBIDDEN_REVIEW_AUDIENCES.has(audience)) blockers.add('review_audience_forbidden');
}

function verifyPurpose(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput, blockers: Set<string>): void {
  const purpose = normalizeLabel(String(input.reviewPurpose || ''));
  if (FORBIDDEN_ACTION_LABELS.some((forbidden) => purpose.includes(normalizeLabel(forbidden)))) blockers.add('review_purpose_execution_forbidden');
}

function verifySections(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput, blockers: Set<string>, needsReview: Set<string>): void {
  const sections = new Set((input.reviewSections || []).map((item) => normalize(String(item))));
  if (sections.size === 0) blockers.add('review_sections_missing');
  REQUIRED_REVIEW_SECTIONS.forEach((section) => {
    if (!sections.has(section)) needsReview.add(`review_section_incomplete:${section}`);
  });
}

function verifyReviewerChecks(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput, blockers: Set<string>, needsReview: Set<string>): void {
  const checks = input.requiredReviewerChecks || [];
  const text = checks.join(' ').toLowerCase();
  if (checks.length === 0) blockers.add('required_reviewer_checks_missing');
  REQUIRED_REVIEWER_CHECKS.forEach((term) => {
    if (!text.includes(term)) needsReview.add(`required_reviewer_check_incomplete:${normalize(term)}`);
  });
}

function verifyNotAuthorized(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput, blockers: Set<string>): void {
  const notAuthorized = new Set((input.notAuthorizedActions || []).map((item) => normalize(String(item))));
  if (notAuthorized.size === 0) blockers.add('not_authorized_actions_missing');
  REQUIRED_NOT_AUTHORIZED.forEach((item) => {
    if (!notAuthorized.has(item)) blockers.add(`not_authorized_action_missing:${item}`);
  });
}

function verifyVerifierBooleans(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput, blockers: Set<string>, needsReview: Set<string>): void {
  const verifier = input.mockPlanVerifier;
  const bools: Array<[boolean | undefined, string]> = [
    [input.mockOnlyVerified ?? verifier?.mockOnlyVerified, 'mock_only_not_verified'],
    [input.zeroRealRowsVerified ?? verifier?.zeroRealRowsVerified, 'zero_real_rows_not_verified'],
    [input.noActualAccessVerified ?? verifier?.noActualAccessVerified, 'no_actual_access_not_verified'],
    [input.safeEvidenceOriginsVerified ?? verifier?.safeEvidenceOriginsVerified, 'safe_evidence_origins_not_verified'],
    [input.forbiddenFieldsVerified ?? verifier?.forbiddenFieldsVerified, 'forbidden_fields_not_verified'],
    [input.preconditionsVerified ?? verifier?.preconditionsVerified, 'preconditions_not_verified'],
    [input.operatorChecklistVerified ?? verifier?.operatorChecklistVerified, 'operator_checklist_not_verified']
  ];
  bools.forEach(([value, code]) => {
    if (value !== true) blockers.add(code);
  });
  const redaction = input.redactionPlanVerified ?? verifier?.redactionPlanVerified;
  const sensitive = [...(verifier?.mockSafeFields || []), input.reviewPurpose || ''].some((value) => {
    const label = normalizeLabel(value);
    return label.includes('wallet') || label.includes('localpath') || label.includes('privatepath') || UNSAFE_LABELS.some((unsafe) => label.includes(unsafe));
  });
  if (redaction === false && sensitive) blockers.add('redaction_plan_not_verified');
  if ((redaction === undefined || redaction === null || redaction === 'unknown') && !sensitive) needsReview.add('redaction_plan_verification_unknown');
}

function verifySummary(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput, blockers: Set<string>): void {
  const summary = (input.verificationSummary || input.mockPlanVerifier?.verificationSummary) as Record<string, unknown> | undefined;
  if (summary?.sourceAccessAuthorized === true) blockers.add('source_access_authorized_forbidden');
  if (summary?.actualDbReadAuthorized === true) blockers.add('actual_db_read_authorized_forbidden');
  if (summary?.actualDbExportAuthorized === true) blockers.add('actual_db_export_authorized_forbidden');
  if (summary?.jsonlExportAuthorized === true) blockers.add('jsonl_export_authorized_forbidden');
  if (summary?.runtimeReady === true) blockers.add('runtime_readiness_claim_forbidden');
  if (summary?.stagingReady === true) blockers.add('staging_no_tx_pass_claim_forbidden');
  if (summary?.productionReady === true) blockers.add('production_readiness_claim_forbidden');
}

function determineNextSafeAction(blockers: Set<string>, needsReview: Set<string>, status: MockReviewPacketStatus): NextSafeAction {
  if (blockers.has('mock_plan_verifier_missing') || blockers.has('mock_plan_verifier_not_ready')) return 'build_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier';
  if (blockers.has('mock_review_packet_id_missing')) return 'provide_mock_review_packet_id';
  if (blockers.has('verifier_id_missing') || blockers.has('mock_plan_id_missing') || blockers.has('source_access_plan_id_missing') || blockers.has('decision_gate_id_missing') || blockers.has('review_packet_id_missing') || blockers.has('source_head_sha_missing')) return 'provide_mock_verifier_identifiers';
  if (blockers.has('operator_review_mode_forbidden') || blockers.has('operator_review_mode_unsupported')) return 'remove_forbidden_operator_review_mode';
  if (blockers.has('review_audience_forbidden') || blockers.has('review_audience_unsupported')) return 'remove_forbidden_review_audience';
  if (blockers.has('review_purpose_execution_forbidden') || blockers.has('public_readiness_or_execution_overclaim')) return 'remove_execution_review_purpose';
  if (blockers.has('review_sections_missing')) return 'add_mock_review_sections';
  if (blockers.has('required_reviewer_checks_missing')) return 'add_required_reviewer_checks';
  if (Array.from(blockers).some((code) => code.startsWith('not_authorized_action_missing')) || blockers.has('not_authorized_actions_missing')) return 'add_not_authorized_action_categories';
  if (blockers.has('mock_only_not_verified') || blockers.has('zero_real_rows_not_verified') || blockers.has('no_actual_access_not_verified')) return 'verify_mock_plan_before_review_packet';
  if (blockers.has('redaction_plan_not_verified')) return 'add_required_redaction_plan';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (needsReview.size > 0) return 'collect_operator_mock_review_packet_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY') return 'prepare_pr_d8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate';
  return 'collect_operator_mock_review_packet_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacketInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewPacket {
  const blockers = new Set<string>();
  const needsReview = new Set<string>();
  const verifier = input.mockPlanVerifier;
  const verifierStatus = String(input.mockPlanVerifierStatus || verifier?.status || 'missing');
  if (!verifier && !hasText(input.mockPlanVerifierStatus)) blockers.add('mock_plan_verifier_missing');
  if (verifierStatus !== 'SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY') {
    if (verifierStatus === 'NEEDS_REVIEW') needsReview.add('mock_plan_verifier_needs_review');
    else blockers.add('mock_plan_verifier_not_ready');
  }

  const mockReviewPacketId = String(input.mockReviewPacketId || 'missing');
  const verifierId = String(input.verifierId || verifier?.verifierId || 'missing');
  const mockPlanId = String(input.mockPlanId || verifier?.mockPlanId || 'missing');
  const sourceAccessPlanId = String(input.sourceAccessPlanId || verifier?.sourceAccessPlanId || 'missing');
  const decisionGateId = String(input.decisionGateId || verifier?.decisionGateId || 'missing');
  const reviewPacketId = String(input.reviewPacketId || verifier?.reviewPacketId || 'missing');
  const sourceHeadSha = String(input.sourceHeadSha || verifier?.sourceHeadSha || 'missing');
  if (!hasText(input.mockReviewPacketId)) blockers.add('mock_review_packet_id_missing');
  if (verifierId === 'missing' || !hasText(verifierId)) blockers.add('verifier_id_missing');
  if (mockPlanId === 'missing' || !hasText(mockPlanId)) blockers.add('mock_plan_id_missing');
  if (sourceAccessPlanId === 'missing' || !hasText(sourceAccessPlanId)) blockers.add('source_access_plan_id_missing');
  if (decisionGateId === 'missing' || !hasText(decisionGateId)) blockers.add('decision_gate_id_missing');
  if (reviewPacketId === 'missing' || !hasText(reviewPacketId)) blockers.add('review_packet_id_missing');
  if (sourceHeadSha === 'missing' || !hasText(sourceHeadSha)) blockers.add('source_head_sha_missing');

  (verifier?.blockers || input.blockers || []).forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  (verifier?.needsReviewReasons || input.needsReviewReasons || []).forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });
  (input.deferredEntityTypes || []).forEach((entity) => {
    if (hasText(entity)) needsReview.add(`deferred_entity:${normalize(String(entity))}`);
  });

  verifyModeAndAudience(input, blockers, needsReview);
  verifyPurpose(input, blockers);
  verifySections(input, blockers, needsReview);
  verifyReviewerChecks(input, blockers, needsReview);
  verifyNotAuthorized(input, blockers);
  verifyVerifierBooleans(input, blockers, needsReview);
  verifySummary(input, blockers);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const nextAction = String(input.nextSafeAction || '');
  if (nextAction && nextAction !== 'prepare_pr_d8ah_actual_safe_row_export_read_only_source_candidate_mock_review_decision_gate') {
    const label = normalizeLabel(nextAction);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => label.includes(normalizeLabel(forbidden)))) blockers.add('next_safe_action_forbidden');
  }

  const blockerList = compact(blockers);
  const needsReviewList = compact(needsReview);
  const status: MockReviewPacketStatus = blockerList.length > 0
    ? 'BLOCKED'
    : needsReviewList.length > 0
      ? 'NEEDS_REVIEW'
      : 'SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY';
  const verificationSummary = input.verificationSummary || verifier?.verificationSummary || {
    mockOnly: false,
    zeroRealRows: false,
    noActualAccess: false,
    sourceAccessAuthorized: false,
    actualDbReadAuthorized: false,
    actualDbExportAuthorized: false,
    jsonlExportAuthorized: false,
    runtimeReady: false,
    stagingReady: false,
    productionReady: false
  };
  const redaction = input.redactionPlanVerified ?? verifier?.redactionPlanVerified ?? 'unknown';

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_TRACE_LABEL,
    mockReviewPacketId,
    verifierId,
    mockPlanId,
    sourceAccessPlanId,
    decisionGateId,
    reviewPacketId,
    sourceHeadSha,
    mockPlanVerifierStatus: verifierStatus,
    mockPlanVerifierKind: String(input.mockPlanVerifierKind || verifier?.kind || 'missing'),
    mockPlanVerifierTraceLabel: String(input.mockPlanVerifierTraceLabel || verifier?.traceLabel || 'missing'),
    operatorReviewMode: normalize(String(input.operatorReviewMode || 'missing')),
    reviewAudience: normalize(String(input.reviewAudience || 'missing')),
    reviewPurpose: String(input.reviewPurpose || 'mock review packet only'),
    reviewSections: compact(input.reviewSections || []),
    requiredReviewerChecks: unique(input.requiredReviewerChecks || []),
    notAuthorizedActions: unique(input.notAuthorizedActions || REQUIRED_NOT_AUTHORIZED),
    verificationSummary,
    mockOnlySummary: { verified: input.mockOnlyVerified ?? verifier?.mockOnlyVerified ?? false, safeSummaryOnly: true },
    zeroRealRowsSummary: { verified: input.zeroRealRowsVerified ?? verifier?.zeroRealRowsVerified ?? false, safeSummaryOnly: true },
    noActualAccessSummary: { verified: input.noActualAccessVerified ?? verifier?.noActualAccessVerified ?? false, safeSummaryOnly: true },
    safeEvidenceOriginSummary: { verified: input.safeEvidenceOriginsVerified ?? verifier?.safeEvidenceOriginsVerified ?? false, safeSummaryOnly: true },
    forbiddenFieldsSummary: { verified: input.forbiddenFieldsVerified ?? verifier?.forbiddenFieldsVerified ?? false, notAuthorizedActionCount: unique(input.notAuthorizedActions || REQUIRED_NOT_AUTHORIZED).length, safeSummaryOnly: true },
    redactionPlanSummary: { verified: redaction, safeSummaryOnly: true },
    preconditionSummary: { verified: input.preconditionsVerified ?? verifier?.preconditionsVerified ?? false, safeSummaryOnly: true },
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
