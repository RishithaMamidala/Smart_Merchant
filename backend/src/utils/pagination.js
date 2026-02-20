/**
 * @typedef {Object} PaginationParams
 * @property {number} page - Current page number (1-indexed)
 * @property {number} limit - Items per page
 * @property {number} skip - Number of items to skip
 */

/**
 * @typedef {Object} PaginationResult
 * @property {number} page - Current page
 * @property {number} limit - Items per page
 * @property {number} total - Total items count
 * @property {number} totalPages - Total number of pages
 * @property {boolean} hasNextPage - Whether there's a next page
 * @property {boolean} hasPrevPage - Whether there's a previous page
 */

/**
 * Parse pagination parameters from query
 * @param {Object} query - Express query object
 * @param {Object} [options]
 * @param {number} [options.defaultLimit=20]
 * @param {number} [options.maxLimit=100]
 * @returns {PaginationParams}
 */
export function parsePagination(query, options = {}) {
  const { defaultLimit = 20, maxLimit = 100 } = options;

  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  // Validate and set defaults
  page = isNaN(page) || page < 1 ? 1 : page;
  limit = isNaN(limit) || limit < 1 ? defaultLimit : Math.min(limit, maxLimit);

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create pagination result object
 * @param {number} total - Total count of items
 * @param {PaginationParams} params - Pagination parameters used
 * @returns {PaginationResult}
 */
export function createPaginationResult(total, { page, limit }) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Paginate a Mongoose query
 * @param {import('mongoose').Query} query - Mongoose query
 * @param {PaginationParams} params - Pagination parameters
 * @returns {import('mongoose').Query}
 */
export function paginateQuery(query, { skip, limit }) {
  return query.skip(skip).limit(limit);
}
