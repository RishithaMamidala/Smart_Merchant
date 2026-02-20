import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireMerchant } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getOrders,
  getOrder,
  updateStatus,
  ship,
  deliver,
  cancel,
  updateNotes,
} from '../controllers/merchantOrderController.js';

const router = Router();

// All routes require merchant authentication
router.use(requireMerchant);

/**
 * GET /api/merchant/orders
 * List merchant's orders
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
    query('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']),
    query('search').optional().isString().trim(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('sort').optional().isIn(['newest', 'oldest', 'total_desc', 'total_asc']),
    validate,
  ],
  getOrders
);

/**
 * GET /api/merchant/orders/:orderNumber
 * Get single order details
 */
router.get(
  '/:orderNumber',
  [
    param('orderNumber').isString().trim().notEmpty().withMessage('Order number is required'),
    validate,
  ],
  getOrder
);

/**
 * PUT /api/merchant/orders/:orderNumber/status
 * Update order status
 */
router.put(
  '/:orderNumber/status',
  [
    param('orderNumber').isString().trim().notEmpty(),
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
    validate,
  ],
  updateStatus
);

/**
 * POST /api/merchant/orders/:orderNumber/ship
 * Mark order as shipped with tracking info
 */
router.post(
  '/:orderNumber/ship',
  [
    param('orderNumber').isString().trim().notEmpty(),
    body('trackingNumber').optional().isString().trim(),
    body('trackingCarrier').optional().isString().trim(),
    validate,
  ],
  ship
);

/**
 * POST /api/merchant/orders/:orderNumber/deliver
 * Mark order as delivered
 */
router.post(
  '/:orderNumber/deliver',
  [param('orderNumber').isString().trim().notEmpty(), validate],
  deliver
);

/**
 * POST /api/merchant/orders/:orderNumber/cancel
 * Cancel an order
 */
router.post(
  '/:orderNumber/cancel',
  [
    param('orderNumber').isString().trim().notEmpty(),
    body('reason').optional().isString().trim().isLength({ max: 500 }),
    validate,
  ],
  cancel
);

/**
 * PUT /api/merchant/orders/:orderNumber/notes
 * Update order notes
 */
router.put(
  '/:orderNumber/notes',
  [
    param('orderNumber').isString().trim().notEmpty(),
    body('notes').isString().trim().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
    validate,
  ],
  updateNotes
);

export default router;
