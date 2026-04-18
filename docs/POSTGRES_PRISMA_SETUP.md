# PostgreSQL And Prisma Setup

This project already uses PostgreSQL and Prisma in `backend/`. The schema is a production-ready superset of the baseline e-commerce entities you asked for, and it stays compatible with the existing backend routes and services.

## File Paths

- `backend/.env.example`
- `backend/prisma/schema.prisma`
- `backend/src/lib/prisma.ts`
- `backend/prisma/seed.ts`
- `backend/src/examples/prismaExamples.ts`

## 1. Install PostgreSQL Locally

### Windows

1. Download PostgreSQL from the official installer:
   `https://www.postgresql.org/download/windows/`
2. Run the installer.
3. Keep note of:
   - PostgreSQL username, usually `postgres`
   - password you set during install
   - port, usually `5432`
4. Keep pgAdmin installed if you want a GUI.

### macOS

1. Install with Homebrew:
   ```bash
   brew install postgresql
   brew services start postgresql
   ```

### Ubuntu / Debian

1. Install packages:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

## 2. Create The Database

Using `psql`:

```sql
CREATE DATABASE ecommerce_db;
```

If you need to connect first:

```bash
psql -U postgres
```

On Linux, you may instead use:

```bash
sudo -u postgres psql
```

## 3. Environment Variables

Copy `backend/.env.example` to `backend/.env` and update the credentials:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ecommerce_db?schema=public"
NODE_ENV="development"
PORT="4000"
JWT_SECRET="replace-with-a-secure-local-secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"
RECOMMENDATION_SERVICE_URL="http://localhost:8000"
RECOMMENDATION_SERVICE_TIMEOUT_MS="3000"
PAYMENT_PROVIDER="RAZORPAY"
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxx"
STRIPE_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxx"
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxx"
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
```

## 4. Prisma Setup

Install dependencies inside `backend/`:

```bash
npm install
```

If Prisma is not already present in another project, the core install commands are:

```bash
npm install @prisma/client @prisma/adapter-pg pg
npm install -D prisma
```

This project already contains:

- `backend/prisma/schema.prisma`
- Prisma output to `backend/src/generated/prisma`
- Prisma client singleton in `backend/src/lib/prisma.ts`

## 5. Schema Overview

The current schema covers the requested core entities:

- `User`
- `Category`
- `Product`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `ProductView`
- `Wishlist`
- `RecommendationCache`

It also includes production-friendly extras already used by the backend:

- `OrderTrackingHistory`
- `PaymentMethod`
- recommendation metadata and scoring
- richer product metadata
- cart and event interaction state

## 6. Relations

Implemented Prisma relations include:

- `User -> Cart`
- `User -> Orders`
- `Cart -> CartItems`
- `Product -> Category`
- `Order -> OrderItems`
- `ProductView -> User`
- `ProductView -> Product`
- `Wishlist -> User`
- `Wishlist -> Product`
- `RecommendationCache -> User`

Important indexes already exist for:

- user email and role
- product category, brand, feature flags, popularity
- order status, payment status, placement time
- cart uniqueness by `cartId + productId`
- wishlist uniqueness by `userId + productId`

## 7. Enums

To remain compatible with the existing backend, the schema uses:

- `UserRole`: `CUSTOMER`, `ADMIN`
- `OrderStatus`: `PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `RETURNED`
- `PaymentStatus`: `PENDING`, `PAID`, `FAILED`, `REFUNDED`

These are slightly richer than the baseline interview version and match the current backend implementation.

## 8. Migration Commands

Run these from `backend/`:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Useful project scripts:

```bash
npm run prisma:migrate -- --name init
npm run prisma:generate
npm run prisma:seed
```

If you need to sync a local dev database directly to the schema:

```bash
npx prisma db push
```

## 9. Seed Setup

Run:

```bash
npm run prisma:seed
```

The seed inserts:

- sample users
- categories
- products

Local seeded users all use:

```text
Password123!
```

Sample accounts:

- `admin@recomcart.dev`
- `ada@example.com`
- `alan@example.com`
- `grace@example.com`
- `katherine@example.com`

## 10. Prisma Client Singleton

`backend/src/lib/prisma.ts`

This project uses a singleton Prisma client so development hot reloads do not create multiple instances.

## 11. Example Usage

Example query helpers live in:

`backend/src/examples/prismaExamples.ts`

Included examples:

- create a user
- fetch products
- create an order in a transaction

## 12. CRUD Examples

### Create user

```ts
const user = await prisma.user.create({
  data: {
    email: "jane@example.com",
    passwordHash: "...hashed...",
    firstName: "Jane",
    lastName: "Doe",
    role: "CUSTOMER",
  },
});
```

### Fetch products

```ts
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: { category: true },
  take: 20,
});
```

### Create order

```ts
const order = await prisma.order.create({
  data: {
    userId,
    orderNumber: `ORD-${Date.now()}`,
    status: "PENDING",
    paymentStatus: "PENDING",
    subtotal: 199.99,
    taxAmount: 0,
    shippingAmount: 0,
    discountAmount: 0,
    totalAmount: 199.99,
    currency: "USD",
    items: {
      create: [
        {
          productId,
          productName: "Demo Product",
          sku: "DEM-0001",
          quantity: 1,
          unitPrice: 199.99,
          totalPrice: 199.99,
        },
      ],
    },
  },
});
```

## 13. Full Schema Source

The canonical schema file is:

`backend/prisma/schema.prisma`

Use that file as the source of truth for all future migrations.
