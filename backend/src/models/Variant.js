import mongoose from 'mongoose';

/**
 * @typedef {Object} OptionValue
 * @property {string} name
 * @property {string} value
 */

/**
 * @typedef {Object} Variant
 * @property {mongoose.Types.ObjectId} _id
 * @property {mongoose.Types.ObjectId} productId
 * @property {string} sku
 * @property {OptionValue[]} optionValues
 * @property {number} [price]
 * @property {number} inventory
 * @property {number} reservedInventory
 * @property {number} [lowStockThreshold]
 * @property {string} [image]
 * @property {number} [weight]
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const optionValueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Option name is required'],
      trim: true,
    },
    value: {
      type: String,
      required: [true, 'Option value is required'],
      trim: true,
    },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]+$/, 'SKU can only contain uppercase letters, numbers, and hyphens'],
    },
    optionValues: {
      type: [optionValueSchema],
      default: [],
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: null,
    },
    inventory: {
      type: Number,
      required: [true, 'Inventory is required'],
      min: [0, 'Inventory cannot be negative'],
      default: 0,
    },
    reservedInventory: {
      type: Number,
      min: [0, 'Reserved inventory cannot be negative'],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      min: [0, 'Threshold cannot be negative'],
      default: null,
    },
    image: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
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
variantSchema.index({ productId: 1 });
variantSchema.index({ sku: 1 }, { unique: true });
variantSchema.index({ productId: 1, isActive: 1 });
variantSchema.index({ inventory: 1 });

// Virtual for available inventory (inventory - reserved)
variantSchema.virtual('availableInventory').get(function () {
  return this.inventory - this.reservedInventory;
});

// Virtual for in stock status
variantSchema.virtual('inStock').get(function () {
  return this.availableInventory > 0;
});

// Virtual for variant name (e.g., "M / Blue")
variantSchema.virtual('variantName').get(function () {
  return this.optionValues.map((ov) => ov.value).join(' / ');
});

const Variant = mongoose.model('Variant', variantSchema);

export default Variant;
