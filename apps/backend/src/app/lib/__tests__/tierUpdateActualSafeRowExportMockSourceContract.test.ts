import fs from 'fs';
import path from 'path';

import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS,
  buildTierUpdateActualSafeRowExportDesignGate
} from '../tierUpdateActualSafeRowExportDesignGate';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_KIND,
  buildTierUpdateActualSafeRowExportMockSourceContract,
  type BuildTierUpdateActualSafeRowExportMockSourceContractInput,
  type TierUpdateActualSafeRowExportMockSafeRow
} from '../tierUpdateActualSafeRowExportMockSourceContract';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-10T00:00:00.000Z';
const JSONL_HASH = `sha256:${'c'.repeat(64)}`;
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportMockSourceContract.ts');

const requiredForbiddenFields = [
  'raw_db_dump',
  'full_wallet_address',
  'raw_private_path',
  'local_file_path',
  'raw_env',
  'db_url',
  'rpc_url',
  'private_key',
  'jwt',
  'cookie',
  'authorization_header',
  'raw_provider_error',
  'raw_receipt_payload',
  'raw_checkpoint_payload',
  'raw_jsonl_body',
  'raw_operator_note',
  'raw_worker_note',
  'raw_stack_trace'
];

const buildD8Refresh = (overrides: Record<string, unknown> = {}) => ({
  refreshKind: 'tier_update_d8_staging_owner_review_refresh',
  schemaVersion: '1',
  status: 'OWNER_REVIEW_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8_staging_owner_review_refresh',
  stagingNoTxPreflightStatus: 'BLOCKED',
  readinessClaim: 'none',
  d8DigestStatus: 'OWNER_REVIEW_READY',
  ownerReviewPacketStatus: 'OWNER_REVIEW_READY',
  safeDbReadExportPackageStatus: 'EXPORT_PACKAGE_READY',
  stagingEvidenceStatus: 'EVIDENCE_READY',
  recordCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  blockerCount: 0,
  unsafeReasonCount: 0,
  compactBlockerCodes: [],
  compactUnsafeReasonCodes: [],
  noTxBoundary: {
    noActualDbExport: true,
    noRealDbQuery: true,
    noPrismaClient: true,
    noFileExport: true,
    noArtifactUpload: true,
    noDockerSmokeChange: true,
    noTxSend: true,
    noRuntimeReadiness: true,
    noProductionReadiness: true,
    stagingNoTxPassClaimed: false
  },
  nextSafeAction: 'prepare_pr_d8l_actual_safe_row_export_plan',
  ...overrides
}) as NonNullable<Parameters<typeof buildTierUpdateActualSafeRowExportDesignGate>[0]['d8StagingOwnerReviewRefresh']>;

const buildDigest = (overrides: Record<string, unknown> = {}) => ({
  digestKind: 'tier_update_d8_evidence_operator_digest',
  schemaVersion: '1',
  status: 'OWNER_REVIEW_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8_safe_evidence_operator_digest',
  safeDbReadExportPackageStatus: 'EXPORT_PACKAGE_READY',
  ownerReviewPacketStatus: 'OWNER_REVIEW_READY',
  recordCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  readinessClaimCounts: { none: 2 },
  evidenceOriginCounts: { db_safe_summary: 2 },
  jsonlSha256Summary: JSONL_HASH,
  blockerCount: 0,
  unsafeReasonCount: 0,
  compactBlockerCodes: [],
  compactUnsafeReasonCodes: [],
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false,
  actualDbExport: false,
  realDbQuery: false,
  prismaClientUsed: false,
  fileExported: false,
  artifactUploaded: false,
  dockerSmoke: false,
  nextSafeAction: 'prepare_pr_d8k_staging_no_tx_owner_review_evidence_refresh',
  ...overrides
}) as NonNullable<Parameters<typeof buildTierUpdateActualSafeRowExportDesignGate>[0]['d8EvidenceDigest']>;

const buildSafePackage = (overrides: Record<string, unknown> = {}) => ({
  status: 'EXPORT_PACKAGE_READY',
  packageKind: 'tier_update_safe_db_read_export_jsonl_package',
  recordCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  readinessClaimCounts: { none: 2 },
  evidenceOriginCounts: { db_safe_summary: 2 },
  jsonlSha256Summary: JSONL_HASH,
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false,
  actualDbExport: false,
  realDbQuery: false,
  prismaClientUsed: false,
  fileExported: false,
  artifactUploaded: false,
  dockerSmoke: false,
  blockers: [],
  unsafeReasonCodes: [],
  safeSummaryOnly: true,
  ...overrides
}) as NonNullable<Parameters<typeof buildTierUpdateActualSafeRowExportDesignGate>[0]['safeDbReadExportPackage']>;

const buildDesignGate = (overrides: Record<string, unknown> = {}) => buildTierUpdateActualSafeRowExportDesignGate({
  d8StagingOwnerReviewRefresh: buildD8Refresh(),
  d8EvidenceDigest: buildDigest(),
  safeDbReadExportPackage: buildSafePackage(),
  requestedEntities: ['scheduled_tier_update', 'job_run'],
  proposedJsonlSchemaFields: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS],
  forbiddenFieldPolicy: {
    required: true,
    blockedFields: requiredForbiddenFields
  },
  sameHeadEvidence: {
    required: true,
    headMatchStatus: 'required_or_pending'
  },
  operatorApproval: {
    required: true,
    status: 'approved'
  },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  operatorId: 'operator-d8l',
  runKey: 'run-d8l',
  ...overrides
});

const scheduledRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8m',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'scheduled-row-1',
  entity_type: 'scheduled_tier_update',
  source_table: 'ScheduledTierUpdate',
  status: 'ready_for_mock_review',
  evidence_origin: 'db_safe_summary',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  scheduled_tier_update_id_summary: 'scheduled-summary-1',
  user_identity_summary: 'user-summary-1',
  scheduled_at_summary: 'time-summary-1',
  expected_tier: 'gold',
  current_tier: 'silver',
  processed: false,
  safe_error_kind: 'none',
  safe_summary: 'scheduled tier update mock safe row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const jobRunRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8m',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'job-run-row-1',
  entity_type: 'job_run',
  source_table: 'JobRun',
  status: 'ready_for_mock_review',
  evidence_origin: 'db_safe_summary',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  job_run_id_summary: 'job-summary-1',
  job_name: 'tier-update-reconcile',
  run_key_summary: 'run-summary-1',
  job_status: 'completed',
  checkpoint_summary: 'checkpoint-summary-1',
  safe_error_kind: 'none',
  safe_summary: 'job run mock safe row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportMockSourceContractInput> = {}
): BuildTierUpdateActualSafeRowExportMockSourceContractInput => ({
  designGate: buildDesignGate(),
  mockSource: {
    sourceKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_KIND,
    safeSummaryOnly: true,
    readScheduledTierUpdateRows: () => [scheduledRow()],
    readJobRunRows: async () => [jobRunRow()]
  },
  requestedEntities: ['scheduled_tier_update', 'job_run'],
  requiredMetadataFields: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS],
  forbiddenFieldPolicy: {
    required: true,
    blockedFields: requiredForbiddenFields
  },
  sameHeadEvidence: { required: true },
  operatorApproval: { required: true, status: 'design_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  operatorId: 'operator-d8m',
  runKey: 'run-d8m',
  ...overrides
});

const buildContract = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportMockSourceContractInput> = {}
) => buildTierUpdateActualSafeRowExportMockSourceContract(validInput(overrides));

describe('tierUpdateActualSafeRowExportMockSourceContract', () => {
  it('creates MOCK_SOURCE_READY from a valid design gate, safe mock source, safe rows, and design approval', async () => {
    const contract = await buildContract();

    expect(contract.contractKind).toBe('tier_update_actual_safe_row_export_mock_source_contract');
    expect(contract.schemaVersion).toBe('1');
    expect(contract.status).toBe('MOCK_SOURCE_READY');
    expect(contract.safeSummaryOnly).toBe(true);
    expect(contract.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(contract.traceLabel).toBe('d8m_actual_safe_row_export_mock_source_contract');
    expect(contract.designGateStatus).toBe('DESIGN_READY');
    expect(contract.sourceKind).toBe('mock_safe_row_source');
    expect(contract.rowCount).toBe(2);
    expect(contract.entityCounts).toEqual({ job_run: 1, scheduled_tier_update: 1 });
    expect(contract.nextSafeAction).toBe('prepare_pr_d8n_actual_safe_row_export_dry_run_contract');
  });

  it('keeps MOCK_SOURCE_READY separate from actual export and readiness', async () => {
    const contract = await buildContract();

    expect(contract.actualDbQueryEnabled).toBe(false);
    expect(contract.actualDbExportEnabled).toBe(false);
    expect(contract.prismaClientEnabled).toBe(false);
    expect(contract.fileExportEnabled).toBe(false);
    expect(contract.artifactUploadEnabled).toBe(false);
    expect(contract.dockerSmokeChanged).toBe(false);
    expect(contract.stagingNoTxPassClaimed).toBe(false);
    expect(contract.runtimeReadinessClaimed).toBe(false);
    expect(contract.productionReadinessClaimed).toBe(false);
    expect(contract.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(contract.readinessClaim).toBe('none');
  });

  it('blocks when the design gate is missing', async () => {
    const contract = await buildContract({ designGate: undefined });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('design_gate_missing');
    expect(contract.nextSafeAction).toBe('build_actual_safe_row_export_design_gate');
  });

  it('blocks when the design gate is BLOCKED', async () => {
    const contract = await buildContract({ designGate: buildDesignGate({ actualDbQueryEnabled: true }) });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.designGateStatus).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('design_gate_blocked');
  });

  it('uses NEEDS_REVIEW when the design gate needs review', async () => {
    const contract = await buildContract({ designGate: buildDesignGate({ operatorApproval: { required: true, status: 'pending' } }) });

    expect(contract.status).toBe('NEEDS_REVIEW');
    expect(contract.designGateStatus).toBe('NEEDS_REVIEW');
    expect(contract.compactMissingRequirementCodes).toContain('design_gate_needs_review');
  });

  it('blocks when mock source is missing', async () => {
    const contract = await buildContract({ mockSource: undefined });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('mock_source_missing');
    expect(contract.nextSafeAction).toBe('provide_mock_safe_row_source');
  });

  it('blocks wrong sourceKind', async () => {
    const contract = await buildContract({
      mockSource: { ...validInput().mockSource, sourceKind: 'real_database_source' }
    });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('mock_source_kind_invalid');
  });

  it('blocks mock source when safeSummaryOnly is false', async () => {
    const contract = await buildContract({
      mockSource: { ...validInput().mockSource, safeSummaryOnly: false }
    });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('mock_source_safe_summary_only_required');
  });

  it.each(['query', 'transaction', 'prisma', 'writeFile'])('blocks forbidden mock source key %s', async (key) => {
    const contract = await buildContract({
      mockSource: { ...validInput().mockSource, [key]: () => [] }
    });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.sourceMethodPolicyStatus).toBe('blocked');
    expect(contract.compactBlockerCodes).toContain(`mock_source_forbidden_method:${key}`);
    expect(contract.nextSafeAction).toBe('remove_unsafe_mock_source_method');
  });

  it('uses NEEDS_REVIEW when requested entities are empty', async () => {
    const contract = await buildContract({ requestedEntities: [] });

    expect(contract.status).toBe('NEEDS_REVIEW');
    expect(contract.compactMissingRequirementCodes).toContain('requested_entities_required');
  });

  it.each(['unknown_entity', 'Prize', 'PrizeTransactions', 'NFT metadata', 'TokenDetail', 'TicketCode'])(
    'blocks unsupported or deferred entity %s',
    async (entity) => {
      const contract = await buildContract({ requestedEntities: ['scheduled_tier_update', entity] });

      expect(contract.status).toBe('BLOCKED');
      expect(contract.disallowedEntityCount).toBeGreaterThan(0);
      expect(contract.compactBlockerCodes).toEqual(expect.arrayContaining([
        entity === 'unknown_entity' ? 'unsupported_entity_requested' : 'deferred_entity_requested'
      ]));
      expect(contract.nextSafeAction).toBe('remove_unsupported_entity');
    }
  );

  it.each([...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS])(
    'blocks when returned row is missing metadata field %s',
    async (field) => {
      const row = scheduledRow();
      delete row[field];
      const contract = await buildContract({
        requestedEntities: ['scheduled_tier_update'],
        mockSource: {
          sourceKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_KIND,
          safeSummaryOnly: true,
          readScheduledTierUpdateRows: () => [row]
        }
      });

      expect(contract.status).toBe('BLOCKED');
      expect(contract.compactBlockerCodes).toContain(`row_metadata_missing:${field}`);
      expect(contract.nextSafeAction).toBe('add_required_safe_row_metadata');
    }
  );

  it('blocks row readiness_claim runtime_ready', async () => {
    const contract = await buildContract({
      requestedEntities: ['scheduled_tier_update'],
      mockSource: {
        sourceKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_KIND,
        safeSummaryOnly: true,
        readScheduledTierUpdateRows: () => [scheduledRow({ readiness_claim: 'runtime_ready' })]
      }
    });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('row_readiness_claim_forbidden');
    expect(contract.nextSafeAction).toBe('remove_unsafe_row_field');
  });

  it.each([
    ['raw wallet', { rawWallet: 'wallet-value' }, 'unsafe_row_field'],
    ['rawTxHash', { rawTxHash: 'tx-value' }, 'unsafe_row_field'],
    ['rawCheckpoint', { rawCheckpoint: 'checkpoint-value' }, 'unsafe_row_field'],
    ['rawEnv', { rawEnv: 'DATABASE_URL=value' }, 'unsafe_row_field'],
    ['dbUrl', { dbUrl: 'DATABASE_URL=value' }, 'unsafe_row_field'],
    ['privatePath', { privatePath: 'private path value' }, 'unsafe_row_field'],
    ['rawReceiptPayload', { rawReceiptPayload: 'raw receipt payload' }, 'unsafe_row_field']
  ])('blocks row with %s', async (_label, unsafe, blockerPrefix) => {
    const contract = await buildContract({
      requestedEntities: ['scheduled_tier_update'],
      mockSource: {
        sourceKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_KIND,
        safeSummaryOnly: true,
        readScheduledTierUpdateRows: () => [scheduledRow(unsafe)]
      }
    });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes.some((code) => code.startsWith(blockerPrefix))).toBe(true);
    expect(contract.nextSafeAction).toBe('remove_unsafe_row_field');
  });

  it('allows tx_hash_summary as a safe summary field', async () => {
    const contract = await buildContract({
      requestedEntities: ['scheduled_tier_update'],
      mockSource: {
        sourceKind: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_MOCK_SOURCE_KIND,
        safeSummaryOnly: true,
        readScheduledTierUpdateRows: () => [scheduledRow({ tx_hash_summary: 'tx-summary-only' })]
      }
    });

    expect(contract.status).toBe('MOCK_SOURCE_READY');
  });

  it('blocks when same-head evidence is not required', async () => {
    const contract = await buildContract({ sameHeadEvidence: { required: false } });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('same_head_evidence_required');
  });

  it('blocks when operator approval is missing', async () => {
    const contract = await buildContract({ operatorApproval: undefined });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.operatorApprovalStatus).toBe('blocked');
    expect(contract.compactBlockerCodes).toContain('operator_approval_required');
  });

  it('uses NEEDS_REVIEW when operator approval is pending', async () => {
    const contract = await buildContract({ operatorApproval: { required: true, status: 'pending' } });

    expect(contract.status).toBe('NEEDS_REVIEW');
    expect(contract.operatorApprovalStatus).toBe('pending');
    expect(contract.compactMissingRequirementCodes).toContain('operator_approval_pending');
    expect(contract.nextSafeAction).toBe('collect_operator_design_approval');
  });

  it('blocks execution approval because it is not design-only approval', async () => {
    const contract = await buildContract({ operatorApproval: { required: true, status: 'execution_approved' } });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('operator_approval_status_forbidden');
  });

  it.each([
    ['actualDbQueryEnabled', true, 'actual_db_query_enabled'],
    ['actualDbExportEnabled', true, 'actual_db_export_enabled'],
    ['prismaClientEnabled', true, 'prisma_client_enabled'],
    ['fileExportEnabled', true, 'file_export_enabled'],
    ['artifactUploadEnabled', true, 'artifact_upload_enabled'],
    ['dockerSmokeChanged', true, 'docker_smoke_changed'],
    ['stagingNoTxPassClaimed', true, 'staging_no_tx_pass_claimed'],
    ['runtimeReadinessClaimed', true, 'runtime_readiness_claimed'],
    ['productionReadinessClaimed', true, 'production_readiness_claimed']
  ])('blocks execution/readiness flag %s', async (key, value, blocker) => {
    const contract = await buildContract({ [key]: value });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain(blocker);
    expect(contract[key as 'actualDbQueryEnabled']).toBe(false);
  });

  it('keeps nextSafeAction singular and safe summary only', async () => {
    const contract = await buildContract();

    expect(typeof contract.nextSafeAction).toBe('string');
    expect(Array.isArray(contract.nextSafeAction)).toBe(false);
    expect(contract.safeSummaryOnly).toBe(true);
  });

  it('does not expose raw operatorId or runKey', async () => {
    const contract = await buildContract();
    const text = JSON.stringify(contract);

    expect(contract.operatorSummary.operatorId).toEqual({ provided: true, safeSummaryOnly: true });
    expect(contract.operatorSummary.runKey).toEqual({ provided: true, safeSummaryOnly: true });
    expect(text).not.toContain('operator-d8m');
    expect(text).not.toContain('run-d8m');
  });

  it('does not import Prisma, read DATABASE_URL, file export, artifact upload, routes, runtime wiring, tx, or Docker changes', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|new PrismaClient|process\.env\.DATABASE_URL/);
    expect(source).not.toMatch(/fs\.|createWriteStream|uploadArtifact\(|router\.|cron|trackingService|main\.ts/i);
    expect(source).not.toMatch(/sendTransaction|new ethers|new Contract|JsonRpcProvider|Wallet/);
    expect(source).not.toMatch(/docker\s+(run|compose|build|smoke)/i);
  });
});
