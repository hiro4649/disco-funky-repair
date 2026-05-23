import express from 'express';
import { PrizeController } from '../controllers/prize.controller';
import { Authenticate, AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';

const router = express.Router();

// Admin Prize Routes
router.get('/admin/airdrop/prize', asyncHandler(PrizeController.adminGetPrize.bind(PrizeController)));
router.get('/admin/airdrop/prize/:prize_id', asyncHandler(PrizeController.getEditPrize.bind(PrizeController)));
router.delete('/admin/airdrop/prize/:prize_id', asyncHandler(PrizeController.deletePrize.bind(PrizeController)));
router.patch('/admin/airdrop/prize/:prize_id', AuthAdmin, asyncHandler(PrizeController.editPrize.bind(PrizeController)));
router.post('/admin/airdrop/prize/:prize_id', AuthAdmin, asyncHandler(PrizeController.createNewPrize.bind(PrizeController)));

// User Prize Routes
router.get('/airdrop/prize', asyncHandler(PrizeController.getPrize.bind(PrizeController)));
router.post('/airdrop/prize/draw/:user_id', Authenticate, asyncHandler(PrizeController.drawPrize.bind(PrizeController)));
router.get('/airdrop/prize/transactions/:user_id', Authenticate, asyncHandler(PrizeController.getPrizeTransactions.bind(PrizeController)));
router.post('/airdrop/prize/send/:prize_id', Authenticate, asyncHandler(PrizeController.sendToWallet.bind(PrizeController)));
router.post('/prize/transaction/:user_id/withDraw/:prize_id', Authenticate, asyncHandler(PrizeController.withDrawPrizeToken.bind(PrizeController)));

export { router as prizeRoutes }; 