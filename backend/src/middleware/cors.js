import cors from 'cors';
import { env } from '../config/env.js';

/**
 * CORS configuration
 * @type {import('cors').CorsOptions}
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin only in development (mobile apps, Postman, etc.)
    if (!origin) {
      if (env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Origin header required'));
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
 * Configured CORS middleware
 */
export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
