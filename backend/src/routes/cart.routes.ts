import { Router } from "express";
import {
  addCartItemController,
  getCartController,
  removeCartItemController,
  updateCartItemController,
} from "../controllers/cartController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.post("/", asyncHandler(addCartItemController));
cartRouter.get("/", asyncHandler(getCartController));
cartRouter.patch("/:id", asyncHandler(updateCartItemController));
cartRouter.delete("/:id", asyncHandler(removeCartItemController));
