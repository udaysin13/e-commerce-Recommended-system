import { promises as fs } from "fs"
import path from "path"
import type { CatalogProduct } from "@/src/shared/catalog-types"

export type ProductInput = {
  category: string
  kind: string
  name: string
  imageUrl: string
  images?: string[]
  price: number
  slug?: string
  description?: string
  inStock?: number
}

const productsFilePath = path.join(process.cwd(), "data", "products.json")

const normalizeInput = (input: ProductInput): ProductInput => ({
  category: input.category.trim(),
  kind: input.kind.trim(),
  name: input.name.trim(),
  imageUrl: input.imageUrl.trim(),
  images: Array.from(new Set((input.images ?? []).map((image) => image.trim()).filter(Boolean))),
  price: Number(input.price),
})

export const readProducts = async (): Promise<CatalogProduct[]> => {
  const raw = await fs.readFile(productsFilePath, "utf8")
  const parsed = JSON.parse(raw) as Array<Partial<CatalogProduct>>
  return parsed.map((item) => ({
    ...item,
    id: String(item.id),
    imageUrl: String(item.imageUrl ?? ""),
    images: Array.isArray(item.images) ? item.images.map((image) => String(image)) : [],
  })) as CatalogProduct[]
}

export const writeProducts = async (items: CatalogProduct[]) => {
  await fs.writeFile(productsFilePath, `${JSON.stringify(items, null, 2)}\n`, "utf8")
}

export const queryProducts = ({
  items,
  q,
  category,
  sort,
}: {
  items: CatalogProduct[]
  q: string
  category: string
  sort: string
}) => {
  const query = q.trim().toLowerCase()
  const filtered = items.filter((item) => {
    const categoryMatch = category === "All" || item.category === category
    const queryMatch =
      query.length === 0 ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.kind.toLowerCase().includes(query)
    return categoryMatch && queryMatch
  })

  return [...filtered].sort((a, b) => {
    if (sort === "Price low-high") return a.price - b.price
    if (sort === "Price high-low") return b.price - a.price
    if (sort === "Category") return a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    return b.id.localeCompare(a.id)
  })
}

export const createProduct = (items: CatalogProduct[], input: ProductInput): CatalogProduct => {
  const normalized = normalizeInput(input)
  return { id: crypto.randomUUID(), ...normalized, images: normalized.images ?? [] }
}

