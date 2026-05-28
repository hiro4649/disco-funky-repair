import fs from 'fs';
import path from 'path';
import {
  buildClaimScheduledTierUpdateData,
  buildConfirmedUpdateData,
  buildDeterministicTierUpdateBatchId,
  buildFailedUpdateData,
  buildTxSentUpdateData,
  isLockExpired,
  isRetryableScheduledTierStatus,
  isTerminalScheduledTierStatus,
  normalizeTierUpdateSafeError,
  SCHEDULED_TIER_UPDATE_STATUSES
} from '../tierUpdateState';

const backendRoot = path.resolve(__dirname, '../../../../');
const schemaPath = path.join(backendRoot, 'prisma/schema.prisma');
const migrationPath = path.join(
  backendRoot,
  'prisma/migrations/20260528090000_add_scheduled_tier_update_state_machine/migration.sql'
);

const txHash = `0x${'a'.repeat(64)}`;
const contractAddress = '0x0000000000000000000000000000000000000001';
const fromAddress = '0x0000000000000000000000000000000000000002';
const toAddress = '0x0000000000000000000000000000000000000003';

describe('tierUpdateState', () => {
  it('keeps the ScheduledTierUpdate schema and migration foundation visible', () => {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    expect(schema).toContain('enum ScheduledTierUpdateStatus');
    expect(schema).toContain('status             ScheduledTierUpdateStatus @default(PENDING)');
    expect(schema).toContain('lockedBy           String?');
    expect(schema).toContain('heartbeatAt        DateTime?');
    expect(schema).toContain('batchId            String?');
    expect(schema).toContain('txHash             String?');
    expect(schema).toContain('txReceiptStatus    Int?');
    expect(schema).toContain('txGasUsed          String?');
    expect(schema).toContain('processed          Boolean                   @default(false)');
    expect(schema).toContain('@@index([status, scheduledAt])');
    expect(schema).toContain('@@index([status, heartbeatAt])');

    expect(migration).toContain('CREATE TYPE "public"."ScheduledTierUpdateStatus"');
    expect(migration).toContain('ADD COLUMN "status" "public"."ScheduledTierUpdateStatus" NOT NULL DEFAULT');
    expect(migration).not.toContain('ADD COLUMN "processed"');
    expect(migration).toContain('CREATE INDEX "ScheduledTierUpdate_txHash_idx"');
  });

  it('classifies terminal and retryable statuses without changing runtime behavior', () => {
    expect(isTerminalScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.CONFIRMED)).toBe(true);
    expect(isTerminalScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.FAILED)).toBe(true);
    expect(isTerminalScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT)).toBe(true);
    expect(isTerminalScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW)).toBe(true);
    expect(isTerminalScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.CANCELED)).toBe(true);
    expect(isTerminalScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.PENDING)).toBe(false);
    expect(isTerminalScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED)).toBe(false);
    expect(isTerminalScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT)).toBe(false);

    expect(isRetryableScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.PENDING)).toBe(true);
    expect(isRetryableScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.FAILED)).toBe(true);
    expect(isRetryableScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT)).toBe(true);
    expect(isRetryableScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED)).toBe(false);
    expect(isRetryableScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT)).toBe(false);
    expect(isRetryableScheduledTierStatus(SCHEDULED_TIER_UPDATE_STATUSES.CONFIRMED)).toBe(false);
  });

  it('treats missing and past locks as claimable while preserving future locks', () => {
    const now = new Date('2026-05-28T00:00:00.000Z');

    expect(isLockExpired(null, now)).toBe(true);
    expect(isLockExpired(undefined, now)).toBe(true);
    expect(isLockExpired(new Date('2026-05-27T23:59:59.000Z'), now)).toBe(true);
    expect(isLockExpired(new Date('2026-05-28T00:00:00.000Z'), now)).toBe(true);
    expect(isLockExpired(new Date('2026-05-28T00:00:01.000Z'), now)).toBe(false);
  });

  it('builds a deterministic batch id without using Date.now', () => {
    const input = {
      scheduledTierUpdateId: 42,
      userId: 7,
      expectedTier: 181,
      scheduledAt: new Date('2026-06-01T00:00:00.000Z')
    };

    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1).mockReturnValueOnce(999999);
    const first = buildDeterministicTierUpdateBatchId(input);
    const second = buildDeterministicTierUpdateBatchId(input);
    nowSpy.mockRestore();

    expect(first).toBe(second);
    expect(first).toMatch(/^0x[a-f0-9]{64}$/);
    expect(buildDeterministicTierUpdateBatchId({
      ...input,
      scheduledTierUpdateId: 43
    })).not.toBe(first);
  });

  it('builds claim data without marking rows processed', () => {
    const now = new Date('2026-05-28T00:00:00.000Z');

    const data = buildClaimScheduledTierUpdateData({
      workerId: 'tier-worker-1',
      now,
      nextAttempt: 2,
      lockDurationMs: 60_000
    });

    expect(data).toEqual(expect.objectContaining({
      status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
      attempt: 2,
      lockedBy: 'tier-worker-1',
      lockedAt: now,
      heartbeatAt: now,
      lockExpiresAt: new Date('2026-05-28T00:01:00.000Z')
    }));
    expect(data).not.toHaveProperty('processed');
  });

  it('builds tx-sent data without changing the existing processed flag', () => {
    const sentAt = new Date('2026-05-28T00:02:00.000Z');
    const batchId = buildDeterministicTierUpdateBatchId({
      scheduledTierUpdateId: 42,
      userId: 7,
      expectedTier: 181,
      scheduledAt: '2026-06-01T00:00:00.000Z'
    });

    const data = buildTxSentUpdateData({
      txHash,
      txChainId: 56,
      txContractAddress: contractAddress,
      txFrom: fromAddress,
      txTo: toAddress,
      batchId,
      sentAt
    });

    expect(data).toEqual(expect.objectContaining({
      status: SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT,
      txHash,
      txChainId: 56,
      txContractAddress: contractAddress,
      txFrom: fromAddress,
      txTo: toAddress,
      batchId,
      sentAt,
      heartbeatAt: sentAt
    }));
    expect(data).not.toHaveProperty('processed');
  });

  it('builds confirmation data with receipt evidence and processed compatibility', () => {
    const confirmedAt = new Date('2026-05-28T00:03:00.000Z');
    const receiptTimestamp = new Date('2026-05-28T00:02:30.000Z');

    expect(buildConfirmedUpdateData({
      txReceiptStatus: 1,
      txBlockNumber: '123456',
      txReceiptTimestamp: receiptTimestamp,
      txGasUsed: 21000n,
      confirmedAt
    })).toEqual(expect.objectContaining({
      status: SCHEDULED_TIER_UPDATE_STATUSES.CONFIRMED,
      processed: true,
      txReceiptStatus: 1,
      txBlockNumber: 123456n,
      txReceiptTimestamp: receiptTimestamp,
      txGasUsed: '21000',
      confirmedAt,
      heartbeatAt: confirmedAt
    }));
  });

  it('stores only safe failure classifications and safe summaries', () => {
    const failedAt = new Date('2026-05-28T00:04:00.000Z');

    expect(buildFailedUpdateData({
      safeErrorKind: 'tx_receipt_timeout',
      safeSummary: {
        reason: 'receipt_not_observed',
        retryable: true
      },
      failedAt
    })).toEqual(expect.objectContaining({
      status: SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
      safeErrorKind: 'tx_receipt_timeout',
      safeSummary: {
        reason: 'receipt_not_observed',
        retryable: true
      },
      failedAt,
      heartbeatAt: failedAt
    }));

    expect(() => buildFailedUpdateData({
      safeErrorKind: 'unknown',
      safeSummary: {
        errorMessage: 'raw provider message must not be stored'
      },
      failedAt
    })).toThrow('unsafe_tier_update_safe_summary');
  });

  it('normalizes raw errors into enum-like safe kinds without returning raw messages', () => {
    expect(normalizeTierUpdateSafeError(new Error('provider timed out with sensitive details'))).toBe('provider_timeout');
    expect(normalizeTierUpdateSafeError(new Error('insufficient funds for gas'))).toBe('insufficient_balance');
    expect(normalizeTierUpdateSafeError(new Error('execution reverted'))).toBe('tx_reverted');
    expect(normalizeTierUpdateSafeError(new Error('wrong network chain id'))).toBe('chain_mismatch');
    expect(normalizeTierUpdateSafeError(new Error('DATABASE_URL=postgres://example'))).toBe('unknown');
  });
});
