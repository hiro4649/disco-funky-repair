import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateD8StagingOwnerReviewRefresh,
  type BuildTierUpdateD8StagingOwnerReviewRefreshInput
} from '../tierUpdateD8StagingOwnerReviewRefresh';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = new Date('2026-06-10T00:00:00.000Z');
const JSONL_HASH = `sha256:${'c'.repeat(64)}`;
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateD8StagingOwnerReviewRefresh.ts');

type RefreshInput = BuildTierUpdateD8StagingOwnerReviewRefreshInput;

const buildSafePackage = (overrides: Record<string, unknown> = {}): NonNullable<RefreshInput['safeDbReadExportPackage']> => ({
  status: 'EXPORT_PACKAGE_READY',
  packageKind: 'tier_update_safe_db_read_export_jsonl_package',
  recordCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  readinessClaimCounts: { none: 2 },
  evidenceOriginCounts: { db_safe_summary: 2 },
  jsonlSha256Summary: JSONL_HASH,
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false,
  actualDbExport: false,
  realDbQuery: false,
  prismaClientUsed: false,
  fileExported: false,
  artifactUploaded: false,
  dockerSmoke: false,
  blockers: [],
  unsafeReasonCodes: [],
  safeSummaryOnly: true,
  ...overrides
});

const buildDigest = (overrides: Record<string, unknown> = {}): NonNullable<RefreshInput['d8EvidenceDigest']> => ({
  digestKind: 'tier_update_d8_evidence_operator_digest',
  schemaVersion: '1',
  status: 'OWNER_REVIEW_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8_safe_evidence_operator_digest',
  safeDbReadExportPackageStatus: 'EXPORT_PACKAGE_READY',
  ownerReviewPacketStatus: 'OWNER_REVIEW_READY',
  recordCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  readinessClaimCounts: { none: 2 },
  evidenceOriginCounts: { db_safe_summary: 2 },
  jsonlSha256Summary: JSONL_HASH,
  blockerCount: 0,
  unsafeReasonCount: 0,
  compactBlockerCodes: [],
  compactUnsafeReasonCodes: [],
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  runtimeReadinessClaimed: false,
  productionReadinessClaimed: false,
  actualDbExport: false,
  realDbQuery: false,
  prismaClientUsed: false,
  fileExported: false,
  artifactUploaded: false,
  dockerSmoke: false,
  nextSafeAction: 'prepare_pr_d8k_staging_no_tx_owner_review_evidence_refresh',
  ...overrides
});

const buildOwnerPacket = (overrides: Record<string, unknown> = {}): NonNullable<RefreshInput['ownerReviewPacket']> => ({
  status: 'OWNER_REVIEW_READY',
  packetKind: 'tier_update_operator_review_packet',
  safeDbReadExportEvidenceStatus: 'OWNER_REVIEW_READY',
  safeDbReadExportPackageStatus: 'EXPORT_PACKAGE_READY',
  safeDbReadExportRecordCount: 2,
  safeDbReadExportEntityCounts: { scheduled_tier_update: 1, job_run: 1 },
  safeDbReadExportReadinessClaimCounts: { none: 2 },
  safeDbReadExportEvidenceOriginCounts: { db_safe_summary: 2 },
  safeDbReadExportJsonlSha256Summary: JSONL_HASH,
  safeDbReadExportUnsafeReasonCodesSummary: [],
  safeDbReadExportBlockersSummary: [],
  reviewReadiness: {
    ownerReviewMaterialReady: true,
    actualDbExportStillDeferred: true,
    fileExportStillDeferred: true,
    artifactUploadStillDeferred: true,
    runtimeReadinessClaimed: false,
    stagingNoTxPassClaimed: false
  },
  nextActionLabel: 'request_owner_review',
  blockers: [],
  missingEvidence: [],
  unsafeReasonCodes: [],
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  safeSummaryOnly: true,
  ...overrides
});

const buildStagingEvidence = (overrides: Record<string, unknown> = {}): NonNullable<RefreshInput['stagingNoTxEvidence']> => ({
  evidenceKind: 'tier_update_staging_no_tx_preflight_evidence',
  status: 'EVIDENCE_READY',
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  sourceHeadSha: SOURCE_HEAD_SHA,
  runIdSummary: { provided: true, safeSummaryOnly: true },
  evaluatedAt: EXPORTED_AT.toISOString(),
  checks: {
    noTxExecution: true,
    noFundedTx: true,
    noMint: true,
    noSendToWallet: true,
    noGovernanceTx: true,
    noTierUpdaterTx: true,
    noDeploy: true,
    noStagingRollout: true,
    noRpcUrlEnvReading: true,
    noProviderConstruction: true,
    noWalletConstruction: true,
    noContractConstruction: true,
    noAutoStart: true,
    noCronWiring: true,
    noMainAutoStart: true,
    noTrackingServiceAutoStart: true,
    safeOutputOnly: true
  },
  missingEvidence: [],
  blockers: [],
  safeSummaryOnly: true,
  ...overrides
});

const buildRefresh = (
  overrides: Partial<RefreshInput> = {}
) => buildTierUpdateD8StagingOwnerReviewRefresh({
  d8EvidenceDigest: buildDigest(),
  ownerReviewPacket: buildOwnerPacket(),
  stagingNoTxEvidence: buildStagingEvidence(),
  safeDbReadExportPackage: buildSafePackage(),
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  operatorId: 'operator-d8k',
  reviewerId: 'reviewer-d8k',
  runKey: 'run-d8k',
  ...overrides
});

const stringify = (value: unknown) => JSON.stringify(value);

describe('tierUpdateD8StagingOwnerReviewRefresh', () => {
  it('creates an OWNER_REVIEW_READY refresh from digest, owner packet, staging evidence, and safe package', () => {
    const refresh = buildRefresh();

    expect(refresh.refreshKind).toBe('tier_update_d8_staging_owner_review_refresh');
    expect(refresh.schemaVersion).toBe('1');
    expect(refresh.status).toBe('OWNER_REVIEW_READY');
    expect(refresh.safeSummaryOnly).toBe(true);
    expect(refresh.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(refresh.traceLabel).toBe('d8_staging_owner_review_refresh');
    expect(refresh.recordCount).toBe(2);
    expect(refresh.entityCounts).toEqual({ job_run: 1, scheduled_tier_update: 1 });
    expect(refresh.nextSafeAction).toBe('prepare_pr_d8l_actual_safe_row_export_plan');
  });

  it('keeps OWNER_REVIEW_READY separate from PASS and readiness', () => {
    const refresh = buildRefresh();

    expect(refresh.status).toBe('OWNER_REVIEW_READY');
    expect(refresh.ownerReviewSummary.ownerReviewReadyIsPass).toBe(false);
    expect(refresh.ownerReviewSummary.ownerReviewReadyIsStagingReady).toBe(false);
    expect(refresh.ownerReviewSummary.ownerReviewReadyIsRuntimeReady).toBe(false);
    expect(refresh.ownerReviewSummary.ownerReviewReadyIsProductionReady).toBe(false);
    expect(refresh.noTxBoundary.stagingNoTxPassClaimed).toBe(false);
  });

  it.each([
    ['d8EvidenceDigest', { d8EvidenceDigest: undefined }, 'd8_evidence_digest_missing', 'build_compact_d8_evidence_operator_digest'],
    ['ownerReviewPacket', { ownerReviewPacket: undefined }, 'owner_review_packet_missing', 'resolve_owner_review_blockers'],
    ['stagingNoTxEvidence', { stagingNoTxEvidence: undefined }, 'staging_no_tx_evidence_missing', 'build_staging_no_tx_owner_review_evidence'],
    ['safeDbReadExportPackage', { safeDbReadExportPackage: undefined }, 'safe_db_read_export_package_missing', 'resolve_owner_review_blockers']
  ])('blocks when %s is missing', (_label, override, blocker, nextAction) => {
    const refresh = buildRefresh(override);

    expect(refresh.status).toBe('BLOCKED');
    expect(refresh.compactBlockerCodes).toContain(blocker);
    expect(refresh.nextSafeAction).toBe(nextAction);
  });

  it.each([
    ['digest BLOCKED', { d8EvidenceDigest: buildDigest({ status: 'BLOCKED' }) }, 'd8_evidence_digest_blocked'],
    ['owner packet BLOCKED', { ownerReviewPacket: buildOwnerPacket({ status: 'BLOCKED' }) }, 'owner_review_packet_blocked'],
    ['safe package BLOCKED', { safeDbReadExportPackage: buildSafePackage({ status: 'BLOCKED' }) }, 'safe_db_read_export_package_blocked']
  ])('blocks on %s', (_label, override, blocker) => {
    const refresh = buildRefresh(override);

    expect(refresh.status).toBe('BLOCKED');
    expect(refresh.compactBlockerCodes).toContain(blocker);
  });

  it('blocks on unsafe reason codes', () => {
    const refresh = buildRefresh({
      safeDbReadExportPackage: buildSafePackage({ unsafeReasonCodes: ['unsafe_safe_row'] })
    });

    expect(refresh.status).toBe('BLOCKED');
    expect(refresh.compactUnsafeReasonCodes).toContain('safeDbReadExportPackage:unsafe_safe_row');
    expect(refresh.nextSafeAction).toBe('review_unsafe_staging_owner_evidence');
  });

  it('blocks on blocker codes', () => {
    const refresh = buildRefresh({
      ownerReviewPacket: buildOwnerPacket({ blockers: ['owner_note_missing'] })
    });

    expect(refresh.status).toBe('BLOCKED');
    expect(refresh.compactBlockerCodes).toContain('ownerReviewPacket:owner_note_missing');
    expect(refresh.nextSafeAction).toBe('resolve_owner_review_blockers');
  });

  it('uses NEEDS_REVIEW for zero records without a hard blocker', () => {
    const refresh = buildRefresh({
      safeDbReadExportPackage: buildSafePackage({ recordCount: 0, entityCounts: {} }),
      d8EvidenceDigest: buildDigest({ recordCount: 0, entityCounts: {} })
    });

    expect(refresh.status).toBe('NEEDS_REVIEW');
    expect(refresh.nextSafeAction).toBe('add_mock_or_injected_safe_rows');
  });

  it.each(['runtime_ready', 'staging_ready', 'production_ready'])(
    'blocks forbidden readiness claim %s',
    (readinessClaim) => {
      const refresh = buildRefresh({
        safeDbReadExportPackage: buildSafePackage({ readinessClaim })
      });

      expect(refresh.status).toBe('BLOCKED');
      expect(refresh.compactBlockerCodes).toContain('safe_db_read_export_readiness_claim_not_none');
      expect(refresh.readinessClaim).toBe('none');
    }
  );

  it.each([
    ['stagingNoTxPreflightStatus', 'PASS', 'safe_db_read_export_staging_status_not_blocked'],
    ['actualDbExport', true, 'actual_db_export_boundary_violation'],
    ['realDbQuery', true, 'real_db_query_boundary_violation'],
    ['prismaClientUsed', true, 'prisma_client_boundary_violation'],
    ['fileExported', true, 'file_export_boundary_violation'],
    ['artifactUploaded', true, 'artifact_upload_boundary_violation'],
    ['dockerSmoke', true, 'docker_smoke_change_boundary_violation'],
    ['runtimeReadinessClaimed', true, 'runtime_readiness_claimed'],
    ['productionReadinessClaimed', true, 'production_readiness_claimed']
  ])('blocks safe DB package boundary violation %s', (key, value, blocker) => {
    const refresh = buildRefresh({
      safeDbReadExportPackage: buildSafePackage({ [key]: value })
    });

    expect(refresh.status).toBe('BLOCKED');
    expect(refresh.compactBlockerCodes).toContain(blocker);
  });

  it('blocks staging no-tx PASS evidence', () => {
    const refresh = buildRefresh({
      stagingNoTxEvidence: buildStagingEvidence({ stagingNoTxPreflightStatus: 'PASS' })
    });

    expect(refresh.status).toBe('BLOCKED');
    expect(refresh.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(refresh.compactBlockerCodes).toContain('staging_evidence_status_not_blocked');
  });

  it('does not include raw JSONL, wallet, tx hash, checkpoint, env, path, operatorId, reviewerId, or runKey', () => {
    const refresh = buildRefresh({
      safeDbReadExportPackage: buildSafePackage({
        jsonl: '{"raw":"payload"}',
        rawWallet: 'raw wallet',
        rawTxHash: 'raw txHash',
        rawCheckpoint: 'raw checkpoint',
        rawEnv: 'DATABASE_URL=unsafe',
        privatePath: 'C:\\Users\\unsafe'
      })
    });
    const text = stringify(refresh);

    expect(refresh.status).toBe('BLOCKED');
    expect(text).not.toContain('operator-d8k');
    expect(text).not.toContain('reviewer-d8k');
    expect(text).not.toContain('run-d8k');
    expect(text).not.toContain('DATABASE_URL=');
    expect(text).not.toContain('C:\\Users\\unsafe');
    expect(text).not.toContain('raw wallet');
    expect(text).not.toContain('raw txHash');
    expect(text).not.toContain('raw checkpoint');
    expect(text).not.toContain('"jsonl"');
  });

  it('keeps nextSafeAction singular and safe summary only', () => {
    const refresh = buildRefresh();

    expect(typeof refresh.nextSafeAction).toBe('string');
    expect(Array.isArray(refresh.nextSafeAction)).toBe(false);
    expect(refresh.safeSummaryOnly).toBe(true);
  });

  it('summarizes operator metadata without raw values', () => {
    const refresh = buildRefresh();

    expect(refresh.operatorSummary.operatorId).toEqual({ provided: true, safeSummaryOnly: true });
    expect(refresh.operatorSummary.reviewerId).toEqual({ provided: true, safeSummaryOnly: true });
    expect(refresh.operatorSummary.runKey).toEqual({ provided: true, safeSummaryOnly: true });
    expect(refresh.operatorSummary.sourceHeadSha).toEqual({ provided: true, safeSummaryOnly: true });
    expect(refresh.operatorSummary.sourceHash).toEqual({ provided: true, safeSummaryOnly: true });
    expect(refresh.operatorSummary.exportedAt).toEqual({ provided: true, safeSummaryOnly: true });
  });

  it('does not import Prisma, DB env, file export, artifact upload, routes, runtime wiring, or Docker smoke changes', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|new PrismaClient|process\.env\.DATABASE_URL/);
    expect(source).not.toMatch(/writeFile|createWriteStream|uploadArtifact|router\.|cron|trackingService|main\.ts/i);
    expect(source).not.toMatch(/sendTransaction|new ethers|new Contract|JsonRpcProvider|Wallet/);
    expect(source).not.toMatch(/docker\s+(run|compose|build|smoke)/i);
  });
});
