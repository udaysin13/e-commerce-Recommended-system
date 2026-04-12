# System Architecture - Complete Overview

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER BROWSER                              │
├─────────────────────────────────────────────────────────────┤
│
│  ┌──────────────────────────────────────────────────────┐
│  │         FRONTEND (React/Next.js)                     │
│  │  URL: http://localhost:3000                          │
│  └──────────────────────────────────────────────────────┘
│         ↓ HTTP/JSON
│  
├─────────────────────────────────────────────────────────────┤
│               INTERNET / LOCAL NETWORK                        │
├─────────────────────────────────────────────────────────────┤
│         ↓ REST API calls to /api endpoints
│
│  ┌──────────────────────────────────────────────────────┐
│  │      BACKEND API (Node.js/Express)                  │
│  │  URL: http://localhost:3000/api                     │
│  ├──────────────────────────────────────────────────────┤
│  │  Endpoints:                                          │
│  │  • GET /products - List products                    │
│  │  • GET /enhanced-recommendations/:userId            │
│  │  • POST /cart, POST /orders                         │
│  ├──────────────────────────────────────────────────────┤
│  │         ↓
│  │  ┌─────────────────────────────────────────────────┐
│  │  │  RECOMMENDATION ENGINE                          │
│  │  ├─────────────────────────────────────────────────┤
│  │  │  4 Algorithms:                                  │
│  │  │  1. Hybrid (default)                           │
│  │  │  2. Collaborative Filtering                    │
│  │  │  3. Content-Based                              │
│  │  │  4. Trending                                   │
│  │  ├─────────────────────────────────────────────────┤
│  │  │         ↓
│  │  │  ┌──────────────────────────────────────────┐
│  │  │  │ SCORING SERVICE                          │
│  │  │  │ • Calculate recommendation scores        │
│  │  │  │ • Apply algorithm weights                │
│  │  │  │ • Filter & rank results                  │
│  │  │  │ • Generate explanations                  │
│  │  │  │ • Track metrics                          │
│  │  │  └──────────────────────────────────────────┘
│  │  │         ↓
│  │  │  ┌──────────────────────────────────────────┐
│  │  │  │ USER INTERACTIONS TABLE                  │
│  │  │  │ • Views: weight 1.0                      │
│  │  │  │ • Wishlist: weight 3.0                   │
│  │  │  │ • Purchases: weight 5.0                  │
│  │  │  └──────────────────────────────────────────┘
│  │  └─────────────────────────────────────────────────┘
│  │         ↓
│  │  ┌─────────────────────────────────────────────────┐
│  │  │  DATABASE (Prisma + SQLite)                    │
│  │  │  Tables:                                       │
│  │  │  • Products                                    │
│  │  │  • Users                                       │
│  │  │  • UserInteractions                           │
│  │  │  • Orders                                     │
│  │  │  • Cart                                       │
│  │  └─────────────────────────────────────────────────┘
│  │
│  └──────────────────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                  │
├──────────────────────────────────────────────────────────────┤
│
│  ┌─────────────────────────────────────────────────────────┐
│  │  PAGES (Next.js App Router)                            │
│  ├─────────────────────────────────────────────────────────┤
│  │  /                    → HomePageEnhanced               │
│  │  /products            → ProductsPage                   │
│  │  /products/:id        → ProductDetailPage             │
│  │  /cart                → CartPage                       │
│  │  /wishlist            → WishlistPage (NEW)            │
│  │  /login               → LoginPage                      │
│  └─────────────────────────────────────────────────────────┘
│           ↓ USE
│  ┌─────────────────────────────────────────────────────────┐
│  │  COMPONENTS (React)                                    │
│  ├─────────────────────────────────────────────────────────┤
│  │  Header                                               │
│  │   ├── Logo & Branding                                │
│  │   ├── Navigation (Home, Products, Wishlist, About)   │
│  │   ├── Search Input                                    │
│  │   ├── Cart Badge (updates on changes)               │
│  │   └── Wishlist Badge (NEW - updates on changes)     │
│  │                                                       │
│  │  Footer                                               │
│  │   ├── Company Info                                   │
│  │   ├── Shop Links                                     │
│  │   ├── Support Links                                  │
│  │   └── Newsletter Signup                              │
│  │                                                       │
│  │  ProductCard                                          │
│  │   ├── Image (lazy loaded)                            │
│  │   ├── Rating (1-5 stars)                            │
│  │   ├── Price                                          │
│  │   ├── Wishlist Button                               │
│  │   ├── Add to Cart Button                            │
│  │   └── Stock Indicator                               │
│  │                                                       │
│  │  RecommendationsSection                              │
│  │   ├── 4 Algorithm Buttons                           │
│  │   │   ├── Hybrid (default)                         │
│  │   │   ├── Collaborative                            │
│  │   │   ├── Content-Based                            │
│  │   │   └── Trending                                 │
│  │   ├── Product Grid                                 │
│  │   ├── Loading Skeleton                             │
│  │   ├── Error State                                  │
│  │   └── Empty State                                  │
│  │                                                       │
│  │  HomePageEnhanced                                    │
│  │   ├── Hero Section (with parallax)                 │
│  │   ├── Stats Display                                │
│  │   ├── Features Grid                                │
│  │   ├── How-It-Works (4 steps)                      │
│  │   └── Trending Products                            │
│  │                                                       │
│  │  CartClient                                          │
│  │   ├── Item List                                     │
│  │   ├── Quantity Controls                             │
│  │   ├── Order Summary                                 │
│  │   └── Checkout Button                               │
│  │                                                       │
│  │  (More utility components...)                        │
│  └─────────────────────────────────────────────────────────┘
│           ↓ USE
│  ┌─────────────────────────────────────────────────────────┐
│  │  LIBRARIES / UTILITIES                                 │
│  ├─────────────────────────────────────────────────────────┤
│  │                                                         │
│  │  recommendationApi.js (NEW)                           │
│  │   ├── getRecommendations()                           │
│  │   │   └── Calls /api/enhanced-recommendations/:id   │
│  │   ├── getRecommendationDetails()                    │
│  │   ├── getRecommendationsWithFallback()              │
│  │   ├── batchGetRecommendations()                     │
│  │   ├── getCachedRecommendations()                    │
│  │   ├── setCachedRecommendations()                    │
│  │   └── isRecommendationApiAvailable()                │
│  │                                                       │
│  │  api.js                                              │
│  │   ├── getAllProducts()                              │
│  │   ├── getProductById()                              │
│  │   ├── getCart()                                     │
│  │   ├── addToCart()                                   │
│  │   └── createOrder()                                 │
│  │                                                       │
│  │  auth.js                                             │
│  │   ├── getCurrentUserId()                            │
│  │   ├── login()                                       │
│  │   └── isAuthenticated()                             │
│  │                                                       │
│  │  cart.js                                             │
│  │   ├── getCartItems()                                │
│  │   ├── addCartItem()                                 │
│  │   ├── updateCartItemQuantity()                      │
│  │   ├── removeCartItem()                              │
│  │   └── clearCart()                                   │
│  │                                                       │
│  │  utils.js                                            │
│  │   ├── formatPrice()                                 │
│  │   ├── formatDate()                                  │
│  │   ├── truncateText()                                │
│  │   └── formatRating()                                │
│  │                                                       │
│  └─────────────────────────────────────────────────────────┘
│           ↓ FETCH/USE
│  ┌─────────────────────────────────────────────────────────┐
│  │  STATE MANAGEMENT (React Hooks)                        │
│  ├─────────────────────────────────────────────────────────┤
│  │  useState                                             │
│  │   ├── Component state (loading, error, data)         │
│  │   ├── UI state (modal, menu open/closed)            │
│  │   └── Form state (input values)                      │
│  │                                                       │
│  │  useEffect                                            │
│  │   ├── Fetch data on mount                           │
│  │   ├── Listen to storage events                       │
│  │   └── Cleanup on unmount                             │
│  │                                                       │
│  │  Custom Hooks                                        │
│  │   ├── useRecommendations()                          │
│  │   ├── useCart()                                     │
│  │   └── useWishlist()                                 │
│  │                                                       │
│  └─────────────────────────────────────────────────────────┘
│           ↓ INTERACT WITH
│  ┌─────────────────────────────────────────────────────────┐
│  │  LOCAL STORAGE                                         │
│  ├─────────────────────────────────────────────────────────┤
│  │  localStorage['cart']     → [{ id, name, qty, ... }] │
│  │  localStorage['wishlist'] → [{ id, name, ... }]      │
│  │  localStorage['userId']   → 'user123'                │
│  │                                                       │
│  └─────────────────────────────────────────────────────────┘
│           ↓ PERSIST DATA VIA
│  ┌─────────────────────────────────────────────────────────┐
│  │  FETCH API (HTTP Requests)                            │
│  ├─────────────────────────────────────────────────────────┤
│  │  GET  /api/products                                  │
│  │  GET  /api/products/:id                              │
│  │  GET  /api/enhanced-recommendations/:userId         │
│  │  GET  /api/cart/:userId                             │
│  │  POST /api/cart/:userId                             │
│  │  POST /api/orders/:userId                           │
│  │                                                       │
│  └─────────────────────────────────────────────────────────┘
│
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Views Products Page

```
User opens /products
         ↓
ProductsPage component mounted
         ↓
useEffect fetches:
  1. GET /api/products → Products list
  2. GET /api/enhanced-recommendations/user1 → Recommendations
         ↓
Parse responses:
  products[] loaded → ProductCard components render
  recommendations[] loaded → RecommendationsSection renders
         ↓
User filters by category
         ↓
filterProducts() updates filteredProducts[] state
         ↓
Component re-renders with filtered results
         ↓
User clicks algorithm button (e.g., "Collaborative")
         ↓
RecommendationsSection state updates: selectedAlgorithm = "collaborative"
         ↓
useEffect dependency on selectedAlgorithm triggers
         ↓
New request: GET /api/enhanced-recommendations/user1?algorithm=collaborative
         ↓
New recommendations displayed instantly
```

---

## Data Flow: User Adds to Cart

```
User clicks "Add to Cart" on ProductCard
         ↓
handleAddToCart(product) called
         ↓
1. Get existing cart from localStorage
   cart = JSON.parse(localStorage.getItem('cart'))
         ↓
2. Check if product already in cart
   if exists: quantity++
   if new: add to cart array
         ↓
3. Save updated cart to localStorage
   localStorage.setItem('cart', JSON.stringify(updatedCart))
         ↓
4. Dispatch custom event
   dispatchEvent(new CustomEvent('cartUpdated'))
         ↓
5. Header component listening to event:
   window.addEventListener('cartUpdated', updateCartCount)
         ↓
6. Cart badge count updates (no page refresh needed!)
         ↓
7. Show toast notification:
   "Added to cart! ✓"
```

---

## Recommendation Engine Data Flow

```
RecommendationsSection mounted with userId='user1'
         ↓
Call: getRecommendations('user1', { algorithm: 'hybrid' })
         ↓
recommendationApi.js:
  1. Check cache (getCachedRecommendations)
  2. If cache hit → return cached results
  3. If cache miss → fetch from API
         ↓
Fetch: GET /api/enhanced-recommendations/user1?algorithm=hybrid&limit=8
         ↓
Backend processes:
  1. Get user interactions (views, purchases, wishlist)
  2. Apply scoring formula for selected algorithm
  3. Rank products by score + diversity
  4. Generate explanation text
  5. Return top N results
         ↓
Frontend receives:
{
  success: true,
  data: [
    {
      id: "prod-456",
      name: "Headphones",
      score: 0.87,
      explanation: "You viewed similar audio products"
    },
    ...
  ],
  metadata: {
    algorithm: "hybrid",
    count: 8,
    executionTime: 145
  }
}
         ↓
Cache results:
setCachedRecommendations('user1', response, { algorithm: 'hybrid' })
         ↓
Render ProductCard components with recommendations
  + Show explanation in blue box
         ↓
User clicks "Collaborative" button
         ↓
State updates: selectedAlgorithm = 'collaborative'
         ↓
useEffect dependency triggers → Fetch new algorithm
         ↓
GET /api/enhanced-recommendations/user1?algorithm=collaborative
         ↓
New results displayed instantly
```

---

## Component Dependency Tree

```
Layout
├── Header
│   ├── Logo
│   ├── Navigation (Home, Products, Wishlist, About)
│   ├── Search Input
│   ├── Cart Icon with badge
│   └── Wishlist Icon with badge (NEW)
│
├── (Dynamic Page Content)
│   │
│   ├── HomePageEnhanced
│   │   ├── Hero Section
│   │   ├── Features Grid
│   │   ├── How It Works
│   │   └── RecommendationsSection
│   │       └── ProductCard[] (using recommendationApi)
│   │
│   ├── ProductsPage
│   │   ├── Filter UI (Category, Sort)
│   │   ├── ProductCard[] (from DB)
│   │   └── RecommendationsSection
│   │       └── ProductCard[] (using recommendationApi)
│   │
│   ├── ProductDetailPage
│   │   ├── Product Image
│   │   ├── Product Info
│   │   └── Related Products (RecommendationsSection)
│   │
│   ├── CartPage
│   │   ├── CartClient
│   │   │   ├── CartItem[]
│   │   │   └── Order Summary
│   │   └── Checkout Button
│   │
│   ├── WishlistPage (NEW)
│   │   ├── Filter UI (Sort)
│   │   ├── ProductCard[]
│   │   └── Bulk Actions
│   │
│   └── LoginPage
│       ├── Login Form
│       └── Signup Form
│
└── Footer
    ├── Company Info
    ├── Links (Shop, Support)
    ├── Newsletter Signup
    └── Legal Links

RecommendationsSection
├── Algorithm Buttons (Hybrid, Collaborative, Content, Trending)
├── Loading Skeleton OR
├── Error UI OR
├── Empty State OR
├── ProductCard[]
└── Metadata Footer

ProductCard
├── Image (Next.js Image - lazy loaded)
├── Category Label
├── Product Name
├── Description
├── Rating Stars
├── Price
├── Wishlist Button (heart icon)
├── Add to Cart Button
├── Stock Indicator
└── Explanation Box (blue)
```

---

## API Endpoints Map

```
Frontend
   ├─→ GET /api/products
   │   Returns: Product[]
   │   Used in: ProductsPage, ProductDetailPage
   │
   ├─→ GET /api/products/:id
   │   Returns: Product{full details}
   │   Used in: ProductDetailPage, Related products
   │
   ├─→ GET /api/enhanced-recommendations/:userId
   │   Params: algorithm, limit, includeExplanations
   │   Returns: { success, data[], metadata}
   │   Used in: RecommendationsSection (all algorithms)
   │
   ├─→ GET /api/enhanced-recommendations/:userId/details
   │   Returns: Detailed scoring breakdown
   │   Used in: Debug/admin pages
   │
   ├─→ GET /api/cart/:userId
   │   Returns: CartItem[]
   │   Used in: CartPage
   │
   ├─→ POST /api/cart/:userId
   │   Body: { productId, quantity }
   │   Returns: Updated cart
   │   Used in: ProductCard add, Frontend optimistic update
   │
   └─→ POST /api/orders/:userId
       Body: { items[], totals }
       Returns: Order confirmation
       Used in: Checkout flow
```

---

## Page Load Sequence

```
1. User visits http://localhost:3000
   └── Next.js loads layout.js
       └── Header renders (Header component)
       └── Footer renders (Footer component)

2. app/page.js renders (Landing Page)
   └── HomePageEnhanced mounts
       └── Hero Section renders
       └── Features Section renders
       └── How It Works renders
       └── useEffect triggers
           └── GET /api/enhanced-recommendations/user1
               └── RecommendationsSection updates
                   └── ProductCard[] renders (8 items)

3. User clicks "Products"
   └── Router navigates to /products
       └── ProductsPage mounts
           └── useEffect triggers (double request):
               ├── GET /api/products
               └── GET /api/enhanced-recommendations/user1
           └── Products grid renders
           └── RecommendationsSection renders

Subsequent loads:
   └── Check recommendationApi.js cache first
       ├── If cached < 1 hour: return cached data instantly
       └── If cache expired: fetch fresh data
```

---

## Error Handling Flow

```
API Call fails (network error, timeout, 500 error)
         ↓
recommendationApi.js catch() block:
  1. Log error to console
  2. Create user-friendly error message
  3. If first algorithm fails:
     └── Try fallback sequence:
         ├── Collaborative → Cache miss
         ├── Content-Based → Cache miss
         └── Trending → Cache miss
         └── If all fail: Return empty array
  4. Return { success: false, error: message }
         ↓
Component catch() block:
  1. Update state: setError(message)
  2. Update loading: setLoading(false)
         ↓
Conditional rendering:
  if (error) → Show error UI with red box
  else if (loading) → Show skeleton
  else if (data.length === 0) → Show empty state
  else → Show products
         ↓
User sees:
  "Unable to load recommendations. 
   Try a different algorithm or 
   refresh the page."
```

---

## Performance Optimization Flow

```
Image Loading
  ├── ProductCard Image mounts
  └── Next.js Image component:
      ├── Detects "above the fold" vs "below the fold"
      ├── Above: Load immediately
      ├── Below: Load on lazy intersection
      └── On render: scale-105 hover effect

Code Splitting
  ├── Next.js automatic per-page splitting
  ├── RecommendationsSection: separate chunk
  ├── ProductCard: separate chunk
  └── Result: Initial page smaller, fast load

API Caching
  ├── recommendationApi.js in-memory cache
  ├── TTL: 1 hour (3,600,000 ms)
  ├── Cache key: `${userId}_${algorithm}`
  └── On cache hit: Return instantly (< 5ms)

CSS Optimization
  ├── Tailwind CSS production build
  ├── Purges unused styles
  ├── Result: ~30KB gzipped
```

---

## Storage Architecture

```
Browser LocalStorage
│
├─ cart
│  └── [
│      { id, name, price, quantity, image, category },
│      ...
│      ]
│
├─ wishlist
│  └── [
│      { id, name, price, rating, image, category },
│      ...
│      ]
│
├─ userId
│  └── "user1"
│
└─ recommendations_cache
   └── {
       "user1_hybrid": { data[], timestamp },
       "user1_collaborative": { data[], timestamp },
       "user1_content": { data[], timestamp },
       "user1_trending": { data[], timestamp }
       }

Event System
│
├─ storage event
│  └── Fired when localStorage changes in other tab
│      └── Triggers: updateCartCount, updateWishlistCount
│
└─ Custom events
   ├─ cartUpdated
   │  └── Fired after cart modification
   │      └── Listener: Header cart badge update
   │
   └─ wishlistUpdated
      └── Fired after wishlist modification
          └── Listener: Header wishlist badge update
```

---

## Responsive Breakpoints

```
Mobile (320px - 640px)
├── Single column grid
├── Hamburger menu (collapsed)
├── Stack layout for all sections
├── Touch-optimized buttons
└── Simplified product display

Tablet (641px - 1024px)
├── Two column grid
├── Horizontal navigation
├── Balanced spacing
├── Optimized card sizes
└── Improved readability

Desktop (1025px+)
├── Four column grid
├── Full navigation visible
├── Premium spacing
├── Hover effects enabled
└── Optimized for larger screens
```

---

## Session Storage & Persistence

```
Session Start
│
├─ Load localStorage into React state
│  ├─ cart[] → useState
│  ├─ wishlist[] → useState
│  └─ userId → useState
│
├─ Initialize event listeners
│  ├─ storage events (cross-tab)
│  ├─ custom cartUpdated events
│  └─ custom wishlistUpdated events
│
└─ Set document title, meta tags

User Actions During Session
│
├─ Add to cart
│  ├─ Update state
│  ├─ Update localStorage
│  ├─ Trigger cartUpdated event
│  ├─ Header updates badge
│  └─ Show toast
│
├─ Add to wishlist
│  ├─ Update state
│  ├─ Update localStorage
│  ├─ Trigger wishlistUpdated event
│  ├─ Header updates badge
│  └─ Show heart icon fill
│
└─ Browse products
   ├─ Fetch from cache or API
   ├─ Update DOM
   └─ No persistence needed

Session End (Page Refresh)
│
├─ Data persists in localStorage
├─ Cart/wishlist items survive refresh
├─ Components re-read from localStorage
└─ No data loss
```

This complete architecture documentation shows how every piece fits together to deliver a production-ready e-commerce experience with intelligent recommendations! 🚀
