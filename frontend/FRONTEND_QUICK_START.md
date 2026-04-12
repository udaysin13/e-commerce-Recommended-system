# Frontend Quick Start Guide

Get your modern React e-commerce frontend running in 5 minutes.

## 1. Start the Backend

Ensure the backend API is running:

```bash
cd backend
npm install
npm start
```

Backend should be available at `http://localhost:3000`

## 2. Install Dependencies

```bash
cd frontend
npm install
```

## 3. Create Environment File

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 5. Test Key Features

### ✅ Landing Page
- Visit http://localhost:3000
- See hero section, features, and trending products

### ✅ Product Listing
- Click "Products" or "Shop Now"
- See product grid with filtering and sorting
- "Recommended for You" section with 4 algorithm selectors

### ✅ Add to Cart
- Click "Add to Cart" on any product
- See green notification
- Check cart icon badge (top-right)

### ✅ Shopping Cart
- Click cart icon
- View all items, adjust quantities
- See order summary with tax and shipping

### ✅ Wishlist
- Click heart icon on products
- Click wishlist icon in header
- See saved items with sort options

---

## Key Pages & Routes

| Page | URL | Features |
|------|-----|----------|
| Landing | `/` | Hero, features, trending products |
| Products | `/products` | Grid, filtering, recommendations |
| Product Detail | `/products/:id` | Full product info, reviews |
| Cart | `/cart` | Order summary, checkout |
| Wishlist | `/wishlist` | Saved items, bulk add to cart |
| Login | `/login` | Authentication |

---

## Available Commands

```bash
# Development
npm run dev          # Start dev server on port 3000

# Production
npm run build        # Build optimized production bundle
npm start           # Run production server

# Code Quality
npm run lint        # Run ESLint
npm run format      # Format with Prettier

# Debugging
npm run dev --debug # Run with debug output
```

---

## Project Structure

```
frontend/
├── app/                    # Pages (Next.js App Router)
│   ├── page.js            # Landing page (/)
│   ├── products/
│   │   ├── page.js        # Products list (/products)
│   │   └── [id]/page.js   # Product detail
│   ├── cart/page.js       # Cart (/cart)
│   └── wishlist/page.js   # Wishlist (/wishlist)
├── components/            # React components
│   ├── Navigation.js      # Header & Footer
│   ├── ProductCard.js     # Product display
│   ├── RecommendationsSection.js  # Recommendations with 4 algorithms
│   └── HomePageEnhanced.js        # Landing page
├── lib/                   # Utilities
│   ├── recommendationApi.js  # Recommendation API client
│   ├── api.js             # General API client
│   ├── cart.js            # Cart management
│   └── auth.js            # Authentication
├── public/                # Static files
└── package.json           # Dependencies
```

---

## Recommendation System Features

### 4 Algorithms Available

1. **Hybrid** (Default)
   - Combines multiple recommendation strategies
   - Best overall performance
   - Balances accuracy and diversity

2. **Collaborative Filtering**
   - "Users like you enjoyed this product"
   - Based on user behavior patterns
   - Great for discovering new items

3. **Content-Based**
   - Similar to products you viewed
   - Based on product attributes
   - Consistent recommendations

4. **Trending**
   - Popular products right now
   - Based on view/purchase frequency
   - Shows hot items

### Switch Algorithms

Use the 4 buttons in "Recommended for You" section:
- Click any button (Hybrid, Collaborative, etc.)
- Recommendations update in real-time
- Each algorithm shows different products

---

## Component Usage Examples

### Show Recommendations
```jsx
import RecommendationsSection from '@/components/RecommendationsSection';

export default function Page() {
  return (
    <RecommendationsSection 
      userId="user123"
      algorithm="hybrid"
      limit={8}
    />
  );
}
```

### Display Product Card
```jsx
import ProductCard from '@/components/ProductCard';

export default function Page() {
  const product = {
    id: '1',
    name: 'Headphones',
    price: 129.99,
    image: '/headphones.jpg',
    rating: 4.5
  };

  return (
    <ProductCard 
      product={product}
      explanation="You viewed similar items"
      onAddToCart={(p) => console.log('Added:', p)}
    />
  );
}
```

### Header with Navigation
```jsx
import { Header, Footer } from '@/components/Navigation';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

---

## Local Storage

The app uses localStorage for cart and wishlist data that persists across sessions:

```javascript
// View cart
JSON.parse(localStorage.getItem('cart'))

// View wishlist
JSON.parse(localStorage.getItem('wishlist'))

// Clear cart
localStorage.removeItem('cart')
```

---

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

---

## Troubleshooting

### Issue: "Cannot connect to API"
- ✅ Check backend running: `curl http://localhost:3000/api/products`
- ✅ Check `.env.local` has correct API URL

### Issue: "Recommendations not loading"
- ✅ Try a different algorithm (Content, Trending)
- ✅ Check browser console for errors
- ✅ Verify backend logs

### Issue: "Images not showing"
- ✅ Check image URLs are valid
- ✅ Images from Unsplash are already configured

### Issue: "Cart items disappear on refresh"
- ✅ Check browser localStorage is enabled
- ✅ Try `localStorage.getItem('cart')` in console

---

## Performance Tips

```bash
# Build production version
npm run build  # Creates optimized bundle

# Run production
npm start
```

**Optimizations already included**:
- ✅ Next.js Image lazy loading
- ✅ Recommendation caching
- ✅ Code splitting
- ✅ CSS optimization with Tailwind

---

## Architecture Highlights

```
Frontend (React/Next.js)
├── Display Layer (Components)
│   ├── ProductCard, RecommendationsSection, etc.
│   └── Styling with Tailwind CSS
├── API Client Layer
│   ├── recommendationApi.js (4 algorithms)
│   └── api.js (products, cart, orders)
└── Storage Layer
    ├── localStorage (cart, wishlist)
    └── React useState/useEffect
         
Backend (Node.js/Express)
├── Recommendation Engine (4 algorithms)
│   ├── Hybrid (default)
│   ├── Collaborative Filtering
│   ├── Content-Based
│   └── Trending
├── REST API (/api)
└── Database (Prisma)
```

---

## Next Steps

1. **Start the app** - `npm run dev`
2. **Test recommendations** - Click algorithm buttons
3. **Try shopping** - Add items to cart/wishlist
4. **Deploy** - Follow deployment guide

---

## Documentation Links

- **Full Integration Guide**: `FRONTEND_INTEGRATION_COMPLETE.md`
- **Backend API Docs**: `../backend/RECOMMENDATIONS_GUIDE.md`
- **Deployment**: `../DEPLOYMENT_CHECKLIST.md`
- **Architecture**: `ARCHITECTURE.md`

---

## Support

For issues or questions:

1. Check browser console for errors
2. Check backend logs: `npm run dev` in backend folder
3. Verify API connection: `curl http://localhost:3000/api/products`
4. Review documentation files

Happy shopping! 🛍️
