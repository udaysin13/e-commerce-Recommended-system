import type { ProductInteractionType } from "../generated/prisma/enums.js";

export type TrackEventInput = {
  productId: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
};

export type TrackInteractionInput = TrackEventInput & {
  type: ProductInteractionType;
  quantity?: number;
};

export type ProductInteractionResponse = {
  id: string;
  userId: string | null;
  productId: string;
  type: ProductInteractionType;
  weight: number;
  quantity: number | null;
  sessionId: string | null;
  metadata: unknown;
  createdAt: Date;
};
