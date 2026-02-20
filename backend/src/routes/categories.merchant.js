import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireMerchant } from '../middleware/auth.js';
import { validate, isValidObjectId, isValidSlug } from '../middleware/validate.js';
import {
  getMerchantCategories,
  getMerchantCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/merchantCategoryController.js';

const router = Router();

// All routes require merchant authentication
router.use(requireMerchant);

/**
 * GET /api/merchant/categories
 * List merchant's categories
 */
router.get(
  '/',
  [
    query('includeInactive').optional().isBoolean().toBoolean(),
    query('parentId')
      .optional({ nullable: true })
      .custom((val) => val === 'null' || val === null || isValidObjectId(val))
      .withMessage('Invalid parent ID'),
    validate,
  ],
  getMerchantCategories
);

/**
 * GET /api/merchant/categories/:id
 * Get single category details
 */
router.get(
  '/:id',
  [param('id').custom(isValidObjectId).withMessage('Invalid category ID'), validate],
  getMerchantCategory
);

/**
 * POST /api/merchant/categories
 * Create a new category
 */
router.post(
  '/',
  [
    body('name')
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ max: 100 })
      .withMessage('Category name cannot exceed 100 characters')
      .trim(),
    body('slug')
      .optional()
      .custom(isValidSlug)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .trim(),
    body('image').optional().isString().trim(),
    body('parentId')
      .optional({ nullable: true })
      .custom((val) => val === null || isValidObjectId(val))
      .withMessage('Invalid parent ID'),
    body('sortOrder').optional().isInt({ min: 0 }).toInt(),
    body('isActive').optional().isBoolean().toBoolean(),
    validate,
  ],
  createCategory
);

/**
 * PUT /api/merchant/categories/:id
 * Update an existing category
 */
router.put(
  '/:id',
  [
    param('id').custom(isValidObjectId).withMessage('Invalid category ID'),
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category name must be 1-100 characters')
      .trim(),
    body('slug')
      .optional()
      .custom(isValidSlug)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .trim(),
    body('image').optional().isString().trim(),
    body('parentId')
      .optional({ nullable: true })
      .custom((val) => val === null || isValidObjectId(val))
      .withMessage('Invalid parent ID'),
    body('sortOrder').optional().isInt({ min: 0 }).toInt(),
    body('isActive').optional().isBoolean().toBoolean(),
    validate,
  ],
  updateCategory
);

/**
 * DELETE /api/merchant/categories/:id
 * Delete a category
 */
router.delete(
  '/:id',
  [param('id').custom(isValidObjectId).withMessage('Invalid category ID'), validate],
  deleteCategory
);

/**
 * POST /api/merchant/categories/reorder
 * Reorder categories
 */
router.post(
  '/reorder',
  [
    body('categories')
      .isArray({ min: 1 })
      .withMessage('Categories array is required'),
    body('categories.*.id').custom(isValidObjectId).withMessage('Invalid category ID'),
    body('categories.*.sortOrder').isInt({ min: 0 }).toInt(),
    validate,
  ],
  reorderCategories
);

export default router;
