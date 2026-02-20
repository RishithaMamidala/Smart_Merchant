import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerCustomer,
  loginCustomer,
  refreshToken,
  logout,
  getCurrentUser,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @route POST /api/auth/customer/register
 * @desc Register a new customer
 * @access Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('First name cannot exceed 100 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Last name cannot exceed 100 characters'),
  ],
  validate,
  registerCustomer
);

/**
 * @route POST /api/auth/customer/login
 * @desc Login a customer
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginCustomer
);

/**
 * @route POST /api/auth/customer/refresh
 * @desc Refresh access token
 * @access Public (requires refresh token cookie)
 */
router.post('/refresh', refreshToken);

/**
 * @route POST /api/auth/customer/logout
 * @desc Logout customer
 * @access Public
 */
router.post('/logout', logout);

/**
 * @route GET /api/auth/customer/me
 * @desc Get current customer
 * @access Private (Customer)
 */
router.get('/me', authenticate, getCurrentUser);

export default router;
