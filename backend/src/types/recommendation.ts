export type RecommendationScore = {
  content: number;
  collaborative: number;
  popularity: number;
  hybrid: number;
};

export type RecommendationProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  averageRating: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export type RecommendationItem = {
  product: RecommendationProduct;
  score: RecommendationScore;
  reason: string;
};

export type RecommendationResult = {
  strategy: string;
  source: "fastapi" | "fallback";
  count: number;
  items: RecommendationItem[];
};

export type FastApiRecommendationItem = {
  product_id: string;
  title: string;
  category: string;
  brand: string | null;
  price: number;
  rating: number;
  score: RecommendationScore;
  reason: string;
};

export type FastApiRecommendationResponse = {
  strategy: string;
  count: number;
  items: FastApiRecommendationItem[];
};
