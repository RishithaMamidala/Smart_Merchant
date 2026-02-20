import api from './api';

/**
 * @typedef {Object} ProductFilters
 * @property {string} [category] - Category slug
 * @property {number} [minPrice] - Minimum price in cents
 * @property {number} [maxPrice] - Maximum price in cents
 * @property {boolean} [inStock] - Only show in-stock items
 * @property {string} [sort] - Sort option (newest, price_asc, price_desc, popular)
 * @property {number} [page] - Page number
 * @property {number} [limit] - Items per page
 */

/**
 * @typedef {Object} Product
 * @property {string} _id
 * @property {string} slug
 * @property {string} name
 * @property {string} description
 * @property {Object} category
 * @property {number} basePrice
 * @property {string[]} images
 * @property {Object[]} variants
 */

/**
 * Get products with optional filters
 * @param {ProductFilters} [filters]
 * @returns {Promise<{products: Product[], pagination: Object}>}
 */
export async function getProducts(filters = {}) {
  const params = new URLSearchParams();

  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.inStock !== undefined) params.append('inStock', filters.inStock.toString());
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `/products?${queryString}` : '/products';

  const response = await api.get(url);
  return response.data;
}

/**
 * Get single product by slug
 * @param {string} slug - Product slug
 * @returns {Promise<Product>}
 */
export async function getProductBySlug(slug) {
  const response = await api.get(`/products/${slug}`);
  return response.data.product;
}

/**
 * Search products
 * @param {string} query - Search query
 * @param {Object} [options]
 * @param {number} [options.page]
 * @param {number} [options.limit]
 * @returns {Promise<{products: Product[], pagination: Object}>}
 */
export async function searchProducts(query, options = {}) {
  const params = new URLSearchParams({ q: query });
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());

  const response = await api.get(`/products/search?${params.toString()}`);
  return response.data;
}

/**
 * Get featured products for homepage
 * @param {number} [limit=8]
 * @returns {Promise<Product[]>}
 */
export async function getFeaturedProducts(limit = 8) {
  const response = await api.get(`/products?featured=true&limit=${limit}`);
  return response.data.products;
}

/**
 * Get related products
 * @param {string} productId
 * @param {number} [limit=4]
 * @returns {Promise<Product[]>}
 */
export async function getRelatedProducts(productId, limit = 4) {
  const response = await api.get(`/products/${productId}/related?limit=${limit}`);
  return response.data.products;
}
