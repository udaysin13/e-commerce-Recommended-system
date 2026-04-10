const dataStore = require("../lib/dataStore");

async function getProducts(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 8);
    const category = req.query.category || "";
    const search = req.query.search || "";
    const result = await dataStore.getProducts({ page, limit, category, search });
    return res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const productId = Number(req.params.id);
    const product = await dataStore.getProductById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const similarProducts = await dataStore.getSimilarProducts(productId);

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
    const items = await dataStore.getHybridRecommendations(userId);
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
