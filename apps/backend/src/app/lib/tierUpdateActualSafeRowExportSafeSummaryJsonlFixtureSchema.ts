export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_KIND =
  'tier_update_actual_safe_row_export_safe_summary_jsonl_fixture_schema' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_TRACE_LABEL =
  'd8ao_actual_safe_row_export_safe_summary_jsonl_fixture_schema' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_VERSION = '1' as const;

type Status = 'BLOCKED' | 'NEEDS_REVIEW' | 'SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_READY';

type NextSafeAction =
  | 'provide_mock_lane_closure'
  | 'provide_fixture_schema_id'
  | 'provide_source_head_sha'
  | 'repair_schema_contract_mode'
  | 'restore_fixture_schema_contract_flags'
  | 'restore_canonical_fixture_schema'
  | 'remove_actual_row_input'
  | 'remove_forbidden_boundary_flag'
  | 'remove_unsafe_fixture_schema_value'
  | 'collect_schema_review'
  | 'prepare_pr_d8ap_safe_summary_jsonl_fixture_in_memory_builder';

type BoundaryFlags = {
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

type MockLaneClosureInput = BoundaryFlags & {
  status?: string | null;
  kind?: string | null;
  traceLabel?: string | null;
  closureId?: string | null;
  sourceHeadSha?: string | null;
  mockLaneClosed?: boolean;
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
  blockers?: string[];
  needsReviewReasons?: string[];
  nextSafeAction?: string | null;
};

type FieldDefinition = {
  key: string;
  type: string;
  required: true;
  policy: string;
};

export type BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput = BoundaryFlags & {
  mockLaneClosure?: MockLaneClosureInput | null;
  mockLaneClosureStatus?: string | null;
  mockLaneClosureKind?: string | null;
  mockLaneClosureTraceLabel?: string | null;
  closureId?: string | null;
  fixtureSchemaId?: string | null;
  sourceHeadSha?: string | null;
  schemaContractMode?: string | null;
  inMemoryOnly?: boolean;
  fixtureOnly?: boolean;
  zeroRealRowsRequired?: boolean;
  oneJsonObjectPerLineContract?: boolean;
  utf8Required?: boolean;
  canonicalFieldOrderRequired?: boolean;
  multilineStringForbidden?: boolean;
  sourceHashAlgorithm?: string | null;
  rowIdStrategy?: string | null;
  auditExportIdStrategy?: string | null;
  boundarySummary?: BoundaryFlags | null;
  boundaryFlags?: BoundaryFlags | null;
  blockers?: string[];
  needsReviewReasons?: string[];
  nextSafeAction?: string | null;
  requiredFields?: string[];
  canonicalFieldOrder?: string[];
  fieldDefinitions?: FieldDefinition[];
  entityTypeAllowlist?: string[];
  evidenceOriginAllowlist?: string[];
  readinessClaimAllowlist?: string[];
  walletAddressSummaryAllowlist?: string[];
  networkLabelAllowlist?: string[];
  safetyFlagAllowlist?: string[];
  fixtureRows?: unknown[];
  actualRows?: unknown[];
  rawRows?: unknown[];
  records?: unknown[];
  jsonlLines?: string[];
  rawPayload?: unknown;
  sql?: string | null;
  query?: string | null;
  recordSummary?: string | null;
  expectedSafeSummary?: string | null;
  sourceFilePolicy?: string | null;
  publicVisibleFieldsPolicy?: string | null;
  walletAddressSummaryPolicy?: string | null;
};

export type TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema = {
  status: Status;
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_KIND;
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_TRACE_LABEL;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_VERSION;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  safeSummaryOnly: true;
  fixtureOnly: true;
  inMemoryOnly: true;
  zeroRealRows: true;
  fixtureSchemaId: string;
  closureId: string;
  sourceHeadSha: string;
  mockLaneClosureStatus: string;
  schemaContractMode: string;
  canonicalFieldOrder: string[];
  fieldDefinitions: FieldDefinition[];
  entityTypeAllowlist: string[];
  evidenceOriginAllowlist: string[];
  readinessClaimAllowlist: string[];
  walletAddressSummaryAllowlist: string[];
  chainIdAllowlist: Array<56 | 97 | null>;
  networkLabelAllowlist: string[];
  safetyFlagAllowlist: string[];
  jsonlContract: {
    utf8Required: true;
    oneJsonObjectPerLineContract: true;
    canonicalFieldOrderRequired: true;
    multilineStringForbidden: true;
    commentsForbidden: true;
    jsonlLinesReturned: false;
    fileWriteEnabled: false;
    maxFixtureRowBytes: 32768;
  };
  identifierPolicies: {
    sourceHashAlgorithm: 'sha256';
    rowIdStrategy: 'synthetic_deterministic_safe_id';
    auditExportIdStrategy: 'synthetic_fixture_batch_id';
  };
  rowValuePolicy: {
    rowValuesAccepted: false;
    fixtureRowsAccepted: false;
    actualRowsAccepted: false;
    rawRowsAccepted: false;
    recordsAccepted: false;
    jsonlLinesAccepted: false;
  };
  boundarySummary: Required<BoundaryFlags> & {
    safeSummaryOnly: true;
    fixtureOnly: true;
    inMemoryOnly: true;
  };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  nextSafeAction: NextSafeAction;
};

export const D8AO_CANONICAL_FIELD_ORDER = [
  'schema_version',
  'audit_export_id',
  'source_head_sha',
  'source_hash',
  'exported_at',
  'row_id',
  'dataset_name',
  'entity_type',
  'source_table',
  'source_file',
  'status',
  'evidence_origin',
  'readiness_claim',
  'record_summary',
  'public_visible_fields',
  'internal_only_field_labels',
  'wallet_address_summary',
  'chain_id',
  'network_label',
  'expected_safe_summary',
  'safety_flags'
] as const;

const READY_STATUS = 'SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_READY';
const CLOSED_STATUS = 'SOURCE_CANDIDATE_MOCK_LANE_CLOSED';
const READY_NEXT_ACTION = 'prepare_pr_d8ap_safe_summary_jsonl_fixture_in_memory_builder';

const SAFE_MODES = new Set(['fixture_schema_only', 'in_memory_schema_only', 'review_only_schema', 'plan_shape_schema_only']);
const FORBIDDEN_MODES = new Set([
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

export const D8AO_ENTITY_TYPE_ALLOWLIST = [
  'fixture',
  'evaluation',
  'test',
  'prize',
  'prize_transaction',
  'lottery_ticket',
  'ticket_code',
  'scheduled_tier_update',
  'job_run',
  'tx_receipt_evidence',
  'wallet_summary',
  'nft_metadata',
  'token_detail',
  'staging_evidence'
] as const;

export const D8AO_EVIDENCE_ORIGIN_ALLOWLIST = [
  'fixture',
  'local_test',
  'remote_gate',
  'mock_lane_closure',
  'safe_summary_shape'
] as const;

export const D8AO_READINESS_CLAIM_ALLOWLIST = [
  'none',
  'fixture_only',
  'fixture_schema_ready',
  'fixture_validation_pass',
  'needs_review'
] as const;

export const D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST = [
  'none',
  'synthetic',
  'masked',
  'hash_summary'
] as const;

export const D8AO_SAFETY_FLAG_ALLOWLIST = [
  'fixture_only',
  'synthetic_only',
  'no_actual_source_access',
  'no_db_query',
  'no_db_export',
  'no_file_export',
  'no_jsonl_file_export',
  'no_artifact_upload',
  'no_runtime_readiness',
  'wallet_masked',
  'path_redacted',
  'public_chain_evidence_only',
  'deferred_entity',
  'needs_review'
] as const;

const FORBIDDEN_BOUNDARY_FLAGS = [
  'actualDbQueryEnabled',
  'actualDbExportEnabled',
  'realDbQueryEnabled',
  'sourceAccessEnabled',
  'prismaClientEnabled',
  'databaseUrlReadEnabled',
  'envReadEnabled',
  'networkRpcWalletContractTxAccessEnabled',
  'networkAccessEnabled',
  'rpcAccessEnabled',
  'walletAccessEnabled',
  'contractAccessEnabled',
  'txSendEnabled',
  'fileExportEnabled',
  'jsonlFileExportEnabled',
  'artifactUploadEnabled',
  'dockerSmokeChanged',
  'stagingNoTxPassClaimed',
  'runtimeReadinessClaimed',
  'productionReadinessClaimed'
] as const;

const UNSAFE_VALUE_PATTERNS = [
  /raw[\s_-]*(secret|env|log|payload|endpoint)/i,
  /private[\s_-]*(key|path|identifier)/i,
  /local[\s_-]*(file[\s_-]*)?path/i,
  /authorization\s*[:=]/i,
  /bearer\s+[a-z0-9._-]+/i,
  /jwt\s*[:=]/i,
  /cookie\s*[:=]/i,
  /database_url\s*[:=]/i,
  /postgres(?:ql)?:\/\//i,
  /rpc[\s_-]*secret/i,
  /nested[\s_-]*raw[\s_-]*object/i,
  /array[\s_-]*allowed/i,
  /binary[\s_-]*payload/i,
  /full_address/i,
  /runtime[\s_-]*ready|production[\s_-]*ready|staging[\s_-]*ready|export[\s_-]*ready|actual[\s_-]*source[\s_-]*ready/i,
  /0x[a-f0-9]{40}/i,
  /[a-z]:[\\/]/i,
  /(^|[\s"'])(\/(?:users|home|var|etc|tmp)\/[^\s"']*)/i,
  /\.\.[\\/]/
];

const FIELD_DEFINITIONS: FieldDefinition[] = [
  { key: 'schema_version', type: 'string', required: true, policy: 'fixed fixture schema label only' },
  { key: 'audit_export_id', type: 'string', required: true, policy: 'synthetic safe batch id only' },
  { key: 'source_head_sha', type: 'string', required: true, policy: '40 lowercase hex characters' },
  { key: 'source_hash', type: 'string', required: true, policy: 'sha256:<64 lowercase hex>' },
  { key: 'exported_at', type: 'string', required: true, policy: 'ISO-8601 UTC metadata only' },
  { key: 'row_id', type: 'string', required: true, policy: 'synthetic deterministic safe id only' },
  { key: 'dataset_name', type: 'string', required: true, policy: 'safe label, no path, URL, or endpoint' },
  { key: 'entity_type', type: 'enum', required: true, policy: 'canonical fixture-lane entity allowlist' },
  { key: 'source_table', type: 'string|null', required: true, policy: 'safe logical label only' },
  { key: 'source_file', type: 'string|null', required: true, policy: 'safe token only, no filesystem path' },
  { key: 'status', type: 'string', required: true, policy: 'bounded safe status label' },
  { key: 'evidence_origin', type: 'enum', required: true, policy: 'fixture-lane evidence origin only' },
  { key: 'readiness_claim', type: 'enum', required: true, policy: 'fixture-lane claim only' },
  { key: 'record_summary', type: 'string', required: true, policy: 'single-line safe short summary' },
  { key: 'public_visible_fields', type: 'object', required: true, policy: 'flat safe primitives only' },
  { key: 'internal_only_field_labels', type: 'string[]', required: true, policy: 'labels only, never values' },
  { key: 'wallet_address_summary', type: 'enum', required: true, policy: 'none, synthetic, masked, or hash summary only' },
  { key: 'chain_id', type: 'integer|null', required: true, policy: '56, 97, or null only' },
  { key: 'network_label', type: 'enum', required: true, policy: 'none, bsc_testnet, bsc_mainnet, or unknown' },
  { key: 'expected_safe_summary', type: 'string', required: true, policy: 'single-line safe expected outcome summary' },
  { key: 'safety_flags', type: 'enum[]', required: true, policy: 'canonical safety flag allowlist only' }
];

const emptyBoundarySummary = (): Required<BoundaryFlags> & { safeSummaryOnly: true; fixtureOnly: true; inMemoryOnly: true } => ({
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
  safeSummaryOnly: true,
  fixtureOnly: true,
  inMemoryOnly: true
});

function addUnique(list: string[], value: string) {
  if (!list.includes(value)) list.push(value);
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function safeToken(value: string | null | undefined): boolean {
  return /^[a-z0-9][a-z0-9_-]{2,95}$/.test(String(value || ''));
}

function validSourceHeadSha(value: string | null | undefined): boolean {
  return /^[a-f0-9]{40}$/.test(String(value || ''));
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function collectBoundaryFlags(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput): BoundaryFlags[] {
  return [
    input,
    input.boundarySummary || {},
    input.boundaryFlags || {},
    input.mockLaneClosure || {}
  ];
}

function hasForbiddenBoundaryFlag(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput): string[] {
  const active: string[] = [];
  for (const source of collectBoundaryFlags(input)) {
    for (const flag of FORBIDDEN_BOUNDARY_FLAGS) {
      if (source[flag] === true) addUnique(active, `${flag}_forbidden`);
    }
  }
  return active;
}

function hasUnsafeValue(value: unknown): boolean {
  if (typeof value === 'string') return UNSAFE_VALUE_PATTERNS.some((pattern) => pattern.test(value));
  if (Array.isArray(value)) return value.some(hasUnsafeValue);
  if (value && typeof value === 'object') return Object.values(value).some(hasUnsafeValue);
  return false;
}

function hasAnyRows(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput): boolean {
  return [input.fixtureRows, input.actualRows, input.rawRows, input.records, input.jsonlLines]
    .some((value) => Array.isArray(value) && value.length > 0);
}

function canonicalSchemaChanged(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput): boolean {
  if (input.requiredFields && input.requiredFields.join('|') !== D8AO_CANONICAL_FIELD_ORDER.join('|')) return true;
  if (input.canonicalFieldOrder && input.canonicalFieldOrder.join('|') !== D8AO_CANONICAL_FIELD_ORDER.join('|')) return true;
  if (input.fieldDefinitions) {
    const keys = input.fieldDefinitions.map((field) => field.key);
    if (keys.join('|') !== D8AO_CANONICAL_FIELD_ORDER.join('|')) return true;
    if (new Set(keys).size !== keys.length) return true;
    if (input.fieldDefinitions.some((field) => field.required !== true || !['string', 'string|null', 'enum', 'object', 'string[]', 'integer|null', 'enum[]'].includes(field.type))) return true;
  }
  return false;
}

function canonicalAllowlistChanged(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput): boolean {
  const same = (inputList: string[] | undefined, canonical: readonly string[]) => !inputList || inputList.join('|') === canonical.join('|');
  const entityReviewOnly = input.entityTypeAllowlist?.length === 1 && input.entityTypeAllowlist[0] === 'deferred_entity';
  return (!entityReviewOnly && !same(input.entityTypeAllowlist, D8AO_ENTITY_TYPE_ALLOWLIST))
    || !same(input.evidenceOriginAllowlist, D8AO_EVIDENCE_ORIGIN_ALLOWLIST)
    || !same(input.readinessClaimAllowlist, D8AO_READINESS_CLAIM_ALLOWLIST)
    || !same(input.walletAddressSummaryAllowlist, D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST)
    || !same(input.safetyFlagAllowlist, D8AO_SAFETY_FLAG_ALLOWLIST);
}

function determineNextSafeAction(blockers: string[], needsReviewReasons: string[], input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput): NextSafeAction {
  if (blockers.some((code) => code.includes('mock_lane_closure'))) return 'provide_mock_lane_closure';
  if (blockers.includes('fixture_schema_id_missing')) return 'provide_fixture_schema_id';
  if (blockers.some((code) => code.includes('source_head_sha'))) return 'provide_source_head_sha';
  if (blockers.some((code) => code.includes('schema_contract_mode'))) return 'repair_schema_contract_mode';
  if (blockers.some((code) => code.includes('contract_flag'))) return 'restore_fixture_schema_contract_flags';
  if (blockers.some((code) => code.includes('canonical_schema') || code.includes('allowlist'))) return 'restore_canonical_fixture_schema';
  if (blockers.some((code) => code.includes('row_input') || code.includes('jsonl_lines') || code.includes('raw_payload'))) return 'remove_actual_row_input';
  if (blockers.some((code) => code.includes('forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.some((code) => code.includes('unsafe'))) return 'remove_unsafe_fixture_schema_value';
  if (needsReviewReasons.length > 0 || input.nextSafeAction !== READY_NEXT_ACTION) return 'collect_schema_review';
  return READY_NEXT_ACTION;
}

export function buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema(
  input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchemaInput = {}
): TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema {
  const blockers: string[] = [];
  const needsReviewReasons: string[] = [];
  const closure = input.mockLaneClosure || {};
  const mockLaneClosureStatus = input.mockLaneClosureStatus || closure.status || 'missing';
  const closureId = input.closureId || closure.closureId || '';
  const sourceHeadSha = input.sourceHeadSha || closure.sourceHeadSha || '';

  if (!input.mockLaneClosure) addUnique(blockers, 'mock_lane_closure_missing');
  if (mockLaneClosureStatus !== CLOSED_STATUS) addUnique(blockers, 'mock_lane_closure_not_closed');
  if (closure.mockLaneClosed !== true) addUnique(blockers, 'mock_lane_closed_not_verified');
  if (closure.zeroRealRowsVerified !== true) addUnique(blockers, 'mock_lane_zero_real_rows_not_verified');
  if (!hasValue(input.fixtureSchemaId) || !safeToken(input.fixtureSchemaId || '')) addUnique(blockers, 'fixture_schema_id_missing');
  if (!hasValue(closureId) || !safeToken(closureId)) addUnique(blockers, 'closure_id_missing');
  if (!hasValue(sourceHeadSha)) addUnique(blockers, 'source_head_sha_missing');
  else if (!validSourceHeadSha(sourceHeadSha)) addUnique(blockers, 'source_head_sha_invalid');

  const mode = input.schemaContractMode || 'fixture_schema_only';
  if (FORBIDDEN_MODES.has(mode) || !SAFE_MODES.has(mode)) addUnique(blockers, 'schema_contract_mode_unsafe');

  for (const [key, value] of [
    ['inMemoryOnly', input.inMemoryOnly],
    ['fixtureOnly', input.fixtureOnly],
    ['zeroRealRowsRequired', input.zeroRealRowsRequired],
    ['oneJsonObjectPerLineContract', input.oneJsonObjectPerLineContract],
    ['utf8Required', input.utf8Required],
    ['canonicalFieldOrderRequired', input.canonicalFieldOrderRequired],
    ['multilineStringForbidden', input.multilineStringForbidden]
  ] as const) {
    if (value !== true) addUnique(blockers, `${key}_contract_flag_missing`);
  }

  if (input.sourceHashAlgorithm !== 'sha256') addUnique(blockers, 'source_hash_algorithm_not_sha256');
  if (input.rowIdStrategy !== 'synthetic_deterministic_safe_id') addUnique(blockers, 'row_id_strategy_unsafe');
  if (input.auditExportIdStrategy !== 'synthetic_fixture_batch_id') addUnique(blockers, 'audit_export_id_strategy_unsafe');

  if (canonicalSchemaChanged(input)) addUnique(blockers, 'canonical_schema_weakened');
  if (canonicalAllowlistChanged(input)) addUnique(blockers, 'canonical_allowlist_weakened');
  if (hasAnyRows(input)) addUnique(blockers, 'actual_or_fixture_row_input_forbidden');
  if (hasValue(input.rawPayload)) addUnique(blockers, 'raw_payload_input_forbidden');
  if (hasValue(input.sql) || hasValue(input.query)) addUnique(blockers, 'sql_or_query_input_forbidden');
  if (input.nextSafeAction !== undefined && input.nextSafeAction !== READY_NEXT_ACTION) addUnique(blockers, 'next_safe_action_unsafe');

  for (const code of hasForbiddenBoundaryFlag(input)) addUnique(blockers, code);
  for (const upstreamBlocker of stringArray(closure.blockers)) addUnique(blockers, `upstream_${upstreamBlocker}`);
  for (const ownBlocker of stringArray(input.blockers)) addUnique(blockers, ownBlocker);

  if (hasUnsafeValue(input)) addUnique(blockers, 'unsafe_fixture_schema_value');
  if (input.sourceFilePolicy === 'optional_description_missing') addUnique(needsReviewReasons, 'optional_field_description_incomplete');
  if (input.networkLabelAllowlist?.includes('unknown')) addUnique(needsReviewReasons, 'unknown_network_label_requires_review');
  if (input.entityTypeAllowlist?.includes('deferred_entity')) addUnique(needsReviewReasons, 'deferred_entity_isolated_review');
  for (const reviewReason of stringArray(input.needsReviewReasons)) addUnique(needsReviewReasons, reviewReason);

  const nextSafeAction = determineNextSafeAction(blockers, needsReviewReasons, input);
  const status: Status = blockers.length > 0
    ? 'BLOCKED'
    : needsReviewReasons.length > 0
      ? 'NEEDS_REVIEW'
      : READY_STATUS;

  return {
    status,
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_KIND,
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_TRACE_LABEL,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_VERSION,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    safeSummaryOnly: true,
    fixtureOnly: true,
    inMemoryOnly: true,
    zeroRealRows: true,
    fixtureSchemaId: input.fixtureSchemaId || '',
    closureId,
    sourceHeadSha,
    mockLaneClosureStatus,
    schemaContractMode: mode,
    canonicalFieldOrder: [...D8AO_CANONICAL_FIELD_ORDER],
    fieldDefinitions: FIELD_DEFINITIONS.map((field) => ({ ...field })),
    entityTypeAllowlist: [...D8AO_ENTITY_TYPE_ALLOWLIST],
    evidenceOriginAllowlist: [...D8AO_EVIDENCE_ORIGIN_ALLOWLIST],
    readinessClaimAllowlist: [...D8AO_READINESS_CLAIM_ALLOWLIST],
    walletAddressSummaryAllowlist: [...D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST],
    chainIdAllowlist: [56, 97, null],
    networkLabelAllowlist: ['none', 'bsc_testnet', 'bsc_mainnet', 'unknown'],
    safetyFlagAllowlist: [...D8AO_SAFETY_FLAG_ALLOWLIST],
    jsonlContract: {
      utf8Required: true,
      oneJsonObjectPerLineContract: true,
      canonicalFieldOrderRequired: true,
      multilineStringForbidden: true,
      commentsForbidden: true,
      jsonlLinesReturned: false,
      fileWriteEnabled: false,
      maxFixtureRowBytes: 32768
    },
    identifierPolicies: {
      sourceHashAlgorithm: 'sha256',
      rowIdStrategy: 'synthetic_deterministic_safe_id',
      auditExportIdStrategy: 'synthetic_fixture_batch_id'
    },
    rowValuePolicy: {
      rowValuesAccepted: false,
      fixtureRowsAccepted: false,
      actualRowsAccepted: false,
      rawRowsAccepted: false,
      recordsAccepted: false,
      jsonlLinesAccepted: false
    },
    boundarySummary: emptyBoundarySummary(),
    blockerCount: blockers.length,
    blockers,
    needsReviewReasonCount: needsReviewReasons.length,
    needsReviewReasons,
    nextSafeAction
  };
}
