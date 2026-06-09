import type {
  TierUpdateD8EvidenceOperatorDigest
} from './tierUpdateD8EvidenceOperatorDigest';
import type {
  TierUpdateD8StagingOwnerReviewRefresh
} from './tierUpdateD8StagingOwnerReviewRefresh';
import type {
  TierUpdateSafeDbReadExportJsonlPackageResult
} from './tierUpdateSafeDbReadExportJsonlPackage';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_KIND =
  'tier_update_actual_safe_row_export_design_gate' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES = [
  'scheduled_tier_update',
  'job_run',
  'tx_receipt_evidence',
  'staging_evidence'
] as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS = [
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
  'raw_jsonl_body'
] as const;

const DEFERRED_ENTITIES = new Set([
  'prize',
  'prizetransactions',
  'prize_transactions',
  'nft',
  'nft_metadata',
  'tokendetail',
  'token_detail',
  'ticketcode',
  'ticket_code',
  'wallet_summary'
]);

type DesignGateStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'DESIGN_READY';

type NextSafeAction =
  | 'build_d8_staging_owner_review_refresh'
  | 'add_required_safe_jsonl_metadata'
  | 'remove_unsupported_entities'
  | 'define_forbidden_field_policy'
  | 'require_same_head_evidence'
  | 'collect_operator_design_approval'
  | 'prepare_pr_d8m_actual_safe_row_export_mock_source_contract';

type SafePresenceSummary = {
  provided: boolean;
  safeSummaryOnly: true;
};

type SameHeadEvidenceInput = {
  required?: boolean;
  headMatchStatus?: string;
};

type OperatorApprovalInput = {
  required?: boolean;
  status?: string;
};

type ForbiddenFieldPolicyInput = {
  required?: boolean;
  blockedFields?: string[];
};

type DesignGateD8Refresh = Partial<TierUpdateD8StagingOwnerReviewRefresh> & {
  [key: string]: unknown;
};

type DesignGateD8Digest = Partial<TierUpdateD8EvidenceOperatorDigest> & {
  [key: string]: unknown;
};

type DesignGateSafePackage = Partial<TierUpdateSafeDbReadExportJsonlPackageResult> & {
  [key: string]: unknown;
};

export type BuildTierUpdateActualSafeRowExportDesignGateInput = {
  d8StagingOwnerReviewRefresh?: DesignGateD8Refresh;
  d8EvidenceDigest?: DesignGateD8Digest;
  safeDbReadExportPackage?: DesignGateSafePackage;
  requestedEntities?: string[];
  proposedJsonlSchemaFields?: string[];
  forbiddenFieldPolicy?: ForbiddenFieldPolicyInput;
  sameHeadEvidence?: SameHeadEvidenceInput;
  operatorApproval?: OperatorApprovalInput;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | Date | null;
  operatorId?: string | null;
  runKey?: string | null;
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
  prismaClientEnabled?: boolean;
  fileExportEnabled?: boolean;
  artifactUploadEnabled?: boolean;
  dockerSmokeChanged?: boolean;
  stagingNoTxPassClaimed?: boolean;
  runtimeReadinessClaimed?: boolean;
  productionReadinessClaimed?: boolean;
};

export type TierUpdateActualSafeRowExportDesignGate = {
  gateKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_SCHEMA_VERSION;
  status: DesignGateStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: 'd8l_actual_safe_row_export_design_gate';
  allowedEntities: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES;
  requestedEntitiesSummary: {
    requestedCount: number;
    allowedCount: number;
    deferredCount: number;
    safeSummaryOnly: true;
  };
  disallowedEntityCount: number;
  requiredMetadataStatus: 'present' | 'missing';
  forbiddenFieldPolicyStatus: 'present' | 'missing';
  sameHeadEvidenceStatus: 'required_or_pending' | 'blocked';
  operatorApprovalStatus: 'approved' | 'pending' | 'blocked';
  d8StagingOwnerReviewRefreshStatus: string;
  d8EvidenceDigestStatus: string;
  safeDbReadExportPackageStatus: string;
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
    operatorId: SafePresenceSummary;
    runKey: SafePresenceSummary;
    sourceHeadSha: SafePresenceSummary;
    sourceHash: SafePresenceSummary;
    exportedAt: SafePresenceSummary;
  };
  nextSafeAction: NextSafeAction;
};

const ALLOWED_ENTITY_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES);
const REQUIRED_METADATA_SET = new Set<string>(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS);
const REQUIRED_FORBIDDEN_FIELD_SET = new Set<string>(REQUIRED_FORBIDDEN_FIELD_CODES);

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};

const compactCodes = (codes: Iterable<string>): string[] => (
  Array.from(new Set(Array.from(codes).filter(Boolean).map((code) => (
    code.length > 96 ? code.slice(0, 96) : code
  )))).sort().slice(0, 12)
);

const safePresence = (value: unknown): SafePresenceSummary => ({
  provided: value !== undefined && value !== null && String(value).trim().length > 0,
  safeSummaryOnly: true
});

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

const safeStatus = (value: unknown): string => (
  typeof value === 'string' && value.trim().length > 0 ? value : 'missing'
);

const uniqueNormalized = (values: string[] | undefined): string[] => (
  Array.from(new Set((values || []).map((value) => normalize(String(value))).filter(Boolean))).sort()
);

const classifyUpstreamStatus = (
  status: unknown,
  missingCode: string,
  notReadyCode: string,
  blockers: Set<string>,
  missing: Set<string>
): void => {
  if (status === undefined) {
    add(blockers, missingCode);
    add(missing, missingCode);
    return;
  }

  if (status === 'BLOCKED') {
    add(blockers, notReadyCode);
  }
};

const evaluateRequestedEntities = (
  requestedEntities: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): { requestedCount: number; allowedCount: number; deferredCount: number; disallowedEntityCount: number } => {
  const requested = uniqueNormalized(requestedEntities);

  if (requested.length === 0) {
    add(missing, 'requested_entities_required');
    return {
      requestedCount: 0,
      allowedCount: 0,
      deferredCount: 0,
      disallowedEntityCount: 0
    };
  }

  const allowed = requested.filter((entity) => ALLOWED_ENTITY_SET.has(entity));
  const deferred = requested.filter((entity) => DEFERRED_ENTITIES.has(entity));
  const disallowed = requested.filter((entity) => !ALLOWED_ENTITY_SET.has(entity));

  if (disallowed.length > 0) add(blockers, 'unsupported_entity_requested');
  if (deferred.length > 0) add(blockers, 'deferred_entity_requested');

  return {
    requestedCount: requested.length,
    allowedCount: allowed.length,
    deferredCount: deferred.length,
    disallowedEntityCount: disallowed.length
  };
};

const evaluateMetadata = (
  fields: string[] | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' => {
  const provided = new Set(uniqueNormalized(fields));
  const missingFields = Array.from(REQUIRED_METADATA_SET).filter((field) => !provided.has(field));

  for (const field of missingFields) {
    add(blockers, `metadata_missing:${field}`);
    add(missing, `metadata:${field}`);
  }

  return missingFields.length === 0 ? 'present' : 'missing';
};

const evaluateForbiddenFieldPolicy = (
  policy: ForbiddenFieldPolicyInput | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'present' | 'missing' => {
  if (policy === undefined || policy.required !== true) {
    add(blockers, 'forbidden_field_policy_missing');
    add(missing, 'forbidden_field_policy');
    return 'missing';
  }

  const blockedFields = new Set(uniqueNormalized(policy.blockedFields));
  const missingFields = Array.from(REQUIRED_FORBIDDEN_FIELD_SET).filter((field) => !blockedFields.has(field));
  for (const field of missingFields) {
    add(blockers, `forbidden_policy_missing:${field}`);
    add(missing, `forbidden_policy:${field}`);
  }

  return missingFields.length === 0 ? 'present' : 'missing';
};

const evaluateSameHeadEvidence = (
  sameHeadEvidence: SameHeadEvidenceInput | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'required_or_pending' | 'blocked' => {
  if (sameHeadEvidence?.required !== true) {
    add(blockers, 'same_head_evidence_required');
    add(missing, 'same_head_evidence');
    return 'blocked';
  }

  if (sameHeadEvidence.headMatchStatus !== 'required_or_pending') {
    add(blockers, 'same_head_evidence_not_required_or_pending');
    return 'blocked';
  }

  return 'required_or_pending';
};

const evaluateOperatorApproval = (
  operatorApproval: OperatorApprovalInput | undefined,
  blockers: Set<string>,
  missing: Set<string>
): 'approved' | 'pending' | 'blocked' => {
  if (operatorApproval?.required !== true) {
    add(blockers, 'operator_approval_required');
    add(missing, 'operator_approval');
    return 'blocked';
  }

  if (operatorApproval.status === 'approved') return 'approved';
  if (operatorApproval.status === 'pending') {
    add(missing, 'operator_approval_pending');
    return 'pending';
  }

  add(blockers, 'operator_approval_status_unexpected');
  return 'blocked';
};

const evaluateExecutionFlags = (
  input: BuildTierUpdateActualSafeRowExportDesignGateInput,
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
  input: BuildTierUpdateActualSafeRowExportDesignGateInput,
  missingCodes: Set<string>,
  blockerCodes: Set<string>,
  status: DesignGateStatus
): NextSafeAction => {
  if (input.d8StagingOwnerReviewRefresh === undefined) return 'build_d8_staging_owner_review_refresh';
  if (Array.from(missingCodes).some((code) => code.startsWith('metadata:'))) return 'add_required_safe_jsonl_metadata';
  if (blockerCodes.has('unsupported_entity_requested') || blockerCodes.has('deferred_entity_requested')) return 'remove_unsupported_entities';
  if (missingCodes.has('forbidden_field_policy')) return 'define_forbidden_field_policy';
  if (blockerCodes.has('same_head_evidence_required') || blockerCodes.has('same_head_evidence_not_required_or_pending')) return 'require_same_head_evidence';
  if (missingCodes.has('operator_approval') || missingCodes.has('operator_approval_pending')) return 'collect_operator_design_approval';
  if (status === 'DESIGN_READY') return 'prepare_pr_d8m_actual_safe_row_export_mock_source_contract';
  return 'collect_operator_design_approval';
};

export const buildTierUpdateActualSafeRowExportDesignGate = (
  input: BuildTierUpdateActualSafeRowExportDesignGateInput
): TierUpdateActualSafeRowExportDesignGate => {
  const blockers = new Set<string>();
  const missing = new Set<string>();

  classifyUpstreamStatus(
    input.d8StagingOwnerReviewRefresh?.status,
    'd8_staging_owner_review_refresh_missing',
    'd8_staging_owner_review_refresh_not_ready',
    blockers,
    missing
  );
  classifyUpstreamStatus(
    input.d8EvidenceDigest?.status,
    'd8_evidence_digest_missing',
    'd8_evidence_digest_not_ready',
    blockers,
    missing
  );
  classifyUpstreamStatus(
    input.safeDbReadExportPackage?.status,
    'safe_db_read_export_package_missing',
    'safe_db_read_export_package_not_ready',
    blockers,
    missing
  );

  if (
    input.d8StagingOwnerReviewRefresh !== undefined &&
    input.d8StagingOwnerReviewRefresh.status !== 'OWNER_REVIEW_READY' &&
    input.d8StagingOwnerReviewRefresh.status !== 'BLOCKED'
  ) {
    add(missing, 'd8_staging_owner_review_refresh_needs_review');
  }
  if (
    input.d8EvidenceDigest !== undefined &&
    input.d8EvidenceDigest.status !== 'OWNER_REVIEW_READY' &&
    input.d8EvidenceDigest.status !== 'BLOCKED'
  ) {
    add(missing, 'd8_evidence_digest_needs_review');
  }
  if (
    input.safeDbReadExportPackage !== undefined &&
    input.safeDbReadExportPackage.status !== 'EXPORT_PACKAGE_READY' &&
    input.safeDbReadExportPackage.status !== 'BLOCKED'
  ) {
    add(missing, 'safe_db_read_export_package_needs_review');
  }

  const entitySummary = evaluateRequestedEntities(input.requestedEntities, blockers, missing);
  const requiredMetadataStatus = evaluateMetadata(input.proposedJsonlSchemaFields, blockers, missing);
  const forbiddenFieldPolicyStatus = evaluateForbiddenFieldPolicy(input.forbiddenFieldPolicy, blockers, missing);
  const sameHeadEvidenceStatus = evaluateSameHeadEvidence(input.sameHeadEvidence, blockers, missing);
  const operatorApprovalStatus = evaluateOperatorApproval(input.operatorApproval, blockers, missing);
  evaluateExecutionFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const status: DesignGateStatus = compactBlockerCodes.length > 0
    ? 'BLOCKED'
    : compactMissingRequirementCodes.length > 0
      ? 'NEEDS_REVIEW'
      : 'DESIGN_READY';

  return {
    gateKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: 'd8l_actual_safe_row_export_design_gate',
    allowedEntities: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_DESIGN_GATE_ALLOWED_ENTITIES,
    requestedEntitiesSummary: {
      requestedCount: entitySummary.requestedCount,
      allowedCount: entitySummary.allowedCount,
      deferredCount: entitySummary.deferredCount,
      safeSummaryOnly: true
    },
    disallowedEntityCount: entitySummary.disallowedEntityCount,
    requiredMetadataStatus,
    forbiddenFieldPolicyStatus,
    sameHeadEvidenceStatus,
    operatorApprovalStatus,
    d8StagingOwnerReviewRefreshStatus: safeStatus(input.d8StagingOwnerReviewRefresh?.status),
    d8EvidenceDigestStatus: safeStatus(input.d8EvidenceDigest?.status),
    safeDbReadExportPackageStatus: safeStatus(input.safeDbReadExportPackage?.status),
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
    nextSafeAction: determineNextSafeAction(input, missing, blockers, status)
  };
};
