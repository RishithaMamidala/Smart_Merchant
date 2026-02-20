import { Merchant, Customer } from '../models/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateTokenPair,
  verifyRefreshToken,
  getRefreshTokenCookieOptions,
} from '../utils/jwt.js';
import {
  sendSuccess,
  sendCreated,
  sendUnauthorized,
  sendConflict,
} from '../utils/response.js';
import { mergeGuestCart } from '../services/cartService.js';
import logger from '../utils/logger.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';

/**
 * Register a new merchant
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function registerMerchant(req, res, next) {
  try {
    const { email, password, storeName } = req.body;

    // Check if email already exists
    const existingMerchant = await Merchant.findOne({ email });
    if (existingMerchant) {
      return sendConflict(res, 'Email already registered');
    }

    // Hash password and create merchant
    const passwordHash = await hashPassword(password);
    const merchant = await Merchant.create({
      email,
      passwordHash,
      storeName,
    });

    // Generate tokens
    const payload = { id: merchant._id.toString(), type: 'merchant', email: merchant.email };
    const { accessToken, refreshToken } = generateTokenPair(payload);

    // Set refresh token cookie
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());

    sendCreated(res, {
      merchant: merchant.toJSON(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login a merchant
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function loginMerchant(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find merchant with password
    const merchant = await Merchant.findOne({ email }).select('+passwordHash');
    if (!merchant) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Verify password
    const isValid = await comparePassword(password, merchant.passwordHash);
    if (!isValid) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Generate tokens
    const payload = { id: merchant._id.toString(), type: 'merchant', email: merchant.email };
    const { accessToken, refreshToken } = generateTokenPair(payload);

    // Set refresh token cookie
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());

    sendSuccess(res, {
      merchant: merchant.toJSON(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Register a new customer
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function registerCustomer(req, res, next) {
  try {
    const { email, password, firstName, lastName, sessionId } = req.body;

    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return sendConflict(res, 'Email already registered');
    }

    // Hash password and create customer
    const passwordHash = await hashPassword(password);
    const customer = await Customer.create({
      email,
      passwordHash,
      firstName,
      lastName,
      isGuest: false,
    });

    // Merge guest cart if sessionId provided
    if (sessionId) {
      try {
        await mergeGuestCart(customer._id.toString(), sessionId);
      } catch (err) {
        logger.error('Failed to merge guest cart', { customerId: customer._id, error: err.message });
      }
    }

    // Generate tokens
    const payload = { id: customer._id.toString(), type: 'customer', email: customer.email };
    const { accessToken, refreshToken } = generateTokenPair(payload);

    // Set refresh token cookie
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());

    sendCreated(res, {
      customer: customer.toJSON(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login a customer
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function loginCustomer(req, res, next) {
  try {
    const { email, password, sessionId } = req.body;

    // Find customer with password
    const customer = await Customer.findOne({ email, isGuest: false }).select('+passwordHash');
    if (!customer) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Verify password
    const isValid = await comparePassword(password, customer.passwordHash);
    if (!isValid) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Merge guest cart if sessionId provided
    if (sessionId) {
      try {
        await mergeGuestCart(customer._id.toString(), sessionId);
      } catch (err) {
        logger.error('Failed to merge guest cart', { customerId: customer._id, error: err.message });
      }
    }

    // Generate tokens
    const payload = { id: customer._id.toString(), type: 'customer', email: customer.email };
    const { accessToken, refreshToken } = generateTokenPair(payload);

    // Set refresh token cookie
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenCookieOptions());

    sendSuccess(res, {
      customer: customer.toJSON(),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function refreshToken(req, res, next) {
  try {
    const token = req.cookies[REFRESH_TOKEN_COOKIE];
    if (!token) {
      return sendUnauthorized(res, 'No refresh token provided');
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      return sendUnauthorized(res, 'Invalid or expired refresh token');
    }

    // Verify user still exists
    let user;
    if (payload.type === 'merchant') {
      user = await Merchant.findById(payload.id);
    } else if (payload.type === 'customer') {
      user = await Customer.findById(payload.id);
    }

    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    // Generate new token pair (rotate refresh token for security)
    const newPayload = { id: payload.id, type: payload.type, email: payload.email };
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(newPayload);

    // Set new refresh token cookie
    res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, getRefreshTokenCookieOptions());

    sendSuccess(res, { accessToken });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout - clear refresh token cookie
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function logout(req, res) {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  sendSuccess(res, { message: 'Logged out successfully' });
}

/**
 * Get current authenticated user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function getCurrentUser(req, res) {
  sendSuccess(res, {
    type: req.userType,
    user: req.user.toJSON(),
  });
}
