/**
 * Advanced Scoring Service
 * Handles all recommendation scoring logic with:
 * - Weighted interaction scoring (PURCHASE=5, CLICK=3, VIEW=1)
 * - Recency decay factor
 * - Popularity boost
 * - Efficient batch processing
 * - Clear explanation generation
 */

const prisma = require("../lib/prisma");
const logger = require("../utils/logger");

// ============================================
// INTERACTION WEIGHTS
// ============================================

const INTERACTION_WEIGHTS = {
  PURCHASE: 5.0,    // Highest signal - user committed money
  REVIEW: 4.0,      // Strong signal - detailed feedback
  COMPARE: 3.0,     // Medium signal - comparing products
  WISHLIST: 3.0,    // Medium signal - saved for later
  CLICK: 2.0,       // Light signal - showed interest
  VIEW: 1.0,        // Baseline signal - just looked
};

// ============================================
// RECENCY DECAY CONFIG
// ============================================

const RECENCY_CONFIG = {
  HALF_LIFE_DAYS: 30,           // Interactions half their weight every 30 days
  MINIMUM_WEIGHT: 0.1,          // Minimum weight multiplier (10% of original)
  CURRENT_DAY_BOOST: 1.5,       // 50% boost for interactions today
};

// ============================================
// POPULARITY BOOST CONFIG
// ============================================

const POPULARITY_CONFIG = {
  TRENDING_THRESHOLD: 10,       // Products with 10+ recent interactions are trending
  TRENDING_BOOST: 1.3,          // 30% boost for trending products
  VIEW_COUNT_WEIGHT: 0.002,     // Small boost per view
  PURCHASE_COUNT_WEIGHT: 0.01,  // Bigger boost per purchase
};

// ============================================
// CALCULATE RECENCY DECAY
// ============================================

/**
 * Calculate recency decay factor for an interaction
 * Uses exponential decay: weight * (0.5)^(days / half_life)
 *
 * @param {Date} createdAt - When the interaction happened
 * @returns {number} Decay factor (0.1 to 1.5)
 */
function calculateRecencyDecay(createdAt) {
  const now = new Date();
  const millisecondsDiff = now - new Date(createdAt);
  const daysDiff = millisecondsDiff / (1000 * 60 * 60 * 24);

  if (daysDiff < 0) {
    return RECENCY_CONFIG.CURRENT_DAY_BOOST; // Future dates (shouldn't happen)
  }

  if (daysDiff === 0) {
    return RECENCY_CONFIG.CURRENT_DAY_BOOST; // Today's interactions get boost
  }

  // Exponential decay: (0.5)^(days / half_life)
  const exponent = daysDiff / RECENCY_CONFIG.HALF_LIFE_DAYS;
  let decayFactor = Math.pow(0.5, exponent);

  // Apply minimum weight floor
  decayFactor = Math.max(decayFactor, RECENCY_CONFIG.MINIMUM_WEIGHT);

  return decayFactor;
}

// ============================================
// CALCULATE INTERACTION SCORE
// ============================================

/**
 * Calculate total score for a single interaction
 * Score = InteractionWeight × RecencyDecay × BaseWeight
 *
 * @param {Object} interaction - Interaction record from database
 * @returns {number} Weighted score
 */
function calculateInteractionScore(interaction) {
  // Get base weight for interaction type
  const baseWeight = INTERACTION_WEIGHTS[interaction.type] || 1.0;

  // Calculate recency decay
  const recencyFactor = calculateRecencyDecay(interaction.createdAt);

  // Final score = base weight × recency decay × stored weight
  const score = baseWeight * recencyFactor * (interaction.weight || 1.0);

  return Math.max(0, score); // Ensure non-negative
}

// ============================================
// CALCULATE POPULARITY SCORE
// ============================================

/**
 * Calculate popularity boost for a product
 * Factors: recent interactions, view count, purchase count
 *
 * @param {Object} product - Product with metrics
 * @param {number} recentInteractions - Count of interactions in past 7 days
 * @returns {Object} {score, isTrending, reason}
 */
function calculatePopularityScore(product, recentInteractions = 0) {
  let score = 1.0;
  let isTrending = false;
  let reason = "standard";

  // Trending boost (many recent interactions)
  if (recentInteractions >= POPULARITY_CONFIG.TRENDING_THRESHOLD) {
    score *= POPULARITY_CONFIG.TRENDING_BOOST;
    isTrending = true;
    reason = "trending";
  }

  // View count boost (small incremental)
  if (product.viewCount > 0) {
    score += product.viewCount * POPULARITY_CONFIG.VIEW_COUNT_WEIGHT;
  }

  // Purchase count boost (more significant)
  if (product.purchaseCount > 0) {
    score += product.purchaseCount * POPULARITY_CONFIG.PURCHASE_COUNT_WEIGHT;
  }

  return {
    score: Math.min(2.0, score), // Cap at 2x boost
    isTrending,
    reason,
  };
}

// ============================================
// SCORE USER'S INTERACTIONS
// ============================================

/**
 * Score all interactions for a user
 * Returns products with aggregated weighted scores
 *
 * @param {number} userId - User ID
 * @param {Object} options - {limit, excludeProductIds, recencyDays}
 * @returns {Promise<Array>} Products scored by interaction history
 */
async function scoreUserInteractions(userId, options = {}) {
  const {
    limit = 50,
    excludeProductIds = [],
    recencyDays = 90,
  } = options;

  try {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - recencyDays);

    logger.debug("Scoring user interactions", {
      userId,
      recencyDays,
      cutoffDate,
    });

    // Get all recent interactions for user
    const interactions = await prisma.interaction.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate },
      },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (interactions.length === 0) {
      logger.debug("No recent interactions found", { userId });
      return [];
    }

    // Group interactions by product
    const productScores = new Map();
    const interactionReasons = new Map();

    interactions.forEach((interaction) => {
      const productId = interaction.productId;

      if (excludeProductIds.includes(productId)) {
        return; // Skip excluded products
      }

      // Calculate score for this interaction
      const interactionScore = calculateInteractionScore(interaction);

      // Aggregate scores for product
      const existing = productScores.get(productId) || 0;
      productScores.set(productId, existing + interactionScore);

      // Collect reasons for explanation
      if (!interactionReasons.has(productId)) {
        interactionReasons.set(productId, []);
      }

      interactionReasons
        .get(productId)
        .push({
          type: interaction.type,
          weight: interactionScore,
          date: interaction.createdAt,
        });
    });

    // Convert to array and sort by score
    const scoredProducts = Array.from(productScores.entries())
      .map(([productId, totalScore]) => {
        const product = interactions.find(
          (i) => i.productId === productId
        )?.product;

        if (!product) return null;

        return {
          ...product,
          userInteractionScore: totalScore,
          reasons: interactionReasons.get(productId),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.userInteractionScore - a.userInteractionScore)
      .slice(0, limit);

    logger.debug("User interactions scored", {
      userId,
      productsScored: scoredProducts.length,
    });

    return scoredProducts;
  } catch (error) {
    logger.error("Error scoring user interactions", {
      userId,
      error: error.message,
    });
    return [];
  }
}

// ============================================
// SCORE SIMILAR USERS' PRODUCTS
// ============================================

/**
 * Find products liked by similar users (collaborative filtering)
 * Weights contributions by user similarity
 *
 * @param {number} userId - Target user
 * @param {Object} options - {limit, minSimilarity}
 * @returns {Promise<Array>} Products from similar users
 */
async function scoreSimilarUsersProducts(userId, options = {}) {
  const { limit = 50, minSimilarity = 0.5 } = options;

  try {
    logger.debug("Scoring similar users products", { userId, minSimilarity });

    // Get this user's purchased products
    const userPurchases = await prisma.interaction.findMany({
      where: { userId, type: "PURCHASE" },
      select: { productId: true },
      distinct: ["productId"],
    });

    if (userPurchases.length === 0) {
      return [];
    }

    const userProductIds = userPurchases.map((p) => p.productId);

    // Find similar users (purchased same products)
    const similarUserInteractions = await prisma.interaction.findMany({
      where: {
        productId: { in: userProductIds },
        userId: { not: userId },
        type: "PURCHASE",
      },
      select: { userId: true, productId: true, weight: true },
    });

    // Group by user and calculate similarity score
    const userSimilarities = new Map();

    similarUserInteractions.forEach(({ userId: otherUserId, weight }) => {
      const existing = userSimilarities.get(otherUserId) || 0;
      userSimilarities.set(otherUserId, existing + (weight || 1.0));
    });

    // Filter by minimum similarity
    const similarUsers = Array.from(userSimilarities.entries())
      .filter(([_, score]) => score / userProductIds.length >= minSimilarity)
      .map(([userId, score]) => ({ userId, score }))
      .sort((a, b) => b.score - a.score);

    if (similarUsers.length === 0) {
      return [];
    }

    // Get products from similar users (excluding user's purchases)
    const similarUserIds = similarUsers.map((u) => u.userId);

    const similarUsersProducts = await prisma.interaction.findMany({
      where: {
        userId: { in: similarUserIds },
        productId: { notIn: userProductIds },
        type: "PURCHASE",
      },
      include: { product: true },
    });

    // Score products by weighted votes from similar users
    const productScores = new Map();
    const productReasons = new Map();

    similarUsersProducts.forEach((interaction) => {
      const productId = interaction.productId;
      const similarUser = similarUsers.find(
        (u) => u.userId === interaction.userId
      );

      if (!similarUser) return;

      // Weight vote by similarity to source user
      const voteWeight = (interaction.weight || 1.0) * similarUser.score;

      // Aggregate
      const existing = productScores.get(productId) || 0;
      productScores.set(productId, existing + voteWeight);

      // Track reason
      if (!productReasons.has(productId)) {
        productReasons.set(productId, []);
      }

      productReasons.get(productId).push({
        source: `User similar to you`,
        weight: voteWeight,
      });
    });

    // Convert to array, sort, and return
    const result = Array.from(productScores.entries())
      .map(([productId, score]) => {
        const product = similarUsersProducts.find(
          (p) => p.productId === productId
        )?.product;

        if (!product) return null;

        return {
          ...product,
          collaborativeScore: score,
          reasons: productReasons.get(productId),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.collaborativeScore - a.collaborativeScore)
      .slice(0, limit);

    logger.debug("Similar users products scored", {
      userId,
      productsFound: result.length,
    });

    return result;
  } catch (error) {
    logger.error("Error scoring similar users products", {
      userId,
      error: error.message,
    });
    return [];
  }
}

// ============================================
// MERGE AND BLEND SCORES
// ============================================

/**
 * Merge multiple recommendation sources with weighted blending
 *
 * @param {Array} sourceLists - [{products, weight, source}]
 * @returns {Array} Final scored products
 */
function mergeAndBlendScores(sourceLists) {
  const productMap = new Map();

  // Normalize and aggregate scores from all sources
  sourceLists.forEach(({ products, weight, source }) => {
    if (!products || products.length === 0) return;

    products.forEach((product, index) => {
      const baseScore = 100 - index * 2; // Rank-based score decay
      const weightedScore = baseScore * (weight || 1.0);

      if (!productMap.has(product.id)) {
        productMap.set(product.id, {
          ...product,
          finalScore: 0,
          sources: [],
        });
      }

      const entry = productMap.get(product.id);
      entry.finalScore += weightedScore;
      entry.sources.push({
        source,
        contribution: weightedScore,
      });
    });
  });

  // Sort by final score
  return Array.from(productMap.values())
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((item) => ({
      ...item,
      finalScore: Math.round(item.finalScore * 100) / 100, // Round to 2 decimals
    }));
}

// ============================================
// GENERATE EXPLANATION
// ============================================

/**
 * Generate human-readable explanation for a recommendation
 *
 * @param {Object} scoreData - Product with scoring data
 * @param {Object} product - Full product data
 * @returns {string} Explanation text
 */
function generateExplanation(scoreData, product = {}) {
  const reasons = [];

  // Check various signals
  if (scoreData.reasons && scoreData.reasons.length > 0) {
    const reasons_list = scoreData.reasons;
    const topReason = reasons_list.reduce((prev, current) =>
      prev.weight > current.weight ? prev : current
    );

    switch (topReason.type) {
      case "PURCHASE":
        reasons.push("you purchased similar products");
        break;
      case "CLICK":
        reasons.push("you showed interest in similar items");
        break;
      case "VIEW":
        reasons.push("you viewed similar products");
        break;
      case "WISHLIST":
        reasons.push("you bookmarked similar items");
        break;
      case "REVIEW":
        reasons.push("you reviewed similar products");
        break;
    }
  }

  // Add collaborative signal
  if (
    scoreData.collaborativeScore &&
    scoreData.collaborativeScore > scoreData.userInteractionScore
  ) {
    reasons.push("users like you loved this");
  }

  // Add popularity signal
  if (product.trending) {
    reasons.push("it's trending right now");
  }

  if (product.rating >= 4.5) {
    reasons.push("it has excellent ratings");
  }

  if (product.purchaseCount > 100) {
    reasons.push("it's a bestseller");
  }

  // Combine reasons
  if (reasons.length === 0) {
    return "Recommended for you";
  }

  if (reasons.length === 1) {
    return `Recommended because ${reasons[0]}`;
  }

  return `Recommended because ${reasons.slice(0, 2).join(" and ")}`;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Scoring functions
  calculateRecencyDecay,
  calculateInteractionScore,
  calculatePopularityScore,

  // Main scoring functions
  scoreUserInteractions,
  scoreSimilarUsersProducts,
  mergeAndBlendScores,

  // Explanation
  generateExplanation,

  // Configuration (for testing/tuning)
  INTERACTION_WEIGHTS,
  RECENCY_CONFIG,
  POPULARITY_CONFIG,
};
