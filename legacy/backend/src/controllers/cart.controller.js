import prisma from "../utils/prisma.js";

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
};