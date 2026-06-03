import {
  TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION,
  type TierUpdateSafeRowExportRecord
} from './tierUpdateSafeRowExport';

type TierUpdateSafeRowJsonlStatus = 'pass' | 'fail';

export type BuildTierUpdateSafeRowJsonlInput = {
  records: TierUpdateSafeRowExportRecord[];
  auditExportId?: string;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: Date;
  strict?: boolean;
};

export type BuildTierUpdateSafeRowJsonlResult = {
  status: TierUpdateSafeRowJsonlStatus;
  jsonl: string | null;
  recordCount: number;
  rowIdCount: number;
  duplicateRowIds: string[];
  unsafeReasonCodes: string[];
  newlineTerminated: boolean;
  safeSummaryOnly: true;
};

const REQUIRED_KEYS = [
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

const ALLOWED_READINESS_CLAIMS = new Set([
  'none',
  'local_ready',
  'remote_gate_pass',
  'staging_no_tx_evidence'
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
  'stacktrace'
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
  /0x[a-fA-F0-9]{40,}/,
  /raw\s+receipt\s+payload/i
];

const normalizeKey = (key: string): string => key.replace(/[^a-z0-9_]/gi, '').toLowerCase();

const addReason = (reasons: Set<string>, reason: string): void => {
  reasons.add(reason);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value)
);

const hasUnsafeText = (value: string): boolean => (
  UNSAFE_TEXT_PATTERNS.some((pattern) => pattern.test(value))
);

const inspectSafeValue = (
  value: unknown,
  reasons: Set<string>,
  path: string
): void => {
  if (typeof value === 'string') {
    if (hasUnsafeText(value)) {
      addReason(reasons, `unsafe_value:${path}`);
    }
    return;
  }

  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => inspectSafeValue(entry, reasons, `${path}[${index}]`));
    return;
  }

  if (!isPlainObject(value)) {
    addReason(reasons, `unsafe_value:${path}`);
    return;
  }

  for (const [key, entry] of Object.entries(value)) {
    const normalizedKey = normalizeKey(key);
    if (FORBIDDEN_KEY_NAMES.has(normalizedKey)) {
      addReason(reasons, `forbidden_key:${path}.${key}`);
    }
    inspectSafeValue(entry, reasons, `${path}.${key}`);
  }
};

const validateRequiredMetadata = (
  record: TierUpdateSafeRowExportRecord,
  reasons: Set<string>
): void => {
  for (const key of REQUIRED_KEYS) {
    const value = record[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      addReason(reasons, `missing_required_metadata:${key}`);
    }
  }
};

const validateRecord = (
  record: TierUpdateSafeRowExportRecord,
  reasons: Set<string>
): void => {
  if (!isPlainObject(record)) {
    addReason(reasons, 'invalid_record_shape');
    return;
  }

  validateRequiredMetadata(record, reasons);

  if (record.safeSummaryOnly !== true) {
    addReason(reasons, 'safe_summary_only_required');
  }

  if (record.schema_version !== TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION) {
    addReason(reasons, 'schema_version_mismatch');
  }

  if (!ALLOWED_READINESS_CLAIMS.has(record.readiness_claim)) {
    addReason(reasons, 'readiness_claim_not_allowed');
  }

  const readinessClaim = String(record.readiness_claim);
  if (
    readinessClaim === 'runtime_ready' ||
    readinessClaim === 'staging_ready' ||
    readinessClaim === 'production_ready'
  ) {
    addReason(reasons, 'readiness_claim_forbidden');
  }

  inspectSafeValue(record, reasons, 'record');
};

const collectDuplicateRowIds = (records: TierUpdateSafeRowExportRecord[]): string[] => {
  const counts = new Map<string, number>();
  for (const record of records) {
    if (typeof record.row_id === 'string') {
      counts.set(record.row_id, (counts.get(record.row_id) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([rowId]) => rowId)
    .sort();
};

const makeFailure = (
  records: TierUpdateSafeRowExportRecord[],
  duplicateRowIds: string[],
  reasons: Set<string>
): BuildTierUpdateSafeRowJsonlResult => ({
  status: 'fail',
  jsonl: null,
  recordCount: records.length,
  rowIdCount: new Set(records.map((record) => record.row_id)).size,
  duplicateRowIds,
  unsafeReasonCodes: Array.from(reasons).sort(),
  newlineTerminated: false,
  safeSummaryOnly: true
});

export const buildTierUpdateSafeRowJsonl = (
  input: BuildTierUpdateSafeRowJsonlInput
): BuildTierUpdateSafeRowJsonlResult => {
  const reasons = new Set<string>();
  const records = Array.isArray(input.records) ? input.records : [];
  const duplicateRowIds = collectDuplicateRowIds(records);

  if (!Array.isArray(input.records)) {
    addReason(reasons, 'records_array_required');
  }

  if (duplicateRowIds.length > 0) {
    addReason(reasons, 'duplicate_row_id');
  }

  for (const record of records) {
    validateRecord(record, reasons);
  }

  if (reasons.size > 0) {
    return makeFailure(records, duplicateRowIds, reasons);
  }

  const jsonl = records.length === 0
    ? ''
    : `${records.map((record) => JSON.stringify(record)).join('\n')}\n`;

  return {
    status: 'pass',
    jsonl,
    recordCount: records.length,
    rowIdCount: new Set(records.map((record) => record.row_id)).size,
    duplicateRowIds: [],
    unsafeReasonCodes: [],
    newlineTerminated: records.length > 0,
    safeSummaryOnly: true
  };
};
