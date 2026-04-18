"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { createStaggerItemVariants } from "@/components/Motion";
import { formatCurrency, formatRating } from "@/lib/format";
import { trackProductClickEvent } from "@/lib/productEvents";
import type { Product } from "@/types/product";

const ICONS = {
  trending: "\uD83D\uDD25",
  bestSeller: "\uD83D\uDED2",
  views: "\uD83D\uDC41",
  purchases: "\uD83D\uDED2",
} as const;

type ProductCardProps = {
  product: Product;
  index?: number;
};

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const badges = [
    ...(product.purchaseCount >= 300 ? ["Best Seller"] : []),
    ...(product.viewCount >= 1000 || product.clickCount >= 500 ? ["Trending"] : []),
  ];

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      router.push(`/checkout?productId=${product.id}&quantity=1`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProductClick = () => {
    void trackProductClickEvent(product.id);
  };

  return (
    <motion.article
      layout
      variants={createStaggerItemVariants(Boolean(reducedMotion))}
      custom={index}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -6,
              scale: 1.01,
              boxShadow: "0 18px 42px rgba(25, 26, 31, 0.14)",
            }
      }
      whileTap={reducedMotion ? undefined : { scale: 0.985 }}
      transition={{
        layout: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        duration: 0.24,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group flex h-full flex-col overflow-hidden rounded border border-line bg-white shadow-sm"
    >
      <Link
        href={`/products/${product.id}`}
        onClick={handleProductClick}
        className="relative block aspect-[4/3] overflow-hidden bg-mist"
      >
        {badges.length > 0 ? (
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className={`rounded px-2 py-1 text-xs font-bold text-white ${
                  badge === "Best Seller" ? "bg-coral" : "bg-teal"
                }`}
              >
                {badge === "Trending" ? `${ICONS.trending} ` : `${ICONS.bestSeller} `}
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <motion.img
          src={
            product.imageUrl ??
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
          }
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          whileHover={reducedMotion ? undefined : { scale: 1.06 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </Link>
      <motion.div
        className="flex flex-1 flex-col p-4"
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-teal">{product.category.name}</p>
            <Link
              href={`/products/${product.id}`}
              onClick={handleProductClick}
              className="mt-1 block text-base font-bold text-ink hover:text-teal"
            >
              {product.name}
            </Link>
          </div>
          <p className="shrink-0 text-sm font-bold text-ink">
            {formatCurrency(product.price, product.currency)}
          </p>
        </div>
        <p className="mt-3 line-clamp-2 min-h-11 text-sm leading-6 text-ink/65">
          {product.shortDescription ?? product.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4 text-sm">
          <span className="font-semibold text-ink">Rating {formatRating(product.averageRating)}</span>
          <span className="text-ink/55">{product.stockQuantity} in stock</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 rounded bg-mist/60 px-3 py-2 text-xs font-semibold text-ink/65">
          <span>
            {ICONS.views} {product.viewCount.toLocaleString()} views
          </span>
          <span>
            {ICONS.purchases} {product.purchaseCount.toLocaleString()} sold
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <motion.button
            onClick={handleBuyNow}
            disabled={isProcessing || product.stockQuantity === 0}
            whileHover={reducedMotion ? undefined : { y: -2, scale: 1.02 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className="flex-1 rounded bg-teal px-4 py-2 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            {isProcessing ? "Processing..." : "Buy Now"}
          </motion.button>
          <Link
            href={`/products/${product.id}`}
            onClick={handleProductClick}
            className="flex-1 rounded border border-line px-4 py-2 text-center text-sm font-bold text-ink transition hover:border-teal hover:text-teal"
          >
            View
          </Link>
        </div>
      </motion.div>
    </motion.article>
  );
};
