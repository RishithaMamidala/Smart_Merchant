import { Router } from 'express';
import { cronAuth } from '../middleware/cronAuth.js';
import { sendAllDailySummaries } from '../services/dailySummaryService.js';
import { checkAllMerchantInventory } from '../services/inventoryAlertService.js';
import { retryFailedNotifications, getRetryStats } from '../services/notificationRetryService.js';
import { deleteOldNotifications } from '../services/notificationService.js';
import { Cart } from '../models/index.js';
import logger from '../utils/logger.js';

const router = Router();

// All cron routes require authentication
router.use(cronAuth);

/**
 * POST /api/cron/daily-summary
 * Send daily summary emails to all merchants
 * Recommended schedule: Daily at 8:00 AM
 */
router.post('/daily-summary', async (req, res) => {
  try {
    logger.info('Starting daily summary cron job');
    const result = await sendAllDailySummaries();
    logger.info('Daily summary cron job completed', result);

    res.json({
      success: true,
      message: 'Daily summaries sent',
      ...result,
    });
  } catch (error) {
    logger.error('Daily summary cron job failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to send daily summaries',
    });
  }
});

/**
 * POST /api/cron/low-stock-check
 * Check inventory levels and send low stock alerts
 * Recommended schedule: Daily at 9:00 AM
 */
router.post('/low-stock-check', async (req, res) => {
  try {
    logger.info('Starting low stock check cron job');
    const result = await checkAllMerchantInventory();
    logger.info('Low stock check cron job completed', result);

    res.json({
      success: true,
      message: 'Low stock check completed',
      ...result,
    });
  } catch (error) {
    logger.error('Low stock check cron job failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to check low stock',
    });
  }
});

/**
 * POST /api/cron/retry-notifications
 * Retry failed email notifications
 * Recommended schedule: Every 15 minutes
 */
router.post('/retry-notifications', async (req, res) => {
  try {
    logger.info('Starting notification retry cron job');
    const result = await retryFailedNotifications();
    logger.info('Notification retry cron job completed', result);

    res.json({
      success: true,
      message: 'Notification retry completed',
      ...result,
    });
  } catch (error) {
    logger.error('Notification retry cron job failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retry notifications',
    });
  }
});

/**
 * POST /api/cron/cleanup-carts
 * Remove abandoned carts older than specified days
 * Recommended schedule: Daily at 3:00 AM
 */
router.post('/cleanup-carts', async (req, res) => {
  try {
    const daysOld = Math.max(1, Math.min(365, parseInt(req.query.days) || 7));
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    logger.info('Starting cart cleanup cron job', { daysOld, cutoffDate });

    const result = await Cart.deleteMany({
      updatedAt: { $lt: cutoffDate },
    });

    logger.info('Cart cleanup cron job completed', {
      deletedCount: result.deletedCount,
    });

    res.json({
      success: true,
      message: 'Cart cleanup completed',
      deletedCount: result.deletedCount,
      cutoffDate,
    });
  } catch (error) {
    logger.error('Cart cleanup cron job failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup carts',
    });
  }
});

/**
 * POST /api/cron/cleanup-notifications
 * Remove old read notifications
 * Recommended schedule: Weekly
 */
router.post('/cleanup-notifications', async (req, res) => {
  try {
    const daysOld = Math.max(1, Math.min(365, parseInt(req.query.days) || 90));

    logger.info('Starting notification cleanup cron job', { daysOld });

    const result = await deleteOldNotifications(daysOld);

    logger.info('Notification cleanup cron job completed', result);

    res.json({
      success: true,
      message: 'Notification cleanup completed',
      ...result,
    });
  } catch (error) {
    logger.error('Notification cleanup cron job failed', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup notifications',
    });
  }
});

/**
 * GET /api/cron/status
 * Get cron job status and statistics
 */
router.get('/status', async (req, res) => {
  try {
    const [retryStats, cartCount] = await Promise.all([
      getRetryStats(),
      Cart.countDocuments({
        updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({
      success: true,
      status: {
        notifications: retryStats,
        abandonedCarts: cartCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get cron status', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get cron status',
    });
  }
});

export default router;
