"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { OrderRecord } from "@/src/server/services/orders"
import { Shield } from "lucide-react"

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    void (async () => {
      const orderId = params.id
      if (!orderId) {
        setError("Order ID is missing.")
        setIsLoading(false)
        return
      }

      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) {
        setError("Order not found or you do not have access.")
        setIsLoading(false)
        return
      }

      const data = (await res.json()) as { order?: OrderRecord }
      if (!data.order) {
        setError("Order not found.")
        setIsLoading(false)
        return
      }

      setOrder(data.order)
      setIsLoading(false)
    })()
  }, [params.id])

  const onReorder = async () => {
    if (!order) return

    setStatus("Adding items to your cart...")

    try {
      const res = await fetch("/api/cart/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      })

      if (!res.ok) {
        throw new Error("Unable to reorder. Please try again.")
      }

      setStatus("Items added to cart. You can checkout anytime.")
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to reorder.")
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="rounded-2xl border border-[#dbe1ef] bg-white p-10 text-center">
          <p className="text-lg font-semibold text-[#1b2737]">Loading order…</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="rounded-2xl border border-[#dbe1ef] bg-white p-10 text-center">
          <Shield className="mx-auto h-10 w-10 text-[#1b2737]" />
          <p className="mt-4 text-lg font-semibold text-[#1b2737]">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#ffcc66] px-6 py-3 text-sm font-semibold text-[#10253d] shadow-sm"
          >
            Back to Orders
          </button>
        </div>
      </main>
    )
  }

  const message = status || ""

  if (!order) {
    return null
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-12">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#13283f]">Order #{order.id}</h1>
          <p className="mt-2 text-sm text-[#506178]">
            Placed on {new Date(order.createdAt).toLocaleString()} • {order.status}
          </p>
          {order.shippingAddress ? (
            <div className="mt-3 rounded-lg border border-[#dbe1ef] bg-[#f5f7fb] px-4 py-3 text-sm text-[#1b2737]">
              <p className="font-semibold">Shipping Address</p>
              <div className="mt-2 space-y-1">
                {Object.entries(order.shippingAddress as Record<string, any>).map(([key, value]) => (
                  <div key={key} className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-[#506178]">
                      {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}:
                    </span>
                    <span className="text-sm text-[#1b2737]">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {message ? (
            <p className="mt-2 text-sm font-medium text-[#1a4725]">{message}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ffcc66] px-4 py-2 text-sm font-semibold text-[#10253d] shadow-sm"
          >
            Back to orders
          </button>
          <button
            type="button"
            onClick={onReorder}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1a75d1] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1866c2]"
          >
            Reorder
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-[#dbe1ef] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#13283f]">Items</h2>
          <div className="mt-5 space-y-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex flex-wrap items-center gap-4 border-b border-[#e5e9f0] pb-4 last:border-0 last:pb-0">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold text-[#1b2737]">{item.product.name}</p>
                  <p className="mt-1 text-sm text-[#506178]">{item.product.kind}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm text-[#506178]">Qty: {item.quantity}</span>
                  <span className="text-sm font-semibold text-[#13283f]">
                    Rs. {(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-[#dbe1ef] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#13283f]">Order Summary</h2>
          <div className="mt-5 space-y-3">
            <div className="flex justify-between text-sm font-medium text-[#506178]">
              <span>Subtotal</span>
              <span>Rs. {order.total.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-[#506178]">
              <span>Status</span>
              <span className="text-sm font-semibold text-[#13283f]">{order.status}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-[#506178]">
              <span>Payment</span>
              <span className="text-sm font-semibold text-[#13283f]">{order.paymentStatus}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
