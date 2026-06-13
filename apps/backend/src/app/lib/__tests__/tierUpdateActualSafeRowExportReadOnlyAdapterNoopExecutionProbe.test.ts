import fs from 'fs';
import path from 'path';

import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterDesign';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation';
import {
  buildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe,
  type BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe';

const SOURCE_HEAD_SHA = 'e'.repeat(40);
const SOURCE_HASH = 'f'.repeat(40);
const EXPORTED_AT = '2026-06-13T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe.ts');

const disabledResult = (methodName: string) => ({
  status: 'DISABLED' as const,
  safeSummaryOnly: true as const,
  methodName,
  rowCount: 0 as const,
  rows: [] as [],
  actualDbQueryEnabled: false as const,
  readinessClaim: 'none' as const,
  disabledReasonCode: 'actual_db_query_disabled' as const
});

const probePolicy = () => ({
  allowOnlyNoop: true,
  probeMethodNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS],
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

const disabledImplementation = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation> = {}
): TierUpdateActualSafeRowExportReadOnlyAdapterDisabledImplementation => ({
  implementationKind: 'tier_update_actual_safe_row_export_read_only_adapter_disabled_implementation',
  schemaVersion: '1',
  status: 'DISABLED_IMPLEMENTATION_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8t_actual_safe_row_export_read_only_adapter_disabled_implementation',
  adapterContractStatus: 'ADAPTER_CONTRACT_READY',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  disabledMethodNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS],
  disabledMethodCount: 4,
  forbiddenMethodCount: 0,
  compactForbiddenMethodCodes: [],
  disabledExecutionPolicyStatus: 'present',
  sameHeadEvidenceStatus: 'required',
  operatorApprovalStatus: 'approved',
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
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
  productionReadinessClaimed: false,
  methodResultsSummary: Object.fromEntries(
    TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_ALLOWED_ADAPTER_METHODS.map((methodName) => [
      methodName,
      { status: 'DISABLED', rowCount: 0, actualDbQueryEnabled: false, readinessClaim: 'none', safeSummaryOnly: true }
    ])
  ),
  adapterMethods: {
    readScheduledTierUpdateSafeRows: () => disabledResult('readScheduledTierUpdateSafeRows'),
    readJobRunSafeRows: () => disabledResult('readJobRunSafeRows'),
    readTxReceiptEvidenceSafeRows: () => disabledResult('readTxReceiptEvidenceSafeRows'),
    readStagingEvidenceSafeRows: () => disabledResult('readStagingEvidenceSafeRows')
  },
  blockerCount: 0,
  compactBlockerCodes: [],
  missingRequirementCount: 0,
  compactMissingRequirementCodes: [],
  unsafeReasonCount: 0,
  compactUnsafeReasonCodes: [],
  retainedMetadataFields: [
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
  ],
  operatorSummary: {
    operatorId: { provided: true, safeSummaryOnly: true },
    runKey: { provided: true, safeSummaryOnly: true },
    reviewerId: { provided: true, safeSummaryOnly: true },
    sourceHeadSha: { provided: true, safeSummaryOnly: true },
    sourceHash: { provided: true, safeSummaryOnly: true },
    exportedAt: { provided: true, safeSummaryOnly: true }
  },
  nextSafeAction: 'prepare_pr_d8u_actual_safe_row_export_read_only_adapter_noop_execution_probe',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput => ({
  disabledImplementation: disabledImplementation(),
  requestedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  probePolicy: probePolicy(),
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'noop_probe_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  runKey: 'run-safe-summary',
  operatorId: 'operator-safe-summary',
  reviewerId: 'reviewer-safe-summary',
  ...overrides
});

const buildProbe = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe', () => {
  it('returns NOOP_PROBE_READY for a safe D8T disabled implementation, noop policy, and noop approval', () => {
    const probe = buildProbe();

    expect(probe.probeKind).toBe('tier_update_actual_safe_row_export_read_only_adapter_noop_execution_probe');
    expect(probe.schemaVersion).toBe('1');
    expect(probe.status).toBe('NOOP_PROBE_READY');
    expect(probe.safeSummaryOnly).toBe(true);
    expect(probe.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(probe.traceLabel).toBe('d8u_actual_safe_row_export_read_only_adapter_noop_execution_probe');
    expect(probe.disabledImplementationStatus).toBe('DISABLED_IMPLEMENTATION_READY');
    expect(probe.probeMethodCount).toBe(4);
    expect(probe.probeResultCount).toBe(4);
    expect(probe.disabledResultCount).toBe(4);
    expect(probe.nextSafeAction).toBe('prepare_pr_d8v_actual_safe_row_export_read_only_adapter_real_source_gate');
  });

  it('keeps NOOP_PROBE_READY separate from export, query, staging, runtime, and production readiness', () => {
    const probe = buildProbe();

    expect(probe.readinessClaim).toBe('none');
    expect(probe.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(probe.actualDbQueryEnabled).toBe(false);
    expect(probe.actualDbExportEnabled).toBe(false);
    expect(probe.prismaClientEnabled).toBe(false);
    expect(probe.databaseUrlReadEnabled).toBe(false);
    expect(probe.envReadEnabled).toBe(false);
    expect(probe.networkAccessEnabled).toBe(false);
    expect(probe.rpcAccessEnabled).toBe(false);
    expect(probe.walletAccessEnabled).toBe(false);
    expect(probe.contractAccessEnabled).toBe(false);
    expect(probe.txSendEnabled).toBe(false);
    expect(probe.fileExportEnabled).toBe(false);
    expect(probe.artifactUploadEnabled).toBe(false);
    expect(probe.dockerSmokeChanged).toBe(false);
    expect(probe.stagingNoTxPassClaimed).toBe(false);
    expect(probe.runtimeReadinessClaimed).toBe(false);
    expect(probe.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing disabledImplementation blocks', { disabledImplementation: null }, 'BLOCKED', 'build_disabled_implementation_boundary'],
    [
      'disabledImplementation BLOCKED blocks',
      { disabledImplementation: disabledImplementation({ status: 'BLOCKED' }) },
      'BLOCKED',
      'build_disabled_implementation_boundary'
    ],
    [
      'disabledImplementation NEEDS_REVIEW gives NEEDS_REVIEW',
      { disabledImplementation: disabledImplementation({ status: 'NEEDS_REVIEW' }) },
      'NEEDS_REVIEW',
      'collect_operator_noop_probe_approval'
    ],
    ['requestedEntities empty gives NEEDS_REVIEW', { requestedEntities: [] }, 'NEEDS_REVIEW', 'collect_operator_noop_probe_approval'],
    ['operator approval pending gives NEEDS_REVIEW', { operatorApproval: { required: true, status: 'pending' } }, 'NEEDS_REVIEW', 'collect_operator_noop_probe_approval'],
    [
      'operator approval disabled_implementation_approved gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'disabled_implementation_approved' } },
      'NEEDS_REVIEW',
      'collect_operator_noop_probe_approval'
    ]
  ])('%s', (_name, overrides, status, nextSafeAction) => {
    const probe = buildProbe(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput>);

    expect(probe.status).toBe(status);
    expect(probe.nextSafeAction).toBe(nextSafeAction);
  });

  it.each([
    ['unsupported requested entity blocks', { requestedEntities: ['scheduled_tier_update', 'unknown_entity'] }],
    ['Prize blocks', { requestedEntities: ['Prize'] }],
    ['PrizeTransactions blocks', { requestedEntities: ['PrizeTransactions'] }],
    ['NFT metadata blocks', { requestedEntities: ['NFT metadata'] }],
    ['TokenDetail blocks', { requestedEntities: ['TokenDetail'] }],
    ['TicketCode blocks', { requestedEntities: ['TicketCode'] }],
    ['missing probePolicy blocks', { probePolicy: null }],
    ['probePolicy allowOnlyNoop false blocks', { probePolicy: { ...probePolicy(), allowOnlyNoop: false } }],
    ['probePolicy actualDbQueryEnabled true blocks', { probePolicy: { ...probePolicy(), actualDbQueryEnabled: true } }],
    ['probePolicy databaseUrlReadEnabled true blocks', { probePolicy: { ...probePolicy(), databaseUrlReadEnabled: true } }],
    ['probePolicy envReadEnabled true blocks', { probePolicy: { ...probePolicy(), envReadEnabled: true } }],
    ['unsupported probe method blocks', { probePolicy: { ...probePolicy(), probeMethodNames: ['readScheduledTierUpdateSafeRows', 'readWalletRows'] } }],
    [
      'missing disabled method blocks',
      {
        disabledImplementation: disabledImplementation({
          adapterMethods: {
            ...disabledImplementation().adapterMethods,
            readJobRunSafeRows: undefined as never
          }
        })
      }
    ],
    [
      'disabled method throwing raw error blocks',
      {
        disabledImplementation: disabledImplementation({
          adapterMethods: {
            ...disabledImplementation().adapterMethods,
            readJobRunSafeRows: () => {
              throw new Error('raw failure');
            }
          }
        })
      }
    ],
    [
      'disabled method returning rows blocks',
      {
        disabledImplementation: disabledImplementation({
          adapterMethods: {
            ...disabledImplementation().adapterMethods,
            readJobRunSafeRows: () => ({
              ...disabledResult('readJobRunSafeRows'),
              rowCount: 1 as unknown as 0,
              rows: [{}] as unknown as []
            })
          }
        })
      }
    ],
    [
      'disabled method returning actualDbQueryEnabled true blocks',
      {
        disabledImplementation: disabledImplementation({
          adapterMethods: {
            ...disabledImplementation().adapterMethods,
            readJobRunSafeRows: () => ({ ...disabledResult('readJobRunSafeRows'), actualDbQueryEnabled: true as false })
          }
        })
      }
    ],
    [
      'disabled method returning readinessClaim runtime_ready blocks',
      {
        disabledImplementation: disabledImplementation({
          adapterMethods: {
            ...disabledImplementation().adapterMethods,
            readJobRunSafeRows: () => ({ ...disabledResult('readJobRunSafeRows'), readinessClaim: 'runtime_ready' as 'none' })
          }
        })
      }
    ],
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
    const probe = buildProbe(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbeInput>);

    expect(probe.status).toBe('BLOCKED');
    expect(probe.blockerCount).toBeGreaterThan(0);
  });

  it('methodResultsSummary is compact and contains disabled safe results only', () => {
    const probe = buildProbe();

    expect(Object.keys(probe.methodResultsSummary)).toHaveLength(4);
    for (const result of Object.values(probe.methodResultsSummary)) {
      expect(result.status).toBe('DISABLED');
      expect(result.rowCount).toBe(0);
      expect(result.actualDbQueryEnabled).toBe(false);
      expect(result.readinessClaim).toBe('none');
      expect(result.safeSummaryOnly).toBe(true);
    }
  });

  it('keeps nextSafeAction singular and safeSummaryOnly true', () => {
    const probe = buildProbe();

    expect(typeof probe.nextSafeAction).toBe('string');
    expect(probe.nextSafeAction.split(',')).toHaveLength(1);
    expect(probe.safeSummaryOnly).toBe(true);
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
