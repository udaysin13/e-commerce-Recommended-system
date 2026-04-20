"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getShoppingInsights } from "@/lib/recommendationsApi";
import type { UserShoppingInsights } from "@/types/recommendation";

export const ShoppingInsightsDashboard = () => {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAuth();
  const [insights, setInsights] = useState<UserShoppingInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    let active = true;

    const loadInsights = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const nextInsights = await getShoppingInsights(token);

      if (!active) return;

      if (!nextInsights) {
        setError("We could not build your shopping profile yet.");
      } else {
        setInsights(nextInsights);
      }

      setLoading(false);
    };

    void loadInsights();

    return () => {
      active = false;
    };
  }, [token]);

  if (loading || isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="h-12 w-64 animate-pulse rounded bg-line" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded border border-line bg-white" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !insights) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-bold text-red-900">Shopping Dashboard</h1>
          <p className="mt-2 text-sm text-red-700">{error ?? "No insight data available yet."}</p>
          <Link
            href="/products"
            className="mt-4 inline-flex rounded bg-red-600 px-4 py-2 text-sm font-bold text-white"
          >
            Explore products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-coral">Personal Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">{insights.shopperProfile}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{insights.profileReason}</p>
        </div>
        <div className="rounded border border-line bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase text-ink/45">Recommended modes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {insights.recommendationModes.map((mode) => (
              <span key={mode} className="rounded bg-teal/8 px-3 py-2 text-xs font-bold text-teal">
                {mode.replace(/^\w/, (letter) => letter.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insights.highlightMetrics.map((metric) => (
          <article key={metric.label} className="rounded border border-line bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-ink/45">{metric.label}</p>
            <p className="mt-3 text-xl font-bold text-ink">{metric.value}</p>
            <p className="mt-2 text-sm leading-6 text-ink/60">{metric.note}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr,0.9fr]">
        <div className="rounded border border-line bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-teal">Profile Snapshot</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded bg-mist/70 p-4">
              <p className="text-xs font-semibold uppercase text-ink/45">Most viewed category</p>
              <p className="mt-2 text-lg font-bold text-ink">{insights.mostViewedCategory}</p>
            </div>
            <div className="rounded bg-mist/70 p-4">
              <p className="text-xs font-semibold uppercase text-ink/45">Most purchased category</p>
              <p className="mt-2 text-lg font-bold text-ink">{insights.mostPurchasedCategory}</p>
            </div>
            <div className="rounded bg-mist/70 p-4">
              <p className="text-xs font-semibold uppercase text-ink/45">Favorite brand</p>
              <p className="mt-2 text-lg font-bold text-ink">{insights.favoriteBrand}</p>
            </div>
            <div className="rounded bg-mist/70 p-4">
              <p className="text-xs font-semibold uppercase text-ink/45">Typical spend</p>
              <p className="mt-2 text-lg font-bold text-ink">{insights.spendingRangeLabel}</p>
            </div>
          </div>
        </div>

        <div className="rounded border border-line bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-teal">Use This Profile</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-ink/65">
            <p>Switch to Personalized Mode on the storefront when you want sharper category and price matching.</p>
            <p>Use Explore Mode when you want more diverse discovery outside your usual pattern.</p>
            <p>Try the mood toggles to shift ranking toward value, freshness, premium items, or crowd momentum.</p>
          </div>
          <Link
            href="/products"
            className="mt-5 inline-flex rounded bg-teal px-4 py-2 text-sm font-bold text-white transition hover:bg-ink"
          >
            Go to products
          </Link>
        </div>
      </div>
    </section>
  );
};
