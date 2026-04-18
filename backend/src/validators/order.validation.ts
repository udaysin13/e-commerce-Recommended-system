import type { CreateOrderInput } from "../types/order.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const requiredString = (body: Record<string, unknown>, field: string): string => {
  const value = body[field];

  if (typeof value !== "string") {
    throw new HttpError(httpStatus.badRequest, `${field} is required.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new HttpError(httpStatus.badRequest, `${field} is required.`);
  }

  return normalized;
};

const optionalString = (body: Record<string, unknown>, field: string): string | undefined => {
  const value = body[field];

  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(httpStatus.badRequest, `${field} must be a string.`);
  }

  const normalized = value.trim();
  return normalized || undefined;
};

const validatePhone = (phone: string) => {
  const normalized = phone.replace(/\s+/g, "");

  if (!/^\+?[0-9()-]{7,20}$/.test(normalized)) {
    throw new HttpError(httpStatus.badRequest, "phone must be a valid phone number.");
  }

  return phone;
};

const validatePostalCode = (postalCode: string) => {
  if (!/^[A-Za-z0-9 -]{4,12}$/.test(postalCode)) {
    throw new HttpError(httpStatus.badRequest, "postalCode must be a valid postal code.");
  }

  return postalCode;
};

const validateQuantity = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new HttpError(
      httpStatus.badRequest,
      "quantity must be a number greater than 0.",
    );
  }

  return value;
};

export const validateCreateOrderInput = (body: unknown): CreateOrderInput => {
  if (!isRecord(body)) {
    throw new HttpError(httpStatus.badRequest, "Request body must be a JSON object.");
  }

  const fullName = requiredString(body, "fullName");
  const phone = validatePhone(requiredString(body, "phone"));
  const addressLine1 = requiredString(body, "addressLine1");
  const addressLine2 = optionalString(body, "addressLine2");
  const city = requiredString(body, "city");
  const state = requiredString(body, "state");
  const postalCode = validatePostalCode(requiredString(body, "postalCode"));
  const country = requiredString(body, "country");

  return {
    fullName,
    phone,
    addressLine1,
    ...(addressLine2 ? { addressLine2 } : {}),
    city,
    state,
    postalCode,
    country,
  };
};

export const validateBuyNowOrderInput = (
  body: unknown,
): CreateOrderInput & { productId: string; quantity: number } => {
  if (!isRecord(body)) {
    throw new HttpError(httpStatus.badRequest, "Request body must be a JSON object.");
  }

  const productId = requiredString(body, "productId");
  const quantity = validateQuantity(body.quantity);

  return {
    productId,
    quantity,
    ...validateCreateOrderInput(body),
  };
};

export const validateOrderIdParam = (id: string | undefined): string => {
  const normalized = id?.trim();

  if (!normalized) {
    throw new HttpError(httpStatus.badRequest, "Order ID is required.");
  }

  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(normalized)) {
    throw new HttpError(httpStatus.badRequest, "Invalid order ID.");
  }

  return normalized;
};
