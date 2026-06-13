import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES
} from './tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateContract
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateContract';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_DISABLED_PROBE_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_disabled_probe' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_DISABLED_PROBE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_DISABLED_PROBE_TRACE_LABEL =
  'd8x_actual_safe_row_export_read_only_source_candidate_disabled_probe' as const;

type DisabledProbeStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_CANDIDATE_DISABLED_PROBE_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'source_candidate_contract_approved'
  | 'source_candidate_disabled_probe_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type CandidateProbeKind =
  | 'disabled_noop_source_candidate_probe'
  | 'contract_shape_probe'
  | 'safe_capability_probe'
  | 'operator_review_probe'
  | 'db_connect_probe'
  | 'prisma_probe'
  | 'database_url_probe'
  | 'raw_sql_probe'
  | 'query_execution_probe'
  | 'runtime_worker_probe'
  | 'http_route_probe'
  | 'cli_probe'
  | 'cron_probe'
  | 'tracking_service_probe'
  | 'wallet_provider_probe'
  | 'contract_sender_probe'
  | 'tx_sender_probe'
  | 'file_export_probe'
  | 'artifact_upload_probe'
  | 'network_probe'
  | 'env_probe'
  | string;
type DisabledProbeCapability =
  | 'inspect_contract_shape'
  | 'inspect_allowed_entities'
  | 'inspect_allowed_methods'
  | 'inspect_safe_row_schema_policy'
  | 'inspect_forbidden_field_policy'
  | 'confirm_execution_disabled'
  | 'confirm_same_head_required'
  | 'confirm_operator_approval_required'
  | 'executes_query'
  | 'opens_connection'
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
  | 'returns_db_rows'
  | 'returns_jsonl_file'
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_contract'
  | 'provide_source_candidate_disabled_probe_spec'
  | 'remove_unsupported_probe_kind'
  | 'remove_unsupported_entity'
  | 'remove_forbidden_probe_capability'
  | 'add_disabled_probe_policy'
  | 'disable_probe_execution_flags'
  | 'collect_operator_source_candidate_disabled_probe_approval'
  | 'prepare_pr_d8y_actual_safe_row_export_read_only_source_candidate_safe_summary_shape';

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeSpec = {
  probeDisabled?: boolean;
  sourceAccessEnabled?: boolean;
  actualDbQueryEnabled?: boolean;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbePolicy = {
  capabilities?: DisabledProbeCapability[];
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

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput = {
  sourceCandidateContract?: TierUpdateActualSafeRowExportReadOnlySourceCandidateContract | null;
  disabledProbeSpec?: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeSpec | null;
  requestedEntities?: string[];
  candidateProbeKind?: CandidateProbeKind | null;
  disabledProbePolicy?: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbePolicy | null;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeOperatorApproval;
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

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe = {
  probeKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_DISABLED_PROBE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_DISABLED_PROBE_SCHEMA_VERSION;
  status: DisabledProbeStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_DISABLED_PROBE_TRACE_LABEL;
  sourceCandidateContractStatus: string;
  requestedEntitiesSummary: { requestedCount: number; allowedCount: number; safeSummaryOnly: true };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  candidateProbeKind: string;
  disabledProbePolicyStatus: 'present' | 'missing' | 'blocked';
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
  probeResultsSummary: {
    contractShapeInspected: boolean;
    allowedEntitiesInspected: boolean;
    executionDisabledConfirmed: boolean;
    safeSummaryOnly: true;
  };
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
const ALLOWED_PROBE_KINDS = new Set([
  'disabled_noop_source_candidate_probe',
  'contract_shape_probe',
  'safe_capability_probe',
  'operator_review_probe'
]);
const FORBIDDEN_PROBE_KINDS = new Set([
  'db_connect_probe',
  'prisma_probe',
  'database_url_probe',
  'raw_sql_probe',
  'query_execution_probe',
  'runtime_worker_probe',
  'http_route_probe',
  'cli_probe',
  'cron_probe',
  'tracking_service_probe',
  'wallet_provider_probe',
  'contract_sender_probe',
  'tx_sender_probe',
  'file_export_probe',
  'artifact_upload_probe',
  'network_probe',
  'env_probe'
]);
const REQUIRED_CAPABILITIES = [
  'inspect_contract_shape',
  'inspect_allowed_entities',
  'inspect_allowed_methods',
  'inspect_safe_row_schema_policy',
  'inspect_forbidden_field_policy',
  'confirm_execution_disabled',
  'confirm_same_head_required',
  'confirm_operator_approval_required'
];
const FORBIDDEN_CAPABILITIES = new Set([
  'executes_query',
  'opens_connection',
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
  'claims_production_ready',
  'returns_db_rows',
  'returns_jsonl_file'
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

const evaluateSourceCandidateContract = (
  contract: TierUpdateActualSafeRowExportReadOnlySourceCandidateContract | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!contract) {
    add(blockers, 'source_candidate_contract_missing');
    add(missing, 'source_candidate_contract');
    return 'missing';
  }
  if (contract.status === 'SOURCE_CANDIDATE_CONTRACT_READY') return 'SOURCE_CANDIDATE_CONTRACT_READY';
  if (contract.status === 'NEEDS_REVIEW') {
    add(missing, 'source_candidate_contract_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'source_candidate_contract_blocked');
  return String(contract.status || 'blocked');
};

const evaluateDisabledProbeSpec = (
  spec: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeSpec | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): void => {
  if (!spec) {
    add(blockers, 'disabled_probe_spec_missing');
    add(missing, 'disabled_probe_spec');
    return;
  }
  if (spec.sourceAccessEnabled === true || spec.actualDbQueryEnabled === true) {
    add(blockers, 'disabled_probe_spec_execution_enabled');
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

const evaluateProbeKind = (
  kind: CandidateProbeKind | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!kind) {
    add(missing, 'candidate_probe_kind');
    return 'missing';
  }
  const normalizedKind = normalize(String(kind));
  if (!ALLOWED_PROBE_KINDS.has(normalizedKind)) add(blockers, 'unsupported_probe_kind');
  if (FORBIDDEN_PROBE_KINDS.has(normalizedKind)) add(blockers, `forbidden_probe_kind:${normalizedKind}`);
  return normalizedKind;
};

const evaluateDisabledProbePolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbePolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' | 'blocked' => {
  if (!policy) {
    add(blockers, 'disabled_probe_policy_missing');
    add(missing, 'disabled_probe_policy');
    return 'missing';
  }
  const capabilities = new Set(uniqueNormalized(policy.capabilities));
  REQUIRED_CAPABILITIES.forEach((capability) => {
    if (!capabilities.has(capability)) {
      add(blockers, `disabled_probe_capability_missing:${capability}`);
      add(missing, `disabled_probe_capability:${capability}`);
    }
  });
  capabilities.forEach((capability) => {
    if (FORBIDDEN_CAPABILITIES.has(capability)) add(blockers, `forbidden_probe_capability:${capability}`);
  });
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
    if (policy[flag] === true) add(blockers, `disabled_probe_policy_${normalize(flag)}_forbidden`);
  });
  return Array.from(blockers).some((code) => (
    code.startsWith('disabled_probe_capability_missing:')
    || code.startsWith('forbidden_probe_capability:')
    || code.startsWith('disabled_probe_policy_')
  )) ? 'blocked' : 'present';
};

const evaluateSameHeadEvidence = (
  evidence: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeSameHeadEvidence | undefined,
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
  approval: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (approval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (approval.status === 'source_candidate_disabled_probe_approved') return 'approved';
  if (approval.status === 'pending' || approval.status === 'source_candidate_contract_approved') {
    add(missing, 'operator_source_candidate_disabled_probe_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput,
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
  contractStatus: string,
  approvalStatus: 'approved' | 'pending' | 'blocked'
): DisabledProbeStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || contractStatus === 'NEEDS_REVIEW' || approvalStatus === 'pending') return 'NEEDS_REVIEW';
  return 'SOURCE_CANDIDATE_DISABLED_PROBE_READY';
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: DisabledProbeStatus
): NextSafeAction => {
  if (!input.sourceCandidateContract || blockers.has('source_candidate_contract_missing') || blockers.has('source_candidate_contract_blocked')) {
    return 'build_actual_safe_row_export_read_only_source_candidate_contract';
  }
  if (blockers.has('disabled_probe_spec_missing')) return 'provide_source_candidate_disabled_probe_spec';
  if (blockers.has('unsupported_probe_kind') || Array.from(blockers).some((code) => code.startsWith('forbidden_probe_kind'))) {
    return 'remove_unsupported_probe_kind';
  }
  if (blockers.has('unsupported_entity_requested') || blockers.has('deferred_entity_requested')) return 'remove_unsupported_entity';
  if (Array.from(blockers).some((code) => code.startsWith('forbidden_probe_capability'))) {
    return 'remove_forbidden_probe_capability';
  }
  if (blockers.has('disabled_probe_policy_missing') || Array.from(blockers).some((code) => code.startsWith('disabled_probe_capability_missing'))) {
    return 'add_disabled_probe_policy';
  }
  if (Array.from(blockers).some((code) => code.includes('_forbidden') || code.includes('execution_enabled'))) {
    return 'disable_probe_execution_flags';
  }
  if (missing.has('operator_source_candidate_disabled_probe_approval_pending')) {
    return 'collect_operator_source_candidate_disabled_probe_approval';
  }
  if (status === 'SOURCE_CANDIDATE_DISABLED_PROBE_READY') {
    return 'prepare_pr_d8y_actual_safe_row_export_read_only_source_candidate_safe_summary_shape';
  }
  return 'collect_operator_source_candidate_disabled_probe_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe = (
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const sourceCandidateContractStatus = evaluateSourceCandidateContract(input.sourceCandidateContract, blockers, missing);
  evaluateDisabledProbeSpec(input.disabledProbeSpec, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const candidateProbeKind = evaluateProbeKind(input.candidateProbeKind, blockers, missing);
  const disabledProbePolicyStatus = evaluateDisabledProbePolicy(input.disabledProbePolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status = determineStatus(blockers, missing, sourceCandidateContractStatus, operatorApprovalStatus);

  return {
    probeKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_DISABLED_PROBE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_DISABLED_PROBE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_DISABLED_PROBE_TRACE_LABEL,
    sourceCandidateContractStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    candidateProbeKind,
    disabledProbePolicyStatus,
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
    probeResultsSummary: {
      contractShapeInspected: sourceCandidateContractStatus === 'SOURCE_CANDIDATE_CONTRACT_READY',
      allowedEntitiesInspected: entitySummary.allowedCount > 0,
      executionDisabledConfirmed: disabledProbePolicyStatus === 'present',
      safeSummaryOnly: true
    },
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
