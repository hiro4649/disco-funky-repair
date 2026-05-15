import express, { Request, Response } from 'express';

const router = express.Router();

const featureDisabled = (_req: Request, res: Response) =>
    res.status(410).json({
        success: false,
        code: 'FEATURE_DISABLED',
        message: 'Virtual balance user-manage APIs are disabled for the BSC launch MVP.'
    });

router.get('/user-manage/balance/:wallet_address', featureDisabled);
router.post('/user-manage/deposit', featureDisabled);
router.post('/user-manage/withdraw', featureDisabled);
router.post('/user-manage/bet', featureDisabled);
router.post('/user-manage/cashout', featureDisabled);
router.get('/user-manage/transactions/:wallet_address', featureDisabled);

export { router as userManageRoutes };
