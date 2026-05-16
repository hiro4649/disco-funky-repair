import express from 'express';
const request = require('supertest');

const mockPrisma = {
  $transaction: jest.fn(),
  user: {
    updateMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  illustration: {
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  pointHistory: {
    create: jest.fn()
  },
  illustrationHistory: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  prizeTransactions: {
    findFirst: jest.fn()
  },
  trialNft: {
    update: jest.fn()
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
        user_id: 99,
        role: 'admin'
      };
      return next();
    }

    if (req.headers.authorization === 'Bearer user-token') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }
}));

jest.mock('../../middlewares/rateLimiter', () => ({
  illustrationDrawRateLimiter: (_req: any, _res: any, next: any) => next()
}));

jest.mock('../../lib/getDiscoNFTEVM', () => jest.fn());

jest.mock('../../lib/trialNftService', () => ({
  getTrialNFTBonusPoints: jest.fn()
}));

import getDiscoNFTEVM from '../../lib/getDiscoNFTEVM';
import { getTrialNFTBonusPoints } from '../../lib/trialNftService';
import { illustrationRoutes } from '../illustration.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(illustrationRoutes);
  return app;
};

describe('illustration draw route', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockPrisma));
    mockPrisma.user.findUnique.mockImplementation(async (args: any) => {
      if (args.select?.wallet_address) {
        return { id: 1, wallet_address: '0xUser' };
      }

      return { id: 1 };
    });
    mockPrisma.illustration.findMany.mockResolvedValue([
      { id: 7, image_url: 'image.png', earned_pts: 3, probability: 1 }
    ]);
    mockPrisma.illustration.findUnique.mockResolvedValue({
      id: 7,
      image_url: 'image.png',
      earned_pts: 3,
      rarity: 2
    });
    mockPrisma.pointHistory.create.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.illustrationHistory.findMany.mockResolvedValue([]);
    mockPrisma.illustrationHistory.create.mockResolvedValue({});
    mockPrisma.prizeTransactions.findFirst.mockResolvedValue(null);
    mockPrisma.trialNft.update.mockResolvedValue({});
    (getDiscoNFTEVM as jest.Mock).mockResolvedValue(0);
    (getTrialNFTBonusPoints as jest.Mock).mockResolvedValue({
      points: 0,
      dayOfHolding: 0,
      trialNftId: null
    });
  });

  it('consumes one ticket before creating fan points and illustration history', async () => {
    mockPrisma.user.updateMany.mockResolvedValue({ count: 1 });

    const response = await request(createApp())
      .post('/user/1/draw-illustration')
      .set('Authorization', 'Bearer user-token')
      .send({ userId: 999, wallet_address: '0xAttacker' });

    expect(response.status).toBe(200);
    expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
      where: {
        id: 1,
        tickets: { gt: 0 }
      },
      data: {
        tickets: { decrement: 1 }
      }
    });
    expect(mockPrisma.pointHistory.create).toHaveBeenCalled();
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        fan_points: {
          increment: 3
        }
      }
    });
    expect(mockPrisma.illustrationHistory.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        userId: 1,
        illustrationId: 7
      }
    }));
  });

  it('does not draw or update points/history when no ticket is consumed', async () => {
    mockPrisma.user.updateMany.mockResolvedValue({ count: 0 });

    const response = await request(createApp())
      .post('/user/1/draw-illustration')
      .set('Authorization', 'Bearer user-token')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'User has no tickets'
    });
    expect(mockPrisma.illustration.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.create).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.illustrationHistory.create).not.toHaveBeenCalled();
  });

  it('allows only one successful draw when two requests compete for one ticket', async () => {
    mockPrisma.user.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const [first, second] = await Promise.all([
      request(createApp()).post('/user/1/draw-illustration').set('Authorization', 'Bearer user-token').send({}),
      request(createApp()).post('/user/1/draw-illustration').set('Authorization', 'Bearer user-token').send({})
    ]);

    expect([first.status, second.status].sort()).toEqual([200, 400]);
    expect(mockPrisma.illustrationHistory.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });

  it('blocks direct user illustration assignment before DB or point updates run', async () => {
    const response = await request(createApp())
      .post('/user/illustration')
      .send({ userId: 1, illustrationId: 7, wallet_address: '0xAttacker' });

    expect(response.status).toBe(410);
    expect(response.body).toEqual({
      success: false,
      code: 'FEATURE_DISABLED',
      message: 'Direct user illustration assignment is disabled for the BSC launch MVP.'
    });
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.create).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
    expect(mockPrisma.illustrationHistory.create).not.toHaveBeenCalled();
  });

  it('blocks unauthenticated admin illustration reads before controller access', async () => {
    const response = await request(createApp())
      .get('/admin/illustration');

    expect(response.status).toBe(401);
    expect(mockPrisma.illustration.findMany).not.toHaveBeenCalled();
  });

  it('blocks general users from admin illustration reads before controller access', async () => {
    const response = await request(createApp())
      .get('/admin/illustration')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.illustration.findMany).not.toHaveBeenCalled();
  });

  it('does not allow body adminKey to access admin illustration reads', async () => {
    const response = await request(createApp())
      .get('/admin/illustration')
      .send({ adminKey: 'body-only' });

    expect(response.status).toBe(401);
    expect(mockPrisma.illustration.findMany).not.toHaveBeenCalled();
  });

  it('allows admin users to read admin illustration catalog', async () => {
    const response = await request(createApp())
      .get('/admin/illustration')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.illustration.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc'
      }
    });
  });

  it('returns public illustration detail with only safe display fields', async () => {
    const response = await request(createApp())
      .get('/illustration/7');

    expect(response.status).toBe(200);
    expect(mockPrisma.illustration.findUnique).toHaveBeenCalledWith({
      where: { id: 7 },
      select: {
        id: true,
        image_url: true,
        earned_pts: true,
        rarity: true
      }
    });
    expect(response.body.data).toEqual({
      id: 7,
      image_url: 'image.png',
      earned_pts: 3,
      rarity: 2
    });
    expect(response.body.data).not.toHaveProperty('probability');
    expect(response.body.data).not.toHaveProperty('createdAt');
    expect(response.body.data).not.toHaveProperty('updatedAt');
  });

  it('returns public rarity illustration list without probability or audit fields', async () => {
    mockPrisma.illustration.findMany.mockResolvedValueOnce([
      { id: 7, image_url: 'image.png', earned_pts: 3, rarity: 2 }
    ]);

    const response = await request(createApp())
      .get('/illustration/rarity/2');

    expect(response.status).toBe(200);
    expect(mockPrisma.illustration.findMany).toHaveBeenCalledWith({
      where: {
        rarity: 2
      },
      select: {
        id: true,
        image_url: true,
        earned_pts: true,
        rarity: true
      },
      orderBy: {
        probability: 'desc'
      }
    });
    expect(response.body.data[0]).not.toHaveProperty('probability');
    expect(response.body.data[0]).not.toHaveProperty('createdAt');
    expect(response.body.data[0]).not.toHaveProperty('updatedAt');
  });

  it('does not reach illustration draw when unauthenticated', async () => {
    const response = await request(createApp())
      .post('/user/1/draw-illustration')
      .send({});

    expect(response.status).toBe(401);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.user.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.create).not.toHaveBeenCalled();
    expect(mockPrisma.illustrationHistory.create).not.toHaveBeenCalled();
  });

  it('does not draw for another user id', async () => {
    const response = await request(createApp())
      .post('/user/2/draw-illustration')
      .set('Authorization', 'Bearer user-token')
      .send({});

    expect(response.status).toBe(403);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.user.updateMany).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.create).not.toHaveBeenCalled();
    expect(mockPrisma.illustrationHistory.create).not.toHaveBeenCalled();
  });

  it('does not read another user illustration history', async () => {
    const response = await request(createApp())
      .get('/user/2/illustrations')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.illustrationHistory.findMany).not.toHaveBeenCalled();
  });

  it('reads only the authenticated user illustration history', async () => {
    const response = await request(createApp())
      .get('/user/1/illustrations')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.illustrationHistory.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 1 }
    }));
  });
});
