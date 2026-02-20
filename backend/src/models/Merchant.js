import mongoose from 'mongoose';

/**
 * @typedef {Object} NotificationPreferences
 * @property {boolean} emailNotifications
 * @property {boolean} orderConfirmations
 * @property {boolean} shippingUpdates
 * @property {boolean} lowStockAlerts
 * @property {boolean} outOfStockAlerts
 * @property {boolean} orderNotifications
 * @property {boolean} dailySummary
 * @property {number} lowStockThreshold
 */

/**
 * @typedef {Object} Merchant
 * @property {mongoose.Types.ObjectId} _id
 * @property {string} email
 * @property {string} passwordHash
 * @property {string} storeName
 * @property {string} [storeDescription]
 * @property {string} [logo]
 * @property {NotificationPreferences} notificationPreferences
 * @property {string} [stripeCustomerId]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const notificationPreferencesSchema = new mongoose.Schema(
  {
    emailNotifications: { type: Boolean, default: true },
    orderConfirmations: { type: Boolean, default: true },
    shippingUpdates: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
    outOfStockAlerts: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    dailySummary: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5, min: 1, max: 100 },
  },
  { _id: false }
);

const merchantSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      minlength: [2, 'Store name must be at least 2 characters'],
      maxlength: [100, 'Store name cannot exceed 100 characters'],
    },
    storeDescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Store description cannot exceed 1000 characters'],
    },
    logo: {
      type: String,
      trim: true,
    },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    businessName: {
      type: String,
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLowStockAlert: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Indexes
merchantSchema.index({ email: 1 }, { unique: true });

const Merchant = mongoose.model('Merchant', merchantSchema);

export default Merchant;
