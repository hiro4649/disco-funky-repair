const mockPrisma = {
  trialNftTemplate: {
    findMany: jest.fn(),
    fields: {
      maxMints: 'maxMints'
    }
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

jest.mock('../../utils/safeLogger', () => ({
  safeLogError: jest.fn()
}));

import { TrialNftTemplateController } from '../trialNftTemplate.controller';

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('TrialNftTemplateController public catalog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.trialNftTemplate.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Trial',
        description: 'Trial NFT',
        image: 'ipfs://image',
        validDays: 5,
        maxMints: 10,
        mintCount: 2,
        isAvailable: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z')
      },
      {
        id: 2,
        name: 'Sold out',
        description: 'No longer available',
        image: 'ipfs://sold-out',
        validDays: 3,
        maxMints: 1,
        mintCount: 1,
        isAvailable: true
      }
    ]);
  });

  it('returns public available templates with only claim display fields', async () => {
    const res = createResponse();

    await TrialNftTemplateController.getAvailable({} as any, res);

    expect(mockPrisma.trialNftTemplate.findMany).toHaveBeenCalledWith({
      where: {
        isAvailable: true,
        OR: [
          { maxMints: 0 },
          { mintCount: { lt: mockPrisma.trialNftTemplate.fields.maxMints } }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        validDays: true,
        maxMints: true,
        mintCount: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.data).toEqual([
      {
        id: 1,
        name: 'Trial',
        description: 'Trial NFT',
        image: 'ipfs://image',
        validDays: 5
      }
    ]);
    expect(responseBody.data[0]).not.toHaveProperty('maxMints');
    expect(responseBody.data[0]).not.toHaveProperty('mintCount');
    expect(responseBody.data[0]).not.toHaveProperty('isAvailable');
    expect(responseBody.data[0]).not.toHaveProperty('createdAt');
    expect(responseBody.data[0]).not.toHaveProperty('updatedAt');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
