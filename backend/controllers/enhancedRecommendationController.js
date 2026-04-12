/**
 * Enhanced Recommendation Controller
 * 
 * Provides intelligent recommendations using:
 * - Weighted interaction scoring (PURCHASE > CLICK > VIEW)
 * - Recency decay factors
 * - Popularity boosts for trending products
 * - Clear explanations for each recommendation
 * - Scalable and efficient query patterns
 */

const asyncHandler = require("../middleware/asyncHandler");
const logger = require("../utils/logger");
const { validateUserId } = require("../utils/validators");
const prisma = require("../lib/prisma");
const {
  scoreUserInteractions,
  scoreSimilarUsersProducts,
  mergeAndBlendScores,
  generateExplanation,
  calculatePopularityScore,
} = require("./scoringService");

/**
 * GET /api/enhanced-recommendations/:userId
 * 
 * Get intelligent recommendations with detailed explanations
 * 
 * Query Parameters:
 * - algorithm: hybrid (default), collaborative, content, trending
 * - limit: 10 (default), max 50
 * - includeExplanations: true (default)
 */
const getEnhancedRecommendations = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  // 1. VALIDATE INPUT
  const { userId, error: userError } = validateUserId(req.params.userId);

  if (userError) {
    logger.warn("Invalid userId", { userId: req.params.userId });
    return res.status(400).json({
      success: false,
      error: userError,
      code: "INVALID_USER_ID",
    });
  }

  // 2. PARSE PARAMETERS
  const algorithm = (req.query.algorithm || "hybrid").toLowerCase();
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 50);
  const includeExplanations =
    req.query.includeExplanations !== "false";

  // 3. VALIDATE ALGORITHM
  const supportedAlgorithms = [
    "hybrid",
    "collaborative",
    "content",
    "trending",
  ];

  if (!supportedAlgorithms.includes(algorithm)) {
    return res.status(400).json({
      success: false,
      error: `Invalid algorithm: ${algorithm}`,
      code: "INVALID_ALGORITHM",
      supportedAlgorithms,
    });
  }

  logger.debug("Enhanced recommendations requested", {
    userId,
    algorithm,
    limit,
  });

  try {
    // 4. GET RECOMMENDATIONS BASED ON ALGORITHM
    let recommendations = [];
    let executionDetails = {};

    if (algorithm === "hybrid") {
      recommendations = await getHybridRecommendations(
        userId,
        limit,
        executionDetails
      );
    } else if (algorithm === "collaborative") {
      recommendations = await getCollaborativeRecommendations(
        userId,
        limit
      );
    } else if (algorithm === "content") {
      recommendations = await getContentRecommendations(userId, limit);
    } else if (algorithm === "trending") {
      recommendations = await getTrendingRecommendations(limit);
    }

    // 5. ADD EXPLANATIONS IF REQUESTED
    if (includeExplanations) {
      recommendations = recommendations.map((rec) => ({
        ...rec,
        explanation: generateExplanation(rec, rec),
      }));
    }

    // 6. TRACKING (Background - non-blocking)
    trackRecommendationImpression(userId, algorithm, recommendations).catch(
      logger.error
    );

    const executionTime = Date.now() - startTime;

    logger.info("Enhanced recommendations fetched", {
      userId,
      algorithm,
      count: recommendations.length,
      executionTime: `${executionTime}ms`,
    });

    // 7. RETURN RESPONSE
    return res.status(200).json({
      success: true,
      data: recommendations,
      metadata: {
        userId,
        algorithm,
        limit,
        count: recommendations.length,
        includeExplanations,
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching enhanced recommendations", {
      userId,
      algorithm,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
      code: "FETCH_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * HYBRID ALGORITHM
 * Combines collaborative filtering + content-based + trending
 * 
 * Weighting:
 * - Content-based (user's own interactions): 50%
 * - Collaborative (similar users): 35%
 * - Trending boost: 15%
 */
async function getHybridRecommendations(
  userId,
  limit,
  executionDetails = {}
) {
  try {
    // Get products from user's interactions (scored with weights/recency)
    const contentScored = await scoreUserInteractions(userId, {
      limit: limit * 2,
      recencyDays: 90,
    });

    // Get products from similar users (collaborative)
    const collaborativeScored = await scoreSimilarUsersProducts(userId, {
      limit: limit * 2,
      minSimilarity: 0.3,
    });

    // Get trending products
    const trendingProducts = await getTrendingProductsForUser(userId, limit);

    // Blend all sources
    const blended = mergeAndBlendScores([
      {
        products: contentScored,
        weight: 0.5,
        source: "Your interactions",
      },
      {
        products: collaborativeScored,
        weight: 0.35,
        source: "Users like you",
      },
      {
        products: trendingProducts,
        weight: 0.15,
        source: "Trending now",
      },
    ]);

    executionDetails.sources = {
      content: contentScored.length,
      collaborative: collaborativeScored.length,
      trending: trendingProducts.length,
      blended: blended.length,
    };

    return blended.slice(0, limit);
  } catch (error) {
    logger.error("Hybrid algorithm error", {
      userId,
      error: error.message,
    });
    // Fallback to trending
    return getTrendingRecommendations(limit);
  }
}

/**
 * COLLABORATIVE ALGORITHM
 * Recommends products from similar users
 */
async function getCollaborativeRecommendations(userId, limit) {
  try {
    const recommendations = await scoreSimilarUsersProducts(userId, {
      limit,
      minSimilarity: 0.3,
    });

    return recommendations.map((r) => ({
      ...r,
      algorithmExplain: "Based on users with similar purchase history",
    }));
  } catch (error) {
    logger.error("Collaborative algorithm error", {
      userId,
      error: error.message,
    });
    return [];
  }
}

/**
 * CONTENT-BASED ALGORITHM
 * Recommends products similar to ones user interacted with
 */
async function getContentRecommendations(userId, limit) {
  try {
    const recommendations = await scoreUserInteractions(userId, {
      limit,
      recencyDays: 90,
    });

    return recommendations.map((r) => ({
      ...r,
      algorithmExplain:
        "Based on categories and products you've interacted with",
    }));
  } catch (error) {
    logger.error("Content algorithm error", {
      userId,
      error: error.message,
    });
    return [];
  }
}

/**
 * TRENDING ALGORITHM
 * Recommends products that are trending (popular + recent interactions)
 */
async function getTrendingRecommendations(limit) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get products with recent high-value interactions
    const trendingInteractions = await prisma.interaction.groupBy({
      by: ["productId"],
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      _sum: {
        weight: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          weight: "desc",
        },
      },
      take: limit * 2,
    });

    const productIds = trendingInteractions.map((t) => t.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Score by weight sum (already sorted)
    const scored = trendingInteractions.map((trend) => {
      const product = products.find((p) => p.id === trend.productId);
      return {
        ...product,
        interactionWeight: trend._sum.weight || 0,
        interactionCount: trend._count,
        algorithmExplain: "Trending with users this week",
      };
    });

    return scored.slice(0, limit);
  } catch (error) {
    logger.error("Trending algorithm error", { error: error.message });
    return [];
  }
}

/**
 * GET TRENDING PRODUCTS (FOR USER)
 * Get trending products that the user hasn't interacted with
 */
async function getTrendingProductsForUser(userId, limit) {
  try {
    // Get user's product history
    const userInteractions = await prisma.interaction.findMany({
      where: { userId },
      select: { productId: true },
      distinct: ["productId"],
    });

    const userProductIds = userInteractions.map((i) => i.productId);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get trending products (excluding user's interactions)
    const trending = await prisma.interaction.groupBy({
      by: ["productId"],
      where: {
        createdAt: { gte: sevenDaysAgo },
        productId: { notIn: userProductIds },
      },
      _sum: { weight: true },
      _count: true,
      orderBy: { _sum: { weight: "desc" } },
      take: limit,
    });

    const productIds = trending.map((t) => t.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Add popularity scores
    return productIds.map((id) => {
      const product = products.find((p) => p.id === id);
      const trend = trending.find((t) => t.productId === id);
      const popularity = calculatePopularityScore(
        product,
        trend._count || 0
      );

      return {
        ...product,
        trendingScore:
          (trend._sum.weight || 0) * popularity.score,
        isTrending: popularity.isTrending,
      };
    });
  } catch (error) {
    logger.error("Error getting trending products for user", {
      userId,
      error: error.message,
    });
    return [];
  }
}

/**
 * TRACK IMPRESSION (Background)
 * Record that recommendations were shown (for analytics)
 */
async function trackRecommendationImpression(userId, algorithm, recommendations) {
  try {
    // Could log to analytics service, database, etc.
    logger.debug("Recommendation impression tracked", {
      userId,
      algorithm,
      productCount: recommendations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn("Failed to track recommendation impression", {
      error: error.message,
    });
  }
}

/**
 * GET /api/enhanced-recommendations/:userId/details
 * 
 * Get detailed scoring breakdown for debugging/transparency
 */
const getRecommendationDetails = asyncHandler(async (req, res) => {
  const { userId, error } = validateUserId(req.params.userId);

  if (error) {
    return res.status(400).json({
      success: false,
      error,
      code: "INVALID_USER_ID",
    });
  }

  try {
    // Get user's recent interactions
    const interactions = await prisma.interaction.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Calculate scores for each
    const scoredInteractions = interactions.map((i) => {
      const {
        calculateInteractionScore,
        calculateRecencyDecay,
      } = require("./scoringService");

      const baseScore = calculateInteractionScore(i);
      const recencyFactor = calculateRecencyDecay(i.createdAt);

      return {
        product: {
          id: i.product.id,
          name: i.product.name,
          category: i.product.category,
        },
        interaction: {
          type: i.type,
          weight: i.weight,
          date: i.createdAt,
        },
        scoring: {
          baseScore,
          recencyFactor,
          finalScore: baseScore,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        userId,
        recentInteractions: scoredInteractions,
        scoringSystem: {
          weights: {
            PURCHASE: 5.0,
            REVIEW: 4.0,
            WISHLIST: 3.0,
            COMPARE: 3.0,
            CLICK: 2.0,
            VIEW: 1.0,
          },
          recencyHalfLife: "30 days",
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching recommendation details", {
      userId,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch details",
      code: "FETCH_ERROR",
    });
  }
});

// ============================================
// EXPORTS
// ============================================

module.exports = {
  getEnhancedRecommendations,
  getRecommendationDetails,
};
