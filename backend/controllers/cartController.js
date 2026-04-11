const cartService = require("../services/cartService");
const asyncHandler = require("../middleware/asyncHandler");

const getCart = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const cart = await cartService.getCart(userId);
  res.json(cart);
});

const addCartItem = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const productId = Number(req.body.productId);
  const quantity = Number(req.body.quantity || 1);

  const cartItem = await cartService.addToCart(userId, productId, quantity);

  res.status(201).json({
    message: "Item added to cart",
    cartItem,
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const itemId = Number(req.params.itemId);
  const quantity = Number(req.body.quantity);
  const cartItem = await cartService.updateCartItemQuantity(itemId, quantity);

  res.json({
    message: "Cart item updated",
    cartItem,
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const itemId = Number(req.params.itemId);
  const result = await cartService.removeFromCart(itemId);
  res.json(result);
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const result = await cartService.clearCart(userId);
  res.json(result);
});

const getCartTotal = asyncHandler(async (req, res) => {
  const userId = Number(req.params.userId);
  const total = await cartService.getCartTotal(userId);
  res.json(total);
});

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartTotal,
};
