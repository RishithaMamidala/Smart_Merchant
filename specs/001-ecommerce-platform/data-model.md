# Data Model: Smart Merchant Command Center

**Date**: 2026-02-03
**Database**: MongoDB (via Mongoose ODM)

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Merchant   │───────│   Product   │───────│   Variant   │
└─────────────┘   1:N └─────────────┘   1:N └─────────────┘
                            │                      │
                            │ N:1                  │
                            ▼                      │
                      ┌─────────────┐              │
                      │  Category   │              │
                      └─────────────┘              │
                                                   │
┌─────────────┐       ┌─────────────┐              │
│  Customer   │───────│    Order    │──────────────┘
└─────────────┘   1:N └─────────────┘   (via OrderItem)
      │                     │
      │ 1:1                 │ 1:N
      ▼                     ▼
┌─────────────┐       ┌─────────────┐
│    Cart     │       │  OrderItem  │
└─────────────┘       └─────────────┘
      │
      │ 1:N
      ▼
┌─────────────┐
│  CartItem   │
└─────────────┘

┌─────────────┐
│ Notification│ (references Merchant or Customer)
└─────────────┘
```

## Schemas

### Merchant

```javascript
/**
 * Merchant Schema
 * @typedef {Object} Merchant
 * @property {ObjectId} _id
 * @property {string} email - unique, indexed
 * @property {string} passwordHash
 * @property {string} storeName
 * @property {string} [storeDescription]
 * @property {string} [logo] - Cloudinary URL
 * @property {Object} notificationPreferences
 * @property {boolean} notificationPreferences.lowStockAlerts - default: true
 * @property {boolean} notificationPreferences.dailySummary - default: true
 * @property {boolean} notificationPreferences.orderNotifications - default: true
 * @property {string} [stripeCustomerId] - for future billing
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// Indexes
{ email: 1 }  // unique
```

### Customer

```javascript
/**
 * Customer Schema
 * @typedef {Object} Customer
 * @property {ObjectId} _id
 * @property {string} email - unique, indexed
 * @property {string} [passwordHash] - null for guest customers
 * @property {boolean} isGuest - default: false
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [phone]
 * @property {Address[]} addresses
 * @property {number} [defaultAddressIndex]
 * @property {string} [stripeCustomerId] - for saved payment methods
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Address Schema (embedded)
 * @typedef {Object} Address
 * @property {string} [label] - "Home", "Work", etc.
 * @property {string} line1
 * @property {string} [line2]
 * @property {string} city
 * @property {string} state
 * @property {string} postalCode
 * @property {string} country - ISO 3166-1 alpha-2
 * @property {boolean} isDefault
 */

// Indexes
{ email: 1 }  // unique
```

### Category

```javascript
/**
 * Category Schema
 * @typedef {Object} Category
 * @property {ObjectId} _id
 * @property {ObjectId} merchantId - ref: Merchant
 * @property {string} name
 * @property {string} slug - URL-friendly, unique per merchant
 * @property {string} [description]
 * @property {string} [image] - Cloudinary URL
 * @property {ObjectId} [parentId] - ref: Category (for subcategories)
 * @property {number} sortOrder - for display ordering
 * @property {boolean} isActive - default: true
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

// Indexes
{ merchantId: 1, slug: 1 }  // unique compound
{ merchantId: 1, isActive: 1 }
```

### Product

```javascript
/**
 * Product Schema
 * @typedef {Object} Product
 * @property {ObjectId} _id
 * @property {ObjectId} merchantId - ref: Merchant
 * @property {ObjectId} [categoryId] - ref: Category
 * @property {string} name
 * @property {string} slug - URL-friendly, unique per merchant
 * @property {string} description
 * @property {number} basePrice - in cents (e.g., 1999 = $19.99)
 * @property {ProductImage[]} images
 * @property {OptionType[]} optionTypes - e.g., ["Size", "Color"]
 * @property {'active'|'archived'} status - default: 'active'
 * @property {number} lowStockThreshold - default: 5
 * @property {string[]} [tags]
 * @property {string} [seoTitle]
 * @property {string} [seoDescription]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Product Image Schema (embedded)
 * @typedef {Object} ProductImage
 * @property {string} url - Cloudinary URL
 * @property {string} publicId - Cloudinary public ID for deletion
 * @property {string} [altText]
 * @property {number} sortOrder
 */

/**
 * Option Type Schema (embedded)
 * @typedef {Object} OptionType
 * @property {string} name - e.g., "Size"
 * @property {string[]} values - e.g., ["S", "M", "L", "XL"]
 */

// Indexes
{ merchantId: 1, slug: 1 }  // unique compound
{ merchantId: 1, status: 1 }
{ merchantId: 1, categoryId: 1, status: 1 }
{ name: 'text', description: 'text' }  // text search
```

### Variant

```javascript
/**
 * Variant Schema
 * @typedef {Object} Variant
 * @property {ObjectId} _id
 * @property {ObjectId} productId - ref: Product, indexed
 * @property {string} sku - unique per merchant
 * @property {OptionValue[]} optionValues - e.g., [{name: "Size", value: "M"}]
 * @property {number} [price] - override basePrice if set, in cents
 * @property {number} inventory - current stock quantity
 * @property {number} reservedInventory - held during checkout, default: 0
 * @property {number} [lowStockThreshold] - override product threshold if set
 * @property {string} [image] - variant-specific image (Cloudinary URL)
 * @property {number} [weight] - in grams, for shipping
 * @property {boolean} isActive - default: true
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Option Value Schema (embedded)
 * @typedef {Object} OptionValue
 * @property {string} name - e.g., "Size"
 * @property {string} value - e.g., "M"
 */

// Indexes
{ productId: 1 }
{ sku: 1 }  // unique
{ productId: 1, isActive: 1 }
{ inventory: 1 }  // for low stock queries
```

### Cart

```javascript
/**
 * Cart Schema
 * @typedef {Object} Cart
 * @property {ObjectId} _id
 * @property {ObjectId} [customerId] - ref: Customer (null for anonymous)
 * @property {string} [sessionId] - for anonymous carts
 * @property {CartItem[]} items
 * @property {Date} expiresAt - TTL: 7 days from last update
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Cart Item Schema (embedded)
 * @typedef {Object} CartItem
 * @property {ObjectId} variantId - ref: Variant
 * @property {ObjectId} productId - ref: Product (denormalized for queries)
 * @property {number} quantity
 * @property {number} priceAtAdd - price snapshot when added, in cents
 * @property {Date} addedAt
 */

// Indexes
{ customerId: 1 }
{ sessionId: 1 }
{ expiresAt: 1 }  // TTL index
```

### Order

```javascript
/**
 * Order Schema
 * @typedef {Object} Order
 * @property {ObjectId} _id
 * @property {string} orderNumber - human-readable, unique (e.g., "ORD-20260203-001")
 * @property {ObjectId} merchantId - ref: Merchant
 * @property {ObjectId} [customerId] - ref: Customer (null for guest)
 * @property {string} customerEmail - captured at checkout
 * @property {string} customerName
 * @property {OrderItem[]} items
 * @property {Address} shippingAddress
 * @property {Address} [billingAddress] - if different from shipping
 * @property {number} subtotal - in cents
 * @property {number} shippingCost - in cents
 * @property {number} taxAmount - in cents
 * @property {number} total - in cents
 * @property {OrderStatus} status
 * @property {PaymentStatus} paymentStatus
 * @property {string} [stripePaymentIntentId]
 * @property {string} [trackingNumber]
 * @property {string} [trackingCarrier]
 * @property {string} [notes] - merchant notes
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} [paidAt]
 * @property {Date} [shippedAt]
 * @property {Date} [deliveredAt]
 * @property {Date} [cancelledAt]
 */

/**
 * Order Item Schema (embedded)
 * @typedef {Object} OrderItem
 * @property {ObjectId} variantId - ref: Variant
 * @property {ObjectId} productId - ref: Product
 * @property {string} productName - snapshot at time of order
 * @property {string} variantName - e.g., "M / Blue"
 * @property {string} sku - snapshot
 * @property {number} quantity
 * @property {number} unitPrice - price at time of order, in cents
 * @property {number} totalPrice - quantity * unitPrice
 */

/**
 * Order Status
 * @typedef {'pending'|'processing'|'shipped'|'delivered'|'cancelled'} OrderStatus
 * - pending: just created
 * - processing: merchant started fulfillment
 * - shipped: handed to carrier
 * - delivered: confirmed delivery
 * - cancelled: cancelled by merchant
 */

/**
 * Payment Status
 * @typedef {'pending'|'paid'|'failed'|'refunded'} PaymentStatus
 * - pending: awaiting payment
 * - paid: payment confirmed
 * - failed: payment failed
 * - refunded: fully refunded
 */

// Indexes
{ orderNumber: 1 }  // unique
{ merchantId: 1, status: 1 }
{ merchantId: 1, createdAt: -1 }
{ customerId: 1, createdAt: -1 }
{ stripePaymentIntentId: 1 }
```

### Notification

```javascript
/**
 * Notification Schema
 * @typedef {Object} Notification
 * @property {ObjectId} _id
 * @property {ObjectId} [merchantId] - ref: Merchant
 * @property {ObjectId} [customerId] - ref: Customer
 * @property {string} recipientEmail
 * @property {NotificationType} type
 * @property {string} subject
 * @property {string} content - HTML or text
 * @property {NotificationStatus} status
 * @property {ObjectId} [relatedOrderId] - ref: Order
 * @property {ObjectId} [relatedProductId] - ref: Product
 * @property {string} [sendGridMessageId]
 * @property {Date} [sentAt]
 * @property {Date} [deliveredAt]
 * @property {Date} [failedAt]
 * @property {string} [failureReason]
 * @property {number} retryCount - default: 0
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Notification Type
 * @typedef {'order_confirmation'|'shipping_update'|'low_stock_alert'|'out_of_stock_alert'|'daily_summary'} NotificationType
 */

/**
 * Notification Status
 * @typedef {'pending'|'sent'|'delivered'|'failed'} NotificationStatus
 */

// Indexes
{ merchantId: 1, createdAt: -1 }
{ customerId: 1, createdAt: -1 }
{ status: 1, retryCount: 1 }  // for retry queries
{ sendGridMessageId: 1 }
```

## State Transitions

### Order Status Flow

```
                    ┌──────────────┐
                    │   pending    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            │
       ┌──────────┐  ┌──────────┐      │
       │cancelled │  │processing│      │
       └──────────┘  └────┬─────┘      │
                          │            │
                          ▼            │
                    ┌──────────┐       │
                    │  shipped │───────┤
                    └────┬─────┘       │
                         │             │
                         ▼             │
                   ┌───────────┐       │
                   │ delivered │       │
                   └───────────┘       │
                                       │
              cancelled ◄──────────────┘
              (from any state except delivered)
```

### Inventory Flow

```
                    Variant.inventory
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   Add to Cart      Complete Order      Cancel Order
   (reserve)         (deduct)           (restore)
        │                  │                  │
        ▼                  ▼                  ▼
 reservedInventory   inventory -= qty   inventory += qty
      += qty
        │
        ▼
   Cart Expires
   (release)
        │
        ▼
 reservedInventory
      -= qty
```

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| Merchant | email | valid email format, unique |
| Customer | email | valid email format, unique |
| Product | basePrice | >= 0 |
| Product | name | 1-200 characters |
| Variant | sku | alphanumeric + dashes, unique |
| Variant | inventory | >= 0 |
| Variant | price | > 0 if set |
| Order | total | > 0 |
| CartItem | quantity | >= 1 |

## Indexes Summary

```javascript
// Merchant
db.merchants.createIndex({ email: 1 }, { unique: true });

// Customer
db.customers.createIndex({ email: 1 }, { unique: true });

// Category
db.categories.createIndex({ merchantId: 1, slug: 1 }, { unique: true });
db.categories.createIndex({ merchantId: 1, isActive: 1 });

// Product
db.products.createIndex({ merchantId: 1, slug: 1 }, { unique: true });
db.products.createIndex({ merchantId: 1, status: 1 });
db.products.createIndex({ merchantId: 1, categoryId: 1, status: 1 });
db.products.createIndex({ name: "text", description: "text" });

// Variant
db.variants.createIndex({ productId: 1 });
db.variants.createIndex({ sku: 1 }, { unique: true });
db.variants.createIndex({ productId: 1, isActive: 1 });
db.variants.createIndex({ inventory: 1 });

// Cart
db.carts.createIndex({ customerId: 1 });
db.carts.createIndex({ sessionId: 1 });
db.carts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Order
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ merchantId: 1, status: 1 });
db.orders.createIndex({ merchantId: 1, createdAt: -1 });
db.orders.createIndex({ customerId: 1, createdAt: -1 });
db.orders.createIndex({ stripePaymentIntentId: 1 });

// Notification
db.notifications.createIndex({ merchantId: 1, createdAt: -1 });
db.notifications.createIndex({ customerId: 1, createdAt: -1 });
db.notifications.createIndex({ status: 1, retryCount: 1 });
db.notifications.createIndex({ sendGridMessageId: 1 });
```
