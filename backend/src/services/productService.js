import mongoose from 'mongoose';
import { Product, Variant, Category } from '../models/index.js';
import { parsePagination, createPaginationResult } from '../utils/pagination.js';
import { generateSlug, generateUniqueSlug } from '../utils/slug.js';
import { createVariants } from './variantService.js';

/**
 * @typedef {Object} ProductListOptions
 * @property {string} [category] - Category slug filter
 * @property {string} [search] - Search term
 * @property {string} [sort] - Sort option
 * @property {number} [page] - Page number
 * @property {number} [limit] - Items per page
 * @property {string} [merchantId] - Filter by merchant (for storefront, use default merchant)
 */

/**
 * Get products for storefront
 * @param {ProductListOptions} options
 * @returns {Promise<{products: any[], pagination: any}>}
 */
export async function getStorefrontProducts(options = {}) {
  const { category, search, sort = 'newest', merchantId } = options;
  const { page, limit, skip } = parsePagination(options);

  // Build query
  const query = { status: 'active' };

  if (merchantId) {
    query.merchantId = merchantId;
  }

  // Category filter
  if (category) {
    const categoryDoc = await Category.findOne({ slug: category, isActive: true });
    if (categoryDoc) {
      query.categoryId = categoryDoc._id;
    }
  }

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Build sort
  let sortOption = {};
  switch (sort) {
    case 'price_asc':
      sortOption = { basePrice: 1 };
      break;
    case 'price_desc':
      sortOption = { basePrice: -1 };
      break;
    case 'name':
      sortOption = { name: 1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
  }

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean(),
    Product.countDocuments(query),
  ]);

  // Get variant info for each product
  const productsWithVariants = await Promise.all(
    products.map(async (product) => {
      const variants = await Variant.find({
        productId: product._id,
        isActive: true,
      }).lean();

      const prices = variants.map((v) => v.price || product.basePrice);
      const totalInventory = variants.reduce(
        (sum, v) => sum + (v.inventory - v.reservedInventory),
        0
      );

      return {
        id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        images: product.images,
        category: product.categoryId
          ? {
              id: product.categoryId._id,
              name: product.categoryId.name,
              slug: product.categoryId.slug,
            }
          : null,
        hasVariants: variants.length > 1,
        inStock: totalInventory > 0,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
      };
    })
  );

  return {
    products: productsWithVariants,
    pagination: createPaginationResult(total, { page, limit }),
  };
}

/**
 * Get single product with all variants by slug
 * @param {string} slug
 * @param {string} [merchantId]
 * @returns {Promise<any|null>}
 */
export async function getProductBySlug(slug, merchantId) {
  const query = { slug, status: 'active' };
  if (merchantId) {
    query.merchantId = merchantId;
  }

  const product = await Product.findOne(query)
    .populate('categoryId', 'name slug')
    .lean();

  if (!product) {
    return null;
  }

  // Get all active variants
  const variants = await Variant.find({
    productId: product._id,
    isActive: true,
  }).lean();

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: product.basePrice,
    images: product.images,
    category: product.categoryId
      ? {
          id: product.categoryId._id,
          name: product.categoryId.name,
          slug: product.categoryId.slug,
        }
      : null,
    optionTypes: product.optionTypes,
    variants: variants.map((v) => ({
      id: v._id,
      sku: v.sku,
      optionValues: v.optionValues,
      price: v.price || product.basePrice,
      inventory: v.inventory - v.reservedInventory,
      inStock: v.inventory - v.reservedInventory > 0,
      image: v.image,
    })),
  };
}

/**
 * Get active categories with product counts
 * @param {string} [merchantId]
 * @returns {Promise<any[]>}
 */
export async function getActiveCategories(merchantId) {
  const query = { isActive: true };
  if (merchantId) {
    query.merchantId = merchantId;
  }

  const categories = await Category.find(query)
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  // Get product counts
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        categoryId: category._id,
        status: 'active',
      });

      return {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        productCount,
      };
    })
  );

  return categoriesWithCounts;
}

/**
 * Check if a variant has sufficient inventory
 * @param {string} variantId
 * @param {number} quantity
 * @returns {Promise<{available: boolean, inventory: number}>}
 */
export async function checkVariantInventory(variantId, quantity) {
  const variant = await Variant.findById(variantId);
  if (!variant || !variant.isActive) {
    return { available: false, inventory: 0 };
  }

  const availableInventory = variant.inventory - variant.reservedInventory;
  return {
    available: availableInventory >= quantity,
    inventory: availableInventory,
  };
}

/**
 * Get variant with product info
 * @param {string} variantId
 * @returns {Promise<any|null>}
 */
export async function getVariantWithProduct(variantId) {
  const variant = await Variant.findById(variantId).lean();
  if (!variant) {
    return null;
  }

  const product = await Product.findById(variant.productId).lean();
  if (!product || product.status !== 'active') {
    return null;
  }

  return {
    variant: {
      id: variant._id,
      sku: variant.sku,
      optionValues: variant.optionValues,
      price: variant.price || product.basePrice,
      inventory: variant.inventory - variant.reservedInventory,
      image: variant.image,
      isActive: variant.isActive,
    },
    product: {
      id: product._id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      merchantId: product.merchantId,
    },
  };
}

// ============================================================================
// Merchant Product CRUD Operations
// ============================================================================

/**
 * @typedef {Object} MerchantProductListOptions
 * @property {string} [status] - Filter by status ('active', 'archived', 'all')
 * @property {string} [category] - Category ID filter
 * @property {string} [search] - Search term
 * @property {string} [sort] - Sort option
 * @property {number} [page] - Page number
 * @property {number} [limit] - Items per page
 */

/**
 * Get products for merchant dashboard
 * @param {string} merchantId
 * @param {MerchantProductListOptions} options
 * @returns {Promise<{products: any[], pagination: any}>}
 */
export async function getMerchantProducts(merchantId, options = {}) {
  const { status = 'all', category, search, sort = 'newest' } = options;
  const { page, limit, skip } = parsePagination(options);

  // Build query
  const query = { merchantId };

  if (status !== 'all') {
    query.status = status;
  }

  if (category) {
    query.categoryId = category;
  }

  if (search) {
    const sanitized = search.substring(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: sanitized, $options: 'i' } },
      { description: { $regex: sanitized, $options: 'i' } },
    ];
  }

  // Build sort
  let sortOption = {};
  switch (sort) {
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'price_asc':
      sortOption = { basePrice: 1 };
      break;
    case 'price_desc':
      sortOption = { basePrice: -1 };
      break;
    case 'name':
      sortOption = { name: 1 };
      break;
    case 'newest':
    default:
      sortOption = { createdAt: -1 };
  }

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean(),
    Product.countDocuments(query),
  ]);

  // Get variant and inventory info
  const productsWithDetails = await Promise.all(
    products.map(async (product) => {
      const variants = await Variant.find({ productId: product._id }).lean();

      const totalInventory = variants.reduce((sum, v) => sum + v.inventory, 0);
      const totalReserved = variants.reduce((sum, v) => sum + v.reservedInventory, 0);
      const lowStockVariants = variants.filter(
        (v) =>
          v.inventory - v.reservedInventory <=
          (v.lowStockThreshold ?? product.lowStockThreshold)
      );

      return {
        id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        images: product.images,
        status: product.status,
        category: product.categoryId
          ? {
              id: product.categoryId._id,
              name: product.categoryId.name,
              slug: product.categoryId.slug,
            }
          : null,
        variantCount: variants.length,
        totalInventory,
        availableInventory: totalInventory - totalReserved,
        lowStockCount: lowStockVariants.length,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    })
  );

  return {
    products: productsWithDetails,
    pagination: createPaginationResult(total, { page, limit }),
  };
}

/**
 * Get single product for merchant with all details
 * @param {string} productId
 * @param {string} merchantId
 * @returns {Promise<any|null>}
 */
export async function getMerchantProductById(productId, merchantId) {
  const product = await Product.findOne({ _id: productId, merchantId })
    .populate('categoryId', 'name slug')
    .lean();

  if (!product) {
    return null;
  }

  const variants = await Variant.find({ productId }).lean();

  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: product.basePrice,
    images: product.images,
    optionTypes: product.optionTypes,
    status: product.status,
    lowStockThreshold: product.lowStockThreshold,
    tags: product.tags,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    category: product.categoryId
      ? {
          id: product.categoryId._id,
          name: product.categoryId.name,
          slug: product.categoryId.slug,
        }
      : null,
    variants: variants.map((v) => ({
      id: v._id,
      sku: v.sku,
      optionValues: v.optionValues,
      price: v.price,
      inventory: v.inventory,
      reservedInventory: v.reservedInventory,
      availableInventory: v.inventory - v.reservedInventory,
      lowStockThreshold: v.lowStockThreshold,
      image: v.image,
      weight: v.weight,
      isActive: v.isActive,
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

/**
 * @typedef {Object} ProductCreateData
 * @property {string} name
 * @property {string} [slug]
 * @property {string} description
 * @property {number} basePrice
 * @property {string} [categoryId]
 * @property {any[]} [images]
 * @property {any[]} [optionTypes]
 * @property {number} [lowStockThreshold]
 * @property {string[]} [tags]
 * @property {string} [seoTitle]
 * @property {string} [seoDescription]
 * @property {any[]} [variants]
 */

/**
 * Create a new product
 * @param {string} merchantId
 * @param {ProductCreateData} data
 * @returns {Promise<any>}
 */
export async function createMerchantProduct(merchantId, data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      slug: providedSlug,
      description,
      basePrice,
      categoryId,
      images,
      optionTypes,
      lowStockThreshold,
      tags,
      seoTitle,
      seoDescription,
      variants: variantsData,
    } = data;

    // Generate slug if not provided
    let slug = providedSlug;
    if (!slug) {
      const baseSlug = generateSlug(name);
      slug = await generateUniqueSlug(baseSlug, async (testSlug) => {
        const existing = await Product.findOne({ merchantId, slug: testSlug });
        return !!existing;
      });
    }

    // Validate category if provided
    if (categoryId) {
      const category = await Category.findOne({ _id: categoryId, merchantId });
      if (!category) {
        throw new Error('Category not found');
      }
    }

    // Create product
    const product = new Product({
      merchantId,
      name,
      slug,
      description,
      basePrice,
      categoryId: categoryId || null,
      images: images || [],
      optionTypes: optionTypes || [],
      lowStockThreshold: lowStockThreshold ?? 5,
      tags: tags || [],
      seoTitle,
      seoDescription,
      status: 'active',
    });

    await product.save({ session });

    // Create variants
    let variants = [];
    if (variantsData && variantsData.length > 0) {
      variants = await createVariants(product._id, variantsData, session);
    } else {
      // Create default variant if none provided
      const defaultVariant = await createVariants(
        product._id,
        [
          {
            sku: `${slug.toUpperCase().replace(/-/g, '')}-001`,
            optionValues: [],
            inventory: 0,
          },
        ],
        session
      );
      variants = defaultVariant;
    }

    await session.commitTransaction();

    return {
      id: product._id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      images: product.images,
      optionTypes: product.optionTypes,
      status: product.status,
      lowStockThreshold: product.lowStockThreshold,
      tags: product.tags,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      categoryId: product.categoryId,
      variants,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Update a product
 * @param {string} productId
 * @param {string} merchantId
 * @param {Partial<ProductCreateData>} data
 * @returns {Promise<any|null>}
 */
export async function updateMerchantProduct(productId, merchantId, data) {
  const product = await Product.findOne({ _id: productId, merchantId });

  if (!product) {
    return null;
  }

  const {
    name,
    slug: providedSlug,
    description,
    basePrice,
    categoryId,
    images,
    optionTypes,
    lowStockThreshold,
    tags,
    seoTitle,
    seoDescription,
  } = data;

  // Update fields
  if (name !== undefined) {
    product.name = name;
  }

  if (providedSlug !== undefined) {
    const existing = await Product.findOne({
      merchantId,
      slug: providedSlug,
      _id: { $ne: productId },
    });
    if (existing) {
      throw new Error('Slug already exists');
    }
    product.slug = providedSlug;
  }

  if (description !== undefined) {
    product.description = description;
  }

  if (basePrice !== undefined) {
    product.basePrice = basePrice;
  }

  if (categoryId !== undefined) {
    if (categoryId) {
      const category = await Category.findOne({ _id: categoryId, merchantId });
      if (!category) {
        throw new Error('Category not found');
      }
    }
    product.categoryId = categoryId || null;
  }

  if (images !== undefined) {
    product.images = images;
  }

  if (optionTypes !== undefined) {
    product.optionTypes = optionTypes;
  }

  if (lowStockThreshold !== undefined) {
    product.lowStockThreshold = lowStockThreshold;
  }

  if (tags !== undefined) {
    product.tags = tags;
  }

  if (seoTitle !== undefined) {
    product.seoTitle = seoTitle;
  }

  if (seoDescription !== undefined) {
    product.seoDescription = seoDescription;
  }

  await product.save();

  return getMerchantProductById(productId, merchantId);
}

/**
 * Archive a product
 * @param {string} productId
 * @param {string} merchantId
 * @returns {Promise<any|null>}
 */
export async function archiveMerchantProduct(productId, merchantId) {
  const product = await Product.findOne({ _id: productId, merchantId });

  if (!product) {
    return null;
  }

  product.status = 'archived';
  await product.save();

  return { id: product._id, status: product.status };
}

/**
 * Restore an archived product
 * @param {string} productId
 * @param {string} merchantId
 * @returns {Promise<any|null>}
 */
export async function restoreMerchantProduct(productId, merchantId) {
  const product = await Product.findOne({ _id: productId, merchantId });

  if (!product) {
    return null;
  }

  product.status = 'active';
  await product.save();

  return { id: product._id, status: product.status };
}
