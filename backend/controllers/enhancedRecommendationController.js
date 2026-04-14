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
} = require("../services/scoringService");

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
  const validation = validateUserId(req.params.userId);

  if (!validation.valid || !validation.userId) {
    console.warn("Invalid userId", { userId: req.params.userId });
    return res.status(400).json({
      success: false,
      error: validation.error || "Invalid user ID",
      code: "INVALID_USER_ID",
    });
  }

  const userId = validation.userId;

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

  console.log("Enhanced recommendations requested", {
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
      (err) => console.error("Tracking error:", err)
    );

    const executionTime = Date.now() - startTime;

    console.log("Enhanced recommendations fetched", {
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
    console.error("Error fetching enhanced recommendations", {
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
    console.error("Hybrid algorithm error", {
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
    console.error("Collaborative algorithm error", {
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
    console.error("Content algorithm error", {
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

    const [recentViews, recentPurchases] = await Promise.all([
      prisma.viewHistory.groupBy({
        by: ["productId"],
        where: { viewedAt: { gte: sevenDaysAgo } },
        _count: { productId: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: { productId: true },
        _sum: { quantity: true },
      }),
    ]);

    const productScores = new Map();

    recentViews.forEach((view) => {
      productScores.set(view.productId, {
        productId: view.productId,
        interactionWeight: view._count.productId,
        interactionCount: view._count.productId,
      });
    });

    recentPurchases.forEach((purchase) => {
      const existing = productScores.get(purchase.productId) || {
        productId: purchase.productId,
        interactionWeight: 0,
        interactionCount: 0,
      };
      const purchaseCount = purchase._sum.quantity || purchase._count.productId;
      existing.interactionWeight += purchaseCount * 5;
      existing.interactionCount += purchase._count.productId;
      productScores.set(purchase.productId, existing);
    });

    const trendingInteractions = Array.from(productScores.values())
      .sort((a, b) => b.interactionWeight - a.interactionWeight)
      .slice(0, limit * 2);

    if (trendingInteractions.length === 0) {
      const fallbackProducts = await prisma.product.findMany({
        orderBy: [{ rating: "desc" }, { reviews: "desc" }, { createdAt: "desc" }],
        take: limit,
      });

      return fallbackProducts.map((product) => ({
        ...product,
        interactionWeight: 0,
        interactionCount: 0,
        algorithmExplain: "Popular products from the catalog",
      }));
    }

    const productIds = trendingInteractions.map((t) => t.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Score by weight sum (already sorted)
    const scored = trendingInteractions.map((trend) => {
      const product = products.find((p) => p.id === trend.productId);
      return {
        ...product,
        interactionWeight: trend.interactionWeight,
        interactionCount: trend.interactionCount,
        algorithmExplain: "Trending with users this week",
      };
    }).filter((product) => product.id);

    return scored.slice(0, limit);
  } catch (error) {
    console.error("Trending algorithm error", { error: error.message });
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
    const [userViews, userPurchases] = await Promise.all([
      prisma.viewHistory.findMany({
        where: { userId },
        select: { productId: true },
        distinct: ["productId"],
      }),
      prisma.orderItem.findMany({
        where: { userId },
        select: { productId: true },
        distinct: ["productId"],
      }),
    ]);

    const userInteractions = [...userViews, ...userPurchases];
    const userProductIds = [...new Set(userInteractions.map((i) => i.productId))];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentViews, recentPurchases] = await Promise.all([
      prisma.viewHistory.groupBy({
        by: ["productId"],
        where: {
          viewedAt: { gte: sevenDaysAgo },
          productId: { notIn: userProductIds },
        },
        _count: { productId: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          createdAt: { gte: sevenDaysAgo },
          productId: { notIn: userProductIds },
        },
        _count: { productId: true },
        _sum: { quantity: true },
      }),
    ]);

    const productScores = new Map();

    recentViews.forEach((view) => {
      productScores.set(view.productId, {
        productId: view.productId,
        weight: view._count.productId,
        count: view._count.productId,
      });
    });

    recentPurchases.forEach((purchase) => {
      const existing = productScores.get(purchase.productId) || {
        productId: purchase.productId,
        weight: 0,
        count: 0,
      };
      const purchaseCount = purchase._sum.quantity || purchase._count.productId;
      existing.weight += purchaseCount * 5;
      existing.count += purchase._count.productId;
      productScores.set(purchase.productId, existing);
    });

    const trending = Array.from(productScores.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);

    if (trending.length === 0) {
      return getTrendingRecommendations(limit);
    }

    const productIds = trending.map((t) => t.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Add popularity scores
    return productIds.map((id) => {
      const product = products.find((p) => p.id === id);
      const trend = trending.find((t) => t.productId === id);
      if (!product || !trend) return null;
      const popularity = calculatePopularityScore(product, trend.count || 0);

      return {
        ...product,
        trendingScore: trend.weight * popularity.score,
        isTrending: popularity.isTrending,
      };
    }).filter(Boolean);
  } catch (error) {
    console.error("Error getting trending products for user", {
      userId,
      error: error.message,
    });
    return [];
  }
}

async function getUserRecommendationInteractions(userId) {
  const [views, purchases] = await Promise.all([
    prisma.viewHistory.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { viewedAt: "desc" },
      take: 20,
    }),
    prisma.orderItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return [
    ...views.map((view) => ({
      product: view.product,
      type: "VIEW",
      weight: 1,
      date: view.viewedAt,
    })),
    ...purchases.map((item) => ({
      product: item.product,
      type: "PURCHASE",
      weight: item.quantity || 1,
      date: item.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * TRACK IMPRESSION (Background)
 * Record that recommendations were shown (for analytics)
 */
async function trackRecommendationImpression(userId, algorithm, recommendations) {
  try {
    // Could log to analytics service, database, etc.
    console.log("Recommendation impression tracked", {
      userId,
      algorithm,
      productCount: recommendations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Failed to track recommendation impression", {
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
  const validation = validateUserId(req.params.userId);

  if (!validation.valid || !validation.userId) {
    return res.status(400).json({
      success: false,
      error: validation.error || "Invalid user ID",
      code: "INVALID_USER_ID",
    });
  }

  const userId = validation.userId;

  try {
    // Get user's recent views and purchases
    const interactions = await getUserRecommendationInteractions(userId);

    // Calculate scores for each
    const scoredInteractions = interactions.map((i) => {
      const {
        calculateInteractionScore,
        calculateRecencyDecay,
      } = require("../services/scoringService");

      const baseScore = calculateInteractionScore({
        type: i.type,
        weight: i.weight,
        createdAt: i.date,
      });
      const recencyFactor = calculateRecencyDecay(i.date);

      return {
        product: {
          id: i.product.id,
          name: i.product.name,
          category: i.product.category,
        },
        interaction: {
          type: i.type,
          weight: i.weight,
          date: i.date,
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
    console.error("Error fetching recommendation details", {
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
