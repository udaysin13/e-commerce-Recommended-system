import { Router } from "express";
import {
  getProductByIdController,
  listProductsController,
  productReviewSummaryController,
  searchProductsController,
} from "../controllers/productController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const productRouter = Router();

productRouter.get("/", asyncHandler(listProductsController));
productRouter.get("/search", asyncHandler(searchProductsController));
productRouter.get("/:id/review-summary", asyncHandler(productReviewSummaryController));
productRouter.get("/:id", asyncHandler(getProductByIdController));
