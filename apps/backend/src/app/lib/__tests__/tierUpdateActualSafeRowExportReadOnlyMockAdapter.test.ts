import fs from 'fs';
import path from 'path';

import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from '../tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportDryRunContract
} from '../tierUpdateActualSafeRowExportDryRunContract';
import type {
  TierUpdateActualSafeRowExportMockSafeRow
} from '../tierUpdateActualSafeRowExportMockSourceContract';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterDesign
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterDesign';
import {
  buildTierUpdateActualSafeRowExportReadOnlyMockAdapter,
  type BuildTierUpdateActualSafeRowExportReadOnlyMockAdapterInput
} from '../tierUpdateActualSafeRowExportReadOnlyMockAdapter';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-10T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportReadOnlyMockAdapter.ts');

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

const adapterDesign = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlyAdapterDesign> = {}
): TierUpdateActualSafeRowExportReadOnlyAdapterDesign => ({
  designKind: 'tier_update_actual_safe_row_export_read_only_adapter_design',
  schemaVersion: '1',
  status: 'ADAPTER_DESIGN_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8o_actual_safe_row_export_read_only_adapter_design',
  dryRunContractStatus: 'DRY_RUN_READY',
  adapterKind: 'read_only_safe_row_adapter_design',
  requestedEntitiesSummary: { requestedCount: 2, allowedCount: 2, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  allowedMethodCount: 4,
  forbiddenMethodCount: 0,
  compactForbiddenMethodCodes: [],
  requiredMetadataStatus: 'present',
  forbiddenFieldPolicyStatus: 'present',
  sameHeadEvidenceStatus: 'required',
  operatorApprovalStatus: 'approved',
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  actualDbQueryEnabled: false,
  actualDbExportEnabled: false,
  prismaClientEnabled: false,
  fileExportEnabled: false,
  artifactUploadEnabled: false,
  dockerSmokeChanged: false,
  stagingNoTxPassClaimed: false,
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false,
  blockerCount: 0,
  compactBlockerCodes: [],
  missingRequirementCount: 0,
  compactMissingRequirementCodes: [],
  operatorSummary: {
    operatorId: { provided: true, safeSummaryOnly: true },
    runKey: { provided: true, safeSummaryOnly: true },
    sourceHeadSha: { provided: true, safeSummaryOnly: true },
    sourceHash: { provided: true, safeSummaryOnly: true },
    exportedAt: { provided: true, safeSummaryOnly: true }
  },
  nextSafeAction: 'prepare_pr_d8p_read_only_adapter_mock_implementation_boundary',
  ...overrides
});

const dryRunContract = (
  overrides: Partial<TierUpdateActualSafeRowExportDryRunContract> = {}
): TierUpdateActualSafeRowExportDryRunContract => ({
  dryRunKind: 'tier_update_actual_safe_row_export_dry_run_contract',
  schemaVersion: '1',
  status: 'DRY_RUN_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8n_actual_safe_row_export_dry_run_contract',
  mockSourceContractStatus: 'MOCK_SOURCE_READY',
  requestedEntitiesSummary: { requestedCount: 2, allowedCount: 2, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  rowCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  duplicateRowIdCount: 0,
  requiredMetadataStatus: 'present',
  forbiddenFieldPolicyStatus: 'present',
  rowSafetyStatus: 'safe',
  sameHeadEvidenceStatus: 'required',
  operatorApprovalStatus: 'approved',
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  jsonlSha256Summary: 'sha256:safe-summary',
  includeJsonl: false,
  jsonl: null,
  actualDbQueryEnabled: false,
  actualDbExportEnabled: false,
  prismaClientEnabled: false,
  fileExportEnabled: false,
  artifactUploadEnabled: false,
  dockerSmokeChanged: false,
  stagingNoTxPassClaimed: false,
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false,
  blockerCount: 0,
  compactBlockerCodes: [],
  missingRequirementCount: 0,
  compactMissingRequirementCodes: [],
  unsafeReasonCount: 0,
  compactUnsafeReasonCodes: [],
  operatorSummary: {
    operatorId: { provided: true, safeSummaryOnly: true },
    runKey: { provided: true, safeSummaryOnly: true },
    sourceHeadSha: { provided: true, safeSummaryOnly: true },
    sourceHash: { provided: true, safeSummaryOnly: true },
    exportedAt: { provided: true, safeSummaryOnly: true }
  },
  nextSafeAction: 'prepare_pr_d8o_actual_safe_row_export_read_only_adapter_design',
  ...overrides
});

const scheduledRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8p',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'scheduled-row-1',
  entity_type: 'scheduled_tier_update',
  source_table: 'ScheduledTierUpdate',
  status: 'ready_for_mock_adapter',
  evidence_origin: 'mock_safe_row',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  scheduled_tier_update_id_summary: 'scheduled-summary-1',
  user_identity_summary: 'user-summary-1',
  tx_hash_summary: 'tx-summary-only',
  safe_summary: 'scheduled adapter row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const jobRunRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8p',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'job-run-row-1',
  entity_type: 'job_run',
  source_table: 'JobRun',
  status: 'ready_for_mock_adapter',
  evidence_origin: 'mock_safe_row',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  job_run_id_summary: 'job-summary-1',
  run_key_summary: 'run-summary-1',
  checkpoint_summary: 'checkpoint-summary-only',
  safe_summary: 'job run adapter row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyMockAdapterInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlyMockAdapterInput => ({
  adapterDesign: adapterDesign(),
  dryRunContract: dryRunContract(),
  safeRows: [scheduledRow(), jobRunRow()],
  requestedEntities: ['scheduled_tier_update', 'job_run'],
  requiredMetadataFields: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS],
  forbiddenFieldPolicy: {
    required: true,
    blockedFields: [...requiredForbiddenFields]
  },
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'adapter_implementation_approved' },
  ...overrides
});

const buildAdapter = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyMockAdapterInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlyMockAdapter(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlyMockAdapter', () => {
  it('returns MOCK_ADAPTER_READY from D8O design, D8N dry-run, and injected safe rows', () => {
    const adapter = buildAdapter();

    expect(adapter.adapterKind).toBe('tier_update_actual_safe_row_export_read_only_mock_adapter');
    expect(adapter.schemaVersion).toBe('1');
    expect(adapter.status).toBe('MOCK_ADAPTER_READY');
    expect(adapter.safeSummaryOnly).toBe(true);
    expect(adapter.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(adapter.traceLabel).toBe('d8p_actual_safe_row_export_read_only_mock_adapter');
    expect(adapter.adapterDesignStatus).toBe('ADAPTER_DESIGN_READY');
    expect(adapter.dryRunContractStatus).toBe('DRY_RUN_READY');
    expect(adapter.rowCount).toBe(2);
    expect(adapter.entityCounts).toEqual({ job_run: 1, scheduled_tier_update: 1 });
    expect(adapter.nextSafeAction).toBe('prepare_pr_d8q_read_only_adapter_dry_run_execution_bridge');
  });

  it('keeps MOCK_ADAPTER_READY separate from DB export, file export, Docker smoke, and readiness', () => {
    const adapter = buildAdapter();

    expect(adapter.actualDbQueryEnabled).toBe(false);
    expect(adapter.actualDbExportEnabled).toBe(false);
    expect(adapter.prismaClientEnabled).toBe(false);
    expect(adapter.fileExportEnabled).toBe(false);
    expect(adapter.artifactUploadEnabled).toBe(false);
    expect(adapter.dockerSmokeChanged).toBe(false);
    expect(adapter.stagingNoTxPassClaimed).toBe(false);
    expect(adapter.runtimeReadinessClaimed).toBe(false);
    expect(adapter.productionReadinessClaimed).toBe(false);
    expect(adapter.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(adapter.readinessClaim).toBe('none');
  });

  it('does not include row bodies by default and returns copies through read-only methods', () => {
    const rows = [scheduledRow(), jobRunRow()];
    const adapter = buildAdapter({ safeRows: rows });
    const scheduledRows = adapter.adapterMethods.readScheduledTierUpdateSafeRows();

    expect(adapter.rows).toBeNull();
    expect(scheduledRows).toHaveLength(1);
    expect(scheduledRows[0]).toEqual(rows[0]);
    expect(scheduledRows[0]).not.toBe(rows[0]);

    scheduledRows[0].status = 'mutated';

    expect(adapter.adapterMethods.readScheduledTierUpdateSafeRows()[0].status).toBe('ready_for_mock_adapter');
    expect(rows[0].status).toBe('ready_for_mock_adapter');
  });

  it('includes cloned rows only when explicitly requested', () => {
    const rows = [scheduledRow(), jobRunRow()];
    const adapter = buildAdapter({ safeRows: rows, includeRows: true });

    expect(adapter.rows).toEqual(rows);
    expect(adapter.rows?.[0]).not.toBe(rows[0]);
  });

  it('blocks when adapter design is missing', () => {
    const adapter = buildAdapter({ adapterDesign: null });

    expect(adapter.status).toBe('BLOCKED');
    expect(adapter.compactBlockerCodes).toContain('adapter_design_missing');
    expect(adapter.nextSafeAction).toBe('build_read_only_adapter_design');
  });

  it('blocks when dry-run contract is missing', () => {
    const adapter = buildAdapter({ dryRunContract: null });

    expect(adapter.status).toBe('BLOCKED');
    expect(adapter.compactBlockerCodes).toContain('dry_run_contract_missing');
    expect(adapter.nextSafeAction).toBe('build_actual_safe_row_export_dry_run_contract');
  });

  it('requires injected safe rows', () => {
    const adapter = buildAdapter({ safeRows: [] });

    expect(adapter.status).toBe('NEEDS_REVIEW');
    expect(adapter.compactMissingRequirementCodes).toContain('injected_safe_rows_required');
    expect(adapter.nextSafeAction).toBe('provide_injected_safe_rows');
  });

  it.each(['query', 'findMany', 'transaction', 'prisma', 'provider', 'wallet', 'contract', 'writeFile', 'uploadArtifact'])(
    'blocks forbidden adapter method %s',
    (methodName) => {
      const adapter = buildAdapter({ exposedMethodNames: ['readScheduledTierUpdateSafeRows', methodName] });

      expect(adapter.status).toBe('BLOCKED');
      expect(adapter.forbiddenMethodCount).toBeGreaterThan(0);
      expect(adapter.nextSafeAction).toBe('remove_forbidden_adapter_method');
    }
  );

  it.each([
    'Prize',
    'PrizeTransactions',
    'LotteryTickets',
    'TicketCode',
    'Nft',
    'NFT metadata',
    'TokenDetail',
    'wallet_summary',
    'user_identity_full',
    'reward ledger rows',
    'public catalog rows'
  ])('blocks deferred entity %s', (entity) => {
    const adapter = buildAdapter({ requestedEntities: ['scheduled_tier_update', entity] });

    expect(adapter.status).toBe('BLOCKED');
    expect(adapter.disallowedEntityCount).toBe(1);
    expect(adapter.nextSafeAction).toBe('remove_unsupported_entity');
  });

  it('blocks duplicate row ids', () => {
    const adapter = buildAdapter({ safeRows: [scheduledRow(), jobRunRow({ row_id: 'scheduled-row-1' })] });

    expect(adapter.status).toBe('BLOCKED');
    expect(adapter.duplicateRowIdCount).toBe(1);
    expect(adapter.compactBlockerCodes).toContain('duplicate_row_id');
    expect(adapter.nextSafeAction).toBe('remove_duplicate_row_ids');
  });

  it.each(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS)(
    'blocks when row metadata %s is missing',
    (field) => {
      const adapter = buildAdapter({ safeRows: [scheduledRow({ [field]: undefined })] });

      expect(adapter.status).toBe('BLOCKED');
      expect(adapter.compactBlockerCodes).toContain(`row_metadata_missing:${field}`);
      expect(adapter.nextSafeAction).toBe('add_required_safe_row_metadata');
    }
  );

  it.each([
    ['raw wallet', { rawWallet: 'wallet-value' }],
    ['raw txHash', { rawTxHash: '0xraw' }],
    ['raw checkpoint', { rawCheckpoint: 'checkpoint' }],
    ['raw provider error', { providerError: 'failed' }],
    ['raw env value', { safe_summary: 'DATABASE_URL=postgres://example' }],
    ['raw path value', { safe_summary: 'C:\\Users\\owner\\secret' }]
  ])('blocks %s', (_label, rowPatch) => {
    const adapter = buildAdapter({ safeRows: [scheduledRow(rowPatch)] });

    expect(adapter.status).toBe('BLOCKED');
    expect(adapter.rowSafetyStatus).toBe('blocked');
    expect(adapter.nextSafeAction).toBe('remove_unsafe_row_field');
  });

  it.each([
    { readiness_claim: 'runtime_ready' },
    { readiness_claim: 'staging_ready' },
    { readiness_claim: 'production_ready' },
    { safeSummaryOnly: false }
  ])('blocks unsafe row readiness or non-summary state %#', (rowPatch) => {
    const adapter = buildAdapter({ safeRows: [scheduledRow(rowPatch)] });

    expect(adapter.status).toBe('BLOCKED');
    expect(adapter.nextSafeAction).toBe('remove_unsafe_row_field');
  });

  it('needs implementation approval after adapter design approval', () => {
    const adapter = buildAdapter({ operatorApproval: { required: true, status: 'adapter_design_approved' } });

    expect(adapter.status).toBe('NEEDS_REVIEW');
    expect(adapter.operatorApprovalStatus).toBe('pending');
    expect(adapter.nextSafeAction).toBe('collect_operator_adapter_implementation_approval');
  });

  it('does not accept execution or readiness approvals as implementation approval', () => {
    const adapter = buildAdapter({ operatorApproval: { required: true, status: 'runtime_approved' } });

    expect(adapter.status).toBe('BLOCKED');
    expect(adapter.operatorApprovalStatus).toBe('blocked');
  });

  it('keeps allowed method surface read-only and entity-specific', () => {
    const adapter = buildAdapter({
      safeRows: [
        scheduledRow(),
        jobRunRow(),
        scheduledRow({ row_id: 'scheduled-row-2' })
      ],
      requestedEntities: ['scheduled_tier_update', 'job_run']
    });

    expect(adapter.exposedMethodNames).toEqual([
      'readScheduledTierUpdateSafeRows',
      'readJobRunSafeRows',
      'readTxReceiptEvidenceSafeRows',
      'readStagingEvidenceSafeRows'
    ]);
    expect(adapter.adapterMethods.readScheduledTierUpdateSafeRows()).toHaveLength(2);
    expect(adapter.adapterMethods.readJobRunSafeRows()).toHaveLength(1);
    expect(adapter.adapterMethods.readTxReceiptEvidenceSafeRows()).toHaveLength(0);
    expect(adapter.adapterMethods.readStagingEvidenceSafeRows()).toHaveLength(0);
  });

  it('blocks execution and readiness flags', () => {
    const adapter = buildAdapter({ actualDbQueryEnabled: true, artifactUploadEnabled: true, runtimeReadinessClaimed: true });

    expect(adapter.status).toBe('BLOCKED');
    expect(adapter.compactBlockerCodes).toContain('actualDbQueryEnabled_forbidden');
    expect(adapter.compactBlockerCodes).toContain('artifactUploadEnabled_forbidden');
    expect(adapter.compactBlockerCodes).toContain('runtimeReadinessClaimed_forbidden');
  });

  it('keeps source free from direct DB, Prisma, file export, artifact upload, provider, wallet, contract, and tx imports', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/from ['"]@prisma\/client['"]/);
    expect(source).not.toMatch(/process\.env\.DATABASE_URL/);
    expect(source).not.toMatch(/createWriteStream|writeFileSync|writeFile\(/);
    expect(source).not.toMatch(/uploadArtifact/);
    expect(source).not.toMatch(/new JsonRpcProvider|ethers\.Wallet|new Contract/);
    expect(source).not.toMatch(/sendTransaction|broadcastTransaction/);
  });
});
