# Backend Testing Notes

This folder contains lightweight API smoke examples for manual testing.

## Setup

```bash
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

Open `api-smoke.http` in an editor with REST Client support, or copy the requests into Postman/Insomnia.

## Demo Accounts

All demo users use:

```text
Password123
```

Accounts:

```text
admin@recomcart.dev
ada@example.com
alan@example.com
grace@example.com
katherine@example.com
margaret@example.com
demo@example.com
```
