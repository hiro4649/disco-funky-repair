import fs from 'fs';
import path from 'path';

import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge';
import {
  buildTierUpdateActualSafeRowExportReadOnlyAdapterPlan,
  type BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterPlan';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from '../tierUpdateActualSafeRowExportDesignGate';

const SOURCE_HEAD_SHA = 'e'.repeat(40);
const SOURCE_HASH = 'f'.repeat(40);
const EXPORTED_AT = '2026-06-12T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportReadOnlyAdapterPlan.ts');

const dryRunBridge = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge> = {}
): TierUpdateActualSafeRowExportReadOnlyAdapterDryRunBridge => ({
  bridgeKind: 'tier_update_actual_safe_row_export_read_only_adapter_dry_run_bridge',
  schemaVersion: '1',
  status: 'DRY_RUN_BRIDGE_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8q_actual_safe_row_export_read_only_adapter_dry_run_bridge',
  mockAdapterStatus: 'MOCK_ADAPTER_READY',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  executedMethodNames: [
    'readScheduledTierUpdateSafeRows',
    'readJobRunSafeRows',
    'readTxReceiptEvidenceSafeRows',
    'readStagingEvidenceSafeRows'
  ],
  methodExecutionCount: 4,
  methodResultCounts: {
    readScheduledTierUpdateSafeRows: 1,
    readJobRunSafeRows: 1,
    readTxReceiptEvidenceSafeRows: 1,
    readStagingEvidenceSafeRows: 1
  },
  rowCount: 4,
  entityCounts: {
    scheduled_tier_update: 1,
    job_run: 1,
    tx_receipt_evidence: 1,
    staging_evidence: 1
  },
  duplicateRowIdCount: 0,
  requiredMetadataStatus: 'present',
  rowSafetyStatus: 'safe',
  sameHeadEvidenceStatus: 'required',
  operatorApprovalStatus: 'approved',
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  jsonlSha256Summary: 'sha256:safe-summary',
  includeRows: false,
  rows: null,
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
    reviewerId: { provided: true, safeSummaryOnly: true },
    sourceHeadSha: { provided: true, safeSummaryOnly: true },
    sourceHash: { provided: true, safeSummaryOnly: true },
    exportedAt: { provided: true, safeSummaryOnly: true }
  },
  nextSafeAction: 'prepare_pr_d8r_actual_safe_row_export_read_only_adapter_plan',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput => ({
  dryRunBridge: dryRunBridge(),
  adapterPlan: {
    plannedMethodNames: [
      'readScheduledTierUpdateSafeRows',
      'readJobRunSafeRows',
      'readTxReceiptEvidenceSafeRows',
      'readStagingEvidenceSafeRows'
    ]
  },
  requestedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  safeRowSchemaPolicy: {
    required: true,
    requiredMetadataFields: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS]
  },
  forbiddenFieldPolicy: {
    required: true,
    blockedFields: ['raw_db_dump', 'database_url', 'private_key', 'raw_checkpoint_payload']
  },
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'adapter_plan_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  runKey: 'run-safe-summary',
  operatorId: 'operator-safe-summary',
  reviewerId: 'reviewer-safe-summary',
  ...overrides
});

const buildPlan = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlyAdapterPlan(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlyAdapterPlan', () => {
  it('returns ADAPTER_PLAN_READY for a safe D8Q bridge, safe plan, and adapter_plan_approved approval', () => {
    const plan = buildPlan();

    expect(plan.planKind).toBe('tier_update_actual_safe_row_export_read_only_adapter_plan');
    expect(plan.schemaVersion).toBe('1');
    expect(plan.status).toBe('ADAPTER_PLAN_READY');
    expect(plan.safeSummaryOnly).toBe(true);
    expect(plan.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(plan.traceLabel).toBe('d8r_actual_safe_row_export_read_only_adapter_plan');
    expect(plan.dryRunBridgeStatus).toBe('DRY_RUN_BRIDGE_READY');
    expect(plan.plannedMethodCount).toBe(4);
    expect(plan.nextSafeAction).toBe('prepare_pr_d8s_actual_safe_row_export_adapter_contract');
  });

  it('keeps ADAPTER_PLAN_READY separate from export, staging, runtime, and production readiness', () => {
    const plan = buildPlan();

    expect(plan.readinessClaim).toBe('none');
    expect(plan.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(plan.actualDbQueryEnabled).toBe(false);
    expect(plan.actualDbExportEnabled).toBe(false);
    expect(plan.prismaClientEnabled).toBe(false);
    expect(plan.databaseUrlReadEnabled).toBe(false);
    expect(plan.fileExportEnabled).toBe(false);
    expect(plan.artifactUploadEnabled).toBe(false);
    expect(plan.dockerSmokeChanged).toBe(false);
    expect(plan.stagingNoTxPassClaimed).toBe(false);
    expect(plan.runtimeReadinessClaimed).toBe(false);
    expect(plan.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing dryRunBridge blocks', { dryRunBridge: null }, 'BLOCKED', 'build_read_only_adapter_dry_run_bridge'],
    ['dryRunBridge BLOCKED blocks', { dryRunBridge: dryRunBridge({ status: 'BLOCKED' }) }, 'BLOCKED', 'build_read_only_adapter_dry_run_bridge'],
    ['dryRunBridge NEEDS_REVIEW gives NEEDS_REVIEW', { dryRunBridge: dryRunBridge({ status: 'NEEDS_REVIEW' }) }, 'NEEDS_REVIEW', 'collect_operator_adapter_plan_approval'],
    ['missing adapterPlan blocks', { adapterPlan: null }, 'BLOCKED', 'provide_read_only_adapter_plan'],
    ['requestedEntities empty gives NEEDS_REVIEW', { requestedEntities: [] }, 'NEEDS_REVIEW', 'collect_operator_adapter_plan_approval'],
    ['plannedMethodNames empty gives NEEDS_REVIEW', { adapterPlan: { plannedMethodNames: [] } }, 'NEEDS_REVIEW', 'collect_operator_adapter_plan_approval'],
    ['operator approval pending gives NEEDS_REVIEW', { operatorApproval: { required: true, status: 'pending' } }, 'NEEDS_REVIEW', 'collect_operator_adapter_plan_approval'],
    ['operator approval dry_run_bridge_approved gives NEEDS_REVIEW', { operatorApproval: { required: true, status: 'dry_run_bridge_approved' } }, 'NEEDS_REVIEW', 'collect_operator_adapter_plan_approval']
  ])('%s', (_name, overrides, status, nextSafeAction) => {
    const plan = buildPlan(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput>);

    expect(plan.status).toBe(status);
    expect(plan.nextSafeAction).toBe(nextSafeAction);
  });

  it.each([
    ['unsupported requested entity blocks', { requestedEntities: ['scheduled_tier_update', 'unknown_entity'] }],
    ['Prize blocks', { requestedEntities: ['Prize'] }],
    ['PrizeTransactions blocks', { requestedEntities: ['PrizeTransactions'] }],
    ['NFT metadata blocks', { requestedEntities: ['NFT metadata'] }],
    ['TokenDetail blocks', { requestedEntities: ['TokenDetail'] }],
    ['TicketCode blocks', { requestedEntities: ['TicketCode'] }],
    ['unsupported planned method blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows', 'readWalletRows'] } }],
    ['plan declaring prisma blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresPrisma: true } }],
    ['plan declaring database client blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresDatabaseClient: true } }],
    ['plan declaring raw query blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresRawQuery: true } }],
    ['plan declaring transaction blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresTransaction: true } }],
    ['plan declaring env read blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresEnvRead: true } }],
    ['plan declaring DATABASE_URL read blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresDatabaseUrlRead: true } }],
    ['plan declaring file write blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresFileWrite: true } }],
    ['plan declaring artifact upload blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresArtifactUpload: true } }],
    ['plan declaring wallet/provider/contract/tx blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresWalletProviderContractTx: true } }],
    ['plan declaring HTTP route blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresHttpRoute: true } }],
    ['plan declaring CLI blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresCli: true } }],
    ['plan declaring cron/main/trackingService wiring blocks', { adapterPlan: { plannedMethodNames: ['readScheduledTierUpdateSafeRows'], declaresCronMainTrackingServiceWiring: true } }],
    ['same-head evidence not required blocks', { sameHeadEvidence: { required: false } }],
    ['operator approval missing blocks', { operatorApproval: undefined }],
    ['operator approval execution_approved blocks', { operatorApproval: { required: true, status: 'execution_approved' } }],
    ['operator approval runtime_approved blocks', { operatorApproval: { required: true, status: 'runtime_approved' } }],
    ['operator approval staging_ready blocks', { operatorApproval: { required: true, status: 'staging_ready' } }],
    ['operator approval production_ready blocks', { operatorApproval: { required: true, status: 'production_ready' } }],
    ['actualDbQueryEnabled true blocks', { actualDbQueryEnabled: true }],
    ['actualDbExportEnabled true blocks', { actualDbExportEnabled: true }],
    ['prismaClientEnabled true blocks', { prismaClientEnabled: true }],
    ['databaseUrlReadEnabled true blocks', { databaseUrlReadEnabled: true }],
    ['fileExportEnabled true blocks', { fileExportEnabled: true }],
    ['artifactUploadEnabled true blocks', { artifactUploadEnabled: true }],
    ['dockerSmokeChanged true blocks', { dockerSmokeChanged: true }],
    ['stagingNoTxPassClaimed true blocks', { stagingNoTxPassClaimed: true }],
    ['runtimeReadinessClaimed true blocks', { runtimeReadinessClaimed: true }],
    ['productionReadinessClaimed true blocks', { productionReadinessClaimed: true }]
  ])('%s', (_name, overrides) => {
    const plan = buildPlan(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterPlanInput>);

    expect(plan.status).toBe('BLOCKED');
    expect(plan.blockerCount).toBeGreaterThan(0);
  });

  it.each(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS)(
    'missing %s policy blocks',
    (field) => {
      const plan = buildPlan({
        safeRowSchemaPolicy: {
          required: true,
          requiredMetadataFields: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS.filter((entry) => entry !== field)
        }
      });

      expect(plan.status).toBe('BLOCKED');
      expect(plan.safeRowSchemaPolicyStatus).toBe('missing');
      expect(plan.compactMissingRequirementCodes).toContain(`safe_row_schema_policy:${field}`);
    }
  );

  it('forbiddenFieldPolicy missing blocks', () => {
    const plan = buildPlan({ forbiddenFieldPolicy: undefined });

    expect(plan.status).toBe('BLOCKED');
    expect(plan.forbiddenFieldPolicyStatus).toBe('missing');
    expect(plan.nextSafeAction).toBe('add_forbidden_field_policy');
  });

  it('uses remove_unsupported_adapter_method as singular next action for unsupported method', () => {
    const plan = buildPlan({ adapterPlan: { plannedMethodNames: ['readUnsafeRows'] } });

    expect(plan.nextSafeAction).toBe('remove_unsupported_adapter_method');
    expect(plan.nextSafeAction.split(',')).toHaveLength(1);
  });

  it('uses add_safe_row_schema_policy as singular next action for missing schema policy', () => {
    const plan = buildPlan({ safeRowSchemaPolicy: undefined });

    expect(plan.nextSafeAction).toBe('add_safe_row_schema_policy');
    expect(plan.nextSafeAction.split(',')).toHaveLength(1);
  });

  it('never suggests actual DB query, file export, or artifact upload as next action', () => {
    const plan = buildPlan({ operatorApproval: { required: true, status: 'pending' } });

    expect(plan.nextSafeAction).not.toMatch(/db_query|file_export|artifact_upload/i);
  });

  it('does not import Prisma, read DATABASE_URL, file export, artifact upload, routes, runtime wiring, tx, or Docker changes', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|PrismaClient|process\.env|DATABASE_URL/);
    expect(source).not.toMatch(/from ['"]fs|fs\.|writeFile|createWriteStream|uploadArtifact\(/);
    expect(source).not.toMatch(/Controller\(|new Router|app\.(get|post)|schedule\(|from ['"].*main|trackingService\./);
    expect(source).not.toMatch(/new JsonRpcProvider|new Wallet|new Contract|sendTransaction\(|dockerSmokeChanged:\s*true/);
  });
});
