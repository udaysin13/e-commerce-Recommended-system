import { Router } from "express";
import {
  createOrderController,
  buyNowController,
  getOrderByIdController,
  listOrdersController,
} from "../controllers/orderController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.post("/", asyncHandler(createOrderController));
orderRouter.post("/buy-now", asyncHandler(buyNowController));
orderRouter.get("/", asyncHandler(listOrdersController));
orderRouter.get("/:id", asyncHandler(getOrderByIdController));
