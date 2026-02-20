import mongoose from 'mongoose';
import { Variant, Product } from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * @typedef {Object} VariantUpdateData
 * @property {string} [sku]
 * @property {number|null} [price]
 * @property {number} [inventory]
 * @property {number|null} [lowStockThreshold]
 * @property {string|null} [image]
 * @property {number|null} [weight]
 * @property {boolean} [isActive]
 */

/**
 * Get all variants for a product
 * @param {string} productId
 * @param {string} merchantId
 * @returns {Promise<any[]|null>}
 */
export async function getProductVariants(productId, merchantId) {
  // Verify product belongs to merchant
  const product = await Product.findOne({ _id: productId, merchantId }).lean();
  if (!product) {
    return null;
  }

  const variants = await Variant.find({ productId })
    .sort({ 'optionValues.0.value': 1, 'optionValues.1.value': 1 })
    .lean();

  return variants.map((v) => ({
    id: v._id,
    sku: v.sku,
    optionValues: v.optionValues,
    price: v.price,
    inventory: v.inventory,
    reservedInventory: v.reservedInventory,
    availableInventory: v.inventory - v.reservedInventory,
    lowStockThreshold: v.lowStockThreshold ?? product.lowStockThreshold,
    isLowStock:
      v.inventory - v.reservedInventory <=
      (v.lowStockThreshold ?? product.lowStockThreshold),
    image: v.image,
    weight: v.weight,
    isActive: v.isActive,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  }));
}

/**
 * Get a variant by ID with ownership verification
 * @param {string} variantId
 * @param {string} merchantId
 * @returns {Promise<{variant: any, product: any}|null>}
 */
export async function getVariantWithOwnership(variantId, merchantId) {
  const variant = await Variant.findById(variantId).lean();
  if (!variant) {
    return null;
  }

  const product = await Product.findOne({
    _id: variant.productId,
    merchantId,
  }).lean();

  if (!product) {
    return null;
  }

  return { variant, product };
}

/**
 * Update a variant
 * @param {string} variantId
 * @param {string} merchantId
 * @param {VariantUpdateData} data
 * @returns {Promise<any|null>}
 */
export async function updateVariant(variantId, merchantId, data) {
  const ownership = await getVariantWithOwnership(variantId, merchantId);
  if (!ownership) {
    return null;
  }

  const variant = await Variant.findById(variantId);
  const { sku, price, inventory, lowStockThreshold, image, weight, isActive } = data;

  // Update fields
  if (sku !== undefined) {
    // Check SKU uniqueness
    const existing = await Variant.findOne({
      sku: sku.toUpperCase(),
      _id: { $ne: variantId },
    });
    if (existing) {
      throw new Error('SKU already exists');
    }
    variant.sku = sku.toUpperCase();
  }

  if (price !== undefined) {
    variant.price = price;
  }

  if (inventory !== undefined) {
    variant.inventory = inventory;
  }

  if (lowStockThreshold !== undefined) {
    variant.lowStockThreshold = lowStockThreshold;
  }

  if (image !== undefined) {
    variant.image = image;
  }

  if (weight !== undefined) {
    variant.weight = weight;
  }

  if (isActive !== undefined) {
    variant.isActive = isActive;
  }

  await variant.save();

  const product = ownership.product;

  return {
    id: variant._id,
    sku: variant.sku,
    optionValues: variant.optionValues,
    price: variant.price,
    inventory: variant.inventory,
    reservedInventory: variant.reservedInventory,
    availableInventory: variant.inventory - variant.reservedInventory,
    lowStockThreshold: variant.lowStockThreshold ?? product.lowStockThreshold,
    isLowStock:
      variant.inventory - variant.reservedInventory <=
      (variant.lowStockThreshold ?? product.lowStockThreshold),
    image: variant.image,
    weight: variant.weight,
    isActive: variant.isActive,
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
  };
}

/**
 * Adjust variant inventory
 * @param {string} variantId
 * @param {string} merchantId
 * @param {number} adjustment - Positive or negative integer
 * @param {string} [reason]
 * @returns {Promise<any|null>}
 */
export async function adjustInventory(variantId, merchantId, adjustment, reason) {
  const ownership = await getVariantWithOwnership(variantId, merchantId);
  if (!ownership) {
    return null;
  }

  const variant = await Variant.findById(variantId);
  const newInventory = variant.inventory + adjustment;

  if (newInventory < 0) {
    throw new Error('Inventory cannot go below zero');
  }

  variant.inventory = newInventory;
  await variant.save();

  // Log the adjustment
  logger.info('Inventory adjusted', {
    variantId,
    adjustment,
    newInventory,
    reason,
  });

  const product = ownership.product;

  return {
    id: variant._id,
    sku: variant.sku,
    inventory: variant.inventory,
    reservedInventory: variant.reservedInventory,
    availableInventory: variant.inventory - variant.reservedInventory,
    isLowStock:
      variant.inventory - variant.reservedInventory <=
      (variant.lowStockThreshold ?? product.lowStockThreshold),
    adjustment,
    reason,
  };
}

/**
 * Bulk update variants for a product
 * @param {string} productId
 * @param {string} merchantId
 * @param {Array<{id: string} & VariantUpdateData>} variants
 * @returns {Promise<any[]|null>}
 */
export async function bulkUpdateVariants(productId, merchantId, variants) {
  // Verify product belongs to merchant
  const product = await Product.findOne({ _id: productId, merchantId }).lean();
  if (!product) {
    return null;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedVariants = [];

    for (const variantData of variants) {
      const { id, sku, price, inventory, isActive, optionValues } = variantData;

      const variant = await Variant.findOne({ _id: id, productId }).session(session);
      if (!variant) {
        throw new Error(`Variant ${id} not found`);
      }

      if (sku !== undefined) {
        const existing = await Variant.findOne({
          sku: sku.toUpperCase(),
          _id: { $ne: id },
        }).session(session);
        if (existing) {
          throw new Error(`SKU ${sku} already exists`);
        }
        variant.sku = sku.toUpperCase();
      }

      if (price !== undefined) {
        variant.price = price;
      }

      if (inventory !== undefined) {
        variant.inventory = inventory;
      }

      if (isActive !== undefined) {
        variant.isActive = isActive;
      }

      if (optionValues !== undefined) {
        variant.optionValues = optionValues;
      }

      await variant.save({ session });
      updatedVariants.push({
        id: variant._id,
        sku: variant.sku,
        optionValues: variant.optionValues,
        price: variant.price,
        inventory: variant.inventory,
        isActive: variant.isActive,
      });
    }

    await session.commitTransaction();
    return updatedVariants;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Add new variants to an existing product (with ownership check)
 * @param {string} productId
 * @param {string} merchantId
 * @param {any[]} variantsData
 * @returns {Promise<any[]|null>}
 */
export async function addVariantsToProduct(productId, merchantId, variantsData) {
  const product = await Product.findOne({ _id: productId, merchantId }).lean();
  if (!product) {
    return null;
  }
  return createVariants(productId, variantsData);
}

/**
 * Create variants for a product
 * @param {string} productId
 * @param {any[]} variantsData
 * @param {mongoose.ClientSession} [session]
 * @returns {Promise<any[]>}
 */
export async function createVariants(productId, variantsData, session) {
  const variants = await Promise.all(
    variantsData.map(async (data) => {
      const variant = new Variant({
        productId,
        sku: data.sku.toUpperCase(),
        optionValues: data.optionValues || [],
        price: data.price ?? null,
        inventory: data.inventory ?? 0,
        lowStockThreshold: data.lowStockThreshold ?? null,
        image: data.image ?? null,
        isActive: true,
      });

      if (session) {
        await variant.save({ session });
      } else {
        await variant.save();
      }

      return {
        id: variant._id,
        sku: variant.sku,
        optionValues: variant.optionValues,
        price: variant.price,
        inventory: variant.inventory,
        isActive: variant.isActive,
      };
    })
  );

  return variants;
}

/**
 * Delete all variants for a product
 * @param {string} productId
 * @param {mongoose.ClientSession} [session]
 * @returns {Promise<number>}
 */
export async function deleteProductVariants(productId, session) {
  const result = await Variant.deleteMany({ productId }, session ? { session } : {});
  return result.deletedCount;
}
