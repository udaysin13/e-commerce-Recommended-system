"use client"

import { motion } from "framer-motion"
import { cn } from "@/src/shared/utils"

type CategoryFilterProps = {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="market-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
      {categories.map((category) => {
        const active = category === selectedCategory

        return (
          <motion.button
            key={category}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(category)}
            className={cn(
              "relative rounded-full border px-4 py-2.5 text-sm font-medium transition duration-200",
              active
                ? "border-indigo-400/40 bg-indigo-500/15 text-white"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/16 hover:bg-white/[0.08]",
            )}
          >
            {active ? (
              <motion.span
                layoutId="active-category-pill"
                className="absolute inset-0 rounded-full bg-indigo-500/10"
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
              />
            ) : null}
            <span className="relative z-10 whitespace-nowrap">{category}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
