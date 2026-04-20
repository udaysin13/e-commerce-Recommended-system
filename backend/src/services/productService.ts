import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { getProductReviewSummary as getAIProductReviewSummary } from "./aiService.js";
import type {
  PaginatedProductsResponse,
  ProductListQuery,
  ProductResponse,
} from "../types/product.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

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

const CATEGORY_ALIASES: Record<string, string[]> = {
  fashion: ["fashion", "clothes", "clothing", "apparel", "dress", "wear", "outfit"],
  footwear: ["footwear", "shoe", "shoes", "sneaker", "sneakers", "running shoes", "sandals"],
  electronics: ["electronics", "electronic", "gadget", "gadgets", "audio", "tech", "device"],
  "home-kitchen": ["home", "kitchen", "cookware", "kitchenware", "household", "home essentials"],
  beauty: ["beauty", "skincare", "makeup", "cosmetics", "serum", "cream"],
  "sports-fitness": ["sports", "fitness", "workout", "gym", "training", "running", "active"],
  books: ["books", "book", "read", "reading", "novel"],
  accessories: ["accessories", "accessory", "wallet", "bag", "daily carry", "essentials"],
};

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

const normalizeSearchTerm = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();

const singularizeToken = (token: string) => {
  if (token.endsWith("ies") && token.length > 3) return `${token.slice(0, -3)}y`;
  if (token.endsWith("es") && token.length > 3) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 3) return token.slice(0, -1);
  return token;
};

const pluralizeToken = (token: string) => {
  if (token.endsWith("y") && token.length > 2) return `${token.slice(0, -1)}ies`;
  if (token.endsWith("s")) return token;
  return `${token}s`;
};

const getSearchVariants = (query: string) => {
  const normalized = normalizeSearchTerm(query);
  const tokens = normalized.split(" ").filter(Boolean);
  const variants = new Set<string>();

  if (normalized) variants.add(normalized);

  for (const token of tokens) {
    variants.add(token);
    variants.add(singularizeToken(token));
    variants.add(pluralizeToken(token));
  }

  for (const [categorySlug, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (
      aliases.some((alias) => normalized.includes(alias) || tokens.some((token) => alias.includes(token)))
    ) {
      variants.add(categorySlug);
      for (const alias of aliases) variants.add(alias);
    }
  }

  return [...variants].filter((value, index, array) => value && array.indexOf(value) === index);
};

const buildSearchClauses = (search: string): Prisma.ProductWhereInput[] => {
  const variants = getSearchVariants(search);

  return variants.flatMap((variant) => [
    { name: { contains: variant, mode: "insensitive" as const } },
    { description: { contains: variant, mode: "insensitive" as const } },
    { shortDescription: { contains: variant, mode: "insensitive" as const } },
    { brand: { contains: variant, mode: "insensitive" as const } },
    { tags: { has: variant } },
    {
      category: {
        OR: [
          { name: { contains: variant, mode: "insensitive" as const } },
          { slug: { contains: variant, mode: "insensitive" as const } },
        ],
      },
    },
  ]);
};

const getPopularityBadges = (product: ProductWithCategory): string[] => {
  const badges: string[] = [];

  if (product.purchaseCount >= 140) badges.push("Best Seller");
  if (product.viewCount >= 1200 || product.clickCount >= 420) badges.push("Trending");
  if (product.purchaseCount >= 90 && toNumber(product.averageRating) !== null && (toNumber(product.averageRating) ?? 0) >= 4.3) {
    badges.push("Popular in this category");
  }
  if (product.viewCount >= 900) badges.push("Frequently Viewed");

  return badges;
};

const mapProduct = (product: ProductWithCategory): ProductResponse => {
  return {
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
  };
};

const buildWhere = (query: ProductListQuery): Prisma.ProductWhereInput => {
  const searchClauses = query.search ? buildSearchClauses(query.search) : [];

  return {
    isActive: true,
    ...(searchClauses.length > 0 ? { OR: searchClauses } : {}),
    ...(query.category
      ? {
          category: {
            OR: [
              { id: query.category },
              { slug: query.category },
              { name: { contains: query.category, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };
};

const buildOrderBy = (query: ProductListQuery): Prisma.ProductOrderByWithRelationInput[] => {
  if (query.sortBy === "price") {
    return [{ price: query.sortOrder }, { createdAt: "desc" }, { id: "asc" }];
  }

  if (query.sortBy === "rating") {
    return [{ averageRating: query.sortOrder }, { ratingCount: "desc" }, { id: "asc" }];
  }

  return [{ createdAt: query.sortOrder }, { id: "asc" }];
};

export const getProducts = async (
  query: ProductListQuery,
): Promise<PaginatedProductsResponse> => {
  const where = buildWhere(query);
  const skip = (query.page - 1) * query.limit;

  const [products, totalItems] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: buildOrderBy(query),
      skip,
      take: query.limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / query.limit);

  return {
    items: products.map(mapProduct),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    },
  };
};

export const searchProducts = async (
  query: ProductListQuery,
): Promise<PaginatedProductsResponse> => {
  return getProducts(query);
};

export const getProductById = async (id: string): Promise<ProductResponse> => {
  const product = await prisma.product.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: productInclude,
  });

  if (!product) {
    throw new HttpError(httpStatus.notFound, "Product not found.");
  }

  return mapProduct(product);
};

export const getProductReviewSummary = async (id: string) => {
  return getAIProductReviewSummary(id);
};
