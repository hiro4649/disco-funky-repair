import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture,
  TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture';
import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape';
import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateContract
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateContract';
import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate
} from './tierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_FIXTURE_VERIFIER_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_fixture_verifier' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_FIXTURE_VERIFIER_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_FIXTURE_VERIFIER_TRACE_LABEL =
  'd8aa_actual_safe_row_export_read_only_source_candidate_fixture_verifier' as const;

type FixtureVerifierStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'FIXTURE_VERIFIER_READY';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture'
  | 'provide_fixture_verifier_rows'
  | 'add_required_safe_summary_field'
  | 'remove_duplicate_row_id'
  | 'remove_unsupported_entity'
  | 'remove_forbidden_fixture_field'
  | 'remove_forbidden_boundary_flag'
  | 'replace_with_safe_summary_origin'
  | 'keep_fixture_verifier_boundary_only'
  | 'prepare_pr_d8ab_actual_safe_row_export_read_only_source_candidate_verifier_report_contract';

type BoundaryFlagInput = {
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
  sourceAccessEnabled?: boolean;
  prismaClientEnabled?: boolean;
  databaseUrlReadEnabled?: boolean;
  envReadEnabled?: boolean;
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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifierInput = BoundaryFlagInput & {
  safeSummaryFixture?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture | null;
  safeSummaryShape?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape | null;
  sourceCandidateContract?: TierUpdateActualSafeRowExportReadOnlySourceCandidateContract | null;
  sourceCandidateDisabledProbe?: TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe | null;
  realSourceGate?: TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate | null;
  fixtureRows?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[] | null;
  expectedEntities?: string[];
  expectedFieldAllowlist?: string[];
  boundaryFlags?: BoundaryFlagInput | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier = {
  verifierKind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_FIXTURE_VERIFIER_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_FIXTURE_VERIFIER_SCHEMA_VERSION;
  status: FixtureVerifierStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_FIXTURE_VERIFIER_TRACE_LABEL;
  safeSummaryFixtureStatus: string;
  safeSummaryShapeStatus: string;
  sourceCandidateContractStatus: string;
  sourceCandidateDisabledProbeStatus: string;
  realSourceGateStatus: string;
  allowedEntities: typeof D8AA_ALLOWED_ENTITIES;
  requestedEntitiesSummary: { requestedCount: number; allowedCount: number; safeSummaryOnly: true };
  fixtureRowCount: number;
  duplicateRowIdCount: number;
  requiredFieldStatus: 'present' | 'missing' | 'blocked';
  entityStatus: 'present' | 'missing' | 'blocked';
  originStatus: 'present' | 'missing' | 'blocked';
  forbiddenFieldStatus: 'present' | 'blocked';
  boundaryFlagStatus: 'disabled' | 'blocked';
  readinessClaim: 'none';
  stagingNoTxPreflightStatus: 'BLOCKED';
  actualDbQueryEnabled: false;
  actualDbExportEnabled: false;
  sourceAccessEnabled: false;
  prismaClientEnabled: false;
  databaseUrlReadEnabled: false;
  envReadEnabled: false;
  networkAccessEnabled: false;
  rpcAccessEnabled: false;
  walletAccessEnabled: false;
  contractAccessEnabled: false;
  txSendEnabled: false;
  fileExportEnabled: false;
  jsonlFileExportEnabled: false;
  artifactUploadEnabled: false;
  dockerSmokeChanged: false;
  stagingNoTxPassClaimed: false;
  runtimeReadinessClaimed: false;
  productionReadinessClaimed: false;
  verifierSummary: {
    fixtureOnly: true;
    actualExportReady: false;
    actualSourceAccessReady: false;
    runtimeReady: false;
    safeSummaryOnly: true;
  };
  blockerCount: number;
  compactBlockerCodes: string[];
  missingRequirementCount: number;
  compactMissingRequirementCodes: string[];
  unsafeReasonCount: number;
  compactUnsafeReasonCodes: string[];
  nextSafeAction: NextSafeAction;
};

const D8AA_ALLOWED_ENTITIES = [
  'scheduled_tier_update',
  'job_run',
  'tx_receipt_evidence',
  'staging_evidence',
  'fixture',
  'evaluation',
  'test'
] as const;

const REQUIRED_FIELDS = [
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

const DEFAULT_ALLOWED_FIELDS = [
  ...REQUIRED_FIELDS,
  'checkpoint_summary',
  'tx_hash_summary',
  'tx_chain_id',
  'tx_contract_address_summary',
  'tx_from_summary',
  'tx_to_summary',
  'tx_block_number_summary',
  'tx_receipt_status',
  'tx_receipt_timestamp_summary',
  'safe_error_kind',
  'safe_summary',
  'operator_id_summary',
  'reviewer_id_summary',
  'run_key_summary'
] as const;

const SAFE_ORIGINS = new Set(['fixture', 'local_test', 'synthetic_safe_summary', 'owner_review_fixture', 'remote_gate', 'safe_summary']);
const ALLOWED_ENTITY_SET = new Set<string>(D8AA_ALLOWED_ENTITIES);
const DEFERRED_ENTITIES = new Set([
  'prize',
  'prizetransactions',
  'prize_transactions',
  'lotterytickets',
  'lottery_tickets',
  'ticketcode',
  'ticket_code',
  'nft',
  'nft_metadata',
  'token_detail',
  'tokendetail'
]);
const UNSAFE_FIELD_LABELS = [
  'secret',
  'privatekey',
  'databaseurl',
  'dburl',
  'rawenv',
  'rawlog',
  'rawpayload',
  'rawendpoint',
  'endpoint',
  'privatepath',
  'localpath',
  'localimagepath',
  'authorizationheader',
  'cookie',
  'jwt',
  'rawwallet',
  'fullwallet',
  'rawtxhash',
  'rawreceiptpayload',
  'rawdbrow',
  'prismaclient',
  'databaseclient'
];
const FORBIDDEN_READINESS = new Set(['runtime_ready', 'staging_ready', 'production_ready']);
const BOUNDARY_FLAGS = [
  'actualDbQueryEnabled',
  'actualDbExportEnabled',
  'sourceAccessEnabled',
  'prismaClientEnabled',
  'databaseUrlReadEnabled',
  'envReadEnabled',
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

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
const normalizeLabel = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
const add = (target: Set<string>, value: string): void => {
  target.add(value);
};
const compactCodes = (codes: Iterable<string>): string[] => (
  Array.from(new Set(Array.from(codes).filter(Boolean).map((code) => (
    code.length > 96 ? code.slice(0, 96) : code
  )))).sort().slice(0, 12)
);

function upstreamStatus(value: { status?: string } | null | undefined, readyStatus: string, missingCode: string, blockers: Set<string>): string {
  if (!value) {
    add(blockers, missingCode);
    return 'missing';
  }
  if (value.status === readyStatus) return readyStatus;
  if (value.status === 'NEEDS_REVIEW') return 'NEEDS_REVIEW';
  add(blockers, `${missingCode.replace('_missing', '')}_not_ready`);
  return String(value.status || 'blocked');
}

function evaluateEntities(expectedEntities: string[] | undefined, blockers: Set<string>, missing: Set<string>) {
  const requested = Array.from(new Set((expectedEntities || []).map((entity) => normalize(String(entity))).filter(Boolean))).sort();
  if (requested.length === 0) {
    add(missing, 'expected_entities_required');
  }
  const allowed = requested.filter((entity) => ALLOWED_ENTITY_SET.has(entity));
  const disallowed = requested.filter((entity) => !ALLOWED_ENTITY_SET.has(entity));
  if (disallowed.length > 0) add(blockers, 'unsupported_entity_for_d8aa_boundary');
  if (disallowed.some((entity) => DEFERRED_ENTITIES.has(entity))) add(blockers, 'deferred_entity_for_d8aa_boundary');
  return { requestedCount: requested.length, allowedCount: allowed.length };
}

function evaluateRows(
  rows: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[] | null | undefined,
  allowedFields: Set<string>,
  blockers: Set<string>,
  missing: Set<string>,
  unsafe: Set<string>
) {
  if (!Array.isArray(rows) || rows.length === 0) {
    add(missing, 'fixture_rows_required');
    return {
      fixtureRowCount: 0,
      duplicateRowIdCount: 0,
      requiredFieldStatus: 'missing' as const,
      entityStatus: 'missing' as const,
      originStatus: 'missing' as const,
      forbiddenFieldStatus: 'present' as const
    };
  }

  const rowIds = new Set<string>();
  const duplicateRowIds = new Set<string>();
  let requiredMissing = false;
  let entityBlocked = false;
  let originMissing = false;
  let originBlocked = false;
  let forbiddenFieldBlocked = false;

  rows.forEach((row) => {
    REQUIRED_FIELDS.forEach((field) => {
      const value = row[field];
      if (value === undefined || value === null || String(value).trim().length === 0) {
        requiredMissing = true;
        add(blockers, `missing_required_field:${field}`);
        add(missing, `required_field:${field}`);
      }
    });

    const rowId = String(row.row_id || '');
    if (rowId) {
      if (rowIds.has(rowId)) duplicateRowIds.add(rowId);
      rowIds.add(rowId);
    }

    const entity = normalize(String(row.entity_type || ''));
    if (!entity) {
      entityBlocked = true;
      add(blockers, 'row_entity_missing');
    } else if (!ALLOWED_ENTITY_SET.has(entity)) {
      entityBlocked = true;
      add(blockers, 'unsupported_entity_for_d8aa_boundary');
      if (DEFERRED_ENTITIES.has(entity)) add(blockers, 'deferred_entity_for_d8aa_boundary');
    }

    const origin = normalize(String(row.evidence_origin || ''));
    if (!origin) {
      originMissing = true;
      add(missing, 'evidence_origin_required');
    } else if (!SAFE_ORIGINS.has(origin)) {
      originBlocked = true;
      add(blockers, 'unsafe_evidence_origin');
    }

    const readinessClaim = normalize(String(row.readiness_claim || ''));
    if (FORBIDDEN_READINESS.has(readinessClaim)) add(blockers, 'forbidden_readiness_claim');

    Object.keys(row).forEach((field) => {
      const normalizedField = normalizeLabel(field);
      if (!allowedFields.has(field) || UNSAFE_FIELD_LABELS.includes(normalizedField)) {
        forbiddenFieldBlocked = true;
        add(blockers, `forbidden_fixture_field:${field}`);
      }
      if (UNSAFE_FIELD_LABELS.some((label) => normalizedField.includes(label))) {
        add(unsafe, `unsafe_label:${field}`);
      }
    });
  });

  if (duplicateRowIds.size > 0) add(blockers, 'duplicate_row_id');

  return {
    fixtureRowCount: rows.length,
    duplicateRowIdCount: duplicateRowIds.size,
    requiredFieldStatus: requiredMissing ? 'blocked' as const : 'present' as const,
    entityStatus: entityBlocked ? 'blocked' as const : 'present' as const,
    originStatus: originBlocked ? 'blocked' as const : originMissing ? 'missing' as const : 'present' as const,
    forbiddenFieldStatus: forbiddenFieldBlocked ? 'blocked' as const : 'present' as const
  };
}

function evaluateBoundaryFlags(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifierInput, blockers: Set<string>) {
  BOUNDARY_FLAGS.forEach((flag) => {
    if (input[flag] === true || input.boundaryFlags?.[flag] === true) {
      add(blockers, `${normalize(flag)}_forbidden`);
    }
  });
}

function determineNextSafeAction(blockers: Set<string>, missing: Set<string>, status: FixtureVerifierStatus): NextSafeAction {
  if (blockers.has('safe_summary_fixture_missing') || blockers.has('safe_summary_fixture_not_ready')) {
    return 'build_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture';
  }
  if (missing.has('fixture_rows_required')) return 'provide_fixture_verifier_rows';
  if (Array.from(blockers).some((code) => code.startsWith('missing_required_field:'))) return 'add_required_safe_summary_field';
  if (blockers.has('duplicate_row_id')) return 'remove_duplicate_row_id';
  if (blockers.has('unsupported_entity_for_d8aa_boundary') || blockers.has('deferred_entity_for_d8aa_boundary')) return 'remove_unsupported_entity';
  if (Array.from(blockers).some((code) => code.startsWith('forbidden_fixture_field:'))) return 'remove_forbidden_fixture_field';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_evidence_origin')) return 'replace_with_safe_summary_origin';
  if (status === 'FIXTURE_VERIFIER_READY') return 'prepare_pr_d8ab_actual_safe_row_export_read_only_source_candidate_verifier_report_contract';
  return 'keep_fixture_verifier_boundary_only';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifierInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const unsafe = new Set<string>();

  const safeSummaryFixtureStatus = upstreamStatus(
    input.safeSummaryFixture,
    'SAFE_SUMMARY_FIXTURE_READY',
    'safe_summary_fixture_missing',
    blockers
  );
  const safeSummaryShapeStatus = upstreamStatus(input.safeSummaryShape, 'SAFE_SUMMARY_SHAPE_READY', 'safe_summary_shape_missing', blockers);
  const sourceCandidateContractStatus = upstreamStatus(
    input.sourceCandidateContract,
    'SOURCE_CANDIDATE_CONTRACT_READY',
    'source_candidate_contract_missing',
    blockers
  );
  const sourceCandidateDisabledProbeStatus = upstreamStatus(
    input.sourceCandidateDisabledProbe,
    'SOURCE_CANDIDATE_DISABLED_PROBE_READY',
    'source_candidate_disabled_probe_missing',
    blockers
  );
  const realSourceGateStatus = upstreamStatus(input.realSourceGate, 'REAL_SOURCE_GATE_READY', 'real_source_gate_missing', blockers);
  const requestedEntitiesSummary = evaluateEntities(input.expectedEntities, blockers, missing);
  const allowedFields = new Set(input.expectedFieldAllowlist && input.expectedFieldAllowlist.length
    ? input.expectedFieldAllowlist
    : DEFAULT_ALLOWED_FIELDS);
  const rowSummary = evaluateRows(input.fixtureRows, allowedFields, blockers, missing, unsafe);

  evaluateBoundaryFlags(input, blockers);

  const compactBlockerCodes = compactCodes(blockers);
  const compactMissingRequirementCodes = compactCodes(missing);
  const compactUnsafeReasonCodes = compactCodes(unsafe);
  const status: FixtureVerifierStatus = compactBlockerCodes.length > 0
    ? 'BLOCKED'
    : compactMissingRequirementCodes.length > 0
      ? 'NEEDS_REVIEW'
      : 'FIXTURE_VERIFIER_READY';

  return {
    verifierKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_FIXTURE_VERIFIER_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_FIXTURE_VERIFIER_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_FIXTURE_VERIFIER_TRACE_LABEL,
    safeSummaryFixtureStatus,
    safeSummaryShapeStatus,
    sourceCandidateContractStatus,
    sourceCandidateDisabledProbeStatus,
    realSourceGateStatus,
    allowedEntities: D8AA_ALLOWED_ENTITIES,
    requestedEntitiesSummary: { ...requestedEntitiesSummary, safeSummaryOnly: true },
    ...rowSummary,
    boundaryFlagStatus: compactBlockerCodes.some((code) => code.endsWith('_forbidden')) ? 'blocked' : 'disabled',
    readinessClaim: 'none',
    stagingNoTxPreflightStatus: 'BLOCKED',
    actualDbQueryEnabled: false,
    actualDbExportEnabled: false,
    sourceAccessEnabled: false,
    prismaClientEnabled: false,
    databaseUrlReadEnabled: false,
    envReadEnabled: false,
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
    verifierSummary: {
      fixtureOnly: true,
      actualExportReady: false,
      actualSourceAccessReady: false,
      runtimeReady: false,
      safeSummaryOnly: true
    },
    blockerCount: compactBlockerCodes.length,
    compactBlockerCodes,
    missingRequirementCount: compactMissingRequirementCodes.length,
    compactMissingRequirementCodes,
    unsafeReasonCount: compactUnsafeReasonCodes.length,
    compactUnsafeReasonCodes,
    nextSafeAction: determineNextSafeAction(blockers, missing, status)
  };
}
