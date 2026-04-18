import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";
import type {
  FastApiRecommendationResponse,
  RecommendationItem,
  RecommendationProduct,
  RecommendationResult,
  RecommendationScore,
} from "../types/recommendation.js";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  price: true,
  currency: true,
  imageUrl: true,
  averageRating: true,
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

const emptyScore: RecommendationScore = {
  content: 0,
  collaborative: 0,
  popularity: 0,
  hybrid: 0,
};

const toNumber = (value: { toString(): string }): number => {
  return Number(value.toString());
};

const mapProduct = (product: ProductForRecommendation): RecommendationProduct => {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    price: toNumber(product.price),
    currency: product.currency,
    imageUrl: product.imageUrl,
    averageRating: toNumber(product.averageRating),
    category: product.category,
  };
};

const productToItem = (
  product: ProductForRecommendation,
  score: RecommendationScore,
  reason: string,
): RecommendationItem => {
  return {
    product: mapProduct(product),
    score,
    reason,
  };
};

const requestRecommendationService = async (
  path: string,
  limit: number,
): Promise<FastApiRecommendationResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.recommendationServiceTimeoutMs);
  const baseUrl = env.recommendationServiceUrl.replace(/\/$/, "");
  const url = `${baseUrl}${path}?limit=${limit}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Recommendation service returned ${response.status}`);
    }

    return (await response.json()) as FastApiRecommendationResponse;
  } finally {
    clearTimeout(timeout);
  }
};

const hydrateFastApiResponse = async (
  response: FastApiRecommendationResponse,
): Promise<RecommendationItem[]> => {
  const productIds = response.items.map((item) => item.product_id);

  if (productIds.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    select: productSelect,
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  return response.items
    .map((item) => {
      const product = productById.get(item.product_id);

      if (!product) {
        return null;
      }

      return productToItem(product, item.score, item.reason);
    })
    .filter((item): item is RecommendationItem => item !== null);
};

const getTrendingFallback = async (limit: number): Promise<RecommendationResult> => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: productSelect,
    orderBy: [
      { purchaseCount: "desc" },
      { viewCount: "desc" },
      { averageRating: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
  });

  const items = products.map((product, index) =>
    productToItem(
      product,
      {
        ...emptyScore,
        popularity: Number((1 / (index + 1)).toFixed(4)),
        hybrid: Number((1 / (index + 1)).toFixed(4)),
      },
      "Fallback trending product",
    ),
  );

  return {
    strategy: "fallback_trending",
    source: "fallback",
    count: items.length,
    items,
  };
};

const getSimilarFallback = async (
  productId: string,
  limit: number,
): Promise<RecommendationResult> => {
  const sourceProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
    select: {
      id: true,
      categoryId: true,
      brand: true,
    },
  });

  if (!sourceProduct) {
    return getTrendingFallback(limit);
  }

  const products = await prisma.product.findMany({
    where: {
      id: { not: sourceProduct.id },
      isActive: true,
      OR: [
        { categoryId: sourceProduct.categoryId },
        ...(sourceProduct.brand ? [{ brand: sourceProduct.brand }] : []),
      ],
    },
    select: productSelect,
    orderBy: [{ averageRating: "desc" }, { purchaseCount: "desc" }],
    take: limit,
  });

  const items = products.map((product) =>
    productToItem(
      product,
      {
        ...emptyScore,
        content: product.category.id === sourceProduct.categoryId ? 0.8 : 0.4,
        hybrid: product.category.id === sourceProduct.categoryId ? 0.8 : 0.4,
      },
      "Fallback similar product",
    ),
  );

  return {
    strategy: "fallback_similar_products",
    source: "fallback",
    count: items.length,
    items,
  };
};

const getUserFallback = async (
  userId: string,
  limit: number,
): Promise<RecommendationResult> => {
  const interactedProducts = await prisma.productInteraction.findMany({
    where: { userId },
    select: {
      productId: true,
    },
    distinct: ["productId"],
  });
  const excludedIds = interactedProducts.map((item) => item.productId);
  const profileProducts = await prisma.product.findMany({
    where: { id: { in: excludedIds } },
    select: { categoryId: true, brand: true },
  });
  const categoryIds = [...new Set(profileProducts.map((product) => product.categoryId))];
  const brands = [
    ...new Set(
      profileProducts
        .map((product) => product.brand)
        .filter((brand): brand is string => Boolean(brand)),
    ),
  ];

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      id: {
        notIn: excludedIds,
      },
      ...(excludedIds.length > 0
        ? {
            OR: [
              { categoryId: { in: categoryIds } },
              ...(brands.length > 0 ? [{ brand: { in: brands } }] : []),
            ],
          }
        : {}),
    },
    select: productSelect,
    orderBy: [
      { purchaseCount: "desc" },
      { averageRating: "desc" },
      { viewCount: "desc" },
    ],
    take: limit,
  });

  const items = products.map((product, index) =>
    productToItem(
      product,
      {
        ...emptyScore,
        content: categoryIds.includes(product.category.id) ? 0.55 : 0,
        popularity: Number((1 / (index + 1)).toFixed(4)),
        hybrid: Number(
          ((categoryIds.includes(product.category.id) ? 0.35 : 0) + 0.2 / (index + 1)).toFixed(4),
        ),
      },
      excludedIds.length > 0
        ? "Fallback personalized product from local catalog signals"
        : "Fallback trending product for a new shopper",
    ),
  );

  return {
    strategy: "fallback_user_recommendations",
    source: "fallback",
    count: items.length,
    items,
  };
};

const fromFastApiOrFallback = async (
  path: string,
  limit: number,
  fallback: () => Promise<RecommendationResult>,
): Promise<RecommendationResult> => {
  try {
    const response = await requestRecommendationService(path, limit);
    const items = await hydrateFastApiResponse(response);

    if (items.length === 0) {
      return fallback();
    }

    return {
      strategy: response.strategy,
      source: "fastapi",
      count: items.length,
      items,
    };
  } catch {
    return fallback();
  }
};

export const getTrendingRecommendations = async (
  limit: number,
): Promise<RecommendationResult> => {
  return fromFastApiOrFallback("/recommend/trending", limit, () =>
    getTrendingFallback(limit),
  );
};

export const getProductRecommendations = async (
  productId: string,
  limit: number,
): Promise<RecommendationResult> => {
  return fromFastApiOrFallback(`/recommend/similar/${productId}`, limit, () =>
    getSimilarFallback(productId, limit),
  );
};

export const getUserRecommendations = async (
  userId: string,
  limit: number,
): Promise<RecommendationResult> => {
  return fromFastApiOrFallback(`/recommend/user/${userId}`, limit, () =>
    getUserFallback(userId, limit),
  );
};

export const getHomeRecommendations = async (
  userId: string,
  limit: number,
): Promise<RecommendationResult> => {
  const interactionCount = await prisma.productInteraction.count({
    where: { userId },
  });

  if (interactionCount === 0) {
    return getTrendingRecommendations(limit);
  }

  return getUserRecommendations(userId, limit);
};
