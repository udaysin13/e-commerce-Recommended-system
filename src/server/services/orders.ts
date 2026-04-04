import type { Prisma } from "@prisma/client"
import { prisma } from "@/src/server/db/prisma"

export type OrderLineItem = {
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    slug: string
    kind: string
    imageUrl: string
    images: string[]
    price: number
    inStock: number
    category: { name: string }
  }
}

export type OrderRecord = {
  id: string
  status: string
  total: number
  paymentStatus: string
  createdAt: string
  shippingAddress?: Record<string, unknown>
  items: OrderLineItem[]
}

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    }
  }
}>

function toShippingAddress(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }

  return value as Record<string, unknown>
}

export async function getOrders(userId: string): Promise<OrderRecord[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { product: { include: { category: true } } } },
    },
  })

  return orders.map(mapOrder)
}

export async function getOrderById(userId: string, orderId: string): Promise<OrderRecord | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: { include: { product: { include: { category: true } } } },
    },
  })

  if (!order) return null
  return mapOrder(order)
}

function mapOrder(order: OrderWithItems): OrderRecord {
  return {
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    shippingAddress: toShippingAddress(order.shippingAddress),
    items: order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      product: item.product,
    })),
  }
}

export async function createOrder(
  userId: string,
  items: Array<{ productId: string; quantity: number }>,
  shippingAddress?: Prisma.InputJsonValue
) {
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  })

  const productsById = new Map(products.map((p) => [p.id, p]))

  const lineItems = items
    .map((item) => {
      const product = productsById.get(item.productId)
      if (!product) return null
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      }
    })
    .filter(Boolean) as Array<{ productId: string; quantity: number; price: number }>

  if (lineItems.length !== items.length) {
    throw new Error("One or more requested products could not be found.")
  }

  const total = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const order = await prisma.order.create({
    data: {
      user: { connect: { id: userId } },
      total,
      shippingAddress: shippingAddress ?? undefined,
      items: {
        create: lineItems.map((item) => ({
          product: { connect: { id: item.productId } },
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
    include: {
      items: { include: { product: { include: { category: true } } } },
    },
  })

  return mapOrder(order)
}
