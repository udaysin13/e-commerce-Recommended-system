"use client";

import ProductCard from "./ProductCard";

export default function FeaturedProducts({
  products,
  title = "Featured Products",
  subtitle = "Most popular items",
}) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section id="featured" className="py-4">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">Featured deals</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-600">{subtitle}</p>
        </div>
        <a
          href="/"
          className="rounded border border-[#2874f0] px-4 py-2 text-sm font-bold text-[#2874f0] hover:bg-blue-50"
        >
          View all
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 8).map((product) => (
          <ProductCard
            key={`featured-${product.id}`}
            product={product}
            caption={`Top ${product.category.toLowerCase()} pick with strong reviews.`}
          />
        ))}
      </div>
    </section>
  );
}
