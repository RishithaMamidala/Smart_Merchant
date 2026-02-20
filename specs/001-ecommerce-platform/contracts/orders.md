# API Contract: Orders

**Base URL**: `/api/orders`

## Checkout Flow

```
1. POST /api/checkout/start     → Create payment intent, reserve inventory
2. Customer completes Stripe UI → Stripe confirms payment
3. Webhook: payment_intent.succeeded → Create order, deduct inventory
4. GET /api/orders/:orderNumber → Customer views confirmation
```

---

## Checkout Endpoints

### POST /api/checkout/start

Initialize checkout session.

**Request Body**:
```json
{
  "shippingAddress": {
    "line1": "123 Main St",
    "line2": "Apt 4",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94102",
    "country": "US"
  },
  "customerEmail": "customer@example.com",
  "customerName": "John Doe"
}
```

**Response 200**:
```json
{
  "checkoutSession": {
    "id": "cs_64a7b8c9d0e1f2a3b4c5d6e7",
    "clientSecret": "pi_xxx_secret_xxx",
    "amount": 6998,
    "currency": "usd",
    "items": [
      {
        "name": "Classic T-Shirt (M / White)",
        "quantity": 2,
        "unitPrice": 2999,
        "totalPrice": 5998
      }
    ],
    "subtotal": 5998,
    "shippingCost": 500,
    "taxAmount": 500,
    "total": 6998
  }
}
```

**Response 400**:
```json
{
  "error": "CART_EMPTY",
  "message": "Cannot checkout with empty cart"
}
```

**Response 400**:
```json
{
  "error": "INVENTORY_CHANGED",
  "message": "Some items are no longer available",
  "issues": [...]
}
```

---

### POST /api/checkout/cancel

Cancel checkout and release reserved inventory.

**Request Body**:
```json
{
  "checkoutSessionId": "cs_64a7b8c9d0e1f2a3b4c5d6e7"
}
```

**Response 200**:
```json
{
  "message": "Checkout cancelled"
}
```

---

### POST /api/webhooks/stripe

Stripe webhook endpoint (secured with webhook signature).

Handles:
- `payment_intent.succeeded`: Create order, deduct inventory, send confirmation
- `payment_intent.payment_failed`: Release reserved inventory, log failure

**Response 200**: `{ received: true }`

---

## Customer Order Endpoints

### GET /api/orders/:orderNumber

Get order details (for confirmation page, email link).

**Query Parameters**:
- `email` (string, required for guest orders): Customer email for verification

**Response 200**:
```json
{
  "order": {
    "orderNumber": "ORD-20260203-001",
    "status": "pending",
    "paymentStatus": "paid",
    "items": [
      {
        "productName": "Classic T-Shirt",
        "variantName": "M / White",
        "sku": "TSH-WHT-M",
        "quantity": 2,
        "unitPrice": 2999,
        "totalPrice": 5998
      }
    ],
    "shippingAddress": {...},
    "subtotal": 5998,
    "shippingCost": 500,
    "taxAmount": 500,
    "total": 6998,
    "trackingNumber": null,
    "trackingCarrier": null,
    "createdAt": "2026-02-03T10:30:00Z",
    "paidAt": "2026-02-03T10:31:00Z",
    "shippedAt": null,
    "deliveredAt": null
  }
}
```

**Response 404**: Order not found
**Response 403**: Email doesn't match (guest orders)

---

### GET /api/customer/orders

Get customer's order history (authenticated).

**Query Parameters**:
- `status` (string, optional): Filter by status
- `page`, `limit`: Pagination

**Response 200**:
```json
{
  "orders": [
    {
      "orderNumber": "ORD-20260203-001",
      "status": "shipped",
      "total": 6998,
      "itemCount": 2,
      "createdAt": "2026-02-03T10:30:00Z",
      "trackingNumber": "1Z999AA10123456784"
    }
  ],
  "pagination": {...}
}
```

---

## Merchant Order Endpoints

**All require**: `Authorization: Bearer <merchantToken>`

### GET /api/merchant/orders

List all orders.

**Query Parameters**:
- `status` (string, optional): `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- `paymentStatus` (string, optional): `pending`, `paid`, `failed`, `refunded`
- `search` (string, optional): Search by order number, customer email, name
- `startDate`, `endDate` (string, optional): ISO date range
- `sort` (string, optional): `newest` (default), `oldest`, `total_desc`, `total_asc`
- `page`, `limit`: Pagination

**Response 200**:
```json
{
  "orders": [
    {
      "orderNumber": "ORD-20260203-001",
      "customerEmail": "customer@example.com",
      "customerName": "John Doe",
      "status": "pending",
      "paymentStatus": "paid",
      "itemCount": 2,
      "total": 6998,
      "createdAt": "2026-02-03T10:30:00Z"
    }
  ],
  "pagination": {...},
  "summary": {
    "pending": 5,
    "processing": 3,
    "shipped": 12,
    "delivered": 45,
    "cancelled": 2
  }
}
```

---

### GET /api/merchant/orders/:orderNumber

Get full order details.

**Response 200**:
```json
{
  "order": {
    "orderNumber": "ORD-20260203-001",
    "customerId": "64a7b8c9d0e1f2a3b4c5d6e7",
    "customerEmail": "customer@example.com",
    "customerName": "John Doe",
    "status": "pending",
    "paymentStatus": "paid",
    "items": [
      {
        "variantId": "...",
        "productId": "...",
        "productName": "Classic T-Shirt",
        "variantName": "M / White",
        "sku": "TSH-WHT-M",
        "quantity": 2,
        "unitPrice": 2999,
        "totalPrice": 5998
      }
    ],
    "shippingAddress": {...},
    "billingAddress": {...},
    "subtotal": 5998,
    "shippingCost": 500,
    "taxAmount": 500,
    "total": 6998,
    "stripePaymentIntentId": "pi_xxx",
    "trackingNumber": null,
    "trackingCarrier": null,
    "notes": null,
    "createdAt": "2026-02-03T10:30:00Z",
    "updatedAt": "2026-02-03T10:31:00Z",
    "paidAt": "2026-02-03T10:31:00Z",
    "shippedAt": null,
    "deliveredAt": null,
    "cancelledAt": null
  }
}
```

---

### PATCH /api/merchant/orders/:orderNumber/status

Update order status.

**Request Body**:
```json
{
  "status": "processing"
}
```

**Response 200**: Updated order

**Response 400**:
```json
{
  "error": "INVALID_TRANSITION",
  "message": "Cannot change status from 'delivered' to 'processing'"
}
```

---

### PATCH /api/merchant/orders/:orderNumber/ship

Mark order as shipped with tracking info.

**Request Body**:
```json
{
  "trackingNumber": "1Z999AA10123456784",
  "trackingCarrier": "UPS"
}
```

**Response 200**: Updated order (status: shipped)

Triggers: Shipping notification to customer

---

### PATCH /api/merchant/orders/:orderNumber/deliver

Mark order as delivered.

**Response 200**: Updated order (status: delivered)

---

### PATCH /api/merchant/orders/:orderNumber/cancel

Cancel order and restore inventory.

**Request Body**:
```json
{
  "reason": "Customer requested cancellation"
}
```

**Response 200**: Updated order (status: cancelled)

**Response 400**:
```json
{
  "error": "CANNOT_CANCEL",
  "message": "Cannot cancel delivered orders"
}
```

**Side Effects**:
- Inventory restored for all order items
- Refund initiated via Stripe (if paid)
- Cancellation notification sent to customer

---

### PATCH /api/merchant/orders/:orderNumber/notes

Add merchant notes to order.

**Request Body**:
```json
{
  "notes": "Customer requested gift wrapping"
}
```

**Response 200**: Updated order

---

## Order Number Format

Format: `ORD-YYYYMMDD-XXX`
- `ORD`: Prefix
- `YYYYMMDD`: Date
- `XXX`: Sequential number for that day (001, 002, ...)

Example: `ORD-20260203-015` (15th order on Feb 3, 2026)
