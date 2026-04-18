/**
 * Collaborative Filtering Recommendation Controller
 * Handles API requests for collaborative filtering recommendations
 */

const asyncHandler = require("../middleware/asyncHandler");
const { getCollaborativeRecommendations, analyzeUserSimilarity } = require("../services/collaborativeFilteringService");
const { extractNumericId } = require("../utils/helpers");
const logger = require("../utils/logger");

/**
 * GET /collaborative-recommendations/:userId
 * Get collaborative filtering recommendations for a user
 * 
 * Query Parameters:
 * - topK: Number of similar users to consider (default: 10, max: 100)
 * - minSimilarity: Minimum similarity threshold (default: 0.3, range: 0-1)
 * - limit: Number of recommendations (default: 10, max: 50)
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = extractNumericId(req.params.userId);
  
  if (!userId) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // Parse and validate query parameters
  const topK = Math.min(parseInt(req.query.topK) || 10, 100);
  const minSimilarity = Math.max(0, Math.min(1, parseFloat(req.query.minSimilarity) || 0.3));
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  console.log("Fetching collaborative recommendations", {
    userId,
    topK,
    minSimilarity,
    limit,
  });

  const recommendations = await getCollaborativeRecommendations(userId, {
    topK,
    minSimilarity,
    limit,
  });

  res.json({
    userId,
    algorithm: "Collaborative Filtering (Cosine Similarity)",
    recommendations,
    count: recommendations.length,
    parameters: {
      topK,
      minSimilarity,
      limit,
    },
  });
});

/**
 * GET /collaborative-recommendations/analysis/:userId
 * Analyze user similarity distribution (for debugging/monitoring)
 */
const analyzeSimilarity = asyncHandler(async (req, res) => {
  const userId = extractNumericId(req.params.userId);

  if (!userId) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  console.log("Analyzing user similarity", { userId });

  const analysis = await analyzeUserSimilarity(userId);

  res.json({
    userId,
    analysis,
    recommendation: {
      message: analysis.totalSimilarUsers === 0 
        ? "User has no similar users, consider providing more interactions"
        : analysis.averageSimilarity < 0.4
        ? "Low average similarity - recommendations may be less personalized"
        : "Good similarity distribution",
    },
  });
});

module.exports = {
  getRecommendations,
  analyzeSimilarity,
};
