import { createHash } from 'crypto';

import {
  buildTierUpdateSafeRowJsonl,
  type BuildTierUpdateSafeRowJsonlResult
} from './tierUpdateSafeRowExportJsonl';
import type { TierUpdateSafeRowExportRecord } from './tierUpdateSafeRowExport';

export const TIER_UPDATE_SAFE_ROW_PACKAGE_SCHEMA_VERSION = 'funky_safe_row_package_v1' as const;
export const TIER_UPDATE_SAFE_ROW_PACKAGE_KIND = 'tier_update_safe_row_evidence_package' as const;

type TierUpdateSafeRowEvidencePackageStatus = 'pass' | 'fail';

export type BuildTierUpdateSafeRowEvidencePackageInput = {
  records: TierUpdateSafeRowExportRecord[];
  auditExportId?: string;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: Date;
  includeJsonl?: boolean;
  strict?: boolean;
};

export type TierUpdateSafeRowEvidencePackage = {
  status: TierUpdateSafeRowEvidencePackageStatus;
  packageKind: typeof TIER_UPDATE_SAFE_ROW_PACKAGE_KIND;
  schemaVersion: typeof TIER_UPDATE_SAFE_ROW_PACKAGE_SCHEMA_VERSION;
  auditExportId: string;
  sourceHeadSha: string | null;
  sourceHash: string | null;
  exportedAt: string;
  recordCount: number;
  entityCounts: Record<string, number>;
  readinessClaimCounts: Record<string, number>;
  evidenceOriginCounts: Record<string, number>;
  jsonlLineCount: number;
  jsonlSha256Summary: string | null;
  jsonl: string | null;
  unsafeReasonCodes: string[];
  duplicateRowIds: string[];
  missingMetadata: string[];
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  safeSummaryOnly: true;
};

const SHA_PATTERN = /^[a-f0-9]{40}$/i;
const SAFE_TOKEN_PATTERN = /^[a-z0-9_.:-]+$/i;
const ALLOWED_READINESS_CLAIMS = new Set([
  'none',
  'local_ready',
  'remote_gate_pass',
  'staging_no_tx_evidence'
]);

const REQUIRED_INPUT_KEYS = [
  'auditExportId',
  'sourceHeadSha',
  'sourceHash',
  'exportedAt'
] as const;

const safeToken = (value: unknown): string => {
  if (typeof value !== 'string') {
    return 'unknown';
  }

  const trimmed = value.trim();
  return trimmed.length > 0 && SAFE_TOKEN_PATTERN.test(trimmed) ? trimmed : 'unknown';
};

const safeSha = (value: unknown): string | null => (
  typeof value === 'string' && SHA_PATTERN.test(value) ? value : null
);

const safeExportedAt = (value: unknown): string => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return 'unknown';
};

const countBy = (
  records: TierUpdateSafeRowExportRecord[],
  key: keyof Pick<TierUpdateSafeRowExportRecord, 'entity_type' | 'readiness_claim' | 'evidence_origin'>
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const record of records) {
    const value = String(record[key] ?? 'unknown');
    counts[value] = (counts[value] ?? 0) + 1;
  }

  return counts;
};

const addReason = (reasons: Set<string>, reason: string): void => {
  reasons.add(reason);
};

const addMissingMetadata = (missingMetadata: Set<string>, key: string): void => {
  missingMetadata.add(key);
};

const validateInputMetadata = (
  input: BuildTierUpdateSafeRowEvidencePackageInput,
  reasons: Set<string>,
  missingMetadata: Set<string>
): { auditExportId: string; sourceHeadSha: string | null; sourceHash: string | null; exportedAt: string } => {
  const auditExportId = safeToken(input.auditExportId);
  const sourceHeadSha = safeSha(input.sourceHeadSha);
  const sourceHash = safeSha(input.sourceHash);
  const exportedAt = safeExportedAt(input.exportedAt);

  for (const key of REQUIRED_INPUT_KEYS) {
    if (input[key] === undefined || input[key] === null) {
      addMissingMetadata(missingMetadata, key);
    }
  }

  if (auditExportId === 'unknown') {
    addReason(reasons, 'invalid_audit_export_id');
  }

  if (sourceHeadSha === null) {
    addReason(reasons, 'invalid_source_head_sha');
  }

  if (sourceHash === null) {
    addReason(reasons, 'invalid_source_hash');
  }

  if (exportedAt === 'unknown') {
    addReason(reasons, 'invalid_exported_at');
  }

  return {
    auditExportId,
    sourceHeadSha,
    sourceHash,
    exportedAt
  };
};

const validateRecordConsistency = (
  records: TierUpdateSafeRowExportRecord[],
  expected: { auditExportId: string; sourceHeadSha: string | null; sourceHash: string | null; exportedAt: string },
  reasons: Set<string>,
  missingMetadata: Set<string>
): void => {
  records.forEach((record, index) => {
    const prefix = `record:${index}`;

    if (record.audit_export_id === undefined || record.audit_export_id === null || record.audit_export_id === '') {
      addMissingMetadata(missingMetadata, `${prefix}:audit_export_id`);
    } else if (record.audit_export_id !== expected.auditExportId) {
      addReason(reasons, 'audit_export_id_mismatch');
    }

    if (record.source_head_sha === undefined || record.source_head_sha === null || record.source_head_sha === '') {
      addMissingMetadata(missingMetadata, `${prefix}:source_head_sha`);
    } else if (record.source_head_sha !== expected.sourceHeadSha) {
      addReason(reasons, 'source_head_sha_mismatch');
    }

    if (record.source_hash === undefined || record.source_hash === null || record.source_hash === '') {
      addMissingMetadata(missingMetadata, `${prefix}:source_hash`);
    } else if (record.source_hash !== expected.sourceHash) {
      addReason(reasons, 'source_hash_mismatch');
    }

    if (record.exported_at === undefined || record.exported_at === null || record.exported_at === '') {
      addMissingMetadata(missingMetadata, `${prefix}:exported_at`);
    } else if (record.exported_at !== expected.exportedAt) {
      addReason(reasons, 'exported_at_mismatch');
    }

    if (record.safeSummaryOnly !== true) {
      addReason(reasons, 'safe_summary_only_required');
    }

    if (!ALLOWED_READINESS_CLAIMS.has(record.readiness_claim)) {
      addReason(reasons, 'readiness_claim_not_allowed');
    }

    if (
      String(record.readiness_claim) === 'runtime_ready' ||
      String(record.readiness_claim) === 'staging_ready' ||
      String(record.readiness_claim) === 'production_ready'
    ) {
      addReason(reasons, 'readiness_claim_forbidden');
    }
  });
};

const jsonlLineCount = (jsonl: string | null): number => {
  if (!jsonl) {
    return 0;
  }

  return jsonl.endsWith('\n') ? jsonl.slice(0, -1).split('\n').length : jsonl.split('\n').length;
};

const hashJsonlSummary = (jsonl: string | null): string | null => {
  if (!jsonl) {
    return null;
  }

  const digest = createHash('sha256').update(jsonl, 'utf8').digest('hex');
  return `sha256:${digest}`;
};

const buildResult = (
  input: BuildTierUpdateSafeRowEvidencePackageInput,
  serializerResult: BuildTierUpdateSafeRowJsonlResult,
  metadata: { auditExportId: string; sourceHeadSha: string | null; sourceHash: string | null; exportedAt: string },
  reasons: Set<string>,
  missingMetadata: Set<string>
): TierUpdateSafeRowEvidencePackage => {
  const records = Array.isArray(input.records) ? input.records : [];
  const mergedUnsafeReasons = new Set([
    ...serializerResult.unsafeReasonCodes,
    ...Array.from(reasons)
  ]);
  const status = serializerResult.status === 'pass' && mergedUnsafeReasons.size === 0 && missingMetadata.size === 0
    ? 'pass'
    : 'fail';
  const safeJsonl = status === 'pass' ? serializerResult.jsonl : null;

  return {
    status,
    packageKind: TIER_UPDATE_SAFE_ROW_PACKAGE_KIND,
    schemaVersion: TIER_UPDATE_SAFE_ROW_PACKAGE_SCHEMA_VERSION,
    auditExportId: metadata.auditExportId,
    sourceHeadSha: metadata.sourceHeadSha,
    sourceHash: metadata.sourceHash,
    exportedAt: metadata.exportedAt,
    recordCount: records.length,
    entityCounts: countBy(records, 'entity_type'),
    readinessClaimCounts: countBy(records, 'readiness_claim'),
    evidenceOriginCounts: countBy(records, 'evidence_origin'),
    jsonlLineCount: status === 'pass' ? jsonlLineCount(safeJsonl) : 0,
    jsonlSha256Summary: status === 'pass' ? hashJsonlSummary(safeJsonl) : null,
    jsonl: status === 'pass' && input.includeJsonl === true ? safeJsonl : null,
    unsafeReasonCodes: Array.from(mergedUnsafeReasons).sort(),
    duplicateRowIds: serializerResult.duplicateRowIds,
    missingMetadata: Array.from(missingMetadata).sort(),
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    safeSummaryOnly: true
  };
};

export const buildTierUpdateSafeRowEvidencePackage = (
  input: BuildTierUpdateSafeRowEvidencePackageInput
): TierUpdateSafeRowEvidencePackage => {
  const reasons = new Set<string>();
  const missingMetadata = new Set<string>();
  const records = Array.isArray(input.records) ? input.records : [];
  const metadata = validateInputMetadata(input, reasons, missingMetadata);

  if (!Array.isArray(input.records)) {
    addReason(reasons, 'records_array_required');
  }

  validateRecordConsistency(records, metadata, reasons, missingMetadata);

  const serializerResult = buildTierUpdateSafeRowJsonl({
    records,
    auditExportId: metadata.auditExportId,
    sourceHeadSha: metadata.sourceHeadSha,
    sourceHash: metadata.sourceHash,
    exportedAt: input.exportedAt,
    strict: input.strict
  });

  return buildResult(input, serializerResult, metadata, reasons, missingMetadata);
};
