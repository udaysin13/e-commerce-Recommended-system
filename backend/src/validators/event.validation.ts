import type { TrackEventInput } from "../types/event.js";
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

const getProductId = (body: Record<string, unknown>): string => {
  const productId = getRequiredString(body, "productId");

  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(productId)) {
    throw new HttpError(httpStatus.badRequest, "Invalid product ID.");
  }

  return productId;
};

const getOptionalString = (body: Record<string, unknown>, field: string): string | undefined => {
  const value = body[field];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(httpStatus.badRequest, `${field} must be a string.`);
  }

  const normalized = value.trim();
  return normalized ? normalized : undefined;
};

const getOptionalMetadata = (
  body: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  const metadata = body.metadata;

  if (metadata === undefined || metadata === null) {
    return undefined;
  }

  if (!isRecord(metadata)) {
    throw new HttpError(httpStatus.badRequest, "metadata must be a JSON object.");
  }

  return metadata;
};

export const validateTrackEventInput = (body: unknown): TrackEventInput => {
  if (!isRecord(body)) {
    throw new HttpError(httpStatus.badRequest, "Request body must be a JSON object.");
  }

  const sessionId = getOptionalString(body, "sessionId");
  const metadata = getOptionalMetadata(body);

  return {
    productId: getProductId(body),
    ...(sessionId ? { sessionId } : {}),
    ...(metadata ? { metadata } : {}),
  };
};
