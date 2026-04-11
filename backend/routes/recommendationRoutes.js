/**
 * Recommendation Routes
 * All recommendation-related endpoints
 */

const express = require("express");
const router = express.Router();
const { requireAuth, requireSelfFromBody, requireSelfFromParam } = require("../middleware/authMiddleware");
const {
  getRecommendations,
  getHybridRecs,
  getContentBasedRecs,
  getCollaborativeRecs,
  getCategoryRecs,
  getPopularRecs,
  getTrendingRecs,
  getSimilarRecs,
  getCategorySimilarityRecs,
  getUsersAlsoBoughtRecs,
  getRecentlyViewedRecs,
  getOverviewRecs,
  trackView,
} = require("../controllers/recommendationController");
const {
  getRecommendations: getCollaborativeFilteringRecs,
  analyzeSimilarity,
} = require("../controllers/collaborativeFilteringController");
const {
  getRecommendations: getContentBasedRecs2,
  analyzeRecommendation,
  getSimilar,
} = require("../controllers/contentBasedRecommendationController");

/**
 * POST /recommendations/track-view
 * Track product views for recently viewed and content-based recommendations
 */
router.post("/track-view", requireAuth, requireSelfFromBody("userId"), trackView);

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
 * GET /recommendations/recently-viewed/:userId
 * Get recently viewed products for a user
 */
router.get("/recently-viewed/:userId", requireAuth, requireSelfFromParam("userId"), getRecentlyViewedRecs);

/**
 * GET /recommendations/similar/:productId
 * Get similar products to a specific product
 */
router.get("/similar/:productId", getSimilar);

/**
 * GET /recommendations/category-similarity/:productId
 * Get same-category and similar-price products
 */
router.get("/category-similarity/:productId", getCategorySimilarityRecs);

/**
 * GET /recommendations/users-also-bought/:productId
 * Get products commonly bought together with a product
 */
router.get("/users-also-bought/:productId", getUsersAlsoBoughtRecs);

/**
 * GET /recommendations/:userId/overview?productId=1
 * Get all recommendation groups in one response
 */
router.get("/:userId/overview", requireAuth, requireSelfFromParam("userId"), getOverviewRecs);

/**
 * GET /recommendations/:userId/hybrid
 * Hybrid recommendations for user
 */
router.get("/:userId/hybrid", requireAuth, requireSelfFromParam("userId"), getHybridRecs);

/**
 * GET /recommendations/:userId/content-based
 * Content-based recommendations
 */
router.get("/:userId/content-based", requireAuth, requireSelfFromParam("userId"), getContentBasedRecs);

/**
 * GET /recommendations/:userId/content-based-v2
 * Advanced content-based filtering
 * Query Parameters:
 *   - minScore: Minimum similarity score (default: 0.3, range: 0-1)
 *   - limit: Number of recommendations (default: 10, max: 50)
 *   - excludePurchased: Exclude purchased products (default: true)
 *   - excludeViewed: Exclude viewed products (default: false)
 * Example:
 *   GET /recommendations/1/content-based-v2?minScore=0.4&limit=15
 */
router.get("/:userId/content-based-v2", requireAuth, requireSelfFromParam("userId"), getContentBasedRecs2);

/**
 * GET /recommendations/:userId/analyze/:productId
 * Analyze why a product is recommended to a user
 * Shows similarity scores and contributing factors
 */
router.get("/:userId/analyze/:productId", requireAuth, requireSelfFromParam("userId"), analyzeRecommendation);

/**
 * GET /recommendations/:userId/collaborative
 * Collaborative recommendations
 */
router.get("/:userId/collaborative", requireAuth, requireSelfFromParam("userId"), getCollaborativeRecs);

/**
 * GET /recommendations/:userId/collaborative-filtering
 * Advanced collaborative filtering with cosine similarity
 * Query Parameters:
 *   - topK: Number of similar users (default: 10, max: 100)
 *   - minSimilarity: Minimum similarity threshold (default: 0.3, range: 0-1)
 *   - limit: Number of recommendations (default: 10, max: 50)
 * Example:
 *   GET /recommendations/1/collaborative-filtering?topK=15&minSimilarity=0.4&limit=20
 */
router.get("/:userId/collaborative-filtering", requireAuth, requireSelfFromParam("userId"), getCollaborativeFilteringRecs);

/**
 * GET /recommendations/:userId/collaborative-filtering/analysis
 * Analyze user similarity distribution (debug endpoint)
 * Returns average similarity scores and distribution analysis
 */
router.get("/:userId/collaborative-filtering/analysis", requireAuth, requireSelfFromParam("userId"), analyzeSimilarity);

/**
 * GET /recommendations/:userId/category
 * Category-based recommendations
 */
router.get("/:userId/category", requireAuth, requireSelfFromParam("userId"), getCategoryRecs);

/**
 * GET /recommendations/:userId
 * Main endpoint - hybrid recommendations or specify ?type=content|collaborative|category|popular|trending
 * Examples:
 *   GET /recommendations/1
 *   GET /recommendations/1?type=content
 *   GET /recommendations/1?type=collaborative&limit=10
 *   GET /recommendations/1?limit=20
 */
router.get("/:userId", requireAuth, requireSelfFromParam("userId"), getRecommendations);

module.exports = router;
