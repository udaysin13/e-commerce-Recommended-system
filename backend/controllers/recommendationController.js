const {
  getHybridRecommendations,
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getCategoryBasedRecommendations,
  getRecommendationOverview,
  getPopularProducts,
  getTrendingProducts,
  getSimilarProducts,
  getCategorySimilarity,
  getUsersAlsoBought,
  getRecentlyViewedProducts,
  trackProductView,
} = require("../services/recommendationService");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * GET /recommendations/:userId/hybrid
 * Hybrid recommendations combining all algorithms
 */
const getHybridRecs = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const limit = Number(req.query.limit) || 12;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const items = await getHybridRecommendations(userId, limit);

  return res.json({
    recommendations: items,
    algorithm: "Hybrid (Content-based + Collaborative + Trending)",
    userId,
    count: items.length,
  });
});

/**
 * GET /recommendations/:userId/content-based
 * Content-based recommendations (based on user's browsing history)
 */
const getContentBasedRecs = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const limit = Number(req.query.limit) || 8;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const items = await getContentBasedRecommendations(userId, limit);

  return res.json({
    recommendations: items,
    algorithm: "Content-Based Filtering",
    description: "Based on products you've viewed",
    userId,
    count: items.length,
  });
});

/**
 * GET /recommendations/:userId/collaborative
 * Collaborative recommendations (based on similar users' purchases)
 */
const getCollaborativeRecs = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const limit = Number(req.query.limit) || 8;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const items = await getCollaborativeRecommendations(userId, limit);

  return res.json({
    recommendations: items,
    algorithm: "Collaborative Filtering",
    description: "Based on users with similar purchase history",
    userId,
    count: items.length,
  });
});

/**
 * GET /recommendations/:userId/category
 * Category-based recommendations (based on favorite categories)
 */
const getCategoryRecs = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const limit = Number(req.query.limit) || 8;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const items = await getCategoryBasedRecommendations(userId, limit);

  return res.json({
    recommendations: items,
    algorithm: "Category-Based Filtering",
    description: "Popular products in your favorite categories",
    userId,
    count: items.length,
  });
});

/**
 * GET /recommendations/popular
 * Get popular products (no userId required)
 */
const getPopularRecs = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;

  const items = await getPopularProducts(limit);

  return res.json({
    recommendations: items,
    algorithm: "Popularity",
    description: "Highest-rated products",
    count: items.length,
  });
});

/**
 * GET /recommendations/trending
 * Get trending products (no userId required)
 */
const getTrendingRecs = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;

  const items = await getTrendingProducts(limit);

  return res.json({
    recommendations: items,
    algorithm: "Trending",
    description: "Newest high-rated products",
    count: items.length,
  });
});

/**
 * GET /recommendations/recently-viewed/:userId
 * Recently viewed products for a user
 */
const getRecentlyViewedRecs = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const limit = Number(req.query.limit) || 8;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const items = await getRecentlyViewedProducts(userId, limit);

  return res.json({
    recommendations: items,
    algorithm: "Recently Viewed",
    description: "Products this user viewed most recently",
    userId,
    count: items.length,
  });
});

/**
 * POST /recommendations/track-view
 * Track a product view for recently viewed and content-based recommendations
 */
const trackView = asyncHandler(async (req, res) => {
  const userId = Number(req.body.userId);
  const productId = Number(req.body.productId);

  if (!userId || userId <= 0 || !productId || productId <= 0) {
    return res.status(400).json({ error: "Valid userId and productId are required" });
  }

  const view = await trackProductView(userId, productId);

  return res.status(201).json({
    message: "Product view tracked",
    view,
  });
});

/**
 * GET /recommendations/:productId/similar
 * Get similar products to a specific product
 */
const getSimilarRecs = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);

  if (!productId || productId <= 0) {
    return res.status(400).json({ error: "Valid productId is required" });
  }

  const items = await getSimilarProducts(productId);

  return res.json({
    recommendations: items,
    algorithm: "Similar Products",
    description: "Products similar to the one you're viewing",
    productId,
    count: items.length,
  });
});

/**
 * GET /recommendations/category-similarity/:productId
 * Category similarity recommendations for a product
 */
const getCategorySimilarityRecs = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  const limit = Number(req.query.limit) || 8;

  if (!productId || productId <= 0) {
    return res.status(400).json({ error: "Valid productId is required" });
  }

  const items = await getCategorySimilarity(productId, limit);

  return res.json({
    recommendations: items,
    algorithm: "Category Similarity",
    description: "Same-category products with similar price backup",
    productId,
    count: items.length,
  });
});

/**
 * GET /recommendations/users-also-bought/:productId
 * Co-purchase recommendations for a product
 */
const getUsersAlsoBoughtRecs = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  const limit = Number(req.query.limit) || 8;

  if (!productId || productId <= 0) {
    return res.status(400).json({ error: "Valid productId is required" });
  }

  const items = await getUsersAlsoBought(productId, limit);

  return res.json({
    recommendations: items,
    algorithm: "Users Who Bought This Also Bought",
    description: "Products frequently purchased in the same orders",
    productId,
    count: items.length,
  });
});

/**
 * GET /recommendations/:userId/overview
 * Combined recommendation payload for product detail or home pages
 */
const getOverviewRecs = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const productId = req.query.productId ? Number(req.query.productId) : null;
  const limit = Number(req.query.limit) || 8;

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  const overview = await getRecommendationOverview(userId, productId, limit);

  return res.json({
    algorithm: "Recommendation Overview",
    userId,
    productId,
    limit,
    ...overview,
  });
});

/**
 * GET /recommendations/:userId
 * Primary endpoint - returns recommendations with standard response format
 * 
 * Query Parameters:
 * - limit: Number of recommendations (default: 12, max: 50)
 * - type: Algorithm type (default: hybrid)
 *   Options: hybrid, content, collaborative, category, popular, trending, recently-viewed
 * 
 * Response Format:
 * {
 *   success: true,
 *   data: [...recommendations],
 *   metadata: {
 *     userId: 1,
 *     algorithm: "Hybrid",
 *     count: 12,
 *     type: "hybrid",
 *     limit: 12
 *   }
 * }
 */
const getRecommendations = asyncHandler(async (req, res) => {
  // Validate userId parameter
  const userId = req.params.userId ? Number(req.params.userId) : null;

  if (!userId || !Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid userId. Must be a positive integer.",
      code: "INVALID_USER_ID",
    });
  }

  // Parse query parameters with validation
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 12), 50);
  const type = (req.query.type || "hybrid").toLowerCase().trim();

  // Supported recommendation types
  const supportedTypes = [
    "hybrid",
    "content",
    "content-based",
    "collaborative",
    "category",
    "popular",
    "trending",
    "recent",
    "recently-viewed",
  ];

  if (!supportedTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid recommendation type: "${type}"`,
      supportedTypes: supportedTypes,
      code: "INVALID_TYPE",
    });
  }

  let items = [];
  let algorithm = "";

  // Route to appropriate recommendation algorithm
  try {
    switch (type) {
      case "content":
      case "content-based":
        items = await getContentBasedRecommendations(userId, limit);
        algorithm = "Content-Based Filtering";
        break;

      case "collaborative":
        items = await getCollaborativeRecommendations(userId, limit);
        algorithm = "Collaborative Filtering";
        break;

      case "category":
        items = await getCategoryBasedRecommendations(userId, limit);
        algorithm = "Category-Based Filtering";
        break;

      case "popular":
        items = await getPopularProducts(limit);
        algorithm = "Popularity";
        break;

      case "trending":
        items = await getTrendingProducts(limit);
        algorithm = "Trending";
        break;

      case "recent":
      case "recently-viewed":
        items = await getRecentlyViewedProducts(userId, limit);
        algorithm = "Recently Viewed";
        break;

      default:
        items = await getHybridRecommendations(userId, limit);
        algorithm = "Hybrid (Combined)";
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
      message: err.message,
      code: "FETCH_ERROR",
    });
  }

  // Return standardized response format
  return res.status(200).json({
    success: true,
    data: items || [],
    metadata: {
      userId,
      algorithm,
      type,
      limit,
      count: items ? items.length : 0,
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = {
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
};
