import type { PaginatedProductsResponse, ProductResponse } from "./product.js";

export type AICatalogProduct = {
  id: string;
  title: string;
  category: string;
  brand: string | null;
  description: string | null;
  price: number;
  rating: number;
  purchase_count: number;
  view_count: number;
  click_count: number;
  tags: string[];
  metadata: Record<string, unknown>;
};

export type AIParsedIntent = {
  category: string | null;
  budget_max: number | null;
  budget_min: number | null;
  keywords: string[];
  preferred_tags: string[];
  use_case: string | null;
  audience: string | null;
  explanation: string;
};

export type AIScoredItem = {
  product_id: string;
  reason: string;
  score: number;
  smart_tags: string[];
};

export type AISearchResult = PaginatedProductsResponse & {
  query: string;
  explanation: string;
  intent: AIParsedIntent;
  items: ProductResponse[];
};

export type AIAssistantResult = {
  sessionId: string;
  mode: "search" | "compare" | "bundle" | "gift" | "seasonal" | "trending" | "similar";
  reply: string;
  intent: AIParsedIntent;
  followUpQuestion: string | null;
  suggestionChips: string[];
  confidence: number;
  items: Array<{
    product: ProductResponse;
    reason: string;
    score: number;
    smartTags: string[];
  }>;
};

export type ProductReviewSummary = {
  productId: string;
  hasReviewData: boolean;
  summary: string | null;
  pros: string[];
  cons: string[];
};
