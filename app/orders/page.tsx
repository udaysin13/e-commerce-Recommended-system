"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { PackageSearch, Shield } from "lucide-react"
import { StorefrontFooter } from "@/src/components/storefront/storefront-footer"
import { StorefrontSubnav } from "@/src/components/storefront/storefront-subnav"
import type { OrderRecord } from "@/src/server/services/orders"

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    void (async () => {
      const session = await fetch("/api/auth/me")
      const payload = session.ok
        ? ((await session.json()) as { user?: { name: string; email: string } })
        : { user: undefined }

      const activeUser = payload.user ?? null
      if (!activeUser) {
        setUser(null)
        setError("Please sign in to view your order history.")
        setIsLoading(false)
        return
      }

      setUser(activeUser)
      const ordersRes = await fetch("/api/orders")
      if (ordersRes.ok) {
        const ordersBody = (await ordersRes.json()) as { orders: OrderRecord[] }
        setOrders(ordersBody.orders)
      } else {
        setError("Could not load your orders.")
      }
      setIsLoading(false)
    })()
  }, [])

  return (
    <div className="min-h-screen">
      <StorefrontSubnav title="Order history" subtitle="Track recent purchases, revisit order details, and reorder quickly from a cleaner account flow." />
      <main className="page-shell py-8">
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="surface-panel rounded-[1.75rem] p-6">
                <div className="market-skeleton h-20 w-full" />
              </div>
            ))}
          </div>
        ) : !user ? (
          <div className="surface-panel rounded-[2rem] p-10 text-center">
            <Shield className="mx-auto h-12 w-12 text-orange-300" />
            <h2 className="mt-4 text-2xl font-black text-white">Sign in required</h2>
            <p className="mt-2 text-sm text-slate-400">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="surface-panel rounded-[2rem] p-10 text-center">
            <PackageSearch className="mx-auto h-12 w-12 text-blue-300" />
            <h2 className="mt-4 text-2xl font-black text-white">No orders yet</h2>
            <p className="mt-2 text-sm text-slate-400">Your completed purchases will appear here once you start shopping.</p>
            <Link href="/products" className="market-button-primary mt-6">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="surface-panel market-button rounded-[1.75rem] p-5 hover:border-orange-400/20"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Order ID</p>
                    <h2 className="mt-2 text-2xl font-black text-white">#{order.id}</h2>
                    <p className="mt-1 text-sm text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="market-chip">{order.status}</span>
                    <span className="market-chip border-blue-400/20 bg-blue-500/10 text-blue-100">{order.paymentStatus}</span>
                    <span className="text-lg font-black text-white">Rs. {order.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <StorefrontFooter />
    </div>
  )
}
