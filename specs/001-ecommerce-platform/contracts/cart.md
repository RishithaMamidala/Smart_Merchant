# API Contract: Cart

**Base URL**: `/api/cart`

## Cart Identification

Carts are identified by:
- **Authenticated customers**: `customerId` from JWT token
- **Guest users**: `sessionId` from cookie or header (`X-Session-ID`)

The system automatically merges carts when a guest user logs in.

---

## Endpoints

### GET /api/cart

Get current cart.

**Headers** (for guests): `X-Session-ID: <uuid>`

**Response 200**:
```json
{
  "cart": {
    "id": "64a7b8c9d0e1f2a3b4c5d6e7",
    "items": [
      {
        "id": "item_123",
        "variantId": "64a7b8c9d0e1f2a3b4c5d6e8",
        "productId": "64a7b8c9d0e1f2a3b4c5d6e9",
        "product": {
          "name": "Classic T-Shirt",
          "slug": "classic-t-shirt",
          "image": "https://res.cloudinary.com/..."
        },
        "variant": {
          "sku": "TSH-WHT-M",
          "optionValues": [
            { "name": "Size", "value": "M" },
            { "name": "Color", "value": "White" }
          ],
          "price": 2999,
          "inventory": 23,
          "inStock": true
        },
        "quantity": 2,
        "unitPrice": 2999,
        "totalPrice": 5998
      }
    ],
    "itemCount": 2,
    "subtotal": 5998,
    "currency": "USD"
  }
}
```

**Response 200 (empty cart)**:
```json
{
  "cart": {
    "id": null,
    "items": [],
    "itemCount": 0,
    "subtotal": 0,
    "currency": "USD"
  }
}
```

---

### POST /api/cart/items

Add item to cart.

**Request Body**:
```json
{
  "variantId": "64a7b8c9d0e1f2a3b4c5d6e8",
  "quantity": 1
}
```

**Response 200**:
```json
{
  "cart": { ... },
  "addedItem": {
    "variantId": "64a7b8c9d0e1f2a3b4c5d6e8",
    "quantity": 1,
    "product": {
      "name": "Classic T-Shirt"
    }
  }
}
```

**Response 400**:
```json
{
  "error": "INSUFFICIENT_INVENTORY",
  "message": "Only 5 items available",
  "available": 5
}
```

**Response 404**: Variant not found or inactive

---

### PATCH /api/cart/items/:variantId

Update item quantity.

**Request Body**:
```json
{
  "quantity": 3
}
```

**Response 200**: Updated cart

**Response 400**:
```json
{
  "error": "INSUFFICIENT_INVENTORY",
  "message": "Only 5 items available",
  "available": 5
}
```

**Response 400** (quantity = 0):
```json
{
  "error": "INVALID_QUANTITY",
  "message": "Use DELETE to remove items"
}
```

---

### DELETE /api/cart/items/:variantId

Remove item from cart.

**Response 200**: Updated cart

---

### DELETE /api/cart

Clear entire cart.

**Response 200**:
```json
{
  "message": "Cart cleared",
  "cart": {
    "id": null,
    "items": [],
    "itemCount": 0,
    "subtotal": 0
  }
}
```

---

### POST /api/cart/validate

Validate cart before checkout (check all items still available).

**Response 200** (all items valid):
```json
{
  "valid": true,
  "cart": { ... }
}
```

**Response 200** (some items invalid):
```json
{
  "valid": false,
  "issues": [
    {
      "variantId": "64a7b8c9d0e1f2a3b4c5d6e8",
      "type": "INSUFFICIENT_INVENTORY",
      "requestedQuantity": 10,
      "availableQuantity": 3,
      "product": {
        "name": "Classic T-Shirt",
        "variant": "M / White"
      }
    },
    {
      "variantId": "64a7b8c9d0e1f2a3b4c5d6e9",
      "type": "PRODUCT_UNAVAILABLE",
      "product": {
        "name": "Vintage Hoodie",
        "variant": "L / Gray"
      }
    }
  ],
  "cart": { ... }
}
```

---

## Cart Merge (on login)

When a customer with a guest cart logs in:

1. System checks if customer has existing cart
2. If no existing cart: guest cart is assigned to customer
3. If existing cart:
   - Items from guest cart are merged into customer cart
   - Quantities are summed if same variant exists in both
   - Inventory limits are respected
   - Guest cart is deleted

This happens automatically on `/api/auth/customer/login` if `X-Session-ID` header is present.

---

## Inventory Reservation

When items are added to cart:
- Inventory is NOT reserved immediately
- Reservation happens only during checkout process
- Cart validation checks real-time inventory

This prevents inventory being locked by abandoned carts while ensuring accurate availability display.

---

## Cart Expiration

- Guest carts expire after 7 days of inactivity
- Customer carts never expire (but can be cleared manually)
- Expired carts are cleaned up by daily cron job
