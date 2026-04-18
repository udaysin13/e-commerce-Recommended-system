import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.models.recommendation import Product


class ContentBasedRecommender:
    def __init__(self, products: list[Product]) -> None:
        self.products = products
        self.product_index = {product.id: index for index, product in enumerate(products)}
        self.product_frame = pd.DataFrame([product.model_dump() for product in products])
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.similarity_matrix = self._build_similarity_matrix()

    def _product_text(self, product: Product) -> str:
        tags = product.metadata.get("tags", [])
        tag_text = " ".join(tags) if isinstance(tags, list) else ""
        return " ".join(
            [
                product.title,
                product.category,
                product.brand or "",
                product.description or "",
                tag_text,
            ]
        )

    def _build_similarity_matrix(self):
        documents = [self._product_text(product) for product in self.products]
        tfidf_matrix = self.vectorizer.fit_transform(documents)
        return cosine_similarity(tfidf_matrix)

    def similar_scores(self, product_id: str) -> dict[str, float]:
        if product_id not in self.product_index:
            return {}

        source_index = self.product_index[product_id]
        scores = self.similarity_matrix[source_index]

        return {
            product.id: float(scores[index])
            for index, product in enumerate(self.products)
            if product.id != product_id
        }

    def user_profile_scores(self, product_ids: list[str]) -> dict[str, float]:
        known_ids = [product_id for product_id in product_ids if product_id in self.product_index]

        if not known_ids:
            return {}

        total_scores: dict[str, float] = {}

        for product_id in known_ids:
            for candidate_id, score in self.similar_scores(product_id).items():
                total_scores[candidate_id] = total_scores.get(candidate_id, 0) + score

        max_score = max(total_scores.values(), default=1)
        return {product_id: score / max_score for product_id, score in total_scores.items()}
