import fs from 'fs';
import path from 'path';

import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterContract
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterContract';
import {
  buildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation,
  type BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterDesign';

const SOURCE_HEAD_SHA = 'c'.repeat(40);
const SOURCE_HASH = 'd'.repeat(40);
const EXPORTED_AT = '2026-06-13T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation.ts'
);

const disabledPolicy = () => ({
  actualDbQueryEnabled: false,
  actualDbExportEnabled: false,
  prismaClientEnabled: false,
  databaseUrlReadEnabled: false,
  envReadEnabled: false,
  networkAccessEnabled: false,
  rpcAccessEnabled: false,
  walletAccessEnabled: false,
  contractAccessEnabled: false,
  txSendEnabled: false,
  fileExportEnabled: false,
  artifactUploadEnabled: false,
  dockerSmokeChanged: false,
  stagingNoTxPassClaimed: false,
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false
});

const adapterContract = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlyAdapterContract> = {}
): TierUpdateActualSafeRowExportReadOnlyAdapterContract => ({
  contractKind: 'tier_update_actual_safe_row_export_read_only_adapter_contract',
  schemaVersion: '1',
  status: 'ADAPTER_CONTRACT_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8s_actual_safe_row_export_read_only_adapter_contract',
  adapterPlanStatus: 'ADAPTER_PLAN_READY',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  contractMethodNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS],
  contractMethodCount: 4,
  forbiddenContractMethodCount: 0,
  compactForbiddenMethodCodes: [],
  safeRowSchemaPolicyStatus: 'present',
  allowedMethodPolicyStatus: 'present',
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
  nextSafeAction: 'prepare_pr_d8t_actual_safe_row_export_read_only_adapter_disabled_implementation',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput => ({
  adapterContract: adapterContract(),
  implementationSpec: {
    disabledMethodNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS],
    retainsRequiredMetadata: true,
    returnsDisabledSafeResultsOnly: true,
    keepsReadinessClaimNone: true
  },
  requestedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disabledExecutionPolicy: disabledPolicy(),
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'disabled_implementation_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  runKey: 'run-safe-summary',
  operatorId: 'operator-safe-summary',
  reviewerId: 'reviewer-safe-summary',
  ...overrides
});

const buildDisabledImplementation = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation', () => {
  it('returns DISABLED_IMPLEMENTATION_READY for a safe D8S contract, disabled spec, and disabled approval', () => {
    const implementation = buildDisabledImplementation();

    expect(implementation.implementationKind).toBe(
      'tier_update_actual_safe_row_export_read_only_adapter_disabled_implementation'
    );
    expect(implementation.schemaVersion).toBe('1');
    expect(implementation.status).toBe('DISABLED_IMPLEMENTATION_READY');
    expect(implementation.safeSummaryOnly).toBe(true);
    expect(implementation.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(implementation.traceLabel).toBe('d8t_actual_safe_row_export_read_only_adapter_disabled_implementation');
    expect(implementation.adapterContractStatus).toBe('ADAPTER_CONTRACT_READY');
    expect(implementation.disabledMethodCount).toBe(4);
    expect(implementation.nextSafeAction).toBe(
      'prepare_pr_d8u_actual_safe_row_export_read_only_adapter_noop_execution_probe'
    );
  });

  it('keeps DISABLED_IMPLEMENTATION_READY separate from export, query, staging, runtime, and production readiness', () => {
    const implementation = buildDisabledImplementation();

    expect(implementation.readinessClaim).toBe('none');
    expect(implementation.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(implementation.actualDbQueryEnabled).toBe(false);
    expect(implementation.actualDbExportEnabled).toBe(false);
    expect(implementation.prismaClientEnabled).toBe(false);
    expect(implementation.databaseUrlReadEnabled).toBe(false);
    expect(implementation.envReadEnabled).toBe(false);
    expect(implementation.networkAccessEnabled).toBe(false);
    expect(implementation.rpcAccessEnabled).toBe(false);
    expect(implementation.walletAccessEnabled).toBe(false);
    expect(implementation.contractAccessEnabled).toBe(false);
    expect(implementation.txSendEnabled).toBe(false);
    expect(implementation.fileExportEnabled).toBe(false);
    expect(implementation.artifactUploadEnabled).toBe(false);
    expect(implementation.dockerSmokeChanged).toBe(false);
    expect(implementation.stagingNoTxPassClaimed).toBe(false);
    expect(implementation.runtimeReadinessClaimed).toBe(false);
    expect(implementation.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing adapterContract blocks', { adapterContract: null }, 'BLOCKED', 'build_actual_safe_row_export_read_only_adapter_contract'],
    [
      'adapterContract BLOCKED blocks',
      { adapterContract: adapterContract({ status: 'BLOCKED' }) },
      'BLOCKED',
      'build_actual_safe_row_export_read_only_adapter_contract'
    ],
    [
      'adapterContract NEEDS_REVIEW gives NEEDS_REVIEW',
      { adapterContract: adapterContract({ status: 'NEEDS_REVIEW' }) },
      'NEEDS_REVIEW',
      'collect_operator_disabled_implementation_approval'
    ],
    ['missing implementationSpec blocks', { implementationSpec: null }, 'BLOCKED', 'provide_disabled_implementation_spec'],
    ['requestedEntities empty gives NEEDS_REVIEW', { requestedEntities: [] }, 'NEEDS_REVIEW', 'collect_operator_disabled_implementation_approval'],
    [
      'disabledMethodNames empty gives NEEDS_REVIEW',
      { implementationSpec: { disabledMethodNames: [] } },
      'NEEDS_REVIEW',
      'collect_operator_disabled_implementation_approval'
    ],
    [
      'operator approval pending gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'pending' } },
      'NEEDS_REVIEW',
      'collect_operator_disabled_implementation_approval'
    ],
    [
      'operator approval adapter_contract_approved gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'adapter_contract_approved' } },
      'NEEDS_REVIEW',
      'collect_operator_disabled_implementation_approval'
    ]
  ])('%s', (_name, overrides, status, nextSafeAction) => {
    const implementation = buildDisabledImplementation(
      overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput>
    );

    expect(implementation.status).toBe(status);
    expect(implementation.nextSafeAction).toBe(nextSafeAction);
  });

  it.each([
    ['unsupported requested entity blocks', { requestedEntities: ['scheduled_tier_update', 'unknown_entity'] }],
    ['Prize blocks', { requestedEntities: ['Prize'] }],
    ['PrizeTransactions blocks', { requestedEntities: ['PrizeTransactions'] }],
    ['NFT metadata blocks', { requestedEntities: ['NFT metadata'] }],
    ['TokenDetail blocks', { requestedEntities: ['TokenDetail'] }],
    ['TicketCode blocks', { requestedEntities: ['TicketCode'] }],
    [
      'unsupported disabled method blocks',
      { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows', 'readWalletRows'] } }
    ],
    ['implementation declaring prisma blocks', { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresPrisma: true } }],
    [
      'implementation declaring database client blocks',
      { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresDatabaseClient: true } }
    ],
    ['implementation declaring raw query blocks', { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresRawQuery: true } }],
    ['implementation declaring SQL text blocks', { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresSqlText: true } }],
    ['implementation declaring transaction blocks', { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresTransaction: true } }],
    ['implementation declaring env read blocks', { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresEnvRead: true } }],
    [
      'implementation declaring DATABASE_URL read blocks',
      { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresDatabaseUrlRead: true } }
    ],
    ['implementation declaring file write blocks', { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresFileWrite: true } }],
    [
      'implementation declaring artifact upload blocks',
      { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresArtifactUpload: true } }
    ],
    [
      'implementation declaring wallet/provider/contract/tx blocks',
      { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresWalletProviderContractTx: true } }
    ],
    ['implementation declaring HTTP route blocks', { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresHttpRoute: true } }],
    ['implementation declaring CLI blocks', { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresCli: true } }],
    [
      'implementation declaring cron/main/trackingService wiring blocks',
      { implementationSpec: { disabledMethodNames: ['readScheduledTierUpdateSafeRows'], declaresCronMainTrackingServiceWiring: true } }
    ],
    ['disabledExecutionPolicy missing blocks', { disabledExecutionPolicy: null }],
    ['disabledExecutionPolicy actualDbQueryEnabled true blocks', { disabledExecutionPolicy: { ...disabledPolicy(), actualDbQueryEnabled: true } }],
    ['disabledExecutionPolicy databaseUrlReadEnabled true blocks', { disabledExecutionPolicy: { ...disabledPolicy(), databaseUrlReadEnabled: true } }],
    ['disabledExecutionPolicy prismaClientEnabled true blocks', { disabledExecutionPolicy: { ...disabledPolicy(), prismaClientEnabled: true } }],
    ['same-head evidence not required blocks', { sameHeadEvidence: { required: false } }],
    ['operator approval missing blocks', { operatorApproval: undefined }],
    ['operator approval execution_approved blocks', { operatorApproval: { required: true, status: 'execution_approved' } }],
    ['actualDbQueryEnabled true blocks', { actualDbQueryEnabled: true }],
    ['actualDbExportEnabled true blocks', { actualDbExportEnabled: true }],
    ['prismaClientEnabled true blocks', { prismaClientEnabled: true }],
    ['databaseUrlReadEnabled true blocks', { databaseUrlReadEnabled: true }],
    ['envReadEnabled true blocks', { envReadEnabled: true }],
    ['networkAccessEnabled true blocks', { networkAccessEnabled: true }],
    ['rpcAccessEnabled true blocks', { rpcAccessEnabled: true }],
    ['walletAccessEnabled true blocks', { walletAccessEnabled: true }],
    ['contractAccessEnabled true blocks', { contractAccessEnabled: true }],
    ['txSendEnabled true blocks', { txSendEnabled: true }],
    ['fileExportEnabled true blocks', { fileExportEnabled: true }],
    ['artifactUploadEnabled true blocks', { artifactUploadEnabled: true }],
    ['dockerSmokeChanged true blocks', { dockerSmokeChanged: true }],
    ['stagingNoTxPassClaimed true blocks', { stagingNoTxPassClaimed: true }],
    ['runtimeReadinessClaimed true blocks', { runtimeReadinessClaimed: true }],
    ['productionReadinessClaimed true blocks', { productionReadinessClaimed: true }]
  ])('%s', (_name, overrides) => {
    const implementation = buildDisabledImplementation(
      overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementationInput>
    );

    expect(implementation.status).toBe('BLOCKED');
    expect(implementation.blockerCount).toBeGreaterThan(0);
  });

  it('disabled methods return safe disabled results only and no rows', () => {
    const implementation = buildDisabledImplementation();

    for (const methodName of TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS) {
      const result = implementation.adapterMethods[methodName]();
      expect(result.status).toBe('DISABLED');
      expect(result.safeSummaryOnly).toBe(true);
      expect(result.rowCount).toBe(0);
      expect(result.rows).toEqual([]);
      expect(result.actualDbQueryEnabled).toBe(false);
      expect(result.readinessClaim).toBe('none');
    }
  });

  it('does not throw raw errors from disabled methods', () => {
    const implementation = buildDisabledImplementation();

    expect(() => implementation.adapterMethods.readScheduledTierUpdateSafeRows()).not.toThrow();
    expect(() => implementation.adapterMethods.readJobRunSafeRows()).not.toThrow();
    expect(() => implementation.adapterMethods.readTxReceiptEvidenceSafeRows()).not.toThrow();
    expect(() => implementation.adapterMethods.readStagingEvidenceSafeRows()).not.toThrow();
  });

  it('keeps nextSafeAction singular and safeSummaryOnly true', () => {
    const implementation = buildDisabledImplementation();

    expect(typeof implementation.nextSafeAction).toBe('string');
    expect(implementation.nextSafeAction.split(',')).toHaveLength(1);
    expect(implementation.safeSummaryOnly).toBe(true);
  });

  it('retains the required safe row metadata contract', () => {
    const implementation = buildDisabledImplementation();

    expect(implementation.retainedMetadataFields).toEqual([
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
    ]);
  });

  it('source does not import Prisma or read env/DATABASE_URL', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client/);
    expect(source).not.toMatch(/new\s+PrismaClient/);
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/DATABASE_URL/);
    expect(source).not.toMatch(/fs\./);
    expect(source).not.toMatch(/fetch\(/);
  });
});
