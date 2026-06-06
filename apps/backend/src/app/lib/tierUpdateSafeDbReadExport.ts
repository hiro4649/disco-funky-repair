import {
  buildJobRunSafeRowExportRecord,
  buildTierUpdateReceiptEvidenceSafeRow,
  buildTierUpdateSafeRowExportRecord,
  buildTierUpdateStagingEvidenceSafeRow,
  type JobRunSafeRowInput,
  type ReceiptEvidenceSafeRowInput,
  type ScheduledTierUpdateSafeRowInput,
  type StagingEvidenceSafeRowInput,
  type TierUpdateSafeRowExportRecord
} from './tierUpdateSafeRowExport';
import {
  buildOperatorControlledTierUpdateSafeRowPackage
} from './tierUpdateSafeRowOperatorPackage';
import {
  buildTierUpdateOperatorReviewPacket,
  type TierUpdateOperatorReviewPacket
} from './tierUpdateOperatorReviewPacket';
import type {
  TierUpdateStagingNoTxPreflightEvidence
} from './tierUpdateStagingNoTxPreflightEvidence';

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_KIND =
  'tier_update_safe_db_read_export_foundation' as const;

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT = 100;

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES = [
  'scheduled_tier_update',
  'job_run',
  'tx_receipt_evidence',
  'staging_evidence'
] as const;

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES = [
  'prize',
  'prize_transaction',
  'wallet_summary',
  'nft_metadata',
  'token_detail',
  'ticket_code',
  'fixture',
  'evaluation',
  'test'
] as const;

type AllowedEntity = typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES[number];
type DeferredEntity = typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES[number];
type ReadinessClaim = 'none' | 'local_ready' | 'remote_gate_pass' | 'staging_no_tx_evidence';
type EvidenceOrigin = 'db_safe_summary' | 'local_test' | 'remote_gate' | 'staging_no_tx_evidence';
type FoundationStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'EXPORT_EVIDENCE_READY';

type SafeDbReadExportPlanStatus = 'READY' | 'BLOCKED' | 'DEFERRED';

type SafeDbReadExportLogger = {
  warn?: (message: string, metadata?: Record<string, unknown>) => void;
};

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST: Record<AllowedEntity, readonly string[]> = {
  scheduled_tier_update: [
    'id',
    'userId',
    'scheduledAt',
    'expectedTier',
    'currentTier',
    'processed',
    'status',
    'attempt',
    'maxAttempts',
    'lockedBy',
    'lockedAt',
    'heartbeatAt',
    'lockExpiresAt',
    'batchId',
    'txHash',
    'txChainId',
    'txContractAddress',
    'txFrom',
    'txTo',
    'txBlockNumber',
    'txReceiptStatus',
    'txReceiptTimestamp',
    'txGasUsed',
    'sentAt',
    'confirmedAt',
    'failedAt',
    'safeErrorKind',
    'safeSummary'
  ],
  job_run: [
    'id',
    'jobName',
    'runKey',
    'status',
    'startedAt',
    'finishedAt',
    'heartbeatAt',
    'attempt',
    'maxAttempts',
    'lockedBy',
    'checkpoint',
    'safeErrorKind',
    'safeSummary'
  ],
  tx_receipt_evidence: [
    'txHash',
    'txChainId',
    'txContractAddress',
    'txFrom',
    'txTo',
    'txBlockNumber',
    'txReceiptStatus',
    'confirmationDepth',
    'finalityStatus',
    'lastCheckedAt',
    'safeErrorKind',
    'reconciliationStatus',
    'manualReviewReason',
    'resumeKey'
  ],
  staging_evidence: [
    'stagingNoTxPreflightStatus',
    'readinessClaim',
    'noTxExecution',
    'noFundedTx',
    'noMint',
    'noSendToWallet',
    'noGovernanceTx',
    'noTierUpdaterTx',
    'noDeploy',
    'noStagingRollout',
    'noRpcUrlEnvReading',
    'noProviderConstruction',
    'noWalletConstruction',
    'noContractConstruction',
    'noAutoStart',
    'noCronWiring',
    'noMainAutoStart',
    'noTrackingServiceAutoStart',
    'safeOutputOnly'
  ]
};

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS = [
  'privateKey',
  'private_key',
  'secret',
  'jwt',
  'cookie',
  'authorization',
  'authHeader',
  'dbUrl',
  'databaseUrl',
  'DATABASE_URL',
  'rpcUrl',
  'RPC_URL',
  'endpoint',
  'rawEnv',
  'rawLog',
  'rawPayload',
  'rawReceipt',
  'rawProviderError',
  'rawError',
  'localImagePath',
  'localPath',
  'privatePath',
  'filePath',
  'fullWallet',
  'walletAddressRaw',
  'providerResponse',
  'requestBody',
  'responseBody',
  'stackTrace',
  'rawCheckpoint',
  'rawTxHash',
  'rawWallet',
  'rawDbRow'
] as const;

const FORBIDDEN_SOURCE_KEYS = new Set([
  'create',
  'update',
  'upsert',
  'delete',
  'deleteMany',
  'updateMany',
  'executeRaw',
  'queryRaw',
  'transaction',
  '$transaction',
  '$executeRaw',
  '$queryRaw',
  'prisma',
  'db',
  'client'
]);

const FORBIDDEN_KEY_NAMES = new Set(
  TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS.map((key) => key.replace(/[^a-z0-9_]/gi, '').toLowerCase())
);

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
  /raw\s+receipt/i,
  /raw\s+provider/i,
  /raw\s+payload/i,
  /private\s+path/i
];

const SHA_PATTERN = /^[a-f0-9]{40}$/i;
const SAFE_TOKEN_PATTERN = /^[a-z0-9_.:-]+$/i;

export type TierUpdateSafeDbReadExportPlan = {
  status: SafeDbReadExportPlanStatus;
  entities: AllowedEntity[];
  rowLimit: number;
  auditExportId: string;
  sourceHeadSha: string | null;
  sourceHash: string | null;
  exportedAt: Date | null;
  readinessClaim: ReadinessClaim;
  evidenceOrigin: EvidenceOrigin;
  deferredEntities: string[];
  blockers: string[];
  missingEvidence: string[];
  unsafeReasonCodes: string[];
  safeSummaryOnly: true;
};

export type BuildTierUpdateSafeDbReadExportPlanInput = {
  entities?: string[];
  rowLimit?: number;
  auditExportId?: string;
  sourceHeadSha?: string;
  sourceHash?: string;
  exportedAt?: Date;
  readinessClaim?: string;
  evidenceOrigin?: string;
  logger?: SafeDbReadExportLogger;
};

export type TierUpdateSafeDbReadSourcePlan = Pick<
  TierUpdateSafeDbReadExportPlan,
  'entities' | 'rowLimit' | 'auditExportId' | 'sourceHeadSha' | 'sourceHash' | 'exportedAt' | 'readinessClaim' | 'evidenceOrigin'
>;

export type TierUpdateSafeDbReadOnlySource = {
  readScheduledTierUpdates?: (plan: TierUpdateSafeDbReadSourcePlan) => Promise<ScheduledTierUpdateSafeRowInput['row'][]> | ScheduledTierUpdateSafeRowInput['row'][];
  readJobRuns?: (plan: TierUpdateSafeDbReadSourcePlan) => Promise<JobRunSafeRowInput['row'][]> | JobRunSafeRowInput['row'][];
  readTxReceiptEvidence?: (plan: TierUpdateSafeDbReadSourcePlan) => Promise<ReceiptEvidenceSafeRowInput['evidence'][]> | ReceiptEvidenceSafeRowInput['evidence'][];
  readStagingEvidence?: (plan: TierUpdateSafeDbReadSourcePlan) => Promise<TierUpdateStagingNoTxPreflightEvidence[]> | TierUpdateStagingNoTxPreflightEvidence[];
};

export type RunTierUpdateSafeDbReadExportFromSourceInput = {
  readOnlySource?: TierUpdateSafeDbReadOnlySource | Record<string, unknown>;
  plan: TierUpdateSafeDbReadExportPlan;
  operatorId?: string | null;
  reviewerId?: string | null;
  runKey?: string | null;
  includeJsonl?: boolean;
  logger?: SafeDbReadExportLogger;
};

export type TierUpdateSafeDbReadExportFoundationResult = {
  status: FoundationStatus;
  exportKind: typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_KIND;
  mode: 'operator_controlled_read_only';
  planSummary: {
    entities: AllowedEntity[];
    rowLimit: number;
    auditExportId: string;
    sourceHeadSha: string | null;
    sourceHash: string | null;
    exportedAt: string | null;
    readinessClaim: 'none';
    evidenceOrigin: EvidenceOrigin;
  };
  sourceSummary: {
    readOnlySourceProvided: boolean;
    prismaClientAccepted: false;
    dbQueryExecutedByThisModule: false;
    writeMethodDetected: boolean;
    mutationMethodDetected: boolean;
    transactionMethodDetected: boolean;
  };
  packageSummary: {
    recordCount: number;
    entityCounts: Record<string, number>;
    readinessClaimCounts: Record<string, number>;
    evidenceOriginCounts: Record<string, number>;
    jsonlSha256Summary: string | null;
    includeJsonl: false;
  };
  reviewPacketSummary: {
    status: TierUpdateOperatorReviewPacket['status'];
    stagingNoTxPreflightStatus: 'BLOCKED';
    readinessClaim: 'none';
  };
  noRawDbDump: true;
  noDbQueryByModule: true;
  noPrismaClient: true;
  noFileWrite: true;
  noArtifactUpload: true;
  noRoute: true;
  noCron: true;
  noMainAutoStart: true;
  noTrackingServiceAutoStart: true;
  noRpcUrlEnvReading: true;
  noProviderConstruction: true;
  noWalletConstruction: true;
  noContractConstruction: true;
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  blockers: string[];
  missingEvidence: string[];
  unsafeReasonCodes: string[];
  safeSummaryOnly: true;
};

const normalizeKey = (key: string): string => key.replace(/[^a-z0-9_]/gi, '').toLowerCase();

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};

const isAllowedEntity = (value: string): value is AllowedEntity => (
  (TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES as readonly string[]).includes(value)
);

const isDeferredEntity = (value: string): value is DeferredEntity => (
  (TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES as readonly string[]).includes(value)
);

const safeToken = (value: unknown): string => {
  if (typeof value !== 'string') return 'unknown';
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 128 && SAFE_TOKEN_PATTERN.test(trimmed) ? trimmed : 'unknown';
};

const safeSha = (value: unknown): string | null => (
  typeof value === 'string' && SHA_PATTERN.test(value) ? value : null
);

const normalizeReadinessClaim = (value: unknown): ReadinessClaim | null => {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    value === 'none'
  ) return 'none';
  if (value === 'local_ready' || value === 'remote_gate_pass' || value === 'staging_no_tx_evidence') return value;
  return null;
};

const normalizeEvidenceOrigin = (value: unknown): EvidenceOrigin => {
  if (value === 'local_test' || value === 'remote_gate' || value === 'staging_no_tx_evidence') return value;
  return 'db_safe_summary';
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const hasUnsafeText = (value: string): boolean => (
  UNSAFE_TEXT_PATTERNS.some((pattern) => pattern.test(value))
);

const inspectValue = (value: unknown, reasons: Set<string>, path: string): void => {
  if (typeof value === 'string') {
    if (hasUnsafeText(value)) add(reasons, `unsafe_value:${path}`);
    return;
  }
  if (value === null || value === undefined || typeof value === 'number' || typeof value === 'boolean') return;
  if (value instanceof Date) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectValue(entry, reasons, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) {
    add(reasons, `unsafe_value:${path}`);
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_KEY_NAMES.has(normalizeKey(key))) add(reasons, `forbidden_key:${path}.${key}`);
    inspectValue(entry, reasons, `${path}.${key}`);
  }
};

const pickAllowedFields = <T extends Record<string, unknown>>(
  entity: AllowedEntity,
  row: T,
  reasons: Set<string>
): T => {
  const allowlist = new Set(TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST[entity]);
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (FORBIDDEN_KEY_NAMES.has(normalizeKey(key))) {
      add(reasons, `forbidden_key:${entity}.${key}`);
      continue;
    }
    if (!allowlist.has(key)) {
      add(reasons, `field_not_allowed:${entity}.${key}`);
      continue;
    }
    inspectValue(value, reasons, `${entity}.${key}`);
    output[key] = value;
  }
  return output as T;
};

export const buildTierUpdateSafeDbReadExportPlan = (
  input: BuildTierUpdateSafeDbReadExportPlanInput
): TierUpdateSafeDbReadExportPlan => {
  const blockers = new Set<string>();
  const missingEvidence = new Set<string>();
  const unsafeReasonCodes = new Set<string>();
  const deferredEntities: string[] = [];
  const entities: AllowedEntity[] = [];

  if (!Array.isArray(input.entities) || input.entities.length === 0) {
    add(blockers, 'entities_required');
    add(missingEvidence, 'entities');
  } else {
    for (const entity of input.entities) {
      if (isAllowedEntity(entity)) {
        entities.push(entity);
      } else if (isDeferredEntity(entity)) {
        deferredEntities.push(entity);
      } else {
        add(blockers, `entity_not_allowed:${safeToken(entity)}`);
      }
    }
  }

  if (deferredEntities.length > 0) add(blockers, 'deferred_entity_requested');
  if (entities.length === 0) add(missingEvidence, 'allowed_entities');

  const rowLimit = Number(input.rowLimit);
  if (!Number.isSafeInteger(rowLimit) || rowLimit <= 0) {
    add(blockers, 'row_limit_required');
    add(missingEvidence, 'rowLimit');
  } else if (rowLimit > TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT) {
    add(blockers, 'row_limit_exceeds_max');
  }

  const auditExportId = safeToken(input.auditExportId);
  const sourceHeadSha = safeSha(input.sourceHeadSha);
  const sourceHash = safeSha(input.sourceHash);
  const exportedAt = input.exportedAt instanceof Date && !Number.isNaN(input.exportedAt.getTime())
    ? input.exportedAt
    : null;
  const readinessClaim = normalizeReadinessClaim(input.readinessClaim);
  const evidenceOrigin = normalizeEvidenceOrigin(input.evidenceOrigin);

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
  if (exportedAt === null) {
    add(blockers, 'exported_at_required');
    add(missingEvidence, 'exportedAt');
  }
  if (readinessClaim === null) {
    add(blockers, 'readiness_claim_forbidden');
    add(unsafeReasonCodes, 'readiness_claim_forbidden');
  }

  const status: SafeDbReadExportPlanStatus = blockers.size > 0
    ? deferredEntities.length > 0 && Array.from(blockers).every((item) => item === 'deferred_entity_requested')
      ? 'DEFERRED'
      : 'BLOCKED'
    : 'READY';

  if (status !== 'READY') {
    input.logger?.warn?.('tier_update_safe_db_read_export_plan_not_ready', {
      status,
      blockerCount: blockers.size,
      missingEvidenceCount: missingEvidence.size,
      safeSummaryOnly: true
    });
  }

  return {
    status,
    entities,
    rowLimit: Number.isSafeInteger(rowLimit) && rowLimit > 0 ? rowLimit : 0,
    auditExportId,
    sourceHeadSha,
    sourceHash,
    exportedAt,
    readinessClaim: readinessClaim ?? 'none',
    evidenceOrigin,
    deferredEntities: deferredEntities.sort(),
    blockers: Array.from(blockers).sort(),
    missingEvidence: Array.from(missingEvidence).sort(),
    unsafeReasonCodes: Array.from(unsafeReasonCodes).sort(),
    safeSummaryOnly: true
  };
};

const inspectReadOnlySource = (
  readOnlySource: RunTierUpdateSafeDbReadExportFromSourceInput['readOnlySource'],
  blockers: Set<string>,
  unsafeReasonCodes: Set<string>
): TierUpdateSafeDbReadExportFoundationResult['sourceSummary'] => {
  const sourceProvided = readOnlySource !== undefined && readOnlySource !== null;
  let writeMethodDetected = false;
  let mutationMethodDetected = false;
  let transactionMethodDetected = false;

  if (!sourceProvided || !isPlainObject(readOnlySource)) {
    add(blockers, 'read_only_source_required');
    return {
      readOnlySourceProvided: sourceProvided,
      prismaClientAccepted: false,
      dbQueryExecutedByThisModule: false,
      writeMethodDetected,
      mutationMethodDetected,
      transactionMethodDetected
    };
  }

  for (const key of Object.keys(readOnlySource)) {
    if (FORBIDDEN_SOURCE_KEYS.has(key)) {
      if (/create|update|upsert|delete|executeRaw|queryRaw|\$executeRaw|\$queryRaw/.test(key)) writeMethodDetected = true;
      if (/create|update|upsert|delete|Many|executeRaw|queryRaw|\$executeRaw|\$queryRaw|prisma|db|client/.test(key)) mutationMethodDetected = true;
      if (/transaction|\$transaction/.test(key)) transactionMethodDetected = true;
      add(blockers, `read_only_source_forbidden_key:${key}`);
      add(unsafeReasonCodes, `read_only_source_forbidden_key:${key}`);
    }
  }

  return {
    readOnlySourceProvided: true,
    prismaClientAccepted: false,
    dbQueryExecutedByThisModule: false,
    writeMethodDetected,
    mutationMethodDetected,
    transactionMethodDetected
  };
};

const readRows = async <T>(
  reader: ((plan: TierUpdateSafeDbReadSourcePlan) => Promise<T[]> | T[]) | undefined,
  plan: TierUpdateSafeDbReadExportPlan
): Promise<T[]> => {
  if (!reader) return [];
  const rows = await reader({
    entities: plan.entities,
    rowLimit: plan.rowLimit,
    auditExportId: plan.auditExportId,
    sourceHeadSha: plan.sourceHeadSha,
    sourceHash: plan.sourceHash,
    exportedAt: plan.exportedAt,
    readinessClaim: plan.readinessClaim,
    evidenceOrigin: plan.evidenceOrigin
  });
  return Array.isArray(rows) ? rows.slice(0, plan.rowLimit) : [];
};

const makeStagingEvidenceForPacket = (
  evidence: TierUpdateStagingNoTxPreflightEvidence | undefined,
  plan: TierUpdateSafeDbReadExportPlan
): (TierUpdateStagingNoTxPreflightEvidence & { auditExportId: string; sourceHash: string | null; exportedAt: string | null }) | undefined => (
  evidence
    ? {
      ...evidence,
      auditExportId: plan.auditExportId,
      sourceHash: plan.sourceHash,
      exportedAt: plan.exportedAt?.toISOString() ?? null
    }
    : undefined
);

export const runTierUpdateSafeDbReadExportFromSource = async (
  input: RunTierUpdateSafeDbReadExportFromSourceInput
): Promise<TierUpdateSafeDbReadExportFoundationResult> => {
  const blockers = new Set<string>(input.plan.blockers);
  const missingEvidence = new Set<string>(input.plan.missingEvidence);
  const unsafeReasonCodes = new Set<string>(input.plan.unsafeReasonCodes);
  const sourceSummary = inspectReadOnlySource(input.readOnlySource, blockers, unsafeReasonCodes);
  const records: TierUpdateSafeRowExportRecord[] = [];
  let stagingEvidenceForPacket: TierUpdateStagingNoTxPreflightEvidence | undefined;

  if (input.plan.status !== 'READY') {
    add(blockers, 'plan_not_ready');
  }

  if (blockers.size === 0 && isPlainObject(input.readOnlySource)) {
    const source = input.readOnlySource as TierUpdateSafeDbReadOnlySource;
    const auditMeta = {
      auditExportId: input.plan.auditExportId,
      evidenceOrigin: input.plan.evidenceOrigin,
      readinessClaim: 'none' as const
    };
    const common = {
      auditMeta,
      sourceHeadSha: input.plan.sourceHeadSha,
      sourceHash: input.plan.sourceHash,
      exportedAt: input.plan.exportedAt ?? undefined
    };

    if (input.plan.entities.includes('scheduled_tier_update')) {
      const rows = await readRows(source.readScheduledTierUpdates, input.plan);
      for (const row of rows) {
        const safeRow = pickAllowedFields('scheduled_tier_update', row as Record<string, unknown>, unsafeReasonCodes);
        records.push(buildTierUpdateSafeRowExportRecord({ ...common, row: safeRow }));
      }
    }

    if (input.plan.entities.includes('job_run')) {
      const rows = await readRows(source.readJobRuns, input.plan);
      for (const row of rows) {
        const safeRow = pickAllowedFields('job_run', row as Record<string, unknown>, unsafeReasonCodes);
        records.push(buildJobRunSafeRowExportRecord({ ...common, row: safeRow }));
      }
    }

    if (input.plan.entities.includes('tx_receipt_evidence')) {
      const rows = await readRows(source.readTxReceiptEvidence, input.plan);
      for (const row of rows) {
        const safeRow = pickAllowedFields('tx_receipt_evidence', row as Record<string, unknown>, unsafeReasonCodes);
        records.push(buildTierUpdateReceiptEvidenceSafeRow({ ...common, evidence: safeRow }));
      }
    }

    if (input.plan.entities.includes('staging_evidence')) {
      const rows = await readRows(source.readStagingEvidence, input.plan);
      stagingEvidenceForPacket = rows[0];
      for (const row of rows) {
        const record = {
          stagingNoTxPreflightStatus: row.stagingNoTxPreflightStatus,
          readinessClaim: row.readinessClaim,
          ...row.checks,
          safeOutputOnly: row.checks.safeOutputOnly
        };
        const safeRow = pickAllowedFields('staging_evidence', record, unsafeReasonCodes);
        records.push(buildTierUpdateStagingEvidenceSafeRow({ ...common, evidence: row }));
        inspectValue(safeRow, unsafeReasonCodes, 'staging_evidence');
      }
    }
  }

  if (records.length === 0) {
    add(missingEvidence, 'safeRows');
  }

  const operatorPackage = buildOperatorControlledTierUpdateSafeRowPackage({
    records,
    auditExportId: input.plan.auditExportId,
    sourceHeadSha: input.plan.sourceHeadSha,
    sourceHash: input.plan.sourceHash,
    exportedAt: input.plan.exportedAt ?? undefined,
    operatorId: input.operatorId,
    workerId: input.reviewerId,
    runKey: input.runKey,
    includeJsonl: input.includeJsonl === true
  });
  for (const reason of operatorPackage.unsafeReasonCodes) add(unsafeReasonCodes, reason);
  for (const missing of operatorPackage.missingMetadata) add(missingEvidence, `operatorPackage:${missing}`);

  const reviewPacket = buildTierUpdateOperatorReviewPacket({
    operatorPackage,
    stagingNoTxEvidence: makeStagingEvidenceForPacket(stagingEvidenceForPacket, input.plan),
    auditExportId: input.plan.auditExportId,
    sourceHeadSha: input.plan.sourceHeadSha,
    sourceHash: input.plan.sourceHash,
    exportedAt: input.plan.exportedAt ?? undefined,
    operatorId: input.operatorId,
    reviewerId: input.reviewerId,
    runKey: input.runKey
  });
  for (const blocker of reviewPacket.blockers) add(blockers, `reviewPacket:${blocker}`);
  for (const missing of reviewPacket.missingEvidence) add(missingEvidence, `reviewPacket:${missing}`);
  for (const reason of reviewPacket.unsafeReasonCodes) add(unsafeReasonCodes, reason);

  const status: FoundationStatus = blockers.size > 0 || unsafeReasonCodes.size > 0
    ? 'BLOCKED'
    : missingEvidence.size > 0 || reviewPacket.status === 'NEEDS_REVIEW'
      ? 'NEEDS_REVIEW'
      : 'EXPORT_EVIDENCE_READY';

  if (status !== 'EXPORT_EVIDENCE_READY') {
    input.logger?.warn?.('tier_update_safe_db_read_export_not_ready', {
      status,
      blockerCount: blockers.size,
      missingEvidenceCount: missingEvidence.size,
      safeSummaryOnly: true
    });
  }

  return {
    status,
    exportKind: TIER_UPDATE_SAFE_DB_READ_EXPORT_KIND,
    mode: 'operator_controlled_read_only',
    planSummary: {
      entities: input.plan.entities,
      rowLimit: input.plan.rowLimit,
      auditExportId: input.plan.auditExportId,
      sourceHeadSha: input.plan.sourceHeadSha,
      sourceHash: input.plan.sourceHash,
      exportedAt: input.plan.exportedAt?.toISOString() ?? null,
      readinessClaim: 'none',
      evidenceOrigin: input.plan.evidenceOrigin
    },
    sourceSummary,
    packageSummary: {
      recordCount: operatorPackage.recordCount,
      entityCounts: operatorPackage.entityCounts,
      readinessClaimCounts: operatorPackage.readinessClaimCounts,
      evidenceOriginCounts: operatorPackage.evidenceOriginCounts,
      jsonlSha256Summary: status === 'BLOCKED' ? null : operatorPackage.jsonlSha256Summary,
      includeJsonl: false
    },
    reviewPacketSummary: {
      status: reviewPacket.status,
      stagingNoTxPreflightStatus: 'BLOCKED',
      readinessClaim: 'none'
    },
    noRawDbDump: true,
    noDbQueryByModule: true,
    noPrismaClient: true,
    noFileWrite: true,
    noArtifactUpload: true,
    noRoute: true,
    noCron: true,
    noMainAutoStart: true,
    noTrackingServiceAutoStart: true,
    noRpcUrlEnvReading: true,
    noProviderConstruction: true,
    noWalletConstruction: true,
    noContractConstruction: true,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    blockers: Array.from(blockers).sort(),
    missingEvidence: Array.from(missingEvidence).sort(),
    unsafeReasonCodes: Array.from(unsafeReasonCodes).sort(),
    safeSummaryOnly: true
  };
};
