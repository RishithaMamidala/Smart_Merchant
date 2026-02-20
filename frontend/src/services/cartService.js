import api from './api';
import { getSessionId } from '../utils/sessionId';

/**
 * @typedef {Object} CartItem
 * @property {string} variantId
 * @property {string} productId
 * @property {number} quantity
 * @property {Object} variant
 * @property {Object} product
 */

/**
 * @typedef {Object} Cart
 * @property {CartItem[]} items
 * @property {number} itemCount
 * @property {number} subtotal
 */

/**
 * Get headers with session ID for guest cart support
 * @returns {Object}
 */
function getCartHeaders() {
  const sessionId = getSessionId();
  return sessionId ? { 'X-Session-Id': sessionId } : {};
}

/**
 * Get current cart
 * @returns {Promise<Cart>}
 */
export async function getCart() {
  const response = await api.get('/cart', {
    headers: getCartHeaders(),
  });
  return response.data.cart;
}

/**
 * Add item to cart
 * @param {string} variantId - Variant ID to add
 * @param {number} [quantity=1] - Quantity to add
 * @returns {Promise<Cart>}
 */
export async function addToCart(variantId, quantity = 1) {
  const response = await api.post(
    '/cart/items',
    { variantId, quantity },
    { headers: getCartHeaders() }
  );
  return response.data.cart;
}

/**
 * Update cart item quantity
 * @param {string} variantId - Variant ID to update
 * @param {number} quantity - New quantity
 * @returns {Promise<Cart>}
 */
export async function updateCartItem(variantId, quantity) {
  const response = await api.patch(
    `/cart/items/${variantId}`,
    { quantity },
    { headers: getCartHeaders() }
  );
  return response.data.cart;
}

/**
 * Remove item from cart
 * @param {string} variantId - Variant ID to remove
 * @returns {Promise<Cart>}
 */
export async function removeFromCart(variantId) {
  const response = await api.delete(`/cart/items/${variantId}`, {
    headers: getCartHeaders(),
  });
  return response.data.cart;
}

/**
 * Clear all items from cart
 * @returns {Promise<Cart>}
 */
export async function clearCart() {
  const response = await api.delete('/cart', {
    headers: getCartHeaders(),
  });
  return response.data.cart;
}

/**
 * Validate cart before checkout
 * @returns {Promise<{valid: boolean, issues: Object[], cart: Cart}>}
 */
export async function validateCart() {
  const response = await api.post('/cart/validate', {}, {
    headers: getCartHeaders(),
  });
  return response.data;
}
