import { Router } from 'express';
import {
    generateGlobalTicketCode,
    getAllTicketCodes,
    claimTicketCode,
    getCurrentGlobalTicketCode,
    getUserLatestTicketCode,
    getUserTicketBalance
} from '../controllers/ticketCodeController';
import { AuthAdmin } from '../config/passport';

const router = Router();

// Admin routes
router.post('/admin/generate', AuthAdmin, generateGlobalTicketCode);
router.get('/admin/all', AuthAdmin, getAllTicketCodes);

// User routes
router.post('/claim', claimTicketCode);
// router.get('/current', getCurrentGlobalTicketCode); // Get current global ticket code
// router.get('/user/:wallet_address/latest', getUserLatestTicketCode);
// router.get('/user/:wallet_address/balance', getUserTicketBalance);

export default router;
