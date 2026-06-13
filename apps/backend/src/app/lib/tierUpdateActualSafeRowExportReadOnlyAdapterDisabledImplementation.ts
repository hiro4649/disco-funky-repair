import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from './tierUpdateActualSafeRowExportDesignGate';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS
} from './tierUpdateActualSafeRowExportReadOnlyAdapterDesign';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterContract
} from './tierUpdateActualSafeRowExportReadOnlyAdapterContract';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DISABLED_IMPLEMENTATION_KIND =
  'tier_update_actual_safe_row_export_read_only_adapter_disabled_implementation' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DISABLED_IMPLEMENTATION_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DISABLED_IMPLEMENTATION_TRACE_LABEL =
  'd8t_actual_safe_row_export_read_only_adapter_disabled_implementation' as const;

type DisabledImplementationStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'DISABLED_IMPLEMENTATION_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'adapter_contract_approved'
  | 'disabled_implementation_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_adapter_contract'
  | 'provide_disabled_implementation_spec'
  | 'remove_unsupported_adapter_method'
  | 'remove_unsupported_entity'
  | 'add_disabled_execution_policy'
  | 'disable_actual_execution_flags'
  | 'collect_operator_disabled_implementation_approval'
  | 'prepare_pr_d8u_actual_safe_row_export_read_only_adapter_noop_execution_probe';

export type TierUpdateActualSafeRowExportReadOnlyAdapterDisabledExecutionPolicy = {
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

export type TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationSpec = {
  disabledMethodNames?: string[];
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
  retainsRequiredMetadata?: boolean;
  returnsDisabledSafeResultsOnly?: boolean;
  keepsReadinessClaimNone?: boolean;
  [key: string]: unknown;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput = {
  adapterContract?: TierUpdateActualSafeRowExportReadOnlyAdapterContract | null;
  implementationSpec?: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationSpec | null;
  requestedEntities?: string[];
  disabledExecutionPolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledExecutionPolicy | null;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationOperatorApproval;
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

export type TierUpdateActualSafeRowExportReadOnlyAdapterDisabledMethodResult = {
  status: 'DISABLED';
  safeSummaryOnly: true;
  methodName: string;
  rowCount: 0;
  rows: [];
  actualDbQueryEnabled: false;
  readinessClaim: 'none';
  disabledReasonCode: 'actual_db_query_disabled';
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterDisabledMethods = Record<
  typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS[number],
  () => TierUpdateActualSafeRowExportReadOnlyAdapterDisabledMethodResult
>;

export type TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation = {
  implementationKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DISABLED_IMPLEMENTATION_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DISABLED_IMPLEMENTATION_SCHEMA_VERSION;
  status: DisabledImplementationStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DISABLED_IMPLEMENTATION_TRACE_LABEL;
  adapterContractStatus: string;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    safeSummaryOnly: true;
  };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  disabledMethodNames: string[];
  disabledMethodCount: number;
  forbiddenMethodCount: number;
  compactForbiddenMethodCodes: string[];
  disabledExecutionPolicyStatus: 'present' | 'missing' | 'blocked';
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
  methodResultsSummary: Record<string, {
    status: 'DISABLED';
    rowCount: 0;
    actualDbQueryEnabled: false;
    readinessClaim: 'none';
    safeSummaryOnly: true;
  }>;
  adapterMethods: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledMethods;
  blockerCount: number;
  compactBlockerCodes: string[];
  missingRequirementCount: number;
  compactMissingRequirementCodes: string[];
  unsafeReasonCount: number;
  compactUnsafeReasonCodes: string[];
  retainedMetadataFields: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS;
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

const IMPLEMENTATION_FORBIDDEN_KEYS = [
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
  'contract',
  'tx',
  'rpc',
  'network',
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

const evaluateAdapterContract = (
  adapterContract: TierUpdateActualSafeRowExportReadOnlyAdapterContract | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!adapterContract) {
    add(blockers, 'adapter_contract_missing');
    add(missing, 'adapter_contract');
    return 'missing';
  }
  if (adapterContract.status === 'ADAPTER_CONTRACT_READY') return 'ADAPTER_CONTRACT_READY';
  if (adapterContract.status === 'NEEDS_REVIEW') {
    add(missing, 'adapter_contract_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'adapter_contract_blocked');
  return String(adapterContract.status || 'blocked');
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

const evaluateDisabledMethods = (
  implementationSpec: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationSpec | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { disabledMethodNames: string[]; forbiddenMethodCount: number; compactForbiddenMethodCodes: string[] } => {
  if (!implementationSpec) {
    add(blockers, 'implementation_spec_missing');
    add(missing, 'implementation_spec');
    return { disabledMethodNames: [], forbiddenMethodCount: 0, compactForbiddenMethodCodes: [] };
  }
  const disabledMethodNames = uniqueValues(implementationSpec.disabledMethodNames);
  if (disabledMethodNames.length === 0) add(missing, 'disabled_method_names_required');
  const forbidden = disabledMethodNames.filter((method) => !ALLOWED_METHOD_SET.has(method));
  if (forbidden.length > 0) add(blockers, 'unsupported_adapter_method');
  return {
    disabledMethodNames,
    forbiddenMethodCount: forbidden.length,
    compactForbiddenMethodCodes: compactCodes(forbidden.map((method) => `unsupported_method:${method}`))
  };
};

const inspectImplementationShape = (
  value: unknown,
  blockers: Set<string>,
  path = 'implementationSpec'
): void => {
  if (value === null || value === undefined) return;
  if (path.endsWith('.disabledMethodNames') || /\bdisabledMethodNames\[\d+\]$/.test(path)) return;
  if (typeof value === 'string') {
    const normalized = normalize(value);
    if (IMPLEMENTATION_FORBIDDEN_KEYS.some((key) => normalized.includes(key))) {
      add(blockers, `forbidden_implementation_value:${path}`);
    }
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectImplementationShape(entry, blockers, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) return;
  for (const [key, entry] of Object.entries(value)) {
    const normalizedKey = normalize(key);
    if (IMPLEMENTATION_FORBIDDEN_KEYS.some((forbiddenKey) => normalizedKey.includes(forbiddenKey))) {
      add(blockers, `forbidden_implementation_key:${normalizedKey}`);
    }
    inspectImplementationShape(entry, blockers, `${path}.${key}`);
  }
};

const evaluateExplicitImplementationDeclarations = (
  implementationSpec: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationSpec | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): void => {
  if (!implementationSpec) return;
  if (implementationSpec.declaresPrisma === true) add(blockers, 'implementation_declares_prisma');
  if (implementationSpec.declaresDatabaseClient === true) add(blockers, 'implementation_declares_database_client');
  if (implementationSpec.declaresRawQuery === true) add(blockers, 'implementation_declares_raw_query');
  if (implementationSpec.declaresSqlText === true) add(blockers, 'implementation_declares_sql_text');
  if (implementationSpec.declaresTransaction === true) add(blockers, 'implementation_declares_transaction');
  if (implementationSpec.declaresEnvRead === true) add(blockers, 'implementation_declares_env_read');
  if (implementationSpec.declaresDatabaseUrlRead === true) add(blockers, 'implementation_declares_database_url_read');
  if (implementationSpec.declaresFileWrite === true) add(blockers, 'implementation_declares_file_write');
  if (implementationSpec.declaresArtifactUpload === true) add(blockers, 'implementation_declares_artifact_upload');
  if (implementationSpec.declaresWalletProviderContractTx === true) {
    add(blockers, 'implementation_declares_wallet_provider_contract_tx');
  }
  if (implementationSpec.declaresHttpRoute === true) add(blockers, 'implementation_declares_http_route');
  if (implementationSpec.declaresCli === true) add(blockers, 'implementation_declares_cli');
  if (implementationSpec.declaresCronMainTrackingServiceWiring === true) {
    add(blockers, 'implementation_declares_cron_main_tracking_service_wiring');
  }
  if (implementationSpec.retainsRequiredMetadata !== true) add(missing, 'implementation_retains_required_metadata');
  if (implementationSpec.returnsDisabledSafeResultsOnly !== true) add(missing, 'implementation_returns_disabled_safe_results_only');
  if (implementationSpec.keepsReadinessClaimNone !== true) add(missing, 'implementation_keeps_readiness_claim_none');
};

const evaluateDisabledExecutionPolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledExecutionPolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' | 'blocked' => {
  if (!policy) {
    add(blockers, 'disabled_execution_policy_missing');
    add(missing, 'disabled_execution_policy');
    return 'missing';
  }
  const unsafeFlags = [
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
  const unsafe = unsafeFlags.filter((flag) => policy[flag] !== false);
  unsafe.forEach((flag) => add(blockers, `disabled_policy_${normalize(flag)}_not_false`));
  return unsafe.length > 0 ? 'blocked' : 'present';
};

const evaluateSameHeadEvidence = (
  sameHeadEvidence: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationSameHeadEvidence | undefined,
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
  operatorApproval: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (operatorApproval.status === 'disabled_implementation_approved') return 'approved';
  if (operatorApproval.status === 'pending' || operatorApproval.status === 'adapter_contract_approved') {
    add(missing, 'operator_disabled_implementation_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput,
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
  for (const flag of flagNames) {
    if (input[flag] === true) add(blockers, `${normalize(flag)}_forbidden`);
  }
};

const determineStatus = (
  blockers: Set<string>,
  missing: Set<string>,
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked',
  adapterContractStatus: string
): DisabledImplementationStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (missing.size > 0 || operatorApprovalStatus === 'pending' || adapterContractStatus === 'NEEDS_REVIEW') {
    return 'NEEDS_REVIEW';
  }
  return 'DISABLED_IMPLEMENTATION_READY';
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: DisabledImplementationStatus
): NextSafeAction => {
  if (!input.adapterContract || blockers.has('adapter_contract_missing') || blockers.has('adapter_contract_blocked')) {
    return 'build_actual_safe_row_export_read_only_adapter_contract';
  }
  if (!input.implementationSpec || blockers.has('implementation_spec_missing')) return 'provide_disabled_implementation_spec';
  if (blockers.has('unsupported_adapter_method')) return 'remove_unsupported_adapter_method';
  if (blockers.has('unsupported_entity_requested') || blockers.has('deferred_entity_requested')) return 'remove_unsupported_entity';
  if (blockers.has('disabled_execution_policy_missing')) return 'add_disabled_execution_policy';
  if (Array.from(blockers).some((code) => code.startsWith('disabled_policy_') || code.endsWith('_forbidden'))) {
    return 'disable_actual_execution_flags';
  }
  if (missing.has('operator_disabled_implementation_approval_pending')) {
    return 'collect_operator_disabled_implementation_approval';
  }
  if (status === 'DISABLED_IMPLEMENTATION_READY') {
    return 'prepare_pr_d8u_actual_safe_row_export_read_only_adapter_noop_execution_probe';
  }
  return 'collect_operator_disabled_implementation_approval';
};

const disabledResult = (methodName: string): TierUpdateActualSafeRowExportReadOnlyAdapterDisabledMethodResult => ({
  status: 'DISABLED',
  safeSummaryOnly: true,
  methodName,
  rowCount: 0,
  rows: [],
  actualDbQueryEnabled: false,
  readinessClaim: 'none',
  disabledReasonCode: 'actual_db_query_disabled'
});

const createDisabledMethods = (): TierUpdateActualSafeRowExportReadOnlyAdapterDisabledMethods => ({
  readScheduledTierUpdateSafeRows: () => disabledResult('readScheduledTierUpdateSafeRows'),
  readJobRunSafeRows: () => disabledResult('readJobRunSafeRows'),
  readTxReceiptEvidenceSafeRows: () => disabledResult('readTxReceiptEvidenceSafeRows'),
  readStagingEvidenceSafeRows: () => disabledResult('readStagingEvidenceSafeRows')
});

export const buildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput
): TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const adapterContractStatus = evaluateAdapterContract(input.adapterContract, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const methodSummary = evaluateDisabledMethods(input.implementationSpec, blockers, missing);
  evaluateExplicitImplementationDeclarations(input.implementationSpec, blockers, missing);
  inspectImplementationShape(input.implementationSpec, blockers);
  const disabledExecutionPolicyStatus = evaluateDisabledExecutionPolicy(input.disabledExecutionPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status = determineStatus(blockers, missing, operatorApprovalStatus, adapterContractStatus);
  const adapterMethods = createDisabledMethods();
  const methodResultsSummary = Object.fromEntries(
    TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS.map((methodName) => [
      methodName,
      {
        status: 'DISABLED' as const,
        rowCount: 0 as const,
        actualDbQueryEnabled: false as const,
        readinessClaim: 'none' as const,
        safeSummaryOnly: true as const
      }
    ])
  );

  return {
    implementationKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DISABLED_IMPLEMENTATION_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DISABLED_IMPLEMENTATION_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_DISABLED_IMPLEMENTATION_TRACE_LABEL,
    adapterContractStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    disabledMethodNames: methodSummary.disabledMethodNames,
    disabledMethodCount: methodSummary.disabledMethodNames.length,
    forbiddenMethodCount: methodSummary.forbiddenMethodCount,
    compactForbiddenMethodCodes: methodSummary.compactForbiddenMethodCodes,
    disabledExecutionPolicyStatus,
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
    methodResultsSummary,
    adapterMethods,
    blockerCount: compactBlockerCodes.length,
    compactBlockerCodes,
    missingRequirementCount: compactMissingRequirementCodes.length,
    compactMissingRequirementCodes,
    unsafeReasonCount: compactUnsafeReasonCodes.length,
    compactUnsafeReasonCodes,
    retainedMetadataFields: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS,
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
