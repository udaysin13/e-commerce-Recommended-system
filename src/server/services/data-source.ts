import type { Prisma } from "@prisma/client"
import type { CatalogProduct } from "@/src/shared/catalog-types"
import { DEFAULT_PRODUCT_IMAGE } from "@/src/shared/product-images"
import { prisma } from "@/src/server/db/prisma"
import type { ProductInput } from "@/src/server/services/products-store"

export type ProductQueryParams = {
  q: string
  category: string
  sort: string
  page?: number
  limit?: number
  minPrice?: number
  maxPrice?: number
}

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true }
}>

function toProductSlug(input: Pick<ProductInput, "name" | "slug">) {
  return (input.slug ?? input.name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
}

async function ensureProductSlugAvailable(input: Pick<ProductInput, "name" | "slug">, excludeId?: string) {
  const slug = toProductSlug(input)

  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { id: true, name: true },
  })

  if (existing && existing.id !== excludeId) {
    throw new Error(`A product named "${existing.name}" already exists. Please use a different product name.`)
  }

  return slug
}

export function mapPrismaProduct(product: ProductWithCategory): CatalogProduct {
  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    kind: product.kind,
    imageUrl: product.imageUrl,
    images: product.images.length > 0 ? product.images : [product.imageUrl],
    price: Number(product.price),
    category: product.category.name,
    description: product.description ?? undefined,
    inStock: product.inStock ?? undefined,
    ratingAvg: product.ratingAvg ?? undefined,
    ratingCount: product.ratingCount ?? undefined,
  }
}

export async function queryProducts(params: ProductQueryParams) {
  const { q, category, sort, page = 1, limit = 8, minPrice, maxPrice } = params
  const andFilters: Prisma.ProductWhereInput[] = []

  if (category && category !== "All") {
    andFilters.push({ category: { name: category } })
  }

  if (q.trim()) {
    const search = q.trim()
    andFilters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { kind: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ],
    })
  }

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    andFilters.push({
      price: {
        gte: typeof minPrice === "number" ? minPrice : undefined,
        lte: typeof maxPrice === "number" ? maxPrice : undefined,
      },
    })
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ createdAt: "desc" }]
  if (sort === "Price low-high") orderBy = [{ price: "asc" }]
  if (sort === "Price high-low") orderBy = [{ price: "desc" }]
  if (sort === "Category") orderBy = [{ category: { name: "asc" } }, { name: "asc" }]

  const where = andFilters.length > 0 ? { AND: andFilters } : undefined
  const skip = (page - 1) * limit

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { category: true },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    }),
  ])

  return {
    items: products.map(mapPrismaProduct),
    total,
    categories: categories.map((categoryItem) => categoryItem.name),
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  })

  return product ? mapPrismaProduct(product) : null
}

export async function createProduct(input: ProductInput) {
  const productSlug = await ensureProductSlugAvailable(input)
  const categorySlug = input.category.toLowerCase().replace(/\s+/g, "-")
  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    update: { name: input.category },
    create: { name: input.category, slug: categorySlug },
  })

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: productSlug,
      kind: input.kind,
      imageUrl: input.imageUrl || DEFAULT_PRODUCT_IMAGE,
      images: input.images && input.images.length > 0 ? input.images : [input.imageUrl || DEFAULT_PRODUCT_IMAGE],
      price: input.price,
      inStock: input.inStock ?? 0,
      description: input.description ?? null,
      category: { connect: { id: category.id } },
    },
    include: { category: true },
  })

  return mapPrismaProduct(product)
}

export async function updateProduct(id: string, input: ProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) return null

  const productSlug = await ensureProductSlugAvailable(input, id)
  const categorySlug = input.category.toLowerCase().replace(/\s+/g, "-")
  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    update: { name: input.category },
    create: { name: input.category, slug: categorySlug },
  })

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      slug: productSlug,
      kind: input.kind,
      imageUrl: input.imageUrl || DEFAULT_PRODUCT_IMAGE,
      images: input.images && input.images.length > 0 ? input.images : [input.imageUrl || DEFAULT_PRODUCT_IMAGE],
      price: input.price,
      inStock: input.inStock ?? 0,
      description: input.description ?? null,
      category: { connect: { id: category.id } },
    },
    include: { category: true },
  })

  return mapPrismaProduct(updated)
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } })
  return true
}

export async function syncProductImagesBySlug(
  updates: Array<{ slug: string; imageUrl: string }>
) {
  if (updates.length === 0) {
    return { updated: [] as CatalogProduct[], unmatchedSlugs: [] as string[] }
  }

  const uniqueUpdates = Array.from(
    new Map(updates.map((update) => [update.slug, update])).values()
  )

  const products = await prisma.product.findMany({
    where: { slug: { in: uniqueUpdates.map((update) => update.slug) } },
    include: { category: true },
  })

  const productsBySlug = new Map(products.map((product) => [product.slug, product]))
  const updated: CatalogProduct[] = []
  const unmatchedSlugs: string[] = []

  for (const update of uniqueUpdates) {
    const product = productsBySlug.get(update.slug)
    if (!product) {
      unmatchedSlugs.push(update.slug)
      continue
    }

    const nextImages = Array.from(
      new Set([update.imageUrl, ...product.images.filter((image) => image !== DEFAULT_PRODUCT_IMAGE)])
    )

    const result = await prisma.product.update({
      where: { id: product.id },
      data: {
        imageUrl: update.imageUrl,
        images: nextImages,
      },
      include: { category: true },
    })

    updated.push(mapPrismaProduct(result))
  }

  return { updated, unmatchedSlugs }
}
