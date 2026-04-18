# Payment Integration Guide

This document outlines the complete payment integration for the e-commerce platform, supporting both Razorpay and Stripe payment gateways.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Backend Implementation](#backend-implementation)
- [Frontend Implementation](#frontend-implementation)
- [Payment Flow](#payment-flow)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

The payment system supports two payment gateways:

1. **Razorpay**: Ideal for India and Asia-Pacific regions
2. **Stripe**: Ideal for international payments

Both providers offer:
- Secure payment processing
- Multiple payment methods (cards, UPI, net banking, etc.)
- Webhook support for payment confirmations
- Comprehensive API documentation

## Architecture

### Backend Components

```
backend/
├── src/
│   ├── services/
│   │   └── paymentService.ts       # Payment processing logic
│   ├── controllers/
│   │   └── paymentController.ts    # HTTP handlers
│   ├── routes/
│   │   └── payment.routes.ts       # Payment endpoints
│   └── app.ts                      # Routes registration
├── prisma/
│   ├── schema.prisma               # Updated with payment fields
│   └── migrations/
│       └── add_payment_fields/     # Database migration
└── .env.example                    # Configuration template
```

### Frontend Components

```
frontend/
├── app/
│   ├── checkout/
│   │   └── page.tsx               # Updated checkout with payment methods
│   ├── payment-success/
│   │   └── page.tsx               # Success confirmation page
│   └── payment-cancel/
│       └── page.tsx               # Cancellation page
└── public/                        # Razorpay and Stripe scripts
```

### Database Schema

**New Payment Fields in Order Model:**

```typescript
model Order {
  // ... existing fields
  paymentMethod    PaymentMethod?      // RAZORPAY | STRIPE | MANUAL
  paymentId        String? @unique     // Payment gateway transaction ID
  transactionId    String? @unique     // Application transaction ID
  paidAt           DateTime?           // Timestamp of successful payment
}

enum PaymentMethod {
  RAZORPAY
  STRIPE
  MANUAL
}
```

## Configuration

### 1. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Choose one: RAZORPAY or STRIPE
PAYMENT_PROVIDER="RAZORPAY"

# Razorpay Configuration
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxx"

# Stripe Configuration
STRIPE_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxx"

# Frontend
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
```

### 2. Getting API Keys

#### Razorpay Keys
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Generate Test Mode keys
4. Copy Key ID and Key Secret

#### Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/keys)
2. Copy Publishable Key and Secret Key
3. Create webhook endpoint for payment confirmations

### 3. Database Migration

```bash
# Apply migration
npm run prisma:migrate

# Or create fresh migration
npm run prisma:generate
npx prisma migrate dev --name add_payment_fields
```

## Backend Implementation

### Payment Service (`backend/src/services/paymentService.ts`)

#### Key Functions

**`validateAndCalculateAmount(productId, quantity)`**
- Validates product exists and is active
- Verifies sufficient stock
- **Calculates amount on backend** (NEVER trust frontend)
- Returns amount in paise/cents for payment gateway

```typescript
const { amount, product } = await validateAndCalculateAmount(productId, quantity);
// amount: 50000 (in paise, = $500.00)
```

**`createRazorpayOrder(productId, quantity, userEmail, userPhone)`**
- Creates order on Razorpay servers
- Stores metadata for tracking
- Returns order details with Razorpay order ID

**`verifyRazorpaySignature(paymentId, orderId, signature)`**
- **Critical for security**: Validates Razorpay signature
- Prevents payment tampering
- Uses HMAC-SHA256 verification

**`createOrderAfterPayment(...)`**
- Creates order in database after payment verification
- Uses Prisma transaction for data consistency
- Updates inventory immediately
- Ensures idempotency (prevents duplicate orders)

```typescript
const order = await createOrderAfterPayment(
  userId,
  productId,
  quantity,
  paymentId,
  razorpayOrderId,
  PaymentMethod.RAZORPAY
);
```

### Payment Controller (`backend/src/controllers/paymentController.ts`)

#### Endpoints

**POST /payments/razorpay/create-order**
- Creates Razorpay order
- Returns order ID and amount
- Requires authentication

**POST /payments/razorpay/verify**
- Verifies payment signature
- Creates order on successful verification
- Logs failed attempts

**POST /payments/stripe/create-session**
- Creates Stripe checkout session
- Redirects user to Stripe payment page

**GET /payments/orders/:orderId**
- Retrieves order details after payment
- Requires authentication and ownership

### Payment Routes (`backend/src/routes/payment.routes.ts`)

```typescript
POST   /payments/razorpay/create-order
POST   /payments/razorpay/verify
POST   /payments/stripe/create-session
POST   /payments/stripe/webhook          // No authentication required
GET    /payments/orders/:orderId
```

## Frontend Implementation

### Checkout Page (`frontend/app/checkout/page.tsx`)

#### Updated Flow

1. **Payment Method Selection**
   - User chooses between Razorpay, Stripe, or Direct Checkout

2. **Razorpay Flow**
   - Backend creates Razorpay order
   - Razorpay modal opens
   - User completes payment
   - Signature verified on backend
   - Order created on successful verification

3. **Success/Cancel Pages**
   - `/payment-success`: Displays confirmation
   - `/payment-cancel`: Allows retry or cancel

#### Key Implementation Details

```typescript
// Load Razorpay script
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  document.body.appendChild(script);
}, []);

// Handle payment
const handleRazorpayPayment = async () => {
  // 1. Create order on backend
  const orderResponse = await fetch("/payments/razorpay/create-order", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId, quantity, userEmail, userPhone })
  });

  // 2. Open Razorpay modal
  const rzp = new window.Razorpay(options);
  rzp.open();

  // 3. On success, verify payment
  // 4. Redirect to confirmation
};
```

## Payment Flow

### Complete Payment Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├─→ Selects Payment Method
       │
       ├─→ Creates Order on Backend
       │   ├─ Validates product & stock
       │   ├─ Calculates amount server-side
       │   └─ Creates Razorpay/Stripe order
       │
       ├─→ Opens Payment Modal
       │   ├─ User enters payment details
       │   └─ Payment gateway processes
       │
       ├─→ Receives Payment Confirmation
       │
       ├─→ Backend Verification
       │   ├─ Verifies signature (Razorpay)
       │   ├─ Confirms with payment gateway
       │   └─ Creates database order
       │
       └─→ Displays Confirmation
           └─ Redirects to order details
```

### Razorpay Specific Flow

```
1. Frontend creates order on Razorpay API (backend acts as proxy)
2. Razorpay returns order_id
3. Frontend opens Razorpay checkout modal with order_id
4. User completes payment in modal
5. Razorpay returns payment details (payment_id, signature)
6. Frontend sends verification request to backend
7. Backend verifies signature using HMAC-SHA256
8. Backend fetches payment details from Razorpay API
9. Backend creates order in database if payment confirmed
10. Frontend redirects to success page
```

## Security Considerations

### ✅ Implemented Security Measures

1. **Server-Side Amount Calculation**
   - Amount calculated on backend, never trusted from frontend
   - Prevents price manipulation attacks

2. **Signature Verification**
   - Razorpay signatures verified using HMAC-SHA256
   - Prevents tampering with payment data

3. **Idempotency**
   - Payment IDs checked for duplicates
   - Prevents double-charging on network failures

4. **Authentication**
   - All payment endpoints require JWT authentication
   - Users can only access their own orders

5. **Webhook Verification**
   - Stripe webhooks verified using signing secrets
   - Prevents unauthorized payment confirmations

6. **Stock Validation**
   - Stock verified server-side before creating order
   - Prevents overselling

### 🔒 Best Practices

1. **Never expose secret keys**
   - Use environment variables
   - Never commit keys to repository

2. **Always verify signatures**
   - Razorpay: Verify before trusting payment data
   - Stripe: Verify webhook source

3. **Handle failures gracefully**
   - Log failed payment attempts
   - Provide clear error messages
   - Allow users to retry

4. **Use HTTPS in production**
   - Encrypts payment data in transit
   - Required by payment gateways

5. **Implement rate limiting**
   - Prevent brute force attacks
   - Limit API calls per user

## API Reference

### Create Razorpay Order

**Request:**
```json
POST /payments/razorpay/create-order
Authorization: Bearer <token>

{
  "productId": "prod_123",
  "quantity": 2,
  "userEmail": "user@example.com",
  "userPhone": "+91-9999999999"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_0000000000001",
    "amount": 50000,
    "currency": "INR",
    "razorpayKey": "rzp_test_xxxxxxxxxx"
  }
}
```

### Verify Razorpay Payment

**Request:**
```json
POST /payments/razorpay/verify?productId=prod_123&quantity=2
Authorization: Bearer <token>

{
  "razorpay_payment_id": "pay_0000000000001",
  "razorpay_order_id": "order_0000000000001",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ord_abc123",
    "orderNumber": "ORD-1234567890",
    "totalAmount": 55000,
    "paymentId": "pay_0000000000001"
  }
}
```

### Get Order Details

**Request:**
```json
GET /payments/orders/:orderId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "ord_abc123",
      "orderNumber": "ORD-1234567890",
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentMethod": "RAZORPAY",
      "totalAmount": 55000,
      "paidAt": "2024-01-15T10:30:00Z",
      "items": [
        {
          "productName": "Product Name",
          "quantity": 2,
          "unitPrice": 25000,
          "totalPrice": 55000
        }
      ]
    }
  }
}
```

## Troubleshooting

### Common Issues

**Issue: "Razorpay not loaded"**
- Ensure Razorpay script is loading
- Check browser console for CSP violations
- Verify internet connection

**Issue: "Payment verification failed - invalid signature"**
- Check RAZORPAY_KEY_SECRET is correct
- Verify order ID and payment ID are correct
- Ensure signature is calculated correctly

**Issue: "Insufficient stock for order"**
- Stock may have been purchased by another user
- Refresh product details and retry
- Verify quantity doesn't exceed available stock

**Issue: "Payment created but order not visible"**
- Check database migration was applied
- Verify payment verification endpoint was called
- Check order creation logs for errors

### Debug Mode

Enable detailed logging:

```typescript
// In payment service
console.log("Payment verification data:", {
  paymentId,
  orderId,
  signature,
  expectedSignature
});

// In controller
console.log("Razorpay response:", paymentDetails);
```

### Testing

**Test Razorpay Credentials:**
```
Key ID: rzp_test_xxxxxxxxxx
Key Secret: xxxxxxxxxxxxxxxxxx
```

**Test Card Numbers:**
- Success: `4111 1111 1111 1111`
- Failure: `4111 1111 1111 1112`

## Next Steps

1. ✅ Database migration applied
2. ✅ Backend payment service implemented
3. ✅ Frontend checkout UI updated
4. ⏳ Configure environment variables
5. ⏳ Test payment flow end-to-end
6. ⏳ Deploy to staging environment
7. ⏳ User acceptance testing
8. ⏳ Go live!

## Support

For issues or questions:
- Razorpay: https://razorpay.com/support/
- Stripe: https://support.stripe.com/
- Team: [contact support]
