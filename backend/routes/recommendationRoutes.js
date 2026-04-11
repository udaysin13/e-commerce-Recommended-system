/**
 * Recommendation Routes
 * All recommendation-related endpoints
 */

const express = require("express");
const router = express.Router();
const {
  getRecommendations,
  getHybridRecs,
  getContentBasedRecs,
  getCollaborativeRecs,
  getCategoryRecs,
  getPopularRecs,
  getTrendingRecs,
  getSimilarRecs,
} = require("../controllers/recommendationController");

/**
 * GET /recommendations/popular
 * Get popular products (no userId required)
 */
router.get("/popular", getPopularRecs);

/**
 * GET /recommendations/trending
 * Get trending products (no userId required)
 */
router.get("/trending", getTrendingRecs);

/**
 * GET /recommendations/similar/:productId
 * Get similar products to a specific product
 */
router.get("/similar/:productId", getSimilarRecs);

/**
 * GET /recommendations/:userId/hybrid
 * Hybrid recommendations for user
 */
router.get("/:userId/hybrid", getHybridRecs);

/**
 * GET /recommendations/:userId/content-based
 * Content-based recommendations
 */
router.get("/:userId/content-based", getContentBasedRecs);

/**
 * GET /recommendations/:userId/collaborative
 * Collaborative recommendations
 */
router.get("/:userId/collaborative", getCollaborativeRecs);

/**
 * GET /recommendations/:userId/category
 * Category-based recommendations
 */
router.get("/:userId/category", getCategoryRecs);

/**
 * GET /recommendations/:userId
 * Main endpoint - hybrid recommendations or specify ?type=content|collaborative|category|popular|trending
 * Examples:
 *   GET /recommendations/1
 *   GET /recommendations/1?type=content
 *   GET /recommendations/1?type=collaborative&limit=10
 *   GET /recommendations/1?limit=20
 */
router.get("/:userId", getRecommendations);

module.exports = router;
