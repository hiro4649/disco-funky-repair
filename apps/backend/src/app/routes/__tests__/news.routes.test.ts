import express from 'express';
const request = require('supertest');

const mockPrisma = {
  news: {
    findMany: jest.fn(),
    findUnique: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../config/passport', () => ({
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

import { newsRoutes } from '../news.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(newsRoutes);
  return app;
};

describe('news admin read routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.news.findMany.mockResolvedValue([
      { id: 1, title: 'News', content: 'Body', image_url: 'image.png' }
    ]);
    mockPrisma.news.findUnique.mockResolvedValue({
      id: 1,
      title: 'News',
      content: 'Body',
      image_url: 'image.png',
      createdAt: new Date('2026-01-01T00:00:00.000Z')
    });
  });

  it('blocks unauthenticated admin news reads before controller access', async () => {
    const response = await request(createApp())
      .get('/admin/news');

    expect(response.status).toBe(401);
    expect(mockPrisma.news.findMany).not.toHaveBeenCalled();
  });

  it('blocks general users from admin news reads before controller access', async () => {
    const response = await request(createApp())
      .get('/admin/news')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockPrisma.news.findMany).not.toHaveBeenCalled();
  });

  it('does not allow body adminKey to access admin news reads', async () => {
    const response = await request(createApp())
      .get('/admin/news')
      .send({ adminKey: 'body-only' });

    expect(response.status).toBe(401);
    expect(mockPrisma.news.findMany).not.toHaveBeenCalled();
  });

  it('allows admin users to read admin news', async () => {
    const response = await request(createApp())
      .get('/admin/news')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.news.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc'
      }
    });
  });

  it('returns public news detail with only safe display fields', async () => {
    const response = await request(createApp())
      .get('/news/1');

    expect(response.status).toBe(200);
    expect(mockPrisma.news.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        id: true,
        title: true,
        content: true,
        image_url: true,
        createdAt: true
      }
    });
    expect(response.body.data).toEqual({
      id: 1,
      title: 'News',
      content: 'Body',
      image_url: 'image.png',
      createdAt: '2026-01-01T00:00:00.000Z'
    });
    expect(response.body.data).not.toHaveProperty('updatedAt');
    expect(response.body.data).not.toHaveProperty('changedBy');
    expect(response.body.data).not.toHaveProperty('createdBy');
  });
});
