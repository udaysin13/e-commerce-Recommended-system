import { Router } from "express";
import {
  bundleRecommendationsController,
  homeRecommendationsController,
  productRecommendationsController,
  seasonalRecommendationsController,
  sessionHomeRecommendationsController,
  shoppingInsightsController,
  userRecommendationsController,
} from "../controllers/recommendationController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

export const recommendationRouter = Router();

recommendationRouter.get("/home", optionalAuth, asyncHandler(sessionHomeRecommendationsController));
recommendationRouter.get("/home/:userId", asyncHandler(homeRecommendationsController));
recommendationRouter.get("/seasonal", asyncHandler(seasonalRecommendationsController));
recommendationRouter.get("/product/:productId", optionalAuth, asyncHandler(productRecommendationsController));
recommendationRouter.get("/product/:productId/bundles", asyncHandler(bundleRecommendationsController));
recommendationRouter.get("/user/:userId", asyncHandler(userRecommendationsController));
recommendationRouter.get("/insights/me", requireAuth, asyncHandler(shoppingInsightsController));
