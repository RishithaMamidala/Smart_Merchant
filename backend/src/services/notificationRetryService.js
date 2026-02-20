import { Notification } from '../models/index.js';
import * as emailService from './emailService.js';
import logger from '../utils/logger.js';

/**
 * Maximum number of retry attempts
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Retry all failed notifications that haven't exceeded max attempts
 * @returns {Promise<{processed: number, succeeded: number, failed: number}>}
 */
export async function retryFailedNotifications() {
  const failedNotifications = await Notification.find({
    status: 'failed',
    retryCount: { $lt: MAX_RETRY_ATTEMPTS },
    channel: 'email', // Only retry email notifications
  }).limit(100); // Process in batches

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  for (const notification of failedNotifications) {
    try {
      const result = await retryNotification(notification);
      processed++;
      if (result.success) {
        succeeded++;
      } else {
        failed++;
      }
    } catch (error) {
      logger.error(`Error retrying notification ${notification._id}`, {
        error: error.message,
      });
      processed++;
      failed++;
    }
  }

  logger.info('Notification retry batch completed', {
    processed,
    succeeded,
    failed,
  });

  return { processed, succeeded, failed };
}

/**
 * Retry a single notification
 * @param {Object} notification - Notification document
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function retryNotification(notification) {
  notification.retryCount += 1;

  try {
    const result = await sendEmailNotification(notification);

    if (result.success) {
      notification.status = 'sent';
      notification.sentAt = new Date();
      notification.error = null;
      logger.info(`Notification ${notification._id} sent successfully on retry ${notification.retryCount}`);
    } else {
      notification.status = 'failed';
      notification.error = result.error;

      if (notification.retryCount >= MAX_RETRY_ATTEMPTS) {
        logger.warn(`Notification ${notification._id} failed after ${MAX_RETRY_ATTEMPTS} attempts`);
      }
    }

    await notification.save();
    return result;
  } catch (error) {
    notification.status = 'failed';
    notification.error = error.message;
    await notification.save();
    return { success: false, error: error.message };
  }
}

/**
 * Send email notification based on type
 * @param {Object} notification - Notification document
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function sendEmailNotification(notification) {
  const { type, recipient, data } = notification;

  switch (type) {
    case 'order_confirmation':
      return emailService.sendOrderConfirmation(data.order, recipient);

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
      return { success: false, error: `Unknown notification type: ${type}` };
  }
}

/**
 * Get retry statistics
 * @returns {Promise<Object>}
 */
export async function getRetryStats() {
  const [pending, failed, maxedOut] = await Promise.all([
    Notification.countDocuments({ status: 'pending' }),
    Notification.countDocuments({
      status: 'failed',
      retryCount: { $lt: MAX_RETRY_ATTEMPTS },
    }),
    Notification.countDocuments({
      status: 'failed',
      retryCount: { $gte: MAX_RETRY_ATTEMPTS },
    }),
  ]);

  return {
    pending,
    retryable: failed,
    permanentlyFailed: maxedOut,
    maxRetryAttempts: MAX_RETRY_ATTEMPTS,
  };
}

/**
 * Mark notifications as permanently failed after max retries
 * This is optional - can be used for cleanup
 * @returns {Promise<{markedCount: number}>}
 */
export async function markPermanentlyFailed() {
  const result = await Notification.updateMany(
    {
      status: 'failed',
      retryCount: { $gte: MAX_RETRY_ATTEMPTS },
      permanentlyFailed: { $ne: true },
    },
    {
      $set: { permanentlyFailed: true },
    }
  );

  return { markedCount: result.modifiedCount };
}
