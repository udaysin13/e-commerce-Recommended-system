# Frontend Integration Guide

Complete documentation for the modern React e-commerce frontend with recommendation engine integration.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Pages](#pages)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:3000` (configurable via `.env.local`)
- Modern web browser

### Installation

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `.env.local` in the frontend directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Optional: Cache settings
NEXT_PUBLIC_RECOMMENDATIONS_CACHE_ENABLED=true
NEXT_PUBLIC_CACHE_TTL=3600000
```

The frontend will automatically fall back to `http://localhost:3000/api` if no API URL is configured.

### Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser. The app will auto-reload on changes.

---

## Architecture

```
Frontend/
├── app/                      # Next.js App Router
│   ├── layout.js            # Root layout with Header/Footer
│   ├── page.js              # Landing page
│   ├── products/
│   │   ├── page.js          # Product listing with recommendations
│   │   └── [id]/
│   │       └── page.js      # Product detail page
│   ├── cart/
│   │   └── page.js          # Shopping cart
│   ├── wishlist/
│   │   └── page.js          # Wishlist management
│   └── login/
│       └── page.js          # User authentication
├── components/              # React components
│   ├── Navigation.js        # Header & Footer
│   ├── RecommendationsSection.js  # Recommendation display
│   ├── ProductCard.js       # Product display card
│   ├── CartClient.js        # Cart management
│   └── HomePageEnhanced.js  # Landing page
├── lib/                     # Utilities & API clients
│   ├── recommendationApi.js    # Recommendation endpoints
│   ├── api.js              # General API client
│   ├── auth.js             # Authentication utilities
│   ├── cart.js             # Cart management
│   └── utils.js            # Helper functions
└── public/                 # Static assets
```

### Key Technologies

- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS
- **Image Optimization**: Next.js Image
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Fetch API
- **Storage**: localStorage with event listeners

---

## Components

### Header Component

Location: `components/Navigation.js` → `Header` export

**Features**:
- Logo and branding
- Navigation menu (Home, Products, Wishlist, About)
- Search input (desktop only)
- Cart icon with item count (red badge)
- Wishlist icon with item count (pink badge)
- Mobile hamburger menu

**Usage**:
```jsx
import { Header } from '@/components/Navigation';

export default function Page() {
  return (
    <>
      <Header />
      {/* page content */}
    </>
  );
}
```

**Props**: None (uses pathname from Next.js)

### Footer Component

Location: `components/Navigation.js` → `Footer` export

**Features**:
- Company info
- Shop links
- Support links
- Newsletter signup
- Social links placeholder

**Usage**:
```jsx
import { Footer } from '@/components/Navigation';

export default function Layout() {
  return (
    <>
      {/* content */}
      <Footer />
    </>
  );
}
```

### RecommendationsSection Component

Location: `components/RecommendationsSection.js`

**Purpose**: Display personalized product recommendations with algorithm selection

**Features**:
- 4 algorithm selectors (Hybrid, Collaborative, Content, Trending)
- Real-time algorithm switching
- Loading skeleton state
- Error handling with recovery
- Empty state messaging
- Responsive grid (1-4 columns)

**Props**:
```javascript
{
  userId: string,           // Required: User ID for recommendations
  title?: string,           // Optional: Section title (default: "Recommended for You")
  algorithm?: string,       // Optional: Default algorithm (default: "hybrid")
  limit?: number,          // Optional: Max items (default: 8, max: 50)
  onAddToCart?: function,  // Optional: Callback when item added to cart
  onAddToWishlist?: function  // Optional: Callback when item wishlist toggled
}
```

**Usage**:
```jsx
<RecommendationsSection 
  userId="user123"
  algorithm="hybrid"
  limit={8}
  onAddToCart={(product) => console.log('Added:', product)}
/>
```

### ProductCard Component

Location: `components/ProductCard.js`

**Purpose**: Display individual product with image, rating, actions

**Features**:
- Lazy-loaded product image
- Star rating display (1-5)
- Price formatting
- Wishlist toggle
- Add to cart button
- Stock indicator
- Recommendation explanation box

**Props**:
```javascript
{
  product: {
    id: string,
    name: string,
    description: string,
    price: number,
    image: string,
    rating: number,
    reviews: number,
    category: string,
    inStock: boolean
  },
  explanation?: string,       // Recommendation explanation
  onAddToCart?: function,
  onAddToWishlist?: function,
  className?: string
}
```

**Usage**:
```jsx
<ProductCard
  product={productData}
  explanation="You viewed similar items"
  onAddToCart={(product) => handleAddToCart(product)}
  onAddToWishlist={(product) => handleWishlist(product)}
/>
```

### HomePageEnhanced Component

Location: `components/HomePageEnhanced.js`

**Purpose**: Landing page with hero, features, and product showcase

**Features**:
- Hero section with CTA buttons
- Stats display
- Features grid
- Step-by-step "How It Works"
- Trending products section
- Newsletter signup

**Usage**:
```jsx
import HomePageEnhanced from '@/components/HomePageEnhanced';

export default function HomePage() {
  return <HomePageEnhanced />;
}
```

---

## Pages

### Landing Page (`app/page.js`)

```
GET /
```

Main landing page showing:
- Hero section with call-to-action
- Featured products
- Recommendations section
- FAQ and testimonials

### Products Page (`app/products/page.js`)

```
GET /products
```

Features:
- Product grid with filtering
- Category selector
- Sort options (price, rating, newest)
- Individual product cards
- "Recommended for You" section at bottom
- Add to cart from grid

**URL Parameters** (future enhancement):
```
/products?category=electronics&sort=price-low&page=1
```

### Product Detail (`app/products/[id]/page.js`)

```
GET /products/[id]
```

Shows:
- Large product image
- Detailed description
- Price and reviews
- Add to cart / Add to wishlist
- Related products
- Customer reviews

### Shopping Cart (`app/cart/page.js`)

```
GET /cart
```

Features:
- List all cart items
- Quantity controls (+/-)
- Remove items
- Order summary with:
  - Subtotal
  - Tax calculation
  - Shipping costs
  - Total amount
- Free shipping threshold indicator
- Checkout button
- Trust badges (SSL, returns, support)

**Cart State** (localStorage):
```javascript
// localStorage['cart']
[
  {
    id: "prod-123",
    name: "Product Name",
    price: 29.99,
    quantity: 2,
    image: "https://...",
    category: "Electronics"
  }
]
```

### Wishlist (`app/wishlist/page.js`)

```
GET /wishlist
```

Features:
- Display saved items
- Sort options (newest, price, rating)
- Quick add to cart
- Remove from wishlist
- Total wishlist value
- "Add All to Cart" button

**Wishlist State** (localStorage):
```javascript
// localStorage['wishlist']
[
  {
    id: "prod-123",
    name: "Product Name",
    price: 29.99,
    image: "https://...",
    rating: 4.5,
    reviews: 128,
    category: "Electronics"
  }
]
```

### Login Page (`app/login/page.js`)

```
GET /login
```

Features:
- Email/password login
- Sign up form
- Social login options
- Forgot password link

---

## API Integration

### Recommendation API Client

Location: `lib/recommendationApi.js`

#### getRecommendations()

Fetch personalized recommendations for a user.

```javascript
import { getRecommendations } from '@/lib/recommendationApi';

const recommendations = await getRecommendations('user123', {
  algorithm: 'hybrid',      // 'hybrid' | 'collaborative' | 'content' | 'trending'
  limit: 8,                 // 1-50 items
  includeExplanations: true // Include reasoning
});

// Response:
// {
//   success: true,
//   data: [
//     {
//       id: "prod-456",
//       name: "Product Name",
//       price: 29.99,
//       score: 0.87,
//       explanation: "You viewed similar items"
//     }
//   ],
//   metadata: {
//     algorithm: 'hybrid',
//     count: 8,
//     executionTime: 145,
//     timestamp: 1704067200000
//   }
// }
```

**Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| userId | string | Required | User identifier |
| options.algorithm | string | 'hybrid' | Recommendation algorithm |
| options.limit | number | 8 | Max items (capped at 50) |
| options.includeExplanations | boolean | true | Include explanation text |

**Error Handling**:
```javascript
try {
  const recs = await getRecommendations(userId);
} catch (error) {
  if (error.message.includes('404')) {
    console.log('User not found');
  } else if (error.message.includes('500')) {
    console.log('Server error');
  }
}
```

#### getRecommendationsWithFallback()

Automatically tries fallback algorithms if primary fails.

```javascript
const recommendations = await getRecommendationsWithFallback('user123', {
  algorithm: 'hybrid'  // Falls back to: collaborative → content → trending
});
```

#### Caching

Recommendations can be cached in-memory:

```javascript
import { 
  getCachedRecommendations,
  setCachedRecommendations,
  clearRecommendationCache 
} from '@/lib/recommendationApi';

// Check cache first
let recs = getCachedRecommendations('user123', { algorithm: 'hybrid' });

if (!recs) {
  recs = await getRecommendations('user123');
  setCachedRecommendations('user123', recs);
}

// Clear cache
clearRecommendationCache();
```

### General API Client

Location: `lib/api.js`

#### GET /api/products

Fetch all products

```javascript
import { getAllProducts } from '@/lib/api';

const products = await getAllProducts();
// Returns: Product[]
```

#### GET /api/products/:id

Fetch single product

```javascript
import { getProductById } from '@/lib/api';

const product = await getProductById('prod-123');
```

#### GET /api/cart/:userId

Fetch user's cart

```javascript
import { getCart } from '@/lib/api';

const cart = await getCart('user123');
```

#### POST /api/cart/:userId

Add item to cart

```javascript
import { addToCart } from '@/lib/api';

await addToCart('user123', {
  productId: 'prod-123',
  quantity: 2
});
```

### Backend Endpoints (Reference)

**Recommendations API**:
- `GET /api/enhanced-recommendations/:userId`
- Query params: `algorithm`, `limit`, `includeExplanations`

**Products API**:
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)

**Cart API**:
- `GET /api/cart/:userId` - Get cart
- `POST /api/cart/:userId` - Add to cart
- `PUT /api/cart/:userId/:itemId` - Update quantity
- `DELETE /api/cart/:userId/:itemId` - Remove from cart

**Orders API**:
- `POST /api/orders/:userId` - Create order
- `GET /api/orders/:userId` - Get user orders

---

## State Management

### Local Storage

**Cart** (`localStorage['cart']`):
```javascript
[
  { id, name, description, price, quantity, image, category }
]
```

**Wishlist** (`localStorage['wishlist']`):
```javascript
[
  { id, name, price, image, rating, reviews, category }
]
```

**User Session** (`localStorage['userId']`):
```
'user123'
```

### Event System

Listen for storage changes:

```javascript
useEffect(() => {
  const handleStorageChange = (event) => {
    if (event.key === 'cart') {
      // Cart updated
      const newCart = JSON.parse(event.newValue);
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### React Hooks

**useState** for component state:
```javascript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**useEffect** for side effects:
```javascript
useEffect(() => {
  fetchProducts();
}, []); // Empty dependency array = run once on mount
```

---

## Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables

Set `NEXT_PUBLIC_API_URL` for production API:

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### Deploy to Other Platforms

**Docker**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
EXPOSE 3000
```

**Build Docker image**:
```bash
docker build -t ecommerce-frontend .
docker run -p 3000:3000 ecommerce-frontend
```

---

## Testing

### Unit Tests

Create test file: `components/__tests__/ProductCard.test.js`

```javascript
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 29.99,
      image: '/test.jpg'
    };

    render(<ProductCard product={product} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test API integration:

```javascript
import { getRecommendations } from '@/lib/recommendationApi';

describe('Recommendations API', () => {
  it('fetches recommendations', async () => {
    const recs = await getRecommendations('user123');
    expect(recs.success).toBe(true);
    expect(Array.isArray(recs.data)).toBe(true);
  });
});
```

### E2E Tests (Cypress)

```javascript
describe('Shopping Flow', () => {
  it('adds product to cart and checkout', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Products').click();
    cy.contains('Add to Cart').first().click();
    cy.visit('http://localhost:3000/cart');
    cy.contains('Checkout').click();
  });
});
```

---

## Troubleshooting

### API Connection Issues

**Problem**: "Cannot connect to API"

**Solutions**:
1. Check backend is running: `curl http://localhost:3000/api/products`
2. Verify API URL in `.env.local`: `NEXT_PUBLIC_API_URL`
3. Check CORS configuration on backend
4. Browser console for exact error message

### Recommendations Not Loading

**Problem**: Recommendations show "Unable to load recommendations"

**Solutions**:
1. Verify userId is valid
2. Check network tab for API response status
3. Try fallback algorithm: `getRecommendationsWithFallback()`
4. Check backend logs for errors

### Cart Not Persisting

**Problem**: Cart items disappear on refresh

**Solutions**:
1. Check browser localStorage is enabled
2. Verify cart key: `localStorage.getItem('cart')`
3. Check console for JavaScript errors
4. Try clearing browser cache

### Images Not Loading

**Problem**: Product images show as broken

**Solutions**:
1. Verify image URLs are correct
2. Check image domain is added to `next.config.mjs`:
```javascript
images: {
  domains: ['unsplash.com', 'images.pexels.com', 'your-cdn.com']
}
```
3. Check image file permissions

### Performance Issues

**Problem**: Page loads slowly

**Solutions**:
1. Enable Recommendations cache: Check `.env.local`
2. Lazy load images: Already enabled on ProductCard
3. Check API response time: DevTools Network tab
4. Use `npm run build` for production optimizations

---

## API Response Examples

### Success Response
```javascript
{
  "success": true,
  "data": [
    {
      "id": "prod-123",
      "name": "Wireless Headphones",
      "price": 129.99,
      "image": "https://",
      "rating": 4.5,
      "score": 0.87,
      "explanation": "You viewed similar audio products"
    }
  ],
  "metadata": {
    "algorithm": "hybrid",
    "count": 8,
    "executionTime": 145,
    "timestamp": 1704067200000
  }
}
```

### Error Response
```javascript
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND",
  "timestamp": 1704067200000
}
```

---

## Support & Documentation

- **Backend Docs**: See `BACKEND_GUIDE.md`
- **API Docs**: See `RECOMMENDATIONS_GUIDE.md`
- **Deployment**: See `DEPLOYMENT_CHECKLIST.md`

For issues, check the backend logs and browser console for detailed error messages.
