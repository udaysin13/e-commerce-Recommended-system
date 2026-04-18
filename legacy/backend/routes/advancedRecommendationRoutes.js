/**
 * Advanced Recommendation Routes
 * Intermediate-level recommendation endpoints with behavior tracking
 */

const express = require("express");
const router = express.Router();
const {
  getSmartRecs,
  getUsersAlsoBoughtRecs,
  getAdvancedCollaborativeRecs,
  getAdvancedContentBasedRecs,
  getUserBehaviorAnalytics,
  getProductAnalytics,
  trackUserView,
  getRecommendationAnalysis,
} = require("../controllers/advancedRecommendationController");

/**
 * POST /advanced-recommendations/track-view
 * Track a user's product view
 */
router.post("/track-view", trackUserView);

/**
 * GET /advanced-recommendations/:userId
 * Smart recommendations - automatic algorithm selection
 * Query: ?product_id=5&limit=12
 */
router.get("/:userId", getSmartRecs);

/**
 * GET /advanced-recommendations/:userId/users-also-bought
 * Co-purchase analysis - what users bought together
 * Query: ?product_id=5&limit=8
 */
router.get("/:userId/users-also-bought", getUsersAlsoBoughtRecs);

/**
 * GET /advanced-recommendations/:userId/collaborative-advanced
 * Advanced collaborative filtering with confidence scores
 * Query: ?limit=8
 */
router.get("/:userId/collaborative-advanced", getAdvancedCollaborativeRecs);

/**
 * GET /advanced-recommendations/:userId/content-advanced
 * Advanced content-based with preference analysis
 * Query: ?limit=8
 */
router.get("/:userId/content-advanced", getAdvancedContentBasedRecs);

/**
 * GET /advanced-recommendations/:userId/analysis
 * Comprehensive recommendation analysis
 * Shows data quality, confidence, reasons
 * Query: ?product_id=5&limit=6
 */
router.get("/:userId/analysis", getRecommendationAnalysis);

/**
 * GET /advanced-recommendations/:userId/behavior
 * User behavior analytics and classification
 */
router.get("/:userId/behavior", getUserBehaviorAnalytics);

/**
 * GET /advanced-recommendations/product/:productId/metadata
 * Product analytics and performance metrics
 */
router.get("/product/:productId/metadata", getProductAnalytics);

module.exports = router;
