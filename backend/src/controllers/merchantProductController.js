import {
  getMerchantProducts as getMerchantProductsService,
  getMerchantProductById,
  createMerchantProduct,
  updateMerchantProduct,
  archiveMerchantProduct,
  restoreMerchantProduct,
} from '../services/productService.js';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendConflict,
} from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/merchant/products
 * List merchant's products
 */
export async function getMerchantProducts(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { page, limit, status, category, search, sort } = req.query;

    const result = await getMerchantProductsService(merchantId, {
      page,
      limit,
      status,
      category,
      search,
      sort,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/merchant/products/:id
 * Get single product details
 */
export async function getMerchantProduct(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { id } = req.params;

    const product = await getMerchantProductById(id, merchantId);

    if (!product) {
      return sendNotFound(res, 'Product');
    }

    sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/merchant/products
 * Create a new product
 */
export async function createProduct(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const productData = req.body;

    const product = await createMerchantProduct(merchantId, productData);

    logger.info('Product created', { productId: product.id, merchantId });

    sendCreated(res, product);
  } catch (error) {
    if (error.message === 'Category not found') {
      return sendNotFound(res, 'Category');
    }
    if (error.message === 'Slug already exists') {
      return sendConflict(res, 'A product with this slug already exists');
    }
    if (error.code === 11000) {
      // Duplicate key error
      if (error.keyPattern?.slug) {
        return sendConflict(res, 'A product with this slug already exists');
      }
      if (error.keyPattern?.sku) {
        return sendConflict(res, 'A variant with this SKU already exists');
      }
    }
    next(error);
  }
}

/**
 * PUT /api/merchant/products/:id
 * Update an existing product
 */
export async function updateProduct(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { id } = req.params;
    const updateData = req.body;

    const product = await updateMerchantProduct(id, merchantId, updateData);

    if (!product) {
      return sendNotFound(res, 'Product');
    }

    logger.info('Product updated', { productId: id, merchantId });

    sendSuccess(res, product);
  } catch (error) {
    if (error.message === 'Category not found') {
      return sendNotFound(res, 'Category');
    }
    if (error.message === 'Slug already exists') {
      return sendConflict(res, 'A product with this slug already exists');
    }
    next(error);
  }
}

/**
 * POST /api/merchant/products/:id/archive
 * Archive a product
 */
export async function archiveProduct(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { id } = req.params;

    const result = await archiveMerchantProduct(id, merchantId);

    if (!result) {
      return sendNotFound(res, 'Product');
    }

    logger.info('Product archived', { productId: id, merchantId });

    sendSuccess(res, { message: 'Product archived successfully', ...result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/merchant/products/:id/restore
 * Restore an archived product
 */
export async function restoreProduct(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { id } = req.params;

    const result = await restoreMerchantProduct(id, merchantId);

    if (!result) {
      return sendNotFound(res, 'Product');
    }

    logger.info('Product restored', { productId: id, merchantId });

    sendSuccess(res, { message: 'Product restored successfully', ...result });
  } catch (error) {
    next(error);
  }
}
