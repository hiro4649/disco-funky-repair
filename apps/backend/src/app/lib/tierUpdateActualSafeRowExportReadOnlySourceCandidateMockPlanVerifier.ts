import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_TRACE_LABEL =
  'd8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier' as const;

type MockPlanVerifierStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY';
type VerificationMode = 'mock_plan_static_verification' | 'fixture_only_verification' | 'plan_shape_verification' | 'review_only_verification';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_mock_plan'
  | 'provide_mock_plan_verifier_id'
  | 'provide_mock_plan_identifiers'
  | 'remove_forbidden_verification_mode'
  | 'remove_forbidden_mock_plan_mode'
  | 'verify_mock_only_zero_real_rows_no_actual_access'
  | 'remove_unsafe_mock_evidence_origin'
  | 'remove_unsafe_mock_source_table'
  | 'remove_unsafe_mock_field'
  | 'add_required_redaction_plan'
  | 'add_mock_forbidden_action_categories'
  | 'complete_mock_plan_preconditions'
  | 'complete_operator_no_actual_access_checklist'
  | 'remove_forbidden_boundary_flag'
  | 'collect_operator_mock_plan_verifier_review'
  | 'prepare_pr_d8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet';

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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput = BoundaryFlagInput & {
  mockPlan?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan | null;
  mockPlanStatus?: string | null;
  mockPlanKind?: string | null;
  mockPlanTraceLabel?: string | null;
  mockPlanId?: string | null;
  sourceAccessPlanId?: string | null;
  decisionGateId?: string | null;
  reviewPacketId?: string | null;
  sourceHeadSha?: string | null;
  verifierId?: string | null;
  verificationMode?: string | null;
  expectedMockOnly?: boolean;
  expectedZeroRealRows?: boolean;
  expectedNoActualAccess?: boolean;
  mockOnlyVerified?: boolean;
  zeroRealRowsVerified?: boolean;
  noActualAccessVerified?: boolean;
  safeEvidenceOriginsVerified?: boolean;
  forbiddenFieldsVerified?: boolean;
  redactionPlanVerified?: boolean | 'unknown' | null;
  preconditionsVerified?: boolean;
  operatorChecklistVerified?: boolean;
  mockPlanMode?: string | null;
  mockScenarioLabel?: string | null;
  mockRowCount?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan['mockRowCount'] | null;
  mockEntityCoverage?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan['mockEntityCoverage'] | null;
  mockEvidenceOrigins?: string[];
  mockSourceTables?: string[];
  mockSafeFields?: string[];
  mockRedactedFields?: string[];
  mockForbiddenFields?: string[];
  mockExecutionSummary?: TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlan['mockExecutionSummary'] | null;
  mockBoundarySummary?: BoundaryFlagInput | null;
  requiredPreconditions?: string[];
  operatorChecklist?: string[];
  blockers?: string[];
  needsReviewReasons?: string[];
  d8aeNextSafeAction?: string | null;
  verifierNextSafeAction?: string | null;
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_SCHEMA_VERSION;
  status: MockPlanVerifierStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_TRACE_LABEL;
  verifierId: string;
  mockPlanId: string;
  sourceAccessPlanId: string;
  decisionGateId: string;
  reviewPacketId: string;
  sourceHeadSha: string;
  mockPlanStatus: string;
  mockPlanKind: string;
  mockPlanTraceLabel: string;
  verificationMode: string;
  mockOnlyVerified: boolean;
  zeroRealRowsVerified: boolean;
  noActualAccessVerified: boolean;
  safeEvidenceOriginsVerified: boolean;
  forbiddenFieldsVerified: boolean;
  redactionPlanVerified: boolean | 'unknown';
  preconditionsVerified: boolean;
  operatorChecklistVerified: boolean;
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
  boundarySummary: Required<BoundaryFlagInput> & {
    safeSummaryOnly: true;
  };
  mockEvidenceOrigins: string[];
  mockSourceTables: string[];
  mockSafeFields: string[];
  mockRedactedFields: string[];
  mockForbiddenFields: string[];
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

const ALLOWED_VERIFICATION_MODES: VerificationMode[] = [
  'mock_plan_static_verification',
  'fixture_only_verification',
  'plan_shape_verification',
  'review_only_verification'
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
const ALLOWED_MOCK_PLAN_MODES = new Set(['mock_only', 'fixture_only', 'plan_shape_only', 'review_only']);
const FORBIDDEN_MOCK_PLAN_MODES = new Set(['execute', 'query', 'read_source', 'db_read', 'export', 'jsonl_export', 'file_write']);
const SAFE_MOCK_EVIDENCE_ORIGINS = new Set(['fixture', 'local_test', 'remote_gate', 'safe_summary_shape', 'review_packet', 'mock_plan']);
const UNSAFE_MOCK_EVIDENCE_ORIGINS = new Set(['raw_db', 'source_access', 'runtime', 'staging', 'production']);
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
  'actualscheduledtierupdate',
  'actualjobrun',
  'actualprizetransaction',
  'actualwallet'
];
const DEFERRED_ENTITY_TYPES = new Set(['prize', 'prize_transaction', 'ticket_code', 'nft_metadata', 'token_detail', 'wallet_summary']);
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
const OPERATOR_CHECKLIST_TERMS = [
  'no actual DB export',
  'no real DB query',
  'no source access',
  'no runtime readiness'
];
const UNSAFE_LABELS = ['secret', 'privatekey', 'rawenv', 'rawlog', 'rawpayload', 'rawendpoint', 'endpoint', 'privatepath', 'localpath', 'databaseurl', 'dburl'];
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
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort().slice(0, 18);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort();

function addBoundaryFlagBlockers(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>): void {
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
    if (input[flag] === true || input.boundaryFlags?.[flag] === true || input.mockBoundarySummary?.[flag] === true || input.mockPlan?.mockBoundarySummary?.[flag] === true) {
      blockers.add(code);
    }
  });
}

function buildBoundarySummary(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput): Required<BoundaryFlagInput> & { safeSummaryOnly: true } {
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
    ...(input.mockPlan?.mockBoundarySummary || {}),
    ...(input.mockBoundarySummary || {}),
    ...(input.boundaryFlags || {}),
    safeSummaryOnly: true
  };
}

function collectUnsafeLabels(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>): void {
  const labels = [
    input.verifierId,
    input.mockPlanId,
    input.sourceAccessPlanId,
    input.decisionGateId,
    input.reviewPacketId,
    input.mockScenarioLabel,
    input.d8aeNextSafeAction,
    input.verifierNextSafeAction,
    ...(input.mockSourceTables || input.mockPlan?.mockSourceTables || []),
    ...(input.mockSafeFields || input.mockPlan?.mockSafeFields || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const normalizedAction = normalize(label);
    const allowed = normalizedAction === 'prepare_pr_d8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet'
      || normalizedAction === 'prepare_pr_d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier'
      || normalizedAction.includes('mock_plan')
      || normalizedAction.includes('no_source_access');
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_mock_plan_verifier_label');
    if (!allowed && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('public_readiness_or_execution_overclaim');
    }
  });
}

function verifyMode(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>): void {
  const verificationMode = normalize(String(input.verificationMode || 'missing'));
  const mockPlanMode = normalize(String(input.mockPlanMode || input.mockPlan?.mockPlanMode || 'missing'));
  if (!(ALLOWED_VERIFICATION_MODES as readonly string[]).includes(verificationMode)) blockers.add('verification_mode_unsupported');
  if (FORBIDDEN_VERIFICATION_MODES.has(verificationMode)) blockers.add('verification_mode_forbidden');
  if (!ALLOWED_MOCK_PLAN_MODES.has(mockPlanMode)) blockers.add('mock_plan_mode_unsupported');
  if (FORBIDDEN_MOCK_PLAN_MODES.has(mockPlanMode)) blockers.add('mock_plan_mode_forbidden');
}

function verifyBooleanChecks(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>, needsReview: Set<string>): void {
  const checks: Array<[keyof BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, string]> = [
    ['mockOnlyVerified', 'mock_only_not_verified'],
    ['zeroRealRowsVerified', 'zero_real_rows_not_verified'],
    ['noActualAccessVerified', 'no_actual_access_not_verified'],
    ['safeEvidenceOriginsVerified', 'safe_evidence_origins_not_verified'],
    ['forbiddenFieldsVerified', 'forbidden_fields_not_verified'],
    ['preconditionsVerified', 'preconditions_not_verified'],
    ['operatorChecklistVerified', 'operator_checklist_not_verified']
  ];
  checks.forEach(([key, code]) => {
    if (input[key] !== true) blockers.add(code);
  });

  const sensitiveLabels = [
    ...(input.mockSafeFields || input.mockPlan?.mockSafeFields || []),
    ...(input.mockSourceTables || input.mockPlan?.mockSourceTables || []),
    input.mockScenarioLabel || input.mockPlan?.mockScenarioLabel
  ].filter((value): value is string => hasText(value));
  const hasSensitiveLabel = sensitiveLabels.some((label) => {
    const normalized = normalizeLabel(label);
    return normalized.includes('wallet') || normalized.includes('localpath') || normalized.includes('privatepath') || UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe));
  });
  if (input.redactionPlanVerified === false && hasSensitiveLabel) blockers.add('redaction_plan_not_verified');
  if ((input.redactionPlanVerified === undefined || input.redactionPlanVerified === null || input.redactionPlanVerified === 'unknown') && !hasSensitiveLabel) {
    needsReview.add('redaction_plan_verification_unknown');
  }
}

function verifyOrigins(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>, needsReview: Set<string>): void {
  const origins = input.mockEvidenceOrigins || input.mockPlan?.mockEvidenceOrigins || [];
  if (origins.length === 0) needsReview.add('mock_evidence_origins_missing');
  origins.forEach((origin) => {
    const normalized = normalize(String(origin));
    if (UNSAFE_MOCK_EVIDENCE_ORIGINS.has(normalized)) blockers.add('mock_evidence_origin_unsafe');
    else if (!SAFE_MOCK_EVIDENCE_ORIGINS.has(normalized)) needsReview.add('mock_evidence_origin_unknown');
  });
}

function verifyTables(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>): void {
  (input.mockSourceTables || input.mockPlan?.mockSourceTables || []).forEach((table) => {
    const normalized = normalize(String(table));
    const label = normalizeLabel(String(table));
    if (FORBIDDEN_SOURCE_TABLE_LABELS.some((forbidden) => label.includes(forbidden))) blockers.add('mock_source_table_unsafe');
    else if (!SAFE_MOCK_SOURCE_TABLES.has(normalized)) blockers.add('mock_source_table_unsupported');
  });
}

function verifyFields(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>, needsReview: Set<string>, missing: Set<string>): void {
  const safeFields = input.mockSafeFields || input.mockPlan?.mockSafeFields || [];
  if (safeFields.length === 0) needsReview.add('mock_safe_fields_incomplete');
  safeFields.forEach((field) => {
    const label = normalizeLabel(String(field));
    if (UNSAFE_LABELS.some((unsafe) => label.includes(unsafe))) blockers.add('mock_field_unsafe');
    if (label.includes('wallet') || label.includes('localpath') || label.includes('privatepath')) blockers.add('mock_field_private_label');
  });

  const forbidden = new Set((input.mockForbiddenFields || input.mockPlan?.mockForbiddenFields || []).map((field) => normalize(String(field))));
  REQUIRED_FORBIDDEN_FIELDS.forEach((field) => {
    if (!forbidden.has(field)) {
      missing.add(`mock_forbidden_field:${field}`);
      blockers.add('mock_forbidden_fields_incomplete');
    }
  });
}

function verifyRowsAndCoverage(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>, needsReview: Set<string>): void {
  const rowCount = input.mockRowCount || input.mockPlan?.mockRowCount;
  if (rowCount?.realRowsClaimed === true || Number(rowCount?.realRowCount || 0) > 0) blockers.add('real_row_count_claimed');
  const coverage = input.mockEntityCoverage || input.mockPlan?.mockEntityCoverage;
  if (coverage?.claimsRealCoverage === true || normalize(String(coverage?.mode || '')).includes('real')) blockers.add('real_entity_coverage_claimed');
  if (coverage?.incomplete === true) needsReview.add('mock_entity_coverage_incomplete');
  (coverage?.entities || []).forEach((entity) => {
    if (DEFERRED_ENTITY_TYPES.has(normalize(String(entity)))) needsReview.add('deferred_entity_requires_review');
  });
}

function verifyPreconditionsAndChecklist(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>): void {
  const preconditions = new Set((input.requiredPreconditions || input.mockPlan?.requiredPreconditions || []).map((item) => normalize(String(item))));
  REQUIRED_PRECONDITIONS.forEach((item) => {
    if (!preconditions.has(item)) blockers.add(`required_precondition_missing:${item}`);
  });

  const checklist = (input.operatorChecklist || input.mockPlan?.operatorChecklist || []).join(' ').toLowerCase();
  OPERATOR_CHECKLIST_TERMS.forEach((term) => {
    if (!checklist.includes(term.toLowerCase())) blockers.add('operator_checklist_missing_no_actual_access');
  });
}

function verifyExecutionSummary(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput, blockers: Set<string>): void {
  const summary = (input.mockExecutionSummary || input.mockPlan?.mockExecutionSummary) as Record<string, unknown> | undefined;
  if (summary?.sourceAccessReady === true) blockers.add('source_access_ready_overclaim');
  if (summary?.actualDbReadReady === true) blockers.add('actual_db_read_ready_overclaim');
  if (summary?.actualDbExportReady === true) blockers.add('actual_db_export_ready_overclaim');
  if (summary?.jsonlExportReady === true) blockers.add('jsonl_export_ready_overclaim');
  if (summary?.fileExportReady === true) blockers.add('file_export_ready_overclaim');
  if (summary?.runtimeReady === true) blockers.add('runtime_readiness_claim_forbidden');
  if (summary?.stagingReady === true) blockers.add('staging_no_tx_pass_claim_forbidden');
  if (summary?.productionReady === true) blockers.add('production_readiness_claim_forbidden');
}

function determineNextSafeAction(blockers: Set<string>, missing: Set<string>, needsReview: Set<string>, status: MockPlanVerifierStatus): NextSafeAction {
  if (blockers.has('mock_plan_missing') || blockers.has('mock_plan_not_ready')) return 'build_actual_safe_row_export_read_only_source_candidate_mock_plan';
  if (blockers.has('verifier_id_missing')) return 'provide_mock_plan_verifier_id';
  if (blockers.has('mock_plan_id_missing') || blockers.has('source_access_plan_id_missing') || blockers.has('decision_gate_id_missing') || blockers.has('review_packet_id_missing') || blockers.has('source_head_sha_missing')) {
    return 'provide_mock_plan_identifiers';
  }
  if (blockers.has('verification_mode_forbidden') || blockers.has('verification_mode_unsupported')) return 'remove_forbidden_verification_mode';
  if (blockers.has('mock_plan_mode_forbidden') || blockers.has('mock_plan_mode_unsupported')) return 'remove_forbidden_mock_plan_mode';
  if (blockers.has('mock_only_not_verified') || blockers.has('zero_real_rows_not_verified') || blockers.has('no_actual_access_not_verified')) {
    return 'verify_mock_only_zero_real_rows_no_actual_access';
  }
  if (blockers.has('mock_evidence_origin_unsafe')) return 'remove_unsafe_mock_evidence_origin';
  if (blockers.has('mock_source_table_unsafe') || blockers.has('mock_source_table_unsupported')) return 'remove_unsafe_mock_source_table';
  if (blockers.has('mock_field_unsafe') || blockers.has('mock_field_private_label')) return 'remove_unsafe_mock_field';
  if (blockers.has('redaction_plan_not_verified')) return 'add_required_redaction_plan';
  if (missing.size > 0 || blockers.has('mock_forbidden_fields_incomplete')) return 'add_mock_forbidden_action_categories';
  if (Array.from(blockers).some((code) => code.startsWith('required_precondition_missing'))) return 'complete_mock_plan_preconditions';
  if (blockers.has('operator_checklist_missing_no_actual_access')) return 'complete_operator_no_actual_access_checklist';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (needsReview.size > 0) return 'collect_operator_mock_plan_verifier_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY') return 'prepare_pr_d8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet';
  return 'collect_operator_mock_plan_verifier_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifierInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockPlanVerifier {
  const blockers = new Set<string>();
  const needsReview = new Set<string>();
  const missing = new Set<string>();
  const mockPlan = input.mockPlan;
  const mockPlanStatus = String(input.mockPlanStatus || mockPlan?.status || 'missing');
  if (!mockPlan && !hasText(input.mockPlanStatus)) blockers.add('mock_plan_missing');
  if (mockPlanStatus !== 'SOURCE_CANDIDATE_MOCK_PLAN_READY') {
    if (mockPlanStatus === 'NEEDS_REVIEW') needsReview.add('mock_plan_needs_review');
    else blockers.add('mock_plan_not_ready');
  }

  const verifierId = String(input.verifierId || 'missing');
  const mockPlanId = String(input.mockPlanId || mockPlan?.mockPlanId || 'missing');
  const sourceAccessPlanId = String(input.sourceAccessPlanId || mockPlan?.sourceAccessPlanId || 'missing');
  const decisionGateId = String(input.decisionGateId || mockPlan?.decisionGateId || 'missing');
  const reviewPacketId = String(input.reviewPacketId || mockPlan?.reviewPacketId || 'missing');
  const sourceHeadSha = String(input.sourceHeadSha || mockPlan?.sourceHeadSha || 'missing');
  if (!hasText(input.verifierId)) blockers.add('verifier_id_missing');
  if (mockPlanId === 'missing' || !hasText(mockPlanId)) blockers.add('mock_plan_id_missing');
  if (sourceAccessPlanId === 'missing' || !hasText(sourceAccessPlanId)) blockers.add('source_access_plan_id_missing');
  if (decisionGateId === 'missing' || !hasText(decisionGateId)) blockers.add('decision_gate_id_missing');
  if (reviewPacketId === 'missing' || !hasText(reviewPacketId)) blockers.add('review_packet_id_missing');
  if (sourceHeadSha === 'missing' || !hasText(sourceHeadSha)) blockers.add('source_head_sha_missing');

  (mockPlan?.blockers || input.blockers || []).forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`upstream_blocker:${normalize(String(blocker))}`);
  });
  (mockPlan?.needsReviewReasons || input.needsReviewReasons || []).forEach((reason) => {
    if (hasText(reason)) needsReview.add(`upstream_needs_review:${normalize(String(reason))}`);
  });

  verifyMode(input, blockers);
  verifyBooleanChecks(input, blockers, needsReview);
  verifyOrigins(input, blockers, needsReview);
  verifyTables(input, blockers);
  verifyFields(input, blockers, needsReview, missing);
  verifyRowsAndCoverage(input, blockers, needsReview);
  verifyPreconditionsAndChecklist(input, blockers);
  verifyExecutionSummary(input, blockers);
  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const nextAction = String(input.verifierNextSafeAction || input.d8aeNextSafeAction || mockPlan?.nextSafeAction || '');
  if (nextAction && !['prepare_pr_d8ag_actual_safe_row_export_read_only_source_candidate_mock_review_packet', 'prepare_pr_d8af_actual_safe_row_export_read_only_source_candidate_mock_plan_verifier'].includes(nextAction)) {
    const label = normalizeLabel(nextAction);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => label.includes(normalizeLabel(forbidden)))) blockers.add('next_safe_action_forbidden');
  }

  const blockerList = compact(blockers);
  const needsReviewList = compact(needsReview);
  const status: MockPlanVerifierStatus = blockerList.length > 0
    ? 'BLOCKED'
    : needsReviewList.length > 0
      ? 'NEEDS_REVIEW'
      : 'SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY';

  const redactionStatus = input.redactionPlanVerified === true ? true : input.redactionPlanVerified === false ? false : 'unknown';

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_TRACE_LABEL,
    verifierId,
    mockPlanId,
    sourceAccessPlanId,
    decisionGateId,
    reviewPacketId,
    sourceHeadSha,
    mockPlanStatus,
    mockPlanKind: String(input.mockPlanKind || mockPlan?.kind || 'missing'),
    mockPlanTraceLabel: String(input.mockPlanTraceLabel || mockPlan?.traceLabel || 'missing'),
    verificationMode: normalize(String(input.verificationMode || 'missing')),
    mockOnlyVerified: input.mockOnlyVerified === true,
    zeroRealRowsVerified: input.zeroRealRowsVerified === true,
    noActualAccessVerified: input.noActualAccessVerified === true,
    safeEvidenceOriginsVerified: input.safeEvidenceOriginsVerified === true,
    forbiddenFieldsVerified: input.forbiddenFieldsVerified === true,
    redactionPlanVerified: redactionStatus,
    preconditionsVerified: input.preconditionsVerified === true,
    operatorChecklistVerified: input.operatorChecklistVerified === true,
    verificationSummary: {
      mockOnly: input.mockOnlyVerified === true && input.expectedMockOnly !== false,
      zeroRealRows: input.zeroRealRowsVerified === true && input.expectedZeroRealRows !== false,
      noActualAccess: input.noActualAccessVerified === true && input.expectedNoActualAccess !== false,
      sourceAccessAuthorized: false,
      actualDbReadAuthorized: false,
      actualDbExportAuthorized: false,
      jsonlExportAuthorized: false,
      runtimeReady: false,
      stagingReady: false,
      productionReady: false
    },
    boundarySummary: buildBoundarySummary(input),
    mockEvidenceOrigins: compact(input.mockEvidenceOrigins || mockPlan?.mockEvidenceOrigins || []),
    mockSourceTables: compact(input.mockSourceTables || mockPlan?.mockSourceTables || []),
    mockSafeFields: compact(input.mockSafeFields || mockPlan?.mockSafeFields || []),
    mockRedactedFields: compact(input.mockRedactedFields || mockPlan?.mockRedactedFields || []),
    mockForbiddenFields: unique(input.mockForbiddenFields || mockPlan?.mockForbiddenFields || REQUIRED_FORBIDDEN_FIELDS),
    requiredPreconditions: unique(input.requiredPreconditions || mockPlan?.requiredPreconditions || []),
    operatorChecklist: unique(input.operatorChecklist || mockPlan?.operatorChecklist || []),
    blockerCount: blockerList.length,
    blockers: blockerList,
    needsReviewReasonCount: needsReviewList.length,
    needsReviewReasons: needsReviewList,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')).length,
    unsafeReasonCodes: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')),
    nextSafeAction: determineNextSafeAction(blockers, missing, needsReview, status)
  };
}
