import mongoose from 'mongoose';

/**
 * @typedef {Object} Address
 * @property {string} [label]
 * @property {string} line1
 * @property {string} [line2]
 * @property {string} city
 * @property {string} state
 * @property {string} postalCode
 * @property {string} country
 * @property {boolean} isDefault
 */

/**
 * @typedef {Object} Customer
 * @property {mongoose.Types.ObjectId} _id
 * @property {string} email
 * @property {string} [passwordHash]
 * @property {boolean} isGuest
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [phone]
 * @property {Address[]} addresses
 * @property {number} [defaultAddressIndex]
 * @property {string} [stripeCustomerId]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    line1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true,
      maxlength: 200,
    },
    line2: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: 100,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: 100,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      maxlength: 20,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
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
      select: false,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    defaultAddressIndex: {
      type: Number,
      min: 0,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
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
customerSchema.index({ email: 1 }, { unique: true });

// Virtual for full name
customerSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.firstName || this.lastName || '';
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
