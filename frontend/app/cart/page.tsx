"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";
import type { Cart } from "@/types/cart";

type CartApiResponse = {
  success: boolean;
  data?: {
    cart?: Cart;
  };
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/cart`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = (await response.json()) as CartApiResponse;
        setCart(data.data?.cart ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 w-full bg-gray-200 rounded" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-bold">Error loading cart</p>
          <p className="text-sm">{error}</p>
        </div>
      </section>
    );
  }

  const cartItems = cart?.items ?? [];

  if (!cart || cartItems.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-teal">Shopping cart</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Your cart</h1>
        </div>
        <div className="rounded border border-dashed border-line bg-white px-6 py-14 text-center">
          <p className="text-lg font-bold text-ink">Your cart is empty</p>
          <Link href="/products" className="mt-4 inline-flex rounded bg-teal px-5 py-3 text-sm font-bold text-white">
            Browse products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase text-teal">Shopping cart</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Your cart</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          {cartItems.map((item) => (
            <article key={item.id} className="grid gap-4 rounded border border-line bg-white p-4 sm:grid-cols-[120px_1fr_auto]">
              <img
                src={item.product.imageUrl ?? "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"}
                alt={item.product.name}
                className="aspect-square w-full rounded object-cover sm:w-[120px]"
              />
              <div>
                <p className="text-xs font-semibold uppercase text-teal">{item.product.category.name}</p>
                <h2 className="mt-1 font-bold text-ink">{item.product.name}</h2>
                <p className="mt-2 text-sm text-ink/60">Quantity: {item.quantity}</p>
              </div>
              <p className="font-bold text-ink">{formatCurrency(item.lineTotal)}</p>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Order summary</h2>
          <div className="mt-5 flex justify-between border-b border-line pb-4 text-sm">
            <span>Subtotal</span>
            <span className="font-bold">{formatCurrency(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between py-4 text-sm">
            <span>Tax</span>
            <span className="font-bold">Calculated at checkout</span>
          </div>
          <div className="flex justify-between border-t border-line pt-4">
            <span className="font-bold text-ink">Total</span>
            <span className="text-lg font-bold text-ink">{formatCurrency(cart.subtotal)}</span>
          </div>
          <Link href="/checkout" className="mt-6 block w-full rounded bg-teal px-5 py-3 text-center text-sm font-bold text-white hover:bg-ink transition">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
