"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createOrder } from "../lib/api";
import { clearCart, getCartItems, removeCartItem, updateCartItemQuantity } from "../lib/cart";
import ProductImage from "./ProductImage";

const demoUserId = 1;

export default function CartClient() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleCheckout() {
    if (!items.length) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      for (const item of items) {
        for (let index = 0; index < item.quantity; index += 1) {
          await createOrder({
            userId: demoUserId,
            productId: item.id,
          });
        }
      }

      clearCart();
      setItems([]);
      setMessage("Order placed successfully. Your cart is now empty.");
    } catch (error) {
      setMessage(error.message || "Unable to complete checkout.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell py-10 sm:py-14">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Cart</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Your shopping cart</h1>
        </div>
        <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Continue shopping
        </Link>
      </div>

      {!items.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-2xl font-bold text-slate-900">Your cart is empty</p>
          <p className="mt-3 text-sm text-slate-600">
            Add products from the product detail page to see them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[160px_1fr]"
              >
                <div className="overflow-hidden rounded-2xl bg-slate-100">
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.name}
                    width={320}
                    height={220}
                    className="h-36 w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      {item.category}
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">{item.name}</h2>
                    <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setItems(updateCartItemQuantity(item.id, item.quantity - 1))}
                        className="h-10 w-10 rounded-full border border-slate-200 text-lg font-semibold text-slate-900"
                      >
                        -
                      </button>
                      <span className="min-w-8 text-center font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setItems(updateCartItemQuantity(item.id, item.quantity + 1))}
                        className="h-10 w-10 rounded-full border border-slate-200 text-lg font-semibold text-slate-900"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-slate-900">
                        Rs. {(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      <button
                        type="button"
                        onClick={() => setItems(removeCartItem(item.id))}
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Summary
            </p>
            <div className="mt-6 space-y-4 border-b border-slate-200 pb-6">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Items</span>
                <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Delivery</span>
                <span>Free</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-base font-semibold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-slate-900">
                Rs. {totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {message ? (
              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={submitting}
              className="mt-6 w-full rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Checkout"}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
