/**
 * EXAMPLE: Comprehensive Express Recommendation Controller
 * 
 * Shows best practices for:
 * - Parameter validation
 * - Error handling
 * - Async/await patterns
 * - Standard response format
 * - Logging and monitoring
 * 
 * Copy patterns from here to create your own controllers
 */

const asyncHandler = require("../middleware/asyncHandler");
const { validateUserId } = require("../utils/validators");
const logger = require("../utils/logger");

/**
 * EXAMPLE 1: Basic Recommendations Endpoint
 * GET /recommendations/:userId
 * 
 * Demonstrates:
 * - Input validation with helper functions
 * - Async/await error handling
 * - Standard JSON response format
 * - Proper HTTP status codes
 */
const exampleBasicRecommendations = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  // 1. VALIDATE INPUT
  const userId = req.params.userId ? Number(req.params.userId) : null;
  
  if (!userId || !Number.isInteger(userId) || userId <= 0) {
    logger.warn("Invalid userId provided", { userId, ip: req.ip });
    return res.status(400).json({
      success: false,
      error: "Invalid userId. Must be a positive integer.",
      code: "INVALID_USER_ID",
      timestamp: new Date().toISOString(),
    });
  }

  // 2. PARSE QUERY PARAMETERS
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 50);
  const page = Math.max(1, Number(req.query.page) || 1);

  logger.debug("Fetching recommendations", { userId, limit, page });

  try {
    // 3. CALL SERVICE LAYER
    // const recommendations = await recommendationService.getRecommendations(userId, limit);
    
    // Mock data for example
    const recommendations = [
      {
        id: 1,
        name: "Product Name",
        category: "Electronics",
        price: 99.99,
        rating: 4.5,
        score: 0.85,
      },
    ];

    const executionTime = Date.now() - startTime;

    logger.info("Recommendations retrieved successfully", {
      userId,
      count: recommendations.length,
      executionTime: `${executionTime}ms`,
    });

    // 4. RETURN STANDARD RESPONSE FORMAT
    return res.status(200).json({
      success: true,
      data: recommendations,
      metadata: {
        userId,
        count: recommendations.length,
        limit,
        page,
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // 5. HANDLE ERRORS PROPERLY
    logger.error("Error fetching recommendations", {
      userId,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
      code: "FETCH_ERROR",
      message: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * EXAMPLE 2: Advanced Recommendations with Type Selection
 * GET /recommendations/:userId?type=hybrid&limit=10&minScore=0.3
 * 
 * Demonstrates:
 * - Multiple validation checks
 * - Query parameter parsing
 * - Conditional logic
 * - Different response structures
 */
const exampleAdvancedRecommendations = asyncHandler(async (req, res) => {
  // 1. VALIDATE userId
  const { userId, error: userError } = validateUserId(req.params.userId);
  
  if (userError) {
    return res.status(400).json({
      success: false,
      error: userError,
      code: "INVALID_USER_ID",
    });
  }

  // 2. PARSE AND VALIDATE QUERY PARAMS
  const type = (req.query.type || "hybrid").toLowerCase().trim();
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 10), 50);
  const minScore = Math.max(0, Math.min(1, Number(req.query.minScore) || 0));

  // 3. VALIDATE TYPE
  const supportedTypes = ["hybrid", "content", "collaborative", "category", "trending"];
  if (!supportedTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid type: "${type}". Supported: ${supportedTypes.join(", ")}`,
      code: "INVALID_TYPE",
    });
  }

  logger.debug("Advanced recommendations requested", {
    userId,
    type,
    limit,
    minScore,
  });

  try {
    // 4. ROUTE TO APPROPRIATE SERVICE BASED ON TYPE
    let recommendations = [];
    let algorithm = "";

    switch (type) {
      case "content":
        // recommendations = await contentBasedService.getRecommendations(userId, limit);
        algorithm = "Content-Based Filtering";
        break;

      case "collaborative":
        // recommendations = await collaborativeService.getRecommendations(userId, limit);
        algorithm = "Collaborative Filtering";
        break;

      case "category":
        // recommendations = await categoryService.getRecommendations(userId, limit);
        algorithm = "Category-Based";
        break;

      case "trending":
        // recommendations = await trendingService.getRecommendations(limit);
        algorithm = "Trending";
        break;

      default:
        // recommendations = await hybridService.getRecommendations(userId, limit);
        algorithm = "Hybrid (Combined)";
    }

    // 5. FILTER BY SCORE IF PROVIDED
    if (minScore > 0) {
      // recommendations = recommendations.filter(r => r.score >= minScore);
    }

    // 6. RETURN RESPONSE WITH ALGORITHM INFO
    return res.status(200).json({
      success: true,
      data: recommendations || [],
      metadata: {
        userId,
        algorithm,
        type,
        limit,
        minScore,
        count: recommendations ? recommendations.length : 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching advanced recommendations", {
      userId,
      type,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
      code: "FETCH_ERROR",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * EXAMPLE 3: Batch Recommendations
 * POST /recommendations/batch
 * Body: { userIds: [1, 2, 3] }
 * 
 * Demonstrates:
 * - POST request handling
 * - Batch processing
 * - Array validation
 * - Parallel async operations
 */
const exampleBatchRecommendations = asyncHandler(async (req, res) => {
  // 1. VALIDATE REQUEST BODY
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds)) {
    return res.status(400).json({
      success: false,
      error: "userIds must be an array",
      code: "INVALID_BODY",
    });
  }

  if (userIds.length === 0 || userIds.length > 100) {
    return res.status(400).json({
      success: false,
      error: "userIds array must contain 1-100 items",
      code: "INVALID_ARRAY_SIZE",
    });
  }

  // 2. VALIDATE EACH USER ID
  const validUserIds = userIds.filter((id) => {
    const num = Number(id);
    return Number.isInteger(num) && num > 0;
  });

  if (validUserIds.length !== userIds.length) {
    return res.status(400).json({
      success: false,
      error: "All items in userIds must be positive integers",
      code: "INVALID_USER_IDS",
    });
  }

  logger.debug("Batch recommendations requested", {
    count: validUserIds.length,
  });

  try {
    // 3. FETCH RECOMMENDATIONS IN PARALLEL
    // const results = await Promise.all(
    //   validUserIds.map(userId =>
    //     recommendationService.getRecommendations(userId, 10)
    //   )
    // );

    // Mock results
    const results = {};
    validUserIds.forEach((id) => {
      results[id] = [];
    });

    // 4. RETURN BATCH RESPONSE
    return res.status(200).json({
      success: true,
      data: results,
      metadata: {
        processedCount: validUserIds.length,
        failedCount: 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching batch recommendations", {
      count: validUserIds.length,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch batch recommendations",
      code: "BATCH_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * EXAMPLE 4: With Caching and Rate Limiting
 * GET /recommendations/:userId/cached
 * 
 * Demonstrates:
 * - Cache checking
 * - Cache invalidation
 * - Rate limit headers
 * - Performance optimization
 */
const exampleCachedRecommendations = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);

  if (!userId || userId <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid userId",
      code: "INVALID_USER_ID",
    });
  }

  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const cacheKey = `recs:${userId}:${limit}`;
  const CACHE_TTL = 3600; // 1 hour

  try {
    // 1. CHECK CACHE (if Redis available)
    // const cached = await cache.get(cacheKey);
    // if (cached) {
    //   return res.status(200).json({
    //     success: true,
    //     data: JSON.parse(cached),
    //     metadata: { cached: true, source: "cache" }
    //   });
    // }

    // 2. FETCH RECOMMENDATIONS
    // const recommendations = await recommendationService.getRecommendations(userId, limit);

    const recommendations = [];

    // 3. STORE IN CACHE
    // await cache.setex(cacheKey, CACHE_TTL, JSON.stringify(recommendations));

    // 4. ADD CACHE HEADERS
    res.set({
      "Cache-Control": `public, max-age=${CACHE_TTL}`,
      "X-Cache-Hit": "false",
      "X-Cache-TTL": CACHE_TTL.toString(),
    });

    // 5. RETURN RESPONSE
    return res.status(200).json({
      success: true,
      data: recommendations,
      metadata: {
        userId,
        limit,
        cached: false,
        ttl: CACHE_TTL,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching cached recommendations", {
      userId,
      error: error.message,
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
 * EXAMPLE 5: Recommendations with Detailed Scoring
 * GET /recommendations/:userId/debug
 * 
 * Demonstrates:
 * - Detailed response data
 * - Scoring breakdowns
 * - Debug information
 * - Performance metrics
 */
const exampleDebugRecommendations = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const startTime = Date.now();

  if (!userId || userId <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid userId",
      code: "INVALID_USER_ID",
    });
  }

  try {
    // 1. FETCH WITH DETAILED METRICS
    // const recommendations = await recommendationService.getRecommendationsWithMetrics(userId);

    const recommendations = {
      contentBased: [],
      collaborative: [],
      trending: [],
      scores: {},
    };

    const executionTime = Date.now() - startTime;

    // 2. RETURN DEBUG RESPONSE
    return res.status(200).json({
      success: true,
      data: recommendations,
      debug: {
        userId,
        executionTime: `${executionTime}ms`,
        algorithms: {
          contentBased: { count: 0, avgScore: 0 },
          collaborative: { count: 0, avgScore: 0 },
          trending: { count: 0, avgScore: 0 },
        },
        timestamp: new Date().toISOString(),
      },
      metadata: {
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error fetching debug recommendations", {
      userId,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      error: "Failed to fetch recommendations",
      code: "FETCH_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = {
  exampleBasicRecommendations,
  exampleAdvancedRecommendations,
  exampleBatchRecommendations,
  exampleCachedRecommendations,
  exampleDebugRecommendations,
};
