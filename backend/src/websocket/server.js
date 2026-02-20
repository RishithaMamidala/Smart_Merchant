import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { authenticateSocket } from './middleware/auth.js';
import { setSocketServer } from './emitters/notificationEmitter.js';

/**
 * Initialize Socket.io server with HTTP server
 * @param {import('http').Server} httpServer - Express HTTP server instance
 * @returns {import('socket.io').Server} - Socket.io server instance
 */
export function initializeWebSocket(httpServer) {
  logger.info('Initializing Socket.io server...');

  // Create Socket.io server with CORS configuration matching REST API
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin only in development (mobile apps, etc.)
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
      credentials: true,
    },
    // Transports: prefer WebSocket, fallback to polling
    transports: ['websocket', 'polling'],
    // Connection settings
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
  });

  // Apply authentication middleware
  io.use(authenticateSocket);

  // Register Socket.io instance with emitters
  setSocketServer(io);

  // Connection event handler
  io.on('connection', (socket) => {
    logger.info('Merchant connected via WebSocket', {
      socketId: socket.id,
      merchantId: socket.merchantId,
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('Merchant disconnected', {
        socketId: socket.id,
        merchantId: socket.merchantId,
        reason,
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      logger.error('Socket error', {
        socketId: socket.id,
        merchantId: socket.merchantId,
        error: error.message,
      });
    });

    // Optional: Handle client-initiated mark as read (for future use)
    socket.on('notification:read', async ({ notificationId }) => {
      logger.debug('Notification marked as read via socket', {
        socketId: socket.id,
        merchantId: socket.merchantId,
        notificationId,
      });
      // Could call markAsRead service here if needed for real-time feedback
    });
  });

  logger.info('Socket.io server initialized successfully', {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });

  return io;
}

/**
 * Gracefully close Socket.io server
 * @param {import('socket.io').Server} io - Socket.io server instance
 * @returns {Promise<void>}
 */
export function closeWebSocket(io) {
  return new Promise((resolve) => {
    if (!io) {
      resolve();
      return;
    }

    logger.info('Closing Socket.io server...');

    io.close(() => {
      logger.info('Socket.io server closed');
      resolve();
    });
  });
}
