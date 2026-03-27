"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
  Heart,
  Star,
  Truck,
  Shield,
  Share2,
} from "lucide-react"
import type { CatalogProduct } from "@/src/shared/catalog-types"

const navItems = [
  "New In",
  "Toys",
  "Phone Covers",
  "Cycles",
  "Clothes",
  "Plant Buckets",
  "Kitchen Tools",
  "Pet Care",
  "Fitness Gear",
  "Travel Accessories",
]

const allMenuOptions = [
  "User Account",
  "Order List",
  "Cart Items",
  "Wishlist",
  "Customer Support",
  "Track Orders",
  "My Reviews",
]

const heroSlides = [
  { title: "Play More, Spend Less", subtitle: "Toys and gadgets under one roof", category: "Toys" },
  { title: "Style Your Phone", subtitle: "Premium covers, fresh drops", category: "Phone Covers" },
  { title: "Ride The Weekend", subtitle: "Cycles and accessories", category: "Cycles" },
  { title: "Green Corners", subtitle: "Plant buckets and home greens", category: "Plant Buckets" },
]

function ProductTile({
  item,
  onAddToCart,
  onBuyNow,
  isWishlisted = false,
  onWishlistToggle,
}: {
  item: CatalogProduct
  onAddToCart: (item: CatalogProduct) => void
  onBuyNow: (item: CatalogProduct) => void
  isWishlisted?: boolean
  onWishlistToggle?: (itemId: string) => void
}) {
  // For demo purposes, derive stable rating/review/discount values from the item id.
  // This avoids using random values during render and keeps the UI consistent.
  const stableHash = item.id
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 1000, 0)
  const rating = (stableHash % 2) + 4
  const reviewCount = 50 + (stableHash % 450)
  const discount = 5 + (stableHash % 20)

  return (
    <article className="group relative overflow-hidden rounded-xl border border-[#e0e6ef] bg-white transition-all hover:shadow-[0_8px_24px_rgba(8,20,42,0.15)] hover:border-[#b8cbe3]">
      {/* Wishlist Button */}
      <button
        type="button"
        onClick={() => onWishlistToggle?.(item.id)}
        className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 shadow-md transition hover:bg-[#f0f5ff]"
      >
        <Heart
          className={`h-5 w-5 transition ${
            isWishlisted ? "fill-red-500 text-red-500" : "text-[#999]"
          }`}
        />
      </button>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute left-2 top-2 rounded-lg bg-[#d32f2f] px-2 py-1">
          <p className="text-xs font-bold text-white">{discount}% OFF</p>
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f8fd]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          unoptimized
          className="object-cover transition group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent opacity-0 transition group-hover:opacity-40" />
      </div>

      {/* Product Info */}
      <div className="p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#999]">
          {item.kind}
        </p>
        <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-[#1b2737]">
          {item.name}
        </p>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < rating
                    ? "fill-[#ff9900] text-[#ff9900]"
                    : "text-[#ddd]"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#999]">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-[#0a3358]">
            Rs. {Math.round(item.price * (1 - discount / 100))}
          </span>
          <span className="line-through text-xs text-[#999]">
            Rs. {item.price}
          </span>
        </div>

        {/* Free Delivery Badge */}
        <div className="mt-2 flex items-center gap-1 rounded-md bg-[#f0f5ff] px-2 py-1">
          <Truck className="h-3 w-3 text-[#0066c0]" />
          <span className="text-xs font-semibold text-[#0066c0]">Free Delivery</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="rounded-lg border border-[#ffcc66] bg-[#fff9e8] px-2 py-2 text-xs font-bold text-[#ff9900] transition hover:bg-[#ffe8b8]"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => onBuyNow(item)}
            className="rounded-lg bg-[#ff9900] px-2 py-2 text-xs font-bold text-white transition hover:bg-[#e68900]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  )
}

type ProductsApiResponse = {
  items: CatalogProduct[]
  total: number
  categories: string[]
}

type CartItem = CatalogProduct & { quantity: number }

export default function Page() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [authName, setAuthName] = useState("")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [shippingName, setShippingName] = useState("")
  const [shippingLine1, setShippingLine1] = useState("")
  const [shippingLine2, setShippingLine2] = useState("")
  const [shippingCity, setShippingCity] = useState("")
  const [shippingState, setShippingState] = useState("")
  const [shippingPostal, setShippingPostal] = useState("")
  const [shippingCountry, setShippingCountry] = useState("India")
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod")
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [activeNav, setActiveNav] = useState("New In")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState("Newest")
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorText, setErrorText] = useState("")
  const [statusText, setStatusText] = useState("Welcome to FluxCart - Your Premium Marketplace")
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true)
      setErrorText("")
      try {
        const params = new URLSearchParams({
          q: query,
          category: selectedCategory,
          sort: sortBy,
        })
        const response = await fetch(`/api/products?${params.toString()}`, { signal })
        if (!response.ok) {
          throw new Error("Request failed")
        }
        const payload = (await response.json()) as ProductsApiResponse
        setProducts(payload.items)
        setCategories(payload.categories)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
        setErrorText("Could not load products. Please retry.")
      } finally {
        setIsLoading(false)
      }
    },
    [query, selectedCategory, sortBy]
  )

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void fetchProducts(controller.signal)
    }, 220)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [fetchProducts])

  const grouped = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        items: products.filter((item) => item.category === category),
      }))
      .filter((bucket) => bucket.items.length > 0)
  }, [categories, products])

  useEffect(() => {
    if (selectedCategory === "All") {
      setActiveNav("New In")
      return
    }
    if (navItems.includes(selectedCategory)) {
      setActiveNav(selectedCategory)
    }
  }, [selectedCategory])

  const heroCategory = heroSlides[heroIndex].category
  const heroProduct = products.find((item) => item.category === heroCategory) ?? products[0]

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusText(`Showing ${products.length} item(s) for "${query || "all products"}".`)
  }

  const loadSession = useCallback(async () => {
    if (typeof window === "undefined") return

    // Try server-side session first
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const payload = (await response.json()) as { user?: { name: string; email: string } }
        if (payload?.user) {
          setCurrentUser(payload.user)
          return
        }
      }
    } catch {
      // ignore transient session fetch failures and clear the client state below
    }

    setCurrentUser(null)
  }, [])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  useEffect(() => {
    if (typeof window === "undefined") return

    const getLocalCart = (): CartItem[] => {
      if (!currentUser) return []
      const rawCart = window.localStorage.getItem(`storefront_cart_${currentUser.email}`)
      if (!rawCart) return []

      try {
        const parsed = JSON.parse(rawCart) as CartItem[]
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    const getLocalWishlist = (): string[] => {
      if (!currentUser) return []
      const rawWishlist = window.localStorage.getItem(`storefront_wishlist_${currentUser.email}`)
      if (!rawWishlist) return []

      try {
        const parsed = JSON.parse(rawWishlist) as string[]
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    const loadLocalState = () => {
      setCartItems(getLocalCart())
      setWishlistItems(getLocalWishlist())
    }

    const mergeCart = (server: CartItem[], local: CartItem[]): CartItem[] => {
      const map = new Map<string, CartItem>()
      for (const item of server) {
        map.set(item.id, item)
      }
      for (const item of local) {
        const existing = map.get(item.id)
        if (existing) {
          map.set(item.id, { ...existing, quantity: existing.quantity + item.quantity })
        } else {
          map.set(item.id, item)
        }
      }
      return Array.from(map.values())
    }

    const mergeWishlist = (server: string[], local: string[]) =>
      Array.from(new Set([...server, ...local]))

    const loadServerState = async () => {
      if (!currentUser) {
        setCartItems([])
        setWishlistItems([])
        return
      }

      const localCart = getLocalCart()
      const localWishlist = getLocalWishlist()

      try {
        const [cartRes, wishlistRes] = await Promise.all([
          fetch("/api/cart"),
          fetch("/api/wishlist"),
        ])

        if (!cartRes.ok || !wishlistRes.ok) {
          loadLocalState()
          return
        }

        const cartBody = (await cartRes.json()) as { items: Array<{ quantity: number; product: CatalogProduct }> }
        const wishlistBody = (await wishlistRes.json()) as { items: Array<{ productId: string }> }

        const serverCartItems: CartItem[] = cartBody.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
        }))
        const serverWishlistIds = wishlistBody.items.map((item) => item.productId)

        const mergedCart = mergeCart(serverCartItems, localCart)
        const mergedWishlist = mergeWishlist(serverWishlistIds, localWishlist)

        if (localCart.length > 0) {
          await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: mergedCart.map((item) => ({ productId: item.id, quantity: item.quantity })) }),
          })
        }

        if (localWishlist.length > 0) {
          await fetch("/api/wishlist", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: mergedWishlist }),
          })
        }

        setCartItems(mergedCart)
        setWishlistItems(mergedWishlist)
      } catch {
        loadLocalState()
      }
    }

    void loadServerState()
  }, [currentUser])

  useEffect(() => {
    if (typeof window === "undefined" || !currentUser) return

    window.localStorage.setItem(
      `storefront_cart_${currentUser.email}`,
      JSON.stringify(cartItems)
    )
    window.localStorage.setItem(
      `storefront_wishlist_${currentUser.email}`,
      JSON.stringify(wishlistItems)
    )
  }, [cartItems, wishlistItems, currentUser])

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setAuthError("")
    setAuthPassword("")
    setAuthModalOpen(true)
  }

  const onAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError("")

    const email = authEmail.trim().toLowerCase()
    const password = authPassword
    const name = authName.trim()

    if (!email || !password) {
      setAuthError("Email and password are required.")
      return
    }

    const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login"
    const payload = authMode === "signup" ? { name, email, password } : { email, password }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const body = (await response.json()) as { error?: string; user?: { name: string; email: string } }
      if (!response.ok) {
        throw new Error(body.error ?? "Login failed")
      }

      if (body.user) {
        setCurrentUser(body.user)
        setAuthModalOpen(false)
        setStatusText(`Welcome ${body.user.name}.`)
        return
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed")
      setStatusText("Authentication failed.")
    }
  }

  const onLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // ignore
    }

    setCurrentUser(null)
    setCartOpen(false)
    setStatusText("You are logged out.")
  }

  const runWithAuth = (action: () => void) => {
    if (!currentUser) {
      openAuthModal("login")
      setStatusText("Login or signup to continue.")
      return
    }
    action()
  }

  const onNavSelect = (item: string) => {
    setActiveNav(item)
    const category = item === "New In" ? "All" : item
    setSelectedCategory(category)
    setStatusText(
      category === "All"
        ? "Showing products from all categories."
        : `Showing products from category: ${item}`
    )
  }

  const updateCartOnServer = async (productId: string, quantity: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })
      if (!response.ok) return
      const body = (await response.json()) as { items: Array<{ quantity: number; product: CatalogProduct }> }
      setCartItems(body.items.map((item) => ({ ...item.product, quantity: item.quantity })))
    } catch {
      // ignore network errors
    }
  }

  const onAddToCart = async (item: CatalogProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.id === item.id)
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })

    if (currentUser) {
      const existing = cartItems.find((entry) => entry.id === item.id)
      const nextQuantity = existing ? existing.quantity + 1 : 1
      void updateCartOnServer(item.id, nextQuantity)
    }

    setCartOpen(true)
    setStatusText(`${item.name} added to cart.`)
  }

  const onBuyNow = (item: CatalogProduct) => {
    setStatusText(`Redirecting to checkout for ${item.name}.`)
    router.push(`/checkout?productId=${encodeURIComponent(item.id)}`)
  }

  const onRemoveFromCart = async (id: string) => {
    setCartItems((prev) =>
      prev
        .map((entry) =>
          entry.id === id ? { ...entry, quantity: Math.max(0, entry.quantity - 1) } : entry
        )
        .filter((entry) => entry.quantity > 0)
    )

    if (currentUser) {
      const existing = cartItems.find((entry) => entry.id === id)
      const nextQuantity = existing ? Math.max(0, existing.quantity - 1) : 0
      void updateCartOnServer(id, nextQuantity)
    }
  }

  const checkout = async () => {
    if (cartItems.length === 0) {
      setStatusText("Your cart is empty.")
      return
    }

    if (!shippingName || !shippingLine1 || !shippingCity || !shippingPostal || !shippingCountry) {
      setStatusText("Please fill in the shipping address before placing an order.")
      return
    }

    setStatusText("Placing your order...")

    const shippingAddress = {
      name: shippingName,
      line1: shippingLine1,
      line2: shippingLine2,
      city: shippingCity,
      state: shippingState,
      postalCode: shippingPostal,
      country: shippingCountry,
      paymentMethod,
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
          shippingAddress,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please sign in again to place your order.")
        }
        throw new Error("Could not place order.")
      }

      const body = (await response.json()) as { order?: { id: string } }
      const orderId = body.order?.id

      setLastOrderId(orderId ?? null)
      setCartItems([])
      setCartOpen(false)
      setCheckoutOpen(false)
      setStatusText(
        orderId ? `Order placed successfully! Order #${orderId}` : "Order placed successfully!"
      )

      if (typeof window !== "undefined" && currentUser) {
        window.localStorage.removeItem(`storefront_cart_${currentUser.email}`)
      }

      // Keep address fields for convenience on next checkout
    } catch (error) {
      setStatusText(
        error instanceof Error ? error.message : "Unable to place order. Please try again."
      )
    }
  }

  const onCheckoutClick = () => {
    runWithAuth(() => {
      void checkout()
    })
  }

  const onWishlistToggle = async (itemId: string) => {
    setWishlistItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )

    if (currentUser) {
      void fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: itemId }),
      })
    }
  }

  const goHero = (direction: "prev" | "next") => {
    setHeroIndex((prev) => {
      if (direction === "prev") {
        return (prev - 1 + heroSlides.length) % heroSlides.length
      }
      return (prev + 1) % heroSlides.length
    })
  }

  useEffect(() => {
    if (heroPaused) {
      return
    }
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length)
    }, 3500)
    return () => window.clearInterval(timer)
  }, [heroPaused])

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-[#0f1a2a]">
      <header className="sticky top-0 z-[140] border-b border-[#152740] bg-[#0d1f35] text-white">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3">
          <div className="min-w-[180px]">
            <p className="text-5xl font-black leading-none tracking-tight">
              flux<span className="text-[#ffcc66]">cart</span>
            </p>
          </div>

          <form onSubmit={onSearch} className="flex flex-1 overflow-hidden rounded-xl border border-[#2d4565]">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="bg-[#eaf0f9] px-3 text-sm font-semibold text-[#1f2b3d] outline-none"
              aria-label="Category"
            >
              <option>All</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, categories, or type..."
              className="h-12 flex-1 bg-white px-4 text-base text-[#16253a] outline-none"
            />
            <button type="submit" className="grid w-14 place-items-center bg-[#ffb648] text-[#0e2238]">
              <Search className="h-5 w-5" />
            </button>
          </form>

          <div className="hidden items-center gap-4 lg:flex">
            <button
              type="button"
              onClick={() => setStatusText("Language selector opened.")}
              className="flex items-center gap-1 text-sm"
            >
              <Globe className="h-4 w-4 text-[#8ad4ff]" />
              EN
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  onLogout()
                } else {
                  openAuthModal("login")
                }
              }}
              className="text-left"
            >
              <p className="text-xs text-[#c7d3e5]">
                {currentUser ? `Hi, ${currentUser.name}` : "Hello, sign in"}
              </p>
              <p className="flex items-center gap-1 font-bold">
                <UserRound className="h-4 w-4" />
                {currentUser ? "Logout" : "Account"}
              </p>
            </button>
            <button
              type="button"
              onClick={() => runWithAuth(() => setCartOpen((prev) => !prev))}
              className="relative flex items-center gap-2"
            >
              <ShoppingBag className="h-6 w-6 text-[#ffcc66]" />
              <span className="font-bold">Bag</span>
              {cartCount > 0 ? (
                <span className="absolute -right-3 -top-2 rounded-full bg-[#ffcc66] px-1.5 text-[10px] font-black text-[#10253d]">
                  {cartCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => runWithAuth(() => setWishlistOpen((prev) => !prev))}
              className="relative flex items-center gap-2"
            >
              <Heart className="h-6 w-6 text-[#ff4757]" />
              <span className="font-bold">Wishlist</span>
              {wishlistItems.length > 0 ? (
                <span className="absolute -right-3 -top-2 rounded-full bg-[#ff4757] px-1.5 text-[10px] font-black text-white">
                  {wishlistItems.length}
                </span>
              ) : null}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-[#355478] bg-[#133154] lg:hidden"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="mobile-panel border-t border-[#233e5f] bg-[#112d4d] px-4 pb-4 pt-3 lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (currentUser) {
                    onLogout()
                  } else {
                    openAuthModal("login")
                  }
                }}
                className="rounded-lg border border-[#2f4f73] px-3 py-2 text-left text-sm"
              >
                {currentUser ? "Logout" : "Account"}
              </button>
              <button
                type="button"
                onClick={() => setStatusText("Language selector opened.")}
                className="rounded-lg border border-[#2f4f73] px-3 py-2 text-left text-sm"
              >
                Language
              </button>
              <button
                type="button"
                onClick={() => runWithAuth(() => setCartOpen((prev) => !prev))}
                className="rounded-lg border border-[#2f4f73] px-3 py-2 text-left text-sm"
              >
                Bag
              </button>
              <button
                type="button"
                onClick={() => runWithAuth(() => setWishlistOpen((prev) => !prev))}
                className="rounded-lg border border-[#2f4f73] px-3 py-2 text-left text-sm"
              >
                Wishlist
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(true)
                  setStatusText("All options opened.")
                }}
                className="rounded-lg border border-[#2f4f73] px-3 py-2 text-left text-sm"
              >
                All Menu
              </button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <button
                  key={`m-${item}`}
                  type="button"
                  onClick={() => {
                    onNavSelect(item)
                  }}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    activeNav === item ? "bg-[#ffcc66] text-[#0f2740]" : "bg-[#1d4268] text-[#d9e5f4]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="relative z-[160] border-t border-[#223958] bg-[#123154]">
          <div className="mx-auto flex max-w-[1600px] items-center gap-4 overflow-x-auto overflow-y-visible px-4 py-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex shrink-0 items-center gap-2 rounded-md border border-[#36577d] px-3 py-1.5 text-sm font-semibold transition hover:bg-[#20446a]"
              >
                <Menu className="h-4 w-4" />
                All
              </button>
            </div>

            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onNavSelect(item)
                }}
                className={`shrink-0 text-[1rem] font-medium ${
                  activeNav === item ? "text-[#ffcc66]" : "text-[#dce6f5] hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[#264064] bg-[#173b61] px-4 py-1.5 text-sm text-[#d4e1f1]">
          <div className="mx-auto max-w-[1600px]">{statusText}</div>
        </div>
      </header>

      {menuOpen ? (
        <section className="fixed inset-0 z-[230]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <aside className="menu-pop absolute left-0 top-0 h-full w-full max-w-[360px] overflow-y-auto bg-[#eef1f5] text-[#1a2535] shadow-[12px_0_30px_rgba(0,0,0,0.32)]">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#1f334d] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <UserRound className="h-6 w-6" />
                <p className="text-2xl font-bold leading-none">
                  {currentUser ? `Hello, ${currentUser.name}` : "Hello, sign in"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-md border border-white/40 bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4">
              <p className="border-b border-[#d5dce7] pb-3 text-sm font-bold uppercase tracking-[0.12em] text-[#50647e]">
                Quick Options
              </p>
              <div className="mt-2 space-y-1">
                {allMenuOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (option === "Cart Items") {
                        runWithAuth(() => setCartOpen(true))
                      } else if (option === "Order List") {
                        window.location.href = "/orders"
                      } else if (option === "User Account" && !currentUser) {
                        openAuthModal("login")
                      } else {
                        setStatusText(`${option} opened.`)
                      }
                      setMenuOpen(false)
                    }}
                    className="block w-full rounded-lg px-3 py-3 text-left text-base font-semibold text-[#17344f] transition hover:bg-[#dde6f2]"
                  >
                    {option}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      onLogout()
                    } else {
                      openAuthModal("login")
                    }
                    setMenuOpen(false)
                  }}
                  className="block w-full rounded-lg px-3 py-3 text-left text-base font-semibold text-[#17344f] transition hover:bg-[#dde6f2]"
                >
                  {currentUser ? "Logout" : "Login / Signup"}
                </button>
              </div>
            </div>
          </aside>
        </section>
      ) : null}

      {authModalOpen ? (
        <section className="fixed inset-0 z-[80] grid place-items-center bg-[#0a1425]/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#d4deec] bg-white shadow-[0_30px_70px_rgba(8,20,42,0.36)] md:grid md:grid-cols-[0.95fr_1.05fr]">
            <aside className="hidden bg-[linear-gradient(145deg,#102944_0%,#1c446f_56%,#2a5d90_100%)] p-8 text-white md:block">
              <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-[0.12em]">
                FLUXCART MEMBER ACCESS
              </p>
              <h2 className="mt-6 text-4xl font-black leading-tight">
                {authMode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#d2e0f3]">
                Secure checkout, quick cart sync, and members-only order tracking. Sign in to
                continue shopping.
              </p>
              <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b9cee8]">
                  Why Join
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[#ecf4ff]">
                  <li>- Save cart and checkout instantly</li>
                  <li>- Track and manage orders</li>
                  <li>- Get personalized offers</li>
                </ul>
              </div>
            </aside>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5d7390]">
                    Secure Access
                  </p>
                  <h3 className="mt-1 text-3xl font-black text-[#142438]">
                    {authMode === "login" ? "Log In" : "Sign Up"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(false)}
                  className="rounded-lg border border-[#d1dbe9] px-2 py-1 text-sm font-semibold text-[#264260] transition hover:bg-[#f4f8ff]"
                >
                  Close
                </button>
              </div>

              <p className="mt-2 text-sm text-[#506178]">
                You must be logged in to add products to cart or buy.
              </p>

              <div className="mt-5 grid grid-cols-2 rounded-xl border border-[#d8e1ee] bg-[#f3f7fc] p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    authMode === "login"
                      ? "bg-white text-[#132b45] shadow-sm"
                      : "text-[#4c6380] hover:text-[#18304a]"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    authMode === "signup"
                      ? "bg-white text-[#132b45] shadow-sm"
                      : "text-[#4c6380] hover:text-[#18304a]"
                  }`}
                >
                  Signup
                </button>
              </div>

              <form onSubmit={onAuthSubmit} className="mt-5 space-y-4">
                {authMode === "signup" ? (
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-[#20354c]">
                      Full Name
                    </span>
                    <input
                      value={authName}
                      onChange={(event) => setAuthName(event.target.value)}
                      className="w-full rounded-xl border border-[#cad6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#4a78ac] focus:ring-2 focus:ring-[#d5e5fb]"
                      placeholder="Enter your name"
                      required={authMode === "signup"}
                    />
                  </label>
                ) : null}

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-[#20354c]">Email</span>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                    className="w-full rounded-xl border border-[#cad6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#4a78ac] focus:ring-2 focus:ring-[#d5e5fb]"
                    placeholder="name@example.com"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-[#20354c]">Password</span>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                    className="w-full rounded-xl border border-[#cad6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#4a78ac] focus:ring-2 focus:ring-[#d5e5fb]"
                    placeholder="Enter password"
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[linear-gradient(135deg,#193d63_0%,#245887_100%)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(24,59,96,0.28)] transition hover:brightness-110"
                >
                  {authMode === "login" ? "Continue to Account" : "Create Account"}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-[#536783]">
                {authMode === "login" ? "New here?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  className="font-bold text-[#173f68] underline underline-offset-2"
                >
                  {authMode === "login" ? "Create account" : "Log in"}
                </button>
              </p>

              {authError ? (
                <p className="mt-3 rounded-lg border border-[#f0c6c6] bg-[#fff6f6] px-3 py-2 text-sm font-semibold text-[#9a2d2d]">
                  {authError}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {cartOpen ? (
        <section className="mx-auto mt-3 max-w-[1400px] px-4 pb-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h1 className="text-3xl font-black text-[#13283f]">Shopping Cart</h1>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="rounded-md border border-[#cad8ea] px-4 py-2 text-sm font-semibold text-[#203a58] hover:bg-[#f5f8fd]"
            >
              Continue Shopping
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="rounded-lg border border-[#d9e3ef] bg-[#f7faff] px-6 py-12 text-center">
              <p className="text-lg font-semibold text-[#39526d]">Your cart is empty</p>
              <p className="mt-2 text-sm text-[#506178]">Add products to continue shopping</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
              {/* Cart Items Section */}
              <div className="rounded-lg border border-[#d4deec] bg-white p-6 shadow-[0_2px_8px_rgba(8,20,42,0.08)]">
                <div className="pb-4 border-b border-[#e2e8f1]">
                  <p className="text-sm font-semibold text-[#506178]">
                    {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
                  </p>
                </div>

                <div className="mt-6 space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-6 border-b border-[#e8eef7] last:border-0 last:pb-0">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-[#f5f8fd]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-[#1b2737]">{item.name}</h3>
                        <p className="mt-1 text-xs text-[#506178]">{item.kind}</p>

                        <div className="mt-3 flex items-center gap-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#506178]">Qty:</span>
                            <select
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value);
                                if (newQty > item.quantity) {
                                  for (let i = 0; i < newQty - item.quantity; i++) {
                                    onAddToCart(item);
                                  }
                                } else if (newQty < item.quantity) {
                                  for (let i = 0; i < item.quantity - newQty; i++) {
                                    onRemoveFromCart(item.id);
                                  }
                                }
                              }}
                              className="rounded-md border border-[#cad8ea] bg-white px-2 py-1 text-sm font-semibold text-[#1f2b3d] outline-none"
                            >
                              {Array.from({ length: 20 }, (_, i) => i + 1).map((qty) => (
                                <option key={qty} value={qty}>
                                  {qty}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => {
                              for (let i = 0; i < item.quantity; i++) {
                                onRemoveFromCart(item.id);
                              }
                            }}
                            className="text-sm font-semibold text-[#0066c0] hover:text-[#c45500] hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-[#0a3358]">
                          Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                        <p className="mt-1 text-xs text-[#506178]">
                          Rs. {item.price} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="h-fit rounded-lg border border-[#d4deec] bg-[#fffbf0] p-6 shadow-[0_2px_8px_rgba(8,20,42,0.08)]">
                <h2 className="text-xl font-bold text-[#13283f]">Order Summary</h2>

                <div className="mt-6 space-y-4 border-b border-[#e2e8f1] pb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#506178]">Subtotal:</span>
                    <span className="text-sm font-semibold text-[#1b2737]">
                      Rs. {cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#506178]">Shipping:</span>
                    <span className="text-sm font-semibold text-[#1b2737]">
                      {cartTotal > 500 ? (
                        <span className="text-[#2d7a3e]">FREE</span>
                      ) : (
                        <span>Rs. 50</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-[#506178]">Estimated Tax:</span>
                    <span className="text-sm font-semibold text-[#1b2737]">
                      Rs. {Math.round(cartTotal * 0.18).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between border-b border-[#e2e8f1] pb-4">
                  <span className="font-bold text-[#13283f]">Total:</span>
                  <span className="text-2xl font-black text-[#0a3358]">
                    Rs. {(
                      cartTotal +
                      (cartTotal > 500 ? 0 : 50) +
                      Math.round(cartTotal * 0.18)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>

                {checkoutOpen ? (
                  <div className="mt-6 space-y-4 rounded-xl border border-[#dfe4ee] bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-[#13283f]">Shipping & Payment</h3>
                      <button
                        type="button"
                        onClick={() => setCheckoutOpen(false)}
                        className="text-xs font-semibold text-[#4b5c75] hover:text-[#1f2b3d]"
                      >
                        Back to summary
                      </button>
                    </div>

                    <div className="grid gap-3">
                      <input
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        placeholder="Full name"
                        className="rounded-lg border border-[#cdd8e8] bg-[#f7f9fc] px-3 py-2 text-sm outline-none"
                      />
                      <input
                        value={shippingLine1}
                        onChange={(e) => setShippingLine1(e.target.value)}
                        placeholder="Address line 1"
                        className="rounded-lg border border-[#cdd8e8] bg-[#f7f9fc] px-3 py-2 text-sm outline-none"
                      />
                      <input
                        value={shippingLine2}
                        onChange={(e) => setShippingLine2(e.target.value)}
                        placeholder="Address line 2 (optional)"
                        className="rounded-lg border border-[#cdd8e8] bg-[#f7f9fc] px-3 py-2 text-sm outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          placeholder="City"
                          className="rounded-lg border border-[#cdd8e8] bg-[#f7f9fc] px-3 py-2 text-sm outline-none"
                        />
                        <input
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          placeholder="State"
                          className="rounded-lg border border-[#cdd8e8] bg-[#f7f9fc] px-3 py-2 text-sm outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={shippingPostal}
                          onChange={(e) => setShippingPostal(e.target.value)}
                          placeholder="Postal code"
                          className="rounded-lg border border-[#cdd8e8] bg-[#f7f9fc] px-3 py-2 text-sm outline-none"
                        />
                        <input
                          value={shippingCountry}
                          onChange={(e) => setShippingCountry(e.target.value)}
                          placeholder="Country"
                          className="rounded-lg border border-[#cdd8e8] bg-[#f7f9fc] px-3 py-2 text-sm outline-none"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-[#4b5c75]">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as "cod" | "card")}
                          className="rounded-lg border border-[#cdd8e8] bg-[#f7f9fc] px-3 py-2 text-sm outline-none"
                        >
                          <option value="cod">Cash on Delivery</option>
                          <option value="card">Credit / Debit Card (mock)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={onCheckoutClick}
                        className="mt-2 w-full rounded-lg bg-[#ffcc66] px-4 py-3 text-base font-bold text-[#10253d] shadow-[0_2px_5px_rgba(0,0,0,0.15)] hover:bg-[#ffb848] transition"
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCheckoutOpen(true)}
                      className="mt-4 w-full rounded-lg bg-[#ffcc66] px-4 py-3 text-base font-bold text-[#10253d] shadow-[0_2px_5px_rgba(0,0,0,0.15)] hover:bg-[#ffb848] transition"
                    >
                      Proceed to Checkout
                    </button>
                    {lastOrderId ? (
                      <p className="mt-2 text-xs text-[#1b2737]">
                        Last order placed: <strong>#{lastOrderId}</strong>. <a href={`/orders/${lastOrderId}`} className="text-[#0056b3] underline">View order</a>
                      </p>
                    ) : null}
                  </>
                )}

                {cartTotal > 500 ? (
                  <div className="mt-3 rounded-lg border border-[#2d7a3e] bg-[#ebf5eb] px-3 py-2">
                    <p className="text-xs font-semibold text-[#2d7a3e]">
                      ✓ Free shipping on your order!
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border border-[#d4a574] bg-[#fef5eb] px-3 py-2">
                    <p className="text-xs font-semibold text-[#8b5a2b]">
                      Add Rs. {(500 - cartTotal).toLocaleString('en-IN')} more for free shipping
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      ) : null}

      <main className="mx-auto max-w-[1600px] px-4 pb-10 pt-4">
        <section
          className="fade-in-up relative overflow-hidden rounded-3xl border border-[#d3dceb] bg-[linear-gradient(120deg,#f7daa0_0%,#f1d6a9_45%,#e9c0db_100%)] p-6 md:p-10"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-white/40 blur-2xl" />
          <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-[#d6f08f]/45 blur-3xl" />

          <div className="relative z-10 grid items-center gap-6 md:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="text-sm font-bold tracking-[0.2em] text-[#14324f]">{heroSlides[heroIndex].category.toUpperCase()}</p>
              <h1 className="mt-3 text-5xl font-black leading-[0.95] text-[#0f2c47] md:text-7xl">
                {heroSlides[heroIndex].title}
              </h1>
              <p className="mt-3 text-xl font-medium text-[#163a5c]">{heroSlides[heroIndex].subtitle}</p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#143654] shadow">
                <Sparkles className="h-4 w-4" />
                Explore Deals
              </button>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => goHero("prev")}
                  className="rounded-full bg-white/80 p-2 text-[#1c3450]"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => goHero("next")}
                  className="rounded-full bg-white/80 p-2 text-[#1c3450]"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              <p className="mt-3 text-xs font-semibold text-[#2b4763]">
                {heroPaused ? "Auto-slide paused" : "Auto-slide running"}
              </p>
            </div>

            <div className="hero-float relative aspect-[16/10] overflow-hidden rounded-2xl border-4 border-[#d8f989] bg-white/70">
              {heroProduct ? (
                <Image src={heroProduct.image} alt={heroProduct.name} fill unoptimized className="object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-sm font-semibold text-[#23415e]">
                  Loading featured product...
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="-mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`skeleton-${index + 1}`}
                  className="h-[240px] animate-pulse rounded-xl border border-[#d6dde8] bg-white/65"
                />
              ))
            : products
                .slice(0, 5)
                .map((item) => (
                  <ProductTile
                    key={item.id}
                    item={item}
                    onAddToCart={(product) => runWithAuth(() => onAddToCart(product))}
                    onBuyNow={(product) => runWithAuth(() => onBuyNow(product))}
                  />
                ))}
        </section>

        <section className="mt-7 rounded-2xl border border-[#d4deec] bg-white p-5 shadow-[0_8px_24px_rgba(8,20,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-black text-[#13283f]">All Products</h2>
            <div className="flex items-center gap-3">
              <p className="text-sm text-[#4e5f75]">
                {products.length} items | {grouped.length} categories
              </p>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-[#cdd8e8] bg-white px-3 py-1.5 text-sm font-semibold text-[#18304a]"
                aria-label="Sort products"
              >
                <option>Newest</option>
                <option>Price low-high</option>
                <option>Price high-low</option>
                <option>Category</option>
              </select>
              {errorText ? (
                <button
                  type="button"
                  onClick={() => void fetchProducts()}
                  className="rounded-lg border border-[#d46e6e] bg-[#fff4f4] px-3 py-1.5 text-xs font-semibold text-[#8c2f2f]"
                >
                  Retry
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-8">
            {errorText ? (
              <div className="rounded-xl border border-[#f1b6b6] bg-[#fff7f7] px-4 py-3 text-sm font-medium text-[#8c2f2f]">
                {errorText}
              </div>
            ) : null}
            {!isLoading && !errorText && products.length === 0 ? (
              <div className="rounded-xl border border-[#d9e3ef] bg-[#f7faff] px-4 py-7 text-center text-sm font-medium text-[#39526d]">
                No products found for your current filters.
              </div>
            ) : null}
            {grouped.map((bucket) => (
              <div key={bucket.category}>
                <h3 className="text-lg font-bold text-[#10263d]">{bucket.category}</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {bucket.items.map((item) => (
                    <ProductTile
                      key={item.id}
                      item={item}
                      onAddToCart={(product) => runWithAuth(() => onAddToCart(product))}
                      onBuyNow={(product) => runWithAuth(() => onBuyNow(product))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Wishlist Section */}
      {wishlistOpen ? (
        <section className="mx-auto mt-3 max-w-[1400px] px-4 pb-8">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h1 className="text-3xl font-black text-[#13283f]">My Wishlist</h1>
            <button
              type="button"
              onClick={() => setWishlistOpen(false)}
              className="rounded-md border border-[#cad8ea] px-4 py-2 text-sm font-semibold text-[#203a58] hover:bg-[#f5f8fd]"
            >
              Back to Shopping
            </button>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="rounded-lg border border-[#d9e3ef] bg-[#f7faff] px-6 py-12 text-center">
              <Heart className="mx-auto h-16 w-16 text-[#ddd]" />
              <p className="mt-4 text-lg font-semibold text-[#39526d]">Your wishlist is empty</p>
              <p className="mt-2 text-sm text-[#506178]">Add products to your wishlist for later</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {products
                .filter((item) => wishlistItems.includes(item.id))
                .map((item) => (
                  <ProductTile
                    key={item.id}
                    item={item}
                    onAddToCart={(product) => runWithAuth(() => onAddToCart(product))}
                    onBuyNow={(product) => runWithAuth(() => onBuyNow(product))}
                  />
                ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Professional Footer */}
      <footer className="mt-12 border-t border-[#e2e8f1] bg-[#1a2f4a] text-white">
        <div className="mx-auto max-w-[1600px] px-4 py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* About */}
            <div>
              <h3 className="text-lg font-bold">About FluxCart</h3>
              <ul className="mt-4 space-y-2 text-sm text-[#b8cbe3]">
                <li><button className="hover:text-white transition">About Us</button></li>
                <li><button className="hover:text-white transition">Careers</button></li>
                <li><button className="hover:text-white transition">Blog</button></li>
                <li><button className="hover:text-white transition">Press</button></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-bold">Customer Service</h3>
              <ul className="mt-4 space-y-2 text-sm text-[#b8cbe3]">
                <li><button className="hover:text-white transition">Contact Us</button></li>
                <li><button className="hover:text-white transition">FAQ</button></li>
                <li><button className="hover:text-white transition">Track Orders</button></li>
                <li><button className="hover:text-white transition">Return Policy</button></li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h3 className="text-lg font-bold">Policies</h3>
              <ul className="mt-4 space-y-2 text-sm text-[#b8cbe3]">
                <li><button className="hover:text-white transition">Privacy Policy</button></li>
                <li><button className="hover:text-white transition">Terms & Conditions</button></li>
                <li><button className="hover:text-white transition">Shipping Info</button></li>
                <li><button className="hover:text-white transition">Accessibility</button></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-lg font-bold">Connect With Us</h3>
              <p className="mt-4 text-sm text-[#b8cbe3]">Follow us on social media</p>
              <div className="mt-3 flex gap-3">
                <button className="rounded-full bg-[#3b5998] px-3 py-2 text-sm font-semibold hover:bg-[#2d4373] transition">
                  f
                </button>
                <button className="rounded-full bg-[#1da1f2] px-3 py-2 text-sm font-semibold hover:bg-[#1a8cd8] transition">
                  𝕏
                </button>
                <button className="rounded-full bg-[#e1306c] px-3 py-2 text-sm font-semibold hover:bg-[#c13584] transition">
                  IG
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 border-t border-[#2d4565] pt-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <Truck className="h-6 w-6 text-[#ffcc66] flex-shrink-0" />
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-sm text-[#b8cbe3]">On orders over Rs. 500</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-[#ffcc66] flex-shrink-0" />
                <div>
                  <p className="font-semibold">Secure Payment</p>
                  <p className="text-sm text-[#b8cbe3]">100% secure transactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-[#ffcc66] flex-shrink-0" />
                <div>
                  <p className="font-semibold">Great Support</p>
                  <p className="text-sm text-[#b8cbe3]">24/7 customer service</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-[#8a9ab8]">
              <p>&copy; 2026 FluxCart. All rights reserved. Made with ❤️</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

