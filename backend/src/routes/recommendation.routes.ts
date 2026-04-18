import { Router } from "express";
import {
  homeRecommendationsController,
  productRecommendationsController,
  userRecommendationsController,
} from "../controllers/recommendationController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const recommendationRouter = Router();

recommendationRouter.get("/home/:userId", asyncHandler(homeRecommendationsController));
recommendationRouter.get("/product/:productId", asyncHandler(productRecommendationsController));
recommendationRouter.get("/user/:userId", asyncHandler(userRecommendationsController));
