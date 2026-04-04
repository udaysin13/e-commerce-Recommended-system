"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ShoppingBag, Sparkles, Star, Truck } from "lucide-react"
import { ProductImage } from "@/src/components/products/product-image"
import type { CatalogProduct } from "@/src/shared/catalog-types"
import type { RecommendationProduct } from "@/src/shared/recommendation-schema"
import { getPrimaryProductImage } from "@/src/shared/product-images"
import { cn } from "@/src/shared/utils"

type ProductCardProduct = CatalogProduct & Partial<Pick<RecommendationProduct, "reason" | "tags">>

type ProductCardProps = {
  product: ProductCardProduct
  wishlisted?: boolean
  badge?: string
  onAddToCart: (product: CatalogProduct) => void
  onToggleWishlist: (productId: string) => void
  onViewProduct?: (productId: string) => void
}

function getProductMeta(product: ProductCardProduct) {
  const seed = product.id.split("").reduce((total, char) => total + char.charCodeAt(0), 0)
  const discount = 8 + (seed % 14)
  const rating = product.ratingAvg ?? Number((4.2 + (seed % 6) * 0.1).toFixed(1))
  const reviews = product.ratingCount ?? 90 + (seed % 430)
  const originalPrice = Math.round(product.price * (1 + discount / 100))
  const stockLeft = Math.max(2, (product.inStock ?? 8) % 9)
  const deliveryDays = 1 + (seed % 3)
  return { discount, rating, reviews, originalPrice, stockLeft, deliveryDays }
}

export function ProductCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`surface-card overflow-hidden ${className}`}>
      <div className="aspect-[4/5] market-skeleton" />
      <div className="space-y-3 p-4">
        <div className="market-skeleton h-4 w-28" />
        <div className="market-skeleton h-5 w-full" />
        <div className="market-skeleton h-5 w-3/4" />
        <div className="market-skeleton h-20 w-full" />
        <div className="market-skeleton h-11 w-full" />
      </div>
    </div>
  )
}

export function ProductCard({
  product,
  wishlisted = false,
  badge,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
}: ProductCardProps) {
  const { discount, rating, reviews, originalPrice, stockLeft, deliveryDays } = getProductMeta(product)
  const image = getPrimaryProductImage(product)
  const reasonLabel = badge ?? product.reason?.label ?? "Recommended"

  return (
    <motion.article
      layout
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/80 text-card-foreground shadow-[0_18px_36px_rgba(2,6,23,0.34)] backdrop-blur-xl"
    >
      <div className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-3">
          <div className="inline-flex max-w-[75%] items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/75 px-3 py-1.5 text-[11px] font-medium text-slate-100 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-300" />
            <span className="truncate">{reasonLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/75 text-slate-300 transition duration-200 hover:scale-105 hover:text-white",
              wishlisted && "border-emerald-400/30 text-emerald-300",
            )}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
          </button>
        </div>

        <Link
          href={`/products/${encodeURIComponent(product.id)}`}
          className="block"
          onClick={() => onViewProduct?.(product.id)}
          aria-label={`View ${product.name}`}
        >
          <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))]">
            <ProductImage
              src={image}
              alt={product.name}
              fill
              unoptimized={image.startsWith("data:image/")}
              className="p-5 transition duration-300 group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 78vw, (max-width: 1280px) 30vw, 22vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          </div>
        </Link>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              {product.category}
            </span>
          </div>
          <Link
            href={`/products/${encodeURIComponent(product.id)}`}
            className="block"
            onClick={() => onViewProduct?.(product.id)}
          >
            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-white transition duration-200 group-hover:text-indigo-200 sm:min-h-[3rem]">
              {product.name}
            </h3>
          </Link>
          <p className="line-clamp-1 text-sm text-slate-400">{product.kind}</p>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="inline-flex items-center gap-1 text-amber-300">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-medium text-slate-100">{rating}</span>
            <span className="text-slate-400">({reviews})</span>
          </span>
          <span className="text-xs font-medium text-emerald-300">
            {discount}% off
          </span>
        </div>

        <div className="space-y-2 rounded-[1rem] border border-white/8 bg-white/[0.03] p-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-white">
                Rs. {product.price.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-500 line-through">
                Rs. {originalPrice.toLocaleString("en-IN")}
              </p>
            </div>
            <span className="rounded-full bg-emerald-400/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              Best Match
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Truck className="h-3.5 w-3.5 text-indigo-300" />
            <span>Free delivery • {deliveryDays} days</span>
          </div>
          <p className="text-xs font-medium text-amber-300">Only {stockLeft} left</p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={() => onAddToCart(product)}
          className="market-button-primary h-10 w-full justify-center gap-2 rounded-full"
        >
          <ShoppingBag className="h-4 w-4" />
          Buy Now
        </motion.button>
      </div>
    </motion.article>
  )
}
