import mongoose from 'mongoose';

/**
 * @typedef {Object} OrderItem
 * @property {mongoose.Types.ObjectId} variantId
 * @property {mongoose.Types.ObjectId} productId
 * @property {string} productName
 * @property {string} variantName
 * @property {string} sku
 * @property {number} quantity
 * @property {number} unitPrice
 * @property {number} totalPrice
 */

/**
 * @typedef {Object} OrderAddress
 * @property {string} line1
 * @property {string} [line2]
 * @property {string} city
 * @property {string} state
 * @property {string} postalCode
 * @property {string} country
 */

/**
 * @typedef {'pending'|'processing'|'shipped'|'delivered'|'cancelled'} OrderStatus
 */

/**
 * @typedef {'pending'|'paid'|'failed'|'refunded'} PaymentStatus
 */

/**
 * @typedef {Object} Order
 * @property {mongoose.Types.ObjectId} _id
 * @property {string} orderNumber
 * @property {mongoose.Types.ObjectId} merchantId
 * @property {mongoose.Types.ObjectId} [customerId]
 * @property {string} customerEmail
 * @property {string} customerName
 * @property {OrderItem[]} items
 * @property {OrderAddress} shippingAddress
 * @property {OrderAddress} [billingAddress]
 * @property {number} subtotal
 * @property {number} shippingCost
 * @property {number} taxAmount
 * @property {number} total
 * @property {OrderStatus} status
 * @property {PaymentStatus} paymentStatus
 * @property {string} [stripePaymentIntentId]
 * @property {string} [trackingNumber]
 * @property {string} [trackingCarrier]
 * @property {string} [notes]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} [paidAt]
 * @property {Date} [shippedAt]
 * @property {Date} [deliveredAt]
 * @property {Date} [cancelledAt]
 */

const orderAddressSchema = new mongoose.Schema(
  {
    line1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
    },
    line2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      uppercase: true,
    },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    variantName: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      trim: true,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, 'Merchant ID is required'],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one item is required',
      },
    },
    shippingAddress: {
      type: orderAddressSchema,
      required: [true, 'Shipping address is required'],
    },
    billingAddress: {
      type: orderAddressSchema,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    trackingCarrier: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    paidAt: Date,
    processedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ merchantId: 1, status: 1 });
orderSchema.index({ merchantId: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 });

// Virtual for item count
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
