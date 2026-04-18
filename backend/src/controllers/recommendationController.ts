import type { RequestHandler } from "express";
import {
  getHomeRecommendations,
  getProductRecommendations,
  getUserRecommendations,
} from "../services/recommendationService.js";
import {
  validateRecommendationId,
  validateRecommendationLimit,
} from "../validators/recommendation.validation.js";
import { httpStatus } from "../utils/httpStatus.js";

export const homeRecommendationsController: RequestHandler = async (req, res) => {
  const userId = validateRecommendationId(req.params.userId, "userId");
  const limit = validateRecommendationLimit(req.query);
  const recommendations = await getHomeRecommendations(userId, limit);

  res.status(httpStatus.ok).json({
    success: true,
    data: { recommendations },
  });
};

export const productRecommendationsController: RequestHandler = async (req, res) => {
  const productId = validateRecommendationId(req.params.productId, "productId");
  const limit = validateRecommendationLimit(req.query);
  const recommendations = await getProductRecommendations(productId, limit);

  res.status(httpStatus.ok).json({
    success: true,
    data: { recommendations },
  });
};

export const userRecommendationsController: RequestHandler = async (req, res) => {
  const userId = validateRecommendationId(req.params.userId, "userId");
  const limit = validateRecommendationLimit(req.query);
  const recommendations = await getUserRecommendations(userId, limit);

  res.status(httpStatus.ok).json({
    success: true,
    data: { recommendations },
  });
};
