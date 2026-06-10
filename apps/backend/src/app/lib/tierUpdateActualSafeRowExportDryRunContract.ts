import { createHash } from 'crypto';

import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from './tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportMockSafeRow,
  TierUpdateActualSafeRowExportMockSourceContract
} from './tierUpdateActualSafeRowExportMockSourceContract';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DRY_RUN_CONTRACT_KIND =
  'tier_update_actual_safe_row_export_dry_run_contract' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DRY_RUN_CONTRACT_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DRY_RUN_TRACE_LABEL =
  'd8n_actual_safe_row_export_dry_run_contract' as const;

type AllowedEntity = typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES[number];
type DryRunStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'DRY_RUN_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'design_approved'
  | 'dry_run_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_mock_source_contract'
  | 'provide_mock_safe_rows'
  | 'remove_duplicate_row_ids'
  | 'add_required_safe_row_metadata'
  | 'remove_unsupported_entity'
  | 'remove_unsafe_row_field'
  | 'collect_operator_dry_run_approval'
  | 'prepare_pr_d8o_actual_safe_row_export_read_only_adapter_design';

export type TierUpdateActualSafeRowExportDryRunForbiddenFieldPolicy = {
  required?: boolean;
  blockedFields?: string[];
};

export type TierUpdateActualSafeRowExportDryRunSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportDryRunOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportDryRunContractInput = {
  mockSourceContract?: TierUpdateActualSafeRowExportMockSourceContract | null;
  dryRunRows?: TierUpdateActualSafeRowExportMockSafeRow[] | null;
  requestedEntities?: string[];
  requiredMetadataFields?: string[];
  forbiddenFieldPolicy?: TierUpdateActualSafeRowExportDryRunForbiddenFieldPolicy;
  sameHeadEvidence?: TierUpdateActualSafeRowExportDryRunSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportDryRunOperatorApproval;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | Date | null;
  operatorId?: string | null;
  runKey?: string | null;
  includeJsonl?: boolean;
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

export type TierUpdateActualSafeRowExportDryRunContract = {
  dryRunKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DRY_RUN_CONTRACT_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DRY_RUN_CONTRACT_SCHEMA_VERSION;
  status: DryRunStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DRY_RUN_TRACE_LABEL;
  mockSourceContractStatus: string;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    safeSummaryOnly: true;
  };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
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
  jsonlSha256Summary: string | null;
  includeJsonl: boolean;
  jsonl: string | null;
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
  unsafeReasonCount: number;
  compactUnsafeReasonCodes: string[];
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

const evaluateMockSourceContract = (
  mockSourceContract: TierUpdateActualSafeRowExportMockSourceContract | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!mockSourceContract) {
    add(blockers, 'mock_source_contract_missing');
    add(missing, 'mock_source_contract');
    return 'missing';
  }
  if (mockSourceContract.status === 'MOCK_SOURCE_READY') return 'MOCK_SOURCE_READY';
  if (mockSourceContract.status === 'NEEDS_REVIEW') {
    add(missing, 'mock_source_contract_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'mock_source_contract_blocked');
  return String(mockSourceContract.status || 'blocked');
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

  const allowed = requested.filter((entity) => ALLOWED_ENTITY_SET.has(entity));
  const disallowed = requested.filter((entity) => !ALLOWED_ENTITY_SET.has(entity));
  if (disallowed.length > 0) add(blockers, 'unsupported_entity_requested');
  if (disallowed.some((entity) => DEFERRED_ENTITIES.has(entity))) add(blockers, 'deferred_entity_requested');

  return {
    requested: new Set(allowed),
    requestedCount: requested.length,
    allowedCount: allowed.length,
    disallowedEntityCount: disallowed.length
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
  policy: TierUpdateActualSafeRowExportDryRunForbiddenFieldPolicy | undefined,
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
  sameHeadEvidence: TierUpdateActualSafeRowExportDryRunSameHeadEvidence | undefined,
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
  operatorApproval: TierUpdateActualSafeRowExportDryRunOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (operatorApproval.status === 'design_approved' || operatorApproval.status === 'dry_run_approved') return 'approved';
  if (operatorApproval.status === 'pending') {
    add(missing, 'operator_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportDryRunContractInput,
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
  unsafe: Set<string>,
  path: string
): void => {
  if (typeof value === 'string') {
    if (UNSAFE_VALUE_PATTERNS.some((pattern) => pattern.test(value))) add(unsafe, `unsafe_row_value:${path}`);
    return;
  }
  if (value === null || value === undefined || typeof value === 'number' || typeof value === 'boolean') return;
  if (value instanceof Date) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectRowValue(entry, unsafe, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) {
    add(unsafe, `unsafe_row_value:${path}`);
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    if (!isSafeSummaryKey(key) && FORBIDDEN_ROW_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
      add(unsafe, `unsafe_row_field:${path}.${key}`);
    }
    inspectRowValue(entry, unsafe, `${path}.${key}`);
  }
};

const inspectRows = (
  rows: TierUpdateActualSafeRowExportMockSafeRow[] | null | undefined,
  requestedEntities: Set<string>,
  blockers: Set<string>,
  missing: Set<string>,
  unsafe: Set<string>
): { rowCount: number; entityCounts: Record<string, number>; duplicateRowIdCount: number } => {
  if (!Array.isArray(rows) || rows.length === 0) {
    add(missing, 'dry_run_rows_required');
    return { rowCount: 0, entityCounts: {}, duplicateRowIdCount: 0 };
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

    const rowId = typeof row.row_id === 'string' ? row.row_id : '';
    if (rowId) {
      if (rowIds.has(rowId)) duplicateRowIds.add(rowId);
      rowIds.add(rowId);
    }

    const entity = typeof row.entity_type === 'string' ? normalize(row.entity_type) : '';
    if (!ALLOWED_ENTITY_SET.has(entity)) {
      add(blockers, 'row_entity_unsupported');
    } else {
      entityCounts[entity] = (entityCounts[entity] ?? 0) + 1;
      if (requestedEntities.size > 0 && !requestedEntities.has(entity)) add(blockers, 'row_entity_not_requested');
    }

    if (row.readiness_claim !== 'none') add(blockers, 'row_readiness_claim_forbidden');
    if (row.safeSummaryOnly !== true) add(blockers, 'row_safe_summary_only_required');
    inspectRowValue(row, unsafe, `row[${index}]`);
  });

  if (duplicateRowIds.size > 0) add(blockers, 'duplicate_row_id');

  return {
    rowCount: rows.length,
    entityCounts: Object.fromEntries(Object.entries(entityCounts).sort(([left], [right]) => left.localeCompare(right))),
    duplicateRowIdCount: duplicateRowIds.size
  };
};

const safeJsonl = (rows: TierUpdateActualSafeRowExportMockSafeRow[]): string => (
  rows.map((row) => JSON.stringify(Object.fromEntries(Object.entries(row).sort(([left], [right]) => left.localeCompare(right))))).join('\n')
);

const sha256Summary = (value: string): string => `sha256:${createHash('sha256').update(value).digest('hex')}`;

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportDryRunContractInput,
  blockers: Set<string>,
  missing: Set<string>,
  unsafe: Set<string>,
  status: DryRunStatus
): NextSafeAction => {
  if (!input.mockSourceContract) return 'build_actual_safe_row_export_mock_source_contract';
  if (missing.has('dry_run_rows_required')) return 'provide_mock_safe_rows';
  if (blockers.has('duplicate_row_id')) return 'remove_duplicate_row_ids';
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
  if (unsafe.size > 0 || blockers.has('row_readiness_claim_forbidden') || blockers.has('row_safe_summary_only_required')) {
    return 'remove_unsafe_row_field';
  }
  if (missing.has('operator_approval_pending')) return 'collect_operator_dry_run_approval';
  if (status === 'DRY_RUN_READY') return 'prepare_pr_d8o_actual_safe_row_export_read_only_adapter_design';
  return 'collect_operator_dry_run_approval';
};

export const buildTierUpdateActualSafeRowExportDryRunContract = (
  input: BuildTierUpdateActualSafeRowExportDryRunContractInput
): TierUpdateActualSafeRowExportDryRunContract => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const mockSourceContractStatus = evaluateMockSourceContract(input.mockSourceContract, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const requiredMetadataStatus = evaluateRequiredMetadata(input.requiredMetadataFields, blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);
  const rowSummary = inspectRows(input.dryRunRows, entitySummary.requested, blockers, missing, unsafe);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status: DryRunStatus = compactBlockerCodes.length > 0 || compactUnsafeReasonCodes.length > 0
    ? 'BLOCKED'
    : compactMissingRequirementCodes.length > 0
      ? 'NEEDS_REVIEW'
      : 'DRY_RUN_READY';
  const shouldReturnJsonl = input.includeJsonl === true && status === 'DRY_RUN_READY' && Array.isArray(input.dryRunRows);
  const jsonl = shouldReturnJsonl ? safeJsonl(input.dryRunRows || []) : null;
  const hashInput = status === 'BLOCKED' || !Array.isArray(input.dryRunRows) ? '' : safeJsonl(input.dryRunRows);

  return {
    dryRunKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DRY_RUN_CONTRACT_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DRY_RUN_CONTRACT_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DRY_RUN_TRACE_LABEL,
    mockSourceContractStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    rowCount: status === 'BLOCKED' ? 0 : rowSummary.rowCount,
    entityCounts: status === 'BLOCKED' ? {} : rowSummary.entityCounts,
    duplicateRowIdCount: rowSummary.duplicateRowIdCount,
    requiredMetadataStatus,
    forbiddenFieldPolicyStatus,
    rowSafetyStatus: compactBlockerCodes.some((code) => code.startsWith('row_')) || compactUnsafeReasonCodes.length > 0 ? 'blocked' : 'safe',
    sameHeadEvidenceStatus,
    operatorApprovalStatus,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    jsonlSha256Summary: hashInput ? sha256Summary(hashInput) : null,
    includeJsonl: input.includeJsonl === true,
    jsonl,
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
    unsafeReasonCount: compactUnsafeReasonCodes.length,
    compactUnsafeReasonCodes,
    operatorSummary: {
      operatorId: safePresence(input.operatorId),
      runKey: safePresence(input.runKey),
      sourceHeadSha: safePresence(input.sourceHeadSha),
      sourceHash: safePresence(input.sourceHash),
      exportedAt: safePresence(input.exportedAt)
    },
    nextSafeAction: determineNextSafeAction(input, blockers, missing, unsafe, status)
  };
};
