import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES
} from './tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate
} from './tierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_CONTRACT_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_contract' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_CONTRACT_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_CONTRACT_TRACE_LABEL =
  'd8w_actual_safe_row_export_read_only_source_candidate_contract' as const;

type SourceCandidateContractStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_CANDIDATE_CONTRACT_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'real_source_gate_approved'
  | 'source_candidate_contract_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type SourceCandidateKind =
  | 'read_only_safe_source_candidate'
  | 'disabled_real_source_candidate'
  | 'owner_review_real_source_candidate'
  | 'prisma_client'
  | 'database_url'
  | 'raw_sql'
  | 'transactional_writer'
  | 'runtime_worker'
  | 'http_route'
  | 'cli_runner'
  | 'cron_job'
  | 'tracking_service'
  | 'wallet_provider'
  | 'contract_sender'
  | 'tx_sender'
  | 'file_exporter'
  | 'artifact_uploader'
  | 'external_network_source'
  | 'secret_env_source'
  | string;
type SourceCandidateCapability =
  | 'returns_safe_summary_rows'
  | 'requires_same_head_evidence'
  | 'requires_operator_approval'
  | 'execution_disabled_by_default'
  | 'forbidden_field_policy_enforced'
  | 'safe_row_schema_policy_enforced'
  | 'executes_query'
  | 'reads_database_url'
  | 'imports_prisma'
  | 'reads_env'
  | 'writes_file'
  | 'uploads_artifact'
  | 'calls_network'
  | 'calls_rpc'
  | 'uses_wallet'
  | 'uses_contract'
  | 'sends_tx'
  | 'claims_runtime_ready'
  | 'claims_staging_ready'
  | 'claims_production_ready'
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_adapter_real_source_gate'
  | 'provide_source_candidate_contract_spec'
  | 'remove_unsupported_source_candidate_kind'
  | 'remove_forbidden_candidate_capability'
  | 'remove_unsupported_entity'
  | 'add_source_capability_policy'
  | 'add_safe_row_schema_policy'
  | 'add_forbidden_field_policy'
  | 'collect_operator_source_candidate_contract_approval'
  | 'prepare_pr_d8x_actual_safe_row_export_read_only_source_candidate_disabled_probe';

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateContractSpec = {
  contractDisabled?: boolean;
  sourceAccessEnabled?: boolean;
  actualDbQueryEnabled?: boolean;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateCapabilityPolicy = {
  capabilities?: SourceCandidateCapability[];
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeRowSchemaPolicy = {
  policyId?: string;
  requiredMetadataFields?: string[];
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateForbiddenFieldPolicy = {
  policyId?: string;
  forbiddenFields?: string[];
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput = {
  realSourceGate?: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate | null;
  sourceCandidateContractSpec?: TierUpdateActualSafeRowExportReadOnlySourceCandidateContractSpec | null;
  requestedEntities?: string[];
  sourceCandidateKind?: SourceCandidateKind | null;
  sourceCapabilityPolicy?: TierUpdateActualSafeRowExportReadOnlySourceCandidateCapabilityPolicy | null;
  safeRowSchemaPolicy?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeRowSchemaPolicy | null;
  forbiddenFieldPolicy?: TierUpdateActualSafeRowExportReadOnlySourceCandidateForbiddenFieldPolicy | null;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlySourceCandidateOperatorApproval;
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
  artifactUploadEnabled?: boolean;
  dockerSmokeChanged?: boolean;
  stagingNoTxPassClaimed?: boolean;
  runtimeReadinessClaimed?: boolean;
  productionReadinessClaimed?: boolean;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateContract = {
  contractKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_CONTRACT_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_CONTRACT_SCHEMA_VERSION;
  status: SourceCandidateContractStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_CONTRACT_TRACE_LABEL;
  realSourceGateStatus: string;
  requestedEntitiesSummary: { requestedCount: number; allowedCount: number; safeSummaryOnly: true };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  sourceCandidateKind: string;
  sourceCapabilityPolicyStatus: 'present' | 'missing' | 'blocked';
  safeRowSchemaPolicyStatus: 'present' | 'missing' | 'blocked';
  forbiddenFieldPolicyStatus: 'present' | 'missing';
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
const ALLOWED_CANDIDATE_KINDS = new Set([
  'read_only_safe_source_candidate',
  'disabled_real_source_candidate',
  'owner_review_real_source_candidate'
]);
const FORBIDDEN_CANDIDATE_KINDS = new Set([
  'prisma_client',
  'database_url',
  'raw_sql',
  'transactional_writer',
  'runtime_worker',
  'http_route',
  'cli_runner',
  'cron_job',
  'tracking_service',
  'wallet_provider',
  'contract_sender',
  'tx_sender',
  'file_exporter',
  'artifact_uploader',
  'external_network_source',
  'secret_env_source'
]);
const REQUIRED_CAPABILITIES = [
  'returns_safe_summary_rows',
  'requires_same_head_evidence',
  'requires_operator_approval',
  'execution_disabled_by_default',
  'forbidden_field_policy_enforced',
  'safe_row_schema_policy_enforced'
];
const FORBIDDEN_CAPABILITIES = new Set([
  'executes_query',
  'reads_database_url',
  'imports_prisma',
  'reads_env',
  'writes_file',
  'uploads_artifact',
  'calls_network',
  'calls_rpc',
  'uses_wallet',
  'uses_contract',
  'sends_tx',
  'claims_runtime_ready',
  'claims_staging_ready',
  'claims_production_ready'
]);
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
const REQUIRED_METADATA_FIELDS = [
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
const safePresence = (value: unknown): { provided: boolean; safeSummaryOnly: true } => ({
  provided: value !== undefined && value !== null && String(value).trim().length > 0,
  safeSummaryOnly: true
});

const evaluateRealSourceGate = (
  gate: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!gate) {
    add(blockers, 'real_source_gate_missing');
    add(missing, 'real_source_gate');
    return 'missing';
  }
  if (gate.status === 'REAL_SOURCE_GATE_READY') return 'REAL_SOURCE_GATE_READY';
  if (gate.status === 'NEEDS_REVIEW') {
    add(missing, 'real_source_gate_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'real_source_gate_blocked');
  return String(gate.status || 'blocked');
};

const evaluateContractSpec = (
  spec: TierUpdateActualSafeRowExportReadOnlySourceCandidateContractSpec | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): void => {
  if (!spec) {
    add(blockers, 'source_candidate_contract_spec_missing');
    add(missing, 'source_candidate_contract_spec');
    return;
  }
  if (spec.sourceAccessEnabled === true || spec.actualDbQueryEnabled === true) {
    add(blockers, 'source_candidate_contract_spec_execution_enabled');
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

const evaluateCandidateKind = (
  kind: SourceCandidateKind | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!kind) {
    add(missing, 'source_candidate_kind');
    return 'missing';
  }
  const normalizedKind = normalize(String(kind));
  if (!ALLOWED_CANDIDATE_KINDS.has(normalizedKind)) add(blockers, 'unsupported_source_candidate_kind');
  if (FORBIDDEN_CANDIDATE_KINDS.has(normalizedKind)) add(blockers, `forbidden_source_candidate_kind:${normalizedKind}`);
  return normalizedKind;
};

const evaluateCapabilityPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlySourceCandidateCapabilityPolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' | 'blocked' => {
  if (!policy) {
    add(blockers, 'source_capability_policy_missing');
    add(missing, 'source_capability_policy');
    return 'missing';
  }
  const capabilities = new Set(uniqueNormalized(policy.capabilities));
  REQUIRED_CAPABILITIES.forEach((capability) => {
    if (!capabilities.has(capability)) {
      add(blockers, `source_capability_missing:${capability}`);
      add(missing, `source_capability:${capability}`);
    }
  });
  capabilities.forEach((capability) => {
    if (FORBIDDEN_CAPABILITIES.has(capability)) add(blockers, `forbidden_source_capability:${capability}`);
  });
  return Array.from(blockers).some((code) => (
    code.startsWith('source_capability_missing:') || code.startsWith('forbidden_source_capability:')
  )) ? 'blocked' : 'present';
};

const evaluateSafeRowSchemaPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeRowSchemaPolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' | 'blocked' => {
  if (!policy) {
    add(blockers, 'safe_row_schema_policy_missing');
    add(missing, 'safe_row_schema_policy');
    return 'missing';
  }
  if (!policy.policyId) add(missing, 'safe_row_schema_policy_id');
  const fields = new Set(uniqueNormalized(policy.requiredMetadataFields));
  const missingFields = REQUIRED_METADATA_FIELDS.filter((field) => !fields.has(field));
  if (missingFields.length > 0) add(blockers, 'safe_row_metadata_contract_incomplete');
  return missingFields.length > 0 ? 'blocked' : 'present';
};

const evaluateForbiddenFieldPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlySourceCandidateForbiddenFieldPolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' => {
  if (!policy) {
    add(blockers, 'forbidden_field_policy_missing');
    add(missing, 'forbidden_field_policy');
    return 'missing';
  }
  if (!policy.policyId) add(missing, 'forbidden_field_policy_id');
  return 'present';
};

const evaluateSameHeadEvidence = (
  evidence: TierUpdateActualSafeRowExportReadOnlySourceCandidateSameHeadEvidence | undefined,
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
  approval: TierUpdateActualSafeRowExportReadOnlySourceCandidateOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (approval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (approval.status === 'source_candidate_contract_approved') return 'approved';
  if (approval.status === 'pending' || approval.status === 'real_source_gate_approved') {
    add(missing, 'operator_source_candidate_contract_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput,
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
  realSourceGateStatus: string,
  approvalStatus: 'approved' | 'pending' | 'blocked'
): SourceCandidateContractStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || realSourceGateStatus === 'NEEDS_REVIEW' || approvalStatus === 'pending') return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_CONTRACT_READY';
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: SourceCandidateContractStatus
): NextSafeAction => {
  if (!input.realSourceGate || blockers.has('real_source_gate_missing') || blockers.has('real_source_gate_blocked')) {
    return 'build_actual_safe_row_export_read_only_adapter_real_source_gate';
  }
  if (blockers.has('source_candidate_contract_spec_missing')) return 'provide_source_candidate_contract_spec';
  if (blockers.has('unsupported_source_candidate_kind') || Array.from(blockers).some((code) => code.startsWith('forbidden_source_candidate_kind'))) {
    return 'remove_unsupported_source_candidate_kind';
  }
  if (Array.from(blockers).some((code) => code.startsWith('forbidden_source_capability'))) {
    return 'remove_forbidden_candidate_capability';
  }
  if (blockers.has('unsupported_entity_requested') || blockers.has('deferred_entity_requested')) return 'remove_unsupported_entity';
  if (blockers.has('source_capability_policy_missing') || Array.from(blockers).some((code) => code.startsWith('source_capability_missing'))) {
    return 'add_source_capability_policy';
  }
  if (blockers.has('safe_row_schema_policy_missing') || blockers.has('safe_row_metadata_contract_incomplete')) return 'add_safe_row_schema_policy';
  if (blockers.has('forbidden_field_policy_missing')) return 'add_forbidden_field_policy';
  if (missing.has('operator_source_candidate_contract_approval_pending')) {
    return 'collect_operator_source_candidate_contract_approval';
  }
  if (status === 'SOURCE_CANDIDATE_CONTRACT_READY') {
    return 'prepare_pr_d8x_actual_safe_row_export_read_only_source_candidate_disabled_probe';
  }
  return 'collect_operator_source_candidate_contract_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlySourceCandidateContract = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateContract => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const realSourceGateStatus = evaluateRealSourceGate(input.realSourceGate, blockers, missing);
  evaluateContractSpec(input.sourceCandidateContractSpec, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const sourceCandidateKind = evaluateCandidateKind(input.sourceCandidateKind, blockers, missing);
  const sourceCapabilityPolicyStatus = evaluateCapabilityPolicy(input.sourceCapabilityPolicy, blockers, missing);
  const safeRowSchemaPolicyStatus = evaluateSafeRowSchemaPolicy(input.safeRowSchemaPolicy, blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status = determineStatus(blockers, missing, realSourceGateStatus, operatorApprovalStatus);

  return {
    contractKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_CONTRACT_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_CONTRACT_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_CONTRACT_TRACE_LABEL,
    realSourceGateStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    sourceCandidateKind,
    sourceCapabilityPolicyStatus,
    safeRowSchemaPolicyStatus,
    forbiddenFieldPolicyStatus,
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
    nextSafeAction: determineNextSafeAction(input, blockers, missing, status)
  };
};
