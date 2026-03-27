"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { checkoutOrderSchema, type CheckoutOrderInput } from "@/src/shared/checkout"
import type { CatalogProduct } from "@/src/shared/catalog-types"

type CheckoutFormProps = {
  product: CatalogProduct
}

type OrderApiSuccess = {
  order: {
    id: string
    status: string
  }
}

type OrderApiFailure = {
  error: string
}

export function CheckoutForm({ product }: CheckoutFormProps) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const form = useForm<CheckoutOrderInput>({
    resolver: zodResolver(checkoutOrderSchema),
    defaultValues: {
      productId: product.id,
      name: "",
      address: "",
      city: "",
      pincode: "",
      paymentMethod: "COD",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError("")
    setSuccessMessage("")

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const body = (await response.json()) as OrderApiSuccess | OrderApiFailure
      if (response.status === 401) {
        setSubmitError("Please log in to complete this purchase.")
        router.push("/")
        return
      }

      if (!response.ok || !("order" in body)) {
        setSubmitError("error" in body ? body.error : "Could not place your order.")
        return
      }

      setSuccessMessage(`Order placed successfully. Order #${body.order.id}`)
      form.reset({
        productId: product.id,
        name: "",
        address: "",
        city: "",
        pincode: "",
        paymentMethod: "COD",
      })
    } catch {
      setSubmitError("Could not place your order. Please try again.")
    }
  })

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <section className="rounded-3xl border border-[#d7e1ee] bg-white p-6 shadow-[0_14px_34px_rgba(12,24,42,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#6f8096]">Checkout</p>
            <h1 className="mt-2 text-3xl font-black text-[#13283f]">Buy {product.name}</h1>
            <p className="mt-2 text-sm text-[#506178]">
              Complete your order with secure validation and immediate confirmation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-[#cfd9e7] px-4 py-2 text-sm font-semibold text-[#18304a] transition hover:bg-[#f6f9fc]"
          >
            Back
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <input type="hidden" {...form.register("productId")} value={product.id} />

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#20354c]">Name</span>
            <input
              {...form.register("name")}
              className="w-full rounded-2xl border border-[#cfd9e7] bg-[#f7f9fc] px-4 py-3 text-sm outline-none transition focus:border-[#1a75d1] focus:bg-white"
              placeholder="Enter your full name"
            />
            {form.formState.errors.name ? (
              <p className="mt-2 text-sm font-medium text-[#b42318]">{form.formState.errors.name.message}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#20354c]">Address</span>
            <textarea
              {...form.register("address")}
              rows={4}
              className="w-full rounded-2xl border border-[#cfd9e7] bg-[#f7f9fc] px-4 py-3 text-sm outline-none transition focus:border-[#1a75d1] focus:bg-white"
              placeholder="House number, street, landmark"
            />
            {form.formState.errors.address ? (
              <p className="mt-2 text-sm font-medium text-[#b42318]">{form.formState.errors.address.message}</p>
            ) : null}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#20354c]">City</span>
              <input
                {...form.register("city")}
                className="w-full rounded-2xl border border-[#cfd9e7] bg-[#f7f9fc] px-4 py-3 text-sm outline-none transition focus:border-[#1a75d1] focus:bg-white"
                placeholder="Enter your city"
              />
              {form.formState.errors.city ? (
                <p className="mt-2 text-sm font-medium text-[#b42318]">{form.formState.errors.city.message}</p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#20354c]">Pincode</span>
              <input
                {...form.register("pincode")}
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-2xl border border-[#cfd9e7] bg-[#f7f9fc] px-4 py-3 text-sm outline-none transition focus:border-[#1a75d1] focus:bg-white"
                placeholder="6-digit pincode"
              />
              {form.formState.errors.pincode ? (
                <p className="mt-2 text-sm font-medium text-[#b42318]">{form.formState.errors.pincode.message}</p>
              ) : null}
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#20354c]">Payment Method</span>
            <select
              {...form.register("paymentMethod")}
              className="w-full rounded-2xl border border-[#cfd9e7] bg-[#f7f9fc] px-4 py-3 text-sm outline-none transition focus:border-[#1a75d1] focus:bg-white"
            >
              <option value="COD">Cash on Delivery</option>
              <option value="ONLINE">Online</option>
            </select>
            {form.formState.errors.paymentMethod ? (
              <p className="mt-2 text-sm font-medium text-[#b42318]">{form.formState.errors.paymentMethod.message}</p>
            ) : null}
          </label>

          {submitError ? (
            <div className="rounded-2xl border border-[#f7c6c2] bg-[#fff3f1] px-4 py-3 text-sm font-medium text-[#b42318]">
              {submitError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-[#b7ebc6] bg-[#edfdf2] px-4 py-3 text-sm font-medium text-[#067647]">
              {successMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-[#13283f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0d1f35] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {form.formState.isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
            <Link
              href="/"
              className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-[#cfd9e7] px-6 py-3 text-sm font-semibold text-[#18304a] transition hover:bg-[#f6f9fc]"
            >
              Continue Shopping
            </Link>
          </div>
        </form>
      </section>

      <aside className="rounded-3xl border border-[#d7e1ee] bg-[linear-gradient(160deg,#10263d_0%,#15385a_100%)] p-6 text-white shadow-[0_18px_48px_rgba(8,20,42,0.2)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a7c6e8]">Order Summary</p>
        <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="relative aspect-[4/3] bg-[#123152]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-3 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a7c6e8]">{product.kind}</p>
            <h2 className="text-2xl font-black">{product.name}</h2>
            <p className="text-sm text-[#d5e5f5]">{product.description ?? "Premium product ready for fast checkout."}</p>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#d5e5f5]">Price</span>
                <span className="text-xl font-black">Rs. {product.price.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
