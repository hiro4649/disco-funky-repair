import express from 'express';
const request = require('supertest');

const mockPrisma = {
  ownedToken: {
    findUnique: jest.fn()
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
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
  AuthAdmin: (req: any, res: any, next: any) => {
    if (req.headers.authorization === 'Bearer admin-token') {
      req.user = {
        admin_id: 1,
        email: 'admin@example.com'
      };
      return next();
    }

    if (req.headers.authorization === 'Bearer user-token') {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }
}));

jest.mock('../../lib/getDiscoNFTEVM', () => jest.fn());
jest.mock('../../lib/trackingTokenBalanceEthereum', () => ({
  isSixHourUpdateRunning: jest.fn(() => false)
}));

import { lotteryRoutes } from '../lottery.routes';
import getDiscoNFTEVM from '../../lib/getDiscoNFTEVM';

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
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.ownedToken.findUnique.mockResolvedValue({
      tallyTokenBalance: '100',
      sixHourTokenBalance: '10',
      weeklyTokenBalance: '50'
    });
    mockPrisma.lotteryTickets.findMany.mockResolvedValue([]);
    (getDiscoNFTEVM as jest.Mock).mockResolvedValue(0);
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

  it('does not reach admin lottery ticket creation without admin authentication', async () => {
    const response = await request(createApp())
      .post('/admin/user/lottery/ticket')
      .send({ userId: 1, ticket: 1, adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockPrisma.lotteryTickets.create).not.toHaveBeenCalled();
  });

  it('does not reach admin lottery ticket creation with a general user token', async () => {
    const response = await request(createApp())
      .post('/admin/user/lottery/ticket')
      .set('Authorization', 'Bearer user-token')
      .send({ userId: 1, ticket: 1 });

    expect(response.status).toBe(403);
    expect(mockPrisma.lotteryTickets.create).not.toHaveBeenCalled();
  });

  it('does not distribute all-user tickets without admin authentication even if adminKey is provided', async () => {
    const response = await request(createApp())
      .post('/alluser/distribute/ticket')
      .send({ adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.lotteryTickets.create).not.toHaveBeenCalled();
    expect(mockPrisma.lotteryTickets.update).not.toHaveBeenCalled();
  });

  it('does not distribute all-user tickets with a general user token', async () => {
    const response = await request(createApp())
      .post('/alluser/distribute/ticket')
      .set('Authorization', 'Bearer user-token')
      .send({});

    expect(response.status).toBe(403);
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.lotteryTickets.create).not.toHaveBeenCalled();
    expect(mockPrisma.lotteryTickets.update).not.toHaveBeenCalled();
  });

  it('allows only admin authentication to run all-user ticket distribution', async () => {
    mockPrisma.user.findMany.mockResolvedValue([{ id: 1, wallet_address: '0xuser' }]);
    mockPrisma.lotteryTickets.findFirst.mockResolvedValue(null);
    mockPrisma.lotteryTickets.findMany.mockResolvedValue([]);
    (getDiscoNFTEVM as jest.Mock).mockResolvedValue(2);

    const response = await request(createApp())
      .post('/alluser/distribute/ticket')
      .set('Authorization', 'Bearer admin-token')
      .send({});

    expect(response.status).toBe(200);
    expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.lotteryTickets.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: 1,
        ticket: 2
      })
    }));
  });

  it('keeps public lottery update status limited to the update boolean', async () => {
    const response = await request(createApp()).get('/lottery/update-status');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      isUpdating: false
    });
    expect(Object.keys(response.body).sort()).toEqual(['isUpdating', 'success']);
    expect(response.body).not.toHaveProperty('userId');
    expect(response.body).not.toHaveProperty('walletAddress');
    expect(response.body).not.toHaveProperty('wallet_address');
    expect(response.body).not.toHaveProperty('ticket');
    expect(response.body).not.toHaveProperty('tickets');
    expect(response.body).not.toHaveProperty('claimTickets');
    expect(response.body).not.toHaveProperty('lotteryTickets');
    expect(response.body).not.toHaveProperty('admin');
    expect(response.body).not.toHaveProperty('metadata');
    expect(response.body).not.toHaveProperty('quickNode');
    expect(response.body).not.toHaveProperty('failureCount');
    expect(response.body).not.toHaveProperty('history');
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.lotteryTickets.findMany).not.toHaveBeenCalled();
  });
});
