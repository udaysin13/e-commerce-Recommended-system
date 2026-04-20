from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class InteractionType(StrEnum):
    VIEW = "VIEW"
    CLICK = "CLICK"
    CART_ADD = "CART_ADD"
    PURCHASE = "PURCHASE"


class Product(BaseModel):
    id: str
    title: str
    category: str
    brand: str | None = None
    description: str | None = None
    price: float
    rating: float = 0
    metadata: dict[str, Any] = Field(default_factory=dict)


class Interaction(BaseModel):
    user_id: str | None = None
    product_id: str
    event_type: InteractionType
    weight: float
    quantity: int = 1
    created_at: datetime


class RecommendationScore(BaseModel):
    content: float = 0
    collaborative: float = 0
    popularity: float = 0
    hybrid: float = 0


class RecommendationItem(BaseModel):
    product_id: str
    title: str
    category: str
    brand: str | None = None
    price: float
    rating: float
    score: RecommendationScore
    reason: str


class RecommendationResponse(BaseModel):
    strategy: str
    count: int
    items: list[RecommendationItem]


class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str


class CatalogProductInput(BaseModel):
    id: str
    title: str
    category: str
    brand: str | None = None
    description: str | None = None
    price: float
    rating: float = 0
    purchase_count: int = 0
    view_count: int = 0
    click_count: int = 0
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ParsedIntent(BaseModel):
    category: str | None = None
    budget_max: float | None = None
    budget_min: float | None = None
    keywords: list[str] = Field(default_factory=list)
    preferred_tags: list[str] = Field(default_factory=list)
    use_case: str | None = None
    audience: str | None = None
    explanation: str


class AIResultItem(BaseModel):
    product_id: str
    reason: str
    score: float
    smart_tags: list[str] = Field(default_factory=list)


class AISearchRequest(BaseModel):
    query: str
    catalog: list[CatalogProductInput]
    limit: int = Field(default=12, ge=1, le=50)


class AISearchResponse(BaseModel):
    query: str
    intent: ParsedIntent
    explanation: str
    items: list[AIResultItem]


class AIAssistantRequest(BaseModel):
    message: str
    session_id: str | None = None
    catalog: list[CatalogProductInput]
    limit: int = Field(default=4, ge=1, le=12)


class AIAssistantResponse(BaseModel):
    mode: str = "search"
    reply: str
    intent: ParsedIntent
    follow_up_question: str | None = None
    suggestion_chips: list[str] = Field(default_factory=list)
    confidence: float = 0.8
    items: list[AIResultItem]


class ReviewSummaryRequest(BaseModel):
    product: CatalogProductInput


class ReviewSummaryResponse(BaseModel):
    product_id: str
    has_review_data: bool
    summary: str | None = None
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
