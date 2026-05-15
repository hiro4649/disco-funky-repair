import express from 'express';
const request = require('supertest');

import { nftRoutes } from '../nft.routes';
import { NftController } from '../../controllers/nft.controller';

jest.mock('../../controllers/nft.controller', () => ({
  NftController: {
    uploadExcel: jest.fn(),
    uploadImages: jest.fn(),
    uploadSingleImage: jest.fn(),
    uploadToIPFS: jest.fn(),
    refreshImageMatches: jest.fn(),
    getUploadedImages: jest.fn(),
    getAllNfts: jest.fn(),
    deleteNFT: jest.fn(),
    getMintableNfts: jest.fn(),
    getNFTById: jest.fn(),
    getNFTsByHolderId: jest.fn(),
    updateNFT: jest.fn()
  }
}));

describe('nft routes', () => {
  it('blocks direct NFT mint status updates before controller logic runs', async () => {
    const app = express();
    app.use(express.json());
    app.use(nftRoutes);

    const response = await request(app)
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
});
