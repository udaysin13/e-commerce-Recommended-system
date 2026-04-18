# Order Tracking Implementation Quick Start

Get the order tracking system up and running in 5 minutes.

## Prerequisites

- Node.js 16+ installed
- Backend running on http://localhost:4000
- Frontend running on http://localhost:3000
- Database configured with Prisma

## Step 1: Apply Database Migration

```bash
cd backend

# Apply migration
npm run prisma:migrate

# Open Prisma Studio to verify
npx prisma studio
```

**What gets created:**
- `OrderTrackingHistory` table for tracking events
- Indexes on `orderId`, `status`, `createdAt` for performance
- Automatic timestamp management

## Step 2: Verify Backend Routes

The following routes are already implemented:

**User Routes:**
- `GET /order-tracking` - List user's orders
- `GET /order-tracking/:id` - Get order details
- `GET /order-tracking/:id/tracking` - Get tracking history
- `GET /order-tracking/stats` - Get order statistics

**Admin Routes:**
- `GET /order-tracking/admin` - List all orders
- `GET /order-tracking/admin/:id` - Get order details (admin view)
- `PATCH /order-tracking/admin/:id/status` - Update order status

All routes are registered in `src/app.ts`.

## Step 3: Test Backend API

```bash
# 1. Login to get token
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }' | jq -r '.data.token')

# 2. Create an order (or use existing)
ORDER_ID="ord_123"

# 3. Get order details
curl http://localhost:4000/order-tracking/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Get tracking history
curl http://localhost:4000/order-tracking/$ORDER_ID/tracking \
  -H "Authorization: Bearer $TOKEN" | jq .
```

## Step 4: Setup Frontend Components

### 1. Orders List Page

Already created at: `frontend/app/orders/page.tsx`

**Features:**
- Displays all user orders
- Shows status with color-coded badges
- Quick view button to see details

**To use:**
```
1. Open browser: http://localhost:3000/orders
2. See list of your orders
3. Click "View Details" on any order
```

### 2. Order Details & Tracking Page

Already created at: `frontend/app/order-tracking/[id]/page.tsx`

**Two tabs:**
- **Details:** Order items, address, summary
- **Tracking:** Timeline of status changes

**To use:**
```
1. Click order from list
2. See order details
3. View tracking timeline
```

### 3. Admin Order Update Page

Already created at: `frontend/app/admin/orders/update/page.tsx`

**Features:**
- Search order by ID
- Update status
- Add tracking info
- Add messages/notes

**To use:**
```
1. Go to: http://localhost:3000/admin/orders/update
2. Enter order ID
3. Select new status
4. Add tracking info
5. Click "Update Order Status"
```

## Step 5: Configure Environment

Ensure backend has these environment variables:

```bash
# .env or backend/.env

# Database
DATABASE_URL="your_database_url"

# JWT
JWT_SECRET="your_secret_key"

# API
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"
```

Ensure frontend has these environment variables:

```bash
# frontend/.env.local

NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Step 6: Verify Everything Works

### Test User Flow

1. **Login** → http://localhost:3000/login
2. **View Orders** → http://localhost:3000/orders
3. **Click Order** → View details and tracking
4. **See Tracking History** → Click "Tracking" tab

### Test Admin Flow

1. **Go to Admin** → http://localhost:3000/admin
2. **Click "Update Order"** → http://localhost:3000/admin/orders/update
3. **Enter Order ID** → Copy from orders list
4. **Update Status** → Change to next status
5. **See Success Message** → Status updated

### Test Backend Directly

```bash
# List orders
curl http://localhost:4000/order-tracking \
  -H "Authorization: Bearer $TOKEN"

# Update order status
curl -X PATCH http://localhost:4000/order-tracking/admin/ord_123/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'
```

## Current Status

✅ **Completed:**
- [x] Database schema and migrations
- [x] Backend API endpoints
- [x] User tracking pages
- [x] Admin update page
- [x] Error handling and validation
- [x] Real-time status tracking
- [x] Tracking history

## Next Steps (Optional Enhancements)

### 1. Email Notifications

Send email when order status changes:

```typescript
// In orderTrackingService.ts
await sendOrderStatusEmail(orderId, newStatus);
```

### 2. Admin Dashboard

Create admin dashboard to view:
- Orders by status
- Recently shipped
- Pending confirmation
- Performance metrics

### 3. Courier Integration

Auto-sync with FedEx/DHL/UPS APIs:
```typescript
const tracking = await fetchTrackingFromCourier(
  trackingNumber,
  courierName
);
```

### 4. WebSocket Updates

Real-time tracking updates for customers:
```typescript
// Emit event when status updates
socket.emit('order:status-updated', {
  orderId,
  status,
  message
});
```

## Common Tasks

### Update Order Status

**Via Frontend:**
1. Go to `/admin/orders/update`
2. Enter order ID
3. Select new status
4. Click "Update"

**Via API:**
```bash
curl -X PATCH http://localhost:4000/order-tracking/admin/$ORDER_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "trackingNumber": "1Z123456",
    "courierName": "FedEx"
  }'
```

### View Order Tracking

**Via Frontend:**
1. Go to `/orders`
2. Click order
3. Click "Tracking" tab

**Via API:**
```bash
curl http://localhost:4000/order-tracking/$ORDER_ID/tracking \
  -H "Authorization: Bearer $TOKEN"
```

### View All Admin Orders

**Via Frontend:**
1. Go to `/admin`
2. View all orders

**Via API:**
```bash
curl http://localhost:4000/order-tracking/admin \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Troubleshooting

### Orders Not Showing

**Problem:** User can't see orders

**Solutions:**
```bash
# 1. Verify user is logged in
echo $TOKEN

# 2. Verify orders exist in database
npx prisma studio  # Check orders table

# 3. Verify correct API endpoint
curl http://localhost:4000/order-tracking -H "Authorization: Bearer $TOKEN"

# 4. Check browser console for errors
# (F12 → Console tab)
```

### Status Update Not Working

**Problem:** Admin can't update order status

**Solutions:**
```bash
# 1. Verify admin role
# Check user has role='ADMIN' in database

# 2. Verify order exists
npx prisma studio  # Check order ID

# 3. Verify valid status transition
# PENDING → CONFIRMED or CANCELLED

# 4. Check backend logs
npm run dev  # Look for errors
```

### Tracking History Empty

**Problem:** No tracking events showing

**Solutions:**
```bash
# 1. Verify migration ran
# Check OrderTrackingHistory table exists
psql -d your_db -c "\dt order_tracking_history"

# 2. Verify order was created after migration
# Create new order and update status

# 3. Check order status was actually updated
curl http://localhost:4000/order-tracking/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Quick Reference

### Status Transitions

```
PENDING → CONFIRMED or CANCELLED
CONFIRMED → PACKED or CANCELLED
PACKED → SHIPPED or CANCELLED
SHIPPED → OUT_FOR_DELIVERY or CANCELLED
OUT_FOR_DELIVERY → DELIVERED or CANCELLED
DELIVERED → RETURNED (allowed)
CANCELLED or RETURNED → (end states, no transitions)
```

### Key Files

| File | Purpose |
|------|---------|
| `backend/src/services/orderTrackingService.ts` | Business logic |
| `backend/src/controllers/orderTrackingController.ts` | HTTP handlers |
| `backend/src/routes/orderTracking.routes.ts` | Route definitions |
| `frontend/app/orders/page.tsx` | Orders list |
| `frontend/app/order-tracking/[id]/page.tsx` | Order details |
| `frontend/app/admin/orders/update/page.tsx` | Admin update |
| `backend/prisma/schema.prisma` | Database schema |

### API Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/order-tracking` | GET | User | List user's orders |
| `/order-tracking/:id` | GET | User | Get order details |
| `/order-tracking/:id/tracking` | GET | User | Get tracking history |
| `/order-tracking/admin` | GET | Admin | List all orders |
| `/order-tracking/admin/:id/status` | PATCH | Admin | Update order status |

## Support Resources

- **Documentation:** See `docs/ORDER_TRACKING_GUIDE.md`
- **API Testing:** See `docs/ORDER_TRACKING_API_TESTING.md`
- **Backend Code:** See `backend/src/services/orderTrackingService.ts`
- **Frontend Code:** See `frontend/app/order-tracking/`

## Success Checklist

- [ ] Database migration applied
- [ ] Backend running without errors
- [ ] Frontend loads without console errors
- [ ] Can view orders list at `/orders`
- [ ] Can view order details
- [ ] Can view tracking history
- [ ] Admin can access `/admin/orders/update`
- [ ] Can update order status
- [ ] Tracking history updates automatically
- [ ] All status transitions work correctly

Once all items are checked, your order tracking system is ready!
