import { Router } from 'express';
import { constructWebhookEvent } from '../services/stripeService.js';
import { createOrderFromPayment, handleFailedPayment } from '../services/orderService.js';
import { Order } from '../models/index.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @route POST /api/webhooks/stripe
 * @desc Handle Stripe webhook events
 * @access Public (secured with webhook signature)
 */
router.post('/', async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    logger.warn('Stripe webhook: Missing signature');
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event;

  try {
    // Verify webhook signature - req.body is raw buffer due to express.raw() middleware
    event = constructWebhookEvent(req.body, signature);
  } catch (err) {
    logger.error(`Stripe webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        logger.info(`Payment succeeded: ${paymentIntent.id}`);

        try {
          // Idempotency check: skip if order already exists for this payment
          const existingOrder = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
          if (existingOrder) {
            logger.info(`Order already exists for payment ${paymentIntent.id}: ${existingOrder.orderNumber}`);
            break;
          }

          const order = await createOrderFromPayment(paymentIntent.id);
          logger.info(`Order created from payment: ${order.orderNumber}`);
        } catch (error) {
          logger.error(`Failed to create order from payment ${paymentIntent.id}:`, {
            error: error.message,
            stack: error.stack,
            paymentIntentId: paymentIntent.id,
          });
          // Don't return error to Stripe - we've already received the payment
          // This should be handled by a retry mechanism or manual intervention
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        logger.warn(`Payment failed: ${paymentIntent.id}`);

        try {
          await handleFailedPayment(paymentIntent.id);
        } catch (error) {
          logger.error(`Failed to handle failed payment: ${error.message}`);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        logger.info(`Payment canceled: ${paymentIntent.id}`);

        try {
          await handleFailedPayment(paymentIntent.id);
        } catch (error) {
          logger.error(`Failed to handle canceled payment: ${error.message}`);
        }
        break;
      }

      default:
        logger.debug(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    logger.error(`Webhook handler error: ${error.message}`);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
