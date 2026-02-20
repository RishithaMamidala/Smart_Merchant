/**
 * Format price from cents to display string
 * @param {number} cents - Price in cents
 * @param {string} [currency='USD']
 * @returns {string}
 */
export function formatPrice(cents, currency = 'USD') {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(dollars);
}

/**
 * Format date to locale string
 * @param {string|Date} date
 * @param {Object} [options]
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format date with time
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  return formatDate(date, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
