import { Order, Product, Variant } from '../models/index.js';
import {
  getDateRange,
  getPreviousPeriod,
  getDateGroupExpression,
  getAutoGranularity,
  formatDateGroupLabel,
} from '../utils/dateRange.js';

/**
 * Get dashboard overview metrics
 * @param {string} merchantId
 * @param {string} period
 * @returns {Promise<Object>}
 */
export async function getDashboardMetrics(merchantId, period = 'month') {
  const { start, end } = getDateRange(period);
  const { start: prevStart, end: prevEnd } = getPreviousPeriod(start, end);

  // Get current period metrics
  const [currentMetrics, previousMetrics, lowStockCount, pendingOrdersCount] = await Promise.all([
    getMetricsForPeriod(merchantId, start, end),
    getMetricsForPeriod(merchantId, prevStart, prevEnd),
    getLowStockCount(merchantId),
    getPendingOrdersCount(merchantId),
  ]);

  // Calculate percentage changes
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    revenue: {
      current: currentMetrics.revenue,
      previous: previousMetrics.revenue,
      change: calculateChange(currentMetrics.revenue, previousMetrics.revenue),
    },
    orders: {
      current: currentMetrics.orderCount,
      previous: previousMetrics.orderCount,
      change: calculateChange(currentMetrics.orderCount, previousMetrics.orderCount),
    },
    averageOrderValue: {
      current: currentMetrics.averageOrderValue,
      previous: previousMetrics.averageOrderValue,
      change: calculateChange(currentMetrics.averageOrderValue, previousMetrics.averageOrderValue),
    },
    customers: {
      current: currentMetrics.customerCount,
      previous: previousMetrics.customerCount,
      change: calculateChange(currentMetrics.customerCount, previousMetrics.customerCount),
    },
    lowStockItems: lowStockCount,
    pendingOrders: pendingOrdersCount,
    period: { start, end },
  };
}

/**
 * Get metrics for a specific period
 * @param {string} merchantId
 * @param {Date} start
 * @param {Date} end
 * @returns {Promise<Object>}
 */
async function getMetricsForPeriod(merchantId, start, end) {
  const orderMetrics = await Order.aggregate([
    {
      $match: {
        merchantId: merchantId,
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'refunded'] },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$total' },
        orderCount: { $sum: 1 },
        customerIds: { $addToSet: '$customerId' },
      },
    },
  ]);

  const metrics = orderMetrics[0] || { revenue: 0, orderCount: 0, customerIds: [] };

  return {
    revenue: metrics.revenue,
    orderCount: metrics.orderCount,
    averageOrderValue: metrics.orderCount > 0 ? Math.round(metrics.revenue / metrics.orderCount) : 0,
    customerCount: metrics.customerIds?.length || 0,
  };
}

/**
 * Get sales data over time
 * @param {string} merchantId
 * @param {string} period
 * @param {string} [granularity]
 * @returns {Promise<Object>}
 */
export async function getSalesOverTime(merchantId, period = 'month', granularity) {
  const { start, end } = getDateRange(period);
  const actualGranularity = granularity || getAutoGranularity(start, end);
  const dateGroup = getDateGroupExpression(actualGranularity);

  const salesData = await Order.aggregate([
    {
      $match: {
        merchantId: merchantId,
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'refunded'] },
      },
    },
    {
      $group: {
        _id: dateGroup,
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1, '_id.week': 1 } },
  ]);

  return {
    data: salesData.map((item) => ({
      date: formatDateGroupLabel(item._id, actualGranularity),
      revenue: item.revenue,
      orders: item.orders,
    })),
    granularity: actualGranularity,
    period: { start, end },
  };
}

/**
 * Get top selling products
 * @param {string} merchantId
 * @param {string} period
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export async function getTopProducts(merchantId, period = 'month', limit = 10) {
  const { start, end } = getDateRange(period);

  const topProducts = await Order.aggregate([
    {
      $match: {
        merchantId: merchantId,
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'refunded'] },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        productName: { $first: '$items.productName' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
  ]);

  return {
    products: topProducts.map((p) => ({
      productId: p._id,
      name: p.productName,
      quantity: p.totalQuantity,
      revenue: p.totalRevenue,
      orders: p.orderCount,
    })),
    period: { start, end },
  };
}

/**
 * Get sales breakdown by category
 * @param {string} merchantId
 * @param {string} period
 * @returns {Promise<Object>}
 */
export async function getCategoryBreakdown(merchantId, period = 'month') {
  const { start, end } = getDateRange(period);

  const categoryData = await Order.aggregate([
    {
      $match: {
        merchantId: merchantId,
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'refunded'] },
      },
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$category._id',
        name: { $first: { $ifNull: ['$category.name', 'Uncategorized'] } },
        revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
        quantity: { $sum: '$items.quantity' },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.revenue, 0);

  return {
    categories: categoryData.map((c) => ({
      categoryId: c._id,
      name: c.name,
      revenue: c.revenue,
      quantity: c.quantity,
      percentage: totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0,
    })),
    totalRevenue,
    period: { start, end },
  };
}

/**
 * Get inventory status overview
 * @param {string} merchantId
 * @returns {Promise<Object>}
 */
export async function getInventoryStatus(merchantId) {
  const products = await Product.find({ merchantId, status: 'active' })
    .populate('categoryId', 'name slug')
    .lean();
  const productIds = products.map((p) => p._id);

  const variants = await Variant.find({
    productId: { $in: productIds },
    isActive: true,
  }).lean();

  let totalItems = 0;
  let lowStockItems = 0;
  let outOfStockItems = 0;

  const lowStockProducts = [];

  for (const variant of variants) {
    const product = products.find((p) => p._id.toString() === variant.productId.toString());
    const threshold = variant.lowStockThreshold ?? product?.lowStockThreshold ?? 5;
    const available = variant.inventory - variant.reservedInventory;

    totalItems++;

    if (available <= 0) {
      outOfStockItems++;
      lowStockProducts.push({
        productId: product?._id,
        productName: product?.name,
        variantId: variant._id,
        sku: variant.sku,
        optionValues: variant.optionValues,
        inventory: available,
        threshold,
        status: 'out_of_stock',
        urgency: -available + threshold,
        category: product?.categoryId
          ? { id: product.categoryId._id, name: product.categoryId.name, slug: product.categoryId.slug }
          : null,
      });
    } else if (available <= threshold) {
      lowStockItems++;
      lowStockProducts.push({
        productId: product?._id,
        productName: product?.name,
        variantId: variant._id,
        sku: variant.sku,
        optionValues: variant.optionValues,
        inventory: available,
        threshold,
        status: 'low_stock',
        urgency: threshold - available,
        category: product?.categoryId
          ? { id: product.categoryId._id, name: product.categoryId.name, slug: product.categoryId.slug }
          : null,
      });
    }
  }

  // Sort by urgency: out_of_stock first, then by urgency score descending
  lowStockProducts.sort((a, b) => {
    if (a.status === 'out_of_stock' && b.status !== 'out_of_stock') return -1;
    if (a.status !== 'out_of_stock' && b.status === 'out_of_stock') return 1;
    return b.urgency - a.urgency;
  });

  return {
    totalVariants: totalItems,
    lowStockCount: lowStockItems,
    outOfStockCount: outOfStockItems,
    healthyCount: totalItems - lowStockItems - outOfStockItems,
    alerts: lowStockProducts,
  };
}

/**
 * Get order status breakdown
 * @param {string} merchantId
 * @param {string} period
 * @returns {Promise<Object>}
 */
export async function getOrderStatusBreakdown(merchantId, period = 'month') {
  const { start, end } = getDateRange(period);

  const statusBreakdown = await Order.aggregate([
    {
      $match: {
        merchantId: merchantId,
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: '$total' },
      },
    },
  ]);

  const statusMap = {};
  statusBreakdown.forEach((s) => {
    statusMap[s._id] = { count: s.count, revenue: s.revenue };
  });

  return {
    pending: statusMap.pending || { count: 0, revenue: 0 },
    confirmed: statusMap.confirmed || { count: 0, revenue: 0 },
    processing: statusMap.processing || { count: 0, revenue: 0 },
    shipped: statusMap.shipped || { count: 0, revenue: 0 },
    delivered: statusMap.delivered || { count: 0, revenue: 0 },
    cancelled: statusMap.cancelled || { count: 0, revenue: 0 },
    refunded: statusMap.refunded || { count: 0, revenue: 0 },
    period: { start, end },
  };
}

/**
 * Get revenue summary with trends
 * @param {string} merchantId
 * @param {string} period
 * @returns {Promise<Object>}
 */
export async function getRevenueSummary(merchantId, period = 'month') {
  const { start, end } = getDateRange(period);

  const revenueData = await Order.aggregate([
    {
      $match: {
        merchantId: merchantId,
        createdAt: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'refunded'] },
      },
    },
    {
      $group: {
        _id: null,
        grossRevenue: { $sum: '$total' },
        netRevenue: { $sum: '$subtotal' },
        totalShipping: { $sum: '$shippingCost' },
        totalTax: { $sum: '$taxAmount' },
        orderCount: { $sum: 1 },
        itemCount: { $sum: { $size: '$items' } },
      },
    },
  ]);

  const data = revenueData[0] || {
    grossRevenue: 0,
    netRevenue: 0,
    totalShipping: 0,
    totalTax: 0,
    orderCount: 0,
    itemCount: 0,
  };

  return {
    grossRevenue: data.grossRevenue,
    netRevenue: data.netRevenue,
    shipping: data.totalShipping,
    tax: data.totalTax,
    orderCount: data.orderCount,
    itemCount: data.itemCount,
    averageOrderValue: data.orderCount > 0 ? Math.round(data.grossRevenue / data.orderCount) : 0,
    period: { start, end },
  };
}

/**
 * Helper: Get low stock count
 * @param {string} merchantId
 * @returns {Promise<number>}
 */
async function getLowStockCount(merchantId) {
  const products = await Product.find({ merchantId, status: 'active' }).lean();
  const productIds = products.map((p) => p._id);

  const variants = await Variant.find({
    productId: { $in: productIds },
    isActive: true,
  }).lean();

  let count = 0;
  for (const variant of variants) {
    const product = products.find((p) => p._id.toString() === variant.productId.toString());
    const threshold = variant.lowStockThreshold ?? product?.lowStockThreshold ?? 5;
    const available = variant.inventory - variant.reservedInventory;
    if (available <= threshold) {
      count++;
    }
  }

  return count;
}

/**
 * Helper: Get pending orders count
 * @param {string} merchantId
 * @returns {Promise<number>}
 */
async function getPendingOrdersCount(merchantId) {
  return Order.countDocuments({
    merchantId,
    status: { $in: ['pending', 'confirmed', 'processing'] },
  });
}
