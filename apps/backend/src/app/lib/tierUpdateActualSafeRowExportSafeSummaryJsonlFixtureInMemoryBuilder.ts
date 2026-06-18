import {
  D8AO_CANONICAL_FIELD_ORDER,
  D8AO_EVIDENCE_ORIGIN_ALLOWLIST,
  D8AO_READINESS_CLAIM_ALLOWLIST,
  D8AO_SAFETY_FLAG_ALLOWLIST
} from './tierUpdateActualSafeRowExportSafeSummaryJsonlFixtureSchema';

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
    jsonlLinesReturned?: boolean;
    fileWriteEnabled?: boolean;
  };
  identifierPolicies?: {
    sourceHashAlgorithm?: string | null;
    rowIdStrategy?: string | null;
    auditExportIdStrategy?: string | null;
  };
  rowValuePolicy?: {
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
  /0x[a-f0-9]{40}/i,
  /[a-z]:[\\/]/i,
  /(^|[\s"'])(\/(?:users|home|var|etc|tmp)\/[^\s"']*)/i,
  /\.\.[\\/]/
];

function addUnique(list: string[], value: string) {
  if (!list.includes(value)) list.push(value);
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function validSafeToken(value: string | null | undefined): boolean {
  return /^[a-z0-9][a-z0-9_-]{2,95}$/.test(String(value || ''));
}

function validSourceHeadSha(value: string | null | undefined): boolean {
  return /^[a-f0-9]{40}$/.test(String(value || ''));
}

function hasUnsafeValue(value: unknown): boolean {
  if (typeof value === 'string') return UNSAFE_PATTERNS.some((pattern) => pattern.test(value));
  if (Array.isArray(value)) return value.some(hasUnsafeValue);
  if (value && typeof value === 'object') return Object.values(value).some(hasUnsafeValue);
  return false;
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

function collectBoundarySources(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput): BoundaryFlags[] {
  return [input, input.boundarySummary || {}, input.boundaryFlags || {}, input.d8aoSchema || {}];
}

function forbiddenBoundaryReasons(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput): string[] {
  const reasons: string[] = [];
  for (const source of collectBoundarySources(input)) {
    for (const flag of FORBIDDEN_BOUNDARY_FLAGS) {
      if (source[flag] === true) addUnique(reasons, `${flag}_forbidden`);
    }
  }
  return reasons;
}

function rowInputsPresent(input: BuildTierUpdateActualSafeRowExportSafeSummaryJsonlFixtureInMemoryBuilderInput): boolean {
  return [input.actualRows, input.rawRows, input.dbRows, input.sourceRows, input.records, input.jsonlLines]
    .some((value) => Array.isArray(value) && value.length > 0);
}

function schemaIsCanonical(schema: D8AOSchemaInput | null | undefined): boolean {
  if (!schema) return false;
  if (schema.status !== D8AO_READY_STATUS) return false;
  if (!schema.canonicalFieldOrder || schema.canonicalFieldOrder.join('|') !== D8AO_CANONICAL_FIELD_ORDER.join('|')) return false;
  if (!schema.fieldDefinitions || schema.fieldDefinitions.map((field) => field.key).join('|') !== D8AO_CANONICAL_FIELD_ORDER.join('|')) return false;
  if (!schema.evidenceOriginAllowlist || schema.evidenceOriginAllowlist.join('|') !== D8AO_EVIDENCE_ORIGIN_ALLOWLIST.join('|')) return false;
  if (!schema.readinessClaimAllowlist || schema.readinessClaimAllowlist.join('|') !== D8AO_READINESS_CLAIM_ALLOWLIST.join('|')) return false;
  if (!schema.safetyFlagAllowlist || schema.safetyFlagAllowlist.join('|') !== D8AO_SAFETY_FLAG_ALLOWLIST.join('|')) return false;
  if (!schema.jsonlContract || schema.jsonlContract.fileWriteEnabled !== false || schema.jsonlContract.jsonlLinesReturned !== false) return false;
  if (!schema.identifierPolicies || schema.identifierPolicies.sourceHashAlgorithm !== 'sha256') return false;
  if (!schema.rowValuePolicy || schema.rowValuePolicy.actualRowsAccepted !== false || schema.rowValuePolicy.jsonlLinesAccepted !== false) return false;
  return true;
}

function stableHex(seed: string): string {
  let state = 0x811c9dc5;
  for (const char of seed) {
    state ^= char.charCodeAt(0);
    state = Math.imul(state, 0x01000193) >>> 0;
  }
  const chunk = state.toString(16).padStart(8, '0');
  return (chunk + chunk + chunk + chunk + chunk + chunk + chunk + chunk).slice(0, 64);
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
      source_hash: `sha256:${stableHex(`${fixtureBuildId}:${entityType}:${index}`)}`,
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

function rowsValid(rows: SafeSummaryJsonlFixtureRow[], sourceHeadSha: string, canonicalEntityTypes: string[]): string[] {
  const blockers: string[] = [];
  const ids = new Set<string>();
  for (const row of rows) {
    const keys = Object.keys(row);
    if (keys.join('|') !== D8AO_CANONICAL_FIELD_ORDER.join('|')) addUnique(blockers, 'row_canonical_keys_mismatch');
    if (ids.has(row.row_id)) addUnique(blockers, 'duplicate_row_id');
    ids.add(row.row_id);
    if (row.source_head_sha !== sourceHeadSha) addUnique(blockers, 'row_source_head_mismatch');
    if (!/^sha256:[a-f0-9]{64}$/.test(row.source_hash)) addUnique(blockers, 'row_source_hash_invalid');
    if (!D8AO_EVIDENCE_ORIGIN_ALLOWLIST.includes(row.evidence_origin as typeof D8AO_EVIDENCE_ORIGIN_ALLOWLIST[number])) addUnique(blockers, 'row_evidence_origin_unsafe');
    if (!D8AO_READINESS_CLAIM_ALLOWLIST.includes(row.readiness_claim as typeof D8AO_READINESS_CLAIM_ALLOWLIST[number])) addUnique(blockers, 'row_readiness_claim_unsafe');
    for (const flag of REQUIRED_SAFETY_FLAGS) if (!row.safety_flags.includes(flag)) addUnique(blockers, 'row_required_safety_flag_missing');
    if (!canonicalEntityTypes.includes(row.entity_type)) addUnique(blockers, 'row_entity_type_unsafe');
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
    input.fixtureBuildId,
    input.fixtureDatasetName,
    input.syntheticSeedLabel,
    input.filePath,
    input.outputPath,
    input.artifactName,
    input.sql,
    input.query,
    input.rawPayload,
    input.endpoint,
    input.overrideRowIds,
    input.overrideReadinessClaim
  ]);
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
  const schema = input.d8aoSchema || null;
  const d8aoStatus = input.d8aoSchemaStatus || schema?.status || 'missing';
  const fixtureSchemaId = input.fixtureSchemaId || schema?.fixtureSchemaId || '';
  const sourceHeadSha = input.sourceHeadSha || schema?.sourceHeadSha || '';
  const requested = input.fixtureRowsRequested ?? 1;
  const fixtureBuildId = input.fixtureBuildId || '';
  const datasetName = input.fixtureDatasetName || 'safe_summary_jsonl_fixture_dataset';
  const entityTypes = input.fixtureEntityTypes || ['fixture'];

  if (!schema) addUnique(blockers, 'd8ao_schema_missing');
  if (d8aoStatus !== D8AO_READY_STATUS) addUnique(blockers, 'd8ao_schema_not_ready');
  if (!schemaIsCanonical(schema)) addUnique(blockers, 'd8ao_schema_contract_not_canonical');
  if (!hasValue(fixtureBuildId) || !validSafeToken(fixtureBuildId)) addUnique(blockers, 'fixture_build_id_missing');
  if (!hasValue(fixtureSchemaId) || !validSafeToken(fixtureSchemaId)) addUnique(blockers, 'fixture_schema_id_missing');
  if (!hasValue(sourceHeadSha)) addUnique(blockers, 'source_head_sha_missing');
  else if (!validSourceHeadSha(sourceHeadSha)) addUnique(blockers, 'source_head_sha_invalid');
  if (requested < 1) addUnique(blockers, 'fixture_rows_requested_too_low');
  if (requested > SAFE_ROW_CAP) addUnique(blockers, 'fixture_rows_requested_too_high');
  if (entityTypes.length === 0) addUnique(blockers, 'fixture_entity_types_empty');

  const allowedEntityTypes = schema?.entityTypeAllowlist || [];
  for (const entityType of entityTypes) {
    if (entityType === 'unknown_review_only') addUnique(needsReviewReasons, 'unknown_entity_type_isolated_review');
    else if (!allowedEntityTypes.includes(entityType)) addUnique(blockers, 'fixture_entity_type_unsafe');
  }

  if (input.inMemoryOnly !== true) addUnique(blockers, 'in_memory_only_required');
  if (input.fixtureOnly !== true) addUnique(blockers, 'fixture_only_required');
  if (input.zeroRealRowsRequired !== true) addUnique(blockers, 'zero_real_rows_required');
  if (input.noFileOutputRequired !== true) addUnique(blockers, 'no_file_output_required');
  if (input.noJsonlFileOutputRequired !== true) addUnique(blockers, 'no_jsonl_file_output_required');
  if (rowInputsPresent(input)) addUnique(blockers, 'actual_row_input_forbidden');
  if (hasValue(input.filePath) || hasValue(input.outputPath)) addUnique(blockers, 'file_output_path_forbidden');
  if (hasValue(input.artifactName)) addUnique(blockers, 'artifact_name_forbidden');
  if (hasValue(input.sql) || hasValue(input.query)) addUnique(blockers, 'sql_or_query_forbidden');
  if (hasValue(input.rawPayload)) addUnique(blockers, 'raw_payload_forbidden');
  if (hasValue(input.endpoint)) addUnique(blockers, 'endpoint_forbidden');
  for (const reason of forbiddenBoundaryReasons(input)) addUnique(blockers, reason);
  for (const blocker of input.blockers || []) addUnique(blockers, blocker);
  for (const reason of input.needsReviewReasons || []) addUnique(needsReviewReasons, reason);
  if (hasUnsafeDirectInput(input)) addUnique(blockers, 'unsafe_fixture_builder_value');
  if (input.nextSafeAction !== undefined && input.nextSafeAction !== READY_NEXT_ACTION) addUnique(blockers, 'next_safe_action_unsafe');

  let rows = buildRows(fixtureBuildId || 'fixture-build', fixtureSchemaId || 'fixture-schema', sourceHeadSha || 'a'.repeat(40), datasetName, entityTypes.length ? entityTypes : ['fixture'], Math.max(1, Math.min(requested, SAFE_ROW_CAP)), input.overrideReadinessClaim, input.overrideRowIds);
  if (blockers.includes('fixture_entity_type_unsafe')) rows = [];
  for (const rowBlocker of rowsValid(rows, sourceHeadSha, allowedEntityTypes)) addUnique(blockers, rowBlocker);
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
    fixtureBuildId,
    fixtureSchemaId,
    sourceHeadSha,
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
    boundarySummary: emptyBoundarySummary(),
    blockerCount: blockers.length,
    blockers,
    needsReviewReasonCount: needsReviewReasons.length,
    needsReviewReasons,
    nextSafeAction: nextSafeAction(blockers, needsReviewReasons)
  };
}
