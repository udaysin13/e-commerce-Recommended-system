import { prisma } from "@/src/server/db/prisma"

export async function getWishlistItems(userId: string) {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: { category: true } } } } },
  })

  if (!wishlist) return []

  return wishlist.items.map((item) => ({
    productId: item.productId,
    product: item.product,
  }))
}

export async function toggleWishlistItem(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })
  if (!product) {
    throw new Error("Product not found.")
  }

  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { user: { connect: { id: userId } } },
  })

  const existing = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  })

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    })
  } else {
    await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    })
  }

  return getWishlistItems(userId)
}

export async function setWishlistItems(userId: string, productIds: string[]) {
  const uniqueProductIds = Array.from(new Set(productIds))
  const availableProducts = await prisma.product.findMany({
    where: { id: { in: uniqueProductIds } },
    select: { id: true },
  })
  const availableProductIds = new Set(availableProducts.map((product) => product.id))

  if (uniqueProductIds.some((productId) => !availableProductIds.has(productId))) {
    throw new Error("One or more products could not be found.")
  }

  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { user: { connect: { id: userId } } },
  })

  await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } })

  const items = Array.from(new Set(productIds))
    .filter(Boolean)
    .map((productId) => ({ wishlistId: wishlist.id, productId }))

  if (items.length > 0) {
    await prisma.wishlistItem.createMany({ data: items, skipDuplicates: true })
  }

  return getWishlistItems(userId)
}
