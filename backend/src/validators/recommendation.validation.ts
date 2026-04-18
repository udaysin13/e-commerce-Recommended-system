import type { Request } from "express";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";
import { parsePositiveIntegerQuery } from "../utils/query.js";

const ID_PATTERN = /^[a-zA-Z0-9_-]{3,80}$/;

export const validateRecommendationId = (
  value: string | undefined,
  field: string,
): string => {
  const normalized = value?.trim();

  if (!normalized) {
    throw new HttpError(httpStatus.badRequest, `${field} is required.`);
  }

  if (!ID_PATTERN.test(normalized)) {
    throw new HttpError(httpStatus.badRequest, `Invalid ${field}.`);
  }

  return normalized;
};

export const validateRecommendationLimit = (query: Request["query"]): number => {
  return parsePositiveIntegerQuery(query.limit, "limit", 10, { max: 50 });
};
