import { verifyAccessToken } from '../utils/jwt.js';
import { sendUnauthorized, sendForbidden } from '../utils/response.js';
import { Merchant, Customer } from '../models/index.js';

/**
 * Extract bearer token from Authorization header
 * @param {import('express').Request} req
 * @returns {string | null}
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Authenticate any user (merchant or customer)
 * Attaches user to req.user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return sendUnauthorized(res, 'No token provided');
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return sendUnauthorized(res, 'Invalid or expired token');
    }

    // Fetch user based on type
    let user;
    if (payload.type === 'merchant') {
      user = await Merchant.findById(payload.id);
    } else if (payload.type === 'customer') {
      user = await Customer.findById(payload.id);
    }

    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    req.user = user;
    req.userType = payload.type;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require merchant authentication
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function requireMerchant(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return sendUnauthorized(res, 'No token provided');
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return sendUnauthorized(res, 'Invalid or expired token');
    }

    if (payload.type !== 'merchant') {
      return sendForbidden(res, 'Merchant access required');
    }

    const merchant = await Merchant.findById(payload.id);
    if (!merchant) {
      return sendUnauthorized(res, 'Merchant not found');
    }

    req.user = merchant;
    req.merchant = merchant;
    req.userType = 'merchant';
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require customer authentication
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function requireCustomer(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return sendUnauthorized(res, 'No token provided');
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return sendUnauthorized(res, 'Invalid or expired token');
    }

    if (payload.type !== 'customer') {
      return sendForbidden(res, 'Customer access required');
    }

    const customer = await Customer.findById(payload.id);
    if (!customer) {
      return sendUnauthorized(res, 'Customer not found');
    }

    req.user = customer;
    req.customer = customer;
    req.userType = 'customer';
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication - attaches user if token is valid but doesn't require it
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return next();
    }

    let user;
    if (payload.type === 'merchant') {
      user = await Merchant.findById(payload.id);
    } else if (payload.type === 'customer') {
      user = await Customer.findById(payload.id);
    }

    if (user) {
      req.user = user;
      req.userType = payload.type;
    }

    next();
  } catch {
    // Ignore errors in optional auth
    next();
  }
}
