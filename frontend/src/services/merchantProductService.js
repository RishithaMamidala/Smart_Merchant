import api from './api.js';

/**
 * @typedef {Object} ProductListParams
 * @property {number} [page]
 * @property {number} [limit]
 * @property {string} [status]
 * @property {string} [category]
 * @property {string} [search]
 * @property {string} [sort]
 */

/**
 * Get merchant's products with pagination
 * @param {ProductListParams} params
 * @returns {Promise<{products: any[], pagination: any}>}
 */
export async function getMerchantProducts(params = {}) {
  const response = await api.get('/merchant/products', { params });
  return response.data;
}

/**
 * Get a single product by ID
 * @param {string} productId
 * @returns {Promise<any>}
 */
export async function getMerchantProduct(productId) {
  const response = await api.get(`/merchant/products/${productId}`);
  return response.data;
}

/**
 * Create a new product
 * @param {any} productData
 * @returns {Promise<any>}
 */
export async function createProduct(productData) {
  const response = await api.post('/merchant/products', productData);
  return response.data;
}

/**
 * Update an existing product
 * @param {string} productId
 * @param {any} productData
 * @returns {Promise<any>}
 */
export async function updateProduct(productId, productData) {
  const response = await api.put(`/merchant/products/${productId}`, productData);
  return response.data;
}

/**
 * Archive a product
 * @param {string} productId
 * @returns {Promise<any>}
 */
export async function archiveProduct(productId) {
  const response = await api.post(`/merchant/products/${productId}/archive`);
  return response.data;
}

/**
 * Restore an archived product
 * @param {string} productId
 * @returns {Promise<any>}
 */
export async function restoreProduct(productId) {
  const response = await api.post(`/merchant/products/${productId}/restore`);
  return response.data;
}

/**
 * Get variants for a product
 * @param {string} productId
 * @returns {Promise<{variants: any[]}>}
 */
export async function getProductVariants(productId) {
  const response = await api.get(`/merchant/variants/products/${productId}/variants`);
  return response.data;
}

/**
 * Update a single variant
 * @param {string} variantId
 * @param {any} variantData
 * @returns {Promise<any>}
 */
export async function updateVariant(variantId, variantData) {
  const response = await api.put(`/merchant/variants/${variantId}`, variantData);
  return response.data;
}

/**
 * Adjust variant inventory
 * @param {string} variantId
 * @param {number} adjustment
 * @param {string} [reason]
 * @returns {Promise<any>}
 */
export async function adjustInventory(variantId, adjustment, reason) {
  const response = await api.post(`/merchant/variants/${variantId}/inventory`, {
    adjustment,
    reason,
  });
  return response.data;
}

/**
 * Bulk update variants
 * @param {string} productId
 * @param {any[]} variants
 * @returns {Promise<{variants: any[]}>}
 */
export async function bulkUpdateVariants(productId, variants) {
  const response = await api.put(`/merchant/variants/products/${productId}/variants/bulk`, {
    variants,
  });
  return response.data;
}

/**
 * Create new variants for an existing product
 * @param {string} productId
 * @param {any[]} variants
 * @returns {Promise<{variants: any[]}>}
 */
export async function createVariantsForProduct(productId, variants) {
  const response = await api.post(`/merchant/variants/products/${productId}/variants`, {
    variants,
  });
  return response.data;
}

/**
 * Upload a single image
 * @param {File} file
 * @returns {Promise<{url: string, publicId: string, width: number, height: number}>}
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/merchant/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Upload multiple images
 * @param {File[]} files
 * @returns {Promise<{images: any[]}>}
 */
export async function uploadImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const response = await api.post('/merchant/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Delete an image
 * @param {string} publicId
 * @returns {Promise<void>}
 */
export async function deleteImage(publicId) {
  await api.delete(`/merchant/upload/image/${encodeURIComponent(publicId)}`);
}

/**
 * Get upload signature for direct browser uploads
 * @returns {Promise<{signature: string, timestamp: number, apiKey: string, cloudName: string, folder: string}>}
 */
export async function getUploadSignature() {
  const response = await api.get('/merchant/upload/signature');
  return response.data;
}
