import bcrypt from "bcryptjs";
import { CartStatus, OrderStatus, PaymentStatus, UserRole } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";

const PASSWORD_SALT_ROUNDS = 12;

export const createUserExample = async () => {
  const passwordHash = await bcrypt.hash("Password123!", PASSWORD_SALT_ROUNDS);

  return prisma.user.create({
    data: {
      email: "new.user@example.com",
      firstName: "New",
      lastName: "User",
      passwordHash,
      role: UserRole.CUSTOMER,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });
};

export const fetchProductsExample = async () => {
  return prisma.product.findMany({
    where: {
      isActive: true,
      stockQuantity: {
        gt: 0,
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 10,
  });
};

export const createOrderExample = async (userId: string, productId: string) => {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        currency: true,
        stockQuantity: true,
      },
    });

    if (!product || product.stockQuantity < 1) {
      throw new Error("Product is unavailable.");
    }

    const existingCart = await tx.cart.findFirst({
      where: {
        userId,
        status: CartStatus.ACTIVE,
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });

    const activeCart =
      existingCart ??
      (await tx.cart.create({
        data: {
          userId,
          status: CartStatus.ACTIVE,
        },
        select: { id: true },
      }));

    await tx.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: activeCart.id,
          productId: product.id,
        },
      },
      update: {
        quantity: 1,
        unitPrice: product.price,
      },
      create: {
        cartId: activeCart.id,
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
      },
    });

    const order = await tx.order.create({
      data: {
        userId,
        orderNumber: `ORD-${Date.now()}`,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal: product.price,
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
        totalAmount: product.price,
        currency: product.currency,
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              quantity: 1,
              unitPrice: product.price,
              totalPrice: product.price,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    await tx.product.update({
      where: { id: product.id },
      data: {
        stockQuantity: {
          decrement: 1,
        },
        purchaseCount: {
          increment: 1,
        },
      },
    });

    return order;
  });
};
