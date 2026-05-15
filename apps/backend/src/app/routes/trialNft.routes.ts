import express from 'express';
import { TrialNftController } from '../controllers/trialNft.controller';

const router = express.Router();

// ==========================================
// Public routes (for users)
// ==========================================

// Check if user can claim trial NFT this month
router.get('/can-claim/:userId', TrialNftController.checkCanClaim);

// User claims their monthly trial NFT (ONE per month only)
router.post('/claim/:userId', TrialNftController.claimTrialNFT);

// Get active trial NFTs for a user
router.get('/user/:userId', TrialNftController.getUserTrialNFTs);

// Get total NFT count (real + trial)
router.get('/total/:userId', TrialNftController.getTotalNFTCount);

// ==========================================
// Admin routes (protected - add auth middleware in production)
// ==========================================

// Get trial NFT statistics
router.get('/stats', TrialNftController.getStats);

// Expire old trial NFTs (Admin/Cron job)
router.post('/expire', TrialNftController.expireOldNFTs);

// Get all trial NFTs with pagination (Admin)
router.get('/all', TrialNftController.getAllTrialNFTs);

export default router;
