import { verifyAccessToken } from '../../utils/jwt.js';
import { logger } from '../../utils/logger.js';

/**
 * Socket.io authentication middleware
 * Validates JWT token and joins merchant-specific room
 * @param {import('socket.io').Socket} socket
 * @param {Function} next
 */
export function authenticateSocket(socket, next) {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth?.token;

    if (!token) {
      logger.warn('Socket connection attempted without token', {
        socketId: socket.id,
      });
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const payload = verifyAccessToken(token);

    if (!payload) {
      logger.warn('Socket connection attempted with invalid token', {
        socketId: socket.id,
      });
      return next(new Error('Invalid or expired token'));
    }

    // Ensure this is a merchant (customers don't get real-time notifications)
    if (payload.type !== 'merchant') {
      logger.warn('Socket connection attempted by non-merchant', {
        socketId: socket.id,
        userType: payload.type,
      });
      return next(new Error('Merchant access only'));
    }

    // Attach merchant info to socket instance
    socket.merchantId = payload.id;
    socket.userType = payload.type;
    socket.userEmail = payload.email;

    // Join merchant-specific room
    const roomName = `merchant:${payload.id}`;
    socket.join(roomName);

    logger.info('Merchant socket authenticated', {
      socketId: socket.id,
      merchantId: payload.id,
      room: roomName,
    });

    next();
  } catch (error) {
    logger.error('Socket authentication error', {
      socketId: socket.id,
      error: error.message,
    });
    next(new Error('Authentication failed'));
  }
}
