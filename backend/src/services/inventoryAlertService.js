import { Product, Variant, Merchant } from '../models/index.js';
import { sendLowStockAlertNotification } from './notificationService.js';
import logger from '../utils/logger.js';

/**
 * Default low stock threshold
 */
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

/**
 * Check inventory levels for all merchants and send alerts
 * @returns {Promise<{merchantsChecked: number, alertsSent: number}>}
 */
export async function checkAllMerchantInventory() {
  const merchants = await Merchant.find({ isActive: true }).lean();

  let merchantsChecked = 0;
  let alertsSent = 0;

  for (const merchant of merchants) {
    try {
      const result = await checkMerchantInventory(merchant);
      merchantsChecked++;
      if (result.alertSent) alertsSent++;
    } catch (error) {
      logger.error(`Failed to check inventory for merchant ${merchant._id}`, { error: error.message });
    }
  }

  return { merchantsChecked, alertsSent };
}

/**
 * Check inventory for a single merchant
 * @param {Object} merchant - Merchant document
 * @returns {Promise<{alertSent: boolean, lowStockCount: number}>}
 */
export async function checkMerchantInventory(merchant) {
  const threshold = merchant.notificationPreferences?.lowStockThreshold || DEFAULT_LOW_STOCK_THRESHOLD;

  // Skip if low stock alerts are disabled
  if (merchant.notificationPreferences?.lowStockAlerts === false) {
    return { alertSent: false, lowStockCount: 0 };
  }

  const lowStockItems = await getLowStockItems(merchant._id, threshold);

  if (lowStockItems.length === 0) {
    return { alertSent: false, lowStockCount: 0 };
  }

  // Check if we already sent an alert today for these items
  const lastAlertDate = merchant.lastLowStockAlert;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (lastAlertDate && lastAlertDate >= today) {
    // Already sent alert today
    return { alertSent: false, lowStockCount: lowStockItems.length };
  }

  // Send the alert
  await sendLowStockAlertNotification(merchant, lowStockItems);

  // Update last alert date
  await Merchant.findByIdAndUpdate(merchant._id, {
    lastLowStockAlert: new Date(),
  });

  logger.info(`Low stock alert sent to merchant ${merchant._id}`, {
    itemCount: lowStockItems.length,
  });

  return { alertSent: true, lowStockCount: lowStockItems.length };
}

/**
 * Get low stock items for a merchant
 * @param {string} merchantId
 * @param {number} threshold
 * @returns {Promise<Array>}
 */
export async function getLowStockItems(merchantId, threshold = DEFAULT_LOW_STOCK_THRESHOLD) {
  const lowStockItems = [];

  // Get products without variants that are low on stock
  const productsWithoutVariants = await Product.find({
    merchant: merchantId,
    isActive: true,
    hasVariants: false,
    inventory: { $lte: threshold },
  })
    .select('name inventory lowStockThreshold')
    .lean();

  for (const product of productsWithoutVariants) {
    const itemThreshold = product.lowStockThreshold || threshold;
    if (product.inventory <= itemThreshold) {
      lowStockItems.push({
        productId: product._id,
        productName: product.name,
        variantId: null,
        variantName: null,
        quantity: product.inventory,
        lowStockThreshold: itemThreshold,
      });
    }
  }

  // Get variants that are low on stock
  const lowStockVariants = await Variant.find({
    merchant: merchantId,
    isActive: true,
    inventory: { $lte: threshold },
  })
    .populate('product', 'name')
    .lean();

  for (const variant of lowStockVariants) {
    const itemThreshold = variant.lowStockThreshold || threshold;
    if (variant.inventory <= itemThreshold && variant.product) {
      lowStockItems.push({
        productId: variant.product._id,
        productName: variant.product.name,
        variantId: variant._id,
        variantName: variant.name,
        quantity: variant.inventory,
        lowStockThreshold: itemThreshold,
      });
    }
  }

  // Sort by quantity (lowest first)
  lowStockItems.sort((a, b) => a.quantity - b.quantity);

  return lowStockItems;
}

/**
 * Check single product/variant inventory after order
 * Called after inventory is updated to trigger immediate alerts if needed
 * @param {string} merchantId
 * @param {string} productId
 * @param {string} [variantId]
 */
export async function checkItemInventory(merchantId, productId, variantId = null) {
  const merchant = await Merchant.findById(merchantId).lean();
  if (!merchant || merchant.notificationPreferences?.lowStockAlerts === false) {
    return;
  }

  const threshold = merchant.notificationPreferences?.lowStockThreshold || DEFAULT_LOW_STOCK_THRESHOLD;
  let item;

  if (variantId) {
    const variant = await Variant.findById(variantId).populate('product', 'name').lean();
    if (variant && variant.inventory <= (variant.lowStockThreshold || threshold)) {
      item = {
        productId: variant.product._id,
        productName: variant.product.name,
        variantId: variant._id,
        variantName: variant.name,
        quantity: variant.inventory,
        lowStockThreshold: variant.lowStockThreshold || threshold,
      };
    }
  } else {
    const product = await Product.findById(productId).lean();
    if (product && !product.hasVariants && product.inventory <= (product.lowStockThreshold || threshold)) {
      item = {
        productId: product._id,
        productName: product.name,
        variantId: null,
        variantName: null,
        quantity: product.inventory,
        lowStockThreshold: product.lowStockThreshold || threshold,
      };
    }
  }

  if (item) {
    await sendLowStockAlertNotification(merchant, [item]);
    logger.info(`Low stock alert sent for ${item.productName} (qty: ${item.quantity})`, {
      merchantId,
      variantId: item.variantId,
    });
  }
}
