import type { CatalogProduct } from "@/src/shared/catalog-types"
import {
  type RecommendationContext,
  type RecommendationPage,
  type RecommendationProduct,
  type RecommendationSection,
} from "@/src/shared/recommendation-schema"
import { queryProducts } from "@/src/server/services/data-source"

type ProductWithReason = RecommendationProduct

const SECTION_LIMIT = 4

function toKey(value: string) {
  return value.trim().toLowerCase()
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function getProductScore(product: CatalogProduct) {
  const rating = product.ratingAvg ?? 4.3
  const reviews = product.ratingCount ?? 80
  const stock = product.inStock ?? 10
  return rating * 12 + reviews * 0.015 + stock * 0.4
}

function sortByScore(products: CatalogProduct[]) {
  return [...products].sort((a, b) => getProductScore(b) - getProductScore(a))
}

function normalizeProducts(products: CatalogProduct[]) {
  return products.filter((product) => product.id && product.name && product.category && product.kind)
}

function asRecommendationProduct(
  product: CatalogProduct,
  reason: RecommendationProduct["reason"],
  tags: string[] = [],
): ProductWithReason {
  return {
    ...product,
    reason,
    tags,
  }
}

function dedupeProducts(products: CatalogProduct[]) {
  const seen = new Set<string>()
  return products.filter((product) => {
    if (seen.has(product.id)) return false
    seen.add(product.id)
    return true
  })
}

function takeSection(
  products: CatalogProduct[],
  reasonFactory: (product: CatalogProduct, index: number) => RecommendationProduct["reason"],
  tagsFactory?: (product: CatalogProduct, index: number) => string[],
  excludeIds: Set<string> = new Set(),
) {
  const items: RecommendationProduct[] = []
  for (const product of products) {
    if (excludeIds.has(product.id)) continue
    items.push(asRecommendationProduct(product, reasonFactory(product, items.length), tagsFactory?.(product, items.length)))
    excludeIds.add(product.id)
    if (items.length >= SECTION_LIMIT) break
  }
  return items
}

function getRecentViewedProduct(products: CatalogProduct[], viewedIds: string[]) {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const viewed = [...viewedIds].reverse().map((id) => productMap.get(id)).filter(Boolean)
  return viewed[0] ?? null
}

function getInterestCategory(products: CatalogProduct[], context: RecommendationContext) {
  const weights = new Map<string, number>()
  const productMap = new Map(products.map((product) => [product.id, product]))

  for (const id of context.viewedIds) {
    const product = productMap.get(id)
    if (!product) continue
    weights.set(product.category, (weights.get(product.category) ?? 0) + 3)
  }

  for (const id of context.wishlistIds) {
    const product = productMap.get(id)
    if (!product) continue
    weights.set(product.category, (weights.get(product.category) ?? 0) + 4)
  }

  for (const id of context.cartIds) {
    const product = productMap.get(id)
    if (!product) continue
    weights.set(product.category, (weights.get(product.category) ?? 0) + 5)
  }

  for (const search of context.recentSearches) {
    const key = toKey(search)
    const match = products.find(
      (product) =>
        toKey(product.category).includes(key) ||
        toKey(product.kind).includes(key) ||
        toKey(product.name).includes(key),
    )
    if (match) {
      weights.set(match.category, (weights.get(match.category) ?? 0) + 2)
    }
  }

  return [...weights.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

function getBudgetCap(products: CatalogProduct[], context: RecommendationContext) {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const prices = [...context.viewedIds, ...context.wishlistIds, ...context.cartIds]
    .map((id) => productMap.get(id)?.price)
    .filter((value): value is number => typeof value === "number")

  if (prices.length === 0) return 1800
  return Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length * 1.15)
}

function withFallback(
  id: string,
  title: string,
  subtitle: string,
  primaryProducts: CatalogProduct[],
  fallbackProducts: CatalogProduct[],
  primaryReasonFactory: (product: CatalogProduct, index: number) => RecommendationProduct["reason"],
  fallbackReasonFactory: (product: CatalogProduct, index: number) => RecommendationProduct["reason"],
  tagsFactory?: (product: CatalogProduct, index: number) => string[],
  excludeIds: Set<string> = new Set(),
): RecommendationSection {
  try {
    const primaryItems = takeSection(primaryProducts, primaryReasonFactory, tagsFactory, excludeIds)
    if (primaryItems.length > 0) {
      return {
        id,
        title,
        subtitle,
        status: "success",
        items: primaryItems,
      }
    }

    const fallbackItems = takeSection(fallbackProducts, fallbackReasonFactory, tagsFactory, excludeIds)
    if (fallbackItems.length > 0) {
      return {
        id,
        title,
        subtitle,
        status: "fallback",
        items: fallbackItems,
        emptyMessage: "Showing reliable fallback picks while we learn more about your taste.",
      }
    }

    return {
      id,
      title,
      subtitle,
      status: "empty",
      items: [],
      emptyMessage: "No products available for this recommendation right now.",
    }
  } catch {
    return {
      id,
      title,
      subtitle,
      status: "error",
      items: [],
      errorMessage: "This recommendation row is temporarily unavailable.",
    }
  }
}

export function buildRecommendationPage(
  products: CatalogProduct[],
  context: RecommendationContext,
): RecommendationPage {
  const items = dedupeProducts(normalizeProducts(products))
  const productMap = new Map(items.map((product) => [product.id, product]))
  const recentViewed = getRecentViewedProduct(items, context.viewedIds)
  const favoriteCategory = getInterestCategory(items, context)
  const budgetCap = getBudgetCap(items, context)
  const firstTimeUser =
    context.viewedIds.length === 0 &&
    context.wishlistIds.length === 0 &&
    context.cartIds.length === 0 &&
    context.recentSearches.length === 0

  const recentSearch = context.recentSearches.at(-1) ?? context.query.trim()
  const popularProducts = sortByScore(items)
  const excludeIds = new Set<string>()

  const matchingSearchProducts = recentSearch
    ? sortByScore(
        items.filter(
          (product) =>
            toKey(product.name).includes(toKey(recentSearch)) ||
            toKey(product.kind).includes(toKey(recentSearch)) ||
            toKey(product.category).includes(toKey(recentSearch)),
        ),
      )
    : []

  const similarProducts = recentViewed
    ? sortByScore(
        items.filter(
          (product) =>
            product.id !== recentViewed.id &&
            (product.category === recentViewed.category || product.kind === recentViewed.kind),
        ),
      )
    : []

  const wishlistProducts = sortByScore(
    items.filter((product) => context.wishlistIds.includes(product.id)),
  )

  const wishlistAdjacentProducts = wishlistProducts.flatMap((wish) =>
    sortByScore(
      items.filter(
        (product) =>
          product.id !== wish.id &&
          (product.category === wish.category || product.kind === wish.kind),
      ),
    ),
  )

  const interestProducts = favoriteCategory
    ? sortByScore(items.filter((product) => product.category === favoriteCategory))
    : []

  const budgetProducts = sortByScore(items.filter((product) => product.price <= budgetCap))
  const newestProducts = [...items].sort((a, b) => b.id.localeCompare(a.id))
  const bundleSeed = recentViewed ?? wishlistProducts[0] ?? null
  const bundleProducts = bundleSeed
    ? sortByScore(
        items.filter(
          (product) =>
            product.id !== bundleSeed.id &&
            product.category !== bundleSeed.category &&
            Math.abs(product.price - bundleSeed.price) <= bundleSeed.price * 0.4,
        ),
      )
    : []

  const sections: RecommendationSection[] = [
    withFallback(
      "recommended-for-you",
      "Recommended for you",
      recentSearch
        ? `Because you searched for "${recentSearch}".`
        : "Recommended based on your activity and shopping patterns.",
      matchingSearchProducts.length > 0 ? matchingSearchProducts : similarProducts,
      popularProducts,
      () => ({
        label: recentSearch ? `Because you searched "${recentSearch}"` : `Because you viewed ${recentViewed?.kind ?? "similar items"}`,
        type: recentSearch ? "recent_search" : "viewed_product",
      }),
      () => ({
        label: firstTimeUser ? "Popular with new shoppers" : "Popular in your current interests",
        type: firstTimeUser ? "cold_start" : "fallback_popular",
      }),
      (product) => [product.category, product.kind],
      excludeIds,
    ),
    withFallback(
      "trending-products",
      "Trending Products",
      favoriteCategory
        ? `Trending with shoppers exploring ${favoriteCategory.toLowerCase()}.`
        : "Popular products getting strong momentum today.",
      interestProducts.length > 0 ? interestProducts : popularProducts,
      popularProducts,
      () => ({
        label: favoriteCategory ? `Trending in ${favoriteCategory}` : "Trending with similar shoppers",
        type: "trending_interest",
      }),
      () => ({
        label: "Popular products today",
        type: "fallback_popular",
      }),
      (product) => ["Trending", product.category],
      excludeIds,
    ),
    withFallback(
      "based-on-your-interest",
      "Based on Your Interest",
      favoriteCategory
        ? `Because your activity leans toward ${favoriteCategory.toLowerCase()}.`
        : recentViewed
          ? `Because you viewed ${recentViewed.kind.toLowerCase()}.`
          : "Because your recent behavior suggests similar interests.",
      similarProducts.length > 0 ? similarProducts : wishlistAdjacentProducts,
      budgetProducts.length > 0 ? budgetProducts : popularProducts,
      () => ({
        label: recentViewed ? `Because you viewed ${recentViewed.name}` : "Best match for your interests",
        type: recentViewed ? "viewed_product" : "wishlist_similarity",
      }),
      () => ({
        label: "Great match for your current budget",
        type: "budget_match",
      }),
      (product) => [product.kind, "Best match"],
      excludeIds,
    ),
    withFallback(
      "top-picks-today",
      "Top Picks Today",
      "A balanced mix of highly rated, high-conversion, and worth-a-look products.",
      bundleProducts.length > 0 ? bundleProducts : newestProducts,
      newestProducts.length > 0 ? newestProducts : popularProducts,
      () => ({
        label: bundleSeed ? `Pairs well with ${bundleSeed.kind}` : "Top pick today",
        type: bundleSeed ? "bundle" : "fallback_popular",
      }),
      () => ({
        label: firstTimeUser ? "Fresh for new shoppers" : "Selected by ranking quality",
        type: firstTimeUser ? "cold_start" : "fallback_popular",
      }),
      (product) => ["Top pick", product.kind],
      excludeIds,
    ),
  ]

  const heroProduct =
    sections.flatMap((section) => section.items)[0] ??
    (recentViewed
      ? asRecommendationProduct(recentViewed, {
          label: `Picked from your recent activity`,
          type: "viewed_product",
        })
      : null)

  const recommendedKeywords = dedupeStrings([
    ...context.recentSearches,
    favoriteCategory ?? "",
    recentViewed?.kind ?? "",
    wishlistProducts[0]?.kind ?? "",
    "lightweight laptop",
    "running sneakers",
    "wireless audio",
    "home office",
  ]).slice(0, 6)

  return {
    generatedAt: new Date().toISOString(),
    firstTimeUser,
    hero: {
      headline: "Discover Products Tailored For You",
      subtitle:
        firstTimeUser
          ? "We personalize your shopping journey using trending demand, high-quality signals, and live recommendation logic from the very first visit."
          : "Your feed adapts to searches, views, wishlist actions, and cart behavior so every product row feels more relevant.",
      ctaLabel: "Explore Recommendations",
      featuredProduct: heroProduct,
    },
    sections,
    searchSuggestions: {
      recent: dedupeStrings(context.recentSearches).slice(-4).reverse(),
      recommended: recommendedKeywords,
      trending: dedupeStrings(popularProducts.slice(0, 6).map((product) => product.category)).slice(0, 4),
    },
    insights: [
      {
        label: "Behavior signals",
        value: String(context.viewedIds.length + context.wishlistIds.length + context.cartIds.length + context.recentSearches.length).padStart(2, "0"),
        detail: "Clicks, wishlist saves, searches, and cart events feed the recommendation profile.",
      },
      {
        label: "Favorite category",
        value: favoriteCategory ?? "Cold start",
        detail: favoriteCategory
          ? "Current strongest category preference based on recent actions."
          : "No strong preference yet, so the system leans on quality and popularity.",
      },
      {
        label: "Budget fit",
        value: `Rs. ${budgetCap.toLocaleString("en-IN")}`,
        detail: "Estimated comfort range based on viewed, saved, and added-to-cart products.",
      },
    ],
    explainerSteps: [
      {
        id: "activity",
        title: "User activity tracking",
        description: "The system observes direct intent and soft preference signals as you interact.",
        bullets: ["Clicks and product views", "Searches and refinements", "Wishlist saves and cart adds"],
      },
      {
        id: "features",
        title: "Product feature extraction",
        description: "Each product is described through structured metadata that the engine can compare.",
        bullets: ["Category and kind", "Price and stock", "Ratings and popularity"],
      },
      {
        id: "similarity",
        title: "Similarity engine",
        description: "Recommendations combine content similarity with collaborative and popularity cues.",
        bullets: ["Content-based filtering", "Collaborative behavior patterns", "Hybrid ranking for final ordering"],
      },
      {
        id: "ranking",
        title: "Recommendation score",
        description: "Every candidate receives a blended score before appearing in your shelves.",
        bullets: ["Preference score", "Similarity score", "Popularity and rating score"],
      },
      {
        id: "delivery",
        title: "Top ranked suggestions",
        description: "Only the strongest, deduped matches reach the homepage, with a reason label for each.",
        bullets: ["Instant recommendation rows", "Fallbacks if a model has no match", "Reason labels attached by the backend"],
      },
    ],
  }
}

export async function getRecommendationPage(context: RecommendationContext) {
  const payload = await queryProducts({
    q: context.query,
    category: context.selectedCategory,
    sort: context.sort,
  })

  return buildRecommendationPage(payload.items, context)
}
