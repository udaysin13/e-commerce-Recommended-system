"use client";

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [productResponse, recommendationResponse] = await Promise.all([
          fetchProducts({ page, limit: 8, search }),
          fetchRecommendations(demoUserId),
        ]);

        setProducts(productResponse.items);
        setTotalPages(productResponse.totalPages);
        setRecommendations(recommendationResponse.items);
      } catch (err) {
        setError(err.message || "Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [page, search]);

  return (
    <main className="pb-16">
      <section className="page-shell pt-8">
        <div className="panel px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-stone-500">Full-Stack Commerce</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-slate-900 sm:text-6xl">
            Build shopping discovery around real hybrid recommendations.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">
            This frontend talks to the Express backend on port 5000, renders product cards, and shows both
            personalized and similar products using clean mobile-first UI.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              className="input md:max-w-md"
              placeholder="Search by name or category"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
            <button className="button-secondary" type="button">
              Backend: localhost:5000
            </button>
          </div>
        </div>
      </section>

      <section className="page-shell mt-10">
        <RecommendationSection
          title="Recommended For You"
          subtitle="This section comes from the hybrid recommendation engine that combines content-based and collaborative filtering."
          products={recommendations}
        />

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">Home</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Product Listing</h2>
          </div>
          <p className="text-sm text-stone-600">
            Page {page} of {totalPages}
          </p>
        </div>

        {error ? (
          <div className="panel mt-6 px-5 py-4 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <LoadingGrid count={8} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            className="button-secondary disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            Previous
          </button>
          <button
            className="button-primary disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
