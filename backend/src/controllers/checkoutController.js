import {
  startCheckout as startCheckoutService,
  cancelCheckout as cancelCheckoutService,
} from '../services/checkoutService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Get cart identification from request
 * @param {import('express').Request} req
 * @returns {{customerId: string|null, sessionId: string|null}}
 */
function getCartIdentification(req) {
  const customerId = req.userType === 'customer' ? req.user?._id?.toString() : null;
  const sessionId = req.headers['x-session-id'] || null;
  return { customerId, sessionId };
}

/**
 * Start checkout process
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function startCheckout(req, res, next) {
  try {
    const { customerId, sessionId } = getCartIdentification(req);
    const { shippingAddress, customerEmail, customerName } = req.body;

    const result = await startCheckoutService({
      customerId,
      sessionId,
      shippingAddress,
      customerEmail,
      customerName,
    });

    sendSuccess(res, result);
  } catch (error) {
    if (error.code === 'CART_EMPTY') {
      return sendError(res, error.code, error.message, 400);
    }
    if (error.code === 'CART_INVALID' || error.code === 'INVENTORY_CHANGED') {
      return sendError(res, error.code, error.message, 400, {
        issues: error.issues,
      });
    }
    if (error.code === 'INSUFFICIENT_INVENTORY') {
      return sendError(res, error.code, error.message, 400);
    }
    next(error);
  }
}

/**
 * Cancel checkout
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function cancelCheckout(req, res, next) {
  try {
    const { checkoutSessionId } = req.body;

    await cancelCheckoutService(checkoutSessionId);

    sendSuccess(res, { message: 'Checkout cancelled' });
  } catch (error) {
    next(error);
  }
}
