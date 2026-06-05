import {
  buildTierUpdateSafeRowEvidencePackage
} from './tierUpdateSafeRowEvidencePackage';
import type {
  TierUpdateSafeRowEvidencePackage
} from './tierUpdateSafeRowEvidencePackage';
import type { TierUpdateSafeRowExportRecord } from './tierUpdateSafeRowExport';

export const OPERATOR_CONTROLLED_TIER_UPDATE_SAFE_ROW_PACKAGE_KIND =
  'operator_controlled_tier_update_safe_row_package' as const;

type OperatorPackageStatus = 'pass' | 'fail';

type SafeIdentifierSummary = {
  provided: boolean;
  kind: 'operator_id' | 'worker_id' | 'run_key';
  safeSummaryOnly: true;
};

export type BuildOperatorControlledTierUpdateSafeRowPackageInput = {
  records: TierUpdateSafeRowExportRecord[];
  auditExportId?: string;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: Date;
  operatorId?: string | null;
  workerId?: string | null;
  runKey?: string | null;
  includeJsonl?: boolean;
  logger?: {
    info?: (message: string, metadata?: Record<string, unknown>) => void;
    warn?: (message: string, metadata?: Record<string, unknown>) => void;
    error?: (message: string, metadata?: Record<string, unknown>) => void;
  };
};

export type OperatorControlledTierUpdateSafeRowPackage = {
  status: OperatorPackageStatus;
  packageKind: typeof OPERATOR_CONTROLLED_TIER_UPDATE_SAFE_ROW_PACKAGE_KIND;
  mode: 'operator_controlled';
  includeJsonl: boolean;
  operatorSummary: SafeIdentifierSummary;
  workerSummary: SafeIdentifierSummary;
  runKeySummary: SafeIdentifierSummary;
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
  noDbQuery: true;
  noFileWrite: true;
  noArtifactUpload: true;
  noAutoStart: true;
  noCronWiring: true;
  noMainAutoStart: true;
  noTrackingServiceAutoStart: true;
  noRpcUrlEnvReading: true;
  noProviderConstruction: true;
  noWalletConstruction: true;
  noContractConstruction: true;
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  unsafeReasonCodes: string[];
  duplicateRowIds: string[];
  missingMetadata: string[];
  safeSummaryOnly: true;
};

const SAFE_OPERATOR_TOKEN_PATTERN = /^[a-z0-9_.:-]+$/i;
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

const makeIdentifierSummary = (
  value: unknown,
  kind: SafeIdentifierSummary['kind']
): SafeIdentifierSummary => ({
  provided: typeof value === 'string' && value.trim().length > 0,
  kind,
  safeSummaryOnly: true
});

const addReason = (reasons: Set<string>, reason: string): void => {
  reasons.add(reason);
};

const hasUnsafeIdentifierValue = (value: unknown): boolean => {
  if (typeof value !== 'string') {
    return true;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128 || !SAFE_OPERATOR_TOKEN_PATTERN.test(trimmed)) {
    return true;
  }

  return UNSAFE_TEXT_PATTERNS.some((pattern) => pattern.test(trimmed));
};

const validateOperatorInput = (
  input: BuildOperatorControlledTierUpdateSafeRowPackageInput,
  reasons: Set<string>,
  missingMetadata: Set<string>
): void => {
  if (!Array.isArray(input.records)) {
    addReason(reasons, 'records_array_required');
    missingMetadata.add('records');
  } else if (input.records.length === 0) {
    addReason(reasons, 'records_required');
    missingMetadata.add('records');
  }

  const identifierChecks: Array<{
    key: 'operatorId' | 'workerId' | 'runKey';
    value: unknown;
    missingReason: string;
    unsafeReason: string;
  }> = [
    {
      key: 'operatorId',
      value: input.operatorId,
      missingReason: 'operator_id_required',
      unsafeReason: 'operator_id_unsafe'
    },
    {
      key: 'workerId',
      value: input.workerId,
      missingReason: 'worker_id_required',
      unsafeReason: 'worker_id_unsafe'
    },
    {
      key: 'runKey',
      value: input.runKey,
      missingReason: 'run_key_required',
      unsafeReason: 'run_key_unsafe'
    }
  ];

  for (const check of identifierChecks) {
    if (check.value === undefined || check.value === null || String(check.value).trim().length === 0) {
      addReason(reasons, check.missingReason);
      missingMetadata.add(check.key);
      continue;
    }

    if (hasUnsafeIdentifierValue(check.value)) {
      addReason(reasons, check.unsafeReason);
    }
  }
};

const mergeReasons = (
  packageResult: TierUpdateSafeRowEvidencePackage,
  operatorReasons: Set<string>
): string[] => (
  Array.from(new Set([
    ...packageResult.unsafeReasonCodes,
    ...Array.from(operatorReasons)
  ])).sort()
);

export const buildOperatorControlledTierUpdateSafeRowPackage = (
  input: BuildOperatorControlledTierUpdateSafeRowPackageInput
): OperatorControlledTierUpdateSafeRowPackage => {
  const operatorReasons = new Set<string>();
  const operatorMissingMetadata = new Set<string>();
  const records = Array.isArray(input.records) ? input.records : [];
  const includeJsonl = input.includeJsonl === true;

  validateOperatorInput(input, operatorReasons, operatorMissingMetadata);

  const packageResult = buildTierUpdateSafeRowEvidencePackage({
    records,
    auditExportId: input.auditExportId,
    sourceHeadSha: input.sourceHeadSha,
    sourceHash: input.sourceHash,
    exportedAt: input.exportedAt,
    includeJsonl
  });
  const unsafeReasonCodes = mergeReasons(packageResult, operatorReasons);
  const missingMetadata = Array.from(new Set([
    ...packageResult.missingMetadata,
    ...Array.from(operatorMissingMetadata)
  ])).sort();
  const status: OperatorPackageStatus = packageResult.status === 'pass' &&
    unsafeReasonCodes.length === 0 &&
    missingMetadata.length === 0
    ? 'pass'
    : 'fail';

  return {
    status,
    packageKind: OPERATOR_CONTROLLED_TIER_UPDATE_SAFE_ROW_PACKAGE_KIND,
    mode: 'operator_controlled',
    includeJsonl,
    operatorSummary: makeIdentifierSummary(input.operatorId, 'operator_id'),
    workerSummary: makeIdentifierSummary(input.workerId, 'worker_id'),
    runKeySummary: makeIdentifierSummary(input.runKey, 'run_key'),
    auditExportId: packageResult.auditExportId,
    sourceHeadSha: packageResult.sourceHeadSha,
    sourceHash: packageResult.sourceHash,
    exportedAt: packageResult.exportedAt,
    recordCount: packageResult.recordCount,
    entityCounts: packageResult.entityCounts,
    readinessClaimCounts: packageResult.readinessClaimCounts,
    evidenceOriginCounts: packageResult.evidenceOriginCounts,
    jsonlLineCount: status === 'pass' ? packageResult.jsonlLineCount : 0,
    jsonlSha256Summary: status === 'pass' ? packageResult.jsonlSha256Summary : null,
    jsonl: status === 'pass' && includeJsonl ? packageResult.jsonl : null,
    noDbQuery: true,
    noFileWrite: true,
    noArtifactUpload: true,
    noAutoStart: true,
    noCronWiring: true,
    noMainAutoStart: true,
    noTrackingServiceAutoStart: true,
    noRpcUrlEnvReading: true,
    noProviderConstruction: true,
    noWalletConstruction: true,
    noContractConstruction: true,
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    unsafeReasonCodes,
    duplicateRowIds: packageResult.duplicateRowIds,
    missingMetadata,
    safeSummaryOnly: true
  };
};
