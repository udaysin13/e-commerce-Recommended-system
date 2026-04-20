"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ProductGrid } from "@/components/ProductGrid";
import { useAuth } from "@/components/AuthProvider";
import {
  getProductRecommendations,
  getSessionHomeRecommendations,
  recommendedProductsToProducts,
} from "@/lib/recommendationsApi";
import type {
  RecommendationExperience,
  RecommendationMood,
  RecommendationResult,
} from "@/types/recommendation";

const moodOptions: Array<{ value: RecommendationMood; label: string }> = [
  { value: "budget", label: "Budget Friendly" },
  { value: "premium", label: "Premium Picks" },
  { value: "trending", label: "Trending Now" },
  { value: "value", label: "Best Value" },
  { value: "new", label: "New Arrivals" },
];

const experienceOptions: Array<{ value: RecommendationExperience; label: string }> = [
  { value: "personalized", label: "Personalized" },
  { value: "explore", label: "Explore" },
];

type RecommendationLabProps = {
  kind: "home" | "product";
  productId?: string;
  initialRecommendations?: RecommendationResult | null;
  title: string;
  eyebrow: string;
  description: string;
};

export const RecommendationLab = ({
  kind,
  productId,
  initialRecommendations = null,
  title,
  eyebrow,
  description,
}: RecommendationLabProps) => {
  const { token, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<RecommendationMood>("trending");
  const [experience, setExperience] = useState<RecommendationExperience>("personalized");
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(
    initialRecommendations,
  );
  const [isLoading, setIsLoading] = useState(!initialRecommendations);

  useEffect(() => {
    if (!isAuthenticated && experience === "personalized") {
      setExperience("explore");
    }
  }, [experience, isAuthenticated]);

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      setIsLoading(true);

      const nextRecommendations =
        kind === "product" && productId
          ? await getProductRecommendations(productId, 4, mode, experience, token)
          : await getSessionHomeRecommendations({
              limit: 4,
              mode,
              experience,
              token,
              noStore: true,
            });

      if (active) {
        setRecommendations(nextRecommendations);
        setIsLoading(false);
      }
    };

    void loadRecommendations();

    return () => {
      active = false;
    };
  }, [experience, kind, mode, productId, token]);

  const products = useMemo(
    () => recommendedProductsToProducts(recommendations),
    [recommendations],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-coral">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{description}</p>
        </div>
        <div className="rounded border border-line bg-white p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase text-ink/45">Recommendation mode</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={`rounded px-3 py-2 text-xs font-bold transition ${
                  mode === option.value
                    ? "bg-teal text-white"
                    : "bg-mist text-ink hover:bg-teal/10 hover:text-teal"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {experienceOptions.map((option) => {
              const disabled = option.value === "personalized" && !isAuthenticated;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => !disabled && setExperience(option.value)}
                  className={`rounded border px-3 py-2 text-xs font-bold transition ${
                    experience === option.value
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-ink hover:border-teal hover:text-teal"
                  } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {recommendations ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded border border-line bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-ink">
                {recommendations.experience === "explore"
                  ? "Explore Mode is widening category coverage."
                  : "Personalized Mode is leaning on your activity signals."}
              </p>
              <p className="text-sm text-ink/60">
                Strategy: {recommendations.strategy.replaceAll("_", " ")}
              </p>
            </div>
            <p className="text-sm font-semibold text-teal">
              {recommendations.count} tailored picks
            </p>
          </div>
        </motion.div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded border border-line bg-white" />
          ))}
        </div>
      ) : (
        <ProductGrid products={products} animationKey={`${kind}:${mode}:${experience}`} />
      )}
    </section>
  );
};
