const prisma = require("../lib/prisma");

async function createOrder(req, res, next) {
  try {
    const userId = Number(req.body.userId);
    const productId = Number(req.body.productId);

    if (!userId || !productId) {
      return res.status(400).json({ error: "userId and productId are required." });
    }

    const [user, product] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ]);

    if (!user || !product) {
      return res.status(404).json({ error: "User or product not found." });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        productId,
      },
    });

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
