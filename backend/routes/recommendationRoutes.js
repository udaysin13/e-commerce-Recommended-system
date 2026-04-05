const express = require("express");
const { getRecommendations } = require("../controllers/productController");
const { getSimilarProducts } = require("../services/recommendationService");

const router = express.Router();

router.get("/recommendations/:userId", getRecommendations);

router.get("/similar/:productId", async (req, res, next) => {
  try {
    const items = await getSimilarProducts(Number(req.params.productId));
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
