"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const [isFocused, setIsFocused] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();

    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                boxShadow: isFocused
                  ? "0 0 0 4px rgba(8, 127, 131, 0.12)"
                  : "0 0 0 0 rgba(8, 127, 131, 0)",
                y: isFocused ? -1 : 0,
              }
        }
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex-1 rounded"
      >
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder='Try "cheap t-shirts for men" or "best headphones under 5000"'
          className="min-h-11 w-full rounded border border-line bg-white px-4 text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/15"
        />
      </motion.div>
      <motion.button
        type="submit"
        whileHover={reducedMotion ? undefined : { y: -2, scale: 1.01 }}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        className="min-h-11 rounded bg-ink px-5 text-sm font-bold text-white transition hover:bg-teal"
      >
        Search
      </motion.button>
      {value.trim().length === 1 ? (
        <p className="text-xs font-semibold text-ink/55 sm:self-center">
          Use at least 2 characters for better results.
        </p>
      ) : null}
    </motion.form>
  );
};
