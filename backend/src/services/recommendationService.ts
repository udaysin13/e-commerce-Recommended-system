import { ProductInteractionType } from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  RecommendationBadge,
  RecommendationExperience,
  RecommendationItem,
  RecommendationMood,
  RecommendationProduct,
  RecommendationResult,
  RecommendationScore,
  SmartBundleResult,
  UserInsightMetric,
  UserShoppingInsights,
} from "../types/recommendation.js";

const DEFAULT_MOOD: RecommendationMood = "trending";
const DEFAULT_EXPERIENCE: RecommendationExperience = "personalized";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  price: true,
  currency: true,
  stockQuantity: true,
  imageUrl: true,
  averageRating: true,
  ratingCount: true,
  viewCount: true,
  clickCount: true,
  cartCount: true,
  purchaseCount: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

type ProductForRecommendation = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

type BehaviorProfile = {
  interactedProductIds: string[];
  categoryAffinity: Map<string, number>;
  viewedCategoryScores: Map<string, number>;
  purchasedCategoryScores: Map<string, number>;
  brandAffinity: Map<string, number>;
  averageSpend: number | null;
  shopperProfile: string;
  profileReason: string;
  mostViewedCategory: string;
  mostPurchasedCategory: string;
  favoriteBrand: string;
  spendingRangeLabel: string;
  recommendationModes: RecommendationMood[];
};

const interactionWeights: Record<ProductInteractionType, number> = {
  [ProductInteractionType.VIEW]: 1,
  [ProductInteractionType.CLICK]: 2,
  [ProductInteractionType.CART_ADD]: 4,
  [ProductInteractionType.PURCHASE]: 7,
};

const emptyScore: RecommendationScore = {
  content: 0,
  collaborative: 0,
  popularity: 0,
  hybrid: 0,
};

const toNumber = (value: { toString(): string } | null | undefined): number => {
  if (!value) return 0;
  return Number(value.toString());
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const normalizeMap = (input: Map<string, number>): Map<string, number> => {
  const max = Math.max(...input.values(), 0);
  if (max <= 0) return new Map();

  return new Map([...input.entries()].map(([key, value]) => [key, clamp(value / max)]));
};

const getTopEntryLabel = (scores: Map<string, number>) => {
  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? "Still learning";
};

const getSpendingRangeLabel = (value: number | null) => {
  if (value === null) return "Discovering preferences";
  if (value < 50) return "Under $50";
  if (value < 100) return "$50 - $99";
  if (value < 180) return "$100 - $179";
  if (value < 300) return "$180 - $299";
  return "$300+";
};

const inferShopperProfile = (
  topCategorySlug: string | null,
  averageSpend: number | null,
): Pick<BehaviorProfile, "shopperProfile" | "profileReason" | "recommendationModes"> => {
  if (topCategorySlug === "sports-fitness") {
    return {
      shopperProfile: "Sports Enthusiast",
      profileReason: "Your activity clusters around performance and workout gear.",
      recommendationModes: ["trending", "value", "premium"],
    };
  }

  if (topCategorySlug === "electronics") {
    return {
      shopperProfile: "Tech Lover",
      profileReason: "You consistently engage with audio, power, and gadget-heavy products.",
      recommendationModes: ["premium", "trending", "new"],
    };
  }

  if (averageSpend !== null && averageSpend >= 180) {
    return {
      shopperProfile: "Premium Buyer",
      profileReason: "Your basket history leans toward higher-ticket products with strong ratings.",
      recommendationModes: ["premium", "new", "trending"],
    };
  }

  if (averageSpend !== null && averageSpend <= 70) {
    return {
      shopperProfile: "Budget Shopper",
      profileReason: "You tend to stay inside efficient price bands without giving up quality.",
      recommendationModes: ["budget", "value", "trending"],
    };
  }

  return {
    shopperProfile: "Curated Explorer",
    profileReason: "You browse across categories, so diverse and explainable discovery works best.",
    recommendationModes: ["value", "trending", "new"],
  };
};

const getPopularityBadges = (product: ProductForRecommendation): RecommendationBadge[] => {
  const badges: RecommendationBadge[] = [];
  const rating = toNumber(product.averageRating);

  if (product.purchaseCount >= 140) badges.push("Best Seller");
  if (product.viewCount >= 1200 || product.clickCount >= 420) badges.push("Trending");
  if (product.purchaseCount >= 90 && rating >= 4.3) badges.push("Popular in this category");
  if (product.viewCount >= 900) badges.push("Frequently Viewed");
  if (rating >= 4.6 && product.ratingCount >= 100) badges.push("Top Rated");

  return badges;
};

const mapProduct = (product: ProductForRecommendation): RecommendationProduct => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  brand: product.brand,
  price: toNumber(product.price),
  currency: product.currency,
  stockQuantity: product.stockQuantity,
  imageUrl: product.imageUrl,
  averageRating: toNumber(product.averageRating),
  ratingCount: product.ratingCount,
  viewCount: product.viewCount,
  clickCount: product.clickCount,
  cartCount: product.cartCount,
  purchaseCount: product.purchaseCount,
  category: product.category,
});

const buildReason = ({
  product,
  mood,
  experience,
  sourceProduct,
  categoryAffinity,
  brandAffinity,
  priceFit,
  popularity,
}: {
  product: ProductForRecommendation;
  mood: RecommendationMood;
  experience: RecommendationExperience;
  sourceProduct?: ProductForRecommendation | null;
  categoryAffinity: number;
  brandAffinity: number;
  priceFit: number;
  popularity: number;
}) => {
  if (sourceProduct && product.category.id === sourceProduct.category.id) {
    return "Recommended because you viewed similar products";
  }

  if (categoryAffinity >= 0.6 && priceFit >= 0.6) {
    return "Matches your preferred category and price range";
  }

  if (brandAffinity >= 0.75) {
    return "Aligned with the brands you keep coming back to";
  }

  if (popularity >= 0.65 && categoryAffinity >= 0.35) {
    return "Popular among users with similar interests";
  }

  if (mood === "budget") {
    return "Budget-friendly pick with strong shopper feedback";
  }

  if (mood === "premium") {
    return "Premium pick with standout quality signals";
  }

  if (mood === "value") {
    return "High rating for the price point";
  }

  if (mood === "new") {
    return "Fresh arrival worth discovering";
  }

  if (mood === "trending") {
    return "Trending now across the storefront";
  }

  if (experience === "explore") {
    return "A diverse pick to broaden your discovery";
  }

  return "Selected from your shopping activity";
};

const moodBoost = (product: ProductForRecommendation, mood: RecommendationMood) => {
  const price = toNumber(product.price);
  const rating = toNumber(product.averageRating);
  const createdAgeDays = Math.max(
    1,
    (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );

  switch (mood) {
    case "budget":
      return clamp(1 - price / 180);
    case "premium":
      return clamp(price / 220) * 0.75 + clamp(rating / 5) * 0.25;
    case "value":
      return clamp((rating / Math.max(price, 1)) * 28);
    case "new":
      return clamp(1 / createdAgeDays * 30);
    case "trending":
    default:
      return clamp(product.purchaseCount / 200) * 0.45 + clamp(product.viewCount / 1800) * 0.55;
  }
};

const diversifyItems = (items: RecommendationItem[], limit: number) => {
  const byCategory = new Map<string, RecommendationItem[]>();

  for (const item of items) {
    const bucket = byCategory.get(item.product.category.slug) ?? [];
    bucket.push(item);
    byCategory.set(item.product.category.slug, bucket);
  }

  const diversified: RecommendationItem[] = [];
  const categories = [...byCategory.keys()];

  while (diversified.length < limit && categories.length > 0) {
    for (let index = categories.length - 1; index >= 0; index -= 1) {
      const category = categories[index];
      const bucket = byCategory.get(category);

      if (!bucket || bucket.length === 0) {
        categories.splice(index, 1);
        continue;
      }

      diversified.push(bucket.shift()!);

      if (diversified.length === limit) {
        break;
      }
    }
  }

  return diversified;
};

const buildProfile = async (userId: string | null): Promise<BehaviorProfile> => {
  if (!userId) {
    const inferred = inferShopperProfile(null, null);
    return {
      interactedProductIds: [],
      categoryAffinity: new Map(),
      viewedCategoryScores: new Map(),
      purchasedCategoryScores: new Map(),
      brandAffinity: new Map(),
      averageSpend: null,
      mostViewedCategory: "Trending catalog",
      mostPurchasedCategory: "Trending catalog",
      favoriteBrand: "Still learning",
      spendingRangeLabel: getSpendingRangeLabel(null),
      ...inferred,
    };
  }

  const [interactions, views, orders] = await Promise.all([
    prisma.productInteraction.findMany({
      where: { userId },
      select: {
        productId: true,
        type: true,
        quantity: true,
        product: {
          select: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
            brand: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 250,
    }),
    prisma.productView.findMany({
      where: { userId },
      select: {
        productId: true,
        product: {
          select: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { viewedAt: "desc" },
      take: 250,
    }),
    prisma.order.findMany({
      where: { userId },
      select: {
        totalAmount: true,
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                category: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
                brand: true,
              },
            },
          },
        },
      },
      orderBy: { placedAt: "desc" },
      take: 100,
    }),
  ]);

  const interactedProductIds = new Set<string>();
  const categoryScores = new Map<string, number>();
  const viewedCategoryScores = new Map<string, number>();
  const purchasedCategoryScores = new Map<string, number>();
  const brandScores = new Map<string, number>();
  const spendSamples: number[] = [];
  const categorySlugByLabel = new Map<string, string>();

  for (const interaction of interactions) {
    interactedProductIds.add(interaction.productId);
    const weight =
      interactionWeights[interaction.type] * Math.max(interaction.quantity ?? 1, 1);
    const categoryLabel = interaction.product.category.name;
    categoryScores.set(categoryLabel, (categoryScores.get(categoryLabel) ?? 0) + weight);
    categorySlugByLabel.set(categoryLabel, interaction.product.category.slug);

    if (interaction.type === ProductInteractionType.VIEW || interaction.type === ProductInteractionType.CLICK) {
      viewedCategoryScores.set(
        categoryLabel,
        (viewedCategoryScores.get(categoryLabel) ?? 0) + weight,
      );
    }

    if (interaction.product.brand) {
      brandScores.set(
        interaction.product.brand,
        (brandScores.get(interaction.product.brand) ?? 0) + weight,
      );
    }

    spendSamples.push(toNumber(interaction.product.price));
  }

  for (const view of views) {
    interactedProductIds.add(view.productId);
    const categoryLabel = view.product.category.name;
    viewedCategoryScores.set(categoryLabel, (viewedCategoryScores.get(categoryLabel) ?? 0) + 1);
    categoryScores.set(categoryLabel, (categoryScores.get(categoryLabel) ?? 0) + 0.75);
    categorySlugByLabel.set(categoryLabel, view.product.category.slug);
  }

  for (const order of orders) {
    spendSamples.push(toNumber(order.totalAmount));

    for (const item of order.items) {
      const categoryLabel = item.product.category.name;
      purchasedCategoryScores.set(
        categoryLabel,
        (purchasedCategoryScores.get(categoryLabel) ?? 0) + item.quantity,
      );
      categoryScores.set(categoryLabel, (categoryScores.get(categoryLabel) ?? 0) + item.quantity * 3);
      categorySlugByLabel.set(categoryLabel, item.product.category.slug);

      if (item.product.brand) {
        brandScores.set(
          item.product.brand,
          (brandScores.get(item.product.brand) ?? 0) + item.quantity * 3,
        );
      }
    }
  }

  const normalizedCategories = normalizeMap(categoryScores);
  const normalizedBrands = normalizeMap(brandScores);
  const averageSpend =
    spendSamples.length > 0
      ? Number((spendSamples.reduce((total, value) => total + value, 0) / spendSamples.length).toFixed(2))
      : null;
  const mostViewedCategory = getTopEntryLabel(viewedCategoryScores);
  const mostPurchasedCategory = getTopEntryLabel(purchasedCategoryScores);
  const favoriteBrand = getTopEntryLabel(brandScores);
  const topCategorySlug =
    categorySlugByLabel.get(
      [...normalizedCategories.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "",
    ) ?? null;
  const inferred = inferShopperProfile(topCategorySlug, averageSpend);

  return {
    interactedProductIds: [...interactedProductIds],
    categoryAffinity: normalizedCategories,
    viewedCategoryScores,
    purchasedCategoryScores,
    brandAffinity: normalizedBrands,
    averageSpend,
    mostViewedCategory,
    mostPurchasedCategory,
    favoriteBrand,
    spendingRangeLabel: getSpendingRangeLabel(averageSpend),
    ...inferred,
  };
};

const scoreProduct = ({
  product,
  profile,
  mood,
  experience,
  sourceProduct,
}: {
  product: ProductForRecommendation;
  profile: BehaviorProfile;
  mood: RecommendationMood;
  experience: RecommendationExperience;
  sourceProduct?: ProductForRecommendation | null;
}) => {
  const categoryAffinity = profile.categoryAffinity.get(product.category.name) ?? 0;
  const brandAffinity = product.brand ? profile.brandAffinity.get(product.brand) ?? 0 : 0;
  const averageSpend = profile.averageSpend;
  const price = toNumber(product.price);
  const priceFit =
    averageSpend === null
      ? 0.45
      : clamp(1 - Math.abs(price - averageSpend) / Math.max(averageSpend, 1));
  const popularity = clamp(product.purchaseCount / 200) * 0.45 +
    clamp(product.viewCount / 1800) * 0.25 +
    clamp(product.clickCount / 750) * 0.1 +
    clamp(toNumber(product.averageRating) / 5) * 0.2;

  let content = categoryAffinity * 0.55 + brandAffinity * 0.2 + priceFit * 0.25;

  if (sourceProduct) {
    if (product.category.id === sourceProduct.category.id) content += 0.35;
    if (product.brand && product.brand === sourceProduct.brand) content += 0.2;
  }

  const collaborative = clamp(popularity * 0.7 + categoryAffinity * 0.3);
  const moodPreference = moodBoost(product, mood);
  const novelty =
    experience === "explore"
      ? clamp(1 - categoryAffinity) * 0.45 + moodPreference * 0.35 + clamp(1 / Math.max((Date.now() - product.createdAt.getTime()) / 86400000, 1) * 20) * 0.2
      : 0;
  const hybrid = clamp(
    content * (experience === "personalized" ? 0.48 : 0.22) +
      collaborative * 0.18 +
      popularity * 0.18 +
      moodPreference * 0.16 +
      novelty,
  );

  return {
    score: {
      content: Number(clamp(content).toFixed(4)),
      collaborative: Number(collaborative.toFixed(4)),
      popularity: Number(popularity.toFixed(4)),
      hybrid: Number(hybrid.toFixed(4)),
    },
    categoryAffinity,
    brandAffinity,
    priceFit,
    popularity,
  };
};

const buildRecommendationResult = ({
  products,
  profile,
  mood,
  experience,
  limit,
  strategy,
  sourceProduct,
}: {
  products: ProductForRecommendation[];
  profile: BehaviorProfile;
  mood: RecommendationMood;
  experience: RecommendationExperience;
  limit: number;
  strategy: string;
  sourceProduct?: ProductForRecommendation | null;
}): RecommendationResult => {
  const ranked = products
    .map((product) => {
      const scoreInfo = scoreProduct({ product, profile, mood, experience, sourceProduct });
      return {
        product,
        scoreInfo,
      };
    })
    .sort((left, right) => right.scoreInfo.score.hybrid - left.scoreInfo.score.hybrid)
    .map(({ product, scoreInfo }) => ({
      product: mapProduct(product),
      score: scoreInfo.score,
      reason: buildReason({
        product,
        mood,
        experience,
        sourceProduct,
        categoryAffinity: scoreInfo.categoryAffinity,
        brandAffinity: scoreInfo.brandAffinity,
        priceFit: scoreInfo.priceFit,
        popularity: scoreInfo.popularity,
      }),
      badges: getPopularityBadges(product),
    }));

  const selected =
    experience === "explore" ? diversifyItems(ranked, limit) : ranked.slice(0, limit);

  return {
    strategy,
    source: "local",
    mode: mood,
    experience,
    count: selected.length,
    items: selected,
  };
};

const getCandidateProducts = async ({
  excludedIds,
  sourceProduct,
  profile,
  mood,
  experience,
  limit,
}: {
  excludedIds: string[];
  sourceProduct?: ProductForRecommendation | null;
  profile: BehaviorProfile;
  mood: RecommendationMood;
  experience: RecommendationExperience;
  limit: number;
}) => {
  const preferredCategories = [...profile.categoryAffinity.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([categoryName]) => categoryName);
  const preferredBrands = [...profile.brandAffinity.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([brand]) => brand);
  const candidateSignals: Prisma.ProductWhereInput[] = [
    ...(sourceProduct ? [{ categoryId: sourceProduct.category.id }] : []),
    ...(sourceProduct?.brand ? [{ brand: sourceProduct.brand }] : []),
    ...(preferredCategories.length > 0
      ? [{ category: { name: { in: preferredCategories } } }]
      : []),
    ...(preferredBrands.length > 0 ? [{ brand: { in: preferredBrands } }] : []),
    ...(mood === "trending"
      ? [{ purchaseCount: { gte: 80 } }, { viewCount: { gte: 900 } }]
      : []),
  ];

  return prisma.product.findMany({
    where: {
      isActive: true,
      stockQuantity: {
        gt: 0,
      },
      ...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
      ...(candidateSignals.length > 0 && (experience === "personalized" || sourceProduct)
        ? { OR: candidateSignals }
        : {}),
    },
    select: productSelect,
    orderBy: [
      mood === "new" ? { createdAt: "desc" } : { purchaseCount: "desc" },
      { viewCount: "desc" },
      { averageRating: "desc" },
    ],
    take: Math.max(limit * 4, 24),
  });
};

export const getTrendingRecommendations = async (
  limit: number,
  mood: RecommendationMood = DEFAULT_MOOD,
  experience: RecommendationExperience = "explore",
): Promise<RecommendationResult> => {
  const profile = await buildProfile(null);
  const candidates = await prisma.product.findMany({
    where: { isActive: true, stockQuantity: { gt: 0 } },
    select: productSelect,
    orderBy: [{ purchaseCount: "desc" }, { viewCount: "desc" }, { averageRating: "desc" }],
    take: Math.max(limit * 4, 24),
  });

  return buildRecommendationResult({
    products: candidates,
    profile,
    mood,
    experience,
    limit,
    strategy: "local_trending",
  });
};

export const getProductRecommendations = async (
  productId: string,
  limit: number,
  options?: {
    userId?: string | null;
    mood?: RecommendationMood;
    experience?: RecommendationExperience;
  },
): Promise<RecommendationResult> => {
  const mood = options?.mood ?? DEFAULT_MOOD;
  const experience = options?.experience ?? DEFAULT_EXPERIENCE;
  const sourceProduct = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    select: productSelect,
  });

  if (!sourceProduct) {
    return getTrendingRecommendations(limit, mood, experience);
  }

  const profile = await buildProfile(options?.userId ?? null);
  const candidates = await getCandidateProducts({
    excludedIds: [productId, ...profile.interactedProductIds],
    sourceProduct,
    profile,
    mood,
    experience,
    limit,
  });

  return buildRecommendationResult({
    products: candidates.filter((candidate) => candidate.id !== productId),
    profile,
    mood,
    experience,
    limit,
    strategy: experience === "explore" ? "product_explore" : "product_personalized",
    sourceProduct,
  });
};

export const getUserRecommendations = async (
  userId: string,
  limit: number,
  options?: {
    mood?: RecommendationMood;
    experience?: RecommendationExperience;
  },
): Promise<RecommendationResult> => {
  const mood = options?.mood ?? DEFAULT_MOOD;
  const experience = options?.experience ?? DEFAULT_EXPERIENCE;
  const profile = await buildProfile(userId);
  const candidates = await getCandidateProducts({
    excludedIds: profile.interactedProductIds,
    profile,
    mood,
    experience,
    limit,
  });

  return buildRecommendationResult({
    products: candidates,
    profile,
    mood,
    experience,
    limit,
    strategy: experience === "explore" ? "user_explore" : "user_personalized",
  });
};

export const getHomeRecommendations = async (
  userId: string | null,
  limit: number,
  options?: {
    mood?: RecommendationMood;
    experience?: RecommendationExperience;
  },
): Promise<RecommendationResult> => {
  if (!userId) {
    return getTrendingRecommendations(limit, options?.mood, options?.experience ?? "explore");
  }

  return getUserRecommendations(userId, limit, options);
};

const bundleSignalsForProduct = (product: ProductForRecommendation) => {
  const haystack = `${product.name} ${product.category.name} ${product.brand ?? ""}`.toLowerCase();

  if (haystack.includes("earbud") || haystack.includes("headphone") || haystack.includes("speaker")) {
    return {
      categories: ["accessories", "electronics"],
      keywords: ["charger", "case", "power", "speaker", "accessory"],
      description: "Build a smarter listening setup with add-ons that fit this gear.",
    };
  }

  if (haystack.includes("projector") || haystack.includes("power bank")) {
    return {
      categories: ["electronics", "accessories"],
      keywords: ["power", "charger", "speaker", "bag"],
      description: "Useful extras for a portable electronics setup.",
    };
  }

  if (product.category.slug === "footwear" || product.category.slug === "sports-fitness") {
    return {
      categories: ["sports-fitness", "accessories", "footwear"],
      keywords: ["sport", "fitness", "runner", "recovery", "bag"],
      description: "A practical bundle for training days and on-the-go routines.",
    };
  }

  if (product.category.slug === "beauty") {
    return {
      categories: ["beauty", "accessories"],
      keywords: ["serum", "kit", "care", "beauty"],
      description: "Companion picks that turn one product into a routine.",
    };
  }

  if (product.category.slug === "home-kitchen") {
    return {
      categories: ["home-kitchen", "accessories"],
      keywords: ["kitchen", "home", "set", "tool"],
      description: "Helpful add-ons that complete the same use case at home.",
    };
  }

  return {
    categories: ["accessories", product.category.slug],
    keywords: ["set", "kit", "daily", "carry"],
    description: "Small complementary picks that make the main item more useful.",
  };
};

export const getSmartBundleRecommendations = async (
  productId: string,
  limit: number,
): Promise<SmartBundleResult> => {
  const anchorProduct = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    select: productSelect,
  });

  if (!anchorProduct) {
    const trending = await getTrendingRecommendations(limit, "value", "explore");
    return {
      title: "Smart Bundle",
      description: "Frequently paired products for better discovery.",
      anchorProduct: trending.items[0]?.product ?? {
        id: "fallback",
        name: "Catalog Highlight",
        slug: "catalog-highlight",
        brand: null,
        price: 0,
        currency: "USD",
        stockQuantity: 0,
        imageUrl: null,
        averageRating: 0,
        ratingCount: 0,
        viewCount: 0,
        clickCount: 0,
        cartCount: 0,
        purchaseCount: 0,
        category: { id: "catalog", name: "Catalog", slug: "catalog" },
      },
      totalBundlePrice: trending.items.reduce((total, item) => total + item.product.price, 0),
      items: trending.items,
    };
  }

  const bundleSignals = bundleSignalsForProduct(anchorProduct);
  const relatedOrders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          productId,
        },
      },
    },
    select: {
      items: {
        select: {
          quantity: true,
          productId: true,
        },
      },
    },
    take: 100,
    orderBy: { placedAt: "desc" },
  });

  const coPurchaseStrength = new Map<string, number>();
  for (const order of relatedOrders) {
    for (const item of order.items) {
      if (item.productId === productId) continue;
      coPurchaseStrength.set(
        item.productId,
        (coPurchaseStrength.get(item.productId) ?? 0) + item.quantity,
      );
    }
  }

  const keywordFilters = bundleSignals.keywords.map((keyword) => ({
    name: { contains: keyword, mode: "insensitive" as const },
  }));

  const bundleCandidates = await prisma.product.findMany({
    where: {
      isActive: true,
      stockQuantity: { gt: 0 },
      id: { not: productId },
      OR: [
        ...(coPurchaseStrength.size > 0 ? [{ id: { in: [...coPurchaseStrength.keys()] } }] : []),
        { category: { slug: { in: bundleSignals.categories } } },
        ...keywordFilters,
      ],
    },
    select: productSelect,
    take: Math.max(limit * 5, 20),
  });

  const items = bundleCandidates
    .map((product) => {
      const keywordMatches = bundleSignals.keywords.filter((keyword) =>
        product.name.toLowerCase().includes(keyword),
      ).length;
      const bundleScore =
        (coPurchaseStrength.get(product.id) ?? 0) * 1.3 +
        keywordMatches * 1.1 +
        (bundleSignals.categories.includes(product.category.slug) ? 0.9 : 0) +
        clamp(product.purchaseCount / 180) * 0.7;

      const reason =
        (coPurchaseStrength.get(product.id) ?? 0) > 0
          ? "Frequently bought together with related products"
          : keywordMatches > 0
            ? "Complements the same use case"
            : "Strong add-on for this category";

      return {
        product: mapProduct(product),
        score: {
          ...emptyScore,
          hybrid: Number(bundleScore.toFixed(4)),
          popularity: Number(clamp(product.purchaseCount / 180).toFixed(4)),
        },
        reason,
        badges: [...getPopularityBadges(product), "Popular in this category"].slice(
          0,
          3,
        ) as RecommendationBadge[],
      };
    })
    .sort((left, right) => right.score.hybrid - left.score.hybrid)
    .slice(0, limit);

  return {
    title: "Smart Bundle",
    description: bundleSignals.description,
    anchorProduct: mapProduct(anchorProduct),
    totalBundlePrice: Number(
      items
        .reduce((total, item) => total + item.product.price, toNumber(anchorProduct.price))
        .toFixed(2),
    ),
    items,
  };
};

export const getUserShoppingInsights = async (userId: string): Promise<UserShoppingInsights> => {
  const profile = await buildProfile(userId);

  const metrics: UserInsightMetric[] = [
    {
      label: "Most viewed category",
      value: profile.mostViewedCategory,
      note: "Where your browsing attention clusters the most.",
    },
    {
      label: "Most purchased category",
      value: profile.mostPurchasedCategory,
      note: "What you convert on most often when you buy.",
    },
    {
      label: "Favorite brand",
      value: profile.favoriteBrand,
      note: "The brand that appears most often in your interactions and orders.",
    },
    {
      label: "Average spend",
      value:
        profile.averageSpend !== null && profile.averageSpend > 0
          ? `$${profile.averageSpend.toFixed(2)}`
          : "Still learning",
      note: `Typical basket range: ${profile.spendingRangeLabel}.`,
    },
  ];

  return {
    shopperProfile: profile.shopperProfile,
    profileReason: profile.profileReason,
    averageSpend: Number(profile.averageSpend?.toFixed(2) ?? 0),
    spendingRangeLabel: profile.spendingRangeLabel,
    mostViewedCategory: profile.mostViewedCategory,
    mostPurchasedCategory: profile.mostPurchasedCategory,
    favoriteBrand: profile.favoriteBrand,
    highlightMetrics: metrics,
    recommendationModes: profile.recommendationModes,
  };
};
