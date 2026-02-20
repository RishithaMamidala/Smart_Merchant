import { logger } from '../../utils/logger.js';

/**
 * Socket.io instance (initialized by server.js)
 * @type {import('socket.io').Server | null}
 */
let io = null;

/**
 * Set Socket.io instance
 * @param {import('socket.io').Server} socketServer
 */
export function setSocketServer(socketServer) {
  io = socketServer;
  logger.info('Socket.io server instance registered with emitters');
}

/**
 * Get Socket.io instance
 * @returns {import('socket.io').Server | null}
 */
export function getSocketServer() {
  return io;
}

/**
 * Emit new notification to merchant room
 * @param {string} merchantId - Merchant ID
 * @param {Object} notification - Notification object
 */
export function emitNewNotification(merchantId, notification) {
  if (!io) {
    logger.debug('Socket.io not initialized, skipping notification emission');
    return;
  }

  try {
    const roomName = `merchant:${merchantId}`;

    // Emit to merchant's room
    io.to(roomName).emit('notification:new', {
      id: notification._id.toString(),
      type: notification.type,
      subject: notification.subject,
      content: notification.content,
      relatedOrderId: notification.relatedOrderId?.toString() || null,
      relatedProductId: notification.relatedProductId?.toString() || null,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    });

    logger.debug('Emitted new notification', {
      merchantId,
      notificationId: notification._id,
      room: roomName,
    });
  } catch (error) {
    logger.error('Failed to emit new notification', {
      merchantId,
      notificationId: notification._id,
      error: error.message,
    });
  }
}

/**
 * Emit updated unread count to merchant room
 * @param {string} merchantId - Merchant ID
 * @param {number} count - Unread notification count
 */
export function emitUnreadCountUpdate(merchantId, count) {
  if (!io) {
    logger.debug('Socket.io not initialized, skipping unread count emission');
    return;
  }

  try {
    const roomName = `merchant:${merchantId}`;

    // Emit to merchant's room
    io.to(roomName).emit('notification:unread_count', {
      count,
    });

    logger.debug('Emitted unread count update', {
      merchantId,
      count,
      room: roomName,
    });
  } catch (error) {
    logger.error('Failed to emit unread count', {
      merchantId,
      count,
      error: error.message,
    });
  }
}
