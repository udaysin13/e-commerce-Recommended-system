"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ChangeEvent } from "react";

const options = [
  { value: "newest-desc", label: "Newest first" },
  { value: "rating-desc", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export const SortDropdown = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const [isFocused, setIsFocused] = useState(false);
  const current = `${searchParams.get("sortBy") ?? "newest"}-${searchParams.get("sortOrder") ?? "desc"}`;

  const onChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());

    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reducedMotion ? undefined : { y: -1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded"
    >
      <motion.select
        value={current}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
        animate={
          reducedMotion
            ? undefined
            : {
                boxShadow: isFocused
                  ? "0 0 0 4px rgba(8, 127, 131, 0.12)"
                  : "0 0 0 0 rgba(8, 127, 131, 0)",
              }
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="min-h-11 rounded border border-line bg-white px-3 text-sm font-semibold text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>
    </motion.div>
  );
};
