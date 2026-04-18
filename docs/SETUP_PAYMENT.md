# Payment Integration Setup Guide

This guide walks you through setting up the payment system for the e-commerce platform.

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- Razorpay or Stripe account
- Backend running on localhost:4000
- Frontend running on localhost:3000

## Quick Start

### 1. Backend Setup

#### Step 1.1: Install Dependencies

```bash
cd backend
npm install
```

#### Step 1.2: Configure Environment Variables

Copy `.env.example` and create `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add payment credentials:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_recommendation?schema=public"

# Payment: Choose RAZORPAY or STRIPE
PAYMENT_PROVIDER="RAZORPAY"

# Razorpay
RAZORPAY_KEY_ID="your_test_key_id"
RAZORPAY_KEY_SECRET="your_test_key_secret"

# Stripe (optional)
STRIPE_PUBLIC_KEY="your_test_public_key"
STRIPE_SECRET_KEY="your_test_secret_key"

# Frontend
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
```

#### Step 1.3: Apply Database Migration

```bash
# Generate Prisma client
npm run prisma:generate

# Apply migration
npm run prisma:migrate

# Or create and apply new migration
npx prisma migrate dev --name add_payment_fields
```

Verify the migration by checking the database:

```bash
npx prisma db push
```

#### Step 1.4: Start Backend

```bash
npm run dev
```

Verify the server is running:

```bash
curl http://localhost:4000/health
```

### 2. Frontend Setup

#### Step 2.1: Configure Environment Variables

In `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000"
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
```

#### Step 2.2: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Getting Payment Credentials

#### Razorpay Setup

1. Create account at [Razorpay](https://razorpay.com/)
2. Go to Dashboard → Settings → API Keys
3. Switch to Test Mode
4. Copy Key ID and Key Secret
5. Add to `.env`:

```
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

**Test Cards:**
- Success: `4111 1111 1111 1111` + any CVV + any future date
- Failure: `4111 1111 1111 1112` + any CVV + any future date

#### Stripe Setup

1. Create account at [Stripe](https://stripe.com/)
2. Go to Developers → API Keys
3. Copy Publishable and Secret keys
4. Add to `.env`:

```
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

**Test Cards:**
- Success: `4242 4242 4242 4242` + any CVV + any future date
- Failure: `4000 0000 0000 0002` + any CVV + any future date

### 4. Test Payment Flow

#### Step 4.1: Access Checkout Page

1. Open http://localhost:3000/products
2. Click "Buy Now" on any product
3. Adjust quantity if needed
4. Click "Select Payment Method"

#### Step 4.2: Test Razorpay Payment

1. Click "💳 Razorpay"
2. Click "Pay with Razorpay"
3. In the modal, select payment method
4. Enter test card: `4111 1111 1111 1111`
5. Enter CVV: `123`
6. Enter expiry: `12/25`
7. Complete payment
8. Verify order is created

#### Step 4.3: Verify Order in Database

```bash
# Connect to database
psql postgresql://postgres:postgres@localhost:5432/ecommerce_recommendation

# Query orders
SELECT id, order_number, payment_status, payment_method, payment_id 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
```

### 5. Verify API Endpoints

#### Create Razorpay Order

```bash
curl -X POST http://localhost:4000/payments/razorpay/create-order \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_id",
    "quantity": 1,
    "userEmail": "test@example.com",
    "userPhone": "+91-9999999999"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_...",
    "amount": 50000,
    "currency": "INR",
    "razorpayKey": "rzp_test_..."
  }
}
```

#### Verify Payment

```bash
curl -X POST "http://localhost:4000/payments/razorpay/verify?productId=prod_id&quantity=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_payment_id": "pay_...",
    "razorpay_order_id": "order_...",
    "razorpay_signature": "..."
  }'
```

#### Get Order Details

```bash
curl http://localhost:4000/payments/orders/ord_id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

The `orders` table now includes:

```sql
ALTER TABLE orders ADD COLUMN payment_method VARCHAR;
ALTER TABLE orders ADD COLUMN payment_id VARCHAR UNIQUE;
ALTER TABLE orders ADD COLUMN transaction_id VARCHAR UNIQUE;
ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP;
```

Verify in Prisma:

```bash
npx prisma studio
```

Navigate to Orders model to see all payment fields.

## Troubleshooting

### Issue: "Razorpay not configured"

**Solution:**
1. Check `.env` has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
2. Restart backend: `npm run dev`
3. Verify keys in [Razorpay Dashboard](https://dashboard.razorpay.com/)

### Issue: "Failed to create payment order"

**Solution:**
1. Check product ID is valid
2. Verify product is active: `SELECT is_active FROM products WHERE id='...';`
3. Check stock is available: `SELECT stock_quantity FROM products WHERE id='...';`

### Issue: "Payment verification failed"

**Solution:**
1. Verify signature manually:
   ```bash
   echo -n "order_id|payment_id" | openssl dgst -sha256 -hmac "key_secret"
   ```
2. Compare with `razorpay_signature`
3. Check key secret in `.env` matches dashboard

### Issue: "Database migration failed"

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or apply migration step by step
npx prisma migrate resolve --rolled-back add_payment_fields
npx prisma migrate deploy
```

### Issue: "Order created but payment not recorded"

**Solution:**
1. Check verification endpoint was called
2. Verify database connection
3. Check order table for payment fields:
   ```bash
   SELECT payment_id, payment_method, paid_at FROM orders WHERE id='...';
   ```

## Environment Checklist

- [ ] Backend `.env` configured
- [ ] Database connected
- [ ] Migration applied
- [ ] Razorpay/Stripe credentials added
- [ ] Frontend environment variables set
- [ ] Backend running (port 4000)
- [ ] Frontend running (port 3000)
- [ ] Test payment successful
- [ ] Order visible in database

## Production Deployment

Before going live:

1. **Use production credentials**
   - Razorpay: Switch to Live mode
   - Stripe: Use production keys

2. **Enable HTTPS**
   - Required by payment gateways
   - Use SSL certificate

3. **Configure CORS**
   - Update `CORS_ORIGIN` for production domain
   - Restrict to your domain only

4. **Set up webhooks**
   - Stripe: Add webhook endpoint
   - Razorpay: Configure notification URLs

5. **Configure environment**
   - `NODE_ENV="production"`
   - `PAYMENT_PROVIDER="RAZORPAY"` or `"STRIPE"`
   - Use secure secrets (AWS Secrets Manager, HashiCorp Vault, etc.)

6. **Enable logging**
   - Log all payment attempts
   - Monitor for failures
   - Set up alerts

7. **Test thoroughly**
   - Test all payment flows
   - Test error scenarios
   - Verify order creation
   - Confirm email notifications

## Support

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [Backend Payment Service](./PAYMENT_INTEGRATION.md)
- Team Support: [contact]
