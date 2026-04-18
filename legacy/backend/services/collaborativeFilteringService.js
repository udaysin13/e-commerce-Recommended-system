/**
 * Collaborative Filtering Recommendation Engine
 * 
 * Algorithm: User-User Collaborative Filtering with Cosine Similarity
 * 
 * How it works:
 * 1. Fetch target user's interaction vector (products they viewed/purchased)
 * 2. Fetch all other users' interaction vectors
 * 3. Calculate cosine similarity between target user and all others
 * 4. Find N most similar users (threshold-based filtering)
 * 5. Get products recommended by similar users that target user hasn't seen
 * 6. Rank by aggregate score from similar users
 * 7. Return top 10 products
 */

const prisma = require("../lib/prisma");
const logger = require("../utils/logger");
const { NotFoundError, ValidationError } = require("../middleware/errorHandler");

/**
 * Build user interaction vector
 * Maps products to interaction counts (views + purchases)
 * 
 * @param {number} userId - Target user ID
 * @returns {Promise<Object>} Map of productId -> interaction count
 */
async function buildUserInteractionVector(userId) {
  try {
    // Fetch all interactions for the user
    const [views, purchases] = await Promise.all([
      prisma.viewHistory.findMany({
        where: { userId },
        select: { productId: true },
      }),
      prisma.orderItem.findMany({
        where: { userId },
        select: { productId: true },
      }),
    ]);

    // Build interaction vector: productId -> count
    const vector = new Map();

    // Views weighted as 1
    views.forEach(({ productId }) => {
      vector.set(productId, (vector.get(productId) || 0) + 1);
    });

    // Purchases weighted as 2 (more significant)
    purchases.forEach(({ productId }) => {
      vector.set(productId, (vector.get(productId) || 0) + 2);
    });

    return vector;
  } catch (error) {
    logger.error("Failed to build interaction vector", error, { userId });
    throw error;
  }
}

/**
 * Build interaction vectors for all users
 * Optimized to fetch all users' interactions in parallel
 * 
 * @returns {Promise<Map>} Map of userId -> interaction vector
 */
async function buildAllUserVectors() {
  try {
    // Get all unique users who have interactions
    const activeUsers = await prisma.user.findMany({
      select: { id: true },
      where: {
        OR: [
          { viewHistory: { some: {} } }, // Has views
          { orderItems: { some: {} } },   // Has purchases
        ],
      },
    });

    const userVectors = new Map();

    // Build vectors for all users in parallel (batches of 10)
    const batchSize = 10;
    for (let i = 0; i < activeUsers.length; i += batchSize) {
      const batch = activeUsers.slice(i, i + batchSize);
      const batchVectors = await Promise.all(
        batch.map(({ id }) => buildUserInteractionVector(id))
      );

      batchVectors.forEach((vector, index) => {
        userVectors.set(batch[index].id, vector);
      });
    }

    return userVectors;
  } catch (error) {
    logger.error("Failed to build all user vectors", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * 
 * Formula: cos(θ) = (A · B) / (||A|| * ||B||)
 * 
 * @param {Map} vectorA - First interaction vector
 * @param {Map} vectorB - Second interaction vector
 * @returns {number} Similarity score (0 to 1)
 */
function calculateCosineSimilarity(vectorA, vectorB) {
  if (vectorA.size === 0 || vectorB.size === 0) {
    return 0;
  }

  // Calculate dot product of common products
  let dotProduct = 0;
  for (const [productId, scoreA] of vectorA) {
    if (vectorB.has(productId)) {
      const scoreB = vectorB.get(productId);
      dotProduct += scoreA * scoreB;
    }
  }

  // If no common products, similarity is 0
  if (dotProduct === 0) {
    return 0;
  }

  // Calculate magnitude (L2 norm) for each vector
  let magnitudeA = 0;
  for (const score of vectorA.values()) {
    magnitudeA += score * score;
  }
  magnitudeA = Math.sqrt(magnitudeA);

  let magnitudeB = 0;
  for (const score of vectorB.values()) {
    magnitudeB += score * score;
  }
  magnitudeB = Math.sqrt(magnitudeB);

  // Cosine similarity
  const similarity = dotProduct / (magnitudeA * magnitudeB);

  return Math.min(similarity, 1); // Clamp to 1
}

/**
 * Find similar users using cosine similarity
 * 
 * @param {number} userId - Target user ID
 * @param {number} minSimilarity - Minimum similarity threshold (0-1)
 * @param {number} maxSimilarUsers - Maximum number of similar users to return
 * @returns {Promise<Array>} Array of { userId, similarity }
 */
async function findSimilarUsers(
  userId,
  minSimilarity = 0.3,
  maxSimilarUsers = 50
) {
  try {
    const startTime = performance.now();

    // Build interaction vectors for all users
    const allUserVectors = await buildAllUserVectors();

    const targetUserVector = allUserVectors.get(userId);
    if (!targetUserVector || targetUserVector.size === 0) {
      logger.debug("Target user has no interactions", { userId });
      return [];
    }

    // Calculate similarity with all other users
    const similarities = [];

    for (const [otherUserId, otherVector] of allUserVectors) {
      if (otherUserId === userId) continue; // Skip self

      const similarity = calculateCosineSimilarity(targetUserVector, otherVector);

      if (similarity >= minSimilarity) {
        similarities.push({
          userId: otherUserId,
          similarity,
        });
      }
    }

    // Sort by similarity descending and limit
    const similarUsers = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxSimilarUsers);

    const duration = performance.now() - startTime;
    logger.logAlgorithmPerformance("Collaborative Filtering - Find Similar Users", duration, similarUsers.length);

    return similarUsers;
  } catch (error) {
    logger.error("Failed to find similar users", error, { userId });
    throw error;
  }
}

/**
 * Get recommendations for a user using collaborative filtering
 * 
 * Algorithm steps:
 * 1. Find similar users (cosine similarity)
 * 2. Get products recommended by similar users
 * 3. Filter out products user has already interacted with
 * 4. Score by similarity weight and frequency
 * 5. Return top results
 * 
 * @param {number} userId - Target user ID to get recommendations for
 * @param {Object} options - Configuration options
 * @param {number} options.topK - Number of similar users to consider (default: 10)
 * @param {number} options.minSimilarity - Minimum similarity threshold (default: 0.3)
 * @param {number} options.limit - Number of recommendations to return (default: 10)
 * @returns {Promise<Array>} Recommended products
 */
async function getCollaborativeRecommendations(
  userId,
  options = {}
) {
  try {
    // Validate input
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new ValidationError("Invalid user ID");
    }

    // Destructure options with defaults
    const {
      topK = 10,
      minSimilarity = 0.3,
      limit = 10,
    } = options;

    const startTime = performance.now();

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    // Step 1: Get target user's interaction vector
    const userVector = await buildUserInteractionVector(userId);
    if (userVector.size === 0) {
      logger.info("User has no interactions, returning popular products");
      return getPopularProductsForUser(userId, limit);
    }

    // Step 2: Find similar users
    const similarUsers = await findSimilarUsers(userId, minSimilarity, topK);

    if (similarUsers.length === 0) {
      logger.info("No similar users found, returning popular products");
      return getPopularProductsForUser(userId, limit);
    }

    // Step 3: Get products from similar users
    const similarUserIds = similarUsers.map(u => u.userId);

    const recommendedProducts = await prisma.orderItem.findMany({
      where: {
        userId: { in: similarUserIds },
        productId: { notIn: Array.from(userVector.keys()) },
      },
      include: { product: true },
      distinct: ["productId"],
    });

    // Step 4: Score products by similarity-weighted frequency
    const productScores = new Map();

    for (const item of recommendedProducts) {
      const similarity = similarUsers.find(u => u.userId === item.userId)?.similarity || 0;

      const currentScore = productScores.get(item.productId) || {
        product: item.product,
        score: 0,
        count: 0,
      };

      currentScore.score += similarity * 2; // Purchase weighted higher
      currentScore.count += 1;

      productScores.set(item.productId, currentScore);
    }

    // Also consider viewed products from similar users
    const viewedByOthers = await prisma.viewHistory.findMany({
      where: {
        userId: { in: similarUserIds },
        productId: { notIn: Array.from(userVector.keys()) },
      },
      include: { product: true },
      distinct: ["productId"],
    });

    for (const view of viewedByOthers) {
      const similarity = similarUsers.find(u => u.userId === view.userId)?.similarity || 0;

      if (!productScores.has(view.productId)) {
        productScores.set(view.productId, {
          product: view.product,
          score: similarity * 1, // View weighted less than purchase
          count: 1,
        });
      } else {
        const current = productScores.get(view.productId);
        current.score += similarity * 1;
        current.count += 1;
      }
    }

    // Step 5: Sort by score and return top results
    const recommendations = Array.from(productScores.values())
      .sort((a, b) => {
        // Sort by: score (similarity), then by count, then by rating
        if (b.score !== a.score) return b.score - a.score;
        if (b.count !== a.count) return b.count - a.count;
        return (b.product.rating || 0) - (a.product.rating || 0);
      })
      .slice(0, limit)
      .map((item) => ({
        ...item.product,
        collaborativeScore: Math.round(item.score * 100) / 100,
        similarUsersCount: item.count,
        recommendedBecause: `${item.count} similar user${item.count > 1 ? "s" : ""} interacted with this`,
      }));

    const duration = performance.now() - startTime;
    logger.logAlgorithmPerformance(
      "Collaborative Filtering - Get Recommendations",
      duration,
      recommendations.length
    );

    return recommendations;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    logger.error("Failed to get collaborative recommendations", error, { userId });
    throw error;
  }
}

/**
 * Get popular products as fallback when no similar users found
 * 
 * @param {number} userId - User ID (to exclude their purchases)
 * @param {number} limit - Number of products to return
 * @returns {Promise<Array>} Popular products
 */
async function getPopularProductsForUser(userId, limit = 10) {
  try {
    const userPurchases = await prisma.orderItem.findMany({
      where: { userId },
      select: { productId: true },
    });

    const purchasedIds = userPurchases.map(p => p.productId);

    const products = await prisma.product.findMany({
      where: { id: { notIn: purchasedIds } },
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
      take: limit,
    });

    return products.map(p => ({
      ...p,
      collaborativeScore: 0,
      recommendedBecause: "Popular fallback (no similar users found)",
    }));
  } catch (error) {
    logger.error("Failed to get popular products", error, { userId });
    return [];
  }
}

/**
 * Get recommendations for multiple users efficiently
 * Useful for batch processing or background jobs
 * 
 * @param {number[]} userIds - Array of user IDs
 * @param {Object} options - Options (same as getCollaborativeRecommendations)
 * @returns {Promise<Map>} Map of userId -> recommendations
 */
async function getCollaborativeRecommendationsBatch(userIds, options = {}) {
  try {
    const results = new Map();

    // Process in batches of 5 to avoid overload
    const batchSize = 5;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(userId =>
          getCollaborativeRecommendations(userId, options)
            .catch(error => {
              logger.warn("Failed to get recommendations for user", { userId, error: error.message });
              return [];
            })
        )
      );

      batchResults.forEach((recs, index) => {
        results.set(batch[index], recs);
      });
    }

    return results;
  } catch (error) {
    logger.error("Failed batch recommendations", error);
    throw error;
  }
}

/**
 * Analyze user similarity distribution
 * Useful for debugging and understanding recommendation quality
 * 
 * @param {number} userId - Target user ID
 * @returns {Promise<Object>} Analysis stats
 */
async function analyzeUserSimilarity(userId) {
  try {
    const similarUsers = await findSimilarUsers(userId, 0, 100);

    if (similarUsers.length === 0) {
      return {
        userId,
        totalSimilarUsers: 0,
        averageSimilarity: 0,
        maxSimilarity: 0,
        minSimilarity: 0,
        distribution: {},
      };
    }

    const similarities = similarUsers.map(u => u.similarity);
    const average = similarities.reduce((a, b) => a + b) / similarities.length;

    // Distribute into buckets
    const distribution = {
      veryHigh: similarities.filter(s => s >= 0.8).length, // 0.8-1.0
      high: similarities.filter(s => s >= 0.6 && s < 0.8).length, // 0.6-0.8
      medium: similarities.filter(s => s >= 0.4 && s < 0.6).length, // 0.4-0.6
      low: similarities.filter(s => s < 0.4).length, // <0.4
    };

    return {
      userId,
      totalSimilarUsers: similarUsers.length,
      averageSimilarity: Math.round(average * 100) / 100,
      maxSimilarity: Math.max(...similarities),
      minSimilarity: Math.min(...similarities),
      distribution,
    };
  } catch (error) {
    logger.error("Failed to analyze user similarity", error, { userId });
    throw error;
  }
}

module.exports = {
  getCollaborativeRecommendations,
  getCollaborativeRecommendationsBatch,
  findSimilarUsers,
  buildUserInteractionVector,
  calculateCosineSimilarity,
  analyzeUserSimilarity,
};
