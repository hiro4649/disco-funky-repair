import express from 'express';
import { UserManageController } from '../controllers/userManage.controller';
import { asyncHandler } from './utils';

const router = express.Router();

// User Management Routes
router.get('/user-manage/balance/:wallet_address', asyncHandler(UserManageController.getBalance.bind(UserManageController)));
router.post('/user-manage/deposit', asyncHandler(UserManageController.deposit.bind(UserManageController)));
router.post('/user-manage/withdraw', asyncHandler(UserManageController.withdraw.bind(UserManageController)));
router.post('/user-manage/bet', asyncHandler(UserManageController.bet.bind(UserManageController)));
router.post('/user-manage/cashout', asyncHandler(UserManageController.cashout.bind(UserManageController)));
router.get('/user-manage/transactions/:wallet_address', asyncHandler(UserManageController.getTransactionHistory.bind(UserManageController)));

export { router as userManageRoutes };
