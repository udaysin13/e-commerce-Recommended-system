import { prisma } from "@/src/server/db/prisma"
import type { CheckoutOrderInput } from "@/src/shared/checkout"

export type BuyNowOrderRecord = {
  id: string
  userId: string
  productId: string
  name: string
  address: string
  city: string
  pincode: string
  paymentMethod: "COD" | "ONLINE"
  status: string
  createdAt: string
}

export async function createBuyNowOrder(
  userId: string,
  input: CheckoutOrderInput
): Promise<BuyNowOrderRecord> {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true, price: true },
  })

  if (!product) {
    throw new Error("Product not found.")
  }

  const order = await prisma.order.create({
    data: {
      userId,
      productId: product.id,
      name: input.name,
      address: input.address,
      city: input.city,
      pincode: input.pincode,
      paymentMethod: input.paymentMethod,
      total: product.price,
      status: "PENDING",
      paymentStatus: "PENDING",
      shippingAddress: {
        name: input.name,
        address: input.address,
        city: input.city,
        pincode: input.pincode,
      },
    },
    select: {
      id: true,
      userId: true,
      productId: true,
      name: true,
      address: true,
      city: true,
      pincode: true,
      paymentMethod: true,
      status: true,
      createdAt: true,
    },
  })

  return {
    id: order.id,
    userId: order.userId ?? userId,
    productId: order.productId ?? product.id,
    name: order.name ?? input.name,
    address: order.address ?? input.address,
    city: order.city ?? input.city,
    pincode: order.pincode ?? input.pincode,
    paymentMethod: order.paymentMethod ?? input.paymentMethod,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  }
}
