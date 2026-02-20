import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

/**
 * Create rate limiter with custom options
 * @param {Object} options
 * @param {number} [options.windowMs=60000] - Time window in ms
 * @param {number} [options.max=100] - Max requests per window
 * @param {string} [options.message='Too many requests']
 * @returns {import('express').RequestHandler}
 */
export function createRateLimiter(options = {}) {
  const { windowMs = 60 * 1000, max = 100, message = 'Too many requests' } = options;

  // In development, multiply limits by 10 for easier testing
  const adjustedMax = env.NODE_ENV === 'development' ? max * 10 : max;

  return rateLimit({
    windowMs,
    max: adjustedMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      sendError(res, 'RATE_LIMIT_EXCEEDED', message, 429);
    },
  });
}

/**
 * General API rate limiter
 * 100 requests per minute
 */
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});

/**
 * Auth rate limiter - stricter limits for login/register
 * 5 requests per minute
 */
export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
});

/**
 * Checkout rate limiter
 * 10 requests per minute
 */
export const checkoutLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many checkout attempts, please try again later',
});

/**
 * Cart rate limiter
 * 30 requests per minute
 */
export const cartLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many cart requests, please try again later',
});

/**
 * Order lookup rate limiter
 * 10 requests per minute
 */
export const orderLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many order lookup requests, please try again later',
});
