import express from 'express';
const request = require('supertest');

jest.mock('../../config/passport', () => ({
  Authenticate: (req: any, res: any, next: any) => {
    if (req.headers.authorization === 'Bearer user-token') {
      req.user = { user_id: 1, address: '0xuser' };
      return next();
    }

    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  },
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

const mockTrialNftController = {
  checkCanClaim: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  claimTrialNFT: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getUserTrialNFTs: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getTotalNFTCount: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getStats: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  expireOldNFTs: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getAllTrialNFTs: jest.fn((_req: any, res: any) => res.status(200).json({ success: true }))
};

jest.mock('../../controllers/trialNft.controller', () => ({
  TrialNftController: mockTrialNftController
}));

import trialNftRoutes from '../trialNft.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(trialNftRoutes);
  return app;
};

describe('trial NFT routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not reach trial NFT claim without authentication', async () => {
    const response = await request(createApp())
      .post('/claim/1')
      .send({ templateId: 1, adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockTrialNftController.claimTrialNFT).not.toHaveBeenCalled();
  });

  it('allows an authenticated user to reach trial NFT claim route', async () => {
    const response = await request(createApp())
      .post('/claim/1')
      .set('Authorization', 'Bearer user-token')
      .send({ templateId: 1 });

    expect(response.status).toBe(200);
    expect(mockTrialNftController.claimTrialNFT).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['get', '/can-claim/1', 'checkCanClaim'],
    ['get', '/user/1', 'getUserTrialNFTs'],
    ['get', '/total/1', 'getTotalNFTCount']
  ])('does not reach user-specific read route %s %s without authentication', async (method, path, controllerMethod) => {
    const response = await (request(createApp()) as any)[method](path)
      .send({ adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect((mockTrialNftController as any)[controllerMethod]).not.toHaveBeenCalled();
  });

  it.each([
    ['get', '/can-claim/1', 'checkCanClaim'],
    ['get', '/user/1', 'getUserTrialNFTs'],
    ['get', '/total/1', 'getTotalNFTCount']
  ])('allows authenticated users to reach user-specific read route %s %s', async (method, path, controllerMethod) => {
    const response = await (request(createApp()) as any)[method](path)
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect((mockTrialNftController as any)[controllerMethod]).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['get', '/stats', 'getStats'],
    ['post', '/expire', 'expireOldNFTs'],
    ['get', '/all', 'getAllTrialNFTs']
  ])('does not reach admin route %s %s without admin authentication', async (method, path, controllerMethod) => {
    const response = await (request(createApp()) as any)[method](path)
      .set('Authorization', 'Bearer user-token')
      .send({ adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(403);
    expect((mockTrialNftController as any)[controllerMethod]).not.toHaveBeenCalled();
  });

  it('does not expire trial NFTs without admin authentication even if adminKey is provided', async () => {
    const response = await request(createApp())
      .post('/expire')
      .send({ adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockTrialNftController.expireOldNFTs).not.toHaveBeenCalled();
  });

  it.each([
    ['get', '/stats', 'getStats'],
    ['post', '/expire', 'expireOldNFTs'],
    ['get', '/all', 'getAllTrialNFTs']
  ])('allows admin authentication to reach %s %s', async (method, path, controllerMethod) => {
    const response = await (request(createApp()) as any)[method](path)
      .set('Authorization', 'Bearer admin-token')
      .send({});

    expect(response.status).toBe(200);
    expect((mockTrialNftController as any)[controllerMethod]).toHaveBeenCalledTimes(1);
  });
});
