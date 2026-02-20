import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { requireCustomer } from '../middleware/auth.js';
import { checkoutLimiter } from '../middleware/rateLimit.js';
import { startCheckout, cancelCheckout } from '../controllers/checkoutController.js';

const router = Router();

// Apply rate limiting
router.use(checkoutLimiter);

/**
 * @route POST /api/checkout/start
 * @desc Initialize checkout session
 * @access Customer only (requires login)
 */
router.post(
  '/start',
  requireCustomer,
  [
    body('shippingAddress.addressLine1').notEmpty().withMessage('Address line 1 is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    body('shippingAddress.country')
      .notEmpty()
      .isLength({ min: 2, max: 2 })
      .withMessage('Valid country code is required'),
    body('customerEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('customerName').notEmpty().trim().withMessage('Customer name is required'),
  ],
  validate,
  startCheckout
);

/**
 * @route POST /api/checkout/cancel
 * @desc Cancel checkout and release reserved inventory
 * @access Public
 */
router.post(
  '/cancel',
  [
    body('checkoutSessionId').notEmpty().withMessage('Checkout session ID is required'),
  ],
  validate,
  cancelCheckout
);

export default router;
