import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateOperatorReviewPacket
} from '../tierUpdateOperatorReviewPacket';
import {
  buildOperatorControlledTierUpdateSafeRowPackage,
  type OperatorControlledTierUpdateSafeRowPackage
} from '../tierUpdateSafeRowOperatorPackage';
import {
  buildJobRunSafeRowExportRecord,
  buildTierUpdateReceiptEvidenceSafeRow,
  buildTierUpdateSafeRowExportRecord,
  buildTierUpdateStagingEvidenceSafeRow,
  type TierUpdateSafeRowExportRecord
} from '../tierUpdateSafeRowExport';
import type {
  TierUpdateStagingNoTxPreflightEvidence
} from '../tierUpdateStagingNoTxPreflightEvidence';

const exportedAt = new Date('2026-06-05T00:00:00.000Z');
const sourceHeadSha = 'd78a45ab70235a862008e22fd784fed6bc0d3962';
const sourceHash = 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const auditExportId = 'audit-review-packet-001';
const operatorId = 'operator.review';
const reviewerId = 'reviewer.owner';
const workerId = 'worker.review';
const runKey = 'run.review.001';
const backendRoot = path.resolve(__dirname, '../../../../');
const reviewPacketSourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateOperatorReviewPacket.ts');

type ReviewableStagingEvidence = TierUpdateStagingNoTxPreflightEvidence & {
  auditExportId: string;
  sourceHash: string;
  exportedAt: string;
};

const auditMeta = {
  auditExportId,
  evidenceOrigin: 'local_test' as const,
  readinessClaim: 'local_ready' as const
};

const makeStagingEvidence = (
  overrides: Partial<ReviewableStagingEvidence> = {}
): ReviewableStagingEvidence => ({
  evidenceKind: 'tier_update_staging_no_tx_preflight_evidence',
  status: 'EVIDENCE_READY',
  readinessClaim: 'none',
  stagingNoTxPreflightStatus: 'BLOCKED',
  sourceHeadSha,
  sourceHash,
  auditExportId,
  exportedAt: exportedAt.toISOString(),
  runIdSummary: {
    provided: true,
    safeSummaryOnly: true
  },
  evaluatedAt: exportedAt.toISOString(),
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

const makeRecords = (): TierUpdateSafeRowExportRecord[] => {
  const scheduled = buildTierUpdateSafeRowExportRecord({
    row: {
      id: 1,
      userId: 2,
      status: 'TX_SENT',
      scheduledAt: exportedAt,
      expectedTier: 180,
      currentTier: 30,
      processed: false,
      txChainId: 56,
      txReceiptStatus: 1
    },
    auditMeta,
    sourceHeadSha,
    sourceHash,
    exportedAt
  });

  const jobRun = buildJobRunSafeRowExportRecord({
    row: {
      id: 3,
      jobName: 'tier_update_receipt_reconciliation',
      runKey: 'manual-run',
      status: 'SUCCEEDED',
      attempt: 1,
      maxAttempts: 3,
      checkpoint: {
        reason: 'safe'
      }
    },
    auditMeta,
    sourceHeadSha,
    sourceHash,
    exportedAt
  });

  const receipt = buildTierUpdateReceiptEvidenceSafeRow({
    evidence: {
      scheduledTierUpdateId: 1,
      txChainId: 56,
      txReceiptStatus: 1,
      confirmationDepth: 3,
      finalityStatus: 'observed',
      reconciliationStatus: 'confirmed'
    },
    auditMeta,
    sourceHeadSha,
    sourceHash,
    exportedAt
  });

  const staging = buildTierUpdateStagingEvidenceSafeRow({
    evidence: makeStagingEvidence(),
    auditMeta: {
      ...auditMeta,
      evidenceOrigin: 'staging_no_tx_evidence',
      readinessClaim: 'staging_no_tx_evidence'
    },
    sourceHeadSha,
    sourceHash,
    exportedAt
  });

  return [scheduled, jobRun, receipt, staging];
};

const makeOperatorPackage = (
  records: TierUpdateSafeRowExportRecord[] = makeRecords(),
  includeJsonl = false
): OperatorControlledTierUpdateSafeRowPackage => buildOperatorControlledTierUpdateSafeRowPackage({
  records,
  auditExportId,
  sourceHeadSha,
  sourceHash,
  exportedAt,
  operatorId,
  workerId,
  runKey,
  includeJsonl
});

const makeSafeDbReadExportPackage = (
  overrides: Record<string, unknown> = {}
): NonNullable<Parameters<typeof buildTierUpdateOperatorReviewPacket>[0]['safeDbReadExportPackage']> => ({
  status: 'EXPORT_PACKAGE_READY',
  packageKind: 'tier_update_safe_db_read_export_jsonl_package',
  recordCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  readinessClaimCounts: { none: 2 },
  evidenceOriginCounts: { db_safe_summary: 2 },
  jsonlSha256Summary: `sha256:${'a'.repeat(64)}`,
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
  missingEvidence: [],
  unsafeReasonCodes: [],
  safeSummaryOnly: true,
  ...overrides
});

const buildPacket = (
  overrides: Partial<Parameters<typeof buildTierUpdateOperatorReviewPacket>[0]> = {}
) => buildTierUpdateOperatorReviewPacket({
  operatorPackage: makeOperatorPackage(),
  safeDbReadExportPackage: makeSafeDbReadExportPackage(),
  stagingNoTxEvidence: makeStagingEvidence(),
  auditExportId,
  sourceHeadSha,
  sourceHash,
  exportedAt,
  operatorId,
  reviewerId,
  runKey,
  ...overrides
});

describe('tierUpdateOperatorReviewPacket', () => {
  it('classifies valid operator package and staging evidence as OWNER_REVIEW_READY without readiness claims', () => {
    const packet = buildPacket();

    expect(packet).toEqual(expect.objectContaining({
      status: 'OWNER_REVIEW_READY',
      packetKind: 'tier_update_operator_review_packet',
      mode: 'operator_controlled_review',
      auditExportId,
      sourceHeadSha,
      sourceHash,
      exportedAt: exportedAt.toISOString(),
      nextActionLabel: 'request_owner_review',
      blockers: [],
      missingEvidence: [],
      unsafeReasonCodes: [],
      readinessClaim: 'none',
      stagingNoTxPreflightStatus: 'BLOCKED',
      safeSummaryOnly: true
    }));
    expect(packet.status).not.toBe('PASS');
    expect(packet.reviewReadiness).toEqual({
      ownerReviewMaterialReady: true,
      actualDbExportStillDeferred: true,
      fileExportStillDeferred: true,
      artifactUploadStillDeferred: true,
      runtimeReadinessClaimed: false,
      stagingNoTxPassClaimed: false
    });
    expect(packet.packageSummary).toEqual(expect.objectContaining({
      recordCount: 4,
      includeJsonl: false
    }));
    expect(packet.packageSummary.jsonlSha256Summary).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(packet.safeDbReadExportEvidenceStatus).toBe('OWNER_REVIEW_READY');
    expect(packet.safeDbReadExportPackageStatus).toBe('EXPORT_PACKAGE_READY');
    expect(packet.safeDbReadExportRecordCount).toBe(2);
    expect(packet.safeDbReadExportEntityCounts).toEqual({ scheduled_tier_update: 1, job_run: 1 });
    expect(packet.safeDbReadExportReadinessClaimCounts).toEqual({ none: 2 });
    expect(packet.safeDbReadExportEvidenceOriginCounts).toEqual({ db_safe_summary: 2 });
    expect(packet.safeDbReadExportJsonlSha256Summary).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(packet.safeDbReadExportOwnerReviewBoundary).toEqual({
      ownerReviewReadyIsPass: false,
      ownerReviewReadyIsStagingReady: false,
      ownerReviewReadyIsRuntimeReady: false,
      ownerReviewReadyIsProductionReady: false,
      safeSummaryOnly: true
    });
    expect(packet.safeDbReadExportNoRuntimeBoundary).toEqual({
      actualDbExport: false,
      realDbQuery: false,
      prismaClientUsed: false,
      fileExported: false,
      artifactUploaded: false,
      dockerSmoke: false,
      runtimeReadinessClaimed: false,
      productionReadinessClaimed: false,
      stagingNoTxPassClaimed: false,
      safeSummaryOnly: true
    });
    expect(packet.stagingNoTxEvidenceSummary).toEqual(expect.objectContaining({
      stagingNoTxPreflightStatus: 'BLOCKED',
      readinessClaim: 'none',
      noTxExecution: true,
      noRpcUrlEnvReading: true,
      noProviderConstruction: true,
      noWalletConstruction: true,
      noContractConstruction: true,
      noAutoStart: true,
      noCronWiring: true,
      noMainAutoStart: true,
      noTrackingServiceAutoStart: true
    }));
  });

  it('does not return raw operatorId, reviewerId, runKey, or raw JSONL content', () => {
    const packet = buildPacket({
      operatorPackage: makeOperatorPackage(makeRecords(), true)
    });
    const serialized = JSON.stringify(packet);

    expect(packet.status).toBe('OWNER_REVIEW_READY');
    expect(packet.operatorSummary).toEqual({ provided: true, kind: 'operator_id', safeSummaryOnly: true });
    expect(packet.reviewerSummary).toEqual({ provided: true, kind: 'reviewer_id', safeSummaryOnly: true });
    expect(packet.runKeySummary).toEqual({ provided: true, kind: 'run_key', safeSummaryOnly: true });
    expect(serialized).not.toContain(operatorId);
    expect(serialized).not.toContain(reviewerId);
    expect(serialized).not.toContain(runKey);
    expect(serialized).not.toContain('"jsonl"');
    expect(serialized).not.toContain('{"schema_version"');
    expect(serialized).not.toContain('rawReceipt');
    expect(serialized).not.toContain('rawError');
    expect(serialized).not.toContain('rpcUrl');
    expect(serialized).not.toContain('process.env');
  });

  it.each([
    ['operatorPackage', { operatorPackage: undefined }, 'operator_package_missing'],
    ['safeDbReadExportPackage', { safeDbReadExportPackage: undefined }, 'safeDbReadExportPackage'],
    ['stagingNoTxEvidence', { stagingNoTxEvidence: undefined }, 'staging_no_tx_evidence_missing']
  ])('blocks when %s is missing', (_label, override, blocker) => {
    const packet = buildPacket(override);

    if (_label === 'safeDbReadExportPackage') {
      expect(packet.status).toBe('NEEDS_REVIEW');
      expect(packet.missingEvidence).toContain(blocker);
    } else {
      expect(packet.status).toBe('BLOCKED');
      expect(packet.nextActionLabel).toBe('stay_blocked');
      expect(packet.blockers).toContain(blocker);
    }
  });

  it.each([
    ['auditExportId', { auditExportId: 'audit-other' }, 'operator_package_audit_export_id_mismatch'],
    ['sourceHeadSha', { sourceHeadSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }, 'operator_package_source_head_sha_mismatch'],
    ['sourceHash', { sourceHash: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }, 'operator_package_source_hash_mismatch'],
    ['exportedAt', { exportedAt: new Date('2026-06-06T00:00:00.000Z') }, 'operator_package_exported_at_mismatch']
  ])('blocks metadata mismatch for %s', (_label, override, blocker) => {
    const packet = buildPacket(override);

    expect(packet.status).toBe('BLOCKED');
    expect(packet.blockers).toContain(blocker);
  });

  const unsafeReadinessCases: Array<[
    string,
    Partial<Parameters<typeof buildTierUpdateOperatorReviewPacket>[0]>,
    string
  ]> = [
    ['operatorPackage readinessClaim', { operatorPackage: { ...makeOperatorPackage(), readinessClaim: 'remote_gate_pass' as 'none' } }, 'operator_package_readiness_claim_not_none'],
    ['staging readinessClaim', { stagingNoTxEvidence: { ...makeStagingEvidence(), readinessClaim: 'staging_ready' as 'none' } }, 'staging_evidence_readiness_claim_not_none'],
    ['operatorPackage staging status', { operatorPackage: { ...makeOperatorPackage(), stagingNoTxPreflightStatus: 'PASS' as 'BLOCKED' } }, 'operator_package_staging_status_not_blocked'],
    ['staging status', { stagingNoTxEvidence: { ...makeStagingEvidence(), stagingNoTxPreflightStatus: 'PASS' as 'BLOCKED' } }, 'staging_evidence_status_not_blocked']
  ];

  it.each(unsafeReadinessCases)('blocks unsafe readiness boundary: %s', (_label, override, blocker) => {
    const packet = buildPacket(override);

    expect(packet.status).toBe('BLOCKED');
    expect(packet.blockers).toContain(blocker);
    expect(packet.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(packet.readinessClaim).toBe('none');
  });

  it.each([
    ['noTxExecution'],
    ['noFundedTx'],
    ['noMint'],
    ['noSendToWallet'],
    ['noGovernanceTx'],
    ['noTierUpdaterTx'],
    ['noDeploy'],
    ['noStagingRollout'],
    ['noRpcUrlEnvReading'],
    ['noProviderConstruction'],
    ['noWalletConstruction'],
    ['noContractConstruction'],
    ['noAutoStart'],
    ['noCronWiring'],
    ['noMainAutoStart'],
    ['noTrackingServiceAutoStart']
  ])('blocks when staging no-tx check %s is false', (checkName) => {
    const staging = makeStagingEvidence({
      checks: {
        ...makeStagingEvidence().checks,
        [checkName]: false
      }
    });
    const packet = buildPacket({ stagingNoTxEvidence: staging });

    expect(packet.status).toBe('BLOCKED');
    expect(packet.blockers).toContain(checkName);
  });

  it('returns NEEDS_REVIEW for zero records or staging evidence that needs review', () => {
    const emptyRecordPackage = {
      ...makeOperatorPackage(),
      recordCount: 0,
      entityCounts: {}
    };
    const zeroRecords = buildPacket({ operatorPackage: emptyRecordPackage });
    const stagingNeedsReview = buildPacket({
      stagingNoTxEvidence: makeStagingEvidence({
        status: 'NEEDS_REVIEW',
        missingEvidence: ['owner_review_note']
      })
    });

    expect(zeroRecords.status).toBe('NEEDS_REVIEW');
    expect(zeroRecords.nextActionLabel).toBe('collect_missing_evidence');
    expect(stagingNeedsReview.status).toBe('NEEDS_REVIEW');
    expect(stagingNeedsReview.missingEvidence).toContain('staging:owner_review_note');
  });

  it.each([
    ['package BLOCKED', { status: 'BLOCKED' }, 'safe_db_read_export_package_blocked'],
    ['unsafe reason codes', { unsafeReasonCodes: ['duplicate_row_id'] }, 'safe_db_read_export:duplicate_row_id'],
    ['blockers', { blockers: ['jsonl_package_blocked'] }, 'safe_db_read_export:jsonl_package_blocked'],
    ['runtime readiness claim', { readinessClaim: 'runtime_ready' }, 'safe_db_read_export_readiness_claim_not_none'],
    ['staging readiness claim', { readinessClaim: 'staging_ready' }, 'safe_db_read_export_readiness_claim_not_none'],
    ['production readiness claim', { readinessClaim: 'production_ready' }, 'safe_db_read_export_readiness_claim_not_none'],
    ['runtimeReadinessClaimed', { runtimeReadinessClaimed: true }, 'safe_db_read_export_runtime_readiness_claimed'],
    ['productionReadinessClaimed', { productionReadinessClaimed: true }, 'safe_db_read_export_production_readiness_claimed'],
    ['actualDbExport', { actualDbExport: true }, 'safe_db_read_export_actual_db_export'],
    ['realDbQuery', { realDbQuery: true }, 'safe_db_read_export_real_db_query'],
    ['prismaClientUsed', { prismaClientUsed: true }, 'safe_db_read_export_prisma_client_used'],
    ['fileExported', { fileExported: true }, 'safe_db_read_export_file_exported'],
    ['artifactUploaded', { artifactUploaded: true }, 'safe_db_read_export_artifact_uploaded'],
    ['dockerSmoke', { dockerSmoke: true }, 'safe_db_read_export_docker_smoke'],
    ['stagingNoTxPreflightStatus', { stagingNoTxPreflightStatus: 'PASS' }, 'safe_db_read_export_staging_status_not_blocked']
  ])('blocks unsafe safe DB read export package boundary: %s', (_label, packageOverride, blocker) => {
    const packet = buildPacket({ safeDbReadExportPackage: makeSafeDbReadExportPackage(packageOverride) });

    expect(packet.status).toBe('BLOCKED');
    expect([...packet.blockers, ...packet.unsafeReasonCodes]).toContain(blocker);
    expect(packet.safeDbReadExportJsonlSha256Summary).toBeNull();
    expect(packet.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(packet.readinessClaim).toBe('none');
  });

  it('needs review for safe DB read export package NEEDS_REVIEW or zero records', () => {
    const needsReview = buildPacket({ safeDbReadExportPackage: makeSafeDbReadExportPackage({ status: 'NEEDS_REVIEW' }) });
    const zeroRecords = buildPacket({ safeDbReadExportPackage: makeSafeDbReadExportPackage({ recordCount: 0 }) });

    expect(needsReview.status).toBe('NEEDS_REVIEW');
    expect(needsReview.safeDbReadExportEvidenceStatus).toBe('NEEDS_REVIEW');
    expect(zeroRecords.status).toBe('NEEDS_REVIEW');
    expect(zeroRecords.missingEvidence).toContain('safeDbReadExportPackage.records');
  });

  it('does not expose raw safe DB read export payload values', () => {
    const packet = buildPacket({
      safeDbReadExportPackage: makeSafeDbReadExportPackage({
        jsonl: '{"rawWallet":"unsafe"}',
        rawTxHash: 'unsafe',
        rawCheckpoint: 'unsafe',
        rawEnv: 'DATABASE_URL=unsafe',
        rawPath: 'C:\\Users\\secret\\file',
        rawProviderError: 'raw provider error'
      })
    });
    const serialized = JSON.stringify(packet);

    expect(packet.status).toBe('BLOCKED');
    expect(packet.unsafeReasonCodes).toContain('safe_db_read_export_unsafe_value');
    expect(serialized).not.toContain('rawWallet');
    expect(serialized).not.toContain('rawTxHash');
    expect(serialized).not.toContain('rawCheckpoint');
    expect(serialized).not.toContain('DATABASE_URL=');
    expect(serialized).not.toContain('C:\\Users\\');
    expect(serialized).not.toContain('raw provider error');
  });

  it.each([
    ['operatorId', { operatorId: 'Bearer unsafe-token' }, 'operator_id_unsafe'],
    ['reviewerId', { reviewerId: 'https://reviewer.invalid' }, 'reviewer_id_unsafe'],
    ['runKey', { runKey: 'C:\\Users\\secret\\run' }, 'run_key_unsafe']
  ])('blocks unsafe %s without returning raw values', (_label, override, reason) => {
    const packet = buildPacket(override);
    const serialized = JSON.stringify(packet);

    expect(packet.status).toBe('BLOCKED');
    expect(packet.unsafeReasonCodes).toContain(reason);
    expect(serialized).not.toContain('unsafe-token');
    expect(serialized).not.toContain('reviewer.invalid');
    expect(serialized).not.toContain('secret\\run');
  });

  it('keeps the packet builder disconnected from DB, export, route, CLI, cron, runtime, RPC, tx, and Docker smoke code', () => {
    const source = fs.readFileSync(reviewPacketSourcePath, 'utf8');

    expect(source).not.toContain("'PASS'");
    expect(source).not.toContain('"PASS"');
    expect(source).not.toContain('PrismaClient');
    expect(source).not.toContain('prisma.');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('createWriteStream');
    expect(source).not.toContain('uploadArtifact');
    expect(source).not.toContain('downloadArtifact');
    expect(source).not.toContain('express.Router');
    expect(source).not.toContain('router.');
    expect(source).not.toContain('process.argv');
    expect(source).not.toContain('require.main');
    expect(source).not.toContain('node-cron');
    expect(source).not.toContain('trackingService');
    expect(source).not.toContain('main.ts');
    expect(source).not.toContain('process.env');
    expect(source).not.toContain('JsonRpcProvider');
    expect(source).not.toContain('new ethers');
    expect(source).not.toContain('Wallet(');
    expect(source).not.toContain('Contract(');
    expect(source).not.toContain('sendTierSyncTransaction');
    expect(source).not.toContain('recordTierUpdateTxSent');
    expect(source).not.toContain('tx.wait');
    expect(source).not.toContain('Dockerfile');
    expect(source).not.toContain('docker ');
  });
});
