import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_FORBIDDEN_ORIGINS,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_ALLOWED_ORIGINS,
  type BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput,
  type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture';
import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_ALLOWED_OPTIONAL_FIELDS,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS,
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS,
  type TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape
} from '../tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = '2026-06-14T00:00:00.000Z';
const AUDIT_EXPORT_ID = 'audit-export-d8z-fixture';
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(
  backendRoot,
  'src/app/lib/tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture.ts'
);
const requestedEntities = ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'];

const safeSummaryShape = (
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape> = {}
): TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryShape => ({
  shapeKind: 'tier_update_actual_safe_row_export_read_only_source_candidate_safe_summary_shape',
  schemaVersion: '1',
  status: 'SAFE_SUMMARY_SHAPE_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8y_actual_safe_row_export_read_only_source_candidate_safe_summary_shape',
  sourceCandidateDisabledProbeStatus: 'SOURCE_CANDIDATE_DISABLED_PROBE_READY',
  shapeVersion: 'd8y.safe-summary-shape.v1',
  requestedEntitiesSummary: { requestedCount: 4, allowedCount: 4, safeSummaryOnly: true },
  allowedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  disallowedEntityCount: 0,
  requiredFieldPolicyStatus: 'present',
  forbiddenFieldPolicyStatus: 'present',
  entityShapePolicyStatus: 'present',
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
  jsonlFileExportEnabled: false,
  artifactUploadEnabled: false,
  dockerSmokeChanged: false,
  stagingNoTxPassClaimed: false,
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false,
  requiredFieldNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS],
  allowedOptionalFieldNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_ALLOWED_OPTIONAL_FIELDS],
  forbiddenFieldNames: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_FORBIDDEN_FIELDS],
  entityShapeSummaries: requestedEntities.map((entityType) => ({
    entityType,
    fieldCount: 16,
    safeSummaryOnly: true
  })),
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
  nextSafeAction: 'prepare_pr_d8z_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture',
  ...overrides
});

const fixtureRow = (
  entityType: string,
  rowId: string,
  overrides: Partial<TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow> = {}
): TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow => ({
  schema_version: '1',
  audit_export_id: AUDIT_EXPORT_ID,
  source_head_sha: SOURCE_HEAD_SHA,
  source_hash: SOURCE_HASH,
  exported_at: EXPORTED_AT,
  row_id: rowId,
  entity_type: entityType,
  source_table: entityType,
  status: 'fixture_safe_summary',
  evidence_origin: 'fixture',
  readiness_claim: 'none',
  safe_summary: `${entityType} fixture safe summary`,
  operator_id_summary: 'operator-summary',
  reviewer_id_summary: 'reviewer-summary',
  run_key_summary: 'run-summary',
  ...overrides
});

const fixtureRows = (): TierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureRow[] => (
  requestedEntities.map((entityType, index) => fixtureRow(entityType, `fixture-row-${index + 1}`))
);

const validInput = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput> = {}
): BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput => ({
  safeSummaryShape: safeSummaryShape(),
  fixtureSpec: {
    fixtureOnly: true,
    sourceAccessEnabled: false,
    actualDbQueryEnabled: false,
    jsonlFileExportEnabled: false
  },
  fixtureRows: fixtureRows(),
  requestedEntities,
  sameHeadEvidence: { required: true, headMatchStatus: 'same_head' },
  operatorApproval: { required: true, status: 'safe_summary_fixture_approved' },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  auditExportId: AUDIT_EXPORT_ID,
  runKey: 'run-safe-summary-fixture',
  operatorId: 'operator-safe-summary-fixture',
  reviewerId: 'reviewer-safe-summary-fixture',
  includeRows: false,
  includeJsonl: false,
  ...overrides
});

const buildFixture = (
  overrides: Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput> = {}
) => buildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture(validInput(overrides));

describe('tierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixture', () => {
  it('returns SAFE_SUMMARY_FIXTURE_READY for a safe D8Y shape, fixture rows, and approval', () => {
    const fixture = buildFixture();

    expect(fixture.fixtureKind).toBe('tier_update_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture');
    expect(fixture.schemaVersion).toBe('1');
    expect(fixture.status).toBe('SAFE_SUMMARY_FIXTURE_READY');
    expect(fixture.safeSummaryOnly).toBe(true);
    expect(fixture.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(fixture.traceLabel).toBe('d8z_actual_safe_row_export_read_only_source_candidate_safe_summary_fixture');
    expect(fixture.safeSummaryShapeStatus).toBe('SAFE_SUMMARY_SHAPE_READY');
    expect(fixture.fixtureRowCount).toBe(4);
    expect(fixture.nextSafeAction).toBe(
      'prepare_pr_d8aa_actual_safe_row_export_read_only_source_candidate_fixture_jsonl_package'
    );
  });

  it('keeps SAFE_SUMMARY_FIXTURE_READY separate from export, query, source access, JSONL file export, staging, runtime, and production readiness', () => {
    const fixture = buildFixture();

    expect(fixture.readinessClaim).toBe('none');
    expect(fixture.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(fixture.actualDbQueryEnabled).toBe(false);
    expect(fixture.actualDbExportEnabled).toBe(false);
    expect(fixture.sourceAccessEnabled).toBe(false);
    expect(fixture.prismaClientEnabled).toBe(false);
    expect(fixture.databaseUrlReadEnabled).toBe(false);
    expect(fixture.envReadEnabled).toBe(false);
    expect(fixture.networkAccessEnabled).toBe(false);
    expect(fixture.rpcAccessEnabled).toBe(false);
    expect(fixture.walletAccessEnabled).toBe(false);
    expect(fixture.contractAccessEnabled).toBe(false);
    expect(fixture.txSendEnabled).toBe(false);
    expect(fixture.fileExportEnabled).toBe(false);
    expect(fixture.jsonlFileExportEnabled).toBe(false);
    expect(fixture.artifactUploadEnabled).toBe(false);
    expect(fixture.dockerSmokeChanged).toBe(false);
    expect(fixture.stagingNoTxPassClaimed).toBe(false);
    expect(fixture.runtimeReadinessClaimed).toBe(false);
    expect(fixture.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['missing safeSummaryShape blocks', { safeSummaryShape: null }, 'BLOCKED', 'build_actual_safe_row_export_read_only_source_candidate_safe_summary_shape'],
    [
      'safeSummaryShape BLOCKED blocks',
      { safeSummaryShape: safeSummaryShape({ status: 'BLOCKED' }) },
      'BLOCKED',
      'build_actual_safe_row_export_read_only_source_candidate_safe_summary_shape'
    ],
    [
      'safeSummaryShape NEEDS_REVIEW gives NEEDS_REVIEW',
      { safeSummaryShape: safeSummaryShape({ status: 'NEEDS_REVIEW' }) },
      'NEEDS_REVIEW',
      'collect_operator_safe_summary_fixture_approval'
    ],
    ['missing fixtureRows gives NEEDS_REVIEW', { fixtureRows: null }, 'NEEDS_REVIEW', 'provide_safe_summary_fixture_rows'],
    ['empty fixtureRows gives NEEDS_REVIEW', { fixtureRows: [] }, 'NEEDS_REVIEW', 'provide_safe_summary_fixture_rows'],
    ['requestedEntities empty gives NEEDS_REVIEW', { requestedEntities: [] }, 'NEEDS_REVIEW', 'collect_operator_safe_summary_fixture_approval'],
    ['operator approval pending gives NEEDS_REVIEW', { operatorApproval: { required: true, status: 'pending' } }, 'NEEDS_REVIEW', 'collect_operator_safe_summary_fixture_approval'],
    [
      'operator approval safe_summary_shape_approved gives NEEDS_REVIEW',
      { operatorApproval: { required: true, status: 'safe_summary_shape_approved' } },
      'NEEDS_REVIEW',
      'collect_operator_safe_summary_fixture_approval'
    ]
  ])('%s', (_name, overrides, status, nextSafeAction) => {
    const fixture = buildFixture(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput>);

    expect(fixture.status).toBe(status);
    expect(fixture.nextSafeAction).toBe(nextSafeAction);
  });

  it.each([
    ['missing fixtureSpec blocks', { fixtureSpec: null }, 'provide_safe_summary_fixture_spec'],
    ['unsupported requested entity blocks', { requestedEntities: ['scheduled_tier_update', 'unknown_entity'] }, 'remove_unsupported_entity'],
    ['Prize blocks', { requestedEntities: ['Prize'] }, 'remove_unsupported_entity'],
    ['PrizeTransactions blocks', { requestedEntities: ['PrizeTransactions'] }, 'remove_unsupported_entity'],
    ['NFT metadata blocks', { requestedEntities: ['NFT metadata'] }, 'remove_unsupported_entity'],
    ['TokenDetail blocks', { requestedEntities: ['TokenDetail'] }, 'remove_unsupported_entity'],
    ['TicketCode blocks', { requestedEntities: ['TicketCode'] }, 'remove_unsupported_entity'],
    ['row entity_type unsupported blocks', { fixtureRows: [fixtureRow('unknown_entity', 'row-1')] }, 'remove_unsupported_entity'],
    ['row entity_type deferred blocks', { fixtureRows: [fixtureRow('Prize', 'row-1')] }, 'remove_unsupported_entity'],
    ['duplicate row_id blocks', { fixtureRows: [fixtureRow('job_run', 'dup'), fixtureRow('staging_evidence', 'dup')] }, 'remove_duplicate_row_id'],
    ['row readiness_claim runtime_ready blocks', { fixtureRows: [fixtureRow('job_run', 'row-1', { readiness_claim: 'runtime_ready' })] }, 'collect_operator_safe_summary_fixture_approval'],
    ['row readiness_claim staging_ready blocks', { fixtureRows: [fixtureRow('job_run', 'row-1', { readiness_claim: 'staging_ready' })] }, 'collect_operator_safe_summary_fixture_approval'],
    ['row readiness_claim production_ready blocks', { fixtureRows: [fixtureRow('job_run', 'row-1', { readiness_claim: 'production_ready' })] }, 'collect_operator_safe_summary_fixture_approval'],
    ['same-head evidence not required blocks', { sameHeadEvidence: { required: false } }, 'collect_operator_safe_summary_fixture_approval'],
    ['operator approval missing blocks', { operatorApproval: undefined }, 'collect_operator_safe_summary_fixture_approval'],
    ['operator approval execution_approved blocks', { operatorApproval: { required: true, status: 'execution_approved' } }, 'collect_operator_safe_summary_fixture_approval'],
    ['operator approval runtime_approved blocks', { operatorApproval: { required: true, status: 'runtime_approved' } }, 'collect_operator_safe_summary_fixture_approval'],
    ['operator approval staging_ready blocks', { operatorApproval: { required: true, status: 'staging_ready' } }, 'collect_operator_safe_summary_fixture_approval'],
    ['operator approval production_ready blocks', { operatorApproval: { required: true, status: 'production_ready' } }, 'collect_operator_safe_summary_fixture_approval'],
    ['actualDbQueryEnabled true blocks', { actualDbQueryEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['actualDbExportEnabled true blocks', { actualDbExportEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['sourceAccessEnabled true blocks', { sourceAccessEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['prismaClientEnabled true blocks', { prismaClientEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['databaseUrlReadEnabled true blocks', { databaseUrlReadEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['envReadEnabled true blocks', { envReadEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['networkAccessEnabled true blocks', { networkAccessEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['rpcAccessEnabled true blocks', { rpcAccessEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['walletAccessEnabled true blocks', { walletAccessEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['contractAccessEnabled true blocks', { contractAccessEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['txSendEnabled true blocks', { txSendEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['fileExportEnabled true blocks', { fileExportEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['jsonlFileExportEnabled true blocks', { jsonlFileExportEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['artifactUploadEnabled true blocks', { artifactUploadEnabled: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['dockerSmokeChanged true blocks', { dockerSmokeChanged: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['stagingNoTxPassClaimed true blocks', { stagingNoTxPassClaimed: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['runtimeReadinessClaimed true blocks', { runtimeReadinessClaimed: true }, 'collect_operator_safe_summary_fixture_approval'],
    ['productionReadinessClaimed true blocks', { productionReadinessClaimed: true }, 'collect_operator_safe_summary_fixture_approval']
  ])('%s', (_name, overrides, nextSafeAction) => {
    const fixture = buildFixture(overrides as Partial<BuildTierUpdateActualSafeRowExportReadOnlySourceCandidateSafeSummaryFixtureInput>);

    expect(fixture.status).toBe('BLOCKED');
    expect(fixture.blockerCount).toBeGreaterThan(0);
    expect(fixture.nextSafeAction).toBe(nextSafeAction);
  });

  it.each(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_FORBIDDEN_ORIGINS)(
    'forbidden origin %s blocks',
    (origin) => {
      const fixture = buildFixture({
        fixtureRows: [fixtureRow('job_run', 'row-1', { evidence_origin: origin })]
      });

      expect(fixture.status).toBe('BLOCKED');
      expect(fixture.fixtureOriginStatus).toBe('blocked');
      expect(fixture.nextSafeAction).toBe('replace_with_fixture_origin');
    }
  );

  it.each(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_FIXTURE_ALLOWED_ORIGINS)(
    'allowed origin %s can be represented',
    (origin) => {
      const fixture = buildFixture({
        fixtureRows: [fixtureRow('job_run', 'row-1', { evidence_origin: origin })]
      });

      expect(fixture.status).toBe('SAFE_SUMMARY_FIXTURE_READY');
      expect(fixture.fixtureOriginStatus).toBe('present');
    }
  );

  it.each(TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_READ_ONLY_SOURCE_CANDIDATE_SAFE_SUMMARY_SHAPE_REQUIRED_FIELDS)(
    'row missing %s blocks',
    (field) => {
      const row = fixtureRow('job_run', 'row-1');
      delete row[field];

      const fixture = buildFixture({ fixtureRows: [row] });

      expect(fixture.status).toBe('BLOCKED');
      expect(fixture.requiredFieldStatus).toBe('blocked');
      expect(fixture.nextSafeAction).toBe('add_required_safe_summary_field');
    }
  );

  it.each([
    'rawDbRow',
    'rawTxHash',
    'rawReceiptPayload',
    'fullWallet',
    'databaseUrl',
    'rpcUrl',
    'rawEnv',
    'privatePath'
  ])('row forbidden %s blocks', (field) => {
    const fixture = buildFixture({
      fixtureRows: [fixtureRow('job_run', 'row-1', { [field]: 'unsafe' })]
    });

    expect(fixture.status).toBe('BLOCKED');
    expect(fixture.forbiddenFieldStatus).toBe('blocked');
    expect(fixture.nextSafeAction).toBe('remove_forbidden_field');
  });

  it('includeRows false hides rows and includeRows true returns cloned safe fixture rows only', () => {
    const hidden = buildFixture({ includeRows: false });
    const visible = buildFixture({ includeRows: true });

    expect(hidden.rows).toBeNull();
    expect(visible.rows).toHaveLength(4);
    expect(visible.rows).not.toBe(validInput().fixtureRows);
    expect(visible.rows?.[0]).toEqual(expect.objectContaining({
      row_id: 'fixture-row-1',
      evidence_origin: 'fixture',
      readiness_claim: 'none'
    }));
  });

  it('includeJsonl false hides jsonl and includeJsonl true returns in-memory JSONL summary only', () => {
    const hidden = buildFixture({ includeJsonl: false });
    const visible = buildFixture({ includeJsonl: true });

    expect(hidden.jsonl).toBeNull();
    expect(hidden.jsonlSha256Summary).toBeNull();
    expect(visible.jsonl).toContain('"row_id":"fixture-row-1"');
    expect(visible.jsonl?.split('\n')).toHaveLength(4);
    expect(visible.jsonlSha256Summary).toMatch(/^safe_hash_[0-9a-f]{8}$/);
    expect(visible.fileExportEnabled).toBe(false);
    expect(visible.jsonlFileExportEnabled).toBe(false);
  });

  it('keeps fixture summary compact, nextSafeAction singular, and safeSummaryOnly true', () => {
    const fixture = buildFixture();

    expect(fixture.entityCounts).toEqual({
      scheduled_tier_update: 1,
      job_run: 1,
      tx_receipt_evidence: 1,
      staging_evidence: 1
    });
    expect(fixture.requiredFieldStatus).toBe('present');
    expect(fixture.forbiddenFieldStatus).toBe('present');
    expect(typeof fixture.nextSafeAction).toBe('string');
    expect(fixture.nextSafeAction.split(',')).toHaveLength(1);
    expect(fixture.safeSummaryOnly).toBe(true);
  });

  it('source does not import Prisma, read env, connect network, or write files', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client/);
    expect(source).not.toMatch(/new\s+PrismaClient/);
    expect(source).not.toMatch(/process\.env/);
    expect(source).not.toMatch(/fs\./);
    expect(source).not.toMatch(/writeFile|appendFile|createWriteStream/);
    expect(source).not.toMatch(/fetch\(/);
  });
});
