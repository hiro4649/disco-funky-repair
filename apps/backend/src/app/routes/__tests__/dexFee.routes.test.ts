import express from 'express';
const request = require('supertest');

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

const mockPrisma = {
  dexList: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  },
  feeChangeHistory: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

import { dexFeeRoutes } from '../dexFee.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(dexFeeRoutes);
  return app;
};

const disabledResponse = {
  success: false,
  code: 'MANUAL_REVIEW_REQUIRED',
  message: 'Governance, fee, DEX, and pair management changes are disabled in the backend. Use the governance runbook and multisig/timelock process.'
};

describe('dex and fee management routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables DEX add route before DB or on-chain state is changed', async () => {
    const response = await request(createApp())
      .post('/dex/add')
      .set('Authorization', 'Bearer admin-token')
      .send({
        address: '0x0000000000000000000000000000000000000001',
        name: 'PancakeSwap',
        txHash: '0xnotOnChain'
      });

    expect(response.status).toBe(410);
    expect(response.body).toEqual(disabledResponse);
    expect(mockPrisma.dexList.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.dexList.create).not.toHaveBeenCalled();
    expect(mockPrisma.dexList.update).not.toHaveBeenCalled();
  });

  it('disables DEX remove route before DB or on-chain state is changed', async () => {
    const response = await request(createApp())
      .delete('/dex/remove/0x0000000000000000000000000000000000000001')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(410);
    expect(response.body).toEqual(disabledResponse);
    expect(mockPrisma.dexList.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.dexList.update).not.toHaveBeenCalled();
  });

  it('disables fee record route so DB-only governance history cannot claim on-chain completion', async () => {
    const response = await request(createApp())
      .post('/fee/record')
      .set('Authorization', 'Bearer admin-token')
      .send({
        changeType: 'percentage',
        newValue: '200',
        changedBy: 'admin',
        txHash: '0xnotOnChain'
      });

    expect(response.status).toBe(410);
    expect(response.body).toEqual(disabledResponse);
    expect(mockPrisma.feeChangeHistory.create).not.toHaveBeenCalled();
  });

  it.each([
    ['get', '/dex/list'],
    ['post', '/dex/add'],
    ['delete', '/dex/remove/0x0000000000000000000000000000000000000001'],
    ['get', '/fee/history'],
    ['post', '/fee/record']
  ])('requires admin authentication for %s %s', async (method, path) => {
    const unauthenticated = await (request(createApp()) as any)[method](path)
      .send({ adminKey: 'legacy-admin-key' });
    const userAuthenticated = await (request(createApp()) as any)[method](path)
      .set('Authorization', 'Bearer user-token')
      .send({ adminKey: 'legacy-admin-key' });

    expect(unauthenticated.status).toBe(401);
    expect(userAuthenticated.status).toBe(403);
    expect(mockPrisma.dexList.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.dexList.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.dexList.update).not.toHaveBeenCalled();
    expect(mockPrisma.dexList.create).not.toHaveBeenCalled();
    expect(mockPrisma.feeChangeHistory.findMany).not.toHaveBeenCalled();
    expect(mockPrisma.feeChangeHistory.count).not.toHaveBeenCalled();
    expect(mockPrisma.feeChangeHistory.create).not.toHaveBeenCalled();
  });

  it('allows admin authentication to read DEX list', async () => {
    mockPrisma.dexList.findMany.mockResolvedValueOnce([
      {
        id: 1,
        address: '0x0000000000000000000000000000000000000001',
        name: 'PancakeSwap',
        addedBy: 'admin',
        txHash: '0xabc',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z')
      }
    ]);

    const response = await request(createApp())
      .get('/dex/list')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.dexList.findMany).toHaveBeenCalledTimes(1);
  });

  it('allows admin authentication to read fee history', async () => {
    mockPrisma.feeChangeHistory.findMany.mockResolvedValueOnce([]);
    mockPrisma.feeChangeHistory.count.mockResolvedValueOnce(0);

    const response = await request(createApp())
      .get('/fee/history')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(mockPrisma.feeChangeHistory.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.feeChangeHistory.count).toHaveBeenCalledTimes(1);
  });

  it('keeps current fee settings as a minimal public read', async () => {
    mockPrisma.feeChangeHistory.findFirst
      .mockResolvedValueOnce({ newValue: '200', createdAt: new Date('2026-01-01T00:00:00.000Z') })
      .mockResolvedValueOnce({ newValue: '0x0000000000000000000000000000000000000001', createdAt: new Date('2026-01-02T00:00:00.000Z') });

    const response = await request(createApp()).get('/fee/current');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      feePercentage: '200',
      feeRecipient: '0x0000000000000000000000000000000000000001',
      lastUpdated: {
        percentage: '2026-01-01T00:00:00.000Z',
        recipient: '2026-01-02T00:00:00.000Z'
      }
    });
    expect(response.body.data).not.toHaveProperty('txHash');
    expect(response.body.data).not.toHaveProperty('changedBy');
  });
});
