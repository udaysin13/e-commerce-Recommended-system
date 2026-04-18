# Buy Now Feature - Visual Architecture

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Products Page                   Product Detail Page             │
│  ┌──────────────────┐           ┌──────────────────┐            │
│  │  Product Card    │           │  Product Info    │            │
│  │  ┌────────────┐  │           │  ┌────────────┐  │            │
│  │  │ BUY NOW ← ┼──┼───────┐   │  │ BUY NOW ←  ├──┼────┐       │
│  │  │ View       │  │       │   │  │ Add Cart   │  │    │       │
│  │  └────────────┘  │       │   │  └────────────┘  │    │       │
│  └──────────────────┘       │   └──────────────────┘    │       │
│                              │                          │       │
└──────────────────────────────┼──────────────────────────┼───────┘
                               │                          │
                               ↓                          ↓
                    ┌─────────────────────────┐
                    │   CHECKOUT PAGE         │
                    ├─────────────────────────┤
                    │ • Product Image         │
                    │ • Product Details       │
                    │ • Quantity Selector     │
                    │ • Price Breakdown       │
                    │   - Subtotal            │
                    │   - Tax (10%)           │
                    │   - Shipping (Free)     │
                    │   - Total               │
                    │ • Confirm Order Button  │
                    └─────────────────────────┘
                               │
                               ↓
                    ┌─────────────────────────┐
                    │  Auth Check             │
                    │  (localStorage token)   │
                    └─────────────────────────┘
                          ↙    ↖
                    Not Auth  Authenticated
                        │           │
                        ↓           ↓
                  ┌──────────┐   POST /orders/buy-now
                  │  LOGIN   │   {productId, quantity}
                  └──────────┘      │
                        │           ↓
                        └──────┬─────┘
                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                    BACKEND (Express.js)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /orders/buy-now                                            │
│  │                                                               │
│  ├─→ [buyNowController]                                         │
│  │   ├─ Authenticate user (requireAuth middleware)             │
│  │   ├─ Validate request (productId, quantity)                 │
│  │   └─ Call service layer                                     │
│  │                                                               │
│  └─→ [createBuyNowOrder] (Service)                            │
│      ├─ Fetch Product                                          │
│      │  └─ ✓ Validate: exists, active                         │
│      │                                                           │
│      ├─ Validate Quantity                                      │
│      │  └─ ✓ Stock check: quantity ≤ available                │
│      │                                                           │
│      ├─ Calculate Totals                                       │
│      │  ├─ Subtotal = price × quantity                         │
│      │  ├─ Tax = subtotal × 0.10                               │
│      │  ├─ Shipping = 0                                        │
│      │  └─ Total = subtotal + tax                              │
│      │                                                           │
│      ├─ Create Order (Transaction)                             │
│      │  ├─ INSERT into orders table                            │
│      │  └─ INSERT into order_items table                       │
│      │                                                           │
│      ├─ Update Product Stock                                   │
│      │  ├─ stock_quantity -= quantity                          │
│      │  └─ purchase_count += quantity                          │
│      │                                                           │
│      └─ Record Interaction                                     │
│         └─ INSERT into product_interactions (PURCHASE)         │
│                                                                   │
│  Return: OrderResponse                                          │
│  {                                                              │
│    "id": "ord_123",                                             │
│    "orderNumber": "ORD-20240417-ABC123",                       │
│    "totalAmount": 109.99,                                       │
│    ...                                                          │
│  }                                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                         DATABASE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐         │
│  │ orders       │  │ order_items  │  │ products      │         │
│  ├──────────────┤  ├──────────────┤  ├───────────────┤         │
│  │ id           │  │ id           │  │ id            │         │
│  │ userId       │  │ orderId  ────┼─→│ (ref)         │         │
│  │ orderNumber  │  │ productId ──┐│  │ stockQuantity │         │
│  │ status       │  │ quantity    ││  │ purchaseCount │         │
│  │ totalAmount  │  │ unitPrice   ││  └───────────────┘         │
│  │ taxAmount    │  │ totalPrice  ││                             │
│  │ createdAt    │  │ ...         ││  ┌────────────────────┐   │
│  │ ...          │  └──────────────┘│  │ product_interactions│   │
│  └──────────────┘                  │  ├────────────────────┤   │
│                                    │  │ userId             │   │
│                                    │  │ productId ────────→│   │
│                                    │  │ type: PURCHASE     │   │
│                                    │  │ quantity           │   │
│                                    │  │ metadata           │   │
│                                    │  └────────────────────┘   │
│                                    └─────────────────────────────│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND RESPONSE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Success State                                                  │
│  ┌────────────────────────────┐                                │
│  │ ✓ Order Placed Successfully│                                │
│  │ Redirecting to confirmation                                 │
│  └────────────────────────────┘                                │
│                                                                   │
│                        ↓                                         │
│                                                                   │
│  Order Confirmation Page                                        │
│  ┌─────────────────────────────┐                               │
│  │ ✓ Thank You!                │                               │
│  │ Order ID: ord_123           │                               │
│  │ Order Number: ORD-...       │                               │
│  │ Status: Pending             │                               │
│  │                             │                               │
│  │ What's Next?                │                               │
│  │ ✓ Confirmation email sent   │                               │
│  │ ✓ Item shipping soon        │                               │
│  │ ✓ Free delivery             │                               │
│  │                             │                               │
│  │ [Continue Shopping]         │                               │
│  │ [Back to Home]              │                               │
│  └─────────────────────────────┘                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Sequence

```
1. USER INITIATES
   ├─ Views product on Products page
   ├─ Clicks "Buy Now" button
   └─ Router.push(/checkout?productId=X&quantity=1)

2. CHECKOUT PAGE LOADS
   ├─ Fetch product from API
   ├─ Display product details
   ├─ Show quantity selector
   ├─ Calculate and display price
   └─ Ready for user input

3. USER CONFIRMS
   ├─ Adjusts quantity (optional)
   ├─ Clicks "Confirm Order"
   └─ Collect auth token from localStorage

4. AUTHENTICATION CHECK
   ├─ Token exists?
   │  ├─ NO → Redirect to /login
   │  │        (After login, return here)
   │  └─ YES → Continue to API call
   └─

5. API REQUEST
   ├─ Method: POST
   ├─ URL: /orders/buy-now
   ├─ Headers: { Authorization: Bearer token }
   ├─ Body: { productId, quantity }
   └─ State: "processing"

6. BACKEND PROCESSING
   ├─ Authenticate user (validateToken)
   ├─ Fetch product
   ├─ Check active status
   ├─ Validate quantity
   ├─ Check stock availability
   ├─ Calculate totals
   ├─ Create order (transaction)
   │  ├─ INSERT order
   │  ├─ INSERT order_item
   │  ├─ UPDATE product stock
   │  └─ INSERT interaction
   ├─ Return order details
   └─ Status: 201 Created

7. FRONTEND RESPONSE
   ├─ Receive order response
   ├─ Extract order.id
   ├─ State: "success"
   ├─ Show success message
   ├─ Wait 2 seconds
   └─ Redirect to /order-confirmation/:id

8. CONFIRMATION PAGE
   ├─ Display success page
   ├─ Show order ID
   ├─ Show order details
   ├─ Display next steps
   └─ Show action buttons
      ├─ Continue Shopping → /products
      └─ Back to Home → /
```

---

## 📦 Component Hierarchy

```
App
├── Products Page
│   ├── ProductGrid
│   │   └── ProductCard (UPDATED)
│   │       ├── Product Image
│   │       ├── Product Details
│   │       └── Buttons
│   │           ├── "Buy Now" (NEW)
│   │           │   └─ onClick → /checkout
│   │           └── "View"
│   │               └─ onClick → /products/[id]
│   │
│   └── [Navigation]
│
├── Products/[id] Page (UPDATED)
│   ├── Product Image
│   ├── Product Details
│   ├── Buttons
│   │   ├── BuyNowButton (NEW)
│   │   │   └─ onclick → /checkout?productId=X
│   │   └── "Add to Cart"
│   └── RecommendationSection
│
├── Checkout Page (NEW)
│   ├── Product Display
│   │   ├── Image
│   │   ├── Name
│   │   └── Description
│   ├── Quantity Selector
│   │   ├── "-" Button
│   │   ├── Input
│   │   └── "+" Button
│   ├── Price Breakdown
│   │   ├─ Subtotal
│   │   ├─ Tax
│   │   ├─ Shipping
│   │   └─ Total
│   ├── Action Buttons
│   │   ├── "Confirm Order"
│   │   └── "Cancel"
│   └── Info Message
│
└── Order-Confirmation/[id] Page (NEW)
    ├── Success Message
    ├── Order Details
    │   ├── Order ID
    │   ├── Order Date
    │   └── Status
    ├── Next Steps
    └── Action Buttons
        ├── "Continue Shopping"
        └── "Back to Home"
```

---

## 🔐 Authentication Flow

```
Checkout Flow:
┌─────────────────────┐
│ User on Checkout    │
└──────────┬──────────┘
           │
    [Check Auth Token]
           │
    ┌──────┴────────┐
    │               │
    NO              YES
    │               │
    ↓               ↓
┌────────┐    ┌──────────────┐
│ Login  │    │ API Request  │
│ Page   │    │ (with token) │
└────┬───┘    └──────┬───────┘
     │               │
     └──────┬────────┘
            │
      [Create Order]
            │
    ┌───────┴────────┐
    │                │
  Success         Error
    │                │
    ↓                ↓
┌────────────┐  ┌──────────┐
│Confirmation│  │Error Page│
│   Page     │  │(show msg)│
└────────────┘  └──────────┘
```

---

## 💾 Database Transaction

```
Transaction Scope:
┌─────────────────────────────────────────┐
│ BEGIN TRANSACTION                       │
├─────────────────────────────────────────┤
│ 1. Fetch Product (SELECT)               │
│    └─ Check: active, exists             │
│                                          │
│ 2. Fetch Stock (SELECT)                 │
│    └─ Check: quantity ≤ available       │
│                                          │
│ 3. Create Order (INSERT)                │
│    └─ Table: orders                     │
│       ├─ userId, orderNumber, status    │
│       ├─ amounts (subtotal, tax, total) │
│       └─ currency, timestamps           │
│                                          │
│ 4. Create OrderItem (INSERT)            │
│    └─ Table: order_items                │
│       ├─ orderId, productId, quantity   │
│       └─ unitPrice, totalPrice          │
│                                          │
│ 5. Update Product Stock (UPDATE)        │
│    └─ Decrement: stock_quantity         │
│       Increment: purchase_count         │
│                                          │
│ 6. Record Interaction (INSERT)          │
│    └─ Table: product_interactions       │
│       ├─ userId, productId              │
│       ├─ type: PURCHASE                 │
│       └─ metadata                       │
│                                          │
├─────────────────────────────────────────┤
│ COMMIT (if all successful)              │
│ ROLLBACK (if any error)                 │
└─────────────────────────────────────────┘
```

---

## ✅ Error Handling Flow

```
POST /orders/buy-now
        │
        ├─ Auth Check
        │  └─ Missing/Invalid Token
        │     └─ 401 Unauthorized
        │
        ├─ Parameter Validation
        │  ├─ Missing productId/quantity
        │  │  └─ 400 Bad Request
        │  └─ Invalid quantity (< 1)
        │     └─ 400 Bad Request
        │
        ├─ Product Validation
        │  ├─ Product not found
        │  │  └─ 404 Not Found
        │  └─ Product inactive
        │     └─ 400 Bad Request
        │
        ├─ Stock Validation
        │  └─ Insufficient stock
        │     └─ 400 Bad Request
        │
        └─ Success
           └─ 201 Created + Order
```

---

## 📱 Responsive Behavior

```
Desktop (≥1024px)
┌────────────────────────────┐
│   Checkout Page            │
├────────┬───────────────────┤
│        │                   │
│ Image  │  Details & Form   │
│        │  ┌────────────┐   │
│        │  │Quantity    │   │
│        │  │Price       │   │
│        │  │Buttons     │   │
│        │  └────────────┘   │
└────────┴───────────────────┘

Tablet (768px - 1023px)
┌────────────────────┐
│   Image            │
├────────────────────┤
│  Details & Form    │
│  ┌──────────────┐  │
│  │Quantity      │  │
│  │Price         │  │
│  │Buttons       │  │
│  └──────────────┘  │
└────────────────────┘

Mobile (< 768px)
┌──────────┐
│  Image   │
├──────────┤
│ Details  │
├──────────┤
│Quantity  │
├──────────┤
│  Price   │
├──────────┤
│ Buttons  │
└──────────┘
```

---

## 🎨 Color Scheme

```
Primary Actions:
├─ "Buy Now" Button: Teal (#087f83 or var(--teal))
└─ "Confirm Order": Teal → Ink on hover

Secondary Actions:
├─ "Cancel" / "View": Border + Text
├─ "Continue Shopping": Teal
└─ "Back to Home": Border + Text

Status Colors:
├─ Success: Green
├─ Error: Red
├─ Loading: Gray
└─ Info: Blue
```

---

## 🔗 Route Map

```
/products
├─ [ProductCard]
│  └─ "Buy Now" → /checkout
│
/products/[id]
├─ [Product Details]
│  └─ "Buy Now" → /checkout
│
/checkout (NEW)
├─ Query: ?productId=X&quantity=Y
├─ Shows: Checkout form
└─ Actions:
   ├─ "Confirm Order" → POST /orders/buy-now
   └─ "Cancel" → /products

/order-confirmation/[id] (NEW)
├─ Param: orderId from response
├─ Shows: Success page
└─ Actions:
   ├─ "Continue Shopping" → /products
   └─ "Back to Home" → /

/login (existing)
├─ Return URL: /checkout?productId=X
└─ After login: Return to checkout
```

---

This visual guide shows how all components work together to create a seamless "Buy Now" experience! 🎉
