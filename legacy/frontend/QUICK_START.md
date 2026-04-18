# 🚀 Quick Start Guide - Frontend Setup

## Prerequisites
- ✅ Node.js 18+ installed
- ✅ npm available
- ✅ Backend running on http://localhost:5000

## 📋 Step-by-Step Installation

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Environment Configuration
The `.env.local` file is already configured with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📱 Features to Test

### Home Page (http://localhost:3000)
- [ ] Navbar displays with logo and connection status
- [ ] Product grid loads with skeleton animation
- [ ] Search functionality works
- [ ] Pagination buttons navigate pages
- [ ] Recommendations section displays
- [ ] Hover effects on product cards

### Product Detail (http://localhost:3000/products/1)
- [ ] Product information displays correctly
- [ ] Product price shows in gradient text
- [ ] Back button navigates to home
- [ ] Create Order button works
- [ ] Similar products display below
- [ ] View is tracked (check backend logs)

### Responsive Design
- [ ] Desktop view: 4 columns
- [ ] Tablet view: 2 columns
- [ ] Mobile view: 1 column

## 🔧 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## 📦 Project Structure at a Glance

```
✅ frontend/
  ✅ components/        - Reusable React components
  ✅ app/               - Next.js pages (App Router)
  ✅ lib/               - API service functions
  ✅ globals.css        - Tailwind & global styles
  ✅ package.json       - Dependencies
  ✅ .env.local         - Environment configuration
```

## 🎯 Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **Navbar** | Top navigation bar | `components/Navbar.js` |
| **ProductCard** | Reusable product display | `components/ProductCard.js` |
| **HomeClient** | Home page logic | `components/HomeClient.js` |
| **ProductDetailClient** | Product detail logic | `components/ProductDetailClient.js` |
| **LoadingGrid** | Skeleton screens | `components/LoadingGrid.js` |
| **RecommendationSection** | Recommendations display | `components/RecommendationSection.js` |

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution**: Ensure backend is running
```bash
# In backend directory
npm run dev  # or appropriate start command
```

### Issue: "Port 3000 already in use"
**Solution**: Use different port
```bash
npm run dev -- -p 3001
```

### Issue: "Styling looks broken"
**Solution**: Clear Next.js cache and rebuild
```bash
rm -r .next
npm run dev
```

### Issue: "Images not loading"
**Solution**: Verify backend is serving images correctly

## 📊 Performance Tips

1. **Image Optimization**: Next.js Image component ready (update ProductCard if needed)
2. **Code Splitting**: Automatic with Next.js dynamic imports
3. **CSS Optimization**: Tailwind CSS purges unused styles
4. **Lazy Loading**: Implement for off-screen products

## 🔗 API Endpoints Used

```
GET  /products?page=1&limit=8&search=&category=
GET  /product/:id
GET  /recommendations/:userId
POST /view
POST /order
```

## 📚 Key Files to Know

- `lib/api.js` - All API calls
- `components/HomeClient.js` - Product listing logic
- `components/ProductDetailClient.js` - Product detail logic
- `app/globals.css` - All styling
- `app/layout.js` - Root layout with Navbar

## ✨ Features Implemented

✅ Product listing with pagination  
✅ Search and filter  
✅ Product detail page  
✅ Dynamic routing  
✅ Recommendation engine integration  
✅ View tracking  
✅ Order creation  
✅ Loading states with skeletons  
✅ Error handling  
✅ Responsive design  
✅ Modern UI with Tailwind CSS  
✅ Smooth animations  
✅ Mobile-first approach  

## 🎉 You're All Set!

The frontend is ready to use. Start the development server and explore the AI-powered e-commerce recommendation experience!

```bash
npm run dev
```

---
**Need help?** Check FRONTEND_README.md for detailed documentation.
