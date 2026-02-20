import { Router } from 'express';
import { query } from 'express-validator';
import { requireMerchant } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getDashboard,
  getSales,
  getTopProductsHandler,
  getCategoryBreakdownHandler,
  getInventory,
  getOrdersBreakdown,
  getRevenue,
} from '../controllers/analyticsController.js';

const router = Router();

// All routes require merchant authentication
router.use(requireMerchant);

const periodValidator = query('period')
  .optional()
  .isIn(['today', 'yesterday', 'week', 'month', 'quarter', 'year'])
  .withMessage('Invalid period');

const granularityValidator = query('granularity')
  .optional()
  .isIn(['hour', 'day', 'week', 'month'])
  .withMessage('Invalid granularity');

/**
 * GET /api/merchant/analytics/dashboard
 * Get dashboard overview metrics
 */
router.get('/dashboard', [periodValidator, validate], getDashboard);

/**
 * GET /api/merchant/analytics/sales
 * Get sales data over time
 */
router.get('/sales', [periodValidator, granularityValidator, validate], getSales);

/**
 * GET /api/merchant/analytics/top-products
 * Get top selling products
 */
router.get(
  '/top-products',
  [
    periodValidator,
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    validate,
  ],
  getTopProductsHandler
);

/**
 * GET /api/merchant/analytics/categories
 * Get sales breakdown by category
 */
router.get('/categories', [periodValidator, validate], getCategoryBreakdownHandler);

/**
 * GET /api/merchant/analytics/inventory
 * Get inventory status overview
 */
router.get('/inventory', getInventory);

/**
 * GET /api/merchant/analytics/orders
 * Get order status breakdown
 */
router.get('/orders', [periodValidator, validate], getOrdersBreakdown);

/**
 * GET /api/merchant/analytics/revenue
 * Get revenue summary
 */
router.get('/revenue', [periodValidator, validate], getRevenue);

export default router;
