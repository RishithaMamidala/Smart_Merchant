import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * @typedef {Object} Environment
 * @property {string} NODE_ENV
 * @property {number} PORT
 * @property {string} MONGODB_URI
 * @property {string} JWT_SECRET
 * @property {string} JWT_REFRESH_SECRET
 * @property {string} JWT_EXPIRES_IN
 * @property {string} JWT_REFRESH_EXPIRES_IN
 * @property {string} STRIPE_SECRET_KEY
 * @property {string} STRIPE_WEBHOOK_SECRET
 * @property {string} SENDGRID_API_KEY
 * @property {string} SENDGRID_FROM_EMAIL
 * @property {string} SENDGRID_FROM_NAME
 * @property {string} CLOUDINARY_CLOUD_NAME
 * @property {string} CLOUDINARY_API_KEY
 * @property {string} CLOUDINARY_API_SECRET
 * @property {string} CRON_SECRET
 * @property {string} ENABLE_CRON_IN_DEV
 * @property {string} FRONTEND_URL
 */

/**
 * Validates required environment variables
 * @param {string[]} required - List of required env var names
 */
function validateEnv(required) {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  validateEnv([
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL',
    'CRON_SECRET',
    'FRONTEND_URL',
  ]);
}

/** @type {Environment} */
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmerchant',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
  SENDGRID_FROM_NAME: process.env.SENDGRID_FROM_NAME || 'Smart Merchant',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  CRON_SECRET: process.env.CRON_SECRET || 'dev-cron-secret',
  ENABLE_CRON_IN_DEV: process.env.ENABLE_CRON_IN_DEV || 'false',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

/**
 * Check if environment is production
 * @returns {boolean}
 */
export function isProduction() {
  return env.NODE_ENV === 'production';
}

/**
 * Check if environment is development
 * @returns {boolean}
 */
export function isDevelopment() {
  return env.NODE_ENV === 'development';
}
