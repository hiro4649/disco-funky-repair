import express from 'express';
import { UserController } from '../controllers/users.controller';
import { Authenticate, AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';

const router = express.Router();

// Admin User Management Routes
router.get('/admin/seting/tokenbalance', asyncHandler(UserController.getTokenBalance.bind(UserController)));
router.post('/admin/seting/tokenbalance', AuthAdmin, asyncHandler(UserController.setTokenBalance.bind(UserController)));
router.get('/admin/user/all', asyncHandler(UserController.getAllUserData.bind(UserController)));
router.get('/user/all', asyncHandler(UserController.getAllUsers.bind(UserController)));
router.get('/admin/user/transaction/:wallet_address', asyncHandler(UserController.getUserPrizeTransaction.bind(UserController)));
router.get('/user/holding/average/:user_id', Authenticate, asyncHandler(UserController.getAverageHoldingDate.bind(UserController)));
router.get('/user/holding/history/:user_id', Authenticate, asyncHandler(UserController.getHoldDateHistory.bind(UserController)));

// User Point Routes
router.get('/user/point/history/:user_id', Authenticate, asyncHandler(UserController.getUserPointHistory.bind(UserController)));
router.get('/user/daily/point/:user_id', Authenticate, asyncHandler(UserController.getUserDailyPointBonus.bind(UserController)));
router.post('/user/daily/point/:user_id', Authenticate, asyncHandler(UserController.setUserDailyPointBonus.bind(UserController)));

// User Info Route
router.post('/user/info', Authenticate, asyncHandler(UserController.getUserInfo.bind(UserController)));

export { router as userRoutes };
