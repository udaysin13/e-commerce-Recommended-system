# Future Scope

## Performance

- Add Redis for caching product lists, sessions, and recommendation responses.
- Cache recommendation results per user and product with short TTLs.
- Add background refresh jobs for recommendation cache warming.

## Recommendation Quality

- Add vector search with pgvector, Pinecone, Weaviate, or Qdrant.
- Use sentence-transformer embeddings for semantic product similarity.
- Add learning-to-rank models using click-through, cart-add, and purchase labels.
- Add recency decay and category diversity to final ranking.
- Add A/B testing for recommendation strategies.

## Data Pipeline

- Stream events through Kafka, Redpanda, or RabbitMQ.
- Add a feature store for user and product features.
- Add scheduled offline model training.
- Store model metrics and recommendation explanations.

## Product Features

- Stripe checkout.
- Admin dashboard for products, orders, and recommendation analytics.
- Product reviews and ratings.
- Wishlist UI.
- Order tracking.
- Personalized email recommendations.

## Production Readiness

- Docker Compose for all services.
- CI/CD pipeline.
- API rate limiting.
- OpenTelemetry tracing.
- Centralized logs.
- Prometheus and Grafana dashboards.
- Cloud deployment on AWS, GCP, Azure, or Render/Fly.io.
