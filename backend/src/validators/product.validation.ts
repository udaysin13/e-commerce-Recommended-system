import type { Request } from "express";
import type { ProductListQuery, ProductSortBy, SortOrder } from "../types/product.js";
import {
  getSingleQueryValue,
  parseEnumQuery,
  parsePositiveIntegerQuery,
} from "../utils/query.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

const SORT_VALUES = ["price", "rating", "newest"] as const satisfies readonly ProductSortBy[];
const ORDER_VALUES = ["asc", "desc"] as const satisfies readonly SortOrder[];

const defaultOrderForSort = (sortBy: ProductSortBy): SortOrder => {
  return sortBy === "price" ? "asc" : "desc";
};

export const validateProductListQuery = (query: Request["query"]): ProductListQuery => {
  const page = parsePositiveIntegerQuery(query.page, "page", 1);
  const limit = parsePositiveIntegerQuery(query.limit, "limit", 12, { max: 100 });
  const sortBy = parseEnumQuery(query.sortBy ?? query.sort, "sortBy", SORT_VALUES, "newest");
  const sortOrder = parseEnumQuery(
    query.order ?? query.sortOrder,
    "sortOrder",
    ORDER_VALUES,
    defaultOrderForSort(sortBy),
  );
  const search = getSingleQueryValue(
    query.search ?? query.q ?? query.title,
    "search",
  );
  const category = getSingleQueryValue(query.category, "category");

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
  };
};

export const validateProductSearchQuery = (query: Request["query"]): ProductListQuery => {
  const validatedQuery = validateProductListQuery(query);

  if (!validatedQuery.search) {
    throw new HttpError(
      httpStatus.badRequest,
      "Search query is required. Use search, q, or title.",
    );
  }

  return validatedQuery;
};

export const validateProductIdParam = (id: string | undefined): string => {
  const normalized = id?.trim();

  if (!normalized) {
    throw new HttpError(httpStatus.badRequest, "Product ID is required.");
  }

  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(normalized)) {
    throw new HttpError(httpStatus.badRequest, "Invalid product ID.");
  }

  return normalized;
};
