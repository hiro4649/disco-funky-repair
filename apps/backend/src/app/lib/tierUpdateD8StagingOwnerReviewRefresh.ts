import type {
  TierUpdateD8EvidenceOperatorDigest
} from './tierUpdateD8EvidenceOperatorDigest';
import type {
  TierUpdateOperatorReviewPacket
} from './tierUpdateOperatorReviewPacket';
import type {
  TierUpdateSafeDbReadExportJsonlPackageResult
} from './tierUpdateSafeDbReadExportJsonlPackage';
import type {
  TierUpdateStagingNoTxPreflightEvidence
} from './tierUpdateStagingNoTxPreflightEvidence';

export const TIER_UPDATE_D8_STAGING_OWNER_REVIEW_REFRESH_KIND =
  'tier_update_d8_staging_owner_review_refresh' as const;

export const TIER_UPDATE_D8_STAGING_OWNER_REVIEW_REFRESH_SCHEMA_VERSION = '1' as const;

type RefreshStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'OWNER_REVIEW_READY';

type NextSafeAction =
  | 'build_compact_d8_evidence_operator_digest'
  | 'build_staging_no_tx_owner_review_evidence'
  | 'review_unsafe_staging_owner_evidence'
  | 'resolve_owner_review_blockers'
  | 'add_mock_or_injected_safe_rows'
  | 'prepare_pr_d8l_actual_safe_row_export_plan';

type SafePresenceSummary = {
  provided: boolean;
  safeSummaryOnly: true;
};

type RefreshSafeDbReadExportPackage = Partial<TierUpdateSafeDbReadExportJsonlPackageResult> & {
  [key: string]: unknown;
};

type RefreshOwnerReviewPacket = Partial<TierUpdateOperatorReviewPacket> & {
  [key: string]: unknown;
};

type RefreshStagingNoTxEvidence = Partial<TierUpdateStagingNoTxPreflightEvidence> & {
  [key: string]: unknown;
};

type RefreshD8EvidenceDigest = Partial<TierUpdateD8EvidenceOperatorDigest> & {
  [key: string]: unknown;
};

export type BuildTierUpdateD8StagingOwnerReviewRefreshInput = {
  d8EvidenceDigest?: RefreshD8EvidenceDigest;
  ownerReviewPacket?: RefreshOwnerReviewPacket;
  stagingNoTxEvidence?: RefreshStagingNoTxEvidence;
  safeDbReadExportPackage?: RefreshSafeDbReadExportPackage;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | Date | null;
  operatorId?: string | null;
  reviewerId?: string | null;
  runKey?: string | null;
};

export type TierUpdateD8StagingOwnerReviewRefresh = {
  refreshKind: typeof TIER_UPDATE_D8_STAGING_OWNER_REVIEW_REFRESH_KIND;
  schemaVersion: typeof TIER_UPDATE_D8_STAGING_OWNER_REVIEW_REFRESH_SCHEMA_VERSION;
  status: RefreshStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: 'd8_staging_owner_review_refresh';
  stagingNoTxPreflightStatus: 'BLOCKED';
  readinessClaim: 'none';
  d8DigestStatus: string;
  ownerReviewPacketStatus: string;
  safeDbReadExportPackageStatus: string;
  stagingEvidenceStatus: string;
  recordCount: number;
  entityCounts: Record<string, number>;
  blockerCount: number;
  unsafeReasonCount: number;
  compactBlockerCodes: string[];
  compactUnsafeReasonCodes: string[];
  noTxBoundary: {
    noActualDbExport: true;
    noRealDbQuery: true;
    noPrismaClient: true;
    noFileExport: true;
    noArtifactUpload: true;
    noDockerSmokeChange: true;
    noTxSend: true;
    noRuntimeReadiness: true;
    noProductionReadiness: true;
    stagingNoTxPassClaimed: false;
  };
  ownerReviewSummary: {
    ownerReviewReadyIsPass: false;
    ownerReviewReadyIsStagingReady: false;
    ownerReviewReadyIsRuntimeReady: false;
    ownerReviewReadyIsProductionReady: false;
    d8DigestProvided: boolean;
    ownerReviewPacketProvided: boolean;
    stagingNoTxEvidenceProvided: boolean;
    safeDbReadExportPackageProvided: boolean;
    safeSummaryOnly: true;
  };
  operatorSummary: {
    operatorId: SafePresenceSummary;
    reviewerId: SafePresenceSummary;
    runKey: SafePresenceSummary;
    sourceHeadSha: SafePresenceSummary;
    sourceHash: SafePresenceSummary;
    exportedAt: SafePresenceSummary;
  };
  nextSafeAction: NextSafeAction;
};

const SAFE_STATUS_FALLBACK = 'missing';
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
  /raw\s+(?:jsonl|wallet|txhash|checkpoint|env|path|provider|error|payload)/i
];

const FORBIDDEN_KEY_PATTERNS = [
  /jsonl/i,
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

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const safePresence = (value: unknown): SafePresenceSummary => ({
  provided: value !== undefined && value !== null && String(value).trim().length > 0,
  safeSummaryOnly: true
});

const safeStatus = (value: unknown): string => (
  typeof value === 'string' && value.trim().length > 0 ? value : SAFE_STATUS_FALLBACK
);

const safeCount = (value: unknown): number => (
  Number.isInteger(value) && Number(value) >= 0 ? Number(value) : 0
);

const safeRecord = (value: unknown): Record<string, number> => {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] => (
        typeof entry[1] === 'number' &&
        Number.isInteger(entry[1]) &&
        entry[1] >= 0
      ))
      .sort(([left], [right]) => left.localeCompare(right))
  );
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
      !/sha256Summary$/i.test(key) &&
      !/^no[A-Z]/.test(key) &&
      FORBIDDEN_KEY_PATTERNS.some((pattern) => pattern.test(key))
    ) {
      add(unsafe, `forbidden_key:${path}.${key}`);
    }
    inspectUnsafeShape(entry, unsafe, `${path}.${key}`);
  }
};

const appendCodes = (
  target: Set<string>,
  codes: unknown,
  prefix: string
): void => {
  if (!Array.isArray(codes)) return;
  for (const code of codes) {
    if (typeof code === 'string' && code.trim().length > 0) add(target, `${prefix}:${code}`);
  }
};

const requireCleanBoundary = (
  input: BuildTierUpdateD8StagingOwnerReviewRefreshInput,
  blockers: Set<string>
): void => {
  const pkg = input.safeDbReadExportPackage;
  const digest = input.d8EvidenceDigest;
  const owner = input.ownerReviewPacket;
  const staging = input.stagingNoTxEvidence;

  if (pkg?.readinessClaim !== 'none') add(blockers, 'safe_db_read_export_readiness_claim_not_none');
  if (pkg?.stagingNoTxPreflightStatus !== 'BLOCKED') add(blockers, 'safe_db_read_export_staging_status_not_blocked');
  if (pkg?.actualDbExport !== false) add(blockers, 'actual_db_export_boundary_violation');
  if (pkg?.realDbQuery !== false) add(blockers, 'real_db_query_boundary_violation');
  if (pkg?.prismaClientUsed !== false) add(blockers, 'prisma_client_boundary_violation');
  if (pkg?.fileExported !== false) add(blockers, 'file_export_boundary_violation');
  if (pkg?.artifactUploaded !== false) add(blockers, 'artifact_upload_boundary_violation');
  if (pkg?.dockerSmoke !== false) add(blockers, 'docker_smoke_change_boundary_violation');
  if (pkg?.runtimeReadinessClaimed !== false) add(blockers, 'runtime_readiness_claimed');
  if (pkg?.productionReadinessClaimed !== false) add(blockers, 'production_readiness_claimed');

  if (digest?.readinessClaim !== 'none') add(blockers, 'd8_digest_readiness_claim_not_none');
  if (digest?.stagingNoTxPreflightStatus !== 'BLOCKED') add(blockers, 'd8_digest_staging_status_not_blocked');
  if (digest?.actualDbExport !== false) add(blockers, 'd8_digest_actual_db_export_boundary_violation');
  if (digest?.realDbQuery !== false) add(blockers, 'd8_digest_real_db_query_boundary_violation');
  if (digest?.prismaClientUsed !== false) add(blockers, 'd8_digest_prisma_client_boundary_violation');
  if (digest?.fileExported !== false) add(blockers, 'd8_digest_file_export_boundary_violation');
  if (digest?.artifactUploaded !== false) add(blockers, 'd8_digest_artifact_upload_boundary_violation');
  if (digest?.dockerSmoke !== false) add(blockers, 'd8_digest_docker_smoke_boundary_violation');
  if (digest?.runtimeReadinessClaimed !== false) add(blockers, 'd8_digest_runtime_readiness_claimed');
  if (digest?.productionReadinessClaimed !== false) add(blockers, 'd8_digest_production_readiness_claimed');

  if (owner?.readinessClaim !== 'none') add(blockers, 'owner_review_readiness_claim_not_none');
  if (owner?.stagingNoTxPreflightStatus !== 'BLOCKED') add(blockers, 'owner_review_staging_status_not_blocked');
  if (owner?.reviewReadiness?.runtimeReadinessClaimed !== false) add(blockers, 'owner_review_runtime_readiness_claimed');
  if (owner?.reviewReadiness?.stagingNoTxPassClaimed !== false) add(blockers, 'owner_review_staging_pass_claimed');

  if (staging?.readinessClaim !== 'none') add(blockers, 'staging_evidence_readiness_claim_not_none');
  if (staging?.stagingNoTxPreflightStatus !== 'BLOCKED') add(blockers, 'staging_evidence_status_not_blocked');
};

const determineNextSafeAction = (
  input: BuildTierUpdateD8StagingOwnerReviewRefreshInput,
  unsafeCount: number,
  blockerCount: number,
  recordCount: number,
  status: RefreshStatus
): NextSafeAction => {
  if (input.d8EvidenceDigest === undefined) return 'build_compact_d8_evidence_operator_digest';
  if (input.stagingNoTxEvidence === undefined) return 'build_staging_no_tx_owner_review_evidence';
  if (unsafeCount > 0) return 'review_unsafe_staging_owner_evidence';
  if (blockerCount > 0 || status === 'BLOCKED') return 'resolve_owner_review_blockers';
  if (recordCount <= 0) return 'add_mock_or_injected_safe_rows';
  return 'prepare_pr_d8l_actual_safe_row_export_plan';
};

export const buildTierUpdateD8StagingOwnerReviewRefresh = (
  input: BuildTierUpdateD8StagingOwnerReviewRefreshInput
): TierUpdateD8StagingOwnerReviewRefresh => {
  const blockers = new Set<string>();
  const unsafeReasonCodes = new Set<string>();

  if (input.d8EvidenceDigest === undefined) add(blockers, 'd8_evidence_digest_missing');
  if (input.ownerReviewPacket === undefined) add(blockers, 'owner_review_packet_missing');
  if (input.stagingNoTxEvidence === undefined) add(blockers, 'staging_no_tx_evidence_missing');
  if (input.safeDbReadExportPackage === undefined) add(blockers, 'safe_db_read_export_package_missing');

  if (input.d8EvidenceDigest?.status === 'BLOCKED') add(blockers, 'd8_evidence_digest_blocked');
  if (input.ownerReviewPacket?.status === 'BLOCKED') add(blockers, 'owner_review_packet_blocked');
  if (input.stagingNoTxEvidence?.status === 'BLOCKED') add(blockers, 'staging_no_tx_evidence_blocked');
  if (input.safeDbReadExportPackage?.status === 'BLOCKED') add(blockers, 'safe_db_read_export_package_blocked');

  appendCodes(blockers, input.d8EvidenceDigest?.compactBlockerCodes, 'd8Digest');
  appendCodes(unsafeReasonCodes, input.d8EvidenceDigest?.compactUnsafeReasonCodes, 'd8Digest');
  appendCodes(blockers, input.ownerReviewPacket?.blockers, 'ownerReviewPacket');
  appendCodes(unsafeReasonCodes, input.ownerReviewPacket?.unsafeReasonCodes, 'ownerReviewPacket');
  appendCodes(blockers, input.stagingNoTxEvidence?.blockers, 'stagingEvidence');
  appendCodes(blockers, input.safeDbReadExportPackage?.blockers, 'safeDbReadExportPackage');
  appendCodes(unsafeReasonCodes, input.safeDbReadExportPackage?.unsafeReasonCodes, 'safeDbReadExportPackage');

  inspectUnsafeShape(input.d8EvidenceDigest, unsafeReasonCodes, 'd8EvidenceDigest');
  inspectUnsafeShape(input.ownerReviewPacket, unsafeReasonCodes, 'ownerReviewPacket');
  inspectUnsafeShape(input.stagingNoTxEvidence, unsafeReasonCodes, 'stagingNoTxEvidence');
  inspectUnsafeShape(input.safeDbReadExportPackage, unsafeReasonCodes, 'safeDbReadExportPackage');
  requireCleanBoundary(input, blockers);

  const recordCount = safeCount(input.safeDbReadExportPackage?.recordCount ?? input.d8EvidenceDigest?.recordCount);
  const entityCounts = safeRecord(input.safeDbReadExportPackage?.entityCounts ?? input.d8EvidenceDigest?.entityCounts);
  const compactBlockerCodes = compactCodes(blockers);
  const compactUnsafeReasonCodes = compactCodes(unsafeReasonCodes);
  const hasHardBlocker = compactBlockerCodes.length > 0 || compactUnsafeReasonCodes.length > 0;
  const ownerReviewReady =
    input.d8EvidenceDigest?.status === 'OWNER_REVIEW_READY' &&
    input.ownerReviewPacket?.status === 'OWNER_REVIEW_READY' &&
    input.stagingNoTxEvidence?.stagingNoTxPreflightStatus === 'BLOCKED' &&
    input.safeDbReadExportPackage?.status === 'EXPORT_PACKAGE_READY' &&
    recordCount > 0 &&
    !hasHardBlocker;
  const status: RefreshStatus = hasHardBlocker
    ? 'BLOCKED'
    : ownerReviewReady
      ? 'OWNER_REVIEW_READY'
      : 'NEEDS_REVIEW';

  return {
    refreshKind: TIER_UPDATE_D8_STAGING_OWNER_REVIEW_REFRESH_KIND,
    schemaVersion: TIER_UPDATE_D8_STAGING_OWNER_REVIEW_REFRESH_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: 'd8_staging_owner_review_refresh',
    stagingNoTxPreflightStatus: 'BLOCKED',
    readinessClaim: 'none',
    d8DigestStatus: safeStatus(input.d8EvidenceDigest?.status),
    ownerReviewPacketStatus: safeStatus(input.ownerReviewPacket?.status),
    safeDbReadExportPackageStatus: safeStatus(input.safeDbReadExportPackage?.status),
    stagingEvidenceStatus: safeStatus(input.stagingNoTxEvidence?.status),
    recordCount,
    entityCounts,
    blockerCount: compactBlockerCodes.length,
    unsafeReasonCount: compactUnsafeReasonCodes.length,
    compactBlockerCodes,
    compactUnsafeReasonCodes,
    noTxBoundary: {
      noActualDbExport: true,
      noRealDbQuery: true,
      noPrismaClient: true,
      noFileExport: true,
      noArtifactUpload: true,
      noDockerSmokeChange: true,
      noTxSend: true,
      noRuntimeReadiness: true,
      noProductionReadiness: true,
      stagingNoTxPassClaimed: false
    },
    ownerReviewSummary: {
      ownerReviewReadyIsPass: false,
      ownerReviewReadyIsStagingReady: false,
      ownerReviewReadyIsRuntimeReady: false,
      ownerReviewReadyIsProductionReady: false,
      d8DigestProvided: input.d8EvidenceDigest !== undefined,
      ownerReviewPacketProvided: input.ownerReviewPacket !== undefined,
      stagingNoTxEvidenceProvided: input.stagingNoTxEvidence !== undefined,
      safeDbReadExportPackageProvided: input.safeDbReadExportPackage !== undefined,
      safeSummaryOnly: true
    },
    operatorSummary: {
      operatorId: safePresence(input.operatorId),
      reviewerId: safePresence(input.reviewerId),
      runKey: safePresence(input.runKey),
      sourceHeadSha: safePresence(input.sourceHeadSha),
      sourceHash: safePresence(input.sourceHash),
      exportedAt: safePresence(input.exportedAt)
    },
    nextSafeAction: determineNextSafeAction(input, compactUnsafeReasonCodes.length, compactBlockerCodes.length, recordCount, status)
  };
};
