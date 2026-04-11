# Advanced Recommendation System - Intermediate Level

## Overview

The Advanced Recommendation System builds upon the basic algorithms to provide smarter, more personalized recommendations using:

- **Behavior Tracking**: Stores user views and purchases in database
- **Weighted Scoring**: Purchases worth 4x more than views
- **Co-Purchase Analysis**: "Users also bought" patterns
- **Collaborative Filtering**: Similar users' preferences
- **Content-Based Matching**: Category and preference analysis
- **Recency Decay**: Recent interactions weighted higher than old ones

## Key Concepts

### Data Quality Levels

```
High   = User has 10+ interactions + sufficient comparison data
Medium = User has 3-9 interactions or limited comparison data  
Low    = New user with <3 interactions or product with no history
```

### Confidence Scoring

```
Confidence = (Supporting Data Points / Total Possible Points) × 100

Example:
- If algorithm finds 3 matching similar users out of 20 total users = 15% confidence
- If product bought together 5 times out of 5 orders = 100% co-occurrence
```

### Behavior Scoring Formula

```
Behavior Score = (Views × 0.2) + (Purchases × 0.8)

Weights:
- Views: 0.2 (lighter weight - lower intent signal)
- Purchases: 0.8 (heavier weight - 4x more valuable)

Recency Decay for Views:  weight = e^(-days/30)    [30-day half-life]
Recency Decay for Purchases: weight = e^(-days/60) [60-day half-life]

Example Calculation:
- Product viewed 5 times, most recent 10 days ago
- Same product purchased once, 20 days ago
- Score = (5 × 0.2 × e^(-10/30)) + (1 × 0.8 × e^(-20/60))
- Score = (1.0 × 0.71) + (0.8 × 0.71) = 1.28
```

## API Endpoints

### 1. Smart Recommendations (Default)

**Endpoint**: `GET /advanced-recommendations/:userId`

**Purpose**: Automatically selects best algorithm based on user behavior

**Query Parameters**:
- `product_id` (optional): If user is viewing specific product
- `limit` (optional): Number of recommendations (default: 12)

**Example Request**:
```bash
curl "http://localhost:5000/advanced-recommendations/1?limit=12"
```

**Example Response**:
```json
{
  "recommendations": [
    {
      "id": 5,
      "name": "Premium Product",
      "category": "Electronics",
      "price": 599.99,
      "rating": 4.8,
      "score": "0.85",
      "recommendedBecause": "Based on your viewing and purchase patterns"
    }
  ],
  "userBehavior": {
    "views": 15,
    "purchases": 2,
    "favoriteCategory": "Electronics"
  },
  "algorithm": "Smart (Behavior-Aware)",
  "description": "Combines all signals: views, purchases, similar users",
  "count": 12
}
```

**Algorithm Logic**:
1. Get user's last 50 views and all purchases
2. Calculate behavior scores for each product (0.2 × views + 0.8 × purchases)
3. Apply recency decay (30-day half-life for views, 60-day for purchases)
4. Find co-purchases (users who bought same products also bought...)
5. Combine behavioral score (50%) + co-purchase score (50%)
6. Sort by combined score, return top N

**Best For**: General use, first recommendation to show

---

### 2. Users Also Bought (Co-Purchase Analysis)

**Endpoint**: `GET /advanced-recommendations/:userId/users-also-bought`

**Purpose**: Finds products frequently bought WITH a specific product

**Query Parameters**:
- `product_id` (required): Product to analyze
- `limit` (optional): Number of recommendations (default: 8)

**Example Request**:
```bash
curl "http://localhost:5000/advanced-recommendations/1/users-also-bought?product_id=5&limit=8"
```

**Example Response**:
```json
{
  "recommendations": [
    {
      "id": 12,
      "name": "Accessory Product",
      "coOccurrence": 7,
      "percentBoughtTogether": "70%",
      "recommendedBecause": "70% of customers who bought the reference product also bought this"
    }
  ],
  "algorithm": "Co-Purchase Analysis",
  "ordersAnalyzed": 10,
  "count": 3
}
```

**Algorithm Logic**:
1. Find all orders containing the reference product
2. Count co-purchases: how many times each other product appears in those orders
3. Filter by minimum threshold (1/3 of orders containing reference product)
4. Sort by frequency and return top N
5. Calculate percentage: (co-occurrence / total orders) × 100

**Formula**:
```
Minimum Threshold = max(1, floor(Orders With Product / 3))

Example:
- 10 orders contain reference product
- Minimum threshold = max(1, floor(10/3)) = 3
- Product X appears in 7 of those 10 orders = included + 70% shown
- Product Y appears in 2 of those 10 orders = excluded (below threshold)
```

**Best For**: Upsell (showing at product detail), cross-sell, bundle creation

---

### 3. Advanced Collaborative Filtering

**Endpoint**: `GET /advanced-recommendations/:userId/collaborative-advanced`

**Purpose**: Finds similar users and their purchases with confidence scoring

**Query Parameters**:
- `limit` (optional): Number of recommendations (default: 8)

**Example Request**:
```bash
curl "http://localhost:5000/advanced-recommendations/1/collaborative-advanced?limit=8"
```

**Example Response**:
```json
{
  "recommendations": [
    {
      "id": 8,
      "name": "Similar User Product",
      "score": 5,
      "confidence": "50%",
      "recommendedBecause": "50% of similar users purchased this"
    }
  ],
  "algorithm": "Advanced Collaborative Filtering",
  "userId": 1,
  "similarUsersCount": 20,
  "averageConfidence": 65,
  "count": 8,
  "interpretation": "Moderate confidence recommendations"
}
```

**Algorithm Logic**:
1. Get target user's viewed and purchased product IDs
2. Find similar users: anyone who viewed/bought ANY of those products
3. Limit to 20 most similar users (by overlap count)
4. Get purchases from those similar users
5. Score products by how many similar users bought them
6. Calculate confidence = (count of similar users who bought / total similar users) × 100
7. Return sorted by score

**Confidence Interpretation**:
```
>80%  = Very High Confidence (similar users LOVE these)
60-80% = Moderate Confidence  
40-60% = Fair Confidence
<40%  = Low Confidence
```

**Best For**: Cross-selling, personalized store homepage

---

### 4. Advanced Content-Based

**Endpoint**: `GET /advanced-recommendations/:userId/content-advanced`

**Purpose**: Finds products similar to user's preferred categories

**Query Parameters**:
- `limit` (optional): Number of recommendations (default: 8)

**Example Request**:
```bash
curl "http://localhost:5000/advanced-recommendations/1/content-advanced?limit=8"
```

**Example Response**:
```json
{
  "recommendations": [
    {
      "id": 15,
      "name": "Category Match Product",
      "category": "Electronics",
      "recommendedBecause": "Matches your interest in Electronics"
    }
  ],
  "algorithm": "Advanced Content-Based",
  "userId": 1,
  "preferredCategories": ["Electronics", "Gadgets", "Computing"],
  "count": 8,
  "interpretation": "Found 8 products matching your interests (categories: Electronics, Gadgets, Computing)"
}
```

**Algorithm Logic**:
1. Get user's last 30 views with product details
2. Count views by category 
3. Identify top 3 categories (categories user views most often)
4. Find unseen products in those categories that are in stock
5. Sort by rating (higher rating = better)
6. Return top N products

**Preference Detection**:
```
Track: Which categories user browsed most often in last 30 views
Example: 
- Electronics: 15 views
- Gadgets: 10 views
- Computing: 5 views
→ Top categories: Electronics, Gadgets, Computing
```

**Best For**: Homepage personalization, category page recommendations

---

### 5. User Behavior Analytics

**Endpoint**: `GET /advanced-recommendations/:userId/behavior`

**Purpose**: Analyzes user engagement and classifies user type

**Query Parameters**: None

**Example Request**:
```bash
curl "http://localhost:5000/advanced-recommendations/1/behavior"
```

**Example Response**:
```json
{
  "userId": 1,
  "analytics": {
    "viewCount": 25,
    "purchaseCount": 3,
    "cartItems": 2,
    "engagementScore": 67,
    "loyaltyScore": 45,
    "overallScore": 65
  },
  "classification": {
    "activityLevel": "high",
    "userType": "Repeat Customer"
  },
  "interpretation": {
    "engagement": "Highly engaged user",
    "purchases": "Made 3 purchase(s)",
    "recommendationStrategy": "Collaborative filtering recommended"
  }
}
```

**Scoring Formula**:
```
Engagement Score = (Views × 2) + (Cart Items × 5)
Loyalty Score = (Purchases × 15) + (Recent Activity Bonus)
Overall Score = (Engagement × 0.6) + (Loyalty × 0.4)

User Classification:
- Loyal Customer: >5 purchases
- Repeat Customer: 1-5 purchases
- Active Browser: 0 purchases, >0 views
- New User: No views/purchases
```

**Activity Levels**:
```
Views + Purchases:
- High: 10+
- Medium: 3-9
- Low: 1-2
- Inactive: 0
```

**Best For**: Admin dashboards, user segmentation, strategy planning

---

### 6. Product Analytics

**Endpoint**: `GET /advanced-recommendations/product/:productId/metadata`

**Purpose**: Gets product performance metrics and recommendation score

**Query Parameters**: None

**Example Request**:
```bash
curl "http://localhost:5000/advanced-recommendations/product/5/metadata"
```

**Example Response**:
```json
{
  "productId": 5,
  "analytics": {
    "views": 45,
    "purchases": 12,
    "daysOnMarket": 30
  },
  "recommendation": {
    "score": 156,
    "quality": "Excellent"
  },
  "interpretation": {
    "popularity": "Viewed 45 times, purchased 12 times",
    "conversionRate": "27% conversion",
    "performance": "High performing product"
  }
}
```

**Scoring Formula**:
```
Product Score = (Views × 1) + (Purchases × 10)

Quality Rating:
- Excellent: >150
- Very Good: 120-150
- Good: 100-120
- Fair: <100

Conversion Rate = (Purchases / Views) × 100

Performance Thresholds:
- High: Conversion >10%
- Good: Conversion >5%
- Needs Attention: Conversion <5%
```

**Best For**: Inventory management, product performance reporting, merchandising

---

### 7. Track User View

**Endpoint**: `POST /advanced-recommendations/track-view`

**Purpose**: Records when user views a product

**Request Body**:
```json
{
  "userId": 1,
  "productId": 5
}
```

**Example Request**:
```bash
curl -X POST "http://localhost:5000/advanced-recommendations/track-view" \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":5}'
```

**Example Response**:
```json
{
  "success": true,
  "tracked": {
    "userId": 1,
    "productId": 5,
    "viewedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Stored Data**: Saved in `ViewHistory` table with:
- userId
- productId  
- viewedAt (timestamp)

**Best For**: Tracking user behavior throughout session

---

### 8. Recommendation Analysis

**Endpoint**: `GET /advanced-recommendations/:userId/analysis`

**Purpose**: Comprehensive analysis showing why recommendations are made

**Query Parameters**:
- `product_id` (optional): For context-aware analysis
- `limit` (optional): Number of recommendations (default: 6)

**Example Request**:
```bash
curl "http://localhost:5000/advanced-recommendations/1/analysis?product_id=5&limit=6"
```

**Example Response**:
```json
{
  "userId": 1,
  "analysis": {
    "userProfile": {
      "type": "Repeat Customer",
      "engagement": 67,
      "loyalty": 45,
      "viewsTracked": 25,
      "purchasesMade": 3
    },
    "recommendations": {
      "count": 6,
      "sources": [
        "Content-Based Analysis",
        "Collaborative Matching",
        "Co-Purchase Patterns"
      ],
      "topConfidenceRecommendation": {
        "name": "Top Recommendation",
        "confidence": "85%",
        "reason": "Based on your viewing and purchase patterns"
      }
    },
    "dataQuality": {
      "hasViewHistory": true,
      "hasPurchaseHistory": true,
      "sufficientData": true,
      "confidenceLevel": "High"
    }
  }
}
```

**Analysis Components**:
1. User profile classification
2. Data quality assessment
3. Recommendation sources (which algorithms contributed)
4. Confidence levels for top recommendations
5. Overall data sufficiency for high-quality recommendations

**Best For**: Transparency, debugging why recommendations appear, building user trust

---

## Comparison: Basic vs Intermediate Algorithms

| Feature | Basic | Intermediate |
|---------|-------|--------------|
| **Algorithms** | 6 simple | 6 advanced |
| **Data Tracking** | No persistence | Stores all views/purchases |
| **Behavioral Analysis** | View count only | Views (0.2) vs Purchases (0.8) |
| **Recency Weighting** | None | 30/60-day decay |
| **Co-Purchase Analysis** | No | Yes (users-also-bought) |
| **Confidence Scoring** | No | Yes (% of similar users) |
| **Similar Users** | No | Yes (collaborative filtering) |
| **Category Analysis** | Basic | Advanced preference tracking |
| **User Classification** | No | Loyal/Repeat/Browser/New |
| **Product Analytics** | No | Views, purchases, conversion rate |
| **Explanation Quality** | Generic | Specific with percentages |
| **Response Time** | <200ms | <500ms (more complex) |

---

## Database Schema

### ViewHistory Table

```sql
CREATE TABLE ViewHistory (
  id SERIAL PRIMARY KEY,
  userId INT REFERENCES User(id) ON DELETE CASCADE,
  productId INT REFERENCES Product(id) ON DELETE CASCADE,
  viewedAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(userId, productId)  -- One view per product per user per day
);
```

**Purpose**: Stores all user views for behavior tracking

**Indexed**: Yes (userId, productId, viewedAt)

---

## When to Use Each Endpoint

| Scenario | Endpoint | Reason |
|----------|----------|--------|
| Homepage recommendations | `/` (Smart) | Uses all available signals |
| Product detail page | `users-also-bought` | Upsell related products |
| Personalized section | `collaborative-advanced` | Similar user preferences |
| Category browsing | `content-advanced` | Match category interests |
| Admin dashboard | `behavior` or `product/*/metadata` | Understand user/product metrics |
| Transparency | `analysis` | Show why recommendations made |
| Track browsing | `track-view` (POST) | Store user activity |

---

## Implementation Best Practices

### 1. Track Views Consistently

Call `track-view` whenever user views a product detail page:

```javascript
// Frontend - ProductDetailClient.js example
useEffect(() => {
  if (product?.id) {
    trackUserInteraction(userId, product.id, 'view');
  }
}, [product?.id, userId]);
```

### 2. Use Appropriate Algorithms

```javascript
// Homepage: Show smart recommendations
GET /advanced-recommendations/:userId

// Product detail: Show users-also-bought
GET /advanced-recommendations/:userId/users-also-bought?product_id=5

// Personalization: Show content-based
GET /advanced-recommendations/:userId/content-advanced
```

### 3. Handle Low Data Scenarios

```javascript
// Check data quality in response
if (response.dataQuality === 'low') {
  // Show popular products as fallback
  showMostPopularProducts();
}
```

### 4. Cache When Appropriate

Intermediate algorithms are more CPU-intensive. Consider caching:

```javascript
// Cache recommendations for 30 minutes
const cacheKey = `recs:${userId}`;
const cached = redis.get(cacheKey);

if (!cached) {
  const fresh = await getSmartRecommendations(userId);
  redis.setex(cacheKey, 1800, fresh); // 30 min TTL
  return fresh;
}
```

### 5. A/B Testing Ready

Responses include algorithm metadata:

```javascript
// Track which algorithm performed better
analytics.track('recommendation_shown', {
  algorithm: response.algorithm,
  userId: response.userId,
  count: response.count,
});

// Then measure if users click recommendations
```

---

## Performance Metrics

### Response Time Expectations

```
Smart Recommendations:        200-400ms (complex calculations)
Users Also Bought:            100-200ms (straightforward analysis)
Collaborative Filtering:      300-500ms (grouping + scoring)
Content-Based:               150-300ms (category matching)
Behavior Analytics:          50-150ms  (counting/scoring)
Product Analytics:           50-100ms  (simple queries)
Track View:                  30-50ms   (simple insert)
Analysis:                    500-800ms (comprehensive)
```

### Database Query Optimization

All queries use:
- Indexed lookups (userId, productId, category)
- Efficient grouping and aggregation
- Limit clauses to prevent full-table scans
- Relationship includes to avoid N+1 queries

Example optimized query:
```prisma
const views = await prisma.viewHistory.findMany({
  where: { userId },
  include: { product: true },    // Join in one query
  orderBy: { viewedAt: 'desc' },
  take: 50,                      // Limit results
});
```

---

## Debugging & Troubleshooting

### Issue: Weak Recommendations (Low Score)

**Cause**: User has insufficient data

**Solution**: 
```bash
# Check user behavior
curl "http://localhost:5000/advanced-recommendations/1/behavior"

# If low engagement, show popular products instead
GET /recommendations/popular
```

### Issue: Users Also Bought Returns Empty

**Cause**: Product has no co-purchases or not enough transactions

**Solution**:
- Need at least 1 order with product
- Minimum 1/3 co-occurrence threshold
- Check product exists: GET /products/5

### Issue: Slow Responses

**Cause**: Large view history or many similar users

**Solution**:
- Limit query: `?limit=50` instead of fetching 100+
- Archive old ViewHistory entries (>1 year old)
- Add database indexes on (userId, viewedAt)

### Issue: Same Recommendations Always

**Cause**: Category preferences too narrow or low diversity

**Solution**:
- Override brand preference occasionally (mix in trending items)
- Add exploration bonus: 10% of results should be new categories
- Check if user has been served X before (vary results)

---

## Future Enhancements

### Phase 3: Advanced (~1000 lines code)

- **ML Integration**: Matrix factorization for pure collaborative filtering
- **Deep Learning**: Neural networks for complex pattern recognition
- **Time Series Analysis**: Seasonal trends and purchase cycles
- **Embeddings**: Product and user embeddings for semantic similarity
- **Real-time Updates**: WebSocket notifications for trending products

### Phase 4: Production Grade (~2000+ lines)

- **A/B Testing Framework**: Compare algorithm performance
- **Bandit Algorithms**: Thompson sampling for exploration/exploitation
- **Context-Aware**: Location, device, time-of-day factors
- **Fairness & Diversity**: Ensure diverse recommendations, avoid filter bubbles
- **Explainability**: LIME/SHAP for ML model transparency

---

## API Reference Summary

```
GET  /advanced-recommendations/:userId                    - Smart recommendations
GET  /advanced-recommendations/:userId/users-also-bought  - Co-purchase analysis
GET  /advanced-recommendations/:userId/collaborative-advanced - Similar users
GET  /advanced-recommendations/:userId/content-advanced   - Category preferences
GET  /advanced-recommendations/:userId/behavior           - User analytics
GET  /advanced-recommendations/product/:productId/metadata - Product metrics
POST /advanced-recommendations/track-view                 - Track user view
GET  /advanced-recommendations/:userId/analysis           - Full analysis
```

**Base URL**: `http://localhost:5000`

**Authentication**: None (add in production)

**Rate Limiting**: None (add in production)

---

## Support & Resources

- **Issue Tracking**: Create issue in repository
- **Documentation**: See other guides (RECOMMENDATIONS_GUIDE.md, API_INTEGRATION_GUIDE.md)
- **Examples**: See test-recommendations.sh, curl examples above
- **Performance**: Run in production-like environment for realistic metrics

---

**Last Updated**: 2024
**Maintainer**: E-commerce Team
**License**: MIT
