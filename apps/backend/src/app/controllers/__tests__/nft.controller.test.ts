const mockPrisma = {
  nft: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn()
  }
};

jest.mock('../../db/prisma_client', () => ({
  __esModule: true,
  default: mockPrisma
}));

jest.mock('../../config/env', () => ({
  NFT_STORAGE_ENDPOINT: '',
  NFT_STORAGE_API_KEY: 'unit-test-lighthouse-key'
}));

jest.mock('@lighthouse-web3/sdk', () => ({
  __esModule: true,
  default: {
    upload: jest.fn()
  }
}));

jest.mock('../../utils/safeLogger', () => ({
  safeLogError: jest.fn(),
  safeLogWarn: jest.fn()
}));

import fs from 'fs';
import path from 'path';
import lighthouse from '@lighthouse-web3/sdk';
import { NftController } from '../nft.controller';
import { safeLogError } from '../../utils/safeLogger';

const lighthouseUploadMock = lighthouse.upload as jest.Mock;
const uploadDir = path.resolve(process.cwd(), 'uploads/images');
const createdTestFiles = new Set<string>();

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

const createUploadRequest = (body: any) => ({ body } as any);

const createNftRecord = (overrides: Record<string, any> = {}) => ({
  id: 1,
  name: 'DISCO Genesis #1',
  description: 'Public description',
  imageMatched: true,
  localImagePath: null,
  ipfsUploaded: false,
  creator: 'creator',
  owner: 'owner',
  royalty: 0,
  attributes: [],
  collectionId: 'collection',
  externalUrl: null,
  ...overrides
});

const expectResponseDoesNotExposeRawError = (res: any, rawMessage: string) => {
  const responseBody = res.json.mock.calls[0][0];
  expect(JSON.stringify(responseBody)).not.toContain(rawMessage);
  expect(responseBody).not.toHaveProperty('error');
};

const createLocalUploadFile = async (filename: string): Promise<string> => {
  await fs.promises.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filePath, Buffer.from('test image'));
  createdTestFiles.add(filePath);
  return filePath;
};

describe('NftController public catalog and owner reads', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(async () => {
    await Promise.all(
      Array.from(createdTestFiles).map((filePath) =>
        fs.promises.unlink(filePath).catch(() => undefined)
      )
    );
    createdTestFiles.clear();
    jest.restoreAllMocks();
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

  it('does not expose local paths in admin NFT list responses', async () => {
    const localImagePath = 'C:\\uploads\\images\\77777777-7777-4777-8777-777777777777.png';
    mockPrisma.nft.findMany.mockResolvedValue([
      createNftRecord({
        localImagePath,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z')
      })
    ]);
    const res = createResponse();

    await NftController.getAllNfts({} as any, res);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.data[0]).not.toHaveProperty('localImagePath');
    expect(responseBody.data[0]).toHaveProperty('hasLocalImagePath', true);
    expect(JSON.stringify(responseBody)).not.toContain(localImagePath);
  });

  it('does not expose raw errors when admin NFT list fails', async () => {
    const rawMessage = 'raw admin list database failure';
    mockPrisma.nft.findMany.mockRejectedValue(new Error(rawMessage));
    const res = createResponse();

    await NftController.getAllNfts({} as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to fetch NFTs'
    });
    expectResponseDoesNotExposeRawError(res, rawMessage);
    expect(safeLogError).toHaveBeenCalledWith('get_all_nfts', expect.any(Error));
  });

  it('does not expose raw errors when holder NFT collection read fails', async () => {
    const rawMessage = 'raw holder collection failure';
    mockPrisma.nft.findMany.mockRejectedValue(new Error(rawMessage));
    const res = createResponse();

    await NftController.getNFTsByHolderId(createRequest({ holderId: '1' }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to fetch NFTs'
    });
    expectResponseDoesNotExposeRawError(res, rawMessage);
    expect(safeLogError).toHaveBeenCalledWith('get_holder_nfts', expect.any(Error), { holderId: 1 });
  });

  it('does not expose raw errors when mintable NFT catalog read fails', async () => {
    const rawMessage = 'raw mintable catalog failure';
    mockPrisma.nft.findMany.mockRejectedValue(new Error(rawMessage));
    const res = createResponse();

    await NftController.getMintableNfts(createRequest({}), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to fetch mintable NFTs'
    });
    expectResponseDoesNotExposeRawError(res, rawMessage);
    expect(safeLogError).toHaveBeenCalledWith('get_mintable_nfts', expect.any(Error));
  });

  it('does not expose raw errors when public NFT detail read fails', async () => {
    const rawMessage = 'raw public detail failure';
    mockPrisma.nft.findFirst.mockRejectedValue(new Error(rawMessage));
    const res = createResponse();

    await NftController.getNFTById(createRequest({ id: '1' }), res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to fetch NFT'
    });
    expectResponseDoesNotExposeRawError(res, rawMessage);
    expect(safeLogError).toHaveBeenCalledWith('get_nft_by_token_id', expect.any(Error), { tokenId: 1 });
  });

  it('does not expose raw errors when disabled NFT update logic fails if called directly', async () => {
    const rawMessage = 'raw update failure';
    mockPrisma.nft.updateMany.mockRejectedValue(new Error(rawMessage));
    const res = createResponse();

    await NftController.updateNFT({
      params: { id: '1' },
      body: { holderId: 1, mintStatus: true }
    } as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to update NFT'
    });
    expectResponseDoesNotExposeRawError(res, rawMessage);
    expect(safeLogError).toHaveBeenCalledWith('update_nft', expect.any(Error), { tokenId: 1 });
  });

  it('does not expose raw errors when admin NFT delete fails', async () => {
    const rawMessage = 'raw delete failure';
    mockPrisma.nft.findUnique.mockResolvedValue(createNftRecord({ mintStatus: false }));
    mockPrisma.nft.delete.mockRejectedValue(new Error(rawMessage));
    const res = createResponse();

    await NftController.deleteNFT(createRequest({ id: '1' }), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to delete NFT'
    });
    expectResponseDoesNotExposeRawError(res, rawMessage);
    expect(safeLogError).toHaveBeenCalledWith('delete_nft', expect.any(Error), { nftId: 1 });
  });

  it('does not expose local upload paths in successful image upload responses', async () => {
    mockPrisma.nft.findMany.mockResolvedValue([]);
    const res = createResponse();

    await NftController.uploadImages({
      files: [{
        filename: '11111111-1111-4111-8111-111111111111.png',
        originalname: 'Token.png',
        path: 'C:\\uploads\\images\\11111111-1111-4111-8111-111111111111.png',
        size: 9,
        mimetype: 'image/png'
      }]
    } as any, res);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.files[0]).not.toHaveProperty('path');
    expect(responseBody.files[0]).not.toHaveProperty('filePath');
  });

  it('removes uploaded image files when image matching fails after local save', async () => {
    const unlinkSpy = jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined as any);
    mockPrisma.nft.findMany.mockRejectedValue(new Error('database unavailable'));
    const uploadedPath = 'C:\\uploads\\images\\11111111-1111-4111-8111-111111111111.png';
    const res = createResponse();

    await NftController.uploadImages({
      files: [{
        filename: '11111111-1111-4111-8111-111111111111.png',
        originalname: 'Token.png',
        path: uploadedPath,
        size: 9,
        mimetype: 'image/png'
      }]
    } as any, res);

    expect(unlinkSpy).toHaveBeenCalledWith(uploadedPath);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('removes uploaded single image files when the target NFT is missing', async () => {
    const unlinkSpy = jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined as any);
    mockPrisma.nft.findUnique.mockResolvedValue(null);
    const uploadedPath = 'C:\\uploads\\images\\22222222-2222-4222-8222-222222222222.png';
    const res = createResponse();

    await NftController.uploadSingleImage({
      params: { nftId: '123' },
      file: {
        filename: '22222222-2222-4222-8222-222222222222.png',
        originalname: 'Token.png',
        path: uploadedPath
      }
    } as any, res);

    expect(unlinkSpy).toHaveBeenCalledWith(uploadedPath);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('does not expose local paths in successful single image upload responses', async () => {
    const uploadedPath = 'C:\\uploads\\images\\22222222-2222-4222-8222-222222222222.png';
    mockPrisma.nft.findUnique.mockResolvedValue({
      id: 123,
      excelImageName: null
    });
    mockPrisma.nft.update.mockResolvedValue({
      id: 123,
      name: 'DISCO Genesis #123',
      excelImageName: 'Token.png',
      imageMatched: true,
      updatedAt: new Date('2026-05-21T00:00:00.000Z')
    });
    const res = createResponse();

    await NftController.uploadSingleImage({
      params: { nftId: '123' },
      file: {
        filename: '22222222-2222-4222-8222-222222222222.png',
        originalname: 'Token.png',
        path: uploadedPath
      }
    } as any, res);

    const responseBody = res.json.mock.calls[0][0];
    expect(mockPrisma.nft.update).toHaveBeenCalledWith(expect.objectContaining({
      select: {
        id: true,
        name: true,
        excelImageName: true,
        imageMatched: true,
        updatedAt: true
      }
    }));
    expect(responseBody.data).toEqual(expect.objectContaining({
      id: 123,
      name: 'DISCO Genesis #123',
      hasLocalImagePath: true
    }));
    expect(responseBody.data).not.toHaveProperty('localImagePath');
    expect(JSON.stringify(responseBody)).not.toContain(uploadedPath);
  });

  it('returns a clear full-success response for IPFS uploads', async () => {
    const localImagePath = await createLocalUploadFile('44444444-4444-4444-8444-444444444444.png');
    mockPrisma.nft.findUnique.mockResolvedValue(createNftRecord({ localImagePath }));
    mockPrisma.nft.update.mockResolvedValue({});
    lighthouseUploadMock
      .mockResolvedValueOnce({ data: { Hash: 'image-cid' } })
      .mockResolvedValueOnce({ data: { Hash: 'metadata-cid' } });
    const res = createResponse();

    await NftController.uploadToIPFS(createUploadRequest({ nftIds: [1] }), res);

    const responseBody = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);
    expect(responseBody).toEqual(expect.objectContaining({
      success: true,
      partialSuccess: false,
      successCount: 1,
      errorCount: 0
    }));
    expect(lighthouseUploadMock).toHaveBeenCalledWith(localImagePath, expect.any(String));
    expect(JSON.stringify(responseBody)).not.toContain(localImagePath);
  });

  it('rejects IPFS uploads when localImagePath resolves outside UPLOAD_DIR', async () => {
    const outsidePath = path.resolve(process.cwd(), 'private-nft-image.png');
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    mockPrisma.nft.findUnique.mockResolvedValue(createNftRecord({ localImagePath: outsidePath }));
    const res = createResponse();

    await NftController.uploadToIPFS(createUploadRequest({ nftIds: [1] }), res);

    const responseBody = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(400);
    expect(responseBody).toEqual(expect.objectContaining({
      success: false,
      partialSuccess: false,
      successCount: 0,
      errorCount: 1
    }));
    expect(responseBody.results[0]).toEqual(expect.objectContaining({
      status: 'error: unsafe local image path'
    }));
    expect(lighthouseUploadMock).not.toHaveBeenCalled();
    expect(JSON.stringify(responseBody)).not.toContain(outsidePath);
    expect(JSON.stringify(logSpy.mock.calls)).not.toContain(outsidePath);
  });

  it('rejects SVG and unsupported extensions before IPFS upload', async () => {
    const svgPath = path.join(uploadDir, '55555555-5555-4555-8555-555555555555.svg');
    mockPrisma.nft.findUnique.mockResolvedValue(createNftRecord({ localImagePath: svgPath }));
    const res = createResponse();

    await NftController.uploadToIPFS(createUploadRequest({ nftIds: [1] }), res);

    const responseBody = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(400);
    expect(responseBody).toEqual(expect.objectContaining({
      success: false,
      partialSuccess: false,
      successCount: 0,
      errorCount: 1
    }));
    expect(responseBody.results[0]).toEqual(expect.objectContaining({
      status: 'error: unsupported image extension'
    }));
    expect(lighthouseUploadMock).not.toHaveBeenCalled();
  });

  it('marks mixed IPFS upload results as partial success without success:true', async () => {
    const localImagePath = await createLocalUploadFile('66666666-6666-4666-8666-666666666666.png');
    const outsidePath = path.resolve(process.cwd(), 'outside-partial-image.png');
    mockPrisma.nft.findUnique.mockImplementation(({ where }: any) =>
      Promise.resolve(where.id === 1
        ? createNftRecord({ id: 1, localImagePath })
        : createNftRecord({ id: 2, name: 'DISCO Genesis #2', localImagePath: outsidePath }))
    );
    mockPrisma.nft.update.mockResolvedValue({});
    lighthouseUploadMock
      .mockResolvedValueOnce({ data: { Hash: 'image-cid' } })
      .mockResolvedValueOnce({ data: { Hash: 'metadata-cid' } });
    const res = createResponse();

    await NftController.uploadToIPFS(createUploadRequest({ nftIds: [1, 2] }), res);

    const responseBody = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(207);
    expect(responseBody).toEqual(expect.objectContaining({
      success: false,
      partialSuccess: true,
      successCount: 1,
      errorCount: 1
    }));
    expect(responseBody.results).toEqual([
      expect.objectContaining({ id: 1, status: 'success: uploaded to IPFS' }),
      expect.objectContaining({ id: 2, status: 'error: unsafe local image path' })
    ]);
    expect(JSON.stringify(responseBody)).not.toContain(outsidePath);
  });

  it('removes uploaded Excel files when parsing fails', async () => {
    const unlinkSpy = jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined as any);
    const uploadedPath = 'C:\\uploads\\excel\\33333333-3333-4333-8333-333333333333.xlsx';
    const res = createResponse();

    await NftController.uploadExcel({
      file: {
        path: uploadedPath
      }
    } as any, res);

    expect(unlinkSpy).toHaveBeenCalledWith(uploadedPath);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
