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
  AuthAdmin: (_req: any, res: any) => res.status(403).json({ success: false, message: 'Invalid token' })
}));

jest.mock('../../controllers/prize.controller', () => ({
  PrizeController: {
    adminGetPrize: jest.fn(),
    getEditPrize: jest.fn(),
    deletePrize: jest.fn(),
    editPrize: jest.fn(),
    cancelPrizeTransaction: jest.fn(),
    failPrizeTransaction: jest.fn(),
    createNewPrize: jest.fn(),
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
});
