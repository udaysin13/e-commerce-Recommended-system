const prisma = require("../lib/prisma");

function dedupeProducts(products) {
  const seen = new Set();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

async function getSimilarProducts(productId) {
  const baseProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!baseProduct) {
    return [];
  }

  const minPrice = Math.max(0, baseProduct.price * 0.7);
  const maxPrice = baseProduct.price * 1.3;

  const items = await prisma.product.findMany({
    where: {
      id: { not: productId },
      OR: [
        { category: baseProduct.category },
        { price: { gte: minPrice, lte: maxPrice } },
      ],
    },
    take: 8,
  });

  return items.map((item) => ({
    ...item,
    reason:
      item.category === baseProduct.category
        ? "Same category"
        : "Similar price range",
  }));
}

async function getContentBasedRecommendations(userId) {
  const viewedProducts = await prisma.viewHistory.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { id: "desc" },
    take: 5,
  });

  if (viewedProducts.length === 0) {
    return [];
  }

  const seedCategories = viewedProducts.map((item) => item.product.category);
  const seedPrices = viewedProducts.map((item) => item.product.price);
  const averagePrice =
    seedPrices.reduce((sum, price) => sum + price, 0) / seedPrices.length;

  const items = await prisma.product.findMany({
    where: {
      OR: [
        { category: { in: seedCategories } },
        { price: { gte: averagePrice * 0.7, lte: averagePrice * 1.3 } },
      ],
    },
    take: 12,
  });

  return dedupeProducts(items).map((item) => ({
    ...item,
    source: "content-based",
  }));
}

async function getCollaborativeRecommendations(userId) {
  const userOrders = await prisma.order.findMany({
    where: { userId },
    select: { productId: true },
  });

  if (userOrders.length === 0) {
    return [];
  }

  const orderedProductIds = userOrders.map((order) => order.productId);

  const similarUsersOrders = await prisma.order.findMany({
    where: {
      productId: { in: orderedProductIds },
      userId: { not: userId },
    },
    select: { userId: true },
  });

  const similarUserIds = [...new Set(similarUsersOrders.map((item) => item.userId))];

  if (similarUserIds.length === 0) {
    return [];
  }

  const recommendedOrders = await prisma.order.findMany({
    where: {
      userId: { in: similarUserIds },
      productId: { notIn: orderedProductIds },
    },
    include: { product: true },
    take: 12,
  });

  return dedupeProducts(recommendedOrders.map((item) => item.product)).map((item) => ({
    ...item,
    source: "collaborative",
  }));
}

async function getHybridRecommendations(userId) {
  const [contentBased, collaborative] = await Promise.all([
    getContentBasedRecommendations(userId),
    getCollaborativeRecommendations(userId),
  ]);

  const combined = dedupeProducts([...contentBased, ...collaborative]);

  return combined.slice(0, 8);
}

module.exports = {
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getHybridRecommendations,
  getSimilarProducts,
};
