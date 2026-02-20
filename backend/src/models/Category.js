import mongoose from 'mongoose';

/**
 * @typedef {Object} Category
 * @property {mongoose.Types.ObjectId} _id
 * @property {mongoose.Types.ObjectId} merchantId
 * @property {string} name
 * @property {string} slug
 * @property {string} [description]
 * @property {string} [image]
 * @property {mongoose.Types.ObjectId} [parentId]
 * @property {number} sortOrder
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const categorySchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, 'Merchant ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [1, 'Category name cannot be empty'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
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
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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
categorySchema.index({ merchantId: 1, slug: 1 }, { unique: true });
categorySchema.index({ merchantId: 1, isActive: 1 });
categorySchema.index({ parentId: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
