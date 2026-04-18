# Interview Notes

## 2-Line Resume Description

Built a full-stack e-commerce recommendation platform using Next.js, Express, Prisma, PostgreSQL, and FastAPI, with JWT auth, cart/order workflows, behavior tracking, and hybrid recommendations.

Designed recommendation-ready data pipelines using weighted user events, content similarity, collaborative filtering, popularity ranking, and graceful backend fallbacks.

## Short Viva Explanation

RecomCart is an e-commerce recommendation system split into three services: a Next.js frontend, a TypeScript Express backend, and a Python FastAPI recommendation service. The backend stores products, orders, carts, and weighted user interactions in PostgreSQL, while the recommendation service combines product metadata, user behavior, and trending signals to produce hybrid recommendations.

## What To Emphasize

- The backend is not just CRUD; it captures recommendation signals.
- Purchases, cart additions, clicks, and views have different weights.
- The recommendation service is separated so ML/ranking logic can evolve independently.
- Prisma enforces a clean relational data model.
- The backend has graceful fallback if the recommendation service is down.
- The seed data is intentionally designed with user behavior clusters.

## Example Answer: Why Hybrid Recommendations?

Content-based filtering works well when product metadata is rich, but it can miss behavior patterns across users. Collaborative filtering captures user behavior, but it struggles with new products and sparse data. Popularity handles cold-start cases. A hybrid approach combines all three, making the recommendation system more robust.
