import type { Category } from "./product";

export type RecommendationMood =
  | "budget"
  | "premium"
  | "trending"
  | "value"
  | "new";

export type RecommendationExperience = "personalized" | "explore";

export type RecommendationBadge =
  | "Trending"
  | "Best Seller"
  | "Popular in this category"
  | "Frequently Viewed"
  | "Top Rated";

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
  stockQuantity: number;
  imageUrl: string | null;
  averageRating: number;
  ratingCount: number;
  viewCount: number;
  clickCount: number;
  cartCount: number;
  purchaseCount: number;
  category: Category;
};

export type RecommendationItem = {
  product: RecommendedProduct;
  score: RecommendationScore;
  reason: string;
  badges: RecommendationBadge[];
};

export type RecommendationResult = {
  strategy: string;
  source: "local" | "fastapi" | "fallback";
  mode: RecommendationMood;
  experience: RecommendationExperience;
  count: number;
  items: RecommendationItem[];
};

export type SmartBundleResult = {
  title: string;
  description: string;
  anchorProduct: RecommendedProduct;
  totalBundlePrice: number;
  items: RecommendationItem[];
};

export type UserInsightMetric = {
  label: string;
  value: string;
  note: string;
};

export type UserShoppingInsights = {
  shopperProfile: string;
  profileReason: string;
  averageSpend: number;
  spendingRangeLabel: string;
  mostViewedCategory: string;
  mostPurchasedCategory: string;
  favoriteBrand: string;
  highlightMetrics: UserInsightMetric[];
  recommendationModes: RecommendationMood[];
};

export type SeasonalFestival = {
  id: string;
  name: string;
  icon: string;
  date: string;
  countdownDays: number;
  tagline: string;
  saleLabel: string | null;
};

export type SeasonalRecommendationSection = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: string;
  items: RecommendationItem[];
};

export type SeasonalRecommendationResponse = {
  currentSeason: string;
  activeFestival: SeasonalFestival | null;
  sections: SeasonalRecommendationSection[];
};
