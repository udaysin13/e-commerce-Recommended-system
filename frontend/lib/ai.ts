import { API_BASE_URL } from "@/lib/auth";
import { mockProducts } from "@/lib/mockData";
import type { AIAssistantResult, AISearchResponse, ProductReviewSummary } from "@/types/ai";
import type { ProductListParams } from "@/types/product";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    message?: string;
  };
};

const buildQuery = (params: ProductListParams) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
};

export const aiSearchProducts = async (
  params: ProductListParams,
): Promise<AISearchResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/search${buildQuery(params)}`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as ApiResponse<AISearchResponse>;
    return json.success ? json.data : null;
  } catch {
    const search = params.search?.trim().toLowerCase() ?? "";
    if (!search) return null;

    const filtered = mockProducts.filter((product) => {
      const haystack = [
        product.name,
        product.description ?? "",
        product.shortDescription ?? "",
        product.brand ?? "",
        product.category.name,
        product.category.slug,
        ...(product.smartTags ?? []),
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });

    return {
      query: params.search ?? "",
      explanation: "Fallback keyword search",
      intent: {
        category: null,
        budget_max: null,
        budget_min: null,
        keywords: search.split(" ").filter(Boolean),
        preferred_tags: [],
        use_case: null,
        audience: null,
        explanation: "fallback",
      },
      items: filtered,
      pagination: {
        page: 1,
        limit: params.limit ?? 12,
        totalItems: filtered.length,
        totalPages: filtered.length > 0 ? 1 : 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
};

export const askShoppingAssistant = async (
  message: string,
  token?: string | null,
  sessionId?: string,
): Promise<AIAssistantResult | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as ApiResponse<AIAssistantResult>;
    return json.success ? json.data : null;
  } catch {
    return null;
  }
};

export const getProductReviewSummary = async (
  productId: string,
): Promise<ProductReviewSummary | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/review-summary`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as ApiResponse<{ summary: ProductReviewSummary }>;
    return json.success ? json.data.summary : null;
  } catch {
    return null;
  }
};
