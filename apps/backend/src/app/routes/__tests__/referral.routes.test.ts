import express from 'express';
const request = require('supertest');

const mockPrisma = {
  $transaction: jest.fn(),
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  referralRewards: {
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  pointHistory: {
    createMany: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../config/passport', () => ({
  Authenticate: (req: any, res: any, next: any) => {
    if (req.headers.authorization === 'Bearer user-token') {
      req.user = {
        user_id: 1,
        address: '0xuser'
      };
      return next();
    }

    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  },
  AuthAdmin: (req: any, res: any, next: any) => {
    if (req.headers.authorization === 'Bearer admin-token') {
      req.user = {
        id: 1,
        email: 'admin@example.com'
      };
      return next();
    }

    if (req.headers.authorization) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }
}));

jest.mock('../../utils/ticketCodeGenerator', () => ({
  generateRandomCode: jest.fn(() => 'ABC123')
}));

import referralRoutes from '../referral.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(referralRoutes);
  return app;
};

describe('referral user routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.referralRewards.findFirst.mockResolvedValue(null);
    mockPrisma.referralRewards.create.mockResolvedValue({});
  });

  it('does not update referral code when unauthenticated', async () => {
    const response = await request(createApp())
      .get('/referral-code/0xuser');

    expect(response.status).toBe(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('allows the authenticated user to generate their own referral code', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      wallet_address: '0xuser',
      referral_code: null
    });

    const response = await request(createApp())
      .get('/referral-code/0xuser')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ referralCode: 'ABC123' });
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 }
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { referral_code: 'ABC123' }
    });
  });

  it('does not update another wallet referral code even when authenticated', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      wallet_address: '0xuser',
      referral_code: null
    });

    const response = await request(createApp())
      .get('/referral-code/0xvictim')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('does not track referrals when unauthenticated', async () => {
    const response = await request(createApp())
      .post('/track-referral')
      .send({ walletAddress: '0xuser', referralCode: 'REF123' });

    expect(response.status).toBe(401);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.create).not.toHaveBeenCalled();
  });

  it('rejects track-referral when body walletAddress is not the authenticated user', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      wallet_address: '0xuser',
      referred_by: null
    });

    const response = await request(createApp())
      .post('/track-referral')
      .set('Authorization', 'Bearer user-token')
      .send({ walletAddress: '0xvictim', referralCode: 'REF123' });

    expect(response.status).toBe(403);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.create).not.toHaveBeenCalled();
  });

  it('tracks referral only for the authenticated user, ignoring body userId', async () => {
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({
        id: 1,
        wallet_address: '0xuser',
        referred_by: null
      })
      .mockResolvedValueOnce({
        id: 2,
        wallet_address: '0xreferrer',
        referral_code: 'REF123'
      });

    const response = await request(createApp())
      .post('/track-referral')
      .set('Authorization', 'Bearer user-token')
      .send({ userId: 999, walletAddress: '0xuser', referralCode: 'REF123' });

    expect(response.status).toBe(200);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { referred_by: 'REF123' }
    });
    expect(mockPrisma.referralRewards.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        referrer_wallet: '0xreferrer',
        referred_wallet: '0xuser',
        snapshot_verified: false,
        rewarded: false
      })
    });
  });

  it('rejects self referral without updating user or rewards', async () => {
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({
        id: 1,
        wallet_address: '0xuser',
        referred_by: null
      })
      .mockResolvedValueOnce({
        id: 1,
        wallet_address: '0xuser',
        referral_code: 'OWN123'
      });

    const response = await request(createApp())
      .post('/track-referral')
      .set('Authorization', 'Bearer user-token')
      .send({ walletAddress: '0xuser', referralCode: 'OWN123' });

    expect(response.status).toBe(400);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.create).not.toHaveBeenCalled();
  });
});

describe('referral admin routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.referralRewards.findMany.mockResolvedValue([]);
    mockPrisma.referralRewards.update.mockResolvedValue({});
    mockPrisma.pointHistory.createMany.mockResolvedValue({});
  });

  it('rejects run-snapshot without admin authentication even if adminKey is provided', async () => {
    const response = await request(createApp())
      .post('/admin/run-snapshot')
      .send({ adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockPrisma.referralRewards.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.update).not.toHaveBeenCalled();
  });

  it('rejects run-snapshot with a normal user token', async () => {
    const response = await request(createApp())
      .post('/admin/run-snapshot')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.referralRewards.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.update).not.toHaveBeenCalled();
  });

  it('allows only admin authentication to run snapshot updates', async () => {
    mockPrisma.referralRewards.findMany.mockResolvedValue([
      {
        id: 101,
        referred: {
          disco_balance: 10000,
          holdingDate: 1
        }
      },
      {
        id: 102,
        referred: {
          disco_balance: 9999,
          holdingDate: 1
        }
      }
    ]);

    const response = await request(createApp())
      .post('/admin/run-snapshot')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Snapshot completed',
      verifiedCount: 1,
      totalChecked: 2
    });
    expect(mockPrisma.referralRewards.findMany).toHaveBeenCalledWith({
      where: {
        snapshot_verified: false,
        rewarded: false
      },
      include: {
        referred: true
      }
    });
    expect(mockPrisma.referralRewards.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.referralRewards.update).toHaveBeenCalledWith({
      where: { id: 101 },
      data: { snapshot_verified: true }
    });
  });

  it('rejects distribute-rewards without admin authentication and does not update rewards', async () => {
    const response = await request(createApp())
      .post('/admin/distribute-rewards')
      .send({ adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockPrisma.referralRewards.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.createMany).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.update).not.toHaveBeenCalled();
  });

  it('rejects distribute-rewards with a normal user token', async () => {
    const response = await request(createApp())
      .post('/admin/distribute-rewards')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.referralRewards.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.createMany).not.toHaveBeenCalled();
    expect(mockPrisma.referralRewards.update).not.toHaveBeenCalled();
  });

  it('allows only admin authentication to distribute referral rewards', async () => {
    mockPrisma.referralRewards.findMany.mockResolvedValue([
      {
        id: 201,
        referrer_wallet: '0xReferrer',
        referred_wallet: '0xReferred'
      }
    ]);
    mockPrisma.user.findUnique
      .mockResolvedValueOnce({ id: 10 })
      .mockResolvedValueOnce({ id: 11 });

    const response = await request(createApp())
      .post('/admin/distribute-rewards')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Rewards distributed successfully',
      distributedCount: 1
    });
    expect(mockPrisma.referralRewards.findMany).toHaveBeenCalledWith({
      where: {
        snapshot_verified: true,
        rewarded: false
      }
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { wallet_address: '0xreferrer' },
      data: {
        fan_points: { increment: 100 }
      }
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { wallet_address: '0xreferred' },
      data: {
        fan_points: { increment: 100 }
      }
    });
    expect(mockPrisma.pointHistory.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          userId: 10,
          reason: 4,
          point: 100
        }),
        expect.objectContaining({
          userId: 11,
          reason: 4,
          point: 100
        })
      ])
    });
    expect(mockPrisma.referralRewards.update).toHaveBeenCalledWith({
      where: { id: 201 },
      data: { rewarded: true }
    });
  });
});
