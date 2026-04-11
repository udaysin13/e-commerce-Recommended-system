/**
 * BACKEND PRODUCTION GUIDE
 * 
 * E-commerce Recommendation System - Production-Grade Backend
 * 
 * This guide explains the production-level enhancements made to the backend system.
 */

# Production-Level Backend Architecture

## Overview

This is a production-ready E-commerce Recommendation System backend using:
- **Node.js + Express.js**: Lightweight, fast server framework
- **Prisma ORM**: Type-safe database access with migrations
- **PostgreSQL**: Reliable relational database
- **Clean Architecture**: Separation of concerns (controllers, services, middleware)

## Project Structure

```
backend/
├── config/
│   └── config.js              # Centralized configuration management
├── controllers/               # Request handlers (MVC Controller layer)
│   ├── productController.js
│   ├── userController.js
│   ├── cartController.js
│   ├── orderController.js
│   ├── authController.js
│   ├── recommendationController.js
│   └── advancedRecommendationController.js
├── services/                  # Business logic (MVC Service layer)
│   ├── productService.js
│   ├── userService.js
│   ├── cartService.js
│   ├── orderService.js
│   ├── recommendationService.js
│   └── advancedRecommendationService.js
├── routes/                    # API route definitions
│   ├── productRoutes.js
│   ├── userRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── authRoutes.js
│   ├── recommendationRoutes.js
│   └── advancedRecommendationRoutes.js
├── middleware/                # Express middleware
│   ├── errorHandler.js        # Centralized error handling
│   ├── authMiddleware.js      # JWT authentication & authorization
│   ├── asyncHandler.js        # Async error wrapper
│   └── validators.js          # Input validation rules
├── lib/                       # Utility libraries
│   ├── prisma.js             # Prisma singleton client
│   ├── auth.js               # JWT token management
│   ├── dataStore.js          # In-memory fallback data store
│   ├── loadEnv.js            # Environment variable loader
│   └── seedData.js           # Sample data for seeding
├── utils/                     # Helper functions & utilities
│   ├── logger.js             # Production logging utility
│   ├── validators.js         # Input validation functions
│   └── helpers.js            # Common helper functions
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma         # Database models
│   ├── seed.js              # Database seeding script
│   └── migrations/          # Migration files
├── server.js                  # Express app setup
└── package.json              # Dependencies & scripts
```

## Key Production Features

### 1. **Advanced Logging System** (`utils/logger.js`)
- Centralized logging with levels (ERROR, WARN, INFO, DEBUG)
- File-based logging for errors and warnings
- Colored console output in development
- Performance tracking utilities

Usage:
```javascript
const logger = require("../utils/logger");

logger.info("User created", { userId: 123 });
logger.warn("Rate limit approaching", { requestCount: 95 });
logger.error("Database connection failed", error);
logger.debug("Fetching recommendations", null);

// Algorithm performance tracking
logger.logAlgorithmPerformance("Collaborative Filtering", 45, 12);
```

### 2. **Comprehensive Input Validation** (`utils/validators.js`)
- Email validation
- Password strength checking
- Numeric validation (integer, positive, non-negative)
- Pagination validation
- Price range validation
- Product data validation
- User registration validation
- Search query sanitization

Usage:
```javascript
const { validateProductData, validatePagination } = require("../utils/validators");

const validation = validateProductData({
  name: "Product",
  category: "Electronics",
  price: 99.99
});

if (!validation.valid) {
  console.log(validation.errors);
}

const { valid, page, limit } = validatePagination(1, 10);
```

### 3. **Helper Utilities** (`utils/helpers.js`)
- Product similarity scoring
- Collaborative filtering scores
- Co-purchase confidence calculation
- Engagement scoring
- Time decay factors for recommendations
- Array deduplication and merging
- Sorting by score
- Pagination helper
- Currency formatting
- Order total calculation

Usage:
```javascript
const {
  calculateProductSimilarity,
  calculateCollaborativeScore,
  sortByScore
} = require("../utils/helpers");

const similarity = calculateProductSimilarity(product1, product2);
const score = calculateCollaborativeScore(5, 20); // 5 co-purchases out of 20
const sorted = sortByScore(products);
```

### 4. **Configuration Management** (`config/config.js`)
Centralized configuration with environment-based settings:

```javascript
const { CONFIG, isProduction, isFeatureEnabled } = require("../config/config");

// Access configuration
const maxRecommendations = CONFIG.RECOMMENDATION.MAX_RECOMMENDATIONS;
const cacheEnabled = CONFIG.CACHE.ENABLED;

// Feature flags
if (isFeatureEnabled("COLLABORATIVE_FILTERING")) {
  // Use collaborative filtering
}

// Environment checks
if (isProduction()) {
  // Production-specific logic
}
```

### 5. **Enhanced Error Handling** (`middleware/errorHandler.js`)
Multiple error classes for different scenarios:

```javascript
const {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError
} = require("../middleware/errorHandler");

// Throw specific errors
throw new ValidationError("Email is invalid");
throw new AuthenticationError("Token expired");
throw new AuthorizationError("Insufficient permissions");
throw new NotFoundError("Product");
```

### 6. **Recommendation Algorithms** (`services/recommendationService.js`)

#### Content-Based Filtering
- Analyzes products user has viewed/purchased
- Recommends similar products based on:
  - Category match (35% weight)
  - Price range similarity (30% weight)
  - Rating similarity (20% weight)
  - Popularity/reviews (15% weight)

#### Collaborative Filtering
- Finds users with similar purchase patterns
- Recommends products purchased by similar users
- Scores based on co-purchase frequency
- Boosts with purchase frequency logarithmically

#### Category-Based Recommendations
- Identifies user's favorite categories
- Recommends top-rated products from those categories
- Orders by rating and reviews count

#### Trending Products
- Considers recent views and purchases
- Applies time decay (30-day half-life)
- Weighs purchases 5x higher than views
- Combines with product rating and popularity

#### Hybrid Algorithm
- Combines all algorithms with weighted scores
- Default weights:
  - Content-Based: 35%
  - Collaborative: 30%
  - Trending: 20%
  - Category-Based: 15%
- Configurable via CONFIG

### 7. **Authentication & Authorization** (`middleware/authMiddleware.js`)

```javascript
const { requireAuth, requireSelfFromParam, optionalAuth } = require("../middleware/authMiddleware");

// Routes requiring authentication
router.get("/profile/:userId", requireAuth, requireSelfFromParam("userId"), getProfile);

// Routes with optional authentication
router.get("/products", optionalAuth, getProducts);
```

### 8. **Async Error Handling** (`middleware/asyncHandler.js`)
Wraps async route handlers and logs execution time:

```javascript
const asyncHandler = require("../middleware/asyncHandler");

router.get("/products", asyncHandler(async (req, res) => {
  // Errors automatically caught and logged
  const products = await getProducts();
  res.json(products);
}));
```

## API Endpoints

### Products
```
GET    /products                    - List all products (with filtering)
GET    /products/:id               - Get product details
GET    /products/category/:name    - Get products by category
```

### Recommendations (Core)
```
GET    /recommendations/:userId/hybrid         - Hybrid recommendations
GET    /recommendations/:userId/content-based  - Content-based
GET    /recommendations/:userId/collaborative  - Collaborative filtering
GET    /recommendations/:userId/category       - Category-based
GET    /recommendations/popular                - Popular products
GET    /recommendations/trending               - Trending products
GET    /recommendations/similar/:productId     - Similar products
GET    /recommendations/users-also-bought/:id  - Co-purchase patterns
```

### Users
```
POST   /users/register              - Register new user
POST   /users/login                - Login user
GET    /users/:id                  - Get user profile
PUT    /users/:id                  - Update user profile
```

### Cart
```
GET    /cart/:userId               - Get user's cart
POST   /cart/:userId/items         - Add to cart
PUT    /cart/items/:itemId         - Update cart quantity
DELETE /cart/items/:itemId         - Remove from cart
```

### Orders
```
GET    /orders/:userId             - Get user's orders
POST   /orders                      - Create new order
GET    /orders/:orderId            - Get order details
```

## Environment Configuration

Create a `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d

# Logging
LOG_LEVEL=INFO
LOG_DIR=./logs

# Features (set to false to disable)
ENABLE_ADVANCED_RECOMMENDATIONS=true
ENABLE_COLLABORATIVE_FILTERING=true
ENABLE_CONTENT_BASED=true
ENABLE_TRENDING=true

# Cache
CACHE_ENABLED=true
```

## Best Practices Implemented

### 1. **MVC Architecture**
- Controllers handle HTTP requests/responses
- Services contain business logic
- Models defined in Prisma schema

### 2. **Error Handling**
- Try-catch blocks in all services
- Custom error classes for different scenarios
- Centralized error middleware
- Logging of all errors

### 3. **Input Validation**
- All inputs validated before processing
- Sanitization of search queries
- Type checking of all IDs
- Pagination limits enforced

### 4. **Performance**
- Parallel database queries using Promise.all()
- Query optimization with select/take/skip
- Time decay for recommendation freshness
- Efficient deduplication algorithms

### 5. **Security**
- JWT-based authentication
- Authorization checks on protected routes
- Input sanitization
- Prisma protection against SQL injection

### 6. **Logging & Monitoring**
- Request/response logging
- Algorithm performance tracking
- Database operation timing
- Error stack traces in development

### 7. **Type Safety**
- Prisma provides type-safe queries
- Configuration validation on startup
- Input validators with typed responses

## Running the Backend

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start server (development)
npm run dev

# Start server (production)
npm start

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

## Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried fields
2. **Query Optimization**: Used `select` to fetch only needed fields
3. **Parallel Queries**: Multiple queries execute simultaneously
4. **Caching**: Consider adding Redis for recommendation caching
5. **Pagination**: Default limit 10, max 100 results per page

## Monitoring & Debugging

### View Logs
```bash
# Error logs
tail -f logs/error.log

# Warning logs
tail -f logs/warn.log

# All logs in development
npm run dev
```

### Debug Mode
```bash
# In .env
LOG_LEVEL=DEBUG

# Or set environment variable
DEBUG=* npm run dev
```

## Future Enhancements

1. **Caching Layer**: Implement Redis for recommendation caching
2. **Rate Limiting**: Add request rate limiting
3. **Analytics**: Track recommendation effectiveness
4. **A/B Testing**: Test different algorithms
5. **Real-time Updates**: WebSocket for real-time inventory
6. **Advanced ML**: Integrate TensorFlow for advanced recommendations
7. **Microservices**: Separate recommendation engine to independent service

## Production Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Update JWT_SECRET with strong random value
- [ ] Configure DATABASE_URL for production database
- [ ] Set LOG_LEVEL=WARN for production
- [ ] Enable CORS_CREDENTIALS if needed
- [ ] Implement rate limiting
- [ ] Setup database backups
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Setup monitoring/alerting
- [ ] Load test the system
- [ ] Document API endpoints
- [ ] Setup CI/CD pipeline

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Author**: Senior Backend Engineer
