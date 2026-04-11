import express from "express";
import { getRecommendations } from "../controllers/recommendation.controller.js";

const router = express.Router();

router.get("/:userId", getRecommendations);

export default router;