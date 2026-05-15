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

jest.mock('../../controllers/ticketCodeController', () => ({
  generateGlobalTicketCode: jest.fn(),
  getAllTicketCodes: jest.fn(),
  claimTicketCode: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  getCurrentGlobalTicketCode: jest.fn(),
  getUserLatestTicketCode: jest.fn(),
  getUserTicketBalance: jest.fn()
}));

import ticketCodeRoutes from '../ticketCodeRoutes';
import { claimTicketCode } from '../../controllers/ticketCodeController';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(ticketCodeRoutes);
  return app;
};

describe('ticket code user routes authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not reach ticket code claim without authentication', async () => {
    const response = await request(createApp())
      .post('/claim')
      .send({ code: 'AbCdEf1234', wallet_address: '0xuser' });

    expect(response.status).toBe(401);
    expect(claimTicketCode).not.toHaveBeenCalled();
  });

  it('allows authenticated users to reach ticket code claim', async () => {
    const response = await request(createApp())
      .post('/claim')
      .set('Authorization', 'Bearer user-token')
      .send({ code: 'AbCdEf1234', wallet_address: '0xuser' });

    expect(response.status).toBe(200);
    expect(claimTicketCode).toHaveBeenCalledTimes(1);
  });
});
