import type {
  TierUpdateOperatorReviewPacket
} from './tierUpdateOperatorReviewPacket';
import type {
  TierUpdateSafeDbReadExportJsonlPackageResult
} from './tierUpdateSafeDbReadExportJsonlPackage';

export const TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_KIND =
  'tier_update_d8_evidence_operator_digest' as const;

export const TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_ALLOWED_ENTITIES = [
  'scheduled_tier_update',
  'job_run'
] as const;

export type TierUpdateD8EvidenceOperatorDigestStatus =
  | 'BLOCKED'
  | 'NEEDS_REVIEW'
  | 'OWNER_REVIEW_READY';

export type TierUpdateD8EvidenceOperatorDigestNextAction =
  | 'build_safe_db_read_export_package'
  | 'build_owner_review_packet'
  | 'review_unsafe_safe_db_export_evidence'
  | 'add_mock_or_injected_safe_rows'
  | 'prepare_pr_d8k_staging_no_tx_owner_review_evidence_refresh';

type StagePresence = 'present' | 'missing';

type SafeSummary = {
  provided: boolean;
  safeSummaryOnly: true;
};

type SafeDbReadExportPackageInput = Partial<TierUpdateSafeDbReadExportJsonlPackageResult> & {
  blockers?: string[];
  unsafeReasonCodes?: string[];
  missingEvidence?: string[];
  [key: string]: unknown;
};

type OwnerReviewPacketInput = Partial<TierUpdateOperatorReviewPacket> & {
  blockers?: string[];
  unsafeReasonCodes?: string[];
  missingEvidence?: string[];
  [key: string]: unknown;
};

export type BuildTierUpdateD8EvidenceOperatorDigestInput = {
  safeDbReadExportPackage?: SafeDbReadExportPackageInput;
  ownerReviewPacket?: OwnerReviewPacketInput;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | Date | null;
  operatorId?: string | null;
  runKey?: string | null;
};

export type TierUpdateD8EvidenceOperatorDigest = {
  digestKind: typeof TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_KIND;
  schemaVersion: typeof TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_SCHEMA_VERSION;
  status: TierUpdateD8EvidenceOperatorDigestStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: 'd8_safe_evidence_operator_digest';
  evidenceStages: {
    d8gSafeDbReadExportFoundation: StagePresence;
    d8hMockRows: StagePresence;
    d8iJsonlPackage: StagePresence;
    d8jOwnerReviewConsumption: StagePresence;
  };
  safeDbReadExportPackageStatus: string;
  ownerReviewPacketStatus: string;
  recordCount: number;
  entityCounts: Record<string, number>;
  readinessClaimCounts: Record<string, number>;
  evidenceOriginCounts: Record<string, number>;
  jsonlSha256Summary: string | null;
  blockerCount: number;
  unsafeReasonCount: number;
  compactBlockerCodes: string[];
  compactUnsafeReasonCodes: string[];
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  runtimeReadinessClaimed: false;
  productionReadinessClaimed: false;
  actualDbExport: false;
  realDbQuery: false;
  prismaClientUsed: false;
  fileExported: false;
  artifactUploaded: false;
  dockerSmoke: false;
  allowedEntities: typeof TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_ALLOWED_ENTITIES;
  disallowedEntityCount: number;
  nextSafeAction: TierUpdateD8EvidenceOperatorDigestNextAction;
  operatorSummary: {
    operatorId: SafeSummary;
    runKey: SafeSummary;
    sourceHeadSha: SafeSummary;
    sourceHash: SafeSummary;
    exportedAt: SafeSummary;
    ownerReviewReadyIsPass: false;
    ownerReviewReadyIsStagingReady: false;
    ownerReviewReadyIsRuntimeReady: false;
    ownerReviewReadyIsProductionReady: false;
    safeSummaryOnly: true;
  };
};

const ALLOWED_ENTITY_SET = new Set<string>(TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_ALLOWED_ENTITIES);
const HASH_SUMMARY_PATTERN = /^sha256:[a-f0-9]{64}$/i;

const FORBIDDEN_KEY_PATTERNS = [
  /^jsonl$/i,
  /rawJsonl/i,
  /raw/i,
  /private/i,
  /secret/i,
  /token/i,
  /cookie/i,
  /authorization/i,
  /database_url/i,
  /databaseUrl/i,
  /dbUrl/i,
  /endpoint/i,
  /rpcUrl/i,
  /wallet/i,
  /txHash/i,
  /checkpoint/i,
  /provider/i,
  /filePath/i,
  /localPath/i
];

const UNSAFE_TEXT_PATTERNS = [
  /DATABASE_URL=/i,
  /Authorization:/i,
  /Bearer\s+[A-Za-z0-9._~+/=-]+/i,
  /-----BEGIN/i,
  /private_key/i,
  /https?:\/\//i,
  /[A-Z]:\\Users\\/i,
  /\/home\//i,
  /0x[a-fA-F0-9]{64}/i,
  /raw\s+(?:jsonl|wallet|txhash|checkpoint|env|path|provider|error|payload)/i
];

const safeProvided = (value: unknown): SafeSummary => ({
  provided: value !== undefined && value !== null && String(value).trim().length > 0,
  safeSummaryOnly: true
});

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};

const compactCodes = (codes: Iterable<string>): string[] => (
  Array.from(new Set(Array.from(codes).filter(Boolean).map((code) => (
    code.length > 96 ? code.slice(0, 96) : code
  )))).sort().slice(0, 12)
);

const inspectUnsafeShape = (
  value: unknown,
  unsafe: Set<string>,
  path: string
): void => {
  if (typeof value === 'string') {
    if (UNSAFE_TEXT_PATTERNS.some((pattern) => pattern.test(value))) add(unsafe, `unsafe_value:${path}`);
    return;
  }

  if (value === null || value === undefined || typeof value === 'number' || typeof value === 'boolean') return;
  if (value instanceof Date) return;

  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectUnsafeShape(entry, unsafe, `${path}[${index}]`));
    return;
  }

  if (!isPlainObject(value)) {
    add(unsafe, `unsafe_value:${path}`);
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    if (
      key !== 'jsonlSha256Summary' &&
      !/^no[A-Z]/.test(key) &&
      FORBIDDEN_KEY_PATTERNS.some((pattern) => pattern.test(key))
    ) {
      add(unsafe, `forbidden_key:${path}.${key}`);
    }
    inspectUnsafeShape(entry, unsafe, `${path}.${key}`);
  }
};

const safeRecord = (value: unknown): Record<string, number> => {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] => {
        const count = entry[1];
        return typeof count === 'number' && Number.isInteger(count) && count >= 0;
      })
      .sort(([a], [b]) => a.localeCompare(b))
  );
};

const countDisallowedEntities = (entityCounts: Record<string, number>): number => (
  Object.keys(entityCounts).filter((entity) => !ALLOWED_ENTITY_SET.has(entity)).length
);

const summarizeStatus = (value: unknown, fallback: string): string => (
  typeof value === 'string' && value.trim().length > 0 ? value : fallback
);

const isCleanNoRuntimeBoundary = (pkg: SafeDbReadExportPackageInput): boolean => (
  pkg.readinessClaim === 'none' &&
  pkg.stagingNoTxPreflightStatus === 'BLOCKED' &&
  pkg.runtimeReadinessClaimed === false &&
  pkg.productionReadinessClaimed === false &&
  pkg.actualDbExport === false &&
  pkg.realDbQuery === false &&
  pkg.prismaClientUsed === false &&
  pkg.fileExported === false &&
  pkg.artifactUploaded === false &&
  pkg.dockerSmoke === false
);

const determineNextAction = (
  packageMissing: boolean,
  ownerMissing: boolean,
  unsafeCount: number,
  status: TierUpdateD8EvidenceOperatorDigestStatus,
  recordCount: number
): TierUpdateD8EvidenceOperatorDigestNextAction => {
  if (packageMissing) return 'build_safe_db_read_export_package';
  if (ownerMissing) return 'build_owner_review_packet';
  if (unsafeCount > 0 || status === 'BLOCKED') return 'review_unsafe_safe_db_export_evidence';
  if (recordCount <= 0) return 'add_mock_or_injected_safe_rows';
  return 'prepare_pr_d8k_staging_no_tx_owner_review_evidence_refresh';
};

export const buildTierUpdateD8EvidenceOperatorDigest = (
  input: BuildTierUpdateD8EvidenceOperatorDigestInput
): TierUpdateD8EvidenceOperatorDigest => {
  const blockers = new Set<string>();
  const unsafeReasonCodes = new Set<string>();
  const pkg = input.safeDbReadExportPackage;
  const owner = input.ownerReviewPacket;
  const packageMissing = pkg === undefined;
  const ownerMissing = owner === undefined;

  if (packageMissing) add(blockers, 'safe_db_read_export_package_missing');
  if (ownerMissing) add(blockers, 'owner_review_packet_missing');

  if (pkg !== undefined) {
    for (const code of pkg.blockers ?? []) add(blockers, `package:${code}`);
    for (const code of pkg.unsafeReasonCodes ?? []) add(unsafeReasonCodes, `package:${code}`);
    inspectUnsafeShape(pkg, unsafeReasonCodes, 'safeDbReadExportPackage');
    if (pkg.status === 'BLOCKED') add(blockers, 'safe_db_read_export_package_blocked');
    if (pkg.status !== 'EXPORT_PACKAGE_READY') add(blockers, 'safe_db_read_export_package_not_ready');
  }

  if (owner !== undefined) {
    for (const code of owner.blockers ?? []) add(blockers, `ownerReviewPacket:${code}`);
    for (const code of owner.unsafeReasonCodes ?? []) add(unsafeReasonCodes, `ownerReviewPacket:${code}`);
    inspectUnsafeShape(owner, unsafeReasonCodes, 'ownerReviewPacket');
    if (owner.status === 'BLOCKED') add(blockers, 'owner_review_packet_blocked');
    if (owner.status !== 'OWNER_REVIEW_READY') add(blockers, 'owner_review_packet_not_ready');
  }

  const entityCounts = safeRecord(pkg?.entityCounts);
  const readinessClaimCounts = safeRecord(pkg?.readinessClaimCounts);
  const evidenceOriginCounts = safeRecord(pkg?.evidenceOriginCounts);
  const recordCount = Number.isInteger(pkg?.recordCount) && Number(pkg?.recordCount) >= 0
    ? Number(pkg?.recordCount)
    : 0;
  const disallowedEntityCount = countDisallowedEntities(entityCounts);
  const jsonlSha256Summary = typeof pkg?.jsonlSha256Summary === 'string' && HASH_SUMMARY_PATTERN.test(pkg.jsonlSha256Summary)
    ? pkg.jsonlSha256Summary
    : null;

  if (pkg !== undefined && disallowedEntityCount > 0) add(blockers, 'disallowed_entity_present');
  if (pkg !== undefined && !isCleanNoRuntimeBoundary(pkg)) add(blockers, 'no_runtime_boundary_violation');
  if (owner !== undefined && owner.readinessClaim !== 'none') add(blockers, 'owner_review_readiness_claim_not_none');
  if (owner !== undefined && owner.stagingNoTxPreflightStatus !== 'BLOCKED') add(blockers, 'owner_review_staging_status_not_blocked');
  if (owner !== undefined && owner.reviewReadiness?.runtimeReadinessClaimed !== false) add(blockers, 'owner_review_runtime_readiness_claimed');
  if (owner !== undefined && owner.reviewReadiness?.stagingNoTxPassClaimed !== false) add(blockers, 'owner_review_staging_pass_claimed');
  if (jsonlSha256Summary === null && pkg !== undefined) add(blockers, 'jsonl_hash_summary_missing');

  const compactBlockerCodes = compactCodes(blockers);
  const compactUnsafeReasonCodes = compactCodes(unsafeReasonCodes);
  const hasHardBlocker = compactBlockerCodes.length > 0 || compactUnsafeReasonCodes.length > 0;
  const ownerReady =
    pkg?.status === 'EXPORT_PACKAGE_READY' &&
    owner?.status === 'OWNER_REVIEW_READY' &&
    recordCount > 0 &&
    !hasHardBlocker;
  const status: TierUpdateD8EvidenceOperatorDigestStatus = hasHardBlocker
    ? 'BLOCKED'
    : ownerReady
      ? 'OWNER_REVIEW_READY'
      : 'NEEDS_REVIEW';

  return {
    digestKind: TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_KIND,
    schemaVersion: TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: 'd8_safe_evidence_operator_digest',
    evidenceStages: {
      d8gSafeDbReadExportFoundation: pkg ? 'present' : 'missing',
      d8hMockRows: recordCount > 0 ? 'present' : 'missing',
      d8iJsonlPackage: pkg ? 'present' : 'missing',
      d8jOwnerReviewConsumption: owner ? 'present' : 'missing'
    },
    safeDbReadExportPackageStatus: summarizeStatus(pkg?.status, 'missing'),
    ownerReviewPacketStatus: summarizeStatus(owner?.status, 'missing'),
    recordCount,
    entityCounts,
    readinessClaimCounts,
    evidenceOriginCounts,
    jsonlSha256Summary: status === 'BLOCKED' ? null : jsonlSha256Summary,
    blockerCount: compactBlockerCodes.length,
    unsafeReasonCount: compactUnsafeReasonCodes.length,
    compactBlockerCodes,
    compactUnsafeReasonCodes,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    runtimeReadinessClaimed: false,
    productionReadinessClaimed: false,
    actualDbExport: false,
    realDbQuery: false,
    prismaClientUsed: false,
    fileExported: false,
    artifactUploaded: false,
    dockerSmoke: false,
    allowedEntities: TIER_UPDATE_D8_EVIDENCE_OPERATOR_DIGEST_ALLOWED_ENTITIES,
    disallowedEntityCount,
    nextSafeAction: determineNextAction(packageMissing, ownerMissing, compactUnsafeReasonCodes.length, status, recordCount),
    operatorSummary: {
      operatorId: safeProvided(input.operatorId),
      runKey: safeProvided(input.runKey),
      sourceHeadSha: safeProvided(input.sourceHeadSha),
      sourceHash: safeProvided(input.sourceHash),
      exportedAt: safeProvided(input.exportedAt),
      ownerReviewReadyIsPass: false,
      ownerReviewReadyIsStagingReady: false,
      ownerReviewReadyIsRuntimeReady: false,
      ownerReviewReadyIsProductionReady: false,
      safeSummaryOnly: true
    }
  };
};
