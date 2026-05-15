import express from 'express';
const request = require('supertest');

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
      .delete('/dex/remove/0x0000000000000000000000000000000000000001');

    expect(response.status).toBe(410);
    expect(response.body).toEqual(disabledResponse);
    expect(mockPrisma.dexList.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.dexList.update).not.toHaveBeenCalled();
  });

  it('disables fee record route so DB-only governance history cannot claim on-chain completion', async () => {
    const response = await request(createApp())
      .post('/fee/record')
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
});
