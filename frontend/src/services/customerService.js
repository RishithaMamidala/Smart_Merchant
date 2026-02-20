import api from './api.js';

/**
 * Get customer profile with stats
 * @returns {Promise<Object>}
 */
export async function getProfile() {
  const response = await api.get('/customer/profile');
  return response.data.profile;
}

/**
 * Update customer profile
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateProfile(updates) {
  const response = await api.put('/customer/profile', updates);
  return response.data.profile;
}

/**
 * Change password
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export async function changePassword(currentPassword, newPassword) {
  await api.put('/customer/password', { currentPassword, newPassword });
}

/**
 * Get order history
 * @param {Object} params
 * @returns {Promise<{orders: Array, pagination: Object}>}
 */
export async function getOrderHistory(params = {}) {
  const { page = 1, limit = 10, status } = params;
  const queryParams = new URLSearchParams();

  queryParams.append('page', page);
  queryParams.append('limit', limit);
  if (status) queryParams.append('status', status);

  const response = await api.get(`/customer/orders?${queryParams.toString()}`);
  return response.data;
}

/**
 * Get single order
 * @param {string} orderNumber
 * @returns {Promise<Object>}
 */
export async function getOrder(orderNumber) {
  const response = await api.get(`/customer/orders/${orderNumber}`);
  return response.data.order;
}

/**
 * Add new address
 * @param {Object} address
 * @returns {Promise<Object>}
 */
export async function addAddress(address) {
  const response = await api.post('/customer/addresses', address);
  return response.data.profile;
}

/**
 * Update address
 * @param {string} addressId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateAddress(addressId, updates) {
  const response = await api.put(`/customer/addresses/${addressId}`, updates);
  return response.data.profile;
}

/**
 * Delete address
 * @param {string} addressId
 * @returns {Promise<Object>}
 */
export async function deleteAddress(addressId) {
  const response = await api.delete(`/customer/addresses/${addressId}`);
  return response.data.profile;
}

/**
 * Set default address
 * @param {string} addressId
 * @returns {Promise<Object>}
 */
export async function setDefaultAddress(addressId) {
  const response = await api.patch(`/customer/addresses/${addressId}/default`);
  return response.data.profile;
}
