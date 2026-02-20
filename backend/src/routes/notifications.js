import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticate, requireMerchant } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();

// All routes require merchant authentication
router.use(authenticate, requireMerchant);

/**
 * GET /api/notifications
 * Get merchant notifications with pagination
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('type').optional().isIn([
      'order_confirmation',
      'shipping_update',
      'delivery_confirmation',
      'order_cancellation',
      'low_stock',
      'daily_summary',
      'new_order',
    ]),
    query('status').optional().isIn(['pending', 'sent', 'failed']),
    query('channel').optional().isIn(['email', 'in_app']),
    validate,
  ],
  notificationController.getNotifications
);

/**
 * GET /api/notifications/unread-count
 * Get unread in-app notification count
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * GET /api/notifications/preferences
 * Get notification preferences
 */
router.get('/preferences', notificationController.getPreferences);

/**
 * PUT /api/notifications/preferences
 * Update notification preferences
 */
router.put(
  '/preferences',
  [
    body('emailNotifications').optional().isBoolean(),
    body('orderConfirmations').optional().isBoolean(),
    body('shippingUpdates').optional().isBoolean(),
    body('lowStockAlerts').optional().isBoolean(),
    body('dailySummary').optional().isBoolean(),
    body('lowStockThreshold').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
  notificationController.updatePreferences
);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', notificationController.markAllAsRead);

/**
 * GET /api/notifications/:id
 * Get single notification
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid notification ID'), validate],
  notificationController.getNotification
);

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch(
  '/:id/read',
  [param('id').isMongoId().withMessage('Invalid notification ID'), validate],
  notificationController.markAsRead
);

/**
 * POST /api/notifications/:id/retry
 * Retry failed notification
 */
router.post(
  '/:id/retry',
  [param('id').isMongoId().withMessage('Invalid notification ID'), validate],
  notificationController.retryNotification
);

export default router;
