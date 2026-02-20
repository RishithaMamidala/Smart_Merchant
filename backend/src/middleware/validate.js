import { validationResult } from 'express-validator';
import { sendValidationError } from '../utils/response.js';

/**
 * Validation middleware - checks express-validator results
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return sendValidationError(res, formattedErrors);
  }

  next();
}

/**
 * Custom validator for MongoDB ObjectId
 * @param {string} value
 * @returns {boolean}
 */
export function isValidObjectId(value) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * Custom validator for slug format
 * @param {string} value
 * @returns {boolean}
 */
export function isValidSlug(value) {
  return /^[a-z0-9-]+$/.test(value);
}

/**
 * Custom validator for SKU format
 * @param {string} value
 * @returns {boolean}
 */
export function isValidSku(value) {
  return /^[A-Z0-9-]+$/.test(value);
}
