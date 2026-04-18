# Recommendation Service

Dedicated recommendation API for ranking and serving product recommendations.

## Planned Stack

- Python
- FastAPI
- Pydantic
- scikit-learn or another recommendation library as needed

## Responsibility

The recommendation service will handle:

- Content-based recommendations
- Collaborative filtering experiments
- Trending and fallback recommendations
- Recommendation scoring logic
- Model-ready data contracts shared with the backend

## Planned Structure

```text
recommendation-service/
  app/
    api/                FastAPI route modules
    core/               App configuration
    models/             Pydantic request and response models
    services/           Recommendation algorithms
    main.py             FastAPI entry point
  tests/                Service tests
  README.md
```

## Current Status

The FastAPI recommendation service has been initialized with content-based, collaborative, popularity, and hybrid ranking strategies.

## Endpoints

```text
GET /health
GET /recommend/similar/{product_id}
GET /recommend/user/{user_id}
GET /recommend/trending
```

## Local Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Docker fallback:

```bash
docker build -t recommendation-service .
docker run --rm -p 8000:8000 recommendation-service
```

## Recommendation Strategy

- Content-based filtering uses product title, category, brand, description, and tags with TF-IDF plus cosine similarity.
- Collaborative filtering builds a user-item matrix from weighted events.
- Popularity ranking scores recent product interactions with a recency boost.
- Hybrid ranking combines content, collaborative, and popularity scores.

## Event Weights

```text
PURCHASE  strongest signal
CART_ADD  high signal
CLICK     medium signal
VIEW      low signal
```

The current service uses realistic in-memory sample products and interactions so it can run immediately. A later integration step can replace the sample data provider with backend API or database reads.
