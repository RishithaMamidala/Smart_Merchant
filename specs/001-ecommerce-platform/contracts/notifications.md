# API Contract: Notifications

**Base URL**: `/api/notifications`

## Notification Types

| Type | Recipient | Trigger |
|------|-----------|---------|
| `order_confirmation` | Customer | Payment succeeded |
| `shipping_update` | Customer | Order marked as shipped |
| `low_stock_alert` | Merchant | Variant inventory ≤ threshold |
| `out_of_stock_alert` | Merchant | Variant inventory = 0 |
| `daily_summary` | Merchant | Daily cron job (23:59 UTC) |

---

## Merchant Endpoints

**All require**: `Authorization: Bearer <merchantToken>`

### GET /api/merchant/notifications

Get merchant's notification history.

**Query Parameters**:
- `type` (string, optional): Filter by notification type
- `status` (string, optional): `pending`, `sent`, `delivered`, `failed`
- `startDate`, `endDate` (string, optional): Date range
- `page`, `limit`: Pagination

**Response 200**:
```json
{
  "notifications": [
    {
      "id": "64a7b8c9d0e1f2a3b4c5d6e7",
      "type": "low_stock_alert",
      "subject": "Low Stock Alert: Classic T-Shirt (M / White)",
      "status": "delivered",
      "recipientEmail": "merchant@example.com",
      "relatedProduct": {
        "id": "64a7b8c9d0e1f2a3b4c5d6e8",
        "name": "Classic T-Shirt",
        "variantName": "M / White"
      },
      "createdAt": "2026-02-03T10:30:00Z",
      "sentAt": "2026-02-03T10:30:05Z",
      "deliveredAt": "2026-02-03T10:30:10Z"
    }
  ],
  "pagination": {...}
}
```

---

### GET /api/merchant/notifications/preferences

Get notification preferences.

**Response 200**:
```json
{
  "preferences": {
    "lowStockAlerts": true,
    "outOfStockAlerts": true,
    "orderNotifications": true,
    "dailySummary": true,
    "email": "merchant@example.com"
  }
}
```

---

### PUT /api/merchant/notifications/preferences

Update notification preferences.

**Request Body**:
```json
{
  "lowStockAlerts": true,
  "outOfStockAlerts": true,
  "orderNotifications": false,
  "dailySummary": true
}
```

**Response 200**: Updated preferences

---

### POST /api/merchant/notifications/:id/retry

Retry a failed notification.

**Response 200**:
```json
{
  "notification": {
    "id": "64a7b8c9d0e1f2a3b4c5d6e7",
    "status": "pending",
    "retryCount": 1
  }
}
```

**Response 400**:
```json
{
  "error": "MAX_RETRIES_EXCEEDED",
  "message": "Notification has already been retried 3 times"
}
```

---

## Internal/System Endpoints

### POST /api/cron/daily-summary

Trigger daily summary generation (called by Render Cron).

**Headers**: `X-Cron-Secret: <secret>`

**Response 200**:
```json
{
  "processed": 1,
  "sent": 1,
  "failed": 0
}
```

---

### POST /api/cron/retry-failed

Retry failed notifications (called by Render Cron, optional).

**Headers**: `X-Cron-Secret: <secret>`

**Response 200**:
```json
{
  "processed": 3,
  "retried": 2,
  "permanentlyFailed": 1
}
```

---

### POST /api/cron/cleanup-carts

Clean up expired carts (called by Render Cron).

**Headers**: `X-Cron-Secret: <secret>`

**Response 200**:
```json
{
  "deletedCarts": 15
}
```

---

## Email Templates (SendGrid Dynamic Templates)

### Order Confirmation

**Template Variables**:
```json
{
  "customerName": "John Doe",
  "orderNumber": "ORD-20260203-001",
  "orderDate": "February 3, 2026",
  "items": [
    {
      "name": "Classic T-Shirt (M / White)",
      "quantity": 2,
      "price": "$29.99",
      "total": "$59.98"
    }
  ],
  "subtotal": "$59.98",
  "shipping": "$5.00",
  "tax": "$5.00",
  "total": "$69.98",
  "shippingAddress": {
    "line1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94102"
  },
  "orderUrl": "https://store.example.com/orders/ORD-20260203-001"
}
```

### Shipping Update

**Template Variables**:
```json
{
  "customerName": "John Doe",
  "orderNumber": "ORD-20260203-001",
  "trackingNumber": "1Z999AA10123456784",
  "trackingCarrier": "UPS",
  "trackingUrl": "https://www.ups.com/track?tracknum=1Z999AA10123456784",
  "items": [...],
  "shippingAddress": {...}
}
```

### Low Stock Alert

**Template Variables**:
```json
{
  "merchantName": "My Store",
  "productName": "Classic T-Shirt",
  "variantName": "M / White",
  "sku": "TSH-WHT-M",
  "currentInventory": 3,
  "threshold": 5,
  "productUrl": "https://dashboard.example.com/products/64a7b8c9..."
}
```

### Out of Stock Alert

**Template Variables**:
```json
{
  "merchantName": "My Store",
  "productName": "Classic T-Shirt",
  "variantName": "M / White",
  "sku": "TSH-WHT-M",
  "lastSoldAt": "February 3, 2026 at 2:30 PM",
  "productUrl": "https://dashboard.example.com/products/64a7b8c9..."
}
```

### Daily Summary

**Template Variables**:
```json
{
  "merchantName": "My Store",
  "date": "February 3, 2026",
  "summary": {
    "ordersToday": 12,
    "revenueToday": "$459.80",
    "pendingOrders": 5,
    "lowStockCount": 3,
    "outOfStockCount": 1
  },
  "topProducts": [
    {
      "name": "Classic T-Shirt",
      "quantity": 8,
      "revenue": "$239.92"
    }
  ],
  "alerts": [
    {
      "type": "low_stock",
      "message": "Classic T-Shirt (M / White) has only 3 units left"
    }
  ],
  "dashboardUrl": "https://dashboard.example.com/"
}
```

---

## Retry Policy

| Attempt | Delay | Max Attempts |
|---------|-------|--------------|
| 1 | Immediate | - |
| 2 | 5 minutes | - |
| 3 | 30 minutes | - |
| 4 | 2 hours | Final |

After 4 failed attempts, notification is marked as `permanently_failed` and logged for merchant visibility.
