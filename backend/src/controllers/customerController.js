import * as customerService from '../services/customerService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Get customer profile
 * GET /api/customer/profile
 */
export async function getProfile(req, res, next) {
  try {
    const profile = await customerService.getProfile(req.user.id);
    if (!profile) {
      return sendError(res, 'Customer not found', 404);
    }
    sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
}

/**
 * Update customer profile
 * PUT /api/customer/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, phone } = req.body;
    const profile = await customerService.updateProfile(req.user.id, {
      firstName,
      lastName,
      phone,
    });
    sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
}

/**
 * Add new address
 * POST /api/customer/addresses
 */
export async function addAddress(req, res, next) {
  try {
    const address = req.body;
    const profile = await customerService.addAddress(req.user.id, address);
    sendSuccess(res, { profile }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Update address
 * PUT /api/customer/addresses/:addressId
 */
export async function updateAddress(req, res, next) {
  try {
    const { addressId } = req.params;
    const profile = await customerService.updateAddress(
      req.user.id,
      addressId,
      req.body
    );
    sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete address
 * DELETE /api/customer/addresses/:addressId
 */
export async function deleteAddress(req, res, next) {
  try {
    const { addressId } = req.params;
    const profile = await customerService.deleteAddress(req.user.id, addressId);
    sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
}

/**
 * Set default address
 * PATCH /api/customer/addresses/:addressId/default
 */
export async function setDefaultAddress(req, res, next) {
  try {
    const { addressId } = req.params;
    const profile = await customerService.setDefaultAddress(req.user.id, addressId);
    sendSuccess(res, { profile });
  } catch (error) {
    next(error);
  }
}

/**
 * Get order history
 * GET /api/customer/orders
 */
export async function getOrderHistory(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    const result = await customerService.getOrderHistory(req.user.id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
    });
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get single order
 * GET /api/customer/orders/:orderNumber
 */
export async function getOrder(req, res, next) {
  try {
    const { orderNumber } = req.params;
    const order = await customerService.getCustomerOrder(req.user.id, orderNumber);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }
    sendSuccess(res, { order });
  } catch (error) {
    next(error);
  }
}

/**
 * Change password
 * PUT /api/customer/password
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await customerService.changePassword(req.user.id, currentPassword, newPassword);
    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return sendError(res, error.message, 400);
    }
    next(error);
  }
}
