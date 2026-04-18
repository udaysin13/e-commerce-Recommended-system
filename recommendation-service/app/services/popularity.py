from datetime import UTC, datetime, timedelta

from app.models.recommendation import Interaction


class PopularityRecommender:
    def __init__(self, interactions: list[Interaction]) -> None:
        self.interactions = interactions

    def trending_scores(self, days: int = 14) -> dict[str, float]:
        cutoff = datetime.now(UTC) - timedelta(days=days)
        scores: dict[str, float] = {}

        for interaction in self.interactions:
            if interaction.created_at < cutoff:
                continue

            age_days = max((datetime.now(UTC) - interaction.created_at).days, 0)
            recency_boost = 1 / (1 + age_days)
            scores[interaction.product_id] = scores.get(interaction.product_id, 0) + (
                interaction.weight * interaction.quantity * recency_boost
            )

        max_score = max(scores.values(), default=1)
        return {product_id: score / max_score for product_id, score in scores.items()}
