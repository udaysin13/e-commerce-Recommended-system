/**
 * Content-Based Recommendation Service
 * Recommends products based on similarity to user's purchased/viewed items
 * 
 * Algorithm:
 * 1. Get user's purchase/view history
 * 2. Extract product attributes (category, price range, description)
 * 3. Calculate similarity scores with all products
 * 4. Filter & rank candidates
 * 5. Return top recommendations
 */

const prisma = require("../lib/prisma");
const logger = require("../utils/logger");

/**
 * Calculate category similarity (exact match)
 * @param {string} category1 - Category of product 1
 * @param {string} category2 - Category of product 2
 * @returns {number} 0 or 1
 */
function calculateCategorySimilarity(category1, category2) {
  return category1.toLowerCase() === category2.toLowerCase() ? 1 : 0;
}

/**
 * Calculate price range similarity
 * Products within 30% price difference score high
 * @param {number} price1 - Price of product 1
 * @param {number} price2 - Price of product 2
 * @returns {number} 0 to 1
 */
function calculatePriceSimilarity(price1, price2) {
  if (price1 === 0 || price2 === 0) return 0;
  const maxPrice = Math.max(price1, price2);
  const minPrice = Math.min(price1, price2);
  const priceDiff = maxPrice - minPrice;
  const similarity = Math.max(0, 1 - priceDiff / (maxPrice * 0.5));
  return Math.round(similarity * 100) / 100;
}

/**
 * Simple text similarity using word overlap
 * Compares common words between two text strings
 * @param {string} text1 - Text string 1
 * @param {string} text2 - Text string 2
 * @returns {number} 0 to 1
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;

  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2);

  const words1 = normalize(text1);
  const words2 = normalize(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const commonWords = words1.filter((word) => words2.includes(word)).length;
  const totalWords = Math.max(words1.length, words2.length);

  return commonWords / totalWords;
}

/**
 * Build user profile from their interactions
 * Aggregates attributes from products they've purchased/viewed
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User profile with categories, price range, keywords
 */
async function buildUserProfile(userId) {
  try {
    // Get purchased products
    const purchases = await prisma.orderItem.findMany({
      where: { userId },
      include: { product: true },
      distinct: ["productId"],
    });

    // Get viewed products
    const views = await prisma.viewHistory.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { viewedAt: "desc" },
      take: 50, // Limit to recent views
    });

    const allInteractions = [
      ...purchases.map((p) => ({ ...p.product, weight: 2 })), // Purchases weighted higher
      ...views.map((v) => ({ ...v.product, weight: 1 })),
    ];

    if (allInteractions.length === 0) {
      return {
        categories: [],
        priceRange: { min: 0, max: 1000, avg: 500 },
        keywords: [],
        interactions: 0,
      };
    }

    // Extract categories (with frequency)
    const categoryMap = {};
    allInteractions.forEach(({ category, weight }) => {
      const key = category.toLowerCase();
      categoryMap[key] = (categoryMap[key] || 0) + weight;
    });

    const categories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    // Extract price range
    const prices = allInteractions.map((p) => p.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const priceRange = {
      min: Math.max(0, minPrice - avgPrice * 0.3),
      max: maxPrice + avgPrice * 0.3,
      avg: Math.round(avgPrice * 100) / 100,
    };

    // Extract keywords from descriptions
    const allDescriptions = allInteractions
      .map((p) => p.description || "")
      .join(" ");

    const keywords = extractKeywords(allDescriptions, 10);

    return {
      categories,
      priceRange,
      keywords,
      interactions: allInteractions.length,
      interactedProductIds: allInteractions.map((p) => p.id),
    };
  } catch (error) {
    logger.error("Error building user profile", { userId, error });
    throw error;
  }
}

/**
 * Extract keywords from text (simple word frequency)
 * @param {string} text - Text to extract from
 * @param {number} limit - Max keywords to extract
 * @returns {Array<string>} Top keywords
 */
function extractKeywords(text, limit = 10) {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "do",
    "does",
    "with",
    "by",
    "as",
    "this",
    "that",
    "it",
    "of",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  const frequency = {};
  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Calculate content similarity between user profile and candidate product
 * Uses weighted combination of:
 * - Category match (40% weight)
 * - Price similarity (30% weight)
 * - Description similarity (30% weight)
 * 
 * @param {Object} userProfile - User profile object
 * @param {Object} product - Product to score
 * @returns {Object} Similarity score and components
 */
function calculateContentSimilarity(userProfile, product) {
  const weights = {
    category: 0.4,
    price: 0.3,
    description: 0.3,
  };

  let categoryScore = 0;
  if (userProfile.categories.length > 0) {
    categoryScore = userProfile.categories.includes(
      product.category.toLowerCase()
    )
      ? 1
      : 0;
  }

  const priceScore = calculatePriceSimilarity(
    userProfile.priceRange.avg,
    product.price
  );

  let descriptionScore = 0;
  if (product.description && userProfile.keywords.length > 0) {
    const matchingKeywords = userProfile.keywords.filter((keyword) =>
      product.description.toLowerCase().includes(keyword)
    ).length;
    descriptionScore = matchingKeywords / userProfile.keywords.length;
  }

  const totalScore =
    categoryScore * weights.category +
    priceScore * weights.price +
    descriptionScore * weights.description;

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    categoryScore,
    priceScore,
    descriptionScore,
  };
}

/**
 * Get content-based recommendations for a user
 * Main entry point for content-based recommendation algorithm
 * 
 * @param {number} userId - User ID
 * @param {Object} options - Configuration options
 *   - categoryWeight: Category similarity weight (0-1, default: 0.4)
 *   - priceWeight: Price similarity weight (0-1, default: 0.3)
 *   - descriptionWeight: Description weight (0-1, default: 0.3)
 *   - minScore: Minimum score threshold (0-1, default: 0.3)
 *   - limit: Max recommendations (default: 10, max: 50)
 *   - excludePurchased: Exclude purchased products (default: true)
 *   - excludeViewed: Exclude viewed products (default: false)
 * @returns {Promise<Array>} Recommended products with scores
 */
async function getContentBasedRecommendations(userId, options = {}) {
  const startTime = Date.now();

  try {
    // Validate input
    if (!userId || userId <= 0) {
      throw new Error("Invalid user ID");
    }

    // Parse options
    const {
      minScore = 0.3,
      limit = 10,
      excludePurchased = true,
      excludeViewed = false,
    } = options;

    const validatedLimit = Math.min(Math.max(1, limit), 50);

    logger.debug("Getting content-based recommendations", {
      userId,
      minScore,
      limit: validatedLimit,
      excludePurchased,
      excludeViewed,
    });

    // Build user profile from interactions
    const userProfile = await buildUserProfile(userId);

    if (userProfile.interactions === 0) {
      logger.debug("User has no interaction history, returning empty", {
        userId,
      });
      return [];
    }

    // Get all products
    const allProducts = await prisma.product.findMany({
      where: { inStock: true },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        price: true,
        discount: true,
        imageUrl: true,
        rating: true,
        reviews: true,
      },
    });

    // Filter products
    const candidateProducts = allProducts.filter((product) => {
      // Exclude already interacted products
      if (
        excludePurchased &&
        userProfile.interactedProductIds.includes(product.id)
      ) {
        return false;
      }

      if (excludeViewed &&
        userProfile.interactedProductIds.includes(product.id)
      ) {
        return false;
      }

      return true;
    });

    // Score and rank products
    const scoredProducts = candidateProducts
      .map((product) => {
        const similarity = calculateContentSimilarity(userProfile, product);

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          price: product.price,
          discount: product.discount,
          imageUrl: product.imageUrl,
          rating: product.rating,
          reviews: product.reviews,
          contentScore: similarity.totalScore,
          categoryScore: similarity.categoryScore,
          priceScore: similarity.priceScore,
          descriptionScore: similarity.descriptionScore,
          reason: generateReason(similarity, userProfile, product),
        };
      })
      .filter((product) => product.contentScore >= minScore)
      .sort((a, b) => b.contentScore - a.contentScore)
      .slice(0, validatedLimit);

    const executionTime = Date.now() - startTime;

    logger.info("Content-based recommendations generated", {
      userId,
      count: scoredProducts.length,
      executionTime: `${executionTime}ms`,
    });

    return scoredProducts;
  } catch (error) {
    logger.error("Error getting content-based recommendations", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Generate human-readable reason for recommendation
 * @param {Object} similarity - Similarity scores
 * @param {Object} userProfile - User profile
 * @param {Object} product - Product
 * @returns {string} Recommendation reason
 */
function generateReason(similarity, userProfile, product) {
  if (similarity.categoryScore === 1) {
    return "Similar to products you've purchased";
  }

  if (similarity.priceScore > 0.7) {
    return "Similar price to products you like";
  }

  if (similarity.descriptionScore > 0.5) {
    return "Similar to items in your interests";
  }

  return "Recommended based on your activity";
}

/**
 * Batch get recommendations for multiple users
 * @param {Array<number>} userIds - Array of user IDs
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Map of userId to recommendations
 */
async function getContentBasedRecommendationsBatch(userIds, options = {}) {
  try {
    const startTime = Date.now();

    logger.debug("Getting batch recommendations", {
      count: userIds.length,
      options,
    });

    const results = {};

    // Process in parallel with concurrency limit (5 concurrent)
    const batchSize = 5;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((userId) => getContentBasedRecommendations(userId, options))
      );

      batch.forEach((userId, index) => {
        results[userId] = batchResults[index];
      });
    }

    const executionTime = Date.now() - startTime;
    logger.info("Batch recommendations completed", {
      count: userIds.length,
      executionTime: `${executionTime}ms`,
    });

    return results;
  } catch (error) {
    logger.error("Error getting batch recommendations", {
      count: userIds.length,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Analyze product similarity (debug utility)
 * Shows why products are recommended to a user
 * @param {number} userId - User ID
 * @param {number} productId - Product ID to analyze
 * @returns {Promise<Object>} Detailed similarity analysis
 */
async function analyzeProductSimilarity(userId, productId) {
  try {
    logger.debug("Analyzing product similarity", { userId, productId });

    const userProfile = await buildUserProfile(userId);
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const similarity = calculateContentSimilarity(userProfile, product);

    return {
      userId,
      productId,
      productName: product.name,
      userProfile: {
        topCategories: userProfile.categories.slice(0, 3),
        priceRange: userProfile.priceRange,
        topKeywords: userProfile.keywords.slice(0, 5),
      },
      productAttributes: {
        category: product.category,
        price: product.price,
        keyPhrase: product.description?.substring(0, 100),
      },
      similarity: {
        totalScore: similarity.totalScore,
        categoryMatch: similarity.categoryScore === 1,
        priceMatch: similarity.priceScore > 0.7,
        descriptionMatch: similarity.descriptionScore > 0.3,
        details: {
          categoryScore: similarity.categoryScore,
          priceScore: similarity.priceScore,
          descriptionScore: similarity.descriptionScore,
        },
      },
      interpretation:
        similarity.totalScore > 0.7
          ? "Highly recommended"
          : similarity.totalScore > 0.4
          ? "Moderately recommended"
          : "Low recommendation",
    };
  } catch (error) {
    logger.error("Error analyzing product similarity", {
      userId,
      productId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get similar products to a specific product
 * Find products with similar attributes (category, price, description)
 * @param {number} productId - Reference product ID
 * @param {Object} options - Configuration
 *   - limit: Number of similar products (default: 10)
 *   - excludeOriginal: Exclude the reference product (default: true)
 * @returns {Promise<Array>} Similar products
 */
async function getSimilarProducts(productId, options = {}) {
  try {
    const { limit = 10, excludeOriginal = true } = options;
    const validatedLimit = Math.min(Math.max(1, limit), 50);

    logger.debug("Finding similar products", { productId, limit: validatedLimit });

    // Get reference product
    const refProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!refProduct) {
      throw new Error("Reference product not found");
    }

    // Get all products
    const allProducts = await prisma.product.findMany({
      where: {
        inStock: true,
        ...(excludeOriginal && { NOT: { id: productId } }),
      },
    });

    // Score by similarity
    const scored = allProducts
      .map((product) => {
        const categoryScore = calculateCategorySimilarity(
          refProduct.category,
          product.category
        );

        const priceScore = calculatePriceSimilarity(
          refProduct.price,
          product.price
        );

        const descriptionScore = calculateTextSimilarity(
          refProduct.description,
          product.description
        );

        const totalScore =
          categoryScore * 0.4 + priceScore * 0.3 + descriptionScore * 0.3;

        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          price: product.price,
          imageUrl: product.imageUrl,
          rating: product.rating,
          similarityScore: Math.round(totalScore * 100) / 100,
          matchDetails: {
            category: categoryScore === 1,
            priceRange: priceScore > 0.7,
          },
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, validatedLimit);

    logger.info("Similar products found", { count: scored.length });
    return scored;
  } catch (error) {
    logger.error("Error finding similar products", {
      productId,
      error: error.message,
    });
    throw error;
  }
}

module.exports = {
  getContentBasedRecommendations,
  getContentBasedRecommendationsBatch,
  analyzeProductSimilarity,
  getSimilarProducts,
  buildUserProfile,
  calculateContentSimilarity,
  calculateCategorySimilarity,
  calculatePriceSimilarity,
  calculateTextSimilarity,
};
