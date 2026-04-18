import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from app.models.recommendation import Interaction


class CollaborativeRecommender:
    def __init__(self, interactions: list[Interaction]) -> None:
        self.interactions = interactions
        self.interaction_frame = pd.DataFrame(
            [
                {
                    "user_id": interaction.user_id,
                    "product_id": interaction.product_id,
                    "signal": interaction.weight * interaction.quantity,
                }
                for interaction in interactions
                if interaction.user_id
            ]
        )
        self.matrix = self._build_matrix()

    def _build_matrix(self) -> pd.DataFrame:
        if self.interaction_frame.empty:
            return pd.DataFrame()

        return self.interaction_frame.pivot_table(
            index="user_id",
            columns="product_id",
            values="signal",
            aggfunc="sum",
            fill_value=0,
        )

    def user_scores(self, user_id: str) -> dict[str, float]:
        if self.matrix.empty or user_id not in self.matrix.index:
            return {}

        user_vectors = self.matrix.to_numpy()
        user_position = self.matrix.index.get_loc(user_id)
        similarities = cosine_similarity([user_vectors[user_position]], user_vectors)[0]
        target_user_vector = self.matrix.loc[user_id]
        scores: dict[str, float] = {}

        for other_position, similarity in enumerate(similarities):
            other_user_id = self.matrix.index[other_position]

            if other_user_id == user_id or similarity <= 0:
                continue

            other_user_vector = self.matrix.loc[other_user_id]

            for product_id, value in other_user_vector.items():
                product_signal = float(value)
                target_signal = float(target_user_vector[product_id])

                if product_signal <= 0 or target_signal > 0:
                    continue

                scores[str(product_id)] = scores.get(str(product_id), 0) + float(
                    similarity * product_signal
                )

        max_score = max(scores.values(), default=1)
        return {product_id: score / max_score for product_id, score in scores.items()}

    def interacted_product_ids(self, user_id: str) -> list[str]:
        if self.matrix.empty or user_id not in self.matrix.index:
            return []

        user_vector = self.matrix.loc[user_id]
        return [str(product_id) for product_id, value in user_vector.items() if float(value) > 0]
