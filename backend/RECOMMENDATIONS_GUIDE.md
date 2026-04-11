# Recommendation System Guide

## 🎯 Overview

Your e-commerce backend now has a **comprehensive recommendation system** with multiple algorithms to suggest products to users based on:

1. **Content-Based Filtering** - What they've viewed
2. **Collaborative Filtering** - What similar users bought
3. **Category-Based** - Popular items in their favorite categories
4. **Popularity** - Highest-rated items overall
5. **Trending** - Newest high-rated items
6. **Hybrid** - Combination of all algorithms

---

## 🔌 API Endpoints

### Primary Endpoint

#### `GET /recommendations/:userId`
**Main recommendation endpoint** - Returns hybrid recommendations

**Parameters:**
- `userId` (required) - User ID
- `limit` (optional, default: 12) - Number of recommendations
- `type` (optional, default: hybrid) - Recommendation type

**Supported Types:**
- `hybrid` - Combined recommendations (default)
- `content` or `content-based` - Based on browsing history
- `collaborative` - Based on similar users
- `category` - Popular in favorite categories
- `popular` - Highest-rated products
- `trending` - Newest high-rated items

**Examples:**

```bash
# Get hybrid recommendations (12 products)
GET /recommendations/1

# Get content-based recommendations (10 products)
GET /recommendations/1?type=content&limit=10

# Get collaborative recommendations
GET /recommendations/1?type=collaborative

# Get popular products in favorite categories
GET /recommendations/1?type=category&limit=20
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": 5,
      "name": "Wireless Headphones",
      "price": 4999,
      "category": "Electronics",
      "rating": 4.5,
      "reviews": 120,
      "recommendedBecause": "Based on your browsing history"
    }
  ],
  "algorithm": "Hybrid (Combined)",
  "userId": 1,
  "type": "hybrid",
  "count": 12,
  "queryParameters": {
    "limit": "Number of recommendations (default: 12)",
    "type": "Supported: hybrid, content, collaborative, category, popular, trending"
  }
}
```

---

### Individual Algorithm Endpoints

#### `GET /recommendations/:userId/hybrid`
**Hybrid recommendations** - Combines all algorithms

```bash
GET /recommendations/1/hybrid?limit=15
```

#### `GET /recommendations/:userId/content-based`
**Content-based recommendations** - Based on user's viewed products

```bash
GET /recommendations/1/content-based?limit=8
```

#### `GET /recommendations/:userId/collaborative`
**Collaborative recommendations** - Based on similar users' purchases

```bash
GET /recommendations/1/collaborative?limit=8
```

#### `GET /recommendations/:userId/category`
**Category-based recommendations** - Popular items in favorite categories

```bash
GET /recommendations/1/category?limit=8
```

#### `GET /recommendations/popular`
**Popular products** - Highest-rated items (no userId required)

```bash
GET /recommendations/popular?limit=8
```

#### `GET /recommendations/trending`
**Trending products** - Newest high-rated items (no userId required)

```bash
GET /recommendations/trending?limit=8
```

#### `GET /recommendations/similar/:productId`
**Similar products** - Products similar to a specific item

```bash
GET /recommendations/similar/5?limit=8
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": 6,
      "name": "Bluetooth Speaker",
      "rating": 4.3,
      "recommendedBecause": "Same category"
    }
  ],
  "productId": 5,
  "count": 8
}
```

---

## 🧠 Algorithm Details

### 1. Content-Based Filtering

**How it works:**
- Analyzes products the user has viewed
- Extracts categories and average price
- Recommends products in same categories or similar price range

**Best for:**
- New users with limited purchase history
- Users browsing specific categories
- Finding alternatives to viewed products

**Example:**
```
User viewed: 
  - Wireless Headphones ($4999, Electronics)
  - Phone Case ($299, Electronics)

System recommends:
  - Smart Watch ($8999, Electronics) ← Same category
  - Portable Speaker ($2999, Electronics) ← Same category
```

### 2. Collaborative Filtering

**How it works:**
- Finds users with similar purchase history
- Recommends products those users bought but current user hasn't

**Best for:**
- Users with multiple purchases
- Discovering new product categories
- Cross-sell and upsell opportunities

**Example:**
```
User A bought: Headphones, Phone Case
Similar User B bought: Headphones, Phone Case, Smart Watch

System recommends:
  - Smart Watch ← Similar user liked it
```

### 3. Category-Based Filtering

**How it works:**
- Identifies user's favorite categories (from browsing)
- Returns top-rated products from those categories

**Best for:**
- Quick recommendations
- Simple preference-based suggestions
- Users who browse specific categories often

**Example:**
```
User browsed: Electronics (5 times), Fashion (2 times)

System recommends:
  - Top rated Electronics products
```

### 4. Popularity-Based

**How it works:**
- Ranks products by rating and review count
- Returns highest-rated items overall

**Best for:**
- First-time visitors
- Best-sellers page
- No user history available

**Ranking:** `rating DESC, reviews DESC`

### 5. Trending

**How it works:**
- Returns newest products with rating ≥ 4.0
- Sorted by creation date

**Best for:**
- What's new section
- New product promotion
- Encouraging exploration

**Filter:** `rating >= 4 AND created_at DESC`

### 6. Hybrid

**How it works:**
- Combines all algorithms using parallel execution
- Prioritizes by algorithm order
- Removes duplicates
- Returns top N results

**Hybrid Logic:**
```
1. Content-based results (33%)
2. + Collaborative results (33%)
3. + Trending results (33%)
Remove duplicates → Top 12 results
```

**Best for:**
- Personalized home page
- "Recommended For You" section
- Default recommendation strategy

---

## 💡 Implementation Details

### Service Layer (recommendationService.js)

```javascript
// Main functions
getHybridRecommendations(userId, limit)
getContentBasedRecommendations(userId, limit)
getCollaborativeRecommendations(userId, limit)
getCategoryBasedRecommendations(userId, limit)
getPopularProducts(limit)
getTrendingProducts(limit)
getSimilarProducts(productId)
```

### Controller Layer (recommendationController.js)

```javascript
// HTTP handlers
getRecommendations()        // Main endpoint
getHybridRecs()
getContentBasedRecs()
getCollaborativeRecs()
getCategoryRecs()
getPopularRecs()
getTrendingRecs()
getSimilarRecs()
```

### Database Queries

All algorithms use Prisma ORM with optimized queries:

```javascript
// Content-based
prisma.viewHistory.findMany({
  where: { userId },
  include: { product: true },
  orderBy: { viewedAt: 'desc' },
  take: 5
})

// Collaborative
prisma.order.findMany({
  where: { userId: { in: similarUserIds } },
  include: { product: true }
})

// Category-based
prisma.product.findMany({
  where: { category: { in: userCategories } },
  orderBy: [{ rating: 'desc' }, { price: 'asc' }]
})
```

---

## 🧪 Testing Recommendations

### Using cURL

```bash
# Get hybrid recommendations
curl http://localhost:5000/recommendations/1

# Get content-based (limit 5)
curl "http://localhost:5000/recommendations/1?type=content&limit=5"

# Get popular products
curl http://localhost:5000/recommendations/popular

# Get trending products
curl http://localhost:5000/recommendations/trending

# Get similar products
curl http://localhost:5000/recommendations/similar/5
```

### Using Browser

```
http://localhost:5000/recommendations/1
http://localhost:5000/recommendations/1?type=collaborative
http://localhost:5000/recommendations/popular?limit=10
```

### Using Postman

Create requests for:
- `GET /recommendations/1`
- `GET /recommendations/1?type=content`
- `GET /recommendations/1?type=collaborative`
- `GET /recommendations/1/category`
- `GET /recommendations/popular`
- `GET /recommendations/trending`
- `GET /recommendations/similar/5`

---

## 📊 Data Model

### Used Database Tables

**ViewHistory**
```
id          INT
userId      INT (FK → User)
productId   INT (FK → Product)
viewedAt    TIMESTAMP
```

**Order**
```
id          INT
userId      INT (FK → User)
status      ENUM (pending, confirmed, shipped, delivered)
total       FLOAT
productId   INT (FK → Product)
createdAt   TIMESTAMP
```

**Product**
```
id          INT
name        STRING
category    STRING
price       FLOAT
rating      FLOAT
reviews     INT
inStock     BOOLEAN
createdAt   TIMESTAMP
```

---

## 🎯 Frontend Integration

### Example: Display Recommendations

```javascript
// frontend/lib/api.js
export async function fetchRecommendations(userId, type = 'hybrid', limit = 12) {
  return request(
    `/recommendations/${userId}?type=${type}&limit=${limit}`
  );
}

// Usage in component
import { fetchRecommendations } from '@/lib/api';

export default function RecommendationSection({ userId }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function loadRecs() {
      try {
        const data = await fetchRecommendations(userId, 'hybrid', 8);
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      }
    }
    loadRecs();
  }, [userId]);

  return (
    <section>
      <h2>Recommended For You</h2>
      <div className="grid">
        {recommendations.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
```

---

## 🚀 Performance Optimization

### Query Optimization
- Indexed queries on `userId`, `productId`, `category`
- Limits to prevent full table scans
- Distinct queries to remove duplicates

### Algorithm Fallback
- If hybrid fails → returns popular products
- If content-based fails → returns popular products
- Graceful degradation ensures recommendations always work

### Error Handling
```javascript
try {
  // Primary algorithm
} catch (error) {
  // Fallback to simpler algorithm
  return getPopularProducts(limit);
}
```

---

## 📈 Metrics & Analytics

Each recommendation response includes:

```json
{
  "recommendations": [...],
  "algorithm": "Hybrid",
  "userId": 1,
  "type": "hybrid",
  "count": 12          // Number returned
}
```

**Track:**
- `count` - How many recommendations returned
- `algorithm` - Which algorithm was used
- Click-through rate
- Conversion rate

---

## 🔒 Security

- ✅ Input validation on userId and productId
- ✅ User can only see recommendations for their own account
- ✅ No sensitive user data in response
- ✅ Rate limiting not yet implemented (add if needed)

---

## 🛠️ Configuration

### Algorithm Parameters (adjustable in code)

```javascript
// Content-based
const priceRange = 0.7 to 1.3     // ±30% of average price
const limitRecentViews = 5         // Look at last 5 views

// Collaborative
const limitSimilarUsers = 20       // Find top 20 similar users

// Hybrid
const contentWeight = 1/3          // 33% content-based
const collaborativeWeight = 1/3    // 33% collaborative
const trendingWeight = 1/3         // 33% trending
```

---

## 📚 Next Steps

1. **Track Analytics** - Monitor which algorithms work best
2. **A/B Testing** - Test different algorithm combinations
3. **Machine Learning** - Train models for better predictions
4. **Deep Learning** - Neural networks for collaborative filtering
5. **Real-time Updates** - Redis cache for frequent recommendations
6. **Personalization** - Weight algorithms by user type

---

## 🐛 Troubleshooting

### Issue: "No recommendations returned"

**Solution:**
- Check if user exists
- Create some view history (use /view endpoint)
- Check if products exist in database
- Fallback to /recommendations/popular

### Issue: "Same recommendations for all users"

**Solution:**
- Create more varied view history
- Purchase more products
- Wait for more user data
- All algorithms fall back to popular products initially

### Issue: "Slow recommendations"

**Solution:**
- Check database indexes
- Reduce limit parameter
- Use caching
- Use /recommendations/popular for faster response

---

## 📖 API Reference

| Endpoint | Method | Params | Purpose |
|----------|--------|--------|---------|
| `/recommendations/:userId` | GET | type, limit | Hybrid recommendations |
| `/recommendations/:userId/hybrid` | GET | limit | Explicit hybrid |
| `/recommendations/:userId/content-based` | GET | limit | Content-based |
| `/recommendations/:userId/collaborative` | GET | limit | Collaborative |
| `/recommendations/:userId/category` | GET | limit | Category-based |
| `/recommendations/popular` | GET | limit | Popular products |
| `/recommendations/trending` | GET | limit | Trending products |
| `/recommendations/similar/:productId` | GET | limit | Similar products |

---

**Version:** 1.0  
**Last Updated:** April 10, 2026  
**Status:** ✅ Fully Implemented
