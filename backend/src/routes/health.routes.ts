import { Router } from "express";
import { healthCheck } from "../controllers/healthController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const healthRouter = Router();

healthRouter.get("/", asyncHandler(healthCheck));
