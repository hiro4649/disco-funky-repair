import type {
  OperatorControlledTierUpdateSafeRowPackage
} from './tierUpdateSafeRowOperatorPackage';
import type {
  TierUpdateStagingNoTxPreflightEvidence
} from './tierUpdateStagingNoTxPreflightEvidence';

export const TIER_UPDATE_OPERATOR_REVIEW_PACKET_KIND =
  'tier_update_operator_review_packet' as const;

type OperatorReviewPacketStatus =
  | 'BLOCKED'
  | 'NEEDS_REVIEW'
  | 'OWNER_REVIEW_READY';

type NextActionLabel =
  | 'collect_missing_evidence'
  | 'request_owner_review'
  | 'stay_blocked';

type SafeIdentifierSummary = {
  provided: boolean;
  kind: 'operator_id' | 'reviewer_id' | 'run_key';
  safeSummaryOnly: true;
};

type StagingNoTxReviewMetadata = {
  auditExportId?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | null;
};

type ReviewableStagingNoTxEvidence =
  TierUpdateStagingNoTxPreflightEvidence & StagingNoTxReviewMetadata;

export type BuildTierUpdateOperatorReviewPacketInput = {
  operatorPackage?: OperatorControlledTierUpdateSafeRowPackage;
  stagingNoTxEvidence?: ReviewableStagingNoTxEvidence;
  auditExportId?: string | null;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: Date;
  operatorId?: string | null;
  reviewerId?: string | null;
  runKey?: string | null;
  logger?: {
    warn?: (message: string, metadata?: Record<string, unknown>) => void;
  };
};

export type TierUpdateOperatorReviewPacket = {
  status: OperatorReviewPacketStatus;
  packetKind: typeof TIER_UPDATE_OPERATOR_REVIEW_PACKET_KIND;
  mode: 'operator_controlled_review';
  auditExportId: string;
  sourceHeadSha: string | null;
  sourceHash: string | null;
  exportedAt: string;
  operatorSummary: SafeIdentifierSummary;
  reviewerSummary: SafeIdentifierSummary;
  runKeySummary: SafeIdentifierSummary;
  packageSummary: {
    recordCount: number;
    entityCounts: Record<string, number>;
    readinessClaimCounts: Record<string, number>;
    evidenceOriginCounts: Record<string, number>;
    jsonlSha256Summary: string | null;
    includeJsonl: false;
  };
  stagingNoTxEvidenceSummary: {
    stagingNoTxPreflightStatus: 'BLOCKED';
    readinessClaim: 'none';
    noTxExecution: boolean;
    noFundedTx: boolean;
    noMint: boolean;
    noSendToWallet: boolean;
    noGovernanceTx: boolean;
    noTierUpdaterTx: boolean;
    noDeploy: boolean;
    noStagingRollout: boolean;
    noRpcUrlEnvReading: boolean;
    noProviderConstruction: boolean;
    noWalletConstruction: boolean;
    noContractConstruction: boolean;
    noAutoStart: boolean;
    noCronWiring: boolean;
    noMainAutoStart: boolean;
    noTrackingServiceAutoStart: boolean;
  };
  reviewReadiness: {
    ownerReviewMaterialReady: boolean;
    actualDbExportStillDeferred: true;
    fileExportStillDeferred: true;
    artifactUploadStillDeferred: true;
    runtimeReadinessClaimed: false;
    stagingNoTxPassClaimed: false;
  };
  nextActionLabel: NextActionLabel;
  blockers: string[];
  missingEvidence: string[];
  unsafeReasonCodes: string[];
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  safeSummaryOnly: true;
};

const SHA_PATTERN = /^[a-f0-9]{40}$/i;
const SAFE_TOKEN_PATTERN = /^[a-z0-9_.:-]+$/i;
const UNSAFE_TEXT_PATTERNS = [
  /DATABASE_URL=/i,
  /Authorization:/i,
  /Bearer\s+[A-Za-z0-9._~+/=-]+/i,
  /-----BEGIN/i,
  /private_key/i,
  /https?:\/\//i,
  /[A-Z]:\\Users\\/i,
  /\/home\//i,
  /0x[a-fA-F0-9]{40,}/,
  /raw\s+receipt\s+payload/i
];

const EMPTY_PACKAGE_SUMMARY = {
  recordCount: 0,
  entityCounts: {},
  readinessClaimCounts: {},
  evidenceOriginCounts: {},
  jsonlSha256Summary: null,
  includeJsonl: false
} as const;

const EMPTY_STAGING_SUMMARY = {
  stagingNoTxPreflightStatus: 'BLOCKED' as const,
  readinessClaim: 'none' as const,
  noTxExecution: false,
  noFundedTx: false,
  noMint: false,
  noSendToWallet: false,
  noGovernanceTx: false,
  noTierUpdaterTx: false,
  noDeploy: false,
  noStagingRollout: false,
  noRpcUrlEnvReading: false,
  noProviderConstruction: false,
  noWalletConstruction: false,
  noContractConstruction: false,
  noAutoStart: false,
  noCronWiring: false,
  noMainAutoStart: false,
  noTrackingServiceAutoStart: false
};

const add = (items: Set<string>, value: string): void => {
  items.add(value);
};

const safeToken = (value: unknown): string => (
  typeof value === 'string' && value.trim().length > 0 && SAFE_TOKEN_PATTERN.test(value.trim())
    ? value.trim()
    : 'unknown'
);

const safeSha = (value: unknown): string | null => (
  typeof value === 'string' && SHA_PATTERN.test(value) ? value : null
);

const safeExportedAt = (value: unknown): string => (
  value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString() : 'unknown'
);

const safeIdentifierSummary = (
  value: unknown,
  kind: SafeIdentifierSummary['kind']
): SafeIdentifierSummary => ({
  provided: typeof value === 'string' && value.trim().length > 0,
  kind,
  safeSummaryOnly: true
});

const hasUnsafeIdentifier = (value: unknown): boolean => {
  if (typeof value !== 'string') {
    return true;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ||
    trimmed.length > 128 ||
    !SAFE_TOKEN_PATTERN.test(trimmed) ||
    UNSAFE_TEXT_PATTERNS.some((pattern) => pattern.test(trimmed));
};

const hasUnsafeValue = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return UNSAFE_TEXT_PATTERNS.some((pattern) => pattern.test(value));
  }

  if (value === null || value === undefined || typeof value === 'number' || typeof value === 'boolean') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(hasUnsafeValue);
  }

  if (typeof value === 'object') {
    return Object.entries(value).some(([key, entry]) => (
      (!/^no[A-Z]/.test(key) && /raw|secret|private|endpoint|rpcUrl|walletAddressRaw|providerResponse|stackTrace/i.test(key)) ||
      hasUnsafeValue(entry)
    ));
  }

  return true;
};

const validateIdentifiers = (
  input: BuildTierUpdateOperatorReviewPacketInput,
  blockers: Set<string>,
  missingEvidence: Set<string>,
  unsafeReasonCodes: Set<string>
): void => {
  const checks: Array<{
    key: 'operatorId' | 'reviewerId' | 'runKey';
    value: unknown;
    missingReason: string;
    unsafeReason: string;
  }> = [
    { key: 'operatorId', value: input.operatorId, missingReason: 'operator_id_required', unsafeReason: 'operator_id_unsafe' },
    { key: 'reviewerId', value: input.reviewerId, missingReason: 'reviewer_id_required', unsafeReason: 'reviewer_id_unsafe' },
    { key: 'runKey', value: input.runKey, missingReason: 'run_key_required', unsafeReason: 'run_key_unsafe' }
  ];

  for (const check of checks) {
    if (check.value === undefined || check.value === null || String(check.value).trim().length === 0) {
      add(blockers, check.missingReason);
      add(missingEvidence, check.key);
      continue;
    }

    if (hasUnsafeIdentifier(check.value)) {
      add(blockers, check.unsafeReason);
      add(unsafeReasonCodes, check.unsafeReason);
    }
  }
};

const validateMetadata = (
  input: BuildTierUpdateOperatorReviewPacketInput,
  auditExportId: string,
  sourceHeadSha: string | null,
  sourceHash: string | null,
  exportedAt: string,
  blockers: Set<string>,
  missingEvidence: Set<string>
): void => {
  if (auditExportId === 'unknown') {
    add(blockers, 'audit_export_id_required');
    add(missingEvidence, 'auditExportId');
  }

  if (sourceHeadSha === null) {
    add(blockers, 'source_head_sha_required');
    add(missingEvidence, 'sourceHeadSha');
  }

  if (sourceHash === null) {
    add(blockers, 'source_hash_required');
    add(missingEvidence, 'sourceHash');
  }

  if (exportedAt === 'unknown') {
    add(blockers, 'exported_at_required');
    add(missingEvidence, 'exportedAt');
  }

  const operatorPackage = input.operatorPackage;
  if (operatorPackage !== undefined) {
    if (operatorPackage.auditExportId !== auditExportId) add(blockers, 'operator_package_audit_export_id_mismatch');
    if (operatorPackage.sourceHeadSha !== sourceHeadSha) add(blockers, 'operator_package_source_head_sha_mismatch');
    if (operatorPackage.sourceHash !== sourceHash) add(blockers, 'operator_package_source_hash_mismatch');
    if (operatorPackage.exportedAt !== exportedAt) add(blockers, 'operator_package_exported_at_mismatch');
  }

  const staging = input.stagingNoTxEvidence;
  if (staging !== undefined) {
    if (staging.auditExportId !== auditExportId) add(blockers, 'staging_evidence_audit_export_id_mismatch');
    if (staging.sourceHeadSha !== sourceHeadSha) add(blockers, 'staging_evidence_source_head_sha_mismatch');
    if (staging.sourceHash !== sourceHash) add(blockers, 'staging_evidence_source_hash_mismatch');
    if (staging.exportedAt !== exportedAt) add(blockers, 'staging_evidence_exported_at_mismatch');
  }
};

const validateOperatorPackage = (
  operatorPackage: OperatorControlledTierUpdateSafeRowPackage | undefined,
  blockers: Set<string>,
  missingEvidence: Set<string>,
  unsafeReasonCodes: Set<string>
): void => {
  if (operatorPackage === undefined) {
    add(blockers, 'operator_package_missing');
    add(missingEvidence, 'operatorPackage');
    return;
  }

  if (operatorPackage.safeSummaryOnly !== true) add(blockers, 'operator_package_safe_summary_required');
  if (operatorPackage.status !== 'pass') add(blockers, 'operator_package_not_pass');
  if (operatorPackage.readinessClaim !== 'none') add(blockers, 'operator_package_readiness_claim_not_none');
  if (operatorPackage.stagingNoTxPreflightStatus !== 'BLOCKED') add(blockers, 'operator_package_staging_status_not_blocked');
  if (operatorPackage.recordCount === 0) {
    add(missingEvidence, 'operatorPackage.records');
  }

  if (Object.keys(operatorPackage.entityCounts || {}).length === 0) {
    add(missingEvidence, 'operatorPackage.entityCounts');
  }

  for (const reason of operatorPackage.unsafeReasonCodes || []) {
    add(unsafeReasonCodes, reason);
  }

  if (hasUnsafeValue(operatorPackage)) {
    add(blockers, 'operator_package_unsafe_value');
    add(unsafeReasonCodes, 'operator_package_unsafe_value');
  }
};

const validateStagingEvidence = (
  staging: ReviewableStagingNoTxEvidence | undefined,
  blockers: Set<string>,
  missingEvidence: Set<string>,
  unsafeReasonCodes: Set<string>
): void => {
  if (staging === undefined) {
    add(blockers, 'staging_no_tx_evidence_missing');
    add(missingEvidence, 'stagingNoTxEvidence');
    return;
  }

  if (staging.safeSummaryOnly !== true) add(blockers, 'staging_evidence_safe_summary_required');
  if (staging.readinessClaim !== 'none') add(blockers, 'staging_evidence_readiness_claim_not_none');
  if (staging.stagingNoTxPreflightStatus !== 'BLOCKED') add(blockers, 'staging_evidence_status_not_blocked');
  if (!['EVIDENCE_READY', 'NEEDS_REVIEW', 'BLOCKED'].includes(staging.status)) add(blockers, 'staging_evidence_status_unexpected');

  const checks = staging.checks;
  if (!checks) {
    add(blockers, 'staging_checks_missing');
    add(missingEvidence, 'stagingNoTxEvidence.checks');
  } else {
    for (const [key, value] of Object.entries(checks)) {
      if (key === 'safeOutputOnly') continue;
      if (value !== true) add(blockers, key);
    }
  }

  if (staging.status === 'BLOCKED') add(blockers, 'staging_evidence_blocked');
  for (const blocker of staging.blockers || []) add(blockers, blocker);
  for (const missing of staging.missingEvidence || []) add(missingEvidence, `staging:${missing}`);

  if (hasUnsafeValue(staging)) {
    add(blockers, 'staging_evidence_unsafe_value');
    add(unsafeReasonCodes, 'staging_evidence_unsafe_value');
  }
};

const classifyStatus = (
  blockers: Set<string>,
  missingEvidence: Set<string>,
  operatorPackage: OperatorControlledTierUpdateSafeRowPackage | undefined,
  staging: ReviewableStagingNoTxEvidence | undefined
): OperatorReviewPacketStatus => {
  if (blockers.size > 0) return 'BLOCKED';
  if (
    missingEvidence.size > 0 ||
    (operatorPackage?.recordCount ?? 0) === 0 ||
    Object.keys(operatorPackage?.entityCounts || {}).length === 0 ||
    staging?.status === 'NEEDS_REVIEW'
  ) {
    return 'NEEDS_REVIEW';
  }

  return 'OWNER_REVIEW_READY';
};

const nextActionFor = (status: OperatorReviewPacketStatus): NextActionLabel => {
  if (status === 'OWNER_REVIEW_READY') return 'request_owner_review';
  if (status === 'NEEDS_REVIEW') return 'collect_missing_evidence';
  return 'stay_blocked';
};

export const buildTierUpdateOperatorReviewPacket = (
  input: BuildTierUpdateOperatorReviewPacketInput
): TierUpdateOperatorReviewPacket => {
  const blockers = new Set<string>();
  const missingEvidence = new Set<string>();
  const unsafeReasonCodes = new Set<string>();
  const auditExportId = safeToken(input.auditExportId);
  const sourceHeadSha = safeSha(input.sourceHeadSha);
  const sourceHash = safeSha(input.sourceHash);
  const exportedAt = safeExportedAt(input.exportedAt);

  validateIdentifiers(input, blockers, missingEvidence, unsafeReasonCodes);
  validateMetadata(input, auditExportId, sourceHeadSha, sourceHash, exportedAt, blockers, missingEvidence);
  validateOperatorPackage(input.operatorPackage, blockers, missingEvidence, unsafeReasonCodes);
  validateStagingEvidence(input.stagingNoTxEvidence, blockers, missingEvidence, unsafeReasonCodes);

  const status = classifyStatus(blockers, missingEvidence, input.operatorPackage, input.stagingNoTxEvidence);

  if (status !== 'OWNER_REVIEW_READY') {
    input.logger?.warn?.('tier_update_operator_review_packet_not_ready', {
      status,
      blockerCount: blockers.size,
      missingEvidenceCount: missingEvidence.size,
      safeSummaryOnly: true
    });
  }

  return {
    status,
    packetKind: TIER_UPDATE_OPERATOR_REVIEW_PACKET_KIND,
    mode: 'operator_controlled_review',
    auditExportId,
    sourceHeadSha,
    sourceHash,
    exportedAt,
    operatorSummary: safeIdentifierSummary(input.operatorId, 'operator_id'),
    reviewerSummary: safeIdentifierSummary(input.reviewerId, 'reviewer_id'),
    runKeySummary: safeIdentifierSummary(input.runKey, 'run_key'),
    packageSummary: input.operatorPackage ? {
      recordCount: input.operatorPackage.recordCount,
      entityCounts: input.operatorPackage.entityCounts,
      readinessClaimCounts: input.operatorPackage.readinessClaimCounts,
      evidenceOriginCounts: input.operatorPackage.evidenceOriginCounts,
      jsonlSha256Summary: status === 'BLOCKED' ? null : input.operatorPackage.jsonlSha256Summary,
      includeJsonl: false
    } : EMPTY_PACKAGE_SUMMARY,
    stagingNoTxEvidenceSummary: input.stagingNoTxEvidence ? {
      stagingNoTxPreflightStatus: 'BLOCKED',
      readinessClaim: 'none',
      noTxExecution: input.stagingNoTxEvidence.checks.noTxExecution,
      noFundedTx: input.stagingNoTxEvidence.checks.noFundedTx,
      noMint: input.stagingNoTxEvidence.checks.noMint,
      noSendToWallet: input.stagingNoTxEvidence.checks.noSendToWallet,
      noGovernanceTx: input.stagingNoTxEvidence.checks.noGovernanceTx,
      noTierUpdaterTx: input.stagingNoTxEvidence.checks.noTierUpdaterTx,
      noDeploy: input.stagingNoTxEvidence.checks.noDeploy,
      noStagingRollout: input.stagingNoTxEvidence.checks.noStagingRollout,
      noRpcUrlEnvReading: input.stagingNoTxEvidence.checks.noRpcUrlEnvReading,
      noProviderConstruction: input.stagingNoTxEvidence.checks.noProviderConstruction,
      noWalletConstruction: input.stagingNoTxEvidence.checks.noWalletConstruction,
      noContractConstruction: input.stagingNoTxEvidence.checks.noContractConstruction,
      noAutoStart: input.stagingNoTxEvidence.checks.noAutoStart,
      noCronWiring: input.stagingNoTxEvidence.checks.noCronWiring,
      noMainAutoStart: input.stagingNoTxEvidence.checks.noMainAutoStart,
      noTrackingServiceAutoStart: input.stagingNoTxEvidence.checks.noTrackingServiceAutoStart
    } : EMPTY_STAGING_SUMMARY,
    reviewReadiness: {
      ownerReviewMaterialReady: status === 'OWNER_REVIEW_READY',
      actualDbExportStillDeferred: true,
      fileExportStillDeferred: true,
      artifactUploadStillDeferred: true,
      runtimeReadinessClaimed: false,
      stagingNoTxPassClaimed: false
    },
    nextActionLabel: nextActionFor(status),
    blockers: Array.from(blockers).sort(),
    missingEvidence: Array.from(missingEvidence).sort(),
    unsafeReasonCodes: Array.from(unsafeReasonCodes).sort(),
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    safeSummaryOnly: true
  };
};
