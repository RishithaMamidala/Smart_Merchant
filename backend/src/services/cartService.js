import crypto from 'crypto';
import { Cart } from '../models/index.js';
import { getVariantWithProduct } from './productService.js';

/**
 * Generate a unique session ID
 * @returns {string}
 */
function generateSessionId() {
  return `sess_${crypto.randomUUID()}`;
}

/**
 * Get or create cart for customer or session
 * @param {Object} options
 * @param {string} [options.customerId]
 * @param {string} [options.sessionId]
 * @returns {Promise<{cart: any, sessionId: string|null}>}
 */
export async function getOrCreateCart({ customerId, sessionId }) {
  let cart;

  if (customerId) {
    // Find cart by customer ID
    cart = await Cart.findOne({ customerId });
  } else if (sessionId) {
    // Find cart by session ID
    cart = await Cart.findOne({ sessionId });
  }

  // If no cart found, return empty cart structure
  if (!cart) {
    const newSessionId = customerId ? null : sessionId || generateSessionId();
    return {
      cart: {
        id: null,
        items: [],
        itemCount: 0,
        subtotal: 0,
        currency: 'USD',
      },
      sessionId: newSessionId,
    };
  }

  // Populate cart items with product/variant details
  const populatedItems = await populateCartItems(cart.items);

  return {
    cart: {
      id: cart._id,
      items: populatedItems,
      itemCount: populatedItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: populatedItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      ),
      currency: 'USD',
    },
    sessionId: cart.sessionId || null,
  };
}

/**
 * Populate cart items with product and variant details
 * @param {any[]} items
 * @returns {Promise<any[]>}
 */
async function populateCartItems(items) {
  const populatedItems = await Promise.all(
    items.map(async (item) => {
      const data = await getVariantWithProduct(item.variantId);
      if (!data || !data.variant.isActive) {
        return null;
      }

      return {
        id: item._id,
        variantId: item.variantId,
        productId: item.productId,
        product: {
          name: data.product.name,
          slug: data.product.slug,
          image: data.product.images[0]?.url || null,
        },
        variant: {
          sku: data.variant.sku,
          optionValues: data.variant.optionValues,
          price: data.variant.price,
          inventory: data.variant.inventory,
          inStock: data.variant.inventory > 0,
        },
        quantity: item.quantity,
        unitPrice: data.variant.price,
        totalPrice: data.variant.price * item.quantity,
      };
    })
  );

  return populatedItems.filter(Boolean);
}

/**
 * Add item to cart
 * @param {Object} options
 * @param {string} [options.customerId]
 * @param {string} [options.sessionId]
 * @param {string} options.variantId
 * @param {number} options.quantity
 * @returns {Promise<{cart: any, addedItem: any, sessionId: string|null}>}
 */
export async function addItemToCart({ customerId, sessionId, variantId, quantity = 1 }) {
  // Validate variant exists and is active
  const variantData = await getVariantWithProduct(variantId);
  if (!variantData || !variantData.variant.isActive) {
    throw Object.assign(new Error('Variant not found or inactive'), {
      code: 'VARIANT_NOT_FOUND',
      statusCode: 404,
    });
  }

  // Check inventory
  if (variantData.variant.inventory < quantity) {
    throw Object.assign(new Error(`Only ${variantData.variant.inventory} items available`), {
      code: 'INSUFFICIENT_INVENTORY',
      statusCode: 400,
      available: variantData.variant.inventory,
    });
  }

  const newSessionId = customerId ? null : sessionId || generateSessionId();
  const filter = customerId
    ? { customerId }
    : { sessionId: sessionId || newSessionId };

  // Use atomic operations to avoid race conditions with concurrent adds
  // First, try to increment quantity if variant already exists in cart
  const incResult = await Cart.findOneAndUpdate(
    { ...filter, 'items.variantId': variantId },
    {
      $inc: { 'items.$.quantity': quantity },
      $set: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    },
    { new: true }
  );

  let cart;
  if (incResult) {
    // Item existed and was incremented - check inventory for total quantity
    const updatedItem = incResult.items.find(
      (i) => i.variantId.toString() === variantId
    );
    if (updatedItem && variantData.variant.inventory < updatedItem.quantity) {
      // Roll back the increment
      await Cart.findOneAndUpdate(
        { ...filter, 'items.variantId': variantId },
        { $inc: { 'items.$.quantity': -quantity } }
      );
      throw Object.assign(
        new Error(`Only ${variantData.variant.inventory} items available`),
        {
          code: 'INSUFFICIENT_INVENTORY',
          statusCode: 400,
          available: variantData.variant.inventory,
        }
      );
    }
    cart = incResult;
  } else {
    // Item not in cart yet - push new item (upsert creates cart if needed)
    cart = await Cart.findOneAndUpdate(
      filter,
      {
        $push: {
          items: {
            variantId,
            productId: variantData.product.id,
            quantity,
            priceAtAdd: variantData.variant.price,
            addedAt: new Date(),
          },
        },
        $set: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
      { new: true, upsert: true }
    );
  }

  // Return updated cart
  const { cart: populatedCart, sessionId: cartSessionId } = await getOrCreateCart({
    customerId,
    sessionId: cart.sessionId,
  });

  return {
    cart: populatedCart,
    addedItem: {
      variantId,
      quantity,
      product: {
        name: variantData.product.name,
      },
    },
    sessionId: cartSessionId,
  };
}

/**
 * Update item quantity in cart
 * @param {Object} options
 * @param {string} [options.customerId]
 * @param {string} [options.sessionId]
 * @param {string} options.variantId
 * @param {number} options.quantity
 * @returns {Promise<{cart: any}>}
 */
export async function updateCartItemQuantity({
  customerId,
  sessionId,
  variantId,
  quantity,
}) {
  // Check inventory
  const variantData = await getVariantWithProduct(variantId);
  if (!variantData || variantData.variant.inventory < quantity) {
    const available = variantData?.variant.inventory || 0;
    throw Object.assign(new Error(`Only ${available} items available`), {
      code: 'INSUFFICIENT_INVENTORY',
      statusCode: 400,
      available,
    });
  }

  const filter = customerId ? { customerId } : { sessionId };
  const result = await Cart.findOneAndUpdate(
    { ...filter, 'items.variantId': variantId },
    {
      $set: {
        'items.$.quantity': quantity,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    },
    { new: true }
  );

  if (!result) {
    // Either cart or item not found
    const cart = await findCart(customerId, sessionId);
    if (!cart) {
      throw Object.assign(new Error('Cart not found'), {
        code: 'CART_NOT_FOUND',
        statusCode: 404,
      });
    }
    throw Object.assign(new Error('Item not found in cart'), {
      code: 'ITEM_NOT_FOUND',
      statusCode: 404,
    });
  }

  const { cart: populatedCart } = await getOrCreateCart({ customerId, sessionId });
  return { cart: populatedCart };
}

/**
 * Remove item from cart
 * @param {Object} options
 * @param {string} [options.customerId]
 * @param {string} [options.sessionId]
 * @param {string} options.variantId
 * @returns {Promise<{cart: any}>}
 */
export async function removeCartItem({ customerId, sessionId, variantId }) {
  const cart = await findCart(customerId, sessionId);
  if (!cart) {
    throw Object.assign(new Error('Cart not found'), {
      code: 'CART_NOT_FOUND',
      statusCode: 404,
    });
  }

  cart.items = cart.items.filter((i) => i.variantId.toString() !== variantId);
  await cart.save();

  const { cart: populatedCart } = await getOrCreateCart({ customerId, sessionId });
  return { cart: populatedCart };
}

/**
 * Clear cart
 * @param {Object} options
 * @param {string} [options.customerId]
 * @param {string} [options.sessionId]
 * @returns {Promise<{cart: any}>}
 */
export async function clearCartItems({ customerId, sessionId }) {
  const cart = await findCart(customerId, sessionId);
  if (cart) {
    try {
      cart.items = [];
      await cart.save();
    } catch (error) {
      // VersionError means another operation (e.g. webhook) already modified the cart
      if (error.name === 'VersionError') {
        // Cart was already cleared by another caller — safe to ignore
      } else {
        throw error;
      }
    }
  }

  return {
    cart: {
      id: null,
      items: [],
      itemCount: 0,
      subtotal: 0,
      currency: 'USD',
    },
  };
}

/**
 * Validate cart items before checkout
 * @param {Object} options
 * @param {string} [options.customerId]
 * @param {string} [options.sessionId]
 * @returns {Promise<{valid: boolean, issues: any[], cart: any}>}
 */
export async function validateCartItems({ customerId, sessionId }) {
  const { cart } = await getOrCreateCart({ customerId, sessionId });

  if (cart.items.length === 0) {
    return {
      valid: false,
      issues: [{ type: 'CART_EMPTY', message: 'Cart is empty' }],
      cart,
    };
  }

  const issues = [];

  for (const item of cart.items) {
    const variantData = await getVariantWithProduct(item.variantId);

    if (!variantData || !variantData.variant.isActive) {
      issues.push({
        variantId: item.variantId,
        type: 'PRODUCT_UNAVAILABLE',
        product: {
          name: item.product?.name || 'Unknown',
          variant: item.variant?.optionValues?.map((ov) => ov.value).join(' / ') || '',
        },
      });
      continue;
    }

    if (variantData.variant.inventory < item.quantity) {
      issues.push({
        variantId: item.variantId,
        type: 'INSUFFICIENT_INVENTORY',
        requestedQuantity: item.quantity,
        availableQuantity: variantData.variant.inventory,
        product: {
          name: variantData.product.name,
          variant: variantData.variant.optionValues.map((ov) => ov.value).join(' / '),
        },
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    cart,
  };
}

/**
 * Find cart by customer ID or session ID
 * @param {string} [customerId]
 * @param {string} [sessionId]
 * @returns {Promise<any|null>}
 */
async function findCart(customerId, sessionId) {
  if (customerId) {
    return Cart.findOne({ customerId });
  }
  if (sessionId) {
    return Cart.findOne({ sessionId });
  }
  return null;
}

/**
 * Get cart document (raw, for checkout)
 * @param {string} [customerId]
 * @param {string} [sessionId]
 * @returns {Promise<any|null>}
 */
export async function getCartDocument(customerId, sessionId) {
  return findCart(customerId, sessionId);
}

/**
 * Merge guest cart into customer cart on login
 * @param {string} customerId
 * @param {string} sessionId
 * @returns {Promise<void>}
 */
export async function mergeGuestCart(customerId, sessionId) {
  if (!sessionId) return;

  const guestCart = await Cart.findOne({ sessionId });
  if (!guestCart || guestCart.items.length === 0) return;

  const customerCart = await Cart.findOne({ customerId });

  if (!customerCart) {
    // Assign guest cart to customer
    guestCart.customerId = customerId;
    guestCart.sessionId = null;
    await guestCart.save();
    return;
  }

  // Merge items
  for (const guestItem of guestCart.items) {
    const existingItem = customerCart.items.find(
      (i) => i.variantId.toString() === guestItem.variantId.toString()
    );

    if (existingItem) {
      // Check inventory and update quantity
      const variantData = await getVariantWithProduct(guestItem.variantId);
      const maxQuantity = variantData?.variant.inventory || 0;
      existingItem.quantity = Math.min(
        existingItem.quantity + guestItem.quantity,
        maxQuantity
      );
    } else {
      customerCart.items.push(guestItem);
    }
  }

  await customerCart.save();
  await Cart.deleteOne({ _id: guestCart._id });
}
