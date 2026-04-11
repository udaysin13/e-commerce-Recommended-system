const {
  getHybridRecommendations,
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getCategoryBasedRecommendations,
  getPopularProducts,
  getTrendingProducts,
  getSimilarProducts,
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
 * GET /recommendations/:userId
 * Primary endpoint - returns hybrid recommendations
 */
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const limit = Number(req.query.limit) || 12;
  const type = req.query.type || "hybrid"; // hybrid, content, collaborative, category

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required" });
  }

  let items = [];
  let algorithm = "";

  switch (type.toLowerCase()) {
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

    default:
      items = await getHybridRecommendations(userId, limit);
      algorithm = "Hybrid (Combined)";
  }

  return res.json({
    recommendations: items,
    algorithm,
    userId,
    type,
    count: items.length,
    queryParameters: {
      limit,
      type: "Supported: hybrid, content, collaborative, category, popular, trending",
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
};
