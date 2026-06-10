import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from './tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportDryRunContract
} from './tierUpdateActualSafeRowExportDryRunContract';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DESIGN_KIND =
  'tier_update_actual_safe_row_export_read_only_adapter_design' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DESIGN_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DESIGN_TRACE_LABEL =
  'd8o_actual_safe_row_export_read_only_adapter_design' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_KIND =
  'read_only_safe_row_adapter_design' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS = [
  'readScheduledTierUpdateSafeRows',
  'readJobRunSafeRows',
  'readTxReceiptEvidenceSafeRows',
  'readStagingEvidenceSafeRows'
] as const;

type AdapterDesignStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'ADAPTER_DESIGN_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'adapter_design_approved'
  | 'design_approved'
  | 'dry_run_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_dry_run_contract'
  | 'provide_read_only_adapter_design'
  | 'remove_forbidden_adapter_method'
  | 'add_required_safe_row_metadata'
  | 'remove_unsupported_entity'
  | 'require_same_head_evidence'
  | 'collect_operator_adapter_design_approval'
  | 'prepare_pr_d8p_read_only_adapter_mock_implementation_boundary';

export type TierUpdateActualSafeRowExportReadOnlyAdapterDesignInput = {
  adapterKind?: string;
  safeSummaryOnly?: boolean;
  allowedMethodNames?: string[];
  declaredEntities?: string[];
  requiresSameHeadEvidence?: boolean;
  requiresOperatorApproval?: boolean;
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
  prismaClientEnabled?: boolean;
  fileExportEnabled?: boolean;
  artifactUploadEnabled?: boolean;
  dockerSmokeChanged?: boolean;
  stagingNoTxPassClaimed?: boolean;
  runtimeReadinessClaimed?: boolean;
  productionReadinessClaimed?: boolean;
  [key: string]: unknown;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterForbiddenFieldPolicy = {
  required?: boolean;
  blockedFields?: string[];
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportReadOnlyAdapterDesignInput = {
  dryRunContract?: TierUpdateActualSafeRowExportDryRunContract | null;
  adapterDesign?: TierUpdateActualSafeRowExportReadOnlyAdapterDesignInput | null;
  requestedEntities?: string[];
  requiredMetadataFields?: string[];
  forbiddenFieldPolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterForbiddenFieldPolicy;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlyAdapterSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlyAdapterOperatorApproval;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | Date | null;
  operatorId?: string | null;
  runKey?: string | null;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterDesign = {
  designKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DESIGN_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DESIGN_SCHEMA_VERSION;
  status: AdapterDesignStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DESIGN_TRACE_LABEL;
  dryRunContractStatus: string;
  adapterKind: string;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    safeSummaryOnly: true;
  };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  allowedMethodCount: number;
  forbiddenMethodCount: number;
  compactForbiddenMethodCodes: string[];
  requiredMetadataStatus: 'present' | 'missing';
  forbiddenFieldPolicyStatus: 'present' | 'missing';
  sameHeadEvidenceStatus: 'required' | 'blocked';
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked';
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
const ALLOWED_METHOD_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS);

const FORBIDDEN_METHOD_KEYS = [
  'query',
  'execute',
  'transaction',
  'raw',
  'rawQuery',
  'unsafeRaw',
  'findMany',
  'findFirst',
  'create',
  'update',
  'delete',
  'upsert',
  'connect',
  'disconnect',
  'prisma',
  'database',
  'db',
  'client',
  'pool',
  'connection',
  'readEnv',
  'readDatabaseUrl',
  'getDatabaseUrl',
  'readSecret',
  'writeFile',
  'createWriteStream',
  'uploadArtifact',
  'send',
  'broadcast',
  'tx',
  'wallet',
  'provider',
  'contract'
] as const;

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

const evaluateDryRunContract = (
  dryRunContract: TierUpdateActualSafeRowExportDryRunContract | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!dryRunContract) {
    add(blockers, 'dry_run_contract_missing');
    add(missing, 'dry_run_contract');
    return 'missing';
  }
  if (dryRunContract.status === 'DRY_RUN_READY') return 'DRY_RUN_READY';
  if (dryRunContract.status === 'NEEDS_REVIEW') {
    add(missing, 'dry_run_contract_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'dry_run_contract_blocked');
  return String(dryRunContract.status || 'blocked');
};

const inspectAdapterKeys = (
  adapterDesign: TierUpdateActualSafeRowExportReadOnlyAdapterDesignInput,
  forbidden: Set<string>,
  blockers: Set<string>
): void => {
  for (const key of Object.keys(adapterDesign)) {
    const normalizedKey = normalize(key);
    if (FORBIDDEN_METHOD_KEYS.some((forbiddenKey) => normalize(forbiddenKey) === normalizedKey)) {
      add(forbidden, `forbidden_adapter_key:${normalizedKey}`);
      add(blockers, 'forbidden_adapter_method');
    }
  }
};

const evaluateAdapterDesign = (
  adapterDesign: TierUpdateActualSafeRowExportReadOnlyAdapterDesignInput | null | undefined,
  forbidden: Set<string>,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!adapterDesign) {
    add(blockers, 'adapter_design_missing');
    add(missing, 'adapter_design');
    return 'missing';
  }
  inspectAdapterKeys(adapterDesign, forbidden, blockers);
  if (adapterDesign.adapterKind !== TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_KIND) add(blockers, 'adapter_kind_invalid');
  if (adapterDesign.safeSummaryOnly !== true) add(blockers, 'adapter_safe_summary_only_required');
  if (adapterDesign.requiresSameHeadEvidence !== true) add(blockers, 'adapter_requires_same_head_evidence');
  if (adapterDesign.requiresOperatorApproval !== true) add(blockers, 'adapter_requires_operator_approval');
  evaluateExecutionFlags(adapterDesign, blockers);
  return String(adapterDesign.adapterKind || 'missing');
};

const evaluateAdapterMethods = (
  methodNames: string[] | undefined,
  forbidden: Set<string>,
  blockers: Set<string>,
  missing: Set<string>
): { allowedMethodCount: number; forbiddenMethodCount: number } => {
  const provided = methodNames || [];
  if (provided.length === 0) {
    add(missing, 'adapter_methods_required');
    return { allowedMethodCount: 0, forbiddenMethodCount: 0 };
  }

  let allowedMethodCount = 0;
  let forbiddenMethodCount = 0;
  for (const methodName of provided) {
    const normalizedMethod = normalize(String(methodName));
    if (FORBIDDEN_METHOD_KEYS.some((forbiddenKey) => normalize(forbiddenKey) === normalizedMethod)) {
      forbiddenMethodCount += 1;
      add(forbidden, `forbidden_adapter_method:${normalizedMethod}`);
      add(blockers, 'forbidden_adapter_method');
      continue;
    }
    if (ALLOWED_METHOD_SET.has(String(methodName))) {
      allowedMethodCount += 1;
      continue;
    }
    forbiddenMethodCount += 1;
    add(forbidden, `unsupported_adapter_method:${normalizedMethod}`);
    add(blockers, 'unsupported_adapter_method');
  }
  return { allowedMethodCount, forbiddenMethodCount };
};

const evaluateEntities = (
  requestedEntities: string[] | undefined,
  declaredEntities: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { requestedCount: number; allowedCount: number; disallowedEntityCount: number } => {
  const requested = uniqueNormalized(requestedEntities);
  const declared = uniqueNormalized(declaredEntities);
  if (requested.length === 0) {
    add(missing, 'requested_entities_required');
  }

  const all = Array.from(new Set([...requested, ...declared]));
  const allowed = requested.filter((entity) => ALLOWED_ENTITY_SET.has(entity));
  const disallowed = all.filter((entity) => !ALLOWED_ENTITY_SET.has(entity));
  if (disallowed.length > 0) add(blockers, 'unsupported_entity');
  if (disallowed.some((entity) => DEFERRED_ENTITIES.has(entity))) add(blockers, 'deferred_entity');

  return {
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
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterForbiddenFieldPolicy | undefined,
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
  sameHeadEvidence: TierUpdateActualSafeRowExportReadOnlyAdapterSameHeadEvidence | undefined,
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
  operatorApproval: TierUpdateActualSafeRowExportReadOnlyAdapterOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (operatorApproval.status === 'adapter_design_approved') return 'approved';
  if (operatorApproval.status === 'pending' || operatorApproval.status === 'dry_run_approved') {
    add(missing, 'operator_adapter_design_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: Partial<TierUpdateActualSafeRowExportReadOnlyAdapterDesignInput>,
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

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterDesignInput,
  blockers: Set<string>,
  missing: Set<string>,
  forbidden: Set<string>,
  status: AdapterDesignStatus
): NextSafeAction => {
  if (!input.dryRunContract) return 'build_actual_safe_row_export_dry_run_contract';
  if (!input.adapterDesign) return 'provide_read_only_adapter_design';
  if (forbidden.size > 0 || blockers.has('forbidden_adapter_method') || blockers.has('unsupported_adapter_method')) {
    return 'remove_forbidden_adapter_method';
  }
  if (
    Array.from(blockers).some((code) => code.startsWith('metadata_missing')) ||
    Array.from(missing).some((code) => code.startsWith('metadata:'))
  ) return 'add_required_safe_row_metadata';
  if (blockers.has('unsupported_entity') || blockers.has('deferred_entity')) return 'remove_unsupported_entity';
  if (blockers.has('same_head_evidence_required')) return 'require_same_head_evidence';
  if (missing.has('operator_adapter_design_approval_pending')) return 'collect_operator_adapter_design_approval';
  if (status === 'ADAPTER_DESIGN_READY') return 'prepare_pr_d8p_read_only_adapter_mock_implementation_boundary';
  return 'collect_operator_adapter_design_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterDesignInput
): TierUpdateActualSafeRowExportReadOnlyAdapterDesign => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const forbidden = new Set<string>();

  const dryRunContractStatus = evaluateDryRunContract(input.dryRunContract, blockers, missing);
  const adapterKind = evaluateAdapterDesign(input.adapterDesign, forbidden, blockers, missing);
  const methodSummary = evaluateAdapterMethods(input.adapterDesign?.allowedMethodNames, forbidden, blockers, missing);
  const entitySummary = evaluateEntities(input.requestedEntities, input.adapterDesign?.declaredEntities, blockers, missing);
  const requiredMetadataStatus = evaluateRequiredMetadata(input.requiredMetadataFields, blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactForbiddenMethodCodes = compactCodes(forbidden);
  const status: AdapterDesignStatus = compactBlockerCodes.length > 0 || compactForbiddenMethodCodes.length > 0
    ? 'BLOCKED'
    : compactMissingRequirementCodes.length > 0
      ? 'NEEDS_REVIEW'
      : 'ADAPTER_DESIGN_READY';

  return {
    designKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DESIGN_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DESIGN_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DESIGN_TRACE_LABEL,
    dryRunContractStatus,
    adapterKind,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    allowedMethodCount: methodSummary.allowedMethodCount,
    forbiddenMethodCount: methodSummary.forbiddenMethodCount,
    compactForbiddenMethodCodes,
    requiredMetadataStatus,
    forbiddenFieldPolicyStatus,
    sameHeadEvidenceStatus,
    operatorApprovalStatus,
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
    nextSafeAction: determineNextSafeAction(input, blockers, missing, forbidden, status)
  };
};
