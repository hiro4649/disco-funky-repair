import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES
} from './tierUpdateActualSafeRowExportDesignGate';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_ALLOWED_OPTIONAL_FIELDS,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS,
  type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_TRACE_LABEL =
  'd8z_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture' as const;

type SafeSummaryFixtureStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SAFE_SUMMARY_FIXTURE_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'safe_summary_shape_approved'
  | 'safe_summary_fixture_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type FixtureOrigin =
  | 'fixture'
  | 'local_test'
  | 'synthetic_safe_summary'
  | 'owner_review_fixture'
  | 'db_safe_summary'
  | 'actual_database'
  | 'production_database'
  | 'staging_database'
  | 'runtime_worker'
  | 'public_chain_live_query'
  | 'raw_export'
  | 'file_export'
  | 'artifact_upload'
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_safe_summary_shape'
  | 'provide_safe_summary_fixture_spec'
  | 'provide_safe_summary_fixture_rows'
  | 'remove_unsupported_entity'
  | 'replace_with_fixture_origin'
  | 'add_required_safe_summary_field'
  | 'remove_duplicate_row_id'
  | 'remove_forbidden_field'
  | 'collect_operator_safe_summary_fixture_approval'
  | 'prepare_pr_d8aa_actual_safe_row_export_read_only_source_candidate_fixture_jsonl_package';

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureSpec = {
  fixtureOnly?: boolean;
  sourceAccessEnabled?: boolean;
  actualDbQueryEnabled?: boolean;
  jsonlFileExportEnabled?: boolean;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow = {
  schema_version?: string | number;
  audit_export_id?: string;
  source_head_sha?: string;
  source_hash?: string;
  exported_at?: string;
  row_id?: string;
  entity_type?: string;
  source_table?: string;
  status?: string;
  evidence_origin?: FixtureOrigin;
  readiness_claim?: string;
  checkpoint_summary?: string;
  tx_hash_summary?: string;
  tx_chain_id?: string | number;
  tx_contract_address_summary?: string;
  tx_from_summary?: string;
  tx_to_summary?: string;
  tx_block_number_summary?: string | number;
  tx_receipt_status?: string;
  tx_receipt_timestamp_summary?: string;
  safe_error_kind?: string;
  safe_summary?: string;
  operator_id_summary?: string;
  reviewer_id_summary?: string;
  run_key_summary?: string;
  [key: string]: unknown;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput = {
  safeSummaryShape?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape | null;
  fixtureSpec?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureSpec | null;
  fixtureRows?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[] | null;
  requestedEntities?: string[];
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureOperatorApproval;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | Date | null;
  auditExportId?: string | null;
  runKey?: string | null;
  operatorId?: string | null;
  reviewerId?: string | null;
  includeRows?: boolean;
  includeJsonl?: boolean;
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
  sourceAccessEnabled?: boolean;
  prismaClientEnabled?: boolean;
  databaseUrlReadEnabled?: boolean;
  envReadEnabled?: boolean;
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

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture = {
  fixtureKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_SCHEMA_VERSION;
  status: SafeSummaryFixtureStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_TRACE_LABEL;
  safeSummaryShapeStatus: string;
  requestedEntitiesSummary: { requestedCount: number; allowedCount: number; safeSummaryOnly: true };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  fixtureRowCount: number;
  entityCounts: Record<string, number>;
  duplicateRowIdCount: number;
  fixtureOriginStatus: 'present' | 'missing' | 'blocked';
  requiredFieldStatus: 'present' | 'missing' | 'blocked';
  forbiddenFieldStatus: 'present' | 'blocked';
  sameHeadEvidenceStatus: 'required' | 'blocked';
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked';
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  actualDbQueryEnabled: false;
  actualDbExportEnabled: false;
  sourceAccessEnabled: false;
  prismaClientEnabled: false;
  databaseUrlReadEnabled: false;
  envReadEnabled: false;
  networkAccessEnabled: false;
  rpcAccessEnabled: false;
  walletAccessEnabled: false;
  contractAccessEnabled: false;
  txSendEnabled: false;
  fileExportEnabled: false;
  jsonlFileExportEnabled: false;
  artifactUploadEnabled: false;
  dockerSmokeChanged: false;
  stagingNoTxPassClaimed: false;
  runtimeReadinessClaimed: false;
  productionReadinessClaimed: false;
  includeRows: boolean;
  rows?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[] | null;
  includeJsonl: boolean;
  jsonl?: string | null;
  jsonlSha256Summary?: string | null;
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
    auditExportId: { provided: boolean; safeSummaryOnly: true };
  };
  nextSafeAction: NextSafeAction;
};

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_ALLOWED_ORIGINS = [
  'fixture',
  'local_test',
  'synthetic_safe_summary',
  'owner_review_fixture'
] as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_FORBIDDEN_ORIGINS = [
  'db_safe_summary',
  'actual_database',
  'production_database',
  'staging_database',
  'runtime_worker',
  'public_chain_live_query',
  'raw_export',
  'file_export',
  'artifact_upload'
] as const;

const ALLOWED_ENTITY_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES);
const REQUIRED_FIELD_SET = new Set<string>(
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS
);
const ALLOWED_FIELD_SET = new Set<string>([
  ...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS,
  ...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_ALLOWED_OPTIONAL_FIELDS
]);
const FORBIDDEN_FIELD_SET = new Set<string>(
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS.map((field) => normalizeField(field))
);
const ALLOWED_ORIGIN_SET = new Set<string>(
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_ALLOWED_ORIGINS
);
const FORBIDDEN_ORIGIN_SET = new Set<string>(
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_FORBIDDEN_ORIGINS
);
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

function normalizeField(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

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
const safePresence = (value: unknown): { provided: boolean; safeSummaryOnly: true } => ({
  provided: value !== undefined && value !== null && String(value).trim().length > 0,
  safeSummaryOnly: true
});
const cloneRows = (
  rows: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[]
): TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[] => (
  rows.map((row) => ({ ...row }))
);

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const objectValue = value as Record<string, unknown>;
  return `{${Object.keys(objectValue).sort().map((key) => (
    `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`
  )).join(',')}}`;
};

const safeHashSummary = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `safe_hash_${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

const evaluateSafeSummaryShape = (
  shape: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!shape) {
    add(blockers, 'safe_summary_shape_missing');
    add(missing, 'safe_summary_shape');
    return 'missing';
  }
  if (shape.status === 'SAFE_SUMMARY_SHAPE_READY') return 'SAFE_SUMMARY_SHAPE_READY';
  if (shape.status === 'NEEDS_REVIEW') {
    add(missing, 'safe_summary_shape_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'safe_summary_shape_blocked');
  return String(shape.status || 'blocked');
};

const evaluateFixtureSpec = (
  spec: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureSpec | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): void => {
  if (!spec) {
    add(blockers, 'safe_summary_fixture_spec_missing');
    add(missing, 'safe_summary_fixture_spec');
    return;
  }
  if (spec.sourceAccessEnabled === true || spec.actualDbQueryEnabled === true || spec.jsonlFileExportEnabled === true) {
    add(blockers, 'safe_summary_fixture_spec_execution_enabled');
  }
};

const evaluateRequestedEntities = (
  requestedEntities: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { requestedCount: number; allowedCount: number; disallowedEntityCount: number } => {
  const requested = uniqueNormalized(requestedEntities);
  if (requested.length === 0) {
    add(missing, 'requested_entities_required');
    return { requestedCount: 0, allowedCount: 0, disallowedEntityCount: 0 };
  }
  const allowed = requested.filter((entity) => ALLOWED_ENTITY_SET.has(entity));
  const disallowed = requested.filter((entity) => !ALLOWED_ENTITY_SET.has(entity));
  if (disallowed.length > 0) add(blockers, 'unsupported_entity_requested');
  if (disallowed.some((entity) => DEFERRED_ENTITIES.has(entity))) add(blockers, 'deferred_entity_requested');
  return { requestedCount: requested.length, allowedCount: allowed.length, disallowedEntityCount: disallowed.length };
};

const evaluateRows = (
  rows: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[] | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): {
  rows: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[];
  entityCounts: Record<string, number>;
  duplicateRowIdCount: number;
  fixtureOriginStatus: 'present' | 'missing' | 'blocked';
  requiredFieldStatus: 'present' | 'missing' | 'blocked';
  forbiddenFieldStatus: 'present' | 'blocked';
} => {
  if (!rows || rows.length === 0) {
    add(missing, 'fixture_rows_required');
    return {
      rows: [],
      entityCounts: {},
      duplicateRowIdCount: 0,
      fixtureOriginStatus: 'missing',
      requiredFieldStatus: 'missing',
      forbiddenFieldStatus: 'present'
    };
  }

  const rowIds = new Set<string>();
  const duplicateIds = new Set<string>();
  const entityCounts: Record<string, number> = {};
  let originMissing = false;
  let originBlocked = false;
  let requiredMissing = false;
  let forbiddenBlocked = false;

  rows.forEach((row) => {
    const entityType = normalize(String(row.entity_type || ''));
    if (!ALLOWED_ENTITY_SET.has(entityType)) add(blockers, 'fixture_row_unsupported_entity');
    if (DEFERRED_ENTITIES.has(entityType)) add(blockers, 'fixture_row_deferred_entity');
    if (entityType) entityCounts[entityType] = (entityCounts[entityType] || 0) + 1;

    REQUIRED_FIELD_SET.forEach((field) => {
      const value = row[field];
      if (value === undefined || value === null || String(value).trim().length === 0) {
        requiredMissing = true;
        add(blockers, `fixture_row_missing_required_field:${field}`);
        add(missing, `fixture_row_required_field:${field}`);
      }
    });

    const rowId = String(row.row_id || '');
    if (rowId) {
      if (rowIds.has(rowId)) duplicateIds.add(rowId);
      rowIds.add(rowId);
    }

    const origin = normalize(String(row.evidence_origin || ''));
    if (!origin) {
      originMissing = true;
      add(blockers, 'fixture_row_origin_missing');
      add(missing, 'fixture_row_evidence_origin');
    } else if (!ALLOWED_ORIGIN_SET.has(origin) || FORBIDDEN_ORIGIN_SET.has(origin)) {
      originBlocked = true;
      add(blockers, `fixture_row_forbidden_origin:${origin}`);
    }

    if (String(row.readiness_claim || '') !== 'none') {
      add(blockers, 'fixture_row_readiness_claim_forbidden');
    }

    Object.keys(row).forEach((field) => {
      if (FORBIDDEN_FIELD_SET.has(normalizeField(field))) {
        forbiddenBlocked = true;
        add(blockers, `fixture_row_forbidden_field:${field}`);
      } else if (!ALLOWED_FIELD_SET.has(field)) {
        forbiddenBlocked = true;
        add(blockers, `fixture_row_unapproved_field:${field}`);
      }
    });
  });

  if (duplicateIds.size > 0) add(blockers, 'fixture_row_duplicate_row_id');

  return {
    rows,
    entityCounts,
    duplicateRowIdCount: duplicateIds.size,
    fixtureOriginStatus: originBlocked ? 'blocked' : originMissing ? 'missing' : 'present',
    requiredFieldStatus: requiredMissing ? 'blocked' : 'present',
    forbiddenFieldStatus: forbiddenBlocked ? 'blocked' : 'present'
  };
};

const evaluateSameHeadEvidence = (
  evidence: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureSameHeadEvidence | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'required' | 'blocked' => {
  if (evidence?.required !== true) {
    add(blockers, 'same_head_evidence_required');
    add(missing, 'same_head_evidence');
    return 'blocked';
  }
  return 'required';
};

const evaluateOperatorApproval = (
  approval: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (approval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (approval.status === 'safe_summary_fixture_approved') return 'approved';
  if (approval.status === 'pending' || approval.status === 'safe_summary_shape_approved') {
    add(missing, 'operator_safe_summary_fixture_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput,
  blockers: Set<string>
): void => {
  const flagNames = [
    'actualDbQueryEnabled',
    'actualDbExportEnabled',
    'sourceAccessEnabled',
    'prismaClientEnabled',
    'databaseUrlReadEnabled',
    'envReadEnabled',
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
  flagNames.forEach((flag) => {
    if (input[flag] === true) add(blockers, `${normalize(flag)}_forbidden`);
  });
};

const determineStatus = (
  blockers: Set<string>,
  missing: Set<string>,
  shapeStatus: string,
  approvalStatus: 'approved' | 'pending' | 'blocked'
): SafeSummaryFixtureStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || shapeStatus === 'NEEDS_REVIEW' || approvalStatus === 'pending') return 'NEEDS_REVIEW';
  return 'SAFE_SUMMARY_FIXTURE_READY';
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: SafeSummaryFixtureStatus
): NextSafeAction => {
  if (!input.safeSummaryShape || blockers.has('safe_summary_shape_missing') || blockers.has('safe_summary_shape_blocked')) {
    return 'build_actual_safe_row_export_read_only_source_candidate_safe_summary_shape';
  }
  if (blockers.has('safe_summary_fixture_spec_missing')) return 'provide_safe_summary_fixture_spec';
  if (missing.has('fixture_rows_required')) return 'provide_safe_summary_fixture_rows';
  if (Array.from(blockers).some((code) => code.startsWith('fixture_row_missing_required_field:'))) {
    return 'add_required_safe_summary_field';
  }
  if (blockers.has('unsupported_entity_requested') || blockers.has('deferred_entity_requested')
    || blockers.has('fixture_row_unsupported_entity') || blockers.has('fixture_row_deferred_entity')) {
    return 'remove_unsupported_entity';
  }
  if (Array.from(blockers).some((code) => code.startsWith('fixture_row_forbidden_origin:'))) {
    return 'replace_with_fixture_origin';
  }
  if (blockers.has('fixture_row_duplicate_row_id')) return 'remove_duplicate_row_id';
  if (Array.from(blockers).some((code) => code.startsWith('fixture_row_forbidden_field:')
    || code.startsWith('fixture_row_unapproved_field:'))) {
    return 'remove_forbidden_field';
  }
  if (missing.has('operator_safe_summary_fixture_approval_pending')) return 'collect_operator_safe_summary_fixture_approval';
  if (status === 'SAFE_SUMMARY_FIXTURE_READY') {
    return 'prepare_pr_d8aa_actual_safe_row_export_read_only_source_candidate_fixture_jsonl_package';
  }
  return 'collect_operator_safe_summary_fixture_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const safeSummaryShapeStatus = evaluateSafeSummaryShape(input.safeSummaryShape, blockers, missing);
  evaluateFixtureSpec(input.fixtureSpec, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const rowSummary = evaluateRows(input.fixtureRows, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status = determineStatus(blockers, missing, safeSummaryShapeStatus, operatorApprovalStatus);
  const includeRows = input.includeRows === true;
  const includeJsonl = input.includeJsonl === true;
  const jsonl = includeJsonl ? rowSummary.rows.map(stableStringify).join('\n') : null;

  return {
    fixtureKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_TRACE_LABEL,
    safeSummaryShapeStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    fixtureRowCount: rowSummary.rows.length,
    entityCounts: rowSummary.entityCounts,
    duplicateRowIdCount: rowSummary.duplicateRowIdCount,
    fixtureOriginStatus: rowSummary.fixtureOriginStatus,
    requiredFieldStatus: rowSummary.requiredFieldStatus,
    forbiddenFieldStatus: rowSummary.forbiddenFieldStatus,
    sameHeadEvidenceStatus,
    operatorApprovalStatus,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    actualDbQueryEnabled: false,
    actualDbExportEnabled: false,
    sourceAccessEnabled: false,
    prismaClientEnabled: false,
    databaseUrlReadEnabled: false,
    envReadEnabled: false,
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
    includeRows,
    rows: includeRows ? cloneRows(rowSummary.rows) : null,
    includeJsonl,
    jsonl,
    jsonlSha256Summary: jsonl ? safeHashSummary(jsonl) : null,
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
      exportedAt: safePresence(input.exportedAt),
      auditExportId: safePresence(input.auditExportId)
    },
    nextSafeAction: determineNextSafeAction(input, blockers, missing, status)
  };
};
