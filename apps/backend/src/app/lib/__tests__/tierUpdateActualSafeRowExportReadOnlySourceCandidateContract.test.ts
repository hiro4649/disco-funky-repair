import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateContract,
  type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateContract';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-13T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateActualSafeRowExportReadOnlySourceCandidateContract.ts'
);
const requiredMetadataFields = [
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
];
const requiredCapabilities = [
  'returns_safe_summary_rows',
  'requires_same_head_evidence',
  'requires_operator_approval',
  'execution_disabled_by_default',
  'forbidden_field_policy_enforced',
  'safe_row_schema_policy_enforced'
];

const realSourceGate = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate> = {}
): TierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate => ({
  gateKind: 'tier_update_actual_safe_row_export_read_only_adapter_real_source_gate',
  schemaVersion: '1',
  status: 'REAL_SOURCE_GATE_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8v_actual_safe_row_export_read_only_adapter_real_source_gate',
  noopExecutionProbeStatus: 'NOOP_PROBE_READY',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  realSourceCandidateKind: 'disabled_real_source_candidate',
  sourceEvidencePolicyStatus: 'present',
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
  nextSafeAction: 'prepare_pr_d8w_actual_safe_row_export_read_only_source_candidate_contract',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput => ({
  realSourceGate: realSourceGate(),
  sourceCandidateContractSpec: {
    contractDisabled: true,
    sourceAccessEnabled: false,
    actualDbQueryEnabled: false
  },
  requestedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  sourceCandidateKind: 'disabled_real_source_candidate',
  sourceCapabilityPolicy: {
    capabilities: requiredCapabilities
  },
  safeRowSchemaPolicy: {
    policyId: 'safe-row-schema-policy',
    requiredMetadataFields
  },
  forbiddenFieldPolicy: {
    policyId: 'forbidden-field-policy',
    forbiddenFields: ['private_key', 'raw_payload', 'authorization_header']
  },
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'source_candidate_contract_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  runKey: 'run-safe-summary',
  operatorId: 'operator-safe-summary',
  reviewerId: 'reviewer-safe-summary',
  ...overrides
});

const buildContract = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlySourceCandidateContract(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateContract', () => {
  it('returns SOURCE_CANDIDATE_CONTRACT_READY for a safe D8V gate, contract, and approval', () => {
    const contract = buildContract();

    expect(contract.contractKind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_contract');
    expect(contract.schemaVersion).toBe('1');
    expect(contract.status).toBe('SOURCE_CANDIDATE_CONTRACT_READY');
    expect(contract.safeSummaryOnly).toBe(true);
    expect(contract.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(contract.traceLabel).toBe('d8w_actual_safe_row_export_read_only_source_candidate_contract');
    expect(contract.realSourceGateStatus).toBe('REAL_SOURCE_GATE_READY');
    expect(contract.sourceCandidateKind).toBe('disabled_real_source_candidate');
    expect(contract.nextSafeAction).toBe(
      'prepare_pr_d8x_actual_safe_row_export_read_only_source_candidate_disabled_probe'
    );
  });

  it('keeps SOURCE_CANDIDATE_CONTRACT_READY separate from export, query, staging, runtime, and production readiness', () => {
    const contract = buildContract();

    expect(contract.readinessClaim).toBe('none');
    expect(contract.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(contract.actualDbQueryEnabled).toBe(false);
    expect(contract.actualDbExportEnabled).toBe(false);
    expect(contract.prismaClientEnabled).toBe(false);
    expect(contract.databaseUrlReadEnabled).toBe(false);
    expect(contract.envReadEnabled).toBe(false);
    expect(contract.networkAccessEnabled).toBe(false);
    expect(contract.rpcAccessEnabled).toBe(false);
    expect(contract.walletAccessEnabled).toBe(false);
    expect(contract.contractAccessEnabled).toBe(false);
    expect(contract.txSendEnabled).toBe(false);
    expect(contract.fileExportEnabled).toBe(false);
    expect(contract.artifactUploadEnabled).toBe(false);
    expect(contract.dockerSmokeChanged).toBe(false);
    expect(contract.stagingNoTxPassClaimed).toBe(false);
    expect(contract.runtimeReadinessClaimed).toBe(false);
    expect(contract.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing realSourceGate blocks', { realSourceGate: null }, 'BLOCKED', 'build_actual_safe_row_export_read_only_adapter_real_source_gate'],
    [
      'realSourceGate BLOCKED blocks',
      { realSourceGate: realSourceGate({ status: 'BLOCKED' }) },
      'BLOCKED',
      'build_actual_safe_row_export_read_only_adapter_real_source_gate'
    ],
    [
      'realSourceGate NEEDS_REVIEW gives NEEDS_REVIEW',
      { realSourceGate: realSourceGate({ status: 'NEEDS_REVIEW' }) },
      'NEEDS_REVIEW',
      'collect_operator_source_candidate_contract_approval'
    ],
    ['requestedEntities empty gives NEEDS_REVIEW', { requestedEntities: [] }, 'NEEDS_REVIEW', 'collect_operator_source_candidate_contract_approval'],
    ['missing sourceCandidateKind gives NEEDS_REVIEW', { sourceCandidateKind: null }, 'NEEDS_REVIEW', 'collect_operator_source_candidate_contract_approval'],
    ['operator approval pending gives NEEDS_REVIEW', { operatorApproval: { required: true, status: 'pending' } }, 'NEEDS_REVIEW', 'collect_operator_source_candidate_contract_approval'],
    [
      'operator approval real_source_gate_approved gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'real_source_gate_approved' } },
      'NEEDS_REVIEW',
      'collect_operator_source_candidate_contract_approval'
    ]
  ])('%s', (_name, overrides, status, nextSafeAction) => {
    const contract = buildContract(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput>);

    expect(contract.status).toBe(status);
    expect(contract.nextSafeAction).toBe(nextSafeAction);
  });

  it.each([
    ['missing sourceCandidateContractSpec blocks', { sourceCandidateContractSpec: null }],
    ['unsupported requested entity blocks', { requestedEntities: ['scheduled_tier_update', 'unknown_entity'] }],
    ['Prize blocks', { requestedEntities: ['Prize'] }],
    ['PrizeTransactions blocks', { requestedEntities: ['PrizeTransactions'] }],
    ['NFT metadata blocks', { requestedEntities: ['NFT metadata'] }],
    ['TokenDetail blocks', { requestedEntities: ['TokenDetail'] }],
    ['TicketCode blocks', { requestedEntities: ['TicketCode'] }],
    ['unsupported sourceCandidateKind blocks', { sourceCandidateKind: 'unknown_source_candidate' }],
    ['sourceCandidateKind prisma_client blocks', { sourceCandidateKind: 'prisma_client' }],
    ['sourceCandidateKind database_url blocks', { sourceCandidateKind: 'database_url' }],
    ['sourceCandidateKind raw_sql blocks', { sourceCandidateKind: 'raw_sql' }],
    ['sourceCandidateKind transactional_writer blocks', { sourceCandidateKind: 'transactional_writer' }],
    ['sourceCandidateKind runtime_worker blocks', { sourceCandidateKind: 'runtime_worker' }],
    ['sourceCandidateKind http_route blocks', { sourceCandidateKind: 'http_route' }],
    ['sourceCandidateKind cli_runner blocks', { sourceCandidateKind: 'cli_runner' }],
    ['sourceCandidateKind cron_job blocks', { sourceCandidateKind: 'cron_job' }],
    ['sourceCandidateKind tracking_service blocks', { sourceCandidateKind: 'tracking_service' }],
    ['sourceCandidateKind wallet_provider blocks', { sourceCandidateKind: 'wallet_provider' }],
    ['sourceCandidateKind contract_sender blocks', { sourceCandidateKind: 'contract_sender' }],
    ['sourceCandidateKind tx_sender blocks', { sourceCandidateKind: 'tx_sender' }],
    ['sourceCandidateKind file_exporter blocks', { sourceCandidateKind: 'file_exporter' }],
    ['sourceCandidateKind artifact_uploader blocks', { sourceCandidateKind: 'artifact_uploader' }],
    ['sourceCandidateKind external_network_source blocks', { sourceCandidateKind: 'external_network_source' }],
    ['sourceCandidateKind secret_env_source blocks', { sourceCandidateKind: 'secret_env_source' }],
    ['sourceCapabilityPolicy missing blocks', { sourceCapabilityPolicy: null }],
    ['safeRowSchemaPolicy missing blocks', { safeRowSchemaPolicy: null }],
    ['forbiddenFieldPolicy missing blocks', { forbiddenFieldPolicy: null }],
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
    const contract = buildContract(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateContractInput>);

    expect(contract.status).toBe('BLOCKED');
    expect(contract.blockerCount).toBeGreaterThan(0);
  });

  it.each(requiredCapabilities)('sourceCapabilityPolicy missing %s blocks', (capability) => {
    const contract = buildContract({
      sourceCapabilityPolicy: {
        capabilities: requiredCapabilities.filter((candidateCapability) => candidateCapability !== capability)
      }
    });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.nextSafeAction).toBe('add_source_capability_policy');
  });

  it.each([
    'executes_query',
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
    'claims_runtime_ready',
    'claims_staging_ready',
    'claims_production_ready'
  ])('sourceCapabilityPolicy forbidden %s blocks', (capability) => {
    const contract = buildContract({
      sourceCapabilityPolicy: {
        capabilities: [...requiredCapabilities, capability]
      }
    });

    expect(contract.status).toBe('BLOCKED');
    expect(contract.nextSafeAction).toBe('remove_forbidden_candidate_capability');
  });

  it('keeps nextSafeAction singular and safeSummaryOnly true', () => {
    const contract = buildContract();

    expect(typeof contract.nextSafeAction).toBe('string');
    expect(contract.nextSafeAction.split(',')).toHaveLength(1);
    expect(contract.safeSummaryOnly).toBe(true);
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
