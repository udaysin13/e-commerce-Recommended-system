import type { Prisma } from "@prisma/client"
import type { CatalogProduct } from "@/src/shared/catalog-types"
import { prisma } from "@/src/server/db/prisma"
import type { ProductInput } from "@/src/server/services/products-store"

export type ProductQueryParams = {
  q: string
  category: string
  sort: string
}

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true }
}>

function mapPrismaProduct(product: ProductWithCategory): CatalogProduct {
  return {
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    kind: product.kind,
    image: product.image,
    price: Number(product.price),
    category: product.category.name,
    description: product.description ?? undefined,
    inStock: product.inStock ?? undefined,
    ratingAvg: product.ratingAvg ?? undefined,
    ratingCount: product.ratingCount ?? undefined,
  }
}

export async function queryProducts(params: ProductQueryParams) {
  const { q, category, sort } = params
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

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ createdAt: "desc" }]
  if (sort === "Price low-high") orderBy = [{ price: "asc" }]
  if (sort === "Price high-low") orderBy = [{ price: "desc" }]
  if (sort === "Category") orderBy = [{ category: { name: "asc" } }, { name: "asc" }]

  const products = await prisma.product.findMany({
    where: andFilters.length > 0 ? { AND: andFilters } : undefined,
    orderBy,
    include: { category: true },
    take: 100,
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  })

  return {
    items: products.map(mapPrismaProduct),
    total: products.length,
    categories: categories.map((categoryItem) => categoryItem.name),
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
  const categorySlug = input.category.toLowerCase().replace(/\s+/g, "-")
  const category = await prisma.category.upsert({
    where: { slug: categorySlug },
    update: { name: input.category },
    create: { name: input.category, slug: categorySlug },
  })

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug ?? input.name.toLowerCase().replace(/\s+/g, "-"),
      kind: input.kind,
      image: input.image,
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
      slug: input.slug ?? input.name.toLowerCase().replace(/\s+/g, "-"),
      kind: input.kind,
      image: input.image,
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
