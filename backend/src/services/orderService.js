import mongoose from 'mongoose';
import { Order, Variant } from '../models/index.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import {
  getCheckoutSessionByPaymentIntent,
  removeCheckoutSession,
  deductInventory,
  releaseReservedInventory,
} from './checkoutService.js';
import { clearCartItems } from './cartService.js';
import { logger } from '../utils/logger.js';
import * as notificationService from './notificationService.js';

/**
 * @typedef {Object} CreateOrderData
 * @property {string} paymentIntentId
 */

/**
 * Create order from successful payment
 * @param {string} paymentIntentId
 * @returns {Promise<any>}
 */
export async function createOrderFromPayment(paymentIntentId) {
  const checkoutSession = getCheckoutSessionByPaymentIntent(paymentIntentId);
  if (!checkoutSession) {
    logger.error(`Checkout session not found for payment: ${paymentIntentId}`);
    throw new Error('Checkout session not found');
  }

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Prepare order items
  const orderItems = checkoutSession.items.map((item) => {
    const hasVariantInfo = item.name.includes('(') && item.name.match(/\(([^)]+)\)/);
    const productName = hasVariantInfo ? item.name.split(' (')[0] : item.name;
    const variantName = hasVariantInfo
      ? item.name.match(/\(([^)]+)\)/)[1]
      : item.sku || 'Default';

    return {
      variantId: item.variantId,
      productId: item.productId,
      productName,
      variantName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    };
  });

  // Map frontend address fields to model fields
  const { addressLine1, addressLine2, ...restAddress } = checkoutSession.shippingAddress;
  const shippingAddress = {
    line1: addressLine1,
    line2: addressLine2,
    ...restAddress,
  };

  // Create order
  const order = await Order.create({
    orderNumber,
    merchantId: checkoutSession.merchantId,
    customerId: checkoutSession.customerId || null,
    customerEmail: checkoutSession.customerEmail,
    customerName: checkoutSession.customerName,
    items: orderItems,
    shippingAddress,
    subtotal: checkoutSession.subtotal,
    shippingCost: checkoutSession.shippingCost,
    taxAmount: checkoutSession.taxAmount,
    total: checkoutSession.total,
    status: 'pending',
    paymentStatus: 'paid',
    stripePaymentIntentId: paymentIntentId,
    paidAt: new Date(),
  });

  // Deduct inventory (convert reserved to actual deduction)
  await deductInventory(
    checkoutSession.reservedVariants.map((rv) => ({
      variantId: rv.variantId,
      quantity: rv.quantity,
    }))
  );

  // Clear the cart
  await clearCartItems({
    customerId: checkoutSession.customerId,
    sessionId: checkoutSession.sessionId,
  });

  // Remove checkout session
  removeCheckoutSession(paymentIntentId);

  logger.info(`Order created: ${orderNumber}`);

  // Send order confirmation notification (async, don't block)
  notificationService.sendOrderConfirmationNotification(order, checkoutSession.merchantId)
    .catch((err) => logger.error('Failed to send order confirmation', { orderNumber, error: err.message }));

  return order;
}

/**
 * Handle failed payment
 * @param {string} paymentIntentId
 */
export async function handleFailedPayment(paymentIntentId) {
  const checkoutSession = getCheckoutSessionByPaymentIntent(paymentIntentId);
  if (!checkoutSession) {
    logger.warn(`Checkout session not found for failed payment: ${paymentIntentId}`);
    return;
  }

  // Release reserved inventory
  await releaseReservedInventory(checkoutSession.reservedVariants);

  // Remove checkout session
  removeCheckoutSession(paymentIntentId);

  logger.info(`Released inventory for failed payment: ${paymentIntentId}`);
}

/**
 * Get order by order number
 * @param {string} orderNumber
 * @param {Object} [options]
 * @param {string} [options.customerEmail] - For guest order verification
 * @param {string} [options.customerId] - For authenticated customer verification
 * @returns {Promise<any|null>}
 */
export async function getOrderByNumber(orderNumber, options = {}) {
  const query = { orderNumber };

  // For guest orders, require email verification
  if (options.customerEmail && !options.customerId) {
    query.customerEmail = options.customerEmail.toLowerCase();
  }

  const order = await Order.findOne(query).lean();

  if (!order) {
    return null;
  }

  // If customerId is provided, verify ownership
  if (options.customerId && order.customerId) {
    if (order.customerId.toString() !== options.customerId) {
      return null;
    }
  }

  return formatOrderResponse(order);
}

/**
 * Get orders for a merchant
 * @param {string} merchantId
 * @param {Object} options
 * @returns {Promise<{orders: any[], pagination: any, summary: any}>}
 */
export async function getMerchantOrders(merchantId, options = {}) {
  const {
    status,
    paymentStatus,
    search,
    startDate,
    endDate,
    sort = 'newest',
    page = 1,
    limit = 20,
  } = options;

  const query = { merchantId };

  if (status) {
    query.status = status;
  }

  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  if (search) {
    const sanitized = search.substring(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { orderNumber: { $regex: sanitized, $options: 'i' } },
      { customerEmail: { $regex: sanitized, $options: 'i' } },
      { customerName: { $regex: sanitized, $options: 'i' } },
    ];
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // Sort options
  let sortOption = {};
  switch (sort) {
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'total_desc':
      sortOption = { total: -1 };
      break;
    case 'total_asc':
      sortOption = { total: 1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const [orders, total, summary] = await Promise.all([
    Order.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
    getOrdersSummary(merchantId),
  ]);

  return {
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      customerEmail: o.customerEmail,
      customerName: o.customerName,
      status: o.status,
      paymentStatus: o.paymentStatus,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      total: o.total,
      createdAt: o.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    summary,
  };
}

/**
 * Get orders summary for merchant
 * @param {string} merchantId
 * @returns {Promise<Object>}
 */
async function getOrdersSummary(merchantId) {
  const result = await Order.aggregate([
    { $match: { merchantId: new mongoose.Types.ObjectId(merchantId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  for (const item of result) {
    summary[item._id] = item.count;
  }

  return summary;
}

/**
 * Update order status
 * @param {string} orderNumber
 * @param {string} merchantId
 * @param {string} newStatus
 * @returns {Promise<any>}
 */
export async function updateOrderStatus(orderNumber, merchantId, newStatus) {
  const order = await Order.findOne({ orderNumber, merchantId });
  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  // Validate status transition
  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(newStatus)) {
    const error = new Error(
      `Cannot change status from '${order.status}' to '${newStatus}'`
    );
    error.code = 'INVALID_TRANSITION';
    error.statusCode = 400;
    throw error;
  }

  order.status = newStatus;

  // Set timestamp based on status
  switch (newStatus) {
    case 'processing':
      order.processedAt = new Date();
      break;
    case 'shipped':
      order.shippedAt = new Date();
      break;
    case 'delivered':
      order.deliveredAt = new Date();
      break;
    case 'cancelled':
      order.cancelledAt = new Date();
      // Restore inventory
      await restoreOrderInventory(order);
      break;
  }

  await order.save();

  // Send processing notification (async, don't block)
  if (newStatus === 'processing') {
    notificationService.sendProcessingNotification(order.toObject(), merchantId)
      .catch((err) => logger.error('Failed to send processing notification', { orderNumber, error: err.message }));
  }

  return formatOrderResponse(order.toObject());
}

/**
 * Mark order as shipped with tracking info
 * @param {string} orderNumber
 * @param {string} merchantId
 * @param {Object} trackingInfo
 * @returns {Promise<any>}
 */
export async function shipOrder(orderNumber, merchantId, { trackingNumber, trackingCarrier }) {
  const order = await Order.findOne({ orderNumber, merchantId });
  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  if (!['pending', 'processing'].includes(order.status)) {
    const error = new Error(`Cannot ship order with status '${order.status}'`);
    error.code = 'INVALID_TRANSITION';
    error.statusCode = 400;
    throw error;
  }

  order.status = 'shipped';
  order.trackingNumber = trackingNumber;
  order.trackingCarrier = trackingCarrier;
  order.shippedAt = new Date();

  await order.save();

  // Send shipping notification (async, don't block)
  notificationService.sendShippingUpdateNotification(order.toObject(), merchantId)
    .catch((err) => logger.error('Failed to send shipping notification', { orderNumber, error: err.message }));

  return formatOrderResponse(order.toObject());
}

/**
 * Cancel order and restore inventory
 * @param {string} orderNumber
 * @param {string} merchantId
 * @param {string} [reason]
 * @returns {Promise<any>}
 */
export async function cancelOrder(orderNumber, merchantId, reason) {
  const order = await Order.findOne({ orderNumber, merchantId });
  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  if (order.status === 'delivered') {
    const error = new Error('Cannot cancel delivered orders');
    error.code = 'CANNOT_CANCEL';
    error.statusCode = 400;
    throw error;
  }

  if (order.status === 'cancelled') {
    return formatOrderResponse(order.toObject());
  }

  // Restore inventory
  await restoreOrderInventory(order);

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  if (reason) {
    order.notes = order.notes ? `${order.notes}\n\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
  }

  await order.save();

  logger.info(`Order cancelled: ${orderNumber}`);

  // Send cancellation notification (async, don't block)
  notificationService.sendCancellationNotification(order.toObject(), merchantId, reason)
    .catch((err) => logger.error('Failed to send cancellation notification', { orderNumber, error: err.message }));

  return formatOrderResponse(order.toObject());
}

/**
 * Restore inventory from cancelled order
 * @param {any} order
 */
async function restoreOrderInventory(order) {
  for (const item of order.items) {
    await Variant.findByIdAndUpdate(item.variantId, {
      $inc: { inventory: item.quantity },
    });
  }
}

/**
 * Get order details for merchant
 * @param {string} orderNumber
 * @param {string} merchantId
 * @returns {Promise<any|null>}
 */
export async function getMerchantOrderByNumber(orderNumber, merchantId) {
  const order = await Order.findOne({ orderNumber, merchantId }).lean();
  if (!order) {
    return null;
  }
  return formatOrderResponse(order, true);
}

/**
 * Mark order as delivered
 * @param {string} orderNumber
 * @param {string} merchantId
 * @returns {Promise<any>}
 */
export async function deliverOrder(orderNumber, merchantId) {
  const order = await Order.findOne({ orderNumber, merchantId });
  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== 'shipped') {
    const error = new Error(`Cannot mark as delivered: order status is '${order.status}'`);
    error.code = 'INVALID_TRANSITION';
    error.statusCode = 400;
    throw error;
  }

  order.status = 'delivered';
  order.deliveredAt = new Date();

  await order.save();

  // Send delivery notification (async, don't block)
  notificationService.sendDeliveryNotification(order.toObject(), merchantId)
    .catch((err) => logger.error('Failed to send delivery notification', { orderNumber, error: err.message }));

  return formatOrderResponse(order.toObject(), true);
}

/**
 * Update order notes
 * @param {string} orderNumber
 * @param {string} merchantId
 * @param {string} notes
 * @returns {Promise<any>}
 */
export async function updateOrderNotes(orderNumber, merchantId, notes) {
  const order = await Order.findOne({ orderNumber, merchantId });
  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  order.notes = notes;
  await order.save();

  return formatOrderResponse(order.toObject(), true);
}

/**
 * Format order for API response
 * @param {any} order
 * @param {boolean} [includeCustomerInfo=false]
 * @returns {any}
 */
function formatOrderResponse(order, includeCustomerInfo = false) {
  const response = {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    items: order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    taxAmount: order.taxAmount,
    total: order.total,
    trackingNumber: order.trackingNumber,
    trackingCarrier: order.trackingCarrier,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.paidAt,
    processedAt: order.processedAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
    cancelledAt: order.cancelledAt,
  };

  if (includeCustomerInfo) {
    response.customerEmail = order.customerEmail;
    response.customerName = order.customerName;
    response.customerId = order.customerId;
  }

  return response;
}
