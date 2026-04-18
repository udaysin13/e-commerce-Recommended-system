# E-commerce Recommendation System

A full-stack e-commerce demo with product browsing, JWT authentication, cart checkout, and a recommendation engine built around user behavior, category similarity, co-purchases, recently viewed products, and trending products.

## Project Overview

This project shows an end-to-end shopping flow:

- Browse, search, and filter products by category.
- View product details and related recommendation sections.
- Sign up or log in with JWT authentication.
- Add products and recommendations to the cart.
- Checkout from the cart and create orders.
- Track product views for recently viewed and content-based recommendations.

The backend includes seeded demo data and a fallback in-memory data store for product/recommendation browsing if the database is unavailable. Account-owned APIs are protected with JWT middleware.

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL, Prisma 5.22 |
| Auth | JWT-style HS256 tokens with Node `crypto`, password hashing with `scrypt` |
| Dev | npm, Docker Compose |

## Screenshots

Add or update screenshots in `docs/screenshots/` before publishing.

| Home | Product Detail | Cart |
| --- | --- | --- |
| ![Home page](docs/screenshots/home.png) | ![Product detail page](docs/screenshots/product-detail.png) | ![Cart page](docs/screenshots/cart.png) |

## Project Structure

```text
.
+-- backend/
|   +-- controllers/
|   +-- lib/
|   +-- middleware/
|   +-- prisma/
|   |   +-- schema.prisma
|   |   +-- seed.js
|   +-- routes/
|   +-- services/
|   +-- package.json
|   +-- server.js
+-- frontend/
|   +-- app/
|   +-- components/
|   +-- lib/
|   +-- package.json
+-- docker-compose.yml
+-- package.json
+-- README.md
```

## Setup Steps

### 1. Install dependencies

```powershell
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/fluxcart"
JWT_SECRET="replace-with-a-long-random-secret"
FRONTEND_URL="http://localhost:3000"
PORT=5000
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start PostgreSQL

Use your local PostgreSQL instance, or start the included Docker service:

```powershell
docker compose up -d postgres
```

If you use Docker, match `DATABASE_URL` to `docker-compose.yml`:

```env
DATABASE_URL="postgresql://fluxcart:fluxcart@localhost:5432/fluxcart"
```

### 4. Prepare Prisma and seed data

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
cd ..
```

### 5. Run the app

```powershell
npm run dev
```

The root script opens the backend on `http://localhost:5000` and starts the frontend on `http://localhost:3000`.

You can also run them separately:

```powershell
npm run dev:backend
npm run dev:frontend
```

## Demo Login

```text
alice@example.com
alice123
```

Other seeded users:

```text
bob@example.com / bob123
cara@example.com / cara123
```

## API Endpoints

Base URL: `http://localhost:5000`

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/login` | Login and receive a token |
| POST | `/auth/signup` | Create an account and receive a token |
| POST | `/auth` | Backward-compatible login/signup using `mode` |

Example:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "alice123"
}
```

Protected APIs require:

```http
Authorization: Bearer <token>
```

### Products

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/products?page=1&limit=8` | List products |
| GET | `/products?category=Electronics` | Filter by category |
| GET | `/products?search=phone` | Search products |
| GET | `/products/:id` | Product detail with similar products |

### Cart Protected

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/cart/:userId` | Get the user's cart |
| POST | `/cart/:userId/items` | Add an item to cart |
| PUT | `/cart/items/:itemId` | Update cart item quantity |
| DELETE | `/cart/items/:itemId` | Remove cart item |
| DELETE | `/cart/:userId` | Clear the user's cart |
| GET | `/cart/:userId/total` | Get cart totals |

### Orders Protected

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/orders` | Create an order from the user's cart |

### Users Protected

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/users/:userId` | Get profile |
| PUT | `/users/:userId` | Update profile |
| GET | `/users/:userId/orders` | Get order history |
| GET | `/users/:userId/history` | Get view history |
| DELETE | `/users/:userId` | Delete account |

### Recommendations

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/recommendations/popular` | Popular products |
| GET | `/recommendations/trending` | Trending products from recent views/orders |
| GET | `/recommendations/similar/:productId` | Similar products |
| GET | `/recommendations/category-similarity/:productId` | Same-category and similar-price products |
| GET | `/recommendations/users-also-bought/:productId` | Co-purchase recommendations |
| GET | `/recommendations/recently-viewed/:userId` | Recently viewed products, protected |
| POST | `/recommendations/track-view` | Track product view, protected |
| GET | `/recommendations/:userId` | Hybrid recommendations, protected |
| GET | `/recommendations/:userId/hybrid` | Hybrid recommendations, protected |
| GET | `/recommendations/:userId/content-based` | Content-based recommendations, protected |
| GET | `/recommendations/:userId/collaborative` | Collaborative recommendations, protected |
| GET | `/recommendations/:userId/category` | Category-based recommendations, protected |
| GET | `/recommendations/:userId/overview?productId=1` | Combined recommendation groups, protected |

## Recommendation Logic

The recommendation engine includes:

- Users who bought this also bought: groups order items by co-purchased products.
- Category similarity: prioritizes same-category products and backs off to similar prices.
- Recently viewed: uses `ViewHistory` records per user.
- Trending: scores products from recent views, recent purchases, ratings, and reviews.
- Hybrid: combines content-based, collaborative, and trending signals.

## Useful Commands

```powershell
npm run dev
npm run dev:backend
npm run dev:frontend
npm --prefix frontend run build
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:seed
```

## Notes

- Public product browsing is open.
- Cart, orders, user data, recently viewed, and user-personalized recommendations require JWT auth.
- If port `3000` or `5000` is already in use, stop the older dev server before running `npm run dev`.
