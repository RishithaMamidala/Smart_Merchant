import { env } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate cron job requests
 * Verifies the request has a valid cron secret token
 */
export function cronAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const cronSecret = env.CRON_SECRET;

  // Reject if cron secret is not configured
  if (!cronSecret) {
    logger.error('CRON_SECRET not configured');
    return res.status(500).json({
      success: false,
      message: 'Cron authentication not configured',
    });
  }

  // Check for Bearer token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Cron request missing authorization header');
    return res.status(401).json({
      success: false,
      message: 'Missing authorization header',
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (token !== cronSecret) {
    logger.warn('Cron request with invalid token');
    return res.status(401).json({
      success: false,
      message: 'Invalid cron secret',
    });
  }

  logger.info('Cron request authenticated successfully');
  next();
}

/**
 * Middleware to only allow cron jobs in production
 * or when explicitly enabled in development
 */
export function cronProductionOnly(req, res, next) {
  if (env.NODE_ENV === 'production' || env.ENABLE_CRON_IN_DEV === 'true') {
    return next();
  }

  logger.info('Cron job skipped in development mode');
  return res.status(200).json({
    success: true,
    message: 'Cron job skipped in development mode',
    skipped: true,
  });
}
