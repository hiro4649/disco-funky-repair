const mockPrisma = {
  user: {
    findUnique: jest.fn()
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

const mockClaimTrialNFT = jest.fn();

jest.mock('../../lib/trialNftService', () => ({
  expireOldTrialNFTs: jest.fn(),
  getActiveTrialNFTs: jest.fn(),
  getTotalNFTCount: jest.fn(),
  getActiveTrialNFTCount: jest.fn(),
  claimTrialNFT: (...args: any[]) => mockClaimTrialNFT(...args),
  canClaimTrialNFT: jest.fn()
}));

jest.mock('../../lib/getDiscoNFTEVM', () => jest.fn());

import { TrialNftController } from '../trialNft.controller';

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createRequest = (params: any, body: any = {}, user: any = { user_id: 1 }) => ({
  params,
  body,
  ...(user ? { user } : {})
} as any);

describe('TrialNftController.claimTrialNFT authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, wallet_address: '0xuser' });
    mockClaimTrialNFT.mockResolvedValue({
      success: true,
      message: 'Trial NFT claimed successfully',
      data: { id: 10 }
    });
  });

  it('does not claim without an authenticated user', async () => {
    const res = createResponse();

    await TrialNftController.claimTrialNFT(createRequest({ userId: '1' }, { templateId: 2 }, null), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockClaimTrialNFT).not.toHaveBeenCalled();
  });

  it('does not claim for another user id', async () => {
    const res = createResponse();

    await TrialNftController.claimTrialNFT(createRequest({ userId: '2' }, { templateId: 2 }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockClaimTrialNFT).not.toHaveBeenCalled();
  });

  it('claims only for the authenticated user id', async () => {
    const res = createResponse();

    await TrialNftController.claimTrialNFT(createRequest({ userId: '1' }, { templateId: 2 }), res);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(mockClaimTrialNFT).toHaveBeenCalledWith(1, 2);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
