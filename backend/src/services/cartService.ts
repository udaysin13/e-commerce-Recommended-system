import { CartStatus, ProductInteractionType } from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { recordProductInteraction } from "./eventService.js";
import type { AddCartItemInput, CartResponse, UpdateCartItemInput } from "../types/cart.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

const cartInclude = {
  items: {
    orderBy: {
      createdAt: "asc",
    },
    include: {
      product: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  },
} as const;

type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartInclude;
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

const mapCart = (cart: CartWithItems): CartResponse => {
  const items = cart.items.map((item) => {
    const unitPrice = toNumber(item.unitPrice);
    const lineTotal = fromCents(toCents(item.unitPrice) * item.quantity);

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        brand: item.product.brand,
        price: toNumber(item.product.price),
        currency: item.product.currency,
        imageUrl: item.product.imageUrl,
        stockQuantity: item.product.stockQuantity,
        category: item.product.category,
      },
    };
  });

  const subtotal = fromCents(
    cart.items.reduce((total, item) => total + toCents(item.unitPrice) * item.quantity, 0),
  );

  return {
    id: cart.id,
    status: cart.status,
    items,
    itemCount: cart.items.reduce((total, item) => total + item.quantity, 0),
    subtotal,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

const getOrCreateActiveCart = async (
  tx: Prisma.TransactionClient,
  userId: string,
) => {
  const existingCart = await tx.cart.findFirst({
    where: {
      userId,
      status: CartStatus.ACTIVE,
    },
    select: {
      id: true,
    },
  });

  if (existingCart) {
    return existingCart;
  }

  return tx.cart.create({
    data: {
      userId,
      status: CartStatus.ACTIVE,
    },
    select: {
      id: true,
    },
  });
};

export const getCart = async (userId: string): Promise<CartResponse> => {
  const cart = await prisma.cart.findFirst({
    where: {
      userId,
      status: CartStatus.ACTIVE,
    },
    include: cartInclude,
  });

  if (cart) {
    return mapCart(cart);
  }

  const newCart = await prisma.cart.create({
    data: {
      userId,
      status: CartStatus.ACTIVE,
    },
    include: cartInclude,
  });

  return mapCart(newCart);
};

export const addCartItem = async (
  userId: string,
  input: AddCartItemInput,
): Promise<CartResponse> => {
  const cartId = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: {
        id: input.productId,
        isActive: true,
      },
      select: {
        id: true,
        price: true,
        stockQuantity: true,
      },
    });

    if (!product) {
      throw new HttpError(httpStatus.notFound, "Product not found.");
    }

    const cart = await getOrCreateActiveCart(tx, userId);

    const existingItem = await tx.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
      select: {
        quantity: true,
      },
    });

    const nextQuantity = (existingItem?.quantity ?? 0) + input.quantity;

    if (nextQuantity > product.stockQuantity) {
      throw new HttpError(httpStatus.badRequest, "Requested quantity exceeds available stock.");
    }

    await tx.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
      update: {
        quantity: nextQuantity,
        unitPrice: product.price,
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity: input.quantity,
        unitPrice: product.price,
      },
    });

    await tx.product.update({
      where: { id: product.id },
      data: {
        cartCount: {
          increment: input.quantity,
        },
      },
      select: { id: true },
    });

    await recordProductInteraction(
      userId,
      {
        productId: product.id,
        type: ProductInteractionType.CART_ADD,
        quantity: input.quantity,
        metadata: {
          cartId: cart.id,
          resultingQuantity: nextQuantity,
        },
      },
      tx,
    );

    return cart.id;
  });

  const cart = await prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: cartInclude,
  });

  return mapCart(cart);
};

export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  input: UpdateCartItemInput,
): Promise<CartResponse> => {
  const cartId = await prisma.$transaction(async (tx) => {
    const item = await tx.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId,
          status: CartStatus.ACTIVE,
        },
      },
      include: {
        product: {
          select: {
            stockQuantity: true,
          },
        },
      },
    });

    if (!item) {
      throw new HttpError(httpStatus.notFound, "Cart item not found.");
    }

    if (input.quantity > item.product.stockQuantity) {
      throw new HttpError(httpStatus.badRequest, "Requested quantity exceeds available stock.");
    }

    await tx.cartItem.update({
      where: { id: item.id },
      data: { quantity: input.quantity },
    });

    return item.cartId;
  });

  const cart = await prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: cartInclude,
  });

  return mapCart(cart);
};

export const removeCartItem = async (
  userId: string,
  cartItemId: string,
): Promise<CartResponse> => {
  const cartId = await prisma.$transaction(async (tx) => {
    const item = await tx.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId,
          status: CartStatus.ACTIVE,
        },
      },
      select: {
        id: true,
        cartId: true,
      },
    });

    if (!item) {
      throw new HttpError(httpStatus.notFound, "Cart item not found.");
    }

    await tx.cartItem.delete({
      where: { id: item.id },
    });

    return item.cartId;
  });

  const cart = await prisma.cart.findUniqueOrThrow({
    where: { id: cartId },
    include: cartInclude,
  });

  return mapCart(cart);
};
