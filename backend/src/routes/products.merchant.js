import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireMerchant } from '../middleware/auth.js';
import { validate, isValidObjectId, isValidSlug } from '../middleware/validate.js';
import {
  getMerchantProducts,
  getMerchantProduct,
  createProduct,
  updateProduct,
  archiveProduct,
  restoreProduct,
} from '../controllers/merchantProductController.js';

const router = Router();

// All routes require merchant authentication
router.use(requireMerchant);

/**
 * GET /api/merchant/products
 * List merchant's products with pagination and filters
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['active', 'archived', 'all']),
    query('category').optional().custom(isValidObjectId).withMessage('Invalid category ID'),
    query('search').optional().isString().trim(),
    query('sort').optional().isIn(['newest', 'oldest', 'name', 'price_asc', 'price_desc']),
    validate,
  ],
  getMerchantProducts
);

/**
 * GET /api/merchant/products/:id
 * Get single product details
 */
router.get(
  '/:id',
  [param('id').custom(isValidObjectId).withMessage('Invalid product ID'), validate],
  getMerchantProduct
);

/**
 * POST /api/merchant/products
 * Create a new product
 */
router.post(
  '/',
  [
    body('name')
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ max: 200 })
      .withMessage('Product name cannot exceed 200 characters')
      .trim(),
    body('slug')
      .optional()
      .custom(isValidSlug)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ max: 5000 })
      .withMessage('Description cannot exceed 5000 characters')
      .trim(),
    body('basePrice')
      .notEmpty()
      .withMessage('Base price is required')
      .isInt({ min: 0 })
      .withMessage('Price must be a positive integer (in cents)')
      .toInt(),
    body('categoryId')
      .optional({ nullable: true })
      .custom((val) => val === null || isValidObjectId(val))
      .withMessage('Invalid category ID'),
    body('images').optional().isArray(),
    body('images.*.url').optional().isURL().withMessage('Invalid image URL'),
    body('images.*.publicId').optional().isString(),
    body('images.*.altText').optional().isString().isLength({ max: 200 }),
    body('optionTypes').optional().isArray(),
    body('optionTypes.*.name')
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage('Option name cannot exceed 50 characters'),
    body('optionTypes.*.values')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one option value is required'),
    body('lowStockThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Threshold must be a non-negative integer')
      .toInt(),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString().trim(),
    body('seoTitle').optional().isString().isLength({ max: 70 }).trim(),
    body('seoDescription').optional().isString().isLength({ max: 160 }).trim(),
    body('variants').optional().isArray(),
    body('variants.*.sku').optional().isString().trim(),
    body('variants.*.optionValues').optional().isArray(),
    body('variants.*.price').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
    body('variants.*.inventory').optional().isInt({ min: 0 }).toInt(),
    validate,
  ],
  createProduct
);

/**
 * PUT /api/merchant/products/:id
 * Update an existing product
 */
router.put(
  '/:id',
  [
    param('id').custom(isValidObjectId).withMessage('Invalid product ID'),
    body('name')
      .optional()
      .isLength({ min: 1, max: 200 })
      .withMessage('Product name must be 1-200 characters')
      .trim(),
    body('slug')
      .optional()
      .custom(isValidSlug)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
    body('description')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Description cannot exceed 5000 characters')
      .trim(),
    body('basePrice')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Price must be a positive integer (in cents)')
      .toInt(),
    body('categoryId')
      .optional({ nullable: true })
      .custom((val) => val === null || isValidObjectId(val))
      .withMessage('Invalid category ID'),
    body('images').optional().isArray(),
    body('optionTypes').optional().isArray(),
    body('lowStockThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Threshold must be a non-negative integer')
      .toInt(),
    body('tags').optional().isArray(),
    body('seoTitle').optional().isString().isLength({ max: 70 }).trim(),
    body('seoDescription').optional().isString().isLength({ max: 160 }).trim(),
    validate,
  ],
  updateProduct
);

/**
 * POST /api/merchant/products/:id/archive
 * Archive a product (soft delete)
 */
router.post(
  '/:id/archive',
  [param('id').custom(isValidObjectId).withMessage('Invalid product ID'), validate],
  archiveProduct
);

/**
 * POST /api/merchant/products/:id/restore
 * Restore an archived product
 */
router.post(
  '/:id/restore',
  [param('id').custom(isValidObjectId).withMessage('Invalid product ID'), validate],
  restoreProduct
);

export default router;
