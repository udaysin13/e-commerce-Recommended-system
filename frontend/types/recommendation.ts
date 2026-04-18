import type { Category } from "./product";

export type RecommendationScore = {
  content: number;
  collaborative: number;
  popularity: number;
  hybrid: number;
};

export type RecommendedProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  averageRating: number;
  category: Category;
};

export type RecommendationItem = {
  product: RecommendedProduct;
  score: RecommendationScore;
  reason: string;
};

export type RecommendationResult = {
  strategy: string;
  source: "fastapi" | "fallback";
  count: number;
  items: RecommendationItem[];
};
