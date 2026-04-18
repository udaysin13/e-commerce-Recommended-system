# API Reference Guide

## Base URL
```
http://localhost:5000
```

## Authentication

Most endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Get Token
```
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}

Response: 200
{
  "user": { "id": 1, "email": "user@example.com", "name": "John" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Recommendation Endpoints

### Get Hybrid Recommendations
Combines all recommendation algorithms for best results.

```
GET /recommendations/:userId/hybrid?limit=12
Authorization: Bearer <token>

Response: 200
{
  "recommendations": [
    {
      "id": 1,
      "name": "Product Name",
      "category": "Electronics",
      "price": 99.99,
      "rating": 4.5,
      "reviews": 150,
      "hybridScore": 87,
      "algorithm": "hybrid",
      "recommendedBecause": "Based on your browsing and purchase history"
    },
    ...
  ],
  "algorithm": "Hybrid (Content-based + Collaborative + Trending)",
  "userId": 1,
  "count": 12
}
```

**Query Parameters:**
- `limit` (optional): Number of recommendations (1-50, default: 12)

---

### Get Content-Based Recommendations
Recommends products similar to ones user has viewed or purchased.

```
GET /recommendations/:userId/content-based?limit=8
Authorization: Bearer <token>

Response: 200
{
  "recommendations": [
    {
      "id": 5,
      "name": "Similar Product",
      "category": "Electronics",
      "price": 89.99,
      "score": 78,
      "algorithm": "content-based",
      "recommendedBecause": "Based on your browsing and purchase history"
    },
    ...
  ],
  "algorithm": "Content-Based Filtering",
  "userId": 1,
  "count": 8
}
```

**How it works:**
- Analyzes recent product views and purchases
- Finds similar products by:
  - Same category
  - Similar price range
  - Similar ratings

---

### Get Collaborative Recommendations
Recommends products based on what similar users purchased.

```
GET /recommendations/:userId/collaborative?limit=8
Authorization: Bearer <token>

Response: 200
{
  "recommendations": [
    {
      "id": 10,
      "name": "Popular Among Similar Users",
      "category": "Books",
      "price": 25.99,
      "score": 82,
      "algorithm": "collaborative",
      "recommendedBecause": "Similar users bought this"
    },
    ...
  ],
  "algorithm": "Collaborative Filtering",
  "userId": 1,
  "count": 8
}
```

**How it works:**
- Finds users with similar purchase patterns
- Recommends their purchases
- Scores based on how many similar users bought it

---

### Get Category-Based Recommendations
Recommends top products from user's favorite categories.

```
GET /recommendations/:userId/category?limit=8
Authorization: Bearer <token>

Response: 200
{
  "recommendations": [
    {
      "id": 15,
      "name": "Top Rated in Category",
      "category": "Electronics",
      "price": 149.99,
      "rating": 4.7,
      "score": 94,
      "algorithm": "category-based",
      "recommendedBecause": "Popular in your favorite category: Electronics"
    },
    ...
  ],
  "algorithm": "Category-Based Recommendations",
  "userId": 1,
  "count": 8
}
```

---

### Get Popular Products
Returns highest-rated products (no auth required).

```
GET /recommendations/popular?limit=12

Response: 200
{
  "items": [
    {
      "id": 1,
      "name": "Best Seller",
      "rating": 4.8,
      "reviews": 500,
      "price": 79.99,
      "recommendedBecause": "Popular with all users"
    },
    ...
  ]
}
```

---

### Get Trending Products
Returns recently popular products (no auth required).

```
GET /recommendations/trending?limit=12

Response: 200
{
  "items": [
    {
      "id": 20,
      "name": "Currently Trending",
      "createdAt": "2024-01-10T10:00:00Z",
      "views": 150,
      "purchases": 25,
      "score": 95,
      "recommendedBecause": "Trending now"
    },
    ...
  ]
}
```

---

## Product Endpoints

### Get All Products
```
GET /products?page=1&limit=10&search=laptop&category=Electronics&sort=newest&minPrice=100&maxPrice=2000
Authorization: Bearer <token>

Response: 200
{
  "items": [
    {
      "id": 1,
      "name": "Gaming Laptop",
      "category": "Electronics",
      "description": "High-performance laptop for gaming",
      "price": 999.99,
      "discount": 10,
      "originalPrice": 999.99,
      "discountedPrice": 899.99,
      "rating": 4.5,
      "reviews": 120,
      "inStock": true,
      "imageUrl": "https://example.com/image.jpg"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-100, default: 10)
- `search` (optional): Search by name or description
- `category` (optional): Filter by category
- `sort` (optional): newest|price_asc|price_desc|rating|popularity
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `inStock` (optional): true|false

---

### Get Product by ID
```
GET /products/:id
Authorization: Bearer <token>

Response: 200
{
  "id": 1,
  "name": "Gaming Laptop",
  "category": "Electronics",
  "price": 999.99,
  "discount": 10,
  "discountedPrice": 899.99,
  "rating": 4.5,
  "reviews": 120,
  "inStock": true,
  "description": "...",
  "imageUrl": "..."
}
```

**Errors:**
- `404`: Product not found

---

## Cart Endpoints

### Get Cart
```
GET /cart/:userId
Authorization: Bearer <token>

Response: 200
{
  "id": 1,
  "userId": 1,
  "items": [
    {
      "id": 10,
      "productId": 5,
      "product": { "id": 5, "name": "Product", "price": 29.99 },
      "quantity": 2,
      "subtotal": 59.98
    },
    ...
  ],
  "total": 89.97,
  "itemCount": 2
}
```

---

### Add to Cart
```
POST /cart/:userId/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 5,
  "quantity": 2
}

Response: 201
{
  "id": 10,
  "cartId": 1,
  "productId": 5,
  "quantity": 2
}
```

---

### Update Cart Item
```
PUT /cart/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}

Response: 200
{
  "id": 10,
  "quantity": 3
}
```

---

### Remove from Cart
```
DELETE /cart/items/:itemId
Authorization: Bearer <token>

Response: 200
{
  "message": "Cart item removed successfully"
}
```

---

## Order Endpoints

### Get User Orders
```
GET /orders/:userId
Authorization: Bearer <token>

Response: 200
{
  "orders": [
    {
      "id": 1,
      "userId": 1,
      "total": 149.99,
      "status": "completed",
      "createdAt": "2024-01-15T10:00:00Z",
      "items": [
        {
          "id": 1,
          "productId": 5,
          "quantity": 2,
          "price": 29.99
        },
        ...
      ]
    },
    ...
  ]
}
```

---

### Create Order
```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "items": [
    {
      "productId": 5,
      "quantity": 2
    },
    {
      "productId": 10,
      "quantity": 1
    }
  ]
}

Response: 201
{
  "id": 1,
  "userId": 1,
  "total": 89.97,
  "status": "pending",
  "items": [
    {
      "id": 1,
      "productId": 5,
      "quantity": 2,
      "price": 29.99
    },
    ...
  ]
}
```

---

### Get Order Details
```
GET /orders/:orderId
Authorization: Bearer <token>

Response: 200
{
  "id": 1,
  "userId": 1,
  "total": 89.97,
  "status": "pending",
  "createdAt": "2024-01-15T10:00:00Z",
  "items": [
    {
      "id": 1,
      "productId": 5,
      "quantity": 2,
      "price": 29.99
    },
    ...
  ]
}
```

---

## User Endpoints

### Register
```
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}

Response: 201
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Validations:**
- Email must be valid format
- Password min 8 chars, must contain uppercase, lowercase, number
- Name min 2 characters

---

### Login
```
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response: 200
{
  "user": { "id": 1, "email": "user@example.com", "name": "John" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Get Profile
```
GET /users/:userId
Authorization: Bearer <token>

Response: 200
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "555-1234",
  "createdAt": "2024-01-10T10:00:00Z"
}
```

---

### Update Profile
```
PUT /users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "555-5678"
}

Response: 200
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Smith",
  "phone": "555-5678"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid pagination parameters",
  "statusCode": 400,
  "details": ["Page must be a positive integer"]
}
```

### 401 Unauthorized
```json
{
  "error": "Authorization token is required",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "error": "You can only access your own account data",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "error": "Product not found",
  "statusCode": 404
}
```

### 409 Conflict
```json
{
  "error": "email already exists",
  "statusCode": 409
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "statusCode": 500
}
```

---

## Rate Limiting

The API enforces rate limiting:
- **Window**: 15 minutes
- **Limit**: 100 requests per IP

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Response Headers

All responses include:
```
Content-Type: application/json
X-Request-ID: unique-request-id
X-Response-Time: 45ms
```

---

## Pagination

For paginated endpoints:

```
GET /products?page=2&limit=10
```

Response includes:
```json
{
  "items": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

## Status Codes

- `200 OK`: Successful GET/PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: No permission
- `404 Not Found`: Resource not found
- `409 Conflict`: Constraint violation
- `500 Internal Server Error`: Server error

---

**Last Updated**: 2024

