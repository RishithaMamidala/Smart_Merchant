import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';

/**
 * @typedef {Object} PaymentIntentData
 * @property {number} amount - Amount in cents
 * @property {string} currency
 * @property {Object} metadata
 * @property {string} [customerEmail]
 * @property {string} [description]
 */

/**
 * Create a Stripe Payment Intent
 * @param {PaymentIntentData} data
 * @returns {Promise<import('stripe').Stripe.PaymentIntent>}
 */
export async function createPaymentIntent({
  amount,
  currency = 'usd',
  metadata = {},
  customerEmail,
  description,
}) {
  const params = {
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  };

  if (customerEmail) {
    params.receipt_email = customerEmail;
  }

  if (description) {
    params.description = description;
  }

  const paymentIntent = await stripe.paymentIntents.create(params);
  return paymentIntent;
}

/**
 * Cancel a Payment Intent
 * @param {string} paymentIntentId
 * @returns {Promise<import('stripe').Stripe.PaymentIntent>}
 */
export async function cancelPaymentIntent(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
  return paymentIntent;
}

/**
 * Retrieve a Payment Intent
 * @param {string} paymentIntentId
 * @returns {Promise<import('stripe').Stripe.PaymentIntent>}
 */
export async function retrievePaymentIntent(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent;
}

/**
 * Create a refund for a Payment Intent
 * @param {string} paymentIntentId
 * @param {number} [amount] - Amount to refund in cents (optional, full refund if not specified)
 * @returns {Promise<import('stripe').Stripe.Refund>}
 */
export async function createRefund(paymentIntentId, amount) {
  const params = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    params.amount = amount;
  }

  const refund = await stripe.refunds.create(params);
  return refund;
}

/**
 * Verify and construct webhook event
 * @param {Buffer} payload - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {import('stripe').Stripe.Event}
 */
export function constructWebhookEvent(payload, signature) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
}

/**
 * Format amount for display
 * @param {number} amount - Amount in cents
 * @param {string} [currency='USD']
 * @returns {string}
 */
export function formatAmount(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}
