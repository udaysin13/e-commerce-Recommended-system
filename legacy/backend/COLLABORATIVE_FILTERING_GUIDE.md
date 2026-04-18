# Collaborative Filtering Implementation Guide

## Overview

This guide covers the **Advanced Collaborative Filtering** recommendation engine using **Cosine Similarity** - a production-ready user-user similarity algorithm for personalized product recommendations.

## Quick Start

### Get Recommendations
```bash
curl -X GET 'http://localhost:3000/api/recommendations/1/collaborative-filtering' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### With Parameters
```bash
curl -X GET 'http://localhost:3000/api/recommendations/1/collaborative-filtering?topK=15&minSimilarity=0.5&limit=20' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Analyze Similarity Distribution
```bash
curl -X GET 'http://localhost:3000/api/recommendations/1/collaborative-filtering/analysis' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## Algorithm Details

### What is Collaborative Filtering?

Collaborative Filtering recommends products based on the principle: **"If you're similar to another user, they probably like products you'll like too."**

### Mathematical Approach: Cosine Similarity

The algorithm uses **cosine similarity** to measure how similar two users are:

```
similarity(User A, User B) = (A · B) / (||A|| × ||B||)
```

Where:
- **A · B** = dot product of interaction vectors
- **||A||** = magnitude (length) of vector A
- **||B||** = magnitude of vector B
- **Result** = value between 0 (opposite tastes) and 1 (identical tastes)

### Step-by-Step Process

```
1. BUILD INTERACTION VECTORS
   └─ For each user, create a vector of products they viewed/purchased
   └─ View = 1 point, Purchase = 2 points
   └─ Result: Vector of [p1_views, p2_views, p3_views, ...]

2. CALCULATE SIMILARITY
   └─ Compare target user's vector with all other users
   └─ Use cosine similarity formula
   └─ Result: Similarity scores between 0 and 1

3. FIND SIMILAR USERS
   └─ Filter users with similarity > minSimilarity threshold (default: 0.3)
   └─ Sort by similarity score
   └─ Take top K similar users (default: 10)

4. COLLECT PRODUCTS
   └─ Gather products viewed/purchased by similar users
   └─ (Excluding products already in target user's history)

5. SCORE PRODUCTS
   └─ For each product, sum weighted similarities:
      └─ Product purchased by similar user: similarity × 2
      └─ Product viewed by similar user: similarity × 1
   └─ Higher score = more similar users like it

6. RETURN RECOMMENDATIONS
   └─ Sort by score
   └─ Return top N products (default: 10)
```

### Example Calculation

**User 1's Interaction Vector:**
```
Product 1 (viewed):      1
Product 2 (purchased):   2
Product 3 (viewed):      1
Product 4 (not viewed):  0
```

**User 2's Interaction Vector:**
```
Product 1 (viewed):      1
Product 2 (viewed):      1
Product 3 (purchased):   2
Product 4 (viewed):      1
```

**Cosine Similarity Calculation:**
```
A·B = (1×1) + (2×1) + (1×2) + (0×1) = 1 + 2 + 2 + 0 = 5

||A|| = √(1² + 2² + 1² + 0²) = √6 ≈ 2.449

||B|| = √(1² + 1² + 2² + 1²) = √7 ≈ 2.646

Similarity = 5 / (2.449 × 2.646) ≈ 0.774
```

---

## API Endpoints

### 1. Get Collaborative Filtering Recommendations

**Endpoint:** `GET /recommendations/:userId/collaborative-filtering`

**Authentication:** Required (JWT)

**Query Parameters:**

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `topK` | integer | 10 | 1-100 | Number of similar users to consider |
| `minSimilarity` | float | 0.3 | 0-1 | Minimum similarity score threshold |
| `limit` | integer | 10 | 1-50 | Number of recommendations to return |

**Example Requests:**

```bash
# Default parameters
GET /recommendations/1/collaborative-filtering

# Strict matching (higher quality, fewer results)
GET /recommendations/1/collaborative-filtering?minSimilarity=0.6&limit=5

# Broader matching (more results, potentially lower quality)
GET /recommendations/1/collaborative-filtering?topK=20&minSimilarity=0.2&limit=20

# Balanced approach
GET /recommendations/1/collaborative-filtering?topK=15&minSimilarity=0.4&limit=15
```

**Success Response (200):**

```json
{
  "userId": 1,
  "algorithm": "Collaborative Filtering (Cosine Similarity)",
  "recommendations": [
    {
      "productId": 5,
      "productName": "Wireless Headphones",
      "category": "electronics",
      "price": 79.99,
      "description": "High quality wireless headphones",
      "imageUrl": "https://...",
      "similarityScore": 0.85,
      "fromSimilarUsers": 3,
      "relevanceScore": 0.712,
      "reason": "Similar users purchased this"
    },
    {
      "productId": 8,
      "productName": "USB-C Cable",
      "category": "electronics",
      "price": 12.99,
      "description": "Universal USB-C charging cable",
      "imageUrl": "https://...",
      "similarityScore": 0.72,
      "fromSimilarUsers": 2,
      "relevanceScore": 0.654,
      "reason": "Popular among similar users"
    }
  ],
  "count": 2,
  "parameters": {
    "topK": 10,
    "minSimilarity": 0.3,
    "limit": 10
  }
}
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `userId` | Target user ID |
| `algorithm` | Algorithm used |
| `recommendations` | Array of recommended products |
| `count` | Number of recommendations returned |
| `parameters` | Query parameters used in request |
| `similarityScore` | User similarity score (0-1) |
| `fromSimilarUsers` | How many similar users have this product |
| `relevanceScore` | Final product score (normalized) |
| `reason` | Why this product was recommended |

**Error Responses:**

```
400 Bad Request: Invalid user ID
401 Unauthorized: Missing/invalid JWT token
404 Not Found: User not found in database
500 Internal Server Error: Database query failed
```

---

### 2. Analyze User Similarity Distribution

**Endpoint:** `GET /recommendations/:userId/collaborative-filtering/analysis`

**Authentication:** Required (JWT)

**Purpose:** Debug endpoint to understand user's similarity neighborhood and recommendation quality

**Example Request:**

```bash
GET /recommendations/1/collaborative-filtering/analysis
```

**Success Response (200):**

```json
{
  "userId": 1,
  "analysis": {
    "totalSimilarUsers": 5,
    "averageSimilarity": 0.52,
    "maxSimilarity": 0.87,
    "minSimilarity": 0.31,
    "similarityDistribution": {
      "0.8-1.0": 2,
      "0.6-0.8": 2,
      "0.4-0.6": 1,
      "0.2-0.4": 0,
      "0.0-0.2": 0
    },
    "topSimilarUsers": [
      {
        "userId": 3,
        "similarity": 0.87,
        "commonProducts": 4,
        "sharedPurchases": 2
      },
      {
        "userId": 7,
        "similarity": 0.82,
        "commonProducts": 3,
        "sharedPurchases": 1
      }
    ]
  },
  "recommendation": "Good similarity distribution"
}
```

**Analysis Interpretation:**

| Metric | Interpretation |
|--------|-----------------|
| `averageSimilarity` < 0.3 | Isolated user, limited rec quality |
| `averageSimilarity` 0.3-0.5 | Moderate similarity, decent recs |
| `averageSimilarity` > 0.5 | Strong similarity, high-quality recs |
| `totalSimilarUsers` < 3 | Few similar users, consider hybrid approach |
| High `maxSimilarity` | Has very similar users for reference |

---

## Performance Characteristics

### Time Complexity

```
Calculation Time ≈ O(U × P)

Where:
  U = number of users
  P = average products per user

Practical: 
  - 100 users:     ~10-50ms
  - 1,000 users:   ~100-500ms
  - 10,000 users:  ~1-5 seconds
  - 100,000 users: ~10-50 seconds
```

### Memory Usage

```
Storage ≈ O(U × P)

Practical:
  - 10,000 users × 50 avg products = ~500KB vectors
  - 100,000 users × 50 avg products = ~5MB vectors
```

### Optimization Strategies

1. **Caching Layer**
   ```javascript
   // Cache similarity matrix daily
   const similarityCache = new Map();
   // Regenerate every 24 hours
   ```

2. **Batch Processing**
   ```javascript
   // Process multiple users in parallel
   const recs = await service.getCollaborativeRecommendationsBatch(
     userIds,
     { topK: 10, minSimilarity: 0.3, limit: 10 }
   );
   ```

3. **Limiting topK**
   - Default 10 is optimal for most use cases
   - Higher values improve quality but slow computation
   - 15-20 is recommended for high-traffic systems

4. **Threshold Tuning**
   - `minSimilarity=0.3` balances coverage and quality
   - Lower thresholds (0.1-0.2) for better coverage but noise
   - Higher thresholds (0.5-0.7) for strict similarity

---

## Integration Guide

### With Existing Recommendation Service

The collaborative filtering service integrates with the main recommendations infrastructure:

```javascript
// In recommendationService.js
const collaborativeFiltering = require('./collaborativeFilteringService');

// Can be called as part of hybrid recommendations
const recommendations = {
  collaborative: await collaborativeFiltering.getCollaborativeRecommendations(userId),
  contentBased: await contentBasedRecommendations(userId),
  hybrid: await mergeAndRankRecommendations([...])
};
```

### In React Frontend

```jsx
import { useRecommendations } from './hooks/useRecommendations';

export function RecommendationSection({ userId }) {
  const { recommendations, loading } = useRecommendations(
    userId,
    'collaborative-filtering',
    { topK: 15, minSimilarity: 0.4 }
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="recommendations">
      <h2>Recommended for You</h2>
      <div className="product-grid">
        {recommendations.map(product => (
          <ProductCard
            key={product.productId}
            product={product}
            badge={`${(product.similarityScore * 100).toFixed(0)}% Match`}
          />
        ))}
      </div>
    </div>
  );
}
```

### In Next.js

```javascript
// app/recommendations/page.js
import { getCollaborativeRecommendations } from '@/lib/api';

export default async function RecommendationsPage({ searchParams }) {
  const userId = searchParams.userId;
  const recommendations = await getCollaborativeRecommendations(userId, {
    topK: searchParams.topK || 10,
    minSimilarity: searchParams.similarity || 0.3
  });

  return (
    <main>
      <h1>Personalized Recommendations</h1>
      {recommendations.map(rec => (
        <ProductCard key={rec.productId} {...rec} />
      ))}
    </main>
  );
}
```

---

## Fallback Strategies

### When Few Similar Users Exist

```javascript
// Automatic fallback
if (similarUsers.length === 0) {
  return await getPopularProducts({ limit: 10 });
}

if (similarUsers.length < 3) {
  // Blend with content-based recommendations
  return mergeAlgorithms([
    collaborativeRecs,
    contentBasedRecs
  ]);
}
```

### When No Interaction History Exists

```javascript
// New user cold start problem
if (user.totalInteractions === 0) {
  return await getTrendingProducts({ category: userProfile.preferences });
}
```

---

## Algorithm Variations & Tuning

### Strict Matching (Higher Quality)

```javascript
// Use for premium recommendations / curated lists
const recommendations = await getCollaborativeRecommendations(userId, {
  topK: 5,
  minSimilarity: 0.6,
  limit: 5
});
```

**Characteristics:**
- Only shows products from very similar users
- Fewer but higher-confidence recommendations
- Better for important decisions (luxury items)

### Generous Matching (Higher Coverage)

```javascript
// Use for exploration / new user experience
const recommendations = await getCollaborativeRecommendations(userId, {
  topK: 50,
  minSimilarity: 0.1,
  limit: 20
});
```

**Characteristics:**
- Includes broader user base
- More recommendations to choose from
- Potentially lower quality but better variety

### Balanced Approach (Default)

```javascript
const recommendations = await getCollaborativeRecommendations(userId, {
  topK: 10,
  minSimilarity: 0.3,
  limit: 10
});
```

**Characteristics:**
- Recommended baseline configuration
- Good balance of quality and coverage
- Optimal performance for most use cases

---

## Comparison with Other Algorithms

| Algorithm | Speed | Quality | Coverage | Best For |
|-----------|-------|---------|----------|----------|
| **Collaborative (CF)** | Medium | High | Medium | Personalized browsing |
| **Content-Based** | Fast | Medium | Medium | Browse similar items |
| **Category-Based** | Fast | Low | High | Exploratory shopping |
| **Trending** | Fast | Medium | Low | Popular items |
| **Hybrid** | Slow | Highest | Highest | Best overall results |

---

## Troubleshooting

### Problem: "No recommendations returned"

**Causes & Solutions:**

```javascript
// 1. No similar users found
// Solution: Lower minSimilarity threshold
const recs = await getCollaborativeRecommendations(userId, {
  minSimilarity: 0.15  // was 0.3
});

// 2. All products already viewed
// Solution: Include viewed products in results
// (configure in service if needed)

// 3. Few users in database
// Solution: Use fallback algorithm
const recs = await fallbackToContentBased(userId);
```

### Problem: "Slow recommendations (~5+ seconds)"

**Causes & Solutions:**

```javascript
// 1. Too many users in topK
// Solution: Reduce topK
topK: 5  // was 10-20

// 2. Large product catalog
// Solution: Cache similarity matrix
// (See optimization strategies above)

// 3. Inefficient database queries
// Solution: Check database indexes on:
// - ViewHistory (userId, productId)
// - Order (userId, productId)
// - OrderItem (orderId, productId)
```

### Problem: "Low-quality recommendations"

**Causes & Solutions:**

```javascript
// 1. Similarity threshold too low
// Solution: Increase minSimilarity
minSimilarity: 0.5  // was 0.3

// 2. User has limited interaction history
// Solution: Blend with hybrid approach
// (combine with content-based)

// 3. Insufficient user diversity
// Solution: Increase maxDistance or use ensemble methods
```

---

## Files & Components

### Core Service
- **Location:** `backend/services/collaborativeFilteringService.js`
- **Lines:** 370+
- **Key Functions:**
  - `getCollaborativeRecommendations()` - Main recommendation function
  - `buildUserInteractionVector()` - Create user preference vectors
  - `calculateCosineSimilarity()` - Similarity calculation
  - `findSimilarUsers()` - User clustering
  - `analyzeUserSimilarity()` - Debug/analysis

### Controller
- **Location:** `backend/controllers/collaborativeFilteringController.js`
- **Key Handlers:**
  - `getRecommendations()` - API endpoint handler
  - `analyzeSimilarity()` - Analysis endpoint handler

### Routes
- **Location:** `backend/routes/recommendationRoutes.js`
- **New Endpoints:**
  - `GET /recommendations/:userId/collaborative-filtering`
  - `GET /recommendations/:userId/collaborative-filtering/analysis`

### Test Script
- **Location:** `backend/test-collaborative-filtering.sh`
- **Contains:** Examples, cURL commands, integration patterns

---

## Best Practices

1. **Always provide JWT token** for personalized recommendations
2. **Start with default parameters** (topK=10, minSimilarity=0.3)
3. **Monitor similarity scores** using analysis endpoint
4. **Combine with other algorithms** for robust recommendations
5. **Cache results** when possible to improve response time
6. **Test parameter tuning** for your specific user base
7. **Monitor cold start problems** for new users
8. **Log similarity metrics** for analytics and debugging

---

## Future Enhancements

1. **Matrix factorization** for improved scalability
2. **Real-time similarity caching** with Redis
3. **Time-decay weighting** for recent interactions
4. **Implicit feedback** from click-through data
5. **Hybrid ensemble methods** combining multiple similarity metrics
6. **Distributed computation** for very large datasets

---

## Related Documentation

- [Advanced Recommendations Guide](./ADVANCED_RECOMMENDATIONS_GUIDE.md)
- [Recommendation System Summary](./RECOMMENDATION_SYSTEM_SUMMARY.md)
- [API Reference](./API_REFERENCE.md)
- [Production Guide](./PRODUCTION_GUIDE.md)

---

**Last Updated:** 2024-01-XX
**Version:** 1.0.0
**Status:** Production-Ready
