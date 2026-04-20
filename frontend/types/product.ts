export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
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
  createdAt: string;
  updatedAt: string;
  category: Category;
};

export type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ProductsResponse = {
  items: Product[];
  pagination: Pagination;
};

export type ProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: "price" | "rating" | "newest";
  sortOrder?: "asc" | "desc";
};
