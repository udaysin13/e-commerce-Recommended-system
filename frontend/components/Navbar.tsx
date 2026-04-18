"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { storefrontCategories } from "@/lib/categories";
import { getInitials } from "@/lib/auth";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
];

export const Navbar = () => {
  const { user, isAuthenticated, isLoading, displayName, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded bg-ink text-sm font-bold text-white">
            RC
          </span>
          <div className="min-w-0">
            <span className="block text-lg font-bold text-ink">RecomCart</span>
            {isAuthenticated && user ? (
              <span className="block text-xs font-semibold text-teal">Account active</span>
            ) : null}
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink/75 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-teal">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="hidden h-11 w-48 animate-pulse rounded border border-line bg-mist sm:block" />
          ) : isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-3 rounded border border-line bg-white px-3 py-2 text-left transition hover:border-teal"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-teal text-sm font-bold text-white">
                  {getInitials(user)}
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-sm font-bold text-ink">
                    {displayName}
                  </span>
                  <span className="block truncate text-xs text-ink/60">
                    Logged in as {user.email}
                  </span>
                </span>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-64 rounded border border-line bg-white p-2 shadow-lg">
                  <div className="rounded bg-mist px-3 py-3">
                    <p className="text-sm font-bold text-ink">Welcome back, {displayName}</p>
                    <p className="mt-1 text-xs font-semibold text-teal">Account active</p>
                    <p className="mt-2 text-xs text-ink/65">{user.email}</p>
                  </div>
                  <div className="mt-2 grid gap-1 text-sm font-semibold text-ink">
                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="rounded px-3 py-2 transition hover:bg-mist hover:text-teal"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setMenuOpen(false)}
                      className="rounded px-3 py-2 transition hover:bg-mist hover:text-teal"
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="rounded px-3 py-2 text-left transition hover:bg-red-50 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-teal hover:text-teal sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="mx-auto hidden max-w-7xl items-center gap-3 overflow-x-auto border-t border-line px-4 py-3 text-sm font-semibold text-ink/75 sm:px-6 lg:flex">
        {storefrontCategories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="shrink-0 rounded border border-transparent px-2 py-1 transition hover:border-line hover:text-teal"
          >
            {category.name}
          </Link>
        ))}
      </nav>
      <nav className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto border-t border-line px-4 py-3 text-sm font-semibold text-ink/75 sm:px-6 md:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 transition hover:text-teal">
            {item.label}
          </Link>
        ))}
        {storefrontCategories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="shrink-0 transition hover:text-teal"
          >
            {category.name}
          </Link>
        ))}
        {!isLoading && !isAuthenticated ? (
          <Link href="/login" className="shrink-0 transition hover:text-teal">
            Log in
          </Link>
        ) : null}
      </nav>
    </header>
  );
};
