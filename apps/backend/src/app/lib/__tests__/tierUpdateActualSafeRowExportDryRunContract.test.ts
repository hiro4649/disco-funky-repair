import fs from 'fs';
import path from 'path';

import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from '../tierUpdateActualSafeRowExportDesignGate';
import {
  type TierUpdateActualSafeRowExportMockSafeRow,
  type TierUpdateActualSafeRowExportMockSourceContract
} from '../tierUpdateActualSafeRowExportMockSourceContract';
import {
  buildTierUpdateActualSafeRowExportDryRunContract,
  type BuildTierUpdateActualSafeRowExportDryRunContractInput
} from '../tierUpdateActualSafeRowExportDryRunContract';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-10T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportDryRunContract.ts');

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

const mockSourceContract = (
  overrides: Partial<TierUpdateActualSafeRowExportMockSourceContract> = {}
): TierUpdateActualSafeRowExportMockSourceContract => ({
  contractKind: 'tier_update_actual_safe_row_export_mock_source_contract',
  schemaVersion: '1',
  status: 'MOCK_SOURCE_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8m_actual_safe_row_export_mock_source_contract',
  designGateStatus: 'DESIGN_READY',
  sourceKind: 'mock_safe_row_source',
  requestedEntitiesSummary: {
    requestedCount: 2,
    allowedCount: 2,
    safeSummaryOnly: true
  },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  rowCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  requiredMetadataStatus: 'present',
  forbiddenFieldPolicyStatus: 'present',
  sameHeadEvidenceStatus: 'required',
  operatorApprovalStatus: 'design_approved',
  sourceMethodPolicyStatus: 'safe',
  rowSafetyStatus: 'safe',
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
  nextSafeAction: 'prepare_pr_d8n_actual_safe_row_export_dry_run_contract',
  ...overrides
});

const scheduledRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8n',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'scheduled-row-1',
  entity_type: 'scheduled_tier_update',
  source_table: 'ScheduledTierUpdate',
  status: 'ready_for_dry_run',
  evidence_origin: 'db_safe_summary',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  scheduled_tier_update_id_summary: 'scheduled-summary-1',
  user_identity_summary: 'user-summary-1',
  tx_hash_summary: 'tx-summary-only',
  safe_summary: 'scheduled dry run row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const jobRunRow = (overrides: Record<string, unknown> = {}): TierUpdateActualSafeRowExportMockSafeRow => ({
  schema_version: '1',
  audit_export_id: 'audit-d8n',
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: 'job-run-row-1',
  entity_type: 'job_run',
  source_table: 'JobRun',
  status: 'ready_for_dry_run',
  evidence_origin: 'db_safe_summary',
  readiness_claim: 'none',
  safeSummaryOnly: true,
  job_run_id_summary: 'job-summary-1',
  run_key_summary: 'run-summary-1',
  checkpoint_summary: 'checkpoint-summary-only',
  safe_summary: 'job run dry run row',
  runtime_wiring_status: 'not_connected',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportDryRunContractInput> = {}
): BuildTierUpdateActualSafeRowExportDryRunContractInput => ({
  mockSourceContract: mockSourceContract(),
  dryRunRows: [scheduledRow(), jobRunRow()],
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
  operatorId: 'operator-d8n',
  runKey: 'run-d8n',
  ...overrides
});

const buildContract = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportDryRunContractInput> = {}
) => buildTierUpdateActualSafeRowExportDryRunContract(validInput(overrides));

describe('tierUpdateActualSafeRowExportDryRunContract', () => {
  it('returns DRY_RUN_READY from valid mock source contract, safe rows, and design approval', () => {
    const contract = buildContract();

    expect(contract.dryRunKind).toBe('tier_update_actual_safe_row_export_dry_run_contract');
    expect(contract.schemaVersion).toBe('1');
    expect(contract.status).toBe('DRY_RUN_READY');
    expect(contract.safeSummaryOnly).toBe(true);
    expect(contract.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(contract.traceLabel).toBe('d8n_actual_safe_row_export_dry_run_contract');
    expect(contract.mockSourceContractStatus).toBe('MOCK_SOURCE_READY');
    expect(contract.rowCount).toBe(2);
    expect(contract.entityCounts).toEqual({ job_run: 1, scheduled_tier_update: 1 });
    expect(contract.jsonlSha256Summary).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(contract.nextSafeAction).toBe('prepare_pr_d8o_actual_safe_row_export_read_only_adapter_design');
  });

  it('returns DRY_RUN_READY from dry_run approval', () => {
    const contract = buildContract({ operatorApproval: { required: true, status: 'dry_run_approved' } });

    expect(contract.status).toBe('DRY_RUN_READY');
    expect(contract.operatorApprovalStatus).toBe('approved');
  });

  it('keeps DRY_RUN_READY separate from export and readiness', () => {
    const contract = buildContract();

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

  it('blocks when mock source contract is missing', () => {
    const contract = buildContract({ mockSourceContract: undefined });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('mock_source_contract_missing');
    expect(contract.nextSafeAction).toBe('build_actual_safe_row_export_mock_source_contract');
  });

  it('blocks when mock source contract is BLOCKED', () => {
    const contract = buildContract({ mockSourceContract: mockSourceContract({ status: 'BLOCKED' }) });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('mock_source_contract_blocked');
  });

  it('uses NEEDS_REVIEW when mock source contract needs review', () => {
    const contract = buildContract({ mockSourceContract: mockSourceContract({ status: 'NEEDS_REVIEW' }) });

    expect(contract.status).toBe('NEEDS_REVIEW');
    expect(contract.compactMissingRequirementCodes).toContain('mock_source_contract_needs_review');
  });

  it.each([
    ['missing rows', undefined],
    ['empty rows', []]
  ])('uses NEEDS_REVIEW for %s', (_label, rows) => {
    const contract = buildContract({ dryRunRows: rows as TierUpdateActualSafeRowExportMockSafeRow[] | undefined });

    expect(contract.status).toBe('NEEDS_REVIEW');
    expect(contract.compactMissingRequirementCodes).toContain('dry_run_rows_required');
    expect(contract.nextSafeAction).toBe('provide_mock_safe_rows');
  });

  it('uses NEEDS_REVIEW when requestedEntities is empty', () => {
    const contract = buildContract({ requestedEntities: [] });

    expect(contract.status).toBe('NEEDS_REVIEW');
    expect(contract.compactMissingRequirementCodes).toContain('requested_entities_required');
  });

  it.each(['unknown_entity', 'Prize', 'PrizeTransactions', 'NFT metadata', 'TokenDetail', 'TicketCode'])(
    'blocks unsupported requested entity %s',
    (entity) => {
      const contract = buildContract({ requestedEntities: ['scheduled_tier_update', entity] });

      expect(contract.status).toBe('BLOCKED');
      expect(contract.disallowedEntityCount).toBeGreaterThan(0);
      expect(contract.compactBlockerCodes).toEqual(expect.arrayContaining([
        entity === 'unknown_entity' ? 'unsupported_entity_requested' : 'deferred_entity_requested'
      ]));
      expect(contract.nextSafeAction).toBe('remove_unsupported_entity');
    }
  );

  it('blocks unsupported row entity', () => {
    const contract = buildContract({
      dryRunRows: [scheduledRow({ entity_type: 'Prize' })]
    });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('row_entity_unsupported');
  });

  it.each([...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS])(
    'blocks row missing %s',
    (field) => {
      const row = scheduledRow();
      delete row[field];
      const contract = buildContract({ dryRunRows: [row] });

      expect(contract.status).toBe('BLOCKED');
      expect(contract.compactBlockerCodes).toContain(`row_metadata_missing:${field}`);
      expect(contract.nextSafeAction).toBe('add_required_safe_row_metadata');
    }
  );

  it('blocks duplicate row_id', () => {
    const contract = buildContract({
      dryRunRows: [scheduledRow({ row_id: 'duplicate-row' }), jobRunRow({ row_id: 'duplicate-row' })]
    });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.duplicateRowIdCount).toBe(1);
    expect(contract.compactBlockerCodes).toContain('duplicate_row_id');
    expect(contract.nextSafeAction).toBe('remove_duplicate_row_ids');
  });

  it.each(['runtime_ready', 'staging_ready', 'production_ready'])(
    'blocks readiness_claim %s',
    (readinessClaim) => {
      const contract = buildContract({ dryRunRows: [scheduledRow({ readiness_claim: readinessClaim })] });

      expect(contract.status).toBe('BLOCKED');
      expect(contract.compactBlockerCodes).toContain('row_readiness_claim_forbidden');
      expect(contract.nextSafeAction).toBe('remove_unsafe_row_field');
    }
  );

  it('blocks row safeSummaryOnly false', () => {
    const contract = buildContract({ dryRunRows: [scheduledRow({ safeSummaryOnly: false })] });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('row_safe_summary_only_required');
  });

  it.each([
    ['full wallet', { fullWalletAddress: 'wallet-value' }],
    ['rawTxHash', { rawTxHash: 'tx-value' }],
    ['rawCheckpoint', { rawCheckpoint: 'checkpoint-value' }],
    ['rawEnv', { rawEnv: 'DATABASE_URL=value' }],
    ['dbUrl', { dbUrl: 'DATABASE_URL=value' }],
    ['rpcUrl', { rpcUrl: 'rpc-value' }],
    ['privatePath', { privatePath: 'private path value' }],
    ['rawReceiptPayload', { rawReceiptPayload: 'raw receipt payload' }],
    ['authorizationHeader', { authorizationHeader: 'Authorization: value' }]
  ])('blocks row with %s', (_label, unsafe) => {
    const contract = buildContract({ dryRunRows: [scheduledRow(unsafe)] });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactUnsafeReasonCodes.some((code) => code.startsWith('unsafe_row_field') || code.startsWith('unsafe_row_value'))).toBe(true);
    expect(contract.nextSafeAction).toBe('remove_unsafe_row_field');
  });

  it('allows raw tx hash only as safe summary key', () => {
    const contract = buildContract({
      dryRunRows: [scheduledRow({ tx_hash_summary: 'safe-summary-only' })]
    });

    expect(contract.status).toBe('DRY_RUN_READY');
  });

  it('blocks same-head evidence when not required', () => {
    const contract = buildContract({ sameHeadEvidence: { required: false } });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain('same_head_evidence_required');
  });

  it('blocks when operator approval is missing', () => {
    const contract = buildContract({ operatorApproval: undefined });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.operatorApprovalStatus).toBe('blocked');
    expect(contract.compactBlockerCodes).toContain('operator_approval_required');
  });

  it('uses NEEDS_REVIEW when operator approval is pending', () => {
    const contract = buildContract({ operatorApproval: { required: true, status: 'pending' } });

    expect(contract.status).toBe('NEEDS_REVIEW');
    expect(contract.operatorApprovalStatus).toBe('pending');
    expect(contract.compactMissingRequirementCodes).toContain('operator_approval_pending');
    expect(contract.nextSafeAction).toBe('collect_operator_dry_run_approval');
  });

  it('blocks execution approval', () => {
    const contract = buildContract({ operatorApproval: { required: true, status: 'execution_approved' } });

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
  ])('blocks execution/readiness flag %s', (key, value, blocker) => {
    const contract = buildContract({ [key]: value });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.compactBlockerCodes).toContain(blocker);
    expect(contract[key as 'actualDbQueryEnabled']).toBe(false);
  });

  it('returns jsonl null when includeJsonl is false', () => {
    const contract = buildContract();

    expect(contract.includeJsonl).toBe(false);
    expect(contract.jsonl).toBeNull();
    expect(contract.jsonlSha256Summary).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it('returns safe JSONL only for validated safe rows when includeJsonl is true', () => {
    const contract = buildContract({ includeJsonl: true });

    expect(contract.status).toBe('DRY_RUN_READY');
    expect(contract.includeJsonl).toBe(true);
    expect(contract.jsonl).toContain('"row_id":"scheduled-row-1"');
    expect(contract.jsonl).toContain('"safeSummaryOnly":true');
    expect(contract.jsonl).not.toContain('rawTxHash');
    expect(contract.jsonl).not.toContain('DATABASE_URL');
  });

  it('keeps nextSafeAction singular and safe summary only', () => {
    const contract = buildContract();

    expect(typeof contract.nextSafeAction).toBe('string');
    expect(Array.isArray(contract.nextSafeAction)).toBe(false);
    expect(contract.safeSummaryOnly).toBe(true);
  });

  it('does not expose raw operatorId or runKey', () => {
    const contract = buildContract();
    const text = JSON.stringify(contract);

    expect(contract.operatorSummary.operatorId).toEqual({ provided: true, safeSummaryOnly: true });
    expect(contract.operatorSummary.runKey).toEqual({ provided: true, safeSummaryOnly: true });
    expect(text).not.toContain('operator-d8n');
    expect(text).not.toContain('run-d8n');
  });

  it('does not import Prisma, read DATABASE_URL, file export, artifact upload, routes, runtime wiring, tx, or Docker changes', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|new PrismaClient|process\.env\.DATABASE_URL/);
    expect(source).not.toMatch(/fs\.|createWriteStream|uploadArtifact\(|router\.|cron|trackingService|main\.ts/i);
    expect(source).not.toMatch(/sendTransaction|new ethers|new Contract|JsonRpcProvider|Wallet/);
    expect(source).not.toMatch(/docker\s+(run|compose|build|smoke)/i);
  });
});
