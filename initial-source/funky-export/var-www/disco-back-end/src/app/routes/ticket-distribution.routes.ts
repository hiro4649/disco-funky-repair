import express from 'express';
import { SetTicketDistributeController } from '../controllers/setTicketDistribute.controller';
import { AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';

const router = express.Router();

// SetTicketDistribute Routes
router.post('/admin/ticket-distribution', AuthAdmin, asyncHandler(SetTicketDistributeController.create.bind(SetTicketDistributeController)));
router.get('/admin/ticket-distribution', asyncHandler(SetTicketDistributeController.getAll.bind(SetTicketDistributeController)));
router.get('/admin/ticket-distribution/:id', asyncHandler(SetTicketDistributeController.getById.bind(SetTicketDistributeController)));
router.patch('/admin/ticket-distribution/:id', AuthAdmin, asyncHandler(SetTicketDistributeController.update.bind(SetTicketDistributeController)));
router.delete('/admin/ticket-distribution/:id', AuthAdmin, asyncHandler(SetTicketDistributeController.delete.bind(SetTicketDistributeController)));

// Manual trigger for weekly bonus distribution
router.post('/admin/trigger-weekly-bonus', AuthAdmin, asyncHandler(SetTicketDistributeController.triggerWeeklyBonus.bind(SetTicketDistributeController)));

export { router as ticketDistributionRoutes }; 