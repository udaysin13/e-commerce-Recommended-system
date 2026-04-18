import type { AddCartItemInput, UpdateCartItemInput } from "../types/cart.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const getRequiredString = (body: Record<string, unknown>, field: string): string => {
  const value = body[field];

  if (typeof value !== "string" || !value.trim()) {
    throw new HttpError(httpStatus.badRequest, `${field} is required.`);
  }

  return value.trim();
};

const getQuantity = (body: Record<string, unknown>, fallback?: number): number => {
  const value = body.quantity;

  if (value === undefined && fallback !== undefined) {
    return fallback;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 99) {
    throw new HttpError(httpStatus.badRequest, "quantity must be an integer between 1 and 99.");
  }

  return value;
};

export const validateAddCartItemInput = (body: unknown): AddCartItemInput => {
  if (!isRecord(body)) {
    throw new HttpError(httpStatus.badRequest, "Request body must be a JSON object.");
  }

  return {
    productId: getRequiredString(body, "productId"),
    quantity: getQuantity(body, 1),
  };
};

export const validateUpdateCartItemInput = (body: unknown): UpdateCartItemInput => {
  if (!isRecord(body)) {
    throw new HttpError(httpStatus.badRequest, "Request body must be a JSON object.");
  }

  return {
    quantity: getQuantity(body),
  };
};

export const validateCartItemIdParam = (id: string | undefined): string => {
  const normalized = id?.trim();

  if (!normalized) {
    throw new HttpError(httpStatus.badRequest, "Cart item ID is required.");
  }

  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(normalized)) {
    throw new HttpError(httpStatus.badRequest, "Invalid cart item ID.");
  }

  return normalized;
};
