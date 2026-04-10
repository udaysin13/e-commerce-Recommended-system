"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  function handleSearchSubmit(event) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (searchValue.trim()) {
      params.set("search", searchValue.trim());
    } else {
      params.delete("search");
    }

    params.delete("category");
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  }

  function handleCategoryClick(category) {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "All") {
      params.delete("category");
    } else if (category === "Home") {
      params.set("category", "Home");
    } else {
      params.set("category", category);
    }

    router.push(params.toString() ? `/?${params.toString()}` : "/");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-blue-600 text-white shadow-sm">
      <div className="page-shell flex flex-col gap-3 px-3 py-3 sm:px-0 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="flex h-11 w-11 items-center justify-center rounded bg-yellow-300 text-xl font-black text-slate-900">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-none">ShopWise</span>
              <span className="text-xs uppercase tracking-[0.25em] text-slate-100/90">
                Deals & Recommendations
              </span>
            </div>
          </Link>

          <div className="hidden flex-1 lg:flex">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex w-full items-center rounded-md bg-white text-slate-900 shadow-sm"
            >
              <span className="absolute left-4 text-slate-500">Search</span>
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="w-full rounded-l-md border-0 bg-white px-20 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-400"
                type="text"
                placeholder="Search for products, brands and more"
              />
              <button
                type="submit"
                className="rounded-r-md bg-yellow-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-yellow-400"
              >
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-white">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-2 rounded-md bg-slate-500/10 px-3 py-2 transition hover:bg-slate-500/20"
            >
              <span>Account</span>
              Login
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded-md bg-slate-500/10 px-3 py-2 transition hover:bg-slate-500/20"
            >
              <span>Cart</span>
              Cart
            </Link>
          </div>
        </div>

        <div className="hidden sm:flex flex-wrap items-center gap-2 border-t border-blue-500/40 pt-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
          {[
            "All",
            "Electronics",
            "Mobiles",
            "Fashion",
            "Home",
            "Beauty",
            "Appliances",
            "Toys",
            "Grocery",
          ].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleCategoryClick(item)}
              className="rounded-full bg-blue-500 px-3 py-1 transition hover:bg-blue-500/90"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
