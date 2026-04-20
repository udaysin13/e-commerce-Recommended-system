import type { Product } from "@/types/product";
import type {
  RecommendationExperience,
  RecommendationMood,
  RecommendationResult,
  SeasonalRecommendationResponse,
  SmartBundleResult,
  UserShoppingInsights,
} from "@/types/recommendation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    message: string;
  };
};

const buildRecommendationQuery = (params: {
  limit?: number;
  mode?: RecommendationMood;
  experience?: RecommendationExperience;
}) => {
  const query = new URLSearchParams();

  if (params.limit) query.set("limit", String(params.limit));
  if (params.mode) query.set("mode", params.mode);
  if (params.experience) query.set("experience", params.experience);

  const value = query.toString();
  return value ? `?${value}` : "";
};

const requestJson = async <T>(
  path: string,
  options?: {
    token?: string | null;
    noStore?: boolean;
  },
): Promise<T | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...(options?.noStore ? { cache: "no-store" as const } : { next: { revalidate: 30 } }),
      headers: options?.token
        ? {
            Authorization: `Bearer ${options.token}`,
          }
        : undefined,
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as ApiResponse<T>;
    return json.success ? json.data : null;
  } catch {
    return null;
  }
};

export const getHomeRecommendations = async (
  userId: string,
  limit = 6,
  mode: RecommendationMood = "trending",
  experience: RecommendationExperience = "personalized",
) => {
  const data = await requestJson<{ recommendations: RecommendationResult }>(
    `/recommendations/home/${userId}${buildRecommendationQuery({ limit, mode, experience })}`,
  );
  return data?.recommendations ?? null;
};

export const getSessionHomeRecommendations = async (
  options: {
    limit?: number;
    mode?: RecommendationMood;
    experience?: RecommendationExperience;
    token?: string | null;
    noStore?: boolean;
  } = {},
) => {
  const data = await requestJson<{ recommendations: RecommendationResult }>(
    `/recommendations/home${buildRecommendationQuery(options)}`,
    { token: options.token, noStore: options.noStore },
  );
  return data?.recommendations ?? null;
};

export const getProductRecommendations = async (
  productId: string,
  limit = 3,
  mode: RecommendationMood = "trending",
  experience: RecommendationExperience = "personalized",
  token?: string | null,
) => {
  const data = await requestJson<{ recommendations: RecommendationResult }>(
    `/recommendations/product/${productId}${buildRecommendationQuery({
      limit,
      mode,
      experience,
    })}`,
    { token },
  );
  return data?.recommendations ?? null;
};

export const getUserRecommendations = async (
  userId: string,
  limit = 6,
  mode: RecommendationMood = "trending",
  experience: RecommendationExperience = "personalized",
) => {
  const data = await requestJson<{ recommendations: RecommendationResult }>(
    `/recommendations/user/${userId}${buildRecommendationQuery({ limit, mode, experience })}`,
  );
  return data?.recommendations ?? null;
};

export const getSmartBundleRecommendations = async (
  productId: string,
  limit = 3,
) => {
  const data = await requestJson<{ bundle: SmartBundleResult }>(
    `/recommendations/product/${productId}/bundles${buildRecommendationQuery({ limit })}`,
  );
  return data?.bundle ?? null;
};

export const getShoppingInsights = async (token: string) => {
  const data = await requestJson<{ insights: UserShoppingInsights }>(
    "/recommendations/insights/me",
    { token, noStore: true },
  );
  return data?.insights ?? null;
};

export const getSeasonalRecommendations = async () => {
  const data = await requestJson<{ seasonal: SeasonalRecommendationResponse }>(
    "/recommendations/seasonal",
  );
  return data?.seasonal ?? null;
};

export const recommendedProductsToProducts = (
  recommendations: RecommendationResult | null,
): Product[] => {
  return (
    recommendations?.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      sku: item.product.id,
      description: item.reason,
      shortDescription: item.reason,
      brand: item.product.brand,
      price: item.product.price,
      compareAtPrice: null,
      currency: item.product.currency,
      stockQuantity: item.product.stockQuantity,
      imageUrl: item.product.imageUrl,
      imageUrls: [],
      tags: [],
      attributes: {
        recommendationScore: item.score,
        recommendationSource: recommendations.source,
      },
      averageRating: item.product.averageRating,
      ratingCount: item.product.ratingCount,
      viewCount: item.product.viewCount,
      clickCount: item.product.clickCount,
      cartCount: item.product.cartCount,
      purchaseCount: item.product.purchaseCount,
      isFeatured: false,
      popularityBadges: item.badges,
      recommendationReason: item.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: item.product.category,
    })) ?? []
  );
};
