import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS,
  type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape';
import type {
  TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-14T00:00:00.000Z';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape.ts'
);
const requestedEntities = ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'];
const allowedOptionalFields = [
  'checkpoint_summary',
  'tx_hash_summary',
  'tx_chain_id',
  'safe_summary',
  'operator_id_summary',
  'reviewer_id_summary',
  'run_key_summary'
];

const sourceCandidateDisabledProbe = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe> = {}
): TierUpdateActualSafeRowExportReadOnlySourceCandidateDisabledProbe => ({
  probeKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_disabled_probe',
  schemaVersion: '1',
  status: 'SOURCE_CANDIDATE_DISABLED_PROBE_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8x_actual_safe_row_export_read_only_source_candidate_disabled_probe',
  sourceCandidateContractStatus: 'SOURCE_CANDIDATE_CONTRACT_READY',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  candidateProbeKind: 'disabled_noop_source_candidate_probe',
  disabledProbePolicyStatus: 'present',
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
  probeResultsSummary: {
    contractShapeInspected: true,
    allowedEntitiesInspected: true,
    executionDisabledConfirmed: true,
    safeSummaryOnly: true
  },
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
  nextSafeAction: 'prepare_pr_d8y_actual_safe_row_export_read_only_source_candidate_safe_summary_shape',
  ...overrides
});

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput => ({
  sourceCandidateDisabledProbe: sourceCandidateDisabledProbe(),
  safeSummaryShapeSpec: {
    shapeDisabled: true,
    sourceAccessEnabled: false,
    actualDbQueryEnabled: false,
    jsonlFileExportEnabled: false
  },
  requestedEntities,
  shapeVersion: 'd8y.safe-summary-shape.v1',
  requiredFieldPolicy: {
    policyId: 'required-safe-summary-fields',
    requiredFieldNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS]
  },
  forbiddenFieldPolicy: {
    policyId: 'forbidden-safe-summary-fields',
    forbiddenFieldNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS]
  },
  entityShapePolicy: {
    policyId: 'allowed-entity-safe-summary-fields',
    entityShapes: requestedEntities.map((entityType) => ({
      entityType,
      fieldNames: [
        ...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS,
        ...allowedOptionalFields
      ]
    }))
  },
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'safe_summary_shape_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  runKey: 'run-safe-summary-shape',
  operatorId: 'operator-safe-summary-shape',
  reviewerId: 'reviewer-safe-summary-shape',
  ...overrides
});

const buildShape = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape', () => {
  it('returns SAFE_SUMMARY_SHAPE_READY for a safe D8X probe, shape spec, and approval', () => {
    const shape = buildShape();

    expect(shape.shapeKind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_safe_summary_shape');
    expect(shape.schemaVersion).toBe('1');
    expect(shape.status).toBe('SAFE_SUMMARY_SHAPE_READY');
    expect(shape.safeSummaryOnly).toBe(true);
    expect(shape.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(shape.traceLabel).toBe('d8y_actual_safe_row_export_read_only_source_candidate_safe_summary_shape');
    expect(shape.sourceCandidateDisabledProbeStatus).toBe('SOURCE_CANDIDATE_DISABLED_PROBE_READY');
    expect(shape.shapeVersion).toBe('d8y.safe-summary-shape.v1');
    expect(shape.nextSafeAction).toBe(
      'prepare_pr_d8z_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture'
    );
  });

  it('keeps SAFE_SUMMARY_SHAPE_READY separate from export, query, JSONL, staging, runtime, and production readiness', () => {
    const shape = buildShape();

    expect(shape.readinessClaim).toBe('none');
    expect(shape.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(shape.actualDbQueryEnabled).toBe(false);
    expect(shape.actualDbExportEnabled).toBe(false);
    expect(shape.prismaClientEnabled).toBe(false);
    expect(shape.databaseUrlReadEnabled).toBe(false);
    expect(shape.envReadEnabled).toBe(false);
    expect(shape.networkAccessEnabled).toBe(false);
    expect(shape.rpcAccessEnabled).toBe(false);
    expect(shape.walletAccessEnabled).toBe(false);
    expect(shape.contractAccessEnabled).toBe(false);
    expect(shape.txSendEnabled).toBe(false);
    expect(shape.fileExportEnabled).toBe(false);
    expect(shape.jsonlFileExportEnabled).toBe(false);
    expect(shape.artifactUploadEnabled).toBe(false);
    expect(shape.dockerSmokeChanged).toBe(false);
    expect(shape.stagingNoTxPassClaimed).toBe(false);
    expect(shape.runtimeReadinessClaimed).toBe(false);
    expect(shape.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing sourceCandidateDisabledProbe blocks', { sourceCandidateDisabledProbe: null }, 'BLOCKED', 'build_actual_safe_row_export_read_only_source_candidate_disabled_probe'],
    [
      'sourceCandidateDisabledProbe BLOCKED blocks',
      { sourceCandidateDisabledProbe: sourceCandidateDisabledProbe({ status: 'BLOCKED' }) },
      'BLOCKED',
      'build_actual_safe_row_export_read_only_source_candidate_disabled_probe'
    ],
    [
      'sourceCandidateDisabledProbe NEEDS_REVIEW gives NEEDS_REVIEW',
      { sourceCandidateDisabledProbe: sourceCandidateDisabledProbe({ status: 'NEEDS_REVIEW' }) },
      'NEEDS_REVIEW',
      'collect_operator_safe_summary_shape_approval'
    ],
    ['requestedEntities empty gives NEEDS_REVIEW', { requestedEntities: [] }, 'NEEDS_REVIEW', 'collect_operator_safe_summary_shape_approval'],
    ['operator approval pending gives NEEDS_REVIEW', { operatorApproval: { required: true, status: 'pending' } }, 'NEEDS_REVIEW', 'collect_operator_safe_summary_shape_approval'],
    [
      'operator approval source_candidate_disabled_probe_approved gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'source_candidate_disabled_probe_approved' } },
      'NEEDS_REVIEW',
      'collect_operator_safe_summary_shape_approval'
    ]
  ])('%s', (_name, overrides, status, nextSafeAction) => {
    const shape = buildShape(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput>);

    expect(shape.status).toBe(status);
    expect(shape.nextSafeAction).toBe(nextSafeAction);
  });

  it.each([
    ['missing safeSummaryShapeSpec blocks', { safeSummaryShapeSpec: null }, 'provide_safe_summary_shape_spec'],
    ['missing shapeVersion blocks', { shapeVersion: null }, 'add_safe_summary_shape_version'],
    ['unsupported requested entity blocks', { requestedEntities: ['scheduled_tier_update', 'unknown_entity'] }, 'remove_unsupported_entity'],
    ['Prize blocks', { requestedEntities: ['Prize'] }, 'remove_unsupported_entity'],
    ['PrizeTransactions blocks', { requestedEntities: ['PrizeTransactions'] }, 'remove_unsupported_entity'],
    ['NFT metadata blocks', { requestedEntities: ['NFT metadata'] }, 'remove_unsupported_entity'],
    ['TokenDetail blocks', { requestedEntities: ['TokenDetail'] }, 'remove_unsupported_entity'],
    ['TicketCode blocks', { requestedEntities: ['TicketCode'] }, 'remove_unsupported_entity'],
    ['requiredFieldPolicy missing blocks', { requiredFieldPolicy: null }, 'add_required_field_policy'],
    ['forbiddenFieldPolicy missing blocks', { forbiddenFieldPolicy: null }, 'add_forbidden_field_policy'],
    ['entityShapePolicy missing blocks', { entityShapePolicy: null }, 'add_entity_shape_policy'],
    [
      'entityShapePolicy allowing deferred entity blocks',
      { entityShapePolicy: { policyId: 'entity-shape', entityShapes: [{ entityType: 'Prize', fieldNames: ['schema_version'] }] } },
      'remove_unsupported_entity'
    ],
    [
      'entityShapePolicy allowing raw field blocks',
      { entityShapePolicy: { policyId: 'entity-shape', entityShapes: [{ entityType: 'job_run', fieldNames: ['schema_version', 'rawDbRow'] }] } },
      'remove_forbidden_field_from_shape'
    ],
    ['same-head evidence not required blocks', { sameHeadEvidence: { required: false } }, 'collect_operator_safe_summary_shape_approval'],
    ['operator approval missing blocks', { operatorApproval: undefined }, 'collect_operator_safe_summary_shape_approval'],
    ['operator approval execution_approved blocks', { operatorApproval: { required: true, status: 'execution_approved' } }, 'collect_operator_safe_summary_shape_approval'],
    ['operator approval runtime_approved blocks', { operatorApproval: { required: true, status: 'runtime_approved' } }, 'collect_operator_safe_summary_shape_approval'],
    ['operator approval staging_ready blocks', { operatorApproval: { required: true, status: 'staging_ready' } }, 'collect_operator_safe_summary_shape_approval'],
    ['operator approval production_ready blocks', { operatorApproval: { required: true, status: 'production_ready' } }, 'collect_operator_safe_summary_shape_approval'],
    ['actualDbQueryEnabled true blocks', { actualDbQueryEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['actualDbExportEnabled true blocks', { actualDbExportEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['prismaClientEnabled true blocks', { prismaClientEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['databaseUrlReadEnabled true blocks', { databaseUrlReadEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['envReadEnabled true blocks', { envReadEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['networkAccessEnabled true blocks', { networkAccessEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['rpcAccessEnabled true blocks', { rpcAccessEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['walletAccessEnabled true blocks', { walletAccessEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['contractAccessEnabled true blocks', { contractAccessEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['txSendEnabled true blocks', { txSendEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['fileExportEnabled true blocks', { fileExportEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['jsonlFileExportEnabled true blocks', { jsonlFileExportEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['artifactUploadEnabled true blocks', { artifactUploadEnabled: true }, 'collect_operator_safe_summary_shape_approval'],
    ['dockerSmokeChanged true blocks', { dockerSmokeChanged: true }, 'collect_operator_safe_summary_shape_approval'],
    ['stagingNoTxPassClaimed true blocks', { stagingNoTxPassClaimed: true }, 'collect_operator_safe_summary_shape_approval'],
    ['runtimeReadinessClaimed true blocks', { runtimeReadinessClaimed: true }, 'collect_operator_safe_summary_shape_approval'],
    ['productionReadinessClaimed true blocks', { productionReadinessClaimed: true }, 'collect_operator_safe_summary_shape_approval']
  ])('%s', (_name, overrides, nextSafeAction) => {
    const shape = buildShape(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShapeInput>);

    expect(shape.status).toBe('BLOCKED');
    expect(shape.blockerCount).toBeGreaterThan(0);
    expect(shape.nextSafeAction).toBe(nextSafeAction);
  });

  it.each(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS)(
    'requiredFieldPolicy missing %s blocks',
    (requiredField) => {
      const shape = buildShape({
        requiredFieldPolicy: {
          policyId: 'required-safe-summary-fields',
          requiredFieldNames: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS
            .filter((field) => field !== requiredField)
        }
      });

      expect(shape.status).toBe('BLOCKED');
      expect(shape.nextSafeAction).toBe('add_required_field_policy');
    }
  );

  it.each([
    'rawDbRow',
    'rawCheckpoint',
    'rawTxHash',
    'rawReceiptPayload',
    'rawWallet',
    'fullWallet',
    'privateKey',
    'databaseUrl',
    'rpcUrl',
    'rawEnv',
    'rawLog',
    'authorizationHeader',
    'privatePath',
    'localImagePath'
  ])('forbiddenFieldPolicy missing %s blocks', (forbiddenField) => {
    const shape = buildShape({
      forbiddenFieldPolicy: {
        policyId: 'forbidden-safe-summary-fields',
        forbiddenFieldNames: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS
          .filter((field) => field !== forbiddenField)
      }
    });

    expect(shape.status).toBe('BLOCKED');
    expect(shape.nextSafeAction).toBe('add_forbidden_field_policy');
  });

  it('keeps shape summaries compact, nextSafeAction singular, and safeSummaryOnly true', () => {
    const shape = buildShape();

    expect(shape.requiredFieldNames).toContain('row_id');
    expect(shape.allowedOptionalFieldNames).toContain('tx_hash_summary');
    expect(shape.forbiddenFieldNames).toContain('rawDbRow');
    expect(shape.entityShapeSummaries).toHaveLength(4);
    expect(shape.entityShapeSummaries[0]).toEqual(
      expect.objectContaining({ safeSummaryOnly: true })
    );
    expect(typeof shape.nextSafeAction).toBe('string');
    expect(shape.nextSafeAction.split(',')).toHaveLength(1);
    expect(shape.safeSummaryOnly).toBe(true);
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
