import { Router } from "express";
import {
  listUserOrdersController,
  getOrderDetailsController,
  getTrackingTimelineController,
  getUserOrderStatsController,
  updateOrderStatusController,
  listAllOrdersController,
  getFullOrderDetailsController,
} from "../controllers/orderTrackingController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const orderTrackingRouter = Router();

/**
 * User Routes - Require authentication
 */

// GET /orders
// List all orders for logged-in user with pagination
orderTrackingRouter.get(
  "/",
  requireAuth,
  asyncHandler(listUserOrdersController),
);

// GET /orders/stats
// Get order statistics for logged-in user
orderTrackingRouter.get(
  "/stats",
  requireAuth,
  asyncHandler(getUserOrderStatsController),
);

// GET /orders/:id
// Get detailed order information with items
orderTrackingRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(getOrderDetailsController),
);

// GET /orders/:id/tracking
// Get tracking history timeline for an order
orderTrackingRouter.get(
  "/:id/tracking",
  requireAuth,
  asyncHandler(getTrackingTimelineController),
);

/**
 * Admin Routes - Require admin role
 */

// PATCH /admin/orders/:id/status
// Update order status and add tracking history
orderTrackingRouter.patch(
  "/admin/:id/status",
  requireAuth,
  asyncHandler(updateOrderStatusController),
);

// GET /admin/orders
// List all orders with optional status filter
orderTrackingRouter.get(
  "/admin",
  requireAuth,
  asyncHandler(listAllOrdersController),
);

// GET /admin/orders/:id
// Get full order details with user info
orderTrackingRouter.get(
  "/admin/:id",
  requireAuth,
  asyncHandler(getFullOrderDetailsController),
);
