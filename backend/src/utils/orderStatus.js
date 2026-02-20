/**
 * Order status transition utilities
 */

/**
 * Valid order status values
 */
export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

/**
 * Valid payment status values
 */
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

/**
 * Allowed status transitions
 * Key: current status, Value: array of allowed next statuses
 */
const STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Check if a status transition is valid
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {boolean}
 */
export function isValidTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true;
  const allowed = STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

/**
 * Get allowed next statuses for a given status
 * @param {string} currentStatus
 * @returns {string[]}
 */
export function getAllowedNextStatuses(currentStatus) {
  return STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if status is a terminal state (no further transitions allowed)
 * @param {string} status
 * @returns {boolean}
 */
export function isTerminalStatus(status) {
  const allowed = STATUS_TRANSITIONS[status] || [];
  return allowed.length === 0;
}

/**
 * Get human-readable status label
 * @param {string} status
 * @returns {string}
 */
export function getStatusLabel(status) {
  const labels = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

/**
 * Get status badge color class
 * @param {string} status
 * @returns {string}
 */
export function getStatusColor(status) {
  const colors = {
    pending: 'yellow',
    processing: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
  };
  return colors[status] || 'gray';
}

/**
 * Validate status transition and return error message if invalid
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {{valid: boolean, error?: string}}
 */
export function validateStatusTransition(currentStatus, newStatus) {
  if (!ORDER_STATUSES.includes(newStatus)) {
    return { valid: false, error: `Invalid status: ${newStatus}` };
  }

  if (currentStatus === newStatus) {
    return { valid: true };
  }

  if (isTerminalStatus(currentStatus)) {
    return {
      valid: false,
      error: `Cannot change status of ${getStatusLabel(currentStatus).toLowerCase()} order`,
    };
  }

  if (!isValidTransition(currentStatus, newStatus)) {
    const allowed = getAllowedNextStatuses(currentStatus);
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(', ')}`,
    };
  }

  return { valid: true };
}
