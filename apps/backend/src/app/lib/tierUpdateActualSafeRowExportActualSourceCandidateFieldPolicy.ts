import {
  TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT
} from './tierUpdateSafeDbReadExport';
import {
  containsUnsafeSafeSummaryString,
  inspectPropertyPresence,
  isPlainDataRecord,
  isSafeLowerToken,
  isSafeSourceHeadSha,
  normalizeAllowlistedReviewReasons,
  normalizeGenericBlockerPresence,
  readDenseOwnDataArray,
  readOwnDataProperty,
  reduceForbiddenBooleanFlags,
  strictOrderedStringArrayEqual
} from './tierUpdateActualSafeRowExportSafeValidationKernel';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_KIND =
  'tier_update_actual_safe_row_export_actual_source_candidate_field_policy' as const;
export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_TRACE_LABEL =
  'd8ar_actual_safe_row_export_actual_source_candidate_field_policy' as const;
export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_SKILL_PROFILE =
  'FUNKY_NO_TX_NO_RUNTIME_PROFILE' as const;
export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_SCHEMA_VERSION = 1 as const;

const ALLOWED_POLICY_MODES = [
  'field_policy_only',
  'allowlist_classification_only',
  'review_only_field_policy'
] as const;

const FORBIDDEN_POLICY_MODES = [
  'execute',
  'query',
  'read_source',
  'db_read',
  'export',
  'jsonl_export',
  'file_write',
  'artifact_upload',
  'runtime',
  'worker',
  'cron',
  'route',
  'cli',
  'docker_smoke',
  'staging',
  'production'
] as const;

const FORBIDDEN_OVERRIDE_PROPERTIES = [
  'fieldPolicies',
  'allowedFieldsByEntity',
  'requiredFieldsByEntity',
  'optionalFieldsByEntity',
  'forbiddenFieldsByEntity',
  'maskedFieldsByEntity',
  'hashedFieldsByEntity',
  'actualRows',
  'rawRows',
  'dbRows',
  'sourceRows',
  'records',
  'jsonlLines',
  'filePath',
  'outputPath',
  'artifactName',
  'sql',
  'query',
  'rawPayload',
  'endpoint',
  'prisma',
  'databaseClient',
  'readOnlySource'
] as const;

const FORBIDDEN_BOUNDARY_FLAGS = [
  'actualDbQueryEnabled',
  'realDbQueryEnabled',
  'actualDbExportEnabled',
  'sourceAccessEnabled',
  'sourceAdapterExecutionEnabled',
  'readOnlySourceInvocationEnabled',
  'prismaClientEnabled',
  'prismaClientConstructed',
  'prismaDelegateCallEnabled',
  'databaseUrlReadEnabled',
  'envReadEnabled',
  'networkAccessEnabled',
  'rpcAccessEnabled',
  'providerConstructionEnabled',
  'walletAccessEnabled',
  'contractAccessEnabled',
  'txSendEnabled',
  'fileExportEnabled',
  'jsonlFileSerializationEnabled',
  'jsonlFileWriteEnabled',
  'artifactUploadEnabled',
  'downloadableArtifactCreated',
  'dockerSmokeChanged',
  'stagingRolloutEnabled',
  'stagingNoTxPassClaimed',
  'runtimeReadinessClaimed',
  'productionReadinessClaimed',
  'mainnetReadinessClaimed'
] as const;

const REQUIRED_ACKS = [
  'canonicalAllowlistRequired',
  'fieldClassificationCompleteRequired',
  'rawValueDefaultDenied',
  'boundedRowPolicyRequired',
  'stableSortPolicyRequired',
  'sameHeadRequirementPreserved',
  'futureOwnerApprovalRequired'
] as const;

const SAFE_REVIEW_REASONS = [
  'safe_subset_requested',
  'optional_policy_description_absent',
  'stable_sort_note_incomplete'
] as const;

type CanonicalEntity = typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES[number];
type DeferredEntity = typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES[number];
type D8ARStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_READY';
type PolicyMode = typeof ALLOWED_POLICY_MODES[number];
type FieldHandling =
  | 'derived_audit_identifier'
  | 'presence_summary'
  | 'masked_identity_summary'
  | 'hash_summary'
  | 'safe_token'
  | 'safe_enum'
  | 'safe_boolean'
  | 'bounded_integer'
  | 'timestamp_summary'
  | 'public_chain_hash_summary'
  | 'public_chain_address_summary'
  | 'public_chain_number_summary'
  | 'safe_json_summary'
  | 'fixed_boundary_value';

type FieldClassificationSpec = {
  handling: FieldHandling;
  targetSafeField: string;
  rawSourceValueEmissionAllowed: boolean;
  nullable?: boolean;
  publicChainEvidence?: boolean;
  constraints?: readonly (string | number | boolean | null)[];
  notesCode: string;
};

export type ActualSourceCandidateFieldPolicyEntry = FieldClassificationSpec & {
  sourceField: string;
};

type FieldClassificationByEntity = Record<CanonicalEntity, Record<string, FieldClassificationSpec>>;

type StableSortPolicyByEntity = Record<CanonicalEntity, readonly string[]>;

export type BuildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicyInput = {
  policyId?: unknown;
  sourceHeadSha?: unknown;
  requestedEntities?: unknown;
  policyMode?: unknown;
  canonicalAllowlistRequired?: unknown;
  fieldClassificationCompleteRequired?: unknown;
  rawValueDefaultDenied?: unknown;
  boundedRowPolicyRequired?: unknown;
  stableSortPolicyRequired?: unknown;
  sameHeadRequirementPreserved?: unknown;
  futureOwnerApprovalRequired?: unknown;
  blockers?: unknown;
  needsReviewReasons?: unknown;
  nextSafeAction?: unknown;
  boundarySummary?: unknown;
  boundaryFlags?: unknown;
} & Partial<Record<typeof FORBIDDEN_BOUNDARY_FLAGS[number], unknown>>;

export type TierUpdateActualSafeRowExportActualSourceCandidateFieldPolicyResult = {
  status: D8ARStatus;
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_KIND;
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_TRACE_LABEL;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_SCHEMA_VERSION;
  skillProfileId: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_SKILL_PROFILE;
  policyId: string | null;
  sourceHeadSha: string | null;
  policyMode: PolicyMode | null;
  safeSummaryOnly: true;
  contractOnly: true;
  noActualAccess: true;
  implementationConformanceClaimed: false;
  allowedEntities: readonly CanonicalEntity[];
  deferredEntities: readonly DeferredEntity[];
  canonicalFieldsByEntity: Partial<Record<CanonicalEntity, readonly string[]>>;
  fieldPoliciesByEntity: Partial<Record<CanonicalEntity, readonly ActualSourceCandidateFieldPolicyEntry[]>>;
  fieldCoverageSummary: {
    entityCount: number;
    canonicalFieldCount: number;
    classifiedFieldCount: number;
    missingClassificationCount: number;
    extraClassificationCount: number;
    duplicateClassificationCount: number;
    safeSummaryOnly: true;
  };
  rawDirectEmissionFieldCount: number;
  summaryOnlyFieldCount: number;
  derivedFieldCount: number;
  hardMaxRowsPerEntity: typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT;
  stableSortPolicyByEntity: Partial<StableSortPolicyByEntity>;
  rowIdPolicy: 'sha256_source_identity_v1';
  sourceHashPolicy: 'sha256_canonical_safe_projection_v1';
  boundarySummary: Record<typeof FORBIDDEN_BOUNDARY_FLAGS[number], false>;
  runtimeReadinessClaimed: false;
  productionReadinessClaimed: false;
  stagingNoTxPassClaimed: false;
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  nextSafeAction: 'prepare_pr_d8as_actual_source_candidate_redaction_contract'
    | 'remove_forbidden_actual_source_policy_input'
    | 'provide_actual_source_candidate_field_policy_requirements'
    | 'remove_deferred_or_unknown_entity'
    | 'restore_canonical_entity_and_field_policy_coverage'
    | 'remove_unsafe_raw_value_emission_policy';
};

const canonicalEntityList = [...TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES] as CanonicalEntity[];
const deferredEntityList = [...TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES] as DeferredEntity[];
const canonicalEntitySet = new Set<string>(canonicalEntityList);
const deferredEntitySet = new Set<string>(deferredEntityList);

const isSafeTargetField = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(value);

const field = (
  handling: FieldHandling,
  targetSafeField: string,
  rawSourceValueEmissionAllowed: boolean,
  notesCode: string,
  extra: Omit<FieldClassificationSpec, 'handling' | 'targetSafeField' | 'rawSourceValueEmissionAllowed' | 'notesCode'> = {}
): FieldClassificationSpec => ({
  handling,
  targetSafeField,
  rawSourceValueEmissionAllowed,
  notesCode,
  ...extra
});

const FIELD_CLASSIFICATION: FieldClassificationByEntity = {
  scheduled_tier_update: {
    id: field('derived_audit_identifier', 'row_id', false, 'raw_db_primary_key_not_emitted'),
    userId: field('masked_identity_summary', 'user_identity_summary', false, 'user_identity_masked'),
    scheduledAt: field('timestamp_summary', 'scheduled_at_summary', false, 'timestamp_summary_only'),
    expectedTier: field('bounded_integer', 'expected_tier', true, 'tier_value_bounded', { constraints: [0, 30, 180, 360, 720] }),
    currentTier: field('bounded_integer', 'current_tier', true, 'tier_value_bounded', { constraints: [0, 30, 180, 360, 720] }),
    processed: field('safe_boolean', 'processed', true, 'safe_boolean_scalar'),
    status: field('safe_enum', 'status', true, 'scheduled_status_allowlist', { constraints: ['PENDING', 'CLAIMED', 'TX_SENT', 'CONFIRMED', 'FAILED', 'TIMED_OUT', 'MANUAL_REVIEW', 'CANCELED'] }),
    attempt: field('bounded_integer', 'attempt', true, 'nonnegative_integer'),
    maxAttempts: field('bounded_integer', 'max_attempts', true, 'positive_bounded_integer'),
    lockedBy: field('masked_identity_summary', 'locked_by_summary', false, 'worker_identity_masked', { nullable: true }),
    lockedAt: field('timestamp_summary', 'locked_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    heartbeatAt: field('timestamp_summary', 'heartbeat_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    lockExpiresAt: field('timestamp_summary', 'lock_expires_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    batchId: field('hash_summary', 'batch_id_summary', false, 'batch_identifier_hash_summary', { nullable: true }),
    txHash: field('public_chain_hash_summary', 'tx_hash_summary', false, 'public_chain_hash_summary', { nullable: true, publicChainEvidence: true }),
    txChainId: field('bounded_integer', 'tx_chain_id', true, 'supported_chain_id_or_null', { nullable: true, publicChainEvidence: true, constraints: [56, 97, null] }),
    txContractAddress: field('public_chain_address_summary', 'tx_contract_address_summary', false, 'public_chain_address_summary', { nullable: true, publicChainEvidence: true }),
    txFrom: field('public_chain_address_summary', 'tx_from_summary', false, 'public_chain_address_summary', { nullable: true, publicChainEvidence: true }),
    txTo: field('public_chain_address_summary', 'tx_to_summary', false, 'public_chain_address_summary', { nullable: true, publicChainEvidence: true }),
    txBlockNumber: field('public_chain_number_summary', 'tx_block_number_summary', false, 'public_chain_number_summary', { nullable: true, publicChainEvidence: true }),
    txReceiptStatus: field('safe_enum', 'tx_receipt_status', true, 'receipt_status_allowlist', { nullable: true, publicChainEvidence: true, constraints: [0, 1, null] }),
    txReceiptTimestamp: field('timestamp_summary', 'tx_receipt_timestamp_summary', false, 'timestamp_summary_only', { nullable: true, publicChainEvidence: true }),
    txGasUsed: field('public_chain_number_summary', 'tx_gas_used_summary', false, 'public_chain_number_summary', { nullable: true, publicChainEvidence: true }),
    sentAt: field('timestamp_summary', 'sent_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    confirmedAt: field('timestamp_summary', 'confirmed_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    failedAt: field('timestamp_summary', 'failed_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    safeErrorKind: field('safe_token', 'safe_error_kind', true, 'safe_error_kind_token', { nullable: true }),
    safeSummary: field('safe_json_summary', 'safe_summary', false, 'safe_json_summary_only', { nullable: true })
  },
  job_run: {
    id: field('derived_audit_identifier', 'row_id', false, 'raw_db_primary_key_not_emitted'),
    jobName: field('safe_token', 'job_name', true, 'bounded_safe_token'),
    runKey: field('hash_summary', 'run_key_summary', false, 'run_key_hash_summary'),
    status: field('safe_enum', 'job_status', true, 'job_status_allowlist', { constraints: ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'TIMED_OUT', 'MANUAL_REVIEW', 'CANCELED'] }),
    startedAt: field('timestamp_summary', 'started_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    finishedAt: field('timestamp_summary', 'finished_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    heartbeatAt: field('timestamp_summary', 'heartbeat_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    attempt: field('bounded_integer', 'attempt', true, 'nonnegative_integer'),
    maxAttempts: field('bounded_integer', 'max_attempts', true, 'positive_bounded_integer'),
    lockedBy: field('masked_identity_summary', 'locked_by_summary', false, 'worker_identity_masked', { nullable: true }),
    checkpoint: field('safe_json_summary', 'checkpoint_summary', false, 'safe_json_summary_only', { nullable: true }),
    safeErrorKind: field('safe_token', 'safe_error_kind', true, 'safe_error_kind_token', { nullable: true }),
    safeSummary: field('safe_json_summary', 'safe_summary', false, 'safe_json_summary_only', { nullable: true })
  },
  tx_receipt_evidence: {
    txHash: field('public_chain_hash_summary', 'tx_hash_summary', false, 'public_chain_hash_summary', { publicChainEvidence: true }),
    txChainId: field('bounded_integer', 'tx_chain_id', true, 'supported_chain_id_or_null', { nullable: true, publicChainEvidence: true, constraints: [56, 97, null] }),
    txContractAddress: field('public_chain_address_summary', 'tx_contract_address_summary', false, 'public_chain_address_summary', { nullable: true, publicChainEvidence: true }),
    txFrom: field('public_chain_address_summary', 'tx_from_summary', false, 'public_chain_address_summary', { nullable: true, publicChainEvidence: true }),
    txTo: field('public_chain_address_summary', 'tx_to_summary', false, 'public_chain_address_summary', { nullable: true, publicChainEvidence: true }),
    txBlockNumber: field('public_chain_number_summary', 'tx_block_number_summary', false, 'public_chain_number_summary', { nullable: true, publicChainEvidence: true }),
    txReceiptStatus: field('safe_enum', 'tx_receipt_status', true, 'receipt_status_allowlist', { nullable: true, publicChainEvidence: true, constraints: [0, 1, null] }),
    confirmationDepth: field('bounded_integer', 'confirmation_depth', true, 'nonnegative_integer', { nullable: true, publicChainEvidence: true }),
    finalityStatus: field('safe_enum', 'finality_status', true, 'finality_status_allowlist', { nullable: true, publicChainEvidence: true, constraints: ['pending', 'confirmed', 'finalized', 'failed', 'manual_review', null] }),
    lastCheckedAt: field('timestamp_summary', 'last_checked_at_summary', false, 'timestamp_summary_only', { nullable: true }),
    safeErrorKind: field('safe_token', 'safe_error_kind', true, 'safe_error_kind_token', { nullable: true }),
    reconciliationStatus: field('safe_enum', 'reconciliation_status', true, 'reconciliation_status_allowlist', { nullable: true, constraints: ['confirmed', 'failed', 'manual_review', 'pending', 'skipped', null] }),
    manualReviewReason: field('safe_token', 'manual_review_reason', true, 'safe_reason_code_only', { nullable: true }),
    resumeKey: field('hash_summary', 'resume_key_summary', false, 'resume_key_hash_summary', { nullable: true })
  },
  staging_evidence: {
    stagingNoTxPreflightStatus: field('fixed_boundary_value', 'stagingNoTxPreflightStatus', false, 'blocked_only', { constraints: ['BLOCKED'] }),
    readinessClaim: field('fixed_boundary_value', 'readinessClaim', false, 'none_only', { constraints: ['none'] }),
    noTxExecution: field('safe_boolean', 'noTxExecution', true, 'required_true_boolean', { constraints: [true] }),
    noFundedTx: field('safe_boolean', 'noFundedTx', true, 'required_true_boolean', { constraints: [true] }),
    noMint: field('safe_boolean', 'noMint', true, 'required_true_boolean', { constraints: [true] }),
    noSendToWallet: field('safe_boolean', 'noSendToWallet', true, 'required_true_boolean', { constraints: [true] }),
    noGovernanceTx: field('safe_boolean', 'noGovernanceTx', true, 'required_true_boolean', { constraints: [true] }),
    noTierUpdaterTx: field('safe_boolean', 'noTierUpdaterTx', true, 'required_true_boolean', { constraints: [true] }),
    noDeploy: field('safe_boolean', 'noDeploy', true, 'required_true_boolean', { constraints: [true] }),
    noStagingRollout: field('safe_boolean', 'noStagingRollout', true, 'required_true_boolean', { constraints: [true] }),
    noRpcUrlEnvReading: field('safe_boolean', 'noRpcUrlEnvReading', true, 'required_true_boolean', { constraints: [true] }),
    noProviderConstruction: field('safe_boolean', 'noProviderConstruction', true, 'required_true_boolean', { constraints: [true] }),
    noWalletConstruction: field('safe_boolean', 'noWalletConstruction', true, 'required_true_boolean', { constraints: [true] }),
    noContractConstruction: field('safe_boolean', 'noContractConstruction', true, 'required_true_boolean', { constraints: [true] }),
    noAutoStart: field('safe_boolean', 'noAutoStart', true, 'required_true_boolean', { constraints: [true] }),
    noCronWiring: field('safe_boolean', 'noCronWiring', true, 'required_true_boolean', { constraints: [true] }),
    noMainAutoStart: field('safe_boolean', 'noMainAutoStart', true, 'required_true_boolean', { constraints: [true] }),
    noTrackingServiceAutoStart: field('safe_boolean', 'noTrackingServiceAutoStart', true, 'required_true_boolean', { constraints: [true] }),
    safeOutputOnly: field('safe_boolean', 'safeOutputOnly', true, 'required_true_boolean', { constraints: [true] })
  }
};

const STABLE_SORT_POLICY_BY_ENTITY: StableSortPolicyByEntity = {
  scheduled_tier_update: ['scheduledAt', 'id'],
  job_run: ['startedAt', 'id'],
  tx_receipt_evidence: ['lastCheckedAt', 'txHash'],
  staging_evidence: ['audit_export_id']
};

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};

const countCanonicalFields = (): number => canonicalEntityList.reduce(
  (total, entity) => total + TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST[entity].length,
  0
);

const copyCanonicalFieldsByEntity = (): Record<CanonicalEntity, readonly string[]> => ({
  scheduled_tier_update: [...TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST.scheduled_tier_update],
  job_run: [...TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST.job_run],
  tx_receipt_evidence: [...TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST.tx_receipt_evidence],
  staging_evidence: [...TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST.staging_evidence]
});

const buildFieldPoliciesByEntity = (): Record<CanonicalEntity, ActualSourceCandidateFieldPolicyEntry[]> => {
  const result = {} as Record<CanonicalEntity, ActualSourceCandidateFieldPolicyEntry[]>;
  for (const entity of canonicalEntityList) {
    result[entity] = TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST[entity].map((sourceField) => ({
      sourceField,
      ...FIELD_CLASSIFICATION[entity][sourceField]
    }));
  }
  return result;
};

const collectCoverage = (): {
  missing: string[];
  extra: string[];
  duplicate: string[];
  classifiedCount: number;
} => {
  const missing: string[] = [];
  const extra: string[] = [];
  const duplicate: string[] = [];
  let classifiedCount = 0;

  for (const entity of canonicalEntityList) {
    const canonicalFields = TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST[entity];
    const canonicalSet = new Set(canonicalFields);
    const seen = new Set<string>();
    const classifications = FIELD_CLASSIFICATION[entity] ?? {};

    for (const canonicalField of canonicalFields) {
      const classification = classifications[canonicalField];
      if (!classification) {
        missing.push(`${entity}.${canonicalField}`);
      } else {
        classifiedCount += 1;
        if (seen.has(canonicalField)) duplicate.push(`${entity}.${canonicalField}`);
        seen.add(canonicalField);
      }
    }

    for (const key of Object.keys(classifications)) {
      if (!canonicalSet.has(key)) extra.push(`${entity}.${key}`);
    }
  }

  return { missing, extra, duplicate, classifiedCount };
};

const validateFieldPolicies = (blockers: Set<string>, unsafe: Set<string>): void => {
  for (const entity of canonicalEntityList) {
    for (const [sourceField, policy] of Object.entries(FIELD_CLASSIFICATION[entity])) {
      if (!isSafeTargetField(policy.targetSafeField)) {
        add(blockers, `unsafe_target_field:${entity}.${sourceField}`);
        add(unsafe, 'unsafe_target_field');
      }
      if (containsUnsafeSafeSummaryString(policy)) {
        add(blockers, `unsafe_field_policy:${entity}.${sourceField}`);
        add(unsafe, 'unsafe_field_policy');
      }
      if (
        policy.rawSourceValueEmissionAllowed === true &&
        !['safe_token', 'safe_enum', 'safe_boolean', 'bounded_integer'].includes(policy.handling)
      ) {
        add(blockers, `unsafe_raw_emission_policy:${entity}.${sourceField}`);
        add(unsafe, 'unsafe_raw_emission_policy');
      }
    }
  }
};

const normalizeRequestedEntities = (
  value: unknown,
  blockers: Set<string>,
  review: Set<string>
): CanonicalEntity[] => {
  const array = readDenseOwnDataArray(value, {
    maxLength: canonicalEntityList.length,
    minLength: 1,
    validateItem: (item): item is string => typeof item === 'string'
  });
  if (!array.ok) {
    add(blockers, 'requested_entities_malformed');
    return [];
  }

  const seen = new Set<string>();
  let hasInvalid = false;
  const requested: CanonicalEntity[] = [];
  for (const entity of array.values) {
    if (seen.has(entity)) {
      add(blockers, 'requested_entities_duplicate');
      hasInvalid = true;
    }
    seen.add(entity);
    if (deferredEntitySet.has(entity)) {
      add(blockers, 'deferred_entity_requested');
      hasInvalid = true;
    } else if (!canonicalEntitySet.has(entity)) {
      add(blockers, 'unknown_entity_requested');
      hasInvalid = true;
    } else {
      requested.push(entity as CanonicalEntity);
    }
  }

  if (!hasInvalid && !strictOrderedStringArrayEqual(array.values, canonicalEntityList)) {
    const subset = array.values.every((entity) => canonicalEntitySet.has(entity));
    if (subset && array.values.length < canonicalEntityList.length) add(review, 'safe_subset_requested');
    else add(blockers, 'requested_entities_wrong_order');
  }

  return requested;
};

const forbiddenPropertyPresent = (input: Record<string, unknown>, key: string): boolean => {
  const presence = inspectPropertyPresence(input, key);
  return presence !== 'absent';
};

const collectForbiddenPropertyPresence = (input: Record<string, unknown>, blockers: Set<string>): void => {
  for (const key of FORBIDDEN_OVERRIDE_PROPERTIES) {
    if (forbiddenPropertyPresent(input, key)) add(blockers, `forbidden_input_property:${key}`);
  }
};

const collectRequiredAcknowledgements = (input: Record<string, unknown>, blockers: Set<string>): void => {
  for (const key of REQUIRED_ACKS) {
    if (readOwnDataProperty(input, key) !== true) add(blockers, `${key}_required`);
  }
};

const fixedFalseBoundarySummary = (): Record<typeof FORBIDDEN_BOUNDARY_FLAGS[number], false> => {
  const summary = {} as Record<typeof FORBIDDEN_BOUNDARY_FLAGS[number], false>;
  for (const flag of FORBIDDEN_BOUNDARY_FLAGS) summary[flag] = false;
  return summary;
};

const classifyStatus = (
  blockers: Set<string>,
  review: Set<string>
): D8ARStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (review.size > 0) return 'NEEDS_REVIEW';
  return 'ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_READY';
};

const selectNextSafeAction = (
  status: D8ARStatus,
  blockers: Set<string>
): TierUpdateActualSafeRowExportActualSourceCandidateFieldPolicyResult['nextSafeAction'] => {
  if (status === 'ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_READY') {
    return 'prepare_pr_d8as_actual_source_candidate_redaction_contract';
  }
  if (Array.from(blockers).some((code) => code.startsWith('forbidden_input_property'))) {
    return 'remove_forbidden_actual_source_policy_input';
  }
  if (blockers.has('deferred_entity_requested') || blockers.has('unknown_entity_requested')) {
    return 'remove_deferred_or_unknown_entity';
  }
  if (Array.from(blockers).some((code) => code.includes('classification') || code.includes('canonical') || code.includes('requested_entities'))) {
    return 'restore_canonical_entity_and_field_policy_coverage';
  }
  if (Array.from(blockers).some((code) => code.includes('raw_emission'))) {
    return 'remove_unsafe_raw_value_emission_policy';
  }
  return 'provide_actual_source_candidate_field_policy_requirements';
};

export const buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy = (
  input: BuildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicyInput
): TierUpdateActualSafeRowExportActualSourceCandidateFieldPolicyResult => {
  const blockers = new Set<string>();
  const review = new Set<string>();
  const unsafe = new Set<string>();

  if (!isPlainDataRecord(input)) {
    add(blockers, 'input_malformed');
  }
  const record = isPlainDataRecord(input) ? input : {};

  collectForbiddenPropertyPresence(record, blockers);
  collectRequiredAcknowledgements(record, blockers);

  const policyId = readOwnDataProperty(record, 'policyId');
  const sourceHeadSha = readOwnDataProperty(record, 'sourceHeadSha');
  const policyMode = readOwnDataProperty(record, 'policyMode');

  if (!isSafeLowerToken(policyId, 96)) add(blockers, 'policy_id_invalid');
  if (!isSafeSourceHeadSha(sourceHeadSha)) add(blockers, 'source_head_sha_invalid');
  if (!ALLOWED_POLICY_MODES.includes(policyMode as PolicyMode)) {
    add(blockers, FORBIDDEN_POLICY_MODES.includes(policyMode as typeof FORBIDDEN_POLICY_MODES[number])
      ? 'policy_mode_forbidden'
      : 'policy_mode_invalid');
  }

  const requestedEntities = normalizeRequestedEntities(readOwnDataProperty(record, 'requestedEntities'), blockers, review);
  if (requestedEntities.length === 0) add(blockers, 'requested_entities_required');

  if (inspectPropertyPresence(record, 'blockers') !== 'absent') {
    normalizeGenericBlockerPresence(readOwnDataProperty(record, 'blockers'), (code) => add(blockers, code));
  }
  if (inspectPropertyPresence(record, 'needsReviewReasons') !== 'absent') {
    normalizeAllowlistedReviewReasons(
      readOwnDataProperty(record, 'needsReviewReasons'),
      SAFE_REVIEW_REASONS,
      (code) => add(blockers, code),
      (code) => add(review, code)
    );
  }

  const boundaryFlags = reduceForbiddenBooleanFlags(
    [
      record as Partial<Record<typeof FORBIDDEN_BOUNDARY_FLAGS[number], boolean>>,
      readOwnDataProperty(record, 'boundarySummary') as Partial<Record<typeof FORBIDDEN_BOUNDARY_FLAGS[number], boolean>>,
      readOwnDataProperty(record, 'boundaryFlags') as Partial<Record<typeof FORBIDDEN_BOUNDARY_FLAGS[number], boolean>>
    ],
    FORBIDDEN_BOUNDARY_FLAGS,
    (flag) => add(blockers, flag ? `boundary_flag_malformed:${flag}` : 'boundary_flags_malformed')
  );
  for (const flag of FORBIDDEN_BOUNDARY_FLAGS) {
    if (boundaryFlags[flag]) add(blockers, `forbidden_boundary_enabled:${flag}`);
  }

  const coverage = collectCoverage();
  coverage.missing.forEach((code) => add(blockers, `field_classification_missing:${code}`));
  coverage.extra.forEach((code) => add(blockers, `field_classification_extra:${code}`));
  coverage.duplicate.forEach((code) => add(blockers, `field_classification_duplicate:${code}`));
  validateFieldPolicies(blockers, unsafe);

  const canonicalFieldCount = countCanonicalFields();
  const fieldCoverageSummary = {
    entityCount: canonicalEntityList.length,
    canonicalFieldCount,
    classifiedFieldCount: coverage.classifiedCount,
    missingClassificationCount: coverage.missing.length,
    extraClassificationCount: coverage.extra.length,
    duplicateClassificationCount: coverage.duplicate.length,
    safeSummaryOnly: true as const
  };

  const status = classifyStatus(blockers, review);
  const shouldReturnPolicy = status !== 'BLOCKED';
  const fieldPoliciesByEntity = shouldReturnPolicy ? buildFieldPoliciesByEntity() : {};
  const canonicalFieldsByEntity = shouldReturnPolicy ? copyCanonicalFieldsByEntity() : {};

  const allPolicies = Object.values(FIELD_CLASSIFICATION).flatMap((entity) => Object.values(entity));
  const rawDirectEmissionFieldCount = allPolicies.filter((policy) => policy.rawSourceValueEmissionAllowed).length;
  const derivedFieldCount = allPolicies.filter((policy) => policy.handling === 'derived_audit_identifier').length;

  return {
    status,
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_KIND,
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_TRACE_LABEL,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_SCHEMA_VERSION,
    skillProfileId: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_SKILL_PROFILE,
    policyId: isSafeLowerToken(policyId, 96) ? policyId : null,
    sourceHeadSha: isSafeSourceHeadSha(sourceHeadSha) ? sourceHeadSha : null,
    policyMode: ALLOWED_POLICY_MODES.includes(policyMode as PolicyMode) ? policyMode as PolicyMode : null,
    safeSummaryOnly: true,
    contractOnly: true,
    noActualAccess: true,
    implementationConformanceClaimed: false,
    allowedEntities: shouldReturnPolicy ? canonicalEntityList : [],
    deferredEntities: deferredEntityList,
    canonicalFieldsByEntity,
    fieldPoliciesByEntity,
    fieldCoverageSummary,
    rawDirectEmissionFieldCount,
    summaryOnlyFieldCount: canonicalFieldCount - rawDirectEmissionFieldCount - derivedFieldCount,
    derivedFieldCount,
    hardMaxRowsPerEntity: TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT,
    stableSortPolicyByEntity: shouldReturnPolicy ? STABLE_SORT_POLICY_BY_ENTITY : {},
    rowIdPolicy: 'sha256_source_identity_v1',
    sourceHashPolicy: 'sha256_canonical_safe_projection_v1',
    boundarySummary: fixedFalseBoundarySummary(),
    runtimeReadinessClaimed: false,
    productionReadinessClaimed: false,
    stagingNoTxPassClaimed: false,
    blockerCount: blockers.size,
    blockers: Array.from(blockers).sort(),
    needsReviewReasonCount: review.size,
    needsReviewReasons: Array.from(review).sort(),
    nextSafeAction: selectNextSafeAction(status, blockers)
  };
};
