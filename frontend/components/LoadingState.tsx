"use client";

import { motion, useReducedMotion } from "framer-motion";

export const LoadingState = ({ label = "Loading products" }: { label?: string }) => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reducedMotion ? 0 : index * 0.04 }}
          className="overflow-hidden rounded border border-line bg-white"
        >
          <motion.div
            className="aspect-[4/3] bg-line"
            animate={
              reducedMotion
                ? undefined
                : {
                    opacity: [0.55, 0.8, 0.55],
                    scale: [1, 1.01, 1],
                  }
            }
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.6, ease: "easeInOut" }}
          />
          <div className="space-y-3 p-4">
            <motion.div
              className="h-4 w-1/3 rounded bg-line"
              animate={reducedMotion ? undefined : { opacity: [0.45, 0.75, 0.45] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
            />
            <motion.div
              className="h-5 w-3/4 rounded bg-line"
              animate={reducedMotion ? undefined : { opacity: [0.45, 0.75, 0.45] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut", delay: 0.08 }}
            />
            <motion.div
              className="h-4 w-full rounded bg-line"
              animate={reducedMotion ? undefined : { opacity: [0.45, 0.75, 0.45] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut", delay: 0.16 }}
            />
            <span className="sr-only">{label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
