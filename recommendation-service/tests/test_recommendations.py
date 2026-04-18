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
