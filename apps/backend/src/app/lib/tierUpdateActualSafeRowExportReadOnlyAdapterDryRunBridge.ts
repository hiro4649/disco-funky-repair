import { createHash } from 'crypto';

import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from './tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportMockSafeRow
} from './tierUpdateActualSafeRowExportMockSourceContract';
import type {
  TierUpdateActualSafeRowExportReadOnlyMockAdapter
} from './tierUpdateActualSafeRowExportReadOnlyMockAdapter';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DRY_RUN_BRIDGE_KIND =
  'tier_update_actual_safe_row_export_read_only_adapter_dry_run_bridge' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DRY_RUN_BRIDGE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DRY_RUN_BRIDGE_TRACE_LABEL =
  'd8q_actual_safe_row_export_read_only_adapter_dry_run_bridge' as const;

const ALLOWED_ADAPTER_METHOD_BY_ENTITY = {
  scheduled_tier_update: 'readScheduledTierUpdateSafeRows',
  job_run: 'readJobRunSafeRows',
  tx_receipt_evidence: 'readTxReceiptEvidenceSafeRows',
  staging_evidence: 'readStagingEvidenceSafeRows'
} as const;

type AllowedEntity = keyof typeof ALLOWED_ADAPTER_METHOD_BY_ENTITY;
type AllowedMethodName = typeof ALLOWED_ADAPTER_METHOD_BY_ENTITY[AllowedEntity];
type BridgeStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'DRY_RUN_BRIDGE_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'adapter_implementation_approved'
  | 'dry_run_bridge_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_read_only_safe_row_adapter_mock_boundary'
  | 'provide_requested_entities'
  | 'provide_allowed_adapter_method'
  | 'fix_mock_adapter_method'
  | 'provide_injected_safe_rows'
  | 'remove_duplicate_row_ids'
  | 'add_required_safe_row_metadata'
  | 'remove_unsupported_entity'
  | 'remove_unsafe_row_field'
  | 'collect_operator_dry_run_bridge_approval'
  | 'prepare_pr_d8r_actual_safe_row_export_read_only_adapter_plan';

export type TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeInput = {
  mockAdapter?: TierUpdateActualSafeRowExportReadOnlyMockAdapter | null;
  requestedEntities?: string[];
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeOperatorApproval;
  includeRows?: boolean;
  includeJsonl?: boolean;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | Date | null;
  operatorId?: string | null;
  runKey?: string | null;
  reviewerId?: string | null;
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

export type TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge = {
  bridgeKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DRY_RUN_BRIDGE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DRY_RUN_BRIDGE_SCHEMA_VERSION;
  status: BridgeStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DRY_RUN_BRIDGE_TRACE_LABEL;
  mockAdapterStatus: string;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    safeSummaryOnly: true;
  };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  executedMethodNames: string[];
  methodExecutionCount: number;
  methodResultCounts: Record<string, number>;
  rowCount: number;
  entityCounts: Record<string, number>;
  duplicateRowIdCount: number;
  requiredMetadataStatus: 'present' | 'missing';
  rowSafetyStatus: 'safe' | 'blocked';
  sameHeadEvidenceStatus: 'required' | 'blocked';
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked';
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  jsonlSha256Summary: string | null;
  includeRows: boolean;
  rows: TierUpdateActualSafeRowExportMockSafeRow[] | null;
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
    reviewerId: { provided: boolean; safeSummaryOnly: true };
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

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

const uniqueNormalized = (values: string[] | undefined): string[] => (
  Array.from(new Set((values || []).map((value) => normalize(String(value))).filter(Boolean))).sort()
);

const compactCodes = (codes: Iterable<string>): string[] => (
  Array.from(new Set(Array.from(codes).filter(Boolean).map((code) => (
    code.length > 96 ? code.slice(0, 96) : code
  )))).sort().slice(0, 12)
);

const cloneRows = (
  rows: TierUpdateActualSafeRowExportMockSafeRow[]
): TierUpdateActualSafeRowExportMockSafeRow[] => JSON.parse(JSON.stringify(rows));

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const isSafeSummaryKey = (key: string): boolean => /_summary$/i.test(key);

const safePresence = (value: unknown): { provided: boolean; safeSummaryOnly: true } => ({
  provided: value !== undefined && value !== null && String(value).trim().length > 0,
  safeSummaryOnly: true
});

const safeJsonl = (rows: TierUpdateActualSafeRowExportMockSafeRow[]): string => (
  rows.map((row) => JSON.stringify(Object.fromEntries(Object.entries(row).sort(([left], [right]) => left.localeCompare(right))))).join('\n')
);

const sha256Summary = (value: string): string => `sha256:${createHash('sha256').update(value).digest('hex')}`;

const evaluateMockAdapter = (
  mockAdapter: TierUpdateActualSafeRowExportReadOnlyMockAdapter | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!mockAdapter) {
    add(blockers, 'mock_adapter_missing');
    add(missing, 'mock_adapter');
    return 'missing';
  }
  if (mockAdapter.status === 'MOCK_ADAPTER_READY') return 'MOCK_ADAPTER_READY';
  if (mockAdapter.status === 'NEEDS_REVIEW') {
    add(missing, 'mock_adapter_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'mock_adapter_blocked');
  return String(mockAdapter.status || 'blocked');
};

const evaluateRequestedEntities = (
  requestedEntities: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { requested: Set<AllowedEntity>; requestedCount: number; allowedCount: number; disallowedEntityCount: number } => {
  const requested = uniqueNormalized(requestedEntities);
  if (requested.length === 0) {
    add(missing, 'requested_entities_required');
    return { requested: new Set(), requestedCount: 0, allowedCount: 0, disallowedEntityCount: 0 };
  }

  const allowed = requested.filter((entity): entity is AllowedEntity => ALLOWED_ENTITY_SET.has(entity));
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

const evaluateSameHeadEvidence = (
  sameHeadEvidence: TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeSameHeadEvidence | undefined,
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
  operatorApproval: TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (operatorApproval.status === 'dry_run_bridge_approved') return 'approved';
  if (operatorApproval.status === 'pending' || operatorApproval.status === 'adapter_implementation_approved') {
    add(missing, 'operator_dry_run_bridge_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeInput,
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

const executeAdapterMethods = (
  mockAdapter: TierUpdateActualSafeRowExportReadOnlyMockAdapter | null | undefined,
  requestedEntities: Set<AllowedEntity>,
  blockers: Set<string>,
  missing: Set<string>
): {
  executedMethodNames: string[];
  methodResultCounts: Record<string, number>;
  rows: TierUpdateActualSafeRowExportMockSafeRow[];
} => {
  if (!mockAdapter || mockAdapter.status !== 'MOCK_ADAPTER_READY') {
    return { executedMethodNames: [], methodResultCounts: {}, rows: [] };
  }
  if (requestedEntities.size === 0) {
    return { executedMethodNames: [], methodResultCounts: {}, rows: [] };
  }

  const rows: TierUpdateActualSafeRowExportMockSafeRow[] = [];
  const executedMethodNames: string[] = [];
  const methodResultCounts: Record<string, number> = {};

  for (const entity of requestedEntities) {
    const methodName = ALLOWED_ADAPTER_METHOD_BY_ENTITY[entity];
    const method = mockAdapter.adapterMethods?.[methodName as AllowedMethodName];
    if (typeof method !== 'function') {
      add(blockers, `adapter_method_missing:${methodName}`);
      add(missing, `adapter_method:${methodName}`);
      continue;
    }
    try {
      const result = method();
      if (!Array.isArray(result)) {
        add(blockers, `adapter_method_non_array:${methodName}`);
        methodResultCounts[methodName] = 0;
        executedMethodNames.push(methodName);
        continue;
      }
      const cloned = cloneRows(result);
      methodResultCounts[methodName] = cloned.length;
      executedMethodNames.push(methodName);
      rows.push(...cloned);
    } catch {
      add(blockers, `adapter_method_threw:${methodName}`);
      methodResultCounts[methodName] = 0;
      executedMethodNames.push(methodName);
    }
  }

  if (executedMethodNames.length > 0 && rows.length === 0 && blockers.size === 0) {
    add(missing, 'injected_safe_rows_required');
  }

  return { executedMethodNames, methodResultCounts, rows };
};

const inspectRows = (
  rows: TierUpdateActualSafeRowExportMockSafeRow[],
  requestedEntities: Set<AllowedEntity>,
  blockers: Set<string>,
  missing: Set<string>,
  unsafe: Set<string>
): { entityCounts: Record<string, number>; duplicateRowIdCount: number; requiredMetadataStatus: 'present' | 'missing' } => {
  if (rows.length === 0) {
    if (blockers.size === 0) add(missing, 'injected_safe_rows_required');
    return { entityCounts: {}, duplicateRowIdCount: 0, requiredMetadataStatus: 'missing' };
  }

  const rowIds = new Set<string>();
  const duplicateRowIds = new Set<string>();
  const entityCounts: Record<string, number> = {};
  let requiredMetadataStatus: 'present' | 'missing' = 'present';

  rows.forEach((row, index) => {
    for (const field of TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS) {
      if (row[field] === undefined || row[field] === null || String(row[field]).trim().length === 0) {
        add(blockers, `row_metadata_missing:${field}`);
        add(missing, `metadata:${field}`);
        requiredMetadataStatus = 'missing';
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
      if (requestedEntities.size > 0 && !requestedEntities.has(entity as AllowedEntity)) add(blockers, 'row_entity_not_requested');
    }

    if (row.readiness_claim !== 'none') add(blockers, 'row_readiness_claim_forbidden');
    if (row.safeSummaryOnly !== true) add(blockers, 'row_safe_summary_only_required');
    inspectRowValue(row, unsafe, `row[${index}]`);
  });

  if (duplicateRowIds.size > 0) add(blockers, 'duplicate_row_id');

  return {
    entityCounts: Object.fromEntries(Object.entries(entityCounts).sort(([left], [right]) => left.localeCompare(right))),
    duplicateRowIdCount: duplicateRowIds.size,
    requiredMetadataStatus
  };
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeInput,
  blockers: Set<string>,
  missing: Set<string>,
  unsafe: Set<string>,
  status: BridgeStatus
): NextSafeAction => {
  if (!input.mockAdapter || blockers.has('mock_adapter_missing') || blockers.has('mock_adapter_blocked')) {
    return 'build_read_only_safe_row_adapter_mock_boundary';
  }
  if (missing.has('requested_entities_required')) return 'provide_requested_entities';
  if (Array.from(blockers).some((code) => code.startsWith('adapter_method_missing'))) return 'provide_allowed_adapter_method';
  if (Array.from(blockers).some((code) => code.startsWith('adapter_method_threw') || code.startsWith('adapter_method_non_array'))) {
    return 'fix_mock_adapter_method';
  }
  if (missing.has('injected_safe_rows_required')) return 'provide_injected_safe_rows';
  if (blockers.has('duplicate_row_id')) return 'remove_duplicate_row_ids';
  if (Array.from(blockers).some((code) => code.startsWith('row_metadata_missing'))) return 'add_required_safe_row_metadata';
  if (
    blockers.has('unsupported_entity_requested') ||
    blockers.has('deferred_entity_requested') ||
    blockers.has('row_entity_unsupported') ||
    blockers.has('row_entity_not_requested')
  ) return 'remove_unsupported_entity';
  if (unsafe.size > 0 || blockers.has('row_readiness_claim_forbidden') || blockers.has('row_safe_summary_only_required')) {
    return 'remove_unsafe_row_field';
  }
  if (missing.has('operator_dry_run_bridge_approval_pending')) return 'collect_operator_dry_run_bridge_approval';
  if (status === 'DRY_RUN_BRIDGE_READY') return 'prepare_pr_d8r_actual_safe_row_export_read_only_adapter_plan';
  return 'collect_operator_dry_run_bridge_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeInput
): TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const mockAdapterStatus = evaluateMockAdapter(input.mockAdapter, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const methodSummary = executeAdapterMethods(input.mockAdapter, entitySummary.requested, blockers, missing);
  const rowSummary = inspectRows(methodSummary.rows, entitySummary.requested, blockers, missing, unsafe);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status: BridgeStatus = compactBlockerCodes.length > 0 || compactUnsafeReasonCodes.length > 0
    ? 'BLOCKED'
    : compactMissingRequirementCodes.length > 0
      ? 'NEEDS_REVIEW'
      : 'DRY_RUN_BRIDGE_READY';

  const validatedRows = status === 'DRY_RUN_BRIDGE_READY' ? methodSummary.rows : [];
  const jsonlBody = validatedRows.length > 0 ? safeJsonl(validatedRows) : '';
  const shouldReturnJsonl = input.includeJsonl === true && status === 'DRY_RUN_BRIDGE_READY';

  return {
    bridgeKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DRY_RUN_BRIDGE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DRY_RUN_BRIDGE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DRY_RUN_BRIDGE_TRACE_LABEL,
    mockAdapterStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    executedMethodNames: [...methodSummary.executedMethodNames],
    methodExecutionCount: methodSummary.executedMethodNames.length,
    methodResultCounts: { ...methodSummary.methodResultCounts },
    rowCount: status === 'BLOCKED' ? 0 : methodSummary.rows.length,
    entityCounts: status === 'BLOCKED' ? {} : rowSummary.entityCounts,
    duplicateRowIdCount: rowSummary.duplicateRowIdCount,
    requiredMetadataStatus: rowSummary.requiredMetadataStatus,
    rowSafetyStatus: compactBlockerCodes.some((code) => code.startsWith('row_')) || compactUnsafeReasonCodes.length > 0 ? 'blocked' : 'safe',
    sameHeadEvidenceStatus,
    operatorApprovalStatus,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    jsonlSha256Summary: jsonlBody ? sha256Summary(jsonlBody) : null,
    includeRows: input.includeRows === true,
    rows: input.includeRows === true && status === 'DRY_RUN_BRIDGE_READY' ? cloneRows(validatedRows) : null,
    includeJsonl: input.includeJsonl === true,
    jsonl: shouldReturnJsonl ? jsonlBody : null,
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
      reviewerId: safePresence(input.reviewerId),
      sourceHeadSha: safePresence(input.sourceHeadSha),
      sourceHash: safePresence(input.sourceHash),
      exportedAt: safePresence(input.exportedAt)
    },
    nextSafeAction: determineNextSafeAction(input, blockers, missing, unsafe, status)
  };
};
