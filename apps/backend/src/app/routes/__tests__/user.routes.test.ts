import express from 'express';
const request = require('supertest');

const mockPrisma = {
  $transaction: jest.fn(),
  pointHistory: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  },
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn()
  },
  prizeTransactions: {
    findMany: jest.fn()
  },
  admin: {
    findFirst: jest.fn()
  },
  airdropTokens: {
    findFirst: jest.fn()
  },
  holdDateHistory: {
    findMany: jest.fn()
  }
};

jest.mock('../../db/prisma_client', () => ({
  __esModule: true,
  default: mockPrisma
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

    if (req.headers.authorization === 'Bearer user-token') {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }
}));

import { userRoutes } from '../user.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(userRoutes);
  return app;
};

const expectAdminReadControllersNotReached = () => {
  expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
  expect(mockPrisma.user.count).not.toHaveBeenCalled();
  expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  expect(mockPrisma.prizeTransactions.findMany).not.toHaveBeenCalled();
  expect(mockPrisma.admin.findFirst).not.toHaveBeenCalled();
  expect(mockPrisma.airdropTokens.findFirst).not.toHaveBeenCalled();
};

describe('admin and all-user read route authorization', () => {
  const protectedAdminReadRoutes = [
    {
      path: '/admin/user/all',
      expectControllerReached: () => expect(mockPrisma.user.findMany).toHaveBeenCalled()
    },
    {
      path: '/user/all',
      expectControllerReached: () => expect(mockPrisma.user.findMany).toHaveBeenCalled()
    },
    {
      path: '/admin/user/transaction/0xuser',
      expectControllerReached: () => expect(mockPrisma.user.findUnique).toHaveBeenCalled()
    },
    {
      path: '/admin/seting/tokenbalance',
      expectControllerReached: () => expect(mockPrisma.admin.findFirst).toHaveBeenCalled()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([{
      id: 1,
      wallet_address: '0xuser',
      tickets: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      PrizeTransactions: [],
      LotteryTickets: [],
      ownedToken: []
    }]);
    mockPrisma.user.count.mockResolvedValue(1);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      wallet_address: '0xuser'
    });
    mockPrisma.prizeTransactions.findMany.mockResolvedValue([]);
    mockPrisma.admin.findFirst.mockResolvedValue({ id: 1, email: 'admin@example.com' });
    mockPrisma.airdropTokens.findFirst.mockResolvedValue({ id: 1, userId: 1, balance: '0' });
  });

  it.each(protectedAdminReadRoutes)('rejects unauthenticated access before controller for GET $path', async ({ path }) => {
    const response = await request(createApp()).get(path);

    expect(response.status).toBe(401);
    expectAdminReadControllersNotReached();
  });

  it.each(protectedAdminReadRoutes)('rejects general user JWT before controller for GET $path', async ({ path }) => {
    const response = await request(createApp())
      .get(path)
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expectAdminReadControllersNotReached();
  });

  it.each(protectedAdminReadRoutes)('does not allow body adminKey without admin auth for GET $path', async ({ path }) => {
    const response = await request(createApp())
      .get(path)
      .send({ adminKey: 'not-a-real-admin-auth-mechanism' });

    expect(response.status).toBe(401);
    expectAdminReadControllersNotReached();
  });

  it.each(protectedAdminReadRoutes)('allows admin auth to reach controller for GET $path', async ({ path, expectControllerReached }) => {
    const response = await request(createApp())
      .get(path)
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expectControllerReached();
  });
});

describe('user point routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((callback: any) => callback(mockPrisma));
    mockPrisma.pointHistory.findMany.mockResolvedValue([]);
    mockPrisma.pointHistory.findFirst.mockResolvedValue(null);
    mockPrisma.pointHistory.create.mockResolvedValue({ id: 1 });
    mockPrisma.user.findUnique.mockResolvedValue({ fan_points: 10 });
    mockPrisma.user.update.mockResolvedValue({});
  });

  it('does not reach daily point mutation without authentication', async () => {
    const response = await request(createApp())
      .post('/user/daily/point/1')
      .send({});

    expect(response.status).toBe(401);
    expect(mockPrisma.pointHistory.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.create).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('does not update another user daily point', async () => {
    const response = await request(createApp())
      .post('/user/daily/point/2')
      .set('Authorization', 'Bearer user-token')
      .send({ user_id: 2, wallet_address: '0xAttacker' });

    expect(response.status).toBe(403);
    expect(mockPrisma.pointHistory.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.pointHistory.create).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('updates daily points only for the authenticated user', async () => {
    const response = await request(createApp())
      .post('/user/daily/point/1')
      .set('Authorization', 'Bearer user-token')
      .send({ user_id: 999, wallet_address: '0xAttacker' });

    expect(response.status).toBe(200);
    expect(mockPrisma.pointHistory.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        userId: 1,
        reason: 1
      })
    }));
    expect(mockPrisma.pointHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 1,
        point: 1,
        reason: 1,
        dailyWindowKey: expect.stringMatching(/^\d{4}-\d{2}-\d{2}-(AM|PM)$/)
      })
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      data: {
        fan_points: {
          increment: 1
        }
      }
    });
  });

  it('returns already received without creating another daily point in the same window', async () => {
    mockPrisma.pointHistory.findFirst.mockResolvedValue({
      id: 10,
      userId: 1,
      reason: 1,
      point: 1
    });

    const response = await request(createApp())
      .post('/user/daily/point/1')
      .set('Authorization', 'Bearer user-token')
      .send({});

    expect(response.status).toBe(202);
    expect(response.body.dailyLogined).toBe(false);
    expect(mockPrisma.pointHistory.create).not.toHaveBeenCalled();
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it('allows only one successful daily point mutation across concurrent requests', async () => {
    mockPrisma.pointHistory.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction
      .mockImplementationOnce((callback: any) => callback(mockPrisma))
      .mockRejectedValueOnce({ code: 'P2002' });

    const responses = await Promise.all([
      request(createApp())
        .post('/user/daily/point/1')
        .set('Authorization', 'Bearer user-token')
        .send({}),
      request(createApp())
        .post('/user/daily/point/1')
        .set('Authorization', 'Bearer user-token')
        .send({})
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    expect(mockPrisma.pointHistory.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.update).toHaveBeenCalledTimes(1);
  });

  it('returns conflict instead of 404 when the daily point unique window is already claimed', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce({ code: 'P2002' });

    const response = await request(createApp())
      .post('/user/daily/point/1')
      .set('Authorization', 'Bearer user-token')
      .send({});

    expect(response.status).toBe(409);
    expect(response.body.code).toBe('DAILY_POINT_ALREADY_RECEIVED');
  });

  it('returns server error instead of 404 for unexpected daily point failures', async () => {
    mockPrisma.$transaction.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await request(createApp())
      .post('/user/daily/point/1')
      .set('Authorization', 'Bearer user-token')
      .send({});

    expect(response.status).toBe(500);
  });

  it('does not read another user point history', async () => {
    const response = await request(createApp())
      .get('/user/point/history/2')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.pointHistory.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('reads point history only for the authenticated user', async () => {
    const response = await request(createApp())
      .get('/user/point/history/1')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.pointHistory.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        userId: 1
      }
    }));
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      select: {
        fan_points: true
      }
    });
  });

  it('does not read another user daily point state', async () => {
    const response = await request(createApp())
      .get('/user/daily/point/2')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.pointHistory.findMany).not.toHaveBeenCalled();
  });
});

describe('user privacy read route authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({
      tickets: 2,
      claimTickets: 1,
      fan_points: 10,
      ownedToken: [{
        sixHourTokenBalance: '100',
        tallyTokenBalance: '200'
      }]
    });
    mockPrisma.holdDateHistory.findMany.mockResolvedValue([]);
  });

  it('does not return user info without authentication', async () => {
    const response = await request(createApp())
      .post('/user/info')
      .send({ user_id: 1 });

    expect(response.status).toBe(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('does not return user info with body adminKey alone', async () => {
    const response = await request(createApp())
      .post('/user/info')
      .send({ user_id: 1, adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('does not return another user info from body user_id', async () => {
    const response = await request(createApp())
      .post('/user/info')
      .set('Authorization', 'Bearer user-token')
      .send({ user_id: 2, adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(403);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns only authenticated user info', async () => {
    const response = await request(createApp())
      .post('/user/info')
      .set('Authorization', 'Bearer user-token')
      .send({ user_id: 1 });

    expect(response.status).toBe(200);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      select: expect.any(Object)
    });
  });

  it('does not read another user holding average', async () => {
    const response = await request(createApp())
      .get('/user/holding/average/2')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.holdDateHistory.findMany).not.toHaveBeenCalled();
  });

  it('reads holding average only for the authenticated user', async () => {
    const response = await request(createApp())
      .get('/user/holding/average/1')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.holdDateHistory.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        userId: 1
      }
    }));
  });

  it('does not read another user holding history', async () => {
    const response = await request(createApp())
      .get('/user/holding/history/2')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.holdDateHistory.findMany).not.toHaveBeenCalled();
  });

  it('reads holding history only for the authenticated user', async () => {
    const response = await request(createApp())
      .get('/user/holding/history/1')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.holdDateHistory.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        userId: 1
      }
    }));
  });
});
