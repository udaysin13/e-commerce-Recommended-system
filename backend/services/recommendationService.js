/**
 * Recommendation Service
 * Advanced recommendation algorithms:
 * - Collaborative Filtering (user-based)
 * - Content-Based Filtering (product similarity)
 * - Hybrid Approach (combination of above)
 * - Trending Products (time-weighted popularity)
 * - Category-Based (user's favorite categories)
 */

const prisma = require("../lib/prisma");
const logger = require("../utils/logger");
const {
  calculateProductSimilarity,
  calculateCollaborativeScore,
  calculateCoPurchaseConfidence,
  calculateEngagementScore,
  getTimeDecayFactor,
  mergeAndDeduplicateProducts,
  sortByScore,
  measureExecutionTime,
} = require("../utils/helpers");
const { CONFIG } = require("../config/config");

/**
 * Remove duplicate products from array
 */
function uniqueByProductId(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * ALGORITHM 1: Content-Based Recommendations
 * Recommends products similar to ones user has viewed or purchased
 * Based on: category, price range, ratings
 */
async function getContentBasedRecommendations(userId, limit = 8) {
  const { result: recommendations } = await measureExecutionTime(async () => {
    try {
      // Get user's recent interactions (views and purchases)
      const [viewedProducts, purchasedProducts] = await Promise.all([
        prisma.viewHistory.findMany({
          where: { userId },
          include: { product: true },
          orderBy: { viewedAt: "desc" },
          take: 10,
        }),
        prisma.orderItem.findMany({
          where: { userId },
          include: { product: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

      if (viewedProducts.length === 0 && purchasedProducts.length === 0) {
        return getPopularProducts(limit);
      }

      // Combine and deduplicate user's products
      const userProducts = uniqueByProductId([
        ...viewedProducts.map((v) => v.product),
        ...purchasedProducts.map((o) => o.product),
      ]);

      // Extract categories and calculate average price
      const categories = [...new Set(userProducts.map((p) => p.category))];
      const avgPrice =
        userProducts.reduce((sum, p) => sum + p.price, 0) / userProducts.length;

      // Find similar products
      const similarProducts = await prisma.product.findMany({
        where: {
          id: { notIn: userProducts.map((p) => p.id) },
          OR: [
            { category: { in: categories } },
            {
              price: {
                gte: Math.max(0, avgPrice * 0.7),
                lte: avgPrice * 1.3,
              },
            },
          ],
        },
        take: limit * 2,
      });

      // Score products based on similarity to user's preferences
      const scored = similarProducts.map((product) => {
        let score = 0;

        // Category match bonus
        if (categories.includes(product.category)) {
          score += 35;
        }

        // Price range bonus
        const priceDiff = Math.abs(product.price - avgPrice);
        const priceScore = Math.max(0, 30 * (1 - priceDiff / (avgPrice || 100)));
        score += priceScore;

        // Rating bonus
        const ratingScore = (product.rating || 0) * 5;
        score += Math.min(20, ratingScore);

        // Popularity bonus
        const popularityScore = Math.min(15, (product.reviews || 0) / 100);
        score += popularityScore;

        return {
          ...product,
          score,
          recommendedBecause: "Based on your browsing and purchase history",
          algorithm: "content-based",
        };
      });

      return sortByScore(scored).slice(0, limit);
    } catch (error) {
      logger.error("Content-based recommendation failed", error);
      return getPopularProducts(limit);
    }
  }, "Content-Based Recommendation");

  return recommendations;
}

/**
 * Category similarity
 * Recommends products from the same category, then nearby price range.
 */
async function getCategorySimilarity(productId, limit = 8) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return [];

    const minPrice = Math.max(0, product.price * 0.75);
    const maxPrice = product.price * 1.25;

    const [sameCategory, nearbyPrice] = await Promise.all([
      prisma.product.findMany({
        where: {
          id: { not: productId },
          category: product.category,
        },
        orderBy: [{ rating: "desc" }, { reviews: "desc" }, { id: "asc" }],
        take: limit,
      }),
      prisma.product.findMany({
        where: {
          id: { not: productId },
          category: { not: product.category },
          price: { gte: minPrice, lte: maxPrice },
        },
        orderBy: [{ rating: "desc" }, { reviews: "desc" }, { id: "asc" }],
        take: limit,
      }),
    ]);

    return uniqueByProductId([...sameCategory, ...nearbyPrice])
      .slice(0, limit)
      .map((item) => ({
        ...item,
        recommendedBecause:
          item.category === product.category ? "Same category" : "Similar price range",
        similaritySource: item.category === product.category ? "category" : "price",
      }));
  } catch (error) {
    console.warn("Category similarity failed:", error.message);
    return getSimilarProducts(productId);
  }
}

/**
 * Users who bought this also bought
 * Finds products from orders that include the current product.
 */
async function getUsersAlsoBought(productId, limit = 8) {
  try {
    const relatedOrders = await prisma.orderItem.findMany({
      where: { productId },
      select: { orderId: true },
      distinct: ["orderId"],
      take: 100,
    });

    const orderIds = relatedOrders.map((item) => item.orderId);

    if (!orderIds.length) {
      return getCategorySimilarity(productId, limit);
    }

    const coPurchases = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        orderId: { in: orderIds },
        productId: { not: productId },
      },
      _count: { productId: true },
      orderBy: {
        _count: {
          productId: "desc",
        },
      },
      take: limit,
    });

    const coPurchaseIds = coPurchases.map((item) => item.productId);

    if (!coPurchaseIds.length) {
      return getCategorySimilarity(productId, limit);
    }

    const products = await prisma.product.findMany({
      where: { id: { in: coPurchaseIds } },
    });
    const countByProductId = new Map(
      coPurchases.map((item) => [item.productId, item._count.productId])
    );

    return coPurchaseIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean)
      .map((product) => {
        const purchaseCount = countByProductId.get(product.id) || 0;
        return {
          ...product,
          coPurchaseCount: purchaseCount,
          confidence: Math.min(100, purchaseCount * 25),
          recommendedBecause: `Bought together ${purchaseCount} time${purchaseCount === 1 ? "" : "s"}`,
        };
      });
  } catch (error) {
    console.warn("Users also bought recommendation failed:", error.message);
    return getCategorySimilarity(productId, limit);
  }
}

/**
 * Recently viewed logic
 * Returns a user's most recent unique product views.
 */
async function getRecentlyViewedProducts(userId, limit = 8) {
  try {
    const views = await prisma.viewHistory.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { viewedAt: "desc" },
      take: limit * 3,
    });

    const products = uniqueByProductId(views.map((view) => view.product));

    return products.slice(0, limit).map((product) => ({
      ...product,
      recommendedBecause: "Recently viewed",
    }));
  } catch (error) {
    console.warn("Recently viewed query failed:", error.message);
    return [];
  }
}

async function trackProductView(userId, productId) {
  return prisma.viewHistory.create({
    data: {
      userId,
      productId,
    },
  });
}

/**
 * Content-based recommendations
 * Recommends products similar to ones user has viewed or purchased
 */
async function getContentBasedRecommendations(userId, limit = 8) {
  try {
    // Get user's viewed products
    const viewedProducts = await prisma.viewHistory.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { viewedAt: "desc" },
      take: 5,
    });

    if (viewedProducts.length === 0) {
      return getPopularProducts(limit);
    }

    // Extract categories and price range from viewed products
    const categories = [...new Set(viewedProducts.map((v) => v.product.category))];
    const avgPrice =
      viewedProducts.reduce((sum, v) => sum + v.product.price, 0) / viewedProducts.length;

    // Find similar products
    const recommendations = await prisma.product.findMany({
      where: {
        id: { notIn: viewedProducts.map((v) => v.productId) },
        OR: [
          { category: { in: categories } },
          {
            price: {
              gte: Math.max(0, avgPrice * 0.7),
              lte: avgPrice * 1.3,
            },
          },
        ],
      },
      orderBy: { rating: "desc" },
      take: limit,
    });

    return recommendations.map((product) => ({
      ...product,
      recommendedBecause: "Based on your browsing history",
    }));
  } catch (error) {
    console.warn("Content-based recommendation failed:", error.message);
    return getPopularProducts(limit);
  }
}

/**
 * Collaborative filtering recommendations
 * Recommends products that similar users have purchased
 */
async function getCollaborativeRecommendations(userId, limit = 8) {
  try {
    // Get user's purchased products
    const userItems = await prisma.orderItem.findMany({
      where: { userId },
      select: { productId: true },
      take: 10,
    });

    if (userItems.length === 0) {
      return getPopularProducts(limit);
    }

    const purchasedProductIds = [...new Set(userItems.map((item) => item.productId))];

    // Find similar users (users who bought same products)
    const similarUsersOrders = await prisma.orderItem.findMany({
      where: {
        productId: { in: purchasedProductIds },
        userId: { not: userId },
      },
      select: { userId: true },
      distinct: ["userId"],
      take: 20,
    });

    const similarUserIds = [...new Set(similarUsersOrders.map((o) => o.userId))];

    if (similarUserIds.length === 0) {
      return getPopularProducts(limit);
    }

    // Get products purchased by similar users
    const recommendations = await prisma.orderItem.findMany({
      where: {
        userId: { in: similarUserIds },
        productId: { notIn: purchasedProductIds },
      },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return recommendations
      .map((item) => ({
        ...item.product,
        recommendedBecause: "Similar users bought this",
      }))
      .slice(0, limit);
  } catch (error) {
    console.warn("Collaborative recommendation failed:", error.message);
    return getPopularProducts(limit);
  }
}

/**
 * Category-based recommendations
 * Recommends top products in user's favorite categories
 */
async function getCategoryBasedRecommendations(userId, limit = 8) {
  try {
    // Get user's most viewed categories
    const userViews = await prisma.viewHistory.findMany({
      where: { userId },
      include: { product: true },
      distinct: ["productId"],
    });

    const categories = [...new Set(userViews.map((v) => v.product.category))];

    if (categories.length === 0) {
      return getPopularProducts(limit);
    }

    // Get top products from these categories
    const recommendations = await prisma.product.findMany({
      where: {
        category: { in: categories },
      },
      orderBy: [{ rating: "desc" }, { price: "asc" }],
      take: limit,
    });

    return recommendations.map((product) => ({
      ...product,
      recommendedBecause: "Popular in your favorite category",
    }));
  } catch (error) {
    console.warn("Category-based recommendation failed:", error.message);
    return getPopularProducts(limit);
  }
}

/**
 * Popular products recommendation
 * Returns highest-rated products across all categories
 */
async function getPopularProducts(limit = 8) {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ rating: "desc" }, { reviews: "desc" }],
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      recommendedBecause: "Popular with all users",
    }));
  } catch (error) {
    console.warn("Popular products query failed:", error.message);
    return [];
  }
}

/**
 * Trending products recommendation
 * Returns newest high-rated products
 */
async function getTrendingProducts(limit = 8) {
  try {
    const recentSince = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14);
    const [recentViews, recentPurchases, newestProducts] = await Promise.all([
      prisma.viewHistory.groupBy({
        by: ["productId"],
        where: { viewedAt: { gte: recentSince } },
        _count: { productId: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { createdAt: { gte: recentSince } },
        _count: { productId: true },
      }),
      prisma.product.findMany({
        orderBy: [{ createdAt: "desc" }, { rating: "desc" }, { reviews: "desc" }],
        take: limit * 2,
      }),
    ]);

    const scores = new Map();
    recentViews.forEach((item) => {
      scores.set(item.productId, (scores.get(item.productId) || 0) + item._count.productId);
    });
    recentPurchases.forEach((item) => {
      scores.set(item.productId, (scores.get(item.productId) || 0) + item._count.productId * 3);
    });

    const productIds = [...new Set([...scores.keys(), ...newestProducts.map((item) => item.id)])];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const ranked = products
      .map((product) => ({
        ...product,
        trendingScore:
          (scores.get(product.id) || 0) + (product.rating || 0) * 2 + Math.log((product.reviews || 0) + 1),
        recommendedBecause: "Trending from recent views and purchases",
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    if (ranked.length > 0) {
      return ranked;
    }

    const fallback = await prisma.product.findMany({
      orderBy: [{ rating: "desc" }, { reviews: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return fallback.map((product) => ({
      ...product,
      recommendedBecause: "Trending now",
    }));
  } catch (error) {
    console.warn("Trending products query failed:", error.message);
    return getPopularProducts(limit);
  }
}

async function getRecommendationOverview(userId, productId, limit = 8) {
  const [
    usersAlsoBought,
    categorySimilarity,
    recentlyViewed,
    trending,
    hybrid,
  ] = await Promise.all([
    productId ? getUsersAlsoBought(productId, limit) : Promise.resolve([]),
    productId ? getCategorySimilarity(productId, limit) : Promise.resolve([]),
    getRecentlyViewedProducts(userId, limit),
    getTrendingProducts(limit),
    getHybridRecommendations(userId, limit),
  ]);

  return {
    usersAlsoBought,
    categorySimilarity,
    recentlyViewed,
    trending,
    hybrid,
  };
}

/**
 * Hybrid recommendations
 * Combines content-based, collaborative, and popular recommendations
 */
async function getHybridRecommendations(userId, limit = 12) {
  try {
    // Fetch recommendations using different algorithms in parallel
    const [contentBased, collaborative, trending] = await Promise.allSettled([
      getContentBasedRecommendations(userId, Math.ceil(limit / 3)),
      getCollaborativeRecommendations(userId, Math.ceil(limit / 3)),
      getTrendingProducts(Math.ceil(limit / 3)),
    ]);

    // Combine results, prioritizing by order and removing duplicates
    const combined = [];
    const seen = new Set();

    // Add content-based results
    if (contentBased.status === "fulfilled") {
      contentBased.value.forEach((p) => {
        if (p && !seen.has(p.id)) {
          combined.push(p);
          seen.add(p.id);
        }
      });
    }

    // Add collaborative results
    if (collaborative.status === "fulfilled") {
      collaborative.value.forEach((p) => {
        if (p && !seen.has(p.id)) {
          combined.push(p);
          seen.add(p.id);
        }
      });
    }

    // Add trending results
    if (trending.status === "fulfilled") {
      trending.value.forEach((p) => {
        if (p && !seen.has(p.id)) {
          combined.push(p);
          seen.add(p.id);
        }
      });
    }

    return combined.slice(0, limit);
  } catch (error) {
    console.warn("Hybrid recommendation algorithm failed:", error.message);
    return getPopularProducts(limit);
  }
}

module.exports = {
  // Main recommendations
  getHybridRecommendations,
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getCategoryBasedRecommendations,
  getRecommendationOverview,

  // Specific types
  getPopularProducts,
  getTrendingProducts,
  getSimilarProducts,
  getCategorySimilarity,
  getUsersAlsoBought,
  getRecentlyViewedProducts,
  trackProductView,
};
