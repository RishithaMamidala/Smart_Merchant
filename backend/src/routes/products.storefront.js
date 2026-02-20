import { Router } from 'express';
import { query, param } from 'express-validator';
import { validate } from '../middleware/validate.js';
import {
  getProducts,
  getProductBySlug,
} from '../controllers/storefrontController.js';

const router = Router();

/**
 * @route GET /api/products
 * @desc List active products for storefront
 * @access Public
 */
router.get(
  '/',
  [
    query('category').optional().isString(),
    query('search').optional().isString().trim(),
    query('sort')
      .optional()
      .isIn(['price_asc', 'price_desc', 'newest', 'name'])
      .withMessage('Invalid sort option'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  getProducts
);

/**
 * @route GET /api/products/:slug
 * @desc Get single product with all variants
 * @access Public
 */
router.get(
  '/:slug',
  [
    param('slug')
      .isString()
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Invalid product slug'),
  ],
  validate,
  getProductBySlug
);

export default router;
