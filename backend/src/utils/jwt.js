import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * @typedef {Object} TokenPayload
 * @property {string} id - User ID
 * @property {string} type - 'merchant' or 'customer'
 * @property {string} email - User email
 */

/**
 * Generate access token
 * @param {TokenPayload} payload - Token payload
 * @returns {string} - JWT access token
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Generate refresh token
 * @param {TokenPayload} payload - Token payload
 * @returns {string} - JWT refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Generate both access and refresh tokens
 * @param {TokenPayload} payload - Token payload
 * @returns {{accessToken: string, refreshToken: string}}
 */
export function generateTokenPair(payload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify access token
 * @param {string} token - JWT token to verify
 * @returns {TokenPayload | null} - Decoded payload or null if invalid
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 * @param {string} token - JWT token to verify
 * @returns {TokenPayload | null} - Decoded payload or null if invalid
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}

/**
 * Parse expiration string to milliseconds
 * @param {string} expiresIn - e.g., '15m', '7d'
 * @returns {number} - Milliseconds
 */
export function parseExpiresIn(expiresIn) {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 0;

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case 's':
      return num * 1000;
    case 'm':
      return num * 60 * 1000;
    case 'h':
      return num * 60 * 60 * 1000;
    case 'd':
      return num * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

/**
 * Get refresh token cookie options
 * @returns {import('express').CookieOptions}
 */
export function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: parseExpiresIn(env.JWT_REFRESH_EXPIRES_IN),
    path: '/',
  };
}
