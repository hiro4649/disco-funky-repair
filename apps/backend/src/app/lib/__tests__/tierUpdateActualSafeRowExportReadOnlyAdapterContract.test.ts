import fs from 'fs';
import path from 'path';

import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterPlan
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterPlan';
import {
  buildTierUpdateActualSafeRowExportReadOnlyAdapterContract,
  type BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterContract';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS
} from '../tierUpdateActualSafeRowExportDesignGate';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterDesign';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-12T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportReadOnlyAdapterContract.ts');

const adapterPlan = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlyAdapterPlan> = {}
): TierUpdateActualSafeRowExportReadOnlyAdapterPlan => ({
  planKind: 'tier_update_actual_safe_row_export_read_only_adapter_plan',
  schemaVersion: '1',
  status: 'ADAPTER_PLAN_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8r_actual_safe_row_export_read_only_adapter_plan',
  dryRunBridgeStatus: 'DRY_RUN_BRIDGE_READY',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  plannedMethodNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS],
  plannedMethodCount: 4,
  forbiddenPlannedMethodCount: 0,
  compactForbiddenMethodCodes: [],
  safeRowSchemaPolicyStatus: 'present',
  forbiddenFieldPolicyStatus: 'present',
  sameHeadEvidenceStatus: 'required',
  operatorApprovalStatus: 'approved',
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  actualDbQueryEnabled: false,
  actualDbExportEnabled: false,
  prismaClientEnabled: false,
  databaseUrlReadEnabled: false,
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
  nextSafeAction: 'prepare_pr_d8s_actual_safe_row_export_adapter_contract',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput => ({
  adapterPlan: adapterPlan(),
  contractSpec: {
    contractMethodNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS],
    requiresSafeSummaryRowsOnly: true,
    requiresSafeMetadata: true,
    requiresReadinessClaimNone: true,
    requiresSameHeadEvidence: true,
    requiresOperatorApproval: true,
    keepsExecutionFlagsFalse: true
  },
  requestedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  allowedMethodPolicy: {
    required: true,
    allowedMethodNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS]
  },
  safeRowSchemaPolicy: {
    required: true,
    requiredMetadataFields: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS]
  },
  forbiddenFieldPolicy: {
    required: true,
    blockedFields: ['raw_db_dump', 'database_url', 'private_key', 'raw_checkpoint_payload']
  },
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'adapter_contract_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  runKey: 'run-safe-summary',
  operatorId: 'operator-safe-summary',
  reviewerId: 'reviewer-safe-summary',
  ...overrides
});

const buildContract = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlyAdapterContract(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlyAdapterContract', () => {
  it('returns ADAPTER_CONTRACT_READY for a safe D8R plan, safe contract, and adapter_contract_approved approval', () => {
    const contract = buildContract();

    expect(contract.contractKind).toBe('tier_update_actual_safe_row_export_read_only_adapter_contract');
    expect(contract.schemaVersion).toBe('1');
    expect(contract.status).toBe('ADAPTER_CONTRACT_READY');
    expect(contract.safeSummaryOnly).toBe(true);
    expect(contract.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(contract.traceLabel).toBe('d8s_actual_safe_row_export_read_only_adapter_contract');
    expect(contract.adapterPlanStatus).toBe('ADAPTER_PLAN_READY');
    expect(contract.contractMethodCount).toBe(4);
    expect(contract.nextSafeAction).toBe(
      'prepare_pr_d8t_actual_safe_row_export_read_only_adapter_disabled_implementation'
    );
  });

  it('keeps ADAPTER_CONTRACT_READY separate from export, staging, runtime, and production readiness', () => {
    const contract = buildContract();

    expect(contract.readinessClaim).toBe('none');
    expect(contract.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(contract.actualDbQueryEnabled).toBe(false);
    expect(contract.actualDbExportEnabled).toBe(false);
    expect(contract.prismaClientEnabled).toBe(false);
    expect(contract.databaseUrlReadEnabled).toBe(false);
    expect(contract.fileExportEnabled).toBe(false);
    expect(contract.artifactUploadEnabled).toBe(false);
    expect(contract.dockerSmokeChanged).toBe(false);
    expect(contract.stagingNoTxPassClaimed).toBe(false);
    expect(contract.runtimeReadinessClaimed).toBe(false);
    expect(contract.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing adapterPlan blocks', { adapterPlan: null }, 'BLOCKED', 'build_actual_safe_row_export_read_only_adapter_plan'],
    [
      'adapterPlan BLOCKED blocks',
      { adapterPlan: adapterPlan({ status: 'BLOCKED' }) },
      'BLOCKED',
      'build_actual_safe_row_export_read_only_adapter_plan'
    ],
    [
      'adapterPlan NEEDS_REVIEW gives NEEDS_REVIEW',
      { adapterPlan: adapterPlan({ status: 'NEEDS_REVIEW' }) },
      'NEEDS_REVIEW',
      'collect_operator_adapter_contract_approval'
    ],
    ['missing contractSpec blocks', { contractSpec: null }, 'BLOCKED', 'provide_read_only_adapter_contract_spec'],
    ['requestedEntities empty gives NEEDS_REVIEW', { requestedEntities: [] }, 'NEEDS_REVIEW', 'collect_operator_adapter_contract_approval'],
    [
      'contractMethodNames empty gives NEEDS_REVIEW',
      { contractSpec: { contractMethodNames: [] } },
      'NEEDS_REVIEW',
      'collect_operator_adapter_contract_approval'
    ],
    [
      'operator approval pending gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'pending' } },
      'NEEDS_REVIEW',
      'collect_operator_adapter_contract_approval'
    ],
    [
      'operator approval adapter_plan_approved gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'adapter_plan_approved' } },
      'NEEDS_REVIEW',
      'collect_operator_adapter_contract_approval'
    ]
  ])('%s', (_name, overrides, status, nextSafeAction) => {
    const contract = buildContract(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput>);

    expect(contract.status).toBe(status);
    expect(contract.nextSafeAction).toBe(nextSafeAction);
  });

  it.each([
    ['unsupported requested entity blocks', { requestedEntities: ['scheduled_tier_update', 'unknown_entity'] }],
    ['Prize blocks', { requestedEntities: ['Prize'] }],
    ['PrizeTransactions blocks', { requestedEntities: ['PrizeTransactions'] }],
    ['NFT metadata blocks', { requestedEntities: ['NFT metadata'] }],
    ['TokenDetail blocks', { requestedEntities: ['TokenDetail'] }],
    ['TicketCode blocks', { requestedEntities: ['TicketCode'] }],
    ['unsupported contract method blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows', 'readWalletRows'] } }],
    ['contract declaring prisma blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresPrisma: true } }],
    ['contract declaring database client blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresDatabaseClient: true } }],
    ['contract declaring raw query blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresRawQuery: true } }],
    ['contract declaring SQL text blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresSqlText: true } }],
    ['contract declaring transaction blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresTransaction: true } }],
    ['contract declaring env read blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresEnvRead: true } }],
    ['contract declaring DATABASE_URL read blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresDatabaseUrlRead: true } }],
    ['contract declaring file write blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresFileWrite: true } }],
    ['contract declaring artifact upload blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresArtifactUpload: true } }],
    ['contract declaring wallet/provider/contract/tx blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresWalletProviderContractTx: true } }],
    ['contract declaring HTTP route blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresHttpRoute: true } }],
    ['contract declaring CLI blocks', { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresCli: true } }],
    [
      'contract declaring cron/main/trackingService wiring blocks',
      { contractSpec: { contractMethodNames: ['readScheduledTierUpdateSafeRows'], declaresCronMainTrackingServiceWiring: true } }
    ],
    ['allowedMethodPolicy missing blocks', { allowedMethodPolicy: undefined }],
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
    const contract = buildContract(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterContractInput>);

    expect(contract.status).toBe('BLOCKED');
    expect(contract.blockerCount).toBeGreaterThan(0);
  });

  it.each(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS)(
    'missing %s policy blocks',
    (field) => {
      const contract = buildContract({
        safeRowSchemaPolicy: {
          required: true,
          requiredMetadataFields: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS.filter((entry) => entry !== field)
        }
      });

      expect(contract.status).toBe('BLOCKED');
      expect(contract.safeRowSchemaPolicyStatus).toBe('missing');
      expect(contract.compactMissingRequirementCodes).toContain(`safe_row_schema_policy:${field}`);
    }
  );

  it.each(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS)(
    'missing allowed method %s blocks',
    (method) => {
      const contract = buildContract({
        allowedMethodPolicy: {
          required: true,
          allowedMethodNames: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS.filter((entry) => entry !== method)
        }
      });

      expect(contract.status).toBe('BLOCKED');
      expect(contract.allowedMethodPolicyStatus).toBe('missing');
      expect(contract.compactMissingRequirementCodes).toContain(`allowed_method_policy:${method}`);
    }
  );

  it('forbiddenFieldPolicy missing blocks', () => {
    const contract = buildContract({ forbiddenFieldPolicy: undefined });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.forbiddenFieldPolicyStatus).toBe('missing');
    expect(contract.nextSafeAction).toBe('add_forbidden_field_policy');
  });

  it('contract requirement flags missing give NEEDS_REVIEW without allowing readiness', () => {
    const contract = buildContract({
      contractSpec: {
        contractMethodNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS],
        requiresSafeSummaryRowsOnly: false,
        requiresSafeMetadata: false,
        requiresReadinessClaimNone: false,
        requiresSameHeadEvidence: false,
        requiresOperatorApproval: false,
        keepsExecutionFlagsFalse: false
      }
    });

    expect(contract.status).toBe('NEEDS_REVIEW');
    expect(contract.missingRequirementCount).toBeGreaterThan(0);
    expect(contract.actualDbQueryEnabled).toBe(false);
    expect(contract.runtimeReadinessClaimed).toBe(false);
  });

  it('uses remove_unsupported_adapter_method as singular next action for unsupported method', () => {
    const contract = buildContract({ contractSpec: { contractMethodNames: ['readUnsafeRows'] } });

    expect(contract.nextSafeAction).toBe('remove_unsupported_adapter_method');
    expect(contract.nextSafeAction.split(',')).toHaveLength(1);
  });

  it('uses add_allowed_method_policy as singular next action for missing allowed method policy', () => {
    const contract = buildContract({ allowedMethodPolicy: undefined });

    expect(contract.nextSafeAction).toBe('add_allowed_method_policy');
    expect(contract.nextSafeAction.split(',')).toHaveLength(1);
  });

  it('never suggests actual DB query, file export, or artifact upload as next action', () => {
    const contract = buildContract({ operatorApproval: { required: true, status: 'pending' } });

    expect(contract.nextSafeAction).not.toMatch(/db_query|file_export|artifact_upload/i);
  });

  it('does not import Prisma, read DATABASE_URL, file export, artifact upload, routes, runtime wiring, tx, or Docker changes', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|PrismaClient|process\.env|DATABASE_URL/);
    expect(source).not.toMatch(/from ['"]fs|fs\.|writeFile|createWriteStream|uploadArtifact\(/);
    expect(source).not.toMatch(/Controller\(|new Router|app\.(get|post)|schedule\(|from ['"].*main|trackingService\./);
    expect(source).not.toMatch(/new JsonRpcProvider|new Wallet|new Contract|sendTransaction\(|dockerSmokeChanged:\s*true/);
  });
});
