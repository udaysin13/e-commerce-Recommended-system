"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface OrderItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
  };
}

interface TrackingHistoryEntry {
  id: string;
  status: string;
  message: string;
  note: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  currency: string;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  trackingNumber: string | null;
  courierName: string | null;
  estimatedDeliveryDate: string | null;
  placedAt: string;
  paidAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: OrderItem[];
  trackingHistory: TrackingHistoryEntry[];
}

type PageState = "loading" | "ready" | "error";

const statusConfig: Record<string, { order: number; badge: string; color: string; icon: string }> = {
  PENDING: { order: 1, badge: "Pending", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  CONFIRMED: { order: 2, badge: "Confirmed", color: "bg-blue-100 text-blue-800", icon: "✓" },
  PACKED: { order: 3, badge: "Packed", color: "bg-purple-100 text-purple-800", icon: "📦" },
  SHIPPED: { order: 4, badge: "Shipped", color: "bg-indigo-100 text-indigo-800", icon: "🚚" },
  OUT_FOR_DELIVERY: { order: 5, badge: "Out for Delivery", color: "bg-orange-100 text-orange-800", icon: "🚗" },
  DELIVERED: { order: 6, badge: "Delivered", color: "bg-green-100 text-green-800", icon: "✓✓" },
  CANCELLED: { order: 0, badge: "Cancelled", color: "bg-red-100 text-red-800", icon: "✕" },
  RETURNED: { order: 0, badge: "Returned", color: "bg-gray-100 text-gray-800", icon: "↩" },
};

const progressStages = [
  { stage: 1, label: "Pending", key: "PENDING" },
  { stage: 2, label: "Confirmed", key: "CONFIRMED" },
  { stage: 3, label: "Packed", key: "PACKED" },
  { stage: 4, label: "Shipped", key: "SHIPPED" },
  { stage: 5, label: "Out for Delivery", key: "OUT_FOR_DELIVERY" },
  { stage: 6, label: "Delivered", key: "DELIVERED" },
];

function OrderTrackingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const tab = searchParams.get("tab") || "details";

  const [state, setState] = useState<PageState>("loading");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/order-tracking/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data.data.order);
        setState("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
        setState("error");
      }
    };

    loadOrder();
  }, [orderId, router]);

  if (state === "loading") {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-40 rounded bg-line" />
          <div className="rounded border border-line bg-white p-6">
            <div className="h-64 rounded bg-line" />
          </div>
        </div>
      </section>
    );
  }

  if (state === "error" || !order) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/orders"
          className="mb-6 inline-flex text-sm font-bold text-teal hover:text-ink"
        >
          ← Back to Orders
        </Link>
        <div className="rounded border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-900">Error</h2>
          <p className="mt-2 text-sm text-red-700">{error || "Failed to load order"}</p>
          <Link
            href="/orders"
            className="mt-4 inline-block rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            Back to Orders
          </Link>
        </div>
      </section>
    );
  }

  const currentStatusConfig = statusConfig[order.status] || statusConfig.PENDING;
  const currentProgress = currentStatusConfig.order;

  const formattedPlacedDate = new Date(order.placedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <Link
        href="/orders"
        className="mb-6 inline-flex text-sm font-bold text-teal hover:text-ink"
      >
        ← Back to Orders
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Order {order.orderNumber}</h1>
        <p className="mt-2 text-sm text-ink/65">Placed on {formattedPlacedDate}</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex gap-2 border-b border-line">
        <button
          onClick={() =>
            router.push(`/order-tracking/${orderId}?tab=details`, { scroll: false })
          }
          className={`px-4 py-3 text-sm font-bold transition ${
            tab === "details"
              ? "border-b-2 border-teal text-teal"
              : "text-ink/65 hover:text-ink"
          }`}
        >
          Details
        </button>
        <button
          onClick={() =>
            router.push(`/order-tracking/${orderId}?tab=tracking`, { scroll: false })
          }
          className={`px-4 py-3 text-sm font-bold transition ${
            tab === "tracking"
              ? "border-b-2 border-teal text-teal"
              : "text-ink/65 hover:text-ink"
          }`}
        >
          Tracking Timeline
        </button>
      </div>

      {/* Details Tab */}
      {tab === "details" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Status Card */}
          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  Current Status
                </p>
                <div className={`mt-2 inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-bold ${currentStatusConfig.color}`}>
                  {currentStatusConfig.icon}
                  {currentStatusConfig.badge}
                </div>
              </div>
              {order.estimatedDeliveryDate && (
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                    Est. Delivery
                  </p>
                  <p className="mt-1 text-lg font-bold text-teal">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-ink">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 border-b border-line pb-4 last:border-0"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-mist">
                    <img
                      src={item.product.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80"}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink">{item.productName}</p>
                    <p className="text-xs text-ink/65">SKU: {item.sku}</p>
                    <p className="mt-2 text-sm font-bold text-teal">
                      {item.quantity} × {formatCurrency(item.unitPrice, order.currency)} ={" "}
                      {formatCurrency(item.totalPrice, order.currency)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded border border-line bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-ink">Shipping Address</h3>
              <div className="space-y-1 text-sm text-ink/75">
                <p>{order.shippingName}</p>
                <p>{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}, {order.shippingState} {order.shippingZip}
                </p>
                <p>{order.shippingCountry}</p>
              </div>
            </div>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <div className="rounded border border-line bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-bold text-ink">Tracking Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-ink/50 uppercase">Tracking Number</p>
                    <p className="mt-1 font-mono font-bold text-teal">
                      {order.trackingNumber}
                    </p>
                  </div>
                  {order.courierName && (
                    <div>
                      <p className="text-xs text-ink/50 uppercase">Courier</p>
                      <p className="mt-1 font-bold text-ink">{order.courierName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-ink">Order Summary</h3>
            <div className="space-y-2 border-b border-line pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-ink/65">Subtotal</span>
                <span className="font-semibold">
                  {formatCurrency(order.subtotal, order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink/65">Tax</span>
                <span className="font-semibold">
                  {formatCurrency(order.taxAmount, order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink/65">Shipping</span>
                <span className="font-semibold text-green-600">
                  {order.shippingAmount === 0
                    ? "Free"
                    : formatCurrency(order.shippingAmount, order.currency)}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <span className="text-lg font-bold text-ink">Total</span>
              <span className="text-2xl font-bold text-teal">
                {formatCurrency(order.totalAmount, order.currency)}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-ink">Payment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/65">Payment Status</span>
                <span className={`font-bold ${order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-ink/65">Payment Method</span>
                  <span className="font-bold text-ink">{order.paymentMethod}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-ink/65">Paid On</span>
                  <span className="font-bold text-ink">
                    {new Date(order.paidAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tracking Timeline Tab */}
      {tab === "tracking" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Progress Bar */}
          {!["CANCELLED", "RETURNED"].includes(order.status) && (
            <div className="rounded border border-line bg-white p-6 shadow-sm">
              <h3 className="mb-6 font-bold text-ink">Delivery Progress</h3>

              {/* Timeline */}
              <div className="flex justify-between gap-2">
                {progressStages.map((stage, idx) => (
                  <motion.div
                    key={stage.stage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex flex-1 flex-col items-center"
                  >
                    {/* Circle */}
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full font-bold text-white transition ${
                        currentProgress >= stage.stage
                          ? "bg-teal"
                          : "bg-line"
                      }`}
                    >
                      {currentProgress > stage.stage ? "✓" : stage.stage}
                    </div>

                    {/* Line */}
                    {idx < progressStages.length - 1 && (
                      <div
                        className={`mb-2 h-1 flex-1 transition ${
                          currentProgress > stage.stage ? "bg-teal" : "bg-line"
                        }`}
                      />
                    )}

                    {/* Label */}
                    <p className="text-center text-xs font-semibold text-ink">
                      {stage.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Tracking History */}
          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <h3 className="mb-6 font-bold text-ink">
              Tracking History ({order.trackingHistory.length} updates)
            </h3>

            <div className="space-y-4">
              {order.trackingHistory.map((entry, idx) => {
                const entryConfig = statusConfig[entry.status] || statusConfig.PENDING;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-4 border-l-2 border-teal pl-4"
                  >
                    <div className="-ml-5 -mt-1">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${entryConfig.color}`}>
                        {entryConfig.icon}
                      </div>
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-ink">{entryConfig.badge}</p>
                          <p className="mt-1 text-sm text-ink/75">{entry.message}</p>
                          {entry.note && (
                            <p className="mt-2 text-xs italic text-ink/60">
                              Note: {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-ink/50">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-gray-200 rounded" />
          <div className="h-64 w-full bg-gray-200 rounded" />
        </div>
      </section>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}
