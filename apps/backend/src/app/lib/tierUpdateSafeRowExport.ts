import type {
  TierUpdateReceiptReconciliationItem
} from './tierUpdateReceiptReconciliationService';
import type {
  OperatorControlledReceiptReconciliationEvidence
} from './tierUpdateReceiptReconciliationEvidence';
import type {
  TierUpdateStagingNoTxPreflightEvidence
} from './tierUpdateStagingNoTxPreflightEvidence';

export const TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION = 'funky_safe_row_v1' as const;

type EntityType =
  | 'scheduled_tier_update'
  | 'job_run'
  | 'tx_receipt_evidence'
  | 'staging_evidence';

type SourceTable = 'ScheduledTierUpdate' | 'JobRun' | 'none';

type EvidenceOrigin =
  | 'db_safe_summary'
  | 'local_test'
  | 'remote_gate'
  | 'staging_no_tx_evidence'
  | 'unknown';

type ReadinessClaim =
  | 'none'
  | 'local_ready'
  | 'remote_gate_pass'
  | 'staging_no_tx_evidence';

type SafePresenceSummary = {
  provided: boolean;
  safeSummaryOnly: true;
};

type SafeValueSummary = SafePresenceSummary & {
  kind: 'id' | 'address' | 'tx_hash' | 'batch_id' | 'timestamp' | 'number' | 'json' | 'text';
};

type AuditMeta = {
  auditExportId?: string;
  evidenceOrigin?: EvidenceOrigin;
  readinessClaim?: ReadinessClaim | string;
};

type SafeRowInput = {
  auditMeta?: AuditMeta;
  sourceHeadSha?: string | null;
  sourceHash?: string | null;
  exportedAt?: Date;
};

export type ScheduledTierUpdateSafeRowInput = SafeRowInput & {
  row: {
    id?: number | string | bigint | null;
    userId?: number | string | bigint | null;
    scheduledAt?: Date | string | null;
    expectedTier?: number | null;
    currentTier?: number | null;
    processed?: boolean | null;
    status?: string | null;
    attempt?: number | null;
    maxAttempts?: number | null;
    lockedBy?: string | null;
    lockedAt?: Date | string | null;
    heartbeatAt?: Date | string | null;
    lockExpiresAt?: Date | string | null;
    batchId?: string | null;
    txHash?: string | null;
    txChainId?: number | null;
    txContractAddress?: string | null;
    txFrom?: string | null;
    txTo?: string | null;
    txBlockNumber?: bigint | number | string | null;
    txReceiptStatus?: number | null;
    txReceiptTimestamp?: Date | string | null;
    txGasUsed?: bigint | number | string | null;
    sentAt?: Date | string | null;
    confirmedAt?: Date | string | null;
    failedAt?: Date | string | null;
    safeErrorKind?: string | null;
    safeSummary?: unknown;
  };
};

export type JobRunSafeRowInput = SafeRowInput & {
  row: {
    id?: number | string | bigint | null;
    jobName?: string | null;
    runKey?: string | null;
    status?: string | null;
    startedAt?: Date | string | null;
    finishedAt?: Date | string | null;
    heartbeatAt?: Date | string | null;
    attempt?: number | null;
    maxAttempts?: number | null;
    lockedBy?: string | null;
    checkpoint?: unknown;
    safeErrorKind?: string | null;
    safeSummary?: unknown;
  };
};

export type ReceiptEvidenceSafeRowInput = SafeRowInput & {
  evidence:
    | TierUpdateReceiptReconciliationItem
    | {
      scheduledTierUpdateId?: number | null;
      txHash?: string | null;
      txChainId?: number | null;
      txContractAddress?: string | null;
      txFrom?: string | null;
      txTo?: string | null;
      txBlockNumber?: bigint | number | string | null;
      txReceiptStatus?: number | null;
      confirmationDepth?: number | null;
      finalityStatus?: string | null;
      lastCheckedAt?: Date | string | null;
      safeErrorKind?: string | null;
      reconciliationStatus?: string | null;
      manualReviewReason?: string | null;
      resumeKey?: string | null;
      outcome?: string;
      reason?: string;
      stateChanged?: boolean;
    };
};

export type StagingEvidenceSafeRowInput = SafeRowInput & {
  evidence: TierUpdateStagingNoTxPreflightEvidence | OperatorControlledReceiptReconciliationEvidence;
};

export type TierUpdateSafeRowExportRecord = {
  schema_version: typeof TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION;
  audit_export_id: string;
  source_head_sha: string | null;
  source_hash: string | null;
  exported_at: string;
  row_id: string;
  entity_type: EntityType;
  source_table: SourceTable;
  status: string;
  evidence_origin: EvidenceOrigin;
  readiness_claim: ReadinessClaim;
  record_summary: string;
  public_chain_evidence: Record<string, unknown>;
  safe_flags: string[];
  safeSummaryOnly: true;
  record: Record<string, unknown>;
};

const SHA_PATTERN = /^[a-f0-9]{40}$/i;
const SAFE_TOKEN_PATTERN = /^[a-z0-9_.:-]+$/i;
const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const TX_HASH_PATTERN = /^0x[a-fA-F0-9]{64}$/;
const UNSAFE_KEY_PATTERN =
  /^(?:authorization|cookie|databaseUrl|dbUrl|endpoint|error|errorMessage|jwt|message|password|payload|privateKey|providerResponse|rawPayload|rawTx|secret|stack|url|walletAddress)$/i;
const UNSAFE_TEXT_PATTERN =
  /\b(?:Bearer\s+[A-Za-z0-9._~+/=-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+|postgres(?:ql)?:\/\/|https?:\/\/|wss?:\/\/|raw\s+payload|[A-Z]:\\|\/home\/|\/Users\/)\b|0x[a-fA-F0-9]{40,}/i;

const safePresenceSummary = (value: unknown, kind: SafeValueSummary['kind']): SafeValueSummary => ({
  provided: value !== undefined && value !== null && String(value).trim().length > 0,
  kind,
  safeSummaryOnly: true
});

const safeText = (value: unknown, fallback = 'unknown'): string => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128 || UNSAFE_TEXT_PATTERN.test(trimmed)) {
    return fallback;
  }

  return trimmed;
};

const safeToken = (value: unknown, fallback = 'unknown'): string => {
  const text = safeText(value, fallback);
  return SAFE_TOKEN_PATTERN.test(text) ? text : fallback;
};

const safeSha = (value: unknown): string | null => (
  typeof value === 'string' && SHA_PATTERN.test(value) ? value : null
);

const safeDate = (value: unknown): string | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const safeNumber = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numberValue = typeof value === 'bigint' ? Number(value) : Number(value);
  return Number.isSafeInteger(numberValue) ? numberValue : null;
};

const safeBigIntText = (value: unknown): string | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  try {
    return BigInt(value as string | number | bigint).toString();
  } catch {
    return null;
  }
};

const safeHashSummary = (value: unknown): SafeValueSummary => (
  safePresenceSummary(typeof value === 'string' && TX_HASH_PATTERN.test(value) ? value : null, 'tx_hash')
);

const safeAddressSummary = (value: unknown): SafeValueSummary => (
  safePresenceSummary(typeof value === 'string' && ADDRESS_PATTERN.test(value) ? value : null, 'address')
);

const safeJsonSummary = (value: unknown): SafeValueSummary => {
  if (value === undefined || value === null) {
    return safePresenceSummary(null, 'json');
  }

  try {
    const text = JSON.stringify(value);
    if (UNSAFE_TEXT_PATTERN.test(text)) {
      return safePresenceSummary(null, 'json');
    }
  } catch {
    return safePresenceSummary(null, 'json');
  }

  return safePresenceSummary(value, 'json');
};

const normalizeReadinessClaim = (value: unknown): ReadinessClaim => {
  if (
    value === 'local_ready' ||
    value === 'remote_gate_pass' ||
    value === 'staging_no_tx_evidence'
  ) {
    return value;
  }

  return 'none';
};

const normalizeEvidenceOrigin = (value: unknown): EvidenceOrigin => {
  if (
    value === 'db_safe_summary' ||
    value === 'local_test' ||
    value === 'remote_gate' ||
    value === 'staging_no_tx_evidence'
  ) {
    return value;
  }

  return 'unknown';
};

const baseRecord = (
  input: SafeRowInput & {
    rowId: unknown;
    entityType: EntityType;
    sourceTable: SourceTable;
    status: string;
    recordSummary: string;
    publicChainEvidence?: Record<string, unknown>;
    safeFlags?: string[];
    record: Record<string, unknown>;
  }
): TierUpdateSafeRowExportRecord => ({
  schema_version: TIER_UPDATE_SAFE_ROW_SCHEMA_VERSION,
  audit_export_id: safeToken(input.auditMeta?.auditExportId, 'unknown'),
  source_head_sha: safeSha(input.sourceHeadSha),
  source_hash: safeSha(input.sourceHash),
  exported_at: (input.exportedAt ?? new Date()).toISOString(),
  row_id: safeToken(input.rowId, 'unknown'),
  entity_type: input.entityType,
  source_table: input.sourceTable,
  status: input.status,
  evidence_origin: normalizeEvidenceOrigin(input.auditMeta?.evidenceOrigin),
  readiness_claim: normalizeReadinessClaim(input.auditMeta?.readinessClaim),
  record_summary: input.recordSummary,
  public_chain_evidence: input.publicChainEvidence ?? {},
  safe_flags: input.safeFlags ?? [],
  safeSummaryOnly: true,
  record: input.record
});

export const buildTierUpdateSafeRowExportRecord = (
  input: ScheduledTierUpdateSafeRowInput
): TierUpdateSafeRowExportRecord => {
  const row = input.row;
  const rowId = safeNumber(row.id) ?? 'unknown';

  return baseRecord({
    ...input,
    rowId: `scheduled_tier_update:${rowId}`,
    entityType: 'scheduled_tier_update',
    sourceTable: 'ScheduledTierUpdate',
    status: safeToken(row.status, 'unknown'),
    recordSummary: 'scheduled_tier_update_safe_summary',
    publicChainEvidence: {
      tx_hash_summary: safeHashSummary(row.txHash),
      tx_chain_id: safeNumber(row.txChainId),
      tx_contract_address_summary: safeAddressSummary(row.txContractAddress),
      tx_from_summary: safeAddressSummary(row.txFrom),
      tx_to_summary: safeAddressSummary(row.txTo),
      tx_block_number_summary: safePresenceSummary(row.txBlockNumber, 'number'),
      tx_receipt_status: safeNumber(row.txReceiptStatus),
      tx_receipt_timestamp_summary: safePresenceSummary(row.txReceiptTimestamp, 'timestamp'),
      tx_gas_used_summary: safePresenceSummary(row.txGasUsed, 'number')
    },
    safeFlags: [
      'safe_summary_only',
      'no_raw_wallet_address',
      'no_raw_receipt_payload',
      'no_runtime_readiness_claim'
    ],
    record: {
      scheduled_tier_update_id_summary: safePresenceSummary(row.id, 'id'),
      user_identity_summary: safePresenceSummary(row.userId, 'id'),
      scheduled_at_summary: safePresenceSummary(row.scheduledAt, 'timestamp'),
      expected_tier: safeNumber(row.expectedTier),
      current_tier: safeNumber(row.currentTier),
      processed: row.processed === true,
      status: safeToken(row.status, 'unknown'),
      attempt: safeNumber(row.attempt),
      max_attempts: safeNumber(row.maxAttempts),
      locked_by_summary: safePresenceSummary(row.lockedBy, 'text'),
      locked_at_summary: safePresenceSummary(row.lockedAt, 'timestamp'),
      heartbeat_at_summary: safePresenceSummary(row.heartbeatAt, 'timestamp'),
      lock_expires_at_summary: safePresenceSummary(row.lockExpiresAt, 'timestamp'),
      batch_id_summary: safePresenceSummary(row.batchId, 'batch_id'),
      tx_hash_summary: safeHashSummary(row.txHash),
      tx_chain_id: safeNumber(row.txChainId),
      tx_contract_address_summary: safeAddressSummary(row.txContractAddress),
      tx_from_summary: safeAddressSummary(row.txFrom),
      tx_to_summary: safeAddressSummary(row.txTo),
      tx_block_number_summary: safePresenceSummary(row.txBlockNumber, 'number'),
      tx_receipt_status: safeNumber(row.txReceiptStatus),
      tx_receipt_timestamp_summary: safePresenceSummary(row.txReceiptTimestamp, 'timestamp'),
      tx_gas_used_summary: safePresenceSummary(row.txGasUsed, 'number'),
      sent_at_summary: safePresenceSummary(row.sentAt, 'timestamp'),
      confirmed_at_summary: safePresenceSummary(row.confirmedAt, 'timestamp'),
      failed_at_summary: safePresenceSummary(row.failedAt, 'timestamp'),
      safe_error_kind: row.safeErrorKind === null ? null : safeToken(row.safeErrorKind, 'unknown'),
      safe_summary: safeJsonSummary(row.safeSummary),
      readiness_claim: 'none',
      runtime_wiring_status: 'not_connected'
    }
  });
};

export const buildJobRunSafeRowExportRecord = (
  input: JobRunSafeRowInput
): TierUpdateSafeRowExportRecord => {
  const row = input.row;
  const rowId = safeNumber(row.id) ?? 'unknown';

  return baseRecord({
    ...input,
    rowId: `job_run:${rowId}`,
    entityType: 'job_run',
    sourceTable: 'JobRun',
    status: safeToken(row.status, 'unknown'),
    recordSummary: 'job_run_safe_summary',
    safeFlags: [
      'safe_summary_only',
      'no_raw_checkpoint',
      'no_runtime_readiness_claim'
    ],
    record: {
      job_run_id_summary: safePresenceSummary(row.id, 'id'),
      job_name: safeToken(row.jobName, 'unknown'),
      run_key_summary: safePresenceSummary(row.runKey, 'text'),
      job_status: safeToken(row.status, 'unknown'),
      started_at_summary: safePresenceSummary(row.startedAt, 'timestamp'),
      finished_at_summary: safePresenceSummary(row.finishedAt, 'timestamp'),
      heartbeat_at_summary: safePresenceSummary(row.heartbeatAt, 'timestamp'),
      attempt: safeNumber(row.attempt),
      max_attempts: safeNumber(row.maxAttempts),
      locked_by_summary: safePresenceSummary(row.lockedBy, 'text'),
      checkpoint_summary: safeJsonSummary(row.checkpoint),
      safe_error_kind: row.safeErrorKind === null ? null : safeToken(row.safeErrorKind, 'unknown'),
      safe_summary: safeJsonSummary(row.safeSummary),
      worker_readiness_claim: 'none',
      runtime_wiring_status: 'not_connected'
    }
  });
};

export const buildTierUpdateReceiptEvidenceSafeRow = (
  input: ReceiptEvidenceSafeRowInput
): TierUpdateSafeRowExportRecord => {
  const evidence = input.evidence;
  const rowId = 'scheduledTierUpdateId' in evidence
    ? evidence.scheduledTierUpdateId
    : null;

  return baseRecord({
    ...input,
    rowId: `tx_receipt_evidence:${safeNumber(rowId) ?? 'unknown'}`,
    entityType: 'tx_receipt_evidence',
    sourceTable: 'none',
    status: safeToken('outcome' in evidence ? evidence.outcome : evidence.reconciliationStatus, 'unknown'),
    recordSummary: 'tx_receipt_evidence_safe_summary',
    publicChainEvidence: {
      tx_hash_summary: safeHashSummary('txHash' in evidence ? evidence.txHash : null),
      tx_chain_id: safeNumber('txChainId' in evidence ? evidence.txChainId : null),
      tx_contract_address_summary: safeAddressSummary('txContractAddress' in evidence ? evidence.txContractAddress : null),
      tx_from_summary: safeAddressSummary('txFrom' in evidence ? evidence.txFrom : null),
      tx_to_summary: safeAddressSummary('txTo' in evidence ? evidence.txTo : null),
      tx_block_number_summary: safePresenceSummary('txBlockNumber' in evidence ? evidence.txBlockNumber : null, 'number'),
      tx_receipt_status: safeNumber('txReceiptStatus' in evidence ? evidence.txReceiptStatus : null)
    },
    safeFlags: [
      'safe_summary_only',
      'no_raw_receipt_payload',
      'no_raw_provider_error'
    ],
    record: {
      tx_hash_summary: safeHashSummary('txHash' in evidence ? evidence.txHash : null),
      tx_chain_id: safeNumber('txChainId' in evidence ? evidence.txChainId : null),
      tx_contract_address_summary: safeAddressSummary('txContractAddress' in evidence ? evidence.txContractAddress : null),
      tx_from_summary: safeAddressSummary('txFrom' in evidence ? evidence.txFrom : null),
      tx_to_summary: safeAddressSummary('txTo' in evidence ? evidence.txTo : null),
      tx_block_number_summary: safePresenceSummary('txBlockNumber' in evidence ? evidence.txBlockNumber : null, 'number'),
      tx_receipt_status: safeNumber('txReceiptStatus' in evidence ? evidence.txReceiptStatus : null),
      confirmation_depth: safeNumber('confirmationDepth' in evidence ? evidence.confirmationDepth : null),
      finality_status: safeToken('finalityStatus' in evidence ? evidence.finalityStatus : null, 'unknown'),
      last_checked_at_summary: safePresenceSummary('lastCheckedAt' in evidence ? evidence.lastCheckedAt : null, 'timestamp'),
      safe_error_kind: 'safeErrorKind' in evidence && evidence.safeErrorKind !== null
        ? safeToken(evidence.safeErrorKind, 'unknown')
        : null,
      reconciliation_status: safeToken('reconciliationStatus' in evidence ? evidence.reconciliationStatus : evidence.outcome, 'unknown'),
      manual_review_reason: safeToken('manualReviewReason' in evidence ? evidence.manualReviewReason : evidence.reason, 'unknown'),
      resume_key_summary: safePresenceSummary('resumeKey' in evidence ? evidence.resumeKey : null, 'text')
    }
  });
};

export const buildTierUpdateStagingEvidenceSafeRow = (
  input: StagingEvidenceSafeRowInput
): TierUpdateSafeRowExportRecord => {
  const evidence = input.evidence;
  const stagingStatus = 'stagingNoTxPreflightStatus' in evidence
    ? evidence.stagingNoTxPreflightStatus
    : 'BLOCKED';
  const checks = 'checks' in evidence ? evidence.checks : {
    noTxExecution: evidence.noTxExecution,
    noRpcUrlEnvReading: evidence.noRpcUrlEnvReading,
    noProviderConstruction: evidence.noProviderConstruction,
    noWalletConstruction: evidence.noWalletConstruction,
    noContractConstruction: evidence.noContractConstruction,
    noAutoStart: evidence.noAutoStart,
    noCronWiring: evidence.noCronWiring,
    noMainAutoStart: evidence.noMainAutoStart,
    noTrackingServiceAutoStart: evidence.noTrackingServiceAutoStart,
    safeOutputOnly: evidence.safeSummaryOnly
  };

  return baseRecord({
    ...input,
    rowId: `staging_evidence:${safeToken(input.auditMeta?.auditExportId, 'unknown')}`,
    entityType: 'staging_evidence',
    sourceTable: 'none',
    status: safeToken('status' in evidence ? evidence.status : evidence.resultStatus, 'unknown'),
    recordSummary: 'staging_no_tx_evidence_safe_summary',
    safeFlags: [
      'safe_summary_only',
      'staging_no_tx_preflight_blocked',
      'no_runtime_readiness_claim'
    ],
    record: {
      stagingNoTxPreflightStatus: stagingStatus === 'BLOCKED' ? 'BLOCKED' : 'BLOCKED',
      readinessClaim: 'none',
      noTxExecution: checks.noTxExecution === true,
      noFundedTx: 'noFundedTx' in checks ? checks.noFundedTx === true : true,
      noMint: 'noMint' in checks ? checks.noMint === true : true,
      noSendToWallet: 'noSendToWallet' in checks ? checks.noSendToWallet === true : true,
      noGovernanceTx: 'noGovernanceTx' in checks ? checks.noGovernanceTx === true : true,
      noTierUpdaterTx: 'noTierUpdaterTx' in checks ? checks.noTierUpdaterTx === true : true,
      noDeploy: 'noDeploy' in checks ? checks.noDeploy === true : true,
      noStagingRollout: 'noStagingRollout' in checks ? checks.noStagingRollout === true : true,
      noRpcUrlEnvReading: checks.noRpcUrlEnvReading === true,
      noProviderConstruction: checks.noProviderConstruction === true,
      noWalletConstruction: checks.noWalletConstruction === true,
      noContractConstruction: checks.noContractConstruction === true,
      noAutoStart: checks.noAutoStart === true,
      noCronWiring: checks.noCronWiring === true,
      noMainAutoStart: checks.noMainAutoStart === true,
      noTrackingServiceAutoStart: checks.noTrackingServiceAutoStart === true,
      safeOutputOnly: checks.safeOutputOnly === true
    }
  });
};
