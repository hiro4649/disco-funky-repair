import express from 'express';
const request = require('supertest');

const mockPrisma = {
  pointHistory: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn()
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
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
  AuthAdmin: (_req: any, res: any) => res.status(403).json({ success: false, message: 'Invalid token' })
}));

import { userRoutes } from '../user.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(userRoutes);
  return app;
};

describe('user point routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
        reason: 1
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
