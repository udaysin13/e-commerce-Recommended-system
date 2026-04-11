"use client";

import ProductImage from "./ProductImage";

const featuredDeals = [
  {
    title: "Headphones",
    label: "From Rs. 999",
    imageUrl: "/product-images/headphones.svg",
  },
  {
    title: "Smart watch",
    label: "Up to 25% off",
    imageUrl: "/product-images/smart-watch.svg",
  },
  {
    title: "Home picks",
    label: "Kitchen deals",
    imageUrl: "/product-images/knife-set.svg",
  },
];

export default function HeroSection() {
  return (
    <section className="bg-slate-100 py-4">
      <div className="page-shell">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="grid min-h-[260px] gap-6 bg-[#2874f0] p-6 text-white sm:p-8 lg:grid-cols-[1fr_310px]">
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase text-yellow-200">
                  Big Saving Days
                </p>
                <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight sm:text-5xl">
                  Top deals on electronics, fashion, home and beauty
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-6 text-blue-50 sm:text-base">
                  Fast recommendations, sharp prices, and fresh picks across your favorite
                  shopping categories.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#products"
                    className="rounded bg-yellow-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-yellow-300"
                  >
                    Shop deals
                  </a>
                  <a
                    href="#recommended"
                    className="rounded border border-white/60 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    See recommendations
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
                {featuredDeals.map((deal) => (
                  <div key={deal.title} className="flex items-center gap-3 rounded bg-white p-3 text-slate-900">
                    <ProductImage
                      src={deal.imageUrl}
                      alt={deal.title}
                      width={120}
                      height={90}
                      className="h-16 w-16 rounded bg-slate-100 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{deal.title}</p>
                      <p className="text-xs font-semibold text-green-700">{deal.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Today only</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">Extra 10% back</p>
              <p className="mt-2 text-sm text-slate-600">On orders above Rs. 1,999</p>
            </div>
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase text-slate-500">Delivery</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">Free shipping</p>
              <p className="mt-2 text-sm text-slate-600">On selected best sellers</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
