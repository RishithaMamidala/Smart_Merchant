import api from './api.js';

/**
 * Get merchant's categories
 * @param {Object} [params]
 * @param {boolean} [params.includeInactive]
 * @param {string|null} [params.parentId]
 * @returns {Promise<{categories: any[]}>}
 */
export async function getMerchantCategories(params = {}) {
  const response = await api.get('/merchant/categories', { params });
  return response.data;
}

/**
 * Get a single category by ID
 * @param {string} categoryId
 * @returns {Promise<any>}
 */
export async function getMerchantCategory(categoryId) {
  const response = await api.get(`/merchant/categories/${categoryId}`);
  return response.data;
}

/**
 * Create a new category
 * @param {any} categoryData
 * @returns {Promise<any>}
 */
export async function createCategory(categoryData) {
  const response = await api.post('/merchant/categories', categoryData);
  return response.data;
}

/**
 * Update an existing category
 * @param {string} categoryId
 * @param {any} categoryData
 * @returns {Promise<any>}
 */
export async function updateCategory(categoryId, categoryData) {
  const response = await api.put(`/merchant/categories/${categoryId}`, categoryData);
  return response.data;
}

/**
 * Delete a category
 * @param {string} categoryId
 * @returns {Promise<{message: string, productsUpdated: number}>}
 */
export async function deleteCategory(categoryId) {
  const response = await api.delete(`/merchant/categories/${categoryId}`);
  return response.data;
}

/**
 * Reorder categories
 * @param {Array<{id: string, sortOrder: number}>} categories
 * @returns {Promise<{message: string}>}
 */
export async function reorderCategories(categories) {
  const response = await api.post('/merchant/categories/reorder', { categories });
  return response.data;
}
