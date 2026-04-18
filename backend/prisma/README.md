# Prisma Setup

Database design for the upgraded e-commerce recommendation backend.

## Requirements

- PostgreSQL
- Node.js
- TypeScript
- Prisma ORM

## Environment

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Update `DATABASE_URL` if your PostgreSQL username, password, host, port, or database name differs.

## Migration Commands

Install dependencies from the `backend/` folder:

```bash
npm install
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Create the first migration:

```bash
npm run prisma:migrate -- --name init
```

Prisma 7 does not store the database URL in `schema.prisma`. The CLI reads it from `prisma.config.ts`, which loads `DATABASE_URL` from `.env`.

Open Prisma Studio:

```bash
npm run prisma:studio
```

## Seed Data

The seed script creates a realistic demo catalog and interaction history:

- 4 categories
- 12 products
- 7 demo users
- active carts
- delivered orders
- product views
- weighted product interactions
- wishlists
- sample recommendation cache rows

Run:

```bash
npm run prisma:seed
```

All demo users use `Password123`.

## Recommendation Notes

The schema supports multiple recommendation strategies:

- Content-based recommendations from product categories, tags, brand, attributes, and descriptions.
- Collaborative filtering from orders, wishlists, carts, and product views.
- Trending products from `viewCount`, `purchaseCount`, and recent `ProductView` rows.
- Similar-product pages through `RecommendationCache.sourceProductId`.
- Personalized home-page recommendations through `RecommendationCache.userId`.
