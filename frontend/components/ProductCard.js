"use client";

import Link from "next/link";
import { useState } from "react";
import ProductImage from "./ProductImage";

export default function ProductCard({ product, caption, isLoading = false, error = null, onRetry }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (isLoading) {
    return <ProductCardSkeleton />;
  }

  if (error) {
    return <ProductCardError error={error} onRetry={onRetry} />;
  }

  if (!product) {
    return (
      <article className="rounded-lg border border-slate-200 bg-white p-5 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-600">Product not available</p>
      </article>
    );
  }

  const imageSrc =
    typeof product.imageUrl === "string" && product.imageUrl.trim()
      ? product.imageUrl
      : "/product-images/headphones.svg";
  const price =
    typeof product.price === "number" && Number.isFinite(product.price) ? product.price : 0;
  const discount = Number(product.discount || 0);
  const originalPrice = discount ? Math.round(price / (1 - discount / 100)) : price;
  const rating = Number(product.rating || 4.3);
  const reviews = Number(product.reviews || 120);
  const badge = product.badge || (discount ? "Deal" : "Popular");
  const productHref = product.id ? `/products/${product.id}` : "/";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-[#2874f0] hover:shadow-md">
      <Link href={productHref} className="relative block bg-slate-50 p-3">
        {imageLoading ? <div className="absolute inset-0 animate-pulse bg-slate-200" /> : null}
        {!imageError ? (
          <ProductImage
            src={imageSrc}
            alt={product.name || "Product image"}
            width={800}
            height={520}
            className="h-44 w-full rounded bg-white object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            onLoad={() => setImageLoading(false)}
          />
        ) : (
          <div className="flex h-44 items-center justify-center rounded bg-slate-100 text-sm font-semibold text-slate-500">
            Image unavailable
          </div>
        )}
        <span className="absolute left-3 top-3 rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">
          {badge}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-bold uppercase text-slate-500">{product.category || "General"}</p>
        <Link href={productHref}>
          <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-950 hover:text-[#2874f0]">
            {product.name || "Untitled product"}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
            {rating.toFixed(1)} star
          </span>
          <span className="text-xs font-semibold text-slate-500">
            ({reviews.toLocaleString("en-IN")})
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <p className="text-xl font-bold text-slate-950">Rs. {price.toLocaleString("en-IN")}</p>
          {originalPrice > price ? (
            <>
              <p className="text-sm text-slate-500 line-through">
                Rs. {originalPrice.toLocaleString("en-IN")}
              </p>
              <p className="text-sm font-bold text-green-700">{discount}% off</p>
            </>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-600">
          {caption || product.description || "Quality product with fast delivery."}
        </p>

        <div className="mt-3 flex items-center justify-between text-xs font-bold">
          <span className="text-green-700">Free delivery</span>
          <span className="text-slate-500">In stock</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={productHref}
            className="rounded border border-[#2874f0] px-3 py-2 text-center text-sm font-bold text-[#2874f0] transition hover:bg-blue-50"
          >
            Details
          </Link>
          <Link
            href={productHref}
            className="rounded bg-yellow-400 px-3 py-2 text-center text-sm font-bold text-slate-950 transition hover:bg-yellow-300"
          >
            Buy now
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductCardSkeleton() {
  return (
    <article className="animate-pulse rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="h-44 rounded bg-slate-200" />
      <div className="mt-4 h-3 w-20 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-full rounded bg-slate-200" />
      <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
      <div className="mt-4 h-6 w-28 rounded bg-slate-200" />
    </article>
  );
}

function ProductCardError({ error, onRetry }) {
  return (
    <article className="rounded-lg border border-red-200 bg-red-50 p-6 text-center shadow-sm">
      <h3 className="font-semibold text-red-900">Product unavailable</h3>
      <p className="mt-2 text-sm text-red-700">{error || "Failed to load product details"}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      ) : null}
    </article>
  );
}
