import prisma from "../utils/prisma.js";

export const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    const views = await prisma.viewHistory.findMany({
      where: { userId: Number(userId) },
      include: { product: true },
    });

    const categories = views.map(v => v.product.category);

    const recommendations = await prisma.product.findMany({
      where: {
        category: { in: categories },
      },
      take: 5,
    });

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: "Failed to get recommendations" });
  }
};