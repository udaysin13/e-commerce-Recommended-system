import { Router } from "express";
import {
  createRazorpayOrderController,
  verifyRazorpayPaymentController,
  createStripeCheckoutSessionController,
  handleStripeWebhookController,
  getOrderDetailsController,
} from "../controllers/paymentController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const paymentRouter = Router();

/**
 * Razorpay Routes
 */

// POST /payments/razorpay/create-order
// Create Razorpay order (requires authentication)
paymentRouter.post(
  "/razorpay/create-order",
  requireAuth,
  asyncHandler(createRazorpayOrderController),
);

// POST /payments/razorpay/verify
// Verify Razorpay payment (requires authentication)
paymentRouter.post(
  "/razorpay/verify",
  requireAuth,
  asyncHandler(verifyRazorpayPaymentController),
);

/**
 * Stripe Routes
 */

// POST /payments/stripe/create-session
// Create Stripe checkout session (requires authentication)
paymentRouter.post(
  "/stripe/create-session",
  requireAuth,
  asyncHandler(createStripeCheckoutSessionController),
);

// POST /payments/stripe/webhook
// Handle Stripe webhook (does NOT require authentication)
paymentRouter.post(
  "/stripe/webhook",
  asyncHandler(handleStripeWebhookController),
);

/**
 * Order Details Route
 */

// GET /payments/orders/:orderId
// Get order details after payment (requires authentication)
paymentRouter.get(
  "/orders/:orderId",
  requireAuth,
  asyncHandler(getOrderDetailsController),
);
