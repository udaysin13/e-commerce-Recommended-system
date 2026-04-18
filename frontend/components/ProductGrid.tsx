"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createStaggerContainerVariants } from "@/components/Motion";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  animationKey?: string;
};

export const ProductGrid = ({ products, animationKey }: ProductGridProps) => {
  const reducedMotion = useReducedMotion();

  if (products.length === 0) {
    return (
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded border border-dashed border-line bg-white px-6 py-12 text-center"
      >
        <p className="text-lg font-bold text-ink">No products found</p>
        <p className="mt-2 text-sm text-ink/60">Try another search, category, or sort option.</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={animationKey ?? products.map((product) => product.id).join("|")}
        layout
        variants={createStaggerContainerVariants(Boolean(reducedMotion), 0.06, 0.02)}
        initial="hidden"
        animate="visible"
        exit={reducedMotion ? undefined : { opacity: 0, y: 10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
