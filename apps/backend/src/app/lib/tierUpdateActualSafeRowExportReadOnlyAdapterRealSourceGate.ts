import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES
} from './tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe
} from './tierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_REAL_SOURCE_GATE_KIND =
  'tier_update_actual_safe_row_export_read_only_adapter_real_source_gate' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_REAL_SOURCE_GATE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_REAL_SOURCE_GATE_TRACE_LABEL =
  'd8v_actual_safe_row_export_read_only_adapter_real_source_gate' as const;

type RealSourceGateStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'REAL_SOURCE_GATE_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'noop_execution_probe_approved'
  | 'real_source_gate_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type RealSourceCandidateKind =
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
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_adapter_noop_execution_probe'
  | 'provide_real_source_gate_spec'
  | 'provide_disabled_real_source_candidate'
  | 'remove_unsupported_real_source_candidate'
  | 'remove_unsupported_entity'
  | 'add_source_evidence_policy'
  | 'add_safe_row_schema_policy'
  | 'add_forbidden_field_policy'
  | 'collect_operator_real_source_gate_approval'
  | 'prepare_pr_d8w_actual_safe_row_export_read_only_source_candidate_contract';

export type TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateSpec = {
  gateDisabled?: boolean;
  realSourceAccessEnabled?: boolean;
  actualDbQueryEnabled?: boolean;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceCandidate = {
  kind?: RealSourceCandidateKind;
  executionDisabled?: boolean;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterSourceEvidencePolicy = {
  sourceHeadSha?: string;
  sourceHash?: string;
  sameHeadRequired?: boolean;
  schemaPolicyId?: string;
  forbiddenFieldPolicyId?: string;
  operatorApprovalStatus?: OperatorApprovalStatus;
  executionDisabled?: boolean;
  databaseUrlReadEnabled?: boolean;
  prismaClientEnabled?: boolean;
  actualDbQueryEnabled?: boolean;
  fileExportEnabled?: boolean;
  artifactUploadEnabled?: boolean;
  runtimeReadinessClaimed?: boolean;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterSafeRowSchemaPolicy = {
  policyId?: string;
  requiredMetadataFields?: string[];
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterForbiddenFieldPolicy = {
  policyId?: string;
  forbiddenFields?: string[];
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput = {
  noopExecutionProbe?: TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe | null;
  sourceGateSpec?: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateSpec | null;
  requestedEntities?: string[];
  realSourceCandidate?: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceCandidate | null;
  sourceEvidencePolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterSourceEvidencePolicy | null;
  safeRowSchemaPolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterSafeRowSchemaPolicy | null;
  forbiddenFieldPolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterForbiddenFieldPolicy | null;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateOperatorApproval;
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

export type TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate = {
  gateKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_REAL_SOURCE_GATE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_REAL_SOURCE_GATE_SCHEMA_VERSION;
  status: RealSourceGateStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_REAL_SOURCE_GATE_TRACE_LABEL;
  noopExecutionProbeStatus: string;
  requestedEntitiesSummary: { requestedCount: number; allowedCount: number; safeSummaryOnly: true };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  realSourceCandidateKind: string;
  sourceEvidencePolicyStatus: 'present' | 'missing' | 'blocked';
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
const ALLOWED_SOURCE_KINDS = new Set([
  'read_only_safe_source_candidate',
  'disabled_real_source_candidate',
  'owner_review_real_source_candidate'
]);
const FORBIDDEN_SOURCE_KINDS = new Set([
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
  'artifact_uploader'
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

const evaluateNoopProbe = (
  probe: TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!probe) {
    add(blockers, 'noop_execution_probe_missing');
    add(missing, 'noop_execution_probe');
    return 'missing';
  }
  if (probe.status === 'NOOP_PROBE_READY') return 'NOOP_PROBE_READY';
  if (probe.status === 'NEEDS_REVIEW') {
    add(missing, 'noop_execution_probe_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'noop_execution_probe_blocked');
  return String(probe.status || 'blocked');
};

const evaluateSourceGateSpec = (
  spec: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateSpec | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): void => {
  if (!spec) {
    add(blockers, 'source_gate_spec_missing');
    add(missing, 'source_gate_spec');
    return;
  }
  if (spec.realSourceAccessEnabled === true || spec.actualDbQueryEnabled === true) {
    add(blockers, 'source_gate_spec_execution_enabled');
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

const evaluateCandidate = (
  candidate: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceCandidate | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!candidate) {
    add(missing, 'real_source_candidate');
    return 'missing';
  }
  const kind = normalize(String(candidate.kind || 'missing'));
  if (!ALLOWED_SOURCE_KINDS.has(kind)) add(blockers, 'unsupported_real_source_candidate');
  if (FORBIDDEN_SOURCE_KINDS.has(kind)) add(blockers, `forbidden_real_source_candidate:${kind}`);
  if (candidate.executionDisabled !== true) add(blockers, 'real_source_candidate_execution_not_disabled');
  return kind;
};

const evaluateSourceEvidencePolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterSourceEvidencePolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' | 'blocked' => {
  if (!policy) {
    add(blockers, 'source_evidence_policy_missing');
    add(missing, 'source_evidence_policy');
    return 'missing';
  }
  const requiredPresence = [
    ['source_head_sha', policy.sourceHeadSha],
    ['source_hash', policy.sourceHash],
    ['schema_policy_id', policy.schemaPolicyId],
    ['forbidden_field_policy_id', policy.forbiddenFieldPolicyId],
    ['operator_approval_status', policy.operatorApprovalStatus]
  ] as const;
  requiredPresence.forEach(([code, value]) => {
    if (!value) add(missing, code);
  });
  const requiredFalse = [
    ['database_url_read_enabled', policy.databaseUrlReadEnabled],
    ['prisma_client_enabled', policy.prismaClientEnabled],
    ['actual_db_query_enabled', policy.actualDbQueryEnabled],
    ['file_export_enabled', policy.fileExportEnabled],
    ['artifact_upload_enabled', policy.artifactUploadEnabled],
    ['runtime_readiness_claimed', policy.runtimeReadinessClaimed]
  ] as const;
  if (policy.sameHeadRequired !== true) add(blockers, 'source_evidence_same_head_required');
  if (policy.executionDisabled !== true) add(blockers, 'source_evidence_execution_not_disabled');
  requiredFalse.forEach(([code, value]) => {
    if (value !== false) add(blockers, `source_evidence_${code}_not_false`);
  });
  return requiredFalse.some(([code]) => blockers.has(`source_evidence_${code}_not_false`))
    || blockers.has('source_evidence_same_head_required')
    || blockers.has('source_evidence_execution_not_disabled')
    ? 'blocked'
    : 'present';
};

const evaluateSafeRowSchemaPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterSafeRowSchemaPolicy | null | undefined,
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
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterForbiddenFieldPolicy | null | undefined,
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
  evidence: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateSameHeadEvidence | undefined,
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
  approval: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (approval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (approval.status === 'real_source_gate_approved') return 'approved';
  if (approval.status === 'pending' || approval.status === 'noop_execution_probe_approved') {
    add(missing, 'operator_real_source_gate_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput,
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
  noopStatus: string,
  approvalStatus: 'approved' | 'pending' | 'blocked'
): RealSourceGateStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || noopStatus === 'NEEDS_REVIEW' || approvalStatus === 'pending') return 'NEEDS_REVIEW';
  return 'REAL_SOURCE_GATE_READY';
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: RealSourceGateStatus
): NextSafeAction => {
  if (!input.noopExecutionProbe || blockers.has('noop_execution_probe_missing') || blockers.has('noop_execution_probe_blocked')) {
    return 'build_actual_safe_row_export_read_only_adapter_noop_execution_probe';
  }
  if (blockers.has('source_gate_spec_missing')) return 'provide_real_source_gate_spec';
  if (missing.has('real_source_candidate')) return 'provide_disabled_real_source_candidate';
  if (blockers.has('unsupported_real_source_candidate') || Array.from(blockers).some((code) => code.startsWith('forbidden_real_source_candidate'))) {
    return 'remove_unsupported_real_source_candidate';
  }
  if (blockers.has('unsupported_entity_requested') || blockers.has('deferred_entity_requested')) return 'remove_unsupported_entity';
  if (blockers.has('source_evidence_policy_missing')) return 'add_source_evidence_policy';
  if (blockers.has('safe_row_schema_policy_missing') || blockers.has('safe_row_metadata_contract_incomplete')) return 'add_safe_row_schema_policy';
  if (blockers.has('forbidden_field_policy_missing')) return 'add_forbidden_field_policy';
  if (missing.has('operator_real_source_gate_approval_pending')) return 'collect_operator_real_source_gate_approval';
  if (status === 'REAL_SOURCE_GATE_READY') {
    return 'prepare_pr_d8w_actual_safe_row_export_read_only_source_candidate_contract';
  }
  return 'collect_operator_real_source_gate_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput
): TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const noopExecutionProbeStatus = evaluateNoopProbe(input.noopExecutionProbe, blockers, missing);
  evaluateSourceGateSpec(input.sourceGateSpec, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const realSourceCandidateKind = evaluateCandidate(input.realSourceCandidate, blockers, missing);
  const sourceEvidencePolicyStatus = evaluateSourceEvidencePolicy(input.sourceEvidencePolicy, blockers, missing);
  const safeRowSchemaPolicyStatus = evaluateSafeRowSchemaPolicy(input.safeRowSchemaPolicy, blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status = determineStatus(blockers, missing, noopExecutionProbeStatus, operatorApprovalStatus);

  return {
    gateKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_REAL_SOURCE_GATE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_REAL_SOURCE_GATE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_REAL_SOURCE_GATE_TRACE_LABEL,
    noopExecutionProbeStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    realSourceCandidateKind,
    sourceEvidencePolicyStatus,
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
