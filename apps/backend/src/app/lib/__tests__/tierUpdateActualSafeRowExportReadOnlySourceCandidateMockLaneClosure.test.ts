import fs from 'fs';
import path from 'path';
import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosure
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosure';
import type {
  BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosure';

const sourceHeadSha = 'source-head-safe';

const readyStatuses = {
  d8z: 'FIXTURE_VERIFIER_READY',
  d8aa: 'SOURCE_CANDIDATE_REVIEW_PACKET_READY',
  d8ab: 'SOURCE_CANDIDATE_REVIEW_DECISION_READY',
  d8ac: 'SOURCE_ACCESS_PLAN_BOUNDARY_READY',
  d8ad: 'SOURCE_ACCESS_PLAN_BOUNDARY_READY',
  d8ae: 'SOURCE_CANDIDATE_MOCK_PLAN_READY',
  d8af: 'SOURCE_CANDIDATE_MOCK_PLAN_VERIFIER_READY',
  d8ag: 'SOURCE_CANDIDATE_MOCK_REVIEW_PACKET_READY',
  d8ah: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_GATE_READY',
  d8ai: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_VERIFIER_READY',
  d8aj: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_READY',
  d8ak: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_VERIFIER_READY',
  d8al: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_READY',
  d8am: 'SOURCE_CANDIDATE_MOCK_REVIEW_DECISION_PACKET_SUMMARY_VERIFIER_READY'
} as const;

const upstreamInputs = Object.fromEntries(
  Object.entries(readyStatuses).map(([key, status]) => [
    key,
    {
      status,
      kind: `${key}_kind_safe`,
      traceLabel: `${key}_trace_safe`,
      sourceHeadSha,
      blockers: [],
      needsReviewReasons: []
    }
  ])
) as Pick<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput, keyof typeof readyStatuses>;

const notAuthorizedActions = [
  'actual_db_query',
  'actual_db_export',
  'source_access',
  'prisma_client',
  'database_url_read',
  'env_read',
  'network_rpc_wallet_contract_tx_access',
  'file_export',
  'jsonl_file_export',
  'artifact_upload',
  'docker_smoke_change',
  'staging_no_tx_pass',
  'runtime_readiness',
  'production_readiness'
];

const baseInput = (): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput => ({
  closureId: 'mock-lane-closure-safe-1',
  sourceHeadSha,
  ...upstreamInputs,
  mockOnlyVerified: true,
  zeroRealRowsVerified: true,
  noActualAccessVerified: true,
  noDbQueryVerified: true,
  noDbExportVerified: true,
  noPrismaVerified: true,
  noDatabaseUrlReadVerified: true,
  noEnvReadVerified: true,
  noNetworkRpcWalletContractTxVerified: true,
  noFileExportVerified: true,
  noJsonlFileExportVerified: true,
  noArtifactUploadVerified: true,
  noDockerSmokeChangeVerified: true,
  noStagingNoTxPassVerified: true,
  noRuntimeReadinessVerified: true,
  noProductionReadinessVerified: true,
  sameHeadRequirementPreserved: true,
  futureOwnerScopeRequired: true,
  mockLaneSummary: 'mock lane closure only',
  handoffBoundaryLabels: [
    'mock_lane_closed',
    'd8ao_requires_new_owner_scope',
    'safe_summary_jsonl_fixture_schema_only',
    'no_actual_access'
  ],
  notAuthorizedActions,
  requiredPreconditions: [
    'new_owner_scope_before_d8ao',
    'same_head_remote_quality_gate_required'
  ],
  closureChecklist: [
    'confirm no actual access',
    'confirm no db',
    'confirm no export',
    'confirm no runtime readiness'
  ],
  nextSafeAction: 'prepare_pr_d8ao_safe_summary_jsonl_fixture_schema'
});

const build = (overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput> = {}) => (
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosure({
    ...baseInput(),
    ...overrides
  })
);

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosure', () => {
  it('returns SOURCE_CANDIDATE_MOCK_LANE_CLOSED for a valid D8Z-D8AM chain', () => {
    const result = build();

    expect(result.status).toBe('SOURCE_CANDIDATE_MOCK_LANE_CLOSED');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_mock_lane_closure');
    expect(result.traceLabel).toBe('d8an_actual_safe_row_export_read_only_source_candidate_mock_lane_closure');
    expect(result.upstreamReadyCount).toBe(14);
    expect(result.upstreamExpectedCount).toBe(14);
    expect(result.upstreamHeadConsistency).toBe('consistent');
    expect(result.mockLaneClosed).toBe(true);
    expect(result.nextSafeAction).toBe('prepare_pr_d8ao_safe_summary_jsonl_fixture_schema');
  });

  it('ready result recommends D8AO only and does not authorize source, DB, export, or runtime readiness', () => {
    const result = build();

    expect(result.boundarySummary.actualDbQueryEnabled).toBe(false);
    expect(result.boundarySummary.actualDbExportEnabled).toBe(false);
    expect(result.boundarySummary.realDbQueryEnabled).toBe(false);
    expect(result.boundarySummary.sourceAccessEnabled).toBe(false);
    expect(result.boundarySummary.prismaClientEnabled).toBe(false);
    expect(result.boundarySummary.databaseUrlReadEnabled).toBe(false);
    expect(result.boundarySummary.envReadEnabled).toBe(false);
    expect(result.boundarySummary.networkAccessEnabled).toBe(false);
    expect(result.boundarySummary.rpcAccessEnabled).toBe(false);
    expect(result.boundarySummary.walletAccessEnabled).toBe(false);
    expect(result.boundarySummary.contractAccessEnabled).toBe(false);
    expect(result.boundarySummary.txSendEnabled).toBe(false);
    expect(result.boundarySummary.fileExportEnabled).toBe(false);
    expect(result.boundarySummary.jsonlFileExportEnabled).toBe(false);
    expect(result.boundarySummary.artifactUploadEnabled).toBe(false);
    expect(result.boundarySummary.dockerSmokeChanged).toBe(false);
    expect(result.boundarySummary.stagingNoTxPassClaimed).toBe(false);
    expect(result.boundarySummary.runtimeReadinessClaimed).toBe(false);
    expect(result.boundarySummary.productionReadinessClaimed).toBe(false);
  });

  it.each(Object.keys(readyStatuses))('blocks missing upstream status %s', (key) => {
    const result = build({ [`${key}Status`]: null, [key]: null } as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput>);

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('repair_mock_lane_upstream_status');
  });

  it.each(Object.keys(readyStatuses))('blocks non-ready upstream status %s', (key) => {
    const result = build({ [`${key}Status`]: 'BLOCKED' } as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput>);

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('repair_mock_lane_upstream_status');
  });

  it.each([
    ['closureId missing', { closureId: null }],
    ['sourceHeadSha missing', { sourceHeadSha: null }],
    ['mockOnly false', { mockOnlyVerified: false }],
    ['zeroRealRows false', { zeroRealRowsVerified: false }],
    ['noActualAccess false', { noActualAccessVerified: false }],
    ['noDbQuery false', { noDbQueryVerified: false }],
    ['noDbExport false', { noDbExportVerified: false }],
    ['noPrisma false', { noPrismaVerified: false }],
    ['noDatabaseUrlRead false', { noDatabaseUrlReadVerified: false }],
    ['noEnvRead false', { noEnvReadVerified: false }],
    ['noNetworkRpcWalletContractTx false', { noNetworkRpcWalletContractTxVerified: false }],
    ['noFileExport false', { noFileExportVerified: false }],
    ['noJsonlFileExport false', { noJsonlFileExportVerified: false }],
    ['noArtifactUpload false', { noArtifactUploadVerified: false }],
    ['noDockerSmoke false', { noDockerSmokeChangeVerified: false }],
    ['noStagingNoTxPass false', { noStagingNoTxPassVerified: false }],
    ['noRuntimeReadiness false', { noRuntimeReadinessVerified: false }],
    ['noProductionReadiness false', { noProductionReadinessVerified: false }],
    ['sameHead false', { sameHeadRequirementPreserved: false }],
    ['futureOwnerScope false', { futureOwnerScopeRequired: false }],
    ['actual DB query flag', { actualDbQueryEnabled: true }],
    ['actual DB export flag', { actualDbExportEnabled: true }],
    ['real DB query flag', { realDbQueryEnabled: true }],
    ['source access flag', { sourceAccessEnabled: true }],
    ['Prisma flag', { prismaClientEnabled: true }],
    ['DATABASE_URL flag', { databaseUrlReadEnabled: true }],
    ['env flag', { envReadEnabled: true }],
    ['network flag', { networkAccessEnabled: true }],
    ['RPC flag', { rpcAccessEnabled: true }],
    ['wallet flag', { walletAccessEnabled: true }],
    ['contract flag', { contractAccessEnabled: true }],
    ['tx flag', { txSendEnabled: true }],
    ['file export flag', { fileExportEnabled: true }],
    ['JSONL export flag', { jsonlFileExportEnabled: true }],
    ['artifact upload flag', { artifactUploadEnabled: true }],
    ['Docker smoke flag', { dockerSmokeChanged: true }],
    ['staging no-tx flag', { stagingNoTxPassClaimed: true }],
    ['runtime readiness flag', { runtimeReadinessClaimed: true }],
    ['production readiness flag', { productionReadinessClaimed: true }],
    ['handoff labels missing', { handoffBoundaryLabels: [] }],
    ['not authorized missing', { notAuthorizedActions: [] }],
    ['owner scope precondition missing', { requiredPreconditions: ['same_head_remote_quality_gate_required'] }],
    ['same head precondition missing', { requiredPreconditions: ['new_owner_scope_before_d8ao'] }],
    ['checklist no actual access missing', { closureChecklist: ['confirm no db', 'confirm no export', 'confirm no runtime readiness'] }],
    ['checklist no db missing', { closureChecklist: ['confirm no actual access', 'confirm no export', 'confirm no runtime readiness'] }],
    ['checklist no export missing', { closureChecklist: ['confirm no actual access', 'confirm no db', 'confirm no runtime readiness'] }],
    ['checklist no runtime readiness missing', { closureChecklist: ['confirm no actual access', 'confirm no db', 'confirm no export'] }],
    ['multiple next actions', { nextSafeAction: 'prepare_pr_d8ao_safe_summary_jsonl_fixture_schema,actual_source_access' }],
    ['actual source next action', { nextSafeAction: 'actual_source_access' }],
    ['upstream blocker', { d8am: { ...upstreamInputs.d8am, blockers: ['upstream_blocker'] } }],
    ['raw secret label', { closureId: 'raw-secret-closure' }],
    ['raw env label', { closureId: 'raw_env_closure' }],
    ['raw log label', { closureId: 'raw_log_closure' }],
    ['raw payload label', { closureId: 'raw_payload_closure' }],
    ['raw endpoint label', { closureId: 'raw_endpoint_closure' }],
    ['private path label', { closureId: 'private_path_closure' }],
    ['local path label', { closureId: 'local_path_closure' }],
    ['readiness overclaim', { closureId: 'runtime_ready_closure' }]
  ])('blocks %s', (_label, overrides) => {
    expect(build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput>).status).toBe('BLOCKED');
  });

  it.each([
    ['historic upstream head unknown', { d8z: { ...upstreamInputs.d8z, sourceHeadSha: null } }],
    ['safe summary wording incomplete', { needsReviewReasons: ['safe_summary_wording_incomplete'] }],
    ['deferred entity isolated', { deferredEntityTypes: ['Prize'] }]
  ])('returns NEEDS_REVIEW for %s', (_label, overrides) => {
    const result = build(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosureInput>);

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.nextSafeAction).toBe('collect_operator_mock_lane_closure_review');
  });

  it('blocks load-bearing upstream head mismatch', () => {
    const result = build({ d8am: { ...upstreamInputs.d8am, sourceHeadSha: 'other-head' } });

    expect(result.status).toBe('BLOCKED');
    expect(result.upstreamHeadConsistency).toBe('blocked');
    expect(result.nextSafeAction).toBe('resolve_mock_lane_source_head_mismatch');
  });

  it('keeps nextSafeAction singular', () => {
    expect(build().nextSafeAction).not.toContain(',');
  });

  it('source file does not import Prisma, read env, touch filesystem, or call network', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'tierUpdateActualSafeRowExportReadOnlySourceCandidateMockLaneClosure.ts'),
      'utf8'
    );

    expect(source).not.toContain('@prisma/client');
    expect(source).not.toContain('PrismaClient');
    expect(source).not.toContain('process.env');
    expect(source).not.toContain('process.');
    expect(source).not.toContain('fs.');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('createWriteStream');
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('axios');
    expect(source).not.toContain('ethers');
  });
});
