"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { RefreshCcw, ShieldCheck } from "lucide-react"
import { StorefrontFooter } from "@/src/components/storefront/storefront-footer"
import { StorefrontSubnav } from "@/src/components/storefront/storefront-subnav"
import type { OrderRecord } from "@/src/server/services/orders"

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

      if (!res.ok) throw new Error("Unable to reorder. Please try again.")
      setStatus("Items added to your cart successfully.")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to reorder.")
    }
  }

  return (
    <div className="min-h-screen">
      <StorefrontSubnav title="Order details" subtitle="A clearer post-purchase experience with shipping summary, line items, and reorder action." />
      <main className="page-shell py-8">
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="surface-panel rounded-[2rem] p-6">
              <div className="market-skeleton h-80 w-full" />
            </div>
            <div className="surface-panel rounded-[2rem] p-6">
              <div className="market-skeleton h-60 w-full" />
            </div>
          </div>
        ) : error || !order ? (
          <div className="surface-panel rounded-[2rem] p-10 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-orange-300" />
            <h2 className="mt-4 text-2xl font-black text-white">{error || "Order not found"}</h2>
            <button type="button" onClick={() => router.push("/orders")} className="market-button-primary mt-6">
              Back to orders
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="surface-panel rounded-[2rem] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">Order #{order.id}</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{order.status}</h2>
                  <p className="mt-2 text-sm text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <button type="button" onClick={onReorder} className="market-button-primary">
                  <RefreshCcw className="h-4 w-4" />
                  Reorder
                </button>
              </div>

              {status ? <p className="mt-4 text-sm font-medium text-emerald-300">{status}</p> : null}

              <div className="mt-6 space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{item.product.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{item.product.kind}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Qty {item.quantity}</p>
                        <p className="mt-1 text-xl font-black text-white">
                          Rs. {(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="space-y-5">
              <div className="surface-panel rounded-[2rem] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">Summary</p>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span>{order.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment</span>
                    <span>{order.paymentStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total</span>
                    <span className="text-2xl font-black text-white">Rs. {order.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {order.shippingAddress ? (
                <div className="surface-panel rounded-[2rem] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">Shipping address</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    {Object.entries(order.shippingAddress as Record<string, unknown>).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-3">
                        <span className="capitalize text-slate-500">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        )}
      </main>
      <StorefrontFooter />
    </div>
  )
}
