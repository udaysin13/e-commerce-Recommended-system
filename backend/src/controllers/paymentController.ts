import type { Request, RequestHandler } from "express";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  fetchRazorpayPaymentDetails,
  createOrderAfterPayment,
  logFailedPaymentAttempt,
  createStripeCheckoutSession,
  getOrderDetails,
} from "../services/paymentService.js";
import { PaymentMethod } from "../generated/prisma/enums.js";
import { validateCreateOrderInput } from "../validators/order.validation.js";

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
 * POST /payments/razorpay/create-order
 * Create Razorpay order for payment
 */
export const createRazorpayOrderController: RequestHandler = async (
  req,
  res,
) => {
  const userId = getAuthenticatedUserId(req);
  const { productId, quantity, userEmail, userPhone } = req.body;

  // Validation
  if (!productId || !quantity || !userEmail || !userPhone) {
    throw new HttpError(
      httpStatus.badRequest,
      "Missing required fields: productId, quantity, userEmail, userPhone",
    );
  }

  if (typeof quantity !== "number" || quantity < 1) {
    throw new HttpError(httpStatus.badRequest, "Invalid quantity");
  }

  try {
    const razorpayOrder = await createRazorpayOrder(
      productId,
      quantity,
      userEmail,
      userPhone,
    );

    res.status(httpStatus.ok).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to create payment order",
    );
  }
};

/**
 * POST /payments/razorpay/verify
 * Verify Razorpay payment and create order
 */
export const verifyRazorpayPaymentController: RequestHandler = async (
  req,
  res,
) => {
  const userId = getAuthenticatedUserId(req);
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  const { productId, quantity } = req.query;
  const address = validateCreateOrderInput(req.body);

  // Validation
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    throw new HttpError(
      httpStatus.badRequest,
      "Missing payment verification data",
    );
  }

  // Verify signature
  const isSignatureValid = verifyRazorpaySignature(
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  );

  if (!isSignatureValid) {
    // Log failed attempt
    await logFailedPaymentAttempt(
      userId,
      String(productId),
      Number(quantity),
      razorpay_payment_id,
      "Invalid signature",
    );

    throw new HttpError(
      httpStatus.badRequest,
      "Payment verification failed - invalid signature",
    );
  }

  try {
    // Fetch payment details to confirm
    const paymentDetails = await fetchRazorpayPaymentDetails(
      razorpay_payment_id,
    );

    if (paymentDetails.status !== "captured") {
      await logFailedPaymentAttempt(
        userId,
        String(productId),
        Number(quantity),
        razorpay_payment_id,
        `Payment status: ${paymentDetails.status}`,
      );

      throw new HttpError(
        httpStatus.badRequest,
        `Payment not captured. Status: ${paymentDetails.status}`,
      );
    }

    // Create order in database
    const order = await createOrderAfterPayment(
      userId,
      String(productId),
      Number(quantity),
      razorpay_payment_id,
      razorpay_order_id,
      address,
      PaymentMethod.RAZORPAY,
    );

    res.status(httpStatus.created).json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: Number(order.totalAmount),
        paymentId: order.paymentId,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    await logFailedPaymentAttempt(
      userId,
      String(productId),
      Number(quantity),
      razorpay_payment_id,
      error instanceof Error ? error.message : "Unknown error",
    );

    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to process payment",
    );
  }
};

/**
 * POST /payments/stripe/create-session
 * Create Stripe checkout session
 */
export const createStripeCheckoutSessionController: RequestHandler = async (
  req,
  res,
) => {
  const userId = getAuthenticatedUserId(req);
  const { productId, quantity, userEmail } = req.body;

  if (!productId || !quantity || !userEmail) {
    throw new HttpError(
      httpStatus.badRequest,
      "Missing required fields: productId, quantity, userEmail",
    );
  }

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  const successUrl = `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${frontendUrl}/payment-cancel`;

  try {
    const session = await createStripeCheckoutSession(
      productId,
      quantity,
      userEmail,
      successUrl,
      cancelUrl,
    );

    res.status(httpStatus.ok).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        url: session.url,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to create checkout session",
    );
  }
};

/**
 * POST /payments/stripe/webhook
 * Handle Stripe webhook for payment confirmations
 * This should NOT require authentication
 */
export const handleStripeWebhookController: RequestHandler = async (
  req,
  res,
) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    throw new HttpError(httpStatus.badRequest, "Missing stripe signature");
  }

  // In production, verify webhook signature with Stripe
  // For now, just process the event
  const event = req.body;

  // Handle specific events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Process the completed payment
    // This would create the order if not already created
    console.log("Checkout session completed:", session.id);

    res.json({ received: true });
    return;
  }

  res.json({ received: true });
};

/**
 * GET /payments/orders/:orderId
 * Get order details for confirmation
 */
export const getOrderDetailsController: RequestHandler = async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { orderId } = req.params;

  if (!orderId) {
    throw new HttpError(httpStatus.badRequest, "Order ID required");
  }

  try {
    const order = await getOrderDetails(orderId, userId);

    res.status(httpStatus.ok).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to fetch order",
    );
  }
};
