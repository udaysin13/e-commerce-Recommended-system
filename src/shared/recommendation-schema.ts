import { z } from "zod"
import { productSortValues } from "@/src/server/validation/api-schemas"

export const recommendationReasonSchema = z.object({
  label: z.string().trim().min(1),
  type: z.enum([
    "recent_search",
    "viewed_product",
    "wishlist_similarity",
    "bundle",
    "trending_interest",
    "favorite_category",
    "budget_match",
    "cold_start",
    "fallback_popular",
  ]),
})

export const recommendationProductSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  kind: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().min(1),
  images: z.array(z.string().min(1)).default([]),
  price: z.number().finite(),
  slug: z.string().optional(),
  description: z.string().optional(),
  inStock: z.number().optional(),
  ratingAvg: z.number().optional(),
  ratingCount: z.number().optional(),
  reason: recommendationReasonSchema,
  tags: z.array(z.string()).default([]),
})

export const recommendationSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  status: z.enum(["success", "fallback", "empty", "error"]),
  items: z.array(recommendationProductSchema),
  emptyMessage: z.string().optional(),
  errorMessage: z.string().optional(),
})

export const searchSuggestionGroupSchema = z.object({
  recent: z.array(z.string()),
  recommended: z.array(z.string()),
  trending: z.array(z.string()),
})

export const heroRecommendationSchema = z.object({
  headline: z.string().min(1),
  subtitle: z.string().min(1),
  ctaLabel: z.string().min(1),
  featuredProduct: recommendationProductSchema.nullable(),
})

export const insightCardSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  detail: z.string().min(1),
})

export const explainerStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  bullets: z.array(z.string()).min(1),
})

export const recommendationPageSchema = z.object({
  generatedAt: z.string().min(1),
  firstTimeUser: z.boolean(),
  hero: heroRecommendationSchema,
  sections: z.array(recommendationSectionSchema),
  searchSuggestions: searchSuggestionGroupSchema,
  insights: z.array(insightCardSchema),
  explainerSteps: z.array(explainerStepSchema),
})

export const recommendationContextSchema = z.object({
  query: z.string().trim().max(120).default(""),
  selectedCategory: z.string().trim().default("All"),
  sort: z.enum(productSortValues).default("Newest"),
  recentSearches: z.array(z.string().trim().min(1)).max(8).default([]),
  viewedIds: z.array(z.string().trim().min(1)).max(12).default([]),
  wishlistIds: z.array(z.string().trim().min(1)).max(20).default([]),
  cartIds: z.array(z.string().trim().min(1)).max(20).default([]),
})

export type RecommendationContext = z.infer<typeof recommendationContextSchema>
export type RecommendationPage = z.infer<typeof recommendationPageSchema>
export type RecommendationSection = z.infer<typeof recommendationSectionSchema>
export type RecommendationProduct = z.infer<typeof recommendationProductSchema>
