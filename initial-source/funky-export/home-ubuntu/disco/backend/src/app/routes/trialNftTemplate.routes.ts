import express from 'express';
import { TrialNftTemplateController } from '../controllers/trialNftTemplate.controller';
import uploadSingleImage from '../middlewares/singleImageMulter';

const router = express.Router();

// Helper for async error handling
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ==========================================
// Public routes (for users)
// ==========================================

// Get available Trial NFT templates for minting
router.get('/available', asyncHandler(TrialNftTemplateController.getAvailable));

// ==========================================
// Admin routes
// ==========================================

// Get all templates (with pagination)
router.get('/', asyncHandler(TrialNftTemplateController.getAll));

// Get statistics
router.get('/stats', asyncHandler(TrialNftTemplateController.getStats));

// Create a new template
router.post('/', uploadSingleImage, asyncHandler(TrialNftTemplateController.create));

// Update a template
router.patch('/:id', uploadSingleImage, asyncHandler(TrialNftTemplateController.update));

// Delete a template
router.delete('/:id', asyncHandler(TrialNftTemplateController.delete));

export default router;
