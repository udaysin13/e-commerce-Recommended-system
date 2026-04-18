/**
 * Advanced Recommendation Controller
 * Handles intermediate-level recommendations with behavior tracking
 */

const asyncHandler = require("../middleware/asyncHandler");
const {
  getSmartRecommendations,
  getUsersAlsoBought,
  getAdvancedCollaborativeRecommendations,
  getAdvancedContentBasedRecommendations,
  getUserBehaviorScore,
  getProductMetadata,
  trackProductView,
} = require("../services/advancedRecommendationService");

/**
 * GET /advanced-recommendations/:userId
 * Smart recommendations combining all signals
 * Automatically chooses best algorithm based on user behavior
 *
 * Query params:
 * - product_id: If user is viewing a product, include context
 * - limit: Number of recommendations (default: 12)
 */
const getSmartRecs = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const productId = req.query.product_id ? Number(req.query.product_id) : null;
  const limit = Number(req.query.limit) || 12;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const data = await getSmartRecommendations(userId, productId, limit);

  return res.json({
    recommendations: data.recommendations,
    userBehavior: data.userBehavior,
    algorithm: "Smart (Behavior-Aware)",
    description: "Combines all signals: views, purchases, similar users",
    userId,
    contextProduct: productId || null,
    count: data.recommendations.length,
  });
});

/**
 * GET /advanced-recommendations/:userId/users-also-bought
 * "Users Also Bought" - Co-purchase analysis
 * Shows what other users bought with a specific product
 *
 * Query params:
 * - product_id: Product to analyze (required)
 * - limit: Number of recommendations (default: 8)
 */
const getUsersAlsoBoughtRecs = asyncHandler(async (req, res) => {
  const productId = req.query.product_id ? Number(req.query.product_id) : null;
  const limit = Number(req.query.limit) || 8;

  if (!productId || productId <= 0) {
    return res.status(400).json({
      error: "product_id query parameter is required",
    });
  }

  const items = await getUsersAlsoBought(productId, limit);

  return res.json({
    recommendations: items,
    algorithm: "Co-Purchase Analysis",
    description: "What users bought together with this product",
    productId,
    count: items.length,
    interpretation: `${items.length} products frequently bought with this item`,
  });
});

/**
 * GET /advanced-recommendations/:userId/collaborative-advanced
 * Advanced Collaborative Filtering
 * Finds similar users and their purchases with confidence scores
 */
const getAdvancedCollaborativeRecs = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const limit = Number(req.query.limit) || 8;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const items = await getAdvancedCollaborativeRecommendations(userId, limit);

  // Add interpretation
  const avgConfidence =
    items.length > 0
      ? Math.round(
          items.reduce((sum, item) => sum + (item.confidence || 0), 0) / items.length
        )
      : 0;

  return res.json({
    recommendations: items,
    algorithm: "Advanced Collaborative Filtering",
    description: "Based on users with similar purchase patterns",
    userId,
    count: items.length,
    averageConfidence: avgConfidence,
    interpretation:
      avgConfidence > 80
        ? "High confidence recommendations (similar users love these)"
        : avgConfidence > 60
          ? "Moderate confidence recommendations"
          : "Low confidence - limited similar user data",
  });
});

/**
 * GET /advanced-recommendations/:userId/content-advanced
 * Advanced Content-Based Recommendations
 * Analyzes user preferences and behavioral patterns
 */
const getAdvancedContentBasedRecs = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const limit = Number(req.query.limit) || 8;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const items = await getAdvancedContentBasedRecommendations(userId, limit);

  return res.json({
    recommendations: items,
    algorithm: "Advanced Content-Based",
    description: "Based on your browsing preferences and behavior",
    userId,
    count: items.length,
    interpretation:
      items.length > 0
        ? `Found ${items.length} products matching your interests (categories: ${[...new Set(items.map((i) => i.category))].join(", ")})`
        : "No preferences detected - browse more products",
  });
});

/**
 * GET /advanced-recommendations/:userId/behavior
 * User Behavior Analytics
 * Shows user engagement metrics and scoring
 */
const getUserBehaviorAnalytics = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const behavior = await getUserBehaviorScore(userId);

  return res.json({
    userId,
    analytics: {
      viewCount: behavior.viewCount,
      purchaseCount: behavior.purchaseCount,
      cartItems: behavior.cartItems,
      engagementScore: behavior.engagementScore,
      loyaltyScore: behavior.loyaltyScore,
      overallScore: behavior.score,
    },
    classification: {
      activityLevel: behavior.activityLevel,
      userType:
        behavior.purchaseCount > 5
          ? "Loyal Customer"
          : behavior.purchaseCount > 0
            ? "Repeat Customer"
            : behavior.viewCount > 0
              ? "Active Browser"
              : "New User",
    },
    interpretation: {
      engagement:
        behavior.engagementScore > 50
          ? "Highly engaged user"
          : behavior.engagementScore > 20
            ? "Moderately engaged"
            : "New to platform",
      purchases:
        behavior.purchaseCount > 0
          ? `Made ${behavior.purchaseCount} purchase(s)`
          : "No purchases yet",
      recommendationStrategy:
        behavior.purchaseCount > 0
          ? "Collaborative filtering recommended"
          : "Content-based filtering recommended",
    },
  });
});

/**
 * GET /advanced-recommendations/product/:productId/metadata
 * Product Analytics
 * Views, purchases, recommendation score
 */
const getProductAnalytics = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);

  if (!productId || productId <= 0) {
    return res.status(400).json({ error: "Valid productId is required" });
  }

  const metadata = await getProductMetadata(productId);

  if (!metadata) {
    return res.status(404).json({ error: "Product not found" });
  }

  return res.json({
    productId,
    analytics: {
      views: metadata.viewCount,
      purchases: metadata.purchaseCount,
      daysOnMarket: metadata.daysOld,
    },
    recommendation: {
      score: metadata.score,
      quality:
        metadata.score > 150
          ? "Excellent"
          : metadata.score > 120
            ? "Very Good"
            : metadata.score > 100
              ? "Good"
              : "Fair",
    },
    interpretation: {
      popularity: `Viewed ${metadata.viewCount} times, purchased ${metadata.purchaseCount} times`,
      conversionRate:
        metadata.viewCount > 0
          ? `${Math.round((metadata.purchaseCount / metadata.viewCount) * 100)}% conversion`
          : "No views yet",
      performance:
        metadata.purchaseCount > metadata.viewCount * 0.1
          ? "High performing product"
          : metadata.purchaseCount > 0
            ? "Good performer"
            : "Needs attention",
    },
  });
});

/**
 * POST /advanced-recommendations/track-view
 * Track user product view
 * Stores view in database for analytics
 *
 * Body: { userId, productId }
 */
const trackUserView = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({
      error: "userId and productId are required",
    });
  }

  const view = await trackProductView(userId, productId);

  return res.status(201).json({
    message: "View tracked successfully",
    view,
    analytics: {
      tracked: true,
      timestamp: new Date(),
      data: { userId, productId },
    },
  });
});

/**
 * GET /advanced-recommendations/:userId/analysis
 * Comprehensive recommendation analysis
 * Shows why recommendations were made
 */
const getRecommendationAnalysis = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const productId = req.query.product_id ? Number(req.query.product_id) : null;
  const limit = Number(req.query.limit) || 6;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  // Get all components
  const behavior = await getUserBehaviorScore(userId);
  const smart = await getSmartRecommendations(userId, productId, limit);

  return res.json({
    userId,
    analysis: {
      userProfile: {
        type:
          behavior.purchaseCount > 5
            ? "Loyal Customer"
            : behavior.purchaseCount > 0
              ? "Repeat Customer"
              : behavior.viewCount > 0
                ? "Active Browser"
                : "New User",
        engagement: behavior.engagementScore,
        loyalty: behavior.loyaltyScore,
        viewsTracked: behavior.viewCount,
        purchasesMade: behavior.purchaseCount,
      },
      recommendations: {
        count: smart.recommendations.length,
        sources: [
          behavior.viewCount > 0 ? "Content-Based Analysis" : null,
          behavior.purchaseCount > 0 ? "Collaborative Matching" : null,
          productId ? "Co-Purchase Patterns" : null,
        ].filter(Boolean),
        topConfidenceRecommendation: smart.recommendations[0]
          ? {
              name: smart.recommendations[0].name,
              confidence: smart.recommendations[0].confidence,
              reason: smart.recommendations[0].recommendedBecause,
            }
          : null,
      },
      dataQuality: {
        hasViewHistory: behavior.viewCount > 0,
        hasPurchaseHistory: behavior.purchaseCount > 0,
        suffcientData: behavior.engagementScore > 20,
        confidenceLevel:
          behavior.engagementScore > 50 ? "High" : behavior.engagementScore > 20 ? "Medium" : "Low",
      },
    },
  });
});

module.exports = {
  getSmartRecs,
  getUsersAlsoBoughtRecs,
  getAdvancedCollaborativeRecs,
  getAdvancedContentBasedRecs,
  getUserBehaviorAnalytics,
  getProductAnalytics,
  trackUserView,
  getRecommendationAnalysis,
};
