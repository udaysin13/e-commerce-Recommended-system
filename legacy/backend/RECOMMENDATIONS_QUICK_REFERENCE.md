# Recommendation System - Quick Reference

## 🎯 Available Endpoints

### Main Endpoint (Recommended)
```bash
GET /recommendations/:userId
```

**Examples:**
- `GET /recommendations/1` - Hybrid recommendations
- `GET /recommendations/1?type=content` - Content-based
- `GET /recommendations/1?type=collaborative` - Collaborative
- `GET /recommendations/1?limit=20` - More results

---

## 📋 All Endpoints

```
GET /recommendations/:userId                    → Hybrid recommendations
GET /recommendations/:userId/hybrid             → Explicit hybrid
GET /recommendations/:userId/content-based      → Based on views
GET /recommendations/:userId/collaborative      → Based on similar users
GET /recommendations/:userId/category           → Popular in categories
GET /recommendations/popular                    → Highest-rated
GET /recommendations/trending                   → Newest high-rated
GET /recommendations/similar/:productId         → Similar products
```

---

## 🚀 Quick Test

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Test in Browser
```
http://localhost:5000/recommendations/1
http://localhost:5000/recommendations/1?type=content&limit=5
http://localhost:5000/recommendations/popular
```

### 3. Test with cURL
```bash
# Hybrid recommendations
curl http://localhost:5000/recommendations/1

# Content-based (limit 5)
curl "http://localhost:5000/recommendations/1?type=content&limit=5"

# Popular products
curl http://localhost:5000/recommendations/popular

# Similar products
curl http://localhost:5000/recommendations/similar/5
```

---

## 📊 Algorithm Types

| Type | Based On | Best For |
|------|----------|----------|
| `hybrid` | All algorithms | Personalized homepage |
| `content` | Browsing history | What user viewed |
| `collaborative` | Similar users | Cross-sell |
| `category` | Favorite categories | Quick suggestions |
| `popular` | Rating/reviews | Best sellers |
| `trending` | New + rated | What's new |

---

## 💾 Data Requirements

Each algorithm works with:

| Algorithm | Requires | Falls Back To |
|-----------|----------|---------------|
| Content-based | View history | Popular |
| Collaborative | Purchase history | Popular |
| Category | View history | Popular |
| Hybrid | Any data | Popular |
| Popular | Product ratings | - |
| Trending | Product creation date | - |

---

## 🔄 Response Format

```json
{
  "recommendations": [
    {
      "id": 5,
      "name": "Product Name",
      "price": 1999,
      "category": "Electronics",
      "rating": 4.5,
      "reviews": 120,
      "recommendedBecause": "Based on your browsing history"
    }
  ],
  "algorithm": "Hybrid",
  "userId": 1,
  "type": "hybrid",
  "count": 12
}
```

---

## 🔐 Parameters

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `userId` | INT | Required | User ID (path param) |
| `limit` | INT | 12 | Max 100 |
| `type` | STRING | hybrid | Algorithm type |

---

## 📈 Performance

- **Speed**: < 500ms for most queries
- **Fallback**: Always returns recommendations (no errors)
- **Caching**: Not yet implemented (add Redis for faster results)
- **Batch Size**: Default 12, max 100 recommendations

---

## ✅ Features

- ✅ 6 different algorithms
- ✅ Automatic fallback to popular
- ✅ Error handling
- ✅ Customizable limits
- ✅ Type selection
- ✅ Reason for recommendation included

---

## 🎯 Frontend Usage

```javascript
// Get recommendations
const response = await fetch(
  'http://localhost:5000/recommendations/1?type=hybrid&limit=8'
);
const data = await response.json();
const products = data.recommendations;

// Display in ProductCard
products.map(product => (
  <ProductCard 
    key={product.id} 
    product={product}
    badge={product.recommendedBecause}
  />
))
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| No recommendations | Create view history first |
| Same for all users | Build more user data |
| Slow response | Reduce limit or use /popular |
| Error 400 | Check userId is valid number |
| Error 500 | Check database connection |

---

## 📚 Full Documentation

See [RECOMMENDATIONS_GUIDE.md](./RECOMMENDATIONS_GUIDE.md) for:
- Detailed algorithm explanations
- Implementation details
- Database schema
- Performance optimization
- Troubleshooting guide

---

**Quick Tip**: Start with `/recommendations/:userId` (hybrid) and let the system decide the best algorithm!
