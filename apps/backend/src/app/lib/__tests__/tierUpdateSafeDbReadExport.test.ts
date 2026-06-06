import {
  buildTierUpdateSafeDbReadExportPlan,
  runTierUpdateSafeDbReadExportFromSource,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT
} from '../tierUpdateSafeDbReadExport';

const SOURCE_HEAD_SHA = 'a'.repeat(40);
const SOURCE_HASH = 'b'.repeat(40);
const EXPORTED_AT = new Date('2026-06-05T00:00:00.000Z');

const buildValidPlan = () => buildTierUpdateSafeDbReadExportPlan({
  entities: ['scheduled_tier_update', 'job_run', 'tx_receipt_evidence', 'staging_evidence'],
  rowLimit: 10,
  auditExportId: 'audit-export-1',
  sourceHeadSha: SOURCE_HEAD_SHA,
  sourceHash: SOURCE_HASH,
  exportedAt: EXPORTED_AT
});

const buildStagingEvidence = () => ({
  evidenceKind: 'tier_update_staging_no_tx_preflight_evidence' as const,
  status: 'EVIDENCE_READY' as const,
  readinessClaim: 'none' as const,
  stagingNoTxPreflightStatus: 'BLOCKED' as const,
  sourceHeadSha: SOURCE_HEAD_SHA,
  runIdSummary: { provided: true, safeSummaryOnly: true as const },
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
  safeSummaryOnly: true as const
});

const buildReadOnlySource = () => ({
  readScheduledTierUpdates: jest.fn(() => [{
    id: 1,
    userId: 10,
    scheduledAt: EXPORTED_AT,
    expectedTier: 180,
    currentTier: 30,
    processed: false,
    status: 'PENDING',
    attempt: 0,
    maxAttempts: 3,
    lockedBy: 'worker-1',
    lockedAt: null,
    heartbeatAt: null,
    lockExpiresAt: null,
    batchId: 'batch-1',
    txHash: 'tx-summary-1',
    txChainId: 11155111,
    txContractAddress: '0x' + '2'.repeat(40),
    txFrom: '0x' + '3'.repeat(40),
    txTo: '0x' + '4'.repeat(40),
    txBlockNumber: 123,
    txReceiptStatus: 1,
    txReceiptTimestamp: EXPORTED_AT,
    txGasUsed: 456,
    sentAt: null,
    confirmedAt: null,
    failedAt: null,
    safeErrorKind: null,
    safeSummary: { kind: 'scheduled_tier_update_fixture' }
  }]),
  readJobRuns: jest.fn(() => [{
    id: 2,
    jobName: 'tier_update_safe_db_read_export',
    runKey: 'run-key-1',
    status: 'SUCCEEDED',
    startedAt: EXPORTED_AT,
    finishedAt: EXPORTED_AT,
    heartbeatAt: EXPORTED_AT,
    attempt: 1,
    maxAttempts: 3,
    lockedBy: 'worker-1',
    checkpoint: { kind: 'checkpoint_summary' },
    safeErrorKind: null,
    safeSummary: { kind: 'job_run_fixture' }
  }]),
  readTxReceiptEvidence: jest.fn(() => [{
    txHash: 'tx-summary-2',
    txChainId: 11155111,
    txContractAddress: '0x' + '6'.repeat(40),
    txFrom: '0x' + '7'.repeat(40),
    txTo: '0x' + '8'.repeat(40),
    txBlockNumber: 789,
    txReceiptStatus: 1,
    confirmationDepth: 12,
    finalityStatus: 'final',
    lastCheckedAt: EXPORTED_AT,
    safeErrorKind: null,
    reconciliationStatus: 'confirmed',
    manualReviewReason: null,
    resumeKey: 'resume-key-1'
  }]),
  readStagingEvidence: jest.fn(() => [buildStagingEvidence()])
});

describe('tierUpdateSafeDbReadExport', () => {
  it('builds a valid safe DB read export plan', () => {
    const plan = buildValidPlan();

    expect(plan.status).toBe('READY');
    expect(plan.entities).toEqual(TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES);
    expect(plan.rowLimit).toBe(10);
    expect(plan.readinessClaim).toBe('none');
    expect(plan.evidenceOrigin).toBe('db_safe_summary');
    expect(plan.safeSummaryOnly).toBe(true);
  });

  it('blocks deferred and unknown entities', () => {
    const deferred = buildTierUpdateSafeDbReadExportPlan({
      entities: ['prize', 'ticket_code'],
      rowLimit: 10,
      auditExportId: 'audit-export-1',
      sourceHeadSha: SOURCE_HEAD_SHA,
      sourceHash: SOURCE_HASH,
      exportedAt: EXPORTED_AT
    });
    const unknown = buildTierUpdateSafeDbReadExportPlan({
      entities: ['unknown_entity'],
      rowLimit: 10,
      auditExportId: 'audit-export-1',
      sourceHeadSha: SOURCE_HEAD_SHA,
      sourceHash: SOURCE_HASH,
      exportedAt: EXPORTED_AT
    });

    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES).toContain('prize');
    expect(deferred.status).toBe('DEFERRED');
    expect(deferred.deferredEntities).toEqual(['prize', 'ticket_code']);
    expect(unknown.status).toBe('BLOCKED');
    expect(unknown.blockers).toContain('entity_not_allowed:unknown_entity');
  });

  it('requires rowLimit and blocks rowLimit above max', () => {
    const missing = buildTierUpdateSafeDbReadExportPlan({
      entities: ['scheduled_tier_update'],
      auditExportId: 'audit-export-1',
      sourceHeadSha: SOURCE_HEAD_SHA,
      sourceHash: SOURCE_HASH,
      exportedAt: EXPORTED_AT
    });
    const tooLarge = buildTierUpdateSafeDbReadExportPlan({
      entities: ['scheduled_tier_update'],
      rowLimit: TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT + 1,
      auditExportId: 'audit-export-1',
      sourceHeadSha: SOURCE_HEAD_SHA,
      sourceHash: SOURCE_HASH,
      exportedAt: EXPORTED_AT
    });

    expect(missing.status).toBe('BLOCKED');
    expect(missing.blockers).toContain('row_limit_required');
    expect(tooLarge.status).toBe('BLOCKED');
    expect(tooLarge.blockers).toContain('row_limit_exceeds_max');
  });

  it('requires auditExportId, sourceHeadSha, sourceHash, and exportedAt', () => {
    const plan = buildTierUpdateSafeDbReadExportPlan({
      entities: ['scheduled_tier_update'],
      rowLimit: 10
    });

    expect(plan.status).toBe('BLOCKED');
    expect(plan.missingEvidence).toEqual(expect.arrayContaining([
      'auditExportId',
      'sourceHeadSha',
      'sourceHash',
      'exportedAt'
    ]));
  });

  it('blocks forbidden readiness claims', () => {
    const plan = buildTierUpdateSafeDbReadExportPlan({
      entities: ['scheduled_tier_update'],
      rowLimit: 10,
      auditExportId: 'audit-export-1',
      sourceHeadSha: SOURCE_HEAD_SHA,
      sourceHash: SOURCE_HASH,
      exportedAt: EXPORTED_AT,
      readinessClaim: 'runtime_ready'
    });

    expect(plan.status).toBe('BLOCKED');
    expect(plan.unsafeReasonCodes).toContain('readiness_claim_forbidden');
  });

  it('blocks missing readOnlySource', async () => {
    const result = await runTierUpdateSafeDbReadExportFromSource({
      plan: buildValidPlan(),
      operatorId: 'operator-1',
      reviewerId: 'reviewer-1',
      runKey: 'run-1'
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain('read_only_source_required');
    expect(result.noDbQueryByModule).toBe(true);
    expect(result.noPrismaClient).toBe(true);
  });

  it('blocks readOnlySource with write, transaction, or Prisma-like keys', async () => {
    const result = await runTierUpdateSafeDbReadExportFromSource({
      plan: buildValidPlan(),
      readOnlySource: {
        ...buildReadOnlySource(),
        update: jest.fn(),
        $transaction: jest.fn(),
        prisma: {}
      },
      operatorId: 'operator-1',
      reviewerId: 'reviewer-1',
      runKey: 'run-1'
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.sourceSummary.writeMethodDetected).toBe(true);
    expect(result.sourceSummary.mutationMethodDetected).toBe(true);
    expect(result.sourceSummary.transactionMethodDetected).toBe(true);
    expect(result.unsafeReasonCodes).toEqual(expect.arrayContaining([
      'read_only_source_forbidden_key:$transaction',
      'read_only_source_forbidden_key:prisma',
      'read_only_source_forbidden_key:update'
    ]));
  });

  it('converts mock read-only source rows through D8A-D8E boundaries', async () => {
    const source = buildReadOnlySource();
    const result = await runTierUpdateSafeDbReadExportFromSource({
      plan: buildValidPlan(),
      readOnlySource: source,
      operatorId: 'operator-1',
      reviewerId: 'reviewer-1',
      runKey: 'run-1'
    });

    expect(result.status).toBe('EXPORT_EVIDENCE_READY');
    expect(source.readScheduledTierUpdates).toHaveBeenCalled();
    expect(source.readJobRuns).toHaveBeenCalled();
    expect(source.readTxReceiptEvidence).toHaveBeenCalled();
    expect(source.readStagingEvidence).toHaveBeenCalled();
    expect(result.packageSummary.recordCount).toBe(4);
    expect(result.packageSummary.entityCounts).toEqual({
      scheduled_tier_update: 1,
      job_run: 1,
      tx_receipt_evidence: 1,
      staging_evidence: 1
    });
    expect(result.packageSummary.readinessClaimCounts).toEqual({ none: 4 });
    expect(result.packageSummary.evidenceOriginCounts).toEqual({ db_safe_summary: 4 });
    expect(result.packageSummary.jsonlSha256Summary).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(result.reviewPacketSummary.status).toBe('OWNER_REVIEW_READY');
    expect(result.reviewPacketSummary.stagingNoTxPreflightStatus).toBe('BLOCKED');
    expect(result.readinessClaim).toBe('none');
    expect(result.stagingNoTxPreflightStatus).toBe('BLOCKED');
  });

  it('does not use PASS as foundation status and does not expose raw JSONL by default', async () => {
    const result = await runTierUpdateSafeDbReadExportFromSource({
      plan: buildValidPlan(),
      readOnlySource: buildReadOnlySource(),
      operatorId: 'operator-1',
      reviewerId: 'reviewer-1',
      runKey: 'run-1',
      includeJsonl: true
    });

    expect(result.status).not.toBe('PASS');
    expect(result.packageSummary.includeJsonl).toBe(false);
    expect(JSON.stringify(result)).not.toContain('"jsonl"');
    expect(JSON.stringify(result)).not.toContain('operator-1');
    expect(JSON.stringify(result)).not.toContain('reviewer-1');
    expect(JSON.stringify(result)).not.toContain('run-1');
  });

  it('blocks forbidden keys, unsafe values, and non-allowlisted fields in source rows', async () => {
    const result = await runTierUpdateSafeDbReadExportFromSource({
      plan: buildTierUpdateSafeDbReadExportPlan({
        entities: ['scheduled_tier_update'],
        rowLimit: 10,
        auditExportId: 'audit-export-1',
        sourceHeadSha: SOURCE_HEAD_SHA,
        sourceHash: SOURCE_HASH,
        exportedAt: EXPORTED_AT
      }),
      readOnlySource: {
        readScheduledTierUpdates: () => [{
          id: 1,
          status: 'PENDING',
          rawReceipt: 'raw receipt payload',
          endpoint: 'https://example.invalid',
          unlistedField: 'not-allowed'
        }]
      },
      operatorId: 'operator-1',
      reviewerId: 'reviewer-1',
      runKey: 'run-1'
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.unsafeReasonCodes).toEqual(expect.arrayContaining([
      'forbidden_key:scheduled_tier_update.endpoint',
      'forbidden_key:scheduled_tier_update.rawReceipt',
      'field_not_allowed:scheduled_tier_update.unlistedField'
    ]));
  });

  it('blocks D8H raw-row findings as global D8G forbidden keys', async () => {
    const result = await runTierUpdateSafeDbReadExportFromSource({
      plan: buildTierUpdateSafeDbReadExportPlan({
        entities: ['scheduled_tier_update', 'job_run'],
        rowLimit: 10,
        auditExportId: 'audit-export-1',
        sourceHeadSha: SOURCE_HEAD_SHA,
        sourceHash: SOURCE_HASH,
        exportedAt: EXPORTED_AT
      }),
      readOnlySource: {
        readScheduledTierUpdates: () => [{
          id: 1,
          status: 'PENDING',
          rawTxHash: '0x' + '9'.repeat(64),
          rawWallet: '0x' + '8'.repeat(40),
          rawDbRow: { id: 1 }
        }],
        readJobRuns: () => [{
          id: 2,
          status: 'SUCCEEDED',
          rawCheckpoint: { rawPayload: 'raw payload' }
        }]
      },
      operatorId: 'operator-1',
      reviewerId: 'reviewer-1',
      runKey: 'run-1'
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.unsafeReasonCodes).toEqual(expect.arrayContaining([
      'forbidden_key:scheduled_tier_update.rawDbRow',
      'forbidden_key:scheduled_tier_update.rawTxHash',
      'forbidden_key:scheduled_tier_update.rawWallet',
      'forbidden_key:job_run.rawCheckpoint'
    ]));
  });

  it('preserves safe summary aliases while blocking raw fields', () => {
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS).not.toContain('tx_hash_summary');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS).not.toContain('tx_contract_address_summary');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS).not.toContain('tx_from_summary');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS).not.toContain('tx_to_summary');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS).not.toContain('user_identity_summary');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS).not.toContain('checkpoint_summary');
  });

  it('exports allowlist and forbidden key policy constants', () => {
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST.scheduled_tier_update).toContain('txHash');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST.job_run).toContain('checkpoint');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST.tx_receipt_evidence).toContain('resumeKey');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST.staging_evidence).toContain('noTxExecution');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS).toContain('DATABASE_URL');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS).toContain('rawReceipt');
    expect(TIER_UPDATE_SAFE_DB_READ_EXPORT_FORBIDDEN_KEYS).toEqual(expect.arrayContaining([
      'rawCheckpoint',
      'rawTxHash',
      'rawWallet',
      'rawDbRow'
    ]));
  });

  it('keeps the module disconnected from Prisma, env DB URLs, file writes, routes, cron, runtime, RPC, tx, and Docker smoke', () => {
    const fs = jest.requireActual('fs') as typeof import('fs');
    const path = jest.requireActual('path') as typeof import('path');
    const source = fs.readFileSync(
      path.join(__dirname, '..', 'tierUpdateSafeDbReadExport.ts'),
      'utf8'
    );

    expect(source).not.toMatch(/from ['"][^'"]*prisma/i);
    expect(source).not.toMatch(/new\s+\w*Prisma/i);
    expect(source).not.toContain('process.env.DATABASE_URL');
    expect(source).not.toContain('writeFile');
    expect(source).not.toContain('createWriteStream');
    expect(source).not.toContain('upload');
    expect(source).not.toContain('router.');
    expect(source).not.toContain('cron');
    expect(source).not.toContain('trackingService');
    expect(source).not.toContain('main.ts');
    expect(source).not.toContain('new ethers');
    expect(source).not.toContain('new Wallet');
    expect(source).not.toContain('new Contract');
    expect(source).not.toContain('sendToWallet');
    expect(source).not.toContain('Docker');
  });
});
