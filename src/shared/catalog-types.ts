export type CatalogProduct = {
  id: string
  category: string
  kind: string
  name: string
  imageUrl: string
  images: string[]
  price: number
  slug?: string
  description?: string
  inStock?: number
  ratingAvg?: number
  ratingCount?: number
}
