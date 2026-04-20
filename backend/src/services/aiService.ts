import type { Prisma } from "../generated/prisma/client.js";
import { ProductInteractionType } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import type {
  AIAssistantResult,
  AICatalogProduct,
  AIParsedIntent,
  AIScoredItem,
  AISearchResult,
  ProductReviewSummary,
} from "../types/ai.js";
import type { ProductResponse } from "../types/product.js";

const productInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

const toNumber = (value: { toString(): string } | null): number | null => {
  return value === null ? null : Number(value.toString());
};

const deriveSmartTags = (product: ProductWithCategory): string[] => {
  const tags: string[] = [];
  const price = toNumber(product.price) ?? 0;
  const rating = toNumber(product.averageRating) ?? 0;
  const text = `${product.name} ${product.description ?? ""} ${product.shortDescription ?? ""} ${product.category.slug} ${product.brand ?? ""} ${product.tags.join(" ")}`.toLowerCase();

  if (price <= 50) tags.push("Budget");
  if (price >= 140) tags.push("Premium");
  if (product.purchaseCount >= 140 || product.viewCount >= 1200) tags.push("Trending");
  if (rating >= 4.5 && price <= 120) tags.push("Best Value");
  if (/(gaming|mechanical|monitor|webcam)/.test(text)) tags.push("Gaming");
  if (/(office|workspace|desk|laptop|keyboard|coding)/.test(text)) tags.push("Office Use");
  if (/(wallet|bag|watch|polo|hoodie|gift|festive)/.test(text)) tags.push("Festive Wear");

  return tags.slice(0, 4);
};

const getPopularityBadges = (product: ProductWithCategory): string[] => {
  const badges: string[] = [];

  if (product.purchaseCount >= 140) badges.push("Best Seller");
  if (product.viewCount >= 1200 || product.clickCount >= 420) badges.push("Trending");
  if (product.purchaseCount >= 90 && (toNumber(product.averageRating) ?? 0) >= 4.3) {
    badges.push("Popular in this category");
  }
  if (product.viewCount >= 900) badges.push("Frequently Viewed");

  return badges;
};

const mapProduct = (product: ProductWithCategory): ProductResponse => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  sku: product.sku,
  description: product.description,
  shortDescription: product.shortDescription,
  brand: product.brand,
  price: toNumber(product.price) ?? 0,
  compareAtPrice: toNumber(product.compareAtPrice),
  currency: product.currency,
  stockQuantity: product.stockQuantity,
  imageUrl: product.imageUrl,
  imageUrls: product.imageUrls,
  tags: product.tags,
  attributes: product.attributes,
  averageRating: toNumber(product.averageRating) ?? 0,
  ratingCount: product.ratingCount,
  viewCount: product.viewCount,
  clickCount: product.clickCount,
  cartCount: product.cartCount,
  purchaseCount: product.purchaseCount,
  isFeatured: product.isFeatured,
  popularityBadges: getPopularityBadges(product),
  smartTags: deriveSmartTags(product),
  recommendationReason: null,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  category: product.category,
});

const toCatalogProduct = (product: ProductWithCategory): AICatalogProduct => ({
  id: product.id,
  title: product.name,
  category: product.category.slug,
  brand: product.brand,
  description: product.description ?? product.shortDescription,
  price: toNumber(product.price) ?? 0,
  rating: toNumber(product.averageRating) ?? 0,
  purchase_count: product.purchaseCount,
  view_count: product.viewCount,
  click_count: product.clickCount,
  tags: [...product.tags, ...deriveSmartTags(product).map((tag) => tag.toLowerCase())],
  metadata: typeof product.attributes === "object" && product.attributes ? (product.attributes as Record<string, unknown>) : {},
});

const requestAIService = async <T>(path: string, payload: unknown): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.recommendationServiceTimeoutMs);

  try {
    const response = await fetch(`${env.recommendationServiceUrl.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

const getCatalog = async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: productInclude,
    orderBy: [{ purchaseCount: "desc" }, { viewCount: "desc" }, { averageRating: "desc" }],
    take: 200,
  });

  return {
    products,
    productById: new Map(products.map((product) => [product.id, product])),
    catalog: products.map(toCatalogProduct),
  };
};

const buildOrderedProducts = (
  scoredItems: AIScoredItem[],
  productById: Map<string, ProductWithCategory>,
) => {
  const ordered: ProductResponse[] = [];

  for (const item of scoredItems) {
    const product = productById.get(item.product_id);
    if (!product) continue;

    ordered.push({
      ...mapProduct(product),
      smartTags: item.smart_tags,
      recommendationReason: item.reason,
    });
  }

  return ordered;
};

type SearchServiceResponse = {
  query: string;
  intent: AIParsedIntent;
  explanation: string;
  items: AIScoredItem[];
};

type AssistantServiceResponse = {
  reply: string;
  intent: AIParsedIntent;
  items: AIScoredItem[];
  follow_up_question?: string | null;
  suggestion_chips?: string[];
  confidence?: number;
  mode?: AIAssistantResult["mode"];
};

type ReviewSummaryServiceResponse = {
  product_id: string;
  has_review_data: boolean;
  summary: string | null;
  pros: string[];
  cons: string[];
};

type AssistantProfile = {
  topCategories: string[];
  favoriteBrands: string[];
  typicalBudget: number | null;
};

type AssistantContext = {
  sessionId: string;
  lastMessage: string;
  lastIntent: AIParsedIntent;
  lastItemProductIds: string[];
  updatedAt: number;
};

type AssistantMode = AIAssistantResult["mode"];

const assistantContextStore = new Map<string, AssistantContext>();
const ASSISTANT_CONTEXT_TTL_MS = 1000 * 60 * 45;

const FALLBACK_CATEGORY_ALIASES: Record<string, string[]> = {
  electronics: ["electronics", "electronic", "phone", "phones", "laptop", "laptops", "headphones", "earbuds", "audio", "tech", "coding"],
  fashion: ["fashion", "clothes", "clothing", "t-shirt", "shirt", "shirts", "jeans", "hoodie", "men", "women"],
  footwear: ["footwear", "shoe", "shoes", "sneaker", "sneakers", "running shoes", "loafers", "running"],
  "sports-fitness": ["sports", "fitness", "gym", "workout", "training", "running", "protein", "recovery"],
  "home-kitchen": ["home", "kitchen", "coffee", "lamp", "furniture", "decor"],
  beauty: ["beauty", "skincare", "makeup", "serum", "cream", "cosmetics"],
  accessories: ["accessories", "accessory", "bag", "wallet", "watch", "belt", "sunglasses"],
  books: ["books", "book", "reading", "novel"],
};

const normalizeFallbackText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();

const createSessionId = () =>
  `assist_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const cleanupAssistantContexts = () => {
  const cutoff = Date.now() - ASSISTANT_CONTEXT_TTL_MS;
  for (const [sessionId, context] of assistantContextStore.entries()) {
    if (context.updatedAt < cutoff) {
      assistantContextStore.delete(sessionId);
    }
  }
};

const detectAssistantMode = (message: string): AssistantMode => {
  const normalized = normalizeFallbackText(message);

  if (/\b(compare|vs|versus|difference)\b/.test(normalized)) return "compare";
  if (/\b(bundle|together|combo|kit|accessories)\b/.test(normalized)) return "bundle";
  if (/\b(gift|present|for my sister|for my brother|for mom|for dad)\b/.test(normalized)) return "gift";
  if (/\b(winter|summer|rainy|monsoon|diwali|holi|eid|christmas|festival)\b/.test(normalized)) return "seasonal";
  if (/\b(trending|popular|best seller|bestseller)\b/.test(normalized)) return "trending";
  if (/\b(similar|like this|like that|same as|something similar)\b/.test(normalized)) return "similar";
  return "search";
};

const isFollowUpMessage = (message: string) => {
  const normalized = normalizeFallbackText(message);
  return /^(only|just|same|similar|those|these|ones|that|this)\b/.test(normalized)
    || /\b(ones|those|these|similar|same)\b/.test(normalized);
};

const mergeIntentWithContext = (
  intent: AIParsedIntent,
  context?: AssistantContext,
): AIParsedIntent => {
  if (!context) return intent;

  return {
    category: intent.category ?? (isFollowUpMessage(context.lastMessage) ? context.lastIntent.category : context.lastIntent.category),
    budget_max: intent.budget_max ?? context.lastIntent.budget_max,
    budget_min: intent.budget_min ?? context.lastIntent.budget_min,
    keywords: [...new Set([...context.lastIntent.keywords, ...intent.keywords])].slice(0, 10),
    preferred_tags: [...new Set([...context.lastIntent.preferred_tags, ...intent.preferred_tags])].slice(0, 6),
    use_case: intent.use_case ?? context.lastIntent.use_case,
    audience: intent.audience ?? context.lastIntent.audience,
    explanation:
      intent.explanation !== "local intent parsing fallback"
        ? intent.explanation
        : `refined from recent session context and ${context.lastIntent.explanation}`,
  };
};

const generateSuggestionChips = (
  mode: AssistantMode,
  intent: AIParsedIntent,
  items: AIScoredItem[],
): string[] => {
  const chips = new Set<string>();

  if (!intent.budget_max) chips.add("Under 2000");
  if (intent.category === "electronics") {
    chips.add("Budget");
    chips.add("Premium");
    chips.add("Trending");
  }
  if (intent.category === "footwear") {
    chips.add("Running");
    chips.add("Best Value");
    chips.add("Similar Products");
  }
  if (mode === "gift") chips.add("Gift Ideas");
  if (mode === "bundle") chips.add("Smart Bundle");
  if (mode === "seasonal") chips.add("Seasonal Picks");
  if (items.some((item) => item.smart_tags.includes("Trending"))) chips.add("Trending");
  if (items.some((item) => item.smart_tags.includes("Premium"))) chips.add("Premium");
  if (items.some((item) => item.smart_tags.includes("Budget"))) chips.add("Budget");

  return [...chips].slice(0, 5);
};

const buildFollowUpQuestion = (message: string, intent: AIParsedIntent): string | null => {
  const normalized = normalizeFallbackText(message);

  if (intent.category === "electronics" && !intent.use_case && !intent.budget_max) {
    return "Do you want gaming, office, music, or budget-focused electronics?";
  }

  if ((intent.category === "fashion" || /\b(clothes|fashion|wear)\b/.test(normalized)) && !intent.audience) {
    return "Should I narrow this to men, women, winter wear, or festive styles?";
  }

  if (intent.category === "footwear" && !intent.use_case) {
    return "Should I focus on running, casual, formal, or everyday shoes?";
  }

  if (!intent.category && !intent.budget_max && intent.keywords.length <= 1) {
    return "Tell me the category or budget and I can narrow this down fast.";
  }

  return null;
};

const summarizeProfile = (profile: AssistantProfile | null) => {
  if (!profile) return null;

  const parts: string[] = [];
  if (profile.topCategories[0]) parts.push(`recently into ${profile.topCategories[0].replace(/-/g, " ")}`);
  if (profile.typicalBudget !== null) parts.push(`usually shops around ${Math.round(profile.typicalBudget)}`);

  return parts.length ? parts.join(" and ") : null;
};

const fallbackIntent = (query: string): AIParsedIntent => {
  const normalized = normalizeFallbackText(query);
  const tokens = normalized.split(" ").filter(Boolean);
  const underMatch = normalized.match(/(?:under|below|max|less than)\s+(\d+(?:\.\d+)?)/);
  const overMatch = normalized.match(/(?:above|over|min|more than)\s+(\d+(?:\.\d+)?)/);

  const category =
    Object.entries(FALLBACK_CATEGORY_ALIASES).find(([, aliases]) =>
      aliases.some((alias) => normalized.includes(alias)),
    )?.[0] ?? null;

  const preferredTags = [
    ...(normalized.includes("budget") || normalized.includes("cheap") ? ["Budget"] : []),
    ...(normalized.includes("premium") || normalized.includes("luxury") ? ["Premium"] : []),
    ...(normalized.includes("value") ? ["Best Value"] : []),
    ...(normalized.includes("gaming") ? ["Gaming"] : []),
    ...(normalized.includes("office") || normalized.includes("coding") || normalized.includes("work")
      ? ["Office Use"]
      : []),
  ];

  const useCase =
    normalized.includes("running")
      ? "running"
      : normalized.includes("coding")
        ? "coding"
        : normalized.includes("travel")
          ? "travel"
          : normalized.includes("gaming")
            ? "gaming"
            : null;

  const audience =
    normalized.includes("women") || normalized.includes("female")
      ? "women"
      : normalized.includes("men") || normalized.includes("male")
        ? "men"
        : null;

  return {
    category,
    budget_max: underMatch ? Number(underMatch[1]) : null,
    budget_min: overMatch ? Number(overMatch[1]) : null,
    keywords: tokens
      .filter(
        (token) =>
          !["i", "want", "a", "an", "the", "for", "show", "suggest", "good", "best", "under", "over", "me"].includes(token),
      )
      .slice(0, 8),
    preferred_tags: preferredTags,
    use_case: useCase,
    audience,
    explanation: "local intent parsing fallback",
  };
};

const buildAssistantProfile = async (userId?: string | null): Promise<AssistantProfile | null> => {
  if (!userId) return null;

  const [interactions, orders] = await Promise.all([
    prisma.productInteraction.findMany({
      where: { userId },
      select: {
        type: true,
        product: {
          select: {
            brand: true,
            price: true,
            category: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.order.findMany({
      where: { userId },
      select: {
        totalAmount: true,
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  if (interactions.length === 0 && orders.length === 0) return null;

  const categoryWeights = new Map<string, number>();
  const brandWeights = new Map<string, number>();
  const weightedPrices: number[] = [];

  for (const interaction of interactions) {
    const weight =
      interaction.type === ProductInteractionType.PURCHASE
        ? 4
        : interaction.type === ProductInteractionType.CART_ADD
          ? 3
          : interaction.type === ProductInteractionType.CLICK
            ? 2
            : 1;

    const categorySlug = interaction.product.category.slug;
    categoryWeights.set(categorySlug, (categoryWeights.get(categorySlug) ?? 0) + weight);

    if (interaction.product.brand) {
      brandWeights.set(
        interaction.product.brand,
        (brandWeights.get(interaction.product.brand) ?? 0) + weight,
      );
    }

    const price = toNumber(interaction.product.price);
    if (price !== null) {
      for (let index = 0; index < weight; index += 1) {
        weightedPrices.push(price);
      }
    }
  }

  for (const order of orders) {
    const amount = toNumber(order.totalAmount);
    if (amount !== null) weightedPrices.push(amount);
  }

  const topCategories = [...categoryWeights.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([slug]) => slug)
    .slice(0, 3);

  const favoriteBrands = [...brandWeights.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([brand]) => brand)
    .slice(0, 3);

  const typicalBudget =
    weightedPrices.length > 0
      ? weightedPrices.reduce((sum, price) => sum + price, 0) / weightedPrices.length
      : null;

  return {
    topCategories,
    favoriteBrands,
    typicalBudget,
  };
};

const fallbackScoredItems = (
  query: string,
  products: ProductWithCategory[],
  profile?: AssistantProfile | null,
  intentOverride?: AIParsedIntent,
): AIScoredItem[] => {
  const intent = intentOverride ?? fallbackIntent(query);
  return products
    .map((product) => {
      const smartTags = deriveSmartTags(product);
      const normalizedName = normalizeFallbackText(product.name);
      const haystack = [
        product.name,
        product.description ?? "",
        product.shortDescription ?? "",
        product.brand ?? "",
        product.category.name,
        product.category.slug,
        ...product.tags,
        ...smartTags,
      ]
        .join(" ")
        .toLowerCase();

      const keywordScore = intent.keywords.reduce((total, token) => {
        if (haystack.includes(token) || normalizedName.includes(token)) return total + 0.26;
        return total;
      }, 0);
      const keywordHit = keywordScore > 0;
      const categoryScore =
        intent.category && product.category.slug === intent.category
          ? 0.7
          : intent.category === "electronics" && /(workspace|laptop|monitor|keyboard|mouse|audio)/.test(haystack)
            ? 0.45
            : intent.category === "footwear" && /(shoe|sneaker|runner|running)/.test(haystack)
              ? 0.55
              : intent.category === "fashion" && /(shirt|tee|hoodie|jeans|polo)/.test(haystack)
                ? 0.5
                : 0;
      const tagScore = intent.preferred_tags.reduce(
        (total, tag) => total + (smartTags.includes(tag) ? 0.18 : 0),
        0,
      );
      const useCaseScore =
        intent.use_case === "running" && /(running|fitness|sport|recovery|sneaker|shorts)/.test(haystack)
          ? 0.32
          : intent.use_case === "coding" && /(workspace|laptop|monitor|keyboard|mouse|desk|office)/.test(haystack)
            ? 0.32
            : intent.use_case === "gaming" && /(gaming|mechanical|monitor|webcam)/.test(haystack)
              ? 0.32
              : 0;
      const profileCategoryScore =
        profile?.topCategories.includes(product.category.slug) ? 0.2 : 0;
      const profileBrandScore =
        product.brand && profile?.favoriteBrands.includes(product.brand) ? 0.18 : 0;
      const profileBudgetScore =
        profile && profile.typicalBudget !== null
          ? Math.abs((toNumber(product.price) ?? 0) - profile.typicalBudget) / Math.max(profile.typicalBudget, 1) < 0.35
            ? 0.12
            : 0
          : 0;
      const budgetPenalty =
        intent.budget_max !== null && (toNumber(product.price) ?? 0) > intent.budget_max * 1.4
          ? -0.55
          : 0;
      const categoryPenalty =
        intent.category && product.category.slug !== intent.category ? -0.38 : 0;
      const keywordPenalty =
        intent.keywords.length > 0 && !keywordHit && !smartTags.some((tag) => intent.preferred_tags.includes(tag))
          ? -0.22
          : 0;
      const popularityScore = product.purchaseCount / 1000 + product.viewCount / 5000;
      const score =
        keywordScore +
        categoryScore +
        tagScore +
        useCaseScore +
        profileCategoryScore +
        profileBrandScore +
        profileBudgetScore +
        popularityScore +
        budgetPenalty +
        categoryPenalty +
        keywordPenalty;

      return {
        product_id: product.id,
        reason:
          categoryScore > 0.5
            ? "Fallback match from category and intent signals"
            : useCaseScore > 0
              ? "Fallback match for your requested use case"
              : "Fallback result from catalog keywords and popularity",
        score: Number(score.toFixed(4)),
        smart_tags: smartTags,
      };
    })
    .filter((item) => item.score > 0.05)
    .sort((left, right) => right.score - left.score);
};

const buildBundleItems = (
  leadProductId: string | undefined,
  products: ProductWithCategory[],
): AIScoredItem[] => {
  if (!leadProductId) return [];

  const leadProduct = products.find((product) => product.id === leadProductId);
  if (!leadProduct) return [];

  const leadText = normalizeFallbackText(
    `${leadProduct.name} ${leadProduct.description ?? ""} ${leadProduct.category.slug}`,
  );

  const bundleMatchers: Array<{ test: RegExp; terms: string[] }> = [
    { test: /(laptop|notebook)/, terms: ["mouse", "bag", "keyboard", "webcam", "desk"] },
    { test: /(shoe|running|sneaker)/, terms: ["sock", "bottle", "fitness", "recovery", "bag"] },
    { test: /(phone|mobile)/, terms: ["case", "charger", "earbuds", "stand", "watch"] },
  ];

  const matchedTerms =
    bundleMatchers.find((matcher) => matcher.test.test(leadText))?.terms ?? [];

  if (matchedTerms.length === 0) return [];

  return products
    .filter((product) => product.id !== leadProduct.id)
    .map((product) => {
      const haystack = normalizeFallbackText(
        `${product.name} ${product.description ?? ""} ${product.category.slug} ${product.brand ?? ""} ${product.tags.join(" ")}`,
      );
      const hitCount = matchedTerms.reduce(
        (count, term) => count + (haystack.includes(term) ? 1 : 0),
        0,
      );
      const score = hitCount * 0.45 + product.purchaseCount / 1400;

      return {
        product_id: product.id,
        reason: `Pairs well with ${leadProduct.name}`,
        score: Number(score.toFixed(4)),
        smart_tags: [...deriveSmartTags(product), "Bundle Pick"].slice(0, 4),
      };
    })
    .filter((item) => item.score > 0.2)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
};

const buildAssistantReply = ({
  mode,
  items,
  intent,
  profile,
  usedFallback,
}: {
  mode: AssistantMode;
  items: AIAssistantResult["items"];
  intent: AIParsedIntent;
  profile: AssistantProfile | null;
  usedFallback: boolean;
}) => {
  if (items.length === 0) {
    return "I could not find a strong product match yet. Try adding a budget, category, or use case.";
  }

  const lead = items[0];
  const profileSummary = summarizeProfile(profile);

  const opener =
    mode === "bundle"
      ? "I put together a smart bundle around your main product."
      : mode === "gift"
        ? "I found gift-friendly options with cleaner price fit."
        : mode === "seasonal"
          ? "I pulled options that match the season or festive context."
          : mode === "compare"
            ? "I narrowed this to products worth comparing side by side."
            : "I found a few strong matches for what you asked.";

  const rationaleParts = [
    intent.category ? `category ${intent.category.replace(/-/g, " ")}` : null,
    intent.use_case ? `${intent.use_case} use` : null,
    intent.budget_max ? `budget under ${intent.budget_max}` : null,
    profileSummary ? `your profile shows you're ${profileSummary}` : null,
    usedFallback ? "local ranking kept the assistant responsive" : null,
  ].filter(Boolean);

  return `${opener} Top pick: ${lead.product.name}. ${lead.reason}.${rationaleParts.length ? ` I used ${rationaleParts.join(", ")}.` : ""}`;
};

export const searchProductsWithAI = async ({
  query,
  page,
  limit,
}: {
  query: string;
  page: number;
  limit: number;
}): Promise<AISearchResult> => {
  const { catalog, productById } = await getCatalog();
  const response = await requestAIService<SearchServiceResponse>("/ai/search", {
    query,
    catalog,
    limit: 50,
  }).catch(() => ({
    query,
    intent: fallbackIntent(query),
    explanation: "Fallback ranking using local keyword matching.",
    items: fallbackScoredItems(query, [...productById.values()]).slice(0, 50),
  }));

  const orderedProducts = buildOrderedProducts(response.items, productById);
  const totalItems = orderedProducts.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;
  const safePage = totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : 1;
  const startIndex = (safePage - 1) * limit;

  return {
    query: response.query,
    intent: response.intent,
    explanation: response.explanation,
    items: orderedProducts.slice(startIndex, startIndex + limit),
    pagination: {
      page: safePage,
      limit,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
};

export const chatWithAssistant = async ({
  message,
  sessionId,
  userId,
}: {
  message: string;
  sessionId?: string;
  userId?: string | null;
}): Promise<AIAssistantResult> => {
  cleanupAssistantContexts();

  const activeSessionId = sessionId?.trim() || createSessionId();
  const existingContext = assistantContextStore.get(activeSessionId);
  const [catalogData, profile] = await Promise.all([getCatalog(), buildAssistantProfile(userId)]);
  const { catalog, productById } = catalogData;
  const mode = detectAssistantMode(message);
  const fallbackBaseIntent = mergeIntentWithContext(fallbackIntent(message), existingContext);

  let usedFallback = false;
  const response = await requestAIService<AssistantServiceResponse>("/ai/assistant", {
    message,
    session_id: activeSessionId,
    catalog,
    limit: 4,
  }).catch(() => {
    usedFallback = true;
    const fallbackItems =
      mode === "bundle"
        ? buildBundleItems(existingContext?.lastItemProductIds[0], [...productById.values()])
        : fallbackScoredItems(message, [...productById.values()], profile, fallbackBaseIntent).slice(0, 4);

    return {
      reply: "The AI layer is unavailable, so I switched to local recommendation logic.",
      intent: fallbackBaseIntent,
      items: fallbackItems,
      follow_up_question: null,
      suggestion_chips: [],
      confidence: 0.62,
      mode,
    };
  });

  const mergedIntent = mergeIntentWithContext(response.intent ?? fallbackBaseIntent, existingContext);
  const orderedItems = response.items.reduce<AIAssistantResult["items"]>((acc, item) => {
    const product = productById.get(item.product_id);
    if (!product) return acc;

    acc.push({
      product: {
        ...mapProduct(product),
        smartTags: item.smart_tags,
        recommendationReason: item.reason,
      },
      reason: item.reason,
      score: item.score,
      smartTags: item.smart_tags,
    });
    return acc;
  }, []);

  const followUpQuestion = response.follow_up_question ?? buildFollowUpQuestion(message, mergedIntent);
  const suggestionChips =
    response.suggestion_chips && response.suggestion_chips.length > 0
      ? response.suggestion_chips
      : generateSuggestionChips(response.mode ?? mode, mergedIntent, response.items);

  const finalReply =
    response.reply && !usedFallback
      ? response.reply
      : buildAssistantReply({
          mode: response.mode ?? mode,
          items: orderedItems,
          intent: mergedIntent,
          profile,
          usedFallback,
        });

  assistantContextStore.set(activeSessionId, {
    sessionId: activeSessionId,
    lastMessage: message,
    lastIntent: mergedIntent,
    lastItemProductIds: orderedItems.map((item) => item.product.id).slice(0, 6),
    updatedAt: Date.now(),
  });

  return {
    sessionId: activeSessionId,
    mode: response.mode ?? mode,
    reply: finalReply,
    intent: mergedIntent,
    followUpQuestion,
    suggestionChips,
    confidence: Number((response.confidence ?? (usedFallback ? 0.62 : 0.82)).toFixed(2)),
    items: orderedItems,
  };
};

export const getProductReviewSummary = async (
  productId: string,
): Promise<ProductReviewSummary> => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
    include: productInclude,
  });

  if (!product) {
    return {
      productId,
      hasReviewData: false,
      summary: null,
      pros: [],
      cons: [],
    };
  }

  const response = await requestAIService<ReviewSummaryServiceResponse>("/ai/review-summary", {
    product: toCatalogProduct(product),
  }).catch(() => ({
    product_id: productId,
    has_review_data: false,
    summary: null,
    pros: [],
    cons: [],
  }));

  return {
    productId: response.product_id,
    hasReviewData: response.has_review_data,
    summary: response.summary,
    pros: response.pros,
    cons: response.cons,
  };
};
