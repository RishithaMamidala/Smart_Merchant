import mongoose from 'mongoose';

/**
 * @typedef {Object} ProductImage
 * @property {string} url
 * @property {string} publicId
 * @property {string} [altText]
 * @property {number} sortOrder
 */

/**
 * @typedef {Object} OptionType
 * @property {string} name
 * @property {string[]} values
 */

/**
 * @typedef {Object} Product
 * @property {mongoose.Types.ObjectId} _id
 * @property {mongoose.Types.ObjectId} merchantId
 * @property {mongoose.Types.ObjectId} [categoryId]
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {number} basePrice
 * @property {ProductImage[]} images
 * @property {OptionType[]} optionTypes
 * @property {'active'|'archived'} status
 * @property {number} lowStockThreshold
 * @property {string[]} tags
 * @property {string} [seoTitle]
 * @property {string} [seoDescription]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const optionTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Option name is required'],
      trim: true,
      maxlength: 50,
    },
    values: {
      type: [String],
      required: [true, 'Option values are required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one option value is required',
      },
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, 'Merchant ID is required'],
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [1, 'Product name cannot be empty'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    optionTypes: {
      type: [optionTypeSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Threshold cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 70,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
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
productSchema.index({ merchantId: 1, slug: 1 }, { unique: true });
productSchema.index({ merchantId: 1, status: 1 });
productSchema.index({ merchantId: 1, categoryId: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
