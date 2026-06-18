export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_LANE_CLOSURE_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_mock_lane_closure' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_LANE_CLOSURE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_LANE_CLOSURE_TRACE_LABEL =
  'd8an_actual_safe_row_export_read_only_source_candidate_mock_lane_closure' as const;

type Status = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_CANDIDATE_MOCK_LANE_CLOSED';

type NextSafeAction =
  | 'provide_mock_lane_closure_id'
  | 'provide_mock_lane_closure_source_head'
  | 'repair_mock_lane_upstream_status'
  | 'resolve_mock_lane_source_head_mismatch'
  | 'verify_mock_lane_safety_boundary'
  | 'add_mock_lane_handoff_boundary_labels'
  | 'add_mock_lane_not_authorized_actions'
  | 'add_mock_lane_required_preconditions'
  | 'add_mock_lane_closure_checklist'
  | 'remove_forbidden_boundary_flag'
  | 'remove_unsafe_mock_lane_closure_label'
  | 'collect_operator_mock_lane_closure_review'
  | 'prepare_pr_d8ao_safe_summary_jsonl_fixture_schema';

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

type UpstreamKey =
  | 'd8z'
  | 'd8aa'
  | 'd8ab'
  | 'd8ac'
  | 'd8ad'
  | 'd8ae'
  | 'd8af'
  | 'd8ag'
  | 'd8ah'
  | 'd8ai'
  | 'd8aj'
  | 'd8ak'
  | 'd8al'
  | 'd8am';

type UpstreamInput = {
  status?: string | null;
  kind?: string | null;
  traceLabel?: string | null;
  sourceHeadSha?: string | null;
  blockers?: string[];
  needsReviewReasons?: string[];
};

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput =
  BoundaryFlagInput & {
    closureId?: string | null;
    sourceHeadSha?: string | null;
    d8z?: UpstreamInput | null;
    d8aa?: UpstreamInput | null;
    d8ab?: UpstreamInput | null;
    d8ac?: UpstreamInput | null;
    d8ad?: UpstreamInput | null;
    d8ae?: UpstreamInput | null;
    d8af?: UpstreamInput | null;
    d8ag?: UpstreamInput | null;
    d8ah?: UpstreamInput | null;
    d8ai?: UpstreamInput | null;
    d8aj?: UpstreamInput | null;
    d8ak?: UpstreamInput | null;
    d8al?: UpstreamInput | null;
    d8am?: UpstreamInput | null;
    d8zStatus?: string | null;
    d8aaStatus?: string | null;
    d8abStatus?: string | null;
    d8acStatus?: string | null;
    d8adStatus?: string | null;
    d8aeStatus?: string | null;
    d8afStatus?: string | null;
    d8agStatus?: string | null;
    d8ahStatus?: string | null;
    d8aiStatus?: string | null;
    d8ajStatus?: string | null;
    d8akStatus?: string | null;
    d8alStatus?: string | null;
    d8amStatus?: string | null;
    upstreamKinds?: Partial<Record<UpstreamKey, string | null>>;
    upstreamTraceLabels?: Partial<Record<UpstreamKey, string | null>>;
    upstreamSourceHeadShas?: Partial<Record<UpstreamKey, string | null>>;
    mockOnlyVerified?: boolean;
    zeroRealRowsVerified?: boolean;
    noActualAccessVerified?: boolean;
    noDbQueryVerified?: boolean;
    noDbExportVerified?: boolean;
    noPrismaVerified?: boolean;
    noDatabaseUrlReadVerified?: boolean;
    noEnvReadVerified?: boolean;
    noNetworkRpcWalletContractTxVerified?: boolean;
    noFileExportVerified?: boolean;
    noJsonlFileExportVerified?: boolean;
    noArtifactUploadVerified?: boolean;
    noDockerSmokeChangeVerified?: boolean;
    noStagingNoTxPassVerified?: boolean;
    noRuntimeReadinessVerified?: boolean;
    noProductionReadinessVerified?: boolean;
    sameHeadRequirementPreserved?: boolean;
    futureOwnerScopeRequired?: boolean;
    mockLaneSummary?: string | null;
    handoffBoundaryLabels?: string[];
    notAuthorizedActions?: string[];
    requiredPreconditions?: string[];
    closureChecklist?: string[];
    boundarySummary?: BoundaryFlagInput | null;
    boundaryFlags?: BoundaryFlagInput | null;
    blockers?: string[];
    needsReviewReasons?: string[];
    deferredEntityTypes?: string[];
    nextSafeAction?: string | null;
  };

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosure = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_LANE_CLOSURE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_LANE_CLOSURE_SCHEMA_VERSION;
  status: Status;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_LANE_CLOSURE_TRACE_LABEL;
  closureId: string;
  sourceHeadSha: string;
  upstreamStatusSummary: Record<UpstreamKey, string>;
  upstreamReadyCount: number;
  upstreamExpectedCount: number;
  upstreamHeadConsistency: 'consistent' | 'needs_review' | 'blocked';
  mockOnlyVerified: boolean;
  zeroRealRowsVerified: boolean;
  noActualAccessVerified: boolean;
  noDbQueryVerified: boolean;
  noDbExportVerified: boolean;
  noPrismaVerified: boolean;
  noDatabaseUrlReadVerified: boolean;
  noEnvReadVerified: boolean;
  noNetworkRpcWalletContractTxVerified: boolean;
  noFileExportVerified: boolean;
  noJsonlFileExportVerified: boolean;
  noArtifactUploadVerified: boolean;
  noDockerSmokeChangeVerified: boolean;
  noStagingNoTxPassVerified: boolean;
  noRuntimeReadinessVerified: boolean;
  noProductionReadinessVerified: boolean;
  sameHeadRequirementPreserved: boolean;
  futureOwnerScopeRequired: boolean;
  mockLaneClosed: boolean;
  handoffBoundaryLabels: string[];
  notAuthorizedActions: string[];
  requiredPreconditions: string[];
  closureChecklist: string[];
  boundarySummary: Required<BoundaryFlagInput> & { safeSummaryOnly: true };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  unsafeReasonCount: number;
  unsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const EXPECTED_UPSTREAM: Record<UpstreamKey, string> = {
  d8z: 'FIXTURE_VERIFIER_READY',
  d8aa: 'SOURCE_CANDIDATE_REVIEW_PACKET_READY',
  d8ab: 'SOURCE_CANDIDATE_REVIEW_DECISION_READY',
  d8ac: 'SOURCE_ACCESS_PLAN_BOUNDARY_READY',
  d8ad: 'SOURCE_ACCESS_PLAN_BOUNDARY_READY',
  d8ae: 'SOURCE_CANDIDATE_MOCK_PLAN_READY',
  d8af: 'SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY',
  d8ag: 'SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY',
  d8ah: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY',
  d8ai: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY',
  d8aj: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY',
  d8ak: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY',
  d8al: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY',
  d8am: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_READY'
};

const UPSTREAM_KEYS = Object.keys(EXPECTED_UPSTREAM) as UpstreamKey[];
const READY_NEXT_ACTION = 'prepare_pr_d8ao_safe_summary_jsonl_fixture_schema';

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
  'new_owner_scope_before_d8ao',
  'same_head_remote_quality_gate_required'
];
const REQUIRED_CHECKLIST = [
  'no actual access',
  'no db',
  'no export',
  'no runtime readiness'
];
const REQUIRED_HANDOFF_LABELS = [
  'mock_lane_closed',
  'd8ao_requires_new_owner_scope',
  'safe_summary_jsonl_fixture_schema_only',
  'no_actual_access'
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
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort().slice(0, 32);
const unique = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean).map(String))).sort();

function upstream(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput, key: UpstreamKey): UpstreamInput | undefined {
  return input[key] || undefined;
}

function statusFor(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput, key: UpstreamKey): string {
  const direct = input[`${key}Status` as keyof BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput];
  return String(direct || upstream(input, key)?.status || 'missing');
}

function buildBoundarySummary(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput
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
    ...(input.boundarySummary || {}),
    ...(input.boundaryFlags || {}),
    safeSummaryOnly: true
  };
}

function addBoundaryFlagBlockers(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput,
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
    if (input[flag] === true || input.boundarySummary?.[flag] === true || input.boundaryFlags?.[flag] === true) blockers.add(code);
  });
}

function addVerificationBlockers(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput,
  blockers: Set<string>
): Record<string, boolean> {
  const checks: Array<[keyof BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput, string]> = [
    ['mockOnlyVerified', 'mock_only_not_verified'],
    ['zeroRealRowsVerified', 'zero_real_rows_not_verified'],
    ['noActualAccessVerified', 'no_actual_access_not_verified'],
    ['noDbQueryVerified', 'no_db_query_not_verified'],
    ['noDbExportVerified', 'no_db_export_not_verified'],
    ['noPrismaVerified', 'no_prisma_not_verified'],
    ['noDatabaseUrlReadVerified', 'no_database_url_read_not_verified'],
    ['noEnvReadVerified', 'no_env_read_not_verified'],
    ['noNetworkRpcWalletContractTxVerified', 'no_network_rpc_wallet_contract_tx_not_verified'],
    ['noFileExportVerified', 'no_file_export_not_verified'],
    ['noJsonlFileExportVerified', 'no_jsonl_file_export_not_verified'],
    ['noArtifactUploadVerified', 'no_artifact_upload_not_verified'],
    ['noDockerSmokeChangeVerified', 'no_docker_smoke_change_not_verified'],
    ['noStagingNoTxPassVerified', 'no_staging_no_tx_pass_not_verified'],
    ['noRuntimeReadinessVerified', 'no_runtime_readiness_not_verified'],
    ['noProductionReadinessVerified', 'no_production_readiness_not_verified'],
    ['sameHeadRequirementPreserved', 'same_head_requirement_not_preserved'],
    ['futureOwnerScopeRequired', 'future_owner_scope_not_required']
  ];
  const result: Record<string, boolean> = {};
  checks.forEach(([key, code]) => {
    const verified = input[key] === true;
    result[String(key)] = verified;
    if (!verified) blockers.add(code);
  });
  return result;
}

function requireList(
  list: string[] | undefined,
  required: string[],
  absentCode: string,
  missingPrefix: string,
  blockers: Set<string>
): string[] {
  const values = list || [];
  const normalized = new Set(values.map(normalize));
  if (values.length === 0) blockers.add(absentCode);
  required.forEach((item) => {
    if (!normalized.has(normalize(item))) blockers.add(`${missingPrefix}:${normalize(item)}`);
  });
  return unique(values);
}

function requireChecklist(list: string[] | undefined, blockers: Set<string>): string[] {
  const values = list || [];
  const text = values.join(' ').toLowerCase();
  if (values.length === 0) blockers.add('closure_checklist_missing');
  REQUIRED_CHECKLIST.forEach((item) => {
    if (!text.includes(item)) blockers.add(`closure_checklist_missing:${normalize(item)}`);
  });
  return unique(values);
}

function evaluateUpstreams(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput,
  blockers: Set<string>,
  needsReview: Set<string>
): { summary: Record<UpstreamKey, string>; readyCount: number; headConsistency: 'consistent' | 'needs_review' | 'blocked' } {
  const summary = {} as Record<UpstreamKey, string>;
  let readyCount = 0;
  let headConsistency: 'consistent' | 'needs_review' | 'blocked' = 'consistent';
  const currentHead = String(input.sourceHeadSha || '');

  UPSTREAM_KEYS.forEach((key) => {
    const item = upstream(input, key);
    const status = statusFor(input, key);
    summary[key] = status;
    if (status === 'missing') blockers.add(`${key}_status_missing`);
    else if (status === EXPECTED_UPSTREAM[key]) readyCount += 1;
    else if (status === 'NEEDS_REVIEW') needsReview.add(`${key}_needs_review`);
    else blockers.add(`${key}_status_not_ready`);

    [...(item?.blockers || [])].forEach((blocker) => {
      if (hasText(blocker)) blockers.add(`${key}_upstream_blocker:${normalize(String(blocker))}`);
    });
    [...(item?.needsReviewReasons || [])].forEach((reason) => {
      if (hasText(reason)) needsReview.add(`${key}_upstream_needs_review:${normalize(String(reason))}`);
    });

    const upstreamHead = String(input.upstreamSourceHeadShas?.[key] || item?.sourceHeadSha || '');
    if (!hasText(upstreamHead)) {
      needsReview.add(`${key}_source_head_unknown`);
      if (headConsistency === 'consistent') headConsistency = 'needs_review';
    } else if (hasText(currentHead) && upstreamHead !== currentHead) {
      blockers.add(`${key}_source_head_mismatch`);
      headConsistency = 'blocked';
    }
  });

  return { summary, readyCount, headConsistency };
}

function collectUnsafeLabels(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput, blockers: Set<string>): void {
  const labels = [
    input.closureId,
    input.sourceHeadSha,
    input.mockLaneSummary,
    input.nextSafeAction,
    ...(input.handoffBoundaryLabels || []),
    ...(input.notAuthorizedActions || []),
    ...(input.requiredPreconditions || []),
    ...(input.closureChecklist || []),
    ...Object.values(input.upstreamKinds || {}),
    ...Object.values(input.upstreamTraceLabels || {})
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    const action = normalize(label);
    const readinessOverclaim = action.includes('runtime_ready')
      || action.includes('staging_ready')
      || action.includes('production_ready')
      || normalized.includes('actualsourceready')
      || normalized.includes('actualdbready')
      || normalized.includes('exportrready')
      || normalized.includes('runtimeready')
      || normalized.includes('stagingready')
      || normalized.includes('productionready');
    if (readinessOverclaim) {
      blockers.add('readiness_overclaim');
      return;
    }
    const isSafeRequired = REQUIRED_NOT_AUTHORIZED_ACTIONS.some((item) => normalize(item) === action)
      || REQUIRED_CHECKLIST.some((item) => normalize(item) === action)
      || REQUIRED_PRECONDITIONS.some((item) => normalize(item) === action);
    const isSafeNegative = isSafeRequired
      || action.includes('no_actual_access')
      || action.includes('no_db')
      || action.includes('no_export')
      || action.includes('not_authorized')
      || action.includes('mock_lane')
      || action.includes('source_candidate')
      || action.includes('safe_summary_jsonl_fixture_schema_only')
      || action.includes('d8ao_requires_new_owner_scope')
      || action.includes('trace')
      || action === READY_NEXT_ACTION;
    if (!isSafeRequired && UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_mock_lane_closure_label');
    if (!isSafeNegative && FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) {
      blockers.add('forbidden_action_label');
    }
  });
}

function evaluateNextSafeAction(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput, blockers: Set<string>): void {
  const action = String(input.nextSafeAction || READY_NEXT_ACTION);
  if (action.includes(',') || action.includes('|')) blockers.add('next_safe_action_multiple');
  if (action !== READY_NEXT_ACTION) {
    const normalized = normalizeLabel(action);
    if (FORBIDDEN_ACTION_LABELS.some((forbidden) => normalized.includes(normalizeLabel(forbidden)))) blockers.add('next_safe_action_forbidden');
  }
}

function determineStatus(blockers: Set<string>, needsReview: Set<string>): Status {
  if (blockers.size > 0) return 'BLOCKED';
  if (needsReview.size > 0) return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_MOCK_LANE_CLOSED';
}

function determineNextSafeAction(blockers: Set<string>, needsReview: Set<string>, status: Status): NextSafeAction {
  if (blockers.has('closure_id_missing')) return 'provide_mock_lane_closure_id';
  if (blockers.has('source_head_sha_missing')) return 'provide_mock_lane_closure_source_head';
  if (Array.from(blockers).some((code) => code.endsWith('_status_missing') || code.endsWith('_status_not_ready'))) return 'repair_mock_lane_upstream_status';
  if (Array.from(blockers).some((code) => code.endsWith('_source_head_mismatch'))) return 'resolve_mock_lane_source_head_mismatch';
  if (Array.from(blockers).some((code) => code.endsWith('_not_verified') || code.endsWith('_not_preserved') || code.endsWith('_not_required'))) return 'verify_mock_lane_safety_boundary';
  if (blockers.has('handoff_boundary_labels_missing') || Array.from(blockers).some((code) => code.startsWith('handoff_boundary_label_missing'))) return 'add_mock_lane_handoff_boundary_labels';
  if (blockers.has('not_authorized_actions_missing') || Array.from(blockers).some((code) => code.startsWith('not_authorized_action_missing'))) return 'add_mock_lane_not_authorized_actions';
  if (blockers.has('required_preconditions_missing') || Array.from(blockers).some((code) => code.startsWith('required_precondition_missing'))) return 'add_mock_lane_required_preconditions';
  if (blockers.has('closure_checklist_missing') || Array.from(blockers).some((code) => code.startsWith('closure_checklist_missing'))) return 'add_mock_lane_closure_checklist';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_mock_lane_closure_label') || blockers.has('readiness_overclaim') || blockers.has('forbidden_action_label')) return 'remove_unsafe_mock_lane_closure_label';
  if (needsReview.size > 0) return 'collect_operator_mock_lane_closure_review';
  if (status === 'SOURCE_CANDIDATE_MOCK_LANE_CLOSED') return READY_NEXT_ACTION;
  return 'collect_operator_mock_lane_closure_review';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosure(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosure {
  const blockers = new Set<string>();
  const needsReview = new Set<string>();
  if (!hasText(input.closureId)) blockers.add('closure_id_missing');
  if (!hasText(input.sourceHeadSha)) blockers.add('source_head_sha_missing');

  const upstreamEvaluation = evaluateUpstreams(input, blockers, needsReview);
  const checks = addVerificationBlockers(input, blockers);
  const handoffBoundaryLabels = requireList(input.handoffBoundaryLabels, REQUIRED_HANDOFF_LABELS, 'handoff_boundary_labels_missing', 'handoff_boundary_label_missing', blockers);
  const notAuthorizedActions = requireList(input.notAuthorizedActions, REQUIRED_NOT_AUTHORIZED_ACTIONS, 'not_authorized_actions_missing', 'not_authorized_action_missing', blockers);
  const requiredPreconditions = requireList(input.requiredPreconditions, REQUIRED_PRECONDITIONS, 'required_preconditions_missing', 'required_precondition_missing', blockers);
  const closureChecklist = requireChecklist(input.closureChecklist, blockers);
  addBoundaryFlagBlockers(input, blockers);
  evaluateNextSafeAction(input, blockers);
  collectUnsafeLabels(input, blockers);

  [...(input.blockers || [])].forEach((blocker) => {
    if (hasText(blocker)) blockers.add(`closure_blocker:${normalize(String(blocker))}`);
  });
  [...(input.needsReviewReasons || [])].forEach((reason) => {
    if (hasText(reason)) needsReview.add(`closure_needs_review:${normalize(String(reason))}`);
  });
  (input.deferredEntityTypes || []).forEach((entity) => {
    if (hasText(entity)) needsReview.add(`deferred_entity:${normalize(String(entity))}`);
  });

  const blockerList = compact(blockers);
  const needsReviewList = compact(needsReview);
  const status = determineStatus(blockers, needsReview);

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_LANE_CLOSURE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_LANE_CLOSURE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_MOCK_LANE_CLOSURE_TRACE_LABEL,
    closureId: hasText(input.closureId) ? String(input.closureId) : 'missing',
    sourceHeadSha: hasText(input.sourceHeadSha) ? String(input.sourceHeadSha) : 'missing',
    upstreamStatusSummary: upstreamEvaluation.summary,
    upstreamReadyCount: upstreamEvaluation.readyCount,
    upstreamExpectedCount: UPSTREAM_KEYS.length,
    upstreamHeadConsistency: upstreamEvaluation.headConsistency,
    mockOnlyVerified: checks.mockOnlyVerified,
    zeroRealRowsVerified: checks.zeroRealRowsVerified,
    noActualAccessVerified: checks.noActualAccessVerified,
    noDbQueryVerified: checks.noDbQueryVerified,
    noDbExportVerified: checks.noDbExportVerified,
    noPrismaVerified: checks.noPrismaVerified,
    noDatabaseUrlReadVerified: checks.noDatabaseUrlReadVerified,
    noEnvReadVerified: checks.noEnvReadVerified,
    noNetworkRpcWalletContractTxVerified: checks.noNetworkRpcWalletContractTxVerified,
    noFileExportVerified: checks.noFileExportVerified,
    noJsonlFileExportVerified: checks.noJsonlFileExportVerified,
    noArtifactUploadVerified: checks.noArtifactUploadVerified,
    noDockerSmokeChangeVerified: checks.noDockerSmokeChangeVerified,
    noStagingNoTxPassVerified: checks.noStagingNoTxPassVerified,
    noRuntimeReadinessVerified: checks.noRuntimeReadinessVerified,
    noProductionReadinessVerified: checks.noProductionReadinessVerified,
    sameHeadRequirementPreserved: checks.sameHeadRequirementPreserved,
    futureOwnerScopeRequired: checks.futureOwnerScopeRequired,
    mockLaneClosed: status === 'SOURCE_CANDIDATE_MOCK_LANE_CLOSED',
    handoffBoundaryLabels,
    notAuthorizedActions,
    requiredPreconditions,
    closureChecklist,
    boundarySummary: buildBoundarySummary(input),
    blockerCount: blockerList.length,
    blockers: blockerList,
    needsReviewReasonCount: needsReviewList.length,
    needsReviewReasons: needsReviewList,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim') || code.includes('forbidden_action')).length,
    unsafeReasonCodes: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim') || code.includes('forbidden_action')),
    nextSafeAction: determineNextSafeAction(blockers, needsReview, status)
  };
}
