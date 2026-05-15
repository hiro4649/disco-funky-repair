import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from './utils';

const router = express.Router();

// User Auth Routes
router.post('/user/auth/nonce', asyncHandler(AuthController.issueWalletNonce.bind(AuthController)));
router.post('/user/signup', asyncHandler(AuthController.signup.bind(AuthController)));
router.get('/user/logout', asyncHandler(AuthController.userLogout.bind(AuthController)));
router.get('/user/verify', asyncHandler(AuthController.verifyUser.bind(AuthController)));
router.post('/user/refresh-token', asyncHandler(AuthController.refreshToken.bind(AuthController)));

// Admin Auth Routes
router.post('/admin/signin', asyncHandler(AuthController.signin.bind(AuthController)));
router.get('/admin/logout', asyncHandler(AuthController.logout.bind(AuthController)));
router.get('/admin/verify', asyncHandler(AuthController.verifyAdmin.bind(AuthController)));

export { router as authRoutes };
