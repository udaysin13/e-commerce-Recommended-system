"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import type { OrderRecord } from "@/src/server/services/orders"
import { Shield, ShoppingBag } from "lucide-react"

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
        setError("Please log in to view your orders.")
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

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="rounded-2xl border border-[#dbe1ef] bg-white p-10 text-center">
          <p className="text-lg font-semibold text-[#1b2737]">Loading your orders…</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="rounded-2xl border border-[#dbe1ef] bg-white p-10 text-center">
          <Shield className="mx-auto h-10 w-10 text-[#1b2737]" />
          <p className="mt-4 text-lg font-semibold text-[#1b2737]">You need to be logged in.</p>
          <p className="mt-2 text-sm text-[#506178]">Please sign in to view your order history.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#13283f]">Order History</h1>
          <p className="mt-2 text-sm text-[#506178]">
            View all your past orders and track their status.
          </p>
        </div>

        {orders.length > 0 ? (
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#ffcc66] px-4 py-2 text-sm font-semibold text-[#10253d] shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-[#dbe1ef] bg-white p-10 text-center">
          <p className="text-lg font-semibold text-[#1b2737]">No orders yet.</p>
          <p className="mt-2 text-sm text-[#506178]">
            Once you place an order, it will appear here.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#ffcc66] px-6 py-3 text-sm font-semibold text-[#10253d] shadow-sm"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="group rounded-2xl border border-[#dbe1ef] bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#506178]">Order #{order.id}</p>
                  <p className="mt-1 text-lg font-bold text-[#13283f]">
                    Rs. {order.total.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#eef7ff] px-3 py-1 text-xs font-semibold text-[#0c3d6d]">
                    {order.status}
                  </span>
                  <span className="rounded-full bg-[#f0f9f4] px-3 py-1 text-xs font-semibold text-[#1b5d34]">
                    {order.paymentStatus}
                  </span>
                  <span className="text-xs font-medium text-[#718096]">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                  <span className="ml-auto rounded-full bg-[#ffcc66] px-3 py-1 text-xs font-semibold text-[#10253d] transition group-hover:bg-[#ffb848]">
                    View details
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

