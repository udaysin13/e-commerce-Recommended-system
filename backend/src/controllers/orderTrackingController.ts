import type { Request, RequestHandler } from "express";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";
import {
  getUserOrders,
  getOrderById,
  getOrderTrackingHistory,
  updateOrderStatus,
  getAllOrders,
  getOrderWithFullDetails,
  getOrderStats,
} from "../services/orderTrackingService.js";
import { OrderStatus } from "../generated/prisma/enums.js";

/**
 * Get authenticated user ID from request
 */
const getAuthenticatedUserId = (req: Request): string => {
  if (!req.auth) {
    throw new HttpError(httpStatus.unauthorized, "Authentication required");
  }
  return req.auth.userId;
};

/**
 * Check if user is admin
 */
const isAdmin = (req: Request): boolean => {
  return req.auth?.role === "ADMIN";
};

/**
 * GET /orders
 * Get all orders for logged-in user with pagination
 */
export const listUserOrdersController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  try {
    const result = await getUserOrders(userId, limit, offset);

    res.status(httpStatus.ok).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to fetch orders",
    );
  }
};

/**
 * GET /orders/:id
 * Get detailed order information with items and tracking history
 */
export const getOrderDetailsController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { id } = req.params;

  if (!id) {
    throw new HttpError(httpStatus.badRequest, "Order ID is required");
  }

  try {
    const order = await getOrderById(id, userId);

    res.status(httpStatus.ok).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(httpStatus.internalServerError, "Failed to fetch order");
  }
};

/**
 * GET /orders/:id/tracking
 * Get tracking history timeline for an order
 */
export const getTrackingTimelineController: RequestHandler = async (
  req,
  res,
) => {
  const userId = getAuthenticatedUserId(req);
  const { id } = req.params;

  if (!id) {
    throw new HttpError(httpStatus.badRequest, "Order ID is required");
  }

  try {
    const history = await getOrderTrackingHistory(id, userId);

    res.status(httpStatus.ok).json({
      success: true,
      data: {
        orderId: id,
        tracking: history,
        totalEvents: history.length,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to fetch tracking history",
    );
  }
};

/**
 * GET /orders/stats
 * Get order statistics for logged-in user
 */
export const getUserOrderStatsController: RequestHandler = async (
  req,
  res,
) => {
  const userId = getAuthenticatedUserId(req);

  try {
    const stats = await getOrderStats(userId);

    res.status(httpStatus.ok).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to fetch stats",
    );
  }
};

/**
 * PATCH /admin/orders/:id/status
 * Update order status (admin only)
 */
export const updateOrderStatusController: RequestHandler = async (
  req,
  res,
) => {
  // Check admin access
  if (!isAdmin(req)) {
    throw new HttpError(httpStatus.forbidden, "Admin access required");
  }

  const { id } = req.params;
  const { status, message, note, trackingNumber, courierName, estimatedDeliveryDate } = req.body;
  const adminId = getAuthenticatedUserId(req);

  // Validation
  if (!id) {
    throw new HttpError(httpStatus.badRequest, "Order ID is required");
  }

  if (!status) {
    throw new HttpError(httpStatus.badRequest, "Status is required");
  }

  if (!Object.values(OrderStatus).includes(status)) {
    throw new HttpError(
      httpStatus.badRequest,
      `Invalid status. Must be one of: ${Object.values(OrderStatus).join(", ")}`,
    );
  }

  try {
    const updatedOrder = await updateOrderStatus({
      orderId: id,
      newStatus: status as OrderStatus,
      message,
      note,
      updatedBy: adminId,
      trackingNumber,
      courierName,
      estimatedDeliveryDate: estimatedDeliveryDate
        ? new Date(estimatedDeliveryDate)
        : undefined,
    });

    res.status(httpStatus.ok).json({
      success: true,
      data: {
        order: updatedOrder,
        message: `Order status updated to ${status}`,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to update order status",
    );
  }
};

/**
 * GET /admin/orders
 * Get all orders (admin only) with optional status filter
 */
export const listAllOrdersController: RequestHandler = async (req, res) => {
  // Check admin access
  if (!isAdmin(req)) {
    throw new HttpError(httpStatus.forbidden, "Admin access required");
  }

  const limit = Math.min(Number(req.query.limit) || 50, 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const status = req.query.status as string | undefined;

  try {
    const result = await getAllOrders(
      limit,
      offset,
      status ? (status as OrderStatus) : undefined,
    );

    res.status(httpStatus.ok).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to fetch orders",
    );
  }
};

/**
 * GET /admin/orders/:id
 * Get full order details with user info (admin only)
 */
export const getFullOrderDetailsController: RequestHandler = async (
  req,
  res,
) => {
  // Check admin access
  if (!isAdmin(req)) {
    throw new HttpError(httpStatus.forbidden, "Admin access required");
  }

  const { id } = req.params;

  if (!id) {
    throw new HttpError(httpStatus.badRequest, "Order ID is required");
  }

  try {
    const order = await getOrderWithFullDetails(id);

    res.status(httpStatus.ok).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(httpStatus.internalServerError, "Failed to fetch order");
  }
};
