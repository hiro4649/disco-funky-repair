import express, { Request, Response } from 'express';

const router = express.Router();

// Crash game is outside FUNKY scope; keep a 410 for stale clients only.
const featureDisabled = (_req: Request, res: Response) =>
    res.status(410).json({
        success: false,
        code: 'FEATURE_DISABLED',
        message: 'Crash game is not installed for the BSC launch MVP.'
    });

router.get('/crash/games', featureDisabled);

export { router as crashGameRoutes };
