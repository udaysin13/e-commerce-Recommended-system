from app.data.sample_data import get_sample_interactions, get_sample_products
from app.models.recommendation import Product, RecommendationItem, RecommendationResponse, RecommendationScore
from app.services.collaborative import CollaborativeRecommender
from app.services.content_based import ContentBasedRecommender
from app.services.popularity import PopularityRecommender


class HybridRecommender:
    def __init__(self) -> None:
        self.products = get_sample_products()
        self.interactions = get_sample_interactions()
        self.product_by_id = {product.id: product for product in self.products}
        self.content = ContentBasedRecommender(self.products)
        self.collaborative = CollaborativeRecommender(self.interactions)
        self.popularity = PopularityRecommender(self.interactions)

    def _item(
        self,
        product: Product,
        score: RecommendationScore,
        reason: str,
    ) -> RecommendationItem:
        return RecommendationItem(
            product_id=product.id,
            title=product.title,
            category=product.category,
            brand=product.brand,
            price=product.price,
            rating=product.rating,
            score=score,
            reason=reason,
        )

    def _rank(
        self,
        content_scores: dict[str, float] | None = None,
        collaborative_scores: dict[str, float] | None = None,
        popularity_scores: dict[str, float] | None = None,
        exclude: set[str] | None = None,
        limit: int = 10,
    ) -> list[RecommendationItem]:
        content_scores = content_scores or {}
        collaborative_scores = collaborative_scores or {}
        popularity_scores = popularity_scores or {}
        exclude = exclude or set()
        candidate_ids = set(content_scores) | set(collaborative_scores) | set(popularity_scores)
        ranked: list[RecommendationItem] = []

        for product_id in candidate_ids:
            if product_id in exclude or product_id not in self.product_by_id:
                continue

            content_score = content_scores.get(product_id, 0)
            collaborative_score = collaborative_scores.get(product_id, 0)
            popularity_score = popularity_scores.get(product_id, 0)
            hybrid_score = (
                0.35 * content_score
                + 0.45 * collaborative_score
                + 0.2 * popularity_score
            )

            if hybrid_score == 0:
                hybrid_score = 0.05 * self.product_by_id[product_id].rating

            score = RecommendationScore(
                content=round(content_score, 4),
                collaborative=round(collaborative_score, 4),
                popularity=round(popularity_score, 4),
                hybrid=round(hybrid_score, 4),
            )
            reason = self._reason(score)
            ranked.append(self._item(self.product_by_id[product_id], score, reason))

        return sorted(ranked, key=lambda item: item.score.hybrid, reverse=True)[:limit]

    def _reason(self, score: RecommendationScore) -> str:
        best_signal = max(
            [
                ("similar product content", score.content),
                ("similar user behavior", score.collaborative),
                ("recent popularity", score.popularity),
            ],
            key=lambda item: item[1],
        )
        return f"Ranked from {best_signal[0]}"

    def similar_products(self, product_id: str, limit: int) -> RecommendationResponse:
        content_scores = self.content.similar_scores(product_id)
        popularity_scores = self.popularity.trending_scores()
        items = self._rank(
            content_scores=content_scores,
            popularity_scores=popularity_scores,
            exclude={product_id},
            limit=limit,
        )
        return RecommendationResponse(strategy="content_similarity", count=len(items), items=items)

    def user_recommendations(self, user_id: str, limit: int) -> RecommendationResponse:
        interacted_ids = self.collaborative.interacted_product_ids(user_id)

        if not interacted_ids:
            return self.trending(limit)

        content_scores = self.content.user_profile_scores(interacted_ids)
        collaborative_scores = self.collaborative.user_scores(user_id)
        popularity_scores = self.popularity.trending_scores()
        items = self._rank(
            content_scores=content_scores,
            collaborative_scores=collaborative_scores,
            popularity_scores=popularity_scores,
            exclude=set(interacted_ids),
            limit=limit,
        )
        return RecommendationResponse(strategy="hybrid_user", count=len(items), items=items)

    def trending(self, limit: int) -> RecommendationResponse:
        popularity_scores = self.popularity.trending_scores()
        items = self._rank(popularity_scores=popularity_scores, limit=limit)
        return RecommendationResponse(strategy="popularity_trending", count=len(items), items=items)


recommender = HybridRecommender()
