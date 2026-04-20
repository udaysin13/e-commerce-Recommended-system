import { mockProducts, mockProductsResponse } from "@/lib/mockData";
import { dedupeProductsById, mixProductsAcrossCategories } from "@/lib/mixProductsAcrossCategories";
import type { Product, ProductListParams, ProductsResponse } from "@/types/product";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    message: string;
  };
};

const buildQuery = (params: ProductListParams) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

const request = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.error?.message ?? "Request failed");
  }

  return json.data;
};

const paginateProducts = (
  products: Product[],
  page: number,
  limit: number,
): ProductsResponse["pagination"] & { items: Product[] } => {
  const totalItems = products.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;
  const safePage = totalPages > 0 ? Math.min(Math.max(page, 1), totalPages) : 1;
  const startIndex = (safePage - 1) * limit;

  return {
    items: products.slice(startIndex, startIndex + limit),
    page: safePage,
    limit,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
};

const searchMockProducts = (products: Product[], query: string) => {
  const normalized = query.trim().toLowerCase();
  const tokens = normalized.split(" ").filter(Boolean);
  const aliasMap: Record<string, string[]> = {
    fashion: ["fashion", "clothes", "clothing", "apparel", "dress", "wear", "outfit"],
    footwear: ["footwear", "shoe", "shoes", "sneaker", "sneakers", "running shoes"],
    electronics: ["electronics", "gadget", "tech", "device", "audio"],
    "home-kitchen": ["home", "kitchen", "cookware", "kitchenware", "household"],
    beauty: ["beauty", "skincare", "makeup", "cosmetics", "serum", "cream"],
    "sports-fitness": ["sports", "fitness", "workout", "gym", "training", "running"],
    books: ["books", "book", "reading", "novel"],
    accessories: ["accessories", "accessory", "wallet", "bag", "daily carry"],
  };

  return products.filter((product) => {
    const haystack = [
      product.name,
      product.description ?? "",
      product.shortDescription ?? "",
      product.brand ?? "",
      product.category.name,
      product.category.slug,
      ...product.tags,
    ]
      .join(" ")
      .toLowerCase();

    const matchesText =
      normalized.length === 0 ||
      haystack.includes(normalized) ||
      tokens.some((token) => haystack.includes(token));

    const matchesCategoryAlias = Object.entries(aliasMap).some(([slug, aliases]) => {
      const aliasHit =
        aliases.some((alias) => normalized.includes(alias) || tokens.some((token) => alias.includes(token))) ||
        product.category.slug === slug;
      return aliasHit && product.category.slug === slug;
    });

    return matchesText || matchesCategoryAlias;
  });
};

const getMixedCatalogProducts = async (
  params: ProductListParams,
): Promise<ProductsResponse> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const batchSize = 100;

  const firstPage = await request<ProductsResponse>(
    `/products${buildQuery({
      ...params,
      page: 1,
      limit: batchSize,
    })}`,
  );

  const remainingPages = Array.from(
    { length: Math.max(firstPage.pagination.totalPages - 1, 0) },
    (_, index) => index + 2,
  );

  const remainingResponses = await Promise.all(
    remainingPages.map((nextPage) =>
      request<ProductsResponse>(
        `/products${buildQuery({
          ...params,
          page: nextPage,
          limit: batchSize,
        })}`,
      ),
    ),
  );

  const combinedProducts = dedupeProductsById(
    [firstPage, ...remainingResponses].flatMap((response) => response.items),
  );
  const mixedProducts = mixProductsAcrossCategories(combinedProducts);
  const pagination = paginateProducts(mixedProducts, page, limit);

  return {
    items: pagination.items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage,
    },
  };
};

export const getProducts = async (
  params: ProductListParams = {},
): Promise<ProductsResponse> => {
  try {
    if (params.search?.trim()) {
      return await request<ProductsResponse>(`/products/search${buildQuery(params)}`);
    }

    if (!params.category) {
      return await getMixedCatalogProducts(params);
    }

    return await request<ProductsResponse>(`/products${buildQuery(params)}`);
  } catch {
    const page = params.page ?? 1;
    const limit = params.limit ?? 12;
    const search = params.search?.toLowerCase();
    const category = params.category;
    const sortBy = params.sortBy ?? "newest";
    const sortOrder = params.sortOrder ?? (sortBy === "price" ? "asc" : "desc");

    const searchedProducts = search ? searchMockProducts(mockProducts, search) : mockProducts;
    const filtered = searchedProducts
      .filter((product) => {
        const matchesCategory = category
          ? product.category.slug === category || product.category.id === category
          : true;
        return matchesCategory;
      })
      .sort((first, second) => {
        const direction = sortOrder === "asc" ? 1 : -1;

        if (sortBy === "price") {
          return (first.price - second.price) * direction;
        }

        if (sortBy === "rating") {
          return (first.averageRating - second.averageRating) * direction;
        }

        return (
          (new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()) *
          direction
        );
      });
    const displayProducts = category ? filtered : mixProductsAcrossCategories(filtered);
    const pagination = paginateProducts(displayProducts, page, limit);

    return {
      ...mockProductsResponse,
      items: pagination.items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
        hasNextPage: pagination.hasNextPage,
        hasPreviousPage: pagination.hasPreviousPage,
      },
    };
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const data = await request<{ product: Product }>(`/products/${id}`);
    return data.product;
  } catch {
    return mockProducts.find((product) => product.id === id || product.slug === id) ?? null;
  }
};
