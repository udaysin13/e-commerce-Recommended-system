"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import {
  ChevronDown,
  Clock3,
  Heart,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

type SuggestionGroups = {
  recent: string[]
  recommended: string[]
  trending: string[]
}

type StorefrontNavbarProps = {
  currentUser: { name: string; email: string } | null
  cartCount: number
  wishlistCount: number
  query: string
  categories: string[]
  selectedCategory: string
  suggestions?: SuggestionGroups
  isSearchLoading?: boolean
  onQueryChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSearchSubmit?: (value: string) => void
  onOpenAuth: () => void
}

const navItems = [
  { href: "#for-you", label: "For You" },
  { href: "#trending-products", label: "Trending" },
  { href: "#based-on-your-interest", label: "Interests" },
  { href: "#top-picks-today", label: "Top Picks" },
  { href: "#signals-lab", label: "Signals" },
  { href: "#how-it-works", label: "How It Works" },
]

export function StorefrontNavbar({
  currentUser,
  cartCount,
  wishlistCount,
  query,
  categories,
  selectedCategory,
  suggestions,
  isSearchLoading = false,
  onQueryChange,
  onCategoryChange,
  onSearchSubmit,
  onOpenAuth,
}: StorefrontNavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false)

  const suggestionGroups = useMemo(() => {
    if (!suggestions) return []

    return [
      { id: "recent", title: "Recent", icon: Clock3, items: suggestions.recent },
      { id: "recommended", title: "For you", icon: Sparkles, items: suggestions.recommended },
      { id: "trending", title: "Trending", icon: Search, items: suggestions.trending },
    ].filter((group) => group.items.length > 0)
  }, [suggestions])

  const showSuggestions = searchFocused && suggestionGroups.length > 0

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-2xl">
      <div className="page-shell">
        <div className="flex min-h-12 items-center justify-between gap-4 border-b border-white/8 text-[11px] text-slate-400">
          <p className="truncate">
            AI recommendations react to searches, clicks, wishlist saves, and cart behavior.
          </p>
          <div className="hidden items-center gap-5 md:flex">
            <span>Personalization active</span>
            <span>Fast delivery eligible</span>
          </div>
        </div>

        <div className="grid gap-4 py-4 xl:grid-cols-[220px_minmax(0,1fr)_auto] xl:items-center">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/15 text-indigo-200"
            >
              <ShoppingBag className="h-5 w-5" />
            </motion.div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                FluxCart AI
              </p>
              <p className="text-xl font-semibold tracking-tight text-white">Smart Recommendations</p>
            </div>
          </Link>

          <div className="space-y-3">
            <nav className="hidden items-center gap-6 text-sm text-slate-400 lg:flex">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="transition duration-200 hover:text-white">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)]">
              <label className="relative">
                <select
                  value={selectedCategory}
                  onChange={(event) => onCategoryChange(event.target.value)}
                  className="market-input h-12 w-full appearance-none pr-10"
                  aria-label="Browse by category"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => {
                    window.setTimeout(() => setSearchFocused(false), 120)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      onSearchSubmit?.(query)
                    }
                  }}
                  placeholder="Search products, styles, categories, or intent"
                  className="market-input h-12 pl-10"
                  aria-label="Search recommended products"
                />

                {showSuggestions ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-x-0 top-[calc(100%+0.6rem)] rounded-[1.25rem] border border-white/10 bg-slate-950/96 p-4 shadow-[0_20px_45px_rgba(2,6,23,0.45)]"
                  >
                    <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                      <span>Search intelligence</span>
                      {isSearchLoading ? <span>Updating...</span> : null}
                    </div>

                    <div className="space-y-3">
                      {suggestionGroups.map((group) => (
                        <div key={group.id}>
                          <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                            {group.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {group.items.map((item) => (
                              <button
                                key={`${group.id}-${item}`}
                                type="button"
                                onMouseDown={(event) => {
                                  event.preventDefault()
                                  onQueryChange(item)
                                  onSearchSubmit?.(item)
                                  setSearchFocused(false)
                                }}
                                className="market-button-secondary px-3 py-2 text-xs"
                              >
                                <group.icon className="h-3.5 w-3.5" />
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Link href="/wishlist" className="market-button-secondary relative px-4 py-2.5">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-semibold text-white">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link href="/cart" className="market-button-secondary relative px-4 py-2.5">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-slate-950">
                  {cartCount}
                </span>
              ) : null}
            </Link>
            {currentUser ? (
              <Link href="/profile" className="market-button-secondary px-4 py-2.5">
                <UserRound className="h-4 w-4" />
                {currentUser.name.split(" ")[0]}
              </Link>
            ) : (
              <Button className="market-button-primary h-11 px-5" onClick={onOpenAuth}>
                <UserRound className="h-4 w-4" />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
