import { Order, Merchant } from '../models/index.js';
import { sendDailySummaryNotification } from './notificationService.js';
import { getLowStockItems } from './inventoryAlertService.js';
import logger from '../utils/logger.js';

/**
 * Generate and send daily summaries to all merchants
 * @returns {Promise<{merchantsProcessed: number, summariesSent: number}>}
 */
export async function sendAllDailySummaries() {
  const merchants = await Merchant.find({
    isActive: true,
    'notificationPreferences.dailySummary': { $ne: false },
  }).lean();

  let merchantsProcessed = 0;
  let summariesSent = 0;

  for (const merchant of merchants) {
    try {
      await generateAndSendSummary(merchant);
      merchantsProcessed++;
      summariesSent++;
    } catch (error) {
      logger.error(`Failed to send daily summary to merchant ${merchant._id}`, {
        error: error.message,
      });
      merchantsProcessed++;
    }
  }

  return { merchantsProcessed, summariesSent };
}

/**
 * Generate and send daily summary for a single merchant
 * @param {Object} merchant - Merchant document
 */
export async function generateAndSendSummary(merchant) {
  const summary = await generateDailySummary(merchant._id);
  await sendDailySummaryNotification(merchant, summary);

  logger.info(`Daily summary sent to merchant ${merchant._id}`, {
    orderCount: summary.orderCount,
    revenue: summary.revenue,
  });
}

/**
 * Generate daily summary data for a merchant
 * @param {string} merchantId
 * @param {Date} [date] - Date to generate summary for (defaults to yesterday)
 * @returns {Promise<Object>} Summary data
 */
export async function generateDailySummary(merchantId, date = null) {
  // Default to yesterday
  const summaryDate = date || new Date();
  if (!date) {
    summaryDate.setDate(summaryDate.getDate() - 1);
  }

  const startOfDay = new Date(summaryDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(summaryDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Get orders for the day
  const orders = await Order.find({
    merchant: merchantId,
    createdAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'cancelled' },
  }).lean();

  // Calculate metrics
  const orderCount = orders.length;
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const itemsSold = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  // Get top products
  const topProducts = await getTopProductsForDay(merchantId, startOfDay, endOfDay);

  // Get low stock count
  const threshold = 5; // Default threshold for summary
  const lowStockItems = await getLowStockItems(merchantId, threshold);

  // Order status breakdown
  const statusBreakdown = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  };

  for (const order of orders) {
    if (statusBreakdown[order.status] !== undefined) {
      statusBreakdown[order.status]++;
    }
  }

  // Comparison with previous day
  const prevDayStart = new Date(startOfDay);
  prevDayStart.setDate(prevDayStart.getDate() - 1);
  const prevDayEnd = new Date(startOfDay);
  prevDayEnd.setMilliseconds(-1);

  const previousOrders = await Order.find({
    merchant: merchantId,
    createdAt: { $gte: prevDayStart, $lte: prevDayEnd },
    status: { $ne: 'cancelled' },
  }).lean();

  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
  const previousOrderCount = previousOrders.length;

  const revenueChange = previousRevenue > 0
    ? ((revenue - previousRevenue) / previousRevenue) * 100
    : revenue > 0 ? 100 : 0;

  const orderCountChange = previousOrderCount > 0
    ? ((orderCount - previousOrderCount) / previousOrderCount) * 100
    : orderCount > 0 ? 100 : 0;

  return {
    date: summaryDate,
    orderCount,
    revenue,
    itemsSold,
    topProducts,
    lowStockCount: lowStockItems.length,
    statusBreakdown,
    comparison: {
      previousRevenue,
      previousOrderCount,
      revenueChange: Math.round(revenueChange * 10) / 10,
      orderCountChange: Math.round(orderCountChange * 10) / 10,
    },
  };
}

/**
 * Get top selling products for a specific day
 * @param {string} merchantId
 * @param {Date} startOfDay
 * @param {Date} endOfDay
 * @returns {Promise<Array>}
 */
async function getTopProductsForDay(merchantId, startOfDay, endOfDay) {
  const result = await Order.aggregate([
    {
      $match: {
        merchant: merchantId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        quantitySold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  return result.map((item) => ({
    productId: item._id,
    name: item.name,
    quantitySold: item.quantitySold,
    revenue: item.revenue,
  }));
}

/**
 * Get summary for the current period (for dashboard display)
 * @param {string} merchantId
 * @param {string} period - 'today', 'yesterday', 'week', 'month'
 * @returns {Promise<Object>}
 */
export async function getSummaryForPeriod(merchantId, period = 'today') {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = now;
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate.setMilliseconds(-1);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      endDate = now;
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      endDate = now;
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = now;
  }

  const orders = await Order.find({
    merchant: merchantId,
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' },
  }).lean();

  const orderCount = orders.length;
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const itemsSold = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  return {
    period,
    startDate,
    endDate,
    orderCount,
    revenue,
    itemsSold,
    averageOrderValue: orderCount > 0 ? Math.round(revenue / orderCount) : 0,
  };
}
