import { Router } from 'express';
import merchantAuthRoutes from './auth.merchant.js';
import customerAuthRoutes from './auth.customer.js';
import productsRoutes from './products.storefront.js';
import categoriesRoutes from './categories.js';
import cartRoutes from './cart.js';
import checkoutRoutes from './checkout.js';
import customerOrdersRoutes from './orders.customer.js';
import stripeWebhooksRoutes from './webhooks.stripe.js';
import merchantProductsRoutes from './products.merchant.js';
import merchantCategoriesRoutes from './categories.merchant.js';
import merchantVariantsRoutes from './variants.merchant.js';
import uploadRoutes from './upload.js';
import analyticsRoutes from './analytics.js';
import merchantOrdersRoutes from './orders.merchant.js';
import notificationsRoutes from './notifications.js';
import cronRoutes from './cron.js';
import customerProfileRoutes from './customer.profile.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes with rate limiting
router.use('/auth/merchant', authLimiter, merchantAuthRoutes);
router.use('/auth/customer', authLimiter, customerAuthRoutes);

// Public routes (with optional auth for customer identification)
router.use('/products', optionalAuth, productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/cart', optionalAuth, cartRoutes);
router.use('/checkout', optionalAuth, checkoutRoutes);
router.use('/orders', optionalAuth, customerOrdersRoutes);

// Stripe webhooks (needs raw body for signature verification)
// Note: This route should be mounted before express.json() middleware in app.js
// using express.raw({ type: 'application/json' })
router.use('/webhooks/stripe', stripeWebhooksRoutes);

// Merchant dashboard routes (Phase 4: User Story 2)
router.use('/merchant/products', merchantProductsRoutes);
router.use('/merchant/categories', merchantCategoriesRoutes);
router.use('/merchant/variants', merchantVariantsRoutes);
router.use('/merchant/upload', uploadRoutes);

// Merchant analytics routes (Phase 5: User Story 3)
router.use('/merchant/analytics', analyticsRoutes);

// Merchant order management routes (Phase 6: User Story 4)
router.use('/merchant/orders', merchantOrdersRoutes);

// Merchant notification routes (Phase 7: User Story 5)
router.use('/merchant/notifications', notificationsRoutes);

// Cron job routes (Phase 7: User Story 5)
router.use('/cron', cronRoutes);

// Customer account routes (Phase 8: User Story 6)
router.use('/customer', customerProfileRoutes);

export default router;
