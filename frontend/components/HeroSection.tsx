"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Appear } from "@/components/Motion";
import { storefrontCategories } from "@/lib/categories";

export const HeroSection = () => {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-[520px] overflow-hidden bg-ink text-white">
      <motion.img
        src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1800&q=80"
        alt="Curated products on a retail display"
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        initial={reducedMotion ? false : { scale: 1.04 }}
        animate={reducedMotion ? undefined : { scale: 1 }}
        transition={reducedMotion ? undefined : { duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-0 bg-ink/65" />
      <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Appear
            delay={0.05}
            className="text-sm font-semibold uppercase text-white/80"
          >
            Personal shopping, cleaner signals
          </Appear>
          <Appear delay={0.12}>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Find products that fit the way people actually shop.
            </h1>
          </Appear>
          <Appear delay={0.2}>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/82">
              Browse a modern storefront built around product discovery, behavior tracking, and recommendation-ready data.
            </p>
          </Appear>
          <Appear delay={0.28}>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-white/82">
              {storefrontCategories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={reducedMotion ? undefined : { y: -2, scale: 1.01 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="rounded border border-white/25 px-3 py-2 transition hover:border-white hover:bg-white hover:text-ink"
                  >
                    {category.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </Appear>
          <Appear delay={0.34}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <motion.div
                whileHover={reducedMotion ? undefined : { y: -2, scale: 1.01 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Link
                  href="/products"
                  className="rounded bg-teal px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white hover:text-ink"
                >
                  Shop products
                </Link>
              </motion.div>
              <motion.div
                whileHover={reducedMotion ? undefined : { y: -2, scale: 1.01 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Link
                  href="/signup"
                  className="rounded border border-white/45 px-5 py-3 text-center text-sm font-bold text-white transition hover:border-white hover:bg-white hover:text-ink"
                >
                  Create account
                </Link>
              </motion.div>
            </div>
          </Appear>
        </div>
      </div>
    </section>
  );
};
