import express from 'express';
import { ReferralController } from '../controllers/referral.controller';
import { AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';

const router = express.Router();

// User routes
router.get('/referral/code', asyncHandler(ReferralController.generateReferralCode.bind(ReferralController)));
router.get('/referral/stats', asyncHandler(ReferralController.getReferralStats.bind(ReferralController)));
router.post('/referral/process', asyncHandler(ReferralController.processReferral.bind(ReferralController)));

// Admin routes
router.get('/admin/referral/stats', AuthAdmin, asyncHandler(ReferralController.adminGetReferralStats.bind(ReferralController)));
router.post('/admin/referral/check-bonuses', AuthAdmin, asyncHandler(ReferralController.checkAndAwardReferralBonuses.bind(ReferralController)));
router.post('/admin/referral/manual-trigger', AuthAdmin, asyncHandler(ReferralController.manualTriggerReferralBonusCheck.bind(ReferralController)));

export { router as referralRoutes }; 