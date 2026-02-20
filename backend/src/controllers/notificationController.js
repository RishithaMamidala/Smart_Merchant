import * as notificationService from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Get merchant notifications with pagination
 * GET /api/notifications
 */
export async function getNotifications(req, res, next) {
  try {
    const { page, limit, type, status, channel } = req.query;
    const result = await notificationService.getMerchantNotifications(
      req.user.id,
      { page: parseInt(page) || 1, limit: parseInt(limit) || 20, type, status, channel }
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get single notification
 * GET /api/notifications/:id
 */
export async function getNotification(req, res, next) {
  try {
    const notification = await notificationService.getNotificationById(
      req.params.id,
      req.user.id
    );
    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }
    sendSuccess(res, { notification });
  } catch (error) {
    next(error);
  }
}

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
export async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    sendSuccess(res, { count });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
export async function markAsRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }
    sendSuccess(res, { notification });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
export async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * Retry failed notification
 * POST /api/notifications/:id/retry
 */
export async function retryNotification(req, res, next) {
  try {
    const notification = await notificationService.retryNotification(
      req.params.id,
      req.user.id
    );
    sendSuccess(res, { notification });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Maximum retry')) {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
}

/**
 * Get notification preferences
 * GET /api/notifications/preferences
 */
export async function getPreferences(req, res, next) {
  try {
    // Preferences are stored on the merchant model
    const { Merchant } = await import('../models/index.js');
    const merchant = await Merchant.findById(req.user.id).select('notificationPreferences').lean();

    // Default preferences if not set
    const defaultPreferences = {
      emailNotifications: true,
      orderConfirmations: true,
      shippingUpdates: true,
      lowStockAlerts: true,
      dailySummary: true,
      lowStockThreshold: 5,
    };

    sendSuccess(res, {
      preferences: merchant?.notificationPreferences || defaultPreferences,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 */
export async function updatePreferences(req, res, next) {
  try {
    const { Merchant } = await import('../models/index.js');
    const {
      emailNotifications,
      orderConfirmations,
      shippingUpdates,
      lowStockAlerts,
      dailySummary,
      lowStockThreshold,
    } = req.body;

    const preferences = {};
    if (typeof emailNotifications === 'boolean') preferences.emailNotifications = emailNotifications;
    if (typeof orderConfirmations === 'boolean') preferences.orderConfirmations = orderConfirmations;
    if (typeof shippingUpdates === 'boolean') preferences.shippingUpdates = shippingUpdates;
    if (typeof lowStockAlerts === 'boolean') preferences.lowStockAlerts = lowStockAlerts;
    if (typeof dailySummary === 'boolean') preferences.dailySummary = dailySummary;
    if (typeof lowStockThreshold === 'number') preferences.lowStockThreshold = lowStockThreshold;

    const merchant = await Merchant.findByIdAndUpdate(
      req.user.id,
      { $set: { notificationPreferences: preferences } },
      { new: true }
    ).select('notificationPreferences').lean();

    sendSuccess(res, { preferences: merchant.notificationPreferences });
  } catch (error) {
    next(error);
  }
}
