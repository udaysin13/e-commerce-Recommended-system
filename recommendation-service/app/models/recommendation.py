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
