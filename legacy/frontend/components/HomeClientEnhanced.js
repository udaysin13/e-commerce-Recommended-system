"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchCategorySimilarity,
  fetchProducts,
  fetchRecentlyViewedProducts,
  fetchRecommendations,
} from "../lib/api";
import { getCurrentUserId, isAuthenticated } from "../lib/auth";
import { dummyProducts, getRecommendedProducts, getTrendingProducts } from "../lib/dummyData";
import CategoryGrid from "./CategoryGrid";
import FeaturedProducts from "./FeaturedProducts";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";
import LoadingGrid from "./LoadingGrid";
import ProductCard from "./ProductCard";
import TestimonialSection from "./TestimonialSection";

const categories = ["Electronics", "Fashion", "Home", "Beauty"];
const dealChips = ["Mobiles", "Appliances", "Sports", "Books", "Best sellers", "New arrivals"];

export default function HomeClientEnhanced() {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [becauseYouViewed, setBecauseYouViewed] = useState([]);
  const [becauseSource, setBecauseSource] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    setActiveCategory(category);
  }, [category]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        let productData = [];
        let recommendationData = [];
        let becauseData = [];
        let becauseSourceData = null;
        const filteredDummyProducts = dummyProducts.filter((product) => {
          const matchesSearch = search
            ? product.name.toLowerCase().includes(search.toLowerCase()) ||
              product.category.toLowerCase().includes(search.toLowerCase())
            : true;
          const matchesCategory = category ? product.category === category : true;
          return matchesSearch && matchesCategory;
        });

        try {
          const [productResult, recommendationResult] = await Promise.allSettled([
            fetchProducts({ page, limit: 8, search, category }),
            isAuthenticated()
              ? fetchRecommendations(getCurrentUserId())
              : Promise.resolve({ recommendations: getRecommendedProducts(4) }),
          ]);

          productData =
            productResult.status === "fulfilled"
              ? productResult.value?.items || filteredDummyProducts
              : filteredDummyProducts;

          recommendationData =
            recommendationResult.status === "fulfilled"
              ? recommendationResult.value?.recommendations ||
                recommendationResult.value?.items ||
                getRecommendedProducts(4)
              : getRecommendedProducts(4);

          const viewedProduct = await getViewedProduct(productData, filteredDummyProducts);
          if (viewedProduct?.id) {
            try {
              const becauseResponse = await fetchCategorySimilarity(viewedProduct.id, 4);
              becauseData =
                becauseResponse?.recommendations ||
                becauseResponse?.items ||
                [];
              becauseSourceData = viewedProduct;
            } catch (becauseError) {
              console.warn("Because-you-viewed recommendations failed:", becauseError.message);
              becauseData = getFallbackBecauseProducts(viewedProduct);
              becauseSourceData = viewedProduct;
            }
          }
        } catch (apiError) {
          console.warn("API error, using dummy data:", apiError);
          productData = filteredDummyProducts;
          recommendationData = getRecommendedProducts(4);
          const viewedProduct = filteredDummyProducts[0] || dummyProducts[0];
          becauseData = getFallbackBecauseProducts(viewedProduct);
          becauseSourceData = viewedProduct;
        }

        setProducts(productData.length > 0 ? productData : filteredDummyProducts);
        setRecommendations(
          recommendationData.length > 0 ? recommendationData : getRecommendedProducts(4)
        );
        setBecauseYouViewed(
          becauseData.length > 0 ? becauseData : getFallbackBecauseProducts(becauseSourceData)
        );
        setBecauseSource(becauseSourceData);
        setTotalPages(Math.max(1, Math.ceil((productData.length || filteredDummyProducts.length) / 8)));
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Unable to load products.");
        setProducts(dummyProducts.slice(0, 8));
        setRecommendations(getRecommendedProducts(4));
        setBecauseSource(dummyProducts[0]);
        setBecauseYouViewed(getFallbackBecauseProducts(dummyProducts[0]));
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [page, search, category]);

  useEffect(() => {
    setPage(1);
  }, [search, category]);

  function pushFilters({ nextSearch = search, nextCategory = category }) {
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

  function handleCategorySelect(selectedCategory) {
    pushFilters({
      nextSearch: "",
      nextCategory: activeCategory === selectedCategory ? "" : selectedCategory,
    });
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchValue = String(formData.get("search") || "").trim();
    pushFilters({ nextSearch: searchValue, nextCategory: "" });
  }

  const recommendationItems =
    recommendations.length > 0 ? recommendations.slice(0, 4) : getRecommendedProducts(4);
  const becauseItems = becauseYouViewed.slice(0, 4);

  return (
    <main className="bg-slate-100 pb-12">
      <HeroSection />

      <div className="page-shell space-y-5 py-4">
        <CategoryGrid
          categories={categories}
          onCategorySelect={handleCategorySelect}
          activeCategory={activeCategory}
        />

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Marketplace search</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">Find products faster</h2>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex w-full gap-2 lg:max-w-2xl">
              <input
                type="text"
                name="search"
                placeholder="Search for headphones, jackets, lamps..."
                defaultValue={search}
                className="min-w-0 flex-1 rounded border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-500 focus:border-[#2874f0] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded bg-[#2874f0] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1d63d8]"
              >
                Search
              </button>
            </form>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {dealChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => pushFilters({ nextSearch: chip, nextCategory: "" })}
                className="whitespace-nowrap rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-[#2874f0] hover:text-[#2874f0]"
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-semibold">Error loading products</p>
            <p className="mt-1 text-sm">{error}</p>
            <p className="mt-2 text-xs text-red-700">Using demo data to continue shopping.</p>
          </div>
        ) : null}

        <section id="recommended" className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Recommended for you</h2>
              <p className="text-sm text-slate-600">
                Personalized picks from your recommendation engine
              </p>
            </div>
            <span className="hidden rounded bg-green-50 px-3 py-2 text-xs font-bold text-green-700 sm:inline">
              Hybrid recommendations
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendationItems.map((product) => (
              <ProductCard key={`recommended-${product.id}`} product={product} />
            ))}
          </div>
        </section>

        {becauseSource && becauseItems.length > 0 ? (
          <section className="rounded-lg bg-slate-950 p-4 text-white shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-yellow-300">
                  AI recommendation
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  Because you viewed {becauseSource.name}
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-slate-300">
                  We matched category, price range, and recent shopping signals to surface better next picks.
                </p>
              </div>
              <span className="rounded bg-yellow-300 px-3 py-2 text-xs font-black text-slate-950">
                Personalized homepage
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {becauseItems.map((product) => (
                <ProductCard
                  key={`because-${becauseSource.id}-${product.id}`}
                  product={product}
                  caption={product.recommendedBecause || `Similar to ${becauseSource.name}`}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section id="products" className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">All departments</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                {activeCategory
                  ? `${activeCategory} Products`
                  : search
                    ? `Search Results for "${search}"`
                    : "All Products"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{products.length} items available</p>
            </div>
            {search || activeCategory ? (
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded border border-slate-200 px-4 py-2 text-sm font-bold text-[#2874f0] hover:bg-blue-50"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {loading ? (
            <LoadingGrid count={8} />
          ) : products.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setPage(index + 1)}
                        className={`h-10 w-10 rounded text-sm font-bold transition ${
                          page === index + 1
                            ? "bg-[#2874f0] text-white"
                            : "border border-slate-200 hover:border-[#2874f0]"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="rounded border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-lg font-semibold text-slate-900">No products found</p>
              <p className="mt-1 text-slate-600">Try adjusting your filters or search terms</p>
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <FeaturedProducts
            products={getTrendingProducts(8)}
            title="Trending Now"
            subtitle="Most popular this week"
          />
        </section>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <FeaturesSection />
        </section>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <TestimonialSection />
        </section>
      </div>
    </main>
  );
}

async function getViewedProduct(productData, fallbackProducts) {
  if (isAuthenticated()) {
    try {
      const recentResponse = await fetchRecentlyViewedProducts(getCurrentUserId(), 1);
      const [recentProduct] =
        recentResponse?.recommendations ||
        recentResponse?.items ||
        [];

      if (recentProduct) {
        return recentProduct;
      }
    } catch (error) {
      console.warn("Recently viewed lookup failed:", error.message);
    }
  }

  return productData[0] || fallbackProducts[0] || dummyProducts[0];
}

function getFallbackBecauseProducts(sourceProduct) {
  if (!sourceProduct) {
    return getRecommendedProducts(4);
  }

  const sameCategory = dummyProducts.filter(
    (product) => product.category === sourceProduct.category && product.id !== sourceProduct.id
  );

  return (sameCategory.length > 0 ? sameCategory : getRecommendedProducts(4)).slice(0, 4);
}
