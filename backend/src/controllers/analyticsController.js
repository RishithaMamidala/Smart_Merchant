import {
  getDashboardMetrics,
  getSalesOverTime,
  getTopProducts,
  getCategoryBreakdown,
  getInventoryStatus,
  getOrderStatusBreakdown,
  getRevenueSummary,
} from '../services/analyticsService.js';
import { sendSuccess } from '../utils/response.js';

/**
 * GET /api/merchant/analytics/dashboard
 * Get dashboard overview metrics
 */
export async function getDashboard(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { period = 'month' } = req.query;

    const metrics = await getDashboardMetrics(merchantId, period);

    sendSuccess(res, metrics);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/merchant/analytics/sales
 * Get sales data over time
 */
export async function getSales(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { period = 'month', granularity } = req.query;

    const salesData = await getSalesOverTime(merchantId, period, granularity);

    sendSuccess(res, salesData);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/merchant/analytics/top-products
 * Get top selling products
 */
export async function getTopProductsHandler(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { period = 'month', limit = 10 } = req.query;

    const topProducts = await getTopProducts(merchantId, period, parseInt(limit, 10));

    sendSuccess(res, topProducts);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/merchant/analytics/categories
 * Get sales breakdown by category
 */
export async function getCategoryBreakdownHandler(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { period = 'month' } = req.query;

    const categoryData = await getCategoryBreakdown(merchantId, period);

    sendSuccess(res, categoryData);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/merchant/analytics/inventory
 * Get inventory status overview
 */
export async function getInventory(req, res, next) {
  try {
    const merchantId = req.merchant._id;

    const inventoryStatus = await getInventoryStatus(merchantId);

    sendSuccess(res, inventoryStatus);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/merchant/analytics/orders
 * Get order status breakdown
 */
export async function getOrdersBreakdown(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { period = 'month' } = req.query;

    const orderData = await getOrderStatusBreakdown(merchantId, period);

    sendSuccess(res, orderData);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/merchant/analytics/revenue
 * Get revenue summary
 */
export async function getRevenue(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { period = 'month' } = req.query;

    const revenueData = await getRevenueSummary(merchantId, period);

    sendSuccess(res, revenueData);
  } catch (error) {
    next(error);
  }
}
