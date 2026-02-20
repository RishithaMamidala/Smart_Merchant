import api from './api';
import { getSessionId } from '../utils/sessionId';

/**
 * @typedef {Object} ShippingAddress
 * @property {string} fullName
 * @property {string} addressLine1
 * @property {string} [addressLine2]
 * @property {string} city
 * @property {string} state
 * @property {string} postalCode
 * @property {string} country
 * @property {string} [phone]
 */

/**
 * @typedef {Object} CheckoutSession
 * @property {string} id
 * @property {string} clientSecret
 * @property {number} amount
 * @property {string} currency
 * @property {Object[]} items
 * @property {number} subtotal
 * @property {number} shippingCost
 * @property {number} taxAmount
 * @property {number} total
 */

/**
 * Get headers with session ID for guest checkout support
 * @returns {Object}
 */
function getCheckoutHeaders() {
  const sessionId = getSessionId();
  return sessionId ? { 'X-Session-Id': sessionId } : {};
}

/**
 * Start checkout process
 * @param {Object} params
 * @param {ShippingAddress} params.shippingAddress
 * @param {string} params.customerEmail
 * @param {string} params.customerName
 * @returns {Promise<{checkoutSession: CheckoutSession}>}
 */
export async function startCheckout({ shippingAddress, customerEmail, customerName }) {
  const response = await api.post(
    '/checkout/start',
    {
      shippingAddress,
      customerEmail,
      customerName,
    },
    { headers: getCheckoutHeaders() }
  );
  return response.data;
}

/**
 * Cancel checkout and release reserved inventory
 * @param {string} checkoutSessionId
 * @returns {Promise<void>}
 */
export async function cancelCheckout(checkoutSessionId) {
  await api.post('/checkout/cancel', { checkoutSessionId });
}

/**
 * Get order by order number (for confirmation page)
 * @param {string} orderNumber
 * @param {string} [email] - Required for guest orders
 * @returns {Promise<Object>}
 */
export async function getOrder(orderNumber, email) {
  const params = email ? `?email=${encodeURIComponent(email)}` : '';
  const response = await api.get(`/orders/${orderNumber}${params}`);
  return response.data.order;
}
