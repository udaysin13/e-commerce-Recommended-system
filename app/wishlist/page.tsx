"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { ProductCard } from "@/src/components/storefront/product-card"
import { StorefrontFooter } from "@/src/components/storefront/storefront-footer"
import { StorefrontSubnav } from "@/src/components/storefront/storefront-subnav"
import type { CatalogProduct } from "@/src/shared/catalog-types"

type CartItem = CatalogProduct & { quantity: number }

export default function WishlistPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      const rawWishlist = typeof window !== "undefined" ? window.localStorage.getItem("fluxcart-demo-wishlist") : null
      const rawCart = typeof window !== "undefined" ? window.localStorage.getItem("fluxcart-demo-cart") : null

      if (rawWishlist) {
        try {
          setWishlist(JSON.parse(rawWishlist) as string[])
        } catch {
          setWishlist([])
        }
      }
      if (rawCart) {
        try {
          setCartItems(JSON.parse(rawCart) as CartItem[])
        } catch {
          setCartItems([])
        }
      }

      const response = await fetch("/api/products?q=&category=All&sort=Newest")
      if (response.ok) {
        const payload = (await response.json()) as { items: CatalogProduct[] }
        setProducts(payload.items)
      }
      setIsLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("fluxcart-demo-wishlist", JSON.stringify(wishlist))
    window.localStorage.setItem("fluxcart-demo-cart", JSON.stringify(cartItems))
  }, [wishlist, cartItems])

  const wishlistProducts = products.filter((product) => wishlist.includes(product.id))

  const handleAddToCart = (product: CatalogProduct) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { ...product, quantity: 1 }]
    })
  }

  const handleWishlistToggle = (productId: string) => {
    setWishlist((current) => current.filter((id) => id !== productId))
  }

  return (
    <div className="min-h-screen">
      <StorefrontSubnav title="Your wishlist" subtitle="Save products for later, compare faster, and move favorites into the cart in one click." />
      <main className="page-shell py-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="surface-card overflow-hidden">
                <div className="aspect-[4/4.8] market-skeleton" />
                <div className="space-y-4 p-4">
                  <div className="market-skeleton h-3 w-28" />
                  <div className="market-skeleton h-5 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="surface-panel rounded-[2rem] p-10 text-center">
            <Heart className="mx-auto h-12 w-12 text-rose-300" />
            <h2 className="mt-4 text-2xl font-black text-white">No saved products yet</h2>
            <p className="mt-2 text-sm text-slate-400">Tap the wishlist icon on any product card to save it here.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                badge="Saved"
                wishlisted
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </main>
      <StorefrontFooter />
    </div>
  )
}
