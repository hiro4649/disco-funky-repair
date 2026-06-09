import fs from 'fs';
import path from 'path';

import {
  TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS,
  buildTierUpdateActualSafeRowExportDesignGate,
  type BuildTierUpdateActualSafeRowExportDesignGateInput
} from '../tierUpdateActualSafeRowExportDesignGate';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = new Date('2026-06-10T00:00:00.000Z');
const JSONL_HASH = `sha256:${'c'.repeat(64)}`;
const backendRoot = path.resolve(__dirname, '../../../../');
const sourcePath = path.join(backendRoot, 'src/app/lib/tierUpdateActualSafeRowExportDesignGate.ts');

type DesignGateInput = BuildTierUpdateActualSafeRowExportDesignGateInput;

const requiredForbiddenFields = [
  'raw_db_dump',
  'full_wallet_address',
  'raw_private_path',
  'local_file_path',
  'raw_env',
  'db_url',
  'rpc_url',
  'private_key',
  'jwt',
  'cookie',
  'authorization_header',
  'raw_provider_error',
  'raw_receipt_payload',
  'raw_checkpoint_payload',
  'raw_jsonl_body'
];

const buildD8Refresh = (overrides: Record<string, unknown> = {}): NonNullable<DesignGateInput['d8StagingOwnerReviewRefresh']> => ({
  refreshKind: 'tier_update_d8_staging_owner_review_refresh',
  schemaVersion: '1',
  status: 'OWNER_REVIEW_READY',
  safeSummaryOnly: true,
  skillProfileId: 'FUNKY_NO_TX_NO_RUNTIME_PROFILE',
  traceLabel: 'd8_staging_owner_review_refresh',
  stagingNoTxPreflightStatus: 'BLOCKED',
  readinessClaim: 'none',
  d8DigestStatus: 'OWNER_REVIEW_READY',
  ownerReviewPacketStatus: 'OWNER_REVIEW_READY',
  safeDbReadExportPackageStatus: 'EXPORT_PACKAGE_READY',
  stagingEvidenceStatus: 'EVIDENCE_READY',
  recordCount: 2,
  entityCounts: { scheduled_tier_update: 1, job_run: 1 },
  blockerCount: 0,
  unsafeReasonCount: 0,
  compactBlockerCodes: [],
  compactUnsafeReasonCodes: [],
  noTxBoundary: {
    noActualDbExport: true,
    noRealDbQuery: true,
    noPrismaClient: true,
    noFileExport: true,
    noArtifactUpload: true,
    noDockerSmokeChange: true,
    noTxSend: true,
    noRuntimeReadiness: true,
    noProductionReadiness: true,
    stagingNoTxPassClaimed: false
  },
  nextSafeAction: 'prepare_pr_d8l_actual_safe_row_export_plan',
  ...overrides
});

const buildDigest = (overrides: Record<string, unknown> = {}): NonNullable<DesignGateInput['d8EvidenceDigest']> => ({
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

const buildSafePackage = (overrides: Record<string, unknown> = {}): NonNullable<DesignGateInput['safeDbReadExportPackage']> => ({
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

const buildGate = (
  overrides: Partial<DesignGateInput> = {}
) => buildTierUpdateActualSafeRowExportDesignGate({
  d8StagingOwnerReviewRefresh: buildD8Refresh(),
  d8EvidenceDigest: buildDigest(),
  safeDbReadExportPackage: buildSafePackage(),
  requestedEntities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  proposedJsonlSchemaFields: [...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS],
  forbiddenFieldPolicy: {
    required: true,
    blockedFields: requiredForbiddenFields
  },
  sameHeadEvidence: {
    required: true,
    headMatchStatus: 'required_or_pending'
  },
  operatorApproval: {
    required: true,
    status: 'approved'
  },
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT,
  operatorId: 'operator-d8l',
  runKey: 'run-d8l',
  ...overrides
});

const stringify = (value: unknown) => JSON.stringify(value);

describe('tierUpdateActualSafeRowExportDesignGate', () => {
  it('creates DESIGN_READY from valid D8K refresh, digest, package, entities, metadata, and policies', () => {
    const gate = buildGate();

    expect(gate.gateKind).toBe('tier_update_actual_safe_row_export_design_gate');
    expect(gate.schemaVersion).toBe('1');
    expect(gate.status).toBe('DESIGN_READY');
    expect(gate.safeSummaryOnly).toBe(true);
    expect(gate.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(gate.traceLabel).toBe('d8l_actual_safe_row_export_design_gate');
    expect(gate.requestedEntitiesSummary).toEqual({
      requestedCount: 4,
      allowedCount: 4,
      deferredCount: 0,
      safeSummaryOnly: true
    });
    expect(gate.nextSafeAction).toBe('prepare_pr_d8m_actual_safe_row_export_mock_source_contract');
  });

  it('keeps DESIGN_READY separate from actual export and readiness', () => {
    const gate = buildGate();

    expect(gate.status).toBe('DESIGN_READY');
    expect(gate.actualDbQueryEnabled).toBe(false);
    expect(gate.actualDbExportEnabled).toBe(false);
    expect(gate.fileExportEnabled).toBe(false);
    expect(gate.artifactUploadEnabled).toBe(false);
    expect(gate.dockerSmokeChanged).toBe(false);
    expect(gate.stagingNoTxPassClaimed).toBe(false);
    expect(gate.runtimeReadinessClaimed).toBe(false);
    expect(gate.productionReadinessClaimed).toBe(false);
  });

  it.each([
    ['d8StagingOwnerReviewRefresh', { d8StagingOwnerReviewRefresh: undefined }, 'd8_staging_owner_review_refresh_missing', 'build_d8_staging_owner_review_refresh'],
    ['d8EvidenceDigest', { d8EvidenceDigest: undefined }, 'd8_evidence_digest_missing', 'collect_operator_design_approval'],
    ['safeDbReadExportPackage', { safeDbReadExportPackage: undefined }, 'safe_db_read_export_package_missing', 'collect_operator_design_approval']
  ])('blocks when %s is missing', (_label, override, blocker, nextAction) => {
    const gate = buildGate(override);

    expect(gate.status).toBe('BLOCKED');
    expect(gate.compactBlockerCodes).toContain(blocker);
    expect(gate.nextSafeAction).toBe(nextAction);
  });

  it.each([
    ['D8K refresh', { d8StagingOwnerReviewRefresh: buildD8Refresh({ status: 'BLOCKED' }) }, 'd8_staging_owner_review_refresh_not_ready'],
    ['digest', { d8EvidenceDigest: buildDigest({ status: 'BLOCKED' }) }, 'd8_evidence_digest_not_ready'],
    ['safe package', { safeDbReadExportPackage: buildSafePackage({ status: 'BLOCKED' }) }, 'safe_db_read_export_package_not_ready']
  ])('blocks when upstream %s is BLOCKED', (_label, override, blocker) => {
    const gate = buildGate(override);

    expect(gate.status).toBe('BLOCKED');
    expect(gate.compactBlockerCodes).toContain(blocker);
  });

  it('uses NEEDS_REVIEW when requested entities are empty', () => {
    const gate = buildGate({ requestedEntities: [] });

    expect(gate.status).toBe('NEEDS_REVIEW');
    expect(gate.compactMissingRequirementCodes).toContain('requested_entities_required');
  });

  it.each(['unknown_entity', 'Prize', 'PrizeTransactions', 'NFT metadata', 'TokenDetail', 'TicketCode', 'wallet_summary'])(
    'blocks unsupported or deferred entity %s',
    (entity) => {
      const gate = buildGate({ requestedEntities: ['scheduled_tier_update', entity] });

      expect(gate.status).toBe('BLOCKED');
      expect(gate.disallowedEntityCount).toBeGreaterThan(0);
      expect(gate.compactBlockerCodes).toEqual(expect.arrayContaining([
        entity === 'unknown_entity' ? 'unsupported_entity_requested' : 'deferred_entity_requested'
      ]));
      expect(gate.nextSafeAction).toBe('remove_unsupported_entities');
    }
  );

  it.each([...TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS])(
    'blocks when metadata field %s is missing',
    (field) => {
      const gate = buildGate({
        proposedJsonlSchemaFields: TIER_UPDATE_ACTUAL_SAFE_ROW_EXPORT_REQUIRED_METADATA_FIELDS.filter((entry) => entry !== field)
      });

      expect(gate.status).toBe('BLOCKED');
      expect(gate.requiredMetadataStatus).toBe('missing');
      expect(gate.compactBlockerCodes).toContain(`metadata_missing:${field}`);
      expect(gate.nextSafeAction).toBe('add_required_safe_jsonl_metadata');
    }
  );

  it('blocks when forbidden field policy is missing', () => {
    const gate = buildGate({ forbiddenFieldPolicy: undefined });

    expect(gate.status).toBe('BLOCKED');
    expect(gate.forbiddenFieldPolicyStatus).toBe('missing');
    expect(gate.compactBlockerCodes).toContain('forbidden_field_policy_missing');
    expect(gate.nextSafeAction).toBe('define_forbidden_field_policy');
  });

  it('blocks when same-head evidence is not required', () => {
    const gate = buildGate({ sameHeadEvidence: { required: false, headMatchStatus: 'required_or_pending' } });

    expect(gate.status).toBe('BLOCKED');
    expect(gate.sameHeadEvidenceStatus).toBe('blocked');
    expect(gate.compactBlockerCodes).toContain('same_head_evidence_required');
    expect(gate.nextSafeAction).toBe('require_same_head_evidence');
  });

  it('blocks when same-head evidence status is not required_or_pending', () => {
    const gate = buildGate({ sameHeadEvidence: { required: true, headMatchStatus: 'matched' } });

    expect(gate.status).toBe('BLOCKED');
    expect(gate.compactBlockerCodes).toContain('same_head_evidence_not_required_or_pending');
  });

  it('blocks when operator approval is not required', () => {
    const gate = buildGate({ operatorApproval: { required: false, status: 'approved' } });

    expect(gate.status).toBe('BLOCKED');
    expect(gate.operatorApprovalStatus).toBe('blocked');
    expect(gate.compactBlockerCodes).toContain('operator_approval_required');
  });

  it('uses NEEDS_REVIEW when operator approval is pending', () => {
    const gate = buildGate({ operatorApproval: { required: true, status: 'pending' } });

    expect(gate.status).toBe('NEEDS_REVIEW');
    expect(gate.operatorApprovalStatus).toBe('pending');
    expect(gate.compactMissingRequirementCodes).toContain('operator_approval_pending');
    expect(gate.nextSafeAction).toBe('collect_operator_design_approval');
  });

  it.each([
    ['actualDbQueryEnabled', true, 'actual_db_query_enabled'],
    ['actualDbExportEnabled', true, 'actual_db_export_enabled'],
    ['prismaClientEnabled', true, 'prisma_client_enabled'],
    ['fileExportEnabled', true, 'file_export_enabled'],
    ['artifactUploadEnabled', true, 'artifact_upload_enabled'],
    ['dockerSmokeChanged', true, 'docker_smoke_changed'],
    ['stagingNoTxPassClaimed', true, 'staging_no_tx_pass_claimed'],
    ['runtimeReadinessClaimed', true, 'runtime_readiness_claimed'],
    ['productionReadinessClaimed', true, 'production_readiness_claimed']
  ])('blocks execution/readiness flag %s', (key, value, blocker) => {
    const gate = buildGate({ [key]: value });

    expect(gate.status).toBe('BLOCKED');
    expect(gate.compactBlockerCodes).toContain(blocker);
    expect(gate[key as 'actualDbQueryEnabled']).toBe(false);
  });

  it('does not expose raw operatorId or runKey', () => {
    const gate = buildGate();
    const text = stringify(gate);

    expect(gate.operatorSummary.operatorId).toEqual({ provided: true, safeSummaryOnly: true });
    expect(gate.operatorSummary.runKey).toEqual({ provided: true, safeSummaryOnly: true });
    expect(text).not.toContain('operator-d8l');
    expect(text).not.toContain('run-d8l');
  });

  it('keeps nextSafeAction singular and safe summary only', () => {
    const gate = buildGate();

    expect(typeof gate.nextSafeAction).toBe('string');
    expect(Array.isArray(gate.nextSafeAction)).toBe(false);
    expect(gate.safeSummaryOnly).toBe(true);
  });

  it('does not import Prisma, DB env, file export, artifact upload, routes, runtime wiring, tx, or Docker changes', () => {
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/@prisma\/client|new PrismaClient|process\.env\.DATABASE_URL/);
    expect(source).not.toMatch(/writeFile|createWriteStream|uploadArtifact|router\.|cron|trackingService|main\.ts/i);
    expect(source).not.toMatch(/sendTransaction|new ethers|new Contract|JsonRpcProvider|Wallet/);
    expect(source).not.toMatch(/docker\s+(run|compose|build|smoke)/i);
  });
});
