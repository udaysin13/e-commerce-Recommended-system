# E-Commerce Recommendation System - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Design](#database-design)
6. [Data Flow](#data-flow)
7. [Recommendation Engine](#recommendation-engine)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [Deployment Architecture](#deployment-architecture)
11. [Scalability Roadmap](#scalability-roadmap)
12. [Technology Decisions](#technology-decisions)

---

## System Overview

This e-commerce platform is built as a modern **full-stack web application** with intelligent product recommendations powered by advanced algorithms. The system is designed to handle product browsing, shopping cart management, order processing, and personalized recommendations.

### Core Principles
- **Scalability**: Horizontal scaling with microservices ready architecture
- **Performance**: Client-side caching, database optimization, efficient algorithms
- **Reliability**: Comprehensive error handling and retry mechanisms
- **Maintainability**: Clean separation of concerns with MVC pattern
- **User Experience**: Real-time updates, loading states, error recovery

### System Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js 16 / React 19 Application                  │   │
│  │  ├─ Pages (app/*)                                   │   │
│  │  ├─ Components (business logic & presentation)      │   │
│  │  ├─ Client Hooks (state management)                 │   │
│  │  └─ API Client (fetch wrapper)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         HTTPS/REST
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Express)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Route Handlers                                     │   │
│  │  ├─ /api/products/*                                 │   │
│  │  ├─ /api/cart/*                                     │   │
│  │  ├─ /api/orders/*                                   │   │
│  │  └─ /api/recommendations/*                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware Stack                                   │   │
│  │  ├─ Error Handler                                   │   │
│  │  ├─ Validation                                      │   │
│  │  ├─ Async Wrapper                                   │   │
│  │  └─ CORS                                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                    Database Queries
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Controllers (request handling)                     │   │
│  │  ├─ authController.js                              │   │
│  │  ├─ productController.js                           │   │
│  │  ├─ orderController.js                             │   │
│  │  └─ recommendationController.js                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services (business logic)                          │   │
│  │  ├─ recommendationService.js (13 algorithms)        │   │
│  │  ├─ orderService.js                                │   │
│  │  └─ productService.js                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           Prisma ORM (Query Builder & Validation)
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Prisma Client                                      │   │
│  │  ├─ Schema validation                              │   │
│  │  ├─ Query optimization                             │   │
│  │  └─ Transaction support                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                  PostgreSQL Connection Pool
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                               │   │
│  │  ├─ Users (authentication & profiles)              │   │
│  │  ├─ Products (catalog management)                  │   │
│  │  ├─ CartItems (shopping cart persistence)          │   │
│  │  ├─ Orders & OrderItems (transaction history)      │   │
│  │  └─ ViewHistory (behavior tracking)                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. Presentation Layer (Frontend)
**Technology**: Next.js 16, React 19, Tailwind CSS 4

**Responsibilities**:
- Render user interface components
- Manage client-side state (cart, search filters)
- Handle user interactions and form submissions
- Implement client-side caching and optimization
- Display loading states and error messages

**Key Features**:
- Server-side rendering (SSR) via Next.js
- Client components for interactivity
- CSS-in-JS with Tailwind for styling
- Responsive design for all screen sizes

### 2. API Layer (Express Router)
**Technology**: Express.js 5.2.1

**Responsibilities**:
- Route HTTP requests to appropriate handlers
- Validate request data
- Execute middleware (error handling, validation)
- Return JSON responses with consistent format

**Endpoints Architecture**:
```
GET    /api/products           - List products (paginated, filtered)
GET    /api/products/:id       - Get single product details
POST   /api/products           - Admin: Create product

GET    /api/cart               - Get user's cart
POST   /api/cart/add           - Add item to cart
PUT    /api/cart/update/:id    - Update cart item quantity
DELETE /api/cart/remove/:id    - Remove item from cart
POST   /api/cart/checkout      - Process checkout

GET    /api/orders             - Get user's order history
GET    /api/orders/:id         - Get order details
POST   /api/orders             - Create order from cart

GET    /api/recommendations/basic/:productId      - Basic recommendations
GET    /api/recommendations/advanced/:userId      - Advanced recommendations
GET    /api/recommendations/trending              - Trending products
GET    /api/recommendations/personalized/:userId  - ML-based recommendations
```

### 3. Business Logic Layer
**Technology**: Node.js services and controllers

**Controllers** (Handle HTTP requests):
- `authController`: User authentication, login/logout
- `productController`: Product CRUD operations
- `orderController`: Order management
- `viewController`: View history tracking

**Services** (Implement business rules):
- `recommendationService`: 13+ recommendation algorithms
- `cartService`: Shopping cart logic
- `orderService`: Order processing and fulfillment

### 4. Data Access Layer
**Technology**: Prisma ORM 7.6

**Responsibilities**:
- Abstract database operations
- Enforce schema validation
- Optimize queries automatically
- Provide transaction support
- Handle connection pooling

**Key Features**:
- Type-safe database queries
- Automatic migrations
- Built-in pagination and filtering
- Relation eager loading

### 5. Database Layer
**Technology**: PostgreSQL 

**Stores**:
- User profiles and authentication
- Product catalog and inventory
- Shopping cart data
- Order transactions
- View history for recommendations
- User behavior for algorithm training

---

## Frontend Architecture

### Component Hierarchy
```
layout.js (Root Layout)
├─ Navbar (Global Navigation)
│  ├─ Search Form
│  ├─ Category Buttons
│  └─ User Links
├─ Pages
│  ├─ page.js (Home/Products List)
│  │  ├─ HomeClient
│  │  │  ├─ ProductCard (x N)
│  │  │  └─ Pagination
│  │  └─ RecommendationSection
│  │     └─ ProductCard (x N)
│  ├─ products/[id]/page.js (Product Detail)
│  │  └─ ProductDetailClient
│  │     ├─ ProductImage
│  │     ├─ PriceSection
│  │     ├─ ReviewsSection
│  │     └─ RecommendationSection
│  ├─ cart/page.js (Shopping Cart)
│  │  └─ CartClient
│  │     ├─ CartItem (x N)
│  │     └─ CheckoutForm
│  └─ login/page.js (Authentication)
│     └─ LoginClient
└─ Error Boundary
   └─ Global Error Handler
```

### State Management
**Local State** (useState):
- Search query
- Filter selections
- Cart item count
- Loading states
- Error messages

**Persistent State** (localStorage):
- Shopping cart data
- User preferences
- Search history

**Server State** (API calls via React hooks):
- Product data
- User orders
- Recommendations
- User profile

### Client-Side Optimization
```javascript
// API Response Caching
const cache = new Map();

async function getCachedData(url, maxAge = 5 * 60 * 1000) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < maxAge) {
    return cached.data;
  }
  
  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}
```

---

## Backend Architecture

### MVC Pattern Implementation
**Models** (Prisma Schema):
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  password  String
  createdAt DateTime  @default(now())
  orders    Order[]
  viewHistory ViewHistory[]
}

model Product {
  id        String    @id @default(cuid())
  name      String
  price     Float
  category  String
  rating    Float
  reviews   Int
  inStock   Boolean
  imageUrl  String
  orderItems OrderItem[]
}

model Order {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  items     OrderItem[]
  total     Float
  status    String
  createdAt DateTime  @default(now())
}

model ViewHistory {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  productId String
  viewedAt  DateTime  @default(now())
}
```

**Controllers** (Req/Res handlers):
```javascript
// Example: productController.js
async function getProducts(req, res, next) {
  try {
    const { page = 1, limit = 20, category } = req.query;
    
    const products = await productService.getProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
    });
    
    return res.json({ success: true, data: products });
  } catch (error) {
    next(error); // Pass to error handler
  }
}
```

**Services** (Business logic):
```javascript
// Example: orderService.js
async function createOrder(userId, cartItems) {
  // Validate stock availability
  // Calculate totals with discounts
  // Create order transaction
  // Update inventory
  // Clear user's cart
  // Send confirmation email
}
```

### Request/Response Flow
```
1. Browser: POST /api/cart/add
           ↓
2. Router: Route handler matches
           ↓
3. Middleware: Validate request, log request
           ↓
4. Controller: Extract data, call service
           ↓
5. Service: Execute business logic
           ↓
6. Prisma: Generate and execute SQL query
           ↓
7. Database: Persist data
           ↓
8. Service: Format response ← Error handling ←
           ↓
9. Controller: Return JSON response
           ↓
10. Middleware: Log response, add CORS headers
           ↓
11. Router: Send HTTP response
           ↓
12. Browser: Receive and process JSON
```

### Middleware Stack
```javascript
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(errorHandler);
app.use(routes);
app.use(globalErrorHandler);
```

---

## Database Design

### Entity Relationship Diagram
```
User (1) ─── (M) Order
  ├─ id
  ├─ email
  ├─ password
  └─ createdAt

Order (1) ─── (M) OrderItem

OrderItem (M) ─── (1) Product
  ├─ orderId
  ├─ productId
  ├─ quantity
  └─ price

Product (1)
  ├─ id
  ├─ name
  ├─ price
  ├─ category
  ├─ rating
  ├─ inStock
  └─ imageUrl

User (1) ─── (M) ViewHistory ─── (1) Product
  ├─ Tracks behavior
  └─ For recommendations
```

### Indexing Strategy
```sql
-- Improve query performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_userId ON orders(userId);
CREATE INDEX idx_viewHistory_userId ON viewHistory(userId);
CREATE INDEX idx_viewHistory_createdAt ON viewHistory(createdAt DESC);
CREATE INDEX idx_orderItems_productId ON orderItems(productId);
```

---

## Data Flow

### 1. Product Browsing Flow
```
User opens homepage
    ↓
Frontend: GET /api/products?page=1&limit=20
    ↓
Backend: productController.getProducts()
    ↓
Service: Calculate offset, fetch from database
    ↓
Database: SELECT * FROM products LIMIT 20 OFFSET 0
    ↓
Response: 20 products with metadata
    ↓
Frontend: Render ProductCard components
    ↓
User views product (tracked for recommendations)
```

### 2. Shopping Cart Flow
```
User clicks "Add to Cart"
    ↓
Frontend: POST /api/cart/add { productId, quantity }
    ↓
Backend: cartController.addToCart()
    ↓
Service: 
  1. Verify stock availability
  2. Check if item exists in cart
  3. Update or create CartItem
    ↓
Database: INSERT/UPDATE cartItems
    ↓
Response: Updated cart
    ↓
Frontend: Update local state, show confirmation
```

### 3. Order Checkout Flow
```
User submits checkout form
    ↓
Frontend: POST /api/orders/create { items, shippingAddress }
    ↓
Backend: orderController.createOrder()
    ↓
Service: 
  1. Get user's cart items
  2. Verify stock for each item
  3. Calculate total with discounts
  4. Create Order transaction
  5. Create OrderItems for each product
  6. Update product inventory
  7. Clear shopping cart
  8. Send confirmation email
    ↓
Database: Multi-table insert
    ↓
Response: Order confirmation
    ↓
Frontend: Redirect to success page
```

### 4. Recommendation Generation Flow
```
User views product or completes order
    ↓
Frontend: POST /api/recommendations/track { userId, productId }
    ↓
Backend: Save to ViewHistory table
    ↓
User requests recommendations
    ↓
Frontend: GET /api/recommendations/advanced/:userId
    ↓
Backend: recommendationService.getAdvancedRecommendations()
    ↓
Service: Run 13 algorithm variants
    ↓
Database: Query products, view history, user actions
    ↓
Algorithm: Score products, apply weights, rank
    ↓
Response: Top 10-20 personalized recommendations
    ↓
Frontend: Render in RecommendationSection
```

---

## Recommendation Engine

### Algorithm Architecture
The system includes **13 recommendation algorithms** organized in two categories:

#### Basic Algorithms (6)
1. **Frequency-Based**: Most viewed products in category
2. **Price-Range Based**: Products within user's price range
3. **Category-Based**: Similar products in viewed categories
4. **Rating-Based**: Top-rated products
5. **New Arrivals**: Recently added products
6. **Trending Products**: Most viewed in last 7/30 days

#### Advanced Algorithms (7)
1. **Collaborative Filtering**: Find users with similar behavior
2. **Content-Based Filtering**: Analyze product attributes
3. **Hybrid Approach**: Combine collaborative + content-based
4. **Sequential Patterns**: Products frequently bought together
5. **Context-Aware**: Consider purchase timing, seasonality
6. **Diversity-Aware**: Recommend varied product types
7. **Reinforcement Learning Ready**: Score system for optimization

### Algorithm Selection Strategy
```javascript
async function selectAlgorithms(userId, context) {
  const algorithms = [
    { id: 'frequency', weight: 0.15 },
    { id: 'collaborative', weight: 0.25 },
    { id: 'content-based', weight: 0.20 },
  ];

  const results = await Promise.all(
    algorithms.map(algo => runAlgorithm(algo, userId))
  );

  return ensembleRanking(results, weights);
}
```

---

## Error Handling

### Error Hierarchy
```
Application
├─ Client Errors (4xx)
│  ├─ 400 Bad Request (validation errors)
│  ├─ 401 Unauthorized (auth required)
│  ├─ 403 Forbidden (insufficient permissions)
│  └─ 404 Not Found (resource missing)
├─ Server Errors (5xx)
│  ├─ 500 Internal Server Error
│  ├─ 502 Bad Gateway
│  └─ 503 Service Unavailable
└─ Network/Request Errors
   ├─ Network timeout
   ├─ CORS errors
   └─ Connection refused
```

### Frontend Error Recovery
```javascript
// ErrorHandler.js - Centralized error management
export async function parseError(error) {
  if (error instanceof Response) {
    const errorData = await error.json();
    return {
      type: mapStatusToType(error.status),
      message: errorData.message,
      canRetry: isRetryable(error.status)
    };
  }
}

// Automatic retry with exponential backoff
async function withRetry(apiCall, options = { maxRetries: 3 }) {
  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === options.maxRetries) throw error;
      await delay(1000 * Math.pow(2, attempt - 1));
    }
  }
}
```

---

## Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Automatic route-based splitting with Next.js
- **Image Optimization**: Lazy loading with blur placeholders
- **API Caching**: 5-minute cache for product data
- **Lazy Loading Components**: Split heavy components
- **Bundle Size**: ~150KB gzipped

### Backend Optimizations
- **Database Indexing**: Proper indexes on frequently queried columns
- **Connection Pooling**: Prisma handles automatic pooling
- **Query Optimization**: Eager loading to prevent N+1 queries
- **Pagination**: Limit results to 20-50 items per request
- **Caching**: Redis ready for high-traffic scenarios

### Performance Metrics
- **Frontend**: Initial load < 2s, interactive < 3s
- **API**: Response time < 200ms (p95)
- **Database**: Query execution < 100ms (p95)
- **Concurrent Users**: 1000+ (with proper scaling)

---

## Deployment Architecture

### Production Environment
```
CDN (CloudFlare)
    ↓
Load Balancer (Nginx)
    ↓
App Servers (Node.js x 3)
    ↓
Cache Layer (Redis)
    ↓
Database Cluster (PostgreSQL Master-Slave)
```

### Deployment Pipeline
1. Tests run (Jest, integration tests)
2. Build production bundles
3. Security scan
4. Deploy to staging
5. Run e2e tests
6. Deploy to production (blue-green)
7. Monitor metrics

---

## Scalability Roadmap

### Phase 1: Current (Single Server)
- Single Node.js server
- Direct database connection
- In-memory caching
- Supports: 0-10K daily active users

### Phase 2: Horizontal Scaling (3-6 months)
- Multiple app servers with load balancer
- Centralized caching (Redis)
- Database read replicas
- Supports: 10K-100K daily active users

### Phase 3: Microservices (6-12 months)
- Products Service
- Orders Service
- Recommendations Service (dedicated)
- Auth Service
- Message queues for async processing
- Supports: 100K-1M daily active users

### Phase 4: Advanced ML (12+ months)
- ML recommendation pipeline
- GraphQL API layer
- Real-time updates (WebSockets)
- Event sourcing
- Supports: 1M+ daily active users

---

## Technology Stack Rationale

### Frontend: Next.js
- SSR for SEO
- Automatic code splitting
- TypeScript support
- Unified fullstack development

### Backend: Express.js
- Lightweight and fast
- Mature ecosystem
- Easy debugging
- Perfect for REST APIs

### ORM: Prisma
- Type-safe queries
- Auto migrations
- Great DX
- Query optimization

### Database: PostgreSQL
- Reliable & battle-tested
- Rich data types
- Advanced SQL features
- Free & open-source

### Styling: Tailwind CSS
- Utility-first (faster dev)
- Small bundle size
- Great for responsive design

---

## Testing Strategy

### Test Coverage
- Unit Tests: Services and utilities
- Integration Tests: API endpoints
- E2E Tests: Complete user flows
- Performance Tests: Load testing

### Command: `npm test`
- Runs Jest test suite
- Coverage report
- CI/CD integration

---

## Contributing Guidelines

### Code Organization
1. **Separation of Concerns**: Controllers/Services split
2. **DRY Principle**: Extract common code
3. **Error Handling**: Always handle promises
4. **Type Safety**: Use JSDoc comments
5. **Testing**: >80% code coverage target

### Development Workflow
```bash
git checkout -b feature/description
npm run dev      # Start dev servers
npm test         # Run tests
git push && PR   # Create pull request
```

---

## Security Considerations

### Implementation
- Password hashing with bcrypt
- JWT tokens for auth
- HTTPS/TLS for all traffic
- Input validation (Prisma prevents SQL injection)
- CORS policy enforcement
- Rate limiting on endpoints
- Environment variable secrets

---

## Version History

- **v1.0.0**: Initial release (6 basic algorithms)
- **v1.5.0**: Added 7 advanced algorithms
- **v2.0.0**: Enhanced error handling & performance
- **v2.1.0**: Professional styling & improved UI
- **v3.0.0**: Microservices ready (planned)

---

**Last updated**: 2024
**Maintainer**: Development Team
