import { io } from 'socket.io-client';

/**
 * Socket.io client singleton instance
 * @type {import('socket.io-client').Socket | null}
 */
let socket = null;

/**
 * Initialize Socket.io client with authentication
 * @param {string} accessToken - JWT access token
 * @returns {import('socket.io-client').Socket} Socket instance
 */
export function initializeSocket(accessToken) {
  // Don't recreate if already connected
  if (socket?.connected) {
    return socket;
  }

  // Close existing socket if disconnected
  if (socket) {
    socket.close();
  }

  // Get API URL from environment
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Create new socket connection
  socket = io(apiUrl, {
    path: '/socket.io',
    auth: {
      token: accessToken,
    },
    autoConnect: false, // Manual connection control
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
  });

  return socket;
}

/**
 * Get current socket instance
 * @returns {import('socket.io-client').Socket | null}
 */
export function getSocket() {
  return socket;
}

/**
 * Update socket authentication with new token
 * Called after token refresh
 * @param {string} newToken - New JWT access token
 */
export function updateSocketAuth(newToken) {
  if (!socket) {
    return;
  }

  // Update auth token
  socket.auth = { token: newToken };

  // Reconnect if disconnected (will use new token)
  if (!socket.connected) {
    socket.connect();
  }
}

/**
 * Disconnect and cleanup socket
 * Called on logout
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
