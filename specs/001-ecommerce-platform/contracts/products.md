# API Contract: Products

**Base URL**: `/api/products`

## Public Endpoints (Storefront)

### GET /api/products

List active products for storefront.

**Query Parameters**:
- `category` (string, optional): Filter by category slug
- `search` (string, optional): Search in name/description
- `sort` (string, optional): `price_asc`, `price_desc`, `newest`, `name` (default: `newest`)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)

**Response 200**:
```json
{
  "products": [
    {
      "id": "64a7b8c9d0e1f2a3b4c5d6e7",
      "name": "Classic T-Shirt",
      "slug": "classic-t-shirt",
      "description": "A comfortable cotton t-shirt",
      "basePrice": 2999,
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "altText": "Classic T-Shirt front view"
        }
      ],
      "category": {
        "id": "64a7b8c9d0e1f2a3b4c5d6e8",
        "name": "Apparel",
        "slug": "apparel"
      },
      "hasVariants": true,
      "inStock": true,
      "priceRange": {
        "min": 2999,
        "max": 3499
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### GET /api/products/:slug

Get single product with all variants.

**Response 200**:
```json
{
  "product": {
    "id": "64a7b8c9d0e1f2a3b4c5d6e7",
    "name": "Classic T-Shirt",
    "slug": "classic-t-shirt",
    "description": "A comfortable cotton t-shirt...",
    "basePrice": 2999,
    "images": [...],
    "category": {...},
    "optionTypes": [
      {
        "name": "Size",
        "values": ["S", "M", "L", "XL"]
      },
      {
        "name": "Color",
        "values": ["White", "Black", "Navy"]
      }
    ],
    "variants": [
      {
        "id": "64a7b8c9d0e1f2a3b4c5d6e9",
        "sku": "TSH-WHT-S",
        "optionValues": [
          { "name": "Size", "value": "S" },
          { "name": "Color", "value": "White" }
        ],
        "price": 2999,
        "inventory": 25,
        "inStock": true,
        "image": null
      },
      // ... more variants
    ]
  }
}
```

**Response 404**: Product not found

---

### GET /api/categories

List all active categories.

**Response 200**:
```json
{
  "categories": [
    {
      "id": "64a7b8c9d0e1f2a3b4c5d6e8",
      "name": "Apparel",
      "slug": "apparel",
      "description": "Clothing and accessories",
      "image": "https://res.cloudinary.com/...",
      "productCount": 45
    }
  ]
}
```

---

## Merchant Endpoints (Dashboard)

**All merchant endpoints require**: `Authorization: Bearer <merchantToken>`

### GET /api/merchant/products

List all merchant products (including archived).

**Query Parameters**:
- `status` (string, optional): `active`, `archived`, `all` (default: `all`)
- `category` (string, optional): Filter by category ID
- `search` (string, optional): Search in name/SKU
- `lowStock` (boolean, optional): Only products with low stock variants
- `page`, `limit`: Pagination

**Response 200**:
```json
{
  "products": [
    {
      "id": "64a7b8c9d0e1f2a3b4c5d6e7",
      "name": "Classic T-Shirt",
      "slug": "classic-t-shirt",
      "basePrice": 2999,
      "status": "active",
      "category": {...},
      "totalInventory": 150,
      "variantCount": 12,
      "lowStockVariants": 2,
      "images": [...],
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-03T15:30:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### GET /api/merchant/products/:id

Get full product details for editing.

**Response 200**:
```json
{
  "product": {
    "id": "64a7b8c9d0e1f2a3b4c5d6e7",
    "name": "Classic T-Shirt",
    "slug": "classic-t-shirt",
    "description": "...",
    "basePrice": 2999,
    "status": "active",
    "categoryId": "64a7b8c9d0e1f2a3b4c5d6e8",
    "images": [...],
    "optionTypes": [...],
    "lowStockThreshold": 5,
    "tags": ["cotton", "casual"],
    "seoTitle": "...",
    "seoDescription": "...",
    "variants": [
      {
        "id": "...",
        "sku": "TSH-WHT-S",
        "optionValues": [...],
        "price": 2999,
        "inventory": 25,
        "reservedInventory": 2,
        "lowStockThreshold": null,
        "image": null,
        "weight": 200,
        "isActive": true
      }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### POST /api/merchant/products

Create a new product.

**Request Body**:
```json
{
  "name": "Classic T-Shirt",
  "description": "A comfortable cotton t-shirt...",
  "basePrice": 2999,
  "categoryId": "64a7b8c9d0e1f2a3b4c5d6e8",
  "images": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "products/abc123",
      "altText": "Front view"
    }
  ],
  "optionTypes": [
    {
      "name": "Size",
      "values": ["S", "M", "L", "XL"]
    },
    {
      "name": "Color",
      "values": ["White", "Black"]
    }
  ],
  "lowStockThreshold": 5,
  "tags": ["cotton", "casual"],
  "variants": [
    {
      "sku": "TSH-WHT-S",
      "optionValues": [
        { "name": "Size", "value": "S" },
        { "name": "Color", "value": "White" }
      ],
      "price": null,
      "inventory": 50,
      "weight": 200
    }
    // ... more variants
  ]
}
```

**Response 201**:
```json
{
  "product": { ... }
}
```

**Response 400**: Validation error
**Response 409**: Slug already exists

---

### PUT /api/merchant/products/:id

Update a product.

**Request Body**: Same as POST (partial update supported)

**Response 200**: Updated product
**Response 404**: Product not found

---

### PATCH /api/merchant/products/:id/archive

Archive (soft delete) a product.

**Response 200**:
```json
{
  "product": {
    "id": "...",
    "status": "archived"
  }
}
```

---

### PATCH /api/merchant/products/:id/restore

Restore an archived product.

**Response 200**:
```json
{
  "product": {
    "id": "...",
    "status": "active"
  }
}
```

---

### PUT /api/merchant/products/:id/variants/:variantId

Update a single variant.

**Request Body**:
```json
{
  "sku": "TSH-WHT-S",
  "price": 2999,
  "inventory": 50,
  "lowStockThreshold": 10,
  "weight": 200,
  "isActive": true
}
```

**Response 200**: Updated variant

---

### PATCH /api/merchant/products/:id/variants/:variantId/inventory

Quick inventory update.

**Request Body**:
```json
{
  "adjustment": 10,
  "reason": "Restock shipment received"
}
```

**Response 200**:
```json
{
  "variant": {
    "id": "...",
    "inventory": 60,
    "previousInventory": 50
  }
}
```

---

## Merchant Category Endpoints

### GET /api/merchant/categories

List merchant's categories.

### POST /api/merchant/categories

Create category.

**Request Body**:
```json
{
  "name": "Apparel",
  "description": "Clothing and accessories",
  "image": "https://res.cloudinary.com/...",
  "parentId": null
}
```

### PUT /api/merchant/categories/:id

Update category.

### DELETE /api/merchant/categories/:id

Delete category (only if no products assigned).
