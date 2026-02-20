import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';
import routes from './routes/index.js';
import { env } from './config/env.js';

/**
 * Create and configure Express app
 * @returns {import('express').Express}
 */
export function createApp() {
  const app = express();

  // Trust proxy for proper IP detection behind reverse proxy
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Request logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // CORS
  app.use(corsMiddleware);

  // Body parsing - raw body needed for Stripe webhooks
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

  // Standard body parsing for other routes
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parsing
  app.use(cookieParser());

  // Sanitize request data against NoSQL injection
  app.use(mongoSanitize());

  // Rate limiting for API routes
  app.use('/api', apiLimiter);

  // API routes
  app.use('/api', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
