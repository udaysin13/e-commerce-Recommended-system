const dataStore = require("../lib/dataStore");

async function createOrder(req, res, next) {
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

    const order = await dataStore.createOrder({ userId, productId });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
};
