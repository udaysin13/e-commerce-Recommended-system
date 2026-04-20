from __future__ import annotations

import re
from collections import Counter

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from app.models.recommendation import (
    AIAssistantResponse,
    AIResultItem,
    AISearchResponse,
    CatalogProductInput,
    ParsedIntent,
    ReviewSummaryResponse,
)


CATEGORY_ALIASES: dict[str, list[str]] = {
    "electronics": ["electronics", "electronic", "phone", "phones", "laptop", "laptops", "headphones", "earbuds", "gadgets", "tech"],
    "fashion": ["fashion", "clothes", "clothing", "t-shirt", "tshirts", "shirt", "shirts", "jeans", "hoodie", "wear", "women", "men"],
    "footwear": ["footwear", "shoe", "shoes", "sneaker", "sneakers", "running shoes", "loafers"],
    "sports-fitness": ["sports", "fitness", "running", "gym", "workout", "protein", "dumbbells", "training"],
    "home-kitchen": ["home", "kitchen", "coffee", "lamp", "furniture", "decor", "bedsheet", "bedding"],
    "beauty": ["beauty", "skincare", "makeup", "serum", "cream", "cosmetics"],
    "accessories": ["accessories", "accessory", "bag", "wallet", "belt", "watch", "sunglasses"],
    "books": ["books", "book", "reading", "novel"],
}

USE_CASE_HINTS = {
    "running": ["running", "run", "cardio", "training", "fitness"],
    "coding": ["coding", "programming", "office", "workspace", "laptop", "keyboard", "monitor"],
    "travel": ["travel", "portable", "commute", "commuting"],
    "gaming": ["gaming", "gamer", "performance", "mechanical", "monitor"],
}

AUDIENCE_HINTS = {
    "men": ["men", "man", "male"],
    "women": ["women", "woman", "female", "ladies"],
}


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s-]", " ", value.lower())).strip()


def infer_smart_tags(
    product: CatalogProductInput,
    *,
    price_values: list[float],
) -> list[str]:
    text = normalize_text(
        " ".join(
            [
                product.title,
                product.description or "",
                product.category,
                product.brand or "",
                *product.tags,
            ]
        )
    )
    tags: list[str] = []

    if price_values:
        low_threshold = float(np.percentile(price_values, 35))
        high_threshold = float(np.percentile(price_values, 75))
        if product.price <= low_threshold:
            tags.append("Budget")
        if product.price >= high_threshold:
            tags.append("Premium")

    popularity = product.purchase_count * 1.4 + product.view_count * 0.15 + product.click_count * 0.3
    if popularity >= 120:
        tags.append("Trending")
    if product.rating >= 4.5 and product.price <= (float(np.median(price_values)) if price_values else product.price):
        tags.append("Best Value")

    if any(keyword in text for keyword in ["gaming", "mechanical", "monitor", "webcam"]):
        tags.append("Gaming")
    if any(keyword in text for keyword in ["office", "workspace", "coding", "desk", "laptop"]):
        tags.append("Office Use")
    if any(keyword in text for keyword in ["polo", "wallet", "bag", "watch", "home", "gift"]):
        tags.append("Festive Wear")
    if any(keyword in text for keyword in ["running", "fitness", "recovery", "training"]):
        tags.append("Active")

    return list(dict.fromkeys(tags))[:4]


def parse_intent(query: str, catalog: list[CatalogProductInput]) -> ParsedIntent:
    normalized = normalize_text(query)
    tokens = [token for token in normalized.split(" ") if token]

    category: str | None = None
    for slug, aliases in CATEGORY_ALIASES.items():
        if any(alias in normalized for alias in aliases):
            category = slug
            break

    budget_max: float | None = None
    budget_min: float | None = None
    under_match = re.search(r"(?:under|below|less than|max)\s+(\d+(?:\.\d+)?)", normalized)
    over_match = re.search(r"(?:above|over|more than|min)\s+(\d+(?:\.\d+)?)", normalized)
    between_match = re.search(
        r"(?:between)\s+(\d+(?:\.\d+)?)\s+(?:and|to)\s+(\d+(?:\.\d+)?)",
        normalized,
    )

    if between_match:
        budget_min = float(between_match.group(1))
        budget_max = float(between_match.group(2))
    elif under_match:
        budget_max = float(under_match.group(1))
    elif over_match:
        budget_min = float(over_match.group(1))

    preferred_tags: list[str] = []
    if "budget" in normalized or "cheap" in normalized or "affordable" in normalized:
        preferred_tags.append("Budget")
    if "premium" in normalized or "luxury" in normalized or "flagship" in normalized:
        preferred_tags.append("Premium")
    if "best value" in normalized or "value" in normalized:
        preferred_tags.append("Best Value")
    if "trending" in normalized or "popular" in normalized:
        preferred_tags.append("Trending")
    if "gaming" in normalized:
        preferred_tags.append("Gaming")
    if "office" in normalized or "coding" in normalized or "work" in normalized:
        preferred_tags.append("Office Use")

    use_case = next(
        (
            label
            for label, hints in USE_CASE_HINTS.items()
            if any(hint in normalized for hint in hints)
        ),
        None,
    )
    audience = next(
        (
            label
            for label, hints in AUDIENCE_HINTS.items()
            if any(hint in normalized for hint in hints)
        ),
        None,
    )

    stopwords = {
        "i",
        "want",
        "a",
        "an",
        "the",
        "for",
        "me",
        "show",
        "suggest",
        "good",
        "best",
        "under",
        "over",
        "premium",
        "budget",
        "cheap",
        "stylish",
        "with",
        "and",
        "to",
        "of",
    }
    keywords = [token for token in tokens if token not in stopwords and not token.isdigit()]

    explanation_parts: list[str] = []
    if category:
        explanation_parts.append(f"category={category}")
    if budget_max is not None:
        explanation_parts.append(f"budget<=${budget_max:g}")
    if budget_min is not None:
        explanation_parts.append(f"budget>=${budget_min:g}")
    if use_case:
        explanation_parts.append(f"use_case={use_case}")
    if preferred_tags:
        explanation_parts.append(f"preference={preferred_tags[0]}")

    explanation = ", ".join(explanation_parts) if explanation_parts else "keyword similarity"

    return ParsedIntent(
        category=category,
        budget_max=budget_max,
        budget_min=budget_min,
        keywords=keywords[:8],
        preferred_tags=preferred_tags[:4],
        use_case=use_case,
        audience=audience,
        explanation=explanation,
    )


def _document(product: CatalogProductInput, smart_tags: list[str]) -> str:
    return " ".join(
        [
            product.title,
            product.description or "",
            product.category,
            product.brand or "",
            " ".join(product.tags),
            " ".join(smart_tags),
        ]
    )


def _price_fit(price: float, intent: ParsedIntent) -> float:
    if intent.budget_min is None and intent.budget_max is None:
        return 0.15
    if intent.budget_min is not None and price < intent.budget_min:
        return 0.02
    if intent.budget_max is not None and price > intent.budget_max:
        overflow = max(price - intent.budget_max, 0)
        return max(0.0, 0.2 - overflow / max(intent.budget_max, 1) * 0.2)
    return 0.3


def _category_fit(product: CatalogProductInput, intent: ParsedIntent) -> float:
    if not intent.category:
        return 0.0
    return 0.35 if product.category == intent.category else 0.0


def _tag_fit(smart_tags: list[str], intent: ParsedIntent) -> float:
    if not intent.preferred_tags:
        return 0.0
    matches = len(set(smart_tags).intersection(intent.preferred_tags))
    return min(matches * 0.12, 0.24)


def _reason(product: CatalogProductInput, smart_tags: list[str], intent: ParsedIntent) -> str:
    if intent.category and product.category == intent.category and intent.budget_max is not None:
        return "Matches your category and budget"
    if intent.use_case and any(intent.use_case in value.lower() for value in [product.title, product.description or ""]):
        return f"Looks strong for {intent.use_case}"
    if "Budget" in smart_tags and "Budget" in intent.preferred_tags:
        return "Fits the budget-friendly option you asked for"
    if "Premium" in smart_tags and "Premium" in intent.preferred_tags:
        return "A strong premium option from the catalog"
    if "Office Use" in smart_tags:
        return "Well suited for focused daily use"
    if "Active" in smart_tags:
        return "Aligned with active and performance-focused use"
    return "Relevant match based on your query"


def _assistant_mode(message: str) -> str:
    normalized = normalize_text(message)
    if re.search(r"\b(compare|vs|versus|difference)\b", normalized):
        return "compare"
    if re.search(r"\b(bundle|together|combo|kit|accessories)\b", normalized):
        return "bundle"
    if re.search(r"\b(gift|present|sister|brother|mom|dad)\b", normalized):
        return "gift"
    if re.search(r"\b(winter|summer|rainy|festival|diwali|holi|eid|christmas)\b", normalized):
        return "seasonal"
    if re.search(r"\b(trending|popular|best seller|bestseller)\b", normalized):
        return "trending"
    if re.search(r"\b(similar|same as|like this|like that)\b", normalized):
        return "similar"
    return "search"


def _assistant_follow_up(message: str, intent: ParsedIntent) -> str | None:
    normalized = normalize_text(message)
    if intent.category == "electronics" and not intent.use_case and intent.budget_max is None:
        return "Do you want gaming, music, office, or budget-focused electronics?"
    if intent.category == "footwear" and not intent.use_case:
        return "Should I narrow this to running, casual, or everyday shoes?"
    if (intent.category == "fashion" or "clothes" in normalized) and intent.audience is None:
        return "Should I focus on men, women, winter wear, or festive styles?"
    if intent.category is None and len(intent.keywords) <= 1:
        return "Tell me the category or budget and I can narrow it down quickly."
    return None


def _assistant_chips(intent: ParsedIntent, items: list[AIResultItem], mode: str) -> list[str]:
    chips: list[str] = []

    if intent.budget_max is None:
        chips.append("Under 2000")
    if mode == "gift":
        chips.append("Gift Ideas")
    if mode == "bundle":
        chips.append("Smart Bundle")
    if mode == "seasonal":
        chips.append("Seasonal Picks")
    if any("Trending" in item.smart_tags for item in items):
        chips.append("Trending")
    if any("Budget" in item.smart_tags for item in items):
        chips.append("Budget")
    if any("Premium" in item.smart_tags for item in items):
        chips.append("Premium")
    if intent.category == "footwear":
        chips.append("Running")

    return list(dict.fromkeys(chips))[:5]


def rank_catalog(
    query: str,
    catalog: list[CatalogProductInput],
    limit: int,
) -> tuple[ParsedIntent, list[AIResultItem]]:
    intent = parse_intent(query, catalog)
    if not catalog:
        return intent, []

    price_values = [product.price for product in catalog]
    smart_tag_map = {product.id: infer_smart_tags(product, price_values=price_values) for product in catalog}

    query_text = " ".join([query, *intent.keywords, *intent.preferred_tags, intent.category or "", intent.use_case or ""]).strip()
    documents = [_document(product, smart_tag_map[product.id]) for product in catalog]
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
    matrix = vectorizer.fit_transform(documents + [query_text])
    query_vector = matrix[-1]
    similarities = (matrix[:-1] @ query_vector.T).toarray().ravel()

    scored_items: list[AIResultItem] = []
    for index, product in enumerate(catalog):
        smart_tags = smart_tag_map[product.id]
        popularity = min(
            0.2,
            (product.purchase_count * 1.4 + product.view_count * 0.12 + product.click_count * 0.22)
            / 900,
        )
        score = (
            float(similarities[index]) * 0.52
            + _category_fit(product, intent)
            + _price_fit(product.price, intent)
            + _tag_fit(smart_tags, intent)
            + popularity
        )

        if intent.budget_max is not None and product.price > intent.budget_max * 1.35:
            score *= 0.45

        if intent.keywords and not any(keyword in _document(product, smart_tags).lower() for keyword in intent.keywords):
            score *= 0.82

        scored_items.append(
            AIResultItem(
                product_id=product.id,
                reason=_reason(product, smart_tags, intent),
                score=round(score, 4),
                smart_tags=smart_tags,
            )
        )

    scored_items.sort(key=lambda item: item.score, reverse=True)
    return intent, scored_items[:limit]


def ai_search(query: str, catalog: list[CatalogProductInput], limit: int) -> AISearchResponse:
    intent, items = rank_catalog(query, catalog, limit)
    return AISearchResponse(
        query=query,
        intent=intent,
        explanation=f"Parsed query using {intent.explanation}.",
        items=items,
    )


def shopping_assistant(message: str, catalog: list[CatalogProductInput], limit: int) -> AIAssistantResponse:
    intent, items = rank_catalog(message, catalog, limit)
    mode = _assistant_mode(message)
    follow_up_question = _assistant_follow_up(message, intent)
    suggestion_chips = _assistant_chips(intent, items, mode)
    lead = items[0] if items else None
    if lead:
        reply = (
            f"I found {len(items)} options that fit {intent.explanation}. "
            f"My top pick has tags like {', '.join(lead.smart_tags[:2]) or 'relevant'}."
        )
    else:
        reply = "I could not find a strong match, so try a broader query or remove a budget filter."

    return AIAssistantResponse(
        mode=mode,
        reply=reply,
        intent=intent,
        follow_up_question=follow_up_question,
        suggestion_chips=suggestion_chips,
        confidence=0.82 if items else 0.45,
        items=items,
    )


def review_summary(product: CatalogProductInput) -> ReviewSummaryResponse:
    raw_reviews = product.metadata.get("reviews") if isinstance(product.metadata, dict) else None
    review_texts = [review for review in raw_reviews if isinstance(review, str)] if isinstance(raw_reviews, list) else []

    if not review_texts:
        return ReviewSummaryResponse(
            product_id=product.id,
            has_review_data=False,
            summary=None,
            pros=[],
            cons=[],
        )

    joined = " ".join(review_texts)
    normalized = normalize_text(joined)
    positive_terms = {
        "battery": "battery life",
        "comfort": "comfort",
        "quality": "build quality",
        "performance": "performance",
        "fit": "fit",
        "value": "value",
        "sound": "sound quality",
    }
    negative_terms = {
        "heat": "heating",
        "heavy": "weight",
        "slow": "speed",
        "price": "price",
        "noise": "noise control",
        "small": "sizing",
    }

    def pick_terms(terms: dict[str, str]) -> list[str]:
        counts = Counter(label for key, label in terms.items() if key in normalized)
        return [label for label, _count in counts.most_common(2)]

    pros = pick_terms(positive_terms)
    cons = pick_terms(negative_terms)
    summary_parts: list[str] = []
    if pros:
        summary_parts.append(f"Users like {', '.join(pros)}")
    if cons:
        summary_parts.append(f"but some mention {', '.join(cons)}")
    summary = ", ".join(summary_parts) + "." if summary_parts else "Review feedback is still mixed and limited."

    return ReviewSummaryResponse(
        product_id=product.id,
        has_review_data=True,
        summary=summary,
        pros=pros,
        cons=cons,
    )
