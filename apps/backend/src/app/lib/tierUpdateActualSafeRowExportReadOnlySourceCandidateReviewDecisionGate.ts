import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_DECISION_GATE_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_review_decision_gate' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_DECISION_GATE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_DECISION_GATE_TRACE_LABEL =
  'd8ac_actual_safe_row_export_read_only_source_candidate_review_decision_gate' as const;

type ReviewDecisionGateStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_CANDIDATE_REVIEW_DECISION_READY';
type DecisionReadiness = 'blocked' | 'needs_review' | 'ready_for_owner_decision_boundary';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_review_packet'
  | 'provide_review_decision_gate_id'
  | 'provide_review_packet_id'
  | 'provide_source_head_sha'
  | 'provide_safe_allowed_decision_options'
  | 'remove_forbidden_decision_option'
  | 'remove_forbidden_boundary_flag'
  | 'remove_unsafe_decision_label'
  | 'collect_operator_review_decision_boundary_review'
  | 'prepare_pr_d8ad_actual_safe_row_export_read_only_source_access_plan_boundary';
type AllowedDecisionOption =
  | 'request_d8ad_safe_source_access_plan_boundary'
  | 'request_more_fixture_review'
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

type BoundaryFlagInput = {
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGateInput = BoundaryFlagInput & {
  reviewPacket?: TierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket | null;
  reviewPacketStatus?: string | null;
  reviewPacketKind?: string | null;
  reviewPacketTraceLabel?: string | null;
  reviewPacketId?: string | null;
  decisionGateId?: string | null;
  sourceHeadSha?: string | null;
  ownerIntentMode?: string | null;
  decisionRequestLabel?: string | null;
  manualDecisionRequired?: boolean;
  allowedDecisionOptions?: string[];
  forbiddenDecisionOptions?: string[];
  operatorChecklist?: string[];
  reviewSectionsSummary?: string[];
  boundarySummary?: BoundaryFlagInput | null;
  blockers?: string[];
  needsReviewReasons?: string[];
  deferredEntityTypes?: string[];
  unsupportedEntityTypes?: string[];
  rowCount?: number;
  readyRowCount?: number;
  d8abNextSafeAction?: string | null;
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_DECISION_GATE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_DECISION_GATE_SCHEMA_VERSION;
  status: ReviewDecisionGateStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_DECISION_GATE_TRACE_LABEL;
  decisionGateId: string;
  reviewPacketId: string;
  sourceHeadSha: string;
  reviewPacketStatus: string;
  reviewPacketKind: string;
  reviewPacketTraceLabel: string;
  ownerIntentMode: string;
  decisionRequestLabel: string;
  decisionReadiness: DecisionReadiness;
  manualDecisionRequired: boolean;
  allowedDecisionOptions: AllowedDecisionOption[];
  forbiddenDecisionOptions: ForbiddenDecisionOption[];
  operatorChecklist: string[];
  reviewSectionsSummary: string[];
  deferredEntityTypes: string[];
  unsupportedEntityTypes: string[];
  rowCount: number;
  readyRowCount: number;
  boundarySummary: {
    actualDbExport: false;
    realDbQuery: false;
    sourceAccess: false;
    prismaClient: false;
    databaseUrlRead: false;
    envRead: false;
    networkRpcWalletContractTxAccess: false;
    fileExport: false;
    jsonlFileExport: false;
    artifactUpload: false;
    dockerSmokeChange: false;
    stagingNoTxPass: false;
    runtimeReadiness: false;
    productionReadiness: false;
    safeSummaryOnly: true;
  };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const SAFE_ALLOWED_DECISION_OPTIONS: AllowedDecisionOption[] = [
  'request_d8ad_safe_source_access_plan_boundary',
  'request_more_fixture_review',
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

const OPERATOR_CHECKLIST = [
  'verify D8AB review packet is ready',
  'verify owner decision remains boundary-only',
  'verify manual owner decision is required before future source plan',
  'verify no actual DB export',
  'verify no real DB query',
  'verify no source access',
  'verify no Prisma client',
  'verify no DATABASE_URL read',
  'verify no env read',
  'verify no network/RPC/wallet/contract/tx access',
  'verify no file export',
  'verify no JSONL file export',
  'verify no artifact upload',
  'verify no Docker smoke change',
  'verify no staging no-tx PASS',
  'verify no runtime readiness',
  'verify no production readiness'
] as const;

const FORBIDDEN_ACTION_LABELS = [
  'actualdbquery',
  'actualdbexport',
  'sourceaccess',
  'opensourceaccess',
  'runactualdbquery',
  'runactualdbexport',
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
] as const;

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
  'localimagepath',
  'databaseurl',
  'dburl'
] as const;

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
const normalizeLabel = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
const hasText = (value: unknown): boolean => value !== undefined && value !== null && String(value).trim().length > 0;
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean))).sort().slice(0, 12);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean))).sort();

function addBoundaryFlagBlockers(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGateInput,
  blockers: Set<string>
): void {
  const flagMap: Array<[keyof BoundaryFlagInput, string]> = [
    ['actualDbQueryEnabled', 'real_db_query_forbidden'],
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
  flagMap.forEach(([flag, code]) => {
    if (input[flag] === true || input.boundaryFlags?.[flag] === true || input.boundarySummary?.[flag] === true) {
      blockers.add(code);
    }
  });
}

function collectUnsafeLabels(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGateInput,
  blockers: Set<string>
): void {
  const labels = [
    input.reviewPacketId,
    input.decisionGateId,
    input.ownerIntentMode,
    input.decisionRequestLabel,
    input.d8abNextSafeAction,
    ...(input.allowedDecisionOptions || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const normalizedAction = normalize(label);
    const isAllowedDecisionBoundary = (SAFE_ALLOWED_DECISION_OPTIONS as readonly string[]).includes(normalizedAction)
      || normalizedAction === 'prepare_pr_d8ad_actual_safe_row_export_read_only_source_access_plan_boundary';
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) {
      blockers.add('unsafe_decision_label');
    }
    if (!isAllowedDecisionBoundary && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
    }
  });
}

function collectAllowedDecisionOptions(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGateInput): string[] {
  return compact(input.allowedDecisionOptions || []);
}

function collectForbiddenDecisionOptions(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGateInput): string[] {
  return unique(input.forbiddenDecisionOptions || REQUIRED_FORBIDDEN_DECISION_OPTIONS);
}

function evaluateDecisionOptions(
  allowedDecisionOptions: string[],
  forbiddenDecisionOptions: string[],
  blockers: Set<string>,
  missing: Set<string>
): void {
  if (allowedDecisionOptions.length === 0) {
    blockers.add('allowed_decision_options_missing');
    missing.add('allowed_decision_options');
  }
  allowedDecisionOptions.forEach((option) => {
    const normalized = normalize(option);
    if (!(SAFE_ALLOWED_DECISION_OPTIONS as readonly string[]).includes(normalized)) {
      blockers.add('unsupported_allowed_decision_option');
    }
    if ((REQUIRED_FORBIDDEN_DECISION_OPTIONS as readonly string[]).includes(normalized)) {
      blockers.add('forbidden_allowed_decision_option');
    }
  });
  const forbiddenSet = new Set(forbiddenDecisionOptions.map(normalize));
  REQUIRED_FORBIDDEN_DECISION_OPTIONS.forEach((option) => {
    if (!forbiddenSet.has(option)) missing.add(`forbidden_decision_option:${option}`);
  });
}

function determineStatus(
  blockers: Set<string>,
  missing: Set<string>,
  needsReview: Set<string>
): ReviewDecisionGateStatus {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || needsReview.size > 0) return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_REVIEW_DECISION_READY';
}

function determineNextSafeAction(
  blockers: Set<string>,
  missing: Set<string>,
  needsReview: Set<string>,
  status: ReviewDecisionGateStatus
): NextSafeAction {
  if (blockers.has('review_packet_missing') || blockers.has('review_packet_not_ready')) {
    return 'build_actual_safe_row_export_read_only_source_candidate_review_packet';
  }
  if (blockers.has('decision_gate_id_missing')) return 'provide_review_decision_gate_id';
  if (blockers.has('review_packet_id_missing')) return 'provide_review_packet_id';
  if (blockers.has('source_head_sha_missing')) return 'provide_source_head_sha';
  if (blockers.has('allowed_decision_options_missing') || missing.has('allowed_decision_options')) {
    return 'provide_safe_allowed_decision_options';
  }
  if (blockers.has('forbidden_allowed_decision_option') || blockers.has('unsupported_allowed_decision_option')) {
    return 'remove_forbidden_decision_option';
  }
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_decision_label') || blockers.has('public_readiness_or_execution_overclaim')) {
    return 'remove_unsafe_decision_label';
  }
  if (needsReview.size > 0 || missing.size > 0) return 'collect_operator_review_decision_boundary_review';
  if (status === 'SOURCE_CANDIDATE_REVIEW_DECISION_READY') {
    return 'prepare_pr_d8ad_actual_safe_row_export_read_only_source_access_plan_boundary';
  }
  return 'collect_operator_review_decision_boundary_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGateInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const needsReview = new Set<string>();

  const reviewPacket = input.reviewPacket;
  const reviewPacketStatus = String(input.reviewPacketStatus || reviewPacket?.status || 'missing');
  if (!reviewPacket && !hasText(input.reviewPacketStatus)) blockers.add('review_packet_missing');
  if (reviewPacketStatus !== 'SOURCE_CANDIDATE_REVIEW_PACKET_READY') {
    if (reviewPacketStatus === 'NEEDS_REVIEW') needsReview.add('review_packet_needs_review');
    else blockers.add('review_packet_not_ready');
  }

  const reviewPacketId = String(input.reviewPacketId || reviewPacket?.reviewPacketId || 'missing');
  const sourceHeadSha = String(input.sourceHeadSha || reviewPacket?.sourceHeadSha || 'missing');
  const decisionGateId = String(input.decisionGateId || 'missing');
  if (!hasText(input.decisionGateId)) blockers.add('decision_gate_id_missing');
  if (reviewPacketId === 'missing' || !hasText(reviewPacketId)) blockers.add('review_packet_id_missing');
  if (sourceHeadSha === 'missing' || !hasText(sourceHeadSha)) blockers.add('source_head_sha_missing');

  (reviewPacket?.blockers || input.blockers || []).forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  (reviewPacket?.needsReviewReasons || input.needsReviewReasons || []).forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });
  if (input.manualDecisionRequired === false && needsReview.size > 0) {
    blockers.add('manual_decision_required_for_needs_review');
  }
  if (input.manualDecisionRequired === undefined && needsReview.size === 0) {
    needsReview.add('manual_decision_requirement_unspecified');
  }
  if (!hasText(input.ownerIntentMode)) needsReview.add('owner_intent_mode_missing');
  if (['direct_source_access', 'actual_db_query', 'runtime_ready'].includes(normalize(String(input.ownerIntentMode || '')))) {
    blockers.add('owner_intent_mode_forbidden');
  }

  const allowedDecisionOptions = collectAllowedDecisionOptions(input);
  const forbiddenDecisionOptions = collectForbiddenDecisionOptions(input);
  evaluateDecisionOptions(allowedDecisionOptions, forbiddenDecisionOptions, blockers, missing);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const deferredEntityTypes = compact(input.deferredEntityTypes || reviewPacket?.deferredEntityTypes || []);
  const unsupportedEntityTypes = compact(input.unsupportedEntityTypes || reviewPacket?.unsupportedEntityTypes || []);
  if (deferredEntityTypes.length > 0 || unsupportedEntityTypes.length > 0) {
    needsReview.add('deferred_or_unsupported_entity_isolated');
  }

  const blockerList = compact(blockers);
  const needsReviewReasons = compact(needsReview);
  const status = determineStatus(blockers, missing, needsReview);
  const nextSafeAction = determineNextSafeAction(blockers, missing, needsReview, status);
  const readyOptions = allowedDecisionOptions.filter((option): option is AllowedDecisionOption => (
    (SAFE_ALLOWED_DECISION_OPTIONS as readonly string[]).includes(option)
  ));

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_DECISION_GATE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_DECISION_GATE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_DECISION_GATE_TRACE_LABEL,
    decisionGateId,
    reviewPacketId,
    sourceHeadSha,
    reviewPacketStatus,
    reviewPacketKind: String(input.reviewPacketKind || reviewPacket?.kind || 'missing'),
    reviewPacketTraceLabel: String(input.reviewPacketTraceLabel || reviewPacket?.traceLabel || 'missing'),
    ownerIntentMode: String(input.ownerIntentMode || 'missing'),
    decisionRequestLabel: String(input.decisionRequestLabel || 'missing'),
    decisionReadiness: status === 'SOURCE_CANDIDATE_REVIEW_DECISION_READY'
      ? 'ready_for_owner_decision_boundary'
      : status === 'NEEDS_REVIEW'
        ? 'needs_review'
        : 'blocked',
    manualDecisionRequired: input.manualDecisionRequired !== false,
    allowedDecisionOptions: readyOptions,
    forbiddenDecisionOptions: [...REQUIRED_FORBIDDEN_DECISION_OPTIONS],
    operatorChecklist: unique([...(input.operatorChecklist || reviewPacket?.operatorChecklist || []), ...OPERATOR_CHECKLIST]),
    reviewSectionsSummary: compact(input.reviewSectionsSummary || Object.keys(reviewPacket?.reviewSections || {})),
    deferredEntityTypes,
    unsupportedEntityTypes,
    rowCount: input.rowCount ?? reviewPacket?.rowCount ?? 0,
    readyRowCount: input.readyRowCount ?? reviewPacket?.readyRowCount ?? 0,
    boundarySummary: {
      actualDbExport: false,
      realDbQuery: false,
      sourceAccess: false,
      prismaClient: false,
      databaseUrlRead: false,
      envRead: false,
      networkRpcWalletContractTxAccess: false,
      fileExport: false,
      jsonlFileExport: false,
      artifactUpload: false,
      dockerSmokeChange: false,
      stagingNoTxPass: false,
      runtimeReadiness: false,
      productionReadiness: false,
      safeSummaryOnly: true
    },
    blockerCount: blockerList.length,
    blockers: blockerList,
    needsReviewReasonCount: needsReviewReasons.length,
    needsReviewReasons,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')).length,
    unsafeReasonCodes: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')),
    nextSafeAction
  };
}
