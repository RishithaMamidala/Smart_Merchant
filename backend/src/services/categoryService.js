import { Category, Product } from '../models/index.js';
import { generateSlug, generateUniqueSlug } from '../utils/slug.js';

/**
 * @typedef {Object} CategoryCreateData
 * @property {string} name
 * @property {string} [slug]
 * @property {string} [description]
 * @property {string} [image]
 * @property {string} [parentId]
 * @property {number} [sortOrder]
 * @property {boolean} [isActive]
 */

/**
 * Get all categories for a merchant
 * @param {string} merchantId
 * @param {Object} options
 * @param {boolean} [options.includeInactive]
 * @param {string|null} [options.parentId]
 * @returns {Promise<any[]>}
 */
export async function getMerchantCategories(merchantId, options = {}) {
  const { includeInactive = false, parentId } = options;

  const query = { merchantId };

  if (!includeInactive) {
    query.isActive = true;
  }

  if (parentId !== undefined) {
    query.parentId = parentId === 'null' || parentId === null ? null : parentId;
  }

  const categories = await Category.find(query)
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  // Get product counts for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        categoryId: category._id,
        merchantId,
      });

      return {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        productCount,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    })
  );

  return categoriesWithCounts;
}

/**
 * Get a single category by ID
 * @param {string} categoryId
 * @param {string} merchantId
 * @returns {Promise<any|null>}
 */
export async function getCategoryById(categoryId, merchantId) {
  const category = await Category.findOne({
    _id: categoryId,
    merchantId,
  }).lean();

  if (!category) {
    return null;
  }

  const productCount = await Product.countDocuments({
    categoryId: category._id,
    merchantId,
  });

  // Get children categories
  const children = await Category.find({
    parentId: category._id,
    merchantId,
  })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    productCount,
    children: children.map((c) => ({
      id: c._id,
      name: c.name,
      slug: c.slug,
      isActive: c.isActive,
    })),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

/**
 * Create a new category
 * @param {string} merchantId
 * @param {CategoryCreateData} data
 * @returns {Promise<any>}
 */
export async function createCategory(merchantId, data) {
  const { name, slug: providedSlug, description, image, parentId, sortOrder, isActive } = data;

  // Generate slug if not provided
  let slug = providedSlug;
  if (!slug) {
    const baseSlug = generateSlug(name);
    slug = await generateUniqueSlug(baseSlug, async (testSlug) => {
      const existing = await Category.findOne({ merchantId, slug: testSlug });
      return !!existing;
    });
  }

  // Validate parent exists if provided
  if (parentId) {
    const parentCategory = await Category.findOne({ _id: parentId, merchantId });
    if (!parentCategory) {
      throw new Error('Parent category not found');
    }
  }

  const category = new Category({
    merchantId,
    name,
    slug,
    description,
    image,
    parentId: parentId || null,
    sortOrder: sortOrder ?? 0,
    isActive: isActive ?? true,
  });

  await category.save();

  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    productCount: 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

/**
 * Update a category
 * @param {string} categoryId
 * @param {string} merchantId
 * @param {Partial<CategoryCreateData>} data
 * @returns {Promise<any|null>}
 */
export async function updateCategory(categoryId, merchantId, data) {
  const category = await Category.findOne({ _id: categoryId, merchantId });

  if (!category) {
    return null;
  }

  const { name, slug: providedSlug, description, image, parentId, sortOrder, isActive } = data;

  // Update fields
  if (name !== undefined) {
    category.name = name;
  }

  if (providedSlug !== undefined) {
    // Check slug uniqueness
    const existing = await Category.findOne({
      merchantId,
      slug: providedSlug,
      _id: { $ne: categoryId },
    });
    if (existing) {
      throw new Error('Slug already exists');
    }
    category.slug = providedSlug;
  }

  if (description !== undefined) {
    category.description = description;
  }

  if (image !== undefined) {
    category.image = image;
  }

  if (parentId !== undefined) {
    // Prevent self-referencing
    if (parentId && parentId.toString() === categoryId) {
      throw new Error('Category cannot be its own parent');
    }

    // Validate parent exists if provided
    if (parentId) {
      const parentCategory = await Category.findOne({ _id: parentId, merchantId });
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
    }

    category.parentId = parentId || null;
  }

  if (sortOrder !== undefined) {
    category.sortOrder = sortOrder;
  }

  if (isActive !== undefined) {
    category.isActive = isActive;
  }

  await category.save();

  const productCount = await Product.countDocuments({
    categoryId: category._id,
    merchantId,
  });

  return {
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    productCount,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

/**
 * Delete a category
 * @param {string} categoryId
 * @param {string} merchantId
 * @returns {Promise<{deleted: boolean, productsUpdated: number}>}
 */
export async function deleteCategory(categoryId, merchantId) {
  const category = await Category.findOne({ _id: categoryId, merchantId });

  if (!category) {
    return { deleted: false, productsUpdated: 0 };
  }

  // Update products to remove category reference
  const result = await Product.updateMany(
    { categoryId, merchantId },
    { $set: { categoryId: null } }
  );

  // Update child categories to remove parent reference
  await Category.updateMany(
    { parentId: categoryId, merchantId },
    { $set: { parentId: null } }
  );

  // Delete the category
  await Category.deleteOne({ _id: categoryId });

  return {
    deleted: true,
    productsUpdated: result.modifiedCount,
  };
}

/**
 * Reorder categories
 * @param {string} merchantId
 * @param {Array<{id: string, sortOrder: number}>} categories
 * @returns {Promise<void>}
 */
export async function reorderCategories(merchantId, categories) {
  const updates = categories.map(({ id, sortOrder }) =>
    Category.updateOne({ _id: id, merchantId }, { $set: { sortOrder } })
  );

  await Promise.all(updates);
}
