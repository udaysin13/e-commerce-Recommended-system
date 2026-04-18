const express = require("express");
const { createOrder } = require("../controllers/orderController");
const { requireAuth, requireSelfFromBody } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", requireAuth, requireSelfFromBody("userId"), createOrder);

module.exports = router;
