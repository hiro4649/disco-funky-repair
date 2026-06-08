import {
  buildTierUpdateOperatorReviewPacket,
  type TierUpdateOperatorReviewPacket
} from './tierUpdateOperatorReviewPacket';
import {
  buildOperatorControlledTierUpdateSafeRowPackage,
  type OperatorControlledTierUpdateSafeRowPackage
} from './tierUpdateSafeRowOperatorPackage';
import {
  buildTierUpdateSafeRowEvidencePackage,
  type TierUpdateSafeRowEvidencePackage
} from './tierUpdateSafeRowEvidencePackage';
import {
  buildTierUpdateSafeRowJsonl,
  type BuildTierUpdateSafeRowJsonlResult
} from './tierUpdateSafeRowExportJsonl';
import {
  TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION,
  type TierUpdateSafeRowExportRecord
} from './tierUpdateSafeRowExport';
import type { TierUpdateSafeDbReadExportMockSafeRow } from './tierUpdateSafeDbReadExportRows';
import type { TierUpdateStagingNoTxPreflightEvidence } from './tierUpdateStagingNoTxPreflightEvidence';

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_JSONL_PACKAGE_KIND =
  'tier_update_safe_db_read_export_jsonl_package' as const;

type SafeDbReadExportJsonlPackageStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'EXPORT_PACKAGE_READY';

type SafeLogger = {
  warn?: (message: string, metadata?: Record<string, unknown>) => void;
};

type ReviewableStagingEvidence = TierUpdateStagingNoTxPreflightEvidence & {
  auditExportId?: string | null;
  sourceHash?: string | null;
  exportedAt?: string | null;
};

export type BuildTierUpdateSafeDbReadExportJsonlPackageInput = {
  rows?: TierUpdateSafeDbReadExportMockSafeRow[];
  auditExportId?: string;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: Date;
  includeJsonl?: boolean;
  operatorId?: string | null;
  reviewerId?: string | null;
  runKey?: string | null;
  stagingEvidence?: ReviewableStagingEvidence;
  logger?: SafeLogger;
};

export type TierUpdateSafeDbReadExportJsonlPackageResult = {
  status: SafeDbReadExportJsonlPackageStatus;
  packageKind: typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_JSONL_PACKAGE_KIND;
  mode: 'mock_or_injected_safe_rows_only';
  includeJsonl: boolean;
  jsonl: string | null;
  jsonlSha256Summary: string | null;
  recordCount: number;
  entityCounts: Record<string, number>;
  readinessClaimCounts: Record<string, number>;
  evidenceOriginCounts: Record<string, number>;
  serializerSummary: Pick<
    BuildTierUpdateSafeRowJsonlResult,
    'status' | 'recordCount' | 'rowIdCount' | 'duplicateRowIds' | 'newlineTerminated' | 'safeSummaryOnly'
  >;
  evidencePackageSummary: Pick<
    TierUpdateSafeRowEvidencePackage,
    'status' | 'recordCount' | 'jsonlLineCount' | 'jsonlSha256Summary' | 'duplicateRowIds' | 'missingMetadata' | 'safeSummaryOnly'
  >;
  operatorPackageSummary: Pick<
    OperatorControlledTierUpdateSafeRowPackage,
    'status' | 'includeJsonl' | 'recordCount' | 'jsonlSha256Summary' | 'duplicateRowIds' | 'missingMetadata' | 'safeSummaryOnly'
  >;
  reviewPacketSummary: Pick<
    TierUpdateOperatorReviewPacket,
    'status' | 'nextActionLabel' | 'readinessClaim' | 'stagingNoTxPreflightStatus' | 'safeSummaryOnly'
  >;
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  runtimeReadinessClaimed: false;
  productionReadinessClaimed: false;
  actualDbExport: false;
  realDbQuery: false;
  prismaClientUsed: false;
  prismaClientAccepted: false;
  databaseUrlRead: false;
  fileExported: false;
  artifactUploaded: false;
  dockerSmoke: false;
  noRawDbDump: true;
  noRoute: true;
  noCron: true;
  noMainAutoStart: true;
  noTrackingServiceAutoStart: true;
  noRpcUrlEnvReading: true;
  noProviderConstruction: true;
  noWalletConstruction: true;
  noContractConstruction: true;
  blockers: string[];
  missingEvidence: string[];
  unsafeReasonCodes: string[];
  safeSummaryOnly: true;
};

const SHA_PATTERN = /^[a-f0-9]{40}$/i;
const SAFE_TOKEN_PATTERN = /^[a-z0-9_.:-]+$/i;
const ALLOWED_ENTITIES = new Set(['scheduled_tier_update', 'job_run']);
const ALLOWED_READINESS_CLAIMS = new Set(['none']);
const REQUIRED_METADATA_KEYS = [
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

const RECORD_WRAPPER_KEYS = new Set<string>([
  ...REQUIRED_METADATA_KEYS,
  'safeSummaryOnly'
]);

const FORBIDDEN_KEY_NAMES = new Set([
  'privatekey',
  'private_key',
  'secret',
  'jwt',
  'cookie',
  'authorization',
  'authheader',
  'dburl',
  'databaseurl',
  'database_url',
  'rpcurl',
  'rpc_url',
  'endpoint',
  'rawenv',
  'rawlog',
  'rawpayload',
  'rawreceipt',
  'rawprovidererror',
  'rawerror',
  'localimagepath',
  'localpath',
  'privatepath',
  'filepath',
  'fullwallet',
  'walletaddressraw',
  'providerresponse',
  'requestbody',
  'responsebody',
  'stacktrace',
  'rawcheckpoint',
  'rawtxhash',
  'rawwallet',
  'rawdbrow'
]);

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
  /raw\s+(?:checkpoint|txhash|wallet|db|provider|payload|error)/i,
  /private\s+path/i
];

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};

const normalizeKey = (key: string): string => key.replace(/[^a-z0-9_]/gi, '').toLowerCase();

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

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

const hasUnsafeText = (value: string): boolean => UNSAFE_TEXT_PATTERNS.some((pattern) => pattern.test(value));

const inspectSafeValue = (value: unknown, unsafeReasonCodes: Set<string>, path: string): void => {
  if (typeof value === 'string') {
    if (hasUnsafeText(value)) add(unsafeReasonCodes, `unsafe_value:${path}`);
    return;
  }

  if (value === null || value === undefined || typeof value === 'number' || typeof value === 'boolean') return;

  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectSafeValue(entry, unsafeReasonCodes, `${path}[${index}]`));
    return;
  }

  if (!isPlainObject(value)) {
    add(unsafeReasonCodes, `unsafe_value:${path}`);
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_KEY_NAMES.has(normalizeKey(key))) add(unsafeReasonCodes, `forbidden_key:${path}.${key}`);
    inspectSafeValue(entry, unsafeReasonCodes, `${path}.${key}`);
  }
};

const validateInputMetadata = (
  input: BuildTierUpdateSafeDbReadExportJsonlPackageInput,
  blockers: Set<string>,
  missingEvidence: Set<string>
): { auditExportId: string; sourceHeadSha: string | null; sourceHash: string | null; exportedAt: string } => {
  const auditExportId = safeToken(input.auditExportId);
  const sourceHeadSha = safeSha(input.sourceHeadSha);
  const sourceHash = safeSha(input.sourceHash);
  const exportedAt = safeExportedAt(input.exportedAt);

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

  return { auditExportId, sourceHeadSha, sourceHash, exportedAt };
};

const recordPayloadFromSafeRow = (row: TierUpdateSafeDbReadExportMockSafeRow): Record<string, unknown> => {
  const record: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    if (!RECORD_WRAPPER_KEYS.has(key)) record[key] = value;
  }

  return record;
};

const validateSafeRow = (
  row: TierUpdateSafeDbReadExportMockSafeRow,
  metadata: { auditExportId: string; sourceHeadSha: string | null; sourceHash: string | null; exportedAt: string },
  blockers: Set<string>,
  missingEvidence: Set<string>,
  unsafeReasonCodes: Set<string>,
  index: number
): void => {
  const prefix = `row:${index}`;

  if (!isPlainObject(row)) {
    add(blockers, 'row_shape_invalid');
    add(unsafeReasonCodes, `row_shape_invalid:${index}`);
    return;
  }

  for (const key of REQUIRED_METADATA_KEYS) {
    if (row[key] === undefined || row[key] === null || String(row[key]).trim().length === 0) {
      add(blockers, `${key}_required`);
      add(missingEvidence, `${prefix}:${key}`);
    }
  }

  if (row.schema_version !== TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION) add(blockers, 'schema_version_mismatch');
  if (row.audit_export_id !== metadata.auditExportId) add(blockers, 'audit_export_id_mismatch');
  if (row.source_head_sha !== metadata.sourceHeadSha) add(blockers, 'source_head_sha_mismatch');
  if (row.source_hash !== metadata.sourceHash) add(blockers, 'source_hash_mismatch');
  if (row.exported_at !== metadata.exportedAt) add(blockers, 'exported_at_mismatch');
  if (!ALLOWED_ENTITIES.has(String(row.entity_type))) add(blockers, 'entity_not_allowed');
  if (row.evidence_origin !== 'db_safe_summary') add(blockers, 'evidence_origin_not_allowed');
  if (!ALLOWED_READINESS_CLAIMS.has(String(row.readiness_claim))) add(unsafeReasonCodes, 'readiness_claim_forbidden');
  if (row.safeSummaryOnly !== true) add(blockers, 'safe_summary_only_required');
  if (row.stagingNoTxPreflightStatus !== 'BLOCKED') add(blockers, 'staging_no_tx_status_not_blocked');
  if (row.runtimeReadinessClaimed !== false) add(blockers, 'runtime_readiness_claimed');
  if (row.productionReadinessClaimed !== false) add(blockers, 'production_readiness_claimed');

  inspectSafeValue(row, unsafeReasonCodes, prefix);
};

const toExportRecord = (row: TierUpdateSafeDbReadExportMockSafeRow): TierUpdateSafeRowExportRecord => ({
  schema_version: row.schema_version,
  audit_export_id: row.audit_export_id,
  source_head_sha: row.source_head_sha,
  source_hash: row.source_hash,
  exported_at: row.exported_at,
  row_id: row.row_id,
  entity_type: row.entity_type,
  source_table: row.source_table,
  status: row.status,
  evidence_origin: row.evidence_origin,
  readiness_claim: row.readiness_claim,
  record_summary: `${row.entity_type}:${row.row_id}`,
  public_chain_evidence: {},
  safe_flags: [
    'mock_or_injected_safe_rows_only',
    'no_actual_db_export',
    'no_file_export',
    'no_artifact_upload',
    'staging_no_tx_preflight_blocked'
  ],
  safeSummaryOnly: true,
  record: recordPayloadFromSafeRow(row)
});

const makeDefaultStagingEvidence = (
  input: BuildTierUpdateSafeDbReadExportJsonlPackageInput,
  metadata: { auditExportId: string; sourceHeadSha: string | null; sourceHash: string | null; exportedAt: string }
): ReviewableStagingEvidence => ({
  evidenceKind: 'tier_update_staging_no_tx_preflight_evidence',
  status: 'EVIDENCE_READY',
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  sourceHeadSha: metadata.sourceHeadSha,
  runIdSummary: {
    provided: typeof input.runKey === 'string' && input.runKey.trim().length > 0,
    safeSummaryOnly: true
  },
  evaluatedAt: metadata.exportedAt,
  checks: {
    noTxExecution: true,
    noFundedTx: true,
    noMint: true,
    noSendToWallet: true,
    noGovernanceTx: true,
    noTierUpdaterTx: true,
    noDeploy: true,
    noStagingRollout: true,
    noRpcUrlEnvReading: true,
    noProviderConstruction: true,
    noWalletConstruction: true,
    noContractConstruction: true,
    noAutoStart: true,
    noCronWiring: true,
    noMainAutoStart: true,
    noTrackingServiceAutoStart: true,
    safeOutputOnly: true
  },
  missingEvidence: [],
  blockers: [],
  auditExportId: metadata.auditExportId,
  sourceHash: metadata.sourceHash,
  exportedAt: metadata.exportedAt,
  safeSummaryOnly: true
});

const mergeReasons = (...items: Array<string[] | undefined>): string[] => (
  Array.from(new Set(items.flatMap((item) => item ?? []))).sort()
);

const classifyStatus = (
  blockers: string[],
  missingEvidence: string[],
  unsafeReasonCodes: string[],
  operatorPackage: OperatorControlledTierUpdateSafeRowPackage,
  reviewPacket: TierUpdateOperatorReviewPacket
): SafeDbReadExportJsonlPackageStatus => {
  if (blockers.length > 0 || unsafeReasonCodes.length > 0) return 'BLOCKED';
  if (missingEvidence.length > 0 || operatorPackage.status !== 'pass' || reviewPacket.status === 'BLOCKED') return 'NEEDS_REVIEW';
  return 'EXPORT_PACKAGE_READY';
};

export const buildTierUpdateSafeDbReadExportJsonlPackage = (
  input: BuildTierUpdateSafeDbReadExportJsonlPackageInput
): TierUpdateSafeDbReadExportJsonlPackageResult => {
  const blockers = new Set<string>();
  const missingEvidence = new Set<string>();
  const unsafeReasonCodes = new Set<string>();
  const rows = Array.isArray(input.rows) ? input.rows : [];
  const includeJsonl = input.includeJsonl === true;
  const metadata = validateInputMetadata(input, blockers, missingEvidence);

  if (!Array.isArray(input.rows)) {
    add(blockers, 'rows_array_required');
    add(missingEvidence, 'rows');
  } else if (rows.length === 0) {
    add(blockers, 'rows_required');
    add(missingEvidence, 'rows');
  }

  rows.forEach((row, index) => validateSafeRow(row, metadata, blockers, missingEvidence, unsafeReasonCodes, index));

  const records = rows.map(toExportRecord);
  const serializer = buildTierUpdateSafeRowJsonl({
    records,
    auditExportId: metadata.auditExportId,
    sourceHeadSha: metadata.sourceHeadSha,
    sourceHash: metadata.sourceHash,
    exportedAt: input.exportedAt,
    strict: true
  });
  const evidencePackage = buildTierUpdateSafeRowEvidencePackage({
    records,
    auditExportId: metadata.auditExportId,
    sourceHeadSha: metadata.sourceHeadSha,
    sourceHash: metadata.sourceHash,
    exportedAt: input.exportedAt,
    includeJsonl,
    strict: true
  });
  const operatorPackage = buildOperatorControlledTierUpdateSafeRowPackage({
    records,
    auditExportId: metadata.auditExportId,
    sourceHeadSha: metadata.sourceHeadSha,
    sourceHash: metadata.sourceHash,
    exportedAt: input.exportedAt,
    operatorId: input.operatorId,
    workerId: input.reviewerId,
    runKey: input.runKey,
    includeJsonl
  });
  const stagingEvidence = input.stagingEvidence ?? makeDefaultStagingEvidence(input, metadata);
  const reviewPacket = buildTierUpdateOperatorReviewPacket({
    operatorPackage,
    stagingNoTxEvidence: stagingEvidence,
    auditExportId: metadata.auditExportId,
    sourceHeadSha: metadata.sourceHeadSha,
    sourceHash: metadata.sourceHash,
    exportedAt: input.exportedAt,
    operatorId: input.operatorId,
    reviewerId: input.reviewerId,
    runKey: input.runKey
  });
  const mergedBlockers = mergeReasons(
    Array.from(blockers),
    evidencePackage.status === 'fail' ? ['safe_row_evidence_package_failed'] : [],
    operatorPackage.status === 'fail' ? ['operator_package_failed'] : [],
    reviewPacket.status === 'BLOCKED' ? ['review_packet_blocked'] : [],
    reviewPacket.blockers
  );
  const mergedMissingEvidence = mergeReasons(
    Array.from(missingEvidence),
    evidencePackage.missingMetadata,
    operatorPackage.missingMetadata,
    reviewPacket.missingEvidence
  );
  const mergedUnsafeReasons = mergeReasons(
    Array.from(unsafeReasonCodes),
    serializer.unsafeReasonCodes,
    evidencePackage.unsafeReasonCodes,
    operatorPackage.unsafeReasonCodes,
    reviewPacket.unsafeReasonCodes
  );
  const status = classifyStatus(mergedBlockers, mergedMissingEvidence, mergedUnsafeReasons, operatorPackage, reviewPacket);

  if (status !== 'EXPORT_PACKAGE_READY') {
    input.logger?.warn?.('tier_update_safe_db_read_export_jsonl_package_not_ready', {
      status,
      blockerCount: mergedBlockers.length,
      missingEvidenceCount: mergedMissingEvidence.length,
      unsafeReasonCodeCount: mergedUnsafeReasons.length,
      safeSummaryOnly: true
    });
  }

  return {
    status,
    packageKind: TIER_UPDATE_SAFE_DB_READ_EXPORT_JSONL_PACKAGE_KIND,
    mode: 'mock_or_injected_safe_rows_only',
    includeJsonl,
    jsonl: status === 'EXPORT_PACKAGE_READY' && includeJsonl ? evidencePackage.jsonl : null,
    jsonlSha256Summary: status === 'EXPORT_PACKAGE_READY' ? evidencePackage.jsonlSha256Summary : null,
    recordCount: records.length,
    entityCounts: evidencePackage.entityCounts,
    readinessClaimCounts: evidencePackage.readinessClaimCounts,
    evidenceOriginCounts: evidencePackage.evidenceOriginCounts,
    serializerSummary: {
      status: serializer.status,
      recordCount: serializer.recordCount,
      rowIdCount: serializer.rowIdCount,
      duplicateRowIds: serializer.duplicateRowIds,
      newlineTerminated: serializer.newlineTerminated,
      safeSummaryOnly: serializer.safeSummaryOnly
    },
    evidencePackageSummary: {
      status: evidencePackage.status,
      recordCount: evidencePackage.recordCount,
      jsonlLineCount: evidencePackage.jsonlLineCount,
      jsonlSha256Summary: evidencePackage.jsonlSha256Summary,
      duplicateRowIds: evidencePackage.duplicateRowIds,
      missingMetadata: evidencePackage.missingMetadata,
      safeSummaryOnly: evidencePackage.safeSummaryOnly
    },
    operatorPackageSummary: {
      status: operatorPackage.status,
      includeJsonl: operatorPackage.includeJsonl,
      recordCount: operatorPackage.recordCount,
      jsonlSha256Summary: operatorPackage.jsonlSha256Summary,
      duplicateRowIds: operatorPackage.duplicateRowIds,
      missingMetadata: operatorPackage.missingMetadata,
      safeSummaryOnly: operatorPackage.safeSummaryOnly
    },
    reviewPacketSummary: {
      status: reviewPacket.status,
      nextActionLabel: reviewPacket.nextActionLabel,
      readinessClaim: reviewPacket.readinessClaim,
      stagingNoTxPreflightStatus: reviewPacket.stagingNoTxPreflightStatus,
      safeSummaryOnly: reviewPacket.safeSummaryOnly
    },
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    runtimeReadinessClaimed: false,
    productionReadinessClaimed: false,
    actualDbExport: false,
    realDbQuery: false,
    prismaClientUsed: false,
    prismaClientAccepted: false,
    databaseUrlRead: false,
    fileExported: false,
    artifactUploaded: false,
    dockerSmoke: false,
    noRawDbDump: true,
    noRoute: true,
    noCron: true,
    noMainAutoStart: true,
    noTrackingServiceAutoStart: true,
    noRpcUrlEnvReading: true,
    noProviderConstruction: true,
    noWalletConstruction: true,
    noContractConstruction: true,
    blockers: mergedBlockers,
    missingEvidence: mergedMissingEvidence,
    unsafeReasonCodes: mergedUnsafeReasons,
    safeSummaryOnly: true
  };
};
