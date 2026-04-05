"use client"

import { type FormEvent, useCallback } from "react"
import { useEffect, useMemo, useState } from "react"
import { Filter, SlidersHorizontal, Star, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { ProductCard } from "@/src/components/storefront/product-card"
import { StorefrontFooter } from "@/src/components/storefront/storefront-footer"
import { StorefrontNavbar } from "@/src/components/storefront/storefront-navbar"
import type { CatalogProduct } from "@/src/shared/catalog-types"
import { pushRecentView } from "@/src/shared/personalization-storage"
import { toast } from "sonner"

type SessionUser = {
  id: string
  name: string
  email: string
}

type ProductsApiResponse = {
  items: CatalogProduct[]
  total: number
  categories: string[]
  page: number
  limit: number
  totalPages: number
}

type CartItem = CatalogProduct & { quantity: number }

type RecommendationItem = CatalogProduct & {
  score: number
  source: string
  reason: string
}

type RecommendationResponse = {
  items: RecommendationItem[]
  insights: {
    views: number
    purchases: number
    topCategory: string
  }
}

const sortOptions = ["Newest", "Price low-high", "Price high-low", "Category"] as const
const priceBands = [
  { label: "Under Rs. 700", max: 700 },
  { label: "Under Rs. 1,200", max: 1200 },
  { label: "Under Rs. 2,000", max: 2000 },
]

function ListingSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <div className="aspect-[4/5] market-skeleton" />
      <div className="space-y-4 p-4">
        <div className="market-skeleton h-3 w-24" />
        <div className="market-skeleton h-5 w-4/5" />
        <div className="market-skeleton h-4 w-2/3" />
        <div className="market-skeleton h-11 w-full" />
      </div>
    </div>
  )
}

export default function ProductsListingPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [categories, setCategories] = useState<string[]>(["All"])
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("Newest")
  const [wishlist, setWishlist] = useState<string[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [productsError, setProductsError] = useState("")
  const [priceLimit, setPriceLimit] = useState<number | null>(null)
  const [minimumRating, setMinimumRating] = useState(0)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [recommendedItems, setRecommendedItems] = useState<RecommendationItem[]>([])
  const [recommendationInsights, setRecommendationInsights] = useState<RecommendationResponse["insights"] | null>(null)
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [authName, setAuthName] = useState("")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)

  useEffect(() => {
    void (async () => {
      setIsLoading(true)
      setProductsError("")

      try {
        const params = new URLSearchParams({
          q: query,
          category: selectedCategory,
          sort: sortBy,
          page: String(currentPage),
          limit: "8",
        })

        if (priceLimit !== null) {
          params.set("maxPrice", String(priceLimit))
        }

        const response = await fetch(`/api/products?${params.toString()}`)
        const payload = (await response.json()) as ProductsApiResponse & { error?: string }

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load products.")
        }

        setProducts(payload.items)
        setCategories(["All", ...payload.categories])
        setCurrentPage(payload.page)
        setTotalPages(payload.totalPages)
        setTotalProducts(payload.total)
      } catch (error) {
        setProducts([])
        setProductsError(error instanceof Error ? error.message : "Unable to load products.")
      }

      setIsLoading(false)
    })()
  }, [currentPage, priceLimit, query, selectedCategory, sortBy])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, selectedCategory, sortBy, priceLimit])

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (!response.ok) return
      const payload = (await response.json()) as { user?: SessionUser | null }
      setCurrentUser(payload.user ?? null)
    } catch {
      setCurrentUser(null)
    }
  }, [])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  useEffect(() => {
    if (!currentUser?.id) {
      setRecommendedItems([])
      setRecommendationInsights(null)
      return
    }

    void (async () => {
      setIsRecommendationsLoading(true)
      try {
        const response = await fetch(`/api/recommendations/${encodeURIComponent(currentUser.id)}?limit=4`)
        const payload = (await response.json()) as RecommendationResponse & { error?: string }
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load recommendations.")
        }

        setRecommendedItems(payload.items)
        setRecommendationInsights(payload.insights)
      } catch {
        setRecommendedItems([])
        setRecommendationInsights(null)
      } finally {
        setIsRecommendationsLoading(false)
      }
    })()
  }, [currentUser?.id])

  useEffect(() => {
    if (typeof window === "undefined") return
    const rawCart = window.localStorage.getItem("fluxcart-demo-cart")
    const rawWishlist = window.localStorage.getItem("fluxcart-demo-wishlist")
    if (rawCart) {
      try {
        setCartItems(JSON.parse(rawCart) as CartItem[])
      } catch {
        setCartItems([])
      }
    }
    if (rawWishlist) {
      try {
        setWishlist(JSON.parse(rawWishlist) as string[])
      } catch {
        setWishlist([])
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("fluxcart-demo-cart", JSON.stringify(cartItems))
    window.localStorage.setItem("fluxcart-demo-wishlist", JSON.stringify(wishlist))
  }, [cartItems, wishlist])

  const filteredProducts = useMemo(() => {
    return products.filter((product, index) => {
      const derivedRating = product.ratingAvg ?? Number((4.2 + (index % 6) * 0.1).toFixed(1))
      if (priceLimit !== null && product.price > priceLimit) return false
      if (minimumRating > 0 && derivedRating < minimumRating) return false
      if (inStockOnly && (product.inStock ?? 10) <= 0) return false
      return true
    })
  }, [products, priceLimit, minimumRating, inStockOnly])

  const activeFilters = [
    selectedCategory !== "All" ? selectedCategory : null,
    priceLimit !== null ? `Under Rs. ${priceLimit.toLocaleString("en-IN")}` : null,
    minimumRating > 0 ? `${minimumRating}+ rating` : null,
    inStockOnly ? "In stock" : null,
  ].filter(Boolean) as string[]

  const handleAddToCart = (product: CatalogProduct) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { ...product, quantity: 1 }]
    })
  }

  const handleWishlistToggle = (productId: string) => {
    setWishlist((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    )
  }

  const handleViewProduct = (productId: string) => {
    pushRecentView(productId)
  }

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError("")
    setIsSubmittingAuth(true)

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup"
      const payload =
        authMode === "login"
          ? { email: authEmail.trim().toLowerCase(), password: authPassword }
          : { name: authName.trim(), email: authEmail.trim().toLowerCase(), password: authPassword }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await response.json()) as { error?: string; user?: SessionUser }

      if (!response.ok || !data.user) {
        throw new Error(data.error ?? "Authentication failed.")
      }

      setCurrentUser(data.user)
      setAuthOpen(false)
      setAuthPassword("")
      toast.success(`Welcome back, ${data.user.name}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed."
      setAuthError(message)
      toast.error(message)
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  const filterPanel = (
    <div className="surface-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Filters</p>
          <h2 className="mt-2 text-lg font-medium text-foreground">Refine the listing</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setPriceLimit(null)
            setMinimumRating(0)
            setInStockOnly(false)
            setSelectedCategory("All")
            setQuery("")
          }}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-foreground">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products"
            className="market-input h-11 w-full"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-foreground">Category</span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="market-input h-11 w-full appearance-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-3 block text-sm font-medium text-foreground">Price range</span>
          <div className="space-y-2">
            {priceBands.map((band) => (
              <button
                key={band.label}
                type="button"
                onClick={() => setPriceLimit((current) => (current === band.max ? null : band.max))}
                className={`flex w-full items-center justify-between rounded-full border px-4 py-3 text-sm transition ${
                  priceLimit === band.max
                    ? "border-primary/20 bg-[rgba(34,49,39,0.06)] text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{band.label}</span>
                {priceLimit === band.max ? <X className="h-4 w-4" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-3 block text-sm font-medium text-foreground">Minimum rating</span>
          <div className="grid grid-cols-3 gap-2">
            {[4, 4.5, 4.8].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setMinimumRating((current) => (current === rating ? 0 : rating))}
                className={`rounded-full border px-3 py-3 text-sm font-medium transition ${
                  minimumRating === rating
                    ? "border-primary/20 bg-[rgba(34,49,39,0.06)] text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  {rating}+
                </span>
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between rounded-[0.95rem] border border-border bg-card px-4 py-3 text-sm text-foreground">
          <span>In stock only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
            className="h-4 w-4 rounded border-border bg-transparent"
          />
        </label>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <StorefrontNavbar
        currentUser={currentUser}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        query={query}
        categories={categories}
        selectedCategory={selectedCategory}
        onQueryChange={setQuery}
        onCategoryChange={setSelectedCategory}
        onOpenAuth={() => {
          setAuthMode("login")
          setAuthOpen(true)
        }}
      />

      <main className="page-shell section-fade pb-20">
        <section className="section-shell">
          <div className="surface-panel px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow">Catalog</p>
                <h1 className="mt-4 max-w-2xl font-serif text-5xl leading-none tracking-tight text-foreground">
                  Browse products with clearer filters and cleaner comparisons.
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                  The listing is organized for real shopping: a focused filter rail, a calm sorting layer, and
                  product cards that stay image-led and proportionally consistent.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="hidden md:block">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as (typeof sortOptions)[number])}
                    className="market-input h-11 min-w-48 appearance-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <Sheet>
                  <SheetTrigger asChild>
                    <button type="button" className="market-button-secondary md:hidden">
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                  </SheetTrigger>
                  <SheetContent className="border-border bg-[#fffaf4] text-foreground">
                    <SheetHeader>
                      <SheetTitle className="text-foreground">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">{filterPanel}</div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">{filterPanel}</aside>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              {activeFilters.length > 0 ? (
                activeFilters.map((filter) => (
                  <span key={filter} className="market-chip">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {filter}
                  </span>
                ))
              ) : (
                <span className="market-chip">All products</span>
              )}
              <span className="text-sm text-muted-foreground">
                {totalProducts} items across {totalPages} pages
              </span>
            </div>

            {currentUser ? (
              <div className="surface-panel p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="eyebrow">Recommended For You</p>
                    <h2 className="mt-2 text-2xl font-semibold text-foreground">
                      Hybrid recommendations from your views and purchases
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                      These products combine content-based matching on category and price with collaborative filtering from similar shoppers.
                    </p>
                  </div>
                  {recommendationInsights ? (
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-[1rem] border border-border bg-card px-4 py-3">
                        <p className="text-muted-foreground">Views</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{recommendationInsights.views}</p>
                      </div>
                      <div className="rounded-[1rem] border border-border bg-card px-4 py-3">
                        <p className="text-muted-foreground">Purchases</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{recommendationInsights.purchases}</p>
                      </div>
                      <div className="rounded-[1rem] border border-border bg-card px-4 py-3">
                        <p className="text-muted-foreground">Top category</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">{recommendationInsights.topCategory}</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {isRecommendationsLoading
                    ? Array.from({ length: 4 }).map((_, index) => <ListingSkeleton key={`rec-skeleton-${index}`} />)
                    : recommendedItems.map((product) => (
                        <ProductCard
                          key={`recommended-${product.id}`}
                          product={{
                            ...product,
                            reason: {
                              label: product.reason,
                              type: "fallback_popular",
                            },
                          }}
                          badge={product.source === "collaborative" ? "Similar buyers" : "Recommended"}
                          wishlisted={wishlist.includes(product.id)}
                          onAddToCart={handleAddToCart}
                          onToggleWishlist={handleWishlistToggle}
                          onViewProduct={handleViewProduct}
                        />
                      ))}
                </div>
              </div>
            ) : null}

            {productsError ? (
              <div className="rounded-[1rem] border border-[rgba(177,67,49,0.18)] bg-[rgba(177,67,49,0.06)] px-4 py-3 text-sm text-[#8e3328]">
                {productsError}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => <ListingSkeleton key={`listing-skeleton-${index}`} />)
                : filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      badge={index % 3 === 0 ? "Deal" : "Selected"}
                      wishlisted={wishlist.includes(product.id)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleWishlistToggle}
                      onViewProduct={handleViewProduct}
                    />
                  ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-border bg-card px-4 py-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="market-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  className="market-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="border-border bg-[#fffdf9] text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl leading-none text-foreground">
              {authMode === "login" ? "Welcome back" : "Create your account"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {authMode === "login"
                ? "Sign in to save favourites, manage orders, and move through checkout faster."
                : "Create an account to track orders, save products, and enjoy a smoother shopping flow."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleAuthSubmit}>
            {authMode === "signup" ? (
              <Input
                value={authName}
                onChange={(event) => setAuthName(event.target.value)}
                placeholder="Full name"
                className="market-input h-12"
              />
            ) : null}
            <Input
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="Email address"
              className="market-input h-12"
            />
            <Input
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Password"
              className="market-input h-12"
            />

            {authError ? (
              <div className="rounded-[0.85rem] border border-[rgba(177,67,49,0.18)] bg-[rgba(177,67,49,0.06)] px-4 py-3 text-sm text-[#8e3328]">
                {authError}
              </div>
            ) : null}

            <Button type="submit" disabled={isSubmittingAuth} className="market-button-primary h-12 w-full rounded-full">
              {isSubmittingAuth ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setAuthError("")
              setAuthMode((current) => (current === "login" ? "signup" : "login"))
            }}
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            {authMode === "login" ? "Need an account? Create one" : "Already registered? Sign in"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
