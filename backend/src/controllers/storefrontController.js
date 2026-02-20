import {
  getStorefrontProducts,
  getProductBySlug as getProductBySlugService,
  getActiveCategories as getActiveCategoriesService,
} from '../services/productService.js';
import { sendSuccess, sendNotFound } from '../utils/response.js';

/**
 * Get products for storefront
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getProducts(req, res, next) {
  try {
    const { category, search, sort, page, limit } = req.query;

    const result = await getStorefrontProducts({
      category,
      search,
      sort,
      page,
      limit,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get single product by slug
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const product = await getProductBySlugService(slug);

    if (!product) {
      return sendNotFound(res, 'Product');
    }

    sendSuccess(res, { product });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all active categories
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function getActiveCategories(req, res, next) {
  try {
    const categories = await getActiveCategoriesService();

    sendSuccess(res, { categories });
  } catch (error) {
    next(error);
  }
}
