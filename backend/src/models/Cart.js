import mongoose from 'mongoose';

/**
 * @typedef {Object} CartItem
 * @property {mongoose.Types.ObjectId} variantId
 * @property {mongoose.Types.ObjectId} productId
 * @property {number} quantity
 * @property {number} priceAtAdd
 * @property {Date} addedAt
 */

/**
 * @typedef {Object} Cart
 * @property {mongoose.Types.ObjectId} _id
 * @property {mongoose.Types.ObjectId} [customerId]
 * @property {string} [sessionId]
 * @property {CartItem[]} items
 * @property {Date} expiresAt
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const cartItemSchema = new mongoose.Schema(
  {
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variant',
      required: [true, 'Variant ID is required'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    priceAtAdd: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    sessionId: {
      type: String,
      trim: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
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
cartSchema.index({ customerId: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for item count
cartSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
});

// Update expiresAt on modification
cartSchema.pre('save', function (next) {
  if (this.isModified('items')) {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
