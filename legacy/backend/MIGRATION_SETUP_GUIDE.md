# Prisma Migration & Setup Guide

## Quick Start

### 1. Install Prisma
```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Initialize Prisma (if not already done)
```bash
npx prisma init
```

### 3. Update .env
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"
NODE_ENV="development"
```

### 4. Push schema to database
```bash
npx prisma db push
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Seed data
```bash
npx prisma db seed
```

---

## Migration Workflow

### For Development

```bash
# Make schema changes in prisma/schema.prisma
# Then create and apply migration:
npx prisma migrate dev --name <migration_name>

# Example:
npx prisma migrate dev --name add_interaction_model
```

### For Staging/Production

```bash
# Review migration before applying:
npx prisma migrate resolve --applied <migration_name>

# Deploy migration to production:
npx prisma migrate deploy

# Verify migration:
npx prisma migrate status
```

---

## Database Setup

### PostgreSQL Connection

#### Local Setup
```bash
# Install PostgreSQL (macOS)
brew install postgresql

# Start service
brew services start postgresql

# Create database
createdb ecommerce_db

# Connect to database
psql ecommerce_db
```

#### Docker Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ecommerce_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

---

## First-Time Schema Deployment

### Step 1: Generate migrations
```bash
npx prisma migrate dev --name init
```

### Step 2: Review generated migration
```bash
cat prisma/migrations/*/migration.sql
```

### Step 3: Verify schema
```bash
npx prisma db pull  # See actual database
npx prisma db push  # Sync changes
```

### Step 4: Generate client
```bash
npx prisma generate
```

### Step 5: Seed test data
```bash
# Add to package.json:
{
  "prisma": {
    "seed": "node prisma/seed-production.js"
  }
}

# Run seed:
npx prisma db seed
```

---

## Seeding Strategies

### Option 1: Basic Seed (Development)
```bash
npx prisma db seed
```

### Option 2: Reset & Seed (Development)
```bash
npx prisma migrate reset
# This deletes all data and re-runs migrations + seed
```

### Option 3: Custom Seed Script
```javascript
// prisma/custom-seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Your seed logic
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

```bash
node prisma/custom-seed.js
```

---

## Testing Schema

### 1. Inspect Database
```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Or query directly
psql ecommerce_db -U user

# List tables
\dt

# Describe table
\d "Product"

# View indexes
\di

# View all constraints
\d+ "Product"
```

### 2. Test Queries

```javascript
// test-schema.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  // Test create
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password: "hashed",
      name: "Test User"
    }
  });
  console.log("Created user:", user);

  // Test read
  const found = await prisma.user.findUnique({
    where: { email: "test@example.com" }
  });
  console.log("Found user:", found);

  // Test update
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name: "Updated Name" }
  });
  console.log("Updated user:", updated);

  // Test delete
  const deleted = await prisma.user.delete({
    where: { id: user.id }
  });
  console.log("Deleted user:", deleted);

  // Test relations
  const userWithOrders = await prisma.user.findUnique({
    where: { id: user.id },
    include: { orders: true }
  });
  console.log("User with orders:", userWithOrders);
}

test()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

```bash
node test-schema.js
```

### 3. Test Interactions

```javascript
// Test the Interaction model
const interaction = await prisma.interaction.create({
  data: {
    userId: 1,
    productId: 1,
    type: "PURCHASE",
    weight: 5.0,
    metadata: JSON.stringify({
      deviceType: "desktop",
      source: "search"
    })
  }
});

// Get interactions by type
const purchases = await prisma.interaction.findMany({
  where: { type: "PURCHASE" }
});

// Get users with similar purchases
const similarUsers = await prisma.interaction.groupBy({
  by: ["userId"],
  where: { productId: 1, type: "PURCHASE" }
});
```

---

## Migrations Management

### View Migration History
```bash
npx prisma migrate status
```

### Rollback Migration (Development only)
```bash
# Reset to initial state
npx prisma migrate reset

# Or manually:
npx prisma migrate resolve --rolled-back <migration_name>
```

### Create Empty Migration
```bash
npx prisma migrate dev --name <name> --create-only
```

---

## Performance Optimization

### 1. Enable Query Logging
```javascript
const prisma = new PrismaClient({
  log: ["query", "error", "warn"]
});
```

### 2. Check Indexes
```sql
-- In PostgreSQL
SELECT * FROM pg_indexes WHERE tablename = 'Product';
SELECT * FROM pg_indexes WHERE tablename = 'Interaction';
```

### 3. View Query Performance
```sql
-- Analyze query plan
EXPLAIN ANALYZE
SELECT p.*, COUNT(i.id) as interactions
FROM "Product" p
LEFT JOIN "Interaction" i ON p.id = i."productId"
GROUP BY p.id;
```

---

## Common Issues & Solutions

### Issue: Migration conflicts
```bash
# Resolution
npx prisma migrate resolve --rolled-back migration_name
npx prisma migrate dev --name fix_conflict
```

### Issue: Foreign key constraint errors
```bash
# Check constraint
SELECT * FROM information_schema.referential_constraints;

# Disable foreign key check during migration (PostgreSQL)
SET session_replication_role = replica;
-- Your operations
SET session_replication_role = DEFAULT;
```

### Issue: Duplicate unique constraint
```bash
# Drop duplicate entries before migration
DELETE FROM "User" WHERE email IN (
  SELECT email FROM "User" GROUP BY email HAVING COUNT(*) > 1
  AND MIN(id) != id
);
```

### Issue: Prisma Client out of sync
```bash
npx prisma generate
npm install @prisma/client@latest
```

---

## Production Deployment

### Pre-deployment Checklist

- [ ] All migrations tested locally
- [ ] Backup database before applying
- [ ] Review migration SQL
- [ ] Test rollback procedure
- [ ] Monitor migration performance
- [ ] Verify all relations work

### Deployment Steps

```bash
# 1. Pull latest schema
git pull origin main

# 2. Test locally
npm install
npx prisma generate

# 3. Deploy to staging
npx prisma migrate deploy --preview-feature

# 4. Test in staging
npm run test:integration

# 5. Deploy to production
npx prisma migrate deploy

# 6. Verify
npx prisma db execute --stdin < verify.sql
```

### Verify Script (verify.sql)
```sql
-- Check table counts
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Product";
SELECT COUNT(*) FROM "Order";

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename IN ('User', 'Product', 'Interaction');

-- Check constraints
SELECT * FROM information_schema.table_constraints 
WHERE table_name IN ('User', 'Product', 'Interaction');
```

---

## Monitoring

### Database Metrics
```javascript
// Monitor connection pool
const prisma = new PrismaClient({
  errorFormat: "pretty",
  log: [
    { level: "query", emit: "stdout" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
    { level: "error", emit: "stdout" }
  ]
});

// More: https://www.prisma.io/docs/concepts/components/prisma-client/debugging-and-troubleshooting
```

### Query Performance
```bash
# Enable slow query log (PostgreSQL)
ALTER SYSTEM SET log_min_duration_statement = 100; -- 100ms
SELECT pg_reload_conf();

# View slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

---

## Backup & Recovery

### Backup Database
```bash
# PostgreSQL backup
pg_dump -h localhost -U user ecommerce_db > backup.sql

# Restore
psql -h localhost -U user ecommerce_db < backup.sql
```

### Backup Prisma Client
```bash
# Regenerate from schema
npx prisma generate

# Version in package-lock.json
npm list @prisma/client
```

---

## Scripts to Add to package.json

```json
{
  "scripts": {
    "db:migrate:dev": "npx prisma migrate dev",
    "db:migrate:prod": "npx prisma migrate deploy",
    "db:push": "npx prisma db push",
    "db:pull": "npx prisma db pull",
    "db:seed": "npx prisma db seed",
    "db:reset": "npx prisma migrate reset",
    "db:studio": "npx prisma studio",
    "db:generate": "npx prisma generate",
    "db:status": "npx prisma migrate status",
    "db:validate": "npx prisma validate"
  },
  "prisma": {
    "seed": "node prisma/seed-production.js"
  }
}
```

---

## Resources

- **Prisma Docs**: https://www.prisma.io/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Database Design**: backend/SCHEMA_DESIGN_GUIDE.md
- **API Documentation**: backend/RECOMMENDATIONS_API_DOCUMENTATION.md

---

**Status:** Ready for Production ✅  
**Last Updated:** 2024-01-15

