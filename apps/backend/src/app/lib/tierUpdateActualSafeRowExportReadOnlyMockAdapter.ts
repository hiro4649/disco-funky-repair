import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from './tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportDryRunContract
} from './tierUpdateActualSafeRowExportDryRunContract';
import type {
  TierUpdateActualSafeRowExportMockSafeRow
} from './tierUpdateActualSafeRowExportMockSourceContract';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS,
  type TierUpdateActualSafeRowExportReadOnlyAdapterDesign
} from './tierUpdateActualSafeRowExportReadOnlyAdapterDesign';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_MOCK_ADAPTER_KIND =
  'tier_update_actual_safe_row_export_read_only_mock_adapter' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_MOCK_ADAPTER_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_MOCK_ADAPTER_TRACE_LABEL =
  'd8p_actual_safe_row_export_read_only_mock_adapter' as const;

type AllowedEntity = typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES[number];
type AdapterStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'MOCK_ADAPTER_READY';
type MethodName = typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS[number];
type OperatorApprovalStatus =
  | 'pending'
  | 'adapter_design_approved'
  | 'adapter_implementation_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_read_only_adapter_design'
  | 'build_actual_safe_row_export_dry_run_contract'
  | 'provide_injected_safe_rows'
  | 'remove_forbidden_adapter_method'
  | 'remove_duplicate_row_ids'
  | 'add_required_safe_row_metadata'
  | 'remove_unsupported_entity'
  | 'remove_unsafe_row_field'
  | 'collect_operator_adapter_implementation_approval'
  | 'prepare_pr_d8q_read_only_adapter_dry_run_execution_bridge';

export type TierUpdateActualSafeRowExportReadOnlyMockAdapterSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlyMockAdapterOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type TierUpdateActualSafeRowExportReadOnlyMockAdapterForbiddenFieldPolicy = {
  required?: boolean;
  blockedFields?: string[];
};

export type BuildTierUpdateActualSafeRowExportReadOnlyMockAdapterInput = {
  adapterDesign?: TierUpdateActualSafeRowExportReadOnlyAdapterDesign | null;
  dryRunContract?: TierUpdateActualSafeRowExportDryRunContract | null;
  safeRows?: TierUpdateActualSafeRowExportMockSafeRow[] | null;
  requestedEntities?: string[];
  exposedMethodNames?: string[];
  requiredMetadataFields?: string[];
  forbiddenFieldPolicy?: TierUpdateActualSafeRowExportReadOnlyMockAdapterForbiddenFieldPolicy;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlyMockAdapterSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlyMockAdapterOperatorApproval;
  includeRows?: boolean;
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
  prismaClientEnabled?: boolean;
  fileExportEnabled?: boolean;
  artifactUploadEnabled?: boolean;
  dockerSmokeChanged?: boolean;
  stagingNoTxPassClaimed?: boolean;
  runtimeReadinessClaimed?: boolean;
  productionReadinessClaimed?: boolean;
  [key: string]: unknown;
};

export type TierUpdateActualSafeRowExportReadOnlyMockAdapterMethods = Record<
  MethodName,
  () => TierUpdateActualSafeRowExportMockSafeRow[]
>;

export type TierUpdateActualSafeRowExportReadOnlyMockAdapter = {
  adapterKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_MOCK_ADAPTER_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_MOCK_ADAPTER_SCHEMA_VERSION;
  status: AdapterStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_MOCK_ADAPTER_TRACE_LABEL;
  adapterDesignStatus: string;
  dryRunContractStatus: string;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    safeSummaryOnly: true;
  };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  exposedMethodNames: string[];
  allowedMethodCount: number;
  forbiddenMethodCount: number;
  compactForbiddenMethodCodes: string[];
  rowCount: number;
  entityCounts: Record<string, number>;
  duplicateRowIdCount: number;
  requiredMetadataStatus: 'present' | 'missing';
  forbiddenFieldPolicyStatus: 'present' | 'missing';
  rowSafetyStatus: 'safe' | 'blocked';
  sameHeadEvidenceStatus: 'required' | 'blocked';
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked';
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  actualDbQueryEnabled: false;
  actualDbExportEnabled: false;
  prismaClientEnabled: false;
  fileExportEnabled: false;
  artifactUploadEnabled: false;
  dockerSmokeChanged: false;
  stagingNoTxPassClaimed: false;
  runtimeReadinessClaimed: false;
  productionReadinessClaimed: false;
  includeRows: boolean;
  rows: TierUpdateActualSafeRowExportMockSafeRow[] | null;
  adapterMethods: TierUpdateActualSafeRowExportReadOnlyMockAdapterMethods;
  blockerCount: number;
  compactBlockerCodes: string[];
  missingRequirementCount: number;
  compactMissingRequirementCodes: string[];
  unsafeReasonCount: number;
  compactUnsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const ALLOWED_ENTITY_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES);
const ALLOWED_METHOD_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS);

const REQUIRED_FORBIDDEN_FIELD_CODES = [
  'raw_db_dump',
  'full_wallet_address',
  'raw_private_path',
  'local_file_path',
  'raw_env',
  'db_url',
  'rpc_url',
  'private_key',
  'jwt',
  'cookie',
  'authorization_header',
  'raw_provider_error',
  'raw_receipt_payload',
  'raw_checkpoint_payload',
  'raw_jsonl_body',
  'raw_operator_note',
  'raw_worker_note',
  'raw_stack_trace'
] as const;

const DEFERRED_ENTITIES = new Set([
  'prize',
  'prizetransactions',
  'prize_transactions',
  'lotterytickets',
  'lottery_tickets',
  'ticketcode',
  'ticket_code',
  'nft',
  'nft_metadata',
  'tokendetail',
  'token_detail',
  'wallet_summary',
  'user_identity_full',
  'reward_ledger_rows',
  'public_catalog_rows'
]);

const FORBIDDEN_METHOD_OR_KEY_SET = new Set([
  'query',
  'execute',
  'transaction',
  'raw',
  'rawquery',
  'unsafe_raw',
  'unsaferaw',
  'findmany',
  'findfirst',
  'create',
  'update',
  'delete',
  'upsert',
  'connect',
  'disconnect',
  'prisma',
  'database',
  'db',
  'client',
  'pool',
  'connection',
  'readenv',
  'read_env',
  'readdatabaseurl',
  'read_database_url',
  'getdatabaseurl',
  'get_database_url',
  'readsecret',
  'read_secret',
  'writefile',
  'write_file',
  'createwritestream',
  'create_write_stream',
  'uploadartifact',
  'upload_artifact',
  'send',
  'broadcast',
  'tx',
  'wallet',
  'provider',
  'contract',
  'rpc',
  'privatekey',
  'private_key',
  'authorization',
  'cookie'
]);

const FORBIDDEN_ROW_KEY_PATTERNS = [
  /raw/i,
  /private/i,
  /wallet(?!_summary$)/i,
  /checkpoint(?!_summary$)/i,
  /error(?!_kind$)/i,
  /env/i,
  /path/i,
  /provider/i,
  /authorization/i,
  /cookie/i,
  /secret/i
];

const UNSAFE_VALUE_PATTERNS = [
  /DATABASE_URL=/i,
  /Authorization:/i,
  /Bearer\s+/i,
  /-----BEGIN/i,
  /private_key/i,
  /\bhttps?:\/\//i,
  /C:\\Users\\/i,
  /\/home\//i,
  /rawPayload/i,
  /rawLog/i,
  /rawCue/i,
  /rawRenderer/i
];

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

const compactCodes = (codes: Set<string>): string[] => Array.from(codes).sort();

const add = (target: Set<string>, code: string): void => {
  target.add(code);
};

const uniqueNormalized = (values: string[] | undefined): string[] => (
  Array.from(new Set((values ?? []).map((value) => normalize(String(value))).filter(Boolean)))
);

const cloneRows = (
  rows: TierUpdateActualSafeRowExportMockSafeRow[],
  entityType?: AllowedEntity
): TierUpdateActualSafeRowExportMockSafeRow[] => JSON.parse(JSON.stringify(
  entityType ? rows.filter((row) => row.entity_type === entityType) : rows
));

const isSafeSummaryKey = (key: string): boolean => (
  key.endsWith('_summary') ||
  key === 'safe_summary' ||
  key === 'safeSummaryOnly' ||
  key === 'safe_error_kind' ||
  key === 'readiness_claim'
);

const evaluateAdapterDesign = (
  adapterDesign: TierUpdateActualSafeRowExportReadOnlyAdapterDesign | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!adapterDesign) {
    add(blockers, 'adapter_design_missing');
    add(missing, 'adapter_design');
    return 'missing';
  }
  if (adapterDesign.status === 'BLOCKED') {
    add(blockers, 'adapter_design_blocked');
    return adapterDesign.status;
  }
  if (adapterDesign.status === 'NEEDS_REVIEW') {
    add(missing, 'adapter_design_needs_review');
    return adapterDesign.status;
  }
  if (adapterDesign.status !== 'ADAPTER_DESIGN_READY') {
    add(blockers, 'adapter_design_not_ready');
  }
  return adapterDesign.status;
};

const evaluateDryRunContract = (
  dryRunContract: TierUpdateActualSafeRowExportDryRunContract | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!dryRunContract) {
    add(blockers, 'dry_run_contract_missing');
    add(missing, 'dry_run_contract');
    return 'missing';
  }
  if (dryRunContract.status === 'BLOCKED') {
    add(blockers, 'dry_run_contract_blocked');
    return dryRunContract.status;
  }
  if (dryRunContract.status === 'NEEDS_REVIEW') {
    add(missing, 'dry_run_contract_needs_review');
    return dryRunContract.status;
  }
  if (dryRunContract.status !== 'DRY_RUN_READY') {
    add(blockers, 'dry_run_contract_not_ready');
  }
  return dryRunContract.status;
};

const evaluateRequestedEntities = (
  requestedEntities: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { requested: Set<string>; requestedCount: number; allowedCount: number; disallowedEntityCount: number } => {
  const requested = uniqueNormalized(requestedEntities);
  if (requested.length === 0) {
    add(missing, 'requested_entities_required');
    return { requested: new Set(), requestedCount: 0, allowedCount: 0, disallowedEntityCount: 0 };
  }
  let allowedCount = 0;
  let disallowedEntityCount = 0;
  for (const entity of requested) {
    if (ALLOWED_ENTITY_SET.has(entity)) {
      allowedCount += 1;
    } else {
      disallowedEntityCount += 1;
      add(blockers, DEFERRED_ENTITIES.has(entity) ? `deferred_entity_requested:${entity}` : `unsupported_entity_requested:${entity}`);
    }
  }
  return {
    requested: new Set(requested),
    requestedCount: requested.length,
    allowedCount,
    disallowedEntityCount
  };
};

const evaluateRequiredMetadata = (
  fields: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' => {
  const provided = new Set(uniqueNormalized(fields));
  const missingFields = TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS.filter((field) => !provided.has(field));
  for (const field of missingFields) {
    add(blockers, `metadata_missing:${field}`);
    add(missing, `metadata:${field}`);
  }
  return missingFields.length === 0 ? 'present' : 'missing';
};

const evaluateForbiddenFieldPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlyMockAdapterForbiddenFieldPolicy | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' => {
  if (policy?.required !== true) {
    add(blockers, 'forbidden_field_policy_missing');
    add(missing, 'forbidden_field_policy');
    return 'missing';
  }
  const blockedFields = new Set(uniqueNormalized(policy.blockedFields));
  const missingFields = REQUIRED_FORBIDDEN_FIELD_CODES.filter((field) => !blockedFields.has(field));
  for (const field of missingFields) {
    add(blockers, `forbidden_policy_missing:${field}`);
    add(missing, `forbidden_policy:${field}`);
  }
  return missingFields.length === 0 ? 'present' : 'missing';
};

const evaluateSameHeadEvidence = (
  sameHeadEvidence: TierUpdateActualSafeRowExportReadOnlyMockAdapterSameHeadEvidence | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'required' | 'blocked' => {
  if (sameHeadEvidence?.required !== true) {
    add(blockers, 'same_head_evidence_required');
    add(missing, 'same_head_evidence');
    return 'blocked';
  }
  return 'required';
};

const evaluateOperatorApproval = (
  operatorApproval: TierUpdateActualSafeRowExportReadOnlyMockAdapterOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (operatorApproval.status === 'adapter_implementation_approved') return 'approved';
  if (operatorApproval.status === 'pending' || operatorApproval.status === 'adapter_design_approved') {
    add(missing, 'operator_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyMockAdapterInput,
  blockers: Set<string>
): void => {
  const flagNames = [
    'actualDbQueryEnabled',
    'actualDbExportEnabled',
    'prismaClientEnabled',
    'fileExportEnabled',
    'artifactUploadEnabled',
    'dockerSmokeChanged',
    'stagingNoTxPassClaimed',
    'runtimeReadinessClaimed',
    'productionReadinessClaimed'
  ] as const;
  for (const flag of flagNames) {
    if (input[flag] === true) add(blockers, `${flag}_forbidden`);
  }
};

const evaluateMethods = (
  exposedMethodNames: string[] | undefined,
  blockers: Set<string>
): { methodNames: string[]; allowedMethodCount: number; forbiddenMethodCount: number; compactForbiddenMethodCodes: string[] } => {
  const methodNames = exposedMethodNames && exposedMethodNames.length > 0
    ? exposedMethodNames
    : [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS];
  const forbidden = new Set<string>();
  let allowedMethodCount = 0;
  for (const methodName of methodNames) {
    const normalized = normalize(methodName);
    if (FORBIDDEN_METHOD_OR_KEY_SET.has(normalized)) add(forbidden, `forbidden_adapter_method:${normalized}`);
    if (ALLOWED_METHOD_SET.has(methodName)) {
      allowedMethodCount += 1;
    } else if (!FORBIDDEN_METHOD_OR_KEY_SET.has(normalized)) {
      add(forbidden, `unsupported_adapter_method:${normalized}`);
    }
  }
  for (const code of forbidden) add(blockers, code);
  return {
    methodNames: [...methodNames],
    allowedMethodCount,
    forbiddenMethodCount: forbidden.size,
    compactForbiddenMethodCodes: compactCodes(forbidden)
  };
};

const inspectObjectKeys = (value: unknown, blockers: Set<string>, path: string): void => {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectObjectKeys(entry, blockers, `${path}[${index}]`));
    return;
  }
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const normalized = normalize(key);
    if (FORBIDDEN_METHOD_OR_KEY_SET.has(normalized)) add(blockers, `forbidden_adapter_key:${path}.${normalized}`);
    inspectObjectKeys(entry, blockers, `${path}.${key}`);
  }
};

const inspectRowValue = (value: unknown, unsafe: Set<string>, path: string): void => {
  if (typeof value === 'string') {
    if (UNSAFE_VALUE_PATTERNS.some((pattern) => pattern.test(value))) add(unsafe, `unsafe_row_value:${path}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectRowValue(entry, unsafe, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!isSafeSummaryKey(key) && FORBIDDEN_ROW_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
      add(unsafe, `unsafe_row_field:${path}.${key}`);
    }
    inspectRowValue(entry, unsafe, `${path}.${key}`);
  }
};

const inspectRows = (
  rows: TierUpdateActualSafeRowExportMockSafeRow[] | null | undefined,
  requested: Set<string>,
  blockers: Set<string>,
  missing: Set<string>,
  unsafe: Set<string>
): { rowCount: number; entityCounts: Record<string, number>; duplicateRowIdCount: number; safeRows: TierUpdateActualSafeRowExportMockSafeRow[] } => {
  if (!Array.isArray(rows) || rows.length === 0) {
    add(missing, 'injected_safe_rows_required');
    return { rowCount: 0, entityCounts: {}, duplicateRowIdCount: 0, safeRows: [] };
  }
  const rowIds = new Set<string>();
  const duplicateRowIds = new Set<string>();
  const entityCounts: Record<string, number> = {};

  rows.forEach((row, index) => {
    for (const field of TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS) {
      if (row[field] === undefined || row[field] === null || String(row[field]).trim().length === 0) {
        add(blockers, `row_metadata_missing:${field}`);
      }
    }
    const rowId = String(row.row_id ?? '');
    if (rowId) {
      if (rowIds.has(rowId)) duplicateRowIds.add(rowId);
      rowIds.add(rowId);
    }
    const entity = normalize(String(row.entity_type ?? ''));
    if (entity) entityCounts[entity] = (entityCounts[entity] ?? 0) + 1;
    if (!ALLOWED_ENTITY_SET.has(entity)) add(blockers, `row_entity_unsupported:${entity || 'missing'}`);
    if (requested.size > 0 && entity && !requested.has(entity)) add(blockers, `row_entity_not_requested:${entity}`);
    if (row.readiness_claim !== 'none') add(blockers, 'row_readiness_claim_forbidden');
    if (row.safeSummaryOnly !== true) add(blockers, 'row_safe_summary_only_required');
    inspectRowValue(row, unsafe, `row[${index}]`);
  });

  if (duplicateRowIds.size > 0) add(blockers, 'duplicate_row_id');

  return {
    rowCount: rows.length,
    entityCounts,
    duplicateRowIdCount: duplicateRowIds.size,
    safeRows: cloneRows(rows)
  };
};

const determineNextSafeAction = (
  blockers: Set<string>,
  missing: Set<string>,
  unsafe: Set<string>
): NextSafeAction => {
  if (blockers.has('adapter_design_missing') || blockers.has('adapter_design_blocked')) return 'build_read_only_adapter_design';
  if (blockers.has('dry_run_contract_missing') || blockers.has('dry_run_contract_blocked')) {
    return 'build_actual_safe_row_export_dry_run_contract';
  }
  if (missing.has('injected_safe_rows_required')) return 'provide_injected_safe_rows';
  if (Array.from(blockers).some((code) => code.includes('forbidden_adapter_method') || code.includes('unsupported_adapter_method'))) {
    return 'remove_forbidden_adapter_method';
  }
  if (blockers.has('duplicate_row_id')) return 'remove_duplicate_row_ids';
  if (Array.from(blockers).some((code) => code.startsWith('metadata_missing') || code.startsWith('row_metadata_missing'))) {
    return 'add_required_safe_row_metadata';
  }
  if (Array.from(blockers).some((code) => code.includes('entity_'))) return 'remove_unsupported_entity';
  if (unsafe.size > 0 || blockers.has('row_readiness_claim_forbidden') || blockers.has('row_safe_summary_only_required')) {
    return 'remove_unsafe_row_field';
  }
  if (missing.has('operator_approval_pending')) return 'collect_operator_adapter_implementation_approval';
  return 'prepare_pr_d8q_read_only_adapter_dry_run_execution_bridge';
};

const createAdapterMethods = (
  rows: TierUpdateActualSafeRowExportMockSafeRow[]
): TierUpdateActualSafeRowExportReadOnlyMockAdapterMethods => ({
  readScheduledTierUpdateSafeRows: () => cloneRows(rows, 'scheduled_tier_update'),
  readJobRunSafeRows: () => cloneRows(rows, 'job_run'),
  readTxReceiptEvidenceSafeRows: () => cloneRows(rows, 'tx_receipt_evidence'),
  readStagingEvidenceSafeRows: () => cloneRows(rows, 'staging_evidence')
});

export const buildTierUpdateActualSafeRowExportReadOnlyMockAdapter = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyMockAdapterInput
): TierUpdateActualSafeRowExportReadOnlyMockAdapter => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const adapterDesignStatus = evaluateAdapterDesign(input.adapterDesign, blockers, missing);
  const dryRunContractStatus = evaluateDryRunContract(input.dryRunContract, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const requiredMetadataStatus = evaluateRequiredMetadata(input.requiredMetadataFields, blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  const methodSummary = evaluateMethods(input.exposedMethodNames, blockers);
  const rowSummary = inspectRows(input.safeRows, entitySummary.requested, blockers, missing, unsafe);

  evaluateExecutionFlags(input, blockers);
  inspectObjectKeys(input, blockers, 'input');

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status: AdapterStatus = compactBlockerCodes.length > 0 || compactUnsafeReasonCodes.length > 0
    ? 'BLOCKED'
    : compactMissingRequirementCodes.length > 0
      ? 'NEEDS_REVIEW'
      : 'MOCK_ADAPTER_READY';
  const safeRows = rowSummary.safeRows;

  return {
    adapterKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_MOCK_ADAPTER_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_MOCK_ADAPTER_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_MOCK_ADAPTER_TRACE_LABEL,
    adapterDesignStatus,
    dryRunContractStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    exposedMethodNames: methodSummary.methodNames,
    allowedMethodCount: methodSummary.allowedMethodCount,
    forbiddenMethodCount: methodSummary.forbiddenMethodCount,
    compactForbiddenMethodCodes: methodSummary.compactForbiddenMethodCodes,
    rowCount: rowSummary.rowCount,
    entityCounts: rowSummary.entityCounts,
    duplicateRowIdCount: rowSummary.duplicateRowIdCount,
    requiredMetadataStatus,
    forbiddenFieldPolicyStatus,
    rowSafetyStatus: compactBlockerCodes.some((code) => code.startsWith('row_')) || compactUnsafeReasonCodes.length > 0 ? 'blocked' : 'safe',
    sameHeadEvidenceStatus,
    operatorApprovalStatus,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    actualDbQueryEnabled: false,
    actualDbExportEnabled: false,
    prismaClientEnabled: false,
    fileExportEnabled: false,
    artifactUploadEnabled: false,
    dockerSmokeChanged: false,
    stagingNoTxPassClaimed: false,
    runtimeReadinessClaimed: false,
    productionReadinessClaimed: false,
    includeRows: input.includeRows === true,
    rows: input.includeRows === true ? cloneRows(safeRows) : null,
    adapterMethods: createAdapterMethods(safeRows),
    blockerCount: compactBlockerCodes.length,
    compactBlockerCodes,
    missingRequirementCount: compactMissingRequirementCodes.length,
    compactMissingRequirementCodes,
    unsafeReasonCount: compactUnsafeReasonCodes.length,
    compactUnsafeReasonCodes,
    nextSafeAction: determineNextSafeAction(blockers, missing, unsafe)
  };
};
