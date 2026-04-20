from fastapi import APIRouter

from app.models.recommendation import (
    AIAssistantRequest,
    AIAssistantResponse,
    AISearchRequest,
    AISearchResponse,
    ReviewSummaryRequest,
    ReviewSummaryResponse,
)
from app.services.ai_features import ai_search, review_summary, shopping_assistant

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/search", response_model=AISearchResponse)
def ai_search_endpoint(payload: AISearchRequest) -> AISearchResponse:
    return ai_search(payload.query, payload.catalog, payload.limit)


@router.post("/assistant", response_model=AIAssistantResponse)
def ai_assistant_endpoint(payload: AIAssistantRequest) -> AIAssistantResponse:
    return shopping_assistant(payload.message, payload.catalog, payload.limit)


@router.post("/review-summary", response_model=ReviewSummaryResponse)
def review_summary_endpoint(payload: ReviewSummaryRequest) -> ReviewSummaryResponse:
    return review_summary(payload.product)
