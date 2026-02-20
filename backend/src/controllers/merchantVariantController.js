import {
  getProductVariants as getProductVariantsService,
  updateVariant as updateVariantService,
  adjustInventory as adjustInventoryService,
  bulkUpdateVariants as bulkUpdateVariantsService,
  addVariantsToProduct as addVariantsToProductService,
} from '../services/variantService.js';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendConflict,
  sendError,
} from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/merchant/products/:productId/variants
 * Get all variants for a product
 */
export async function getProductVariants(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { productId } = req.params;

    const variants = await getProductVariantsService(productId, merchantId);

    if (variants === null) {
      return sendNotFound(res, 'Product');
    }

    sendSuccess(res, { variants });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/merchant/variants/:id
 * Update a single variant
 */
export async function updateVariant(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { id } = req.params;
    const updateData = req.body;

    const variant = await updateVariantService(id, merchantId, updateData);

    if (!variant) {
      return sendNotFound(res, 'Variant');
    }

    logger.info('Variant updated', { variantId: id, merchantId });

    sendSuccess(res, variant);
  } catch (error) {
    if (error.message === 'SKU already exists') {
      return sendConflict(res, 'A variant with this SKU already exists');
    }
    next(error);
  }
}

/**
 * POST /api/merchant/variants/:id/inventory
 * Adjust variant inventory
 */
export async function adjustInventory(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { id } = req.params;
    const { adjustment, reason } = req.body;

    const result = await adjustInventoryService(id, merchantId, adjustment, reason);

    if (!result) {
      return sendNotFound(res, 'Variant');
    }

    logger.info('Inventory adjusted', {
      variantId: id,
      merchantId,
      adjustment,
      reason,
    });

    sendSuccess(res, result);
  } catch (error) {
    if (error.message === 'Inventory cannot go below zero') {
      return sendError(
        res,
        'INVALID_OPERATION',
        'Inventory adjustment would result in negative inventory'
      );
    }
    next(error);
  }
}

/**
 * PUT /api/merchant/products/:productId/variants/bulk
 * Bulk update variants for a product
 */
export async function bulkUpdateVariants(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { productId } = req.params;
    const { variants } = req.body;

    const result = await bulkUpdateVariantsService(productId, merchantId, variants);

    if (result === null) {
      return sendNotFound(res, 'Product');
    }

    logger.info('Variants bulk updated', {
      productId,
      merchantId,
      count: variants.length,
    });

    sendSuccess(res, { variants: result });
  } catch (error) {
    if (error.message.includes('not found')) {
      return sendNotFound(res, 'Variant');
    }
    if (error.message.includes('already exists')) {
      return sendConflict(res, error.message);
    }
    next(error);
  }
}

/**
 * POST /api/merchant/products/:productId/variants
 * Add new variants to an existing product
 */
export async function addVariants(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { productId } = req.params;
    const { variants } = req.body;

    const result = await addVariantsToProductService(productId, merchantId, variants);

    if (result === null) {
      return sendNotFound(res, 'Product');
    }

    logger.info('Variants added to product', {
      productId,
      merchantId,
      count: variants.length,
    });

    sendCreated(res, { variants: result });
  } catch (error) {
    if (error.code === 11000) {
      return sendConflict(res, 'A variant with this SKU already exists');
    }
    next(error);
  }
}
