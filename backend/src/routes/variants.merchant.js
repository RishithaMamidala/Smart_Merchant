import { Router } from 'express';
import { body, param } from 'express-validator';
import { requireMerchant } from '../middleware/auth.js';
import { validate, isValidObjectId, isValidSku } from '../middleware/validate.js';
import {
  getProductVariants,
  updateVariant,
  adjustInventory,
  bulkUpdateVariants,
  addVariants,
} from '../controllers/merchantVariantController.js';

const router = Router();

// All routes require merchant authentication
router.use(requireMerchant);

/**
 * GET /api/merchant/products/:productId/variants
 * Get all variants for a product
 */
router.get(
  '/products/:productId/variants',
  [param('productId').custom(isValidObjectId).withMessage('Invalid product ID'), validate],
  getProductVariants
);

/**
 * POST /api/merchant/products/:productId/variants
 * Add new variants to an existing product
 */
router.post(
  '/products/:productId/variants',
  [
    param('productId').custom(isValidObjectId).withMessage('Invalid product ID'),
    body('variants').isArray({ min: 1 }).withMessage('Variants array is required'),
    body('variants.*.sku')
      .notEmpty()
      .withMessage('SKU is required')
      .custom(isValidSku)
      .withMessage('SKU can only contain uppercase letters, numbers, and hyphens'),
    body('variants.*.price')
      .optional({ nullable: true })
      .isInt({ min: 0 })
      .withMessage('Price must be a non-negative integer')
      .toInt(),
    body('variants.*.inventory')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Inventory must be a non-negative integer')
      .toInt(),
    body('variants.*.optionValues').optional().isArray(),
    body('variants.*.optionValues.*.name').optional().isString().trim(),
    body('variants.*.optionValues.*.value').optional().isString().trim(),
    validate,
  ],
  addVariants
);

/**
 * PUT /api/merchant/variants/:id
 * Update a single variant
 */
router.put(
  '/:id',
  [
    param('id').custom(isValidObjectId).withMessage('Invalid variant ID'),
    body('sku')
      .optional()
      .custom(isValidSku)
      .withMessage('SKU can only contain uppercase letters, numbers, and hyphens'),
    body('price')
      .optional({ nullable: true })
      .custom((val) => val === null || (Number.isInteger(val) && val >= 0))
      .withMessage('Price must be a non-negative integer or null'),
    body('inventory')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Inventory must be a non-negative integer')
      .toInt(),
    body('lowStockThreshold')
      .optional({ nullable: true })
      .custom((val) => val === null || (Number.isInteger(val) && val >= 0))
      .withMessage('Threshold must be a non-negative integer or null'),
    body('image').optional({ nullable: true }).isString(),
    body('weight')
      .optional({ nullable: true })
      .custom((val) => val === null || (typeof val === 'number' && val >= 0))
      .withMessage('Weight must be a non-negative number or null'),
    body('isActive').optional().isBoolean().toBoolean(),
    validate,
  ],
  updateVariant
);

/**
 * POST /api/merchant/variants/:id/inventory
 * Adjust variant inventory (add or subtract)
 */
router.post(
  '/:id/inventory',
  [
    param('id').custom(isValidObjectId).withMessage('Invalid variant ID'),
    body('adjustment')
      .notEmpty()
      .withMessage('Adjustment amount is required')
      .isInt()
      .withMessage('Adjustment must be an integer')
      .toInt(),
    body('reason').optional().isString().isLength({ max: 200 }).trim(),
    validate,
  ],
  adjustInventory
);

/**
 * PUT /api/merchant/products/:productId/variants/bulk
 * Bulk update variants for a product
 */
router.put(
  '/products/:productId/variants/bulk',
  [
    param('productId').custom(isValidObjectId).withMessage('Invalid product ID'),
    body('variants').isArray({ min: 1 }).withMessage('Variants array is required'),
    body('variants.*.id').custom(isValidObjectId).withMessage('Invalid variant ID'),
    body('variants.*.sku').optional().custom(isValidSku),
    body('variants.*.price').optional({ nullable: true }).custom((val) => val === null || (Number.isInteger(val) && val >= 0)),
    body('variants.*.inventory').optional().isInt({ min: 0 }).toInt(),
    body('variants.*.isActive').optional().isBoolean().toBoolean(),
    body('variants.*.optionValues').optional().isArray(),
    body('variants.*.optionValues.*.name').optional().isString().trim(),
    body('variants.*.optionValues.*.value').optional().isString().trim(),
    validate,
  ],
  bulkUpdateVariants
);

export default router;
