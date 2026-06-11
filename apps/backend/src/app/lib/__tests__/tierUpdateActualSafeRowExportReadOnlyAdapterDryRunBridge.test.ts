import fs from 'fs';
import path from 'path';

import type {
  TierUpdateActualSafeRowExportMockSafeRow
} from '../tierUpdateActualSafeRowExportMockSourceContract';
import type {
  TierUpdateActualSafeRowExportReadOnlyMockAdapter
} from '../tierUpdateActualSafeRowExportReadOnlyMockAdapter';
import {
  buildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge,
  type BuildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeInput
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge';

const SOURCE_HEAD_SHA = 'c'.repeat(40);
const SOURCE_HASH = 'd'.repeat(40);
const EXPORTED_AT = '2026-06-11T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge.ts');

const scheduledRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8q',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'scheduled-row-1',
  entity_type: 'scheduled_tier_update',
  source_table: 'ScheduledTierUpdate',
  status: 'ready_for_dry_run_bridge',
  evidence_origin: 'mock_adapter_safe_row',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  scheduled_tier_update_id_summary: 'scheduled-summary-1',
  user_identity_summary: 'user-summary-1',
  tx_hash_summary: 'tx-summary-only',
  safe_summary: 'scheduled adapter bridge row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const jobRunRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8q',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'job-run-row-1',
  entity_type: 'job_run',
  source_table: 'JobRun',
  status: 'ready_for_dry_run_bridge',
  evidence_origin: 'mock_adapter_safe_row',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  job_run_id_summary: 'job-summary-1',
  run_key_summary: 'run-summary-1',
  checkpoint_summary: 'checkpoint-summary-only',
  safe_summary: 'job run adapter bridge row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const receiptRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8q',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'receipt-row-1',
  entity_type: 'tx_receipt_evidence',
  source_table: 'TxReceiptEvidence',
  status: 'ready_for_dry_run_bridge',
  evidence_origin: 'mock_adapter_safe_row',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  tx_hash_summary: 'tx-summary-only',
  safe_summary: 'receipt adapter bridge row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const stagingRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8q',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'staging-row-1',
  entity_type: 'staging_evidence',
  source_table: 'StagingEvidence',
  status: 'ready_for_dry_run_bridge',
  evidence_origin: 'mock_adapter_safe_row',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  safe_summary: 'staging adapter bridge row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const mockAdapter = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlyMockAdapter> = {},
  rows = {
    scheduled: [scheduledRow()],
    jobRun: [jobRunRow()],
    receipt: [receiptRow()],
    staging: [stagingRow()]
  }
): TierUpdateActualSafeRowExportReadOnlyMockAdapter => ({
  adapterKind: 'tier_update_actual_safe_row_export_read_only_mock_adapter',
  schemaVersion: '1',
  status: 'MOCK_ADAPTER_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8p_actual_safe_row_export_read_only_mock_adapter',
  adapterDesignStatus: 'ADAPTER_DESIGN_READY',
  dryRunContractStatus: 'DRY_RUN_READY',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  exposedMethodNames: [
    'readScheduledTierUpdateSafeRows',
    'readJobRunSafeRows',
    'readTxReceiptEvidenceSafeRows',
    'readStagingEvidenceSafeRows'
  ],
  allowedMethodCount: 4,
  forbiddenMethodCount: 0,
  compactForbiddenMethodCodes: [],
  rowCount: 4,
  entityCounts: {
    scheduled_tier_update: 1,
    job_run: 1,
    tx_receipt_evidence: 1,
    staging_evidence: 1
  },
  duplicateRowIdCount: 0,
  requiredMetadataStatus: 'present',
  forbiddenFieldPolicyStatus: 'present',
  rowSafetyStatus: 'safe',
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
  includeRows: false,
  rows: null,
  adapterMethods: {
    readScheduledTierUpdateSafeRows: () => clone(rows.scheduled),
    readJobRunSafeRows: () => clone(rows.jobRun),
    readTxReceiptEvidenceSafeRows: () => clone(rows.receipt),
    readStagingEvidenceSafeRows: () => clone(rows.staging)
  },
  blockerCount: 0,
  compactBlockerCodes: [],
  missingRequirementCount: 0,
  compactMissingRequirementCodes: [],
  unsafeReasonCount: 0,
  compactUnsafeReasonCodes: [],
  nextSafeAction: 'prepare_pr_d8q_read_only_adapter_dry_run_execution_bridge',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeInput => ({
  mockAdapter: mockAdapter(),
  requestedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'dry_run_bridge_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  operatorId: 'operator-safe-summary',
  runKey: 'run-safe-summary',
  reviewerId: 'reviewer-safe-summary',
  ...overrides
});

const buildBridge = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridgeInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge', () => {
  it('returns DRY_RUN_BRIDGE_READY from MOCK_ADAPTER_READY and injected safe rows', () => {
    const result = buildBridge();

    expect(result.bridgeKind).toBe('tier_update_actual_safe_row_export_read_only_adapter_dry_run_bridge');
    expect(result.schemaVersion).toBe('1');
    expect(result.status).toBe('DRY_RUN_BRIDGE_READY');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(result.traceLabel).toBe('d8q_actual_safe_row_export_read_only_adapter_dry_run_bridge');
    expect(result.mockAdapterStatus).toBe('MOCK_ADAPTER_READY');
    expect(result.executedMethodNames).toEqual([
      'readJobRunSafeRows',
      'readScheduledTierUpdateSafeRows',
      'readStagingEvidenceSafeRows',
      'readTxReceiptEvidenceSafeRows'
    ]);
    expect(result.methodExecutionCount).toBe(4);
    expect(result.methodResultCounts).toEqual({
      readJobRunSafeRows: 1,
      readScheduledTierUpdateSafeRows: 1,
      readStagingEvidenceSafeRows: 1,
      readTxReceiptEvidenceSafeRows: 1
    });
    expect(result.rowCount).toBe(4);
    expect(result.entityCounts).toEqual({
      job_run: 1,
      scheduled_tier_update: 1,
      staging_evidence: 1,
      tx_receipt_evidence: 1
    });
    expect(result.nextSafeAction).toBe('prepare_pr_d8r_actual_safe_row_export_read_only_adapter_plan');
  });

  it('keeps DRY_RUN_BRIDGE_READY separate from export, staging, runtime, and production readiness', () => {
    const result = buildBridge();

    expect(result.actualDbQueryEnabled).toBe(false);
    expect(result.actualDbExportEnabled).toBe(false);
    expect(result.prismaClientEnabled).toBe(false);
    expect(result.fileExportEnabled).toBe(false);
    expect(result.artifactUploadEnabled).toBe(false);
    expect(result.dockerSmokeChanged).toBe(false);
    expect(result.stagingNoTxPassClaimed).toBe(false);
    expect(result.runtimeReadinessClaimed).toBe(false);
    expect(result.productionReadinessClaimed).toBe(false);
    expect(result.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(result.readinessClaim).toBe('none');
  });

  it('blocks when mock adapter is missing', () => {
    const result = buildBridge({ mockAdapter: null });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('build_read_only_safe_row_adapter_mock_boundary');
  });

  it('blocks when mock adapter is BLOCKED', () => {
    const result = buildBridge({ mockAdapter: mockAdapter({ status: 'BLOCKED' }) });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('build_read_only_safe_row_adapter_mock_boundary');
  });

  it('returns NEEDS_REVIEW when mock adapter needs review', () => {
    const result = buildBridge({ mockAdapter: mockAdapter({ status: 'NEEDS_REVIEW' }) });

    expect(result.status).toBe('NEEDS_REVIEW');
  });

  it('returns NEEDS_REVIEW when requested entities are empty', () => {
    const result = buildBridge({ requestedEntities: [] });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.nextSafeAction).toBe('provide_requested_entities');
  });

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
    'public catalog rows',
    'unknown_entity'
  ])('blocks unsupported requested entity %s', (entity) => {
    const result = buildBridge({ requestedEntities: ['scheduled_tier_update', entity] });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('remove_unsupported_entity');
  });

  it('blocks when an allowed adapter method is missing', () => {
    const adapter = mockAdapter();
    delete (adapter.adapterMethods as Partial<typeof adapter.adapterMethods>).readJobRunSafeRows;
    const result = buildBridge({ mockAdapter: adapter, requestedEntities: ['job_run'] });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('provide_allowed_adapter_method');
  });

  it('blocks when an adapter method throws with safe reason only', () => {
    const adapter = mockAdapter();
    adapter.adapterMethods.readJobRunSafeRows = () => {
      throw new Error('unsafe raw detail');
    };
    const result = buildBridge({ mockAdapter: adapter, requestedEntities: ['job_run'] });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('fix_mock_adapter_method');
    expect(result.compactBlockerCodes).toContain('adapter_method_threw:readJobRunSafeRows');
  });

  it('blocks when an adapter method returns non-array', () => {
    const adapter = mockAdapter();
    adapter.adapterMethods.readJobRunSafeRows = (() => ({ row: jobRunRow() })) as unknown as typeof adapter.adapterMethods.readJobRunSafeRows;
    const result = buildBridge({ mockAdapter: adapter, requestedEntities: ['job_run'] });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('fix_mock_adapter_method');
  });

  it('returns NEEDS_REVIEW when methods return empty rows', () => {
    const result = buildBridge({
      mockAdapter: mockAdapter({}, { scheduled: [], jobRun: [], receipt: [], staging: [] }),
      requestedEntities: ['scheduled_tier_update']
    });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.nextSafeAction).toBe('provide_injected_safe_rows');
  });

  it('blocks duplicate row ids', () => {
    const result = buildBridge({
      mockAdapter: mockAdapter({}, {
        scheduled: [scheduledRow({ row_id: 'duplicate' })],
        jobRun: [jobRunRow({ row_id: 'duplicate' })],
        receipt: [],
        staging: []
      }),
      requestedEntities: ['scheduled_tier_update', 'job_run']
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('remove_duplicate_row_ids');
  });

  it.each([
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
  ])('blocks row missing %s', (field) => {
    const row = scheduledRow({ [field]: undefined });
    const result = buildBridge({
      mockAdapter: mockAdapter({}, { scheduled: [row], jobRun: [], receipt: [], staging: [] }),
      requestedEntities: ['scheduled_tier_update']
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('add_required_safe_row_metadata');
  });

  it.each(['runtime_ready', 'staging_ready', 'production_ready'])('blocks row readiness_claim %s', (readinessClaim) => {
    const result = buildBridge({
      mockAdapter: mockAdapter({}, {
        scheduled: [scheduledRow({ readiness_claim: readinessClaim })],
        jobRun: [],
        receipt: [],
        staging: []
      }),
      requestedEntities: ['scheduled_tier_update']
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('remove_unsafe_row_field');
  });

  it('blocks row safeSummaryOnly false', () => {
    const result = buildBridge({
      mockAdapter: mockAdapter({}, {
        scheduled: [scheduledRow({ safeSummaryOnly: false })],
        jobRun: [],
        receipt: [],
        staging: []
      }),
      requestedEntities: ['scheduled_tier_update']
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('remove_unsafe_row_field');
  });

  it.each([
    ['full wallet', { wallet: '0x1234567890123456789012345678901234567890' }],
    ['rawTxHash', { rawTxHash: 'raw txhash payload' }],
    ['rawCheckpoint', { rawCheckpoint: 'raw checkpoint payload' }],
    ['rawEnv', { rawEnv: 'DATABASE_URL=unsafe' }],
    ['dbUrl', { dbUrl: 'DATABASE_URL=unsafe' }],
    ['rpcUrl', { rpcUrl: 'https://unsafe.invalid' }],
    ['privatePath', { privatePath: 'C:\\Users\\unsafe' }],
    ['rawReceiptPayload', { rawReceiptPayload: 'raw receipt payload' }],
    ['authorizationHeader', { authorizationHeader: 'Bearer unsafe' }]
  ])('blocks row with %s', (_label, unsafeField) => {
    const result = buildBridge({
      mockAdapter: mockAdapter({}, {
        scheduled: [scheduledRow(unsafeField)],
        jobRun: [],
        receipt: [],
        staging: []
      }),
      requestedEntities: ['scheduled_tier_update']
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('remove_unsafe_row_field');
  });

  it('allows tx_hash_summary as a safe summary key', () => {
    const result = buildBridge({
      mockAdapter: mockAdapter({}, {
        scheduled: [scheduledRow({ tx_hash_summary: 'safe tx hash summary' })],
        jobRun: [],
        receipt: [],
        staging: []
      }),
      requestedEntities: ['scheduled_tier_update']
    });

    expect(result.status).toBe('DRY_RUN_BRIDGE_READY');
  });

  it('blocks when same-head evidence is not required', () => {
    const result = buildBridge({ sameHeadEvidence: { required: false } });

    expect(result.status).toBe('BLOCKED');
  });

  it('blocks when operator approval is missing', () => {
    const result = buildBridge({ operatorApproval: undefined });

    expect(result.status).toBe('BLOCKED');
  });

  it('returns NEEDS_REVIEW when operator approval is pending', () => {
    const result = buildBridge({ operatorApproval: { required: true, status: 'pending' } });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.nextSafeAction).toBe('collect_operator_dry_run_bridge_approval');
  });

  it('returns NEEDS_REVIEW when only adapter implementation approval is present', () => {
    const result = buildBridge({ operatorApproval: { required: true, status: 'adapter_implementation_approved' } });

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.nextSafeAction).toBe('collect_operator_dry_run_bridge_approval');
  });

  it.each(['execution_approved', 'runtime_approved', 'staging_ready', 'production_ready'])(
    'blocks forbidden operator approval %s',
    (status) => {
      const result = buildBridge({ operatorApproval: { required: true, status } });

      expect(result.status).toBe('BLOCKED');
    }
  );

  it.each([
    'actualDbQueryEnabled',
    'actualDbExportEnabled',
    'prismaClientEnabled',
    'fileExportEnabled',
    'artifactUploadEnabled',
    'dockerSmokeChanged',
    'stagingNoTxPassClaimed',
    'runtimeReadinessClaimed',
    'productionReadinessClaimed'
  ] as const)('blocks execution/readiness flag %s', (flag) => {
    const result = buildBridge({ [flag]: true });

    expect(result.status).toBe('BLOCKED');
  });

  it('defaults includeRows and includeJsonl to false', () => {
    const result = buildBridge();

    expect(result.includeRows).toBe(false);
    expect(result.rows).toBeNull();
    expect(result.includeJsonl).toBe(false);
    expect(result.jsonl).toBeNull();
  });

  it('returns cloned safe rows only when includeRows is true', () => {
    const result = buildBridge({ includeRows: true });

    expect(result.status).toBe('DRY_RUN_BRIDGE_READY');
    expect(result.rows).toHaveLength(4);
    expect(result.rows?.[0]).not.toBe(scheduledRow());
    result.rows![0].status = 'mutated';
    const fresh = buildBridge({ includeRows: true });
    expect(fresh.rows?.[0].status).toBe('ready_for_dry_run_bridge');
  });

  it('returns safe JSONL only when includeJsonl is true', () => {
    const withoutJsonl = buildBridge();
    const withJsonl = buildBridge({ includeJsonl: true });

    expect(withoutJsonl.jsonl).toBeNull();
    expect(withJsonl.jsonl).not.toBeNull();
    expect(withJsonl.jsonl?.trimEnd().split('\n')).toHaveLength(4);
    expect(withJsonl.jsonlSha256Summary).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(withJsonl.jsonlSha256Summary).toBe(withoutJsonl.jsonlSha256Summary);
  });

  it('keeps nextSafeAction singular and safe summary only', () => {
    const result = buildBridge();

    expect(typeof result.nextSafeAction).toBe('string');
    expect(result.nextSafeAction).not.toContain(',');
    expect(result.safeSummaryOnly).toBe(true);
  });

  it('does not expose raw operatorId, runKey, or reviewerId', () => {
    const result = buildBridge();

    expect(result.operatorSummary.operatorId).toEqual({ provided: true, safeSummaryOnly: true });
    expect(result.operatorSummary.runKey).toEqual({ provided: true, safeSummaryOnly: true });
    expect(result.operatorSummary.reviewerId).toEqual({ provided: true, safeSummaryOnly: true });
    expect(JSON.stringify(result)).not.toContain('operator-safe-summary');
    expect(JSON.stringify(result)).not.toContain('run-safe-summary');
    expect(JSON.stringify(result)).not.toContain('reviewer-safe-summary');
  });

  it('does not import Prisma, read DATABASE_URL, file export, artifact upload, routes, runtime wiring, tx, or Docker changes', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/from ['"]@prisma\/client['"]|new PrismaClient|process\.env\.DATABASE_URL/);
    expect(source).not.toMatch(/writeFile|createWriteStream|uploadArtifact|artifactUpload\(/);
    expect(source).not.toMatch(/Router\(|app\.(get|post|put|delete)|cron|trackingService|main\.ts/);
    expect(source).not.toMatch(/from ['"]ethers['"]|new JsonRpcProvider|new Wallet|new Contract|sendTransaction|docker smoke/i);
  });
});
