import api from './api.js';

/**
 * Get merchant notifications
 * @param {Object} params
 * @returns {Promise<{notifications: Array, pagination: Object}>}
 */
export async function getNotifications(params = {}) {
  const { page = 1, limit = 20, type, status } = params;
  const queryParams = new URLSearchParams();

  queryParams.append('page', page);
  queryParams.append('limit', limit);
  if (type) queryParams.append('type', type);
  if (status) queryParams.append('status', status);

  const response = await api.get(`/merchant/notifications?${queryParams.toString()}`);
  return response.data;
}

/**
 * Get single notification
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getNotification(id) {
  const response = await api.get(`/merchant/notifications/${id}`);
  return response.data.notification;
}

/**
 * Get unread notification count
 * @returns {Promise<number>}
 */
export async function getUnreadCount() {
  const response = await api.get('/merchant/notifications/unread-count');
  return response.data.count;
}

/**
 * Mark notification as read
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function markAsRead(id) {
  const response = await api.patch(`/merchant/notifications/${id}/read`);
  return response.data.notification;
}

/**
 * Mark all notifications as read
 * @returns {Promise<{modifiedCount: number}>}
 */
export async function markAllAsRead() {
  const response = await api.patch('/merchant/notifications/read-all');
  return response.data;
}

/**
 * Retry failed notification
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function retryNotification(id) {
  const response = await api.post(`/merchant/notifications/${id}/retry`);
  return response.data.notification;
}

/**
 * Get notification preferences
 * @returns {Promise<Object>}
 */
export async function getPreferences() {
  const response = await api.get('/merchant/notifications/preferences');
  return response.data.preferences;
}

/**
 * Update notification preferences
 * @param {Object} preferences
 * @returns {Promise<Object>}
 */
export async function updatePreferences(preferences) {
  const response = await api.put('/merchant/notifications/preferences', preferences);
  return response.data.preferences;
}
