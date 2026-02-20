import Stripe from 'stripe';
import { env } from './env.js';

/**
 * Stripe client instance
 * @type {Stripe}
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Stripe webhook secret for verifying webhook signatures
 * @type {string}
 */
export const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

/**
 * Verify Stripe webhook signature
 * @param {Buffer} payload - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {Stripe.Event} - Verified event
 */
export function verifyWebhookSignature(payload, signature) {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export default stripe;
