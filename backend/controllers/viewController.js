const prisma = require("../lib/prisma");

async function createView(req, res, next) {
  try {
    const userId = Number(req.body.userId);
    const productId = Number(req.body.productId);

    if (!userId || !productId) {
      return res.status(400).json({ error: "userId and productId are required." });
    }

    const view = await prisma.viewHistory.create({
      data: {
        userId,
        productId,
      },
    });

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
