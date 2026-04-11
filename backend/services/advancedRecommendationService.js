/**
 * Advanced Recommendation Service - Intermediate Level
 * 
 * Features:
 * - Behavior tracking (views + purchases)
 * - Weighted scoring system
 * - "Users also bought" recommendations
 * - Confidence scores
 * - Improved accuracy through multi-factor analysis
 */

const prisma = require("../lib/prisma");

/**
 * ============ SCORING SYSTEM ============
 * 
 * Each product gets a score based on:
 * - Rating (0.3 weight)
 * - Review count (0.2 weight)
 * - View frequency (0.2 weight)
 * - Purchase frequency (0.2 weight)
 * - Recency (0.1 weight)
 */

function calculateProductScore(product, metadata = {}) {
  const baseScore = 100;
  let totalScore = baseScore;

  // Rating-based score (0-30 points)
  if (product.rating) {
    totalScore += (product.rating / 5) * 30;
  }

  // Review count score (0-20 points, logarithmic)
  if (product.reviews) {
    totalScore += Math.min(20, Math.log(product.reviews + 1) * 5);
  }

  // View frequency score (0-20 points)
  if (metadata.viewCount) {
    totalScore += Math.min(20, metadata.viewCount * 2);
  }

  // Purchase frequency score (0-20 points)
  if (metadata.purchaseCount) {
    totalScore += Math.min(20, metadata.purchaseCount * 5);
  }

  // Recency bonus (0-10 points)
  if (metadata.daysOld) {
    const recencyBonus = Math.max(0, 10 - metadata.daysOld / 10);
    totalScore += recencyBonus;
  }

  return Math.round(totalScore);
}

/**
 * "Users Also Bought" Recommendation
 * Finds products frequently purchased together
 * 
 * Logic:
 * 1. Get user's recent purchases
 * 2. Find other users who bought same products
 * 3. See what else those users bought
 * 4. Rank by frequency and score
 */
async function getUsersAlsoBought(productId, limit = 8) {
  try {
    // Find users who bought this product
    const buyers = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      take: 100,
    });

    if (buyers.length === 0) {
      return [];
    }

    const orderIds = buyers.map((b) => b.orderId);

    // Find what else these buyers purchased (co-purchases)
    const coPurchases = await prisma.orderItem.findMany({
      where: {
        orderId: { in: orderIds },
        productId: { not: productId },
      },
      include: { product: true },
    });

    // Count frequency and calculate score
    const productFrequency = {};
    coPurchases.forEach((item) => {
      if (!productFrequency[item.productId]) {
        productFrequency[item.productId] = {
          product: item.product,
          count: 0,
        };
      }
      productFrequency[item.productId].count += 1;
    });

    // Convert to array and sort by frequency
    const recommendations = Object.values(productFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => ({
        ...item.product,
        recommendedBecause: `${item.count} users bought this with the product you're viewing`,
        confidence: Math.min(100, item.count * 10),
        cooccurrenceCount: item.count,
      }));

    return recommendations;
  } catch (error) {
    console.warn("Users also bought failed:", error.message);
    return [];
  }
}

/**
 * Advanced Collaborative Filtering with Scoring
 * 
 * Logic:
 * 1. Find users with similar purchase patterns
 * 2. Weight matches by product quality (rating)
 * 3. Calculate user similarity score
 * 4. Recommend top products from similar users
 */
async function getAdvancedCollaborativeRecommendations(userId, limit = 8) {
  try {
    // Get user's purchase history with products
    const userOrders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      take: 5,
    });

    if (userOrders.length === 0) {
      return [];
    }

    // Extract purchased product IDs and categories
    const userProductIds = userOrders.flatMap((o) =>
      o.items.map((i) => i.productId)
    );
    const userCategories = [
      ...new Set(
        userOrders.flatMap((o) =>
          o.items.map((i) => i.product.category)
        )
      ),
    ];

    // Find similar users (those who bought similar products)
    const similarUsersOrders = await prisma.order.findMany({
      where: {
        userId: { not: userId },
        items: {
          some: {
            productId: { in: userProductIds },
          },
        },
      },
      include: { items: { include: { product: true } } },
      take: 20,
    });

    if (similarUsersOrders.length === 0) {
      return [];
    }

    // Calculate user similarity scores
    const similarUserScores = {};
    similarUsersOrders.forEach((order) => {
      if (!similarUserScores[order.userId]) {
        similarUserScores[order.userId] = { score: 0, products: {} };
      }

      // Add points for each matching purchase
      order.items.forEach((item) => {
        const isMatching = userProductIds.includes(item.productId);
        const categoryMatch = userCategories.includes(item.product.category);

        if (isMatching) {
          similarUserScores[order.userId].score += 20; // Strong match
        } else if (categoryMatch) {
          similarUserScores[order.userId].score += 5; // Category match
        }

        // Track products for recommendation
        if (!isMatching) {
          if (!similarUserScores[order.userId].products[item.productId]) {
            similarUserScores[order.userId].products[item.productId] = {
              product: item.product,
              count: 0,
            };
          }
          similarUserScores[order.userId].products[item.productId].count += 1;
        }
      });
    });

    // Get top similar users
    const topSimilarUsers = Object.entries(similarUserScores)
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 10);

    // Collect recommendations from similar users
    const recommendations = [];
    const seenProductIds = new Set(userProductIds);

    topSimilarUsers.forEach(([_userId, userData]) => {
      Object.entries(userData.products).forEach(([productId, data]) => {
        if (!seenProductIds.has(parseInt(productId))) {
          const existing = recommendations.find(
            (r) => r.id === data.product.id
          );
          if (existing) {
            existing.similarUserCount += 1;
            existing.score += data.count * userData.score;
          } else {
            recommendations.push({
              ...data.product,
              similarUserCount: 1,
              score: data.count * userData.score,
              recommendedBecause: "Similar users also bought this",
              confidence: Math.min(100, data.count * userData.score / 10),
            });
          }
          seenProductIds.add(parseInt(productId));
        }
      });
    });

    // Sort by score and return top N
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.warn("Advanced collaborative recommendation failed:", error.message);
    return [];
  }
}

/**
 * Content-Based with Behavioral Score
 * 
 * Logic:
 * 1. Analyze what user viewed
 * 2. Calculate category/price preferences
 * 3. Combine with product quality scores
 * 4. Return ranked recommendations
 */
async function getAdvancedContentBasedRecommendations(userId, limit = 8) {
  try {
    // Get user's view history with metadata
    const viewHistory = await prisma.viewHistory.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { viewedAt: "desc" },
      take: 20,
    });

    if (viewHistory.length === 0) {
      return [];
    }

    // Analyze user preferences
    const categoryPreferences = {};
    const pricePreferences = [];

    viewHistory.forEach((view) => {
      // Category preference
      if (!categoryPreferences[view.product.category]) {
        categoryPreferences[view.product.category] = 0;
      }
      categoryPreferences[view.product.category] += 1;

      // Price preference (for range calculation)
      pricePreferences.push(view.product.price);
    });

    const topCategories = Object.entries(categoryPreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0]);

    const avgPrice = pricePreferences.reduce((a, b) => a + b, 0) / pricePreferences.length;
    const priceRange = { min: Math.max(0, avgPrice * 0.5), max: avgPrice * 1.5 };

    // Find products matching preferences
    const candidates = await prisma.product.findMany({
      where: {
        id: { notIn: viewHistory.map((v) => v.productId) },
        OR: [
          { category: { in: topCategories } },
          { price: { gte: priceRange.min, lte: priceRange.max } },
        ],
      },
    });

    // Score each candidate
    const recommendations = candidates
      .map((product) => {
        let score = 0;

        // Category match bonus
        if (topCategories.includes(product.category)) {
          score += 30;
        }

        // Price range bonus
        if (product.price >= priceRange.min && product.price <= priceRange.max) {
          score += 20;
        }

        // Quality score
        score += (product.rating / 5) * 25;
        score += Math.min(15, Math.log(product.reviews + 1) * 5);

        return {
          ...product,
          score,
          recommendedBecause: "Based on your preferences",
          confidence: Math.min(
            100,
            50 +
              (topCategories.includes(product.category) ? 25 : 0) +
              (product.rating / 5) * 25
          ),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.warn("Advanced content-based recommendation failed:", error.message);
    return [];
  }
}

/**
 * Behavior-Based Analytics
 * Tracks and scores user engagement
 */
async function getUserBehaviorScore(userId) {
  try {
    // Get views
    const viewCount = await prisma.viewHistory.count({
      where: { userId },
    });

    // Get purchases
    const purchaseCount = await prisma.order.count({
      where: { userId },
    });

    // Get cart items
    const cartItems = await prisma.cart.findUnique({
      where: { userId },
      select: { items: { select: { id: true } } },
    });

    const cartSize = cartItems?.items.length || 0;

    // Calculate scores
    const engagementScore = viewCount * 2 + purchaseCount * 10 + cartSize * 3;
    const loyaltyScore = Math.min(100, purchaseCount * 20);
    const activityLevel =
      purchaseCount > 0 ? "active" : viewCount > 0 ? "engaged" : "new";

    return {
      userId,
      viewCount,
      purchaseCount,
      cartItems: cartSize,
      engagementScore,
      loyaltyScore,
      activityLevel,
      score: Math.min(100, engagementScore / 10),
    };
  } catch (error) {
    console.warn("Failed to calculate behavior score:", error.message);
    return {
      userId,
      viewCount: 0,
      purchaseCount: 0,
      cartItems: 0,
      engagementScore: 0,
      loyaltyScore: 0,
      activityLevel: "new",
      score: 0,
    };
  }
}

/**
 * Smart Recommendation - Combines all signals
 * 
 * Logic:
 * 1. Analyze user behavior level
 * 2. Weight algorithms based on user data
 * 3. Use "users also bought" if viewing product
 * 4. Use collaborative if purchases exist
 * 5. Use content-based for new users
 */
async function getSmartRecommendations(userId, contextProductId = null, limit = 12) {
  try {
    // Get behavior profile
    const behaviorScore = await getUserBehaviorScore(userId);

    let recommendations = [];

    // If viewing specific product, prioritize "users also bought"
    if (contextProductId) {
      const alsoBoought = await getUsersAlsoBought(contextProductId, Math.ceil(limit / 2));
      recommendations.push(...alsoBoought);
    }

    // If user has purchase history, add collaborative
    if (behaviorScore.purchaseCount > 0) {
      const collaborative = await getAdvancedCollaborativeRecommendations(
        userId,
        Math.ceil(limit / 3)
      );
      recommendations.push(...collaborative);
    }

    // Always add content-based
    const contentBased = await getAdvancedContentBasedRecommendations(
      userId,
      Math.ceil(limit / 3)
    );
    recommendations.push(...contentBased);

    // Deduplicate
    const seen = new Set();
    recommendations = recommendations.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    // Sort by confidence
    recommendations.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

    return {
      recommendations: recommendations.slice(0, limit),
      userBehavior: behaviorScore,
      totalCount: recommendations.length,
    };
  } catch (error) {
    console.warn("Smart recommendation failed:", error.message);
    return {
      recommendations: [],
      userBehavior: { error: error.message },
      totalCount: 0,
    };
  }
}

/**
 * Track User Behavior - Record a view
 */
async function trackProductView(userId, productId) {
  try {
    return await prisma.viewHistory.create({
      data: {
        userId,
        productId,
        viewedAt: new Date(),
      },
    });
  } catch (error) {
    console.warn("Failed to track view:", error.message);
    return null;
  }
}

/**
 * Get Product Recommendation Metadata
 * Returns stats about a product for analytics
 */
async function getProductMetadata(productId) {
  try {
    const viewCount = await prisma.viewHistory.count({
      where: { productId },
    });

    const purchaseCount = await prisma.orderItem.count({
      where: { productId },
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    const daysOld = product
      ? Math.floor(
          (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    return {
      productId,
      viewCount,
      purchaseCount,
      daysOld,
      score: product ? calculateProductScore(product, {
        viewCount,
        purchaseCount,
        daysOld,
      }) : 0,
    };
  } catch (error) {
    console.warn("Failed to get product metadata:", error.message);
    return null;
  }
}

module.exports = {
  // Advanced algorithms
  getSmartRecommendations,
  getUsersAlsoBought,
  getAdvancedCollaborativeRecommendations,
  getAdvancedContentBasedRecommendations,

  // Analytics
  getUserBehaviorScore,
  getProductMetadata,
  trackProductView,

  // Utilities
  calculateProductScore,
};
