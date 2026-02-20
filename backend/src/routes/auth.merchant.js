import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerMerchant,
  loginMerchant,
  refreshToken,
  logout,
  getCurrentUser,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @route POST /api/auth/merchant/register
 * @desc Register a new merchant
 * @access Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('storeName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Store name must be 2-100 characters'),
  ],
  validate,
  registerMerchant
);

/**
 * @route POST /api/auth/merchant/login
 * @desc Login a merchant
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginMerchant
);

/**
 * @route POST /api/auth/merchant/refresh
 * @desc Refresh access token
 * @access Public (requires refresh token cookie)
 */
router.post('/refresh', refreshToken);

/**
 * @route POST /api/auth/merchant/logout
 * @desc Logout merchant
 * @access Public
 */
router.post('/logout', logout);

/**
 * @route GET /api/auth/merchant/me
 * @desc Get current merchant
 * @access Private (Merchant)
 */
router.get('/me', authenticate, getCurrentUser);

export default router;
