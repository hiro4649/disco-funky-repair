import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from './tierUpdateActualSafeRowExportDesignGate';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS
} from './tierUpdateActualSafeRowExportReadOnlyAdapterDesign';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterPlan
} from './tierUpdateActualSafeRowExportReadOnlyAdapterPlan';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_CONTRACT_KIND =
  'tier_update_actual_safe_row_export_read_only_adapter_contract' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_CONTRACT_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_CONTRACT_TRACE_LABEL =
  'd8s_actual_safe_row_export_read_only_adapter_contract' as const;

type ContractStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'ADAPTER_CONTRACT_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'adapter_plan_approved'
  | 'adapter_contract_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_adapter_plan'
  | 'provide_read_only_adapter_contract_spec'
  | 'remove_unsupported_adapter_method'
  | 'remove_unsupported_entity'
  | 'add_allowed_method_policy'
  | 'add_safe_row_schema_policy'
  | 'add_forbidden_field_policy'
  | 'collect_operator_adapter_contract_approval'
  | 'prepare_pr_d8t_actual_safe_row_export_read_only_adapter_disabled_implementation';

export type TierUpdateActualSafeRowExportReadOnlyAdapterContractPolicy = {
  required?: boolean;
  requiredMetadataFields?: string[];
  blockedFields?: string[];
  allowedMethodNames?: string[];
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterContractSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterContractOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterContractSpec = {
  contractMethodNames?: string[];
  declaresPrisma?: boolean;
  declaresDatabaseClient?: boolean;
  declaresRawQuery?: boolean;
  declaresSqlText?: boolean;
  declaresTransaction?: boolean;
  declaresEnvRead?: boolean;
  declaresDatabaseUrlRead?: boolean;
  declaresFileWrite?: boolean;
  declaresArtifactUpload?: boolean;
  declaresWalletProviderContractTx?: boolean;
  declaresHttpRoute?: boolean;
  declaresCli?: boolean;
  declaresCronMainTrackingServiceWiring?: boolean;
  requiresSafeSummaryRowsOnly?: boolean;
  requiresSafeMetadata?: boolean;
  requiresReadinessClaimNone?: boolean;
  requiresSameHeadEvidence?: boolean;
  requiresOperatorApproval?: boolean;
  keepsExecutionFlagsFalse?: boolean;
  [key: string]: unknown;
};

export type BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput = {
  adapterPlan?: TierUpdateActualSafeRowExportReadOnlyAdapterPlan | null;
  contractSpec?: TierUpdateActualSafeRowExportReadOnlyAdapterContractSpec | null;
  requestedEntities?: string[];
  allowedMethodPolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterContractPolicy;
  safeRowSchemaPolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterContractPolicy;
  forbiddenFieldPolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterContractPolicy;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlyAdapterContractSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlyAdapterContractOperatorApproval;
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
  fileExportEnabled?: boolean;
  artifactUploadEnabled?: boolean;
  dockerSmokeChanged?: boolean;
  stagingNoTxPassClaimed?: boolean;
  runtimeReadinessClaimed?: boolean;
  productionReadinessClaimed?: boolean;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterContract = {
  contractKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_CONTRACT_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_CONTRACT_SCHEMA_VERSION;
  status: ContractStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_CONTRACT_TRACE_LABEL;
  adapterPlanStatus: string;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    safeSummaryOnly: true;
  };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  contractMethodNames: string[];
  contractMethodCount: number;
  forbiddenContractMethodCount: number;
  compactForbiddenMethodCodes: string[];
  safeRowSchemaPolicyStatus: 'present' | 'missing';
  allowedMethodPolicyStatus: 'present' | 'missing';
  forbiddenFieldPolicyStatus: 'present' | 'missing';
  sameHeadEvidenceStatus: 'required' | 'blocked';
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked';
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  actualDbQueryEnabled: false;
  actualDbExportEnabled: false;
  prismaClientEnabled: false;
  databaseUrlReadEnabled: false;
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
const ALLOWED_METHOD_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS);

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

const CONTRACT_FORBIDDEN_KEYS = [
  'prisma',
  'database',
  'databaseclient',
  'database_client',
  'dbclient',
  'db_client',
  'sql',
  'rawquery',
  'raw_query',
  'transaction',
  'env',
  'readenv',
  'read_env',
  'databaseurl',
  'database_url',
  'filewrite',
  'file_write',
  'artifactupload',
  'artifact_upload',
  'wallet',
  'provider',
  'httproute',
  'http_route',
  'adminroute',
  'cli',
  'cron',
  'main',
  'trackingservice',
  'tracking_service'
];

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

const uniqueNormalized = (values: string[] | undefined): string[] => (
  Array.from(new Set((values || []).map((value) => normalize(String(value))).filter(Boolean))).sort()
);

const uniqueValues = (values: string[] | undefined): string[] => (
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

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const evaluateAdapterPlan = (
  adapterPlan: TierUpdateActualSafeRowExportReadOnlyAdapterPlan | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!adapterPlan) {
    add(blockers, 'adapter_plan_missing');
    add(missing, 'adapter_plan');
    return 'missing';
  }
  if (adapterPlan.status === 'ADAPTER_PLAN_READY') return 'ADAPTER_PLAN_READY';
  if (adapterPlan.status === 'NEEDS_REVIEW') {
    add(missing, 'adapter_plan_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'adapter_plan_blocked');
  return String(adapterPlan.status || 'blocked');
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
  return {
    requestedCount: requested.length,
    allowedCount: allowed.length,
    disallowedEntityCount: disallowed.length
  };
};

const evaluateContractMethods = (
  contractSpec: TierUpdateActualSafeRowExportReadOnlyAdapterContractSpec | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { contractMethodNames: string[]; forbiddenContractMethodCount: number; compactForbiddenMethodCodes: string[] } => {
  if (!contractSpec) {
    add(blockers, 'contract_spec_missing');
    add(missing, 'contract_spec');
    return { contractMethodNames: [], forbiddenContractMethodCount: 0, compactForbiddenMethodCodes: [] };
  }
  const contractMethodNames = uniqueValues(contractSpec.contractMethodNames);
  if (contractMethodNames.length === 0) add(missing, 'contract_method_names_required');
  const forbidden = contractMethodNames.filter((method) => !ALLOWED_METHOD_SET.has(method));
  if (forbidden.length > 0) add(blockers, 'unsupported_adapter_method');
  return {
    contractMethodNames,
    forbiddenContractMethodCount: forbidden.length,
    compactForbiddenMethodCodes: compactCodes(forbidden.map((method) => `unsupported_method:${method}`))
  };
};

const inspectContractShape = (
  value: unknown,
  blockers: Set<string>,
  path = 'contractSpec'
): void => {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    const normalized = normalize(value);
    if (CONTRACT_FORBIDDEN_KEYS.some((key) => normalized.includes(key))) {
      add(blockers, `forbidden_contract_value:${path}`);
    }
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectContractShape(entry, blockers, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    const normalizedKey = normalize(key);
    if (CONTRACT_FORBIDDEN_KEYS.some((forbiddenKey) => normalizedKey.includes(forbiddenKey))) {
      add(blockers, `forbidden_contract_key:${normalizedKey}`);
    }
    inspectContractShape(entry, blockers, `${path}.${key}`);
  }
};

const evaluateExplicitContractDeclarations = (
  contractSpec: TierUpdateActualSafeRowExportReadOnlyAdapterContractSpec | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): void => {
  if (!contractSpec) return;
  if (contractSpec.declaresPrisma === true) add(blockers, 'contract_declares_prisma');
  if (contractSpec.declaresDatabaseClient === true) add(blockers, 'contract_declares_database_client');
  if (contractSpec.declaresRawQuery === true) add(blockers, 'contract_declares_raw_query');
  if (contractSpec.declaresSqlText === true) add(blockers, 'contract_declares_sql_text');
  if (contractSpec.declaresTransaction === true) add(blockers, 'contract_declares_transaction');
  if (contractSpec.declaresEnvRead === true) add(blockers, 'contract_declares_env_read');
  if (contractSpec.declaresDatabaseUrlRead === true) add(blockers, 'contract_declares_database_url_read');
  if (contractSpec.declaresFileWrite === true) add(blockers, 'contract_declares_file_write');
  if (contractSpec.declaresArtifactUpload === true) add(blockers, 'contract_declares_artifact_upload');
  if (contractSpec.declaresWalletProviderContractTx === true) add(blockers, 'contract_declares_wallet_provider_contract_tx');
  if (contractSpec.declaresHttpRoute === true) add(blockers, 'contract_declares_http_route');
  if (contractSpec.declaresCli === true) add(blockers, 'contract_declares_cli');
  if (contractSpec.declaresCronMainTrackingServiceWiring === true) {
    add(blockers, 'contract_declares_cron_main_tracking_service_wiring');
  }
  if (contractSpec.requiresSafeSummaryRowsOnly !== true) add(missing, 'contract_requires_safe_summary_rows_only');
  if (contractSpec.requiresSafeMetadata !== true) add(missing, 'contract_requires_safe_metadata');
  if (contractSpec.requiresReadinessClaimNone !== true) add(missing, 'contract_requires_readiness_claim_none');
  if (contractSpec.requiresSameHeadEvidence !== true) add(missing, 'contract_requires_same_head_evidence');
  if (contractSpec.requiresOperatorApproval !== true) add(missing, 'contract_requires_operator_approval');
  if (contractSpec.keepsExecutionFlagsFalse !== true) add(missing, 'contract_keeps_execution_flags_false');
};

const evaluateAllowedMethodPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterContractPolicy | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' => {
  const methods = new Set((policy?.allowedMethodNames || []).map(String));
  const missingMethods = TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS.filter((method) => !methods.has(method));
  if (policy?.required !== true || missingMethods.length > 0) {
    add(blockers, 'allowed_method_policy_missing');
    missingMethods.forEach((method) => add(missing, `allowed_method_policy:${method}`));
    if (policy?.required !== true) add(missing, 'allowed_method_policy');
    return 'missing';
  }
  return 'present';
};

const evaluateSafeRowSchemaPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterContractPolicy | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' => {
  const fields = new Set((policy?.requiredMetadataFields || []).map(String));
  const missingFields = TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS.filter((field) => !fields.has(field));
  if (policy?.required !== true || missingFields.length > 0) {
    add(blockers, 'safe_row_schema_policy_missing');
    missingFields.forEach((field) => add(missing, `safe_row_schema_policy:${field}`));
    if (policy?.required !== true) add(missing, 'safe_row_schema_policy');
    return 'missing';
  }
  return 'present';
};

const evaluateForbiddenFieldPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterContractPolicy | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' => {
  if (policy?.required !== true || !Array.isArray(policy.blockedFields) || policy.blockedFields.length === 0) {
    add(blockers, 'forbidden_field_policy_missing');
    add(missing, 'forbidden_field_policy');
    return 'missing';
  }
  return 'present';
};

const evaluateSameHeadEvidence = (
  sameHeadEvidence: TierUpdateActualSafeRowExportReadOnlyAdapterContractSameHeadEvidence | undefined,
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
  operatorApproval: TierUpdateActualSafeRowExportReadOnlyAdapterContractOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (operatorApproval.status === 'adapter_contract_approved') return 'approved';
  if (operatorApproval.status === 'pending' || operatorApproval.status === 'adapter_plan_approved') {
    add(missing, 'operator_adapter_contract_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput,
  blockers: Set<string>
): void => {
  if (input.actualDbQueryEnabled === true) add(blockers, 'actual_db_query_enabled');
  if (input.actualDbExportEnabled === true) add(blockers, 'actual_db_export_enabled');
  if (input.prismaClientEnabled === true) add(blockers, 'prisma_client_enabled');
  if (input.databaseUrlReadEnabled === true) add(blockers, 'database_url_read_enabled');
  if (input.fileExportEnabled === true) add(blockers, 'file_export_enabled');
  if (input.artifactUploadEnabled === true) add(blockers, 'artifact_upload_enabled');
  if (input.dockerSmokeChanged === true) add(blockers, 'docker_smoke_changed');
  if (input.stagingNoTxPassClaimed === true) add(blockers, 'staging_no_tx_pass_claimed');
  if (input.runtimeReadinessClaimed === true) add(blockers, 'runtime_readiness_claimed');
  if (input.productionReadinessClaimed === true) add(blockers, 'production_readiness_claimed');
};

const determineStatus = (
  blockers: Set<string>,
  missing: Set<string>,
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked',
  adapterPlanStatus: string
): ContractStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || operatorApprovalStatus === 'pending' || adapterPlanStatus === 'NEEDS_REVIEW') return 'NEEDS_REVIEW';
  return 'ADAPTER_CONTRACT_READY';
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: ContractStatus
): NextSafeAction => {
  if (!input.adapterPlan || blockers.has('adapter_plan_missing') || blockers.has('adapter_plan_blocked')) {
    return 'build_actual_safe_row_export_read_only_adapter_plan';
  }
  if (!input.contractSpec || blockers.has('contract_spec_missing')) return 'provide_read_only_adapter_contract_spec';
  if (blockers.has('unsupported_adapter_method')) return 'remove_unsupported_adapter_method';
  if (blockers.has('unsupported_entity_requested') || blockers.has('deferred_entity_requested')) return 'remove_unsupported_entity';
  if (blockers.has('allowed_method_policy_missing')) return 'add_allowed_method_policy';
  if (blockers.has('safe_row_schema_policy_missing')) return 'add_safe_row_schema_policy';
  if (blockers.has('forbidden_field_policy_missing')) return 'add_forbidden_field_policy';
  if (missing.has('operator_adapter_contract_approval_pending')) return 'collect_operator_adapter_contract_approval';
  if (status === 'ADAPTER_CONTRACT_READY') {
    return 'prepare_pr_d8t_actual_safe_row_export_read_only_adapter_disabled_implementation';
  }
  return 'collect_operator_adapter_contract_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlyAdapterContract = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput
): TierUpdateActualSafeRowExportReadOnlyAdapterContract => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const adapterPlanStatus = evaluateAdapterPlan(input.adapterPlan, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const methodSummary = evaluateContractMethods(input.contractSpec, blockers, missing);
  evaluateExplicitContractDeclarations(input.contractSpec, blockers, missing);
  inspectContractShape(input.contractSpec, blockers);
  const safeRowSchemaPolicyStatus = evaluateSafeRowSchemaPolicy(input.safeRowSchemaPolicy, blockers, missing);
  const allowedMethodPolicyStatus = evaluateAllowedMethodPolicy(input.allowedMethodPolicy, blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status = determineStatus(blockers, missing, operatorApprovalStatus, adapterPlanStatus);
  const nextSafeAction = determineNextSafeAction(input, blockers, missing, status);

  return {
    contractKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_CONTRACT_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_CONTRACT_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_CONTRACT_TRACE_LABEL,
    adapterPlanStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    contractMethodNames: methodSummary.contractMethodNames,
    contractMethodCount: methodSummary.contractMethodNames.length,
    forbiddenContractMethodCount: methodSummary.forbiddenContractMethodCount,
    compactForbiddenMethodCodes: methodSummary.compactForbiddenMethodCodes,
    safeRowSchemaPolicyStatus,
    allowedMethodPolicyStatus,
    forbiddenFieldPolicyStatus,
    sameHeadEvidenceStatus,
    operatorApprovalStatus,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    actualDbQueryEnabled: false,
    actualDbExportEnabled: false,
    prismaClientEnabled: false,
    databaseUrlReadEnabled: false,
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
    nextSafeAction
  };
};
