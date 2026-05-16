import express from 'express';
import { IllustrationController } from '../controllers/illustration.controller';
import { Authenticate, AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';
import { illustrationDrawRateLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

const userIllustrationDisabledHandler = (_req: express.Request, res: express.Response) => {
    return res.status(410).json({
        success: false,
        code: 'FEATURE_DISABLED',
        message: 'Direct user illustration assignment is disabled for the BSC launch MVP.'
    });
};

// Admin Illustration Routes
router.post('/admin/illustration', AuthAdmin, asyncHandler(IllustrationController.create.bind(IllustrationController)));
router.get('/admin/illustration', AuthAdmin, asyncHandler(IllustrationController.getAll.bind(IllustrationController)));
router.patch('/admin/illustration/:id', AuthAdmin, asyncHandler(IllustrationController.update.bind(IllustrationController)));
router.delete('/admin/illustration/:id', AuthAdmin, asyncHandler(IllustrationController.delete.bind(IllustrationController)));

// User Illustration Routes
router.get('/illustration/:id', asyncHandler(IllustrationController.getById.bind(IllustrationController)));
router.get('/illustration/rarity/:rarity', asyncHandler(IllustrationController.getByRarity.bind(IllustrationController)));
router.get('/user/:userId/illustrations', Authenticate, asyncHandler(IllustrationController.getUserIllustrations.bind(IllustrationController)));
router.post('/user/illustration', userIllustrationDisabledHandler);
router.post('/user/:userId/draw-illustration', Authenticate, illustrationDrawRateLimiter, asyncHandler(IllustrationController.drawIllustration.bind(IllustrationController)));

export { router as illustrationRoutes };
