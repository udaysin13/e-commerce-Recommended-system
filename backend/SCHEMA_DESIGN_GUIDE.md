# Prisma Schema Design Guide

## Overview

Production-grade Prisma schema optimized for e-commerce recommendations with 9 models, 3 enums, and comprehensive indexing.

---

## Models Architecture

```
User
  ├── Cart (one-to-one)
  ├── Order[] (one-to-many)
  ├── OrderItem[] (one-to-many)
  ├── Interaction[] (one-to-many) ← CORE FOR RECOMMENDATIONS
  └── ViewHistory[] (one-to-many)

Product
  ├── CartItem[] (one-to-many)
  ├── OrderItem[] (one-to-many)
  ├── Interaction[] (one-to-many) ← CORE FOR RECOMMENDATIONS
  └── ViewHistory[] (one-to-many)

Order
  └── OrderItem[] (one-to-many)

Cart
  └── CartItem[] (one-to-many)
```

---

## Enums

### 1. InteractionType

Tracks user interactions for collaborative filtering and personalization.

```prisma
enum InteractionType {
  VIEW       // User viewed product (weight: 1.0)
  CLICK      // User clicked product (weight: 2.0)
  PURCHASE   // User purchased product (weight: 5.0)
  WISHLIST   // User added to wishlist (weight: 3.0)
  REVIEW     // User reviewed product (weight: 4.0)
  COMPARE    // User compared products (weight: 2.0)
}
```

**Weight Recommendation:**
- VIEW: 1.0 (baseline)
- CLICK: 2.0 (shows intent)
- WISHLIST: 3.0 (strong interest)
- REVIEW: 4.0 (very engaged)
- PURCHASE: 5.0 (highest signal)
- COMPARE: 2.0 (research phase)

### 2. OrderStatus

Tracks order lifecycle for delivery and purchase verification.

```prisma
enum OrderStatus {
  PENDING      // Order created, not confirmed
  CONFIRMED    // Payment received
  PROCESSING   // Being prepared
  SHIPPED      // On the way
  DELIVERED    // Received by customer
  CANCELLED    // User or system cancelled
  REFUNDED     // Money returned
}
```

### 3. ProductCategory

Type-safe product categorization.

```prisma
enum ProductCategory {
  ELECTRONICS
  CLOTHING
  BOOKS
  HOME_APPLIANCES
  SPORTS
  BEAUTY
  TOYS
  FOOD
  JEWELRY
  OTHER
}
```

---

## Model Details

### User Model

```prisma
model User {
  id                   Int       @id @default(autoincrement())
  email                String    @unique              // Login identifier
  password             String                         // Hashed password
  name                 String?
  phone                String?
  address              String?
  preferences          String?   @db.Text            // JSON: { categories: [], priceRange: {} }
  totalSpent           Float     @default(0)         // For VIP recommendations
  totalOrders          Int       @default(0)         // Purchase history depth
  lastPurchaseAt       DateTime?                      // For recency weighting
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Relations
  cart                 Cart?
  orders               Order[]
  orderItems           OrderItem[]
  interactions         Interaction[]                 // All user interactions
  viewHistory          ViewHistory[]

  @@index([email])                                   // For login queries
  @@index([createdAt])                               // For cohort analysis
}
```

**Optimization Tips:**
- Use `preferences` JSON for quick category filtering
- `totalSpent` enables VIP/loyalty recommendations
- `lastPurchaseAt` for recency-weighted scoring

---

### Product Model

```prisma
model Product {
  id                   Int       @id @default(autoincrement())
  name                 String
  description          String    @db.Text           // Full text search
  category             ProductCategory               // Type-safe enum
  price                Float
  originalPrice        Float?                        // For discount calculations
  discount             Int       @default(0)        // Percentage
  imageUrl             String
  images               String[]  @default([])       // Array support
  rating               Float     @default(0)        // 0-5 stars
  reviewCount          Int       @default(0)
  viewCount            Int       @default(0)        // Popularity metric
  purchaseCount        Int       @default(0)        // Conversion metric
  keywords             String[]  @default([])       // ["keyword1", "keyword2"]
  inStock              Boolean   @default(true)
  stockQuantity        Int       @default(0)
  trending             Boolean   @default(false)    // For trending recommendations
  featured             Boolean   @default(false)    // For featured section
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Relations
  cartItems            CartItem[]
  orderItems           OrderItem[]
  interactions         Interaction[]
  viewHistory          ViewHistory[]

  // Indexes - optimize for recommendation queries
  @@index([category])                               // Content-based filtering
  @@index([price])                                  // Price-range filtering
  @@index([rating])                                 // Quality filtering
  @@index([viewCount])                              // Popular items
  @@index([purchaseCount])                          // Best sellers
  @@index([createdAt])                              // New items
  @@index([trending])                               // Trending filter
  @@index([featured])                               // Featured filter
  @@fulltext([name, description, keywords])         // Full text search
}
```

**Optimization Tips:**
- `viewCount` and `purchaseCount` for collaborative filtering
- `keywords` array for quick text filtering
- `trending` and `featured` for quick marketing queries
- Full text index for search-based recommendations

---

### Interaction Model (CORE FOR RECOMMENDATIONS)

```prisma
model Interaction {
  id                   Int       @id @default(autoincrement())
  userId               Int
  productId            Int
  type                 InteractionType               // VIEW, CLICK, PURCHASE, etc.
  weight               Float     @default(1.0)      // Algorithm weighting
  metadata             String?   @db.Text           // JSON: { duration, source, deviceType }
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Relations
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  product              Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  // Prevent duplicate interactions on same day
  @@unique([userId, productId, type, createdAt(sortBy: Desc)])
  
  // Indexes - critical for collaborative filtering
  @@index([userId])                                 // User profile queries
  @@index([productId])                              // Product analytics
  @@index([type])                                   // Filter by interaction type
  @@index([userId, type])                           // User's specific interactions
  @@index([productId, type])                        // Product's interaction patterns
  @@index([createdAt])                              // Time-based queries
  @@index([weight])                                 // Weighted recommendations
}
```

**Usage Examples:**

```javascript
// Get user's interaction history
const userInteractions = await prisma.interaction.findMany({
  where: { userId: 1 },
  orderBy: { createdAt: 'desc' }
});

// Get products a user interacted with (for collaborative filtering)
const userViewedProducts = await prisma.interaction.findMany({
  where: {
    userId: 1,
    type: 'PURCHASE'
  },
  select: { productId: true },
  orderBy: { createdAt: 'desc' }
});

// Find users with similar purchase patterns
const similarUsers = await prisma.interaction.groupBy({
  by: ['userId'],
  where: {
    productId: 101,
    type: 'PURCHASE'
  },
  orderBy: { _count: { productId: 'desc' } }
});

// Weighted scoring for recommendations
const scoredInteractions = await prisma.interaction.findMany({
  where: { userId: 1 },
  select: { productId: true, weight: true },
  orderBy: { weight: 'desc' }
});
```

---

### Order Model

```prisma
model Order {
  id                   Int       @id @default(autoincrement())
  userId               Int
  status               OrderStatus @default(PENDING) // Type-safe
  total                Float                         // Final amount
  subtotal             Float?                        // Before tax/shipping
  tax                  Float     @default(0)
  shippingCost         Float     @default(0)
  discount             Float     @default(0)        // Applied discount
  paymentMethod        String?                       // cc, paypal, etc.
  shippingAddress      String    @db.Text
  trackingNumber       String?                       // For shipped orders
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  deliveredAt          DateTime?                     // For completed orders

  // Relations
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items                OrderItem[]

  // Indexes for queries
  @@index([userId])                                 // User's orders
  @@index([status])                                 // Filter by status
  @@index([createdAt])                              // Time-range queries
  @@index([deliveredAt])                            // Verified purchases
}
```

**Optimization Tips:**
- `deliveredAt` for verified purchase verification in recommendations
- `status` for purchase history filtering
- `discount` tracks promotional effectiveness

---

### OrderItem Model

```prisma
model OrderItem {
  id                   Int       @id @default(autoincrement())
  orderId              Int
  productId            Int
  userId               Int
  quantity             Int
  price                Float                        // Snapshot at purchase time
  discount             Float     @default(0)
  subtotal             Float                        // quantity * price

  // Relations
  order                Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product              Product   @relation(fields: [productId], references: [id])
  user                 User      @relation(fields: [userId], references: [id])

  // Indexes
  @@index([orderId])
  @@index([productId])
  @@index([userId])
}
```

**Purpose:**
- Snapshot of product price at purchase time
- Supports collaborative filtering analysis
- Tracks purchase quantity (for repeat buys)

---

### ViewHistory Model

```prisma
model ViewHistory {
  id                   Int       @id @default(autoincrement())
  userId               Int
  productId            Int
  viewedAt             DateTime  @default(now())
  timeSpent            Int       @default(0)       // Seconds on product
  source               String?   @default("direct") // Page/referrer

  // Relations
  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  product              Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  // Indexes for content-based filtering
  @@index([userId])                                // User's viewing patterns
  @@index([productId])                             // Product's view trends
  @@index([viewedAt])                              // Recent views
  @@index([userId, viewedAt])                      // User's recent views
}
```

**Usage for Recommendations:**
- Recently viewed products for "Continue Shopping"
- Product-to-product similarity (similar to recently viewed)
- User interests based on viewing patterns

---

### Cart & CartItem Models

```prisma
model Cart {
  id                   Int       @id @default(autoincrement())
  userId               Int       @unique            // One cart per user
  totalPrice           Float     @default(0)        // Cached total
  itemCount            Int       @default(0)        // Cached count
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  user                 User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items                CartItem[]

  @@index([userId])
  @@index([updatedAt])                             // For abandoned cart detection
}

model CartItem {
  id                   Int       @id @default(autoincrement())
  cartId               Int
  productId            Int
  quantity             Int       @default(1)
  addedAt              DateTime  @default(now())   // When added to cart

  cart                 Cart      @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product              Product   @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])
  @@index([cartId])
  @@index([productId])
}
```

---

### RecommendationCache Model (Optional)

```prisma
model RecommendationCache {
  id                   Int       @id @default(autoincrement())
  userId               Int
  type                 String                      // "hybrid", "content", "collaborative"
  recommendations      String    @db.Text         // JSON array of 50 recommendations
  expiresAt            DateTime                    // TTL for cache
  createdAt            DateTime  @default(now())

  @@index([userId, type])                         // Primary query pattern
  @@index([expiresAt])                            // For cleanup queries
  @@unique([userId, type])                        // One cache per type per user
}
```

**Usage:**
- Cache expensive recommendations to reduce load
- Invalidate on user interaction
- Cleanup expired caches hourly

---

## Indexes Strategy

### For Collaborative Filtering
```javascript
// Find users who viewed same products
Interaction.findMany({
  where: { productId: 101, type: 'PURCHASE' },
  select: { userId: true }
});
// Uses: @@index([productId, type])

// Find products a user viewed
Interaction.findMany({
  where: { userId: 1, type: 'PURCHASE' },
  select: { productId: true }
});
// Uses: @@index([userId, type])
```

### For Content-Based Filtering
```javascript
// Find products in same category with similar price
Product.findMany({
  where: {
    category: 'ELECTRONICS',
    price: { gte: 100, lte: 500 }
  }
});
// Uses: @@index([category]), @@index([price])

// Find trending products in category
Product.findMany({
  where: {
    category: 'ELECTRONICS',
    trending: true
  },
  orderBy: { viewCount: 'desc' }
});
// Uses: @@index([category]), @@index([trending])
```

### For Popularity-Based
```javascript
// Get most viewed products
Product.findMany({
  orderBy: { viewCount: 'desc' },
  take: 10
});
// Uses: @@index([viewCount])

// Get best sellers
Product.findMany({
  orderBy: { purchaseCount: 'desc' },
  take: 10
});
// Uses: @@index([purchaseCount])
```

### For Time-Based
```javascript
// Get products added in last 7 days
Product.findMany({
  where: {
    createdAt: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  }
});
// Uses: @@index([createdAt])

// Get user's recent views
ViewHistory.findMany({
  where: { userId: 1 },
  orderBy: { viewedAt: 'desc' },
  take: 10
});
// Uses: @@index([userId, viewedAt])
```

---

## Migration Steps

### 1. Create migration
```bash
npx prisma migrate dev --name add-recommendation-models
```

### 2. Review schema
```bash
npx prisma db push  # Using dev/staging only
```

### 3. Seed data
```bash
npm run seed
```

### 4. Generate client
```bash
npx prisma generate
```

---

## Database Performance Tips

### 1. Connection Pool Optimization
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
PRISMA_DB_BATCH_SIZE=10000
```

### 2. Query Optimization
```javascript
// ❌ Bad - N+1 query problem
const interactions = await prisma.interaction.findMany();
for (const interaction of interactions) {
  const user = await prisma.user.findUnique({
    where: { id: interaction.userId }
  });
}

// ✅ Good - Use include/select
const interactions = await prisma.interaction.findMany({
  include: { user: true, product: true },
  take: 1000
});

// ✅ Better - Load in batches
const interactions = await prisma.interaction.findMany({
  where: { createdAt: { gte: sevenDaysAgo } },
  select: { userId: true, productId: true, weight: true },
  orderBy: { weight: 'desc' }
});
```

### 3. Batch Operations
```javascript
// Instead of multiple updates
const results = await prisma.interaction.createMany({
  data: interactions,
  skipDuplicates: true
});
```

### 4. Raw Queries for Complex Operations
```javascript
// Complex recommendation query
const recommendations = await prisma.$queryRaw`
  SELECT p.*, AVG(i.weight) as score
  FROM "Product" p
  JOIN "Interaction" i ON p.id = i.productId
  WHERE i."userId" IN (
    SELECT "userId" FROM "Interaction"
    WHERE "productId" IN (
      SELECT "productId" FROM "Interaction" WHERE "userId" = ${userId}
    )
  )
  GROUP BY p.id
  ORDER BY score DESC
  LIMIT 20
`;
```

---

## Common Queries

### Get User Recommendations (Hybrid)

```javascript
async function getHybridRecommendations(userId) {
  // Get user's interaction history
  const userInteractions = await prisma.interaction.findMany({
    where: { userId },
    select: { productId: true, type: true, weight: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const viewedProductIds = userInteractions
    .map(i => i.productId);

  // Find similar products (content-based)
  const similarProducts = await prisma.product.findMany({
    where: {
      id: { notIn: viewedProductIds },
      category: {
        in: await getPreferredCategories(userId)
      }
    },
    orderBy: { rating: 'desc' },
    take: 50
  });

  // Find products liked by similar users (collaborative)
  const similarUsers = await findSimilarUsers(userId);
  const collaborativeProducts = await prisma.interaction.findMany({
    where: {
      userId: { in: similarUsers },
      productId: { notIn: viewedProductIds }
    },
    select: { productId: true },
    distinct: ['productId'],
    take: 50
  });

  // Merge and score results
  return mergeAndScore([similarProducts, collaborativeProducts]);
}
```

### Get Trending Products

```javascript
async function getTrendingProducts(category) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return prisma.product.findMany({
    where: {
      category,
      viewCount: { gt: 0 }
    },
    orderBy: [
      { trending: 'desc' },
      { viewCount: 'desc' }
    ],
    take: 20
  });
}
```

### Get Products Liked by Similar Users

```javascript
async function getCollaborativeRecommendations(userId) {
  // Find what this user purchased
  const userPurchases = await prisma.interaction.findMany({
    where: {
      userId,
      type: 'PURCHASE'
    },
    select: { productId: true }
  });

  // Find users who purchased same products
  const similarUsers = await prisma.interaction.findMany({
    where: {
      productId: {
        in: userPurchases.map(p => p.productId)
      },
      userId: { not: userId },
      type: 'PURCHASE'
    },
    select: { userId: true },
    distinct: ['userId'],
    take: 100
  });

  // Find what those users purchased
  return prisma.interaction.findMany({
    where: {
      userId: {
        in: similarUsers.map(u => u.userId)
      },
      productId: {
        notIn: userPurchases.map(p => p.productId)
      },
      type: 'PURCHASE'
    },
    select: { productId: true },
    distinct: ['productId'],
    take: 50
  });
}
```

---

## Schema Versioning

### Version History
- **v1.0** (Current) - Initial production schema with Interaction model

### Future Enhancements
- [ ] Add Review model for sentiment analysis
- [ ] Add ClickStream model for page-level tracking
- [ ] Add UserSegment model for audience targeting
- [ ] Add ABTest model for experiments
- [ ] Add ProductBundle model for cross-sell recommendations

---

## Validation & Constraints

### User Model
- `email` - Must be unique, valid email format
- `password` - Must be hashed, min 8 chars
- `totalSpent` - Non-negative float

### Product Model
- `price` - Must be positive
- `discount` - 0-100%
- `rating` - 0-5 stars
- `keywords` - Max 10 keywords

### Interaction Model
- `weight` - Must be positive
- `userId` & `productId` - Must reference valid records
- `type` - Must be valid enum value

### Order Model
- `total` - Calculated from items
- `status` - Must be valid OrderStatus enum

---

## Related Files

- **Implementation Guide**: backends/RECOMMENDATIONS_GUIDE.md
- **API Documentation**: backend/RECOMMENDATIONS_API_DOCUMENTATION.md
- **Best Practices**: backend/CONTROLLER_BEST_PRACTICES.md
- **Seed Data**: backend/prisma/seed.js

---

**Schema Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Status:** Production Ready ✅

