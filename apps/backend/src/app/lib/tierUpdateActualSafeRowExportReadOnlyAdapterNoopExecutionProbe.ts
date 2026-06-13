import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES
} from './tierUpdateActualSafeRowExportDesignGate';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS
} from './tierUpdateActualSafeRowExportReadOnlyAdapterDesign';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation,
  TierUpdateActualSafeRowExportReadOnlyAdapterDisabledMethodResult
} from './tierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_NOOP_EXECUTION_PROBE_KIND =
  'tier_update_actual_safe_row_export_read_only_adapter_noop_execution_probe' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_NOOP_EXECUTION_PROBE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_NOOP_EXECUTION_PROBE_TRACE_LABEL =
  'd8u_actual_safe_row_export_read_only_adapter_noop_execution_probe' as const;

type NoopProbeStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'NOOP_PROBE_READY';
type OperatorApprovalStatus =
  | 'pending'
  | 'disabled_implementation_approved'
  | 'noop_probe_approved'
  | 'execution_approved'
  | 'runtime_approved'
  | 'staging_ready'
  | 'production_ready'
  | string;
type NextSafeAction =
  | 'build_disabled_implementation_boundary'
  | 'add_noop_probe_policy'
  | 'remove_unsupported_probe_method'
  | 'remove_unsupported_entity'
  | 'ensure_disabled_stub_result_only'
  | 'replace_raw_error_with_safe_disabled_result'
  | 'collect_operator_noop_probe_approval'
  | 'prepare_pr_d8v_actual_safe_row_export_read_only_adapter_real_source_gate';

export type TierUpdateActualSafeRowExportReadOnlyAdapterNoopProbePolicy = {
  allowOnlyNoop?: boolean;
  probeMethodNames?: string[];
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

export type TierUpdateActualSafeRowExportReadOnlyAdapterNoopProbeSameHeadEvidence = {
  required?: boolean;
  headMatchStatus?: string;
};

export type TierUpdateActualSafeRowExportReadOnlyAdapterNoopProbeOperatorApproval = {
  required?: boolean;
  status?: OperatorApprovalStatus;
};

export type BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput = {
  disabledImplementation?: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation | null;
  requestedEntities?: string[];
  probePolicy?: TierUpdateActualSafeRowExportReadOnlyAdapterNoopProbePolicy | null;
  sameHeadEvidence?: TierUpdateActualSafeRowExportReadOnlyAdapterNoopProbeSameHeadEvidence;
  operatorApproval?: TierUpdateActualSafeRowExportReadOnlyAdapterNoopProbeOperatorApproval;
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

export type TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe = {
  probeKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_NOOP_EXECUTION_PROBE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_NOOP_EXECUTION_PROBE_SCHEMA_VERSION;
  status: NoopProbeStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_NOOP_EXECUTION_PROBE_TRACE_LABEL;
  disabledImplementationStatus: string;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    safeSummaryOnly: true;
  };
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  probedMethodNames: string[];
  probeMethodCount: number;
  probeResultCount: number;
  disabledResultCount: number;
  unexpectedRowResultCount: number;
  forbiddenMethodCount: number;
  compactForbiddenMethodCodes: string[];
  probePolicyStatus: 'present' | 'missing' | 'blocked';
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
    status: 'DISABLED' | 'BLOCKED';
    rowCount: number;
    actualDbQueryEnabled: boolean;
    readinessClaim: string;
    safeSummaryOnly: true;
  }>;
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

const ENTITY_TO_METHOD = {
  scheduled_tier_update: 'readScheduledTierUpdateSafeRows',
  job_run: 'readJobRunSafeRows',
  tx_receipt_evidence: 'readTxReceiptEvidenceSafeRows',
  staging_evidence: 'readStagingEvidenceSafeRows'
} as const;

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

const evaluateDisabledImplementation = (
  disabledImplementation: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): string => {
  if (!disabledImplementation) {
    add(blockers, 'disabled_implementation_missing');
    add(missing, 'disabled_implementation');
    return 'missing';
  }
  if (disabledImplementation.status === 'DISABLED_IMPLEMENTATION_READY') return 'DISABLED_IMPLEMENTATION_READY';
  if (disabledImplementation.status === 'NEEDS_REVIEW') {
    add(missing, 'disabled_implementation_needs_review');
    return 'NEEDS_REVIEW';
  }
  add(blockers, 'disabled_implementation_blocked');
  return String(disabledImplementation.status || 'blocked');
};

const evaluateRequestedEntities = (
  requestedEntities: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { requested: string[]; requestedCount: number; allowedCount: number; disallowedEntityCount: number } => {
  const requested = uniqueNormalized(requestedEntities);
  if (requested.length === 0) {
    add(missing, 'requested_entities_required');
    return { requested: [], requestedCount: 0, allowedCount: 0, disallowedEntityCount: 0 };
  }
  const allowed = requested.filter((entity) => ALLOWED_ENTITY_SET.has(entity));
  const disallowed = requested.filter((entity) => !ALLOWED_ENTITY_SET.has(entity));
  if (disallowed.length > 0) add(blockers, 'unsupported_entity_requested');
  if (disallowed.some((entity) => DEFERRED_ENTITIES.has(entity))) add(blockers, 'deferred_entity_requested');
  return {
    requested,
    requestedCount: requested.length,
    allowedCount: allowed.length,
    disallowedEntityCount: disallowed.length
  };
};

const evaluateProbePolicy = (
  policy: TierUpdateActualSafeRowExportReadOnlyAdapterNoopProbePolicy | null | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { status: 'present' | 'missing' | 'blocked'; methodNames: string[]; forbidden: string[] } => {
  if (!policy) {
    add(blockers, 'probe_policy_missing');
    add(missing, 'probe_policy');
    return { status: 'missing', methodNames: [], forbidden: [] };
  }
  if (policy.allowOnlyNoop !== true) add(blockers, 'probe_policy_allow_only_noop_required');
  const falseFlags = [
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
  falseFlags.forEach((flag) => {
    if (policy[flag] !== false) add(blockers, `probe_policy_${normalize(flag)}_not_false`);
  });
  const methodNames = uniqueValues(policy.probeMethodNames || [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS]);
  const forbidden = methodNames.filter((methodName) => !ALLOWED_METHOD_SET.has(methodName));
  if (forbidden.length > 0) add(blockers, 'unsupported_probe_method');
  return {
    status: blockers.has('probe_policy_allow_only_noop_required') || falseFlags.some((flag) => blockers.has(`probe_policy_${normalize(flag)}_not_false`))
      ? 'blocked'
      : 'present',
    methodNames,
    forbidden
  };
};

const evaluateSameHeadEvidence = (
  sameHeadEvidence: TierUpdateActualSafeRowExportReadOnlyAdapterNoopProbeSameHeadEvidence | undefined,
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
  operatorApproval: TierUpdateActualSafeRowExportReadOnlyAdapterNoopProbeOperatorApproval | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }
  if (operatorApproval.status === 'noop_probe_approved') return 'approved';
  if (operatorApproval.status === 'pending' || operatorApproval.status === 'disabled_implementation_approved') {
    add(missing, 'operator_noop_probe_approval_pending');
    return 'pending';
  }
  add(blockers, 'operator_approval_status_forbidden');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput,
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

const safeBlockedResult = (methodName: string): TierUpdateActualSafeRowExportReadOnlyAdapterDisabledMethodResult => ({
  status: 'DISABLED',
  safeSummaryOnly: true,
  methodName,
  rowCount: 0,
  rows: [],
  actualDbQueryEnabled: false,
  readinessClaim: 'none',
  disabledReasonCode: 'actual_db_query_disabled'
});

const probeMethods = (
  disabledImplementation: TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation | null | undefined,
  methodNames: string[],
  blockers: Set<string>,
  unsafe: Set<string>
): {
  methodResultsSummary: TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe['methodResultsSummary'];
  probeResultCount: number;
  disabledResultCount: number;
  unexpectedRowResultCount: number;
  probedMethodNames: string[];
} => {
  const summary: TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe['methodResultsSummary'] = {};
  let probeResultCount = 0;
  let disabledResultCount = 0;
  let unexpectedRowResultCount = 0;
  const probedMethodNames: string[] = [];

  if (!disabledImplementation || disabledImplementation.status !== 'DISABLED_IMPLEMENTATION_READY') {
    return { methodResultsSummary: summary, probeResultCount, disabledResultCount, unexpectedRowResultCount, probedMethodNames };
  }

  methodNames.forEach((methodName) => {
    if (!ALLOWED_METHOD_SET.has(methodName)) return;
    const method = disabledImplementation.adapterMethods?.[
      methodName as keyof typeof disabledImplementation.adapterMethods
    ];
    probedMethodNames.push(methodName);
    if (typeof method !== 'function') {
      add(blockers, `disabled_method_missing:${methodName}`);
      summary[methodName] = {
        status: 'BLOCKED',
        rowCount: 0,
        actualDbQueryEnabled: false,
        readinessClaim: 'none',
        safeSummaryOnly: true
      };
      return;
    }
    let result = safeBlockedResult(methodName);
    try {
      result = method();
    } catch {
      add(blockers, `disabled_method_raw_error:${methodName}`);
    }
    probeResultCount += 1;
    if (result.status === 'DISABLED') disabledResultCount += 1;
    const rowCount = Array.isArray(result.rows) ? result.rows.length : Number(result.rowCount || 0);
    if (rowCount > 0) {
      unexpectedRowResultCount += rowCount;
      add(blockers, `disabled_method_returned_rows:${methodName}`);
    }
    const actualDbQueryEnabled = (result as { actualDbQueryEnabled?: unknown }).actualDbQueryEnabled === true;
    if (actualDbQueryEnabled) add(blockers, `disabled_method_actual_db_query_enabled:${methodName}`);
    if (result.readinessClaim !== 'none') add(blockers, `disabled_method_readiness_claim:${methodName}`);
    if (result.safeSummaryOnly !== true) add(unsafe, `disabled_method_safe_summary_only_missing:${methodName}`);
    summary[methodName] = {
      status: result.status === 'DISABLED' ? 'DISABLED' : 'BLOCKED',
      rowCount,
      actualDbQueryEnabled,
      readinessClaim: String(result.readinessClaim || 'unknown'),
      safeSummaryOnly: true
    };
  });

  return { methodResultsSummary: summary, probeResultCount, disabledResultCount, unexpectedRowResultCount, probedMethodNames };
};

const determineStatus = (
  blockers: Set<string>,
  missing: Set<string>,
  unsafe: Set<string>,
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked',
  disabledImplementationStatus: string
): NoopProbeStatus => {
  if (blockers.size > 0 || unsafe.size > 0) return 'BLOCKED';
  if (missing.size > 0 || operatorApprovalStatus === 'pending' || disabledImplementationStatus === 'NEEDS_REVIEW') {
    return 'NEEDS_REVIEW';
  }
  return 'NOOP_PROBE_READY';
};

const determineNextSafeAction = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput,
  blockers: Set<string>,
  missing: Set<string>,
  status: NoopProbeStatus
): NextSafeAction => {
  if (!input.disabledImplementation || blockers.has('disabled_implementation_missing') || blockers.has('disabled_implementation_blocked')) {
    return 'build_disabled_implementation_boundary';
  }
  if (blockers.has('probe_policy_missing')) return 'add_noop_probe_policy';
  if (blockers.has('unsupported_probe_method')) return 'remove_unsupported_probe_method';
  if (blockers.has('unsupported_entity_requested') || blockers.has('deferred_entity_requested')) return 'remove_unsupported_entity';
  if (Array.from(blockers).some((code) => code.includes('returned_rows'))) return 'ensure_disabled_stub_result_only';
  if (Array.from(blockers).some((code) => code.includes('raw_error'))) return 'replace_raw_error_with_safe_disabled_result';
  if (missing.has('operator_noop_probe_approval_pending')) return 'collect_operator_noop_probe_approval';
  if (status === 'NOOP_PROBE_READY') return 'prepare_pr_d8v_actual_safe_row_export_read_only_adapter_real_source_gate';
  return 'collect_operator_noop_probe_approval';
};

export const buildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe = (
  input: BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput
): TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe => {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const disabledImplementationStatus = evaluateDisabledImplementation(input.disabledImplementation, blockers, missing);
  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const policySummary = evaluateProbePolicy(input.probePolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const methodNamesFromEntities = entitySummary.requested
    .filter((entity): entity is keyof typeof ENTITY_TO_METHOD => entity in ENTITY_TO_METHOD)
    .map((entity) => ENTITY_TO_METHOD[entity]);
  const methodNames = policySummary.methodNames.length > 0 ? policySummary.methodNames : methodNamesFromEntities;
  const methodSummary = probeMethods(input.disabledImplementation, methodNames, blockers, unsafe);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status = determineStatus(blockers, missing, unsafe, operatorApprovalStatus, disabledImplementationStatus);

  return {
    probeKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_NOOP_EXECUTION_PROBE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_NOOP_EXECUTION_PROBE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_ADAPTER_NOOP_EXECUTION_PROBE_TRACE_LABEL,
    disabledImplementationStatus,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      safeSummaryOnly: true
    },
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    probedMethodNames: methodSummary.probedMethodNames,
    probeMethodCount: methodSummary.probedMethodNames.length,
    probeResultCount: methodSummary.probeResultCount,
    disabledResultCount: methodSummary.disabledResultCount,
    unexpectedRowResultCount: methodSummary.unexpectedRowResultCount,
    forbiddenMethodCount: policySummary.forbidden.length,
    compactForbiddenMethodCodes: compactCodes(policySummary.forbidden.map((method) => `unsupported_method:${method}`)),
    probePolicyStatus: policySummary.status,
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
    methodResultsSummary: methodSummary.methodResultsSummary,
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
