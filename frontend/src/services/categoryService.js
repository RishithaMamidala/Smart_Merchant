import api from './api';

/**
 * @typedef {Object} Category
 * @property {string} _id
 * @property {string} slug
 * @property {string} name
 * @property {string} [description]
 * @property {string} [image]
 * @property {number} productCount
 */

/**
 * Get all categories
 * @returns {Promise<Category[]>}
 */
export async function getCategories() {
  const response = await api.get('/categories');
  return response.data.categories;
}

/**
 * Get single category by slug
 * @param {string} slug
 * @returns {Promise<Category>}
 */
export async function getCategoryBySlug(slug) {
  // Get all categories and find by slug
  const categories = await getCategories();
  return categories.find((cat) => cat.slug === slug);
}
