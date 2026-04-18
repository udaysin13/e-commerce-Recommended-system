"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { storefrontCategories } from "@/lib/categories";

export const CategoryFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const activeCategory = searchParams.get("category") ?? "";

  const onChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-2 overflow-x-auto"
    >
      <motion.button
        onClick={() => onChange("")}
        whileHover={reducedMotion ? undefined : { y: -2 }}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        className={`relative z-0 shrink-0 overflow-hidden rounded border px-4 py-2 text-sm font-semibold transition ${
          activeCategory === ""
            ? "border-ink bg-ink text-white shadow-sm"
            : "border-line bg-white text-ink hover:border-teal hover:text-teal"
        }`}
        type="button"
      >
        {activeCategory === "" ? (
          <motion.span
            layoutId="active-category-pill"
            className="absolute inset-0 -z-10 rounded bg-ink"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        ) : null}
        All
      </motion.button>
      {storefrontCategories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onChange(category.slug)}
          whileHover={reducedMotion ? undefined : { y: -2 }}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          className={`relative z-0 shrink-0 overflow-hidden rounded border px-4 py-2 text-sm font-semibold transition ${
            activeCategory === category.slug
              ? "border-ink bg-ink text-white shadow-sm"
              : "border-line bg-white text-ink hover:border-teal hover:text-teal"
          }`}
          type="button"
        >
          {activeCategory === category.slug ? (
            <motion.span
              layoutId="active-category-pill"
              className="absolute inset-0 -z-10 rounded bg-ink"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          ) : null}
          {category.name}
        </motion.button>
      ))}
    </motion.div>
  );
};
