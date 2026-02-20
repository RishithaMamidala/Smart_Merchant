/**
 * Simple toast notification system
 * Uses custom events for cross-component communication
 */

const TOAST_EVENT = 'app:toast';

/**
 * Show a notification toast
 * @param {Object} notification - Notification object
 */
export function showNotificationToast(notification) {
  const event = new CustomEvent(TOAST_EVENT, {
    detail: {
      id: notification.id,
      type: 'notification',
      title: getNotificationTitle(notification.type),
      message: notification.subject,
      data: notification,
      duration: 5000, // 5 seconds
    },
  });
  window.dispatchEvent(event);
}

/**
 * Show a custom toast
 * @param {Object} options - Toast options
 */
export function showToast(options) {
  const event = new CustomEvent(TOAST_EVENT, {
    detail: {
      id: Date.now(),
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
    },
  });
  window.dispatchEvent(event);
}

/**
 * Subscribe to toast events
 * @param {Function} callback - Handler function
 * @returns {Function} Cleanup function
 */
export function subscribeToToasts(callback) {
  const handler = (event) => callback(event.detail);
  window.addEventListener(TOAST_EVENT, handler);
  return () => window.removeEventListener(TOAST_EVENT, handler);
}

/**
 * Get notification title from type
 * @param {string} type - Notification type
 * @returns {string} Title
 */
function getNotificationTitle(type) {
  const titles = {
    new_order: '📦 New Order',
    order_confirmation: '✅ Order Confirmed',
    processing_update: '🔄 Order Processing',
    shipping_update: '🚚 Order Shipped',
    delivery_confirmation: '✅ Order Delivered',
    order_cancellation: '❌ Order Cancelled',
    low_stock: '⚠️ Low Stock Alert',
    daily_summary: '📊 Daily Summary',
  };
  return titles[type] || '🔔 Notification';
}
