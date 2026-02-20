import crypto from 'crypto';
import mongoose from 'mongoose';
import { Variant } from '../models/index.js';
import { validateCartItems } from './cartService.js';
import { getVariantWithProduct } from './productService.js';
import { createPaymentIntent, cancelPaymentIntent } from './stripeService.js';
import { checkItemInventory } from './inventoryAlertService.js';
import { logger } from '../utils/logger.js';

// Store checkout sessions in memory (in production, use Redis)
const checkoutSessions = new Map();

/**
 * @typedef {Object} CheckoutSessionData
 * @property {string} id
 * @property {string} paymentIntentId
 * @property {string} clientSecret
 * @property {any[]} items
 * @property {Object} shippingAddress
 * @property {string} customerEmail
 * @property {string} customerName
 * @property {string} [customerId]
 * @property {number} subtotal
 * @property {number} shippingCost
 * @property {number} taxAmount
 * @property {number} total
 * @property {string} [merchantId]
 * @property {Date} createdAt
 * @property {Date} expiresAt
 */

/**
 * Calculate shipping cost (flat rate for now)
 * @param {number} subtotal
 * @returns {number}
 */
function calculateShippingCost(subtotal) {
  // Free shipping over $100
  if (subtotal >= 10000) {
    return 0;
  }
  // Flat rate $5.00
  return 500;
}

/**
 * Calculate tax (simplified - 8% flat rate)
 * @param {number} subtotal
 * @returns {number}
 */
function calculateTax(subtotal) {
  return Math.round(subtotal * 0.08);
}

/**
 * Start checkout process
 * @param {Object} options
 * @param {string} [options.customerId]
 * @param {string} [options.sessionId]
 * @param {Object} options.shippingAddress
 * @param {string} options.customerEmail
 * @param {string} options.customerName
 * @returns {Promise<CheckoutSessionData>}
 */
export async function startCheckout({
  customerId,
  sessionId,
  shippingAddress,
  customerEmail,
  customerName,
}) {
  // Validate cart
  const { valid, issues, cart } = await validateCartItems({ customerId, sessionId });

  if (!valid) {
    const error = new Error(issues[0]?.message || 'Cart validation failed');
    error.code = issues[0]?.type || 'CART_INVALID';
    error.statusCode = 400;
    error.issues = issues;
    throw error;
  }

  if (cart.items.length === 0) {
    const error = new Error('Cannot checkout with empty cart');
    error.code = 'CART_EMPTY';
    error.statusCode = 400;
    throw error;
  }

  // Reserve inventory using atomic operations in a transaction
  const session = await mongoose.startSession();
  const reservedVariants = [];

  try {
    await session.withTransaction(async () => {
      for (const item of cart.items) {
        // Atomic check-and-reserve: only succeeds if enough inventory available
        // This prevents race conditions when multiple users checkout simultaneously
        const variant = await Variant.findOneAndUpdate(
          {
            _id: item.variantId,
            isActive: true,
            $expr: {
              $gte: [
                { $subtract: ['$inventory', '$reservedInventory'] },
                item.quantity,
              ],
            },
          },
          {
            $inc: { reservedInventory: item.quantity },
          },
          {
            new: true,
            session,
          }
        );

        if (!variant) {
          // Determine if variant doesn't exist or just insufficient inventory
          const existingVariant = await Variant.findById(item.variantId).session(session);

          if (!existingVariant || !existingVariant.isActive) {
            const err = new Error('Some items in your cart are no longer available. Please remove them and try again.');
            err.code = 'CART_INVALID';
            err.issues = [{ variantId: item.variantId, type: 'PRODUCT_UNAVAILABLE' }];
            throw err;
          }

          // Calculate what's actually available for better error message
          const available = existingVariant.inventory - existingVariant.reservedInventory;
          const error = new Error(
            available > 0
              ? `Only ${available} item(s) available for ${existingVariant.sku}. Someone just purchased some!`
              : `${existingVariant.sku} is now out of stock. Someone just bought the last one!`
          );
          error.code = 'INSUFFICIENT_INVENTORY';
          error.details = {
            variantId: item.variantId,
            sku: existingVariant.sku,
            requested: item.quantity,
            available,
          };
          throw error;
        }

        reservedVariants.push({ variantId: variant._id, quantity: item.quantity });
      }
    });
  } finally {
    await session.endSession();
  }

  // Prepare checkout items with current prices
  const checkoutItems = [];
  let merchantId = null;

  for (const item of cart.items) {
    const variantData = await getVariantWithProduct(item.variantId);
    if (variantData) {
      merchantId = merchantId || variantData.product.merchantId;
      checkoutItems.push({
        variantId: item.variantId,
        productId: item.productId,
        name: variantData.variant.optionValues.length > 0
          ? `${variantData.product.name} (${variantData.variant.optionValues.map((v) => v.value).join(' / ')})`
          : variantData.product.name,
        sku: variantData.variant.sku,
        quantity: item.quantity,
        unitPrice: variantData.variant.price,
        totalPrice: variantData.variant.price * item.quantity,
      });
    }
  }

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const shippingCost = calculateShippingCost(subtotal);
  const taxAmount = calculateTax(subtotal);
  const total = subtotal + shippingCost + taxAmount;

  // Create Stripe Payment Intent
  const paymentIntent = await createPaymentIntent({
    amount: total,
    currency: 'usd',
    metadata: {
      customerId: customerId || '',
      sessionId: sessionId || '',
      merchantId: merchantId?.toString() || '',
    },
    customerEmail,
    description: `Order for ${customerName}`,
  });

  // Create checkout session
  const checkoutSessionId = `cs_${crypto.randomUUID()}`;
  const checkoutSession = {
    id: checkoutSessionId,
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    items: checkoutItems,
    shippingAddress,
    customerEmail,
    customerName,
    customerId,
    sessionId,
    merchantId,
    subtotal,
    shippingCost,
    taxAmount,
    total,
    reservedVariants,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
  };

  // Store checkout session
  checkoutSessions.set(checkoutSessionId, checkoutSession);
  checkoutSessions.set(paymentIntent.id, checkoutSession); // Also index by payment intent

  logger.info(`Checkout session created: ${checkoutSessionId}`);

  return {
    checkoutSession: {
      id: checkoutSessionId,
      clientSecret: paymentIntent.client_secret,
      amount: total,
      currency: 'usd',
      items: checkoutItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal,
      shippingCost,
      taxAmount,
      total,
    },
  };
}

/**
 * Cancel checkout and release reserved inventory
 * @param {string} checkoutSessionId
 * @returns {Promise<void>}
 */
export async function cancelCheckout(checkoutSessionId) {
  const checkoutSession = checkoutSessions.get(checkoutSessionId);
  if (!checkoutSession) {
    logger.warn(`Checkout session not found: ${checkoutSessionId}`);
    return;
  }

  // Release reserved inventory
  await releaseReservedInventory(checkoutSession.reservedVariants);

  // Cancel Stripe Payment Intent
  try {
    await cancelPaymentIntent(checkoutSession.paymentIntentId);
  } catch (error) {
    logger.error(`Failed to cancel payment intent: ${error.message}`);
  }

  // Remove checkout session
  checkoutSessions.delete(checkoutSessionId);
  checkoutSessions.delete(checkoutSession.paymentIntentId);

  logger.info(`Checkout session cancelled: ${checkoutSessionId}`);
}

/**
 * Get checkout session by payment intent ID
 * @param {string} paymentIntentId
 * @returns {CheckoutSessionData|null}
 */
export function getCheckoutSessionByPaymentIntent(paymentIntentId) {
  return checkoutSessions.get(paymentIntentId) || null;
}

/**
 * Remove checkout session after successful order
 * @param {string} paymentIntentId
 */
export function removeCheckoutSession(paymentIntentId) {
  const session = checkoutSessions.get(paymentIntentId);
  if (session) {
    checkoutSessions.delete(session.id);
    checkoutSessions.delete(paymentIntentId);
  }
}

/**
 * Release reserved inventory
 * @param {Array<{variantId: string, quantity: number}>} reservedVariants
 */
export async function releaseReservedInventory(reservedVariants) {
  for (const { variantId, quantity } of reservedVariants) {
    await Variant.findByIdAndUpdate(variantId, {
      $inc: { reservedInventory: -quantity },
    });
  }
}

/**
 * Deduct inventory after successful payment
 * @param {Array<{variantId: string, quantity: number}>} items
 */
export async function deductInventory(items) {
  for (const { variantId, quantity } of items) {
    await Variant.findByIdAndUpdate(variantId, {
      $inc: {
        inventory: -quantity,
        reservedInventory: -quantity,
      },
    });

    // Check for low stock after deduction and send alert if needed
    try {
      const variant = await Variant.findById(variantId).select('product merchant').lean();
      if (variant) {
        await checkItemInventory(variant.merchant.toString(), variant.product.toString(), variantId);
      }
    } catch (error) {
      logger.warn('Failed to check inventory after deduction', { variantId, error: error.message });
    }
  }
}

/**
 * Clean up expired checkout sessions (call periodically)
 */
export async function cleanupExpiredSessions() {
  const now = new Date();
  for (const [, session] of checkoutSessions.entries()) {
    if (session.expiresAt < now) {
      await cancelCheckout(session.id);
    }
  }
}
