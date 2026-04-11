# 🚀 Backend Quick Start (5 Minutes)

## Prerequisites
- Node.js 18+
- PostgreSQL running
- npm or yarn

---

## ⚡ Quick Setup

### Step 1: Setup Environment
```bash
cd backend

# Create .env file
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"' > .env
echo 'PORT=5000' >> .env
echo 'NODE_ENV=development' >> .env
echo 'FRONTEND_URL=http://localhost:3000' >> .env
```

**Note**: Replace `user:password` with your PostgreSQL credentials

---

### Step 2: Install Dependencies
```bash
npm install
```

---

### Step 3: Setup Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with sample data (optional)
npm run prisma:seed
```

---

### Step 4: Start Server
```bash
npm run dev
```

✅ Server runs on: **http://localhost:5000**

---

## 🧪 Quick Test

### Test in browser:
```
http://localhost:5000
```

Should show:
```json
{
  "message": "E-commerce Recommendation Backend",
  "status": "running",
  "port": 5000
}
```

### Test with cURL:
```bash
# Get all products
curl http://localhost:5000/products

# Get single product
curl http://localhost:5000/products/1

# Get cart
curl http://localhost:5000/cart/1
```

---

## 📁 File Structure (Quick Reference)

```
backend/
├── middleware/          # Errors, validation
├── controllers/         # Handle requests
├── services/            # Business logic
├── routes/              # API endpoints
├── prisma/              # Database schema
├── server.js            # Main entry
└── package.json
```

---

## 🔑 Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /products | GET | List all products |
| /products/:id | GET | Get single product |
| /cart/:userId | GET | Get shopping cart |
| /cart/:userId/items | POST | Add to cart |
| /orders | POST | Create order |
| /users/register | POST | Register user |

---

## 🛠️ Available Commands

```bash
npm run dev               # Start development server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed sample data
npx prisma studio       # Open database GUI
```

---

## ⚠️ Common Issues

| Error | Fix |
|-------|-----|
| DATABASE_URL not set | Add `DATABASE_URL` to .env |
| Port 5000 in use | Change PORT in .env |
| Prisma not found | Run `npm install` |
| PostgreSQL connection refused | Check PostgreSQL is running |

---

## 📚 Documentation

- **[BACKEND_GUIDE.md](./BACKEND_GUIDE.md)** - Complete documentation
- **[prisma/schema.prisma](./prisma/schema.prisma)** - Database schema
- **[package.json](./package.json)** - Dependencies

---

## 🎯 Next Steps

1. ✅ Backend running
2. 🔗 Connect frontend (port 3000)
3. 🔐 Add authentication
4. 💳 Add payment gateway
5. 📊 Add recommendations

---

**Done!** 🎉 Your backend is ready!

For more details, see [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)
