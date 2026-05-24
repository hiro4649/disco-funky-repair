import express from 'express';
const request = require('supertest');

const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  discoTransactions: {
    create: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn()
  }
};

jest.mock('../../db/prisma_client', () => mockPrisma);

import { crashGameRoutes } from '../crashGame.routes';
import { userManageRoutes } from '../userManage.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(crashGameRoutes);
  app.use(userManageRoutes);
  return app;
};

const expectNoVirtualBalanceDbAccess = () => {
  expect(mockPrisma.user.create).not.toHaveBeenCalled();
  expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
  expect(mockPrisma.user.update).not.toHaveBeenCalled();
  expect(mockPrisma.discoTransactions.create).not.toHaveBeenCalled();
  expect(mockPrisma.discoTransactions.count).not.toHaveBeenCalled();
  expect(mockPrisma.discoTransactions.findMany).not.toHaveBeenCalled();
};

describe('disabled out-of-scope routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps Crash game out of scope with an explicit 410 response', async () => {
    const response = await request(createApp()).get('/crash/games');

    expect(response.status).toBe(410);
    expect(response.body).toEqual({
      success: false,
      code: 'FEATURE_DISABLED',
      message: 'Crash game is not installed for the BSC launch MVP.'
    });
    expectNoVirtualBalanceDbAccess();
  });

  it.each([
    ['get', '/user-manage/balance/0xabc', undefined],
    ['post', '/user-manage/deposit', { wallet_address: '0xabc', amount: 10 }],
    ['post', '/user-manage/withdraw', { wallet_address: '0xabc', amount: 10 }],
    ['post', '/user-manage/bet', { wallet_address: '0xabc', currency: 'DISCO', amount: 10 }],
    ['post', '/user-manage/cashout', { wallet_address: '0xabc', currency: 'DISCO', amount: 10 }],
    ['get', '/user-manage/transactions/0xabc', undefined]
  ])('keeps %s %s disabled before any virtual-balance DB write', async (method, path, body) => {
    const req = (request(createApp()) as any)[method](path);
    const response = body ? await req.send(body) : await req;

    expect(response.status).toBe(410);
    expect(response.body).toEqual({
      success: false,
      code: 'FEATURE_DISABLED',
      message: 'Virtual balance user-manage APIs are disabled for the BSC launch MVP.'
    });
    expectNoVirtualBalanceDbAccess();
  });
});
