export type CatalogProduct = {
  id: string
  category: string
  kind: string
  name: string
  image: string
  price: number
  slug?: string
  description?: string
  inStock?: number
  ratingAvg?: number
  ratingCount?: number
}
