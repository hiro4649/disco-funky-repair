import type {
  TierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary
} from './tierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_plan' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_TRACE_LABEL =
  'd8ae_actual_safe_row_export_read_only_source_candidate_mock_plan' as const;

type SourceCandidateMockPlanStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_CANDIDATE_MOCK_PLAN_READY';
type MockPlanMode = 'mock_only' | 'fixture_only' | 'plan_shape_only' | 'review_only';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_access_plan_boundary'
  | 'provide_mock_plan_id'
  | 'provide_source_access_plan_identifiers'
  | 'remove_forbidden_mock_plan_mode'
  | 'remove_forbidden_planned_execution_mode'
  | 'remove_forbidden_planned_access_mode'
  | 'remove_unsafe_mock_source_table'
  | 'remove_unsafe_mock_field'
  | 'add_required_mock_redaction_plan'
  | 'add_mock_forbidden_action_categories'
  | 'remove_unsafe_mock_evidence_origin'
  | 'remove_real_row_claim'
  | 'remove_real_entity_coverage_claim'
  | 'add_operator_no_actual_access_checklist'
  | 'remove_forbidden_boundary_flag'
  | 'collect_operator_source_candidate_mock_plan_review'
  | 'prepare_pr_d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier';

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

type MockEntityCoverageInput = {
  mode?: string | null;
  mockOnly?: boolean;
  incomplete?: boolean;
  claimsRealCoverage?: boolean;
  entities?: string[];
};

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput = BoundaryFlagInput & {
  sourceAccessPlanBoundary?: TierUpdateActualSafeRowExportReadOnlySourceAccessPlanBoundary | null;
  sourceAccessPlanBoundaryStatus?: string | null;
  sourceAccessPlanKind?: string | null;
  sourceAccessPlanTraceLabel?: string | null;
  sourceAccessPlanId?: string | null;
  decisionGateId?: string | null;
  reviewPacketId?: string | null;
  sourceHeadSha?: string | null;
  plannedExecutionMode?: string | null;
  plannedAccessMode?: string | null;
  plannedSourceTables?: string[];
  plannedEntityTypes?: string[];
  plannedSafeFields?: string[];
  plannedPublicEvidenceFields?: string[];
  plannedRedactedFields?: string[];
  plannedForbiddenFields?: string[];
  requiredPreconditions?: string[];
  planSummary?: Record<string, unknown> | null;
  operatorChecklist?: string[];
  boundarySummary?: BoundaryFlagInput | null;
  blockers?: string[];
  needsReviewReasons?: string[];
  d8adNextSafeAction?: string | null;
  mockPlanId?: string | null;
  mockScenarioLabel?: string | null;
  mockRowCount?: number | { value?: number; kind?: string; realRowsClaimed?: boolean } | null;
  mockEntityCoverage?: MockEntityCoverageInput | string[] | null;
  mockEvidenceOrigins?: string[];
  mockPlanMode?: string | null;
  mockSourceTables?: string[];
  mockSafeFields?: string[];
  mockPublicEvidenceFields?: string[];
  mockRedactedFields?: string[];
  mockForbiddenFields?: string[];
  mockNextSafeAction?: string | null;
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_SCHEMA_VERSION;
  status: SourceCandidateMockPlanStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_TRACE_LABEL;
  mockPlanId: string;
  sourceAccessPlanId: string;
  decisionGateId: string;
  reviewPacketId: string;
  sourceHeadSha: string;
  sourceAccessPlanBoundaryStatus: string;
  sourceAccessPlanKind: string;
  sourceAccessPlanTraceLabel: string;
  mockPlanMode: string;
  mockScenarioLabel: string;
  mockRowCount: {
    syntheticRowCount: number;
    realRowCount: number;
    realRowsClaimed: boolean;
  };
  mockEntityCoverage: {
    mode: string;
    mockOnly: boolean;
    incomplete: boolean;
    claimsRealCoverage: boolean;
    entities: string[];
  };
  mockEvidenceOrigins: string[];
  mockSourceTables: string[];
  mockSafeFields: string[];
  mockRedactedFields: string[];
  mockForbiddenFields: string[];
  mockExecutionSummary: {
    mockOnly: true;
    sourceAccessReady: false;
    actualDbReadReady: false;
    actualDbExportReady: false;
    jsonlExportReady: false;
    fileExportReady: false;
    runtimeReady: false;
    stagingReady: false;
    productionReady: false;
  };
  mockBoundarySummary: Required<BoundaryFlagInput>;
  requiredPreconditions: string[];
  operatorChecklist: string[];
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const ALLOWED_MOCK_PLAN_MODES: MockPlanMode[] = ['mock_only', 'fixture_only', 'plan_shape_only', 'review_only'];
const FORBIDDEN_MOCK_PLAN_MODES = new Set([
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
const ALLOWED_EXECUTION_MODES = new Set(['plan_only', 'review_only', 'dry_run_design_only']);
const FORBIDDEN_EXECUTION_MODES = new Set(['execute', 'query', 'export', 'runtime', 'worker', 'cron', 'route', 'cli', 'docker_smoke', 'staging', 'production']);
const ALLOWED_ACCESS_MODES = new Set(['no_access', 'future_read_only_candidate', 'review_packet_only']);
const FORBIDDEN_ACCESS_MODES = new Set(['actual_db_read', 'actual_source_access', 'prisma_client', 'database_url', 'env_read', 'network_rpc_wallet_contract_tx', 'file_export', 'jsonl_export', 'artifact_upload']);
const SAFE_MOCK_SOURCE_TABLES = new Set([
  'scheduled_tier_update_safe_summary_mock',
  'job_run_safe_summary_mock',
  'tx_receipt_evidence_safe_summary_mock',
  'staging_evidence_safe_summary_mock',
  'fixture_safe_summary_mock',
  'evaluation_safe_summary_mock',
  'test_safe_summary_mock'
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
  'contractruntimestate',
  'actualscheduledtierupdate',
  'actualjobrun',
  'actualprizetransaction',
  'actualwallet'
];
const ALLOWED_ENTITY_TYPES = new Set(['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence', 'fixture', 'evaluation', 'test']);
const DEFERRED_ENTITY_TYPES = new Set(['prize', 'prize_transaction', 'ticket_code', 'nft_metadata', 'token_detail', 'wallet_summary']);
const SAFE_MOCK_EVIDENCE_ORIGINS = new Set(['fixture', 'local_test', 'remote_gate', 'safe_summary_shape', 'review_packet', 'mock_plan']);
const UNSAFE_MOCK_EVIDENCE_ORIGINS = new Set(['db_safe_summary', 'public_chain', 'raw_db', 'runtime', 'staging', 'production', 'source_access']);
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
const REQUIRED_PRECONDITIONS = ['future_owner_confirmation_required', 'same_head_remote_quality_gate_required'];
const OPERATOR_CHECKLIST = [
  'verify mock plan remains mock-only',
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
const UNSAFE_LABELS = ['secret', 'privatekey', 'rawenv', 'rawlog', 'rawpayload', 'rawendpoint', 'endpoint', 'privatepath', 'localpath', 'localimagepath', 'databaseurl', 'dburl'];
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
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort().slice(0, 16);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort();

function addBoundaryFlagBlockers(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>): void {
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
    if (input[flag] === true || input.boundaryFlags?.[flag] === true || input.boundarySummary?.[flag] === true) blockers.add(code);
  });
}

function boundaryFlags(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput): Required<BoundaryFlagInput> {
  return {
    actualDbQueryEnabled: false,
    realDbQueryEnabled: false,
    actualDbExportEnabled: false,
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
    ...input.boundarySummary,
    ...input.boundaryFlags
  };
}

function collectUnsafeLabels(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>): void {
  const labels = [
    input.mockPlanId,
    input.sourceAccessPlanId,
    input.decisionGateId,
    input.reviewPacketId,
    input.mockScenarioLabel,
    input.d8adNextSafeAction,
    input.mockNextSafeAction,
    ...(input.mockSourceTables || []),
    ...(input.mockSafeFields || []),
    ...(input.mockPublicEvidenceFields || [])
  ].filter((value): value is string => hasText(value));
  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const normalizedAction = normalize(label);
    const allowedNextAction = normalizedAction === 'prepare_pr_d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier'
      || normalizedAction.includes('source_access_plan_boundary')
      || normalizedAction.includes('mock_plan')
      || normalizedAction.includes('no_source_access');
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_mock_label');
    if (!allowedNextAction && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
    }
  });
}

function evaluateModes(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>): void {
  const mockPlanMode = normalize(String(input.mockPlanMode || 'missing'));
  const plannedExecutionMode = normalize(String(input.plannedExecutionMode || input.sourceAccessPlanBoundary?.plannedExecutionMode || 'missing'));
  const plannedAccessMode = normalize(String(input.plannedAccessMode || input.sourceAccessPlanBoundary?.plannedAccessMode || 'missing'));
  if (!(ALLOWED_MOCK_PLAN_MODES as readonly string[]).includes(mockPlanMode)) blockers.add('mock_plan_mode_unsupported');
  if (FORBIDDEN_MOCK_PLAN_MODES.has(mockPlanMode)) blockers.add('mock_plan_mode_forbidden');
  if (!ALLOWED_EXECUTION_MODES.has(plannedExecutionMode)) blockers.add('planned_execution_mode_unsupported');
  if (FORBIDDEN_EXECUTION_MODES.has(plannedExecutionMode)) blockers.add('planned_execution_mode_forbidden');
  if (!ALLOWED_ACCESS_MODES.has(plannedAccessMode)) blockers.add('planned_access_mode_unsupported');
  if (FORBIDDEN_ACCESS_MODES.has(plannedAccessMode)) blockers.add('planned_access_mode_forbidden');
}

function evaluateTables(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>, needsReview: Set<string>): void {
  const tables = input.mockSourceTables || input.plannedSourceTables || [];
  if (tables.length === 0) needsReview.add('mock_source_tables_missing');
  tables.forEach((table) => {
    const normalized = normalize(String(table));
    const label = normalizeLabel(String(table));
    if (FORBIDDEN_SOURCE_TABLE_LABELS.some((forbidden) => label.includes(forbidden))) blockers.add('mock_source_table_unsafe');
    else if (!SAFE_MOCK_SOURCE_TABLES.has(normalized)) {
      if (normalized.endsWith('_safe_summary_mock')) needsReview.add('mock_source_table_candidate_unapproved');
      else blockers.add('mock_source_table_unsupported');
    }
  });
}

function evaluateEntities(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>, needsReview: Set<string>): void {
  const coverage = normalizeCoverage(input.mockEntityCoverage);
  coverage.entities.forEach((entity) => {
    const normalized = normalize(String(entity));
    if (DEFERRED_ENTITY_TYPES.has(normalized)) needsReview.add('deferred_entity_requires_review');
    else if (!ALLOWED_ENTITY_TYPES.has(normalized)) blockers.add('mock_entity_unsupported');
  });
  if (coverage.incomplete) needsReview.add('mock_entity_coverage_incomplete');
  if (coverage.claimsRealCoverage || coverage.mode.includes('real')) blockers.add('real_entity_coverage_claimed');
}

function evaluateFields(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>, needsReview: Set<string>): void {
  const safeFields = input.mockSafeFields || input.plannedSafeFields || [];
  if (safeFields.length === 0) needsReview.add('mock_safe_fields_incomplete');
  const publicFields = input.mockPublicEvidenceFields || input.plannedPublicEvidenceFields || [];
  const redactedFields = new Set((input.mockRedactedFields || input.plannedRedactedFields || []).map((field) => normalizeLabel(String(field))));
  [...safeFields, ...publicFields].forEach((field) => {
    const label = normalizeLabel(String(field));
    if (UNSAFE_LABELS.some((unsafe) => label.includes(unsafe))) blockers.add('mock_field_unsafe');
    if (label.includes('wallet') || label.includes('localpath') || label.includes('privatepath')) {
      if (publicFields.includes(field)) blockers.add('mock_public_evidence_private_field');
      if (!redactedFields.has(label)) blockers.add('mock_redaction_missing');
    }
    if (label.includes('rawtxpayload') || label.includes('rawreceiptpayload')) blockers.add('mock_public_evidence_private_field');
  });
}

function evaluateForbiddenFields(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>, missing: Set<string>): void {
  const forbidden = new Set((input.mockForbiddenFields || input.plannedForbiddenFields || []).map((field) => normalize(String(field))));
  REQUIRED_FORBIDDEN_FIELDS.forEach((field) => {
    if (!forbidden.has(field)) {
      missing.add(`mock_forbidden_field:${field}`);
      blockers.add('mock_forbidden_fields_incomplete');
    }
  });
}

function evaluateEvidenceOrigins(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>, needsReview: Set<string>): void {
  const origins = input.mockEvidenceOrigins || [];
  if (origins.length === 0) needsReview.add('mock_evidence_origins_missing');
  origins.forEach((origin) => {
    const normalized = normalize(String(origin));
    if (UNSAFE_MOCK_EVIDENCE_ORIGINS.has(normalized)) blockers.add('mock_evidence_origin_unsafe');
    else if (!SAFE_MOCK_EVIDENCE_ORIGINS.has(normalized)) needsReview.add('mock_evidence_origin_unknown');
  });
}

function evaluateRows(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>, needsReview: Set<string>): void {
  const row = normalizeMockRowCount(input.mockRowCount);
  if (row.realRowsClaimed) blockers.add('real_row_count_claimed');
  if (row.syntheticRowCount < 0) blockers.add('mock_row_count_invalid');
  if (row.syntheticRowCount === 0) needsReview.add('mock_row_count_zero');
}

function evaluatePreconditions(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>): void {
  const preconditions = new Set((input.requiredPreconditions || input.sourceAccessPlanBoundary?.requiredPreconditions || []).map((item) => normalize(String(item))));
  REQUIRED_PRECONDITIONS.forEach((item) => {
    if (!preconditions.has(item)) blockers.add(`required_precondition_missing:${item}`);
  });
}

function evaluateChecklist(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput, blockers: Set<string>): void {
  const text = (input.operatorChecklist || input.sourceAccessPlanBoundary?.operatorChecklist || []).join(' ').toLowerCase();
  ['no actual db export', 'no real db query', 'no source access', 'no runtime readiness'].forEach((required) => {
    if (!text.includes(required)) blockers.add('operator_checklist_missing_no_actual_access');
  });
}

function normalizeMockRowCount(rowCount: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput['mockRowCount']) {
  if (typeof rowCount === 'number') return { syntheticRowCount: rowCount, realRowCount: 0, realRowsClaimed: false };
  const kind = normalize(String(rowCount?.kind || 'synthetic_mock'));
  return {
    syntheticRowCount: Number(rowCount?.value || 0),
    realRowCount: 0,
    realRowsClaimed: rowCount?.realRowsClaimed === true || kind.includes('real')
  };
}

function normalizeCoverage(coverage: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput['mockEntityCoverage']) {
  if (Array.isArray(coverage)) {
    return { mode: 'mock_only', mockOnly: true, incomplete: false, claimsRealCoverage: false, entities: coverage };
  }
  return {
    mode: normalize(String(coverage?.mode || 'mock_only')),
    mockOnly: coverage?.mockOnly !== false,
    incomplete: coverage?.incomplete === true,
    claimsRealCoverage: coverage?.claimsRealCoverage === true,
    entities: coverage?.entities || []
  };
}

function determineNextSafeAction(blockers: Set<string>, missing: Set<string>, needsReview: Set<string>, status: SourceCandidateMockPlanStatus): NextSafeAction {
  if (blockers.has('source_access_plan_boundary_missing') || blockers.has('source_access_plan_boundary_not_ready')) return 'build_actual_safe_row_export_read_only_source_access_plan_boundary';
  if (blockers.has('mock_plan_id_missing')) return 'provide_mock_plan_id';
  if (blockers.has('source_access_plan_id_missing') || blockers.has('decision_gate_id_missing') || blockers.has('review_packet_id_missing') || blockers.has('source_head_sha_missing')) return 'provide_source_access_plan_identifiers';
  if (blockers.has('mock_plan_mode_forbidden') || blockers.has('mock_plan_mode_unsupported')) return 'remove_forbidden_mock_plan_mode';
  if (blockers.has('planned_execution_mode_forbidden') || blockers.has('planned_execution_mode_unsupported')) return 'remove_forbidden_planned_execution_mode';
  if (blockers.has('planned_access_mode_forbidden') || blockers.has('planned_access_mode_unsupported')) return 'remove_forbidden_planned_access_mode';
  if (blockers.has('mock_source_table_unsafe') || blockers.has('mock_source_table_unsupported')) return 'remove_unsafe_mock_source_table';
  if (blockers.has('mock_field_unsafe') || blockers.has('mock_public_evidence_private_field')) return 'remove_unsafe_mock_field';
  if (blockers.has('mock_redaction_missing')) return 'add_required_mock_redaction_plan';
  if (missing.size > 0 || blockers.has('mock_forbidden_fields_incomplete')) return 'add_mock_forbidden_action_categories';
  if (blockers.has('mock_evidence_origin_unsafe')) return 'remove_unsafe_mock_evidence_origin';
  if (blockers.has('real_row_count_claimed')) return 'remove_real_row_claim';
  if (blockers.has('real_entity_coverage_claimed')) return 'remove_real_entity_coverage_claim';
  if (blockers.has('operator_checklist_missing_no_actual_access')) return 'add_operator_no_actual_access_checklist';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (needsReview.size > 0) return 'collect_operator_source_candidate_mock_plan_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_PLAN_READY') return 'prepare_pr_d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier';
  return 'collect_operator_source_candidate_mock_plan_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan {
  const blockers = new Set<string>();
  const needsReview = new Set<string>();
  const missing = new Set<string>();
  const boundary = input.sourceAccessPlanBoundary;
  const boundaryStatus = String(input.sourceAccessPlanBoundaryStatus || boundary?.status || 'missing');
  if (!boundary && !hasText(input.sourceAccessPlanBoundaryStatus)) blockers.add('source_access_plan_boundary_missing');
  if (boundaryStatus !== 'SOURCE_ACCESS_PLAN_BOUNDARY_READY') {
    if (boundaryStatus === 'NEEDS_REVIEW') needsReview.add('source_access_plan_boundary_needs_review');
    else blockers.add('source_access_plan_boundary_not_ready');
  }

  const mockPlanId = String(input.mockPlanId || 'missing');
  const sourceAccessPlanId = String(input.sourceAccessPlanId || boundary?.sourceAccessPlanId || 'missing');
  const decisionGateId = String(input.decisionGateId || boundary?.decisionGateId || 'missing');
  const reviewPacketId = String(input.reviewPacketId || boundary?.reviewPacketId || 'missing');
  const sourceHeadSha = String(input.sourceHeadSha || boundary?.sourceHeadSha || 'missing');
  if (!hasText(input.mockPlanId)) blockers.add('mock_plan_id_missing');
  if (!hasText(input.mockScenarioLabel)) needsReview.add('mock_scenario_label_missing');
  if (sourceAccessPlanId === 'missing' || !hasText(sourceAccessPlanId)) blockers.add('source_access_plan_id_missing');
  if (decisionGateId === 'missing' || !hasText(decisionGateId)) blockers.add('decision_gate_id_missing');
  if (reviewPacketId === 'missing' || !hasText(reviewPacketId)) blockers.add('review_packet_id_missing');
  if (sourceHeadSha === 'missing' || !hasText(sourceHeadSha)) blockers.add('source_head_sha_missing');

  (boundary?.blockers || input.blockers || []).forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  (boundary?.needsReviewReasons || input.needsReviewReasons || []).forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });

  evaluateModes(input, blockers);
  evaluateTables(input, blockers, needsReview);
  evaluateEntities(input, blockers, needsReview);
  evaluateFields(input, blockers, needsReview);
  evaluateForbiddenFields(input, blockers, missing);
  evaluateEvidenceOrigins(input, blockers, needsReview);
  evaluateRows(input, blockers, needsReview);
  evaluatePreconditions(input, blockers);
  evaluateChecklist(input, blockers);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const nextAction = String(input.mockNextSafeAction || input.d8adNextSafeAction || boundary?.nextSafeAction || '');
  if (nextAction && nextAction !== 'prepare_pr_d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier') {
    const label = normalizeLabel(nextAction);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => label.includes(normalizeLabel(forbidden)))) blockers.add('next_safe_action_forbidden');
  }

  const blockerList = compact(blockers);
  const needsReviewReasons = compact(needsReview);
  const status: SourceCandidateMockPlanStatus = blockerList.length > 0
    ? 'BLOCKED'
    : needsReviewReasons.length > 0
      ? 'NEEDS_REVIEW'
      : 'SOURCE_CANDIDATE_MOCK_PLAN_READY';
  const row = normalizeMockRowCount(input.mockRowCount);
  const coverage = normalizeCoverage(input.mockEntityCoverage);

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_TRACE_LABEL,
    mockPlanId,
    sourceAccessPlanId,
    decisionGateId,
    reviewPacketId,
    sourceHeadSha,
    sourceAccessPlanBoundaryStatus: boundaryStatus,
    sourceAccessPlanKind: String(input.sourceAccessPlanKind || boundary?.kind || 'missing'),
    sourceAccessPlanTraceLabel: String(input.sourceAccessPlanTraceLabel || boundary?.traceLabel || 'missing'),
    mockPlanMode: normalize(String(input.mockPlanMode || 'missing')),
    mockScenarioLabel: String(input.mockScenarioLabel || 'needs_operator_mock_scenario_label'),
    mockRowCount: row,
    mockEntityCoverage: coverage,
    mockEvidenceOrigins: compact(input.mockEvidenceOrigins || []),
    mockSourceTables: compact(input.mockSourceTables || input.plannedSourceTables || []),
    mockSafeFields: compact(input.mockSafeFields || input.plannedSafeFields || []),
    mockRedactedFields: compact(input.mockRedactedFields || input.plannedRedactedFields || []),
    mockForbiddenFields: unique(REQUIRED_FORBIDDEN_FIELDS),
    mockExecutionSummary: {
      mockOnly: true,
      sourceAccessReady: false,
      actualDbReadReady: false,
      actualDbExportReady: false,
      jsonlExportReady: false,
      fileExportReady: false,
      runtimeReady: false,
      stagingReady: false,
      productionReady: false
    },
    mockBoundarySummary: boundaryFlags(input),
    requiredPreconditions: unique(input.requiredPreconditions || boundary?.requiredPreconditions || REQUIRED_PRECONDITIONS),
    operatorChecklist: unique([...(input.operatorChecklist || boundary?.operatorChecklist || []), ...OPERATOR_CHECKLIST]),
    blockerCount: blockerList.length,
    blockers: blockerList,
    needsReviewReasonCount: needsReviewReasons.length,
    needsReviewReasons,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')).length,
    unsafeReasonCodes: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')),
    nextSafeAction: determineNextSafeAction(blockers, missing, needsReview, status)
  };
}
