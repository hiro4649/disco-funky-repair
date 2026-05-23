import express from 'express';
import { IllustrationController } from '../controllers/illustration.controller';
import { Authenticate, AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';

const router = express.Router();

// Admin Illustration Routes
router.post('/admin/illustration', AuthAdmin, asyncHandler(IllustrationController.create.bind(IllustrationController)));
router.get('/admin/illustration', asyncHandler(IllustrationController.getAll.bind(IllustrationController)));
router.patch('/admin/illustration/:id', AuthAdmin, asyncHandler(IllustrationController.update.bind(IllustrationController)));
router.delete('/admin/illustration/:id', AuthAdmin, asyncHandler(IllustrationController.delete.bind(IllustrationController)));

// User Illustration Routes
router.get('/illustration/:id', asyncHandler(IllustrationController.getById.bind(IllustrationController)));
router.get('/illustration/rarity/:rarity', asyncHandler(IllustrationController.getByRarity.bind(IllustrationController)));
router.get('/user/:userId/illustrations', asyncHandler(IllustrationController.getUserIllustrations.bind(IllustrationController)));
router.post('/user/illustration', Authenticate, asyncHandler(IllustrationController.addIllustrationToUser.bind(IllustrationController)));
router.post('/user/:userId/draw-illustration', Authenticate, asyncHandler(IllustrationController.drawIllustration.bind(IllustrationController)));

export { router as illustrationRoutes }; 