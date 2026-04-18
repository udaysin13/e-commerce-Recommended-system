# Frontend Architecture & Component Guide

## 📋 Overview

The ShopWise e-commerce frontend is built with **Next.js 16** and **React 19**, featuring a modern, scalable architecture with reusable components, Tailwind CSS styling, and production-ready code.

---

## 🏗️ Folder Structure

```
frontend/
├── app/                           # Next.js App Router
│   ├── layout.js                 # Root layout with Navbar & Footer
│   ├── page.js                   # Home page entry
│   ├── globals.css               # Global styles & Tailwind
│   │
│   ├── cart/
│   │   └── page.js              # Shopping cart page
│   │
│   ├── login/
│   │   └── page.js              # Login page
│   │
│   └── products/
│       └── [id]/
│           └── page.js          # Product detail page (dynamic)
│
├── components/                    # Reusable React Components
│   ├── Navbar.js                # Navigation bar
│   ├── ProductCard.js           # Product card with ratings, badges
│   ├── ProductImage.js          # Next.js Image component wrapper
│   │
│   ├── HeroSection.js           # Hero banner
│   ├── FeaturedProducts.js      # Featured products section
│   ├── RecommendationSection.js # Recommended products
│   ├── TestimonialSection.js    # Customer testimonials
│   ├── FeaturesSection.js       # Features/benefits section
│   ├── CategoryGrid.js          # Category selection
│   │
│   ├── HomeClient.js            # Original home component (deprecated)
│   ├── HomeClientEnhanced.js    # Enhanced home with all features
│   │
│   ├── CartClient.js            # Shopping cart logic
│   ├── LoginClient.js           # Login form
│   ├── LoadingGrid.js           # Loading skeleton
│   └── ProductDetailClient.js   # Product detail logic
│
├── lib/
│   ├── api.js                   # API client & endpoints
│   ├── cart.js                  # Cart utilities
│   ├── utils.js                 # Helper functions
│   └── dummyData.js             # Fallback mock data
│
├── public/                        # Static assets
├── next.config.mjs              # Next.js configuration
├── jsconfig.json                # JS path aliases
├── postcss.config.mjs           # Tailwind configuration
├── package.json
└── README.md
```

---

## 🎨 Key Components

### 1. **ProductCard** - Product Display
Enhanced product card with ratings, discounts, badges, and stock status.

**Props:**
```javascript
<ProductCard 
  product={{
    id: 1,
    name: "Product Name",
    price: 1999,
    rating: 4.5,
    reviews: 234,
    discount: 20,
    badge: "Best Seller",
    imageUrl: "...",
    category: "Electronics",
    inStock: true
  }}
  caption="Optional description override"
/>
```

**Features:**
- ⭐ Star ratings with review count
- 🏷️ Dynamic badge system
- 💰 Price with discount display
- 📦 Stock indicator
- 🔗 Link to product details

---

### 2. **Navbar** - Navigation
Sticky navigation bar with search, categories, and cart access.

**Features:**
- Search functionality
- Category filtering
- Responsive design
- Link to cart and login

---

### 3. **HeroSection** - Hero Banner
Eye-catching hero section with CTA buttons and statistics.

**Features:**
- Gradient background with animations
- Statistics display (products, customers, rating)
- Call-to-action buttons
- Responsive layout

---

### 4. **FeaturedProducts** - Product Grid
Featured products section with heading and "View All" link.

**Props:**
```javascript
<FeaturedProducts 
  products={productArray}
  title="Featured Products"
  subtitle="Most popular items"
/>
```

---

### 5. **RecommendationSection** - AI Recommendations
Personalized product recommendations with custom captions.

**Props:**
```javascript
<RecommendationSection
  title="Recommended for You"
  subtitle="Based on your interests"
  products={recommendedProducts}
/>
```

---

### 6. **CategoryGrid** - Category Selection
Interactive category selection with visual feedback.

**Props:**
```javascript
<CategoryGrid 
  categories={["Electronics", "Fashion", "Home", "Beauty"]}
  onCategorySelect={(category) => handleSelect(category)}
  activeCategory={activeCategory}
/>
```

---

### 7. **TestimonialSection** - Social Proof
Customer testimonials with ratings and avatars.

**Features:**
- 5-star ratings
- Customer name, role, feedback
- Emoji avatars
- Grid layout (responsive)

---

### 8. **FeaturesSection** - Trust Signals
Key features/benefits with icons.

**Features:**
- 🚚 Fast Delivery
- 🔒 Secure Payment
- ↩️ Easy Returns
- 💬 24/7 Support

---

### 9. **LoadingGrid** - Skeleton Loader
Animated loading skeleton for products.

**Props:**
```javascript
<LoadingGrid count={8} />  // Number of skeleton cards
```

---

## 📊 Data Flow

### Using API (Production)
```
Frontend Component
  ↓
lib/api.js (fetchProducts, fetchRecommendations)
  ↓
Backend API (port 5000)
  ↓
Database / Services
  ↓
Response with data
  ↓
Component renders
```

### Using Dummy Data (Development/Fallback)
```
Frontend Component
  ↓
lib/dummyData.js
  ↓
dummyProducts array
  ↓
Filter/Sort functions
  ↓
Display products
```

---

## 💾 Dummy Data Structure

Located in `lib/dummyData.js`:

```javascript
const dummyProducts = [
  {
    id: 1,
    name: "Product Name",
    category: "Electronics",
    price: 4999,
    rating: 4.5,
    reviews: 324,
    imageUrl: "https://...",
    description: "...",
    discount: 20,
    inStock: true,
    badge: "Best Seller"
  },
  // ... more products
];

// Helper functions:
- getProductsByCategory(category)
- searchProducts(query)
- getRecommendedProducts(limit)
- getTrendingProducts(limit)
- getSimilarProducts(productId, limit)
```

---

## 🔧 API Integration

### `lib/api.js` Functions

```javascript
// Fetch products with pagination and filters
await fetchProducts({ 
  page: 1, 
  limit: 8, 
  search: "phone", 
  category: "Electronics" 
});

// Get single product details
await fetchProductById(productId);

// Get personalized recommendations
await fetchRecommendations(userId);

// Get similar products
await fetchSimilarProducts(productId);

// Track product views
await createView({ userId, productId, timestamp });

// Create order
await createOrder({ userId, items, total });

// User authentication
await authenticateUser({ email, password });
```

### Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🛠️ Utility Functions

Located in `lib/utils.js`:

```javascript
// Price formatting
formatPrice(1999)  // Returns: "₹1,999"

// Discount calculations
calculateDiscountedPrice(1000, 20)  // Returns: 800
calculateSavings(1000, 800)         // Returns: 200

// Text utilities
truncateText(text, 100)

// Star ratings
generateStarRating(4.5)

// Product filtering
filterByPriceRange(products, 100, 5000)
filterByRating(products, 4)
sortProducts(products, "price_asc")

// Stock status
getStockStatusText(true)  // Returns: "In Stock"

// Social features
createShareText(product)  // Returns: share-ready text
```

---

## 🎯 Using the Enhanced Home Page

The `HomeClientEnhanced.js` component provides a complete homepage with:

1. **Hero Section** - Eye-catching banner
2. **Search Bar** - Product search functionality
3. **Category Grid** - Browse by category
4. **Products Grid** - Main product listing with pagination
5. **Recommendations** - AI-powered recommendations
6. **Featured Products** - Trending items
7. **Features Section** - Trust signals
8. **Testimonials** - Social proof

```javascript
// In app/page.js, use:
import HomeClientEnhanced from "../components/HomeClientEnhanced";

export default function HomePage() {
  return <HomeClientEnhanced />;
}
```

---

## 🎨 Tailwind CSS Customization

### Color Scheme
- **Primary**: Blue (600, 700)
- **Success**: Green (100, 800)
- **Warning**: Yellow/Orange
- **Error**: Red (500, 800)
- **Neutral**: Slate (50-900)

### Responsive Breakpoints
- `sm:` - 640px
- `lg:` - 1024px
- `xl:` - 1280px

### Common Utilities
```css
/* Containers */
.page-shell    /* Centered max-width container */
.grid          /* Responsive grid */
.gap-*         /* Spacing */

/* Text */
.text-slate-900    /* Dark text */
.font-semibold     /* Mid-weight font */
.line-clamp-2      /* Truncate text */

/* Interactive */
.transition        /* Smooth transitions */
.hover:shadow-lg   /* Hover effects */
.group-hover:*     /* Group hover states */
```

---

## 📱 Responsive Design

All components are fully responsive:

- **Mobile**: Single column, full-width
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns

```javascript
// Example responsive grid
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {/* Auto-adapts based on screen size */}
</div>
```

---

## ⚡ Performance Optimization

1. **Image Optimization**: Uses Next.js `<Image>` component
2. **Code Splitting**: Automatic with Next.js
3. **Lazy Loading**: Client components loaded on demand
4. **Caching**: API responses cached appropriately
5. **Skeleton Loaders**: Show LoadingGrid during data fetch

---

## 🚀 Development Guide

### Start Development Server
```bash
npm run dev:frontend
# or
npm --prefix frontend run dev
```

Accessible at: `http://localhost:3000`

### Build for Production
```bash
cd frontend
npm run build
npm start
```

### Using Dummy Data During Development
Modify `HomeClientEnhanced.js` to always use dummy data:
```javascript
// Skip API calls, use dummy data directly
setProducts(dummyProducts.slice(0, 8));
setRecommendations(getRecommendedProducts(4));
```

---

## 🧪 Testing Components

### Test ProductCard
```javascript
<ProductCard 
  product={dummyProducts[0]}
  caption="Test product"
/>
```

### Test with Different States
- **Loading**: `<LoadingGrid />`
- **Empty**: `products.length === 0`
- **Error**: `error ? <ErrorUI /> : null`

---

## 📦 Adding New Components

1. Create component in `components/` folder
2. Use functional component syntax
3. Add `"use client"` directive for client components
4. Export default
5. Use Tailwind for styling
6. Document props with JSDoc comments

**Template:**
```javascript
"use client";

import { useEffect, useState } from "react";

/**
 * Component description
 * @param {object} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export default function NewComponent({ prop1, prop2 }) {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
}
```

---

## 🔐 Security Best Practices

1. ✅ Sanitize user input in search
2. ✅ Use HTTPS for API calls
3. ✅ Store auth tokens securely (httpOnly cookies)
4. ✅ Validate data before display
5. ✅ Use CSP headers for XSS protection

---

## 📊 Component Usage Analytics

Common component combinations:

```javascript
// Homepage layout
<HeroSection />
<CategoryGrid />
<FeaturedProducts />
<RecommendationSection />
<FeaturesSection />
<TestimonialSection />

// Product listing
<ProductCard /> (in grid)
<LoadingGrid /> (during load)
<Pagination /> (for navigation)

// Product detail page
<ProductImage />
<ProductDetailClient />
<RecommendationSection /> (similar products)
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Products not loading | Check API URL in `.env.local`, ensure backend is running |
| Images not showing | Verify image URLs are valid and CORS is enabled |
| Styling issues | Clear `.next` folder, rebuild project |
| Dummy data not updating | Check `lib/dummyData.js`, restart dev server |

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)

---

## ✨ Next Steps

1. Connect to real backend API
2. Implement shopping cart functionality
3. Add checkout flow
4. Integrate payment gateway
5. Add user authentication
6. Implement order history
7. Add wishlist feature
8. Implement product reviews
