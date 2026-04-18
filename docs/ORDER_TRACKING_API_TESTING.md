# Order Tracking API Testing Guide

Complete testing guide with cURL examples and scenarios.

## Quick Start

### 1. Get Auth Token

```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'

# Save token
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 2. Create a Product

```bash
curl -X POST http://localhost:4000/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "price": 99.99,
    "stockQuantity": 100,
    "categoryId": "cat_123"
  }'

export PRODUCT_ID="prod_abc123"
```

### 3. Create an Order

```bash
# Buy now
curl -X POST http://localhost:4000/orders/buy-now \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "quantity": 1
  }'

# Save order ID
export ORDER_ID="ord_123abc"
```

## User Endpoints

### GET /order-tracking
List all orders for logged-in user

**Basic request:**
```bash
curl http://localhost:4000/order-tracking \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**With pagination:**
```bash
curl "http://localhost:4000/order-tracking?limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ord_123",
        "orderNumber": "ORD-1704067200000",
        "status": "PENDING",
        "paymentStatus": "PENDING",
        "totalAmount": "99.99",
        "currency": "USD",
        "placedAt": "2024-01-08T10:00:00Z",
        "estimatedDeliveryDate": null,
        "items": [
          {
            "productName": "Test Product",
            "quantity": 1
          }
        ]
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

### GET /order-tracking/:id
Get detailed order information

```bash
curl http://localhost:4000/order-tracking/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response includes:**
- Order details
- All items with product info
- Shipping address
- Payment info
- Tracking history (empty initially)

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ord_123",
      "orderNumber": "ORD-1234567890",
      "status": "PENDING",
      "paymentStatus": "PENDING",
      "totalAmount": "99.99",
      "items": [
        {
          "id": "item_1",
          "productName": "Test Product",
          "sku": "TEST-001",
          "quantity": 1,
          "unitPrice": "99.99",
          "totalPrice": "99.99",
          "product": {
            "id": "prod_123",
            "name": "Test Product",
            "imageUrl": "...",
            "price": "99.99"
          }
        }
      ],
      "trackingHistory": []
    }
  }
}
```

### GET /order-tracking/:id/tracking
Get tracking history timeline

```bash
curl http://localhost:4000/order-tracking/$ORDER_ID/tracking \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ord_123",
    "tracking": [
      {
        "id": "track_1",
        "status": "PENDING",
        "message": "Order has been placed and is awaiting confirmation",
        "note": null,
        "createdAt": "2024-01-08T10:00:00Z"
      }
    ],
    "totalEvents": 1
  }
}
```

### GET /order-tracking/stats
Get order statistics

```bash
curl http://localhost:4000/order-tracking/stats \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response shows count by status:**
```json
{
  "success": true,
  "data": {
    "PENDING": 5,
    "CONFIRMED": 3,
    "SHIPPED": 2,
    "DELIVERED": 15,
    "CANCELLED": 1
  }
}
```

## Admin Endpoints

### First, Create Admin User

```bash
# Register as admin (typically done in database directly)
# Or use admin registration endpoint if available

# For testing, we'll assume you have admin token
export ADMIN_TOKEN="admin_jwt_token_here"
```

### PATCH /order-tracking/admin/:id/status
Update order status (admin only)

**Simple status update:**
```bash
curl -X PATCH http://localhost:4000/order-tracking/admin/$ORDER_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED"
  }' | jq .
```

**Full update with tracking info:**
```bash
curl -X PATCH http://localhost:4000/order-tracking/admin/$ORDER_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "message": "Order has been shipped via FedEx",
    "note": "Sent from warehouse #2",
    "trackingNumber": "1Z999AA10123456784",
    "courierName": "FedEx",
    "estimatedDeliveryDate": "2024-01-15T00:00:00Z"
  }' | jq .
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ord_123",
      "status": "SHIPPED",
      "trackingNumber": "1Z999AA10123456784",
      "courierName": "FedEx",
      "estimatedDeliveryDate": "2024-01-15T00:00:00Z",
      "trackingHistory": [
        {
          "status": "SHIPPED",
          "message": "Order has been shipped via FedEx",
          "createdAt": "2024-01-08T11:00:00Z"
        }
      ]
    },
    "message": "Order status updated to SHIPPED"
  }
}
```

### GET /order-tracking/admin
Get all orders (admin view)

```bash
curl "http://localhost:4000/order-tracking/admin?limit=50&offset=0" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

**With status filter:**
```bash
curl "http://localhost:4000/order-tracking/admin?status=SHIPPED&limit=50" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

**Response includes user info:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ord_123",
        "orderNumber": "ORD-1234567890",
        "status": "SHIPPED",
        "user": {
          "id": "user_1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "items": [
          {
            "productName": "Test Product",
            "quantity": 1,
            "unitPrice": "99.99"
          }
        ]
      }
    ],
    "total": 25,
    "limit": 50,
    "offset": 0
  }
}
```

### GET /order-tracking/admin/:id
Get full order details (admin view)

```bash
curl http://localhost:4000/order-tracking/admin/$ORDER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

## Complete Test Workflow

### Scenario: Order Through Delivery

```bash
#!/bin/bash

API="http://localhost:4000"
USER_TOKEN="user_token_here"
ADMIN_TOKEN="admin_token_here"

# 1. User views their orders
echo "1. User views orders list"
curl "$API/order-tracking" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.data.orders[0]'

# 2. User clicks on specific order
echo "2. User views order details"
curl "$API/order-tracking/$ORDER_ID" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.data.order | {orderNumber, status, totalAmount}'

# 3. Admin confirms order
echo "3. Admin confirms order"
curl -X PATCH "$API/order-tracking/admin/$ORDER_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED", "message": "Order confirmed"}' | jq '.data.order.status'

# 4. Check tracking history
echo "4. User checks tracking timeline"
curl "$API/order-tracking/$ORDER_ID/tracking" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.data.tracking[0]'

# 5. Admin marks as packed
echo "5. Admin marks order as packed"
curl -X PATCH "$API/order-tracking/admin/$ORDER_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PACKED"}' | jq '.data.order.status'

# 6. Admin ships order
echo "6. Admin ships order with tracking"
curl -X PATCH "$API/order-tracking/admin/$ORDER_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "trackingNumber": "1Z999AA10123456784",
    "courierName": "FedEx",
    "estimatedDeliveryDate": "2024-01-15T00:00:00Z"
  }' | jq '.data.order | {status, trackingNumber, courierName}'

# 7. User sees tracking number
echo "7. User views updated order"
curl "$API/order-tracking/$ORDER_ID" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.data.order | {status, trackingNumber, courierName, estimatedDeliveryDate}'

# 8. Admin marks out for delivery
echo "8. Admin marks out for delivery"
curl -X PATCH "$API/order-tracking/admin/$ORDER_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "OUT_FOR_DELIVERY"}' | jq '.data.order.status'

# 9. Admin marks delivered
echo "9. Admin marks as delivered"
curl -X PATCH "$API/order-tracking/admin/$ORDER_ID/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "DELIVERED"}' | jq '.data.order | {status, deliveredAt}'

# 10. User sees final tracking
echo "10. User views final tracking history"
curl "$API/order-tracking/$ORDER_ID/tracking" \
  -H "Authorization: Bearer $USER_TOKEN" | jq '.data.tracking | reverse'
```

## Error Testing

### Test: No Authentication

```bash
curl http://localhost:4000/order-tracking

# Expected: 401 Unauthorized
# Response:
# {
#   "success": false,
#   "error": {
#     "message": "Authentication required",
#     "statusCode": 401
#   }
# }
```

### Test: Invalid Order ID

```bash
curl http://localhost:4000/order-tracking/invalid_id \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found
```

### Test: Non-Admin Trying to Update

```bash
curl -X PATCH http://localhost:4000/order-tracking/admin/$ORDER_ID/status \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'

# Expected: 403 Forbidden
# Response:
# {
#   "success": false,
#   "error": {
#     "message": "Admin access required",
#     "statusCode": 403
#   }
# }
```

### Test: Invalid Status Transition

```bash
# Assuming order is currently DELIVERED, try to go to PENDING
curl -X PATCH http://localhost:4000/order-tracking/admin/$ORDER_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PENDING"}'

# Expected: 400 Bad Request
# Response:
# {
#   "success": false,
#   "error": {
#     "message": "Cannot transition from DELIVERED to PENDING",
#     "statusCode": 400
#   }
# }
```

## Performance Testing

### Load Test with Apache Bench

```bash
# Single request
ab -c 1 -n 1 -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/order-tracking

# 100 concurrent requests for 10 seconds
ab -c 100 -t 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/order-tracking
```

### Load Test with k6

```javascript
// save as load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,          // 10 virtual users
  duration: '30s',  // 30 second duration
};

export default function() {
  const token = 'your_token_here';
  const url = 'http://localhost:4000/order-tracking';

  const response = http.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
```

Run with:
```bash
k6 run load-test.js
```

## Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "Order Tracking API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get User Orders",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/order-tracking",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{userToken}}"
          }
        ]
      }
    },
    {
      "name": "Get Order Details",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/order-tracking/{{orderId}}",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{userToken}}"
          }
        ]
      }
    },
    {
      "name": "Admin Update Status",
      "request": {
        "method": "PATCH",
        "url": "{{baseUrl}}/order-tracking/admin/{{orderId}}/status",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{adminToken}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"status\": \"SHIPPED\",\n  \"trackingNumber\": \"1Z999AA10123456784\",\n  \"courierName\": \"FedEx\"\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:4000"
    },
    {
      "key": "userToken",
      "value": ""
    },
    {
      "key": "adminToken",
      "value": ""
    },
    {
      "key": "orderId",
      "value": ""
    }
  ]
}
```

## Common Issues

### Issue: 404 Not Found on Tracking Endpoint

**Cause:** Order doesn't exist or belongs to different user

**Solution:**
1. Create an order first
2. Use the correct order ID
3. Verify authenticated as order owner

### Issue: Invalid Status Transition Error

**Cause:** Attempting invalid status change

**Solution:** Review valid transitions:
```
PENDING → CONFIRMED or CANCELLED
CONFIRMED → PACKED or CANCELLED
PACKED → SHIPPED or CANCELLED
... etc
```

### Issue: Admin Auth Fails

**Cause:** User is not admin

**Solution:**
1. Create user with ADMIN role in database
2. Or use SET_ROLE query: `UPDATE users SET role='ADMIN' WHERE id='user_id'`
3. Re-login to get new token

## Testing Checklist

- [ ] Create test user and admin accounts
- [ ] Create test products
- [ ] Create test orders
- [ ] Test user can list their orders
- [ ] Test user can view order details
- [ ] Test user can view tracking history
- [ ] Test non-admin can't update orders
- [ ] Test admin can update status
- [ ] Test tracking history updates automatically
- [ ] Test all status transitions
- [ ] Test estimated delivery date update
- [ ] Test tracking number and courier update
- [ ] Test error responses
- [ ] Test pagination
- [ ] Load test with multiple concurrent users
