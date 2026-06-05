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

const buildPacket = (
  overrides: Partial<Parameters<typeof buildTierUpdateOperatorReviewPacket>[0]> = {}
) => buildTierUpdateOperatorReviewPacket({
  operatorPackage: makeOperatorPackage(),
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
    expect(serialized).not.toContain('rawReceipt');
    expect(serialized).not.toContain('rawError');
    expect(serialized).not.toContain('rpcUrl');
    expect(serialized).not.toContain('process.env');
  });

  it.each([
    ['operatorPackage', { operatorPackage: undefined }, 'operator_package_missing'],
    ['stagingNoTxEvidence', { stagingNoTxEvidence: undefined }, 'staging_no_tx_evidence_missing']
  ])('blocks when %s is missing', (_label, override, blocker) => {
    const packet = buildPacket(override);

    expect(packet.status).toBe('BLOCKED');
    expect(packet.nextActionLabel).toBe('stay_blocked');
    expect(packet.blockers).toContain(blocker);
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
