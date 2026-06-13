import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe,
  type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe';
import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateContract
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateContract';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-14T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe.ts'
);
const requiredProbeCapabilities = [
  'inspect_contract_shape',
  'inspect_allowed_entities',
  'inspect_allowed_methods',
  'inspect_safe_row_schema_policy',
  'inspect_forbidden_field_policy',
  'confirm_execution_disabled',
  'confirm_same_head_required',
  'confirm_operator_approval_required'
];

const sourceCandidateContract = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlySourceCandidateContract> = {}
): TierUpdateActualSafeRowExportReadOnlySourceCandidateContract => ({
  contractKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_contract',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_CONTRACT_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8w_actual_safe_row_export_read_only_source_candidate_contract',
  realSourceGateStatus: 'REAL_SOURCE_GATE_READY',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  sourceCandidateKind: 'disabled_real_source_candidate',
  sourceCapabilityPolicyStatus: 'present',
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
  nextSafeAction: 'prepare_pr_d8x_actual_safe_row_export_read_only_source_candidate_disabled_probe',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput => ({
  sourceCandidateContract: sourceCandidateContract(),
  disabledProbeSpec: {
    probeDisabled: true,
    sourceAccessEnabled: false,
    actualDbQueryEnabled: false
  },
  requestedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  candidateProbeKind: 'disabled_noop_source_candidate_probe',
  disabledProbePolicy: {
    capabilities: requiredProbeCapabilities,
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
  },
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'source_candidate_disabled_probe_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  runKey: 'run-safe-summary',
  operatorId: 'operator-safe-summary',
  reviewerId: 'reviewer-safe-summary',
  ...overrides
});

const buildProbe = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe', () => {
  it('returns SOURCE_CANDIDATE_DISABLED_PROBE_READY for a safe D8W contract, disabled probe, and approval', () => {
    const probe = buildProbe();

    expect(probe.probeKind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_disabled_probe');
    expect(probe.schemaVersion).toBe('1');
    expect(probe.status).toBe('SOURCE_CANDIDATE_DISABLED_PROBE_READY');
    expect(probe.safeSummaryOnly).toBe(true);
    expect(probe.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(probe.traceLabel).toBe('d8x_actual_safe_row_export_read_only_source_candidate_disabled_probe');
    expect(probe.sourceCandidateContractStatus).toBe('SOURCE_CANDIDATE_CONTRACT_READY');
    expect(probe.candidateProbeKind).toBe('disabled_noop_source_candidate_probe');
    expect(probe.nextSafeAction).toBe(
      'prepare_pr_d8y_actual_safe_row_export_read_only_source_candidate_safe_summary_shape'
    );
  });

  it('keeps SOURCE_CANDIDATE_DISABLED_PROBE_READY separate from export, query, staging, runtime, and production readiness', () => {
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
    ['missing sourceCandidateContract blocks', { sourceCandidateContract: null }, 'BLOCKED', 'build_actual_safe_row_export_read_only_source_candidate_contract'],
    [
      'sourceCandidateContract BLOCKED blocks',
      { sourceCandidateContract: sourceCandidateContract({ status: 'BLOCKED' }) },
      'BLOCKED',
      'build_actual_safe_row_export_read_only_source_candidate_contract'
    ],
    [
      'sourceCandidateContract NEEDS_REVIEW gives NEEDS_REVIEW',
      { sourceCandidateContract: sourceCandidateContract({ status: 'NEEDS_REVIEW' }) },
      'NEEDS_REVIEW',
      'collect_operator_source_candidate_disabled_probe_approval'
    ],
    ['requestedEntities empty gives NEEDS_REVIEW', { requestedEntities: [] }, 'NEEDS_REVIEW', 'collect_operator_source_candidate_disabled_probe_approval'],
    ['missing candidateProbeKind gives NEEDS_REVIEW', { candidateProbeKind: null }, 'NEEDS_REVIEW', 'collect_operator_source_candidate_disabled_probe_approval'],
    ['operator approval pending gives NEEDS_REVIEW', { operatorApproval: { required: true, status: 'pending' } }, 'NEEDS_REVIEW', 'collect_operator_source_candidate_disabled_probe_approval'],
    [
      'operator approval source_candidate_contract_approved gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'source_candidate_contract_approved' } },
      'NEEDS_REVIEW',
      'collect_operator_source_candidate_disabled_probe_approval'
    ]
  ])('%s', (_name, overrides, status, nextSafeAction) => {
    const probe = buildProbe(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput>);

    expect(probe.status).toBe(status);
    expect(probe.nextSafeAction).toBe(nextSafeAction);
  });

  it.each([
    ['missing disabledProbeSpec blocks', { disabledProbeSpec: null }],
    ['unsupported requested entity blocks', { requestedEntities: ['scheduled_tier_update', 'unknown_entity'] }],
    ['Prize blocks', { requestedEntities: ['Prize'] }],
    ['PrizeTransactions blocks', { requestedEntities: ['PrizeTransactions'] }],
    ['NFT metadata blocks', { requestedEntities: ['NFT metadata'] }],
    ['TokenDetail blocks', { requestedEntities: ['TokenDetail'] }],
    ['TicketCode blocks', { requestedEntities: ['TicketCode'] }],
    ['unsupported candidateProbeKind blocks', { candidateProbeKind: 'unknown_probe' }],
    ['candidateProbeKind db_connect_probe blocks', { candidateProbeKind: 'db_connect_probe' }],
    ['candidateProbeKind prisma_probe blocks', { candidateProbeKind: 'prisma_probe' }],
    ['candidateProbeKind database_url_probe blocks', { candidateProbeKind: 'database_url_probe' }],
    ['candidateProbeKind raw_sql_probe blocks', { candidateProbeKind: 'raw_sql_probe' }],
    ['candidateProbeKind query_execution_probe blocks', { candidateProbeKind: 'query_execution_probe' }],
    ['candidateProbeKind runtime_worker_probe blocks', { candidateProbeKind: 'runtime_worker_probe' }],
    ['candidateProbeKind http_route_probe blocks', { candidateProbeKind: 'http_route_probe' }],
    ['candidateProbeKind cli_probe blocks', { candidateProbeKind: 'cli_probe' }],
    ['candidateProbeKind cron_probe blocks', { candidateProbeKind: 'cron_probe' }],
    ['candidateProbeKind tracking_service_probe blocks', { candidateProbeKind: 'tracking_service_probe' }],
    ['candidateProbeKind wallet_provider blocks', { candidateProbeKind: 'wallet_provider_probe' }],
    ['candidateProbeKind contract_sender blocks', { candidateProbeKind: 'contract_sender_probe' }],
    ['candidateProbeKind tx_sender blocks', { candidateProbeKind: 'tx_sender_probe' }],
    ['candidateProbeKind file_export_probe blocks', { candidateProbeKind: 'file_export_probe' }],
    ['candidateProbeKind artifact_upload_probe blocks', { candidateProbeKind: 'artifact_upload_probe' }],
    ['candidateProbeKind network_probe blocks', { candidateProbeKind: 'network_probe' }],
    ['candidateProbeKind env_probe blocks', { candidateProbeKind: 'env_probe' }],
    ['disabledProbePolicy missing blocks', { disabledProbePolicy: null }],
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
    const probe = buildProbe(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbeInput>);

    expect(probe.status).toBe('BLOCKED');
    expect(probe.blockerCount).toBeGreaterThan(0);
  });

  it.each([
    'inspect_contract_shape',
    'confirm_execution_disabled',
    'confirm_same_head_required',
    'confirm_operator_approval_required'
  ])('disabledProbePolicy missing %s blocks', (capability) => {
    const probe = buildProbe({
      disabledProbePolicy: {
        ...validInput().disabledProbePolicy,
        capabilities: requiredProbeCapabilities.filter((candidateCapability) => candidateCapability !== capability)
      }
    });

    expect(probe.status).toBe('BLOCKED');
    expect(probe.nextSafeAction).toBe('add_disabled_probe_policy');
  });

  it.each([
    'executes_query',
    'opens_connection',
    'reads_database_url',
    'imports_prisma',
    'reads_env',
    'writes_file',
    'uploads_artifact',
    'calls_network',
    'calls_rpc',
    'uses_wallet',
    'uses_contract',
    'sends_tx',
    'returns_db_rows',
    'returns_jsonl_file',
    'claims_runtime_ready',
    'claims_staging_ready',
    'claims_production_ready'
  ])('disabledProbePolicy forbidden %s blocks', (capability) => {
    const probe = buildProbe({
      disabledProbePolicy: {
        ...validInput().disabledProbePolicy,
        capabilities: [...requiredProbeCapabilities, capability]
      }
    });

    expect(probe.status).toBe('BLOCKED');
    expect(probe.nextSafeAction).toBe('remove_forbidden_probe_capability');
  });

  it('keeps probeResultsSummary compact, nextSafeAction singular, and safeSummaryOnly true', () => {
    const probe = buildProbe();

    expect(probe.probeResultsSummary).toEqual({
      contractShapeInspected: true,
      allowedEntitiesInspected: true,
      executionDisabledConfirmed: true,
      safeSummaryOnly: true
    });
    expect(typeof probe.nextSafeAction).toBe('string');
    expect(probe.nextSafeAction.split(',')).toHaveLength(1);
    expect(probe.safeSummaryOnly).toBe(true);
  });

  it('source does not import Prisma, read env, connect network, or write files', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client/);
    expect(source).not.toMatch(/new\s+PrismaClient/);
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/fs\./);
    expect(source).not.toMatch(/fetch\(/);
  });
});
