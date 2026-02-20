import { Customer, Order } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Get customer by ID
 * @param {string} customerId
 * @returns {Promise<Object|null>}
 */
export async function getCustomerById(customerId) {
  const customer = await Customer.findById(customerId).lean();
  if (!customer) return null;

  return formatCustomerResponse(customer);
}

/**
 * Get customer profile
 * @param {string} customerId
 * @returns {Promise<Object|null>}
 */
export async function getProfile(customerId) {
  const customer = await Customer.findById(customerId).lean();
  if (!customer) return null;

  // Get order stats
  const orderStats = await Order.aggregate([
    { $match: { customerId: customer._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
      },
    },
  ]);

  const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };

  return {
    ...formatCustomerResponse(customer),
    stats: {
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
    },
  };
}

/**
 * Update customer profile
 * @param {string} customerId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateProfile(customerId, updates) {
  const allowedFields = ['firstName', 'lastName', 'phone'];
  const filteredUpdates = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  const customer = await Customer.findByIdAndUpdate(
    customerId,
    { $set: filteredUpdates },
    { new: true, runValidators: true }
  ).lean();

  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  return formatCustomerResponse(customer);
}

/**
 * Add a new address to customer
 * @param {string} customerId
 * @param {Object} address
 * @returns {Promise<Object>}
 */
export async function addAddress(customerId, address) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  // If this is the first address or marked as default, set it as default
  if (customer.addresses.length === 0 || address.isDefault) {
    // Unset any existing default
    customer.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    address.isDefault = true;
  }

  customer.addresses.push(address);
  await customer.save();

  return formatCustomerResponse(customer.toObject());
}

/**
 * Update an existing address
 * @param {string} customerId
 * @param {string} addressId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateAddress(customerId, addressId, updates) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const addressIndex = customer.addresses.findIndex(
    (addr) => addr._id.toString() === addressId
  );

  if (addressIndex === -1) {
    const error = new Error('Address not found');
    error.statusCode = 404;
    throw error;
  }

  // If setting as default, unset other defaults
  if (updates.isDefault) {
    customer.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  // Update the address fields
  const allowedFields = [
    'firstName',
    'lastName',
    'address1',
    'address2',
    'city',
    'state',
    'postalCode',
    'country',
    'phone',
    'isDefault',
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      customer.addresses[addressIndex][field] = updates[field];
    }
  }

  await customer.save();

  return formatCustomerResponse(customer.toObject());
}

/**
 * Delete an address
 * @param {string} customerId
 * @param {string} addressId
 * @returns {Promise<Object>}
 */
export async function deleteAddress(customerId, addressId) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const addressIndex = customer.addresses.findIndex(
    (addr) => addr._id.toString() === addressId
  );

  if (addressIndex === -1) {
    const error = new Error('Address not found');
    error.statusCode = 404;
    throw error;
  }

  const wasDefault = customer.addresses[addressIndex].isDefault;
  customer.addresses.splice(addressIndex, 1);

  // If we deleted the default, set first remaining address as default
  if (wasDefault && customer.addresses.length > 0) {
    customer.addresses[0].isDefault = true;
  }

  await customer.save();

  return formatCustomerResponse(customer.toObject());
}

/**
 * Set default address
 * @param {string} customerId
 * @param {string} addressId
 * @returns {Promise<Object>}
 */
export async function setDefaultAddress(customerId, addressId) {
  const customer = await Customer.findById(customerId);
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  let found = false;
  customer.addresses.forEach((addr) => {
    if (addr._id.toString() === addressId) {
      addr.isDefault = true;
      found = true;
    } else {
      addr.isDefault = false;
    }
  });

  if (!found) {
    const error = new Error('Address not found');
    error.statusCode = 404;
    throw error;
  }

  await customer.save();

  return formatCustomerResponse(customer.toObject());
}

/**
 * Get customer order history
 * @param {string} customerId
 * @param {Object} options
 * @returns {Promise<{orders: Array, pagination: Object}>}
 */
export async function getOrderHistory(customerId, options = {}) {
  const { page = 1, limit = 10, status } = options;

  const query = { customerId };
  if (status) {
    query.status = status;
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return {
    orders: orders.map(formatOrderSummary),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single order for customer
 * @param {string} customerId
 * @param {string} orderNumber
 * @returns {Promise<Object|null>}
 */
export async function getCustomerOrder(customerId, orderNumber) {
  const order = await Order.findOne({
    customerId,
    orderNumber,
  }).lean();

  if (!order) return null;

  return formatOrderDetail(order);
}

/**
 * Change customer password
 * @param {string} customerId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<boolean>}
 */
export async function changePassword(customerId, currentPassword, newPassword) {
  const { hashPassword, comparePassword } = await import('../utils/password.js');

  const customer = await Customer.findById(customerId).select('+passwordHash');
  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const isValid = await comparePassword(currentPassword, customer.passwordHash);
  if (!isValid) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  customer.passwordHash = await hashPassword(newPassword);
  await customer.save();

  logger.info(`Password changed for customer ${customerId}`);

  return true;
}

/**
 * Format customer for API response
 * @param {Object} customer
 * @returns {Object}
 */
function formatCustomerResponse(customer) {
  return {
    id: customer._id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    addresses: customer.addresses?.map((addr) => ({
      id: addr._id,
      firstName: addr.firstName,
      lastName: addr.lastName,
      address1: addr.address1,
      address2: addr.address2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.isDefault,
    })) || [],
    createdAt: customer.createdAt,
  };
}

/**
 * Format order summary for list view
 * @param {Object} order
 * @returns {Object}
 */
function formatOrderSummary(order) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    itemCount: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    total: order.total,
    createdAt: order.createdAt,
  };
}

/**
 * Format order detail for single view
 * @param {Object} order
 * @returns {Object}
 */
function formatOrderDetail(order) {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    items: order.items?.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })) || [],
    shippingAddress: order.shippingAddress,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    taxAmount: order.taxAmount,
    total: order.total,
    trackingNumber: order.trackingNumber,
    trackingCarrier: order.trackingCarrier,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    shippedAt: order.shippedAt,
    deliveredAt: order.deliveredAt,
  };
}
