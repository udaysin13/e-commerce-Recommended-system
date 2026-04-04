"use client"

import Link from "next/link"
import {
  type FormEvent,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  DatabaseZap,
  HeartHandshake,
  Layers3,
  LineChart,
  Orbit,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  WandSparkles,
} from "lucide-react"
import { toast } from "sonner"
import { ProductImage } from "@/src/components/products/product-image"
import { CategoryFilter } from "@/src/components/storefront/category-filter"
import { CategorySection } from "@/src/components/storefront/category-section"
import { ProductCard, ProductCardSkeleton } from "@/src/components/storefront/product-card"
import { StorefrontFooter } from "@/src/components/storefront/storefront-footer"
import { StorefrontNavbar } from "@/src/components/storefront/storefront-navbar"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import type { CatalogProduct } from "@/src/shared/catalog-types"
import { getPrimaryProductImage } from "@/src/shared/product-images"
import {
  getStoredCartItems,
  getStoredRecentSearches,
  getStoredRecentViews,
  getStoredWishlistIds,
  pushRecentSearch,
  pushRecentView,
  setStoredCartItems,
  setStoredRecentSearches,
  setStoredRecentViews,
  setStoredWishlistIds,
} from "@/src/shared/personalization-storage"
import {
  type RecommendationContext,
  type RecommendationPage,
  type RecommendationSection,
  recommendationPageSchema,
} from "@/src/shared/recommendation-schema"

type ProductsApiResponse = {
  items: CatalogProduct[]
  total: number
  categories: string[]
}

type SessionUser = {
  name: string
  email: string
}

type CartItem = CatalogProduct & {
  quantity: number
}

const sortOptions = ["Newest", "Price low-high", "Price high-low", "Category"] as const
const preferredCategories = ["All", "Electronics", "Fashion", "Home & Kitchen", "Accessories", "Gadgets"] as const

const trustItems = [
  {
    title: "Recommendation transparency",
    copy: "Every shelf explains the intent behind its ranking so users feel guided, not confused.",
    icon: Sparkles,
  },
  {
    title: "AI plus commerce logic",
    copy: "We blend activity, relevance, popularity, and budget signals into each recommendation row.",
    icon: BrainCircuit,
  },
  {
    title: "Reliable shopper actions",
    copy: "Wishlist, cart, auth, and checkout stay stable while personalization updates in the background.",
    icon: ShieldCheck,
  },
  {
    title: "Graceful cold starts",
    copy: "Even new sessions get useful product suggestions with intelligent fallback ranking.",
    icon: HeartHandshake,
  },
]

const engineHighlights = [
  {
    title: "Behavior capture",
    copy: "Searches, views, wishlist saves, and cart intent feed the recommendation profile in real time.",
    icon: Activity,
  },
  {
    title: "Feature-aware ranking",
    copy: "Category, kind, stock, price, and rating signals blend into a practical e-commerce score.",
    icon: DatabaseZap,
  },
  {
    title: "Hybrid recommendation shelves",
    copy: "The homepage balances personalized rows, trending momentum, and safe fallbacks for cold starts.",
    icon: Layers3,
  },
]

const emptyRecommendationPage: RecommendationPage = {
  generatedAt: new Date(0).toISOString(),
  firstTimeUser: true,
  hero: {
    headline: "Discover Products Tailored For You",
    subtitle:
      "We personalize your shopping journey using behavior signals, trend data, and product relevance.",
    ctaLabel: "Explore Recommendations",
    featuredProduct: null,
  },
  sections: [],
  searchSuggestions: {
    recent: [],
    recommended: [],
    trending: [],
  },
  insights: [],
  explainerSteps: [],
}

function EmptyShelf({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="surface-panel flex min-h-[280px] flex-col items-start justify-center p-6">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">{subtitle}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="market-chip">Search for a category</span>
        <span className="market-chip">Save to wishlist</span>
        <span className="market-chip">Add an item to cart</span>
      </div>
    </div>
  )
}

function SectionHeader({
  id,
  title,
  subtitle,
  action,
}: {
  id: string
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <section id={id} className="section-shell scroll-mt-28">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{title}</p>
          <h2 className="section-title">{title}</h2>
          <p className="section-copy">{subtitle}</p>
        </div>
        {action}
      </div>
    </section>
  )
}

function RecommendationShelf({
  section,
  isLoading,
  wishlist,
  onAddToCart,
  onToggleWishlist,
  onViewProduct,
}: {
  section: RecommendationSection
  isLoading: boolean
  wishlist: string[]
  onAddToCart: (product: CatalogProduct) => void
  onToggleWishlist: (productId: string) => void
  onViewProduct: (productId: string) => void
}) {
  if (isLoading) {
    return (
      <div className="market-scrollbar flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCardSkeleton key={`${section.id}-skeleton-${index}`} />
        ))}
      </div>
    )
  }

  if (section.items.length === 0) {
    return (
      <EmptyShelf
        title={`No products in ${section.title.toLowerCase()} yet`}
        subtitle={section.emptyMessage ?? "Add products or interact with the store to generate personalized recommendation rows."}
      />
    )
  }

  return (
    <div className="market-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
      {section.items.map((item, index) => (
        <motion.div
          key={`${section.id}-${item.id}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: index * 0.05 }}
          className="min-w-[290px] snap-start md:min-w-[310px] xl:min-w-[320px]"
        >
          <ProductCard
            product={item}
            wishlisted={wishlist.includes(item.id)}
            badge={
              section.title === "Trending Products"
                ? "Trending"
                : section.title === "Top Picks Today"
                  ? "Best Match"
                  : "Recommended"
            }
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onViewProduct={onViewProduct}
          />
        </motion.div>
      ))}
    </div>
  )
}

function MobileDock({ cartCount, wishlistCount }: { cartCount: number; wishlistCount: number }) {
  const items = [
    { href: "#for-you", label: "For You", icon: Sparkles, count: null },
    { href: "/wishlist", label: "Wishlist", icon: HeartHandshake, count: wishlistCount },
    { href: "/cart", label: "Cart", icon: ShoppingBag, count: cartCount },
    { href: "/orders", label: "Orders", icon: TrendingUp, count: null },
  ]

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 grid grid-cols-4 rounded-full border border-white/10 bg-slate-950/90 px-2 py-2 shadow-[0_20px_40px_rgba(2,6,23,0.46)] backdrop-blur-xl md:hidden">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="relative flex flex-col items-center gap-1 py-2 text-[11px] text-slate-300"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
          {item.count ? (
            <span className="absolute right-5 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-slate-950">
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  )
}

async function fetchWithRetry(input: RequestInfo, init: RequestInit, retries = 1): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(input, init)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      return response
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await new Promise((resolve) => window.setTimeout(resolve, 300 * (attempt + 1)))
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed")
}

export function StorefrontPage() {
  const [categories, setCategories] = useState<string[]>([...preferredCategories])
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([])
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy] = useState<(typeof sortOptions)[number]>("Newest")
  const [recommendationPage, setRecommendationPage] = useState<RecommendationPage>(emptyRecommendationPage)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [pageError, setPageError] = useState("")
  const [wishlist, setWishlist] = useState<string[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [recentViews, setRecentViews] = useState<string[]>([])
  const [hasHydratedPersonalization, setHasHydratedPersonalization] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [authName, setAuthName] = useState("")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null)
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)

  const deferredQuery = useDeferredValue(query)
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems])

  const recommendationContext = useMemo<RecommendationContext>(() => {
    const finalQuery = deferredQuery.trim()
    return {
      query: finalQuery,
      selectedCategory,
      sort: sortBy,
      recentSearches,
      viewedIds: recentViews,
      wishlistIds: wishlist,
      cartIds: cartItems.map((item) => item.id),
    }
  }, [cartItems, deferredQuery, recentSearches, recentViews, selectedCategory, sortBy, wishlist])

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

  const fetchCatalog = useCallback(async () => {
    try {
      const response = await fetch("/api/products?q=&category=All&sort=Newest")
      if (!response.ok) return
      const payload = (await response.json()) as ProductsApiResponse
      setAllProducts(payload.items)
      setCategories(
        Array.from(new Set([...preferredCategories, ...payload.categories.filter(Boolean)])),
      )
    } catch {
      setAllProducts([])
      setCategories([...preferredCategories])
    }
  }, [])

  const loadRecommendations = useCallback(async (context: RecommendationContext, showSkeleton = false) => {
    if (showSkeleton) {
      setIsPageLoading(true)
    } else {
      setIsSearchLoading(true)
    }

    setPageError("")

    try {
      const response = await fetchWithRetry(
        "/api/recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(context),
        },
        1,
      )

      const json = await response.json()
      const parsed = recommendationPageSchema.safeParse(json)
      if (!parsed.success) {
        throw new Error("Recommendation response was invalid.")
      }

      startTransition(() => {
        setRecommendationPage(parsed.data)
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load recommendations."
      setPageError(message)
    } finally {
      setIsPageLoading(false)
      setIsSearchLoading(false)
    }
  }, [])

  useEffect(() => {
    setWishlist(getStoredWishlistIds())
    setCartItems(getStoredCartItems<CartItem>())
    setRecentSearches(getStoredRecentSearches())
    setRecentViews(getStoredRecentViews())
    setHasHydratedPersonalization(true)
  }, [])

  useEffect(() => {
    void loadSession()
    void fetchCatalog()
  }, [fetchCatalog, loadSession])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadRecommendations(recommendationContext, recommendationPage.sections.length === 0)
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [loadRecommendations, recommendationContext, recommendationPage.sections.length])

  useEffect(() => {
    if (!hasHydratedPersonalization) return
    setStoredCartItems(cartItems)
  }, [cartItems, hasHydratedPersonalization])

  useEffect(() => {
    if (!hasHydratedPersonalization) return
    setStoredWishlistIds(wishlist)
  }, [hasHydratedPersonalization, wishlist])

  useEffect(() => {
    if (!hasHydratedPersonalization) return
    setStoredRecentSearches(recentSearches)
  }, [hasHydratedPersonalization, recentSearches])

  useEffect(() => {
    if (!hasHydratedPersonalization) return
    setStoredRecentViews(recentViews)
  }, [hasHydratedPersonalization, recentViews])

  const featuredProduct = recommendationPage.hero.featuredProduct
  const personalizationStats = useMemo(() => {
    return [
      {
        label: "Recent searches",
        value: String(recentSearches.length).padStart(2, "0"),
        detail:
          recentSearches[0] ? `Latest intent: ${recentSearches[0]}` : "No search history yet. Use search to shape the feed.",
        icon: Search,
      },
      {
        label: "Viewed products",
        value: String(recentViews.length).padStart(2, "0"),
        detail:
          recentViews.length > 0 ? "Recent clicks are boosting similarity recommendations." : "Product views will tune similarity ranking.",
        icon: Orbit,
      },
      {
        label: "Saved + carted",
        value: String(wishlist.length + cartItems.length).padStart(2, "0"),
        detail:
          wishlist.length + cartItems.length > 0
            ? "Higher-intent actions are influencing budget and category fit."
            : "Wishlist saves and cart adds create stronger preference signals.",
        icon: LineChart,
      },
    ]
  }, [cartItems.length, recentSearches, recentViews.length, wishlist.length])
  const suggestionBuckets = useMemo(
    () => [
      {
        title: "Recent intent",
        items: recommendationPage.searchSuggestions.recent,
        empty: "Your latest searches will appear here.",
      },
      {
        title: "Recommended searches",
        items: recommendationPage.searchSuggestions.recommended,
        empty: "The engine will suggest useful prompts after a few interactions.",
      },
      {
        title: "Trending categories",
        items: recommendationPage.searchSuggestions.trending,
        empty: "Popular categories will appear as products gain momentum.",
      },
    ],
    [recommendationPage.searchSuggestions],
  )
  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()
    return allProducts.filter((product) => {
      const categoryMatch = selectedCategory === "All" || product.category === selectedCategory
      const queryMatch =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.kind.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)

      return categoryMatch && queryMatch
    })
  }, [allProducts, deferredQuery, selectedCategory])

  const categorySections = useMemo(() => {
    const fallbackSubtitle = recommendationContext.query
      ? `Because you searched for ${recommendationContext.query}.`
      : "Recommended based on your activity and category preferences."

    const sectionConfig =
      selectedCategory === "All"
        ? [
            {
              title: "Electronics",
              subtitle: recommendationContext.query
                ? `Top electronics for you because you searched for ${recommendationContext.query}.`
                : "Top electronics for you based on your activity.",
            },
            {
              title: "Fashion",
              subtitle: "Fresh fashion picks selected from current browsing trends.",
            },
            {
              title: "Home & Kitchen",
              subtitle: "Useful home and kitchen finds chosen for everyday relevance.",
            },
          ]
        : [
            {
              title: selectedCategory,
              subtitle: fallbackSubtitle,
            },
          ]

    return sectionConfig.map((section) => {
      const products = filteredProducts.filter((product) => product.category === section.title)
      return {
        ...section,
        products,
      }
    })
  }, [filteredProducts, recommendationContext.query, selectedCategory])

  const sectionMap = new Map(recommendationPage.sections.map((section) => [section.id, section]))
  const recommendedSection = sectionMap.get("recommended-for-you") ?? {
    id: "recommended-for-you",
    title: "Recommended for You",
    subtitle: "Recommended based on your activity.",
    status: "empty" as const,
    items: [],
    emptyMessage: "As soon as products exist or users interact, tailored recommendations will appear here.",
  }
  const trendingSection = sectionMap.get("trending-products") ?? {
    id: "trending-products",
    title: "Trending Products",
    subtitle: "Popular products getting strong momentum today.",
    status: "empty" as const,
    items: [],
    emptyMessage: "Trending results will appear when products are available.",
  }
  const topPicksSection = sectionMap.get("top-picks-today") ?? {
    id: "top-picks-today",
    title: "Top Picks Today",
    subtitle: "A balanced mix of highly rated and high-fit products.",
    status: "empty" as const,
    items: [],
    emptyMessage: "Top picks will populate once products are added.",
  }

  const insightCards = recommendationPage.insights.length > 0
    ? recommendationPage.insights
    : [
        { label: "Signals", value: "00", detail: "Searches, views, wishlist saves, and carts influence ranking." },
        { label: "Intent", value: "Cold Start", detail: "The system will infer interests as shopper behavior grows." },
        { label: "Response", value: "<300ms", detail: "Recommendation rows refresh quickly for a responsive experience." },
      ]

  const handleSubmitSearch = useCallback((value: string) => {
    const search = value.trim()
    if (!search) return
    pushRecentSearch(search)
    setRecentSearches((current) => [search, ...current.filter((item) => item.toLowerCase() !== search.toLowerCase())].slice(0, 8))
    toast.success(`Refreshing recommendations for "${search}"`)
  }, [])

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
    toast.success(`${product.name} added to cart`)
  }

  const handleWishlistToggle = (productId: string) => {
    setWishlist((current) => {
      const exists = current.includes(productId)
      const next = exists ? current.filter((id) => id !== productId) : [...current, productId]
      toast.success(exists ? "Removed from wishlist" : "Saved to wishlist")
      return next
    })
  }

  const handleViewProduct = (productId: string) => {
    pushRecentView(productId)
    setRecentViews((current) => [productId, ...current.filter((item) => item !== productId)].slice(0, 12))
  }

  const handleResetSignals = () => {
    setRecentSearches([])
    setRecentViews([])
    setWishlist([])
    setCartItems([])
    setStoredRecentSearches([])
    setStoredRecentViews([])
    setStoredWishlistIds([])
    setStoredCartItems([])
    toast.success("Personalization signals cleared")
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

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <StorefrontNavbar
        currentUser={currentUser}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        query={query}
        categories={categories}
        selectedCategory={selectedCategory}
        suggestions={recommendationPage.searchSuggestions}
        isSearchLoading={isSearchLoading}
        onQueryChange={setQuery}
        onCategoryChange={setSelectedCategory}
        onSearchSubmit={handleSubmitSearch}
        onOpenAuth={() => {
          setAuthMode("login")
          setAuthOpen(true)
        }}
      />

      <main className="page-shell section-fade pb-20">
        <section className="section-shell grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="surface-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.12),transparent_22%)]" />
            <div className="relative">
              <div className="flex flex-wrap gap-2">
                <span className="market-chip">AI-powered personalization</span>
                <span className="market-chip">Recommendation-first commerce</span>
                {recommendationContext.query ? <span className="market-chip">Because you searched for {recommendationContext.query}</span> : null}
              </div>

              <p className="mt-8 eyebrow text-indigo-300">Smart discovery</p>
              <h1 className="mt-4 max-w-3xl text-[3rem] font-semibold leading-[0.96] tracking-tight text-white sm:text-[4.6rem]">
                Discover Products Tailored For You
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300">
                {recommendationPage.hero.subtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#for-you" className="market-button-primary">
                  Explore Recommendations
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => void loadRecommendations(recommendationContext, false)}
                  className="market-button-secondary"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh feed
                </button>
              </div>

              <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
                {insightCards.map((item) => (
                  <div key={item.label} className="rounded-[1.15rem] border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="surface-panel overflow-hidden p-4 sm:p-5"
          >
            {featuredProduct ? (
              <div className="grid h-full gap-5">
                <Link
                  href={`/products/${encodeURIComponent(featuredProduct.id)}`}
                  className="group block"
                  onClick={() => handleViewProduct(featuredProduct.id)}
                >
                  <div className="relative overflow-hidden rounded-[1.2rem] bg-slate-900">
                    <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(2,6,23,0.95))]">
                      <ProductImage
                        src={getPrimaryProductImage(featuredProduct)}
                        alt={featuredProduct.name}
                        fill
                        unoptimized={getPrimaryProductImage(featuredProduct).startsWith("data:image/")}
                        className="p-6 transition duration-300 group-hover:scale-[1.04]"
                        sizes="(max-width: 1024px) 100vw, 38vw"
                        priority
                      />
                    </div>
                  </div>
                </Link>

                <div>
                  <div className="market-chip w-fit">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                    {featuredProduct.reason.label}
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight text-white">{featuredProduct.name}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span>{featuredProduct.category}</span>
                    <span>{featuredProduct.kind}</span>
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {(featuredProduct.ratingAvg ?? 4.8).toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                    Rs. {featuredProduct.price.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 text-sm text-emerald-300">Free delivery | 2 days</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col justify-between gap-6 rounded-[1.35rem] border border-dashed border-white/10 bg-white/[0.03] p-6">
                <div>
                  <p className="eyebrow">Featured recommendation</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Waiting for products and signals</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    This hero slot will spotlight the highest-confidence recommendation as soon as products are available and user activity starts shaping the ranking.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="surface-muted p-4">
                    <p className="text-sm font-medium text-white">Recommended for You</p>
                    <p className="mt-2 text-sm text-slate-400">Personalized items based on activity and intent.</p>
                  </div>
                  <div className="surface-muted p-4">
                    <p className="text-sm font-medium text-white">Top Picks Today</p>
                    <p className="mt-2 text-sm text-slate-400">High-confidence picks chosen by trend and quality signals.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {pageError ? (
          <div className="section-shell rounded-[1.2rem] border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{pageError}</p>
              <button type="button" onClick={() => void loadRecommendations(recommendationContext, true)} className="market-button-secondary">
                <RefreshCcw className="h-4 w-4" />
                Retry recommendations
              </button>
            </div>
          </div>
        ) : null}

        <section className="section-shell">
          <div className="mb-5">
            <p className="eyebrow">Browse by category</p>
            <h2 className="section-title">Shop by category and intent</h2>
            <p className="section-copy">
              Explore categories smoothly while the recommendation engine keeps adapting to what shoppers do next.
            </p>
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </section>

        <section id="signals-lab" className="section-shell">
          <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
            <div className="surface-panel p-6 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Signals Lab</p>
                  <h2 className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-white sm:text-[2.5rem]">
                    See what the recommendation engine is using right now
                  </h2>
                </div>
                <button type="button" onClick={handleResetSignals} className="market-button-secondary px-4 py-2 text-xs">
                  <SlidersHorizontal className="h-4 w-4" />
                  Reset signals
                </button>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
                This store is built as a recommendation system first. The homepage adapts to search intent,
                product views, wishlist activity, and cart behavior, then re-ranks every shelf around those signals.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {personalizationStats.map((item) => (
                  <div key={item.label} className="surface-muted p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                      <item.icon className="h-4 w-4 text-indigo-300" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {engineHighlights.map((item) => (
                  <div key={item.title} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel p-6 sm:p-7">
              <div className="flex items-center gap-2">
                <WandSparkles className="h-5 w-5 text-indigo-300" />
                <div>
                  <p className="eyebrow">Search intelligence</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Suggested intents and live discovery prompts</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {suggestionBuckets.map((bucket) => (
                  <div key={bucket.title} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{bucket.title}</p>
                      <span className="text-xs text-slate-500">{bucket.items.length} items</span>
                    </div>
                    {bucket.items.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {bucket.items.map((item) => (
                          <button
                            key={`${bucket.title}-${item}`}
                            type="button"
                            onClick={() => {
                              setQuery(item)
                              handleSubmitSearch(item)
                            }}
                            className="market-button-secondary px-3 py-2 text-xs"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-400">{bucket.empty}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div>
          <SectionHeader
            id="for-you"
            title={recommendedSection.title}
            subtitle={recommendedSection.subtitle}
            action={
              <button
                type="button"
                onClick={() => void loadRecommendations(recommendationContext, false)}
                className="market-button-secondary px-4 py-2 text-xs"
              >
                Refresh row
              </button>
            }
          />
          <RecommendationShelf
            section={recommendedSection}
            isLoading={isPageLoading}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleWishlistToggle}
            onViewProduct={handleViewProduct}
          />
        </div>

        {categorySections.map((section) => (
          <CategorySection
            key={section.title}
            title={section.title}
            subtitle={section.subtitle}
            products={section.products}
            isLoading={isPageLoading}
            emptyText="No products found in this category."
            wishlistedIds={wishlist}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleWishlistToggle}
            onViewProduct={handleViewProduct}
          />
        ))}

        <div>
          <SectionHeader
            id="trending-products"
            title={trendingSection.title}
            subtitle={trendingSection.subtitle}
            action={
              <button
                type="button"
                onClick={() => void loadRecommendations(recommendationContext, false)}
                className="market-button-secondary px-4 py-2 text-xs"
              >
                Refresh row
              </button>
            }
          />
          <RecommendationShelf
            section={trendingSection}
            isLoading={isPageLoading}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleWishlistToggle}
            onViewProduct={handleViewProduct}
          />
        </div>

        <div>
          <SectionHeader
            id="top-picks-today"
            title={topPicksSection.title}
            subtitle={topPicksSection.subtitle}
            action={
              <button
                type="button"
                onClick={() => void loadRecommendations(recommendationContext, false)}
                className="market-button-secondary px-4 py-2 text-xs"
              >
                Refresh row
              </button>
            }
          />
          <RecommendationShelf
            section={topPicksSection}
            isLoading={isPageLoading}
            wishlist={wishlist}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleWishlistToggle}
            onViewProduct={handleViewProduct}
          />
        </div>

        <section id="why-it-works" className="section-shell">
          <div className="mb-7">
            <p className="eyebrow">Why it works</p>
            <h2 className="section-title">A polished shopping experience powered by recommendation context</h2>
            <p className="section-copy">
              Personalization is visible throughout the interface, but the shopping journey still feels grounded, trustworthy, and easy to act on.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="surface-panel p-5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.copy}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section-shell">
          <div className="mb-7">
            <p className="eyebrow">How It Works</p>
            <h2 className="section-title">The full recommendation system, visible in the interface</h2>
            <p className="section-copy">
              Instead of hiding personalization in the background, this storefront shows the real journey from
              shopper behavior to ranked product shelves.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
            <div className="surface-panel p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <BrainCircuit className="h-6 w-6 text-indigo-300" />
                <div>
                  <p className="text-lg font-semibold text-white">Recommendation pipeline</p>
                  <p className="mt-1 text-sm text-slate-400">
                    The backend already returns these engine steps. This section turns them into a visible product story.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {recommendationPage.explainerSteps.map((step, index) => (
                  <div key={step.id} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-semibold text-indigo-200">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.bullets.map((bullet) => (
                            <span key={`${step.id}-${bullet}`} className="market-chip">
                              {bullet}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="surface-panel p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-lg font-semibold text-white">What makes this an e-commerce recommendation system</p>
                    <p className="mt-1 text-sm text-slate-400">
                      The site is designed around recommendation outcomes, not just product listing.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="surface-muted p-4">
                    <p className="text-sm font-semibold text-white">Recommendation-first shelves</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Personalized, trending, and top-pick rows are generated by behavior-aware ranking logic.
                    </p>
                  </div>
                  <div className="surface-muted p-4">
                    <p className="text-sm font-semibold text-white">Reason labels on products</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Each card carries a human-readable explanation so the shopper understands why it appears.
                    </p>
                  </div>
                  <div className="surface-muted p-4">
                    <p className="text-sm font-semibold text-white">Cold-start handling</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      New users still get useful results through popularity, quality, and fallback ranking.
                    </p>
                  </div>
                  <div className="surface-muted p-4">
                    <p className="text-sm font-semibold text-white">Feedback loop</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Search, wishlist, cart, and views keep refining the feed as the session progresses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="surface-panel p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-indigo-300" />
                  <div>
                    <p className="text-lg font-semibold text-white">Commerce flow completeness</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Personalization is connected to the actual buying flow, not isolated from it.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">Discovery</p>
                    <p className="mt-2 text-sm text-slate-400">Search prompts, category browsing, and dynamic shelves.</p>
                  </div>
                  <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">Consideration</p>
                    <p className="mt-2 text-sm text-slate-400">Rich cards, detail pages, trust blocks, and price comparison context.</p>
                  </div>
                  <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">Intent capture</p>
                    <p className="mt-2 text-sm text-slate-400">Wishlist saves, cart additions, and session activity improve ranking confidence.</p>
                  </div>
                  <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">Checkout support</p>
                    <p className="mt-2 text-sm text-slate-400">The recommendation experience feeds directly into checkout and order flows.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
      <MobileDock cartCount={cartCount} wishlistCount={wishlist.length} />

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="border-white/10 bg-slate-950 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-3xl font-semibold leading-none text-white">
              {authMode === "login" ? "Welcome back" : "Create your account"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {authMode === "login"
                ? "Sign in to keep your recommendations, wishlist changes, and shopping history in sync."
                : "Create an account to unlock persistent recommendations and a faster buying journey."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleAuthSubmit}>
            {authMode === "signup" ? (
              <Input value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Full name" className="market-input h-12" />
            ) : null}
            <Input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="Email address" className="market-input h-12" />
            <Input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Password" className="market-input h-12" />

            {authError ? (
              <div className="rounded-[1rem] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
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
            className="text-sm text-slate-400 transition hover:text-white"
          >
            {authMode === "login" ? "Need an account? Create one" : "Already registered? Sign in"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
