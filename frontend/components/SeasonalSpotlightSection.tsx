"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProductGrid } from "@/components/ProductGrid";
import { recommendedProductsToProducts } from "@/lib/recommendationsApi";
import type { SeasonalFestival, SeasonalRecommendationSection } from "@/types/recommendation";

export const SeasonalSpotlightSection = ({
  section,
  activeFestival,
}: {
  section: SeasonalRecommendationSection;
  activeFestival: SeasonalFestival | null;
}) => {
  const reducedMotion = useReducedMotion();
  const products = recommendedProductsToProducts({
    strategy: section.id,
    source: "local",
    mode: "trending",
    experience: "explore",
    count: section.items.length,
    items: section.items,
  });

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 overflow-hidden rounded border border-line bg-white shadow-sm"
      >
        <div className="flex flex-col gap-4 bg-mist/60 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-coral">{section.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold text-ink">
              <span className="mr-2">{section.icon}</span>
              {section.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{section.description}</p>
          </div>
          {activeFestival ? (
            <div className="rounded bg-white px-4 py-3 text-sm shadow-sm">
              <p className="font-bold text-ink">
                {activeFestival.icon} {activeFestival.name}
              </p>
              <p className="mt-1 text-ink/60">
                {activeFestival.countdownDays === 0
                  ? "Happening today"
                  : `${activeFestival.countdownDays} day${activeFestival.countdownDays === 1 ? "" : "s"} to go`}
              </p>
              {activeFestival.saleLabel ? (
                <p className="mt-2 text-xs font-semibold uppercase text-teal">
                  {activeFestival.saleLabel}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </motion.div>

      <ProductGrid products={products} animationKey={`seasonal:${section.id}`} />
    </section>
  );
};
