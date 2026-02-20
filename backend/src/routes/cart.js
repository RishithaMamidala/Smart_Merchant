import { Router } from 'express';
import { body, param } from 'express-validator';
import { validate, isValidObjectId } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';
import { cartLimiter } from '../middleware/rateLimit.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  validateCart,
} from '../controllers/cartController.js';

const router = Router();

// Apply rate limiting and optional auth to all cart routes
router.use(cartLimiter);
router.use(optionalAuth);

/**
 * @route GET /api/cart
 * @desc Get current cart
 * @access Public (authenticated or guest with session ID)
 */
router.get('/', getCart);

/**
 * @route POST /api/cart/items
 * @desc Add item to cart
 * @access Public
 */
router.post(
  '/items',
  [
    body('variantId')
      .notEmpty()
      .custom(isValidObjectId)
      .withMessage('Valid variant ID is required'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 99 })
      .withMessage('Quantity must be between 1 and 99'),
  ],
  validate,
  addToCart
);

/**
 * @route PATCH /api/cart/items/:variantId
 * @desc Update item quantity
 * @access Public
 */
router.patch(
  '/items/:variantId',
  [
    param('variantId').custom(isValidObjectId).withMessage('Valid variant ID is required'),
    body('quantity')
      .isInt({ min: 1, max: 99 })
      .withMessage('Quantity must be between 1 and 99'),
  ],
  validate,
  updateCartItem
);

/**
 * @route DELETE /api/cart/items/:variantId
 * @desc Remove item from cart
 * @access Public
 */
router.delete(
  '/items/:variantId',
  [param('variantId').custom(isValidObjectId).withMessage('Valid variant ID is required')],
  validate,
  removeCartItem
);

/**
 * @route DELETE /api/cart
 * @desc Clear entire cart
 * @access Public
 */
router.delete('/', clearCart);

/**
 * @route POST /api/cart/validate
 * @desc Validate cart before checkout
 * @access Public
 */
router.post('/validate', validateCart);

export default router;
