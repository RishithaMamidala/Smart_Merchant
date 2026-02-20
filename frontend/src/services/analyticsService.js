import api from './api.js';

/**
 * Get dashboard overview metrics
 * @param {string} [period]
 * @returns {Promise<Object>}
 */
export async function getDashboardMetrics(period = 'month') {
  const response = await api.get('/merchant/analytics/dashboard', { params: { period } });
  return response.data;
}

/**
 * Get sales data over time
 * @param {Object} params
 * @param {string} [params.period]
 * @param {string} [params.granularity]
 * @returns {Promise<Object>}
 */
export async function getSalesData(params = {}) {
  const response = await api.get('/merchant/analytics/sales', { params });
  return response.data;
}

/**
 * Get top selling products
 * @param {Object} params
 * @param {string} [params.period]
 * @param {number} [params.limit]
 * @returns {Promise<Object>}
 */
export async function getTopProducts(params = {}) {
  const response = await api.get('/merchant/analytics/top-products', { params });
  return response.data;
}

/**
 * Get sales breakdown by category
 * @param {string} [period]
 * @returns {Promise<Object>}
 */
export async function getCategoryBreakdown(period = 'month') {
  const response = await api.get('/merchant/analytics/categories', { params: { period } });
  return response.data;
}

/**
 * Get inventory status overview
 * @returns {Promise<Object>}
 */
export async function getInventoryStatus() {
  const response = await api.get('/merchant/analytics/inventory');
  return response.data;
}

/**
 * Get order status breakdown
 * @param {string} [period]
 * @returns {Promise<Object>}
 */
export async function getOrdersBreakdown(period = 'month') {
  const response = await api.get('/merchant/analytics/orders', { params: { period } });
  return response.data;
}

/**
 * Get revenue summary
 * @param {string} [period]
 * @returns {Promise<Object>}
 */
export async function getRevenueSummary(period = 'month') {
  const response = await api.get('/merchant/analytics/revenue', { params: { period } });
  return response.data;
}
