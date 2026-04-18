import type { Product } from "@/types/product";
import type { RecommendationResult } from "@/types/recommendation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    message: string;
  };
};

const requestRecommendations = async (path: string): Promise<RecommendationResult | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as ApiResponse<{
      recommendations: RecommendationResult;
    }>;

    return json.success ? json.data.recommendations : null;
  } catch {
    return null;
  }
};

export const getHomeRecommendations = (userId: string, limit = 6) => {
  return requestRecommendations(`/recommendations/home/${userId}?limit=${limit}`);
};

export const getProductRecommendations = (productId: string, limit = 3) => {
  return requestRecommendations(`/recommendations/product/${productId}?limit=${limit}`);
};

export const getUserRecommendations = (userId: string, limit = 6) => {
  return requestRecommendations(`/recommendations/user/${userId}?limit=${limit}`);
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
      stockQuantity: 0,
      imageUrl: item.product.imageUrl,
      imageUrls: [],
      tags: [],
      attributes: {
        recommendationScore: item.score,
        recommendationSource: recommendations.source,
      },
      averageRating: item.product.averageRating,
      ratingCount: 0,
      viewCount: 0,
      clickCount: 0,
      cartCount: 0,
      purchaseCount: 0,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: item.product.category,
    })) ?? []
  );
};
