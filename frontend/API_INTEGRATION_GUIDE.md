# Frontend-Backend API Integration Guide

## ✅ What's Been Connected

Your React frontend is now **fully integrated** with your Node.js/Express backend APIs.

### Features Implemented

#### 1. **Product Management**
- ✅ Fetch all products from backend (with pagination, search, filtering)
- ✅ Display products in ProductCard component
- ✅ Fetch single product details
- ✅ Fetch similar products

#### 2. **Shopping Cart**
- ✅ Add items to cart (API + localStorage fallback)
- ✅ View cart items
- ✅ Update item quantities
- ✅ Remove items
- ✅ Clear entire cart

#### 3. **Orders**
- ✅ Create orders from cart
- ✅ View order details
- ✅ Order history

#### 4. **Recommendations**
- ✅ Fetch personalized recommendations
- ✅ Fetch similar products
- ✅ Track product views

#### 5. **Users**
- ✅ User registration
- ✅ User authentication
- ✅ User profile
- ✅ View history

---

## 🚀 Quick Start

### 1. Configure Backend URL

Create or edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

✓ Server running on `http://localhost:5000`

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

✓ Frontend running on `http://localhost:3000`

### 4. Test Integration

1. Visit `http://localhost:3000`
2. Browse products (fetched from backend)
3. Click product to see details + similar products
4. Add to cart
5. Create order

---

## 📁 API Integration Architecture

### lib/api.js - Main API Client

```javascript
// Product APIs
fetchProducts({ page, limit, search, category })
fetchProductById(id)
fetchFeaturedProducts()
fetchProductsByCategory(category)
searchProducts(query)

// Cart APIs
fetchCart(userId)
addToCart(userId, productId, quantity)
updateCartItem(itemId, quantity)
removeFromCart(itemId)
clearCart(userId)
getCartTotal(userId)

// Order APIs
createOrder(userId)
fetchOrder(orderId)
fetchUserOrders(userId)
updateOrderStatus(orderId, status)
cancelOrder(orderId)

// Recommendation APIs
fetchRecommendations(userId)
fetchSimilarProducts(productId)

// User APIs
registerUser(email, password, name)
authenticateUser(payload)
fetchUser(userId)
updateUser(userId, userData)
fetchUserHistory(userId)
```

### lib/cart.js - Cart Management with Sync

```javascript
// Frontend + Backend sync
getCartItems(userId)           // API + localStorage fallback
addCartItem(userId, productId, quantity)
updateCartItemQuantity(userId, itemId, quantity)
removeCartItem(userId, itemId)
clearCart(userId)

// Legacy localStorage support
getLocalCartItems()
addLocalCartItem(product)
```

---

## 🔄 Data Flow Examples

### Example 1: Display Products

```javascript
// HomeClient.js
useEffect(() => {
  const data = await fetchProducts({ page, limit: 8, search, category });
  setProducts(data.items);
}, [page, search, category]);
```

**Backend Flow:**
```
GET /products?page=1&limit=8&search=&category=
├─ controller: getAllProducts()
├─ service: getProducts(filter, pagination)
├─ database: Prisma.product.findMany()
└─ Response: { items, totalPages, total }
```

### Example 2: Add to Cart

```javascript
// ProductDetailClient.js
const handleAddToCart = async () => {
  await addCartItem(demoUserId, product.id, 1);
};
```

**Backend Flow:**
```
POST /cart/:userId/items
Body: { productId: 5, quantity: 1 }
├─ controller: addToCart()
├─ service: addToCart(userId, productId, quantity)
├─ database: Create CartItem or update existing
└─ Response: { cartItem: {...} }

// Fallback to localStorage if API fails
```

### Example 3: Create Order

```javascript
// ProductDetailClient.js
const handleOrder = async () => {
  await createOrder(demoUserId);
};
```

**Backend Flow:**
```
POST /orders
Body: { userId: 1 }
├─ controller: createOrder()
├─ service: Create Order from Cart
├─ database: Copy cart items to order, clear cart
└─ Response: { order: {..., status: "pending"} }
```

---

## 🛡️ Error Handling

### API Errors
```javascript
// Automatic error handling in api.js
try {
  const data = await fetchProducts();
} catch (error) {
  error.message       // Human-readable error
  error.status        // HTTP status code
  error.code          // NETWORK_ERROR, etc.
}
```

### Cart API Fallback
```javascript
// If API fails, automatically uses localStorage
const items = await getCartItems(userId);
// ✓ Returns API cart if online
// ✓ Returns localStorage if API is down
```

### Component Error Handling
```javascript
// ProductDetailClient.js
const [cartMessage, setCartMessage] = useState("");
const [addingToCart, setAddingToCart] = useState(false);

async function handleAddToCart() {
  try {
    await addCartItem(userId, productId, 1);
    setCartMessage("✓ Added successfully!");
  } catch (err) {
    setCartMessage("✗ " + err.message);
  }
}
```

---

## 📊 Component Integration

### HomeClient.js
- ✅ Fetch products with pagination
- ✅ Search and filter
- ✅ Handle loading states
- ✅ Display recommendations

### ProductDetailClient.js
- ✅ Fetch product details
- ✅ Fetch similar products
- ✅ Add to cart
- ✅ Create order
- ✅ Error handling

### ProductCard.js
- ✅ Display product info
- ✅ Show ratings/discounts
- ✅ Link to details page

### CartClient.js (if exists)
- ✅ Display cart items
- ✅ Update quantities
- ✅ Remove items
- ✅ Show cart totals

---

## 🔐 Environment Variables

### Frontend (.env.local)
```env
# Required for API integration
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce

# Server
PORT=5000
NODE_ENV=development
```

---

## 🧪 Testing the Integration

### Using cURL

```bash
# Get all products
curl http://localhost:5000/products

# Get single product
curl http://localhost:5000/products/1

# Add to cart
curl -X POST http://localhost:5000/cart/1/items \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 1}'

# View cart
curl http://localhost:5000/cart/1

# Create order
curl -X POST http://localhost:5000/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### Using Browser DevTools

1. Open DevTools → Network tab
2. Navigate on the app
3. Watch API calls:
   - `/products` - Product list
   - `/products/1` - Product details
   - `/cart/1/items` - Add to cart
   - `/orders` - Create order

### Using Postman

Import this [Postman Collection](./postman-collection.json) (create if needed):

```json
{
  "info": { "name": "E-commerce API" },
  "item": [
    {
      "name": "Get Products",
      "request": {
        "method": "GET",
        "url": "{{api_url}}/products?page=1&limit=8"
      }
    },
    {
      "name": "Get Product Details",
      "request": {
        "method": "GET",
        "url": "{{api_url}}/products/1"
      }
    }
  ]
}
```

---

## ⚠️ Common Issues & Solutions

### Issue: "Unable to connect to the backend"

**Solution:**
1. Check backend is running: `npm run dev` in `backend/` folder
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check port: default is `5000`
4. Check CORS: backend should have `Access-Control-Allow-Origin: *`

### Issue: "Products not loading"

**Solution:**
1. Check database migrations: `npm run prisma:migrate`
2. Check seed data: `npm run prisma:seed`
3. Check API logs for errors
4. Verify database connection: `DATABASE_URL` in backend `.env`

### Issue: "Cart not syncing"

**Solution:**
1. Check `userId` is correct
2. Verify cart endpoints exist on backend
3. Check localStorage fallback is working (if API is down)
4. Clear localStorage if needed: `localStorage.clear()`

### Issue: CORS Error

**Solution:**
Backend `server.js` should have:
```javascript
const cors = require("cors");
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
```

---

## 🚀 Production Deployment

### Frontend Deployment (Vercel)
```bash
# Deploy to Vercel
npm run build
vercel deploy

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL https://your-api.com
```

### Backend Deployment (Railway/Heroku)
```bash
# Deploy to Railway
railway up

# Set DATABASE_URL
railway link
```

---

## 📝 API Response Format

### Success Response (Products)
```json
{
  "items": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "price": 4999,
      "category": "Electronics",
      "imageUrl": "https://...",
      "rating": 4.5,
      "reviews": 120,
      "inStock": true,
      "discount": 20
    }
  ],
  "total": 100,
  "totalPages": 5,
  "currentPage": 1
}
```

### Success Response (Cart)
```json
{
  "items": [
    {
      "id": 1,
      "productId": 5,
      "quantity": 2,
      "product": {
        "id": 5,
        "name": "Headphones",
        "price": 4999
      }
    }
  ]
}
```

### Error Response
```json
{
  "message": "Product not found",
  "status": 404
}
```

---

## 🎯 Next Steps

1. ✅ **Started**: APIs are connected
2. 🔒 **Authentication**: Add JWT login/logout
3. 💳 **Payments**: Integrate Stripe/Razorpay
4. 📧 **Notifications**: Add email confirmations
5. 📊 **Analytics**: Track user behavior

---

## 📚 Documentation

- [Backend Guide](../backend/BACKEND_GUIDE.md)
- [API Endpoints](../backend/IMPLEMENTATION_SUMMARY.md)
- [Database Schema](../backend/prisma/schema.prisma)

---

**Version**: 1.0  
**Last Updated**: April 10, 2026  
**Status**: ✅ Fully Integrated
