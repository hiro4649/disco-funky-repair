import { createHash } from 'node:crypto';

import {
  D8AO_CANONICAL_FIELD_ORDER,
  D8AO_ENTITY_TYPE_ALLOWLIST,
  D8AO_EVIDENCE_ORIGIN_ALLOWLIST,
  D8AO_READINESS_CLAIM_ALLOWLIST,
  D8AO_SAFETY_FLAG_ALLOWLIST,
  D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_KIND,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_TRACE_LABEL,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_VERSION
} from './tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema';
import {
  containsUnsafeSafeSummaryString,
  hasOwnPropertySafely,
  inspectOwnProperty,
  isNonEmptyTrimmedString,
  isPlainDataRecord,
  isSafeLowerToken,
  isSafeSourceHeadSha,
  normalizeAllowlistedReviewReasons,
  normalizeGenericBlockerPresence,
  readDenseOwnDataArray,
  readOwnDataProperty,
  reduceForbiddenBooleanFlags,
  strictOrderedPrimitiveArrayEqual
} from './tierUpdateActualSafeRowExportSafeValidationKernel';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_KIND =
  'tier_update_actual_safe_row_export_safe_summary_jsonl_fixture_in_memory_builder' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_TRACE_LABEL =
  'd8ap_actual_safe_row_export_safe_summary_jsonl_fixture_in_memory_builder' as const;

type Status = 'BLOCKED' | 'NEEDS_REVIEW' | 'SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY';

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

type D8AOSchemaInput = BoundaryFlags & {
  status?: string | null;
  kind?: string | null;
  traceLabel?: string | null;
  safeSummaryOnly?: boolean;
  fixtureOnly?: boolean;
  inMemoryOnly?: boolean;
  zeroRealRows?: boolean;
  fixtureSchemaId?: string | null;
  sourceHeadSha?: string | null;
  schemaVersion?: string | null;
  canonicalFieldOrder?: string[];
  fieldDefinitions?: Array<{ key: string; type: string; required: true; policy: string }>;
  entityTypeAllowlist?: string[];
  evidenceOriginAllowlist?: string[];
  readinessClaimAllowlist?: string[];
  walletAddressSummaryAllowlist?: string[];
  chainIdAllowlist?: Array<number | null>;
  networkLabelAllowlist?: string[];
  safetyFlagAllowlist?: string[];
  jsonlContract?: {
    utf8Required?: boolean;
    oneJsonObjectPerLineContract?: boolean;
    canonicalFieldOrderRequired?: boolean;
    multilineStringForbidden?: boolean;
    commentsForbidden?: boolean;
    jsonlLinesReturned?: boolean;
    fileWriteEnabled?: boolean;
    maxFixtureRowBytes?: number;
  };
  identifierPolicies?: {
    sourceHashAlgorithm?: string | null;
    rowIdStrategy?: string | null;
    auditExportIdStrategy?: string | null;
  };
  rowValuePolicy?: {
    rowValuesAccepted?: boolean;
    fixtureRowsAccepted?: boolean;
    actualRowsAccepted?: boolean;
    rawRowsAccepted?: boolean;
    recordsAccepted?: boolean;
    jsonlLinesAccepted?: boolean;
  };
};

export type SafeSummaryJsonlFixtureRow = {
  schema_version: string;
  audit_export_id: string;
  source_head_sha: string;
  source_hash: string;
  exported_at: string;
  row_id: string;
  dataset_name: string;
  entity_type: string;
  source_table: string | null;
  source_file: string | null;
  status: string;
  evidence_origin: string;
  readiness_claim: string;
  record_summary: string;
  public_visible_fields: Record<string, string | number | boolean | null>;
  internal_only_field_labels: string[];
  wallet_address_summary: string;
  chain_id: 56 | 97 | null;
  network_label: string;
  expected_safe_summary: string;
  safety_flags: string[];
};

export type BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput = BoundaryFlags & {
  d8aoSchema?: D8AOSchemaInput | null;
  d8aoSchemaStatus?: string | null;
  fixtureSchemaId?: string | null;
  sourceHeadSha?: string | null;
  fixtureBuildId?: string | null;
  fixtureDatasetName?: string | null;
  fixtureRowsRequested?: number | null;
  fixtureEntityTypes?: string[];
  syntheticSeedLabel?: string | null;
  inMemoryOnly?: boolean;
  fixtureOnly?: boolean;
  zeroRealRowsRequired?: boolean;
  noFileOutputRequired?: boolean;
  noJsonlFileOutputRequired?: boolean;
  boundarySummary?: BoundaryFlags | null;
  boundaryFlags?: BoundaryFlags | null;
  blockers?: string[];
  needsReviewReasons?: string[];
  nextSafeAction?: string | null;
  actualRows?: unknown[];
  rawRows?: unknown[];
  dbRows?: unknown[];
  sourceRows?: unknown[];
  records?: unknown[];
  jsonlLines?: string[];
  filePath?: string | null;
  outputPath?: string | null;
  artifactName?: string | null;
  sql?: string | null;
  query?: string | null;
  rawPayload?: unknown;
  endpoint?: string | null;
  overrideRowIds?: string[];
  overrideReadinessClaim?: string | null;
};

export type TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder = {
  status: Status;
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_KIND;
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_TRACE_LABEL;
  schemaVersion: '1';
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  fixtureBuildId: string;
  fixtureSchemaId: string;
  sourceHeadSha: string;
  fixtureOnly: true;
  inMemoryOnly: true;
  zeroRealRows: true;
  rowCount: number;
  rows: SafeSummaryJsonlFixtureRow[];
  rowIds: string[];
  entityTypes: string[];
  canonicalFieldOrder: string[];
  jsonlContract: {
    jsonlLinesReturned: false;
    fileWriteEnabled: false;
    inMemoryRowsOnly: true;
  };
  boundarySummary: Required<BoundaryFlags> & {
    safeSummaryOnly: true;
    fixtureOnly: true;
    inMemoryOnly: true;
  };
  blockerCount: number;
  blockers: string[];
  needsReviewReasonCount: number;
  needsReviewReasons: string[];
  nextSafeAction: 'provide_d8ao_schema'
    | 'provide_fixture_build_id'
    | 'provide_source_head_sha'
    | 'restore_canonical_schema'
    | 'remove_actual_row_input'
    | 'remove_forbidden_boundary_flag'
    | 'remove_unsafe_fixture_builder_value'
    | 'collect_fixture_builder_review'
    | 'prepare_pr_d8aq_safe_summary_jsonl_fixture_verifier';
};

const READY_STATUS = 'SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_ROWS_READY';
const D8AO_READY_STATUS = 'SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_READY';
const READY_NEXT_ACTION = 'prepare_pr_d8aq_safe_summary_jsonl_fixture_verifier';
const SAFE_ROW_CAP = 12;
const MAX_FIXTURE_ROW_BYTES = 32768;
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
];

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

const D8AP_CHAIN_ID_ALLOWLIST = [56, 97, null] as const;
const D8AP_NETWORK_LABEL_ALLOWLIST = ['none', 'bsc_testnet', 'bsc_mainnet', 'unknown'] as const;

const D8AP_EXPECTED_FIELD_DEFINITIONS = [
  { key: 'schema_version', type: 'string', required: true, policy: 'fixed fixture schema label only' },
  { key: 'audit_export_id', type: 'string', required: true, policy: 'synthetic safe batch id only' },
  { key: 'source_head_sha', type: 'string', required: true, policy: '40 lowercase hex characters' },
  { key: 'source_hash', type: 'string', required: true, policy: 'sha256:<64 lowercase hex>' },
  { key: 'exported_at', type: 'string', required: true, policy: 'ISO-8601 UTC metadata only' },
  { key: 'row_id', type: 'string', required: true, policy: 'synthetic deterministic safe id only' },
  { key: 'dataset_name', type: 'string', required: true, policy: 'safe label, no path, URL, or endpoint' },
  { key: 'entity_type', type: 'enum', required: true, policy: 'canonical fixture-lane entity allowlist' },
  { key: 'source_table', type: 'string|null', required: true, policy: 'safe logical label only' },
  { key: 'source_file', type: 'string|null', required: true, policy: 'safe token only, no filesystem path' },
  { key: 'status', type: 'string', required: true, policy: 'bounded safe status label' },
  { key: 'evidence_origin', type: 'enum', required: true, policy: 'fixture-lane evidence origin only' },
  { key: 'readiness_claim', type: 'enum', required: true, policy: 'fixture-lane claim only' },
  { key: 'record_summary', type: 'string', required: true, policy: 'single-line safe short summary' },
  { key: 'public_visible_fields', type: 'object', required: true, policy: 'flat safe primitives only' },
  { key: 'internal_only_field_labels', type: 'string[]', required: true, policy: 'labels only, never values' },
  { key: 'wallet_address_summary', type: 'enum', required: true, policy: 'none, synthetic, masked, or hash summary only' },
  { key: 'chain_id', type: 'integer|null', required: true, policy: '56, 97, or null only' },
  { key: 'network_label', type: 'enum', required: true, policy: 'none, bsc_testnet, bsc_mainnet, or unknown' },
  { key: 'expected_safe_summary', type: 'string', required: true, policy: 'single-line safe expected outcome summary' },
  { key: 'safety_flags', type: 'enum[]', required: true, policy: 'canonical safety flag allowlist only' }
] as const;

const FORBIDDEN_INPUT_PRESENCE_KEYS = [
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

const SAFE_REVIEW_REASON_ALLOWLIST = [
  'unknown_network_label_isolated_review',
  'incomplete_safe_fixture_coverage',
  'unknown_entity_type_isolated_review',
  'optional_fixture_metadata_incomplete',
  'deferred_entity_isolated_review'
] as const;

function addUnique(list: string[], value: string) {
  if (!list.includes(value)) list.push(value);
}

function hasValue(value: unknown): boolean {
  return isNonEmptyTrimmedString(value);
}

function validSafeToken(value: string | null | undefined): boolean {
  return isSafeLowerToken(value || '', 96);
}

function validSafeRowId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{2,127}$/.test(value);
}

function validSafeDatasetName(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{2,95}$/.test(value);
}

function validSourceHeadSha(value: string | null | undefined): boolean {
  return isSafeSourceHeadSha(value || '');
}

function hasUnsafeValue(value: unknown): boolean {
  return containsUnsafeSafeSummaryString(value);
}

function malformedExplicitValue(input: object, key: string, value: unknown): boolean {
  const inspection = inspectOwnProperty(input, key);
  if (inspection.kind === 'absent') return false;
  if (inspection.kind !== 'data') return true;
  return !isNonEmptyTrimmedString(inspection.value);
}

function normalizeUpstreamBlockers(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput, blockers: string[]) {
  const presence = inspectOwnProperty(input, 'blockers');
  if (presence.kind === 'absent') return;
  if (presence.kind === 'error' || presence.kind === 'accessor') {
    addUnique(blockers, 'upstream_blockers_invalid');
    return;
  }
  normalizeGenericBlockerPresence(readOwnDataProperty(input, 'blockers'), (blocker) => addUnique(blockers, blocker));
}

function normalizeNeedsReviewReasons(
  input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput,
  blockers: string[],
  needsReviewReasons: string[]
) {
  const presence = inspectOwnProperty(input, 'needsReviewReasons');
  if (presence.kind === 'absent') return;
  if (presence.kind === 'error' || presence.kind === 'accessor') {
    addUnique(blockers, 'needs_review_reasons_invalid');
    return;
  }
  normalizeAllowlistedReviewReasons(
    readOwnDataProperty(input, 'needsReviewReasons'),
    SAFE_REVIEW_REASON_ALLOWLIST,
    (blocker) => addUnique(blockers, blocker),
    (reason) => addUnique(needsReviewReasons, reason)
  );
}

function emptyBoundarySummary(): TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder['boundarySummary'] {
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

function boundarySummaryFor(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput): TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder['boundarySummary'] {
  const summary = emptyBoundarySummary();
  Object.assign(summary, reduceForbiddenBooleanFlags(collectBoundarySources(input), FORBIDDEN_BOUNDARY_FLAGS));
  return summary;
}

function collectBoundarySources(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput): Array<BoundaryFlags | null | undefined> {
  return [
    input,
    readOwnDataProperty(input, 'boundarySummary') as BoundaryFlags | null | undefined,
    readOwnDataProperty(input, 'boundaryFlags') as BoundaryFlags | null | undefined,
    readOwnDataProperty(input, 'd8aoSchema') as BoundaryFlags | null | undefined
  ];
}

function forbiddenBoundaryReasons(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput): string[] {
  const reasons: string[] = [];
  for (const key of ['boundarySummary', 'boundaryFlags', 'd8aoSchema'] as const) {
    const inspection = inspectOwnProperty(input, key);
    if (inspection.kind === 'accessor' || inspection.kind === 'error') addUnique(reasons, 'boundary_source_malformed');
  }
  const reduced = reduceForbiddenBooleanFlags(collectBoundarySources(input), FORBIDDEN_BOUNDARY_FLAGS, () => addUnique(reasons, 'boundary_source_malformed'));
  for (const flag of FORBIDDEN_BOUNDARY_FLAGS) if (reduced[flag]) addUnique(reasons, `${flag}_forbidden`);
  return reasons;
}

function rowInputsPresent(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput): boolean {
  return FORBIDDEN_INPUT_PRESENCE_KEYS.some((key) => inspectOwnProperty(input, key).kind !== 'absent');
}

function sameArray(actual: unknown, expected: readonly unknown[]): boolean {
  return strictOrderedPrimitiveArrayEqual(actual, expected as readonly (string | number | boolean | null)[]);
}

function sameFieldDefinitions(actual: unknown): boolean {
  const fields = readDenseOwnDataArray(actual, {
    maxLength: D8AP_EXPECTED_FIELD_DEFINITIONS.length,
    validateItem: (field): field is Record<string, unknown> => isPlainDataRecord(field)
      && inspectOwnProperty(field, 'key').kind === 'data'
      && inspectOwnProperty(field, 'type').kind === 'data'
      && inspectOwnProperty(field, 'required').kind === 'data'
      && inspectOwnProperty(field, 'policy').kind === 'data'
  });
  if (!fields.ok || fields.values.length !== D8AP_EXPECTED_FIELD_DEFINITIONS.length) return false;
  for (let index = 0; index < D8AP_EXPECTED_FIELD_DEFINITIONS.length; index += 1) {
    const field = fields.values[index];
    const expected = D8AP_EXPECTED_FIELD_DEFINITIONS[index];
    if (readOwnDataProperty(field, 'key') !== expected.key
      || readOwnDataProperty(field, 'type') !== expected.type
      || readOwnDataProperty(field, 'required') !== expected.required
      || readOwnDataProperty(field, 'policy') !== expected.policy) {
      return false;
    }
  }
  return true;
}

function isPlainSchemaInput(value: unknown): value is D8AOSchemaInput {
  return isPlainDataRecord(value);
}

function schemaIsCanonical(schema: D8AOSchemaInput | null | undefined): boolean {
  if (!schema) return false;
  if (!isPlainDataRecord(schema)) return false;
  const jsonlContract = readOwnDataProperty(schema, 'jsonlContract');
  const identifierPolicies = readOwnDataProperty(schema, 'identifierPolicies');
  const rowValuePolicy = readOwnDataProperty(schema, 'rowValuePolicy');
  if (readOwnDataProperty(schema, 'status') !== D8AO_READY_STATUS) return false;
  if (readOwnDataProperty(schema, 'kind') !== TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_KIND) return false;
  if (readOwnDataProperty(schema, 'traceLabel') !== TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_TRACE_LABEL) return false;
  if (readOwnDataProperty(schema, 'schemaVersion') !== TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_SCHEMA_VERSION) return false;
  if (readOwnDataProperty(schema, 'safeSummaryOnly') !== true || readOwnDataProperty(schema, 'fixtureOnly') !== true || readOwnDataProperty(schema, 'inMemoryOnly') !== true || readOwnDataProperty(schema, 'zeroRealRows') !== true) return false;
  const schemaFixtureSchemaId = readOwnDataProperty(schema, 'fixtureSchemaId');
  if (typeof schemaFixtureSchemaId !== 'string' || !isSafeLowerToken(schemaFixtureSchemaId, 96)) return false;
  const schemaSourceHeadSha = readOwnDataProperty(schema, 'sourceHeadSha');
  if (!validSourceHeadSha(typeof schemaSourceHeadSha === 'string' ? schemaSourceHeadSha : undefined)) return false;
  if (!sameArray(readOwnDataProperty(schema, 'canonicalFieldOrder') as unknown[] | undefined, D8AO_CANONICAL_FIELD_ORDER)) return false;
  if (!sameFieldDefinitions(readOwnDataProperty(schema, 'fieldDefinitions'))) return false;
  if (!sameArray(readOwnDataProperty(schema, 'entityTypeAllowlist') as unknown[] | undefined, D8AO_ENTITY_TYPE_ALLOWLIST)) return false;
  if (!sameArray(readOwnDataProperty(schema, 'evidenceOriginAllowlist') as unknown[] | undefined, D8AO_EVIDENCE_ORIGIN_ALLOWLIST)) return false;
  if (!sameArray(readOwnDataProperty(schema, 'readinessClaimAllowlist') as unknown[] | undefined, D8AO_READINESS_CLAIM_ALLOWLIST)) return false;
  if (!sameArray(readOwnDataProperty(schema, 'walletAddressSummaryAllowlist') as unknown[] | undefined, D8AO_WALLET_ADDRESS_SUMMARY_ALLOWLIST)) return false;
  if (!sameArray(readOwnDataProperty(schema, 'chainIdAllowlist') as unknown[] | undefined, D8AP_CHAIN_ID_ALLOWLIST)) return false;
  if (!sameArray(readOwnDataProperty(schema, 'networkLabelAllowlist') as unknown[] | undefined, D8AP_NETWORK_LABEL_ALLOWLIST)) return false;
  if (!sameArray(readOwnDataProperty(schema, 'safetyFlagAllowlist') as unknown[] | undefined, D8AO_SAFETY_FLAG_ALLOWLIST)) return false;
  if (!isPlainDataRecord(jsonlContract)
    || readOwnDataProperty(jsonlContract, 'utf8Required') !== true
    || readOwnDataProperty(jsonlContract, 'oneJsonObjectPerLineContract') !== true
    || readOwnDataProperty(jsonlContract, 'canonicalFieldOrderRequired') !== true
    || readOwnDataProperty(jsonlContract, 'multilineStringForbidden') !== true
    || readOwnDataProperty(jsonlContract, 'commentsForbidden') !== true
    || readOwnDataProperty(jsonlContract, 'fileWriteEnabled') !== false
    || readOwnDataProperty(jsonlContract, 'jsonlLinesReturned') !== false
    || readOwnDataProperty(jsonlContract, 'maxFixtureRowBytes') !== MAX_FIXTURE_ROW_BYTES) return false;
  if (!isPlainDataRecord(identifierPolicies)
    || readOwnDataProperty(identifierPolicies, 'sourceHashAlgorithm') !== 'sha256'
    || readOwnDataProperty(identifierPolicies, 'rowIdStrategy') !== 'synthetic_deterministic_safe_id'
    || readOwnDataProperty(identifierPolicies, 'auditExportIdStrategy') !== 'synthetic_fixture_batch_id') return false;
  if (!isPlainDataRecord(rowValuePolicy)
    || readOwnDataProperty(rowValuePolicy, 'rowValuesAccepted') !== false
    || readOwnDataProperty(rowValuePolicy, 'fixtureRowsAccepted') !== false
    || readOwnDataProperty(rowValuePolicy, 'actualRowsAccepted') !== false
    || readOwnDataProperty(rowValuePolicy, 'rawRowsAccepted') !== false
    || readOwnDataProperty(rowValuePolicy, 'recordsAccepted') !== false
    || readOwnDataProperty(rowValuePolicy, 'jsonlLinesAccepted') !== false) return false;
  return true;
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function buildRows(
  fixtureBuildId: string,
  fixtureSchemaId: string,
  sourceHeadSha: string,
  datasetName: string,
  entityTypes: string[],
  requested: number,
  overrideReadinessClaim?: string | null,
  overrideRowIds?: string[]
): SafeSummaryJsonlFixtureRow[] {
  const rows: SafeSummaryJsonlFixtureRow[] = [];
  for (let index = 0; index < requested; index += 1) {
    const entityType = entityTypes[index % entityTypes.length];
    const rowId = overrideRowIds?.[index] || `${fixtureBuildId}-${entityType}-${String(index + 1).padStart(2, '0')}`;
    rows.push({
      schema_version: '1',
      audit_export_id: `audit-${fixtureSchemaId}`,
      source_head_sha: sourceHeadSha,
      source_hash: `sha256:${sha256Hex(`${fixtureBuildId}:${entityType}:${index}`)}`,
      exported_at: '2026-01-01T00:00:00.000Z',
      row_id: rowId,
      dataset_name: datasetName,
      entity_type: entityType,
      source_table: `${entityType}_safe_fixture`,
      source_file: null,
      status: 'fixture_ready',
      evidence_origin: 'fixture',
      readiness_claim: overrideReadinessClaim || 'fixture_only',
      record_summary: `${entityType} synthetic fixture row`,
      public_visible_fields: {
        fixture_index: index + 1,
        synthetic: true,
        entity_type: entityType
      },
    internal_only_field_labels: ['internal_env_label', 'internal_log_label', 'internal_payload_label', 'path_label', 'wallet_summary_label'],
      wallet_address_summary: 'none',
      chain_id: null,
      network_label: 'none',
      expected_safe_summary: `${entityType} fixture row remains in memory only`,
      safety_flags: [...REQUIRED_SAFETY_FLAGS]
    });
  }
  return rows;
}

function rowsValid(rows: SafeSummaryJsonlFixtureRow[], sourceHeadSha: string, fixtureBuildId: string): string[] {
  const blockers: string[] = [];
  const ids = new Set<string>();
  for (const [index, row] of rows.entries()) {
    const keys = Object.keys(row);
    if (keys.join('|') !== D8AO_CANONICAL_FIELD_ORDER.join('|')) addUnique(blockers, 'row_canonical_keys_mismatch');
    if (ids.has(row.row_id)) addUnique(blockers, 'duplicate_row_id');
    ids.add(row.row_id);
    if (!validSafeRowId(row.row_id)) addUnique(blockers, 'row_id_unsafe');
    if (!validSafeDatasetName(row.dataset_name)) addUnique(blockers, 'dataset_name_unsafe');
    if (row.source_head_sha !== sourceHeadSha) addUnique(blockers, 'row_source_head_mismatch');
    if (!/^sha256:[a-f0-9]{64}$/.test(row.source_hash)) addUnique(blockers, 'row_source_hash_invalid');
    if (row.source_hash !== `sha256:${sha256Hex(`${fixtureBuildId}:${row.entity_type}:${index}`)}`) addUnique(blockers, 'row_source_hash_semantic_mismatch');
    if (!D8AO_EVIDENCE_ORIGIN_ALLOWLIST.includes(row.evidence_origin as typeof D8AO_EVIDENCE_ORIGIN_ALLOWLIST[number])) addUnique(blockers, 'row_evidence_origin_unsafe');
    if (!D8AO_READINESS_CLAIM_ALLOWLIST.includes(row.readiness_claim as typeof D8AO_READINESS_CLAIM_ALLOWLIST[number])) addUnique(blockers, 'row_readiness_claim_unsafe');
    for (const flag of REQUIRED_SAFETY_FLAGS) if (!row.safety_flags.includes(flag)) addUnique(blockers, 'row_required_safety_flag_missing');
    if (!D8AO_ENTITY_TYPE_ALLOWLIST.includes(row.entity_type as typeof D8AO_ENTITY_TYPE_ALLOWLIST[number])) addUnique(blockers, 'row_entity_type_unsafe');
    if (hasUnsafeValue([
      row.audit_export_id,
      row.row_id,
      row.dataset_name,
      row.source_table,
      row.source_file,
      row.status,
      row.record_summary,
      row.expected_safe_summary
    ])) addUnique(blockers, 'row_unsafe_value');
  }
  return blockers;
}

function hasUnsafeDirectInput(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput): boolean {
  return hasUnsafeValue([
    readOwnDataProperty(input, 'fixtureBuildId'),
    readOwnDataProperty(input, 'fixtureDatasetName'),
    readOwnDataProperty(input, 'syntheticSeedLabel'),
    readOwnDataProperty(input, 'filePath'),
    readOwnDataProperty(input, 'outputPath'),
    readOwnDataProperty(input, 'artifactName'),
    readOwnDataProperty(input, 'sql'),
    readOwnDataProperty(input, 'query'),
    readOwnDataProperty(input, 'rawPayload'),
    readOwnDataProperty(input, 'endpoint'),
    readOwnDataProperty(input, 'overrideRowIds'),
    readOwnDataProperty(input, 'overrideReadinessClaim')
  ]);
}

function isExplicitUnsafeInput(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput, key: keyof BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput): boolean {
  const inspection = inspectOwnProperty(input, key);
  if (inspection.kind === 'absent') return false;
  if (inspection.kind !== 'data') return true;
  return hasUnsafeValue(inspection.value);
}

function safeInputValue<T>(
  input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput,
  key: keyof BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput,
  fallback: T
): unknown | T {
  const inspection = inspectOwnProperty(input, key);
  return inspection.kind === 'data' ? inspection.value : fallback;
}

function nextSafeAction(blockers: string[], needsReviewReasons: string[]): TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder['nextSafeAction'] {
  if (blockers.some((code) => code.includes('d8ao'))) return 'provide_d8ao_schema';
  if (blockers.includes('fixture_build_id_missing')) return 'provide_fixture_build_id';
  if (blockers.some((code) => code.includes('source_head_sha'))) return 'provide_source_head_sha';
  if (blockers.some((code) => code.includes('schema') || code.includes('allowlist') || code.includes('contract'))) return 'restore_canonical_schema';
  if (blockers.some((code) => code.includes('row_input') || code.includes('jsonl') || code.includes('file') || code.includes('artifact'))) return 'remove_actual_row_input';
  if (blockers.some((code) => code.includes('forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.length > 0) return 'remove_unsafe_fixture_builder_value';
  if (needsReviewReasons.length > 0) return 'collect_fixture_builder_review';
  return READY_NEXT_ACTION;
}

export function buildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder(
  input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput = {}
): TierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilder {
  const blockers: string[] = [];
  const needsReviewReasons: string[] = [];
  const schemaValue = safeInputValue(input, 'd8aoSchema', null);
  const schema = isPlainSchemaInput(schemaValue) ? schemaValue : null;
  const schemaRecord = schema ?? {};
  const d8aoStatusValue = readOwnDataProperty(schemaRecord, 'status');
  const fixtureSchemaIdValue = readOwnDataProperty(schemaRecord, 'fixtureSchemaId');
  const sourceHeadShaValue = readOwnDataProperty(schemaRecord, 'sourceHeadSha');
  const d8aoStatus = typeof d8aoStatusValue === 'string' ? d8aoStatusValue : 'missing';
  const fixtureSchemaId = typeof fixtureSchemaIdValue === 'string' ? fixtureSchemaIdValue : '';
  const sourceHeadSha = typeof sourceHeadShaValue === 'string' ? sourceHeadShaValue : '';
  const requestedInspection = inspectOwnProperty(input, 'fixtureRowsRequested');
  const requestedValue = requestedInspection.kind === 'absent' ? 1 : requestedInspection.kind === 'data' ? requestedInspection.value : NaN;
  const requested = typeof requestedValue === 'number' ? requestedValue : NaN;
  const fixtureBuildIdInspection = inspectOwnProperty(input, 'fixtureBuildId');
  const fixtureBuildId = fixtureBuildIdInspection.kind === 'data' && typeof fixtureBuildIdInspection.value === 'string'
    ? fixtureBuildIdInspection.value
    : '';
  const fixtureDatasetNameInspection = inspectOwnProperty(input, 'fixtureDatasetName');
  const fixtureEntityTypesInspection = inspectOwnProperty(input, 'fixtureEntityTypes');
  const overrideReadinessClaimInspection = inspectOwnProperty(input, 'overrideReadinessClaim');
  const overrideRowIdsInspection = inspectOwnProperty(input, 'overrideRowIds');
  const datasetName = fixtureDatasetNameInspection.kind === 'absent' ? 'safe_summary_jsonl_fixture_dataset' : readOwnDataProperty(input, 'fixtureDatasetName');
  const entityTypesResult = fixtureEntityTypesInspection.kind === 'absent'
    ? { ok: true as const, values: ['fixture'] }
    : readDenseOwnDataArray(readOwnDataProperty(input, 'fixtureEntityTypes'), {
      maxLength: SAFE_ROW_CAP,
      minLength: 1,
      validateItem: (value): value is string => typeof value === 'string'
    });
  const entityTypes = entityTypesResult.ok ? entityTypesResult.values : [];
  const overrideReadinessClaim = overrideReadinessClaimInspection.kind === 'absent' ? 'fixture_only' : readOwnDataProperty(input, 'overrideReadinessClaim');
  const safeDatasetName = typeof datasetName === 'string' ? datasetName : '';
  const safeOverrideReadinessClaim = typeof overrideReadinessClaim === 'string' ? overrideReadinessClaim : '';

  if (!schema) addUnique(blockers, 'd8ao_schema_missing');
  if (d8aoStatus !== D8AO_READY_STATUS) addUnique(blockers, 'd8ao_schema_not_ready');
  if (!schemaIsCanonical(schema)) addUnique(blockers, 'd8ao_schema_contract_not_canonical');
  if (fixtureBuildIdInspection.kind === 'accessor' || fixtureBuildIdInspection.kind === 'error') addUnique(blockers, 'fixture_build_id_missing');
  if (!hasValue(fixtureBuildId) || !validSafeToken(fixtureBuildId)) addUnique(blockers, 'fixture_build_id_missing');
  if (!hasValue(fixtureSchemaId) || !validSafeToken(fixtureSchemaId)) addUnique(blockers, 'fixture_schema_id_missing');
  for (const [key, code] of [
    ['fixtureSchemaId', 'fixture_schema_id_mismatch'],
    ['sourceHeadSha', 'source_head_sha_schema_mismatch'],
    ['d8aoSchemaStatus', 'd8ao_schema_status_mismatch']
  ] as const) {
    const inspection = inspectOwnProperty(input, key);
    if (inspection.kind === 'accessor' || inspection.kind === 'error') addUnique(blockers, code);
  }
  if (inspectOwnProperty(input, 'fixtureSchemaId').kind === 'data' && readOwnDataProperty(input, 'fixtureSchemaId') !== fixtureSchemaId) addUnique(blockers, 'fixture_schema_id_mismatch');
  if (inspectOwnProperty(input, 'sourceHeadSha').kind === 'data' && readOwnDataProperty(input, 'sourceHeadSha') !== sourceHeadSha) addUnique(blockers, 'source_head_sha_schema_mismatch');
  if (inspectOwnProperty(input, 'd8aoSchemaStatus').kind === 'data' && readOwnDataProperty(input, 'd8aoSchemaStatus') !== d8aoStatus) addUnique(blockers, 'd8ao_schema_status_mismatch');
  if (!hasValue(sourceHeadSha)) addUnique(blockers, 'source_head_sha_missing');
  else if (!validSourceHeadSha(sourceHeadSha)) addUnique(blockers, 'source_head_sha_invalid');
  if (requestedInspection.kind === 'accessor' || requestedInspection.kind === 'error') addUnique(blockers, 'fixture_rows_requested_not_finite_integer');
  if (inspectOwnProperty(input, 'syntheticSeedLabel').kind === 'accessor' || inspectOwnProperty(input, 'syntheticSeedLabel').kind === 'error') addUnique(blockers, 'unsafe_fixture_builder_value');
  if (!Number.isFinite(requested) || !Number.isInteger(requested)) addUnique(blockers, 'fixture_rows_requested_not_finite_integer');
  else if (requested < 1) addUnique(blockers, 'fixture_rows_requested_too_low');
  else if (requested > SAFE_ROW_CAP) addUnique(blockers, 'fixture_rows_requested_too_high');
  if (malformedExplicitValue(input, 'fixtureDatasetName', datasetName)) addUnique(blockers, 'fixture_dataset_name_unsafe');
  if (!validSafeDatasetName(safeDatasetName)) addUnique(blockers, 'fixture_dataset_name_unsafe');

  if (!entityTypesResult.ok) {
    addUnique(blockers, 'fixture_entity_types_invalid');
  } else {
    if (entityTypes.length === 0) addUnique(blockers, 'fixture_entity_types_empty');
    for (const entityType of entityTypes) {
      if (typeof entityType !== 'string') addUnique(blockers, 'fixture_entity_type_unsafe');
      else if (entityType === 'unknown_review_only') addUnique(needsReviewReasons, 'unknown_entity_type_isolated_review');
      else if (!D8AO_ENTITY_TYPE_ALLOWLIST.includes(entityType as typeof D8AO_ENTITY_TYPE_ALLOWLIST[number])) addUnique(blockers, 'fixture_entity_type_unsafe');
    }
  }

  if (overrideReadinessClaimInspection.kind === 'accessor' || overrideReadinessClaimInspection.kind === 'error') addUnique(blockers, 'override_readiness_claim_unsafe');
  if (hasOwnPropertySafely(input, 'overrideReadinessClaim')) {
    if (safeOverrideReadinessClaim.trim() === '') addUnique(blockers, 'override_readiness_claim_unsafe');
    else if (!D8AO_READINESS_CLAIM_ALLOWLIST.includes(safeOverrideReadinessClaim as typeof D8AO_READINESS_CLAIM_ALLOWLIST[number])) {
      addUnique(blockers, 'override_readiness_claim_unsafe');
    }
  }

  if (overrideRowIdsInspection.kind === 'accessor' || overrideRowIdsInspection.kind === 'error') addUnique(blockers, 'override_row_ids_invalid');
  let overrideRowIdsSnapshot: string[] | undefined;
  if (overrideRowIdsInspection.kind === 'data') {
    const overrideRowIds = readDenseOwnDataArray(overrideRowIdsInspection.value, {
      maxLength: SAFE_ROW_CAP,
      validateItem: (value): value is string => typeof value === 'string'
    });
    if (!overrideRowIds.ok) addUnique(blockers, 'override_row_ids_invalid');
    else {
      overrideRowIdsSnapshot = overrideRowIds.values;
      if (Number.isInteger(requested) && overrideRowIdsSnapshot.length !== requested) addUnique(blockers, 'override_row_ids_length_mismatch');
      if (new Set(overrideRowIdsSnapshot).size !== overrideRowIdsSnapshot.length) addUnique(blockers, 'duplicate_row_id');
      for (const rowId of overrideRowIdsSnapshot) {
        if (!validSafeRowId(rowId)) addUnique(blockers, 'override_row_id_unsafe');
      }
    }
  }

  if (readOwnDataProperty(input, 'inMemoryOnly') !== true) addUnique(blockers, 'in_memory_only_required');
  if (readOwnDataProperty(input, 'fixtureOnly') !== true) addUnique(blockers, 'fixture_only_required');
  if (readOwnDataProperty(input, 'zeroRealRowsRequired') !== true) addUnique(blockers, 'zero_real_rows_required');
  if (readOwnDataProperty(input, 'noFileOutputRequired') !== true) addUnique(blockers, 'no_file_output_required');
  if (readOwnDataProperty(input, 'noJsonlFileOutputRequired') !== true) addUnique(blockers, 'no_jsonl_file_output_required');
  if (rowInputsPresent(input)) addUnique(blockers, 'actual_row_input_forbidden');
  if (isExplicitUnsafeInput(input, 'filePath') || isExplicitUnsafeInput(input, 'outputPath')) addUnique(blockers, 'file_output_path_forbidden');
  if (isExplicitUnsafeInput(input, 'artifactName')) addUnique(blockers, 'artifact_name_forbidden');
  if (isExplicitUnsafeInput(input, 'sql') || isExplicitUnsafeInput(input, 'query')) addUnique(blockers, 'sql_or_query_forbidden');
  if (isExplicitUnsafeInput(input, 'rawPayload')) addUnique(blockers, 'raw_payload_forbidden');
  if (isExplicitUnsafeInput(input, 'endpoint')) addUnique(blockers, 'endpoint_forbidden');
  for (const reason of forbiddenBoundaryReasons(input)) addUnique(blockers, reason);
  normalizeUpstreamBlockers(input, blockers);
  normalizeNeedsReviewReasons(input, blockers, needsReviewReasons);
  if (hasUnsafeDirectInput(input)) addUnique(blockers, 'unsafe_fixture_builder_value');
  if (inspectOwnProperty(input, 'nextSafeAction').kind !== 'absent' && readOwnDataProperty(input, 'nextSafeAction') !== READY_NEXT_ACTION) addUnique(blockers, 'next_safe_action_unsafe');

  let rows = blockers.length === 0 && needsReviewReasons.length === 0
    ? buildRows(fixtureBuildId, fixtureSchemaId, sourceHeadSha, safeDatasetName, entityTypes, requested, safeOverrideReadinessClaim, overrideRowIdsSnapshot)
    : [];
  for (const rowBlocker of rowsValid(rows, sourceHeadSha, fixtureBuildId)) addUnique(blockers, rowBlocker);
  if (blockers.length > 0) rows = [];
  if (needsReviewReasons.includes('incomplete_safe_fixture_coverage')) {
    // Keep the rows, but require owner/operator review before treating the slice as ready.
  }

  const status: Status = blockers.length > 0
    ? 'BLOCKED'
    : needsReviewReasons.length > 0
      ? 'NEEDS_REVIEW'
      : READY_STATUS;

  const rowIds = rows.map((row) => row.row_id);
  return {
    status,
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_KIND,
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_SAFE_SUMMARY_JSONL_FIXTURE_IN_MEMORY_BUILDER_TRACE_LABEL,
    schemaVersion: '1',
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    fixtureBuildId: validSafeToken(fixtureBuildId) && !hasUnsafeValue(fixtureBuildId) ? fixtureBuildId : '',
    fixtureSchemaId: blockers.includes('fixture_schema_id_mismatch') || !validSafeToken(fixtureSchemaId) ? '' : fixtureSchemaId,
    sourceHeadSha: blockers.includes('source_head_sha_schema_mismatch') || !validSourceHeadSha(sourceHeadSha) ? '' : sourceHeadSha,
    fixtureOnly: true,
    inMemoryOnly: true,
    zeroRealRows: true,
    rowCount: rows.length,
    rows,
    rowIds,
    entityTypes: [...new Set(rows.map((row) => row.entity_type))],
    canonicalFieldOrder: [...D8AO_CANONICAL_FIELD_ORDER],
    jsonlContract: {
      jsonlLinesReturned: false,
      fileWriteEnabled: false,
      inMemoryRowsOnly: true
    },
    boundarySummary: boundarySummaryFor(input),
    blockerCount: blockers.length,
    blockers,
    needsReviewReasonCount: needsReviewReasons.length,
    needsReviewReasons,
    nextSafeAction: nextSafeAction(blockers, needsReviewReasons)
  };
}
