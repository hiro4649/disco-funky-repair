import express, { Request, Response } from 'express';
import { NftController } from '../controllers/nft.controller';
import uploadExcel from '../middlewares/excelMulter';
import uploadNftImages from '../middlewares/imagesMulter';
import uploadSingleImage from '../middlewares/singleImageMulter';
import { Authenticate, AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';

const router = express.Router();

const nftMintStatusUpdateDisabled = (_req: Request, res: Response) =>
  res.status(410).json({
    success: false,
    code: 'FEATURE_DISABLED',
    message: 'Direct NFT mint status updates are disabled for the BSC launch MVP.'
  });

// ==========================================
// Admin NFT Management Routes
// ==========================================

// Step 1: Upload Excel metadata (saves to DB without IPFS)
router.post('/admin/nft/upload/metadata', AuthAdmin, uploadExcel, asyncHandler(NftController.uploadExcel.bind(NftController)));

// Upload multiple images (batch)
router.post('/admin/nft/upload/images', AuthAdmin, uploadNftImages, asyncHandler(NftController.uploadImages.bind(NftController)));

// Upload single image for a specific NFT
router.post('/admin/nft/:nftId/upload-image', AuthAdmin, uploadSingleImage, asyncHandler(NftController.uploadSingleImage.bind(NftController)));

// Step 2: Upload selected NFTs to IPFS (after admin verification)
router.post('/admin/nft/upload-to-ipfs', AuthAdmin, asyncHandler(NftController.uploadToIPFS.bind(NftController)));

// Refresh image matches (re-scan uploads directory)
router.post('/admin/nft/refresh-matches', AuthAdmin, asyncHandler(NftController.refreshImageMatches.bind(NftController)));

// Get list of uploaded images
router.get('/admin/nft/uploaded-images', AuthAdmin, asyncHandler(NftController.getUploadedImages.bind(NftController)));

// Get all NFTs (admin view with all status fields)
router.get('/admin/nfts', AuthAdmin, asyncHandler(NftController.getAllNfts.bind(NftController)));

// Delete NFT (admin only)
router.delete('/admin/nft/:id', AuthAdmin, asyncHandler(NftController.deleteNFT.bind(NftController)));

// ==========================================
// Public NFT Routes (for users/minting)
// ==========================================

// Get NFTs available to mint (uploaded to IPFS but not minted)
router.get('/nfts/mintable', asyncHandler(NftController.getMintableNfts.bind(NftController)));

// Get NFT by token ID (for minting)
router.get('/nft/:id', asyncHandler(NftController.getNFTById.bind(NftController)));

// Get NFTs by holder ID (for user's collection)
router.get('/nfts/holder/:holderId', Authenticate, asyncHandler(NftController.getNFTsByHolderId.bind(NftController)));

// Direct mint status updates require on-chain receipt verification before re-enabling.
router.patch('/nft/:id', nftMintStatusUpdateDisabled);

export { router as nftRoutes };
