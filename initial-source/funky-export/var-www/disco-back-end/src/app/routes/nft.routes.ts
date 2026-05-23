import express from 'express';
import { NftController } from '../controllers/nft.controller';
import uploadExcel from '../middlewares/excelMulter';
import uploadNftImages from '../middlewares/imagesMulter';
import { asyncHandler } from './utils';

const router = express.Router();

// NFT Routes
router.post('/admin/nft/upload/metadata', uploadExcel, asyncHandler(NftController.uploadExcel.bind(NftController)));
router.post('/admin/nft/upload/images', uploadNftImages, asyncHandler(NftController.uploadImages.bind(NftController)));
router.get('/admin/nfts', asyncHandler(NftController.getAllNfts.bind(NftController)));

export { router as nftRoutes }; 