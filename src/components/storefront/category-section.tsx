"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { CatalogProduct } from "@/src/shared/catalog-types"
import { slugify } from "@/src/shared/utils"
import { ProductCard, ProductCardSkeleton } from "@/src/components/storefront/product-card"

type CategorySectionProps = {
  title: string
  subtitle: string
  products: CatalogProduct[]
  isLoading?: boolean
  emptyText?: string
  wishlistedIds: string[]
  onAddToCart: (product: CatalogProduct) => void
  onToggleWishlist: (productId: string) => void
  onViewProduct?: (productId: string) => void
}

export function CategorySection({
  title,
  subtitle,
  products,
  isLoading = false,
  emptyText = "No products found in this category.",
  wishlistedIds,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
}: CategorySectionProps) {
  return (
    <section id={slugify(title)} className="section-shell scroll-mt-28">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{title}</p>
          <h2 className="section-title">{title}</h2>
          <p className="section-copy">{subtitle}</p>
        </div>

        <Link
          href={`/products?category=${encodeURIComponent(title)}`}
          className="market-button-secondary w-fit px-4 py-2 text-xs"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={`${title}-skeleton-${index}`} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="surface-panel flex min-h-[220px] items-center justify-center p-6 text-center">
          <p className="max-w-md text-sm leading-6 text-slate-400">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 8).map((product, index) => (
            <motion.div
              key={`${title}-${product.id}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
            >
              <ProductCard
                product={product}
                badge={`Top ${title}`}
                wishlisted={wishlistedIds.includes(product.id)}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onViewProduct={onViewProduct}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
