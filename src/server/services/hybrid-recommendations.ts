import { prisma } from "@/src/server/db/prisma"
import { mapPrismaProduct } from "@/src/server/services/data-source"
import type { CatalogProduct } from "@/src/shared/catalog-types"

type RecommendationSource = "content" | "collaborative" | "hybrid" | "popular"

export type HybridRecommendation = CatalogProduct & {
  score: number
  source: RecommendationSource
  reason: string
}

type ProductCandidate = {
  product: CatalogProduct
  score: number
  source: RecommendationSource
  reason: string
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num))
}

function toCandidate(
  product: CatalogProduct,
  score: number,
  source: RecommendationSource,
  reason: string,
): ProductCandidate {
  return {
    product,
    score,
    source,
    reason,
  }
}

function mergeCandidates(candidates: ProductCandidate[], limit: number) {
  const merged = new Map<string, ProductCandidate>()

  for (const candidate of candidates) {
    const existing = merged.get(candidate.product.id)
    if (!existing || candidate.score > existing.score) {
      merged.set(candidate.product.id, candidate)
      continue
    }

    existing.score += candidate.score * 0.2
    if (existing.source !== candidate.source) {
      existing.source = "hybrid"
      existing.reason = `${existing.reason} + ${candidate.reason}`
    }
  }

  return [...merged.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((candidate) => ({
      ...candidate.product,
      score: Number(candidate.score.toFixed(2)),
      source: candidate.source,
      reason: candidate.reason,
    }))
}

async function getProductMap(productIds: string[]) {
  if (productIds.length === 0) return new Map<string, CatalogProduct>()

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true },
  })

  return new Map(products.map((product) => [product.id, mapPrismaProduct(product)]))
}

async function getPurchasedProductIds(userId: string): Promise<string[]> {
  const purchases = await prisma.orderItem.findMany({
    where: { order: { userId } },
    select: { productId: true },
  })

  return [...new Set(purchases.map((item) => item.productId))]
}

async function getViewedProductIds(userId: string): Promise<string[]> {
  const history = await prisma.viewHistory.findMany({
    where: { userId },
    orderBy: { viewedAt: "desc" },
    select: { productId: true },
    take: 12,
  })

  return [...new Set(history.map((item) => item.productId))]
}

export async function trackProductView(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    throw new Error("Product not found.")
  }

  await prisma.$transaction([
    prisma.viewHistory.create({
      data: {
        userId,
        productId,
      },
    }),
    prisma.userActivity.create({
      data: {
        userId,
        type: "PRODUCT_VIEW",
        metadata: { productId },
      },
    }),
  ])

  return { ok: true }
}

export async function getSimilarProducts(productId: string, limit = 4): Promise<HybridRecommendation[]> {
  const baseProduct = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  })

  if (!baseProduct) {
    throw new Error("Product not found.")
  }

  const lowerBound = Math.max(0, baseProduct.price * 0.7)
  const upperBound = baseProduct.price * 1.3

  const candidates = await prisma.product.findMany({
    where: {
      id: { not: productId },
      OR: [
        { categoryId: baseProduct.categoryId },
        {
          price: {
            gte: lowerBound,
            lte: upperBound,
          },
        },
      ],
    },
    include: { category: true },
    take: Math.max(limit * 3, 12),
  })

  return candidates
    .map((product) => {
      const mapped = mapPrismaProduct(product)
      const categoryScore = product.categoryId === baseProduct.categoryId ? 70 : 0
      const priceGap = Math.abs(product.price - baseProduct.price)
      const normalizedPriceScore = 30 - clamp((priceGap / Math.max(baseProduct.price, 1)) * 30, 0, 30)
      const score = categoryScore + normalizedPriceScore
      const reason =
        product.categoryId === baseProduct.categoryId
          ? `Same category as ${baseProduct.name} with a similar price band`
          : `Close to ${baseProduct.name} in price, so it fits the same budget`

      return {
        ...mapped,
        score: Number(score.toFixed(2)),
        source: "content" as const,
        reason,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export async function getContentBasedRecommendations(
  userId: string,
  limit = 6,
): Promise<HybridRecommendation[]> {
  const [viewedIds, purchasedIds] = await Promise.all([
    getViewedProductIds(userId),
    getPurchasedProductIds(userId),
  ])

  const seedIds = [...new Set<string>([...viewedIds.slice(0, 4), ...purchasedIds.slice(0, 4)])]
  if (seedIds.length === 0) {
    return []
  }

  const seedProducts = await prisma.product.findMany({
    where: { id: { in: seedIds } },
    include: { category: true },
  })

  const excludedIds = new Set<string>([...seedIds, ...purchasedIds])
  const candidates: ProductCandidate[] = []

  for (const seed of seedProducts) {
    const similarProducts = await prisma.product.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
        OR: [
          { categoryId: seed.categoryId },
          {
            price: {
              gte: Math.max(0, seed.price * 0.75),
              lte: seed.price * 1.25,
            },
          },
        ],
      },
      include: { category: true },
      take: Math.max(limit, 8),
    })

    for (const product of similarProducts) {
      const mapped = mapPrismaProduct(product)
      const categoryScore = product.categoryId === seed.categoryId ? 65 : 0
      const priceGap = Math.abs(product.price - seed.price)
      const priceScore = 35 - clamp((priceGap / Math.max(seed.price, 1)) * 35, 0, 35)
      candidates.push(
        toCandidate(
          mapped,
          categoryScore + priceScore,
          "content",
          `Similar to products the user viewed or purchased in ${seed.category.name}`,
        ),
      )
    }
  }

  return mergeCandidates(candidates, limit)
}

export async function getCollaborativeRecommendations(
  userId: string,
  limit = 6,
): Promise<HybridRecommendation[]> {
  const purchasedIds = await getPurchasedProductIds(userId)
  if (purchasedIds.length === 0) {
    return []
  }

  const peerOrders = await prisma.orderItem.findMany({
    where: {
      productId: { in: purchasedIds },
      order: { userId: { not: userId } },
    },
    select: {
      productId: true,
      order: {
        select: {
          userId: true,
        },
      },
    },
  })

  const peerScores = new Map<string, number>()
  for (const peerOrder of peerOrders) {
    const peerId = peerOrder.order.userId
    if (!peerId) continue
    peerScores.set(peerId, (peerScores.get(peerId) ?? 0) + 1)
  }

  const peerIds = [...peerScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([peerId]) => peerId)

  if (peerIds.length === 0) {
    return []
  }

  const peerPurchases = await prisma.orderItem.findMany({
    where: {
      order: { userId: { in: peerIds } },
      productId: { notIn: purchasedIds },
    },
    select: { productId: true, order: { select: { userId: true } } },
  })

  const productScores = new Map<string, number>()
  for (const purchase of peerPurchases) {
    const peerId = purchase.order.userId
    if (!peerId) continue
    productScores.set(
      purchase.productId,
      (productScores.get(purchase.productId) ?? 0) + (peerScores.get(peerId) ?? 0),
    )
  }

  const rankedProductIds = [...productScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit * 3)
    .map(([productId]) => productId)

  const productMap = await getProductMap(rankedProductIds)

  const results: HybridRecommendation[] = []
  for (const productId of rankedProductIds) {
    const product = productMap.get(productId)
    if (!product) continue

    results.push({
      ...product,
      score: Number(((productScores.get(productId) ?? 0) * 25).toFixed(2)),
      source: "collaborative",
      reason: "Users with similar purchase history also bought this product",
    })
  }

  return results.slice(0, limit)
}

async function getPopularProducts(excludeIds: string[], limit: number): Promise<HybridRecommendation[]> {
  const products = await prisma.product.findMany({
    where: { id: { notIn: excludeIds } },
    include: { category: true },
    orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }, { createdAt: "desc" }],
    take: limit,
  })

  return products.map((product) => ({
    ...mapPrismaProduct(product),
    score: 40,
    source: "popular" as const,
    reason: "Popular fallback recommendation based on rating and demand",
  }))
}

async function persistRecommendations(userId: string, recommendations: HybridRecommendation[]) {
  await prisma.recommendation.deleteMany({ where: { userId } })

  if (recommendations.length === 0) {
    return
  }

  await prisma.recommendation.createMany({
    data: recommendations.map((item) => ({
      userId,
      productId: item.id,
      score: item.score,
      reason: item.reason,
    })),
  })
}

export async function getHybridRecommendations(
  userId: string,
  limit = 6,
): Promise<HybridRecommendation[]> {
  const [contentBased, collaborative, purchasedIds, viewedIds] = await Promise.all([
    getContentBasedRecommendations(userId, limit),
    getCollaborativeRecommendations(userId, limit),
    getPurchasedProductIds(userId),
    getViewedProductIds(userId),
  ])

  const excludeIds = [...new Set<string>([...purchasedIds, ...viewedIds])]
  const popularFallback = await getPopularProducts(excludeIds, limit)

  const ranked = mergeCandidates(
    [
      ...contentBased.map((item) =>
        toCandidate(item, item.score * 0.55, item.source, item.reason),
      ),
      ...collaborative.map((item) =>
        toCandidate(item, item.score * 0.45, item.source, item.reason),
      ),
      ...popularFallback.map((item) =>
        toCandidate(item, item.score * 0.2, item.source, item.reason),
      ),
    ],
    limit,
  )

  await persistRecommendations(userId, ranked)
  return ranked
}

export async function getRecommendationInsights(userId: string) {
  const [views, purchases, categories] = await Promise.all([
    prisma.viewHistory.count({ where: { userId } }),
    prisma.orderItem.count({ where: { order: { userId } } }),
    prisma.viewHistory.findMany({
      where: { userId },
      select: { product: { select: { category: { select: { name: true } } } } },
      take: 30,
      orderBy: { viewedAt: "desc" },
    }),
  ])

  const categoryScores = new Map<string, number>()
  for (const item of categories) {
    const name = item.product.category.name
    categoryScores.set(name, (categoryScores.get(name) ?? 0) + 1)
  }

  const topCategory = [...categoryScores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Cold Start"

  return {
    views,
    purchases,
    topCategory,
  }
}
