"use client"

import Link from "next/link"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/orders", label: "Orders" },
]

export function StorefrontSubnav({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-white/10 bg-slate-950/76 backdrop-blur-2xl">
      <div className="page-shell py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-300">FluxCart AI</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{subtitle}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="market-button-secondary px-4 py-2">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
