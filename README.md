# RecomCart: E-commerce Recommendation System

RecomCart is a modern full-stack e-commerce recommendation project built to demonstrate clean architecture, typed APIs, user behavior tracking, and hybrid product recommendations.

The project is structured as a production-style multi-service application: a Next.js storefront, an Express + Prisma backend, a PostgreSQL database, and a FastAPI recommendation service.

## Highlights

- Modern e-commerce storefront with product browsing, search, filters, sorting, product detail pages, auth screens, cart UI, and recommendation sections.
- TypeScript Express backend with JWT authentication, Prisma ORM, PostgreSQL schema, cart/order workflows, product APIs, and interaction tracking.
- Python FastAPI recommendation service with content-based filtering, collaborative filtering, popularity ranking, and hybrid scoring.
- Realistic Prisma seed data with categories, products, users, carts, orders, wishlists, views, clicks, cart-add events, purchases, and recommendation cache examples.
- Clean documentation for setup, architecture, testing, interview explanation, and future upgrades.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend API | Node.js, Express, TypeScript, JWT |
| Database | PostgreSQL, Prisma ORM |
| Recommendation Service | Python, FastAPI, pandas, scikit-learn |
| Recommendation Methods | TF-IDF, cosine similarity, user-item matrix, weighted events, hybrid ranking |

## Architecture

```text
frontend/
  Next.js storefront
  Calls backend APIs for products, cart, auth, and recommendations

backend/
  Express API gateway
  Owns auth, product catalog, cart, orders, events, and database access
  Calls recommendation-service for ranked recommendations

recommendation-service/
  FastAPI service
  Computes content-based, collaborative, popularity, and hybrid recommendations

docs/
  Architecture, setup, testing, feature summary, and interview notes

legacy/
  Archived previous implementation and generated notes
```

## Core Features

- User signup, login, JWT generation, and protected route middleware.
- Product listing with pagination, search, category filtering, and sorting.
- Product detail page with category information and similar recommendations.
- Cart add, view, update quantity, and remove item operations.
- Order creation from cart using Prisma transactions.
- **Real-time order tracking** with status timeline, tracking history, and courier information.
- Admin order management with status updates and tracking information.
- Product interaction tracking for views, clicks, cart additions, and purchases.
- Weighted event model:

```text
VIEW      = 1
CLICK     = 2
CART_ADD  = 4
PURCHASE  = 8
```

- Recommendation APIs:

```text
GET /recommendations/home/:userId
GET /recommendations/product/:productId
GET /recommendations/user/:userId
```

- Order tracking APIs for real-time status updates and history.

## Quick Start

### 1. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

Demo accounts all use:

```text
Password123
```

Useful demo users:

```text
demo@example.com
ada@example.com
alan@example.com
grace@example.com
```

### 2. Recommendation Service

```bash
cd recommendation-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Docker fallback:

```bash
cd recommendation-service
docker build -t recommendation-service .
docker run --rm -p 8000:8000 recommendation-service
```

Recommendation service runs on:

```text
http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

## Important API Routes

```text
POST /auth/signup
POST /auth/login
GET  /auth/me

GET /products
GET /products/search
GET /products/:id

POST   /cart
GET    /cart
PATCH  /cart/:id
DELETE /cart/:id

POST /orders
GET  /orders
GET  /orders/:id

GET /order-tracking
GET /order-tracking/:id
GET /order-tracking/:id/tracking
GET /order-tracking/stats
PATCH /order-tracking/admin/:id/status

POST /events/view
POST /events/click

GET /recommendations/home/:userId
GET /recommendations/product/:productId
GET /recommendations/user/:userId
```

## Testing

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run typecheck
npm run build
```

Recommendation service:

```bash
cd recommendation-service
pytest
```

Manual API smoke requests are available in:

```text
backend/tests/api-smoke.http
```

More details:

```text
docs/testing-strategy.md
```

## Documentation

- `docs/architecture.md`: system design and service boundaries
- `docs/setup.md`: local setup instructions
- `docs/feature-summary.md`: implemented feature list
- `docs/testing-strategy.md`: pragmatic testing plan
- `docs/interview-notes.md`: resume, viva, and interview talking points
- `docs/future-scope.md`: future upgrades and roadmap

## Resume Description

Built a full-stack e-commerce recommendation platform using Next.js, Express, Prisma, PostgreSQL, and FastAPI, with JWT auth, cart/order workflows, interaction tracking, and hybrid recommendations.

Designed recommendation-ready data pipelines using weighted user events, content similarity, collaborative filtering, popularity ranking, and graceful backend fallbacks.

## Interview Summary

RecomCart is a resume-ready e-commerce recommendation system that separates the storefront, core backend, database, and recommendation engine into clean services. The backend captures user behavior such as views, clicks, cart additions, and purchases, then uses those weighted signals with product metadata to serve personalized, similar-product, and trending recommendations.

## Future Upgrades

- Redis caching for product lists, sessions, recommendation results, and rate limiting.
- Vector search with pgvector, Pinecone, Weaviate, or Qdrant for semantic product similarity.
- Advanced ranking with learning-to-rank models and real-time feature stores.
- Background jobs for scheduled recommendation cache refreshes.
- A/B testing for recommendation strategies.
- Admin dashboard for catalog, orders, and recommendation analytics.
- Event streaming with Kafka, Redpanda, or RabbitMQ.
- Observability with OpenTelemetry, Prometheus, and Grafana.
- Payment integration with Stripe.
- Deployment with Docker Compose, CI/CD, and cloud infrastructure.
