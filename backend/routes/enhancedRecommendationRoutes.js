/**
 * Enhanced Recommendation Routes
 * 
 * Endpoints:
 * GET  /api/enhanced-recommendations/:userId               - Get recommendations
 * GET  /api/enhanced-recommendations/:userId/details       - Get scoring details
 */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getEnhancedRecommendations,
  getRecommendationDetails,
} = require("../controllers/enhancedRecommendationController");

/**
 * GET /api/enhanced-recommendations/:userId
 * Get intelligent recommendations with optional detailed explanations
 */
router.get("/:userId", getEnhancedRecommendations);

/**
 * GET /api/enhanced-recommendations/:userId/details
 * Get detailed scoring breakdown for transparency and debugging
 */
router.get("/:userId/details", getRecommendationDetails);

module.exports = router;
