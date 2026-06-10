import fs from 'fs';
import path from 'path';

import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from '../tierUpdateActualSafeRowExportDesignGate';
import type {
  TierUpdateActualSafeRowExportDryRunContract
} from '../tierUpdateActualSafeRowExportDryRunContract';
import {
  buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS,
  type BuildTierUpdateActualSafeRowExportReadOnlyAdapterDesignInput,
  type TierUpdateActualSafeRowExportReadOnlyAdapterDesignInput
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterDesign';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-10T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportReadOnlyAdapterDesign.ts');

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
  requestedEntitiesSummary: {
    requestedCount: 2,
    allowedCount: 2,
    safeSummaryOnly: true
  },
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

const adapterDesign = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlyAdapterDesignInput> = {}
): TierUpdateActualSafeRowExportReadOnlyAdapterDesignInput => ({
  adapterKind: 'read_only_safe_row_adapter_design',
  safeSummaryOnly: true,
  allowedMethodNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS],
  declaredEntities: ['scheduled_tier_update', 'job_run'],
  requiresSameHeadEvidence: true,
  requiresOperatorApproval: true,
  actualDbQueryEnabled: false,
  actualDbExportEnabled: false,
  prismaClientEnabled: false,
  fileExportEnabled: false,
  artifactUploadEnabled: false,
  dockerSmokeChanged: false,
  stagingNoTxPassClaimed: false,
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false,
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterDesignInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlyAdapterDesignInput => ({
  dryRunContract: dryRunContract(),
  adapterDesign: adapterDesign(),
  requestedEntities: ['scheduled_tier_update', 'job_run'],
  requiredMetadataFields: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS],
  forbiddenFieldPolicy: {
    required: true,
    blockedFields: [...requiredForbiddenFields]
  },
  sameHeadEvidence: {
    required: true,
    headMatchStatus: 'same_head'
  },
  operatorApproval: {
    required: true,
    status: 'adapter_design_approved'
  },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  operatorId: 'operator-123',
  runKey: 'run-d8o',
  ...overrides
});

describe('tierUpdateActualSafeRowExportReadOnlyAdapterDesign', () => {
  it('returns ADAPTER_DESIGN_READY from valid D8N dry run and adapter design approval', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput());

    expect(result.status).toBe('ADAPTER_DESIGN_READY');
    expect(result.dryRunContractStatus).toBe('DRY_RUN_READY');
    expect(result.adapterKind).toBe('read_only_safe_row_adapter_design');
    expect(result.allowedMethodCount).toBe(4);
    expect(result.forbiddenMethodCount).toBe(0);
    expect(result.nextSafeAction).toBe('prepare_pr_d8p_read_only_adapter_mock_implementation_boundary');
  });

  it('keeps ADAPTER_DESIGN_READY separate from export and readiness', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput());

    expect(result.status).toBe('ADAPTER_DESIGN_READY');
    expect(result.actualDbQueryEnabled).toBe(false);
    expect(result.actualDbExportEnabled).toBe(false);
    expect(result.prismaClientEnabled).toBe(false);
    expect(result.fileExportEnabled).toBe(false);
    expect(result.artifactUploadEnabled).toBe(false);
    expect(result.dockerSmokeChanged).toBe(false);
    expect(result.stagingNoTxPassClaimed).toBe(false);
    expect(result.runtimeReadinessClaimed).toBe(false);
    expect(result.productionReadinessClaimed).toBe(false);
    expect(result.readinessClaim).toBe('none');
    expect(result.stagingNoTxPreflightStatus).toBe('BLOCKED');
  });

  it('blocks when dryRunContract is missing', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({ dryRunContract: null }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('dry_run_contract_missing');
    expect(result.nextSafeAction).toBe('build_actual_safe_row_export_dry_run_contract');
  });

  it('blocks when dryRunContract is BLOCKED', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      dryRunContract: dryRunContract({ status: 'BLOCKED' })
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('dry_run_contract_blocked');
  });

  it('uses NEEDS_REVIEW when dryRunContract needs review', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      dryRunContract: dryRunContract({ status: 'NEEDS_REVIEW' })
    }));

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.compactMissingRequirementCodes).toContain('dry_run_contract_needs_review');
  });

  it('blocks missing adapterDesign', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({ adapterDesign: null }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('adapter_design_missing');
    expect(result.nextSafeAction).toBe('provide_read_only_adapter_design');
  });

  it('blocks wrong adapterKind', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      adapterDesign: adapterDesign({ adapterKind: 'real_db_adapter' })
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('adapter_kind_invalid');
  });

  it('blocks safeSummaryOnly false', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      adapterDesign: adapterDesign({ safeSummaryOnly: false })
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('adapter_safe_summary_only_required');
  });

  it('uses NEEDS_REVIEW when allowedMethodNames is missing', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      adapterDesign: adapterDesign({ allowedMethodNames: [] })
    }));

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.compactMissingRequirementCodes).toContain('adapter_methods_required');
  });

  it.each([
    'query',
    'execute',
    'transaction',
    'raw',
    'rawQuery',
    'unsafeRaw',
    'findMany',
    'findFirst',
    'create',
    'update',
    'delete',
    'upsert',
    'connect',
    'disconnect',
    'prisma',
    'database',
    'db',
    'client',
    'pool',
    'connection',
    'readEnv',
    'readDatabaseUrl',
    'getDatabaseUrl',
    'readSecret',
    'writeFile',
    'createWriteStream',
    'uploadArtifact',
    'send',
    'broadcast',
    'tx',
    'wallet',
    'provider',
    'contract'
  ])('blocks forbidden adapter method or key %s', (methodName) => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      adapterDesign: adapterDesign({
        allowedMethodNames: ['readScheduledTierUpdateSafeRows', methodName],
        [methodName]: true
      })
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('forbidden_adapter_method');
    expect(result.nextSafeAction).toBe('remove_forbidden_adapter_method');
  });

  it('uses NEEDS_REVIEW when requestedEntities is empty', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      requestedEntities: []
    }));

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.compactMissingRequirementCodes).toContain('requested_entities_required');
  });

  it.each([
    'unknown_entity',
    'Prize',
    'PrizeTransactions',
    'LotteryTickets',
    'Nft',
    'NFT metadata',
    'TokenDetail',
    'TicketCode',
    'wallet_summary',
    'user_identity_full',
    'reward ledger rows',
    'public catalog rows'
  ])('blocks unsupported or deferred requested entity %s', (entity) => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      requestedEntities: ['scheduled_tier_update', entity]
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('remove_unsupported_entity');
  });

  it('blocks unsupported declared entity', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      adapterDesign: adapterDesign({ declaredEntities: ['scheduled_tier_update', 'TokenDetail'] })
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('deferred_entity');
  });

  it.each(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS)('blocks missing metadata field %s', (field) => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      requiredMetadataFields: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS.filter((requiredField) => requiredField !== field)
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactMissingRequirementCodes).toContain(`metadata:${field}`);
    expect(result.nextSafeAction).toBe('add_required_safe_row_metadata');
  });

  it('blocks missing forbiddenFieldPolicy', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      forbiddenFieldPolicy: undefined
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('forbidden_field_policy_missing');
  });

  it('blocks incomplete forbiddenFieldPolicy', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      forbiddenFieldPolicy: { required: true, blockedFields: ['raw_db_dump'] }
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('forbidden_policy_missing:authorization_header');
  });

  it('blocks same-head evidence when not required', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      sameHeadEvidence: { required: false }
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.sameHeadEvidenceStatus).toBe('blocked');
    expect(result.nextSafeAction).toBe('require_same_head_evidence');
  });

  it('blocks missing operator approval', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      operatorApproval: undefined
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.operatorApprovalStatus).toBe('blocked');
  });

  it('uses NEEDS_REVIEW when operator approval is pending', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      operatorApproval: { required: true, status: 'pending' }
    }));

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.operatorApprovalStatus).toBe('pending');
    expect(result.nextSafeAction).toBe('collect_operator_adapter_design_approval');
  });

  it('uses NEEDS_REVIEW for dry_run_approved because adapter approval is separate', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      operatorApproval: { required: true, status: 'dry_run_approved' }
    }));

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.operatorApprovalStatus).toBe('pending');
  });

  it.each([
    'design_approved',
    'execution_approved',
    'runtime_approved',
    'staging_ready',
    'production_ready'
  ])('blocks forbidden operator approval %s', (status) => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      operatorApproval: { required: true, status }
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('operator_approval_status_forbidden');
  });

  it.each([
    ['actualDbQueryEnabled', 'actual_db_query_enabled'],
    ['actualDbExportEnabled', 'actual_db_export_enabled'],
    ['prismaClientEnabled', 'prisma_client_enabled'],
    ['fileExportEnabled', 'file_export_enabled'],
    ['artifactUploadEnabled', 'artifact_upload_enabled'],
    ['dockerSmokeChanged', 'docker_smoke_changed'],
    ['stagingNoTxPassClaimed', 'staging_no_tx_pass_claimed'],
    ['runtimeReadinessClaimed', 'runtime_readiness_claimed'],
    ['productionReadinessClaimed', 'production_readiness_claimed']
  ])('blocks %s true', (flagName, expectedCode) => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      adapterDesign: adapterDesign({ [flagName]: true })
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain(expectedCode);
  });

  it('requires adapter design to declare same-head evidence and operator approval', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput({
      adapterDesign: adapterDesign({
        requiresSameHeadEvidence: false,
        requiresOperatorApproval: false
      })
    }));

    expect(result.status).toBe('BLOCKED');
    expect(result.compactBlockerCodes).toContain('adapter_requires_operator_approval');
    expect(result.compactBlockerCodes).toContain('adapter_requires_same_head_evidence');
  });

  it('does not expose raw operatorId or runKey', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput());

    expect(result.operatorSummary.operatorId).toEqual({ provided: true, safeSummaryOnly: true });
    expect(result.operatorSummary.runKey).toEqual({ provided: true, safeSummaryOnly: true });
    expect(JSON.stringify(result)).not.toContain('operator-123');
    expect(JSON.stringify(result)).not.toContain('run-d8o');
  });

  it('keeps nextSafeAction singular and safe summary only', () => {
    const result = buildTierUpdateActualSafeRowExportReadOnlyAdapterDesign(validInput());

    expect(typeof result.nextSafeAction).toBe('string');
    expect(result.nextSafeAction).not.toContain(',');
    expect(result.safeSummaryOnly).toBe(true);
  });

  it('does not import Prisma, read DATABASE_URL, implement file export, artifact upload, runtime wiring, tx, or Docker changes', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|PrismaClient/);
    expect(source).not.toMatch(/process\.env\.DATABASE_URL|DATABASE_URL/);
    expect(source).not.toMatch(/fs\.writeFile|\.writeFile\(|createWriteStream\(|downloadable|uploadArtifact\(/);
    expect(source).not.toMatch(/router\.|app\.(get|post|put|delete)|cron|main\.ts|trackingService/);
    expect(source).not.toMatch(/new\s+JsonRpcProvider|new\s+Wallet|new\s+Contract|sendTransaction\(|TierUpdater\(/);
    expect(source).not.toMatch(/docker build|docker run|Dockerfile/);
  });
});
