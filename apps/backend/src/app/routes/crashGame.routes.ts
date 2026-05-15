import express, { Request, Response } from 'express';

const router = express.Router();

const featureDisabled = (_req: Request, res: Response) =>
    res.status(410).json({
        success: false,
        code: 'FEATURE_DISABLED',
        message: 'Crash game is disabled for the BSC launch MVP.'
    });

router.get('/crash/games', featureDisabled);

export { router as crashGameRoutes };
