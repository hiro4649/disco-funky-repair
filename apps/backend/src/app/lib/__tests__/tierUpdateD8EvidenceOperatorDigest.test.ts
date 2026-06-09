import fs from 'fs';
import path from 'path';

import {
  buildTierUpdateD8EvidenceOperatorDigest,
  type BuildTierUpdateD8EvidenceOperatorDigestInput
} from '../tierUpdateD8EvidenceOperatorDigest';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = new Date('2026-06-09T00:00:00.000Z');
const JSONL_HASH = `sha256:${'c'.repeat(64)}`;

const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateD8EvidenceOperatorDigest.ts');

type DigestPackageInput = NonNullable<BuildTierUpdateD8EvidenceOperatorDigestInput['safeDbReadExportPackage']>;
type DigestOwnerPacketInput = NonNullable<BuildTierUpdateD8EvidenceOperatorDigestInput['ownerReviewPacket']>;

const buildPackage = (overrides: Record<string, unknown> = {}): DigestPackageInput => ({
  status: 'EXPORT_PACKAGE_READY' as const,
  packageKind: 'tier_update_safe_db_read_export_jsonl_package',
  recordCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  readinessClaimCounts: { none: 2 },
  evidenceOriginCounts: { db_safe_summary: 2 },
  jsonlSha256Summary: JSONL_HASH,
  readinessClaim: 'none' as const,
  stagingNoTxPreflightStatus: 'BLOCKED' as const,
  runtimeReadinessClaimed: false as const,
  productionReadinessClaimed: false as const,
  actualDbExport: false as const,
  realDbQuery: false as const,
  prismaClientUsed: false as const,
  fileExported: false as const,
  artifactUploaded: false as const,
  dockerSmoke: false as const,
  blockers: [],
  unsafeReasonCodes: [],
  safeSummaryOnly: true as const,
  ...overrides
});

const buildOwnerReviewPacket = (overrides: Record<string, unknown> = {}): DigestOwnerPacketInput => ({
  status: 'OWNER_REVIEW_READY' as const,
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
  safeDbReadExportNoRuntimeBoundary: {
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
  },
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
  readinessClaim: 'none' as const,
  stagingNoTxPreflightStatus: 'BLOCKED' as const,
  safeSummaryOnly: true as const,
  ...overrides
});

const buildDigest = (
  packageOverrides: Record<string, unknown> = {},
  ownerOverrides: Record<string, unknown> = {}
) => buildTierUpdateD8EvidenceOperatorDigest({
  safeDbReadExportPackage: buildPackage(packageOverrides),
  ownerReviewPacket: buildOwnerReviewPacket(ownerOverrides),
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  operatorId: 'operator-d8j2',
  runKey: 'run-d8j2'
});

const stringify = (value: unknown) => JSON.stringify(value);

describe('tierUpdateD8EvidenceOperatorDigest', () => {
  it('creates an OWNER_REVIEW_READY digest from D8I package and D8J packet', () => {
    const digest = buildDigest();

    expect(digest.digestKind).toBe('tier_update_d8_evidence_operator_digest');
    expect(digest.schemaVersion).toBe('1');
    expect(digest.status).toBe('OWNER_REVIEW_READY');
    expect(digest.safeSummaryOnly).toBe(true);
    expect(digest.recordCount).toBe(2);
    expect(digest.entityCounts).toEqual({ job_run: 1, scheduled_tier_update: 1 });
    expect(digest.readinessClaimCounts).toEqual({ none: 2 });
    expect(digest.evidenceOriginCounts).toEqual({ db_safe_summary: 2 });
    expect(digest.jsonlSha256Summary).toBe(JSONL_HASH);
    expect(digest.nextSafeAction).toBe('prepare_pr_d8k_staging_no_tx_owner_review_evidence_refresh');
  });

  it('keeps OWNER_REVIEW_READY separate from PASS and readiness', () => {
    const digest = buildDigest();

    expect(digest.status).toBe('OWNER_REVIEW_READY');
    expect(stringify(digest)).not.toContain('"PASS"');
    expect(digest.operatorSummary.ownerReviewReadyIsPass).toBe(false);
    expect(digest.operatorSummary.ownerReviewReadyIsStagingReady).toBe(false);
    expect(digest.operatorSummary.ownerReviewReadyIsRuntimeReady).toBe(false);
    expect(digest.operatorSummary.ownerReviewReadyIsProductionReady).toBe(false);
  });

  it('includes v1.1.5 skill profile and trace labels', () => {
    const digest = buildDigest();

    expect(digest.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(digest.traceLabel).toBe('d8_safe_evidence_operator_digest');
    expect(digest.evidenceStages).toEqual({
      d8gSafeDbReadExportFoundation: 'present',
      d8hMockRows: 'present',
      d8iJsonlPackage: 'present',
      d8jOwnerReviewConsumption: 'present'
    });
  });

  it('blocks when package is missing', () => {
    const digest = buildTierUpdateD8EvidenceOperatorDigest({
      ownerReviewPacket: buildOwnerReviewPacket(),
      sourceHeadSha: SOURCE_HEAD_SHA,
      sourceHash: SOURCE_HASH,
      exportedAt: EXPORTED_AT
    });

    expect(digest.status).toBe('BLOCKED');
    expect(digest.compactBlockerCodes).toContain('safe_db_read_export_package_missing');
    expect(digest.nextSafeAction).toBe('build_safe_db_read_export_package');
  });

  it('blocks when owner review packet is missing', () => {
    const digest = buildTierUpdateD8EvidenceOperatorDigest({
      safeDbReadExportPackage: buildPackage(),
      sourceHeadSha: SOURCE_HEAD_SHA,
      sourceHash: SOURCE_HASH,
      exportedAt: EXPORTED_AT
    });

    expect(digest.status).toBe('BLOCKED');
    expect(digest.compactBlockerCodes).toContain('owner_review_packet_missing');
    expect(digest.nextSafeAction).toBe('build_owner_review_packet');
  });

  it.each([
    ['package BLOCKED', { status: 'BLOCKED' }, {}, 'safe_db_read_export_package_blocked'],
    ['owner BLOCKED', {}, { status: 'BLOCKED' }, 'owner_review_packet_blocked'],
    ['package blocker', { blockers: ['missing_safe_rows'] }, {}, 'package:missing_safe_rows'],
    ['owner blocker', {}, { blockers: ['owner_packet_missing'] }, 'ownerReviewPacket:owner_packet_missing']
  ])('blocks on %s', (_label, packageOverride, ownerOverride, reason) => {
    const digest = buildDigest(packageOverride, ownerOverride);
    expect(digest.status).toBe('BLOCKED');
    expect(digest.compactBlockerCodes).toContain(reason);
  });

  it('blocks on unsafe reason codes', () => {
    const digest = buildDigest({ unsafeReasonCodes: ['unsafe_safe_value'] });
    expect(digest.status).toBe('BLOCKED');
    expect(digest.compactUnsafeReasonCodes).toContain('package:unsafe_safe_value');
    expect(digest.nextSafeAction).toBe('review_unsafe_safe_db_export_evidence');
  });

  it('uses NEEDS_REVIEW for zero records', () => {
    const digest = buildDigest({
      recordCount: 0,
      entityCounts: {},
      jsonlSha256Summary: JSONL_HASH
    });

    expect(digest.status).toBe('NEEDS_REVIEW');
    expect(digest.compactBlockerCodes).not.toContain('record_count_zero');
    expect(digest.nextSafeAction).toBe('add_mock_or_injected_safe_rows');
  });

  it('blocks disallowed entities', () => {
    const digest = buildDigest({ entityCounts: { scheduled_tier_update: 1, tx_receipt_evidence: 1 } });
    expect(digest.status).toBe('BLOCKED');
    expect(digest.disallowedEntityCount).toBe(1);
    expect(digest.allowedEntities).toEqual(['scheduled_tier_update', 'job_run']);
  });

  it.each(['runtime_ready', 'staging_ready', 'production_ready'])(
    'blocks forbidden readiness claim %s',
    (readinessClaim) => {
      const digest = buildDigest({ readinessClaim });
      expect(digest.status).toBe('BLOCKED');
      expect(digest.compactBlockerCodes).toContain('no_runtime_boundary_violation');
      expect(digest.readinessClaim).toBe('none');
    }
  );

  it.each([
    ['stagingNoTxPreflightStatus', 'READY'],
    ['runtimeReadinessClaimed', true],
    ['productionReadinessClaimed', true],
    ['actualDbExport', true],
    ['realDbQuery', true],
    ['prismaClientUsed', true],
    ['fileExported', true],
    ['artifactUploaded', true],
    ['dockerSmoke', true]
  ])('blocks no-runtime boundary violation %s', (key, value) => {
    const digest = buildDigest({ [key]: value });
    expect(digest.status).toBe('BLOCKED');
    expect(digest.compactBlockerCodes).toContain('no_runtime_boundary_violation');
    if (key === 'stagingNoTxPreflightStatus') {
      expect(digest.stagingNoTxPreflightStatus).toBe('BLOCKED');
    } else {
      expect(digest[key as 'actualDbExport']).toBe(false);
    }
  });

  it('does not include raw JSONL or raw identifiers', () => {
    const digest = buildDigest({
      jsonl: '{"raw":"payload"}\n',
      rawWallet: 'raw wallet',
      rawTxHash: 'raw txHash',
      rawCheckpoint: 'raw checkpoint',
      rawEnv: 'DATABASE_URL=unsafe',
      privatePath: 'C:\\Users\\unsafe'
    });
    const text = stringify(digest);

    expect(digest.status).toBe('BLOCKED');
    expect(text).not.toContain('operator-d8j2');
    expect(text).not.toContain('run-d8j2');
    expect(text).not.toContain('DATABASE_URL=');
    expect(text).not.toContain('C:\\Users\\unsafe');
    expect(text).not.toContain('raw wallet');
    expect(text).not.toContain('raw txHash');
    expect(text).not.toContain('raw checkpoint');
  });

  it('surfaces jsonlSha256Summary only as hash summary', () => {
    const digest = buildDigest();
    const text = stringify(digest);
    expect(digest.jsonlSha256Summary).toBe(JSONL_HASH);
    expect(text).toContain(JSONL_HASH);
    expect(text).not.toContain('"jsonl":');
  });

  it('keeps nextSafeAction singular and safe summary only', () => {
    const digest = buildDigest();
    expect(typeof digest.nextSafeAction).toBe('string');
    expect(Array.isArray(digest.nextSafeAction)).toBe(false);
    expect(digest.safeSummaryOnly).toBe(true);
  });

  it('summarizes source metadata without raw operator or run key', () => {
    const digest = buildDigest();
    expect(digest.operatorSummary.operatorId).toEqual({ provided: true, safeSummaryOnly: true });
    expect(digest.operatorSummary.runKey).toEqual({ provided: true, safeSummaryOnly: true });
    expect(digest.operatorSummary.sourceHeadSha).toEqual({ provided: true, safeSummaryOnly: true });
    expect(digest.operatorSummary.sourceHash).toEqual({ provided: true, safeSummaryOnly: true });
    expect(digest.operatorSummary.exportedAt).toEqual({ provided: true, safeSummaryOnly: true });
  });

  it('does not import Prisma, env DB URL, file export, artifact upload, route, or Docker smoke behavior', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|PrismaClient|process\.env\.DATABASE_URL/);
    expect(source).not.toMatch(/writeFile|createWriteStream|uploadArtifact|router\.|cron|docker\s+(run|compose|smoke)/i);
    expect(source).not.toMatch(/sendTransaction|new ethers|new Contract/);
  });
});
