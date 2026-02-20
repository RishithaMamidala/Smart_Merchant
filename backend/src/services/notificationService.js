import { Notification } from '../models/index.js';
import * as emailService from './emailService.js';
import logger from '../utils/logger.js';
import {
  emitNewNotification,
  emitUnreadCountUpdate,
} from '../websocket/emitters/notificationEmitter.js';

/**
 * @typedef {Object} NotificationData
 * @property {string} merchantId - Merchant ID
 * @property {string} type - Notification type
 * @property {string} channel - Notification channel (email, in_app)
 * @property {string} recipient - Recipient email or identifier
 * @property {string} subject - Notification subject
 * @property {Object} data - Additional notification data
 * @property {string} [relatedOrderId] - Related order ID
 * @property {string} [relatedProductId] - Related product ID
 */

/**
 * Create and send a notification
 * @param {NotificationData} notificationData
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification(notificationData) {
  const {
    merchantId,
    customerId,
    type,
    channel,
    recipient,
    subject,
    data,
    relatedOrderId,
    relatedProductId,
  } = notificationData;

  // Generate content for the notification record
  const content = generateNotificationContent(type, data, subject);

  // Create notification record
  const notification = await Notification.create({
    merchantId: merchantId || null,
    customerId: customerId || null,
    type,
    channel: channel || 'email',
    recipientEmail: recipient,
    subject,
    content,
    relatedOrderId,
    relatedProductId,
    status: 'pending',
  });

  // Attempt to send
  try {
    if (channel === 'email') {
      const result = await sendEmailNotification({ type, recipient, data });
      notification.status = result.success ? 'sent' : 'failed';
      notification.sentAt = result.success ? new Date() : undefined;
      notification.failureReason = result.error;
      if (result.messageId) {
        notification.sendGridMessageId = result.messageId;
      }
    } else if (channel === 'in_app') {
      notification.status = 'sent';
      notification.sentAt = new Date();
    }
  } catch (error) {
    notification.status = 'failed';
    notification.failureReason = error.message;
    logger.error('Failed to send notification', { notificationId: notification._id, error: error.message });
  }

  await notification.save();

  // Emit real-time socket events for in-app merchant notifications
  if (channel === 'in_app' && merchantId) {
    // Emit new notification event
    emitNewNotification(merchantId, notification);

    // Fetch and emit updated unread count
    const unreadCount = await getUnreadCount(merchantId);
    emitUnreadCountUpdate(merchantId, unreadCount);
  }

  return notification;
}

/**
 * Generate notification content text
 * @param {string} type
 * @param {Object} data
 * @param {string} subject
 * @returns {string}
 */
function generateNotificationContent(type, data, subject) {
  switch (type) {
    case 'order_confirmation':
      return `Order #${data.order?.orderNumber || ''} confirmed. Total: $${((data.order?.total || 0) / 100).toFixed(2)}`;
    case 'new_order':
      return `New order #${data.orderNumber || ''} received. Total: $${((data.total || 0) / 100).toFixed(2)}`;
    case 'processing_update':
      return `Order #${data.order?.orderNumber || ''} is now being processed.`;
    case 'shipping_update':
      return `Order #${data.order?.orderNumber || ''} has been shipped.`;
    case 'delivery_confirmation':
      return `Order #${data.order?.orderNumber || ''} has been delivered.`;
    case 'order_cancellation':
      return `Order #${data.order?.orderNumber || ''} has been cancelled.${data.reason ? ` Reason: ${data.reason}` : ''}`;
    default:
      return subject;
  }
}

/**
 * Send email notification based on type
 * @param {Object} params
 * @param {string} params.type
 * @param {string} params.recipient
 * @param {Object} params.data
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmailNotification({ type, recipient, data }) {
  switch (type) {
    case 'order_confirmation':
      return emailService.sendOrderConfirmation(data.order, recipient);

    case 'processing_update':
      return emailService.sendProcessingNotification(data.order, recipient);

    case 'shipping_update':
      return emailService.sendShippingNotification(data.order, recipient);

    case 'delivery_confirmation':
      return emailService.sendDeliveryConfirmation(data.order, recipient);

    case 'order_cancellation':
      return emailService.sendOrderCancellation(data.order, recipient, data.reason);

    case 'low_stock':
      return emailService.sendLowStockAlert(data.merchant, data.lowStockItems);

    case 'daily_summary':
      return emailService.sendDailySummary(data.merchant, data.summary);

    default:
      logger.warn(`Unknown notification type: ${type}`);
      return { success: false, error: `Unknown notification type: ${type}` };
  }
}

/**
 * Get merchant notifications with pagination
 * @param {string} merchantId
 * @param {Object} options
 * @returns {Promise<{notifications: Array, pagination: Object}>}
 */
export async function getMerchantNotifications(merchantId, options = {}) {
  const { page = 1, limit = 20, type, status, channel } = options;

  const query = { merchantId };

  if (type) query.type = type;
  if (status) query.status = status;
  if (channel) query.channel = channel;

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Convert to JSON to apply toJSON transform (converts _id to id)
  const transformedNotifications = notifications.map((n) => n.toJSON());

  return {
    notifications: transformedNotifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get notification by ID
 * @param {string} notificationId
 * @param {string} merchantId
 * @returns {Promise<Object|null>}
 */
export async function getNotificationById(notificationId, merchantId) {
  const notification = await Notification.findOne({
    _id: notificationId,
    merchantId,
  });
  return notification ? notification.toJSON() : null;
}

/**
 * Mark notification as read
 * @param {string} notificationId
 * @param {string} merchantId
 * @returns {Promise<Object|null>}
 */
export async function markAsRead(notificationId, merchantId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, merchantId },
    { readAt: new Date() },
    { new: true }
  );

  // Emit updated unread count via WebSocket
  if (notification) {
    const unreadCount = await getUnreadCount(merchantId);
    emitUnreadCountUpdate(merchantId, unreadCount);
  }

  return notification ? notification.toJSON() : null;
}

/**
 * Mark all notifications as read
 * @param {string} merchantId
 * @returns {Promise<{modifiedCount: number}>}
 */
export async function markAllAsRead(merchantId) {
  const result = await Notification.updateMany(
    { merchantId, readAt: null },
    { readAt: new Date() }
  );

  // Emit updated unread count (should be 0) via WebSocket
  if (result.modifiedCount > 0) {
    emitUnreadCountUpdate(merchantId, 0);
  }

  return { modifiedCount: result.modifiedCount };
}

/**
 * Get unread notification count
 * @param {string} merchantId
 * @returns {Promise<number>}
 */
export async function getUnreadCount(merchantId) {
  return Notification.countDocuments({
    merchantId,
    readAt: null,
  });
}

/**
 * Retry failed notification
 * @param {string} notificationId
 * @param {string} merchantId
 * @returns {Promise<Object>}
 */
export async function retryNotification(notificationId, merchantId) {
  const notification = await Notification.findOne({
    _id: notificationId,
    merchantId,
    status: 'failed',
  });

  if (!notification) {
    throw new Error('Notification not found or not in failed status');
  }

  if (notification.retryCount >= 3) {
    throw new Error('Maximum retry attempts reached');
  }

  notification.retryCount += 1;

  try {
    if (notification.channel === 'email') {
      const result = await sendEmailNotification(notification);
      notification.status = result.success ? 'sent' : 'failed';
      notification.sentAt = result.success ? new Date() : undefined;
      notification.error = result.error;
    }
  } catch (error) {
    notification.status = 'failed';
    notification.error = error.message;
  }

  await notification.save();
  return notification;
}

/**
 * Send order confirmation notification
 * @param {Object} order - Order document
 * @param {string} merchantId - Merchant ID
 */
export async function sendOrderConfirmationNotification(order, merchantId) {
  // Send email to customer (stored under customerId so it doesn't appear in merchant list)
  await createNotification({
    customerId: order.customerId,
    type: 'order_confirmation',
    channel: 'email',
    recipient: order.customerEmail,
    subject: `Order Confirmation - #${order.orderNumber}`,
    data: { order },
    relatedOrderId: order._id,
  });

  // Create in-app notification for merchant
  await createNotification({
    merchantId,
    type: 'new_order',
    channel: 'in_app',
    recipient: merchantId,
    subject: `New Order #${order.orderNumber}`,
    data: {
      orderNumber: order.orderNumber,
      total: order.total,
      itemCount: order.items.length,
    },
    relatedOrderId: order._id,
  });
}

/**
 * Send processing notification
 * @param {Object} order - Order document
 * @param {string} merchantId - Merchant ID
 */
export async function sendProcessingNotification(order, _merchantId) {
  await createNotification({
    customerId: order.customerId,
    type: 'processing_update',
    channel: 'email',
    recipient: order.customerEmail,
    subject: `Your Order #${order.orderNumber} Is Being Processed`,
    data: { order },
    relatedOrderId: order._id,
  });
}

/**
 * Send shipping notification
 * @param {Object} order - Order document
 * @param {string} merchantId - Merchant ID
 */
export async function sendShippingUpdateNotification(order, _merchantId) {
  await createNotification({
    customerId: order.customerId,
    type: 'shipping_update',
    channel: 'email',
    recipient: order.customerEmail,
    subject: `Your Order #${order.orderNumber} Has Shipped!`,
    data: { order },
    relatedOrderId: order._id,
  });
}

/**
 * Send delivery notification
 * @param {Object} order - Order document
 * @param {string} merchantId - Merchant ID
 */
export async function sendDeliveryNotification(order, _merchantId) {
  await createNotification({
    customerId: order.customerId,
    type: 'delivery_confirmation',
    channel: 'email',
    recipient: order.customerEmail,
    subject: `Your Order #${order.orderNumber} Has Been Delivered`,
    data: { order },
    relatedOrderId: order._id,
  });
}

/**
 * Send order cancellation notification
 * @param {Object} order - Order document
 * @param {string} merchantId - Merchant ID
 * @param {string} [reason] - Cancellation reason
 */
export async function sendCancellationNotification(order, _merchantId, reason) {
  await createNotification({
    customerId: order.customerId,
    type: 'order_cancellation',
    channel: 'email',
    recipient: order.customerEmail,
    subject: `Order #${order.orderNumber} Has Been Cancelled`,
    data: { order, reason },
    relatedOrderId: order._id,
  });
}

/**
 * Send low stock alert to merchant
 * @param {Object} merchant - Merchant document
 * @param {Array} lowStockItems - Low stock items
 */
export async function sendLowStockAlertNotification(merchant, lowStockItems) {
  // Send email
  await createNotification({
    merchantId: merchant._id,
    type: 'low_stock',
    channel: 'email',
    recipient: merchant.email,
    subject: `Low Stock Alert - ${lowStockItems.length} item(s) need attention`,
    data: { merchant, lowStockItems },
  });

  // Create in-app notification
  await createNotification({
    merchantId: merchant._id,
    type: 'low_stock',
    channel: 'in_app',
    recipient: merchant._id.toString(),
    subject: `${lowStockItems.length} item(s) are low on stock`,
    data: { itemCount: lowStockItems.length, items: lowStockItems.slice(0, 5) },
  });
}

/**
 * Send daily summary to merchant
 * @param {Object} merchant - Merchant document
 * @param {Object} summary - Daily summary data
 */
export async function sendDailySummaryNotification(merchant, summary) {
  await createNotification({
    merchantId: merchant._id,
    type: 'daily_summary',
    channel: 'email',
    recipient: merchant.email,
    subject: `Daily Summary - ${summary.orderCount} orders, $${(summary.revenue / 100).toFixed(2)} revenue`,
    data: { merchant, summary },
  });
}

/**
 * Delete old notifications (for cleanup)
 * @param {number} daysOld - Delete notifications older than this many days
 * @returns {Promise<{deletedCount: number}>}
 */
export async function deleteOldNotifications(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    readAt: { $ne: null }, // Only delete read notifications
  });

  return { deletedCount: result.deletedCount };
}
