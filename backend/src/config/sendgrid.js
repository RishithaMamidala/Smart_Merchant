import sgMail from '@sendgrid/mail';
import { env } from './env.js';

// Configure SendGrid API key
if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

/**
 * Default sender information
 */
export const defaultSender = {
  email: env.SENDGRID_FROM_EMAIL,
  name: env.SENDGRID_FROM_NAME,
};

/**
 * Check if SendGrid is configured
 * @returns {boolean}
 */
export function isSendGridConfigured() {
  return Boolean(env.SENDGRID_API_KEY);
}

export default sgMail;
