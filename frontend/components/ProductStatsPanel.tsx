"use client";

import { motion } from "framer-motion";
import type { Product } from "@/types/product";

const ICONS = {
  trending: "\uD83D\uDD25",
  bestSeller: "\uD83D\uDED2",
  topRated: "\u2B50",
  views: "\uD83D\uDC41",
  clicks: "\u25C9",
  purchases: "\uD83D\uDED2",
  rating: "\u2B50",
} as const;

const formatCompact = (value: number) =>
  Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const getBadges = (product: Product) => {
  if (product.popularityBadges?.length) {
    return product.popularityBadges;
  }

  const badges: string[] = [];

  if (product.purchaseCount >= 300) badges.push("Best Seller");
  if (product.viewCount >= 1000 || product.clickCount >= 500) badges.push("Trending");
  if (product.averageRating >= 4.5 && product.ratingCount >= 50) badges.push("Top Rated");

  return badges;
};

export const ProductStatsPanel = ({
  product,
  emphasized = false,
}: {
  product: Product;
  emphasized?: boolean;
}) => {
  const badges = getBadges(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded border ${
        emphasized ? "border-teal/30 bg-teal/5" : "border-line bg-mist/50"
      } p-4`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {badges.map((badge) => (
          <span
            key={badge}
            className={`rounded px-2 py-1 text-xs font-bold ${
              badge === "Best Seller"
                ? "bg-coral text-white"
                : badge === "Trending"
                  ? "bg-teal text-white"
                  : "bg-white text-ink"
            }`}
          >
            {badge === "Trending"
              ? `${ICONS.trending} `
              : badge === "Best Seller"
                ? `${ICONS.bestSeller} `
                : `${ICONS.topRated} `}
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase text-ink/50">Views</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {ICONS.views} {formatCompact(product.viewCount)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-ink/50">Clicks</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {ICONS.clicks} {formatCompact(product.clickCount)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-ink/50">Purchases</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {ICONS.purchases} {formatCompact(product.purchaseCount)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-ink/50">Ratings</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {ICONS.rating} {product.averageRating.toFixed(1)}{" "}
            <span className="text-sm text-ink/55">({formatCompact(product.ratingCount)} reviews)</span>
          </p>
        </div>
      </div>

      {product.cartCount > 0 ? (
        <p className="mt-3 text-sm font-semibold text-ink/70">
          {formatCompact(product.cartCount)} cart additions
        </p>
      ) : null}
    </motion.div>
  );
};
