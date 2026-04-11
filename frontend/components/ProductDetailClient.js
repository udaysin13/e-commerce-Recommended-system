"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createOrder,
  fetchCategorySimilarity,
  fetchProductById,
  fetchRecentlyViewedProducts,
  fetchSimilarProducts,
  fetchUsersAlsoBoughtProducts,
  trackRecommendationView,
} from "../lib/api";
import { getCurrentUserId, isAuthenticated } from "../lib/auth";
import { addCartItem } from "../lib/cart";
import LoadingGrid from "./LoadingGrid";
import ProductImage from "./ProductImage";
import RecommendationSection from "./RecommendationSection";

export default function ProductDetailClient({ productId }) {
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [usersAlsoBought, setUsersAlsoBought] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [missingProduct, setMissingProduct] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        setMissingProduct(false);

        // Fetch product details
        const productResponse = await fetchProductById(productId);
        const productData = productResponse?.product || productResponse?.item || productResponse;
        setProduct(productData || null);

        // Fetch recommendation groups
        try {
          const [similarResponse, alsoBoughtResponse, recentResponse] =
            await Promise.allSettled([
              fetchCategorySimilarity(Number(productId)),
              fetchUsersAlsoBoughtProducts(Number(productId)),
              isAuthenticated()
                ? fetchRecentlyViewedProducts(getCurrentUserId())
                : Promise.resolve({ recommendations: [] }),
            ]);

          const fallbackSimilarResponse = await fetchSimilarProducts(Number(productId));
          const similarItems =
            (similarResponse.status === "fulfilled"
              ? similarResponse.value?.recommendations || similarResponse.value?.items
              : null) ||
            fallbackSimilarResponse?.recommendations ||
            fallbackSimilarResponse?.items ||
            [];
          const alsoBoughtItems =
            alsoBoughtResponse.status === "fulfilled"
              ? alsoBoughtResponse.value?.recommendations || alsoBoughtResponse.value?.items || []
              : [];
          const recentItems =
            recentResponse.status === "fulfilled"
              ? recentResponse.value?.recommendations || recentResponse.value?.items || []
              : [];

          setSimilarProducts(Array.isArray(similarItems) ? similarItems : []);
          setUsersAlsoBought(Array.isArray(alsoBoughtItems) ? alsoBoughtItems : []);
          setRecentlyViewed(Array.isArray(recentItems) ? recentItems : []);
        } catch (err) {
          console.warn("Could not fetch recommendations:", err.message);
          setSimilarProducts([]);
          setUsersAlsoBought([]);
          setRecentlyViewed([]);
        }

        // Track product view (don't block if this fails)
        if (isAuthenticated()) {
          try {
            await trackRecommendationView(getCurrentUserId(), Number(productId));
          } catch (err) {
            console.warn("Could not track view:", err.message);
          }
        }
      } catch (err) {
        setMissingProduct(err?.status === 404);
        setError(err.message || "Unable to load product.");
        setProduct(null);
        setSimilarProducts([]);
        setUsersAlsoBought([]);
        setRecentlyViewed([]);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleOrder() {
    if (!product) return;
    
    try {
      setOrderMessage("");
      setCreatingOrder(true);
      if (!isAuthenticated()) {
        setOrderMessage("Please login before creating an order.");
        return;
      }
      await createOrder(getCurrentUserId());
      setOrderMessage(
        "✓ Order created successfully! Collaborative recommendations will improve after more purchases."
      );
    } catch (err) {
      setOrderMessage("✗ " + (err.message || "Unable to create order. Please try again."));
    } finally {
      setCreatingOrder(false);
    }
  }

  async function handleAddToCart() {
    if (!product) {
      setCartMessage("✗ Product not available.");
      return;
    }

    try {
      setCartMessage("");
      setAddingToCart(true);
      await addCartItem(isAuthenticated() ? getCurrentUserId() : null, product, 1);
      setCartMessage("✓ Added to cart successfully!");
      setTimeout(() => setCartMessage(""), 3000);
    } catch (err) {
      setCartMessage("✗ " + (err.message || "Failed to add to cart. Please try again."));
    } finally {
      setAddingToCart(false);
    }
  }

  const productPrice =
    typeof product?.price === "number" && Number.isFinite(product.price) ? product.price : 0;
  const productImage =
    typeof product?.imageUrl === "string" && product.imageUrl.trim()
      ? product.imageUrl
      : "/product-images/headphones.svg";

  if (loading) {
    return (
      <main className="page-shell py-10">
        <div className="space-y-6">
          <LoadingGrid count={2} />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="page-shell py-12">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-16">
          <p className="mb-3 text-3xl" aria-hidden="true">
            !
          </p>
          <p className="text-xl font-bold text-red-900">{error || "Product not found."}</p>
          <p className="mt-2 text-stone-600">
            {missingProduct
              ? "The product you're looking for doesn't exist or has been removed."
              : "We couldn't load this product right now. Check that the backend server is running and try again."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
          >
            &larr; Back to Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell py-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-all hover:gap-3 hover:text-blue-700"
      >
        &larr; Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-8 text-white shadow-lg sm:p-12">
            <div className="inline-block rounded-full bg-white/20 px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/90">
                {product.category}
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/20 p-1">
              <ProductImage
                src={productImage}
                alt={product.name}
                width={900}
                height={560}
                className="h-72 w-full rounded-[26px] object-cover"
              />
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">{product.name}</h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {product.description ||
                "This page tracks your viewing activity and uses content-based filtering combined with collaborative insights to suggest similar products you might enjoy."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                  Category
                </p>
                <p className="mt-2 text-lg font-bold text-white">{product.category}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Price</p>
                <p className="mt-2 text-lg font-bold text-white">
                  Rs. {productPrice.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-stone-600">Price</p>
              <p className="mt-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-5xl font-bold text-transparent">
                Rs. {productPrice.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="mb-6 space-y-3 border-y border-stone-200 py-6">
              <div className="flex items-start gap-3">
                <span className="mt-1 text-lg" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-slate-900">API Connected</p>
                  <p className="text-xs text-stone-600">Fetching real products from backend</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 text-lg" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Similar Products</p>
                  <p className="text-xs text-stone-600">
                    Recommendations API from backend
                  </p>
                </div>
              </div>
            </div>

            <button
              className="w-full rounded-full bg-blue-600 py-3 text-lg font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleOrder}
              disabled={creatingOrder}
              type="button"
            >
              {creatingOrder ? "Creating..." : "Create Order"}
            </button>

            <button
              className="mt-3 w-full rounded-full border border-slate-200 py-3 text-lg font-bold text-slate-900 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddToCart}
              disabled={addingToCart}
              type="button"
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>

            {orderMessage && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                  orderMessage.includes("successfully")
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {orderMessage.includes("successfully") ? "Success: " : "Error: "}
                {orderMessage}
              </div>
            )}

            {cartMessage ? (
              <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                cartMessage.includes("✓")
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}>
                {cartMessage}
              </div>
            ) : null}

            <p className="mt-6 text-xs text-stone-500">
              Each purchase you make helps improve personalized recommendations for you.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <RecommendationSection
          title="Users Who Bought This Also Bought"
          subtitle="Products frequently purchased with this item."
          products={usersAlsoBought}
        />
      </div>

      <div className="mt-12">
        <RecommendationSection
          title="Category Similarity"
          subtitle="Same-category products with similar-price backup."
          products={similarProducts}
        />
      </div>

      <div className="mt-12">
        <RecommendationSection
          title="Recently Viewed"
          subtitle="Your latest product views help tune recommendations."
          products={recentlyViewed}
        />
      </div>
    </main>
  );
}
