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
import getDiscoNFTEVM from '../../lib/getDiscoNFTEVM';
import {
  canClaimTrialNFT,
  getActiveTrialNFTs,
  getActiveTrialNFTCount
} from '../../lib/trialNftService';

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

describe('TrialNftController user-specific reads authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, wallet_address: '0xuser' });
    (canClaimTrialNFT as jest.Mock).mockResolvedValue({
      canClaim: true,
      reason: 'Eligible'
    });
    (getActiveTrialNFTs as jest.Mock).mockResolvedValue([{ id: 11, name: 'Trial NFT' }]);
    (getActiveTrialNFTCount as jest.Mock).mockResolvedValue(2);
    (getDiscoNFTEVM as jest.Mock).mockResolvedValue(3);
  });

  it('does not check claim status without an authenticated user', async () => {
    const res = createResponse();

    await TrialNftController.checkCanClaim(createRequest({ userId: '1' }, {}, null), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(canClaimTrialNFT).not.toHaveBeenCalled();
  });

  it('does not check another user claim status or read DB/service data', async () => {
    const res = createResponse();

    await TrialNftController.checkCanClaim(createRequest({ userId: '2' }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(canClaimTrialNFT).not.toHaveBeenCalled();
  });

  it('checks claim status only for the authenticated user id', async () => {
    const res = createResponse();

    await TrialNftController.checkCanClaim(createRequest({ userId: '1' }), res);

    expect(canClaimTrialNFT).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not read another user trial NFT list', async () => {
    const res = createResponse();

    await TrialNftController.getUserTrialNFTs(createRequest({ userId: '2' }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(getActiveTrialNFTs).not.toHaveBeenCalled();
  });

  it('reads trial NFT list only for the authenticated user id', async () => {
    const res = createResponse();

    await TrialNftController.getUserTrialNFTs(createRequest({ userId: '1' }), res);

    expect(getActiveTrialNFTs).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('does not count another user NFTs or read wallet data', async () => {
    const res = createResponse();

    await TrialNftController.getTotalNFTCount(createRequest({ userId: '2' }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(getDiscoNFTEVM).not.toHaveBeenCalled();
    expect(getActiveTrialNFTCount).not.toHaveBeenCalled();
  });

  it('counts NFTs only for the authenticated user id', async () => {
    const res = createResponse();

    await TrialNftController.getTotalNFTCount(createRequest({ userId: '1' }), res);

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { wallet_address: true }
    });
    expect(getDiscoNFTEVM).toHaveBeenCalledWith('0xuser');
    expect(getActiveTrialNFTCount).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
