# Order Tracking System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /orders                    /order-tracking/[id]    /admin/...   │
│  ├─ Orders List             ├─ Order Details        ├─ Dashboard │
│  ├─ Status Badges           ├─ Tracking Timeline    ├─ Update    │
│  └─ View Details Buttons    └─ Status Timeline      └─ Status    │
│                                                                   │
└────────────┬────────────────────────────────────────────┬────────┘
             │  HTTP Requests                             │
             │  JSON Responses                            │
             │  JWT Auth                                  │
┌────────────▼────────────────────────────────────────────▼────────┐
│                    BACKEND (Express + TypeScript)                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  API Routes                                                      │
│  ├─ User Routes (Protected)                                     │
│  │  ├─ GET /order-tracking                                     │
│  │  ├─ GET /order-tracking/:id                                │
│  │  ├─ GET /order-tracking/:id/tracking                      │
│  │  └─ GET /order-tracking/stats                            │
│  │                                                             │
│  └─ Admin Routes (Role-Protected)                             │
│     ├─ GET /order-tracking/admin                            │
│     ├─ GET /order-tracking/admin/:id                        │
│     └─ PATCH /order-tracking/admin/:id/status              │
│                                                              │
│  Controllers                                                  │
│  └─ orderTrackingController.ts                              │
│     ├─ getOrdersList()         → Query user's orders        │
│     ├─ getOrderDetails()        → Get full order info       │
│     ├─ getTrackingHistory()     → Timeline view            │
│     ├─ getOrderStats()          → Status statistics        │
│     ├─ adminUpdateStatus()      → Update order status      │
│     └─ adminGetAllOrders()      → List all orders (admin)  │
│                                                              │
│  Services                                                    │
│  └─ orderTrackingService.ts                                │
│     ├─ fetchUserOrders()                                   │
│     ├─ fetchOrderDetails()                                 │
│     ├─ fetchTrackingHistory()                             │
│     ├─ updateOrderStatus()                                │
│     ├─ createTrackingHistory()                            │
│     ├─ validateStatusTransition()                         │
│     └─ calculateOrderStats()                             │
│                                                             │
└────────────┬────────────────────────────────────────────────┘
             │  SQL Queries
             │  Transactions
             │  ORM (Prisma)
             │
┌────────────▼────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL + Prisma)                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Tables                                                       │
│  ├─ orders                                                   │
│  │  ├─ id, orderNumber, status, paymentStatus              │
│  │  ├─ trackingNumber, courierName                         │
│  │  ├─ estimatedDeliveryDate, deliveredAt, cancelledAt    │
│  │  ├─ userId, totalAmount, currency                       │
│  │  └─ updatedAt, createdAt                               │
│  │                                                           │
│  ├─ orderTrackingHistory (NEW)                            │
│  │  ├─ id, orderId (FK), status, message, note            │
│  │  ├─ updatedBy, createdAt                              │
│  │  └─ indexes: orderId, status, createdAt              │
│  │                                                          │
│  └─ Related Tables                                         │
│     ├─ users (owner info)                                │
│     ├─ orderItems (products in order)                   │
│     └─ products (product details)                       │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Views Orders

```
User Browser
    │
    └─→ GET /orders (Frontend)
        └─→ http://localhost:3000/orders
            │
            ├─→ API: GET /order-tracking
            │   └─→ Backend receives request
            │       │
            │       ├─→ Validate JWT token
            │       ├─→ Extract userId
            │       └─→ Query database
            │           │
            │           └─→ SELECT * FROM orders WHERE userId = ?
            │               └─→ Return orders list
            │
            └─→ Render Orders List Page
                ├─ Order cards with status
                ├─ View Details buttons
                └─ Navigation to detail page
```

### 2. User Views Order Details + Tracking

```
User Clicks Order
    │
    └─→ GET /order-tracking/[id] (Frontend)
        └─→ http://localhost:3000/order-tracking/ord_123
            │
            ├─→ API: GET /order-tracking/:id
            │   └─→ Get order details
            │       │
            │       └─→ SELECT * FROM orders WHERE id = ? AND userId = ?
            │           └─→ Return full order with items
            │
            ├─→ API: GET /order-tracking/:id/tracking
            │   └─→ Get tracking history
            │       │
            │       └─→ SELECT * FROM orderTrackingHistory WHERE orderId = ?
            │           ORDER BY createdAt DESC
            │           └─→ Return timeline events
            │
            └─→ Render Order Details Page
                ├─ Tab 1: Order Details
                │  ├─ Items list
                │  ├─ Shipping address
                │  ├─ Order summary
                │  └─ Tracking info (if available)
                │
                └─ Tab 2: Tracking Timeline
                   ├─ Progress bar
                   ├─ Status events
                   ├─ Timestamps
                   └─ Messages
```

### 3. Admin Updates Order Status

```
Admin Form Submission
    │
    └─→ POST /admin/orders/update (Frontend)
        └─→ http://localhost:3000/admin/orders/update
            │
            ├─→ Form Input
            │  ├─ Order ID
            │  ├─ New Status
            │  ├─ Message (optional)
            │  ├─ Note (optional)
            │  └─ Tracking info (optional)
            │
            └─→ API: PATCH /order-tracking/admin/:id/status
                └─→ Backend receives update request
                    │
                    ├─→ Validate JWT token
                    ├─→ Check admin role
                    ├─→ Validate order exists
                    ├─→ Validate status transition
                    │
                    ├─→ Update order
                    │  └─→ UPDATE orders
                    │      SET status = ?, trackingNumber = ?, ...
                    │      WHERE id = ?
                    │
                    ├─→ Create tracking history entry
                    │  └─→ INSERT INTO orderTrackingHistory
                    │      (orderId, status, message, note, updatedBy)
                    │      VALUES (?)
                    │
                    └─→ Return success response
                        │
                        └─→ User sees success notification
                            Order status updated!
```

## Component Architecture

### Frontend Components

```
app/orders/page.tsx
├─ OrdersList component
│  ├─ Fetch orders
│  ├─ Map over orders
│  ├─ Render OrderCard components
│  └─ Handle navigation
│
└─ OrderCard (repeated for each)
   ├─ Order number
   ├─ Status badge (color-coded)
   ├─ Total amount
   ├─ Order date
   ├─ Item count
   └─ View Details button

app/order-tracking/[id]/page.tsx
├─ OrderDetailsPage component
│  ├─ Fetch order details
│  ├─ Fetch tracking history
│  ├─ Tab 1: Details Tab
│  │  ├─ Order info
│  │  ├─ Order items list
│  │  ├─ Shipping address
│  │  ├─ Order summary
│  │  └─ Tracking info display
│  │
│  └─ Tab 2: Tracking Tab
│     ├─ Progress bar
│     ├─ Timeline component
│     └─ TrackingEvent items

app/admin/orders/update/page.tsx
├─ AdminUpdateOrderForm component
│  ├─ Order ID input
│  ├─ Status dropdown
│  ├─ Message textarea
│  ├─ Note textarea
│  ├─ Tracking info section
│  │  ├─ Tracking number
│  │  ├─ Courier name
│  │  └─ Estimated delivery date
│  └─ Submit button
```

### Backend Services Layer

```
orderTrackingService.ts
│
├─ User Operations
│  ├─ getUserOrders(userId, limit, offset)
│  ├─ getOrderDetails(orderId, userId)
│  ├─ getTrackingHistory(orderId, userId)
│  └─ getOrderStatistics(userId)
│
├─ Admin Operations
│  ├─ getAllOrders(filter, limit)
│  ├─ getOrderDetailsAdmin(orderId)
│  └─ updateOrderStatus(orderId, statusData, adminId)
│
├─ Utility Functions
│  ├─ createTrackingHistoryEntry()
│  ├─ validateStatusTransition()
│  └─ calculateOrderStats()
│
└─ Error Handling
   ├─ Order not found errors
   ├─ Invalid transition errors
   ├─ Authorization errors
   └─ Validation errors
```

## Status Flow Diagram

```
                    ┌──────────────┐
                    │  ORDER READY │
                    └──────┬───────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
    ┌────────┐                          ┌──────────┐
    │PENDING │                          │CANCELLED │
    └────┬───┘                          └──────────┘
         │
         ▼
    ┌──────────┐
    │CONFIRMED │
    └────┬─────┘
         │
         ▼
    ┌──────┐
    │PACKED│
    └───┬──┘
        │
        ▼
    ┌─────────┐
    │ SHIPPED │
    └────┬────┘
         │
         ▼
    ┌──────────────────┐
    │OUT_FOR_DELIVERY  │
    └────┬─────────────┘
         │
         ▼
    ┌──────────┐
    │DELIVERED │
    └────┬─────┘
         │
         ▼
    ┌─────────┐
    │RETURNED │
    └─────────┘
```

## Request/Response Flow

### GET /order-tracking (User)

```
Request:
  GET /order-tracking?limit=20&offset=0
  Headers: Authorization: Bearer $TOKEN

Backend Processing:
  1. Extract token
  2. Validate token signature
  3. Get userId from token
  4. Query orders: SELECT * FROM orders WHERE userId = ? LIMIT 20 OFFSET 0
  5. Format response

Response:
  {
    "success": true,
    "data": {
      "orders": [{...}, {...}],
      "total": 25,
      "limit": 20,
      "offset": 0
    }
  }
```

### PATCH /order-tracking/admin/:id/status (Admin)

```
Request:
  PATCH /order-tracking/admin/ord_123/status
  Headers: Authorization: Bearer $ADMIN_TOKEN
           Content-Type: application/json
  Body: {
    "status": "SHIPPED",
    "trackingNumber": "1Z123",
    "courierName": "FedEx",
    "estimatedDeliveryDate": "2024-01-15T00:00:00Z"
  }

Backend Processing:
  1. Extract token and get userId/role
  2. Validate admin role
  3. Find order by ID
  4. Validate status transition (PENDING → CONFIRMED? Valid)
  5. Update order status and fields
  6. Create tracking history entry
  7. Return updated order with tracking history

Response:
  {
    "success": true,
    "data": {
      "order": {
        "id": "ord_123",
        "status": "SHIPPED",
        "trackingNumber": "1Z123",
        "trackingHistory": [{...}]
      },
      "message": "Order status updated to SHIPPED"
    }
  }
```

## Database Relationships

```
User (1) ──────── (N) Order
  │                   │
  │                   ├── status, totalAmount, ...
  │                   │
  │                   └── (1) ──── (N) OrderTrackingHistory
  │                                    │
  │                                    ├── status
  │                                    ├── message
  │                                    ├── updatedBy (FK to User if admin)
  │                                    └── createdAt
  │
  └── firstName, email, role, ...

Order (1) ──---- (N) OrderItem
           │         │
           │         └── productId (FK to Product)
           │         └── quantity, unitPrice
           │
           └── (1) ─── (N) OrderTrackingHistory
```

## Performance Optimization

```
Indexes:
  ├─ orders.userId          → Fast user order lookups
  ├─ orders.status          → Fast status filtering
  ├─ orders.createdAt       → Fast sorting by date
  ├─ orderTrackingHistory.orderId   → Fast history lookups
  ├─ orderTrackingHistory.status    → Fast status filtering
  └─ orderTrackingHistory.createdAt → Fast chronological queries

Query Optimization:
  ├─ Pagination (limit/offset)
  ├─ Only select needed fields
  ├─ Eager load relationships
  └─ Cache frequently accessed data
```

## Error Handling Flow

```
Invalid Request
    │
    ├─→ No token → 401 Unauthorized
    ├─→ Invalid token → 401 Unauthorized
    ├─→ Non-admin accessing admin route → 403 Forbidden
    ├─→ Order not found → 404 Not Found
    ├─→ Invalid status transition → 400 Bad Request
    ├─→ Database error → 500 Internal Server Error
    │
    └─→ Return error response
        {
          "success": false,
          "error": {
            "message": "Error description",
            "statusCode": 400
          }
        }
```

## Integration Points

```
Order Tracking System
  │
  ├─ Connects to: Authentication (JWT)
  │              └─ Validates user and admin roles
  │
  ├─ Connects to: Order Management
  │              └─ Uses existing orders table
  │
  ├─ Connects to: Product Catalog
  │              └─ Gets product info for order items
  │
  └─ Stores: OrderTrackingHistory
             └─ New table for tracking events
```
