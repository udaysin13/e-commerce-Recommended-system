import type { Request } from "express";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";
import { parsePositiveIntegerQuery } from "../utils/query.js";
import type {
  RecommendationExperience,
  RecommendationMood,
} from "../types/recommendation.js";

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

const moods = new Set<RecommendationMood>(["budget", "premium", "trending", "value", "new"]);
const experiences = new Set<RecommendationExperience>(["personalized", "explore"]);

export const validateRecommendationMood = (
  query: Request["query"],
): RecommendationMood => {
  const value = typeof query.mode === "string" ? query.mode.trim().toLowerCase() : "trending";

  if (!moods.has(value as RecommendationMood)) {
    throw new HttpError(httpStatus.badRequest, "Invalid recommendation mode.");
  }

  return value as RecommendationMood;
};

export const validateRecommendationExperience = (
  query: Request["query"],
): RecommendationExperience => {
  const value =
    typeof query.experience === "string"
      ? query.experience.trim().toLowerCase()
      : "personalized";

  if (!experiences.has(value as RecommendationExperience)) {
    throw new HttpError(httpStatus.badRequest, "Invalid recommendation experience.");
  }

  return value as RecommendationExperience;
};
