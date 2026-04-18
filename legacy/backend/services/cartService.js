/**
 * Cart Service
 * Business logic for shopping cart operations
 */

const prisma = require("../lib/prisma");
const { ApiError } = require("../middleware/errorHandler");

/**
 * Get user's cart
 */
async function getCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Create cart if it doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Calculate totals
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  return {
    ...cart,
    subtotal,
    itemCount: cart.items.length,
    totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

/**
 * Add item to cart
 */
async function addToCart(userId, productId, quantity = 1) {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  let cartItem;
  if (existingItem) {
    // Update quantity
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
      include: { product: true },
    });
  } else {
    // Create new cart item
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: { product: true },
    });
  }

  return cartItem;
}

/**
 * Update cart item quantity
 */
async function updateCartItemQuantity(cartItemId, quantity) {
  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const cartItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: { product: true },
  });

  return cartItem;
}

/**
 * Remove item from cart
 */
async function removeFromCart(cartItemId) {
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  return { message: "Item removed from cart" };
}

/**
 * Clear entire cart
 */
async function clearCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }

  return { message: "Cart cleared" };
}

/**
 * Get cart total
 */
async function getCartTotal(userId) {
  const cart = await getCart(userId);

  const subtotal = cart.items.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
  const total = subtotal + tax + shipping;

  return {
    subtotal,
    tax,
    shipping,
    total,
    itemCount: cart.items.length,
  };
}

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
};
