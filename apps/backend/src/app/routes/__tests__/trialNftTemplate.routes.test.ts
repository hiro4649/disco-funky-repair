import express from 'express';
const request = require('supertest');

const mockUploadSingleImage = jest.fn((_req: any, _res: any, next: any) => next());

jest.mock('../../config/passport', () => ({
  AuthAdmin: (req: any, res: any, next: any) => {
    if (req.headers.authorization === 'Bearer admin-token') {
      req.user = { admin_id: 1, email: 'admin@example.com' };
      return next();
    }

    if (req.headers.authorization === 'Bearer user-token') {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }
}));

jest.mock('../../middlewares/singleImageMulter', () => mockUploadSingleImage);

const mockTrialNftTemplateController = {
  getAvailable: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getAll: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getStats: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  create: jest.fn((_req: any, res: any) => res.status(201).json({ success: true })),
  update: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  delete: jest.fn((_req: any, res: any) => res.status(200).json({ success: true }))
};

jest.mock('../../controllers/trialNftTemplate.controller', () => ({
  TrialNftTemplateController: mockTrialNftTemplateController
}));

import trialNftTemplateRoutes from '../trialNftTemplate.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(trialNftTemplateRoutes);
  return app;
};

describe('trial NFT template routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps available templates public read-only', async () => {
    const response = await request(createApp())
      .get('/available');

    expect(response.status).toBe(200);
    expect(mockTrialNftTemplateController.getAvailable).toHaveBeenCalledTimes(1);
  });

  it('does not create a template without admin authentication even if adminKey is provided', async () => {
    const response = await request(createApp())
      .post('/')
      .send({ name: 'Trial', adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockUploadSingleImage).not.toHaveBeenCalled();
    expect(mockTrialNftTemplateController.create).not.toHaveBeenCalled();
  });

  it('does not update a template with a general user token', async () => {
    const response = await request(createApp())
      .patch('/1')
      .set('Authorization', 'Bearer user-token')
      .send({ name: 'Trial' });

    expect(response.status).toBe(403);
    expect(mockUploadSingleImage).not.toHaveBeenCalled();
    expect(mockTrialNftTemplateController.update).not.toHaveBeenCalled();
  });

  it('does not delete a template with a general user token', async () => {
    const response = await request(createApp())
      .delete('/1')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(mockTrialNftTemplateController.delete).not.toHaveBeenCalled();
  });

  it.each([
    ['get', '/', 'getAll'],
    ['get', '/stats', 'getStats'],
    ['post', '/', 'create'],
    ['patch', '/1', 'update'],
    ['delete', '/1', 'delete']
  ])('allows admin authentication to reach %s %s', async (method, path, controllerMethod) => {
    const response = await (request(createApp()) as any)[method](path)
      .set('Authorization', 'Bearer admin-token')
      .send({ name: 'Trial' });

    expect(response.status).toBeLessThan(300);
    expect((mockTrialNftTemplateController as any)[controllerMethod]).toHaveBeenCalledTimes(1);
  });
});
