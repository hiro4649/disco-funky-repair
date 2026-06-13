import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate,
  type BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate';
import type {
  TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe
} from '../tierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-13T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate.ts');
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

const noopExecutionProbe = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe> = {}
): TierUpdateActualSafeRowExportReadOnlyAdapterNoopExecutionProbe => ({
  probeKind: 'tier_update_actual_safe_row_export_read_only_adapter_noop_execution_probe',
  schemaVersion: '1',
  status: 'NOOP_PROBE_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8u_actual_safe_row_export_read_only_adapter_noop_execution_probe',
  disabledImplementationStatus: 'DISABLED_IMPLEMENTATION_READY',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  probedMethodNames: [
    'readScheduledTierUpdateSafeRows',
    'readJobRunSafeRows',
    'readTxReceiptEvidenceSafeRows',
    'readStagingEvidenceSafeRows'
  ],
  probeMethodCount: 4,
  probeResultCount: 4,
  disabledResultCount: 4,
  unexpectedRowResultCount: 0,
  forbiddenMethodCount: 0,
  compactForbiddenMethodCodes: [],
  probePolicyStatus: 'present',
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
  methodResultsSummary: {},
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
  nextSafeAction: 'prepare_pr_d8v_actual_safe_row_export_read_only_adapter_real_source_gate',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput => ({
  noopExecutionProbe: noopExecutionProbe(),
  sourceGateSpec: {
    gateDisabled: true,
    realSourceAccessEnabled: false,
    actualDbQueryEnabled: false
  },
  requestedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  realSourceCandidate: {
    kind: 'disabled_real_source_candidate',
    executionDisabled: true
  },
  sourceEvidencePolicy: {
    sourceHeadSha: SOURCE_HEAD_SHA,
    sourceHash: SOURCE_HASH,
    sameHeadRequired: true,
    schemaPolicyId: 'safe-row-schema-policy',
    forbiddenFieldPolicyId: 'forbidden-field-policy',
    operatorApprovalStatus: 'real_source_gate_approved',
    executionDisabled: true,
    databaseUrlReadEnabled: false,
    prismaClientEnabled: false,
    actualDbQueryEnabled: false,
    fileExportEnabled: false,
    artifactUploadEnabled: false,
    runtimeReadinessClaimed: false
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
  operatorApproval: { required: true, status: 'real_source_gate_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  runKey: 'run-safe-summary',
  operatorId: 'operator-safe-summary',
  reviewerId: 'reviewer-safe-summary',
  ...overrides
});

const buildGate = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGate', () => {
  it('returns REAL_SOURCE_GATE_READY for a safe D8U noop probe, source gate spec, and approval', () => {
    const gate = buildGate();

    expect(gate.gateKind).toBe('tier_update_actual_safe_row_export_read_only_adapter_real_source_gate');
    expect(gate.schemaVersion).toBe('1');
    expect(gate.status).toBe('REAL_SOURCE_GATE_READY');
    expect(gate.safeSummaryOnly).toBe(true);
    expect(gate.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(gate.traceLabel).toBe('d8v_actual_safe_row_export_read_only_adapter_real_source_gate');
    expect(gate.noopExecutionProbeStatus).toBe('NOOP_PROBE_READY');
    expect(gate.realSourceCandidateKind).toBe('disabled_real_source_candidate');
    expect(gate.nextSafeAction).toBe('prepare_pr_d8w_actual_safe_row_export_read_only_source_candidate_contract');
  });

  it('keeps REAL_SOURCE_GATE_READY separate from export, query, staging, runtime, and production readiness', () => {
    const gate = buildGate();

    expect(gate.readinessClaim).toBe('none');
    expect(gate.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(gate.actualDbQueryEnabled).toBe(false);
    expect(gate.actualDbExportEnabled).toBe(false);
    expect(gate.prismaClientEnabled).toBe(false);
    expect(gate.databaseUrlReadEnabled).toBe(false);
    expect(gate.envReadEnabled).toBe(false);
    expect(gate.networkAccessEnabled).toBe(false);
    expect(gate.rpcAccessEnabled).toBe(false);
    expect(gate.walletAccessEnabled).toBe(false);
    expect(gate.contractAccessEnabled).toBe(false);
    expect(gate.txSendEnabled).toBe(false);
    expect(gate.fileExportEnabled).toBe(false);
    expect(gate.artifactUploadEnabled).toBe(false);
    expect(gate.dockerSmokeChanged).toBe(false);
    expect(gate.stagingNoTxPassClaimed).toBe(false);
    expect(gate.runtimeReadinessClaimed).toBe(false);
    expect(gate.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing noopExecutionProbe blocks', { noopExecutionProbe: null }, 'BLOCKED', 'build_actual_safe_row_export_read_only_adapter_noop_execution_probe'],
    [
      'noopExecutionProbe BLOCKED blocks',
      { noopExecutionProbe: noopExecutionProbe({ status: 'BLOCKED' }) },
      'BLOCKED',
      'build_actual_safe_row_export_read_only_adapter_noop_execution_probe'
    ],
    [
      'noopExecutionProbe NEEDS_REVIEW gives NEEDS_REVIEW',
      { noopExecutionProbe: noopExecutionProbe({ status: 'NEEDS_REVIEW' }) },
      'NEEDS_REVIEW',
      'collect_operator_real_source_gate_approval'
    ],
    ['requestedEntities empty gives NEEDS_REVIEW', { requestedEntities: [] }, 'NEEDS_REVIEW', 'collect_operator_real_source_gate_approval'],
    ['missing realSourceCandidate gives NEEDS_REVIEW', { realSourceCandidate: null }, 'NEEDS_REVIEW', 'provide_disabled_real_source_candidate'],
    ['operator approval pending gives NEEDS_REVIEW', { operatorApproval: { required: true, status: 'pending' } }, 'NEEDS_REVIEW', 'collect_operator_real_source_gate_approval'],
    [
      'operator approval noop_execution_probe_approved gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'noop_execution_probe_approved' } },
      'NEEDS_REVIEW',
      'collect_operator_real_source_gate_approval'
    ]
  ])('%s', (_name, overrides, status, nextSafeAction) => {
    const gate = buildGate(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput>);

    expect(gate.status).toBe(status);
    expect(gate.nextSafeAction).toBe(nextSafeAction);
  });

  it.each([
    ['missing sourceGateSpec blocks', { sourceGateSpec: null }],
    ['unsupported requested entity blocks', { requestedEntities: ['scheduled_tier_update', 'unknown_entity'] }],
    ['Prize blocks', { requestedEntities: ['Prize'] }],
    ['PrizeTransactions blocks', { requestedEntities: ['PrizeTransactions'] }],
    ['NFT metadata blocks', { requestedEntities: ['NFT metadata'] }],
    ['TokenDetail blocks', { requestedEntities: ['TokenDetail'] }],
    ['TicketCode blocks', { requestedEntities: ['TicketCode'] }],
    ['realSourceCandidate prisma_client blocks', { realSourceCandidate: { kind: 'prisma_client', executionDisabled: true } }],
    ['realSourceCandidate database_url blocks', { realSourceCandidate: { kind: 'database_url', executionDisabled: true } }],
    ['realSourceCandidate raw_sql blocks', { realSourceCandidate: { kind: 'raw_sql', executionDisabled: true } }],
    ['realSourceCandidate transactional_writer blocks', { realSourceCandidate: { kind: 'transactional_writer', executionDisabled: true } }],
    ['realSourceCandidate runtime_worker blocks', { realSourceCandidate: { kind: 'runtime_worker', executionDisabled: true } }],
    ['realSourceCandidate http_route blocks', { realSourceCandidate: { kind: 'http_route', executionDisabled: true } }],
    ['realSourceCandidate cli_runner blocks', { realSourceCandidate: { kind: 'cli_runner', executionDisabled: true } }],
    ['realSourceCandidate cron_job blocks', { realSourceCandidate: { kind: 'cron_job', executionDisabled: true } }],
    ['realSourceCandidate tracking_service blocks', { realSourceCandidate: { kind: 'tracking_service', executionDisabled: true } }],
    ['realSourceCandidate wallet_provider blocks', { realSourceCandidate: { kind: 'wallet_provider', executionDisabled: true } }],
    ['realSourceCandidate contract_sender blocks', { realSourceCandidate: { kind: 'contract_sender', executionDisabled: true } }],
    ['realSourceCandidate tx_sender blocks', { realSourceCandidate: { kind: 'tx_sender', executionDisabled: true } }],
    ['realSourceCandidate file_exporter blocks', { realSourceCandidate: { kind: 'file_exporter', executionDisabled: true } }],
    ['realSourceCandidate artifact_uploader blocks', { realSourceCandidate: { kind: 'artifact_uploader', executionDisabled: true } }],
    ['sourceEvidencePolicy missing blocks', { sourceEvidencePolicy: null }],
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
    const gate = buildGate(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlyAdapterRealSourceGateInput>);

    expect(gate.status).toBe('BLOCKED');
    expect(gate.blockerCount).toBeGreaterThan(0);
  });

  it('keeps nextSafeAction singular and safeSummaryOnly true', () => {
    const gate = buildGate();

    expect(typeof gate.nextSafeAction).toBe('string');
    expect(gate.nextSafeAction.split(',')).toHaveLength(1);
    expect(gate.safeSummaryOnly).toBe(true);
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
