const transactionClient = {
  $queryRaw: jest.fn()
};

const mockPrisma = {
  $transaction: jest.fn()
};

jest.mock('../../db/prisma_client', () => ({
  __esModule: true,
  default: mockPrisma
}));

jest.mock('../../utils/safeLogger', () => ({
  safeLogWarn: jest.fn()
}));

import {
  getPostgresAdvisoryLockKey,
  withPostgresAdvisoryJobLock
} from '../distributedJobLock';
import { safeLogWarn } from '../../utils/safeLogger';

describe('withPostgresAdvisoryJobLock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    transactionClient.$queryRaw.mockResolvedValue([{ acquired: true }]);
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(transactionClient));
  });

  it('runs the job body once when the transaction advisory lock is acquired', async () => {
    const run = jest.fn().mockResolvedValue('complete');

    const result = await withPostgresAdvisoryJobLock('trial_nft_expiration_daily', run);

    expect(result).toEqual({ status: 'acquired', result: 'complete' });
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transactionClient.$queryRaw).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(transactionClient);
  });

  it('skips the job body when another process holds the same lock', async () => {
    transactionClient.$queryRaw.mockResolvedValueOnce([{ acquired: false }]);
    const run = jest.fn();

    const result = await withPostgresAdvisoryJobLock('trial_nft_expiration_daily', run);

    expect(result).toEqual({ status: 'skipped' });
    expect(run).not.toHaveBeenCalled();
    expect(safeLogWarn).toHaveBeenCalledWith(
      'distributed_job_lock_skipped',
      expect.any(Error),
      { jobName: 'trial_nft_expiration_daily' }
    );
  });

  it('propagates job failures through the transaction boundary', async () => {
    const error = new Error('job_failed');
    const run = jest.fn().mockRejectedValue(error);

    await expect(withPostgresAdvisoryJobLock('trial_nft_expiration_daily', run)).rejects.toThrow(error);

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith(transactionClient);
  });

  it('uses stable keys for one job name and different keys for different jobs', () => {
    const firstKey = getPostgresAdvisoryLockKey('trial_nft_expiration_daily');
    const secondKey = getPostgresAdvisoryLockKey('trial_nft_expiration_daily');
    const otherKey = getPostgresAdvisoryLockKey('referral_cleanup_daily');

    expect(firstKey).toEqual(secondKey);
    expect(firstKey).not.toEqual(otherKey);
    expect(firstKey).toHaveLength(2);
    for (const keyPart of firstKey) {
      expect(Number.isInteger(keyPart)).toBe(true);
      expect(keyPart).toBeGreaterThanOrEqual(-2147483648);
      expect(keyPart).toBeLessThanOrEqual(2147483647);
    }
  });

  it('rejects unsafe dynamic job names before issuing SQL', async () => {
    await expect(withPostgresAdvisoryJobLock('unsafe job name', jest.fn())).rejects.toThrow(
      'invalid_job_lock_name'
    );

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(transactionClient.$queryRaw).not.toHaveBeenCalled();
  });
});
