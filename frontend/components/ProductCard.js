import Link from "next/link";

export default function ProductCard({ product, caption }) {
  return (
    <article className="panel overflow-hidden p-4">
      <div className="rounded-[22px] bg-[linear-gradient(135deg,#183153,#345d96)] p-6 text-white">
        <p className="text-xs uppercase tracking-[0.3em] text-white/70">{product.category}</p>
        <h3 className="mt-3 text-xl font-semibold leading-tight">{product.name}</h3>
        <p className="mt-4 text-3xl font-bold">Rs. {product.price.toLocaleString("en-IN")}</p>
      </div>

      {caption ? (
        <p className="mt-4 min-h-12 text-sm leading-6 text-stone-600">{caption}</p>
      ) : (
        <p className="mt-4 min-h-12 text-sm leading-6 text-stone-600">
          Explore this product in the recommendation-aware storefront.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          {product.source || "Catalog"}
        </span>
        <Link className="button-primary" href={`/products/${product.id}`}>
          View Product
        </Link>
      </div>
    </article>
  );
}
