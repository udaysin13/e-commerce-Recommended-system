# ShopWise - E-Commerce Recommendation System Frontend

A modern, clean, and responsive Next.js frontend for an e-commerce platform powered by a hybrid recommendation engine.

## 🎯 Features

### 1. **Product Listing Page**
- Responsive grid layout with product cards
- Search functionality by name and category
- Pagination support with Next/Previous buttons
- Real-time loading states with skeleton screens
- Mobile-first responsive design (1 col mobile → 2 cols tablet → 4 cols desktop)

### 2. **Product Detail Page**
- Dynamic routing with product ID parameter (`/products/[id]`)
- Detailed product information display
- View tracking (sends view events to backend)
- Order creation functionality
- Product recommendations section showing similar items

### 3. **Recommendation Section**
- Hybrid recommendation engine integration
- Two recommendation types:
  - **Content-based**: Similar category and price range
  - **Collaborative**: Based on user purchase overlap
- Personalized recommendations for logged-in users
- Smart rendering (hides section if no recommendations)

### 4. **Component Library**
- **Navbar**: Sticky navigation with brand logo and connection status
- **ProductCard**: Reusable card component with gradient styling and hover effects
- **ProductGrid**: Responsive grid layout system
- **LoadingGrid**: Skeleton loading screens for better UX
- **RecommendationSection**: Smart recommendation display component

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.1.6](https://nextjs.org/)
- **UI Library**: [React 19.2.4](https://react.dev/)
- **Styling**: [Tailwind CSS 4.2.0](https://tailwindcss.com/)
- **Package Manager**: npm

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.js              # Root layout with Navbar and Footer
│   ├── page.js                # Home page entry point
│   ├── globals.css            # Global styles and Tailwind
│   └── products/
│       └── [id]/
│           └── page.js        # Product detail page
├── components/
│   ├── Navbar.js              # Navigation bar component
│   ├── HomeClient.js          # Home page client component
│   ├── ProductCard.js         # Reusable product card
│   ├── ProductGrid.js         # Product grid layout
│   ├── ProductDetailClient.js # Product detail client component
│   ├── LoadingGrid.js         # Skeleton loading component
│   └── RecommendationSection.js # Recommendations display
├── lib/
│   └── api.js                 # API service/helper functions
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── next.config.mjs            # Next.js configuration
└── jsconfig.json              # JavaScript configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Backend running on `http://localhost:5000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Create `.env.local` file (already provided)
   - Ensure `NEXT_PUBLIC_API_URL=http://localhost:5000`

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## 📚 API Integration

### API Service (`lib/api.js`)

All API calls are centralized in the `lib/api.js` file:

```javascript
// Fetch all products with pagination
fetchProducts({ page, limit, search, category })

// Fetch single product by ID
fetchProductById(id)

// Get recommendations for a user
fetchRecommendations(userId)

// Get similar products for a product
fetchSimilarProducts(productId)

// Track product view
createView({ userId, productId })

// Create order
createOrder({ userId, productId })
```

### Base URL
- **Development**: `http://localhost:5000`
- **Environment Variable**: `NEXT_PUBLIC_API_URL`

### Endpoints Used
```
GET  /products?page=1&limit=8&search=&category=
GET  /product/:id
GET  /recommendations/:userId
POST /view
POST /order
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb)
- **Secondary**: Slate (#0f172a)
- **Accent**: Indigo (#4f46e5)
- **Neutral**: Stone (#78716c)
- **Success**: Green (#16a34a)
- **Error**: Red (#dc2626)

### Typography
- **Primary Font**: System fonts (modern sans-serif)
- **Heading Sizes**: 3xl (h2), 4xl (h1), 5-6xl (page titles)
- **Body**: 16px, line-height 1.6

### Spacing & Layout
- **Page Container**: Max 1200px width with responsive padding
- **Card Gap**: 20px (responsive 16px on mobile)
- **Border Radius**: 20px (cards), 9999px (buttons/badges)
- **Border**: 1.5px solid with rgba(0, 0, 0, 0.08)

### Interactive Elements
- **Hover Effects**: Scale, shadow, color transitions
- **Active States**: Scale 95% on button press
- **Transitions**: 0.3s cubic-bezier for smooth animations
- **Disabled**: 50% opacity with cursor-not-allowed

## 🔐 Best Practices Implemented

### Code Organization
- ✅ Reusable components with single responsibility
- ✅ Centralized API layer (`lib/api.js`)
- ✅ Separated client components (`*Client.js`)
- ✅ Clean folder structure

### Performance
- ✅ Image optimization ready (Next.js Image component)
- ✅ Lazy loading for recommendations
- ✅ Skeleton loading screens
- ✅ Optimized CSS with Tailwind

### User Experience
- ✅ Loading states with skeletons
- ✅ Error handling and user feedback
- ✅ Mobile-responsive design
- ✅ Smooth animations and transitions
- ✅ Accessible button states

### Error Handling
- ✅ Try-catch blocks in async operations
- ✅ User-friendly error messages
- ✅ Fallback UI for errors
- ✅ Default empty states

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (4 columns)

### Mobile Optimizations
- Touch-friendly button sizes (48px minimum)
- Optimized spacing for small screens
- Hidden desktop-only elements
- Flexible grid layouts

## 🔄 State Management

### useState Patterns
```javascript
// Product listing state
const [products, setProducts] = useState([])
const [page, setPage] = useState(1)
const [search, setSearch] = useState("")
const [loading, setLoading] = useState(true)
const [error, setError] = useState("")

// Product detail state
const [product, setProduct] = useState(null)
const [similarProducts, setSimilarProducts] = useState([])
const [orderMessage, setOrderMessage] = useState("")
```

### useEffect Patterns
- Fetch data on mount
- Refetch on dependency changes
- Proper cleanup handling
- Error state management

## 🧪 Testing

To manually test the application:

1. **Product Listing**
   - Navigate to home page
   - Search for products
   - Test pagination

2. **Product Detail**
   - Click on "View Product"
   - Check view tracking
   - Create an order

3. **Recommendations**
   - Check "Recommended For You" section
   - Click similar products
   - Verify hybrid recommendations

## 📦 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled in backend

### Styling Issues
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
- Check Tailwind CSS configuration

### Component Not Rendering
- Verify client/server component markers are correct
- Check browser console for JavaScript errors
- Ensure all imports are correct

## 📝 Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional
NEXT_PUBLIC_APP_NAME=ShopWise
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Guide](https://react.dev/reference/react)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [API Design Best Practices](https://restfulapi.net/)

## 📄 License

This project is part of the E-commerce Recommendation System tutorial.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Built with ❤️ for modern e-commerce platforms**
