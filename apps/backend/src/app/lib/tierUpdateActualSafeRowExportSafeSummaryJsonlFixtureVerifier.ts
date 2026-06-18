import { createHash } from 'node:crypto';

import {
  D8AO_CANONICAL_FIELD_ORDER,
  D8AO_ENTITY_TYPE_ALLOWLIST,
  D8AO_EVIDENCE_ORIGIN_ALLOWLIST,
  D8AO_READINESS_CLAIM_ALLOWLIST,
  D8AO_SAFETY_FLAG_ALLOWLIST,
  D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST
} from './tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_KIND,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_TRACE_LABEL
} from './tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder';
import type { SafeSummaryJsonlFixtureRow } from './tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_KIND =
  'tier_update_actual_safe_row_export_safe_summary_jsonl_fixture_verifier' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_TRACE_LABEL =
  'd8aq_actual_safe_row_export_safe_summary_jsonl_fixture_verifier' as const;

type Status = 'BLOCKED' | 'NEEDS_REVIEW' | 'SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_READY';

type BoundaryFlags = {
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
  realDbQueryEnabled?: boolean;
  sourceAccessEnabled?: boolean;
  prismaClientEnabled?: boolean;
  databaseUrlReadEnabled?: boolean;
  envReadEnabled?: boolean;
  networkRpcWalletContractTxAccessEnabled?: boolean;
  networkAccessEnabled?: boolean;
  rpcAccessEnabled?: boolean;
  walletAccessEnabled?: boolean;
  contractAccessEnabled?: boolean;
  txSendEnabled?: boolean;
  fileExportEnabled?: boolean;
  jsonlFileExportEnabled?: boolean;
  artifactUploadEnabled?: boolean;
  dockerSmokeChanged?: boolean;
  stagingNoTxPassClaimed?: boolean;
  runtimeReadinessClaimed?: boolean;
  productionReadinessClaimed?: boolean;
};

type D8APBuild = BoundaryFlags & {
  status?: string | null;
  kind?: string | null;
  traceLabel?: string | null;
  schemaVersion?: string | null;
  skillProfileId?: string | null;
  safeSummaryOnly?: boolean;
  fixtureBuildId?: string | null;
  fixtureSchemaId?: string | null;
  sourceHeadSha?: string | null;
  fixtureOnly?: boolean;
  inMemoryOnly?: boolean;
  zeroRealRows?: boolean;
  rowCount?: number | null;
  rows?: unknown;
  rowIds?: unknown;
  entityTypes?: unknown;
  canonicalFieldOrder?: unknown;
  jsonlContract?: {
    jsonlLinesReturned?: boolean;
    fileWriteEnabled?: boolean;
    inMemoryRowsOnly?: boolean;
  } | null;
  boundarySummary?: BoundaryFlags | null;
  blockerCount?: number | null;
  blockers?: unknown;
  needsReviewReasonCount?: number | null;
  needsReviewReasons?: unknown;
  nextSafeAction?: string | null;
};

type NormalizedD8APBuild = {
  status: string;
  kind: string;
  traceLabel: string;
  schemaVersion: string;
  skillProfileId: string;
  safeSummaryOnly: boolean;
  fixtureBuildId: string;
  fixtureSchemaId: string;
  sourceHeadSha: string;
  fixtureOnly: boolean;
  inMemoryOnly: boolean;
  zeroRealRows: boolean;
  rowCount: number;
  rows: unknown[];
  rowIds: unknown[];
  entityTypes: unknown[];
  canonicalFieldOrder: unknown[];
  jsonlContract: {
    jsonlLinesReturned?: boolean;
    fileWriteEnabled?: boolean;
    inMemoryRowsOnly?: boolean;
  };
  boundarySummary: BoundaryFlags & {
    safeSummaryOnly?: boolean;
    fixtureOnly?: boolean;
    inMemoryOnly?: boolean;
  };
  blockerCount: number;
  blockers: unknown[];
  needsReviewReasonCount: number;
  needsReviewReasons: unknown[];
  nextSafeAction: string | null;
};

export type BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput = BoundaryFlags & {
  d8apBuild?: D8APBuild | null;
  fixtureVerifierId?: string | null;
  verificationMode?: string | null;
  fixtureOnlyRequired?: boolean;
  inMemoryOnlyRequired?: boolean;
  zeroRealRowsRequired?: boolean;
  noFileOutputRequired?: boolean;
  noJsonlFileOutputRequired?: boolean;
  noArtifactUploadRequired?: boolean;
  boundarySummary?: BoundaryFlags | null;
  boundaryFlags?: BoundaryFlags | null;
  blockers?: unknown;
  needsReviewReasons?: unknown;
  nextSafeAction?: string | null;
  actualRows?: unknown;
  rawRows?: unknown;
  dbRows?: unknown;
  sourceRows?: unknown;
  records?: unknown;
  jsonlLines?: unknown;
  filePath?: unknown;
  outputPath?: unknown;
  artifactName?: unknown;
  sql?: unknown;
  query?: unknown;
  rawPayload?: unknown;
  endpoint?: unknown;
};

export type TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier = {
  status: Status;
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_KIND;
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_TRACE_LABEL;
  schemaVersion: 1;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  safeSummaryOnly: true;
  fixtureVerifierId: string;
  fixtureBuildId: string;
  fixtureSchemaId: string;
  sourceHeadSha: string;
  verifiedRowCount: number;
  verifiedEntityTypes: string[];
  schemaContractVerified: boolean;
  buildMetadataVerified: boolean;
  canonicalKeysVerified: boolean;
  rowTypesVerified: boolean;
  rowIdsUniqueVerified: boolean;
  schemaBindingVerified: boolean;
  sourceHeadConsistencyVerified: boolean;
  sourceHashesVerified: boolean;
  timestampsVerified: boolean;
  safeStringsVerified: boolean;
  publicFieldsVerified: boolean;
  internalLabelsVerified: boolean;
  walletSummaryVerified: boolean;
  chainNetworkVerified: boolean;
  requiredSafetyFlagsVerified: boolean;
  fixtureOnlyVerified: boolean;
  inMemoryOnlyVerified: boolean;
  zeroRealRowsVerified: boolean;
  noFileOutputVerified: boolean;
  noJsonlFileOutputVerified: boolean;
  noArtifactUploadVerified: boolean;
  boundarySummary: Required<BoundaryFlags> & {
    safeSummaryOnly: true;
    fixtureOnly: true;
    inMemoryOnly: true;
  };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  nextSafeAction:
    | 'provide_d8ap_in_memory_fixture_build'
    | 'restore_fixture_verifier_policy'
    | 'restore_canonical_fixture_rows'
    | 'remove_actual_row_input'
    | 'remove_forbidden_boundary_flag'
    | 'collect_safe_summary_fixture_review'
    | 'request_owner_scope_for_d8ar_actual_source_candidate_field_allowlist';
};

const D8AP_READY_STATUS = 'SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY';
const READY_NEXT_ACTION = 'request_owner_scope_for_d8ar_actual_source_candidate_field_allowlist';
const REVIEW_NEXT_ACTION = 'collect_safe_summary_fixture_review';
const D8AP_EXPECTED_NEXT_ACTION = 'prepare_pr_d8aq_safe_summary_jsonl_fixture_verifier';
const MAX_ROW_COUNT = 12;
const MAX_ROW_BYTES = 32768;
const SAFE_REVIEW_REASON_ALLOWLIST = new Set([
  'row_readiness_claim_needs_review',
  'unknown_network_label_isolated_review',
  'deferred_entity_isolated_review',
  'optional_fixture_metadata_incomplete',
  'upstream_review_reason_redacted'
]);
const SAFE_MODES = new Set([
  'fixture_static_verification',
  'fixture_schema_verification',
  'in_memory_fixture_verification',
  'review_only_fixture_verification'
]);
const FORBIDDEN_MODES = new Set([
  'execute',
  'query',
  'read_source',
  'db_read',
  'export',
  'jsonl_export',
  'file_write',
  'artifact_upload',
  'runtime',
  'worker',
  'cron',
  'route',
  'cli',
  'docker_smoke',
  'staging',
  'production'
]);
const FORBIDDEN_INPUT_KEYS = [
  'actualRows',
  'rawRows',
  'dbRows',
  'sourceRows',
  'records',
  'jsonlLines',
  'filePath',
  'outputPath',
  'artifactName',
  'sql',
  'query',
  'rawPayload',
  'endpoint'
] as const;
const FORBIDDEN_BOUNDARY_FLAGS = [
  'actualDbQueryEnabled',
  'actualDbExportEnabled',
  'realDbQueryEnabled',
  'sourceAccessEnabled',
  'prismaClientEnabled',
  'databaseUrlReadEnabled',
  'envReadEnabled',
  'networkRpcWalletContractTxAccessEnabled',
  'networkAccessEnabled',
  'rpcAccessEnabled',
  'walletAccessEnabled',
  'contractAccessEnabled',
  'txSendEnabled',
  'fileExportEnabled',
  'jsonlFileExportEnabled',
  'artifactUploadEnabled',
  'dockerSmokeChanged',
  'stagingNoTxPassClaimed',
  'runtimeReadinessClaimed',
  'productionReadinessClaimed'
] as const;
const REQUIRED_SAFETY_FLAGS = [
  'fixture_only',
  'synthetic_only',
  'no_actual_source_access',
  'no_db_query',
  'no_db_export',
  'no_file_export',
  'no_jsonl_file_export',
  'no_artifact_upload',
  'no_runtime_readiness'
] as const;
const EXECUTABLE_SAFETY_FLAGS = new Set([
  'executes_query',
  'reads_database_url',
  'imports_prisma',
  'reads_env',
  'writes_file',
  'uploads_artifact',
  'calls_network',
  'calls_rpc',
  'uses_wallet',
  'uses_contract',
  'sends_tx',
  'claims_runtime_ready',
  'claims_staging_ready',
  'claims_production_ready'
]);
const UNSAFE_PATTERNS = [
  /raw[\s_-]*(secret|env|log|payload|endpoint)/i,
  /private[\s_-]*(key|path|identifier)/i,
  /local[\s_-]*(file[\s_-]*)?path/i,
  /authorization\s*[:=]/i,
  /bearer\s+[a-z0-9._-]+/i,
  /jwt\s*[:=]/i,
  /cookie\s*[:=]/i,
  /database_url\s*[:=]/i,
  /postgres(?:ql)?:\/\//i,
  /rpc[\s_-]*secret/i,
  /runtime[\s_-]*ready|production[\s_-]*ready|staging[\s_-]*ready|export[\s_-]*ready|actual[\s_-]*source[\s_-]*ready/i,
  /https?:\/\//i,
  /0x[a-f0-9]{40}/i,
  /[a-z]:[\\/]/i,
  /(^|[\s"'])(\/(?:users|home|var|etc|tmp)\/[^\s"']*)/i,
  /\.\.[\\/]/
];

function addUnique(list: string[], value: string) {
  if (!list.includes(value)) list.push(value);
}

function hasOwn(input: object, key: string): boolean {
  try {
    return Object.prototype.hasOwnProperty.call(input, key);
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  try {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  } catch {
    return false;
  }
}

function safeRead(record: Record<string, unknown>, key: string): unknown {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key);
    if (!descriptor || !('value' in descriptor)) return undefined;
    return descriptor.value;
  } catch {
    return undefined;
  }
}

function hasDataProperty(record: Record<string, unknown>, key: string): boolean {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(record, key);
    return !!descriptor && 'value' in descriptor;
  } catch {
    return false;
  }
}

function ownKeys(record: Record<string, unknown>): string[] | null {
  try {
    return Object.keys(record);
  } catch {
    return null;
  }
}

function safeToken(value: unknown, max = 128): value is string {
  return typeof value === 'string' && value.length <= max && /^[a-z0-9][a-z0-9_-]{2,127}$/.test(value);
}

function safeSourceHead(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
}

function safeSha256(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value);
}

function unsafeString(value: unknown): boolean {
  return typeof value === 'string' && UNSAFE_PATTERNS.some((pattern) => pattern.test(value));
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function emptyBoundarySummary(): TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier['boundarySummary'] {
  return {
    actualDbQueryEnabled: false,
    actualDbExportEnabled: false,
    realDbQueryEnabled: false,
    sourceAccessEnabled: false,
    prismaClientEnabled: false,
    databaseUrlReadEnabled: false,
    envReadEnabled: false,
    networkRpcWalletContractTxAccessEnabled: false,
    networkAccessEnabled: false,
    rpcAccessEnabled: false,
    walletAccessEnabled: false,
    contractAccessEnabled: false,
    txSendEnabled: false,
    fileExportEnabled: false,
    jsonlFileExportEnabled: false,
    artifactUploadEnabled: false,
    dockerSmokeChanged: false,
    stagingNoTxPassClaimed: false,
    runtimeReadinessClaimed: false,
    productionReadinessClaimed: false,
    safeSummaryOnly: true,
    fixtureOnly: true,
    inMemoryOnly: true
  };
}

function collectBoundarySources(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput): BoundaryFlags[] {
  const d8apBuild = isRecord(input.d8apBuild) ? input.d8apBuild : {};
  const d8apBoundarySummary = isRecord(d8apBuild) && isRecord(safeRead(d8apBuild, 'boundarySummary'))
    ? safeRead(d8apBuild, 'boundarySummary') as BoundaryFlags
    : {};
  return [input, input.boundarySummary || {}, input.boundaryFlags || {}, d8apBuild as BoundaryFlags, d8apBoundarySummary];
}

function boundarySummaryFor(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput) {
  const summary = emptyBoundarySummary();
  for (const source of collectBoundarySources(input)) {
    for (const flag of FORBIDDEN_BOUNDARY_FLAGS) {
      if (source[flag] === true) summary[flag] = true;
    }
  }
  return summary;
}

function collectForbiddenBoundaryReasons(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput, blockers: string[]) {
  for (const source of collectBoundarySources(input)) {
    for (const flag of FORBIDDEN_BOUNDARY_FLAGS) {
      if (source[flag] === true) addUnique(blockers, `${flag}_forbidden`);
    }
  }
}

function normalizeInputCollections(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput, blockers: string[], needsReviewReasons: string[]) {
  if (hasOwn(input, 'blockers')) {
    if (!Array.isArray(input.blockers)) addUnique(blockers, 'upstream_blockers_invalid');
    else if (input.blockers.length > 0) addUnique(blockers, 'upstream_blocker_present');
  }
  if (hasOwn(input, 'needsReviewReasons')) {
    if (!Array.isArray(input.needsReviewReasons)) addUnique(blockers, 'needs_review_reasons_invalid');
    else {
      for (const reason of input.needsReviewReasons) {
        if (SAFE_REVIEW_REASON_ALLOWLIST.has(String(reason))) addUnique(needsReviewReasons, String(reason));
        else addUnique(needsReviewReasons, 'upstream_review_reason_redacted');
      }
    }
  }
}

function validatePolicy(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput, blockers: string[]) {
  if (!safeToken(input.fixtureVerifierId, 96)) addUnique(blockers, 'fixture_verifier_id_missing');
  if (!input.verificationMode || FORBIDDEN_MODES.has(input.verificationMode) || !SAFE_MODES.has(input.verificationMode)) {
    addUnique(blockers, 'verification_mode_unsafe');
  }
  if (input.fixtureOnlyRequired !== true) addUnique(blockers, 'fixture_only_required');
  if (input.inMemoryOnlyRequired !== true) addUnique(blockers, 'in_memory_only_required');
  if (input.zeroRealRowsRequired !== true) addUnique(blockers, 'zero_real_rows_required');
  if (input.noFileOutputRequired !== true) addUnique(blockers, 'no_file_output_required');
  if (input.noJsonlFileOutputRequired !== true) addUnique(blockers, 'no_jsonl_file_output_required');
  if (input.noArtifactUploadRequired !== true) addUnique(blockers, 'no_artifact_upload_required');
  if (input.nextSafeAction !== undefined && input.nextSafeAction !== READY_NEXT_ACTION) addUnique(blockers, 'next_safe_action_unsafe');
  for (const key of FORBIDDEN_INPUT_KEYS) if (hasOwn(input, key)) addUnique(blockers, 'actual_row_input_forbidden');
}

function isCanonicalRowObject(value: unknown): value is Record<keyof SafeSummaryJsonlFixtureRow, unknown> {
  if (!isRecord(value)) return false;
  const keys = ownKeys(value);
  return !!keys && keys.join('|') === D8AO_CANONICAL_FIELD_ORDER.join('|');
}

function validateFlatPublicFields(value: unknown, blockers: string[]): boolean {
  if (!isRecord(value)) {
    addUnique(blockers, 'public_visible_fields_malformed');
    return false;
  }
  const keys = ownKeys(value);
  if (!keys) {
    addUnique(blockers, 'public_visible_fields_malformed');
    return false;
  }
  if (keys.length > 32) addUnique(blockers, 'public_visible_fields_too_many');
  let ok = true;
  for (const key of keys) {
    if (!safeToken(key, 64)) {
      addUnique(blockers, 'public_visible_field_key_unsafe');
      ok = false;
    }
    const field = safeRead(value, key);
    if (field === undefined || typeof field === 'bigint' || typeof field === 'function' || typeof field === 'symbol' || Array.isArray(field) || (field && typeof field === 'object')) {
      addUnique(blockers, 'public_visible_field_value_unsafe');
      ok = false;
    }
    if (typeof field === 'number' && !Number.isFinite(field)) {
      addUnique(blockers, 'public_visible_field_value_unsafe');
      ok = false;
    }
    if (typeof field === 'string' && (field.length > 240 || unsafeString(field))) {
      addUnique(blockers, 'public_visible_field_value_unsafe');
      ok = false;
    }
  }
  return ok;
}

function validateInternalLabels(value: unknown, blockers: string[]): boolean {
  if (!Array.isArray(value) || value.length > 32) {
    addUnique(blockers, 'internal_labels_malformed');
    return false;
  }
  let ok = true;
  for (const label of value) {
    if (typeof label !== 'string' || label.length > 64 || !/^[a-z0-9][a-z0-9_]{2,63}$/.test(label) || /[:=\s\\/]|https?:/.test(label)) {
      addUnique(blockers, 'internal_label_unsafe');
      ok = false;
    }
  }
  return ok;
}

function validateTimestamp(value: unknown, blockers: string[]): boolean {
  if (typeof value !== 'string' || value.includes('\n') || !value.endsWith('Z')) {
    addUnique(blockers, 'exported_at_invalid');
    return false;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== value) {
    addUnique(blockers, 'exported_at_invalid');
    return false;
  }
  return true;
}

function snapshotPrimitive(value: unknown): string | number | boolean | null | undefined {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

function encodedSizeOk(row: Record<string, unknown>, blockers: string[]): boolean {
  const safeSnapshot: Record<string, unknown> = {};
  for (const key of D8AO_CANONICAL_FIELD_ORDER) {
    let descriptor: PropertyDescriptor | undefined;
    try {
      descriptor = Object.getOwnPropertyDescriptor(row, key);
    } catch {
      addUnique(blockers, 'row_encoded_size_unavailable');
      return false;
    }
    if (!descriptor || !('value' in descriptor)) {
      addUnique(blockers, 'row_encoded_size_unavailable');
      return false;
    }
    const value = descriptor.value;
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        const items = value.map(snapshotPrimitive);
        if (items.some((item) => item === undefined)) {
          addUnique(blockers, 'row_encoded_size_unavailable');
          return false;
        }
        safeSnapshot[key] = items;
      }
      else if (isRecord(value)) {
        const flat: Record<string, unknown> = {};
        const keys = ownKeys(value);
        if (!keys) {
          addUnique(blockers, 'row_encoded_size_unavailable');
          return false;
        }
        for (const nestedKey of keys) {
          let nestedDescriptor: PropertyDescriptor | undefined;
          try {
            nestedDescriptor = Object.getOwnPropertyDescriptor(value, nestedKey);
          } catch {
            addUnique(blockers, 'row_encoded_size_unavailable');
            return false;
          }
          if (!nestedDescriptor || !('value' in nestedDescriptor)) {
            addUnique(blockers, 'row_encoded_size_unavailable');
            return false;
          }
          const primitive = snapshotPrimitive(nestedDescriptor.value);
          if (primitive === undefined) {
            addUnique(blockers, 'row_encoded_size_unavailable');
            return false;
          }
          flat[nestedKey] = primitive;
        }
        safeSnapshot[key] = flat;
      } else {
        addUnique(blockers, 'row_encoded_size_unavailable');
        return false;
      }
    } else {
      const primitive = snapshotPrimitive(value);
      if (primitive === undefined) {
        addUnique(blockers, 'row_encoded_size_unavailable');
        return false;
      }
      safeSnapshot[key] = primitive;
    }
  }
  let size = 0;
  try {
    size = Buffer.byteLength(JSON.stringify(safeSnapshot), 'utf8');
  } catch {
    addUnique(blockers, 'row_encoded_size_unavailable');
    return false;
  }
  if (size > MAX_ROW_BYTES) {
    addUnique(blockers, 'row_encoded_size_too_large');
    return false;
  }
  return true;
}

function validateRow(
  row: unknown,
  index: number,
  build: NormalizedD8APBuild,
  blockers: string[],
  needsReviewReasons: string[],
  seenRowIds: Set<string>
): boolean {
  if (!isCanonicalRowObject(row)) {
    addUnique(blockers, 'row_canonical_keys_mismatch');
    return false;
  }
  let ok = true;
  const fixtureBuildId = build.fixtureBuildId;
  const fixtureSchemaId = build.fixtureSchemaId;
  const sourceHeadSha = build.sourceHeadSha;
  const read = (key: keyof SafeSummaryJsonlFixtureRow) => safeRead(row, key);
  const rowId = read('row_id');
  const entityType = read('entity_type');
  if (!safeToken(rowId, 128)) {
    addUnique(blockers, 'row_id_unsafe');
    ok = false;
  } else if (seenRowIds.has(rowId)) {
    addUnique(blockers, 'duplicate_row_id');
    ok = false;
  } else {
    seenRowIds.add(rowId);
  }
  if (read('schema_version') !== '1') {
    addUnique(blockers, 'schema_version_mismatch');
    ok = false;
  }
  if (read('audit_export_id') !== `audit-${fixtureSchemaId}`) {
    addUnique(blockers, 'audit_export_id_mismatch');
    ok = false;
  }
  if (read('source_head_sha') !== sourceHeadSha) {
    addUnique(blockers, 'source_head_sha_mismatch');
    ok = false;
  }
  if (typeof entityType !== 'string') {
    addUnique(blockers, 'entity_type_unsafe');
    ok = false;
  }
  const expectedHash = typeof entityType === 'string'
    ? `sha256:${sha256Hex(`${fixtureBuildId}:${entityType}:${index}`)}`
    : '';
  if (!safeSha256(read('source_hash')) || read('source_hash') !== expectedHash) {
    addUnique(blockers, 'source_hash_semantic_mismatch');
    ok = false;
  }
  if (!validateTimestamp(read('exported_at'), blockers)) ok = false;
  if (!safeToken(read('dataset_name'), 96) || unsafeString(read('dataset_name'))) {
    addUnique(blockers, 'dataset_name_unsafe');
    ok = false;
  }
  if (typeof entityType !== 'string' || !D8AO_ENTITY_TYPE_ALLOWLIST.includes(entityType as typeof D8AO_ENTITY_TYPE_ALLOWLIST[number])) {
    addUnique(blockers, 'entity_type_unsafe');
    ok = false;
  }
  const sourceTable = read('source_table');
  if (!(sourceTable === null || (safeToken(sourceTable, 96) && !String(sourceTable).includes('.') && !unsafeString(sourceTable)))) {
    addUnique(blockers, 'source_table_unsafe');
    ok = false;
  }
  const sourceFile = read('source_file');
  if (!(sourceFile === null || (safeToken(sourceFile, 96) && !/[\\/.:]/.test(sourceFile) && !unsafeString(sourceFile)))) {
    addUnique(blockers, 'source_file_unsafe');
    ok = false;
  }
  if (read('status') !== 'fixture_ready') {
    addUnique(blockers, 'row_status_unsafe');
    ok = false;
  }
  const evidenceOrigin = read('evidence_origin');
  if (typeof evidenceOrigin !== 'string' || !D8AO_EVIDENCE_ORIGIN_ALLOWLIST.includes(evidenceOrigin as typeof D8AO_EVIDENCE_ORIGIN_ALLOWLIST[number])) {
    addUnique(blockers, 'evidence_origin_unsafe');
    ok = false;
  }
  const readiness = read('readiness_claim');
  if (typeof readiness !== 'string' || !D8AO_READINESS_CLAIM_ALLOWLIST.includes(readiness as typeof D8AO_READINESS_CLAIM_ALLOWLIST[number])) {
    addUnique(blockers, 'readiness_claim_unsafe');
    ok = false;
  }
  if (readiness === 'needs_review') addUnique(needsReviewReasons, 'row_readiness_claim_needs_review');
  for (const key of ['record_summary', 'expected_safe_summary'] as const) {
    const value = read(key);
    if (typeof value !== 'string' || value.length > 240 || value.includes('\n') || unsafeString(value)) {
      addUnique(blockers, `${key}_unsafe`);
      ok = false;
    }
  }
  if (!validateFlatPublicFields(read('public_visible_fields'), blockers)) ok = false;
  if (!validateInternalLabels(read('internal_only_field_labels'), blockers)) ok = false;
  const walletSummary = read('wallet_address_summary');
  if (typeof walletSummary !== 'string' || !D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST.includes(walletSummary as typeof D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST[number])) {
    addUnique(blockers, 'wallet_address_summary_unsafe');
    ok = false;
  }
  if (![56, 97, null].includes(read('chain_id') as 56 | 97 | null)) {
    addUnique(blockers, 'chain_id_unsafe');
    ok = false;
  }
  const networkLabel = read('network_label');
  if (typeof networkLabel !== 'string' || !['none', 'bsc_testnet', 'bsc_mainnet', 'unknown'].includes(networkLabel)) {
    addUnique(blockers, 'network_label_unsafe');
    ok = false;
  }
  if (networkLabel === 'unknown') addUnique(needsReviewReasons, 'unknown_network_label_isolated_review');
  const safetyFlags = read('safety_flags');
  if (!Array.isArray(safetyFlags) || new Set(safetyFlags).size !== safetyFlags.length) {
    addUnique(blockers, 'safety_flags_malformed');
    ok = false;
  } else {
    for (const flag of REQUIRED_SAFETY_FLAGS) if (!safetyFlags.includes(flag)) addUnique(blockers, 'required_safety_flag_missing');
    for (const flag of safetyFlags) {
      if (typeof flag !== 'string' || !D8AO_SAFETY_FLAG_ALLOWLIST.includes(flag as typeof D8AO_SAFETY_FLAG_ALLOWLIST[number]) || EXECUTABLE_SAFETY_FLAGS.has(flag)) {
        addUnique(blockers, 'safety_flag_unsafe');
        ok = false;
      }
      if (flag === 'deferred_entity') addUnique(needsReviewReasons, 'deferred_entity_isolated_review');
      if (flag === 'needs_review') addUnique(needsReviewReasons, 'row_readiness_claim_needs_review');
    }
  }
  if (!encodedSizeOk(row, blockers)) ok = false;
  return ok;
}

function validateBuildBoundarySummary(build: NormalizedD8APBuild, blockers: string[]): boolean {
  if (!isRecord(build.boundarySummary)) {
    addUnique(blockers, 'd8ap_boundary_summary_malformed');
    return false;
  }
  let ok = true;
  const keys = ownKeys(build.boundarySummary);
  if (!keys) {
    addUnique(blockers, 'd8ap_boundary_summary_malformed');
    return false;
  }
  for (const key of [...FORBIDDEN_BOUNDARY_FLAGS, 'safeSummaryOnly', 'fixtureOnly', 'inMemoryOnly']) {
    if (!hasDataProperty(build.boundarySummary, key)) {
      addUnique(blockers, 'd8ap_boundary_summary_malformed');
      ok = false;
    }
  }
  for (const flag of FORBIDDEN_BOUNDARY_FLAGS) {
    if (safeRead(build.boundarySummary, flag) !== false) {
      addUnique(blockers, 'd8ap_boundary_flag_unsafe');
      ok = false;
    }
  }
  if (safeRead(build.boundarySummary, 'safeSummaryOnly') !== true
    || safeRead(build.boundarySummary, 'fixtureOnly') !== true
    || safeRead(build.boundarySummary, 'inMemoryOnly') !== true) {
    addUnique(blockers, 'd8ap_boundary_summary_mismatch');
    ok = false;
  }
  for (const key of keys) {
    if ((key.toLowerCase().includes('query')
      || key.toLowerCase().includes('export')
      || key.toLowerCase().includes('artifact')
      || key.toLowerCase().includes('runtime')
      || key.toLowerCase().includes('source'))
      && ![...FORBIDDEN_BOUNDARY_FLAGS, 'safeSummaryOnly', 'fixtureOnly', 'inMemoryOnly'].includes(key as typeof FORBIDDEN_BOUNDARY_FLAGS[number])) {
      addUnique(blockers, 'd8ap_boundary_extra_unsafe_key');
      ok = false;
    }
  }
  if (build.safeSummaryOnly !== true || build.fixtureOnly !== true || build.inMemoryOnly !== true) {
    addUnique(blockers, 'd8ap_boundary_summary_mismatch');
    ok = false;
  }
  return ok;
}

function validateRowIds(build: NormalizedD8APBuild, rows: unknown[], blockers: string[]): boolean {
  if (!Array.isArray(build.rowIds)) {
    addUnique(blockers, 'row_ids_collection_malformed');
    return false;
  }
  let ok = true;
  if (build.rowIds.length !== rows.length) {
    addUnique(blockers, 'row_ids_length_mismatch');
    ok = false;
  }
  const seen = new Set<string>();
  const actualIds: string[] = [];
  for (const row of rows) {
    const rowId = isRecord(row) ? safeRead(row, 'row_id') : undefined;
    if (typeof rowId === 'string') actualIds.push(rowId);
    else {
      addUnique(blockers, 'row_ids_order_mismatch');
      ok = false;
    }
  }
  for (const [index, rowId] of build.rowIds.entries()) {
    if (!safeToken(rowId, 128)) {
      addUnique(blockers, 'row_ids_collection_malformed');
      ok = false;
      continue;
    }
    if (seen.has(rowId)) {
      addUnique(blockers, 'duplicate_row_id');
      ok = false;
    }
    seen.add(rowId);
    if (actualIds[index] !== rowId) {
      addUnique(blockers, 'row_ids_order_mismatch');
      ok = false;
    }
  }
  return ok;
}

function validateEntityTypes(build: NormalizedD8APBuild, rows: unknown[], blockers: string[]): boolean {
  if (!Array.isArray(build.entityTypes)) {
    addUnique(blockers, 'entity_types_collection_malformed');
    return false;
  }
  let ok = true;
  const seen = new Set<string>();
  const expected: string[] = [];
  for (const row of rows) {
    const entityType = isRecord(row) ? safeRead(row, 'entity_type') : undefined;
    if (typeof entityType === 'string' && D8AO_ENTITY_TYPE_ALLOWLIST.includes(entityType as typeof D8AO_ENTITY_TYPE_ALLOWLIST[number]) && !seen.has(entityType)) {
      expected.push(entityType);
      seen.add(entityType);
    }
  }
  const actual: string[] = [];
  const actualSeen = new Set<string>();
  for (const entityType of build.entityTypes) {
    if (typeof entityType !== 'string' || unsafeString(entityType) || !D8AO_ENTITY_TYPE_ALLOWLIST.includes(entityType as typeof D8AO_ENTITY_TYPE_ALLOWLIST[number])) {
      addUnique(blockers, 'entity_types_unsafe');
      ok = false;
      continue;
    }
    if (actualSeen.has(entityType)) {
      addUnique(blockers, 'entity_types_duplicate');
      ok = false;
    }
    actualSeen.add(entityType);
    actual.push(entityType);
  }
  if (actual.length !== build.entityTypes.length) {
    addUnique(blockers, 'entity_types_collection_malformed');
    ok = false;
  }
  if (actual.join('|') !== expected.join('|')) {
    addUnique(blockers, 'entity_types_row_mismatch');
    ok = false;
  }
  return ok;
}

function normalizeBuildMetadata(build: D8APBuild | null | undefined, blockers: string[]): NormalizedD8APBuild | null {
  if (!build || !isRecord(build)) {
    addUnique(blockers, 'd8ap_build_missing');
    return null;
  }
  const record = build as Record<string, unknown>;
  if (!ownKeys(record)) {
    addUnique(blockers, 'd8ap_build_missing');
    return null;
  }
  const requiredDataProperties = [
    'status',
    'kind',
    'traceLabel',
    'schemaVersion',
    'skillProfileId',
    'safeSummaryOnly',
    'fixtureBuildId',
    'fixtureSchemaId',
    'sourceHeadSha',
    'fixtureOnly',
    'inMemoryOnly',
    'zeroRealRows',
    'rowCount',
    'rows',
    'rowIds',
    'entityTypes',
    'canonicalFieldOrder',
    'jsonlContract',
    'boundarySummary',
    'blockerCount',
    'blockers',
    'needsReviewReasonCount',
    'needsReviewReasons',
    'nextSafeAction'
  ];
  for (const key of requiredDataProperties) {
    if (!hasDataProperty(record, key)) addUnique(blockers, 'd8ap_build_accessor_property');
  }
  for (const key of FORBIDDEN_INPUT_KEYS) {
    if (hasOwn(record, key)) addUnique(blockers, 'd8ap_forbidden_input_surface_present');
  }
  const normalized: NormalizedD8APBuild = {
    status: typeof safeRead(record, 'status') === 'string' ? safeRead(record, 'status') as string : '',
    kind: typeof safeRead(record, 'kind') === 'string' ? safeRead(record, 'kind') as string : '',
    traceLabel: typeof safeRead(record, 'traceLabel') === 'string' ? safeRead(record, 'traceLabel') as string : '',
    schemaVersion: typeof safeRead(record, 'schemaVersion') === 'string' ? safeRead(record, 'schemaVersion') as string : '',
    skillProfileId: typeof safeRead(record, 'skillProfileId') === 'string' ? safeRead(record, 'skillProfileId') as string : '',
    safeSummaryOnly: safeRead(record, 'safeSummaryOnly') === true,
    fixtureBuildId: typeof safeRead(record, 'fixtureBuildId') === 'string' ? safeRead(record, 'fixtureBuildId') as string : '',
    fixtureSchemaId: typeof safeRead(record, 'fixtureSchemaId') === 'string' ? safeRead(record, 'fixtureSchemaId') as string : '',
    sourceHeadSha: typeof safeRead(record, 'sourceHeadSha') === 'string' ? safeRead(record, 'sourceHeadSha') as string : '',
    fixtureOnly: safeRead(record, 'fixtureOnly') === true,
    inMemoryOnly: safeRead(record, 'inMemoryOnly') === true,
    zeroRealRows: safeRead(record, 'zeroRealRows') === true,
    rowCount: typeof safeRead(record, 'rowCount') === 'number' ? safeRead(record, 'rowCount') as number : NaN,
    rows: Array.isArray(safeRead(record, 'rows')) ? safeRead(record, 'rows') as unknown[] : [],
    rowIds: Array.isArray(safeRead(record, 'rowIds')) ? safeRead(record, 'rowIds') as unknown[] : [],
    entityTypes: Array.isArray(safeRead(record, 'entityTypes')) ? safeRead(record, 'entityTypes') as unknown[] : [],
    canonicalFieldOrder: Array.isArray(safeRead(record, 'canonicalFieldOrder')) ? safeRead(record, 'canonicalFieldOrder') as unknown[] : [],
    jsonlContract: isRecord(safeRead(record, 'jsonlContract')) ? safeRead(record, 'jsonlContract') as NormalizedD8APBuild['jsonlContract'] : {},
    boundarySummary: isRecord(safeRead(record, 'boundarySummary')) ? safeRead(record, 'boundarySummary') as NormalizedD8APBuild['boundarySummary'] : {},
    blockerCount: typeof safeRead(record, 'blockerCount') === 'number' ? safeRead(record, 'blockerCount') as number : NaN,
    blockers: Array.isArray(safeRead(record, 'blockers')) ? safeRead(record, 'blockers') as unknown[] : [],
    needsReviewReasonCount: typeof safeRead(record, 'needsReviewReasonCount') === 'number' ? safeRead(record, 'needsReviewReasonCount') as number : NaN,
    needsReviewReasons: Array.isArray(safeRead(record, 'needsReviewReasons')) ? safeRead(record, 'needsReviewReasons') as unknown[] : [],
    nextSafeAction: typeof safeRead(record, 'nextSafeAction') === 'string' || safeRead(record, 'nextSafeAction') === null
      ? safeRead(record, 'nextSafeAction') as string | null
      : ''
  };
  let ok = true;
  if (blockers.includes('d8ap_build_accessor_property') || blockers.includes('d8ap_forbidden_input_surface_present')) ok = false;
  if (normalized.status !== D8AP_READY_STATUS) {
    addUnique(blockers, 'd8ap_build_not_ready');
    ok = false;
  }
  if (normalized.kind !== TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_KIND) {
    addUnique(blockers, 'd8ap_kind_mismatch');
    ok = false;
  }
  if (normalized.traceLabel !== TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_TRACE_LABEL) {
    addUnique(blockers, 'd8ap_trace_label_mismatch');
    ok = false;
  }
  if (normalized.schemaVersion !== '1' || normalized.skillProfileId !== 'FUNKY_NO_TX_NO_RUNTIME_PROFILE' || normalized.safeSummaryOnly !== true) {
    addUnique(blockers, 'd8ap_metadata_mismatch');
    ok = false;
  }
  if (!safeToken(normalized.fixtureBuildId, 96)) {
    addUnique(blockers, 'fixture_build_id_missing');
    ok = false;
  }
  if (!safeToken(normalized.fixtureSchemaId, 96)) {
    addUnique(blockers, 'fixture_schema_id_missing');
    ok = false;
  }
  if (!safeSourceHead(normalized.sourceHeadSha)) {
    addUnique(blockers, 'source_head_sha_missing');
    ok = false;
  }
  if (normalized.fixtureOnly !== true || normalized.inMemoryOnly !== true || normalized.zeroRealRows !== true) {
    addUnique(blockers, 'd8ap_fixture_boundary_mismatch');
    ok = false;
  }
  if (!Number.isFinite(normalized.rowCount) || !Number.isInteger(normalized.rowCount) || normalized.rowCount < 1 || normalized.rowCount > MAX_ROW_COUNT) {
    addUnique(blockers, 'row_count_invalid');
    ok = false;
  }
  if (!Array.isArray(safeRead(record, 'rows')) || !Array.isArray(safeRead(record, 'rowIds')) || !Array.isArray(safeRead(record, 'entityTypes'))) {
    addUnique(blockers, 'd8ap_row_collections_malformed');
    ok = false;
  }
  if (Array.isArray(safeRead(record, 'rows')) && normalized.rows.length !== normalized.rowCount) {
    addUnique(blockers, 'row_count_mismatch');
    ok = false;
  }
  if (Array.isArray(safeRead(record, 'rowIds')) && normalized.rowIds.length !== normalized.rowCount) {
    addUnique(blockers, 'row_ids_length_mismatch');
    ok = false;
  }
  if (!Array.isArray(safeRead(record, 'canonicalFieldOrder')) || normalized.canonicalFieldOrder.join('|') !== D8AO_CANONICAL_FIELD_ORDER.join('|')) {
    addUnique(blockers, 'canonical_field_order_mismatch');
    ok = false;
  }
  if (!isRecord(safeRead(record, 'jsonlContract'))
    || normalized.jsonlContract.jsonlLinesReturned !== false
    || normalized.jsonlContract.fileWriteEnabled !== false
    || normalized.jsonlContract.inMemoryRowsOnly !== true) {
    addUnique(blockers, 'jsonl_contract_mismatch');
    ok = false;
  }
  if (!Array.isArray(safeRead(record, 'blockers')) || !normalized.blockers.every((item) => typeof item === 'string')) {
    addUnique(blockers, 'd8ap_blocker_collection_malformed');
    ok = false;
  }
  if (!Number.isFinite(normalized.blockerCount) || !Number.isInteger(normalized.blockerCount) || normalized.blockerCount < 0) {
    addUnique(blockers, 'd8ap_blocker_count_mismatch');
    ok = false;
  }
  if (normalized.blockerCount !== normalized.blockers.length) {
    addUnique(blockers, 'd8ap_blocker_count_mismatch');
    ok = false;
  }
  if (normalized.blockerCount !== 0 || normalized.blockers.length > 0) {
    addUnique(blockers, 'd8ap_blockers_present');
    ok = false;
  }
  if (!Array.isArray(safeRead(record, 'needsReviewReasons')) || !normalized.needsReviewReasons.every((item) => typeof item === 'string')) {
    addUnique(blockers, 'd8ap_review_collection_malformed');
    ok = false;
  }
  if (!Number.isFinite(normalized.needsReviewReasonCount) || !Number.isInteger(normalized.needsReviewReasonCount) || normalized.needsReviewReasonCount < 0) {
    addUnique(blockers, 'd8ap_review_count_mismatch');
    ok = false;
  }
  if (normalized.needsReviewReasonCount !== normalized.needsReviewReasons.length) {
    addUnique(blockers, 'd8ap_review_count_mismatch');
    ok = false;
  }
  if (normalized.status === D8AP_READY_STATUS && (normalized.needsReviewReasonCount !== 0 || normalized.needsReviewReasons.length > 0)) {
    addUnique(blockers, 'd8ap_ready_review_state_inconsistent');
    ok = false;
  }
  if (normalized.nextSafeAction !== D8AP_EXPECTED_NEXT_ACTION) {
    addUnique(blockers, 'd8ap_next_safe_action_mismatch');
    ok = false;
  }
  if (!validateBuildBoundarySummary(normalized, blockers)) ok = false;
  return normalized;
}

function nextSafeAction(blockers: string[], needsReviewReasons: string[]) {
  if (blockers.some((code) => code.includes('d8ap'))) return 'provide_d8ap_in_memory_fixture_build' as const;
  if (blockers.some((code) => code.includes('required') || code.includes('mode') || code.includes('policy'))) return 'restore_fixture_verifier_policy' as const;
  if (blockers.some((code) => code.includes('row') || code.includes('schema') || code.includes('hash') || code.includes('timestamp'))) return 'restore_canonical_fixture_rows' as const;
  if (blockers.some((code) => code.includes('input') || code.includes('file') || code.includes('artifact') || code.includes('jsonl'))) return 'remove_actual_row_input' as const;
  if (blockers.some((code) => code.includes('forbidden'))) return 'remove_forbidden_boundary_flag' as const;
  if (needsReviewReasons.length > 0) return REVIEW_NEXT_ACTION;
  return READY_NEXT_ACTION;
}

export function buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier(
  input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifierInput = {}
): TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureVerifier {
  const blockers: string[] = [];
  const needsReviewReasons: string[] = [];
  validatePolicy(input, blockers);
  collectForbiddenBoundaryReasons(input, blockers);
  normalizeInputCollections(input, blockers, needsReviewReasons);

  const beforeBuildBlockerCount = blockers.length;
  const build = normalizeBuildMetadata(input.d8apBuild, blockers);
  const buildMetadataVerified = !!build && blockers.length === beforeBuildBlockerCount;
  const rows = build ? build.rows : [];
  const seen = new Set<string>();
  let canonicalKeysVerified = false;
  let rowTypesVerified = false;
  let rowIdsUniqueVerified = false;
  let schemaBindingVerified = false;
  let sourceHeadConsistencyVerified = false;
  let sourceHashesVerified = false;
  let timestampsVerified = false;
  let safeStringsVerified = false;
  let publicFieldsVerified = false;
  let internalLabelsVerified = false;
  let walletSummaryVerified = false;
  let chainNetworkVerified = false;
  let requiredSafetyFlagsVerified = false;

  if (build) {
    rowIdsUniqueVerified = validateRowIds(build, rows, blockers);
    validateEntityTypes(build, rows, blockers);
  }

  let rowValidationExecuted = false;
  let rowValidationOk = !!build && blockers.length === 0;
  for (const [index, row] of rows.entries()) {
    rowValidationExecuted = true;
    const beforeBlockerCount = blockers.length;
    const beforeReviewCount = needsReviewReasons.length;
    const rowOk = build ? validateRow(row, index, build, blockers, needsReviewReasons, seen) : false;
    if (!rowOk) rowValidationOk = false;
    const newBlockers = blockers.slice(beforeBlockerCount);
    if (newBlockers.length > 0 || needsReviewReasons.length > beforeReviewCount) rowValidationOk = false;
  }
  if (rowValidationExecuted && rowValidationOk) {
    canonicalKeysVerified = true;
    rowTypesVerified = true;
    schemaBindingVerified = true;
    sourceHeadConsistencyVerified = true;
    sourceHashesVerified = true;
    timestampsVerified = true;
    safeStringsVerified = true;
    publicFieldsVerified = true;
    internalLabelsVerified = true;
    walletSummaryVerified = true;
    chainNetworkVerified = true;
    requiredSafetyFlagsVerified = true;
  }

  const status: Status = blockers.length > 0
    ? 'BLOCKED'
    : needsReviewReasons.length > 0
      ? 'NEEDS_REVIEW'
      : 'SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_READY';
  const verifiedRows = status === 'BLOCKED' ? [] : rows;
  const verifiedEntityTypes = status === 'BLOCKED'
    ? []
    : build?.entityTypes.filter((entityType): entityType is string => typeof entityType === 'string') || [];

  return {
    status,
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_KIND,
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_VERIFIER_TRACE_LABEL,
    schemaVersion: 1,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    safeSummaryOnly: true,
    fixtureVerifierId: safeToken(input.fixtureVerifierId, 96) ? input.fixtureVerifierId : '',
    fixtureBuildId: buildMetadataVerified && safeToken(build?.fixtureBuildId, 96) ? build.fixtureBuildId : '',
    fixtureSchemaId: buildMetadataVerified && safeToken(build?.fixtureSchemaId, 96) ? build.fixtureSchemaId : '',
    sourceHeadSha: buildMetadataVerified && safeSourceHead(build?.sourceHeadSha) ? build.sourceHeadSha : '',
    verifiedRowCount: verifiedRows.length,
    verifiedEntityTypes,
    schemaContractVerified: status !== 'BLOCKED' && !blockers.some((code) => code.includes('schema') || code.includes('contract')),
    buildMetadataVerified,
    canonicalKeysVerified,
    rowTypesVerified,
    rowIdsUniqueVerified: status !== 'BLOCKED' && rowIdsUniqueVerified && seen.size === rows.length,
    schemaBindingVerified: status !== 'BLOCKED' && schemaBindingVerified,
    sourceHeadConsistencyVerified: status !== 'BLOCKED' && sourceHeadConsistencyVerified,
    sourceHashesVerified,
    timestampsVerified,
    safeStringsVerified: status !== 'BLOCKED' && safeStringsVerified,
    publicFieldsVerified,
    internalLabelsVerified,
    walletSummaryVerified: status !== 'BLOCKED' && walletSummaryVerified,
    chainNetworkVerified,
    requiredSafetyFlagsVerified,
    fixtureOnlyVerified: status !== 'BLOCKED' && build?.fixtureOnly === true && input.fixtureOnlyRequired === true,
    inMemoryOnlyVerified: status !== 'BLOCKED' && build?.inMemoryOnly === true && input.inMemoryOnlyRequired === true,
    zeroRealRowsVerified: status !== 'BLOCKED' && build?.zeroRealRows === true && input.zeroRealRowsRequired === true,
    noFileOutputVerified: status !== 'BLOCKED' && build?.jsonlContract?.fileWriteEnabled === false && input.noFileOutputRequired === true,
    noJsonlFileOutputVerified: status !== 'BLOCKED' && build?.jsonlContract?.jsonlLinesReturned === false && input.noJsonlFileOutputRequired === true,
    noArtifactUploadVerified: status !== 'BLOCKED' && input.noArtifactUploadRequired === true,
    boundarySummary: boundarySummaryFor(input),
    blockerCount: blockers.length,
    blockers,
    needsReviewReasonCount: needsReviewReasons.length,
    needsReviewReasons,
    nextSafeAction: nextSafeAction(blockers, needsReviewReasons)
  };
}
