const express = require("express");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/:userId", cartController.getCart);
router.get("/:userId/total", cartController.getCartTotal);
router.post("/:userId/items", cartController.addCartItem);
router.put("/items/:itemId", cartController.updateCartItem);
router.delete("/items/:itemId", cartController.removeCartItem);
router.delete("/:userId", cartController.clearCart);

module.exports = router;
