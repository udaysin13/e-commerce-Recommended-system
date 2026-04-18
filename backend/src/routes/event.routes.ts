import { Router } from "express";
import { trackClickController, trackViewController } from "../controllers/eventController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

export const eventRouter = Router();

eventRouter.use(optionalAuth);

eventRouter.post("/view", asyncHandler(trackViewController));
eventRouter.post("/click", asyncHandler(trackClickController));
