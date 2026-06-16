import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier';
import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow
} from './tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture';

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_PACKET_KIND =
  'tier_update_actual_safe_row_export_read_only_source_candidate_review_packet' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_PACKET_SCHEMA_VERSION = '1' as const;

export const TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_PACKET_TRACE_LABEL =
  'd8ab_actual_safe_row_export_read_only_source_candidate_review_packet' as const;

type ReviewPacketStatus = 'BLOCKED' | 'NEEDS_REVIEW' | 'SOURCE_CANDIDATE_REVIEW_PACKET_READY';
type ReviewSection =
  | 'scopeSummary'
  | 'rowShapeSummary'
  | 'entityCoverageSummary'
  | 'boundarySummary'
  | 'unsupportedDeferredSummary'
  | 'operatorChecklist'
  | 'notAuthorizedSummary'
  | 'nextSafeAction';
type NextSafeAction =
  | 'build_actual_safe_row_export_read_only_source_candidate_fixture_verifier'
  | 'provide_source_candidate_review_packet_id'
  | 'provide_source_head_sha'
  | 'provide_review_packet_rows'
  | 'fix_review_packet_row_counts'
  | 'remove_forbidden_boundary_flag'
  | 'remove_unsafe_review_packet_label'
  | 'collect_operator_review_for_deferred_or_incomplete_coverage'
  | 'prepare_pr_d8ac_actual_safe_row_export_read_only_source_candidate_review_packet_shape_or_dry_run_boundary';

type BoundaryFlagInput = {
  actualDbQueryEnabled?: boolean;
  actualDbExportEnabled?: boolean;
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

export type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacketInput = BoundaryFlagInput & {
  fixtureVerifier?: TierUpdateActualSafeRowExportReadOnlySourceCandidateFixtureVerifier | null;
  fixtureVerifierKind?: string | null;
  fixtureVerifierTraceLabel?: string | null;
  rows?: TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[] | null;
  compactRowSummaries?: Array<{ rowId?: string; entityType?: string; status?: string; safeSummaryOnly?: boolean }>;
  sourceHeadSha?: string | null;
  reviewPacketId?: string | null;
  auditReviewId?: string | null;
  operatorIntentLabel?: string | null;
  expectedRowCount?: number;
  readyRowCount?: number;
  blockedRowCount?: number;
  needsReviewRowCount?: number;
  reviewOnlyMode?: boolean;
  optionalDisplayLabel?: string | null;
  entityCoverageComplete?: boolean;
  evidenceOrigins?: string[];
  deferredEntityTypes?: string[];
  unsupportedEntityTypes?: string[];
  boundaryFlags?: BoundaryFlagInput | null;
  safeNextActionOverride?: string | null;
};

export type TierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket = {
  kind: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_PACKET_KIND;
  schemaVersion: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_PACKET_SCHEMA_VERSION;
  status: ReviewPacketStatus;
  safeSummaryOnly: true;
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE';
  traceLabel: typeof TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_PACKET_TRACE_LABEL;
  reviewPacketId: string;
  sourceHeadSha: string;
  fixtureVerifierStatus: string;
  fixtureVerifierKind: string;
  fixtureVerifierTraceLabel: string;
  rowCount: number;
  readyRowCount: number;
  blockedRowCount: number;
  needsReviewRowCount: number;
  entityTypes: string[];
  allowedEntityTypes: string[];
  deferredEntityTypes: string[];
  unsupportedEntityTypes: string[];
  reviewSections: Record<ReviewSection, { status: 'present'; safeSummaryOnly: true }>;
  operatorChecklist: string[];
  boundarySummary: {
    actualDbExport: false;
    realDbQuery: false;
    sourceAccess: false;
    prismaClient: false;
    databaseUrlRead: false;
    envRead: false;
    networkRpcWalletContractTxAccess: false;
    fileExport: false;
    jsonlFileExport: false;
    artifactUpload: false;
    dockerSmokeChange: false;
    stagingNoTxPass: false;
    runtimeReadiness: false;
    productionReadiness: false;
    safeSummaryOnly: true;
  };
  notAuthorizedSummary: string[];
  blockers: string[];
  needsReviewReasons: string[];
  blockerCount: number;
  missingRequirementCount: number;
  unsafeReasonCount: number;
  nextSafeAction: NextSafeAction;
};

const REQUIRED_REVIEW_SECTIONS: ReviewSection[] = [
  'scopeSummary',
  'rowShapeSummary',
  'entityCoverageSummary',
  'boundarySummary',
  'unsupportedDeferredSummary',
  'operatorChecklist',
  'notAuthorizedSummary',
  'nextSafeAction'
];

const OPERATOR_CHECKLIST = [
  'verify source_head_sha before future source work',
  'verify row_id uniqueness',
  'verify no actual DB export',
  'verify no real DB query',
  'verify no source access',
  'verify no Prisma client',
  'verify no DATABASE_URL read',
  'verify no env read',
  'verify no network/RPC/wallet/contract/tx access',
  'verify no file export',
  'verify no JSONL file export',
  'verify no artifact upload',
  'verify no Docker smoke change',
  'verify no staging no-tx PASS',
  'verify no runtime readiness',
  'verify no production readiness',
  'verify next step is D8AC boundary only, not source access'
] as const;

const NOT_AUTHORIZED = [
  'actual DB query',
  'actual DB export',
  'source access',
  'Prisma client',
  'DATABASE_URL read',
  'env read',
  'network/RPC/wallet/contract/tx access',
  'file export',
  'JSONL file export',
  'artifact upload',
  'Docker smoke change',
  'staging no-tx PASS',
  'runtime readiness',
  'production readiness'
] as const;

const ALLOWED_ENTITIES = [
  'scheduled_tier_update',
  'job_run',
  'tx_receipt_evidence',
  'staging_evidence',
  'fixture',
  'evaluation',
  'test'
] as const;

const UNSAFE_LABELS = [
  'secret',
  'privatekey',
  'rawenv',
  'rawlog',
  'rawpayload',
  'rawendpoint',
  'endpoint',
  'privatepath',
  'localpath',
  'localimagepath',
  'databaseurl',
  'dburl'
] as const;

const normalize = (value: string): string => value.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
const normalizeLabel = (value: string): string => value.replace(/[^a-z0-9]/gi, '').toLowerCase();
const compact = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean))).sort().slice(0, 12);
const hasText = (value: unknown): boolean => value !== undefined && value !== null && String(value).trim().length > 0;

function addBoundaryFlagBlockers(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacketInput, blockers: Set<string>): void {
  const flagMap: Array<[keyof BoundaryFlagInput, string]> = [
    ['actualDbQueryEnabled', 'real_db_query_forbidden'],
    ['actualDbExportEnabled', 'actual_db_export_forbidden'],
    ['sourceAccessEnabled', 'source_access_forbidden'],
    ['prismaClientEnabled', 'prisma_client_forbidden'],
    ['databaseUrlReadEnabled', 'database_url_read_forbidden'],
    ['envReadEnabled', 'env_read_forbidden'],
    ['networkRpcWalletContractTxAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['networkAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['rpcAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['walletAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['contractAccessEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['txSendEnabled', 'network_rpc_wallet_contract_tx_access_forbidden'],
    ['fileExportEnabled', 'file_export_forbidden'],
    ['jsonlFileExportEnabled', 'jsonl_file_export_forbidden'],
    ['artifactUploadEnabled', 'artifact_upload_forbidden'],
    ['dockerSmokeChanged', 'docker_smoke_change_forbidden'],
    ['stagingNoTxPassClaimed', 'staging_no_tx_pass_claim_forbidden'],
    ['runtimeReadinessClaimed', 'runtime_readiness_claim_forbidden'],
    ['productionReadinessClaimed', 'production_readiness_claim_forbidden']
  ];
  flagMap.forEach(([flag, code]) => {
    if (input[flag] === true || input.boundaryFlags?.[flag] === true) blockers.add(code);
  });
}

function collectUnsafeLabels(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacketInput, blockers: Set<string>): void {
  const labels = [
    input.reviewPacketId,
    input.auditReviewId,
    input.operatorIntentLabel,
    input.optionalDisplayLabel,
    input.safeNextActionOverride,
    ...(input.evidenceOrigins || [])
  ].filter((value): value is string => hasText(value));

  labels.forEach((label) => {
    const normalized = normalizeLabel(label);
    if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) {
      blockers.add('unsafe_review_packet_label');
    }
    if (['runtime_ready', 'staging_ready', 'production_ready'].includes(normalize(label))) {
      blockers.add('public_readiness_overclaim');
    }
  });

  (input.rows || []).forEach((row) => {
    Object.keys(row).forEach((field) => {
      const normalized = normalizeLabel(field);
      if (UNSAFE_LABELS.some((unsafe) => normalized.includes(unsafe))) blockers.add('unsafe_review_packet_label');
    });
    if (['runtime_ready', 'staging_ready', 'production_ready'].includes(normalize(String(row.readiness_claim || '')))) {
      blockers.add('public_readiness_overclaim');
    }
  });
}

function rowCount(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacketInput): number {
  if (Array.isArray(input.rows)) return input.rows.length;
  if (Array.isArray(input.compactRowSummaries)) return input.compactRowSummaries.length;
  return 0;
}

function collectEntityTypes(input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacketInput): string[] {
  const fromRows = (input.rows || []).map((row) => normalize(String(row.entity_type || ''))).filter(Boolean);
  const fromSummaries = (input.compactRowSummaries || []).map((row) => normalize(String(row.entityType || ''))).filter(Boolean);
  return compact([...fromRows, ...fromSummaries]);
}

function reviewSections(): Record<ReviewSection, { status: 'present'; safeSummaryOnly: true }> {
  return REQUIRED_REVIEW_SECTIONS.reduce((sections, section) => ({
    ...sections,
    [section]: { status: 'present', safeSummaryOnly: true as const }
  }), {} as Record<ReviewSection, { status: 'present'; safeSummaryOnly: true }>);
}

function determineNextSafeAction(blockers: Set<string>, needsReview: Set<string>): NextSafeAction {
  if (blockers.has('fixture_verifier_missing') || blockers.has('fixture_verifier_not_ready')) {
    return 'build_actual_safe_row_export_read_only_source_candidate_fixture_verifier';
  }
  if (blockers.has('review_packet_id_missing')) return 'provide_source_candidate_review_packet_id';
  if (blockers.has('source_head_sha_missing')) return 'provide_source_head_sha';
  if (blockers.has('rows_absent')) return 'provide_review_packet_rows';
  if (blockers.has('row_count_mismatch') || blockers.has('ready_row_count_mismatch')) return 'fix_review_packet_row_counts';
  if (Array.from(blockers).some((code) => code.endsWith('_forbidden'))) return 'remove_forbidden_boundary_flag';
  if (blockers.has('unsafe_review_packet_label') || blockers.has('public_readiness_overclaim')) return 'remove_unsafe_review_packet_label';
  if (needsReview.size > 0) return 'collect_operator_review_for_deferred_or_incomplete_coverage';
  return 'prepare_pr_d8ac_actual_safe_row_export_read_only_source_candidate_review_packet_shape_or_dry_run_boundary';
}

export function buildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket(
  input: BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacketInput
): TierUpdateActualSafeRowExportReadOnlySourceCandidateReviewPacket {
  const blockers = new Set<string>();
  const missing = new Set<string>();
  const needsReview = new Set<string>();

  const verifier = input.fixtureVerifier;
  if (!verifier) blockers.add('fixture_verifier_missing');
  else if (verifier.status !== 'FIXTURE_VERIFIER_READY') blockers.add('fixture_verifier_not_ready');

  if (!hasText(input.sourceHeadSha)) blockers.add('source_head_sha_missing');
  if (!hasText(input.reviewPacketId || input.auditReviewId)) blockers.add('review_packet_id_missing');

  const actualRowCount = rowCount(input);
  if (actualRowCount === 0) blockers.add('rows_absent');
  if (input.expectedRowCount !== undefined && input.expectedRowCount !== actualRowCount) blockers.add('row_count_mismatch');
  if (input.readyRowCount !== undefined && input.readyRowCount !== actualRowCount - (input.blockedRowCount || 0) - (input.needsReviewRowCount || 0)) {
    blockers.add('ready_row_count_mismatch');
  }
  if ((input.blockedRowCount || 0) > 0 && input.reviewOnlyMode !== true) blockers.add('blocked_rows_present');
  if ((input.blockedRowCount || 0) > 0 && input.reviewOnlyMode === true) needsReview.add('blocked_rows_review_only');
  if ((input.deferredEntityTypes || []).length > 0 || (input.unsupportedEntityTypes || []).length > 0) {
    needsReview.add('deferred_or_unsupported_entity_isolated');
  }
  if (!hasText(input.optionalDisplayLabel)) needsReview.add('optional_display_label_missing');
  if (input.entityCoverageComplete === false) needsReview.add('entity_coverage_incomplete');
  (input.evidenceOrigins || []).forEach((origin) => {
    if (!['fixture', 'local_test', 'synthetic_safe_summary', 'owner_review_fixture', 'remote_gate', 'safe_summary'].includes(normalize(origin))) {
      needsReview.add('unknown_evidence_origin');
    }
  });

  addBoundaryFlagBlockers(input, blockers);
  collectUnsafeLabels(input, blockers);

  const entityTypes = collectEntityTypes(input);
  const allowedEntityTypes = entityTypes.filter((entity) => (ALLOWED_ENTITIES as readonly string[]).includes(entity));
  const deferredEntityTypes = compact(input.deferredEntityTypes || []);
  const unsupportedEntityTypes = compact(input.unsupportedEntityTypes || []);
  const blockerList = compact(blockers);
  const needsReviewReasons = compact(needsReview);
  const status: ReviewPacketStatus = blockerList.length > 0
    ? 'BLOCKED'
    : needsReviewReasons.length > 0
      ? 'NEEDS_REVIEW'
      : 'SOURCE_CANDIDATE_REVIEW_PACKET_READY';

  return {
    kind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_PACKET_KIND,
    schemaVersion: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_PACKET_SCHEMA_VERSION,
    status,
    safeSummaryOnly: true,
    skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
    traceLabel: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_REVIEW_PACKET_TRACE_LABEL,
    reviewPacketId: String(input.reviewPacketId || input.auditReviewId || 'missing'),
    sourceHeadSha: String(input.sourceHeadSha || 'missing'),
    fixtureVerifierStatus: String(verifier?.status || 'missing'),
    fixtureVerifierKind: String(input.fixtureVerifierKind || verifier?.verifierKind || 'missing'),
    fixtureVerifierTraceLabel: String(input.fixtureVerifierTraceLabel || verifier?.traceLabel || 'missing'),
    rowCount: actualRowCount,
    readyRowCount: input.readyRowCount ?? (status === 'BLOCKED' ? 0 : actualRowCount),
    blockedRowCount: input.blockedRowCount || 0,
    needsReviewRowCount: input.needsReviewRowCount || 0,
    entityTypes,
    allowedEntityTypes,
    deferredEntityTypes,
    unsupportedEntityTypes,
    reviewSections: reviewSections(),
    operatorChecklist: [...OPERATOR_CHECKLIST],
    boundarySummary: {
      actualDbExport: false,
      realDbQuery: false,
      sourceAccess: false,
      prismaClient: false,
      databaseUrlRead: false,
      envRead: false,
      networkRpcWalletContractTxAccess: false,
      fileExport: false,
      jsonlFileExport: false,
      artifactUpload: false,
      dockerSmokeChange: false,
      stagingNoTxPass: false,
      runtimeReadiness: false,
      productionReadiness: false,
      safeSummaryOnly: true
    },
    notAuthorizedSummary: [...NOT_AUTHORIZED],
    blockers: blockerList,
    needsReviewReasons,
    blockerCount: blockerList.length,
    missingRequirementCount: compact(missing).length,
    unsafeReasonCount: blockerList.filter((code) => code.includes('unsafe') || code.includes('overclaim')).length,
    nextSafeAction: determineNextSafeAction(blockers, needsReview)
  };
}
