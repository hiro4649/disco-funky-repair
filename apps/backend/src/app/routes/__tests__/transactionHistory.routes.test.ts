import express from 'express';
const request = require('supertest');

const mockPrisma = {
  user: {
    findFirst: jest.fn()
  },
  transactionAudit: {
    findFirst: jest.fn()
  }
};

const mockGetUserTransactionHistory = jest.fn();
const mockExplainHoldingDateCalculation = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../lib/enhancedHoldingDateProcessor', () => ({
  getUserTransactionHistory: (...args: unknown[]) => mockGetUserTransactionHistory(...args),
  explainHoldingDateCalculation: (...args: unknown[]) => mockExplainHoldingDateCalculation(...args)
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
  }
}));

import { transactionHistoryRoutes } from '../transactionHistory.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(transactionHistoryRoutes);
  return app;
};

const expectTransactionControllersNotReached = () => {
  expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
  expect(mockPrisma.transactionAudit.findFirst).not.toHaveBeenCalled();
  expect(mockGetUserTransactionHistory).not.toHaveBeenCalled();
  expect(mockExplainHoldingDateCalculation).not.toHaveBeenCalled();
};

describe('transaction history privacy route authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 1,
      wallet_address: '0xuser',
      holdingDate: 31,
      HoldDateHistory: []
    });
    mockPrisma.transactionAudit.findFirst.mockResolvedValue({
      id: 1,
      userId: 1,
      tx_hash: '0xhash',
      user: {
        wallet_address: '0xuser',
        holdingDate: 31
      }
    });
    mockGetUserTransactionHistory.mockResolvedValue({
      transactions: [],
      summary: {
        total: 0
      }
    });
    mockExplainHoldingDateCalculation.mockResolvedValue({
      currentHoldingDate: 31
    });
  });

  it.each([
    '/transaction-history/0xuser',
    '/holding-date/explain/0xuser',
    '/fifo-snapshot/0xuser',
    '/transaction/0xhash'
  ])('rejects unauthenticated read before controller for GET %s', async (path) => {
    const response = await request(createApp()).get(path);

    expect(response.status).toBe(401);
    expectTransactionControllersNotReached();
  });

  it('does not allow body adminKey alone to read transaction history', async () => {
    const response = await request(createApp())
      .get('/transaction-history/0xuser')
      .send({ adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expectTransactionControllersNotReached();
  });

  it.each([
    '/transaction-history/0xvictim',
    '/holding-date/explain/0xvictim',
    '/fifo-snapshot/0xvictim'
  ])('rejects another wallet before DB read for GET %s', async (path) => {
    const response = await request(createApp())
      .get(path)
      .set('Authorization', 'Bearer user-token')
      .send({ adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(403);
    expectTransactionControllersNotReached();
  });

  it('reads transaction history only for the authenticated wallet', async () => {
    const response = await request(createApp())
      .get('/transaction-history/0xuser')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        wallet_address: {
          equals: '0xuser',
          mode: 'insensitive'
        }
      }
    }));
    expect(mockGetUserTransactionHistory).toHaveBeenCalledWith(1);
  });

  it('reads holding-date explanation only for the authenticated wallet', async () => {
    const response = await request(createApp())
      .get('/holding-date/explain/0xuser')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(mockExplainHoldingDateCalculation).toHaveBeenCalledWith(1);
  });

  it('reads FIFO snapshot only for the authenticated wallet', async () => {
    const response = await request(createApp())
      .get('/fifo-snapshot/0xuser')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        wallet_address: {
          equals: '0xuser',
          mode: 'insensitive'
        }
      },
      include: expect.objectContaining({
        HoldDateHistory: expect.any(Object)
      })
    }));
  });

  it('does not read another user transaction detail', async () => {
    mockPrisma.transactionAudit.findFirst.mockResolvedValue({
      id: 2,
      userId: 2,
      tx_hash: '0xotherhash',
      user: {
        wallet_address: '0xvictim',
        holdingDate: 91
      }
    });

    const response = await request(createApp())
      .get('/transaction/0xotherhash')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
  });

  it('reads transaction detail only for the authenticated user', async () => {
    const response = await request(createApp())
      .get('/transaction/0xhash')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.transactionAudit.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        tx_hash: '0xhash'
      }
    }));
  });

  it('keeps transaction type reference public because it contains no user data', async () => {
    const response = await request(createApp()).get('/transaction-types');

    expect(response.status).toBe(200);
    expectTransactionControllersNotReached();
  });
});
