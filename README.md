# FluxCart Hybrid Recommendation System

Full-stack e-commerce recommendation system built with:

- React + Next.js frontend
- Tailwind CSS for responsive UI
- Node.js + Express backend
- Prisma ORM
- PostgreSQL

The repository now contains two server layers:

- `app/api/*`: Next API routes used directly by the React UI
- `src/express/*`: standalone Express API that exposes the same commerce and recommendation logic

## Architecture

```text
React UI (Next.js pages)
  -> fetch("/api/*") or Express endpoints
  -> Backend services (Node.js / Express or Next route handlers)
  -> Prisma ORM
  -> PostgreSQL
```

## Folder Structure

```text
app/
  api/
    auth/
    cart/
    interactions/view/
    orders/
    product/[id]/
    products/
    recommendations/[userId]/
    similar/[productId]/
  products/
  cart/
  orders/
src/
  express/
    app.ts
    server.ts
  server/
    auth/
    db/
    services/
      cart.ts
      data-source.ts
      hybrid-recommendations.ts
      orders.ts
    validation/
  components/
prisma/
  schema.prisma
  migrations/
```

## Database Design

`User`
- Stores the shopper account, login identity, and password hash.
- Needed for authentication, cart ownership, orders, and personalization.

`Product`
- Stores product catalog data such as `name`, `category`, and `price`.
- Needed for listing, filters, detail pages, and recommendation candidates.

`ViewHistory`
- Stores `userId`, `productId`, and `viewedAt`.
- Needed because views are strong intent signals for content-based recommendations.

`Order` + `OrderItem`
- `Order` stores checkout-level data.
- `OrderItem` stores the actual purchased products.
- Needed for collaborative filtering because we compare users by what they bought.

`Cart`, `CartItem`, `Wishlist`, `Recommendation`, `UserActivity`
- These support the shopping flow and allow richer tracking, observability, and saved ranked results.

## Prisma Models

Core recommendation models in [`prisma/schema.prisma`](prisma/schema.prisma) include:

- `User`
- `Product`
- `ViewHistory`
- `Order`
- `OrderItem`

Why the design is slightly richer than the interview prompt:

- The prompt uses a simplified `Order(userId, productId)` shape.
- Production systems usually normalize order line items into `OrderItem` so one order can contain multiple products.
- This repo keeps that better structure while still satisfying the same recommendation logic.

## Backend APIs

### Authentication

`POST /auth/signup`
- Creates a user.
- Hashes the password with `bcryptjs`.
- Returns a JWT token.

`POST /auth/login`
- Validates email/password.
- Returns the signed JWT token.

### Products

`GET /products`
- Supports search, category, price filters, sorting, and pagination.

`GET /product/:id`
- Returns one product for the detail page.

### Cart

`GET /cart`
- Returns authenticated user cart items.

`POST /cart`
- Adds or updates cart quantity.

`DELETE /cart`
- Removes a cart item.

### Orders

`GET /orders`
- Returns authenticated order history.

`POST /orders`
- Creates an order from cart items.
- Also logs purchase activity for recommendation quality.

### Tracking

`POST /interactions/view`
- Stores viewed products in `ViewHistory`.
- This directly improves recommendation quality.

### Recommendations

`GET /recommendations/:userId`
- Returns hybrid recommendations.
- Also returns lightweight insights such as view count, purchase count, and top category.

`GET /similar/:productId`
- Returns content-based similar products for the detail page.

## Recommendation Logic

Main logic lives in [`src/server/services/hybrid-recommendations.ts`](src/server/services/hybrid-recommendations.ts).

### 1. Content-Based Filtering

We use:

- same category
- similar price band
- seed signals from recently viewed and purchased products

Flow:

1. Read recent views from `ViewHistory`
2. Read purchased products from `OrderItem`
3. Find products in the same category or near the same price
4. Exclude already purchased products
5. Score the candidates

### 2. Collaborative Filtering

We use:

1. Products the current user purchased
2. Other users who bought the same products
3. Products those similar users also purchased
4. Weighted ranking based on overlap strength

This gives recommendations like:

> users with similar purchase history also bought this

### 3. Hybrid Recommendation

We combine:

- content-based score
- collaborative score
- popularity fallback

Then we:

1. dedupe product ids
2. keep the highest-confidence version
3. boost products that appear in multiple systems
4. store final ranked rows in `Recommendation`

## Frontend Implementation

### Product Listing Page

[`app/products/page.tsx`](app/products/page.tsx)

- Fetches paginated products from `/api/products`
- Supports category and price filters
- Shows loading skeletons and request errors
- Adds pagination controls
- Shows a `Recommended For You` section for signed-in users

### Product Detail Page

[`app/products/[id]/page.tsx`](app/products/[id]/page.tsx)

- Shows product details
- Tracks views through `ProductViewTracker`
- Renders `Similar Products` using `/similar/:productId` logic

### View Tracking

[`src/components/storefront/product-view-tracker.tsx`](src/components/storefront/product-view-tracker.tsx)

- Saves local recent views
- Posts authenticated views to `/api/interactions/view`

## Express Backend

Standalone Express API lives in:

- [`src/express/app.ts`](src/express/app.ts)
- [`src/express/server.ts`](src/express/server.ts)

Run it with:

```bash
npm run backend:dev
```

The frontend can continue using the Next API routes, while the Express layer is available for the explicit Node + Express architecture.

## How Data Tracking Improves Recommendations

Viewed products:
- Capture curiosity and short-term intent.
- Useful when the user has not purchased anything yet.

Purchased products:
- Capture stronger preference and conversion intent.
- Useful for collaborative filtering and long-term recommendations.

Together they improve:

- cold-start handling
- category preference detection
- budget-range estimation
- recommendation relevance over time

## UI/UX Decisions

- Mobile-first responsive grid
- Card layout with clear spacing and no text overlap
- Loading skeletons for perceived performance
- Inline error states for recoverability
- Recommendation sections placed near product discovery moments

## Best Practices Used

- Shared service layer for business logic
- Validation with Zod
- Password hashing with bcrypt
- JWT-based auth
- Prisma for type-safe DB access
- Pagination to avoid oversized product payloads
- Recommendation persistence for debugging and explainability

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure `.env`

```env
DATABASE_URL=postgresql://fluxcart:fluxcart@localhost:5432/fluxcart?schema=public
JWT_SECRET=replace-with-a-long-random-secret
```

3. Start PostgreSQL

```bash
docker compose up -d
```

4. Run migrations and generate Prisma client

```bash
npx prisma migrate dev
npx prisma generate
node prisma/seed.js
```

5. Start apps

```bash
npm run dev
npm run backend:dev
```

## Interview Explanation

Strong answer:

> I built a hybrid recommendation system for an e-commerce application using React on the frontend, a Node.js and Express API layer, Prisma ORM, and PostgreSQL. I tracked user interactions such as product views and purchases, then used content-based filtering to match products by category and price, and collaborative filtering to recommend products bought by similar users. Finally, I merged and deduplicated both result sets into a hybrid ranking, which gave better personalization and handled cold-start cases with popularity fallbacks.

Shorter answer:

> I built a hybrid recommendation system using content-based and collaborative filtering. I track user interactions like views and purchases, and use this data to generate personalized recommendations dynamically.

## Important Files

- [`prisma/schema.prisma`](prisma/schema.prisma)
- [`src/server/services/hybrid-recommendations.ts`](src/server/services/hybrid-recommendations.ts)
- [`src/express/app.ts`](src/express/app.ts)
- [`app/products/page.tsx`](app/products/page.tsx)
- [`app/products/[id]/page.tsx`](app/products/[id]/page.tsx)
