# FluxCart

A modern e-commerce storefront built with **Next.js**, **TypeScript**, and **Tailwind CSS**. This project is a foundation for a full-featured Product Recommendation System, with an admin panel, product search/filtering, cart and wishlist functionality, and a clean UI.

> 🚧 This repository is currently in the early stages of migration from a static JSON-backed demo store to a full-stack application with a real database, authentication, and recommendation logic. Follow the development plan in the codebase to continue progress.

---

## 🚀 Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file from `.env.example` and update values as needed.

```bash
cp .env.example .env
```

Set a strong secret for JWT authentication:

```bash
JWT_SECRET=replace-with-a-long-random-secret
```

### 3) Run PostgreSQL (optional, but recommended)

A `docker-compose.yml` is included to spin up Postgres + Adminer:

```bash
docker compose up -d
```

Then update your `.env` (or create it) with:

```bash
DATABASE_URL=postgresql://fluxcart:fluxcart@localhost:5432/fluxcart?schema=public
```

### 4) Initialize the database

Run migrations and seed the initial data:

```bash
npm run prisma:migrate
npm run db:seed
```

If you want a demo user, set `DEMO_USER_NAME`, `DEMO_USER_EMAIL`, and `DEMO_USER_PASSWORD` in `.env` before running `npm run db:seed`.

### 5) Run the development server

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

---

## 🧩 Features (Current)

- Product catalog fetched via a Next.js App Router API route
- Customer-facing storefront with search/filter/sort UI
- Basic cart and wishlist stored in `localStorage`
- Admin interface for product management (CRUD)
- Admin authentication via cookie session token

---

## 🗂️ Project Structure

- `app/` – Next.js App Router pages and API routes
- `components/` – Reusable UI components
- `lib/` – Shared utilities and server-side helpers
- `data/` – Seed product data (JSON-based for now)

---

## 🔜 Roadmap (Planned)

1. Replace JSON storage with PostgreSQL + Prisma
2. Add real user authentication (signup/login) with hashed passwords
3. Persist cart, wishlist, and orders in the database
4. Build a recommendation engine (personalized + trending)
5. Add review/rating system and order tracking
6. Improve admin dashboard, image uploads, and stats

---

## 🧪 Scripts

- `npm run dev` – Start local dev server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run lint` – Run ESLint
- `npm run typecheck` – Run TypeScript type checking

---

## 🧠 Notes

This project is structured with a focus on clean components and modular server routes so the next phases (DB, auth, recommendations) can be implemented incrementally without major rewrites.
