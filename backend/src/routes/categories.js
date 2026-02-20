import { Router } from 'express';
import { getActiveCategories } from '../controllers/storefrontController.js';

const router = Router();

/**
 * @route GET /api/categories
 * @desc List all active categories
 * @access Public
 */
router.get('/', getActiveCategories);

export default router;
