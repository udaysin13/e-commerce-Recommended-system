"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  placedAt: string;
  estimatedDeliveryDate: string | null;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
}

interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    total: number;
    limit: number;
    offset: number;
  };
}

type OrderState = "loading" | "ready" | "error";

const statusConfig: Record<string, { badge: string; color: string; icon: string }> = {
  PENDING: { badge: "Pending", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  CONFIRMED: { badge: "Confirmed", color: "bg-blue-100 text-blue-800", icon: "✓" },
  PACKED: { badge: "Packed", color: "bg-purple-100 text-purple-800", icon: "📦" },
  SHIPPED: { badge: "Shipped", color: "bg-indigo-100 text-indigo-800", icon: "🚚" },
  OUT_FOR_DELIVERY: { badge: "Out for Delivery", color: "bg-orange-100 text-orange-800", icon: "🚗" },
  DELIVERED: { badge: "Delivered", color: "bg-green-100 text-green-800", icon: "✓✓" },
  CANCELLED: { badge: "Cancelled", color: "bg-red-100 text-red-800", icon: "✕" },
  RETURNED: { badge: "Returned", color: "bg-gray-100 text-gray-800", icon: "↩" },
};

export default function OrdersPage() {
  const router = useRouter();
  const [state, setState] = useState<OrderState>("loading");
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          router.push("/login?returnUrl=/orders");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/order-tracking?limit=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = (await response.json()) as OrdersResponse;
        setOrders(data.data.orders);
        setTotal(data.data.total);
        setState("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
        setState("error");
      }
    };

    loadOrders();
  }, [router]);

  if (state === "loading") {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-32 rounded bg-line" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded border border-line bg-white" />
          ))}
        </div>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-900">Error Loading Orders</h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">My Orders</h1>
          <p className="mt-2 text-sm text-ink/65">
            {total === 0 ? "No orders yet" : `You have ${total} order${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/products"
          className="rounded bg-teal px-4 py-2 text-sm font-bold text-white transition hover:bg-ink"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded border border-dashed border-line bg-mist p-12 text-center"
        >
          <div className="mb-4 text-5xl">📭</div>
          <h2 className="text-lg font-bold text-ink">No Orders Yet</h2>
          <p className="mt-2 text-sm text-ink/65">
            Start shopping and your orders will appear here
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded bg-teal px-6 py-2 text-sm font-bold text-white transition hover:bg-ink"
          >
            Shop Now
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            const formattedDate = new Date(order.placedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded border border-line bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <Link href={`/order-tracking/${order.id}`}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    {/* Order Number & Date */}
                    <div className="sm:col-span-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                        Order ID
                      </p>
                      <p className="mt-1 font-mono text-sm font-bold text-ink">
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 text-xs text-ink/65">{formattedDate}</p>
                    </div>

                    {/* Items */}
                    <div className="sm:col-span-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                        Items
                      </p>
                      <p className="mt-1 text-sm font-semibold text-ink">
                        {order.items[0]?.productName}
                        {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-ink/65">
                        Qty: {order.items.reduce((acc, item) => acc + item.quantity, 0)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="sm:col-span-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                        Status
                      </p>
                      <div className={`mt-1 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-bold ${status.color}`}>
                        {status.icon}
                        {status.badge}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="sm:col-span-1 flex items-end justify-between sm:justify-start sm:flex-col">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                        Amount
                      </p>
                      <p className="text-lg font-bold text-teal">
                        {formatCurrency(order.totalAmount, order.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  {order.estimatedDeliveryDate && (
                    <div className="mt-3 border-t border-line pt-3">
                      <p className="text-xs text-ink/65">
                        Est. Delivery:{" "}
                        {new Date(order.estimatedDeliveryDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </Link>

                {/* View Details Button */}
                <div className="mt-4 flex gap-2 border-t border-line pt-4">
                  <Link
                    href={`/order-tracking/${order.id}`}
                    className="flex-1 rounded bg-teal/10 px-3 py-2 text-center text-sm font-bold text-teal transition hover:bg-teal hover:text-white"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/order-tracking/${order.id}?tab=tracking`}
                    className="flex-1 rounded bg-ink/10 px-3 py-2 text-center text-sm font-bold text-ink transition hover:bg-ink hover:text-white"
                  >
                    Track Order
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
