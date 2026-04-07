# E-commerce Recommendation System

This project has been restructured into a clean full-stack architecture:

```text
frontend/  -> Next.js UI
backend/   -> Express API + Prisma + PostgreSQL
```

## Final Structure

```text
backend/
  controllers/
  lib/
  prisma/
    schema.prisma
    seed.js
  routes/
  services/
  server.js
  package.json

frontend/
  app/
  components/
  lib/
  package.json
```

## Backend

Backend runs on `http://localhost:5000`.

Implemented APIs:

- `GET /products`
- `GET /product/:id`
- `POST /view`
- `POST /order`
- `GET /recommendations/:userId`

Recommendation logic lives in [`backend/services/recommendationService.js`](backend/services/recommendationService.js).

It includes:

- Content-based filtering using category and price range
- Collaborative filtering using order overlap
- Hybrid combination with duplicate removal

Prisma schema lives in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

## Frontend

Frontend is a standalone Next.js app in [`frontend/`](frontend).

Implemented pages:

- Home page with product listing
- Product detail page
- Recommended products
- Similar products

Frontend calls the backend directly, for example:

```js
fetch("http://localhost:5000/products")
```

The shared API wrapper is in [`frontend/lib/api.js`](frontend/lib/api.js).

## How to Run

### Backend

```bash
cd backend
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes

- The old mixed root-level Next.js and Prisma app has been removed.
- The only remaining root leftover may be the old `node_modules/` directory if Windows is still locking native binaries.
- Active development should now happen only inside `frontend/` and `backend/`.
