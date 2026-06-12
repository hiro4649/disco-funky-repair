import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from './tierUpdateActualSafeRowExportDesignGate';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS
} from './tierUpdateActualSafeRowExportReadOnlyAdapterDesign';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge
} from './tierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_PLAN_KIND =
  'tier_update_actual_safe_row_export_read_only_adapter_plan' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_PLAN_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_PLAN_TRACE_LABEL =
  'd8r_actual_safe_row_export_read_only_adapter_plan' as const;

type PlanStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'ADAPTER_PLAN_READY';
type AllowedEntity = typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES[number];
type AllowedMethod = typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS[number];
type OperatorApprovalStatus =
  | 'pending'
  | 'dry_run_bridge_approved'
  | 'adapter_plan_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_read_only_adapter_dry_run_bridge'
  | 'provide_read_only_adapter_plan'
  | 'remove_unsupported_adapter_method'
  | 'remove_unsupported_entity'
  | 'add_safe_row_schema_policy'
  | 'add_forbidden_field_policy'
  | 'collect_operator_adapter_plan_approval'
  | 'prepare_pr_d8s_actual_safe_row_export_adapter_contract';

export type TierUpdateActualSafeRowExportReadOnlyAdapterPlanPolicy = {
  required?: boolean;
  requiredMetadataFields?: string[];
  blockedFields?: string[];
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterPlanSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterPlanOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterPlanInput = {
  plannedMethodNames?: string[];
  declaresPrisma?: boolean;
  declaresDatabaseClient?: boolean;
  declaresRawQuery?: boolean;
  declaresTransaction?: boolean;
  declaresEnvRead?: boolean;
  declaresDatabaseUrlRead?: boolean;
  declaresFileWrite?: boolean;
  declaresArtifactUpload?: boolean;
  declaresWalletProviderContractTx?: boolean;
  declaresHttpRoute?: boolean;
  declaresCli?: boolean;
  declaresCronMainTrackingServiceWiring?: boolean;
  [key: string]: unknown;
};

export type BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput = {
  dryRunBridge?: TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge | null;
  adapterPlan?: TierUpdateActualSafeRowExportReadOnlyAdapterPlanInput | null;
  requestedEntities?: string[];
  safeRowSchemaPolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterPlanPolicy;
  forbiddenFieldPolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterPlanPolicy;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlyAdapterPlanSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlyAdapterPlanOperatorApproval;
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

export type TierUpdateActualSafeRowExportReadOnlyAdapterPlan = {
  planKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_PLAN_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_PLAN_SCHEMA_VERSION;
  status: PlanStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_PLAN_TRACE_LABEL;
  dryRunBridgeStatus: string;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    safeSummaryOnly: true;
  };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  plannedMethodNames: string[];
  plannedMethodCount: number;
  forbiddenPlannedMethodCount: number;
  compactForbiddenMethodCodes: string[];
  safeRowSchemaPolicyStatus: 'present' | 'missing';
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

const PLAN_FORBIDDEN_KEYS = [
  'prisma',
  'database',
  'databaseclient',
  'database_client',
  'dbclient',
  'db_client',
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
  'contract',
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

const evaluateDryRunBridge = (
  dryRunBridge: TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!dryRunBridge) {
    add(blockers, 'dry_run_bridge_missing');
    add(missing, 'dry_run_bridge');
    return 'missing';
  }
  if (dryRunBridge.status === 'DRY_RUN_BRIDGE_READY') return 'DRY_RUN_BRIDGE_READY';
  if (dryRunBridge.status === 'NEEDS_REVIEW') {
    add(missing, 'dry_run_bridge_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'dry_run_bridge_blocked');
  return String(dryRunBridge.status || 'blocked');
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
  const allowed = requested.filter((entity): entity is AllowedEntity => ALLOWED_ENTITY_SET.has(entity));
  const disallowed = requested.filter((entity) => !ALLOWED_ENTITY_SET.has(entity));
  if (disallowed.length > 0) add(blockers, 'unsupported_entity_requested');
  if (disallowed.some((entity) => DEFERRED_ENTITIES.has(entity))) add(blockers, 'deferred_entity_requested');
  return {
    requestedCount: requested.length,
    allowedCount: allowed.length,
    disallowedEntityCount: disallowed.length
  };
};

const evaluatePlannedMethods = (
  adapterPlan: TierUpdateActualSafeRowExportReadOnlyAdapterPlanInput | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { plannedMethodNames: string[]; forbiddenPlannedMethodCount: number; compactForbiddenMethodCodes: string[] } => {
  if (!adapterPlan) {
    add(blockers, 'adapter_plan_missing');
    add(missing, 'adapter_plan');
    return { plannedMethodNames: [], forbiddenPlannedMethodCount: 0, compactForbiddenMethodCodes: [] };
  }
  const plannedMethodNames = uniqueValues(adapterPlan.plannedMethodNames);
  if (plannedMethodNames.length === 0) add(missing, 'planned_method_names_required');
  const forbidden = plannedMethodNames.filter((method) => !ALLOWED_METHOD_SET.has(method));
  if (forbidden.length > 0) add(blockers, 'unsupported_adapter_method');
  return {
    plannedMethodNames,
    forbiddenPlannedMethodCount: forbidden.length,
    compactForbiddenMethodCodes: compactCodes(forbidden.map((method) => `unsupported_method:${method}`))
  };
};

const inspectPlanShape = (
  value: unknown,
  blockers: Set<string>,
  path = 'adapterPlan'
): void => {
  if (value === null || value === undefined) return;
  if (typeof value === 'string') {
    const normalized = normalize(value);
    if (PLAN_FORBIDDEN_KEYS.some((key) => normalized.includes(key))) add(blockers, `forbidden_plan_value:${path}`);
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectPlanShape(entry, blockers, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    const normalizedKey = normalize(key);
    if (PLAN_FORBIDDEN_KEYS.some((forbiddenKey) => normalizedKey.includes(forbiddenKey))) {
      add(blockers, `forbidden_plan_key:${normalizedKey}`);
    }
    inspectPlanShape(entry, blockers, `${path}.${key}`);
  }
};

const evaluateExplicitPlanDeclarations = (
  adapterPlan: TierUpdateActualSafeRowExportReadOnlyAdapterPlanInput | null | undefined,
  blockers: Set<string>
): void => {
  if (!adapterPlan) return;
  if (adapterPlan.declaresPrisma === true) add(blockers, 'plan_declares_prisma');
  if (adapterPlan.declaresDatabaseClient === true) add(blockers, 'plan_declares_database_client');
  if (adapterPlan.declaresRawQuery === true) add(blockers, 'plan_declares_raw_query');
  if (adapterPlan.declaresTransaction === true) add(blockers, 'plan_declares_transaction');
  if (adapterPlan.declaresEnvRead === true) add(blockers, 'plan_declares_env_read');
  if (adapterPlan.declaresDatabaseUrlRead === true) add(blockers, 'plan_declares_database_url_read');
  if (adapterPlan.declaresFileWrite === true) add(blockers, 'plan_declares_file_write');
  if (adapterPlan.declaresArtifactUpload === true) add(blockers, 'plan_declares_artifact_upload');
  if (adapterPlan.declaresWalletProviderContractTx === true) add(blockers, 'plan_declares_wallet_provider_contract_tx');
  if (adapterPlan.declaresHttpRoute === true) add(blockers, 'plan_declares_http_route');
  if (adapterPlan.declaresCli === true) add(blockers, 'plan_declares_cli');
  if (adapterPlan.declaresCronMainTrackingServiceWiring === true) add(blockers, 'plan_declares_cron_main_tracking_service_wiring');
};

const evaluateSafeRowSchemaPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterPlanPolicy | undefined,
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
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterPlanPolicy | undefined,
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
  sameHeadEvidence: TierUpdateActualSafeRowExportReadOnlyAdapterPlanSameHeadEvidence | undefined,
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
  operatorApproval: TierUpdateActualSafeRowExportReadOnlyAdapterPlanOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (operatorApproval.status === 'adapter_plan_approved') return 'approved';
  if (operatorApproval.status === 'pending' || operatorApproval.status === 'dry_run_bridge_approved') {
    add(missing, 'operator_adapter_plan_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput,
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
  dryRunBridgeStatus: string
): PlanStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || operatorApprovalStatus === 'pending' || dryRunBridgeStatus === 'NEEDS_REVIEW') return 'NEEDS_REVIEW';
  return 'ADAPTER_PLAN_READY';
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: PlanStatus
): NextSafeAction => {
  if (!input.dryRunBridge || blockers.has('dry_run_bridge_missing') || blockers.has('dry_run_bridge_blocked')) {
    return 'build_read_only_adapter_dry_run_bridge';
  }
  if (!input.adapterPlan || blockers.has('adapter_plan_missing')) return 'provide_read_only_adapter_plan';
  if (blockers.has('unsupported_adapter_method')) return 'remove_unsupported_adapter_method';
  if (blockers.has('unsupported_entity_requested') || blockers.has('deferred_entity_requested')) return 'remove_unsupported_entity';
  if (blockers.has('safe_row_schema_policy_missing')) return 'add_safe_row_schema_policy';
  if (blockers.has('forbidden_field_policy_missing')) return 'add_forbidden_field_policy';
  if (missing.has('operator_adapter_plan_approval_pending')) return 'collect_operator_adapter_plan_approval';
  if (status === 'ADAPTER_PLAN_READY') return 'prepare_pr_d8s_actual_safe_row_export_adapter_contract';
  return 'collect_operator_adapter_plan_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlyAdapterPlan = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput
): TierUpdateActualSafeRowExportReadOnlyAdapterPlan => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const dryRunBridgeStatus = evaluateDryRunBridge(input.dryRunBridge, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const methodSummary = evaluatePlannedMethods(input.adapterPlan, blockers, missing);
  evaluateExplicitPlanDeclarations(input.adapterPlan, blockers);
  inspectPlanShape(input.adapterPlan, blockers);
  const safeRowSchemaPolicyStatus = evaluateSafeRowSchemaPolicy(input.safeRowSchemaPolicy, blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status = determineStatus(blockers, missing, operatorApprovalStatus, dryRunBridgeStatus);
  const nextSafeAction = determineNextSafeAction(input, blockers, missing, status);

  return {
    planKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_PLAN_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_PLAN_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_PLAN_TRACE_LABEL,
    dryRunBridgeStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    plannedMethodNames: methodSummary.plannedMethodNames,
    plannedMethodCount: methodSummary.plannedMethodNames.length,
    forbiddenPlannedMethodCount: methodSummary.forbiddenPlannedMethodCount,
    compactForbiddenMethodCodes: methodSummary.compactForbiddenMethodCodes,
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
