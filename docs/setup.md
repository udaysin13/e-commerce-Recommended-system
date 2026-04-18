# Setup

Follow these steps from the repository root.

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL
- Python 3.11+
- Docker, optional for the recommendation service

## Backend

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Backend URL:

```text
http://localhost:4000
```

## Recommendation Service

```bash
cd recommendation-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Docker option:

```bash
cd recommendation-service
docker build -t recommendation-service .
docker run --rm -p 8000:8000 recommendation-service
```

Recommendation service URL:

```text
http://localhost:8000
```

## Frontend

```bash
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## Demo Login

All demo users use:

```text
Password123
```

Good demo accounts:

```text
demo@example.com
ada@example.com
alan@example.com
grace@example.com
```
