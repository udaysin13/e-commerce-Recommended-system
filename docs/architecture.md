# Architecture

RecomCart uses a clean multi-service architecture. Each service has a narrow responsibility and communicates through explicit APIs.

## High-Level Flow

```text
User
  -> Next.js frontend
  -> Express backend
  -> PostgreSQL via Prisma
  -> FastAPI recommendation service
```

## Frontend

The frontend is a Next.js application using TypeScript and Tailwind CSS.

Responsibilities:

- Render product browsing and detail pages.
- Provide login, signup, and cart screens.
- Call backend APIs for products and recommendations.
- Keep the UI responsive, reusable, and portfolio-ready.

## Backend

The backend is an Express API built with TypeScript.

Responsibilities:

- JWT authentication.
- Product catalog APIs.
- Cart and order workflows.
- User interaction event tracking.
- Prisma database access.
- Gateway calls to the recommendation service.
- Graceful fallback recommendations when the recommendation service is unavailable.

## Database

PostgreSQL stores the system of record.

Important tables:

- `users`
- `categories`
- `products`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `product_views`
- `product_interactions`
- `wishlists`
- `recommendation_caches`

The most important recommendation table is `product_interactions`, which stores weighted user-product events.

## Recommendation Service

The recommendation service is a FastAPI application.

Strategies:

- Content-based filtering with TF-IDF and cosine similarity.
- Collaborative filtering with a weighted user-item matrix.
- Popularity ranking from recent interaction signals.
- Hybrid ranking that combines content, collaborative, and popularity scores.

## Recommendation Request Flow

```text
Frontend recommendation section
  -> GET /recommendations/home/:userId
  -> Express backend checks user history
  -> backend calls FastAPI /recommend/user/:userId or /recommend/trending
  -> backend hydrates product IDs from PostgreSQL
  -> frontend receives normalized product recommendation cards
```

## Why This Architecture Is Interview-Ready

- Clear separation between UI, API, data, and ML-style recommendation logic.
- Typed backend and frontend contracts.
- Real database schema with relational integrity.
- Recommendation logic has both explicit algorithms and production-style fallbacks.
- The project can evolve into a distributed production architecture without a rewrite.
