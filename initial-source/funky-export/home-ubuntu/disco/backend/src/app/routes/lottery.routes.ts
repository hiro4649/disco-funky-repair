import express from 'express';
import { LotteryController } from '../controllers/lotter.controller';
import { AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';

const router = express.Router();

// Admin Lottery Routes
router.post('/admin/user/lottery/ticket', AuthAdmin, asyncHandler(LotteryController.addLotteryTicket.bind(LotteryController)));

// User Lottery Routes
router.get('/lottery/disco/balance/:user_id', asyncHandler(LotteryController.checkDiscoBalance.bind(LotteryController)));
router.get('/lottery/ticket/:user_id', asyncHandler(LotteryController.checkLotteryTicket.bind(LotteryController)));
router.get('/lottery/ticket/date/:user_id', asyncHandler(LotteryController.getLotteryTicketDate.bind(LotteryController)));
router.get('/lottery/ticket/count/:user_id', asyncHandler(LotteryController.checkAndUpdateLotteryTicket.bind(LotteryController)));
router.get('/lottery/update-status', asyncHandler(LotteryController.checkUpdateStatus.bind(LotteryController)));

// Lottery Ticket Distribution Routes
router.post('/alluser/distribute/ticket', asyncHandler(LotteryController.distributeTicketToAllUser.bind(LotteryController)));
router.post('/lottery/claim/ticket/to/user', asyncHandler(LotteryController.lotteryClaimTicketToUser.bind(LotteryController)));

export { router as lotteryRoutes }; 