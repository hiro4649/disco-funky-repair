import express from 'express';
import { DexFeeController } from '../controllers/dexFeeController';
import { AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';

const router = express.Router();

// DEX Management Routes
router.get('/dex/list', AuthAdmin, asyncHandler(DexFeeController.getAllDexAddresses.bind(DexFeeController)));
router.post('/dex/add', AuthAdmin, asyncHandler(DexFeeController.addDexAddress.bind(DexFeeController)));
router.delete('/dex/remove/:address', AuthAdmin, asyncHandler(DexFeeController.removeDexAddress.bind(DexFeeController)));

// Fee Management Routes
router.get('/fee/history', AuthAdmin, asyncHandler(DexFeeController.getFeeChangeHistory.bind(DexFeeController)));
router.post('/fee/record', AuthAdmin, asyncHandler(DexFeeController.addFeeChangeRecord.bind(DexFeeController)));
router.get('/fee/current', asyncHandler(DexFeeController.getCurrentFeeSettings.bind(DexFeeController)));

export { router as dexFeeRoutes };
