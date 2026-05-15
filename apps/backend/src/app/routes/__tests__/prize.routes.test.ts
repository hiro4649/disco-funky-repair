import express from 'express';
const request = require('supertest');

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

jest.mock('../../controllers/prize.controller', () => ({
  PrizeController: {
    adminGetPrize: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    getEditPrize: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    deletePrize: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    editPrize: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    cancelPrizeTransaction: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    failPrizeTransaction: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    createNewPrize: jest.fn((_req: any, res: any) => res.status(201).json({ success: true })),
    getPrize: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    drawPrize: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    getPrizeTransactions: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    sendToWallet: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    withDrawPrizeToken: jest.fn((_req: any, res: any) => res.status(200).json({ success: true }))
  }
}));

import { prizeRoutes } from '../prize.routes';
import { PrizeController } from '../../controllers/prize.controller';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(prizeRoutes);
  return app;
};

describe('prize user routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not reach prize draw without authentication', async () => {
    const response = await request(createApp())
      .post('/airdrop/prize/draw/1');

    expect(response.status).toBe(401);
    expect(PrizeController.drawPrize).not.toHaveBeenCalled();
  });

  it('does not reach prize send without authentication', async () => {
    const response = await request(createApp())
      .post('/airdrop/prize/send/7');

    expect(response.status).toBe(401);
    expect(PrizeController.sendToWallet).not.toHaveBeenCalled();
  });

  it('allows authenticated users to reach prize user routes', async () => {
    const response = await request(createApp())
      .post('/airdrop/prize/draw/1')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(PrizeController.drawPrize).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['get', '/admin/airdrop/prize', 'adminGetPrize'],
    ['get', '/admin/airdrop/prize/1', 'getEditPrize'],
    ['post', '/admin/airdrop/prize', 'createNewPrize'],
    ['post', '/admin/airdrop/prize/1', 'createNewPrize'],
    ['patch', '/admin/airdrop/prize/1', 'editPrize'],
    ['delete', '/admin/airdrop/prize/1', 'deletePrize'],
    ['post', '/admin/airdrop/prize/transaction/1/cancel', 'cancelPrizeTransaction'],
    ['post', '/admin/airdrop/prize/transaction/1/fail', 'failPrizeTransaction']
  ])('does not reach Prize admin route %s %s without admin authentication even if adminKey is provided', async (method, path, controllerMethod) => {
    const response = await (request(createApp()) as any)[method](path)
      .send({ adminKey: 'legacy-admin-key', tokenName: 'Unsafe' });

    expect(response.status).toBe(401);
    expect((PrizeController as any)[controllerMethod]).not.toHaveBeenCalled();
  });

  it.each([
    ['get', '/admin/airdrop/prize', 'adminGetPrize'],
    ['get', '/admin/airdrop/prize/1', 'getEditPrize'],
    ['post', '/admin/airdrop/prize', 'createNewPrize'],
    ['post', '/admin/airdrop/prize/1', 'createNewPrize'],
    ['patch', '/admin/airdrop/prize/1', 'editPrize'],
    ['delete', '/admin/airdrop/prize/1', 'deletePrize'],
    ['post', '/admin/airdrop/prize/transaction/1/cancel', 'cancelPrizeTransaction'],
    ['post', '/admin/airdrop/prize/transaction/1/fail', 'failPrizeTransaction']
  ])('does not reach Prize admin route %s %s with a general user token', async (method, path, controllerMethod) => {
    const response = await (request(createApp()) as any)[method](path)
      .set('Authorization', 'Bearer user-token')
      .send({ tokenName: 'Unsafe' });

    expect(response.status).toBe(403);
    expect((PrizeController as any)[controllerMethod]).not.toHaveBeenCalled();
  });

  it.each([
    ['get', '/admin/airdrop/prize', 'adminGetPrize', 200],
    ['get', '/admin/airdrop/prize/1', 'getEditPrize', 200],
    ['post', '/admin/airdrop/prize', 'createNewPrize', 201],
    ['post', '/admin/airdrop/prize/1', 'createNewPrize', 201],
    ['patch', '/admin/airdrop/prize/1', 'editPrize', 200],
    ['delete', '/admin/airdrop/prize/1', 'deletePrize', 200],
    ['post', '/admin/airdrop/prize/transaction/1/cancel', 'cancelPrizeTransaction', 200],
    ['post', '/admin/airdrop/prize/transaction/1/fail', 'failPrizeTransaction', 200]
  ])('allows admin authentication to reach Prize admin route %s %s', async (method, path, controllerMethod, expectedStatus) => {
    const response = await (request(createApp()) as any)[method](path)
      .set('Authorization', 'Bearer admin-token')
      .send({ tokenName: 'Safe' });

    expect(response.status).toBe(expectedStatus);
    expect((PrizeController as any)[controllerMethod]).toHaveBeenCalledTimes(1);
  });
});
