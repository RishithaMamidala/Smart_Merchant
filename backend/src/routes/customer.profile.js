import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, requireCustomer } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as customerController from '../controllers/customerController.js';

const router = Router();

// All routes require customer authentication
router.use(authenticate, requireCustomer);

/**
 * GET /api/customer/profile
 * Get customer profile with stats
 */
router.get('/profile', customerController.getProfile);

/**
 * PUT /api/customer/profile
 * Update customer profile
 */
router.put(
  '/profile',
  [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be 1-100 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be 1-100 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[\d\s\-+()]+$/)
      .withMessage('Invalid phone number'),
    validate,
  ],
  customerController.updateProfile
);

/**
 * PUT /api/customer/password
 * Change password
 */
router.put(
  '/password',
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
    validate,
  ],
  customerController.changePassword
);

/**
 * GET /api/customer/orders
 * Get order history
 */
router.get(
  '/orders',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    validate,
  ],
  customerController.getOrderHistory
);

/**
 * GET /api/customer/orders/:orderNumber
 * Get single order
 */
router.get(
  '/orders/:orderNumber',
  [
    param('orderNumber').notEmpty().withMessage('Order number is required'),
    validate,
  ],
  customerController.getOrder
);

/**
 * POST /api/customer/addresses
 * Add new address
 */
router.post(
  '/addresses',
  [
    body('firstName')
      .notEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage('First name is required'),
    body('lastName')
      .notEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Last name is required'),
    body('address1')
      .notEmpty()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Address is required'),
    body('address2')
      .optional()
      .trim()
      .isLength({ max: 200 }),
    body('city')
      .notEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage('City is required'),
    body('state')
      .notEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage('State is required'),
    body('postalCode')
      .notEmpty()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Postal code is required'),
    body('country')
      .notEmpty()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Country is required'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[\d\s\-+()]+$/),
    body('isDefault').optional().isBoolean(),
    validate,
  ],
  customerController.addAddress
);

/**
 * PUT /api/customer/addresses/:addressId
 * Update address
 */
router.put(
  '/addresses/:addressId',
  [
    param('addressId').isMongoId().withMessage('Invalid address ID'),
    body('firstName').optional().trim().isLength({ max: 100 }),
    body('lastName').optional().trim().isLength({ max: 100 }),
    body('address1').optional().trim().isLength({ max: 200 }),
    body('address2').optional().trim().isLength({ max: 200 }),
    body('city').optional().trim().isLength({ max: 100 }),
    body('state').optional().trim().isLength({ max: 100 }),
    body('postalCode').optional().trim().isLength({ max: 20 }),
    body('country').optional().trim().isLength({ max: 100 }),
    body('phone').optional().trim().matches(/^[\d\s\-+()]*$/),
    body('isDefault').optional().isBoolean(),
    validate,
  ],
  customerController.updateAddress
);

/**
 * DELETE /api/customer/addresses/:addressId
 * Delete address
 */
router.delete(
  '/addresses/:addressId',
  [param('addressId').isMongoId().withMessage('Invalid address ID'), validate],
  customerController.deleteAddress
);

/**
 * PATCH /api/customer/addresses/:addressId/default
 * Set default address
 */
router.patch(
  '/addresses/:addressId/default',
  [param('addressId').isMongoId().withMessage('Invalid address ID'), validate],
  customerController.setDefaultAddress
);

export default router;
