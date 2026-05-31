import fs from 'fs';
import path from 'path';

type MockJobRun = {
  id: number;
  jobName: string;
  runKey: string;
  status: string;
  startedAt: Date | null;
  finishedAt: Date | null;
  heartbeatAt: Date | null;
  attempt: number;
  maxAttempts: number;
  lockedBy: string | null;
  checkpoint: unknown;
  safeErrorKind: string | null;
  safeSummary: unknown;
  createdAt: Date;
  updatedAt: Date;
};

const mockPrisma = {
  $transaction: jest.fn(),
  jobRun: {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn()
  }
};

jest.mock('../../db/prisma_client', () => ({
  __esModule: true,
  default: mockPrisma
}));

import {
  cancelJobRun,
  claimJobRun,
  completeJobRun,
  createOrGetPendingJobRun,
  failJobRun,
  heartbeatJobRun,
  markTimedOutJobRuns
} from '../jobRun.service';

let rows: MockJobRun[];
let nextId: number;

const cloneJobRun = (row: MockJobRun): MockJobRun => ({
  ...row,
  startedAt: row.startedAt ? new Date(row.startedAt) : null,
  finishedAt: row.finishedAt ? new Date(row.finishedAt) : null,
  heartbeatAt: row.heartbeatAt ? new Date(row.heartbeatAt) : null,
  createdAt: new Date(row.createdAt),
  updatedAt: new Date(row.updatedAt)
});

const findByUnique = (where: any): MockJobRun | undefined => {
  if (where.id !== undefined) {
    return rows.find((row) => row.id === where.id);
  }

  const key = where.jobName_runKey;
  if (key) {
    return rows.find((row) => row.jobName === key.jobName && row.runKey === key.runKey);
  }

  return undefined;
};

const matchesCondition = (value: any, condition: any): boolean => {
  if (condition && typeof condition === 'object' && !(condition instanceof Date)) {
    if (condition.in) {
      return condition.in.includes(value);
    }
    if (condition.notIn) {
      return !condition.notIn.includes(value);
    }
    if (condition.lt) {
      return value instanceof Date && value.getTime() < condition.lt.getTime();
    }
  }

  return value === condition;
};

const matchesWhere = (row: MockJobRun, where: any): boolean => {
  if (!where) return true;

  if (where.OR && !where.OR.some((entry: any) => matchesWhere(row, entry))) {
    return false;
  }

  for (const [key, condition] of Object.entries(where)) {
    if (key === 'OR') continue;
    if (!matchesCondition((row as any)[key], condition)) {
      return false;
    }
  }

  return true;
};

const applyData = (row: MockJobRun, data: Record<string, any>): void => {
  for (const [key, value] of Object.entries(data)) {
    if (
      key === 'attempt' &&
      value &&
      typeof value === 'object' &&
      'increment' in value
    ) {
      row.attempt += value.increment;
      continue;
    }

    (row as any)[key] = value;
  }
};

const installInMemoryJobRunMock = () => {
  mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
  mockPrisma.jobRun.findUnique.mockImplementation(async ({ where }: any) => {
    const row = findByUnique(where);
    return row ? cloneJobRun(row) : null;
  });
  mockPrisma.jobRun.upsert.mockImplementation(async ({ where, create }: any) => {
    const existing = findByUnique(where);
    if (existing) {
      return cloneJobRun(existing);
    }

    const now = new Date('2026-05-26T00:00:00.000Z');
    const row: MockJobRun = {
      id: nextId++,
      jobName: create.jobName,
      runKey: create.runKey,
      status: create.status ?? 'PENDING',
      startedAt: create.startedAt ?? null,
      finishedAt: create.finishedAt ?? null,
      heartbeatAt: create.heartbeatAt ?? null,
      attempt: create.attempt ?? 0,
      maxAttempts: create.maxAttempts ?? 3,
      lockedBy: create.lockedBy ?? null,
      checkpoint: create.checkpoint ?? null,
      safeErrorKind: create.safeErrorKind ?? null,
      safeSummary: create.safeSummary ?? null,
      createdAt: create.createdAt ?? now,
      updatedAt: create.updatedAt ?? now
    };
    rows.push(row);
    return cloneJobRun(row);
  });
  mockPrisma.jobRun.updateMany.mockImplementation(async ({ where, data }: any) => {
    let count = 0;
    for (const row of rows) {
      if (matchesWhere(row, where)) {
        applyData(row, data);
        count++;
      }
    }

    return { count };
  });
};

describe('JobRun foundation migration', () => {
  it('ships a job_runs migration file', () => {
    const migrationPath = path.resolve(
      __dirname,
      '../../../../prisma/migrations/20260526090000_add_job_runs/migration.sql'
    );

    expect(fs.existsSync(migrationPath)).toBe(true);
    expect(fs.readFileSync(migrationPath, 'utf8')).toContain('CREATE TABLE "public"."job_runs"');
  });
});

describe('JobRun foundation service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rows = [];
    nextId = 1;
    installInMemoryJobRunMock();
  });

  it('creates a pending job run once for the same jobName and runKey', async () => {
    const first = await createOrGetPendingJobRun('tracking_balance', 'window-2026-05-26', {
      maxAttempts: 2,
      checkpoint: { userCursor: 10 },
      safeSummary: { reason: 'created', pendingCount: 4 }
    });
    const second = await createOrGetPendingJobRun('tracking_balance', 'window-2026-05-26');

    expect(rows).toHaveLength(1);
    expect(second.id).toBe(first.id);
    expect(first.status).toBe('PENDING');
    expect(first.maxAttempts).toBe(2);
    expect(first.checkpoint).toEqual({ userCursor: 10 });
  });

  it('claims a job run only once for competing workers', async () => {
    await createOrGetPendingJobRun('tracking_balance', 'window-2026-05-26');

    const firstClaim = await claimJobRun('tracking_balance', 'window-2026-05-26', 'worker-a');
    const secondClaim = await claimJobRun('tracking_balance', 'window-2026-05-26', 'worker-b');

    expect(firstClaim.status).toBe('claimed');
    expect(secondClaim.status).toBe('not_claimable');
    expect(rows[0]).toMatchObject({
      status: 'RUNNING',
      lockedBy: 'worker-a',
      attempt: 1
    });
  });

  it('heartbeats only the worker that owns the running job', async () => {
    await createOrGetPendingJobRun('tracking_balance', 'window-2026-05-26');
    const claim = await claimJobRun('tracking_balance', 'window-2026-05-26', 'worker-a', {
      now: new Date('2026-05-26T00:00:00.000Z')
    });
    expect(claim.status).toBe('claimed');

    const wrongWorker = await heartbeatJobRun(rows[0].id, 'worker-b', {
      now: new Date('2026-05-26T00:05:00.000Z')
    });
    const owner = await heartbeatJobRun(rows[0].id, 'worker-a', {
      now: new Date('2026-05-26T00:10:00.000Z')
    });

    expect(wrongWorker.status).toBe('skipped');
    expect(owner.status).toBe('updated');
    expect(rows[0].heartbeatAt?.toISOString()).toBe('2026-05-26T00:10:00.000Z');
  });

  it('completes only a RUNNING job owned by the worker', async () => {
    await createOrGetPendingJobRun('tracking_balance', 'window-2026-05-26');
    await claimJobRun('tracking_balance', 'window-2026-05-26', 'worker-a');

    const wrongWorker = await completeJobRun(rows[0].id, 'worker-b', { reason: 'done' });
    const owner = await completeJobRun(
      rows[0].id,
      'worker-a',
      { reason: 'done', processedCount: 3 },
      { checkpoint: { reason: 'done', processedCount: 3 } }
    );

    expect(wrongWorker.status).toBe('skipped');
    expect(owner.status).toBe('updated');
    expect(rows[0]).toMatchObject({
      status: 'SUCCEEDED',
      lockedBy: 'worker-a',
      checkpoint: { reason: 'done', processedCount: 3 },
      safeSummary: { reason: 'done', processedCount: 3 }
    });
  });

  it('rejects unsafe safeSummary fields instead of storing raw error messages', async () => {
    await createOrGetPendingJobRun('tracking_balance', 'window-2026-05-26');
    await claimJobRun('tracking_balance', 'window-2026-05-26', 'worker-a');

    await expect(
      failJobRun(rows[0].id, 'worker-a', 'provider_timeout', {
        errorMessage: 'provider said raw details'
      })
    ).rejects.toThrow('unsafe_job_run_safe_summary');

    expect(rows[0].safeSummary).toBeNull();

    const result = await failJobRun(
      rows[0].id,
      'worker-a',
      'provider_timeout',
      {
        reason: 'provider_timeout',
        failedCount: 1
      },
      { checkpoint: { reason: 'provider_timeout', failedCount: 1 } }
    );

    expect(result.status).toBe('updated');
    expect(rows[0]).toMatchObject({
      status: 'FAILED',
      safeErrorKind: 'provider_timeout',
      checkpoint: { reason: 'provider_timeout', failedCount: 1 },
      safeSummary: { reason: 'provider_timeout', failedCount: 1 }
    });
  });

  it('moves exhausted attempts to manual review on failure', async () => {
    await createOrGetPendingJobRun('tracking_balance', 'window-2026-05-26', {
      maxAttempts: 1
    });
    await claimJobRun('tracking_balance', 'window-2026-05-26', 'worker-a');

    const result = await failJobRun(rows[0].id, 'worker-a', 'job_failed', {
      reason: 'attempts_exhausted'
    });

    expect(result.status).toBe('updated');
    expect(rows[0]).toMatchObject({
      status: 'MANUAL_REVIEW',
      safeErrorKind: 'job_failed'
    });
  });

  it('marks stale RUNNING job runs as timed out', async () => {
    await createOrGetPendingJobRun('tracking_balance', 'window-2026-05-26');
    await claimJobRun('tracking_balance', 'window-2026-05-26', 'worker-a', {
      now: new Date('2026-05-26T00:00:00.000Z')
    });

    const result = await markTimedOutJobRuns(new Date('2026-05-26T00:20:00.000Z'), {
      timeoutMs: 15 * 60 * 1000
    });

    expect(result).toEqual({ timedOutCount: 1 });
    expect(rows[0]).toMatchObject({
      status: 'TIMED_OUT',
      safeErrorKind: 'job_timed_out',
      safeSummary: { reason: 'worker_heartbeat_stale' }
    });
  });

  it('cancels non-terminal job runs with a safe reason', async () => {
    await createOrGetPendingJobRun('tracking_balance', 'window-2026-05-26');

    const result = await cancelJobRun(rows[0].id, 'operator_cancelled');

    expect(result.status).toBe('updated');
    expect(rows[0]).toMatchObject({
      status: 'CANCELED',
      safeErrorKind: 'job_canceled',
      safeSummary: { reason: 'operator_cancelled' }
    });
  });
});
