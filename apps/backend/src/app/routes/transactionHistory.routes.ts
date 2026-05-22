/**
 * Transaction History Routes
 *
 * Provides endpoints for users to view their transaction classifications
 * and understand their holding date calculations.
 */

import { Router } from 'express';
import { TransactionHistoryController } from '../controllers/transactionHistoryController';
import { Authenticate } from '../config/passport';

const router = Router();

// Get transaction history for a wallet
router.get(
    '/transaction-history/:walletAddress',
    Authenticate,
    TransactionHistoryController.getTransactionHistory
);

// Get holding date explanation
router.get(
    '/holding-date/explain/:walletAddress',
    Authenticate,
    TransactionHistoryController.explainHoldingDate
);

// Get FIFO snapshot
router.get(
    '/fifo-snapshot/:walletAddress',
    Authenticate,
    TransactionHistoryController.getFIFOSnapshot
);

// Get transaction types reference
router.get(
    '/transaction-types',
    TransactionHistoryController.getTransactionTypes
);

// Get specific transaction details
router.get(
    '/transaction/:txHash',
    Authenticate,
    TransactionHistoryController.getTransactionDetail
);

export { router as transactionHistoryRoutes };
