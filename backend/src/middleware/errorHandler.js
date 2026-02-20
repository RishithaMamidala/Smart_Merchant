import { logger } from '../utils/logger.js';
import { isDevelopment } from '../config/env.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  /**
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(code, message, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Not found middleware - should be registered after all routes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

/**
 * Global error handler middleware
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, req, res, _next) {
  // Log the error
  logger.error('Error:', err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Handle known API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors,
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: 'DUPLICATE_ERROR',
      message: `${field} already exists`,
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'INVALID_ID',
      message: 'Invalid ID format',
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'TOKEN_EXPIRED',
      message: 'Token has expired',
    });
  }

  // Default to 500 internal server error
  const response = {
    error: 'INTERNAL_ERROR',
    message: 'Internal server error',
  };

  // Include stack trace in development
  if (isDevelopment()) {
    response.stack = err.stack;
  }

  res.status(500).json(response);
}
