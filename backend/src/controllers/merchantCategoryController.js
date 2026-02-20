import {
  getMerchantCategories as getMerchantCategoriesService,
  getCategoryById,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  reorderCategories as reorderCategoriesService,
} from '../services/categoryService.js';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendConflict,
  sendError,
} from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/merchant/categories
 * List merchant's categories
 */
export async function getMerchantCategories(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { includeInactive, parentId } = req.query;

    const categories = await getMerchantCategoriesService(merchantId, {
      includeInactive,
      parentId,
    });

    sendSuccess(res, { categories });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/merchant/categories/:id
 * Get single category details
 */
export async function getMerchantCategory(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { id } = req.params;

    const category = await getCategoryById(id, merchantId);

    if (!category) {
      return sendNotFound(res, 'Category');
    }

    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/merchant/categories
 * Create a new category
 */
export async function createCategory(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const categoryData = req.body;

    const category = await createCategoryService(merchantId, categoryData);

    logger.info('Category created', { categoryId: category.id, merchantId });

    sendCreated(res, category);
  } catch (error) {
    if (error.message === 'Parent category not found') {
      return sendNotFound(res, 'Parent category');
    }
    if (error.code === 11000 && error.keyPattern?.slug) {
      return sendConflict(res, 'A category with this slug already exists');
    }
    next(error);
  }
}

/**
 * PUT /api/merchant/categories/:id
 * Update an existing category
 */
export async function updateCategory(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { id } = req.params;
    const updateData = req.body;

    const category = await updateCategoryService(id, merchantId, updateData);

    if (!category) {
      return sendNotFound(res, 'Category');
    }

    logger.info('Category updated', { categoryId: id, merchantId });

    sendSuccess(res, category);
  } catch (error) {
    if (error.message === 'Slug already exists') {
      return sendConflict(res, 'A category with this slug already exists');
    }
    if (error.message === 'Parent category not found') {
      return sendNotFound(res, 'Parent category');
    }
    if (error.message === 'Category cannot be its own parent') {
      return sendError(res, 'INVALID_OPERATION', error.message);
    }
    next(error);
  }
}

/**
 * DELETE /api/merchant/categories/:id
 * Delete a category
 */
export async function deleteCategory(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { id } = req.params;

    const result = await deleteCategoryService(id, merchantId);

    if (!result.deleted) {
      return sendNotFound(res, 'Category');
    }

    logger.info('Category deleted', {
      categoryId: id,
      merchantId,
      productsUpdated: result.productsUpdated,
    });

    sendSuccess(res, {
      message: 'Category deleted successfully',
      productsUpdated: result.productsUpdated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/merchant/categories/reorder
 * Reorder categories
 */
export async function reorderCategories(req, res, next) {
  try {
    const merchantId = req.merchant._id;
    const { categories } = req.body;

    await reorderCategoriesService(merchantId, categories);

    logger.info('Categories reordered', { merchantId, count: categories.length });

    sendSuccess(res, { message: 'Categories reordered successfully' });
  } catch (error) {
    next(error);
  }
}
