import api from './api.js';

/**
 * @typedef {Object} OrderListParams
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [status]
 * @property {string} [paymentStatus]
 * @property {string} [search]
 * @property {string} [startDate]
 * @property {string} [endDate]
 * @property {string} [sort]
 */

/**
 * Get merchant's orders with pagination
 * @param {OrderListParams} params
 * @returns {Promise<{orders: any[], pagination: any, summary: any}>}
 */
export async function getMerchantOrders(params = {}) {
  // Filter out empty string values to avoid backend validation errors
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const response = await api.get('/merchant/orders', { params: cleanParams });
  return response.data;
}

/**
 * Get a single order by order number
 * @param {string} orderNumber
 * @returns {Promise<any>}
 */
export async function getMerchantOrder(orderNumber) {
  const response = await api.get(`/merchant/orders/${orderNumber}`);
  return response.data;
}

/**
 * Update order status
 * @param {string} orderNumber
 * @param {string} status
 * @returns {Promise<any>}
 */
export async function updateOrderStatus(orderNumber, status) {
  const response = await api.put(`/merchant/orders/${orderNumber}/status`, { status });
  return response.data;
}

/**
 * Mark order as shipped
 * @param {string} orderNumber
 * @param {Object} trackingInfo
 * @param {string} [trackingInfo.trackingNumber]
 * @param {string} [trackingInfo.trackingCarrier]
 * @returns {Promise<any>}
 */
export async function shipOrder(orderNumber, trackingInfo = {}) {
  const response = await api.post(`/merchant/orders/${orderNumber}/ship`, trackingInfo);
  return response.data;
}

/**
 * Mark order as delivered
 * @param {string} orderNumber
 * @returns {Promise<any>}
 */
export async function deliverOrder(orderNumber) {
  const response = await api.post(`/merchant/orders/${orderNumber}/deliver`);
  return response.data;
}

/**
 * Cancel an order
 * @param {string} orderNumber
 * @param {string} [reason]
 * @returns {Promise<any>}
 */
export async function cancelOrder(orderNumber, reason) {
  const response = await api.post(`/merchant/orders/${orderNumber}/cancel`, { reason });
  return response.data;
}

/**
 * Update order notes
 * @param {string} orderNumber
 * @param {string} notes
 * @returns {Promise<any>}
 */
export async function updateOrderNotes(orderNumber, notes) {
  const response = await api.put(`/merchant/orders/${orderNumber}/notes`, { notes });
  return response.data;
}
