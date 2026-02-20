/**
 * Standard API response helpers
 */

/**
 * Send success response
 * @param {import('express').Response} res
 * @param {any} data
 * @param {number} [statusCode=200]
 */
export function sendSuccess(res, data, statusCode = 200) {
  res.status(statusCode).json(data);
}

/**
 * Send created response
 * @param {import('express').Response} res
 * @param {any} data
 */
export function sendCreated(res, data) {
  sendSuccess(res, data, 201);
}

/**
 * Send error response
 * @param {import('express').Response} res
 * @param {string} error
 * @param {string} message
 * @param {number} [statusCode=400]
 * @param {any} [details]
 */
export function sendError(res, error, message, statusCode = 400, details = null) {
  const response = { error, message };
  if (details) {
    response.details = details;
  }
  res.status(statusCode).json(response);
}

/**
 * Send not found response
 * @param {import('express').Response} res
 * @param {string} [resource='Resource']
 */
export function sendNotFound(res, resource = 'Resource') {
  sendError(res, 'NOT_FOUND', `${resource} not found`, 404);
}

/**
 * Send unauthorized response
 * @param {import('express').Response} res
 * @param {string} [message='Authentication required']
 */
export function sendUnauthorized(res, message = 'Authentication required') {
  sendError(res, 'UNAUTHORIZED', message, 401);
}

/**
 * Send forbidden response
 * @param {import('express').Response} res
 * @param {string} [message='Access denied']
 */
export function sendForbidden(res, message = 'Access denied') {
  sendError(res, 'FORBIDDEN', message, 403);
}

/**
 * Send validation error response
 * @param {import('express').Response} res
 * @param {any[]} errors
 */
export function sendValidationError(res, errors) {
  sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, errors);
}

/**
 * Send conflict response
 * @param {import('express').Response} res
 * @param {string} message
 */
export function sendConflict(res, message) {
  sendError(res, 'CONFLICT', message, 409);
}

/**
 * Send internal server error response
 * @param {import('express').Response} res
 * @param {string} [message='Internal server error']
 */
export function sendServerError(res, message = 'Internal server error') {
  sendError(res, 'INTERNAL_ERROR', message, 500);
}
