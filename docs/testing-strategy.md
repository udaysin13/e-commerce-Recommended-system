# Testing Strategy

This project uses a pragmatic testing approach: enough coverage to prove the architecture works without slowing down early feature work.

## Backend API Tests

Recommended stack:

- Node.js built-in test runner or Vitest
- Supertest for Express route testing
- Prisma test database with isolated seed data

Priority test areas:

1. Authentication
   - Signup creates a user.
   - Login returns a JWT.
   - Protected routes reject missing or invalid tokens.

2. Products
   - Product listing supports pagination.
   - Search filters by product name.
   - Category and sort query params work.

3. Cart and Orders
   - Authenticated users can add, update, and remove cart items.
   - Checkout converts cart items into order items.
   - Checkout clears the active cart and decrements stock.

4. Events and Recommendations
   - View and click events create `ProductInteraction` rows.
   - Add-to-cart creates `CART_ADD` interactions.
   - Checkout creates `PURCHASE` interactions.
   - Recommendation routes return FastAPI results when available and local fallback results when unavailable.

## Backend Smoke Commands

After running migrations and seed:

```bash
cd backend
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Try these manually:

```http
POST http://localhost:4000/auth/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "Password123"
}
```

```http
GET http://localhost:4000/products?category=electronics&sortBy=rating
```

```http
GET http://localhost:4000/recommendations/home/demo-user
```

## Recommendation Service Tests

Recommended stack:

- Pytest
- FastAPI `TestClient`
- Small deterministic sample datasets

Priority test areas:

1. Content-Based Similarity
   - Similar products from the same category/brand rank highly.
   - The source product is excluded from similar results.

2. Collaborative Filtering
   - Users with overlapping interactions influence recommendations.
   - Products already interacted with by the target user are excluded.

3. Popularity
   - Recent purchases and cart additions rank above old views.
   - Trending endpoint returns stable sorted results.

4. Hybrid Ranking
   - Hybrid score combines content, collaborative, and popularity scores.
   - Endpoints return the expected response shape.

## Recommendation Smoke Commands

```bash
cd recommendation-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pytest
uvicorn app.main:app --reload --port 8000
```

Manual checks:

```http
GET http://localhost:8000/health
GET http://localhost:8000/recommend/trending
GET http://localhost:8000/recommend/similar/prod-headphones-001
GET http://localhost:8000/recommend/user/user-1
```
