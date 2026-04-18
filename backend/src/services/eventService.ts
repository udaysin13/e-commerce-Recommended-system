import { ProductInteractionType } from "../generated/prisma/enums.js";
import type { Prisma, ProductInteraction } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type {
  ProductInteractionResponse,
  TrackEventInput,
  TrackInteractionInput,
} from "../types/event.js";
import { HttpError } from "../utils/httpError.js";
import { httpStatus } from "../utils/httpStatus.js";

export const interactionWeights: Record<ProductInteractionType, number> = {
  [ProductInteractionType.VIEW]: 1,
  [ProductInteractionType.CLICK]: 2,
  [ProductInteractionType.CART_ADD]: 4,
  [ProductInteractionType.PURCHASE]: 8,
};

const mapInteraction = (
  interaction: ProductInteraction,
): ProductInteractionResponse => {
  return {
    id: interaction.id,
    userId: interaction.userId,
    productId: interaction.productId,
    type: interaction.type,
    weight: interaction.weight,
    quantity: interaction.quantity,
    sessionId: interaction.sessionId,
    metadata: interaction.metadata,
    createdAt: interaction.createdAt,
  };
};

const assertProductExists = async (
  productId: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) => {
  const product = await tx.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    throw new HttpError(httpStatus.notFound, "Product not found.");
  }
};

export const recordProductInteraction = async (
  userId: string | null,
  input: TrackInteractionInput,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<ProductInteractionResponse> => {
  await assertProductExists(input.productId, tx);

  const interaction = await tx.productInteraction.create({
    data: {
      userId,
      productId: input.productId,
      type: input.type,
      weight: interactionWeights[input.type],
      quantity: input.quantity,
      sessionId: input.sessionId,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  return mapInteraction(interaction);
};

export const trackProductView = async (
  userId: string | null,
  input: TrackEventInput,
): Promise<ProductInteractionResponse> => {
  return prisma.$transaction(async (tx) => {
    await assertProductExists(input.productId, tx);

    await tx.productView.create({
      data: {
        userId,
        productId: input.productId,
        sessionId: input.sessionId,
        referrer:
          typeof input.metadata?.referrer === "string"
            ? input.metadata.referrer
            : undefined,
      },
    });

    await tx.product.update({
      where: { id: input.productId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: { id: true },
    });

    return recordProductInteraction(
      userId,
      {
        ...input,
        type: ProductInteractionType.VIEW,
      },
      tx,
    );
  });
};

export const trackProductClick = async (
  userId: string | null,
  input: TrackEventInput,
): Promise<ProductInteractionResponse> => {
  return prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: input.productId },
      data: {
        clickCount: {
          increment: 1,
        },
      },
      select: { id: true },
    });

    return recordProductInteraction(userId, {
      ...input,
      type: ProductInteractionType.CLICK,
    }, tx);
  });
};
