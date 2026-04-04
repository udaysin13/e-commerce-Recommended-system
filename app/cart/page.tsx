"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { ProductImage } from "@/src/components/products/product-image"
import { StorefrontFooter } from "@/src/components/storefront/storefront-footer"
import { StorefrontSubnav } from "@/src/components/storefront/storefront-subnav"
import type { CatalogProduct } from "@/src/shared/catalog-types"
import { getPrimaryProductImage } from "@/src/shared/product-images"

type CartItem = CatalogProduct & {
  quantity: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return []
    const rawCart = window.localStorage.getItem("fluxcart-demo-cart")
    if (!rawCart) return []
    try {
      return JSON.parse(rawCart) as CartItem[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("fluxcart-demo-cart", JSON.stringify(cartItems))
  }, [cartItems])

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  )

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (productId: string) => {
    setCartItems((current) => current.filter((item) => item.id !== productId))
  }

  return (
    <div className="min-h-screen">
      <StorefrontSubnav title="Your cart" subtitle="Review items, update quantities, and move directly into checkout." />
      <main className="page-shell py-8">
        {cartItems.length === 0 ? (
          <div className="surface-panel rounded-[2rem] p-10 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-orange-300" />
            <h2 className="mt-4 text-2xl font-black text-white">Your cart is empty</h2>
            <p className="mt-2 text-sm text-slate-400">Browse products and add your favorite items to continue.</p>
            <Link href="/products" className="market-button-primary mt-6">
              Explore products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="surface-panel rounded-[1.75rem] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative h-32 w-full overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.14),transparent_52%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))] sm:w-32">
                      <ProductImage
                        src={getPrimaryProductImage(item)}
                        alt={item.name}
                        fill
                        unoptimized={getPrimaryProductImage(item).startsWith("data:image/")}
                        className="p-3"
                        sizes="128px"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.category}</p>
                          <h2 className="mt-2 text-xl font-black text-white">{item.name}</h2>
                          <p className="mt-1 text-sm text-slate-400">{item.kind}</p>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} className="inline-flex items-center gap-2 text-sm font-medium text-rose-300">
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                          <button type="button" onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/10">
                            <Minus className="mx-auto h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-full text-slate-300 hover:bg-white/10">
                            <Plus className="mx-auto h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Price</p>
                          <p className="text-2xl font-black text-white">Rs. {(item.price * item.quantity).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <aside className="surface-panel h-fit rounded-[1.75rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">Order summary</p>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Items</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span className="text-emerald-300">Free</span>
                </div>
              </div>
              <div className="mt-4 rounded-[1.25rem] bg-white/[0.04] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total</span>
                  <span className="text-3xl font-black text-white">Rs. {subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <Link
                href={cartItems[0] ? `/checkout?productId=${encodeURIComponent(cartItems[0].id)}` : "/products"}
                className="market-button-primary mt-5 w-full"
              >
                Proceed to checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
      <StorefrontFooter />
    </div>
  )
}
