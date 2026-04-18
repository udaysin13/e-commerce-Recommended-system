# Order Tracking System Documentation

Complete guide for the order tracking and management system.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Status Transitions](#status-transitions)
6. [Frontend Features](#frontend-features)
7. [Admin Panel](#admin-panel)
8. [Setup Instructions](#setup-instructions)

## Overview

The order tracking system provides:

- **Real-time order status tracking** - Users can see live updates
- **Complete order history** - Timeline of all status changes
- **Admin management** - Full control over order statuses
- **Tracking information** - Courier name, tracking number, estimated delivery
- **Intelligent status transitions** - Prevents invalid status flows
- **Audit trail** - Records who updated what and when

## Architecture

### Backend Components

```
backend/
├── src/
│   ├── services/
│   │   └── orderTrackingService.ts      # Business logic
│   ├── controllers/
│   │   └── orderTrackingController.ts   # HTTP handlers
│   ├── routes/
│   │   └── orderTracking.routes.ts      # Endpoints
│   └── app.ts                           # Route registration
├── prisma/
│   └── schema.prisma                    # Data models
└── .env.example                         # Configuration
```

### Frontend Components

```
frontend/
├── app/
│   ├── orders/
│   │   └── page.tsx                     # Orders list
│   ├── order-tracking/
│   │   └── [id]/page.tsx                # Order details & tracking
│   └── admin/
│       └── orders/
│           └── update/page.tsx          # Admin status update
└── lib/
    └── api.ts                           # API helpers
```

### Database Schema

**Order Model (Extended)**

```prisma
model Order {
  id                      String        // Unique ID
  orderNumber             String        // Human-readable number
  status                  OrderStatus   // Current status
  paymentStatus           PaymentStatus // Payment state
  trackingNumber          String?       // Courier tracking ID
  courierName             String?       // Courier name (FedEx, DHL, etc.)
  estimatedDeliveryDate   DateTime?     // Expected delivery
  deliveredAt             DateTime?     // Actual delivery timestamp
  cancelledAt             DateTime?     // Cancellation timestamp
  // ... other fields
  trackingHistory         OrderTrackingHistory[] // Status history
}

enum OrderStatus {
  PENDING                 // Initial state
  CONFIRMED               // Order confirmed
  PACKED                  // Items packed
  SHIPPED                 // Shipped to courier
  OUT_FOR_DELIVERY        // Out for delivery
  DELIVERED               // Delivered to customer
  CANCELLED               // Order cancelled
  RETURNED                // Order returned
}
```

**OrderTrackingHistory Model (New)**

```prisma
model OrderTrackingHistory {
  id        String      // Unique ID
  orderId   String      // Reference to order
  status    OrderStatus // Status at this point
  message   String?     // Public message
  note      String?     // Internal note
  updatedBy String?     // Admin who made change
  createdAt DateTime    // Timestamp
}
```

## API Endpoints

### User Endpoints (Require Authentication)

**GET /order-tracking**
List all orders for logged-in user

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/order-tracking?limit=20&offset=0
```

Response:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ord_123",
        "orderNumber": "ORD-1234567890",
        "status": "SHIPPED",
        "paymentStatus": "PAID",
        "totalAmount": 99.99,
        "currency": "USD",
        "placedAt": "2024-01-15T10:30:00Z",
        "estimatedDeliveryDate": "2024-01-22T00:00:00Z",
        "items": [{ "productName": "Widget", "quantity": 2 }]
      }
    ],
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

**GET /order-tracking/:id**
Get detailed order information

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/order-tracking/ord_123
```

Response includes full order details with items and tracking history.

**GET /order-tracking/:id/tracking**
Get tracking history timeline

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/order-tracking/ord_123/tracking
```

Response:
```json
{
  "success": true,
  "data": {
    "orderId": "ord_123",
    "tracking": [
      {
        "id": "track_1",
        "status": "DELIVERED",
        "message": "Order has been delivered",
        "note": null,
        "createdAt": "2024-01-22T14:30:00Z"
      },
      {
        "id": "track_2",
        "status": "OUT_FOR_DELIVERY",
        "message": "Order is out for delivery",
        "note": null,
        "createdAt": "2024-01-22T08:00:00Z"
      }
    ],
    "totalEvents": 6
  }
}
```

**GET /order-tracking/stats**
Get order statistics for user

Response shows count by status (PENDING, CONFIRMED, SHIPPED, etc.)

### Admin Endpoints (Require Admin Role)

**PATCH /order-tracking/admin/:id/status**
Update order status

```bash
curl -X PATCH \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED",
    "message": "Order shipped to customer",
    "note": "Sent via FedEx Express",
    "trackingNumber": "1Z999AA10123456784",
    "courierName": "FedEx",
    "estimatedDeliveryDate": "2024-01-22T00:00:00Z"
  }' \
  http://localhost:4000/order-tracking/admin/ord_123/status
```

**GET /order-tracking/admin?status=SHIPPED&limit=50**
Get all orders (with optional status filter)

**GET /order-tracking/admin/:id**
Get full order details (admin view includes user info)

## Status Transitions

Valid status transitions follow a logical order:

```
PENDING → CONFIRMED
         → CANCELLED

CONFIRMED → PACKED
          → CANCELLED

PACKED → SHIPPED
       → CANCELLED

SHIPPED → OUT_FOR_DELIVERY
        → CANCELLED

OUT_FOR_DELIVERY → DELIVERED
                 → CANCELLED

DELIVERED → RETURNED

CANCELLED → (no transitions)
RETURNED → (no transitions)
```

### Automatic Fields Updated

When status changes to:

- **DELIVERED**: `deliveredAt` set to current timestamp
- **CANCELLED**: `cancelledAt` set to current timestamp
- Any status: `updatedAt` updated, tracking history created

## Frontend Features

### Orders List Page (`/orders`)

**Features:**
- List all user orders
- Show order summary with item count
- Display current status with visual badge
- Show total amount and order date
- Quick action buttons to view details

**Components:**
- Order cards with clean layout
- Status badges with color coding
- Empty state when no orders
- Loading skeleton
- Error handling

### Order Details Page (`/order-tracking/:id`)

**Two Tabs:**

1. **Details Tab**
   - Current order status
   - Order items with images and prices
   - Shipping address
   - Tracking information (if available)
   - Order summary (subtotal, tax, shipping, total)
   - Payment information

2. **Tracking Tab**
   - Visual progress bar showing delivery stages
   - Complete tracking history timeline
   - Status events with timestamps
   - Messages and internal notes
   - Estimated delivery date

**Features:**
- Responsive design (mobile-friendly)
- Animated transitions
- Status badges with icons
- Estimated delivery countdown
- Courier and tracking number display
- Comprehensive order information

### Admin Order Update Page (`/admin/orders/update`)

**Features:**
- Search orders by ID
- Select new status from dropdown
- Add public message (shown to customer)
- Add internal note (visible to admins only)
- Input tracking information:
  - Tracking number
  - Courier name
  - Estimated delivery date
- Form validation
- Success/error feedback
- Mobile responsive

## Database Setup

### 1. Run Migration

```bash
# Generate Prisma client
npm run prisma:generate

# Run migration to create OrderTrackingHistory table
npm run prisma:migrate

# Or manually
npx prisma migrate dev --name add_order_tracking
```

### 2. Verify Schema

```bash
# Open Prisma Studio to inspect data
npx prisma studio

# Or query directly
psql -d ecommerce_recommendation
\dt orders
\dt order_tracking_history
```

## Integration with Existing Order System

The tracking system **extends** the existing order model without breaking current functionality:

✅ Existing order creation works unchanged
✅ Payment integration continues to work
✅ Cart checkout continues to work
✅ New tracking fields are optional
✅ Tracking history creates automatically on status changes

### Initial Order Creation

When an order is created:
1. Status defaults to `PENDING`
2. Payment status defaults to `PENDING` or `PAID` (based on payment)
3. Tracking history automatically created with initial status

### Automatic History Creation

Every time status updates:
```typescript
await createTrackingHistoryEntry(
  orderId,
  newStatus,
  message,
  note,
  updatedBy  // Admin ID
);
```

## Usage Examples

### User Views Order List

```
GET /order-tracking?limit=20
→ Returns 20 most recent orders
→ Shows order summary with status
→ User clicks "View Details"
```

### User Tracks Order

```
GET /order-tracking/ord_123
→ Returns full order details
→ User clicks "Tracking Timeline" tab
→ GET /order-tracking/ord_123/tracking
→ Shows complete status history
```

### Admin Updates Order Status

```
PATCH /order-tracking/admin/ord_123/status
{
  "status": "SHIPPED",
  "trackingNumber": "1Z123",
  "courierName": "FedEx",
  "message": "Order shipped!",
  "estimatedDeliveryDate": "2024-01-22"
}
→ Order status updated
→ Tracking history entry created
→ Customer can see update
```

## Security & Validation

**User Access Control:**
- Users can only view their own orders
- JWT authentication required
- Returns 404 if order not found or belongs to different user

**Admin Access Control:**
- Only admin role can update status
- Throws 403 Forbidden for non-admins
- Audit trail shows who made changes

**Status Validation:**
- Only valid transitions allowed
- Invalid transitions rejected with error
- Prevents data corruption

**Input Validation:**
- Order ID required and validated
- Status must be from enum
- Dates validated for valid format
- Tracking number validated as string

## Performance Considerations

**Indexes Added:**
```prisma
@@index([userId])           // Fast user lookups
@@index([status])           // Fast status filtering
@@index([createdAt])        // Fast sorting by date
@@index([orderId])          // Fast history lookups
```

**Queries Optimized:**
- Use pagination (limit/offset)
- Include only needed fields
- Group by status for stats

## Error Handling

**Common Errors:**

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| "Order not found" | 404 | Order doesn't exist or belongs to different user | Verify order ID, ensure authenticated |
| "Invalid status transition" | 400 | Attempting invalid status change | Check valid transitions |
| "Admin access required" | 403 | Non-admin trying to update | Use admin account |
| "Authentication required" | 401 | No JWT token provided | Login first |

## Testing

### Test Order Creation

```bash
# Create order
curl -X POST /orders/buy-now \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"productId": "prod_123", "quantity": 1}'
```

### Test Status Update

```bash
# Update to CONFIRMED
curl -X PATCH /order-tracking/admin/ord_123/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"status": "CONFIRMED"}'

# Check history
curl /order-tracking/ord_123/tracking \
  -H "Authorization: Bearer $TOKEN"
```

### Test User Access

```bash
# User should see their order
curl /order-tracking/ord_123 \
  -H "Authorization: Bearer $USER_TOKEN"

# Different user should get 404
curl /order-tracking/ord_123 \
  -H "Authorization: Bearer $OTHER_USER_TOKEN"
  # → Returns 404
```

## Future Enhancements

Potential improvements:

1. **Email Notifications** - Notify customers on status changes
2. **SMS Updates** - Send tracking updates via SMS
3. **Real-time Updates** - WebSocket for live tracking
4. **Return Management** - Handle returns and refunds
5. **Courier Integration** - Auto-sync with courier APIs
6. **Analytics Dashboard** - Shipping time analytics
7. **Bulk Operations** - Update multiple orders at once
8. **Auto-status** - Automatically update based on time rules

## Troubleshooting

**Orders not showing for user?**
- Check JWT token is valid
- Verify user ID matches order
- Check orders created with correct userId

**Status update fails?**
- Verify admin role
- Check valid status transition
- Ensure order exists

**Tracking history not updating?**
- Verify migration was applied
- Check OrderTrackingHistory table exists
- Review backend logs

## Support

For issues:
1. Check this documentation
2. Review backend logs: `npm run dev`
3. Inspect database: `npx prisma studio`
4. Check browser console for frontend errors
5. Test API endpoints with cURL
