# API Contract: Authentication

**Base URL**: `/api/auth`

## Endpoints

### POST /api/auth/merchant/register

Register a new merchant account.

**Request Body**:
```json
{
  "email": "merchant@example.com",
  "password": "securePassword123",
  "storeName": "My Awesome Store"
}
```

**Response 201**:
```json
{
  "merchant": {
    "id": "64a7b8c9d0e1f2a3b4c5d6e7",
    "email": "merchant@example.com",
    "storeName": "My Awesome Store"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 400**: Validation error
**Response 409**: Email already exists

---

### POST /api/auth/merchant/login

Authenticate a merchant.

**Request Body**:
```json
{
  "email": "merchant@example.com",
  "password": "securePassword123"
}
```

**Response 200**:
```json
{
  "merchant": {
    "id": "64a7b8c9d0e1f2a3b4c5d6e7",
    "email": "merchant@example.com",
    "storeName": "My Awesome Store"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 401**: Invalid credentials

---

### POST /api/auth/customer/register

Register a new customer account.

**Request Body**:
```json
{
  "email": "customer@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response 201**:
```json
{
  "customer": {
    "id": "64a7b8c9d0e1f2a3b4c5d6e8",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 400**: Validation error
**Response 409**: Email already exists

---

### POST /api/auth/customer/login

Authenticate a customer.

**Request Body**:
```json
{
  "email": "customer@example.com",
  "password": "securePassword123"
}
```

**Response 200**:
```json
{
  "customer": {
    "id": "64a7b8c9d0e1f2a3b4c5d6e8",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 401**: Invalid credentials

---

### POST /api/auth/refresh

Refresh access token using refresh token cookie.

**Request**: Refresh token in httpOnly cookie

**Response 200**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 401**: Invalid or expired refresh token

---

### POST /api/auth/logout

Invalidate refresh token.

**Request**: Refresh token in httpOnly cookie

**Response 200**:
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me

Get current authenticated user.

**Headers**: `Authorization: Bearer <accessToken>`

**Response 200**:
```json
{
  "type": "merchant" | "customer",
  "user": {
    "id": "64a7b8c9d0e1f2a3b4c5d6e7",
    "email": "user@example.com",
    // ... other fields based on type
  }
}
```

**Response 401**: Not authenticated

## Authentication Flow

1. User logs in with credentials
2. Server returns `accessToken` (15min expiry) in response body
3. Server sets `refreshToken` (7d expiry) in httpOnly cookie
4. Client stores accessToken in memory (not localStorage)
5. Client includes `Authorization: Bearer <token>` on protected requests
6. When accessToken expires, client calls `/refresh` to get new one
7. On logout, refresh token is invalidated server-side

## Security Notes

- Passwords hashed with bcrypt (cost factor 12)
- Access tokens: JWT, 15min expiry
- Refresh tokens: JWT, 7d expiry, stored in httpOnly cookie
- Rate limit: 5 login attempts per minute per IP
