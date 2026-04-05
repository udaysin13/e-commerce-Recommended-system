const prisma = require("../lib/prisma");
const {
  getHybridRecommendations,
  getSimilarProducts,
} = require("../services/recommendationService");

async function getProducts(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 8);
    const skip = (page - 1) * limit;
    const category = req.query.category || "";
    const search = req.query.search || "";

    const where = {
      AND: [
        category ? { category: { equals: category, mode: "insensitive" } } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { category: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      items: products,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const similarProducts = await getSimilarProducts(productId);

    return res.json({
      item: product,
      similarProducts,
    });
  } catch (error) {
    next(error);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const items = await getHybridRecommendations(userId);
    return res.json({ items });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  getRecommendations,
};
