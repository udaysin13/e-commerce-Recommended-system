# Feature Summary

## Frontend

- Home page with hero, featured products, and recommendations.
- Product listing with search, category filter, and sort dropdown.
- Product detail page with similar recommendation section.
- Login and signup screens prepared for auth integration.
- Cart page with clean summary layout.
- Responsive design with reusable components.

## Backend

- Express app with TypeScript.
- Typed environment handling.
- Global error middleware.
- Prisma singleton client.
- JWT auth with bcrypt password hashing.
- Product listing and detail APIs.
- Cart APIs for add, read, update, and remove.
- Order APIs for checkout and order history.
- Event tracking for views, clicks, cart additions, and purchases.
- Recommendation gateway that calls FastAPI and falls back to PostgreSQL.

## Database

- PostgreSQL schema using Prisma.
- Realistic e-commerce entities and relationships.
- Weighted interaction history for recommendation models.
- Deterministic seed data for demos and testing.

## Recommendation Service

- FastAPI app with typed response models.
- Content-based filtering.
- Collaborative filtering.
- Popularity ranking.
- Hybrid recommendation scoring.
