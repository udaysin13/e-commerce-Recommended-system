const orderService = require("../services/orderService");
const asyncHandler = require("../middleware/asyncHandler");

const createOrder = asyncHandler(async (req, res) => {
  const userId = Number(req.body.userId);

  if (!userId || userId <= 0) {
    return res.status(400).json({ error: "Valid userId is required." });
  }

  const order = await orderService.createOrder(userId, {
    status: req.body.status,
  });

  return res.status(201).json({
    message: "Order created successfully",
    order,
  });
});

module.exports = {
  createOrder,
};
