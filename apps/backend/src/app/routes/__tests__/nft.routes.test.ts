import express from 'express';
const request = require('supertest');

const mockUploadExcel = jest.fn((_req: any, _res: any, next: any) => next());
const mockUploadNftImages = jest.fn((_req: any, _res: any, next: any) => next());
const mockUploadSingleImage = jest.fn((_req: any, _res: any, next: any) => next());

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

jest.mock('../../middlewares/excelMulter', () => mockUploadExcel);
jest.mock('../../middlewares/imagesMulter', () => mockUploadNftImages);
jest.mock('../../middlewares/singleImageMulter', () => mockUploadSingleImage);

jest.mock('../../controllers/nft.controller', () => ({
  NftController: {
    uploadExcel: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    uploadImages: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    uploadSingleImage: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    uploadToIPFS: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    refreshImageMatches: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    getUploadedImages: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    getAllNfts: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    deleteNFT: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    getMintableNfts: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    getNFTById: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    getNFTsByHolderId: jest.fn((_req: any, res: any) => res.status(200).json({ success: true })),
    updateNFT: jest.fn()
  }
}));

import { nftRoutes } from '../nft.routes';
import { NftController } from '../../controllers/nft.controller';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(nftRoutes);
  return app;
};

describe('nft routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks direct NFT mint status updates before controller logic runs', async () => {
    const response = await request(createApp())
      .patch('/nft/1')
      .send({ holderId: 123, mintStatus: true, txHash: '0xabc' });

    expect(response.status).toBe(410);
    expect(response.body).toEqual({
      success: false,
      code: 'FEATURE_DISABLED',
      message: 'Direct NFT mint status updates are disabled for the BSC launch MVP.'
    });
    expect(NftController.updateNFT).not.toHaveBeenCalled();
  });

  it('does not reach NFT metadata upload middleware without admin authentication even if adminKey is provided', async () => {
    const response = await request(createApp())
      .post('/admin/nft/upload/metadata')
      .send({ adminKey: 'legacy-admin-key' });

    expect(response.status).toBe(401);
    expect(mockUploadExcel).not.toHaveBeenCalled();
    expect(NftController.uploadExcel).not.toHaveBeenCalled();
  });

  it('does not reach NFT admin upload with a general user token', async () => {
    const response = await request(createApp())
      .post('/admin/nft/upload/images')
      .set('Authorization', 'Bearer user-token')
      .send({});

    expect(response.status).toBe(403);
    expect(mockUploadNftImages).not.toHaveBeenCalled();
    expect(NftController.uploadImages).not.toHaveBeenCalled();
  });

  it('does not delete NFT records with a general user token', async () => {
    const response = await request(createApp())
      .delete('/admin/nft/1')
      .set('Authorization', 'Bearer user-token');

    expect(response.status).toBe(403);
    expect(NftController.deleteNFT).not.toHaveBeenCalled();
  });

  it.each([
    ['post', '/admin/nft/upload/metadata', 'uploadExcel'],
    ['post', '/admin/nft/upload/images', 'uploadImages'],
    ['post', '/admin/nft/1/upload-image', 'uploadSingleImage'],
    ['post', '/admin/nft/upload-to-ipfs', 'uploadToIPFS'],
    ['post', '/admin/nft/refresh-matches', 'refreshImageMatches'],
    ['get', '/admin/nft/uploaded-images', 'getUploadedImages'],
    ['get', '/admin/nfts', 'getAllNfts'],
    ['delete', '/admin/nft/1', 'deleteNFT']
  ])('allows admin authentication to reach %s %s', async (method, path, controllerMethod) => {
    const response = await (request(createApp()) as any)[method](path)
      .set('Authorization', 'Bearer admin-token')
      .send({ nftIds: [1] });

    expect(response.status).toBe(200);
    expect((NftController as any)[controllerMethod]).toHaveBeenCalledTimes(1);
  });
});
