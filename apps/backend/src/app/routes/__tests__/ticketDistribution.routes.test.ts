import express from 'express';
const request = require('supertest');

jest.mock('../../config/passport', () => ({
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

const mockSetTicketDistributeController = {
  create: jest.fn((_req: any, res: any) => res.status(201).json({ success: true })),
  getAll: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getById: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  update: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  delete: jest.fn((_req: any, res: any) => res.status(200).json({ success: true }))
};

jest.mock('../../controllers/setTicketDistribute.controller', () => ({
  SetTicketDistributeController: mockSetTicketDistributeController
}));

import { ticketDistributionRoutes } from '../ticket-distribution.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(ticketDistributionRoutes);
  return app;
};

describe('ticket distribution admin routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not create a ticket distribution setting without admin authentication even if adminKey is provided', async () => {
    const response = await request(createApp())
      .post('/admin/ticket-distribution')
      .send({ day: 1, hour: 2, minutes: 30, weekly: true, adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockSetTicketDistributeController.create).not.toHaveBeenCalled();
  });

  it('does not allow a general user token to manage ticket distribution settings', async () => {
    const response = await request(createApp())
      .patch('/admin/ticket-distribution/1')
      .set('Authorization', 'Bearer user-token')
      .send({ hour: 3 });

    expect(response.status).toBe(403);
    expect(mockSetTicketDistributeController.update).not.toHaveBeenCalled();
  });

  it('requires admin authentication for ticket distribution read routes', async () => {
    const listResponse = await request(createApp())
      .get('/admin/ticket-distribution');
    const detailResponse = await request(createApp())
      .get('/admin/ticket-distribution/1');

    expect(listResponse.status).toBe(401);
    expect(detailResponse.status).toBe(401);
    expect(mockSetTicketDistributeController.getAll).not.toHaveBeenCalled();
    expect(mockSetTicketDistributeController.getById).not.toHaveBeenCalled();
  });

  it.each([
    ['post', '/admin/ticket-distribution', 'create'],
    ['get', '/admin/ticket-distribution', 'getAll'],
    ['get', '/admin/ticket-distribution/1', 'getById'],
    ['patch', '/admin/ticket-distribution/1', 'update'],
    ['delete', '/admin/ticket-distribution/1', 'delete']
  ])('allows admin authentication to reach %s %s', async (method, path, controllerMethod) => {
    const response = await (request(createApp()) as any)[method](path)
      .set('Authorization', 'Bearer admin-token')
      .send({ day: 1, hour: 2, minutes: 30, weekly: true });

    expect(response.status).toBeLessThan(300);
    expect((mockSetTicketDistributeController as any)[controllerMethod]).toHaveBeenCalledTimes(1);
  });
});
