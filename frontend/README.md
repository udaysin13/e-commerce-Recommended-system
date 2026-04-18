# Frontend

Customer-facing storefront for the e-commerce recommendation system.

## Planned Stack

- Next.js
- TypeScript
- Tailwind CSS
- React Server Components where useful

## Responsibility

The frontend will handle:

- Product browsing and search
- Product detail pages
- Cart and checkout UI
- Authentication screens
- Recommendation sections powered by backend APIs
- Responsive, portfolio-ready user experience

## Planned Structure

```text
frontend/
  app/                  Next.js routes and layouts
  components/           Reusable UI components
  lib/                  API clients, utilities, and shared helpers
  types/                Frontend TypeScript types
  public/               Static assets
  README.md
```

## Current Status

The Next.js frontend foundation has been implemented with TypeScript, Tailwind CSS, reusable storefront components, and backend-connected product listing APIs.

## Routes

```text
/                  Home page
/login             Login page
/signup            Signup page
/products          Product listing with search, filters, and sorting
/products/[id]     Product detail page
/cart              Cart page with mock auth state
```

## Development

Create a local environment file:

```bash
cp .env.example .env.local
```

Install dependencies and run the app:

```bash
npm install
npm run dev
```

The product listing page reads from `NEXT_PUBLIC_API_BASE_URL`. If the backend is unavailable, it falls back to local mock products so the UI remains usable during development.

Recommendation consumption lives in `lib/recommendationsApi.ts`:

```ts
await getHomeRecommendations("user-id", 6);
await getProductRecommendations("product-id", 3);
await getUserRecommendations("user-id", 6);
```
