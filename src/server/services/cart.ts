import { prisma } from "@/src/server/db/prisma"

export type CartProduct = {
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    kind: string
    image: string
    price: number
    inStock: number
    category: { name: string }
  }
}

export async function getCartItems(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { category: true } } },
      },
    },
  })

  if (!cart) return []

  return cart.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: item.product,
  }))
}

export async function addOrUpdateCartItem(userId: string, productId: string, quantity: number) {
  if (quantity <= 0) {
    return removeCartItem(userId, productId)
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })
  if (!product) {
    throw new Error("Product not found.")
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { user: { connect: { id: userId } } },
  })

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity },
    create: { cartId: cart.id, productId, quantity },
  })

  return await getCartItems(userId)
}

export async function removeCartItem(userId: string, productId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) return []
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } })
  return getCartItems(userId)
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } })
  if (!cart) return []
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  return []
}

export async function setCartItems(
  userId: string,
  items: Array<{ productId: string; quantity: number }>
) {
  const uniqueProductIds = Array.from(new Set(items.map((item) => item.productId)))
  const availableProducts = await prisma.product.findMany({
    where: { id: { in: uniqueProductIds } },
    select: { id: true },
  })
  const availableProductIds = new Set(availableProducts.map((product) => product.id))

  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { user: { connect: { id: userId } } },
  })

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  const validItems = items.filter((item) => item.quantity > 0)
  if (validItems.some((item) => !availableProductIds.has(item.productId))) {
    throw new Error("One or more products could not be found.")
  }

  if (validItems.length > 0) {
    await prisma.cartItem.createMany({
      data: validItems.map((item) => ({
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
      skipDuplicates: true,
    })
  }

  return getCartItems(userId)
}

export async function mergeCartItems(
  userId: string,
  items: Array<{ productId: string; quantity: number }>
) {
  const existing = await getCartItems(userId)

  const merged = new Map<string, number>()
  for (const item of existing) {
    merged.set(item.productId, item.quantity)
  }

  for (const item of items) {
    const current = merged.get(item.productId) ?? 0
    merged.set(item.productId, current + item.quantity)
  }

  const mergedItems = Array.from(merged.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }))

  return setCartItems(userId, mergedItems)
}
