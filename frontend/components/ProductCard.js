import Link from "next/link";
import ProductImage from "./ProductImage";

export default function ProductCard({ product, caption }) {
  const imageSrc =
    typeof product?.imageUrl === "string" && product.imageUrl.trim()
      ? product.imageUrl
      : "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80";
  const price =
    typeof product?.price === "number" && Number.isFinite(product.price) ? product.price : 0;
  const productHref = product?.id ? `/products/${product.id}` : "/";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden rounded-t-2xl bg-slate-100">
        <ProductImage
          src={imageSrc}
          alt={product?.name || "Product image"}
          width={800}
          height={520}
          className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="rounded-t-none rounded-b-2xl bg-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
            {product?.category || "General"}
          </span>
          <span className="rounded-full bg-yellow-400 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900">
            Best Seller
          </span>
        </div>
      </div>

      <div className="px-5 py-6">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
          {product?.name || "Untitled product"}
        </h3>
        <p className="mt-3 text-2xl font-bold text-slate-900">Rs. {price.toLocaleString("en-IN")}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {caption || product?.description || "Grab this deal with top-rated product recommendations."}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Free delivery
        </div>
        <Link
          href={productHref}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
