import express from 'express';
const request = require('supertest');

const mockPrisma = {
  ownedToken: {
    findUnique: jest.fn()
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  lotteryTickets: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
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
  AuthAdmin: (_req: any, res: any) => res.status(403).json({ success: false, message: 'Invalid token' })
}));

jest.mock('../../lib/getDiscoNFTEVM', () => jest.fn());
jest.mock('../../lib/trackingTokenBalanceEthereum', () => ({
  isSixHourUpdateRunning: jest.fn(() => false)
}));

import { lotteryRoutes } from '../lottery.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(lotteryRoutes);
  return app;
};

describe('lottery user routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      claimTickets: 3,
      tickets: 10
    });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.ownedToken.findUnique.mockResolvedValue({
      tallyTokenBalance: '100',
      sixHourTokenBalance: '10',
      weeklyTokenBalance: '50'
    });
    mockPrisma.lotteryTickets.findMany.mockResolvedValue([]);
  });

  it('does not reach lottery ticket claim without authentication', async () => {
    const response = await request(createApp())
      .post('/lottery/claim/ticket/to/user')
      .send({ userId: 1 });

    expect(response.status).toBe(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('does not claim another user lottery tickets from body userId', async () => {
    const response = await request(createApp())
      .post('/lottery/claim/ticket/to/user')
      .set('Authorization', 'Bearer user-token')
      .send({ userId: 2 });

    expect(response.status).toBe(403);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('claims tickets only for the authenticated user', async () => {
    const response = await request(createApp())
      .post('/lottery/claim/ticket/to/user')
      .set('Authorization', 'Bearer user-token')
      .send({ wallet_address: '0xAttacker' });

    expect(response.status).toBe(200);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        id: true,
        claimTickets: true,
        tickets: true
      }
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        claimTickets: 0,
        tickets: { increment: 3 }
      }
    });
  });

  it('does not read another user lottery history', async () => {
    const response = await request(createApp())
      .get('/lottery/ticket/date/2')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.lotteryTickets.findMany).not.toHaveBeenCalled();
  });

  it('reads lottery history only for the authenticated user', async () => {
    const response = await request(createApp())
      .get('/lottery/ticket/date/1')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.lotteryTickets.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        userId: 1
      }
    }));
  });

  it('does not read another user lottery ticket state', async () => {
    const response = await request(createApp())
      .get('/lottery/ticket/2')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.ownedToken.findUnique).not.toHaveBeenCalled();
  });
});
