import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_TRACE_LABEL =
  'd8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet' as const;

type MockReviewDecisionPacketStatus =
  | 'BLOCKED'
  | 'NEEDS_REVIEW'
  | 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY';
type PacketAudience = 'owner' | 'operator' | 'reviewer' | 'codex_summary_only';
type PacketPurpose =
  | 'mock_decision_packet_only'
  | 'fixture_decision_packet_only'
  | 'plan_shape_decision_packet_only'
  | 'owner_scope_decision_packet_only';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier'
  | 'provide_mock_review_decision_packet_id'
  | 'provide_mock_review_decision_packet_identifiers'
  | 'remove_forbidden_packet_audience'
  | 'remove_forbidden_packet_purpose'
  | 'add_mock_review_decision_packet_sections'
  | 'add_owner_decision_summary'
  | 'add_operator_decision_summary'
  | 'add_not_authorized_action_categories'
  | 'add_required_preconditions'
  | 'add_mock_decision_packet_checklist'
  | 'verify_mock_review_decision_boundary'
  | 'remove_forbidden_boundary_flag'
  | 'remove_unsafe_decision_packet_label'
  | 'collect_operator_mock_review_decision_packet_review'
  | 'prepare_pr_d8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier';

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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput = BoundaryFlagInput & {
  mockReviewDecisionVerifier?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionVerifier | null;
  mockReviewDecisionVerifierStatus?: string | null;
  mockReviewDecisionVerifierKind?: string | null;
  mockReviewDecisionVerifierTraceLabel?: string | null;
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
  allowedDecisionOptionsSummary?: SafeSummary | null;
  forbiddenDecisionOptionsSummary?: SafeSummary | null;
  decisionChecklistSummary?: SafeSummary | null;
  boundarySummary?: BoundaryFlagInput | null;
  blockers?: string[];
  needsReviewReasons?: string[];
  deferredEntityTypes?: string[];
  nextSafeAction?: string | null;
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SCHEMA_VERSION;
  status: MockReviewDecisionPacketStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_TRACE_LABEL;
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
  mockReviewDecisionVerifierStatus: string;
  mockReviewDecisionVerifierKind: string;
  mockReviewDecisionVerifierTraceLabel: string;
  packetAudience: string;
  packetPurpose: string;
  packetSections: string[];
  ownerDecisionSummary: string;
  operatorDecisionSummary: string;
  notAuthorizedActions: string[];
  requiredPreconditions: string[];
  packetChecklist: string[];
  mockOnlyDecisionSummary: SafeSummary;
  noActualAccessSummary: SafeSummary;
  noRuntimeReadinessSummary: SafeSummary;
  allowedDecisionOptionsSummary: SafeSummary;
  forbiddenDecisionOptionsSummary: SafeSummary;
  decisionChecklistSummary: SafeSummary;
  boundarySummary: Required<BoundaryFlagInput> & { safeSummaryOnly: true };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const ALLOWED_PACKET_AUDIENCES: PacketAudience[] = ['owner', 'operator', 'reviewer', 'codex_summary_only'];
const ALLOWED_PACKET_PURPOSES: PacketPurpose[] = [
  'mock_decision_packet_only',
  'fixture_decision_packet_only',
  'plan_shape_decision_packet_only',
  'owner_scope_decision_packet_only'
];
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
const SAFE_NEXT_ACTION_READY =
  'prepare_pr_d8ak_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet_verifier';
const D8AI_NEXT_ACTION =
  'prepare_pr_d8aj_actual_safe_row_export_read_only_source_candidate_mock_review_decision_packet';
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
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort().slice(0, 20);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort();

function safeSummary(value: SafeSummary | null | undefined, fallback = false): SafeSummary {
  return { verified: value?.verified === true || fallback, safeSummaryOnly: true };
}

function buildBoundarySummary(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput
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
    ...(input.mockReviewDecisionVerifier?.boundarySummary || {}),
    ...(input.boundarySummary || {}),
    ...(input.boundaryFlags || {}),
    safeSummaryOnly: true
  };
}

function addBoundaryFlagBlockers(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput,
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
      || input.mockReviewDecisionVerifier?.boundarySummary?.[flag] === true) {
      blockers.add(code);
    }
  });
}

function collectUnsafeLabels(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput,
  blockers: Set<string>
): void {
  const labels = [
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
      || action === D8AI_NEXT_ACTION
      || action === SAFE_NEXT_ACTION_READY;
    if (!isSafeNegative && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
      return;
    }
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_mock_review_decision_packet_label');
  });
}

function requireText(value: unknown, code: string, blockers: Set<string>): string {
  if (!hasText(value)) blockers.add(code);
  return hasText(value) ? String(value) : 'missing';
}

function evaluatePacketAudienceAndPurpose(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput,
  blockers: Set<string>,
  needsReview: Set<string>
): { packetAudience: string; packetPurpose: string } {
  const packetAudience = input.packetAudience === null ? 'missing' : normalize(String(input.packetAudience || 'missing'));
  const packetPurpose = input.packetPurpose === null ? 'missing' : normalize(String(input.packetPurpose || 'missing'));
  if (packetAudience === 'missing') needsReview.add('packet_audience_missing');
  else if (!(ALLOWED_PACKET_AUDIENCES as readonly string[]).includes(packetAudience)) blockers.add('packet_audience_forbidden');
  if (packetPurpose === 'missing') needsReview.add('packet_purpose_missing');
  else if (!(ALLOWED_PACKET_PURPOSES as readonly string[]).includes(packetPurpose)) blockers.add('packet_purpose_forbidden');
  if (FORBIDDEN_ACTION_LABELS.some((label) => normalizeLabel(packetPurpose).includes(label))) blockers.add('packet_purpose_forbidden');
  return { packetAudience, packetPurpose };
}

function evaluateRequiredList(
  provided: string[] | undefined,
  required: string[],
  absentCode: string,
  missingPrefix: string,
  blockers: Set<string>
): string[] {
  const normalized = new Set((provided || []).map(normalize));
  if (!provided || provided.length === 0) blockers.add(absentCode);
  required.forEach((item) => {
    if (!normalized.has(normalize(item))) blockers.add(`${missingPrefix}:${normalize(item)}`);
  });
  return unique(provided || []);
}

function evaluatePacketChecklist(
  checklist: string[] | undefined,
  blockers: Set<string>,
  needsReview: Set<string>
): string[] {
  const text = (checklist || []).join(' ').toLowerCase();
  if (!checklist || checklist.length === 0) blockers.add('packet_checklist_missing');
  REQUIRED_CHECKLIST_ITEMS.forEach((item) => {
    if (!text.includes(item)) {
      if ((checklist || []).length <= 1) needsReview.add(`packet_checklist_incomplete:${normalize(item)}`);
      else blockers.add(`packet_checklist_missing_required:${normalize(item)}`);
    }
  });
  return unique(checklist || []);
}

function evaluateVerifier(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput,
  blockers: Set<string>,
  needsReview: Set<string>
): string {
  const verifier = input.mockReviewDecisionVerifier;
  const status = String(input.mockReviewDecisionVerifierStatus || verifier?.status || 'missing');
  if (!verifier && !hasText(input.mockReviewDecisionVerifierStatus)) blockers.add('mock_review_decision_verifier_missing');
  if (status !== 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY') {
    if (status === 'NEEDS_REVIEW') needsReview.add('mock_review_decision_verifier_needs_review');
    else blockers.add('mock_review_decision_verifier_not_ready');
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

function evaluateSummaries(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput,
  blockers: Set<string>
): void {
  const verifier = input.mockReviewDecisionVerifier;
  const checks: Array<[boolean, string]> = [
    [input.mockOnlyDecisionSummary?.verified === true || verifier?.verificationSummary.mockOnlyDecision === true, 'mock_only_decision_summary_not_verified'],
    [input.noActualAccessSummary?.verified === true || verifier?.verificationSummary.noActualAccess === true, 'no_actual_access_summary_not_verified'],
    [input.noRuntimeReadinessSummary?.verified === true || verifier?.verificationSummary.noRuntimeReadiness === true, 'no_runtime_readiness_summary_not_verified'],
    [input.allowedDecisionOptionsSummary?.verified === true || verifier?.verificationSummary.allowedDecisionOptions === true, 'allowed_decision_options_summary_not_verified'],
    [input.forbiddenDecisionOptionsSummary?.verified === true || verifier?.verificationSummary.forbiddenDecisionOptions === true, 'forbidden_decision_options_summary_not_verified'],
    [input.decisionChecklistSummary?.verified === true || verifier?.verificationSummary.decisionChecklist === true, 'decision_checklist_summary_not_verified']
  ];
  checks.forEach(([verified, code]) => {
    if (!verified) blockers.add(code);
  });
}

function evaluateNextSafeAction(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput,
  blockers: Set<string>
): void {
  const action = String(input.nextSafeAction || input.mockReviewDecisionVerifier?.nextSafeAction || '');
  if (action && action !== D8AI_NEXT_ACTION && action !== SAFE_NEXT_ACTION_READY) {
    const label = normalizeLabel(action);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => label.includes(normalizeLabel(forbidden)))) blockers.add('next_safe_action_forbidden');
  }
}

function determineStatus(
  blockers: Set<string>,
  needsReview: Set<string>
): MockReviewDecisionPacketStatus {
  if (blockers.size > 0) return 'BLOCKED';
  if (needsReview.size > 0) return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY';
}

function determineNextSafeAction(
  blockers: Set<string>,
  needsReview: Set<string>,
  status: MockReviewDecisionPacketStatus
): NextSafeAction {
  if (blockers.has('mock_review_decision_verifier_missing') || blockers.has('mock_review_decision_verifier_not_ready')) return 'build_actual_safe_row_export_read_only_source_candidate_mock_review_decision_verifier';
  if (blockers.has('mock_review_decision_packet_id_missing')) return 'provide_mock_review_decision_packet_id';
  if (Array.from(blockers).some((code) => code.endsWith('_id_missing') || code === 'source_head_sha_missing')) return 'provide_mock_review_decision_packet_identifiers';
  if (blockers.has('packet_audience_forbidden')) return 'remove_forbidden_packet_audience';
  if (blockers.has('packet_purpose_forbidden')) return 'remove_forbidden_packet_purpose';
  if (blockers.has('packet_sections_missing') || Array.from(blockers).some((code) => code.startsWith('packet_section_missing'))) return 'add_mock_review_decision_packet_sections';
  if (blockers.has('owner_decision_summary_missing')) return 'add_owner_decision_summary';
  if (blockers.has('operator_decision_summary_missing')) return 'add_operator_decision_summary';
  if (blockers.has('not_authorized_actions_missing') || Array.from(blockers).some((code) => code.startsWith('not_authorized_action_missing'))) return 'add_not_authorized_action_categories';
  if (blockers.has('required_preconditions_missing') || Array.from(blockers).some((code) => code.startsWith('required_precondition_missing'))) return 'add_required_preconditions';
  if (blockers.has('packet_checklist_missing') || Array.from(blockers).some((code) => code.startsWith('packet_checklist_missing_required'))) return 'add_mock_decision_packet_checklist';
  if (Array.from(blockers).some((code) => code.endsWith('_not_verified'))) return 'verify_mock_review_decision_boundary';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_mock_review_decision_packet_label') || blockers.has('public_readiness_or_execution_overclaim')) return 'remove_unsafe_decision_packet_label';
  if (needsReview.size > 0) return 'collect_operator_mock_review_decision_packet_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY') return SAFE_NEXT_ACTION_READY;
  return 'collect_operator_mock_review_decision_packet_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacketInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockReviewDecisionPacket {
  const blockers = new Set<string>();
  const needsReview = new Set<string>();
  const verifier = input.mockReviewDecisionVerifier;
  const mockReviewDecisionVerifierStatus = evaluateVerifier(input, blockers, needsReview);
  const mockReviewDecisionPacketId = requireText(input.mockReviewDecisionPacketId, 'mock_review_decision_packet_id_missing', blockers);
  const decisionVerifierId = requireText(input.decisionVerifierId || verifier?.decisionVerifierId, 'decision_verifier_id_missing', blockers);
  const mockReviewDecisionGateId = requireText(input.mockReviewDecisionGateId || verifier?.mockReviewDecisionGateId, 'mock_review_decision_gate_id_missing', blockers);
  const mockReviewPacketId = requireText(input.mockReviewPacketId || verifier?.mockReviewPacketId, 'mock_review_packet_id_missing', blockers);
  const verifierId = requireText(input.verifierId || verifier?.verifierId, 'verifier_id_missing', blockers);
  const mockPlanId = requireText(input.mockPlanId || verifier?.mockPlanId, 'mock_plan_id_missing', blockers);
  const sourceAccessPlanId = requireText(input.sourceAccessPlanId || verifier?.sourceAccessPlanId, 'source_access_plan_id_missing', blockers);
  const decisionGateId = requireText(input.decisionGateId || verifier?.decisionGateId, 'decision_gate_id_missing', blockers);
  const reviewPacketId = requireText(input.reviewPacketId || verifier?.reviewPacketId, 'review_packet_id_missing', blockers);
  const sourceHeadSha = requireText(input.sourceHeadSha || verifier?.sourceHeadSha, 'source_head_sha_missing', blockers);
  const { packetAudience, packetPurpose } = evaluatePacketAudienceAndPurpose(input, blockers, needsReview);
  const packetSections = evaluateRequiredList(
    input.packetSections,
    REQUIRED_PACKET_SECTIONS,
    'packet_sections_missing',
    'packet_section_missing',
    blockers
  );
  if (input.packetSections && input.packetSections.length > 0 && input.packetSections.length < REQUIRED_PACKET_SECTIONS.length) {
    [...blockers].forEach((code) => {
      if (code.startsWith('packet_section_missing:')) blockers.delete(code);
    });
    needsReview.add('packet_sections_incomplete');
  }
  const ownerDecisionSummary = requireText(input.ownerDecisionSummary, 'owner_decision_summary_missing', blockers);
  const operatorDecisionSummary = requireText(input.operatorDecisionSummary, 'operator_decision_summary_missing', blockers);
  const notAuthorizedActions = evaluateRequiredList(
    input.notAuthorizedActions,
    REQUIRED_NOT_AUTHORIZED_ACTIONS,
    'not_authorized_actions_missing',
    'not_authorized_action_missing',
    blockers
  );
  const requiredPreconditions = evaluateRequiredList(
    input.requiredPreconditions,
    REQUIRED_PRECONDITIONS,
    'required_preconditions_missing',
    'required_precondition_missing',
    blockers
  );
  const packetChecklist = evaluatePacketChecklist(input.packetChecklist, blockers, needsReview);
  evaluateSummaries(input, blockers);
  evaluateNextSafeAction(input, blockers);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const blockerList = compact(blockers);
  const needsReviewList = compact(needsReview);
  const status = determineStatus(blockers, needsReview);
  const mockOnlyDecisionVerified = input.mockOnlyDecisionSummary?.verified === true || verifier?.verificationSummary.mockOnlyDecision === true;
  const noActualAccessVerified = input.noActualAccessSummary?.verified === true || verifier?.verificationSummary.noActualAccess === true;
  const noRuntimeReadinessVerified = input.noRuntimeReadinessSummary?.verified === true || verifier?.verificationSummary.noRuntimeReadiness === true;
  const allowedDecisionOptionsVerified = input.allowedDecisionOptionsSummary?.verified === true || verifier?.verificationSummary.allowedDecisionOptions === true;
  const forbiddenDecisionOptionsVerified = input.forbiddenDecisionOptionsSummary?.verified === true || verifier?.verificationSummary.forbiddenDecisionOptions === true;
  const decisionChecklistVerified = input.decisionChecklistSummary?.verified === true || verifier?.verificationSummary.decisionChecklist === true;

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_TRACE_LABEL,
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
    mockReviewDecisionVerifierStatus,
    mockReviewDecisionVerifierKind: String(input.mockReviewDecisionVerifierKind || verifier?.kind || 'missing'),
    mockReviewDecisionVerifierTraceLabel: String(input.mockReviewDecisionVerifierTraceLabel || verifier?.traceLabel || 'missing'),
    packetAudience,
    packetPurpose,
    packetSections,
    ownerDecisionSummary,
    operatorDecisionSummary,
    notAuthorizedActions,
    requiredPreconditions,
    packetChecklist,
    mockOnlyDecisionSummary: safeSummary(input.mockOnlyDecisionSummary, mockOnlyDecisionVerified),
    noActualAccessSummary: safeSummary(input.noActualAccessSummary, noActualAccessVerified),
    noRuntimeReadinessSummary: safeSummary(input.noRuntimeReadinessSummary, noRuntimeReadinessVerified),
    allowedDecisionOptionsSummary: safeSummary(input.allowedDecisionOptionsSummary, allowedDecisionOptionsVerified),
    forbiddenDecisionOptionsSummary: safeSummary(input.forbiddenDecisionOptionsSummary, forbiddenDecisionOptionsVerified),
    decisionChecklistSummary: safeSummary(input.decisionChecklistSummary, decisionChecklistVerified),
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
