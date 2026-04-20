from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_trending_recommendations() -> None:
    response = client.get("/recommend/trending?limit=3")
    assert response.status_code == 200
    body = response.json()
    assert body["strategy"] == "popularity_trending"
    assert body["count"] == 3


def test_similar_product_not_found() -> None:
    response = client.get("/recommend/similar/missing-product")
    assert response.status_code == 404


def test_ai_search_endpoint() -> None:
    payload = {
        "query": "budget headphones for travel",
        "catalog": [
            {
                "id": "p1",
                "title": "Travel Wireless Headphones",
                "category": "electronics",
                "brand": "Northline",
                "description": "Comfortable wireless headphones with long battery life",
                "price": 99.0,
                "rating": 4.6,
                "purchase_count": 24,
                "view_count": 210,
                "click_count": 38,
                "tags": ["audio", "travel"],
                "metadata": {},
            },
            {
                "id": "p2",
                "title": "Leather Wallet",
                "category": "accessories",
                "brand": "Oak",
                "description": "Slim wallet for daily carry",
                "price": 42.0,
                "rating": 4.1,
                "purchase_count": 12,
                "view_count": 88,
                "click_count": 11,
                "tags": ["wallet"],
                "metadata": {},
            },
        ],
        "limit": 2,
    }
    response = client.post("/ai/search", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["items"][0]["product_id"] == "p1"


def test_review_summary_without_reviews() -> None:
    payload = {
        "product": {
            "id": "p1",
            "title": "Sample Product",
            "category": "electronics",
            "brand": "Northline",
            "description": "Sample description",
            "price": 99.0,
            "rating": 4.4,
            "purchase_count": 10,
            "view_count": 100,
            "click_count": 10,
            "tags": ["audio"],
            "metadata": {},
        }
    }
    response = client.post("/ai/review-summary", json=payload)
    assert response.status_code == 200
    assert response.json()["has_review_data"] is False
