import type { RequestHandler } from "express";
import {
  getHomeRecommendations,
  getProductRecommendations,
  getSmartBundleRecommendations,
  getTrendingRecommendations,
  getUserShoppingInsights,
  getUserRecommendations,
} from "../services/recommendationService.js";
import { getSeasonalRecommendations } from "../services/seasonalRecommendationService.js";
import {
  validateRecommendationExperience,
  validateRecommendationId,
  validateRecommendationLimit,
  validateRecommendationMood,
} from "../validators/recommendation.validation.js";
import { httpStatus } from "../utils/httpStatus.js";

export const homeRecommendationsController: RequestHandler = async (req, res) => {
  const userId = validateRecommendationId(req.params.userId, "userId");
  const limit = validateRecommendationLimit(req.query);
  const mode = validateRecommendationMood(req.query);
  const experience = validateRecommendationExperience(req.query);
  const recommendations = await getHomeRecommendations(userId, limit, { mood: mode, experience });

  res.status(httpStatus.ok).json({
    success: true,
    data: { recommendations },
  });
};

export const sessionHomeRecommendationsController: RequestHandler = async (req, res) => {
  const limit = validateRecommendationLimit(req.query);
  const mode = validateRecommendationMood(req.query);
  const experience = validateRecommendationExperience(req.query);
  const recommendations = req.auth?.userId
    ? await getHomeRecommendations(req.auth.userId, limit, { mood: mode, experience })
    : await getTrendingRecommendations(limit, mode, experience === "personalized" ? "explore" : experience);

  res.status(httpStatus.ok).json({
    success: true,
    data: { recommendations },
  });
};

export const productRecommendationsController: RequestHandler = async (req, res) => {
  const productId = validateRecommendationId(req.params.productId, "productId");
  const limit = validateRecommendationLimit(req.query);
  const mode = validateRecommendationMood(req.query);
  const experience = validateRecommendationExperience(req.query);
  const recommendations = await getProductRecommendations(productId, limit, {
    userId: req.auth?.userId ?? null,
    mood: mode,
    experience,
  });

  res.status(httpStatus.ok).json({
    success: true,
    data: { recommendations },
  });
};

export const userRecommendationsController: RequestHandler = async (req, res) => {
  const userId = validateRecommendationId(req.params.userId, "userId");
  const limit = validateRecommendationLimit(req.query);
  const mode = validateRecommendationMood(req.query);
  const experience = validateRecommendationExperience(req.query);
  const recommendations = await getUserRecommendations(userId, limit, { mood: mode, experience });

  res.status(httpStatus.ok).json({
    success: true,
    data: { recommendations },
  });
};

export const bundleRecommendationsController: RequestHandler = async (req, res) => {
  const productId = validateRecommendationId(req.params.productId, "productId");
  const limit = validateRecommendationLimit(req.query);
  const bundle = await getSmartBundleRecommendations(productId, Math.min(limit, 6));

  res.status(httpStatus.ok).json({
    success: true,
    data: { bundle },
  });
};

export const seasonalRecommendationsController: RequestHandler = async (_req, res) => {
  const seasonal = await getSeasonalRecommendations();

  res.status(httpStatus.ok).json({
    success: true,
    data: { seasonal },
  });
};

export const shoppingInsightsController: RequestHandler = async (req, res) => {
  const insights = await getUserShoppingInsights(req.auth!.userId);

  res.status(httpStatus.ok).json({
    success: true,
    data: { insights },
  });
};
