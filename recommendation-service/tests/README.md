# Recommendation Service Testing Notes

The recommendation service includes basic FastAPI tests in `test_recommendations.py`.

## Run Tests

```bash
cd recommendation-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pytest
```

## What To Test First

- `/health` returns service status.
- `/recommend/trending` returns popularity-ranked products.
- `/recommend/similar/{product_id}` excludes the source product.
- `/recommend/user/{user_id}` returns hybrid personalized recommendations.
