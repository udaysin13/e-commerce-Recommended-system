"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { BadgeCheck, CreditCard, Lock, ShieldCheck, Truck } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { ProductImage } from "@/src/components/products/product-image"
import type { CatalogProduct } from "@/src/shared/catalog-types"
import { checkoutOrderSchema, type CheckoutOrderInput } from "@/src/shared/checkout"
import { getPrimaryProductImage } from "@/src/shared/product-images"

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

const fieldClassName =
  "w-full rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/10"

const trustItems = [
  { icon: ShieldCheck, title: "Secure checkout", copy: "Protected payment and validated order flow." },
  { icon: Truck, title: "Fast delivery", copy: "Quick dispatch messaging with a clear delivery promise." },
  { icon: CreditCard, title: "Flexible payment", copy: "Choose COD or online payment with confidence." },
]

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

  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
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
      if (!response.ok || !("order" in body)) {
        const message = "error" in body ? body.error : "Could not place your order."
        setSubmitError(message)
        toast.error(message)
        return
      }

      const message = `Order placed successfully. Order #${body.order.id}`
      setSuccessMessage(message)
      toast.success(message)
      router.push(`/orders/${body.order.id}`)
    } catch {
      const message = "Could not place your order. Please try again."
      setSubmitError(message)
      toast.error(message)
    }
  })

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="surface-panel p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.copy}</p>
            </motion.div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <input type="hidden" {...form.register("productId")} value={product.id} />

          <div className="surface-panel p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-indigo-300">Shipping Details</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Delivery address</h2>
              </div>
              <span className="market-chip">
                <Truck className="h-3.5 w-3.5 text-indigo-300" />
                Fast delivery
              </span>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Full name</span>
                <input {...form.register("name")} className={fieldClassName} placeholder="Enter your full name" />
                {form.formState.errors.name ? (
                  <p className="mt-2 text-sm text-rose-300">{form.formState.errors.name.message}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Address</span>
                <textarea {...form.register("address")} rows={4} className={fieldClassName} placeholder="House number, street, landmark" />
                {form.formState.errors.address ? (
                  <p className="mt-2 text-sm text-rose-300">{form.formState.errors.address.message}</p>
                ) : null}
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">City</span>
                  <input {...form.register("city")} className={fieldClassName} placeholder="Enter your city" />
                  {form.formState.errors.city ? (
                    <p className="mt-2 text-sm text-rose-300">{form.formState.errors.city.message}</p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Pincode</span>
                  <input {...form.register("pincode")} className={fieldClassName} maxLength={6} placeholder="6-digit pincode" />
                  {form.formState.errors.pincode ? (
                    <p className="mt-2 text-sm text-rose-300">{form.formState.errors.pincode.message}</p>
                  ) : null}
                </label>
              </div>
            </div>
          </div>

          <div className="surface-panel p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow text-indigo-300">Payment Method</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Choose how you pay</h2>
              </div>
              <span className="market-chip">
                <Lock className="h-3.5 w-3.5 text-emerald-300" />
                Secure checkout
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { value: "COD" as const, title: "Cash on Delivery", copy: "Pay when your order reaches your doorstep." },
                { value: "ONLINE" as const, title: "Online Payment", copy: "Get faster confirmation with digital payment." },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-[1.35rem] border p-4 transition duration-200 ${
                    paymentMethod === option.value
                      ? "border-indigo-400/40 bg-indigo-500/10"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <input type="radio" value={option.value} className="sr-only" {...form.register("paymentMethod")} />
                  <p className="text-base font-semibold text-white">{option.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{option.copy}</p>
                </label>
              ))}
            </div>
          </div>

          {submitError ? (
            <div className="rounded-[1.15rem] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {submitError}
            </div>
          ) : null}
          {successMessage ? (
            <div className="rounded-[1.15rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {successMessage}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.button
              type="submit"
              disabled={form.formState.isSubmitting}
              whileHover={{ scale: form.formState.isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: form.formState.isSubmitting ? 1 : 0.98 }}
              className="market-button-primary min-w-[220px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {form.formState.isSubmitting ? "Processing..." : "Place Order"}
            </motion.button>
            <Link href="/cart" className="market-button-secondary min-w-[220px]">
              Back to cart
            </Link>
          </div>
        </form>
      </section>

      <aside className="surface-panel h-fit p-5 sm:p-6">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.3rem] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))]">
          <ProductImage
            src={getPrimaryProductImage(product)}
            alt={product.name}
            fill
            unoptimized={getPrimaryProductImage(product).startsWith("data:image/")}
            className="p-6"
            sizes="(max-width: 1280px) 100vw, 30vw"
          />
        </div>

        <div className="mt-5">
          <p className="eyebrow text-indigo-300">Order Summary</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{product.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{product.kind}</p>
        </div>

        <div className="mt-5 rounded-[1.25rem] border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Product total</span>
            <span>Rs. {product.price.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
            <span>Delivery</span>
            <span className="text-emerald-300">Free</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm font-medium text-slate-300">Total payable</span>
            <span className="text-3xl font-semibold text-white">Rs. {product.price.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {[
            "Secure checkout backed by clear validation and protected payment handling.",
            "Fast delivery messaging is surfaced throughout the journey to improve buyer confidence.",
            "Order summary stays visible so users can review totals without losing focus.",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.03] p-3">
              <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
              <p className="text-sm text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
