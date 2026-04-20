export type ProductSortBy = "price" | "rating" | "newest";

export type SortOrder = "asc" | "desc";

export type ProductListQuery = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  sortBy: ProductSortBy;
  sortOrder: SortOrder;
};

export type ProductCategoryResponse = {
  id: string;
  name: string;
  slug: string;
};

export type ProductResponse = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  shortDescription: string | null;
  brand: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  stockQuantity: number;
  imageUrl: string | null;
  imageUrls: string[];
  tags: string[];
  attributes: unknown;
  averageRating: number;
  ratingCount: number;
  viewCount: number;
  clickCount: number;
  cartCount: number;
  purchaseCount: number;
  isFeatured: boolean;
  popularityBadges?: string[];
  smartTags?: string[];
  recommendationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: ProductCategoryResponse;
};

export type PaginatedProductsResponse = {
  items: ProductResponse[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
