const prisma = require("../lib/prisma");
const dataStore = require("../lib/dataStore");

/**
 * Get similar products based on category and price
 */
async function getSimilarProducts(productId) {
  return dataStore.getSimilarProducts(productId);
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
    const products = await prisma.product.findMany({
      where: {
        rating: { gte: 4 },
      },
      orderBy: [{ createdAt: "desc" }, { rating: "desc" }],
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      recommendedBecause: "Trending now",
    }));
  } catch (error) {
    console.warn("Trending products query failed:", error.message);
    return getPopularProducts(limit);
  }
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

  // Specific types
  getPopularProducts,
  getTrendingProducts,
  getSimilarProducts,
};
