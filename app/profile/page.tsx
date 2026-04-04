"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CreditCard, LogOut, Package, Settings, UserRound } from "lucide-react"
import { StorefrontFooter } from "@/src/components/storefront/storefront-footer"
import { StorefrontSubnav } from "@/src/components/storefront/storefront-subnav"
import type { OrderRecord } from "@/src/server/services/orders"

type SessionUser = {
  name: string
  email: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [orders, setOrders] = useState<OrderRecord[]>([])

  useEffect(() => {
    void (async () => {
      const userResponse = await fetch("/api/auth/me")
      if (userResponse.ok) {
        const payload = (await userResponse.json()) as { user?: SessionUser | null }
        setUser(payload.user ?? null)
      }

      const ordersResponse = await fetch("/api/orders")
      if (ordersResponse.ok) {
        const payload = (await ordersResponse.json()) as { orders: OrderRecord[] }
        setOrders(payload.orders)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen">
      <StorefrontSubnav title="My profile" subtitle="Manage your account, review recent orders, and keep checkout details close at hand." />
      <main className="page-shell py-8">
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="surface-panel rounded-[1.8rem] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{user?.name ?? "Guest shopper"}</h2>
                <p className="text-sm text-slate-400">{user?.email ?? "Sign in to unlock your account dashboard."}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <Link href="/orders" className="market-button-secondary justify-start">
                <Package className="h-4 w-4" />
                View order history
              </Link>
              <Link href="/wishlist" className="market-button-secondary justify-start">
                <CreditCard className="h-4 w-4" />
                Saved products
              </Link>
              <button type="button" className="market-button-secondary justify-start">
                <Settings className="h-4 w-4" />
                Account settings
              </button>
              <form
                action="/api/auth/logout"
                method="POST"
                className="contents"
              >
                <button type="submit" className="market-button-secondary justify-start text-rose-200 hover:text-rose-100">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="surface-panel rounded-[1.8rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Overview</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="surface-muted p-4">
                  <p className="text-sm text-slate-400">Orders placed</p>
                  <p className="mt-2 text-3xl font-black text-white">{orders.length}</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-sm text-slate-400">Saved addresses</p>
                  <p className="mt-2 text-3xl font-black text-white">{user ? 1 : 0}</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-sm text-slate-400">Member status</p>
                  <p className="mt-2 text-3xl font-black text-white">{user ? "Active" : "Guest"}</p>
                </div>
              </div>
            </div>

            <div className="surface-panel rounded-[1.8rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">Recent activity</p>
              <div className="mt-5 space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <div>
                      <p className="font-semibold text-white">Order #{order.id}</p>
                      <p className="mt-1 text-sm text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">Rs. {order.total.toLocaleString("en-IN")}</p>
                      <p className="mt-1 text-sm text-slate-400">{order.status}</p>
                    </div>
                  </Link>
                ))}
                {orders.length === 0 ? (
                  <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-6 text-sm text-slate-400">
                    No order activity yet. Once you place orders, they will appear here.
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>
      <StorefrontFooter />
    </div>
  )
}
