import express, { Request, Response, NextFunction } from 'express';
import { authRoutes } from './auth.routes';
import { prizeRoutes } from './prize.routes';
import { userRoutes } from './user.routes';
import { lotteryRoutes } from './lottery.routes';
import { nftRoutes } from './nft.routes';
import { ticketDistributionRoutes } from './ticket-distribution.routes';
import { newsRoutes } from './news.routes';
import { illustrationRoutes } from './illustration.routes';
import { dexFeeRoutes } from './dexFee.routes';
import { crashGameRoutes } from './crashGame.routes';
import { userManageRoutes } from './userManage.routes';
import ticketCodeRoutes from './ticketCodeRoutes';
import referralRoutes from './referral.routes';
import { transactionHistoryRoutes } from './transactionHistory.routes';
import monitoringRoutes from './monitoring.routes';
import trialNftRoutes from './trialNft.routes';
import trialNftTemplateRoutes from './trialNftTemplate.routes';

const Router = express.Router();

// Welcome route
Router.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the DISCO API');
});

// Mount all route modules
Router.use('/', authRoutes);
Router.use('/', prizeRoutes);
Router.use('/', userRoutes);
Router.use('/', lotteryRoutes);
Router.use('/', nftRoutes);
Router.use('/', ticketDistributionRoutes);
Router.use('/', newsRoutes);
Router.use('/', illustrationRoutes);
Router.use('/', dexFeeRoutes);
Router.use('/', crashGameRoutes);
Router.use('/', userManageRoutes);
Router.use('/ticket-code', ticketCodeRoutes);
Router.use('/referral', referralRoutes);
Router.use('/', transactionHistoryRoutes);
Router.use('/monitoring', monitoringRoutes);
Router.use('/trial-nfts', trialNftRoutes);
Router.use('/trial-nft-templates', trialNftTemplateRoutes);
Router.use('/admin/trial-nft-templates', trialNftTemplateRoutes);

// Error handling middleware
Router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

export { Router };
