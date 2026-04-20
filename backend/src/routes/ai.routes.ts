import { Router } from "express";
import { aiAssistantController, aiSearchController } from "../controllers/aiController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

export const aiRouter = Router();

aiRouter.use(optionalAuth);

aiRouter.post("/search", asyncHandler(aiSearchController));
aiRouter.post("/assistant", asyncHandler(aiAssistantController));
aiRouter.get("/search", asyncHandler(aiSearchController));
