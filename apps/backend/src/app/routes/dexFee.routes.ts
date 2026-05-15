import express from 'express';
import { DexFeeController } from '../controllers/dexFeeController';
import { asyncHandler } from './utils';

const router = express.Router();

// DEX Management Routes
router.get('/dex/list', asyncHandler(DexFeeController.getAllDexAddresses.bind(DexFeeController)));
router.post('/dex/add', asyncHandler(DexFeeController.addDexAddress.bind(DexFeeController)));
router.delete('/dex/remove/:address', asyncHandler(DexFeeController.removeDexAddress.bind(DexFeeController)));

// Fee Management Routes
router.get('/fee/history', asyncHandler(DexFeeController.getFeeChangeHistory.bind(DexFeeController)));
router.post('/fee/record', asyncHandler(DexFeeController.addFeeChangeRecord.bind(DexFeeController)));
router.get('/fee/current', asyncHandler(DexFeeController.getCurrentFeeSettings.bind(DexFeeController)));

export { router as dexFeeRoutes };
