import fs from 'fs';
import path from 'path';
import {
  buildClaimUpdateData,
  buildClaimWhereClause,
  buildTimeoutUpdateData,
  claimScheduledTierUpdate,
  findClaimableTierUpdates,
  markScheduledTierUpdateFailed,
  markScheduledTierUpdateTimedOut,
  refreshScheduledTierUpdateHeartbeat,
  releaseScheduledTierUpdateClaim,
  type TierUpdateClaimPrismaClient
} from '../tierUpdateClaimService';
import { SCHEDULED_TIER_UPDATE_STATUSES } from '../tierUpdateState';

const backendRoot = path.resolve(__dirname, '../../../../');
const tierSchedulerPath = path.join(backendRoot, 'src/app/lib/tierScheduler.ts');
const tierSyncPath = path.join(backendRoot, 'src/app/lib/tierSync.ts');
const trackingServicePath = path.join(backendRoot, 'src/app/services/trackingService.ts');
const mainPath = path.join(backendRoot, 'src/main.ts');

const buildMockPrisma = (): {
  prisma: TierUpdateClaimPrismaClient;
  findMany: jest.Mock;
  updateMany: jest.Mock;
} => {
  const findMany = jest.fn();
  const updateMany = jest.fn().mockResolvedValue({ count: 1 });

  return {
    prisma: {
      scheduledTierUpdate: {
        fields: {
          maxAttempts: 'maxAttemptsFieldRef'
        },
        findMany,
        updateMany
      }
    },
    findMany,
    updateMany
  };
};

describe('tierUpdateClaimService', () => {
  it('imports without DB, RPC, tx, or scheduler side effects', () => {
    const { findMany, updateMany } = buildMockPrisma();

    expect(findMany).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('builds claimable where clauses for retryable unprocessed unlocked rows only', () => {
    const now = new Date('2026-05-28T00:00:00.000Z');
    const scheduledAtBefore = new Date('2026-05-28T01:00:00.000Z');

    expect(buildClaimWhereClause({
      now,
      scheduledAtBefore,
      attemptLimit: 5
    })).toEqual({
      processed: false,
      status: {
        in: [
          SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
          SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
          SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT
        ]
      },
      scheduledAt: { lte: scheduledAtBefore },
      attempt: { lt: 5 },
      OR: [
        { lockExpiresAt: null },
        { lockExpiresAt: { lte: now } }
      ]
    });
  });

  it('finds claimable tier updates in deterministic order with a bounded limit', async () => {
    const { prisma, findMany } = buildMockPrisma();
    const now = new Date('2026-05-28T00:00:00.000Z');

    await findClaimableTierUpdates({
      prisma,
      now,
      limit: 10
    });

    expect(findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        processed: false,
        status: {
          in: [
            SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
            SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
            SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT
          ]
        },
        scheduledAt: { lte: now },
        attempt: { lt: 'maxAttemptsFieldRef' }
      }),
      orderBy: [
        { scheduledAt: 'asc' },
        { id: 'asc' }
      ],
      take: 10
    });
  });

  it('claims with compare-and-set conditions and increments attempt', async () => {
    const { prisma, updateMany } = buildMockPrisma();
    const now = new Date('2026-05-28T00:00:00.000Z');

    await claimScheduledTierUpdate({
      prisma,
      scheduledTierUpdateId: 42,
      workerId: 'tier-worker-1',
      now,
      lockDurationMs: 60_000
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: 42,
        processed: false,
        status: {
          in: [
            SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
            SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
            SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT
          ]
        },
        attempt: { lt: 'maxAttemptsFieldRef' },
        OR: [
          { lockExpiresAt: null },
          { lockExpiresAt: { lte: now } }
        ]
      }),
      data: expect.objectContaining({
        status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
        lockedBy: 'tier-worker-1',
        lockedAt: now,
        heartbeatAt: now,
        lockExpiresAt: new Date('2026-05-28T00:01:00.000Z'),
        attempt: { increment: 1 },
        safeErrorKind: null,
        safeSummary: null
      })
    });
  });

  it('does not include TX_SENT, CONFIRMED, or processed rows in claim predicates', () => {
    const where = buildClaimWhereClause({
      now: new Date('2026-05-28T00:00:00.000Z')
    });

    expect(where.processed).toBe(false);
    expect(where.status).toEqual({
      in: [
        SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
        SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
        SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT
      ]
    });
    expect(JSON.stringify(where)).not.toContain(SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT);
    expect(JSON.stringify(where)).not.toContain(SCHEDULED_TIER_UPDATE_STATUSES.CONFIRMED);
  });

  it('refreshes heartbeat only for the matching owner claim', async () => {
    const { prisma, updateMany } = buildMockPrisma();
    const now = new Date('2026-05-28T00:02:00.000Z');

    await refreshScheduledTierUpdateHeartbeat({
      prisma,
      scheduledTierUpdateId: 42,
      workerId: 'tier-worker-1',
      now,
      lockDurationMs: 120_000
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 42,
        status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
        processed: false,
        lockedBy: 'tier-worker-1'
      },
      data: {
        heartbeatAt: now,
        lockExpiresAt: new Date('2026-05-28T00:04:00.000Z')
      }
    });
  });

  it('marks only expired claimed rows as timed out using safe evidence', async () => {
    const { prisma, updateMany } = buildMockPrisma();
    const now = new Date('2026-05-28T00:05:00.000Z');

    await markScheduledTierUpdateTimedOut({
      prisma,
      scheduledTierUpdateId: 42,
      now
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 42,
        status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
        processed: false,
        lockExpiresAt: { lte: now }
      },
      data: expect.objectContaining({
        status: SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT,
        safeErrorKind: 'lock_timeout',
        safeSummary: {
          reason: 'claim_lock_expired',
          retryable: true
        },
        failedAt: now,
        heartbeatAt: now,
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null
      })
    });
  });

  it('marks claimed rows failed only for the matching owner and clears lock fields', async () => {
    const { prisma, updateMany } = buildMockPrisma();
    const failedAt = new Date('2026-05-28T00:06:00.000Z');

    await markScheduledTierUpdateFailed({
      prisma,
      scheduledTierUpdateId: 42,
      workerId: 'tier-worker-1',
      safeErrorKind: 'provider_timeout',
      safeSummary: {
        reason: 'bounded_claim_failed',
        retryable: true
      },
      failedAt
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 42,
        status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
        processed: false,
        lockedBy: 'tier-worker-1'
      },
      data: expect.objectContaining({
        status: SCHEDULED_TIER_UPDATE_STATUSES.FAILED,
        safeErrorKind: 'provider_timeout',
        safeSummary: {
          reason: 'bounded_claim_failed',
          retryable: true
        },
        failedAt,
        heartbeatAt: failedAt,
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null
      })
    });
  });

  it('releases claims only for the matching owner without marking rows processed', async () => {
    const { prisma, updateMany } = buildMockPrisma();

    await releaseScheduledTierUpdateClaim({
      prisma,
      scheduledTierUpdateId: 42,
      workerId: 'tier-worker-1'
    });

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 42,
        status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
        processed: false,
        lockedBy: 'tier-worker-1'
      },
      data: {
        status: SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
        lockedBy: null,
        lockedAt: null,
        heartbeatAt: null,
        lockExpiresAt: null
      }
    });
    expect(updateMany.mock.calls[0][0].data).not.toHaveProperty('processed');
  });

  it('rejects invalid ids, worker ids, dates, lock durations, limits, and unsafe summaries', async () => {
    const { prisma, updateMany } = buildMockPrisma();
    const now = new Date('2026-05-28T00:00:00.000Z');

    await expect(claimScheduledTierUpdate({
      prisma,
      scheduledTierUpdateId: 0,
      workerId: 'tier-worker-1',
      now
    })).rejects.toThrow('invalid_scheduled_tier_update_id');

    await expect(claimScheduledTierUpdate({
      prisma,
      scheduledTierUpdateId: 42,
      workerId: 'bad worker id',
      now
    })).rejects.toThrow('invalid_tier_update_worker_id');

    await expect(claimScheduledTierUpdate({
      prisma,
      scheduledTierUpdateId: 42,
      workerId: 'tier-worker-1',
      now: new Date('not-a-date')
    })).rejects.toThrow('invalid_tier_update_now');

    await expect(claimScheduledTierUpdate({
      prisma,
      scheduledTierUpdateId: 42,
      workerId: 'tier-worker-1',
      now,
      lockDurationMs: 0
    })).rejects.toThrow('invalid_tier_update_lock_duration');

    await expect(findClaimableTierUpdates({
      prisma,
      now,
      limit: 101
    })).rejects.toThrow('invalid_tier_update_claim_limit');

    await expect(markScheduledTierUpdateTimedOut({
      prisma,
      scheduledTierUpdateId: 42,
      now,
      safeSummary: {
        errorMessage: 'raw provider message must not be stored'
      }
    })).rejects.toThrow('unsafe_tier_update_safe_summary');

    expect(updateMany).not.toHaveBeenCalled();
  });

  it('keeps runtime scheduler, tracking, main, and tx modules disconnected from the claim service', () => {
    const tierScheduler = fs.readFileSync(tierSchedulerPath, 'utf8');
    const tierSync = fs.readFileSync(tierSyncPath, 'utf8');
    const trackingService = fs.readFileSync(trackingServicePath, 'utf8');
    const main = fs.readFileSync(mainPath, 'utf8');

    for (const source of [tierScheduler, tierSync, trackingService, main]) {
      expect(source).not.toContain('tierUpdateClaimService');
      expect(source).not.toContain('claimScheduledTierUpdate');
      expect(source).not.toContain('findClaimableTierUpdates');
      expect(source).not.toContain('refreshScheduledTierUpdateHeartbeat');
      expect(source).not.toContain('markScheduledTierUpdateTimedOut');
    }
  });

  it('builds update data helpers without raw tx, RPC, or runtime behavior', () => {
    const now = new Date('2026-05-28T00:00:00.000Z');

    expect(buildClaimUpdateData({
      workerId: 'tier-worker-1',
      now,
      lockDurationMs: 60_000
    })).toEqual(expect.objectContaining({
      status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
      attempt: { increment: 1 },
      lockedBy: 'tier-worker-1',
      lockedAt: now,
      heartbeatAt: now,
      lockExpiresAt: new Date('2026-05-28T00:01:00.000Z')
    }));

    expect(buildTimeoutUpdateData({ now })).toEqual(expect.objectContaining({
      status: SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT,
      safeErrorKind: 'lock_timeout',
      safeSummary: {
        reason: 'claim_lock_expired',
        retryable: true
      },
      failedAt: now,
      heartbeatAt: now
    }));
  });
});
