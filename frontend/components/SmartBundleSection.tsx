"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import {
  getSmartBundleRecommendations,
  recommendedProductsToProducts,
} from "@/lib/recommendationsApi";
import type { SmartBundleResult } from "@/types/recommendation";

export const SmartBundleSection = ({ productId }: { productId: string }) => {
  const [bundle, setBundle] = useState<SmartBundleResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadBundle = async () => {
      setIsLoading(true);
      const nextBundle = await getSmartBundleRecommendations(productId, 3);

      if (active) {
        setBundle(nextBundle);
        setIsLoading(false);
      }
    };

    void loadBundle();

    return () => {
      active = false;
    };
  }, [productId]);

  const products = useMemo(
    () =>
      recommendedProductsToProducts(
        bundle
          ? {
              strategy: "smart_bundle",
              source: "local",
              mode: "value",
              experience: "explore",
              count: bundle.items.length,
              items: bundle.items,
            }
          : null,
      ),
    [bundle],
  );

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-teal">Smart Bundle</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">
            {bundle?.title ?? "Frequently Bought Together"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">
            {bundle?.description ?? "Complementary picks chosen to make the main product more useful."}
          </p>
        </div>
        {bundle ? (
          <div className="rounded border border-line bg-white px-4 py-3 text-sm shadow-sm">
            <p className="font-semibold text-ink">Bundle total</p>
            <p className="mt-1 text-xl font-bold text-teal">${bundle.totalBundlePrice.toFixed(2)}</p>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded border border-line bg-white" />
          ))}
        </div>
      ) : (
        <ProductGrid products={products} animationKey={`bundle:${productId}`} />
      )}
    </section>
  );
};
