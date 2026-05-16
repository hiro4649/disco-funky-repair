const mockPrisma = {
  nft: {
    findMany: jest.fn(),
    findFirst: jest.fn()
  }
};

jest.mock('../../db/prisma_client', () => ({
  __esModule: true,
  default: mockPrisma
}));

jest.mock('../../config/env', () => ({
  NFT_STORAGE_ENDPOINT: '',
  NFT_STORAGE_API_KEY: ''
}));

jest.mock('@lighthouse-web3/sdk', () => ({
  __esModule: true,
  default: {
    upload: jest.fn()
  }
}));

import { NftController } from '../nft.controller';

const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createRequest = (params: any, user: any = { user_id: 1 }) => ({
  params,
  ...(user ? { user } : {})
} as any);

describe('NftController public catalog and owner reads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not read holder NFT collection without an authenticated user', async () => {
    const res = createResponse();

    await NftController.getNFTsByHolderId(createRequest({ holderId: '1' }, null), res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockPrisma.nft.findMany).not.toHaveBeenCalled();
  });

  it('does not read another holder NFT collection', async () => {
    const res = createResponse();

    await NftController.getNFTsByHolderId(createRequest({ holderId: '2' }), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockPrisma.nft.findMany).not.toHaveBeenCalled();
  });

  it('reads holder NFT collection with authenticated owner scope and safe fields', async () => {
    mockPrisma.nft.findMany.mockResolvedValue([
      {
        id: 1,
        holderId: 1,
        name: 'DISCO Genesis #1',
        description: 'Public description',
        image: 'ipfs://image',
        attributes: [],
        externalUrl: null,
        mintStatus: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z')
      }
    ]);
    const res = createResponse();

    await NftController.getNFTsByHolderId(createRequest({ holderId: '1' }), res);

    expect(mockPrisma.nft.findMany).toHaveBeenCalledWith({
      where: {
        holderId: 1,
        mintStatus: true
      },
      select: {
        id: true,
        holderId: true,
        name: true,
        description: true,
        image: true,
        attributes: true,
        externalUrl: true,
        mintStatus: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.data[0]).not.toHaveProperty('creator');
    expect(responseBody.data[0]).not.toHaveProperty('owner');
    expect(responseBody.data[0]).not.toHaveProperty('royalty');
    expect(responseBody.data[0]).not.toHaveProperty('collectionId');
    expect(responseBody.data[0]).not.toHaveProperty('ipfsCid');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns public mintable NFT catalog with only mint display fields', async () => {
    mockPrisma.nft.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'DISCO Genesis #1',
        description: 'Public description',
        image: 'ipfs://image'
      }
    ]);
    const res = createResponse();

    await NftController.getMintableNfts(createRequest({}), res);

    expect(mockPrisma.nft.findMany).toHaveBeenCalledWith({
      where: {
        ipfsUploaded: true,
        mintStatus: false
      },
      select: {
        id: true,
        name: true,
        description: true,
        image: true
      },
      orderBy: { id: 'asc' }
    });
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.data[0]).not.toHaveProperty('mintStatus');
    expect(responseBody.data[0]).not.toHaveProperty('ipfsUploaded');
    expect(responseBody.data[0]).not.toHaveProperty('createdAt');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns public NFT detail without internal ownership fields', async () => {
    mockPrisma.nft.findFirst.mockResolvedValue({
      id: 1,
      name: 'DISCO Genesis #1',
      description: 'Public description',
      image: 'ipfs://image',
      attributes: [],
      externalUrl: null,
      ipfsCid: 'bafyPublicCid',
      mintStatus: false,
      ipfsUploaded: true,
      holderId: 999,
      owner: '0xowner',
      creator: '0xcreator',
      royalty: '10',
      collectionId: 'private-collection'
    });
    const res = createResponse();

    await NftController.getNFTById(createRequest({ id: '1' }), res);

    expect(mockPrisma.nft.findFirst).toHaveBeenCalledWith({
      where: { name: 'DISCO Genesis #1' },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        attributes: true,
        externalUrl: true,
        ipfsCid: true,
        mintStatus: true,
        ipfsUploaded: true
      }
    });
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.data).toEqual({
      id: 1,
      name: 'DISCO Genesis #1',
      description: 'Public description',
      image: 'ipfs://image',
      attributes: [],
      externalUrl: null,
      ipfsCid: 'bafyPublicCid'
    });
    expect(responseBody.data).not.toHaveProperty('mintStatus');
    expect(responseBody.data).not.toHaveProperty('ipfsUploaded');
    expect(responseBody.data).not.toHaveProperty('holderId');
    expect(responseBody.data).not.toHaveProperty('owner');
    expect(responseBody.data).not.toHaveProperty('creator');
    expect(responseBody.data).not.toHaveProperty('royalty');
    expect(responseBody.data).not.toHaveProperty('collectionId');
  });
});
