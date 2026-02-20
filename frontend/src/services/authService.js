import api from './api.js';

/**
 * @typedef {Object} MerchantRegisterData
 * @property {string} email
 * @property {string} password
 * @property {string} storeName
 */

/**
 * @typedef {Object} CustomerRegisterData
 * @property {string} email
 * @property {string} password
 * @property {string} [firstName]
 * @property {string} [lastName]
 */

/**
 * @typedef {Object} LoginData
 * @property {string} email
 * @property {string} password
 */

/**
 * Register a new merchant
 * @param {MerchantRegisterData} data
 * @returns {Promise<{merchant: Object, accessToken: string}>}
 */
export async function registerMerchant(data) {
  const response = await api.post('/auth/merchant/register', data);
  return response.data;
}

/**
 * Login a merchant
 * @param {LoginData} data
 * @returns {Promise<{merchant: Object, accessToken: string}>}
 */
export async function loginMerchant(data) {
  const response = await api.post('/auth/merchant/login', data);
  return response.data;
}

/**
 * Register a new customer
 * @param {string} email
 * @param {string} password
 * @param {string} [firstName]
 * @param {string} [lastName]
 * @param {string} [sessionId] - Cart session ID for merging
 * @returns {Promise<{customer: Object, accessToken: string}>}
 */
export async function registerCustomer(email, password, firstName, lastName, sessionId) {
  const response = await api.post('/auth/customer/register', {
    email,
    password,
    firstName,
    lastName,
    sessionId,
  });
  return response.data;
}

/**
 * Login a customer
 * @param {string} email
 * @param {string} password
 * @param {string} [sessionId] - Cart session ID for merging
 * @returns {Promise<{customer: Object, accessToken: string}>}
 */
export async function loginCustomer(email, password, sessionId) {
  const response = await api.post('/auth/customer/login', {
    email,
    password,
    sessionId,
  });
  return response.data;
}

/**
 * Refresh access token
 * @param {'merchant' | 'customer'} userType
 * @returns {Promise<{accessToken: string}>}
 */
export async function refreshToken(userType) {
  const response = await api.post(`/auth/${userType}/refresh`);
  return response.data;
}

/**
 * Logout
 * @param {'merchant' | 'customer'} [userType]
 */
export async function logout(userType = 'customer') {
  try {
    await api.post(`/auth/${userType}/logout`);
  } catch {
    // Ignore errors on logout
  }
}

/**
 * Get current user
 * @returns {Promise<{type: string, user: Object}>}
 */
export async function getCurrentUser() {
  const response = await api.get('/auth/merchant/me');
  return response.data;
}
