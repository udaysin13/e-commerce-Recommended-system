"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Appliances",
  "Sports",
  "Books",
];

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeCategory = searchParams.get("category") || "All";

  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const value = searchValue.trim();
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      params.delete("category");
      router.push(params.toString() ? `/?${params.toString()}#products` : "/#products");
      setIsMobileMenuOpen(false);
    },
    [searchValue, searchParams, router]
  );

  const handleCategoryClick = useCallback(
    (category) => {
      const params = new URLSearchParams(searchParams.toString());

      if (category === "All") {
        params.delete("category");
      } else {
        params.set("category", category);
      }

      params.delete("search");
      router.push(params.toString() ? `/?${params.toString()}#products` : "/#products");
      setIsMobileMenuOpen(false);
    },
    [searchParams, router]
  );

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <nav className="bg-[#2874f0] text-white">
        <div className="page-shell flex flex-col gap-3 py-3 lg:flex-row lg:items-center">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-yellow-400 text-lg font-black text-slate-950">
                S
              </div>
              <div>
                <p className="text-lg font-black leading-none">ShopWise</p>
                <p className="text-xs font-semibold text-blue-100">Explore plus deals</p>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              className="rounded border border-white/30 px-3 py-2 text-sm font-bold lg:hidden"
              type="button"
            >
              Menu
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex min-w-0 flex-1 overflow-hidden rounded bg-white">
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-950 outline-none"
              type="text"
              placeholder="Search for products, brands and more"
            />
            <button
              type="submit"
              className="bg-yellow-400 px-5 text-sm font-black text-slate-950 transition hover:bg-yellow-300"
            >
              Search
            </button>
          </form>

          <div className="hidden items-center gap-3 text-sm font-bold lg:flex">
            <Link href="/login" className="rounded bg-white px-4 py-2 text-[#2874f0]">
              Login
            </Link>
            <Link href="/cart" className="rounded border border-white/30 px-4 py-2 hover:bg-white/10">
              Cart
            </Link>
          </div>
        </div>
      </nav>

      <div className="border-b border-slate-200 bg-white">
        <div className="page-shell">
          <div
            className={`${
              isMobileMenuOpen ? "grid" : "hidden"
            } gap-2 py-3 lg:flex lg:items-center lg:gap-2`}
          >
            <Link href="/login" className="rounded border border-slate-200 px-3 py-2 text-sm font-bold lg:hidden">
              Login
            </Link>
            <Link href="/cart" className="rounded border border-slate-200 px-3 py-2 text-sm font-bold lg:hidden">
              Cart
            </Link>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                type="button"
                className={`rounded px-3 py-2 text-left text-sm font-bold transition ${
                  activeCategory === category
                    ? "bg-blue-50 text-[#2874f0]"
                    : "text-slate-700 hover:bg-blue-50 hover:text-[#2874f0]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
