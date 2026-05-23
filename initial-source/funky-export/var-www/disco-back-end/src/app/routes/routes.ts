import express, { Request, Response, NextFunction } from 'express';
import { authRoutes } from './auth.routes';
import { prizeRoutes } from './prize.routes';
import { userRoutes } from './user.routes';
import { lotteryRoutes } from './lottery.routes';
import { nftRoutes } from './nft.routes';
import { ticketDistributionRoutes } from './ticket-distribution.routes';
import { newsRoutes } from './news.routes';
import { illustrationRoutes } from './illustration.routes';
import { referralRoutes } from './referral.routes';

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
Router.use('/', referralRoutes);

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