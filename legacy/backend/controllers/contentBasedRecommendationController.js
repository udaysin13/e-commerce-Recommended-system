/**
 * Content-Based Recommendation Controller
 * Handles API requests for content-based recommendations
 */

const asyncHandler = require("../middleware/asyncHandler");
const {
  getContentBasedRecommendations,
  analyzeProductSimilarity,
  getSimilarProducts,
} = require("../services/contentBasedRecommendationService");
const { extractNumericId } = require("../utils/helpers");
const logger = require("../utils/logger");

/**
 * GET /content-based-recommendations/:userId
 * Get content-based recommendations for a user
 * 
 * Query Parameters:
 * - minScore: Minimum similarity score (default: 0.3, range: 0-1)
 * - limit: Number of recommendations (default: 10, max: 50)
 * - excludePurchased: Exclude purchased products (default: true)
 * - excludeViewed: Exclude viewed products (default: false)
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = extractNumericId(req.params.userId);

  if (!userId) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // Parse and validate query parameters
  const minScore = Math.max(0, Math.min(1, parseFloat(req.query.minScore) || 0.3));
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const excludePurchased = req.query.excludePurchased !== "false";
  const excludeViewed = req.query.excludeViewed === "true";

  console.log("Fetching content-based recommendations", {
    userId,
    minScore,
    limit,
    excludePurchased,
    excludeViewed,
  });

  const recommendations = await getContentBasedRecommendations(userId, {
    minScore,
    limit,
    excludePurchased,
    excludeViewed,
  });

  res.json({
    userId,
    algorithm: "Content-Based Filtering",
    recommendations,
    count: recommendations.length,
    parameters: {
      minScore,
      limit,
      excludePurchased,
      excludeViewed,
    },
  });
});

/**
 * GET /content-based-recommendations/analyze/:userId/:productId
 * Analyze why a product is recommended to a user
 */
const analyzeRecommendation = asyncHandler(async (req, res) => {
  const userId = extractNumericId(req.params.userId);
  const productId = extractNumericId(req.params.productId);

  if (!userId || !productId) {
    return res.status(400).json({ error: "Invalid user or product ID" });
  }

  console.log("Analyzing product recommendation", { userId, productId });

  const analysis = await analyzeProductSimilarity(userId, productId);

  res.json({
    userId,
    analysis,
  });
});

/**
 * GET /similar-products/:productId
 * Find products similar to a specific product
 * 
 * Query Parameters:
 * - limit: Number of similar products (default: 10, max: 50)
 * - excludeOriginal: Exclude reference product (default: true)
 */
const getSimilar = asyncHandler(async (req, res) => {
  const productId = extractNumericId(req.params.productId);

  if (!productId) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const excludeOriginal = req.query.excludeOriginal !== "false";

  console.log("Finding similar products", {
    productId,
    limit,
    excludeOriginal,
  });

  const similarProducts = await getSimilarProducts(productId, {
    limit,
    excludeOriginal,
  });

  res.json({
    referenceProductId: productId,
    algorithm: "Content-Based Product Similarity",
    similarProducts,
    count: similarProducts.length,
    parameters: {
      limit,
      excludeOriginal,
    },
  });
});

module.exports = {
  getRecommendations,
  analyzeRecommendation,
  getSimilar,
};
