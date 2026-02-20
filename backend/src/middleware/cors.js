import cors from 'cors';
import { env } from '../config/env.js';

/**
 * CORS configuration
 * @type {import('cors').CorsOptions}
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (health checks, webhooks, monitoring tools)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // In production, only allow configured frontend URL
    const allowedOrigins = [env.FRONTEND_URL];

    // Add any additional origins from environment
    if (process.env.ALLOWED_ORIGINS) {
      const additional = process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
      allowedOrigins.push(...additional);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Session-ID',
    'X-Cron-Secret',
    'Stripe-Signature',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

/**
 * Conditional CORS middleware that skips CORS for health checks and webhooks
 * These endpoints need to be accessible without Origin headers (for monitoring tools)
 */
export const corsMiddleware = (req, res, next) => {
  // Skip CORS for health checks, webhooks, and cron jobs (no Origin header required)
  const path = req.path;
  if (path === '/api/health' || path.startsWith('/api/webhooks/') || path.startsWith('/api/cron/')) {
    return next();
  }

  // Apply CORS for all other routes
  return cors(corsOptions)(req, res, next);
};

export default corsMiddleware;
