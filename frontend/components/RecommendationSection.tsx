"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/Motion";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

type RecommendationSectionProps = {
  eyebrow?: string;
  title?: string;
  products: Product[];
};

export const RecommendationSection = ({
  eyebrow = "Recommendation-ready",
  title = "Recommended for you",
  products,
}: RecommendationSectionProps) => {
  const reducedMotion = useReducedMotion();
  const visibleProducts = products.slice(0, 3);

  if (visibleProducts.length === 0) {
    return null;
  }

  return (
    <Reveal className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <Reveal delay={0.06}>
          <p className="text-sm font-semibold uppercase text-coral">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{title}</h2>
        </Reveal>
      </div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          visible: {
            transition: reducedMotion
              ? undefined
              : {
                  staggerChildren: 0.08,
                  delayChildren: 0.08,
                },
          },
        }}
        className="grid gap-5 md:grid-cols-3"
      >
        {visibleProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </motion.div>
    </Reveal>
  );
};
