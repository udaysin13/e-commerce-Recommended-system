import type { Pagination, Product } from "./product";

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

export type AISearchResponse = {
  query: string;
  explanation: string;
  intent: AIParsedIntent;
  items: Product[];
  pagination: Pagination;
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
    product: Product;
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
