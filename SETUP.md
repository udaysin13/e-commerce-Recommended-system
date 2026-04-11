# E-Commerce Recommendation System - Setup Guide

> **Complete step-by-step setup guide for developers**

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18.x or higher** ([Download](https://nodejs.org/))
- **npm 9.x or higher** (comes with Node.js)
- **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))
  - OR **Docker** for containerized PostgreSQL
- **Git** ([Download](https://git-scm.com/))
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

### Verify Installation

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version

# Check PostgreSQL (if installed locally)
psql --version
```

---

## 🚀 Quick Start (5 minutes)

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd "E-commerce Recommendation system"
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
cd ..
```

### Step 4: Setup Environment Variables

#### Backend (.env)

Create `backend/.env`:

```bash
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env.local)

Create `frontend/.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Step 5: Setup Database

**Option A: Using Docker (Recommended)**

```bash
# Start PostgreSQL in Docker
docker run --name postgres-ecommerce \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ecommerce \
  -p 5432:5432 \
  -d postgres:15

# Verify connection
psql -h localhost -U postgres -d ecommerce
```

**Option B: Local PostgreSQL**

```bash
# Create database
psql -U postgres
CREATE DATABASE ecommerce;
\q
```

### Step 6: Run Database Migrations

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed sample data
npm run prisma:seed

cd ..
```

### Step 7: Start Development Servers

**From root directory:**

```bash
npm run dev
```

This starts:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

**Verify Setup:**

1. Open http://localhost:3000 in browser
2. See homepage with products
3. Try adding product to cart
4. Check that no console errors appear

✅ **Setup Complete!**

---

## 🔧 Detailed Configuration

### Backend Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ecommerce` |
| `PORT` | API server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level (optional) | `info` |

### Frontend Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:5000` |

### Database URL Format

```
postgresql://[user]:[password]@[host]:[port]/[database]

Example:
postgresql://postgres:password@localhost:5432/ecommerce
```

---

## 📁 Project Structure After Setup

```
E-commerce Recommendation system/
├── backend/
│   ├── node_modules/          # Dependencies
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Sample data
│   ├── .env                   # Environment variables (CREATE THIS)
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/
│   ├── node_modules/          # Dependencies
│   ├── .env.local             # Environment variables (CREATE THIS)
│   ├── package.json
│   └── app/
│       ├── page.js            # Home page
│       └── ...
│
└── docker-compose.yml         # Docker configuration (optional)
```

---

## 🐳 Docker Setup (Alternative)

Use Docker to run entire stack without local PostgreSQL installation:

### 1. Create docker-compose.yml (if not exists)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ecommerce
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: "postgresql://postgres:password@postgres:5432/ecommerce"
      CLIENT_URL: "http://localhost:3000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: "http://localhost:5000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2. Start All Services

```bash
docker-compose up -d
```

### 3. Run Database Migrations

```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

### 4. Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432

### 5. Stop Services

```bash
docker-compose down
```

---

## 🛠️ Available Commands

### Backend Commands

```bash
# Development server with hot reload
npm run dev:backend

# Production build
npm run build:backend

# Start production server
npm start

# Database migrations and seeding
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate       # Run pending migrations
npm run prisma:seed          # Populate sample data
npm run prisma:studio        # Open Prisma data browser

# Linting (if configured)
npm run lint
npm run lint:fix
```

### Frontend Commands

```bash
# Development server with hot reload
npm run dev:frontend

# Production build
npm run build:frontend

# Start production server
npm run start:frontend

# Linting
npm run lint

# Type checking
npm run type-check
```

### Root Commands (from project root)

```bash
# Start both backend and frontend
npm run dev

# Stop servers (Ctrl+C)

# Build both for production
npm run build

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend
```

---

## 🐛 Troubleshooting

### "Cannot find module" Errors

**Problem**: Missing dependencies
**Solution**:
```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### "ECONNREFUSED: Connection refused" (Database)

**Problem**: Database not running or connection details wrong
**Solution**:
```bash
# Check database is running
psql -h localhost -U postgres

# Verify DATABASE_URL in .env
# Format: postgresql://user:password@host:port/database

# Restart Docker container
docker-compose restart postgres
```

### "Port already in use (3000 or 5000)"

**Problem**: Another application using the port
**Solution**:
```bash
# Find process using port 3000 (Windows)
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001  # Use different port
```

### "Prisma: Client not found"

**Problem**: Prisma client not generated
**Solution**:
```bash
cd backend
npm run prisma:generate
cd ..
```

### "Migration failed"

**Problem**: Database schema conflicts
**Solution**:
```bash
cd backend

# Reset database and run migrations
npm run prisma:migrate:reset

# Or manually:
npm run prisma:migrate
npm run prisma:seed

cd ..
```

### Frontend not connecting to Backend

**Problem**: API calls failing with CORS errors
**Solution**:

1. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

2. Check `CLIENT_URL` in `backend/.env`:
   ```
   CLIENT_URL=http://localhost:3000
   ```

3. Restart both servers:
   ```bash
   Ctrl+C to stop
   npm run dev
   ```

---

## 📊 Verifying Your Setup

### 1. Frontend is Ready

- Visit http://localhost:3000
- See product list loading
- No console errors (F12 → Console tab)

### 2. Backend is Ready

- Visit http://localhost:5000
- See API running message
- No crash errors in terminal

### 3. Database is Ready

```bash
# Check database connection
cd backend
npm run prisma:studio

# Opens visual database browser
# Should see tables: User, Product, Cart, Order, etc.
```

### 4. Features Work

- [ ] Browse products on home page
- [ ] Add product to cart
- [ ] View cart items
- [ ] Remove product from cart
- [ ] See product recommendations
- [ ] No console errors or warnings

---

## 🚀 Next Steps

1. **Explore the Code**: Browse `backend/` and `frontend/` directories
2. **Read Documentation**: See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
3. **Check API**: Open [http://localhost:5000/api/docs](http://localhost:5000/api/docs) if API docs configured
4. **Make Changes**: Try modifying a component and see hot reload in action
5. **Run Tests**: See [Testing Guide](TESTING_GUIDE.md) for running tests

---

## 📚 Useful Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Express Docs**: https://expressjs.com/
- **Prisma Docs**: https://www.prisma.io/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev

---

## 💡 Development Tips

### Hot Reload
- Edit backend files → server auto-restarts
- Edit frontend files → page auto-refreshes
- Change `schema.prisma` → run `npm run prisma:migrate`

### Debugging Backend
- Check terminal output for error messages
- Use `console.log()` for debugging
- Check logs in error response JSON

### Debugging Frontend
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls
- Use React DevTools extension

### Database Inspection
```bash
# Visual database browser
cd backend && npm run prisma:studio
```

---

## ✅ Checklist

Use this checklist to verify complete setup:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 15+ installed or Docker running
- [ ] Repository cloned
- [ ] `backend/.env` created with DATABASE_URL
- [ ] `frontend/.env.local` created with API URL
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] Database migrations run (`npm run prisma:migrate`)
- [ ] Sample data seeded (`npm run prisma:seed`)
- [ ] Backend starts without errors (`npm run dev:backend`)
- [ ] Frontend starts without errors (`npm run dev:frontend`)
- [ ] Frontend loads at http://localhost:3000
- [ ] Products visible on home page
- [ ] Can add products to cart
- [ ] No console errors

---

## 🆘 Getting Help

If you encounter issues:

1. **Check this Guide**: Search for the error message above
2. **Check Package.json**: Verify all scripts exist in `backend/package.json` and `frontend/package.json`
3. **Clear Node Modules**: 
   ```bash
   rm -r backend/node_modules frontend/node_modules
   npm install in both directories
   ```
4. **Review .env Files**: Ensure DATABASE_URL and NEXT_PUBLIC_API_URL are correct
5. **Check Logs**: Look for error messages in terminal output

---

## 🎯 You're Ready!

Your development environment is fully configured. Now:

1. Open `http://localhost:3000` in your browser
2. Start exploring and building features
3. Refer to [ARCHITECTURE.md](ARCHITECTURE.md) for system design details
4. Check source code comments for implementation details

**Happy coding! 🚀**
