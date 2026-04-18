# Backend

Core API service for the e-commerce recommendation system.

## Planned Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL or another relational database

## Responsibility

The backend will handle:

- Authentication and user accounts
- Product, category, cart, and order APIs
- Database access through Prisma
- API validation and error handling
- Communication with the recommendation service
- REST API contracts consumed by the frontend

## Planned Structure

```text
backend/
  src/
    config/             Environment and app configuration
    controllers/        Request handlers
    middleware/         Auth, validation, and error middleware
    routes/             Express route definitions
    services/           Business logic
    prisma/             Prisma client helpers
    types/              Backend TypeScript types
    server.ts           HTTP server entry point
    app.ts              Express app setup
  prisma/
    schema.prisma       Database schema
    seed.ts             Seed data
  README.md
```

## Current Status

The database design and initial Prisma setup have been added. The Express API will be implemented in a later step.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:studio
```

## API Foundation

```text
GET /                    Service status
POST /auth/signup        Create a user and return a JWT
POST /auth/login         Authenticate a user and return a JWT
GET /auth/me             Return the authenticated user
GET /products            List products with pagination, filters, and sorting
GET /products/search     Search products by title/name
GET /products/:id        Return one product with category info
POST /cart               Add a product to the active cart
GET /cart                Return the active cart
PATCH /cart/:id          Update a cart item quantity
DELETE /cart/:id         Remove a cart item
POST /orders             Create an order from the active cart
GET /orders              List authenticated user's orders
GET /orders/:id          Return one authenticated user's order
POST /events/view        Track an authenticated product view
POST /events/click       Track an authenticated product click
GET /recommendations/home/:userId      Home recommendations
GET /recommendations/product/:productId Product page recommendations
GET /recommendations/user/:userId      Hybrid user recommendations
GET /api/health          API and database health check
GET /api/products        Same product list route under the API prefix
GET /api/cart            Same cart route under the API prefix
GET /api/orders          Same orders route under the API prefix
POST /api/events/view    Same view event route under the API prefix
POST /api/events/click   Same click event route under the API prefix
GET /api/recommendations/home/:userId Same home recommendation route under the API prefix
GET /api/recommendations/product/:productId Same product recommendation route under the API prefix
GET /api/recommendations/user/:userId Same user recommendation route under the API prefix
```

Recommendation routes call the FastAPI recommendation service configured by `RECOMMENDATION_SERVICE_URL`.
If the service is unavailable or times out, the backend returns fallback recommendations from PostgreSQL.

Product list query parameters:

```text
page=1
limit=12
search=headphones
category=electronics
sortBy=price|rating|newest
sortOrder=asc|desc
```

## Prisma Files

```text
backend/
  .env.example
  package.json
  prisma.config.ts
  tsconfig.json
  prisma/
    schema.prisma
    seed.ts
    README.md
  src/
    db/
      prisma.ts
```
