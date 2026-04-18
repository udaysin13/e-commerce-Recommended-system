import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
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

const toNumber = (value: { toString(): string } | null): number | null => {
  return value === null ? null : Number(value.toString());
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
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    category: product.category,
  };
};

const buildWhere = (query: ProductListQuery): Prisma.ProductWhereInput => {
  return {
    isActive: true,
    ...(query.search
      ? {
          name: {
            contains: query.search,
            mode: "insensitive",
          },
        }
      : {}),
    ...(query.category
      ? {
          category: {
            OR: [{ id: query.category }, { slug: query.category }],
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
