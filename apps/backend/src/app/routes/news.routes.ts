import express from 'express';
import { NewsController } from '../controllers/news.controller';
import { AuthAdmin } from '../config/passport';
import { asyncHandler } from './utils';

const router = express.Router();

// News Routes
router.post('/admin/news', AuthAdmin, asyncHandler(NewsController.create.bind(NewsController)));
router.get('/admin/news', asyncHandler(NewsController.getAll.bind(NewsController)));
router.get('/news/:id', asyncHandler(NewsController.getById.bind(NewsController)));
router.patch('/admin/news/:id', AuthAdmin, asyncHandler(NewsController.update.bind(NewsController)));
router.delete('/admin/news/:id', AuthAdmin, asyncHandler(NewsController.delete.bind(NewsController)));

export { router as newsRoutes }; 