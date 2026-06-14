import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES
} from './tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_safe_summary_shape' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_TRACE_LABEL =
  'd8y_actual_safe_row_export_read_only_source_candidate_safe_summary_shape' as const;

type SafeSummaryShapeStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SAFE_SUMMARY_SHAPE_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'source_candidate_disabled_probe_approved'
  | 'safe_summary_shape_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_disabled_probe'
  | 'provide_safe_summary_shape_spec'
  | 'add_safe_summary_shape_version'
  | 'add_required_field_policy'
  | 'add_forbidden_field_policy'
  | 'add_entity_shape_policy'
  | 'remove_unsupported_entity'
  | 'remove_forbidden_field_from_shape'
  | 'collect_operator_safe_summary_shape_approval'
  | 'prepare_pr_d8z_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture';

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeSpec = {
  shapeDisabled?: boolean;
  sourceAccessEnabled?: boolean;
  actualDbQueryEnabled?: boolean;
  jsonlFileExportEnabled?: boolean;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateRequiredFieldPolicy = {
  policyId?: string;
  requiredFieldNames?: string[];
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateForbiddenFieldPolicy = {
  policyId?: string;
  forbiddenFieldNames?: string[];
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateEntityShapePolicy = {
  policyId?: string;
  entityShapes?: Array<{
    entityType?: string;
    fieldNames?: string[];
  }>;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput = {
  sourceCandidateDisabledProbe?: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe | null;
  safeSummaryShapeSpec?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeSpec | null;
  requestedEntities?: string[];
  shapeVersion?: string | number | null;
  requiredFieldPolicy?: TierUpdateActualSafeRowExportReadOnlySourceCandidateRequiredFieldPolicy | null;
  forbiddenFieldPolicy?: TierUpdateActualSafeRowExportReadOnlySourceCandidateForbiddenFieldPolicy | null;
  entityShapePolicy?: TierUpdateActualSafeRowExportReadOnlySourceCandidateEntityShapePolicy | null;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeOperatorApproval;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | Date | null;
  runKey?: string | null;
  operatorId?: string | null;
  reviewerId?: string | null;
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
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

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape = {
  shapeKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_SCHEMA_VERSION;
  status: SafeSummaryShapeStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_TRACE_LABEL;
  sourceCandidateDisabledProbeStatus: string;
  shapeVersion: string;
  requestedEntitiesSummary: { requestedCount: number; allowedCount: number; safeSummaryOnly: true };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  requiredFieldPolicyStatus: 'present' | 'missing' | 'blocked';
  forbiddenFieldPolicyStatus: 'present' | 'missing' | 'blocked';
  entityShapePolicyStatus: 'present' | 'missing' | 'blocked';
  sameHeadEvidenceStatus: 'required' | 'blocked';
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked';
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  actualDbQueryEnabled: false;
  actualDbExportEnabled: false;
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
  requiredFieldNames: string[];
  allowedOptionalFieldNames: string[];
  forbiddenFieldNames: string[];
  entityShapeSummaries: Array<{ entityType: string; fieldCount: number; safeSummaryOnly: true }>;
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

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS = [
  'schema_version',
  'audit_export_id',
  'source_head_sha',
  'source_hash',
  'exported_at',
  'row_id',
  'entity_type',
  'source_table',
  'status',
  'evidence_origin',
  'readiness_claim'
] as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_ALLOWED_OPTIONAL_FIELDS = [
  'checkpoint_summary',
  'tx_hash_summary',
  'tx_chain_id',
  'tx_contract_address_summary',
  'tx_from_summary',
  'tx_to_summary',
  'tx_block_number_summary',
  'tx_receipt_status',
  'tx_receipt_timestamp_summary',
  'safe_error_kind',
  'safe_summary',
  'operator_id_summary',
  'reviewer_id_summary',
  'run_key_summary'
] as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS = [
  'rawDbRow',
  'rawCheckpoint',
  'rawTxHash',
  'rawReceiptPayload',
  'rawWallet',
  'fullWallet',
  'privateKey',
  'dbUrl',
  'databaseUrl',
  'rpcUrl',
  'rawEnv',
  'rawLog',
  'rawPayload',
  'authorizationHeader',
  'cookie',
  'jwt',
  'token',
  'secret',
  'privatePath',
  'localImagePath',
  'endpoint',
  'providerPayload',
  'contractPayload',
  'txPayload',
  'prismaClient',
  'databaseClient'
] as const;

const ALLOWED_ENTITY_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES);
const REQUIRED_FIELD_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS);
const FORBIDDEN_FIELD_SET = new Set<string>(
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS.map((field) => field.toLowerCase())
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

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};
const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
const normalizeField = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
const uniqueNormalized = (values: string[] | undefined): string[] => (
  Array.from(new Set((values || []).map((value) => normalize(String(value))).filter(Boolean))).sort()
);
const uniqueFieldNames = (values: string[] | undefined): string[] => (
  Array.from(new Set((values || []).map((value) => String(value).trim()).filter(Boolean))).sort()
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

const evaluateSourceCandidateDisabledProbe = (
  probe: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!probe) {
    add(blockers, 'source_candidate_disabled_probe_missing');
    add(missing, 'source_candidate_disabled_probe');
    return 'missing';
  }
  if (probe.status === 'SOURCE_CANDIDATE_DISABLED_PROBE_READY') return 'SOURCE_CANDIDATE_DISABLED_PROBE_READY';
  if (probe.status === 'NEEDS_REVIEW') {
    add(missing, 'source_candidate_disabled_probe_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'source_candidate_disabled_probe_blocked');
  return String(probe.status || 'blocked');
};

const evaluateShapeSpec = (
  spec: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeSpec | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): void => {
  if (!spec) {
    add(blockers, 'safe_summary_shape_spec_missing');
    add(missing, 'safe_summary_shape_spec');
    return;
  }
  if (spec.sourceAccessEnabled === true || spec.actualDbQueryEnabled === true || spec.jsonlFileExportEnabled === true) {
    add(blockers, 'safe_summary_shape_spec_execution_enabled');
  }
};

const evaluateShapeVersion = (
  shapeVersion: string | number | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (shapeVersion === undefined || shapeVersion === null || String(shapeVersion).trim().length === 0) {
    add(blockers, 'safe_summary_shape_version_missing');
    add(missing, 'shape_version');
    return 'missing';
  }
  return String(shapeVersion);
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

const evaluateRequiredFieldPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlySourceCandidateRequiredFieldPolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' | 'blocked' => {
  if (!policy) {
    add(blockers, 'required_field_policy_missing');
    add(missing, 'required_field_policy');
    return 'missing';
  }
  const fields = new Set(uniqueNormalized(policy.requiredFieldNames));
  REQUIRED_FIELD_SET.forEach((field) => {
    if (!fields.has(field)) {
      add(blockers, `required_field_missing:${field}`);
      add(missing, `required_field:${field}`);
    }
  });
  return Array.from(blockers).some((code) => code.startsWith('required_field_missing:')) ? 'blocked' : 'present';
};

const evaluateForbiddenFieldPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlySourceCandidateForbiddenFieldPolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' | 'blocked' => {
  if (!policy) {
    add(blockers, 'forbidden_field_policy_missing');
    add(missing, 'forbidden_field_policy');
    return 'missing';
  }
  const fields = new Set(uniqueFieldNames(policy.forbiddenFieldNames).map((field) => normalizeField(field)));
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS.forEach((field) => {
    if (!fields.has(normalizeField(field))) {
      add(blockers, `forbidden_field_policy_missing:${field}`);
      add(missing, `forbidden_field:${field}`);
    }
  });
  return Array.from(blockers).some((code) => code.startsWith('forbidden_field_policy_missing:')) ? 'blocked' : 'present';
};

const evaluateEntityShapePolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlySourceCandidateEntityShapePolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { status: 'present' | 'missing' | 'blocked'; summaries: Array<{ entityType: string; fieldCount: number; safeSummaryOnly: true }> } => {
  if (!policy) {
    add(blockers, 'entity_shape_policy_missing');
    add(missing, 'entity_shape_policy');
    return { status: 'missing', summaries: [] };
  }
  const summaries = (policy.entityShapes || []).map((shape) => {
    const entityType = normalize(String(shape.entityType || 'missing'));
    const fieldNames = uniqueFieldNames(shape.fieldNames);
    if (!ALLOWED_ENTITY_SET.has(entityType)) add(blockers, 'entity_shape_policy_unsupported_entity');
    if (DEFERRED_ENTITIES.has(entityType)) add(blockers, 'entity_shape_policy_deferred_entity');
    fieldNames.forEach((field) => {
      if (FORBIDDEN_FIELD_SET.has(normalizeField(field))) add(blockers, `entity_shape_policy_forbidden_field:${field}`);
    });
    return { entityType, fieldCount: fieldNames.length, safeSummaryOnly: true as const };
  });
  const status = Array.from(blockers).some((code) => code.startsWith('entity_shape_policy_')) ? 'blocked' : 'present';
  return { status, summaries };
};

const evaluateSameHeadEvidence = (
  evidence: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeSameHeadEvidence | undefined,
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
  approval: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (approval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (approval.status === 'safe_summary_shape_approved') return 'approved';
  if (approval.status === 'pending' || approval.status === 'source_candidate_disabled_probe_approved') {
    add(missing, 'operator_safe_summary_shape_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput,
  blockers: Set<string>
): void => {
  const flagNames = [
    'actualDbQueryEnabled',
    'actualDbExportEnabled',
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
  upstreamStatus: string,
  approvalStatus: 'approved' | 'pending' | 'blocked'
): SafeSummaryShapeStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || upstreamStatus === 'NEEDS_REVIEW' || approvalStatus === 'pending') return 'NEEDS_REVIEW';
  return 'SAFE_SUMMARY_SHAPE_READY';
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: SafeSummaryShapeStatus
): NextSafeAction => {
  if (!input.sourceCandidateDisabledProbe || blockers.has('source_candidate_disabled_probe_missing') || blockers.has('source_candidate_disabled_probe_blocked')) {
    return 'build_actual_safe_row_export_read_only_source_candidate_disabled_probe';
  }
  if (blockers.has('safe_summary_shape_spec_missing')) return 'provide_safe_summary_shape_spec';
  if (blockers.has('safe_summary_shape_version_missing')) return 'add_safe_summary_shape_version';
  if (blockers.has('required_field_policy_missing') || Array.from(blockers).some((code) => code.startsWith('required_field_missing:'))) {
    return 'add_required_field_policy';
  }
  if (blockers.has('forbidden_field_policy_missing') || Array.from(blockers).some((code) => code.startsWith('forbidden_field_policy_missing:'))) {
    return 'add_forbidden_field_policy';
  }
  if (blockers.has('entity_shape_policy_missing')) return 'add_entity_shape_policy';
  if (blockers.has('unsupported_entity_requested') || blockers.has('deferred_entity_requested') || blockers.has('entity_shape_policy_unsupported_entity') || blockers.has('entity_shape_policy_deferred_entity')) {
    return 'remove_unsupported_entity';
  }
  if (Array.from(blockers).some((code) => code.startsWith('entity_shape_policy_forbidden_field:'))) {
    return 'remove_forbidden_field_from_shape';
  }
  if (missing.has('operator_safe_summary_shape_approval_pending')) return 'collect_operator_safe_summary_shape_approval';
  if (status === 'SAFE_SUMMARY_SHAPE_READY') {
    return 'prepare_pr_d8z_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture';
  }
  return 'collect_operator_safe_summary_shape_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const sourceCandidateDisabledProbeStatus = evaluateSourceCandidateDisabledProbe(input.sourceCandidateDisabledProbe, blockers, missing);
  evaluateShapeSpec(input.safeSummaryShapeSpec, blockers, missing);
  const shapeVersion = evaluateShapeVersion(input.shapeVersion, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const requiredFieldPolicyStatus = evaluateRequiredFieldPolicy(input.requiredFieldPolicy, blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const entityShapePolicy = evaluateEntityShapePolicy(input.entityShapePolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status = determineStatus(blockers, missing, sourceCandidateDisabledProbeStatus, operatorApprovalStatus);

  return {
    shapeKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_TRACE_LABEL,
    sourceCandidateDisabledProbeStatus,
    shapeVersion,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    requiredFieldPolicyStatus,
    forbiddenFieldPolicyStatus,
    entityShapePolicyStatus: entityShapePolicy.status,
    sameHeadEvidenceStatus,
    operatorApprovalStatus,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    actualDbQueryEnabled: false,
    actualDbExportEnabled: false,
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
    requiredFieldNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS],
    allowedOptionalFieldNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_ALLOWED_OPTIONAL_FIELDS],
    forbiddenFieldNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS],
    entityShapeSummaries: entityShapePolicy.summaries,
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
    nextSafeAction: determineNextSafeAction(input, blockers, missing, status)
  };
};
