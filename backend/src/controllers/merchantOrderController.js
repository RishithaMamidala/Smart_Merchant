import {
  getMerchantOrders,
  getMerchantOrderByNumber,
  updateOrderStatus,
  shipOrder,
  deliverOrder,
  cancelOrder,
  updateOrderNotes,
} from '../services/orderService.js';
import { sendSuccess, sendNotFound, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/merchant/orders
 * List merchant's orders with filters and pagination
 */
export async function getOrders(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { status, paymentStatus, search, startDate, endDate, sort, page, limit } = req.query;

    const result = await getMerchantOrders(merchantId, {
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      sort,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/merchant/orders/:orderNumber
 * Get single order details
 */
export async function getOrder(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { orderNumber } = req.params;

    const order = await getMerchantOrderByNumber(orderNumber, merchantId);

    if (!order) {
      return sendNotFound(res, 'Order');
    }

    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/merchant/orders/:orderNumber/status
 * Update order status
 */
export async function updateStatus(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { orderNumber } = req.params;
    const { status } = req.body;

    const order = await updateOrderStatus(orderNumber, merchantId, status);

    logger.info('Order status updated', { orderNumber, status, merchantId });

    sendSuccess(res, order);
  } catch (error) {
    if (error.code === 'ORDER_NOT_FOUND') {
      return sendNotFound(res, 'Order');
    }
    if (error.code === 'INVALID_TRANSITION') {
      return sendError(res, 'INVALID_OPERATION', error.message);
    }
    next(error);
  }
}

/**
 * POST /api/merchant/orders/:orderNumber/ship
 * Mark order as shipped with tracking info
 */
export async function ship(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { orderNumber } = req.params;
    const { trackingNumber, trackingCarrier } = req.body;

    const order = await shipOrder(orderNumber, merchantId, {
      trackingNumber,
      trackingCarrier,
    });

    logger.info('Order shipped', { orderNumber, trackingNumber, trackingCarrier, merchantId });

    sendSuccess(res, order);
  } catch (error) {
    if (error.code === 'ORDER_NOT_FOUND') {
      return sendNotFound(res, 'Order');
    }
    if (error.code === 'INVALID_TRANSITION') {
      return sendError(res, 'INVALID_OPERATION', error.message);
    }
    next(error);
  }
}

/**
 * POST /api/merchant/orders/:orderNumber/deliver
 * Mark order as delivered
 */
export async function deliver(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { orderNumber } = req.params;

    const order = await deliverOrder(orderNumber, merchantId);

    logger.info('Order delivered', { orderNumber, merchantId });

    sendSuccess(res, order);
  } catch (error) {
    if (error.code === 'ORDER_NOT_FOUND') {
      return sendNotFound(res, 'Order');
    }
    if (error.code === 'INVALID_TRANSITION') {
      return sendError(res, 'INVALID_OPERATION', error.message);
    }
    next(error);
  }
}

/**
 * POST /api/merchant/orders/:orderNumber/cancel
 * Cancel an order
 */
export async function cancel(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { orderNumber } = req.params;
    const { reason } = req.body;

    const order = await cancelOrder(orderNumber, merchantId, reason);

    logger.info('Order cancelled', { orderNumber, reason, merchantId });

    sendSuccess(res, order);
  } catch (error) {
    if (error.code === 'ORDER_NOT_FOUND') {
      return sendNotFound(res, 'Order');
    }
    if (error.code === 'CANNOT_CANCEL') {
      return sendError(res, 'INVALID_OPERATION', error.message);
    }
    next(error);
  }
}

/**
 * PUT /api/merchant/orders/:orderNumber/notes
 * Update order notes
 */
export async function updateNotes(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { orderNumber } = req.params;
    const { notes } = req.body;

    const order = await updateOrderNotes(orderNumber, merchantId, notes);

    logger.info('Order notes updated', { orderNumber, merchantId });

    sendSuccess(res, order);
  } catch (error) {
    if (error.code === 'ORDER_NOT_FOUND') {
      return sendNotFound(res, 'Order');
    }
    next(error);
  }
}
