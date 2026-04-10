const dataStore = require("../lib/dataStore");

async function createView(req, res, next) {
  try {
    const userId = Number(req.body.userId);
    const productId = Number(req.body.productId);

    if (!userId || !productId) {
      return res.status(400).json({ error: "userId and productId are required." });
    }

    const [user, product] = await Promise.all([
      dataStore.getUserById(userId),
      dataStore.getProductById(productId),
    ]);

    if (!user || !product) {
      return res.status(404).json({ error: "User or product not found." });
    }

    const view = await dataStore.createView({ userId, productId });

    return res.status(201).json({
      message: "View tracked successfully",
      view,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createView,
};
