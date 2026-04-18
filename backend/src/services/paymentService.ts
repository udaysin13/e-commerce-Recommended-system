import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { PaymentStatus, PaymentMethod } from "../generated/prisma/enums.js";
import type { CreateOrderInput } from "../types/order.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";
import crypto from "crypto";

// Types for payment flow
export interface CreateOrderPaymentInput {
  productId: string;
  quantity: number;
  userEmail: string;
  userPhone: string;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, unknown>;
  created_at: number;
}

export interface RazorpayVerificationInput {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface StripeCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

/**
 * Payment Service - Handles all payment-related operations
 * Supports: Razorpay, Stripe
 * This is the main orchestrator for payment flow
 */

const toNumber = (value: { toString(): string }): number => {
  return Number(value.toString());
};

const toCents = (value: { toString(): string }): number => {
  return Math.round(toNumber(value) * 100);
};

const fromCents = (value: number): number => {
  return value / 100;
};

/**
 * Validate product and calculate exact payment amount
 * IMPORTANT: Amount must be calculated on backend, never trust frontend
 */
export const validateAndCalculateAmount = async (
  productId: string,
  quantity: number,
): Promise<{ amount: number; product: any }> => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new HttpError(httpStatus.notFound, "Product not found");
  }

  if (!product.isActive) {
    throw new HttpError(httpStatus.badRequest, "Product is unavailable");
  }

  if (quantity <= 0 || quantity > product.stockQuantity) {
    throw new HttpError(
      httpStatus.badRequest,
      `Invalid quantity. Available: ${product.stockQuantity}`,
    );
  }

  // Calculate amount on backend (NEVER trust frontend)
  const priceInCents = toCents(product.price);
  const subtotalCents = priceInCents * quantity;
  const taxCents = Math.round(subtotalCents * 0.1); // 10% tax
  const shippingCents = 0; // Free shipping
  const totalCents = subtotalCents + taxCents + shippingCents;

  return {
    amount: totalCents, // in paise/cents
    product,
  };
};

/**
 * Create Razorpay order for payment
 */
export const createRazorpayOrder = async (
  productId: string,
  quantity: number,
  userEmail: string,
  userPhone: string,
): Promise<RazorpayOrderResponse> => {
  const { amount, product } = await validateAndCalculateAmount(
    productId,
    quantity,
  );

  const razorpayKey = process.env.RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKey || !razorpaySecret) {
    throw new HttpError(
      httpStatus.internalServerError,
      "Payment gateway not configured",
    );
  }

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount, // in paise
        currency: product.currency || "INR",
        receipt: `order-${Date.now()}`,
        notes: {
          productId,
          quantity,
          userEmail,
          userPhone,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Razorpay order");
    }

    const order = (await response.json()) as RazorpayOrderResponse;
    return order;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to create payment order",
    );
  }
};

/**
 * Verify Razorpay payment signature
 * Critical for security - prevents tampering
 */
export const verifyRazorpaySignature = (
  paymentId: string,
  orderId: string,
  signature: string,
): boolean => {
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpaySecret) {
    return false;
  }

  const signatureBody = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", razorpaySecret)
    .update(signatureBody)
    .digest("hex");

  return expectedSignature === signature;
};

/**
 * Fetch payment details from Razorpay
 */
export const fetchRazorpayPaymentDetails = async (paymentId: string) => {
  const razorpayKey = process.env.RAZORPAY_KEY_ID;
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKey || !razorpaySecret) {
    throw new HttpError(
      httpStatus.internalServerError,
      "Payment gateway not configured",
    );
  }

  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString("base64")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch payment details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching payment details:", error);
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to fetch payment details",
    );
  }
};

/**
 * Create order in database after payment verification
 */
export const createOrderAfterPayment = async (
  userId: string,
  productId: string,
  quantity: number,
  paymentId: string,
  orderId: string,
  address: CreateOrderInput,
  paymentMethod: PaymentMethod = PaymentMethod.RAZORPAY,
) => {
  const { amount, product } = await validateAndCalculateAmount(
    productId,
    quantity,
  );

  const transactionId = `${paymentMethod}-${paymentId}`;

  return await prisma.$transaction(async (tx) => {
    // Check if order already exists (idempotency)
    const existingOrder = await tx.order.findUnique({
      where: { paymentId },
    });

    if (existingOrder) {
      return existingOrder;
    }

    // Check stock again
    const currentProduct = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!currentProduct || quantity > currentProduct.stockQuantity) {
      throw new HttpError(
        httpStatus.badRequest,
        "Insufficient stock for order",
      );
    }

    // Calculate totals (same as frontend)
    const subtotalCents = toCents(product.price) * quantity;
    const taxCents = Math.round(subtotalCents * 0.1);
    const shippingCents = 0;
    const totalCents = subtotalCents + taxCents + shippingCents;

    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        orderNumber,
        status: "CONFIRMED",
        paymentStatus: PaymentStatus.PAID,
        paymentMethod,
        paymentId,
        transactionId,
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        subtotal: fromCents(subtotalCents),
        taxAmount: fromCents(taxCents),
        shippingAmount: fromCents(shippingCents),
        discountAmount: 0,
        totalAmount: fromCents(totalCents),
        currency: product.currency || "INR",
        shippingName: address.fullName,
        shippingAddress: address.addressLine2
          ? `${address.addressLine1}, ${address.addressLine2}`
          : address.addressLine1,
        shippingCity: address.city,
        shippingState: address.state,
        shippingZip: address.postalCode,
        shippingCountry: address.country,
        paidAt: new Date(),
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              quantity,
              unitPrice: product.price,
              totalPrice: fromCents(totalCents),
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    // Update product stock
    await tx.product.update({
      where: { id: productId },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
        purchaseCount: {
          increment: quantity,
        },
      },
    });

    return order;
  });
};

/**
 * Handle payment failure - store failed attempt
 */
export const logFailedPaymentAttempt = async (
  userId: string,
  productId: string,
  quantity: number,
  paymentId: string,
  reason: string,
) => {
  // In production, you might want to store this in a separate failed_payments table
  // For now, we just log it
  console.error("Failed payment attempt:", {
    userId,
    productId,
    quantity,
    paymentId,
    reason,
    timestamp: new Date(),
  });

  // Could be used for fraud detection, analytics, etc.
};

/**
 * Initiate Stripe checkout session
 * For international payments
 */
export const createStripeCheckoutSession = async (
  productId: string,
  quantity: number,
  userEmail: string,
  successUrl: string,
  cancelUrl: string,
): Promise<StripeCheckoutSessionResponse> => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    throw new HttpError(
      httpStatus.internalServerError,
      "Stripe not configured",
    );
  }

  const { amount, product } = await validateAndCalculateAmount(
    productId,
    quantity,
  );

  try {
    // This is a simplified example - use @stripe/stripe-js in production
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[0]": "card",
        "line_items[0][price_data][currency]": product.currency || "usd",
        "line_items[0][price_data][product_data][name]": product.name,
        "line_items[0][price_data][unit_amount]": String(amount),
        "line_items[0][quantity]": String(quantity),
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        metadata: JSON.stringify({
          productId,
          quantity,
        }),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create Stripe session");
    }

    const session = await response.json();

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("Stripe session creation error:", error);
    throw new HttpError(
      httpStatus.internalServerError,
      "Failed to create checkout session",
    );
  }
};

/**
 * Get order by ID (for confirmation page)
 */
export const getOrderDetails = async (orderId: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
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

  if (!order) {
    throw new HttpError(httpStatus.notFound, "Order not found");
  }

  return order;
};
