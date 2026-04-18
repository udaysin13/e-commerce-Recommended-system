import {
  CartStatus,
  OrderStatus,
  PaymentStatus,
  ProductInteractionType,
} from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { recordProductInteraction } from "./eventService.js";
import type { CreateOrderInput, OrderResponse } from "../types/order.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

const orderInclude = {
  items: {
    orderBy: {
      createdAt: "asc",
    },
  },
} as const;

type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof orderInclude;
}>;

const toNumber = (value: { toString(): string }): number => {
  return Number(value.toString());
};

const toCents = (value: { toString(): string }): number => {
  return Math.round(toNumber(value) * 100);
};

const fromCents = (value: number): number => {
  return value / 100;
};

const mapOrder = (order: OrderWithItems): OrderResponse => {
  const shippingAddress = order.addressLine2
    ? `${order.addressLine1 ?? ""}, ${order.addressLine2}`
    : order.addressLine1;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: toNumber(order.subtotal),
    taxAmount: toNumber(order.taxAmount),
    shippingAmount: toNumber(order.shippingAmount),
    discountAmount: toNumber(order.discountAmount),
    totalAmount: toNumber(order.totalAmount),
    currency: order.currency,
    shippingName: order.shippingName ?? order.fullName,
    shippingAddress: order.shippingAddress ?? shippingAddress ?? null,
    shippingCity: order.shippingCity ?? order.city,
    shippingState: order.shippingState ?? order.state,
    shippingZip: order.shippingZip ?? order.postalCode,
    shippingCountry: order.shippingCountry ?? order.country,
    fullName: order.fullName,
    phone: order.phone,
    addressLine1: order.addressLine1,
    addressLine2: order.addressLine2,
    city: order.city,
    state: order.state,
    postalCode: order.postalCode,
    country: order.country,
    placedAt: order.placedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      totalPrice: toNumber(item.totalPrice),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  };
};

const createOrderNumber = (): string => {
  const date = new Date();
  const compactDate = date.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${compactDate}-${suffix}`;
};

export const createOrderFromCart = async (
  userId: string,
  input: CreateOrderInput,
): Promise<OrderResponse> => {
  const orderId = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findFirst({
      where: {
        userId,
        status: CartStatus.ACTIVE,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new HttpError(httpStatus.badRequest, "Cart is empty.");
    }

    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new HttpError(httpStatus.badRequest, `${item.product.name} is no longer available.`);
      }

      if (item.quantity > item.product.stockQuantity) {
        throw new HttpError(
          httpStatus.badRequest,
          `${item.product.name} does not have enough stock.`,
        );
      }
    }

    const subtotalCents = cart.items.reduce(
      (total, item) => total + toCents(item.unitPrice) * item.quantity,
      0,
    );
    const taxCents = 0;
    const shippingCents = 0;
    const discountCents = 0;
    const totalCents = subtotalCents + taxCents + shippingCents - discountCents;
    const currency = cart.items[0]?.product.currency ?? "USD";
    const orderNumber = createOrderNumber();

    const order = await tx.order.create({
      data: {
        userId,
        orderNumber,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        fullName: input.fullName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        subtotal: fromCents(subtotalCents),
        taxAmount: fromCents(taxCents),
        shippingAmount: fromCents(shippingCents),
        discountAmount: fromCents(discountCents),
        totalAmount: fromCents(totalCents),
        currency,
        shippingName: input.fullName,
        shippingAddress: input.addressLine2
          ? `${input.addressLine1}, ${input.addressLine2}`
          : input.addressLine1,
        shippingCity: input.city,
        shippingState: input.state,
        shippingZip: input.postalCode,
        shippingCountry: input.country,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            sku: item.product.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: fromCents(toCents(item.unitPrice) * item.quantity),
          })),
        },
      },
      select: {
        id: true,
        orderNumber: true,
      },
    });

    for (const item of cart.items) {
      const updatedProduct = await tx.product.updateMany({
        where: {
          id: item.productId,
          stockQuantity: {
            gte: item.quantity,
          },
        },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
          purchaseCount: {
            increment: item.quantity,
          },
        },
      });

      if (updatedProduct.count !== 1) {
        throw new HttpError(
          httpStatus.badRequest,
          `${item.product.name} does not have enough stock.`,
        );
      }

      await recordProductInteraction(
        userId,
        {
          productId: item.productId,
          type: ProductInteractionType.PURCHASE,
          quantity: item.quantity,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            unitPrice: item.unitPrice.toString(),
            totalPrice: fromCents(toCents(item.unitPrice) * item.quantity),
          },
        },
        tx,
      );
    }

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: {
        status: CartStatus.CHECKED_OUT,
      },
      select: { id: true },
    });

    return order.id;
  });

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: orderInclude,
  });

  return mapOrder(order);
};

export const getOrders = async (userId: string): Promise<OrderResponse[]> => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { placedAt: "desc" },
  });

  return orders.map(mapOrder);
};

export const getOrderById = async (
  userId: string,
  orderId: string,
): Promise<OrderResponse> => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: orderInclude,
  });

  if (!order) {
    throw new HttpError(httpStatus.notFound, "Order not found.");
  }

  return mapOrder(order);
};

export const createBuyNowOrder = async (
  userId: string,
  productId: string,
  quantity: number,
  input: CreateOrderInput,
): Promise<OrderResponse> => {
  const orderId = await prisma.$transaction(async (tx) => {
    // Fetch product
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new HttpError(httpStatus.notFound, "Product not found.");
    }

    if (!product.isActive) {
      throw new HttpError(httpStatus.badRequest, "Product is no longer available.");
    }

    if (quantity <= 0) {
      throw new HttpError(httpStatus.badRequest, "Quantity must be greater than 0.");
    }

    if (quantity > product.stockQuantity) {
      throw new HttpError(
        httpStatus.badRequest,
        `${product.name} does not have enough stock. Available: ${product.stockQuantity}`,
      );
    }

    // Calculate totals
    const unitPriceCents = toCents(product.price);
    const subtotalCents = unitPriceCents * quantity;
    const taxCents = Math.round(subtotalCents * 0.1); // 10% tax
    const shippingCents = 0; // Free shipping
    const discountCents = 0;
    const totalCents = subtotalCents + taxCents + shippingCents - discountCents;
    const currency = product.currency;
    const orderNumber = createOrderNumber();

    // Create order
    const order = await tx.order.create({
      data: {
        userId,
        orderNumber,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        fullName: input.fullName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        subtotal: fromCents(subtotalCents),
        taxAmount: fromCents(taxCents),
        shippingAmount: fromCents(shippingCents),
        discountAmount: fromCents(discountCents),
        totalAmount: fromCents(totalCents),
        currency,
        shippingName: input.fullName,
        shippingAddress: input.addressLine2
          ? `${input.addressLine1}, ${input.addressLine2}`
          : input.addressLine1,
        shippingCity: input.city,
        shippingState: input.state,
        shippingZip: input.postalCode,
        shippingCountry: input.country,
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              quantity: quantity,
              unitPrice: product.price,
              totalPrice: fromCents(subtotalCents + taxCents),
            },
          ],
        },
      },
      select: {
        id: true,
        orderNumber: true,
      },
    });

    // Update product stock
    const updatedProduct = await tx.product.updateMany({
      where: {
        id: product.id,
        stockQuantity: {
          gte: quantity,
        },
      },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
        purchaseCount: {
          increment: quantity,
        },
      },
    });

    if (updatedProduct.count !== 1) {
      throw new HttpError(
        httpStatus.badRequest,
        `${product.name} does not have enough stock.`,
      );
    }

    // Record product interaction
    await recordProductInteraction(
      userId,
      {
        productId: product.id,
        type: ProductInteractionType.PURCHASE,
        quantity: quantity,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          unitPrice: product.price.toString(),
          totalPrice: fromCents(totalCents),
        },
      },
      tx,
    );

    return order.id;
  });

  // Fetch and return the complete order
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: orderInclude,
  });

  return mapOrder(order);
};
