const express = require("express");
const cartController = require("../controllers/cartController");
const { requireAuth, requireCartItemOwner, requireSelfFromParam } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/:userId", requireSelfFromParam("userId"), cartController.getCart);
router.get("/:userId/total", requireSelfFromParam("userId"), cartController.getCartTotal);
router.post("/:userId/items", requireSelfFromParam("userId"), cartController.addCartItem);
router.put("/items/:itemId", requireCartItemOwner, cartController.updateCartItem);
router.delete("/items/:itemId", requireCartItemOwner, cartController.removeCartItem);
router.delete("/:userId", requireSelfFromParam("userId"), cartController.clearCart);

module.exports = router;
