import {
  buildTierUpdateSafeDbReadExportPlan,
  runTierUpdateSafeDbReadExportFromSource,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT,
  type TierUpdateSafeDbReadExportFoundationResult,
  type TierUpdateSafeDbReadExportPlan,
  type TierUpdateSafeDbReadOnlySource,
  type TierUpdateSafeDbReadSourcePlan
} from './tierUpdateSafeDbReadExport';
import {
  buildJobRunSafeRowExportRecord,
  buildTierUpdateSafeRowExportRecord,
  TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION,
  type JobRunSafeRowInput,
  type ScheduledTierUpdateSafeRowInput,
  type TierUpdateSafeRowExportRecord
} from './tierUpdateSafeRowExport';

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROWS_KIND =
  'tier_update_safe_db_read_export_mock_rows' as const;

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_ENTITIES = [
  'scheduled_tier_update',
  'job_run'
] as const;

type MockRowEntity = typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_ENTITIES[number];
type MockRowsStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'MOCK_ROWS_READY';

type SafeValueSummary = {
  provided: boolean;
  safeSummaryOnly: true;
  kind?: string;
};

export type TierUpdateSafeDbReadExportMockSafeRow = {
  schema_version: typeof TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION;
  audit_export_id: string;
  source_head_sha: string;
  source_hash: string;
  exported_at: string;
  row_id: string;
  entity_type: MockRowEntity;
  source_table: 'ScheduledTierUpdate' | 'JobRun';
  status: string;
  evidence_origin: 'db_safe_summary';
  readiness_claim: 'none';
  safeSummaryOnly: true;
  stagingNoTxPreflightStatus: 'BLOCKED';
  runtime_wiring_status: 'not_connected';
  runtimeReadinessClaimed: false;
  productionReadinessClaimed: false;
  [key: string]: unknown;
};

export type BuildTierUpdateSafeDbReadExportMockRowsPlanInput = {
  rowLimit?: number;
  auditExportId?: string;
  sourceHeadSha?: string;
  sourceHash?: string;
  exportedAt?: Date;
  readinessClaim?: string;
};

export type TierUpdateSafeDbReadExportMockRowsPlan = {
  foundationPlan: TierUpdateSafeDbReadExportPlan;
  entities: MockRowEntity[];
  rowLimit: number;
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  safeSummaryOnly: true;
};

export type RunTierUpdateSafeDbReadExportMockRowsInput = {
  plan: TierUpdateSafeDbReadExportMockRowsPlan;
  readOnlySource?: Pick<TierUpdateSafeDbReadOnlySource, 'readScheduledTierUpdates' | 'readJobRuns'> | Record<string, unknown>;
  operatorId?: string | null;
  reviewerId?: string | null;
  runKey?: string | null;
};

export type TierUpdateSafeDbReadExportMockRowsResult = {
  status: MockRowsStatus;
  exportKind: typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROWS_KIND;
  mode: 'mock_first_read_only';
  safeRows: TierUpdateSafeDbReadExportMockSafeRow[];
  foundationSummary: {
    status: TierUpdateSafeDbReadExportFoundationResult['status'];
    packageRecordCount: number;
    reviewPacketStatus: TierUpdateSafeDbReadExportFoundationResult['reviewPacketSummary']['status'];
    stagingNoTxPreflightStatus: 'BLOCKED';
    readinessClaim: 'none';
  };
  sourceSummary: TierUpdateSafeDbReadExportFoundationResult['sourceSummary'];
  rowSummary: {
    recordCount: number;
    entityCounts: Record<string, number>;
    rowLimit: number;
    safeSummaryOnly: true;
  };
  noActualDbExport: true;
  noRawDbDump: true;
  noDbQueryByModule: true;
  noPrismaClient: true;
  noDatabaseUrlRead: true;
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
  runtimeReadinessClaimed: false;
  productionReadinessClaimed: false;
  blockers: string[];
  missingEvidence: string[];
  unsafeReasonCodes: string[];
  safeSummaryOnly: true;
};

export const TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_FORBIDDEN_KEYS = [
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
  'findFirst',
  'findMany',
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
  TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_FORBIDDEN_KEYS.map((key) => key.replace(/[^a-z0-9_]/gi, '').toLowerCase())
);

const UNSAFE_VALUE_PATTERNS = [
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
  /private\s+path/i,
  /full\s+wallet/i
];

const normalizeKey = (key: string): string => key.replace(/[^a-z0-9_]/gi, '').toLowerCase();

const add = (target: Set<string>, value: string): void => {
  target.add(value);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const hasUnsafeText = (value: string): boolean => UNSAFE_VALUE_PATTERNS.some((pattern) => pattern.test(value));

const inspectMockValue = (value: unknown, reasons: Set<string>, path: string): void => {
  if (typeof value === 'string') {
    if (hasUnsafeText(value)) add(reasons, `unsafe_value:${path}`);
    return;
  }
  if (value === null || value === undefined || typeof value === 'number' || typeof value === 'boolean') return;
  if (value instanceof Date) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectMockValue(entry, reasons, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) {
    add(reasons, `unsafe_value:${path}`);
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_KEY_NAMES.has(normalizeKey(key))) add(reasons, `forbidden_key:${path}.${key}`);
    inspectMockValue(entry, reasons, `${path}.${key}`);
  }
};

const inspectMockReadOnlySource = (
  readOnlySource: RunTierUpdateSafeDbReadExportMockRowsInput['readOnlySource'],
  blockers: Set<string>,
  unsafeReasonCodes: Set<string>
): void => {
  if (!isPlainObject(readOnlySource)) {
    add(blockers, 'read_only_source_required');
    add(unsafeReasonCodes, 'read_only_source_required');
    return;
  }

  for (const key of Object.keys(readOnlySource)) {
    if (
      key !== 'readScheduledTierUpdates' &&
      key !== 'readJobRuns'
    ) {
      add(blockers, `read_only_source_key_not_allowed:${key}`);
      add(unsafeReasonCodes, `read_only_source_key_not_allowed:${key}`);
    }
    if (FORBIDDEN_SOURCE_KEYS.has(key)) {
      add(blockers, `read_only_source_forbidden_key:${key}`);
      add(unsafeReasonCodes, `read_only_source_forbidden_key:${key}`);
    }
  }
};

const pickAllowedMockFields = <T extends Record<string, unknown>>(
  entity: MockRowEntity,
  row: T,
  unsafeReasonCodes: Set<string>
): T => {
  const allowlist = new Set(TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST[entity]);
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (FORBIDDEN_KEY_NAMES.has(normalizeKey(key))) {
      add(unsafeReasonCodes, `forbidden_key:${entity}.${key}`);
      continue;
    }
    if (!allowlist.has(key)) {
      add(unsafeReasonCodes, `field_not_allowed:${entity}.${key}`);
      continue;
    }
    inspectMockValue(value, unsafeReasonCodes, `${entity}.${key}`);
    output[key] = value;
  }
  return output as T;
};

const flattenSafeRow = (
  record: TierUpdateSafeRowExportRecord,
  entityType: MockRowEntity,
  missingEvidence: Set<string>,
  unsafeReasonCodes: Set<string>
): TierUpdateSafeDbReadExportMockSafeRow => {
  if (record.schema_version !== TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION) add(missingEvidence, 'schema_version');
  if (record.row_id.endsWith(':unknown')) add(missingEvidence, 'row_id');
  if (record.audit_export_id === 'unknown') add(missingEvidence, 'audit_export_id');
  if (record.source_head_sha === null) add(missingEvidence, 'source_head_sha');
  if (record.source_hash === null) add(missingEvidence, 'source_hash');
  if (!record.exported_at) add(missingEvidence, 'exported_at');
  if (record.readiness_claim !== 'none') add(unsafeReasonCodes, 'readiness_claim_forbidden');

  const flattened = {
    schema_version: record.schema_version,
    audit_export_id: record.audit_export_id,
    source_head_sha: record.source_head_sha ?? 'missing',
    source_hash: record.source_hash ?? 'missing',
    exported_at: record.exported_at,
    row_id: record.row_id,
    entity_type: entityType,
    source_table: record.source_table as 'ScheduledTierUpdate' | 'JobRun',
    status: record.status,
    evidence_origin: 'db_safe_summary' as const,
    readiness_claim: 'none' as const,
    safeSummaryOnly: true as const,
    ...record.record,
    stagingNoTxPreflightStatus: 'BLOCKED' as const,
    runtime_wiring_status: 'not_connected' as const,
    runtimeReadinessClaimed: false as const,
    productionReadinessClaimed: false as const
  };

  inspectMockValue(flattened, unsafeReasonCodes, `${entityType}.safeRow`);
  return flattened;
};

const readMockRows = async <T>(
  reader: ((plan: TierUpdateSafeDbReadSourcePlan) => Promise<T[]> | T[]) | undefined,
  plan: TierUpdateSafeDbReadExportMockRowsPlan
): Promise<T[]> => {
  if (!reader) return [];
  const rows = await reader({
    entities: plan.foundationPlan.entities,
    rowLimit: plan.rowLimit,
    auditExportId: plan.foundationPlan.auditExportId,
    sourceHeadSha: plan.foundationPlan.sourceHeadSha,
    sourceHash: plan.foundationPlan.sourceHash,
    exportedAt: plan.foundationPlan.exportedAt,
    readinessClaim: 'none',
    evidenceOrigin: 'db_safe_summary'
  });
  return Array.isArray(rows) ? rows.slice(0, plan.rowLimit) : [];
};

export const buildTierUpdateSafeDbReadExportMockRowsPlan = (
  input: BuildTierUpdateSafeDbReadExportMockRowsPlanInput
): TierUpdateSafeDbReadExportMockRowsPlan => {
  const foundationPlan = buildTierUpdateSafeDbReadExportPlan({
    entities: [...TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_ENTITIES],
    rowLimit: input.rowLimit,
    auditExportId: input.auditExportId,
    sourceHeadSha: input.sourceHeadSha,
    sourceHash: input.sourceHash,
    exportedAt: input.exportedAt,
    readinessClaim: input.readinessClaim,
    evidenceOrigin: 'db_safe_summary'
  });

  return {
    foundationPlan,
    entities: [...TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_ENTITIES],
    rowLimit: foundationPlan.rowLimit,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    safeSummaryOnly: true
  };
};

export const runTierUpdateSafeDbReadExportMockRowsFromSource = async (
  input: RunTierUpdateSafeDbReadExportMockRowsInput
): Promise<TierUpdateSafeDbReadExportMockRowsResult> => {
  const blockers = new Set<string>(input.plan.foundationPlan.blockers);
  const missingEvidence = new Set<string>(input.plan.foundationPlan.missingEvidence);
  const unsafeReasonCodes = new Set<string>(input.plan.foundationPlan.unsafeReasonCodes);
  inspectMockReadOnlySource(input.readOnlySource, blockers, unsafeReasonCodes);

  const source = isPlainObject(input.readOnlySource)
    ? input.readOnlySource as Pick<TierUpdateSafeDbReadOnlySource, 'readScheduledTierUpdates' | 'readJobRuns'>
    : {};
  const common = {
    auditMeta: {
      auditExportId: input.plan.foundationPlan.auditExportId,
      evidenceOrigin: 'db_safe_summary' as const,
      readinessClaim: 'none' as const
    },
    sourceHeadSha: input.plan.foundationPlan.sourceHeadSha,
    sourceHash: input.plan.foundationPlan.sourceHash,
    exportedAt: input.plan.foundationPlan.exportedAt ?? undefined
  };
  const safeRows: TierUpdateSafeDbReadExportMockSafeRow[] = [];

  if (blockers.size === 0 && input.plan.foundationPlan.status === 'READY') {
    const scheduledRows = await readMockRows(source.readScheduledTierUpdates, input.plan);
    for (const row of scheduledRows) {
      const safeRow = pickAllowedMockFields(
        'scheduled_tier_update',
        row as Record<string, unknown>,
        unsafeReasonCodes
      ) as ScheduledTierUpdateSafeRowInput['row'];
      const record = buildTierUpdateSafeRowExportRecord({ ...common, row: safeRow });
      safeRows.push(flattenSafeRow(record, 'scheduled_tier_update', missingEvidence, unsafeReasonCodes));
    }

    const jobRunRows = await readMockRows(source.readJobRuns, input.plan);
    for (const row of jobRunRows) {
      const safeRow = pickAllowedMockFields(
        'job_run',
        row as Record<string, unknown>,
        unsafeReasonCodes
      ) as JobRunSafeRowInput['row'];
      const record = buildJobRunSafeRowExportRecord({ ...common, row: safeRow });
      safeRows.push(flattenSafeRow(record, 'job_run', missingEvidence, unsafeReasonCodes));
    }
  }

  if (safeRows.length === 0 && blockers.size === 0) add(missingEvidence, 'mockSafeRows');

  const foundationResult = await runTierUpdateSafeDbReadExportFromSource({
    plan: input.plan.foundationPlan,
    readOnlySource: input.readOnlySource,
    operatorId: input.operatorId,
    reviewerId: input.reviewerId,
    runKey: input.runKey,
    includeJsonl: false
  });
  for (const blocker of foundationResult.blockers) {
    if (blocker.startsWith('reviewPacket:')) {
      add(missingEvidence, blocker);
    } else {
      add(blockers, blocker);
    }
  }
  for (const missing of foundationResult.missingEvidence) add(missingEvidence, missing);
  for (const reason of foundationResult.unsafeReasonCodes) add(unsafeReasonCodes, reason);

  const entityCounts = safeRows.reduce<Record<string, number>>((counts, row) => {
    counts[row.entity_type] = (counts[row.entity_type] ?? 0) + 1;
    return counts;
  }, {});
  const status: MockRowsStatus = blockers.size > 0 || unsafeReasonCodes.size > 0
    ? 'BLOCKED'
    : safeRows.length > 0
      ? 'MOCK_ROWS_READY'
      : 'NEEDS_REVIEW';

  return {
    status,
    exportKind: TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROWS_KIND,
    mode: 'mock_first_read_only',
    safeRows: status === 'BLOCKED' ? [] : safeRows,
    foundationSummary: {
      status: foundationResult.status,
      packageRecordCount: foundationResult.packageSummary.recordCount,
      reviewPacketStatus: foundationResult.reviewPacketSummary.status,
      stagingNoTxPreflightStatus: 'BLOCKED',
      readinessClaim: 'none'
    },
    sourceSummary: foundationResult.sourceSummary,
    rowSummary: {
      recordCount: status === 'BLOCKED' ? 0 : safeRows.length,
      entityCounts: status === 'BLOCKED' ? {} : entityCounts,
      rowLimit: input.plan.rowLimit,
      safeSummaryOnly: true
    },
    noActualDbExport: true,
    noRawDbDump: true,
    noDbQueryByModule: true,
    noPrismaClient: true,
    noDatabaseUrlRead: true,
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
    runtimeReadinessClaimed: false,
    productionReadinessClaimed: false,
    blockers: Array.from(blockers).sort(),
    missingEvidence: Array.from(missingEvidence).sort(),
    unsafeReasonCodes: Array.from(unsafeReasonCodes).sort(),
    safeSummaryOnly: true
  };
};

export const assertTierUpdateSafeDbReadExportMockRowsPolicy = (): {
  maxRowLimit: typeof TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT;
  allowedEntities: readonly MockRowEntity[];
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  safeSummaryOnly: true;
} => ({
  maxRowLimit: TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT,
  allowedEntities: TIER_UPDATE_SAFE_DB_READ_EXPORT_MOCK_ROW_ENTITIES,
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  safeSummaryOnly: true
});
