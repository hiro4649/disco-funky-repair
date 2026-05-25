const mockPrisma = {
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  referralRewards: {
    count: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  user: {
    update: jest.fn()
  },
  pointHistory: {
    createMany: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../lib/getToken', () => jest.fn());

jest.mock('../../config/env', () => ({
  TOKEN_CONTRACT_ADDRESS: '0xToken'
}));

import { distributeReferralRewardOnce, SnapshotService } from '../snapshot.service';

describe('SnapshotService cleanupExpiredReferrals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.$queryRaw.mockResolvedValue([{ acquired: true }]);
    mockPrisma.referralRewards.count.mockResolvedValue(0);
    mockPrisma.referralRewards.updateMany.mockResolvedValue({ count: 0 });
  });

  it('keeps expired referral rows for audit instead of deleting them', async () => {
    mockPrisma.referralRewards.count.mockResolvedValue(2);

    const result = await SnapshotService.cleanupExpiredReferrals();

    expect(result).toEqual({ cleanedCount: 2 });
    expect(mockPrisma.referralRewards.count).toHaveBeenCalledWith({
      where: {
        rewarded: false,
        expires_at: {
          lte: expect.any(Date)
        }
      }
    });
    expect(mockPrisma.referralRewards.delete).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.deleteMany).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.update).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.updateMany).not.toHaveBeenCalled();
  });

  it('is idempotent when cleanup runs repeatedly', async () => {
    mockPrisma.referralRewards.count.mockResolvedValue(1);

    const firstResult = await SnapshotService.cleanupExpiredReferrals();
    const secondResult = await SnapshotService.cleanupExpiredReferrals();

    expect(firstResult).toEqual({ cleanedCount: 1 });
    expect(secondResult).toEqual({ cleanedCount: 1 });
    expect(mockPrisma.referralRewards.count).toHaveBeenCalledTimes(2);
    expect(mockPrisma.referralRewards.delete).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.deleteMany).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.update).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.updateMany).not.toHaveBeenCalled();
  });

  it('does not target already rewarded rows during cleanup', async () => {
    await SnapshotService.cleanupExpiredReferrals();

    expect(mockPrisma.referralRewards.count).toHaveBeenCalledWith({
      where: {
        rewarded: false,
        expires_at: {
          lte: expect.any(Date)
        }
      }
    });
  });
});

describe('SnapshotService runDailyProcess advisory lock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.$queryRaw.mockResolvedValue([{ acquired: true }]);
    mockPrisma.referralRewards.count.mockResolvedValue(3);
  });

  it('runs referral cleanup inside the transaction-scoped advisory lock when acquired', async () => {
    const result = await SnapshotService.runDailyProcess();

    expect(result).toEqual({ cleanedCount: 3 });
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(mockPrisma.referralRewards.count).toHaveBeenCalledTimes(1);
  });

  it('skips referral cleanup when another process holds the same lock', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ acquired: false }]);

    const result = await SnapshotService.runDailyProcess();

    expect(result).toEqual({ cleanedCount: 0 });
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(mockPrisma.referralRewards.count).not.toHaveBeenCalled();
  });

  it('releases transaction-scoped lock by propagating cleanup failures through the transaction', async () => {
    const error = new Error('cleanup_failed');
    mockPrisma.referralRewards.count.mockRejectedValueOnce(error);

    await expect(SnapshotService.runDailyProcess()).rejects.toThrow(error);

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(mockPrisma.referralRewards.count).toHaveBeenCalledTimes(1);
  });
});

describe('distributeReferralRewardOnce', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.$queryRaw.mockResolvedValue([{ acquired: true }]);
    mockPrisma.referralRewards.updateMany.mockResolvedValue({ count: 0 });
  });

  it('excludes expired referral rows from reward distribution', async () => {
    const expiresAfter = new Date('2026-05-25T00:00:00.000Z');

    const result = await distributeReferralRewardOnce(123, { expiresAfter });

    expect(result).toEqual({ status: 'already_processed', rewardAmount: 0 });
    expect(mockPrisma.referralRewards.updateMany).toHaveBeenCalledWith({
      where: {
        id: 123,
        snapshot_verified: true,
        rewarded: false,
        expires_at: {
          gt: expiresAfter
        }
      },
      data: expect.objectContaining({
        rewarded: true,
        updated_at: expect.any(Date)
      })
    });
    expect(mockPrisma.referralRewards.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.createMany).not.toHaveBeenCalled();
  });
});
