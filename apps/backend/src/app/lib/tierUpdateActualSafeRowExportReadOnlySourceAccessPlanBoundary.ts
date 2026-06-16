import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_ACCESS_PLAN_BOUNDARY_KIND =
  'tier_update_actual_safe_row_export_read_only_source_access_plan_boundary' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_ACCESS_PLAN_BOUNDARY_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_ACCESS_PLAN_BOUNDARY_TRACE_LABEL =
  'd8ad_actual_safe_row_export_read_only_source_access_plan_boundary' as const;

type SourceAccessPlanBoundaryStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_ACCESS_PLAN_BOUNDARY_READY';
type PlannedExecutionMode = 'plan_only' | 'review_only' | 'dry_run_design_only';
type PlannedAccessMode = 'no_access' | 'future_read_only_candidate' | 'review_packet_only';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_review_decision_gate'
  | 'provide_source_access_plan_id'
  | 'provide_review_decision_identifiers'
  | 'remove_forbidden_planned_execution_mode'
  | 'remove_forbidden_planned_access_mode'
  | 'remove_unsafe_source_table'
  | 'remove_unsafe_plan_field'
  | 'remove_unsafe_decision_label'
  | 'add_required_redaction_plan'
  | 'add_forbidden_action_categories'
  | 'remove_forbidden_boundary_flag'
  | 'collect_operator_source_access_plan_boundary_review'
  | 'prepare_pr_d8ae_actual_safe_row_export_read_only_source_candidate_mock_plan';

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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput = BoundaryFlagInput & {
  reviewDecisionGate?: TierUpdateActualSafeRowExportReadOnlySourceCandidateReviewDecisionGate | null;
  reviewDecisionGateStatus?: string | null;
  reviewDecisionKind?: string | null;
  reviewDecisionTraceLabel?: string | null;
  decisionGateId?: string | null;
  reviewPacketId?: string | null;
  sourceHeadSha?: string | null;
  ownerIntentMode?: string | null;
  decisionRequestLabel?: string | null;
  allowedDecisionOptions?: string[];
  forbiddenDecisionOptions?: string[];
  operatorChecklist?: string[];
  boundarySummary?: BoundaryFlagInput | null;
  blockers?: string[];
  needsReviewReasons?: string[];
  manualDecisionRequired?: boolean;
  plannedSourceTables?: string[];
  plannedEntityTypes?: string[];
  plannedSafeFields?: string[];
  plannedPublicEvidenceFields?: string[];
  plannedRedactedFields?: string[];
  plannedForbiddenFields?: string[];
  plannedExecutionMode?: string | null;
  plannedAccessMode?: string | null;
  sourceAccessPlanId?: string | null;
  d8acNextSafeAction?: string | null;
  requiredPreconditions?: string[];
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_ACCESS_PLAN_BOUNDARY_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_ACCESS_PLAN_BOUNDARY_SCHEMA_VERSION;
  status: SourceAccessPlanBoundaryStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_ACCESS_PLAN_BOUNDARY_TRACE_LABEL;
  sourceAccessPlanId: string;
  decisionGateId: string;
  reviewPacketId: string;
  sourceHeadSha: string;
  reviewDecisionGateStatus: string;
  reviewDecisionKind: string;
  reviewDecisionTraceLabel: string;
  plannedExecutionMode: string;
  plannedAccessMode: string;
  plannedSourceTables: string[];
  plannedEntityTypes: string[];
  plannedSafeFields: string[];
  plannedPublicEvidenceFields: string[];
  plannedRedactedFields: string[];
  plannedForbiddenFields: string[];
  planSummary: {
    planOnly: true;
    actualSourceAccessReady: false;
    actualDbReadReady: false;
    jsonlExportReady: false;
    runtimeReady: false;
    safeSummaryOnly: true;
  };
  operatorChecklist: string[];
  forbiddenActionSummary: string[];
  requiredPreconditions: string[];
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const ALLOWED_EXECUTION_MODES: PlannedExecutionMode[] = ['plan_only', 'review_only', 'dry_run_design_only'];
const FORBIDDEN_EXECUTION_MODES = new Set([
  'execute',
  'query',
  'export',
  'runtime',
  'worker',
  'cron',
  'route',
  'cli',
  'docker_smoke',
  'staging',
  'production'
]);
const ALLOWED_ACCESS_MODES: PlannedAccessMode[] = ['no_access', 'future_read_only_candidate', 'review_packet_only'];
const FORBIDDEN_ACCESS_MODES = new Set([
  'actual_db_read',
  'actual_source_access',
  'prisma_client',
  'database_url',
  'env_read',
  'network_rpc_wallet_contract_tx',
  'file_export',
  'jsonl_export',
  'artifact_upload'
]);
const SAFE_SOURCE_TABLES = new Set([
  'scheduled_tier_update_safe_summary',
  'job_run_safe_summary',
  'tx_receipt_evidence_safe_summary',
  'staging_evidence_safe_summary',
  'fixture_safe_summary',
  'evaluation_safe_summary',
  'test_safe_summary'
]);
const FORBIDDEN_SOURCE_TABLE_LABELS = [
  'userprivate',
  'walletprivate',
  'secret',
  'rawenv',
  'rawlog',
  'rawpayload',
  'rawendpoint',
  'privatepath',
  'databaseurl',
  'prizeruntimewrite',
  'nftruntimewrite',
  'tokenruntimewrite',
  'contractruntimestate'
];
const ALLOWED_ENTITY_TYPES = new Set([
  'scheduled_tier_update',
  'job_run',
  'tx_receipt_evidence',
  'staging_evidence',
  'fixture',
  'evaluation',
  'test'
]);
const DEFERRED_ENTITY_TYPES = new Set([
  'prize',
  'prize_transaction',
  'prize_transactions',
  'ticket_code',
  'nft_metadata',
  'token_detail',
  'wallet_summary'
]);
const REQUIRED_FORBIDDEN_FIELDS = [
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
const OPERATOR_CHECKLIST = [
  'verify source access plan remains plan-only',
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
  'localimagepath',
  'databaseurl',
  'dburl'
];
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
];

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
const normalizeLabel = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
const hasText = (value: unknown): boolean => value !== undefined && value !== null && String(value).trim().length > 0;
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort().slice(0, 16);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort();

function addBoundaryFlagBlockers(input: BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput, blockers: Set<string>): void {
  const flags: Array<[keyof BoundaryFlagInput, string]> = [
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
  flags.forEach(([flag, code]) => {
    if (input[flag] === true || input.boundaryFlags?.[flag] === true || input.boundarySummary?.[flag] === true) blockers.add(code);
  });
}

function collectUnsafeLabels(input: BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput, blockers: Set<string>): void {
  const labels = [
    input.sourceAccessPlanId,
    input.decisionGateId,
    input.reviewPacketId,
    input.ownerIntentMode,
    input.decisionRequestLabel,
    input.d8acNextSafeAction,
    ...(input.allowedDecisionOptions || []),
    ...(input.plannedSourceTables || []),
    ...(input.plannedSafeFields || []),
    ...(input.plannedPublicEvidenceFields || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const normalizedAction = normalize(label);
    const allowedBoundary = normalizedAction === 'prepare_pr_d8ae_actual_safe_row_export_read_only_source_candidate_mock_plan'
      || normalizedAction.includes('source_access_plan_boundary')
      || normalizedAction.includes('source_access_plan')
      || normalizedAction.includes('safe_source_access_plan_boundary')
      || normalizedAction.includes('no_source_access');
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_plan_label');
    if (!allowedBoundary && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
    }
  });
}

function evaluateModes(input: BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput, blockers: Set<string>): void {
  const executionMode = normalize(String(input.plannedExecutionMode || 'missing'));
  const accessMode = normalize(String(input.plannedAccessMode || 'missing'));
  if (!(ALLOWED_EXECUTION_MODES as readonly string[]).includes(executionMode)) blockers.add('planned_execution_mode_unsupported');
  if (FORBIDDEN_EXECUTION_MODES.has(executionMode)) blockers.add('planned_execution_mode_forbidden');
  if (!(ALLOWED_ACCESS_MODES as readonly string[]).includes(accessMode)) blockers.add('planned_access_mode_unsupported');
  if (FORBIDDEN_ACCESS_MODES.has(accessMode)) blockers.add('planned_access_mode_forbidden');
}

function evaluateSourceTables(input: BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput, blockers: Set<string>, needsReview: Set<string>): void {
  const tables = input.plannedSourceTables || [];
  if (tables.length === 0) needsReview.add('planned_source_tables_missing');
  tables.forEach((table) => {
    const normalized = normalize(String(table));
    const label = normalizeLabel(String(table));
    if (FORBIDDEN_SOURCE_TABLE_LABELS.some((forbidden) => label.includes(forbidden))) blockers.add('planned_source_table_unsafe');
    else if (!SAFE_SOURCE_TABLES.has(normalized)) {
      if (normalized.endsWith('_safe_summary')) needsReview.add('planned_source_table_candidate_unapproved');
      else blockers.add('planned_source_table_unsupported');
    }
  });
}

function evaluateEntities(input: BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput, blockers: Set<string>, needsReview: Set<string>): void {
  (input.plannedEntityTypes || []).map((entity) => normalize(String(entity))).forEach((entity) => {
    if (DEFERRED_ENTITY_TYPES.has(entity)) needsReview.add('deferred_entity_requires_review');
    else if (!ALLOWED_ENTITY_TYPES.has(entity)) blockers.add('planned_entity_unsupported');
  });
}

function evaluateFields(input: BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput, blockers: Set<string>, needsReview: Set<string>): void {
  const safeFields = input.plannedSafeFields || [];
  if (safeFields.length === 0) needsReview.add('planned_safe_fields_incomplete');
  const publicFields = input.plannedPublicEvidenceFields || [];
  const redactedFields = new Set((input.plannedRedactedFields || []).map((field) => normalizeLabel(String(field))));
  [...safeFields, ...publicFields].forEach((field) => {
    const label = normalizeLabel(String(field));
    if (UNSAFE_LABELS.some((unsafe) => label.includes(unsafe))) blockers.add('planned_field_unsafe');
    if (label.includes('wallet') || label.includes('localpath') || label.includes('privatepath')) {
      if (publicFields.includes(field)) blockers.add('planned_public_evidence_private_field');
      if (!redactedFields.has(label)) blockers.add('planned_redaction_missing');
    }
    if (label.includes('rawtxpayload') || label.includes('rawreceiptpayload')) blockers.add('planned_public_evidence_private_field');
  });
}

function evaluateForbiddenFields(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput,
  blockers: Set<string>,
  missing: Set<string>
): void {
  const forbidden = new Set((input.plannedForbiddenFields || []).map((field) => normalize(String(field))));
  REQUIRED_FORBIDDEN_FIELDS.forEach((field) => {
    if (!forbidden.has(field)) {
      missing.add(`planned_forbidden_field:${field}`);
      blockers.add('planned_forbidden_fields_incomplete');
    }
  });
}

function evaluatePreconditions(input: BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput, needsReview: Set<string>): void {
  const preconditions = new Set((input.requiredPreconditions || []).map((item) => normalize(String(item))));
  REQUIRED_PRECONDITIONS.forEach((item) => {
    if (!preconditions.has(item)) needsReview.add(`required_precondition:${item}`);
  });
}

function determineNextSafeAction(blockers: Set<string>, missing: Set<string>, needsReview: Set<string>, status: SourceAccessPlanBoundaryStatus): NextSafeAction {
  if (blockers.has('review_decision_gate_missing') || blockers.has('review_decision_gate_not_ready')) {
    return 'build_actual_safe_row_export_read_only_source_candidate_review_decision_gate';
  }
  if (blockers.has('source_access_plan_id_missing')) return 'provide_source_access_plan_id';
  if (blockers.has('decision_gate_id_missing') || blockers.has('review_packet_id_missing') || blockers.has('source_head_sha_missing')) {
    return 'provide_review_decision_identifiers';
  }
  if (blockers.has('planned_execution_mode_forbidden') || blockers.has('planned_execution_mode_unsupported')) return 'remove_forbidden_planned_execution_mode';
  if (blockers.has('planned_access_mode_forbidden') || blockers.has('planned_access_mode_unsupported')) return 'remove_forbidden_planned_access_mode';
  if (blockers.has('planned_source_table_unsupported') || blockers.has('planned_source_table_unsafe')) return 'remove_unsafe_source_table';
  if (blockers.has('planned_field_unsafe') || blockers.has('planned_public_evidence_private_field')) return 'remove_unsafe_plan_field';
  if (blockers.has('planned_redaction_missing')) return 'add_required_redaction_plan';
  if (missing.size > 0) return 'add_forbidden_action_categories';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_plan_label') || blockers.has('public_readiness_or_execution_overclaim')) return 'remove_unsafe_decision_label';
  if (needsReview.size > 0) return 'collect_operator_source_access_plan_boundary_review';
  if (status === 'SOURCE_ACCESS_PLAN_BOUNDARY_READY') return 'prepare_pr_d8ae_actual_safe_row_export_read_only_source_candidate_mock_plan';
  return 'collect_operator_source_access_plan_boundary_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundaryInput
): TierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const needsReview = new Set<string>();

  const gate = input.reviewDecisionGate;
  const gateStatus = String(input.reviewDecisionGateStatus || gate?.status || 'missing');
  if (!gate && !hasText(input.reviewDecisionGateStatus)) blockers.add('review_decision_gate_missing');
  if (gateStatus !== 'SOURCE_CANDIDATE_REVIEW_DECISION_READY') {
    if (gateStatus === 'NEEDS_REVIEW') needsReview.add('review_decision_gate_needs_review');
    else blockers.add('review_decision_gate_not_ready');
  }

  const sourceAccessPlanId = String(input.sourceAccessPlanId || 'missing');
  const decisionGateId = String(input.decisionGateId || gate?.decisionGateId || 'missing');
  const reviewPacketId = String(input.reviewPacketId || gate?.reviewPacketId || 'missing');
  const sourceHeadSha = String(input.sourceHeadSha || gate?.sourceHeadSha || 'missing');
  if (!hasText(input.sourceAccessPlanId)) blockers.add('source_access_plan_id_missing');
  if (decisionGateId === 'missing' || !hasText(decisionGateId)) blockers.add('decision_gate_id_missing');
  if (reviewPacketId === 'missing' || !hasText(reviewPacketId)) blockers.add('review_packet_id_missing');
  if (sourceHeadSha === 'missing' || !hasText(sourceHeadSha)) blockers.add('source_head_sha_missing');

  (gate?.blockers || input.blockers || []).forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  (gate?.needsReviewReasons || input.needsReviewReasons || []).forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });

  if (['direct_source_access', 'actual_db_query', 'execute', 'runtime_ready'].includes(normalize(String(input.ownerIntentMode || gate?.ownerIntentMode || '')))) {
    blockers.add('owner_intent_mode_forbidden');
  }
  (input.allowedDecisionOptions || gate?.allowedDecisionOptions || []).forEach((option) => {
    const normalizedOption = normalize(option);
    const allowedBoundaryOption = normalizedOption.includes('source_access_plan_boundary') || normalizedOption.includes('no_source_access');
    if (!allowedBoundaryOption && REQUIRED_FORBIDDEN_FIELDS.some((field) => normalizedOption.includes(field))) {
      blockers.add('allowed_decision_option_forbidden');
    }
  });

  evaluateModes(input, blockers);
  evaluateSourceTables(input, blockers, needsReview);
  evaluateEntities(input, blockers, needsReview);
  evaluateFields(input, blockers, needsReview);
  evaluateForbiddenFields(input, blockers, missing);
  evaluatePreconditions(input, needsReview);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const blockerList = compact(blockers);
  const needsReviewReasons = compact(needsReview);
  const status: SourceAccessPlanBoundaryStatus = blockerList.length > 0
    ? 'BLOCKED'
    : missing.size > 0 || needsReviewReasons.length > 0
      ? 'NEEDS_REVIEW'
      : 'SOURCE_ACCESS_PLAN_BOUNDARY_READY';

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_ACCESS_PLAN_BOUNDARY_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_ACCESS_PLAN_BOUNDARY_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_ACCESS_PLAN_BOUNDARY_TRACE_LABEL,
    sourceAccessPlanId,
    decisionGateId,
    reviewPacketId,
    sourceHeadSha,
    reviewDecisionGateStatus: gateStatus,
    reviewDecisionKind: String(input.reviewDecisionKind || gate?.kind || 'missing'),
    reviewDecisionTraceLabel: String(input.reviewDecisionTraceLabel || gate?.traceLabel || 'missing'),
    plannedExecutionMode: normalize(String(input.plannedExecutionMode || 'missing')),
    plannedAccessMode: normalize(String(input.plannedAccessMode || 'missing')),
    plannedSourceTables: compact(input.plannedSourceTables || []),
    plannedEntityTypes: compact(input.plannedEntityTypes || []),
    plannedSafeFields: compact(input.plannedSafeFields || []),
    plannedPublicEvidenceFields: compact(input.plannedPublicEvidenceFields || []),
    plannedRedactedFields: compact(input.plannedRedactedFields || []),
    plannedForbiddenFields: unique(REQUIRED_FORBIDDEN_FIELDS),
    planSummary: {
      planOnly: true,
      actualSourceAccessReady: false,
      actualDbReadReady: false,
      jsonlExportReady: false,
      runtimeReady: false,
      safeSummaryOnly: true
    },
    operatorChecklist: unique([...(input.operatorChecklist || gate?.operatorChecklist || []), ...OPERATOR_CHECKLIST]),
    forbiddenActionSummary: unique(REQUIRED_FORBIDDEN_FIELDS),
    requiredPreconditions: unique(input.requiredPreconditions || REQUIRED_PRECONDITIONS),
    blockerCount: blockerList.length,
    blockers: blockerList,
    needsReviewReasonCount: needsReviewReasons.length,
    needsReviewReasons,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')).length,
    unsafeReasonCodes: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')),
    nextSafeAction: determineNextSafeAction(blockers, missing, needsReview, status)
  };
}
