import express from 'express';
import { CrashGameController } from '../controllers/crashGame.controller';
import { asyncHandler } from './utils';

const router = express.Router();

// Crash Game Routes
router.get('/crash/games', asyncHandler(CrashGameController.getGames.bind(CrashGameController)));

export { router as crashGameRoutes };
