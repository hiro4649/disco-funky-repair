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
    findMany: jest.fn()
  },
  pointHistory: {
    create: jest.fn()
  },
  illustrationHistory: {
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
  Authenticate: (_req: any, _res: any, next: any) => next(),
  AuthAdmin: (_req: any, _res: any, next: any) => next()
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
    mockPrisma.pointHistory.create.mockResolvedValue({});
    mockPrisma.user.update.mockResolvedValue({});
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
      .send({});

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
      request(createApp()).post('/user/1/draw-illustration').send({}),
      request(createApp()).post('/user/1/draw-illustration').send({})
    ]);

    expect([first.status, second.status].sort()).toEqual([200, 400]);
    expect(mockPrisma.illustrationHistory.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });
});
