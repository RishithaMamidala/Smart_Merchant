import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationService from '../services/notificationService.js';

/**
 * Hook to fetch notifications with pagination
 * @param {Object} params
 * @returns {Object} Query result
 */
export function useNotifications(params = {}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch single notification
 * @param {string} id
 * @returns {Object} Query result
 */
export function useNotification(id) {
  return useQuery({
    queryKey: ['notification', id],
    queryFn: () => notificationService.getNotification(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch unread count
 * @returns {Object} Query result
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.getUnreadCount,
    staleTime: 30 * 1000, // 30 seconds
    // Polling removed - real-time updates via WebSocket
  });
}

/**
 * Hook to mark notification as read
 * @returns {Object} Mutation result
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to mark all notifications as read
 * @returns {Object} Mutation result
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to retry failed notification
 * @returns {Object} Mutation result
 */
export function useRetryNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => notificationService.retryNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Hook to fetch notification preferences
 * @returns {Object} Query result
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: notificationService.getPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update notification preferences
 * @returns {Object} Mutation result
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences) => notificationService.updatePreferences(preferences),
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences'], data);
    },
  });
}
