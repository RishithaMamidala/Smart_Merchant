import { Router } from 'express';
import { getOrderByNumber } from '../services/orderService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { orderLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Apply rate limiting to order lookups
router.use(orderLimiter);

/**
 * @route GET /api/orders/:orderNumber
 * @desc Get order by order number (for order confirmation page)
 * @access Public (requires email verification for guest orders)
 */
router.get('/:orderNumber', async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query;

    // Determine customer identification
    const customerId = req.userType === 'customer' ? req.user?._id?.toString() : null;

    // Require email for unauthenticated order lookups to prevent enumeration
    if (!customerId && !email) {
      return sendError(res, 'EMAIL_REQUIRED', 'Email is required to look up guest orders', 400);
    }

    const order = await getOrderByNumber(orderNumber, {
      customerEmail: email,
      customerId,
    });

    if (!order) {
      return sendError(res, 'ORDER_NOT_FOUND', 'Order not found', 404);
    }

    sendSuccess(res, { order });
  } catch (error) {
    next(error);
  }
});

export default router;
