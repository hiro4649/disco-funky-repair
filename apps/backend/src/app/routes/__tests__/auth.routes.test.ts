import express from 'express';
const request = require('supertest');

const mockAuthController = {
  issueWalletNonce: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  signup: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  userLogout: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  verifyUser: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  refreshToken: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  signin: jest.fn((_req: any, res: any) => res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  })),
  logout: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
  verifyAdmin: jest.fn((_req: any, res: any) => res.status(200).json({ success: true }))
};

jest.mock('../../controllers/auth.controller', () => ({
  AuthController: mockAuthController
}));

import { authRoutes } from '../auth.routes';
import { resetAuthLimiterForTests } from '../../middlewares/rateLimiter';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(authRoutes);
  return app;
};

const authLimitMessage = {
  success: false,
  message: 'Too many login attempts, please try again later.'
};

describe('auth routes rate limiting', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await resetAuthLimiterForTests();
  });

  afterEach(async () => {
    await resetAuthLimiterForTests();
  });

  it('rate limits /admin/signin without exposing admin existence', async () => {
    const app = createApp();

    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/admin/signin')
        .send({ email: 'admin@example.com', password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ success: false, message: 'Invalid credentials' });
    }

    const limited = await request(app)
      .post('/admin/signin')
      .send({ email: 'admin@example.com', password: 'wrong-password' });

    expect(limited.status).toBe(429);
    expect(limited.body).toEqual(authLimitMessage);
    expect(mockAuthController.signin).toHaveBeenCalledTimes(10);
  });

  it('rate limits /user/auth/nonce before issuing another nonce', async () => {
    const app = createApp();

    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/user/auth/nonce')
        .send({ wallet_address: '0x0000000000000000000000000000000000000001' });

      expect(response.status).toBe(200);
    }

    const limited = await request(app)
      .post('/user/auth/nonce')
      .send({ wallet_address: '0x0000000000000000000000000000000000000001' });

    expect(limited.status).toBe(429);
    expect(limited.body).toEqual(authLimitMessage);
    expect(mockAuthController.issueWalletNonce).toHaveBeenCalledTimes(10);
  });

  it('rate limits /user/signup before reaching wallet signup', async () => {
    const app = createApp();

    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/user/signup')
        .send({
          wallet_address: '0x0000000000000000000000000000000000000001',
          message: 'signed-message',
          signature: 'signed-message-signature'
        });

      expect(response.status).toBe(200);
    }

    const limited = await request(app)
      .post('/user/signup')
      .send({
        wallet_address: '0x0000000000000000000000000000000000000001',
        message: 'signed-message',
        signature: 'signed-message-signature'
      });

    expect(limited.status).toBe(429);
    expect(limited.body).toEqual(authLimitMessage);
    expect(mockAuthController.signup).toHaveBeenCalledTimes(10);
  });
});
