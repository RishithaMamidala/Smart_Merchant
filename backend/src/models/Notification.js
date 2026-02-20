import mongoose from 'mongoose';

/**
 * @typedef {'order_confirmation'|'shipping_update'|'low_stock_alert'|'out_of_stock_alert'|'daily_summary'} NotificationType
 */

/**
 * @typedef {'pending'|'sent'|'delivered'|'failed'} NotificationStatus
 */

/**
 * @typedef {Object} Notification
 * @property {mongoose.Types.ObjectId} _id
 * @property {mongoose.Types.ObjectId} [merchantId]
 * @property {mongoose.Types.ObjectId} [customerId]
 * @property {string} recipientEmail
 * @property {NotificationType} type
 * @property {string} subject
 * @property {string} content
 * @property {NotificationStatus} status
 * @property {mongoose.Types.ObjectId} [relatedOrderId]
 * @property {mongoose.Types.ObjectId} [relatedProductId]
 * @property {string} [sendGridMessageId]
 * @property {Date} [sentAt]
 * @property {Date} [deliveredAt]
 * @property {Date} [failedAt]
 * @property {string} [failureReason]
 * @property {number} retryCount
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

const notificationSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      default: null,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    recipientEmail: {
      type: String,
      required: [true, 'Recipient email is required'],
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: [
        'order_confirmation',
        'new_order',
        'processing_update',
        'shipping_update',
        'delivery_confirmation',
        'order_cancellation',
        'low_stock',
        'low_stock_alert',
        'out_of_stock_alert',
        'daily_summary',
      ],
      required: [true, 'Notification type is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending',
    },
    relatedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    relatedProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    channel: {
      type: String,
      enum: ['email', 'in_app'],
      default: 'email',
    },
    readAt: {
      type: Date,
      default: null,
    },
    sendGridMessageId: {
      type: String,
      trim: true,
    },
    sentAt: Date,
    deliveredAt: Date,
    failedAt: Date,
    failureReason: {
      type: String,
      trim: true,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
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
notificationSchema.index({ merchantId: 1, createdAt: -1 });
notificationSchema.index({ customerId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, retryCount: 1 });
notificationSchema.index({ sendGridMessageId: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
