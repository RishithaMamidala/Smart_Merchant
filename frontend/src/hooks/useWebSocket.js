import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { initializeSocket, disconnectSocket } from '../services/websocket.js';
import { showNotificationToast } from '../utils/toast.js';

/**
 * WebSocket hook for real-time merchant notifications
 * Manages socket connection lifecycle and event handlers
 * @returns {{isConnected: boolean}} Connection status
 */
export function useWebSocket() {
  const queryClient = useQueryClient();
  const { accessToken, userType } = useSelector((state) => state.auth);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only connect for authenticated merchants
    if (!accessToken || userType !== 'merchant') {
      return;
    }

    // Initialize socket with access token
    const socket = initializeSocket(accessToken);

    // Connection event handlers
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[WebSocket] Connected to server');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[WebSocket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      setIsConnected(false);
    });

    // Notification event handlers
    socket.on('notification:new', (notification) => {
      console.log('[WebSocket] New notification received:', notification);

      // Invalidate notifications list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Update unread count cache optimistically
      queryClient.setQueryData(['notifications', 'unread-count'], (oldCount) => {
        return typeof oldCount === 'number' ? oldCount + 1 : 1;
      });

      // Show toast notification
      showNotificationToast(notification);
    });

    socket.on('notification:unread_count', ({ count }) => {
      console.log('[WebSocket] Unread count updated:', count);

      // Update unread count cache
      queryClient.setQueryData(['notifications', 'unread-count'], count);
    });

    // Connect socket
    socket.connect();

    // Cleanup on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('notification:new');
      socket.off('notification:unread_count');
      disconnectSocket();
      setIsConnected(false);
    };
  }, [accessToken, userType, queryClient]);

  return { isConnected };
}
