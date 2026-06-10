import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS,
  type TierUpdateActualSafeRowExportDesignGate
} from './tierUpdateActualSafeRowExportDesignGate';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_CONTRACT_KIND =
  'tier_update_actual_safe_row_export_mock_source_contract' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_CONTRACT_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_KIND =
  'mock_safe_row_source' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_TRACE_LABEL =
  'd8m_actual_safe_row_export_mock_source_contract' as const;

type AllowedEntity = typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES[number];
type ContractStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'MOCK_SOURCE_READY';
type OperatorApprovalStatus =
  | 'missing'
  | 'pending'
  | 'design_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_design_gate'
  | 'provide_mock_safe_row_source'
  | 'remove_unsafe_mock_source_method'
  | 'add_required_safe_row_metadata'
  | 'remove_unsupported_entity'
  | 'remove_unsafe_row_field'
  | 'collect_operator_design_approval'
  | 'prepare_pr_d8n_actual_safe_row_export_dry_run_contract';

export type TierUpdateActualSafeRowExportMockSafeRow = Record<string, unknown>;

type MockRowsReader = () => TierUpdateActualSafeRowExportMockSafeRow[] | Promise<TierUpdateActualSafeRowExportMockSafeRow[]>;

export type TierUpdateActualSafeRowExportMockSource = {
  sourceKind?: string;
  safeSummaryOnly?: boolean;
  readScheduledTierUpdateRows?: MockRowsReader;
  readJobRunRows?: MockRowsReader;
  readTxReceiptEvidenceRows?: MockRowsReader;
  readStagingEvidenceRows?: MockRowsReader;
  [key: string]: unknown;
};

export type TierUpdateActualSafeRowExportMockSourceRequiredFieldPolicy = {
  required?: boolean;
  fields?: string[];
};

export type TierUpdateActualSafeRowExportMockSourceForbiddenFieldPolicy = {
  required?: boolean;
  blockedFields?: string[];
};

export type TierUpdateActualSafeRowExportMockSourceSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportMockSourceOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportMockSourceContractInput = {
  designGate?: TierUpdateActualSafeRowExportDesignGate | null;
  mockSource?: TierUpdateActualSafeRowExportMockSource | null;
  requestedEntities?: string[];
  requiredMetadataFields?: string[] | TierUpdateActualSafeRowExportMockSourceRequiredFieldPolicy;
  forbiddenFieldPolicy?: TierUpdateActualSafeRowExportMockSourceForbiddenFieldPolicy;
  sameHeadEvidence?: TierUpdateActualSafeRowExportMockSourceSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportMockSourceOperatorApproval;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | Date | null;
  operatorId?: string | null;
  runKey?: string | null;
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
  prismaClientEnabled?: boolean;
  fileExportEnabled?: boolean;
  artifactUploadEnabled?: boolean;
  dockerSmokeChanged?: boolean;
  stagingNoTxPassClaimed?: boolean;
  runtimeReadinessClaimed?: boolean;
  productionReadinessClaimed?: boolean;
};

export type TierUpdateActualSafeRowExportMockSourceContract = {
  contractKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_CONTRACT_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_CONTRACT_SCHEMA_VERSION;
  status: ContractStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_TRACE_LABEL;
  designGateStatus: string;
  sourceKind: string;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    safeSummaryOnly: true;
  };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  rowCount: number;
  entityCounts: Record<string, number>;
  requiredMetadataStatus: 'present' | 'missing';
  forbiddenFieldPolicyStatus: 'present' | 'missing';
  sameHeadEvidenceStatus: 'required' | 'blocked';
  operatorApprovalStatus: 'design_approved' | 'pending' | 'blocked';
  sourceMethodPolicyStatus: 'safe' | 'blocked';
  rowSafetyStatus: 'safe' | 'blocked';
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
  blockerCount: number;
  compactBlockerCodes: string[];
  missingRequirementCount: number;
  compactMissingRequirementCodes: string[];
  operatorSummary: {
    operatorId: { provided: boolean; safeSummaryOnly: true };
    runKey: { provided: boolean; safeSummaryOnly: true };
    sourceHeadSha: { provided: boolean; safeSummaryOnly: true };
    sourceHash: { provided: boolean; safeSummaryOnly: true };
    exportedAt: { provided: boolean; safeSummaryOnly: true };
  };
  nextSafeAction: NextSafeAction;
};

const ALLOWED_ENTITY_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES);

const SOURCE_METHOD_BY_ENTITY: Record<AllowedEntity, keyof TierUpdateActualSafeRowExportMockSource> = {
  scheduled_tier_update: 'readScheduledTierUpdateRows',
  job_run: 'readJobRunRows',
  tx_receipt_evidence: 'readTxReceiptEvidenceRows',
  staging_evidence: 'readStagingEvidenceRows'
};

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
  'token_detail',
  'tokendetail',
  'wallet_summary',
  'user_identity_full',
  'reward_ledger_rows',
  'public_catalog_rows'
]);

const FORBIDDEN_SOURCE_KEYS = new Set([
  'query',
  'execute',
  'transaction',
  'connect',
  'disconnect',
  'prisma',
  'raw',
  'findmany',
  'create',
  'update',
  'delete',
  'upsert',
  'writefile',
  'uploadartifact',
  'readenv',
  'readdatabaseurl'
]);

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

const FORBIDDEN_ROW_KEY_PATTERNS = [
  /raw/i,
  /private/i,
  /secret/i,
  /token/i,
  /cookie/i,
  /authorization/i,
  /database_?url/i,
  /db_?url/i,
  /rpc_?url/i,
  /endpoint/i,
  /full.*wallet/i,
  /wallet.*raw/i,
  /tx_?hash$/i,
  /txhash$/i,
  /checkpoint$/i,
  /provider.*error/i,
  /file_?path/i,
  /local_?path/i,
  /stack_?trace/i
];

const UNSAFE_VALUE_PATTERNS = [
  /DATABASE_URL=/i,
  /Authorization:/i,
  /Bearer\s+[A-Za-z0-9._~+/=-]+/i,
  /-----BEGIN/i,
  /private_key/i,
  /https?:\/\//i,
  /[A-Z]:\\Users\\/i,
  /\/home\//i,
  /0x[a-fA-F0-9]{40,}/,
  /raw\s+(?:db|jsonl|wallet|txhash|checkpoint|env|path|provider|receipt|operator|worker|stack|payload)/i
];

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

const normalizeKey = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

const uniqueNormalized = (values: string[] | undefined): string[] => (
  Array.from(new Set((values || []).map((value) => normalize(String(value))).filter(Boolean))).sort()
);

const compactCodes = (codes: Iterable<string>): string[] => (
  Array.from(new Set(Array.from(codes).filter(Boolean).map((code) => (
    code.length > 96 ? code.slice(0, 96) : code
  )))).sort().slice(0, 12)
);

const safePresence = (value: unknown): { provided: boolean; safeSummaryOnly: true } => ({
  provided: value !== undefined && value !== null && String(value).trim().length > 0,
  safeSummaryOnly: true
});

const metadataFields = (
  policy: BuildTierUpdateActualSafeRowExportMockSourceContractInput['requiredMetadataFields']
): string[] | undefined => (Array.isArray(policy) ? policy : policy?.fields);

const evaluateDesignGate = (
  designGate: TierUpdateActualSafeRowExportDesignGate | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!designGate) {
    add(blockers, 'design_gate_missing');
    add(missing, 'design_gate');
    return 'missing';
  }
  if (designGate.status === 'DESIGN_READY') return 'DESIGN_READY';
  if (designGate.status === 'NEEDS_REVIEW') {
    add(missing, 'design_gate_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'design_gate_blocked');
  return String(designGate.status || 'blocked');
};

const evaluateRequestedEntities = (
  requestedEntities: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { requested: AllowedEntity[]; requestedCount: number; allowedCount: number; disallowedEntityCount: number } => {
  const requested = uniqueNormalized(requestedEntities);
  if (requested.length === 0) {
    add(missing, 'requested_entities_required');
    return { requested: [], requestedCount: 0, allowedCount: 0, disallowedEntityCount: 0 };
  }

  const allowed = requested.filter((entity): entity is AllowedEntity => ALLOWED_ENTITY_SET.has(entity));
  const disallowed = requested.filter((entity) => !ALLOWED_ENTITY_SET.has(entity));
  if (disallowed.length > 0) add(blockers, 'unsupported_entity_requested');
  if (disallowed.some((entity) => DEFERRED_ENTITIES.has(entity))) add(blockers, 'deferred_entity_requested');

  return {
    requested: allowed,
    requestedCount: requested.length,
    allowedCount: allowed.length,
    disallowedEntityCount: disallowed.length
  };
};

const evaluateMetadata = (
  fields: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' => {
  const provided = new Set(uniqueNormalized(fields));
  const missingFields = TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
    .filter((field) => !provided.has(field));

  for (const field of missingFields) {
    add(blockers, `metadata_missing:${field}`);
    add(missing, `metadata:${field}`);
  }

  return missingFields.length === 0 ? 'present' : 'missing';
};

const evaluateForbiddenFieldPolicy = (
  policy: TierUpdateActualSafeRowExportMockSourceForbiddenFieldPolicy | undefined,
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
  sameHeadEvidence: TierUpdateActualSafeRowExportMockSourceSameHeadEvidence | undefined,
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
  operatorApproval: TierUpdateActualSafeRowExportMockSourceOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'design_approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }

  if (operatorApproval.status === 'design_approved') return 'design_approved';
  if (operatorApproval.status === 'pending') {
    add(missing, 'operator_approval_pending');
    return 'pending';
  }

  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateSource = (
  mockSource: TierUpdateActualSafeRowExportMockSource | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { sourceKind: string; sourceMethodPolicyStatus: 'safe' | 'blocked' } => {
  if (!isPlainObject(mockSource)) {
    add(blockers, 'mock_source_missing');
    add(missing, 'mock_source');
    return { sourceKind: 'missing', sourceMethodPolicyStatus: 'blocked' };
  }

  if (mockSource.sourceKind !== TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_KIND) {
    add(blockers, 'mock_source_kind_invalid');
  }
  if (mockSource.safeSummaryOnly !== true) {
    add(blockers, 'mock_source_safe_summary_only_required');
  }

  for (const key of Object.keys(mockSource)) {
    if (FORBIDDEN_SOURCE_KEYS.has(normalizeKey(key))) {
      add(blockers, `mock_source_forbidden_method:${key}`);
    }
  }

  return {
    sourceKind: String(mockSource.sourceKind || 'missing'),
    sourceMethodPolicyStatus: Array.from(blockers).some((code) => code.startsWith('mock_source_forbidden_method'))
      ? 'blocked'
      : 'safe'
  };
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportMockSourceContractInput,
  blockers: Set<string>
): void => {
  if (input.actualDbQueryEnabled === true) add(blockers, 'actual_db_query_enabled');
  if (input.actualDbExportEnabled === true) add(blockers, 'actual_db_export_enabled');
  if (input.prismaClientEnabled === true) add(blockers, 'prisma_client_enabled');
  if (input.fileExportEnabled === true) add(blockers, 'file_export_enabled');
  if (input.artifactUploadEnabled === true) add(blockers, 'artifact_upload_enabled');
  if (input.dockerSmokeChanged === true) add(blockers, 'docker_smoke_changed');
  if (input.stagingNoTxPassClaimed === true) add(blockers, 'staging_no_tx_pass_claimed');
  if (input.runtimeReadinessClaimed === true) add(blockers, 'runtime_readiness_claimed');
  if (input.productionReadinessClaimed === true) add(blockers, 'production_readiness_claimed');
};

const isSafeSummaryKey = (key: string): boolean => /_summary$/i.test(key);

const inspectRowValue = (
  value: unknown,
  blockers: Set<string>,
  path: string
): void => {
  if (typeof value === 'string') {
    if (UNSAFE_VALUE_PATTERNS.some((pattern) => pattern.test(value))) add(blockers, `unsafe_row_value:${path}`);
    return;
  }
  if (value === null || value === undefined || typeof value === 'number' || typeof value === 'boolean') return;
  if (value instanceof Date) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectRowValue(entry, blockers, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) {
    add(blockers, `unsafe_row_value:${path}`);
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    const summaryKey = isSafeSummaryKey(key);
    if (!summaryKey && FORBIDDEN_ROW_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
      add(blockers, `unsafe_row_field:${path}.${key}`);
    }
    inspectRowValue(entry, blockers, `${path}.${key}`);
  }
};

const inspectRow = (
  row: TierUpdateActualSafeRowExportMockSafeRow,
  index: number,
  requestedEntities: Set<string>,
  blockers: Set<string>
): AllowedEntity | null => {
  for (const field of TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS) {
    if (row[field] === undefined || row[field] === null || String(row[field]).trim().length === 0) {
      add(blockers, `row_metadata_missing:${field}`);
    }
  }

  const entity = typeof row.entity_type === 'string' ? normalize(row.entity_type) : '';
  if (!ALLOWED_ENTITY_SET.has(entity)) {
    add(blockers, 'row_entity_unsupported');
  }
  if (entity && !requestedEntities.has(entity)) {
    add(blockers, 'row_entity_not_requested');
  }
  if (row.readiness_claim !== 'none') {
    add(blockers, 'row_readiness_claim_forbidden');
  }
  if (row.safeSummaryOnly !== true) {
    add(blockers, 'row_safe_summary_only_required');
  }

  inspectRowValue(row, blockers, `row[${index}]`);
  return ALLOWED_ENTITY_SET.has(entity) ? entity as AllowedEntity : null;
};

const readRows = async (
  mockSource: TierUpdateActualSafeRowExportMockSource | null | undefined,
  requestedEntities: AllowedEntity[],
  blockers: Set<string>,
  missing: Set<string>
): Promise<TierUpdateActualSafeRowExportMockSafeRow[]> => {
  if (!isPlainObject(mockSource)) return [];

  const rows: TierUpdateActualSafeRowExportMockSafeRow[] = [];
  for (const entity of requestedEntities) {
    const methodName = SOURCE_METHOD_BY_ENTITY[entity];
    const reader = mockSource[methodName];
    if (reader === undefined) {
      add(missing, `mock_source_method:${entity}`);
      continue;
    }
    if (typeof reader !== 'function') {
      add(blockers, `mock_source_reader_invalid:${entity}`);
      continue;
    }
    const result = await reader();
    if (!Array.isArray(result)) {
      add(blockers, `mock_source_reader_non_array:${entity}`);
      continue;
    }
    rows.push(...result);
  }
  return rows;
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportMockSourceContractInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: ContractStatus
): NextSafeAction => {
  if (!input.designGate) return 'build_actual_safe_row_export_design_gate';
  if (!input.mockSource) return 'provide_mock_safe_row_source';
  if (Array.from(blockers).some((code) => code.startsWith('mock_source_forbidden_method'))) return 'remove_unsafe_mock_source_method';
  if (
    Array.from(blockers).some((code) => code.startsWith('metadata_missing') || code.startsWith('row_metadata_missing')) ||
    Array.from(missing).some((code) => code.startsWith('metadata:'))
  ) return 'add_required_safe_row_metadata';
  if (
    blockers.has('unsupported_entity_requested') ||
    blockers.has('deferred_entity_requested') ||
    blockers.has('row_entity_unsupported') ||
    blockers.has('row_entity_not_requested')
  ) return 'remove_unsupported_entity';
  if (
    Array.from(blockers).some((code) => code.startsWith('unsafe_row_field') || code.startsWith('unsafe_row_value')) ||
    blockers.has('row_readiness_claim_forbidden')
  ) return 'remove_unsafe_row_field';
  if (missing.has('operator_approval_pending')) return 'collect_operator_design_approval';
  if (status === 'MOCK_SOURCE_READY') return 'prepare_pr_d8n_actual_safe_row_export_dry_run_contract';
  return 'collect_operator_design_approval';
};

export const buildTierUpdateActualSafeRowExportMockSourceContract = async (
  input: BuildTierUpdateActualSafeRowExportMockSourceContractInput
): Promise<TierUpdateActualSafeRowExportMockSourceContract> => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const designGateStatus = evaluateDesignGate(input.designGate, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const requiredMetadataStatus = evaluateMetadata(metadataFields(input.requiredMetadataFields), blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  const sourceSummary = evaluateSource(input.mockSource, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const canReadRows =
    blockers.size === 0 &&
    missing.size === 0 &&
    input.designGate?.status === 'DESIGN_READY' &&
    isPlainObject(input.mockSource);
  const rows = canReadRows
    ? await readRows(input.mockSource, entitySummary.requested, blockers, missing)
    : [];
  if (canReadRows && rows.length === 0) add(missing, 'mock_safe_rows_required');

  const entityCounts: Record<string, number> = {};
  const requestedEntitySet = new Set<string>(entitySummary.requested);
  rows.forEach((row, index) => {
    const entity = inspectRow(row, index, requestedEntitySet, blockers);
    if (entity) entityCounts[entity] = (entityCounts[entity] ?? 0) + 1;
  });

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const status: ContractStatus = compactBlockerCodes.length > 0
    ? 'BLOCKED'
    : compactMissingRequirementCodes.length > 0
      ? 'NEEDS_REVIEW'
      : 'MOCK_SOURCE_READY';

  return {
    contractKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_CONTRACT_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_CONTRACT_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_TRACE_LABEL,
    designGateStatus,
    sourceKind: sourceSummary.sourceKind,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    rowCount: status === 'BLOCKED' ? 0 : rows.length,
    entityCounts: status === 'BLOCKED' ? {} : Object.fromEntries(Object.entries(entityCounts).sort(([left], [right]) => left.localeCompare(right))),
    requiredMetadataStatus,
    forbiddenFieldPolicyStatus,
    sameHeadEvidenceStatus,
    operatorApprovalStatus,
    sourceMethodPolicyStatus: sourceSummary.sourceMethodPolicyStatus,
    rowSafetyStatus: compactBlockerCodes.some((code) => code.startsWith('unsafe_row') || code.startsWith('row_')) ? 'blocked' : 'safe',
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
    blockerCount: compactBlockerCodes.length,
    compactBlockerCodes,
    missingRequirementCount: compactMissingRequirementCodes.length,
    compactMissingRequirementCodes,
    operatorSummary: {
      operatorId: safePresence(input.operatorId),
      runKey: safePresence(input.runKey),
      sourceHeadSha: safePresence(input.sourceHeadSha),
      sourceHash: safePresence(input.sourceHash),
      exportedAt: safePresence(input.exportedAt)
    },
    nextSafeAction: determineNextSafeAction(input, blockers, missing, status)
  };
};
