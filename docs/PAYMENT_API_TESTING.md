# Payment API Testing Guide

This document provides detailed examples for testing the payment API endpoints using cURL and other tools.

## Prerequisites

- Backend running on `http://localhost:4000`
- Valid JWT token (from login endpoint)
- Product ID from database
- Razorpay or Stripe credentials

## Getting JWT Token

### 1. Register User (if needed)

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "name": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

**Save token for future requests:**
```bash
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

## Test Razorpay Integration

### 1. Create Razorpay Order

Creates an order on Razorpay for payment processing.

**Request:**
```bash
curl -X POST http://localhost:4000/payments/razorpay/create-order \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123abc",
    "quantity": 2,
    "userEmail": "test@example.com",
    "userPhone": "+91-9999999999"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_K97P4WdJibKnqI",
    "amount": 50000,
    "currency": "INR",
    "razorpayKey": "rzp_test_1234567890"
  }
}
```

**Using jq to pretty print:**
```bash
curl -s -X POST http://localhost:4000/payments/razorpay/create-order \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123abc",
    "quantity": 1,
    "userEmail": "test@example.com",
    "userPhone": "+91-9999999999"
  }' | jq .
```

**Store response data:**
```bash
RESPONSE=$(curl -s -X POST http://localhost:4000/payments/razorpay/create-order \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123abc",
    "quantity": 1,
    "userEmail": "test@example.com",
    "userPhone": "+91-9999999999"
  }')

export ORDER_ID=$(echo $RESPONSE | jq -r '.data.orderId')
export AMOUNT=$(echo $RESPONSE | jq -r '.data.amount')
echo "Order ID: $ORDER_ID"
echo "Amount: $AMOUNT"
```

### 2. Verify Razorpay Payment

Verifies payment signature and creates order in database.

**Request (after completing payment in Razorpay modal):**
```bash
curl -X POST "http://localhost:4000/payments/razorpay/verify?productId=prod_123abc&quantity=1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_K97PJepXWsWWq4",
    "razorpay_order_id": "order_K97P4WdJibKnqI",
    "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ord_abc123def456",
    "orderNumber": "ORD-1704067200000",
    "totalAmount": 275000,
    "paymentId": "pay_K97PJepXWsWWq4"
  }
}
```

### 3. Test Signature Verification

You can generate a test signature using OpenSSL:

```bash
# Format: order_id|payment_id
echo -n "order_K97P4WdJibKnqI|pay_K97PJepXWsWWq4" | \
  openssl dgst -sha256 -hmac "$RAZORPAY_SECRET_KEY"
```

**Example:**
```bash
# With actual values
echo -n "order_K97P4WdJibKnqI|pay_K97PJepXWsWWq4" | \
  openssl dgst -sha256 -hmac "xxxxxxxxxxx"

# Output: (stdin)= 9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d
```

## Test Stripe Integration

### 1. Create Stripe Checkout Session

Creates a Stripe checkout session for payment.

**Request:**
```bash
curl -X POST http://localhost:4000/payments/stripe/create-session \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123abc",
    "quantity": 1,
    "userEmail": "test@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_a1234567890",
    "url": "https://checkout.stripe.com/pay/cs_test_a1234567890"
  }
}
```

**Redirect user to the URL or embed the session ID in Stripe.js**

## Get Order Details

### Retrieve Created Order

After successful payment, retrieve order details.

**Request:**
```bash
curl -X GET http://localhost:4000/payments/orders/$ORDER_ID \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ord_abc123def456",
      "orderNumber": "ORD-1704067200000",
      "userId": "user_xyz",
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentMethod": "RAZORPAY",
      "paymentId": "pay_K97PJepXWsWWq4",
      "transactionId": "RAZORPAY-pay_K97PJepXWsWWq4",
      "subtotal": 250000,
      "taxAmount": 25000,
      "shippingAmount": 0,
      "discountAmount": 0,
      "totalAmount": 275000,
      "currency": "INR",
      "paidAt": "2024-01-15T10:30:00.000Z",
      "items": [
        {
          "id": "item_123",
          "productId": "prod_123abc",
          "productName": "Premium Widget",
          "sku": "WID-001",
          "quantity": 1,
          "unitPrice": 250000,
          "totalPrice": 250000
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## Error Testing

### 1. Missing Authentication

```bash
curl -X POST http://localhost:4000/payments/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "quantity": 1,
    "userEmail": "test@example.com",
    "userPhone": "+91-9999999999"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "statusCode": 401
  }
}
```

### 2. Invalid Product

```bash
curl -X POST http://localhost:4000/payments/razorpay/create-order \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "invalid_id",
    "quantity": 1,
    "userEmail": "test@example.com",
    "userPhone": "+91-9999999999"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Product not found",
    "statusCode": 404
  }
}
```

### 3. Insufficient Stock

```bash
curl -X POST http://localhost:4000/payments/razorpay/create-order \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_123",
    "quantity": 99999,
    "userEmail": "test@example.com",
    "userPhone": "+91-9999999999"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid quantity. Available: 100",
    "statusCode": 400
  }
}
```

### 4. Invalid Signature

```bash
curl -X POST "http://localhost:4000/payments/razorpay/verify?productId=prod_123&quantity=1" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_K97PJepXWsWWq4",
    "razorpay_order_id": "order_K97P4WdJibKnqI",
    "razorpay_signature": "invalid_signature_123"
  }'
```

**Response:**
```json
{
  "success": false,
  "error": {
    "message": "Payment verification failed - invalid signature",
    "statusCode": 400
  }
}
```

## Complete Flow Test Script

**save as: `test_payment.sh`**

```bash
#!/bin/bash

set -e

# Configuration
API_URL="http://localhost:4000"
EMAIL="test@example.com"
PASSWORD="Test@1234"
PRODUCT_ID="prod_123abc"
QUANTITY=1

echo "=== Payment Flow Test ==="

# 1. Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "✓ Token: ${JWT_TOKEN:0:20}..."

# 2. Create Razorpay Order
echo "2. Creating Razorpay order..."
ORDER_RESPONSE=$(curl -s -X POST $API_URL/payments/razorpay/create-order \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": $QUANTITY,
    \"userEmail\": \"$EMAIL\",
    \"userPhone\": \"+91-9999999999\"
  }")

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.orderId')
AMOUNT=$(echo $ORDER_RESPONSE | jq -r '.data.amount')
echo "✓ Order ID: $ORDER_ID"
echo "✓ Amount: $AMOUNT (paise)"

# 3. Simulate payment (in real scenario, user completes payment in Razorpay modal)
echo "3. Simulating payment verification..."
PAYMENT_ID="pay_test_123456789"
SIGNATURE="test_signature_123"

# 4. Verify payment
VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/payments/razorpay/verify?productId=$PRODUCT_ID&quantity=$QUANTITY" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"razorpay_payment_id\": \"$PAYMENT_ID\",
    \"razorpay_order_id\": \"$ORDER_ID\",
    \"razorpay_signature\": \"$SIGNATURE\"
  }")

echo "✓ Verification response:"
echo $VERIFY_RESPONSE | jq .

# 5. Get order details
ORDER_DETAIL_ID=$(echo $VERIFY_RESPONSE | jq -r '.data.orderId // empty')
if [ ! -z "$ORDER_DETAIL_ID" ]; then
  echo "5. Fetching order details..."
  curl -s -X GET "$API_URL/payments/orders/$ORDER_DETAIL_ID" \
    -H "Authorization: Bearer $JWT_TOKEN" | jq .
fi

echo "=== Test Complete ==="
```

**Run the test:**
```bash
chmod +x test_payment.sh
./test_payment.sh
```

## Using Postman

### Import Collection

Create a new Postman collection with these requests:

**POST - Login**
```
URL: http://localhost:4000/auth/login
Body (JSON):
{
  "email": "test@example.com",
  "password": "Test@1234"
}
```

**POST - Create Razorpay Order**
```
URL: http://localhost:4000/payments/razorpay/create-order
Headers:
  Authorization: Bearer {{jwt_token}}
Body (JSON):
{
  "productId": "{{product_id}}",
  "quantity": 1,
  "userEmail": "test@example.com",
  "userPhone": "+91-9999999999"
}
```

**POST - Verify Payment**
```
URL: http://localhost:4000/payments/razorpay/verify?productId={{product_id}}&quantity=1
Headers:
  Authorization: Bearer {{jwt_token}}
Body (JSON):
{
  "razorpay_payment_id": "pay_test_123",
  "razorpay_order_id": "{{order_id}}",
  "razorpay_signature": "test_sig_123"
}
```

**GET - Order Details**
```
URL: http://localhost:4000/payments/orders/{{order_id}}
Headers:
  Authorization: Bearer {{jwt_token}}
```

### Set Variables in Postman

1. Go to Tests tab in each request
2. Add:
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  pm.environment.set("jwt_token", pm.response.json().data.token);
  pm.environment.set("order_id", pm.response.json().data.orderId);
}
```

## Debugging

### Check Backend Logs

```bash
# Watch logs in real time
tail -f logs/app.log

# Or use npm with nodemon
npm run dev
```

### Database Query

```bash
# Connect to database
psql postgresql://postgres:postgres@localhost:5432/ecommerce_recommendation

# Check orders with payment info
SELECT id, payment_id, payment_method, payment_status, paid_at 
FROM orders 
WHERE payment_id IS NOT NULL 
ORDER BY created_at DESC;

# Check a specific order
SELECT * FROM orders WHERE id = 'ord_123';
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Single request
ab -c 1 -n 1 -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:4000/payments/orders/ord_123

# Load test
ab -c 10 -n 100 -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:4000/payments/orders/ord_123
```

### Using k6

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  let response = http.get('http://localhost:4000/payments/orders/ord_123', {
    headers: { Authorization: 'Bearer TOKEN' },
  });
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

## Common Test Scenarios

### Scenario 1: Complete Payment Flow
- Register user
- Login
- Create product
- Create order
- Verify payment
- Check order in database

### Scenario 2: Failed Payment
- Create order
- Send invalid signature
- Verify error handling
- Check no order created

### Scenario 3: Duplicate Payment
- Create order
- Verify payment
- Verify same payment again
- Should return existing order (idempotency)

### Scenario 4: Concurrent Orders
- Multiple users
- Create orders simultaneously
- All should succeed
- Check inventory is correct

## Next Steps

1. Run complete flow test: `./test_payment.sh`
2. Create orders in database
3. Verify payment endpoints work
4. Test error scenarios
5. Check database consistency
6. Monitor logs for issues
7. Proceed to production deployment
