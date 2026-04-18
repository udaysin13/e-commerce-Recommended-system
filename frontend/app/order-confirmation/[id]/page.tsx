"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import type { Order } from "@/types/order";

type PageState = "loading" | "ready" | "error";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [state, setState] = useState<PageState>("loading");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const token = window.localStorage.getItem("authToken");

        if (!token) {
          router.replace(`/login?returnUrl=${encodeURIComponent(`/order-confirmation/${orderId}`)}`);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error?.message || "Failed to load order.");
        }

        setOrder(json.data.order as Order);
        setState("ready");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load order.");
        setState("error");
      }
    };

    void loadOrder();
  }, [orderId, router]);

  if (state === "loading") {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 rounded bg-line" />
          <div className="h-[360px] rounded bg-line" />
        </div>
      </section>
    );
  }

  if (state === "error" || !order) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-bold text-red-900">Unable to load order confirmation</h1>
          <p className="mt-2 text-sm text-red-700">{error ?? "Please try again."}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Retry
            </button>
            <Link
              href="/orders"
              className="rounded border border-line px-4 py-2 text-sm font-bold text-ink transition hover:border-teal hover:text-teal"
            >
              View orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const deliveryLine = order.addressLine2
    ? `${order.addressLine1}, ${order.addressLine2}`
    : order.addressLine1;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-sm font-semibold uppercase text-green-700">Order confirmed</p>
        <h1 className="mt-2 text-3xl font-bold text-green-900">Thank you for your order</h1>
        <p className="mt-2 text-sm text-green-800">
          Your order has been placed successfully and will be delivered to the address below.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Order details</h2>
            <div className="mt-5 grid gap-3 text-sm text-ink/75 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-ink/50">Order Number</p>
                <p className="mt-1 font-bold text-ink">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-ink/50">Status</p>
                <p className="mt-1 font-bold text-teal">{order.status}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-ink/50">Placed On</p>
                <p className="mt-1 font-bold text-ink">
                  {new Date(order.placedAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-ink/50">Payment Status</p>
                <p className="mt-1 font-bold text-ink">{order.paymentStatus}</p>
              </div>
            </div>
          </div>

          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Delivery address</h2>
            <div className="mt-4 text-sm text-ink/75">
              <p className="font-bold text-ink">{order.fullName ?? order.shippingName}</p>
              <p className="mt-1">{order.phone}</p>
              <p className="mt-3">{deliveryLine ?? order.shippingAddress}</p>
              <p>
                {order.city ?? order.shippingCity}, {order.state ?? order.shippingState}{" "}
                {order.postalCode ?? order.shippingZip}
              </p>
              <p>{order.country ?? order.shippingCountry}</p>
            </div>
          </div>

          <div className="rounded border border-line bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-ink">Items</h2>
            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-line pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold text-ink">{item.productName}</p>
                    <p className="mt-1 text-sm text-ink/65">
                      Quantity: {item.quantity} x {formatCurrency(item.unitPrice, order.currency)}
                    </p>
                  </div>
                  <p className="font-bold text-ink">
                    {formatCurrency(item.totalPrice, order.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Summary</h2>
          <div className="mt-5 space-y-3 border-b border-line pb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/65">Subtotal</span>
              <span className="font-semibold">{formatCurrency(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/65">Tax</span>
              <span className="font-semibold">{formatCurrency(order.taxAmount, order.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/65">Shipping</span>
              <span className="font-semibold">
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

          <div className="mt-6 space-y-3">
            <Link
              href={`/order-tracking/${order.id}`}
              className="block rounded bg-teal px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-ink"
            >
              Track order
            </Link>
            <Link
              href="/products"
              className="block rounded border border-line px-5 py-3 text-center text-sm font-bold text-ink transition hover:border-teal hover:text-teal"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
