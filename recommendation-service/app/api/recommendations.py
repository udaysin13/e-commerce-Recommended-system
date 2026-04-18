from fastapi import APIRouter, HTTPException, Query, status

from app.core.config import get_settings
from app.models.recommendation import RecommendationResponse
from app.services.hybrid import recommender

router = APIRouter(prefix=get_settings().api_prefix, tags=["recommendations"])


def _limit(value: int | None) -> int:
    settings = get_settings()
    return value or settings.default_limit


@router.get("/similar/{product_id}", response_model=RecommendationResponse)
def recommend_similar_products(
    product_id: str,
    limit: int | None = Query(default=None, ge=1, le=50),
) -> RecommendationResponse:
    if product_id not in recommender.product_by_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return recommender.similar_products(product_id=product_id, limit=_limit(limit))


@router.get("/user/{user_id}", response_model=RecommendationResponse)
def recommend_for_user(
    user_id: str,
    limit: int | None = Query(default=None, ge=1, le=50),
) -> RecommendationResponse:
    return recommender.user_recommendations(user_id=user_id, limit=_limit(limit))


@router.get("/trending", response_model=RecommendationResponse)
def recommend_trending(
    limit: int | None = Query(default=None, ge=1, le=50),
) -> RecommendationResponse:
    return recommender.trending(limit=_limit(limit))
