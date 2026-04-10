"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProducts, fetchRecommendations } from "../lib/api";
import LoadingGrid from "./LoadingGrid";
import ProductCard from "./ProductCard";
import RecommendationSection from "./RecommendationSection";

const demoUserId = 1;

export default function HomeClient() {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [productResult, recommendationResult] = await Promise.allSettled([
          fetchProducts({ page, limit: 8, search, category }),
          fetchRecommendations(demoUserId),
        ]);

        if (productResult.status !== "fulfilled") {
          throw productResult.reason;
        }

        const productResponse = productResult.value || {};
        const recommendationResponse =
          recommendationResult.status === "fulfilled" ? recommendationResult.value : {};

        setProducts(Array.isArray(productResponse.items) ? productResponse.items : []);
        setTotalPages(
          Number.isFinite(productResponse.totalPages) && productResponse.totalPages > 0
            ? productResponse.totalPages
            : 1
        );
        setRecommendations(
          Array.isArray(recommendationResponse.items) ? recommendationResponse.items : []
        );
      } catch (err) {
        setError(err.message || "Unable to load products.");
        setProducts([]);
        setTotalPages(1);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [page, search, category]);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  const categoryCards = [
    { label: "Electronics", value: "Electronics" },
    { label: "Fashion", value: "Fashion" },
    { label: "Home & Kitchen", value: "Home" },
    { label: "Beauty", value: "Beauty" },
  ];

  const trendingTags = [
    { label: "Mobiles", searchValue: "mobile" },
    { label: "Laptops", searchValue: "laptop" },
    { label: "Smart Home", searchValue: "smart" },
    { label: "Men's Fashion", categoryValue: "Fashion" },
    { label: "Women's Fashion", categoryValue: "Fashion" },
  ];

  function updateFilters({ nextSearch = search, nextCategory = category }) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextSearch) {
      params.set("search", nextSearch);
    } else {
      params.delete("search");
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    router.push(params.toString() ? `/?${params.toString()}` : "/");
  }

  return (
    <main className="pb-16">
      <section className="page-shell pt-8 sm:pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-8">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-sm sm:p-10">
            <div className="inline-flex items-center gap-3 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-700"></span>
              Flipkart-style storefront
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Discover the best deals on every category.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Browse personalized recommendations, explore top categories, and shop from our curated
              selection of products with special deals and fast checkout.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Top offers", value: "300+" },
                { label: "Trusted brands", value: "120" },
                { label: "Fast delivery", value: "2-day" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {categoryCards.map((categoryCard) => (
                <button
                  key={categoryCard.label}
                  onClick={() =>
                    updateFilters({
                      nextCategory:
                        category === categoryCard.value ? "" : categoryCard.value,
                    })
                  }
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:shadow-sm"
                >
                  {categoryCard.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-blue-900 p-8 text-white shadow-xl sm:p-10">
            <p className="text-sm uppercase tracking-[0.35em] text-blue-200">Daily Flash Deal</p>
            <h2 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              Fresh arrivals, best prices
            </h2>
            <p className="mt-4 text-sm leading-7 text-blue-100/90">
              Get fast recommendations based on your browsing and discover trending products in the
              marketplace.
            </p>
            <div className="mt-8 grid gap-4 rounded-3xl bg-blue-800/90 p-6 shadow-inner sm:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-blue-200">Today&apos;s Pick</p>
                <p className="mt-3 text-xl font-semibold text-white">Smartphone Mega Sale</p>
                <p className="mt-3 text-sm text-blue-100/80">
                  Explore popular devices with exclusive discounts and fast shipping.
                </p>
              </div>
              <div className="rounded-3xl bg-blue-700 p-5 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-blue-200">Save</p>
                <p className="mt-3 text-4xl font-bold">35%</p>
                <p className="mt-2 text-sm text-blue-100/80">on selected brands</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Best sellers</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Trending products</h2>
            </div>
            <p className="text-sm font-medium text-blue-600">Limited time offers</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {trendingTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() =>
                  updateFilters({
                    nextSearch: tag.searchValue || "",
                    nextCategory: tag.categoryValue || "",
                  })
                }
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </section>
      </section>

      <section className="page-shell mt-12">
        <RecommendationSection
          title="Recommended For You"
          subtitle="These products are personalized based on hybrid recommendations combining content-based filtering and collaborative insights from your viewing history."
          products={recommendations}
        />
      </section>

      <section className="page-shell mt-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-700">
                Catalog
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Featured Products
            </h2>
            {(search || category) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                {search ? (
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                    Search: {search}
                  </span>
                ) : null}
                {category ? (
                  <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700">
                    Category: {category}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => updateFilters({ nextSearch: "", nextCategory: "" })}
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-stone-600">
              Page <span className="text-blue-600">{page}</span> of{" "}
              <span className="text-blue-600">{totalPages}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5">
            <span className="text-2xl" aria-hidden="true">
              !
            </span>
            <div>
              <p className="font-semibold text-red-900">Error Loading Products</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          {loading ? (
            <LoadingGrid count={8} />
          ) : products.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50 py-12">
              <p className="text-lg font-semibold text-stone-600">No products found</p>
              <p className="mt-2 text-sm text-stone-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 sm:justify-between">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-3 font-semibold text-slate-900 transition-all hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            <span aria-hidden="true">&larr;</span>
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="hidden text-sm text-stone-600 sm:block">
            Showing page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            type="button"
          >
            <span className="hidden sm:inline">Next</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </section>
    </main>
  );
}
