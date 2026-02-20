# API Contract: Analytics

**Base URL**: `/api/merchant/analytics`

**All endpoints require**: `Authorization: Bearer <merchantToken>`

---

## Dashboard Overview

### GET /api/merchant/analytics/dashboard

Get dashboard summary metrics.

**Response 200**:
```json
{
  "today": {
    "orders": 12,
    "revenue": 45980,
    "averageOrderValue": 3832
  },
  "yesterday": {
    "orders": 8,
    "revenue": 32500,
    "averageOrderValue": 4063
  },
  "thisWeek": {
    "orders": 45,
    "revenue": 178500,
    "averageOrderValue": 3967
  },
  "thisMonth": {
    "orders": 156,
    "revenue": 625400,
    "averageOrderValue": 4009
  },
  "pendingOrders": 5,
  "lowStockAlerts": 3,
  "outOfStockCount": 1,
  "currency": "USD"
}
```

---

## Sales Analytics

### GET /api/merchant/analytics/sales

Get sales data for charts.

**Query Parameters**:
- `period` (string, required): `day`, `week`, `month`, `year`
- `startDate` (string, optional): ISO date (defaults based on period)
- `endDate` (string, optional): ISO date (defaults to today)
- `groupBy` (string, optional): `day`, `week`, `month` (defaults based on period)

**Response 200**:
```json
{
  "period": {
    "start": "2026-01-01",
    "end": "2026-02-03"
  },
  "totals": {
    "orders": 450,
    "revenue": 1850000,
    "averageOrderValue": 4111,
    "itemsSold": 1234
  },
  "comparison": {
    "previousPeriod": {
      "orders": 380,
      "revenue": 1520000
    },
    "ordersChange": 18.4,
    "revenueChange": 21.7
  },
  "data": [
    {
      "date": "2026-01-01",
      "orders": 15,
      "revenue": 62500,
      "itemsSold": 42
    },
    {
      "date": "2026-01-02",
      "orders": 18,
      "revenue": 75000,
      "itemsSold": 51
    }
    // ... more data points
  ],
  "currency": "USD"
}
```

---

## Product Analytics

### GET /api/merchant/analytics/top-products

Get top-selling products.

**Query Parameters**:
- `period` (string, optional): `day`, `week`, `month`, `year`, `all` (default: `month`)
- `limit` (number, optional): Number of products (default: 10, max: 50)
- `sortBy` (string, optional): `revenue`, `quantity` (default: `revenue`)

**Response 200**:
```json
{
  "period": {
    "start": "2026-01-03",
    "end": "2026-02-03"
  },
  "products": [
    {
      "productId": "64a7b8c9d0e1f2a3b4c5d6e7",
      "name": "Classic T-Shirt",
      "slug": "classic-t-shirt",
      "image": "https://res.cloudinary.com/...",
      "totalQuantity": 156,
      "totalRevenue": 467844,
      "orderCount": 89,
      "averagePrice": 2999
    },
    {
      "productId": "64a7b8c9d0e1f2a3b4c5d6e8",
      "name": "Premium Hoodie",
      "slug": "premium-hoodie",
      "image": "https://res.cloudinary.com/...",
      "totalQuantity": 78,
      "totalRevenue": 389922,
      "orderCount": 65,
      "averagePrice": 4999
    }
    // ... more products
  ],
  "currency": "USD"
}
```

---

### GET /api/merchant/analytics/category-breakdown

Get sales by category.

**Query Parameters**:
- `period` (string, optional): Same as above

**Response 200**:
```json
{
  "period": {...},
  "categories": [
    {
      "categoryId": "64a7b8c9d0e1f2a3b4c5d6e7",
      "name": "Apparel",
      "revenue": 850000,
      "revenuePercentage": 45.9,
      "quantity": 320,
      "orderCount": 180
    },
    {
      "categoryId": "64a7b8c9d0e1f2a3b4c5d6e8",
      "name": "Accessories",
      "revenue": 520000,
      "revenuePercentage": 28.1,
      "quantity": 280,
      "orderCount": 150
    }
    // ...
  ],
  "currency": "USD"
}
```

---

## Inventory Analytics

### GET /api/merchant/analytics/inventory

Get inventory status overview.

**Response 200**:
```json
{
  "summary": {
    "totalProducts": 45,
    "totalVariants": 180,
    "totalInventory": 4500,
    "inventoryValue": 13500000,
    "inStock": 165,
    "lowStock": 12,
    "outOfStock": 3
  },
  "lowStockItems": [
    {
      "variantId": "64a7b8c9d0e1f2a3b4c5d6e7",
      "productId": "64a7b8c9d0e1f2a3b4c5d6e8",
      "productName": "Classic T-Shirt",
      "variantName": "M / White",
      "sku": "TSH-WHT-M",
      "inventory": 3,
      "threshold": 5,
      "image": "https://res.cloudinary.com/..."
    }
    // ... more low stock items
  ],
  "outOfStockItems": [
    {
      "variantId": "64a7b8c9d0e1f2a3b4c5d6e9",
      "productId": "64a7b8c9d0e1f2a3b4c5d6e0",
      "productName": "Premium Hoodie",
      "variantName": "XL / Black",
      "sku": "HOD-BLK-XL",
      "inventory": 0,
      "lastSoldAt": "2026-02-01T14:30:00Z",
      "image": "https://res.cloudinary.com/..."
    }
  ],
  "currency": "USD"
}
```

---

## Order Analytics

### GET /api/merchant/analytics/orders

Get order statistics.

**Query Parameters**:
- `period` (string, optional): Same as above

**Response 200**:
```json
{
  "period": {...},
  "totals": {
    "total": 450,
    "pending": 5,
    "processing": 12,
    "shipped": 28,
    "delivered": 398,
    "cancelled": 7
  },
  "rates": {
    "fulfillmentRate": 94.7,
    "cancellationRate": 1.6,
    "averageFulfillmentTime": 2.3
  },
  "byDay": [
    {
      "date": "2026-02-03",
      "orders": 12,
      "pending": 5,
      "processing": 3,
      "shipped": 4,
      "delivered": 0,
      "cancelled": 0
    }
    // ...
  ]
}
```

---

## Revenue Breakdown

### GET /api/merchant/analytics/revenue

Detailed revenue breakdown.

**Query Parameters**:
- `period` (string, optional): Same as above

**Response 200**:
```json
{
  "period": {...},
  "revenue": {
    "gross": 1850000,
    "shipping": 75000,
    "tax": 148000,
    "refunds": 25000,
    "net": 1602000
  },
  "averages": {
    "orderValue": 4111,
    "itemsPerOrder": 2.7,
    "ordersPerDay": 14.5
  },
  "currency": "USD"
}
```

---

## Data Retention

Per spec clarification: Analytics data is available for **12 months rolling history**.

Queries with `startDate` older than 12 months will return:
```json
{
  "error": "DATE_RANGE_EXCEEDED",
  "message": "Analytics data is available for the last 12 months only",
  "oldestAvailable": "2025-02-03"
}
```
