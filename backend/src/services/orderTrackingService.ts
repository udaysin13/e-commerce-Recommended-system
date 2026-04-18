import { prisma } from "../lib/prisma.js";
import { OrderStatus } from "../generated/prisma/enums.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

/**
 * Order Tracking Service
 * Handles order status updates, tracking history, and order retrieval
 */

export interface UpdateOrderStatusInput {
  orderId: string;
  newStatus: OrderStatus;
  message?: string;
  note?: string;
  updatedBy?: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDeliveryDate?: Date;
}

/**
 * Get all orders for a user with basic info
 */
export const getUserOrders = async (userId: string, limit = 20, offset = 0) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      currency: true,
      placedAt: true,
      estimatedDeliveryDate: true,
      items: {
        select: {
          productName: true,
          quantity: true,
        },
        take: 1,
      },
    },
    orderBy: { placedAt: "desc" },
    take: limit,
    skip: offset,
  });

  const total = await prisma.order.count({ where: { userId } });

  return {
    orders,
    total,
    limit,
    offset,
  };
};

/**
 * Get detailed order information for a user
 */
export const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              price: true,
            },
          },
        },
      },
      trackingHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    throw new HttpError(httpStatus.notFound, "Order not found");
  }

  return order;
};

/**
 * Get tracking history for an order
 */
export const getOrderTrackingHistory = async (
  orderId: string,
  userId: string,
) => {
  // First verify the order belongs to the user
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true },
  });

  if (!order) {
    throw new HttpError(httpStatus.notFound, "Order not found");
  }

  const history = await prisma.orderTrackingHistory.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  return history;
};

/**
 * Create tracking history entry
 * Called internally when order status is updated
 */
export const createTrackingHistoryEntry = async (
  orderId: string,
  status: OrderStatus,
  message?: string,
  note?: string,
  updatedBy?: string,
) => {
  const historyEntry = await prisma.orderTrackingHistory.create({
    data: {
      orderId,
      status,
      message: message || getDefaultMessageForStatus(status),
      note,
      updatedBy,
    },
  });

  return historyEntry;
};

/**
 * Get default message for each order status
 */
const getDefaultMessageForStatus = (status: OrderStatus): string => {
  const messages: Record<OrderStatus, string> = {
    PENDING: "Order has been placed and is awaiting confirmation",
    CONFIRMED: "Order has been confirmed",
    PACKED: "Your order has been packed and is ready for shipment",
    SHIPPED: "Your order has been shipped",
    OUT_FOR_DELIVERY: "Your order is out for delivery",
    DELIVERED: "Your order has been delivered",
    CANCELLED: "Your order has been cancelled",
    RETURNED: "Your order has been returned",
  };
  return messages[status] || "Order status updated";
};

/**
 * Update order status (admin only)
 * Automatically creates a tracking history entry
 */
export const updateOrderStatus = async (input: UpdateOrderStatusInput) => {
  const {
    orderId,
    newStatus,
    message,
    note,
    updatedBy,
    trackingNumber,
    courierName,
    estimatedDeliveryDate,
  } = input;

  // Verify order exists
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new HttpError(httpStatus.notFound, "Order not found");
  }

  // Check if status transition is valid
  if (!isValidStatusTransition(order.status, newStatus)) {
    throw new HttpError(
      httpStatus.badRequest,
      `Cannot transition from ${order.status} to ${newStatus}`,
    );
  }

  // Use transaction to ensure both update and history creation succeed
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Update order status and tracking info
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        ...(trackingNumber && { trackingNumber }),
        ...(courierName && { courierName }),
        ...(estimatedDeliveryDate && {
          estimatedDeliveryDate,
        }),
        ...(newStatus === OrderStatus.DELIVERED && {
          deliveredAt: new Date(),
        }),
        ...(newStatus === OrderStatus.CANCELLED && {
          cancelledAt: new Date(),
        }),
        updatedAt: new Date(),
      },
      include: {
        trackingHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Create tracking history entry
    await tx.orderTrackingHistory.create({
      data: {
        orderId,
        status: newStatus,
        message: message || getDefaultMessageForStatus(newStatus),
        note,
        updatedBy,
      },
    });

    return updated;
  });

  return updatedOrder;
};

/**
 * Validate order status transitions
 * Ensures logical flow of order states
 */
const isValidStatusTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): boolean => {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PACKED, OrderStatus.CANCELLED],
    [OrderStatus.PACKED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.OUT_FOR_DELIVERY]: [
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.RETURNED]: [],
  };

  // Allow any status to update to itself (idempotency)
  if (currentStatus === newStatus) {
    return true;
  }

  const allowed = validTransitions[currentStatus] || [];
  return allowed.includes(newStatus);
};

/**
 * Get order count for stats
 */
export const getOrderStats = async (userId: string) => {
  const stats = await prisma.order.groupBy({
    by: ["status"],
    where: { userId },
    _count: true,
  });

  return stats.reduce(
    (acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    },
    {} as Record<string, number>,
  );
};

/**
 * Search orders by status or date range
 */
export const searchOrders = async (
  userId: string,
  filters: {
    status?: OrderStatus;
    startDate?: Date;
    endDate?: Date;
  },
) => {
  const where: any = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.placedAt = {};
    if (filters.startDate) {
      where.placedAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.placedAt.lte = filters.endDate;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      trackingHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { placedAt: "desc" },
  });

  return orders;
};

/**
 * Get all orders for admin (no user filter)
 */
export const getAllOrders = async (
  limit = 50,
  offset = 0,
  status?: OrderStatus,
) => {
  const where = status ? { status } : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      items: {
        select: { productName: true, quantity: true, unitPrice: true },
        take: 2,
      },
    },
    orderBy: { placedAt: "desc" },
    take: limit,
    skip: offset,
  });

  const total = await prisma.order.count({ where });

  return {
    orders,
    total,
    limit,
    offset,
  };
};

/**
 * Get order with full details including history
 */
export const getOrderWithFullDetails = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              imageUrl: true,
            },
          },
        },
      },
      trackingHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    throw new HttpError(httpStatus.notFound, "Order not found");
  }

  return order;
};
