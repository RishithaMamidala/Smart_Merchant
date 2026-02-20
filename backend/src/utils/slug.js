/**
 * Slug generation and validation utilities
 */

/**
 * Generate a slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if necessary
 * @param {string} baseSlug - Base slug to make unique
 * @param {Function} checkExists - Async function that returns true if slug exists
 * @returns {Promise<string>} - Unique slug
 */
export async function generateUniqueSlug(baseSlug, checkExists) {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit to prevent infinite loops
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
}

/**
 * Validate that a string is a valid slug format
 * @param {string} slug - Slug to validate
 * @returns {boolean} - True if valid
 */
export function isValidSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Normalize a slug (ensure lowercase, trim, etc.)
 * @param {string} slug - Slug to normalize
 * @returns {string} - Normalized slug
 */
export function normalizeSlug(slug) {
  return slug.toLowerCase().trim();
}
