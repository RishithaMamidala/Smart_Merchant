import {
  getOrCreateCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem as removeCartItemService,
  clearCartItems,
  validateCartItems,
} from '../services/cartService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Get session ID from request
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function getSessionId(req) {
  return req.headers['x-session-id'] || null;
}

/**
 * Get cart identification from request
 * @param {import('express').Request} req
 * @returns {{customerId: string|null, sessionId: string|null}}
 */
function getCartIdentification(req) {
  const customerId = req.userType === 'customer' ? req.user?._id?.toString() : null;
  const sessionId = getSessionId(req);
  return { customerId, sessionId };
}

/**
 * Get current cart
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getCart(req, res, next) {
  try {
    const { customerId, sessionId } = getCartIdentification(req);
    const { cart, sessionId: newSessionId } = await getOrCreateCart({
      customerId,
      sessionId,
    });

    // Include session ID in response if this is a guest cart
    const response = { cart };
    if (newSessionId && !customerId) {
      res.setHeader('X-Session-ID', newSessionId);
    }

    sendSuccess(res, response);
  } catch (error) {
    next(error);
  }
}

/**
 * Add item to cart
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function addToCart(req, res, next) {
  try {
    const { customerId, sessionId } = getCartIdentification(req);
    const { variantId, quantity = 1 } = req.body;

    const result = await addItemToCart({
      customerId,
      sessionId,
      variantId,
      quantity,
    });

    // Include session ID in response header for guest carts
    if (result.sessionId && !customerId) {
      res.setHeader('X-Session-ID', result.sessionId);
    }

    sendSuccess(res, {
      cart: result.cart,
      addedItem: result.addedItem,
    });
  } catch (error) {
    if (error.code === 'INSUFFICIENT_INVENTORY') {
      return sendError(res, error.code, error.message, 400, {
        available: error.available,
      });
    }
    if (error.code === 'VARIANT_NOT_FOUND') {
      return sendError(res, error.code, error.message, 404);
    }
    next(error);
  }
}

/**
 * Update cart item quantity
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function updateCartItem(req, res, next) {
  try {
    const { customerId, sessionId } = getCartIdentification(req);
    const { variantId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return sendError(
        res,
        'INVALID_QUANTITY',
        'Use DELETE to remove items',
        400
      );
    }

    const result = await updateCartItemQuantity({
      customerId,
      sessionId,
      variantId,
      quantity,
    });

    sendSuccess(res, result);
  } catch (error) {
    if (error.code === 'INSUFFICIENT_INVENTORY') {
      return sendError(res, error.code, error.message, 400, {
        available: error.available,
      });
    }
    if (error.code === 'CART_NOT_FOUND' || error.code === 'ITEM_NOT_FOUND') {
      return sendError(res, error.code, error.message, 404);
    }
    next(error);
  }
}

/**
 * Remove item from cart
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function removeCartItem(req, res, next) {
  try {
    const { customerId, sessionId } = getCartIdentification(req);
    const { variantId } = req.params;

    const result = await removeCartItemService({
      customerId,
      sessionId,
      variantId,
    });

    sendSuccess(res, result);
  } catch (error) {
    if (error.code === 'CART_NOT_FOUND') {
      return sendError(res, error.code, error.message, 404);
    }
    next(error);
  }
}

/**
 * Clear entire cart
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function clearCart(req, res, next) {
  try {
    const { customerId, sessionId } = getCartIdentification(req);
    const result = await clearCartItems({ customerId, sessionId });

    sendSuccess(res, {
      message: 'Cart cleared',
      cart: result.cart,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Validate cart before checkout
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function validateCart(req, res, next) {
  try {
    const { customerId, sessionId } = getCartIdentification(req);
    const result = await validateCartItems({ customerId, sessionId });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
