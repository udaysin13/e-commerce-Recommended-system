# 🏗️ Frontend Architecture & Design Document

## Overview

The e-commerce recommendation frontend is built with Next.js 16 using the App Router pattern. It features a clean, modular architecture with separated concerns for API integration, UI components, and page logic.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  Client Browser (3000)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼─┐      ┌────▼─┐      ┌────▼──┐
    │Pages │      │Layout│      │Styles │
    └──────┘      └──────┘      └───────┘
         │             │             │
    ┌────▼──────────────▼─────────────▼────┐
    │         React Component Tree          │
    ├──────────────────────────────────────┤
    │ Root Layout (with Navbar + Footer)   │
    │ ├─ Navbar                            │
    │ ├─ Page Content                      │
    │ └─ Footer                            │
    └────────────┬──────────────────────────┘
                 │
    ┌────────────▼──────────────┐
    │  API Service Layer        │
    │  (lib/api.js)             │
    │  - fetchProducts          │
    │  - fetchProductById       │
    │  - fetchRecommendations   │
    │  - createView             │
    │  - createOrder            │
    └────────────┬──────────────┘
                 │
         ┌───────▼────────┐
         │  Backend API   │
         │  (Port 5000)   │
         └────────────────┘
```

## Component Hierarchy

### Root Layout Structure
```
RootLayout (app/layout.js)
├── Navbar (components/Navbar.js)
│   ├── Logo + Brand
│   ├── Demo User Badge
│   └── Connection Status
├── Page Components (dynamic)
│   └── HomeClient / ProductDetailClient
└── Footer
```

### Home Page Flow
```
HomePage (app/page.js)
└── HomeClient (components/HomeClient.js)
    ├── Search Input
    ├── RecommendationSection
    │   ├── Section Header
    │   └── ProductCard[] (from recommendations)
    ├── Products Section Header
    ├── LoadingGrid (while loading) OR ProductCard[]
    ├── Error Handler
    └── Pagination Controls
```

### Product Detail Flow
```
ProductDetailPage (app/products/[id]/page.js)
└── ProductDetailClient (components/ProductDetailClient.js)
    ├── Back Button
    ├── Product Information
    │   ├── Category Badge
    │   ├── Product Name
    │   ├── Description
    │   └── Category & Price Info
    ├── Purchase Section
    │   ├── Large Price Display
    │   ├── Features List
    │   ├── Create Order Button
    │   └── Order Message
    └── RecommendationSection
        └── Similar Products (ProductCard[])
```

## Data Flow Architecture

### Product Loading Flow
```
User Action (Page Load / Search / Pagination)
        │
        ▼
    HomeClient State Update
        │
        ├─► setLoading(true)
        │
        ▼
    API Call (lib/api.js)
    fetchProducts({ page, limit, search })
        │
        ▼
    Backend Request
    GET /products?page=1&limit=8&search=
        │
        ▼
    Response Processing
        │
        ├─► setProducts(data.items)
        ├─► setTotalPages(data.totalPages)
        └─► setLoading(false)
        │
        ▼
    Component Re-render
    ProductCard[] Display
```

### Recommendation Flow
```
Component Mount / User Change
        │
        ▼
    fetchRecommendations(userId)
        │
        ▼
    Backend Hybrid Engine
    - Content-based filtering
    - Collaborative filtering
        │
        ▼
    RecommendationSection Component
        │
        ├─► Check if products exist
        ├─► Render section header
        └─► Map ProductCard components
```

### Order Creation Flow
```
User Clicks "Create Order"
        │
        ▼
    handleOrder() Function
        │
        ▼
    createOrder({ userId, productId })
        │
        ▼
    Backend /order endpoint
        │
        ├─► Store order
        ├─► Update user profile
        └─► Trigger recommendation update
        │
        ▼
    Response Message
    "Order created successfully..."
```

## State Management Pattern

### HomeClient Component States
```javascript
const [products, setProducts]           // Product array
const [recommendations, setRecommendations] // Recommendations array
const [page, setPage]                   // Current page number
const [totalPages, setTotalPages]       // Total pages count
const [search, setSearch]               // Search query string
const [loading, setLoading]             // Loading state
const [error, setError]                 // Error message
```

### ProductDetailClient Component States
```javascript
const [product, setProduct]             // Single product data
const [similarProducts, setSimilarProducts] // Similar products array
const [loading, setLoading]             // Loading state
const [error, setError]                 // Error message
const [orderMessage, setOrderMessage]   // Order result message
```

## API Integration Layer (`lib/api.js`)

### Request Helper Function
```javascript
async function request(path, options = {})
- Handles all HTTP requests
- Sets Content-Type header
- Disables caching
- Parses JSON responses
- Throws errors on non-200 status
```

### API Functions

| Function | Method | Path | Purpose |
|----------|--------|------|---------|
| `fetchProducts` | GET | `/products?...` | List products with pagination |
| `fetchProductById` | GET | `/product/:id` | Get single product |
| `fetchRecommendations` | GET | `/recommendations/:userId` | Get user recommendations |
| `fetchSimilarProducts` | GET | `/similar/:productId` | Get similar products |
| `createView` | POST | `/view` | Track product view |
| `createOrder` | POST | `/order` | Create purchase order |

## Component Interface Contracts

### ProductCard Props
```javascript
{
  product: {
    id: number,
    name: string,
    price: number,
    category: string,
    source?: string
  },
  caption?: string  // Optional description
}
```

### RecommendationSection Props
```javascript
{
  title: string,           // Section title
  subtitle: string,        // Section description
  products: Product[]      // Array of products
}
```

### LoadingGrid Props
```javascript
{
  count?: number  // Number of skeleton items (default: 8)
}
```

## Styling Architecture

### Tailwind CSS Approach
- **Dark Mode**: Not configured (light mode only)
- **Custom Colors**: CSS variables in globals.css
- **Typography**: System font stack
- **Spacing**: Consistent with Tailwind scale
- **Responsive**: Mobile-first breakpoints

### CSS Classes Organization
```
globals.css
├── CSS Variables (:root)
├── Base Styles (body, a, etc.)
├── Utility Classes
│   ├── .page-shell (max-width container)
│   ├── .panel (card styling)
│   ├── .button-primary
│   ├── .button-secondary
│   └── .input
├── Animations
│   └── @keyframes shimmer (loading)
└── Responsive Utilities
    └── Mobile-specific overrides
```

## Performance Optimizations

### 1. Component Level
- **Server Components**: Used for static content
- **Client Components**: Used only where interactivity needed
- **Memo**: Could be added for expensive renders

### 2. Data Level
- **Caching**: Disabled (cache: "no-store") for fresh data
- **Pagination**: Load 8 products at a time
- **Lazy Loading**: Recommendations render only if data exists

### 3. Bundle Level
- **Code Splitting**: Automatic with Next.js dynamic imports
- **Tree Shaking**: Tailwind CSS removes unused styles
- **Modern JavaScript**: Uses ES6+ features

## Error Handling Strategy

### API Layer
```javascript
try {
  // API call
} catch (err) {
  throw new Error(data.error || "Request failed")
}
```

### Component Level
```javascript
try {
  // Load data
} catch (err) {
  setError(err.message || "Default error message")
} finally {
  setLoading(false)
}
```

### UI Layer
- Error messages displayed in red panels
- Fallback UI for not found states
- Default empty states for missing data

## Responsive Design Breakpoints

| Size | Width | Columns | Device |
|------|-------|---------|--------|
| Mobile | < 640px | 1 | Phone |
| Tablet | 640-1024px | 2 | iPad |
| Desktop | > 1024px | 4 | Computer |
| Large | > 1280px | 4 | Large Monitor |

## Navigation Structure

```
/ (Home)
  ├─ Product Grid (responsive)
  ├─ Search functionality
  ├─ Pagination
  └─ Recommendations section

/products/:id (Detail)
  ├─ Product information
  ├─ Price & details
  ├─ Order creation
  └─ Similar products

(implicit Footer on all pages)
```

## Session Management

### Demo User
- **ID**: 1 (hardcoded)
- **Purpose**: Testing recommendations
- **Location**: Constants in client components
- **Real App**: Would use authentication

### User Tracking
- **View Events**: Sent when viewing products
- **Order Events**: Sent when creating orders
- **Timeline**: Real-time to backend

## Future Enhancement Opportunities

1. **Authentication**: Add user login/register
2. **Cart**: Implement shopping cart functionality
3. **Wishlist**: Save favorite products
4. **Reviews**: Add product reviews and ratings
5. **Analytics**: Track user behavior
6. **Image Optimization**: Use Next.js Image component
7. **Metadata**: Dynamic meta tags for SEO
8. **Dark Mode**: Add dark theme support
9. **Internationalization**: Multi-language support
10. **Progressive Enhancement**: Service worker caching

## Testing Strategy

### Unit Tests (Jest)
- Component rendering
- Props validation
- State updates

### Integration Tests (Playwright/Cypress)
- User flows
- API integration
- Navigation paths

### E2E Tests
- Full user journeys
- Search and filter
- Product purchase flow

## Deployment Considerations

### Build Process
```bash
npm run build  # Creates .next optimized build
npm start      # Serves production build
```

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_VERSION`: Version number

### Static Assets
- Could be cached by CDN
- Images should be optimized
- CSS pre-minified by Tailwind

## Security Considerations

1. **XSS Protection**: React auto-escapes content
2. **CSRF**: Not implemented (GET requests only)
3. **Rate Limiting**: Should be on backend
4. **Input Validation**: Frontend validation present
5. **API Keys**: Not used (public API)
6. **CORS**: Should be configured in backend

## Accessibility Features

- ♿ Semantic HTML structure
- ⌨️ Keyboard navigation ready
- 🎯 Focus states on buttons
- 📱 Mobile-responsive design
- 🖼️ Alt text ready for images
- 🎨 Good color contrast

---

## Quick Reference

**Architecture Pattern**: Clean Component Architecture  
**State Management**: React Hooks (useState, useEffect)  
**Styling**: Tailwind CSS + Custom CSS  
**Routing**: Next.js App Router  
**API**: Fetch API with centralized service  
**Data Source**: Express Backend on Port 5000  

---

This architecture supports scalability, maintainability, and provides a solid foundation for future enhancements.
