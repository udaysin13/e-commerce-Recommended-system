import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

export const validateAIMessage = (value: unknown, field = "message"): string => {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    throw new HttpError(httpStatus.badRequest, `${field} is required.`);
  }

  if (normalized.length < 2) {
    throw new HttpError(httpStatus.badRequest, `${field} must be at least 2 characters.`);
  }

  if (normalized.length > 280) {
    throw new HttpError(httpStatus.badRequest, `${field} must be shorter than 280 characters.`);
  }

  return normalized;
};
