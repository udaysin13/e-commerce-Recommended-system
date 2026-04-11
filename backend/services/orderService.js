/**
 * Order Service
 * Business logic for order operations
 */

const prisma = require("../lib/prisma");
const { ApiError } = require("../middleware/errorHandler");
const cartService = require("./cartService");

/**
 * Create order from cart
 */
async function createOrder(userId, orderData = {}) {
  const { status = "pending" } = orderData;

  // Get cart
  const cart = await cartService.getCart(userId);

  if (cart.items.length === 0) {
    throw new ApiError(400, "Cannot create order from empty cart");
  }

  // Calculate total
  const { total } = await cartService.getCartTotal(userId);

  // Create order with items
  const order = await prisma.order.create({
    data: {
      userId,
      status,
      total,
      items: {
        createMany: {
          data: cart.items.map((item) => ({
            productId: item.product.id,
            userId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Clear cart after order creation
  await cartService.clearCart(userId);

  return order;
}

/**
 * Get order by ID
 */
async function getOrderById(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: true,
    },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  // Verify user owns this order
  if (order.userId !== userId) {
    throw new ApiError(403, "You don't have access to this order");
  }

  return order;
}

/**
 * Get user's orders
 */
async function getUserOrders(userId, options = {}) {
  const { page = 1, limit = 10, status } = options;
  const skip = (page - 1) * limit;

  const where = { userId };
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update order status
 */
async function updateOrderStatus(orderId, userId, newStatus) {
  const validStatuses = ["pending", "confirmed", "shipped", "delivered"];

  if (!validStatuses.includes(newStatus)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  // Verify user owns this order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.userId !== userId) {
    throw new ApiError(403, "You don't have access to this order");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return updatedOrder;
}

/**
 * Cancel order
 */
async function cancelOrder(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.userId !== userId) {
    throw new ApiError(403, "You don't have access to this order");
  }

  if (order.status !== "pending") {
    throw new ApiError(400, "Can only cancel pending orders");
  }

  const cancelledOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: "cancelled" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return cancelledOrder;
}

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
};
