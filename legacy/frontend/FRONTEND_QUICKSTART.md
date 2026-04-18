# 🚀 Frontend Quick Start Guide

## Start Here! 👈

### Prerequisites
- Node.js 18+ installed
- Backend running on `http://localhost:5000` (optional - will use dummy data if not available)
- Frontend dependencies installed

### Quick Setup (30 seconds)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies (if not already done)
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:3000
```

Done! 🎉

---

## What You'll See

### Homepage Features
```
[Navigation Bar - Search, Categories, Cart]
        ↓
[Hero Section - Welcome banner with CTA]
        ↓
[Search Bar]
        ↓
[Category Grid - 4 interactive category buttons]
        ↓
[Products Grid - 8 products with pagination]
        ↓
[Recommended for You - 4 personalized products]
        ↓
[Trending Now - 8 trending products]
        ↓
[Features - 4 key benefits with icons]
        ↓
[Customer Testimonials - 3 reviews with ratings]
        ↓
[Footer]
```

---

## Component Structure

### Main Page Section
```jsx
// Import the enhanced home component
import HomeClientEnhanced from "../components/HomeClientEnhanced";

export default function HomePage() {
  return <HomeClientEnhanced />;
}
```

### Folders
```
frontend/
├── components/        ← Reusable UI components
│   ├── ProductCard.js          (Product display)
│   ├── HeroSection.js          (Hero banner)
│   ├── FeaturedProducts.js     (Product grid)
│   ├── CategoryGrid.js         (Categories)
│   ├── RecommendationSection.js (Recommendations)
│   ├── TestimonialSection.js   (Reviews)
│   ├── FeaturesSection.js      (Benefits)
│   ├── Navbar.js               (Navigation)
│   ├── LoadingGrid.js          (Skeleton loader)
│   └── HomeClientEnhanced.js   (Main orchestrator)
│
├── lib/               ← Utilities & helpers
│   ├── dummyData.js   (Mock product data)
│   ├── utils.js       (Helper functions)
│   ├── api.js         (API client)
│   └── cart.js        (Cart logic)
│
└── app/               ← Pages
    └── page.js        (Home page)
```

---

## using Dummy Data During Development

### What is Dummy Data?
12 mock products across 4 categories to test without backend.

### Where is it?
`frontend/lib/dummyData.js`

### What it contains?
```javascript
// 12 products
- Wireless Headphones (Electronics)
- USB-C Charger (Electronics)
- Smart Watch (Electronics)
- 4K Webcam (Electronics)
- T-Shirt (Fashion)
- Jeans (Fashion)
- Winter Jacket (Fashion)
- Kitchen Knife Set (Home)
- LED Desk Lamp (Home)
- Bedding Set (Home)
- Face Serum (Beauty)
- Night Cream (Beauty)

// Helper functions
getProductsByCategory(category)
searchProducts(query)
getRecommendedProducts(limit)
getTrendingProducts(limit)
getSimilarProducts(productId)
```

### Use Cases
```javascript
// Get all products
const allProducts = dummyProducts;

// Get by category
const electronics = getProductsByCategory("Electronics");

// Search products
const results = searchProducts("shirt");

// Get recommendations
const recommended = getRecommendedProducts(4);

// Get trending
const trending = getTrendingProducts(8);
```

---

## Key Features You Can Test

### 1. Search Functionality
- Type in search bar
- Press Search button
- Products filter in real-time

### 2. Category Filtering
- Click category buttons
- Grid highlights active category
- Products filter accordingly

### 3. Product Details
- Click "View Details" on any product
- See product information
- Navigate back to homepage

### 4. Responsive Design
- Resize browser window
- Layout adapts smoothly
- Mobile → Tablet → Desktop

### 5. Loading States
- See skeleton cards while loading
- Smooth fade-in when ready

### 6. Pagination
- Page through products
- Controls at bottom of list
- Shows current page

---

## Customization Examples

### Change Hero Section Title
```jsx
// In HeroSection.js
<h1 className="...">
  Discover Your Perfect Products  {/* Change this */}
</h1>
```

### Add More Products to Dummy Data
```javascript
// In lib/dummyData.js
export const dummyProducts = [
  // ... existing products
  {
    id: 13,
    name: "New Product",
    category: "Electronics",
    price: 999,
    // ... other properties
  }
];
```

### Change Tailwind Colors
```jsx
// Example: Change button color
className="bg-blue-600"  // Change to "bg-purple-600"
```

### Modify Category List
```jsx
// In components/CategoryGrid.js
const categories = [
  "Electronics",
  "Fashion",
  "Home",
  "Beauty",
  "Sports"  // Add new category
];
```

---

## Testing the Fallback System

### Scenario 1: Backend Running
```
✅ Frontend loads
✅ API calls succeed
✅ Real data displays
✅ Backend is used
```

### Scenario 2: Backend NOT Running
```
✅ Frontend loads (no error!)
✅ API calls fail silently
✅ Dummy data automatically used
✅ User sees products anyway!
```

### How to Test
1. Stop backend: Close terminal running `npm run dev:backend`
2. Refresh frontend
3. Products still appear from dummy data! ✨

---

## Environment Setup

### `.env.local` (if needed)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Note**: Already set to use localhost:5000 by default in `lib/api.js`

---

## Common Tasks

### Add a New Component
1. Create file in `components/`
2. Use React functional component syntax
3. Add `"use client"` for client components
4. Import and use in pages

### Add New Utility Function
1. Add to `lib/utils.js`
2. Export function
3. Import in components: `import { functionName } from "../lib/utils"`

### Modify Product Data
1. Edit `lib/dummyData.js`
2. Update `dummyProducts` array
3. Refresh browser - changes appear immediately

### Change Styling
1. Modify Tailwind classes in JSX
2. All components use Tailwind CSS
3. See changes instantly on save

---

## Popular Color Classes

```css
/* Buttons */
bg-blue-600          /* Primary */
bg-green-600         /* Success */
bg-red-600           /* Danger */
bg-gray-600          /* Secondary */

/* Text */
text-slate-900       /* Dark text */
text-slate-600       /* Muted text */
text-white           /* Light text */

/* Backgrounds */
bg-white             /* White */
bg-slate-50          /* Very light */
bg-slate-100         /* Light gray */

/* Borders */
border-slate-200     /* Light border */
border-slate-300     /* Normal border */
border-blue-600      /* Accent border */
```

---

## Responsive Classes

```css
/* Mobile first */
lg:grid-cols-4       /* 4 columns on large screens */
sm:grid-cols-2       /* 2 columns on small screens */
                     /* 1 column on mobile (default) */

/* Example */
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* Responsive grid */}
</div>
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 already in use | Kill process: `lsof -i :3000` then `kill -9 <PID>` |
| Products not showing | Check `lib/dummyData.js`, restart dev server |
| Styling broken | Clear `.next` folder, `npm run dev` again |
| Images not loading | Verify image URLs exist, check console errors |
| API errors | Backend may not be running - will use dummy data |

---

## File Locations

```
📁 frontend
├── 📁 components
│   ├── HeroSection.js ••••••••••••• Hero banner
│   ├── FeaturedProducts.js •••••••• Product grid
│   ├── ProductCard.js •••••••••••• Single product card
│   ├── CategoryGrid.js ••••••••••• Category selector
│   ├── RecommendationSection.js •• Recommendations
│   ├── TestimonialSection.js ••••• Customer reviews
│   ├── FeaturesSection.js •••••••• Benefits section
│   ├── HomeClientEnhanced.js ••••• Main page logic
│   └── Navbar.js •••••••••••••••• Navigation bar
│
├── 📁 lib
│   ├── dummyData.js •••••••••••••• Mock products
│   ├── utils.js ••••••••••••••••• Helper functions
│   ├── api.js •••••••••••••••••• API client
│   └── cart.js •••••••••••••••••• Cart utilities
│
└── 📁 app
    └── page.js ••••••••••••••••• Home page

📄 FRONTEND_GUIDE.md •••••••••••• Detailed documentation
📄 COMPONENT_SUMMARY.md •••••••••• Components overview
```

---

## Next Steps

After running `npm run dev`, you can:

1. **Explore Products**
   - Browse different categories
   - Search for items
   - View product details

2. **Test Features**
   - Click category filters
   - Try search
   - Navigate through pages
   - Resize window (responsive)

3. **View Source Code**
   - Check component structure
   - Understand Tailwind styling
   - See utility functions

4. **Connect Backend** (Optional)
   - Ensure backend is running on port 5000
   - API calls will use real data
   - Fallback to dummy data if API fails

---

## Performance Tips

- Components auto-load only when needed
- Images optimized with Next.js
- Dummy data loads instantly
- Skeletons show while data loads
- Smooth transitions and animations

---

## Support Resources

- 📖 [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Complete documentation
- 📋 [COMPONENT_SUMMARY.md](./COMPONENT_SUMMARY.md) - All components overview
- 🔗 [Next.js Docs](https://nextjs.org/docs)
- 🎨 [Tailwind CSS](https://tailwindcss.com)
- ⚛️ [React Docs](https://react.dev)

---

## Ready? Let's Go! 🚀

```bash
npm run dev
```

Then open: **http://localhost:3000**

Enjoy! 🎉
