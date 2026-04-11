# Content-Based Recommendation System Guide

## Overview

This guide covers the **Content-Based Recommendation Engine** - a system that recommends products based on similarity to items the user has already purchased or viewed.

**Core Concept:** If a user likes products in category X with price Y and features Z, recommend other products with similar characteristics.

---

## Quick Start

### Get Recommendations
```bash
curl -X GET 'http://localhost:3000/api/recommendations/1/content-based-v2' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### With Parameters
```bash
curl -X GET 'http://localhost:3000/api/recommendations/1/content-based-v2?minScore=0.4&limit=15' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Analyze a Product
```bash
curl -X GET 'http://localhost:3000/api/recommendations/1/analyze/5' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Find Similar Products
```bash
curl -X GET 'http://localhost:3000/api/recommendations/similar/5?limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## Algorithm Details

### How It Works

```
Step 1: BUILD USER PROFILE
  ├─ Get all user's purchases (weighted 2x)
  ├─ Get all user's views (weighted 1x)
  └─ Extract:
      ├─ Top categories
      ├─ Price range (min, avg, max)
      └─ Keywords from descriptions

Step 2: CREATE CANDIDATE POOL
  ├─ Get all in-stock products
  └─ Filter out:
      ├─ Already purchased (by default)
      └─ Already viewed (optional)

Step 3: SCORE EACH PRODUCT
  ├─ Category Match: 0 or 1 (40% weight)
  ├─ Price Similarity: 0-1 (30% weight)
  │   └─ Products within 30% of avg price score high
  └─ Description Similarity: 0-1 (30% weight)
      └─ Count matching keywords

Step 4: CALCULATE FINAL SCORE
  └─ Score = (0.4 × category) + (0.3 × price) + (0.3 × description)

Step 5: RANK & RETURN
  ├─ Filter by minimum score threshold
  ├─ Sort by score (highest first)
  └─ Return top N
```

### Scoring Components

**Category Match (40%)**
```
If product category matches any user's top 5 categories: 1.0
Otherwise: 0.0
```

**Price Similarity (30%)**
```
Formula: 1 - abs(productPrice - avgUserPrice) / (avgUserPrice × 0.5)

Example:
  User avg price: $100
  Product price: $95
  Difference: $5
  Similarity: 1 - (5 / 50) = 0.9
```

**Description Similarity (30%)**
```
Formula: (matching keywords) / (total user keywords)

Example:
  User keywords: [wireless, headphones, audio, quality, bluetooth]
  Product description contains: [wireless, audio, quality]
  Similarity: 3 / 5 = 0.6
```

---

## API Endpoints

### 1. Get Content-Based Recommendations

**Endpoint:** `GET /api/recommendations/:userId/content-based-v2`

**Authentication:** Required (JWT)

**Query Parameters:**

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `minScore` | float | 0.3 | 0-1 | Minimum similarity score |
| `limit` | integer | 10 | 1-50 | Max recommendations |
| `excludePurchased` | boolean | true | - | Exclude purchased products |
| `excludeViewed` | boolean | false | - | Exclude viewed products |

**Example Requests:**

```bash
# Default parameters
GET /api/recommendations/1/content-based-v2

# Strict matching (higher quality)
GET /api/recommendations/1/content-based-v2?minScore=0.6&limit=5

# Generous matching (more variety)
GET /api/recommendations/1/content-based-v2?minScore=0.2&limit=20&excludeViewed=false

# Include viewed products
GET /api/recommendations/1/content-based-v2?excludeViewed=true
```

**Success Response (200):**

```json
{
  "userId": 1,
  "algorithm": "Content-Based Filtering",
  "recommendations": [
    {
      "productId": 5,
      "productName": "Wireless Headphones",
      "category": "electronics",
      "price": 79.99,
      "discount": 0,
      "imageUrl": "https://...",
      "rating": 4.5,
      "reviews": 128,
      "contentScore": 0.82,
      "categoryScore": 1,
      "priceScore": 0.75,
      "descriptionScore": 0.65,
      "reason": "Similar to products you've purchased"
    },
    {
      "productId": 8,
      "productName": "Audio Cable",
      "category": "electronics",
      "price": 12.99,
      "discount": 0,
      "imageUrl": "https://...",
      "rating": 4.2,
      "reviews": 45,
      "contentScore": 0.68,
      "categoryScore": 1,
      "priceScore": 0.90,
      "descriptionScore": 0.42,
      "reason": "Similar to items in your interests"
    }
  ],
  "count": 2,
  "parameters": {
    "minScore": 0.3,
    "limit": 10,
    "excludePurchased": true,
    "excludeViewed": false
  }
}
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `contentScore` | Overall content similarity (0-1) |
| `categoryScore` | Category match (0-1) |
| `priceScore` | Price similarity (0-1) |
| `descriptionScore` | Description keyword match (0-1) |
| `reason` | Why this product was recommended |

---

### 2. Analyze Product Recommendation

**Endpoint:** `GET /api/recommendations/:userId/analyze/:productId`

**Purpose:** Debug endpoint to understand why a product is recommended

**Example Request:**
```bash
GET /api/recommendations/1/analyze/5
```

**Success Response (200):**

```json
{
  "userId": 1,
  "analysis": {
    "userId": 1,
    "productId": 5,
    "productName": "Wireless Headphones",
    "userProfile": {
      "topCategories": ["electronics", "audio", "accessories"],
      "priceRange": {
        "min": 20,
        "max": 150,
        "avg": 75.5
      },
      "topKeywords": ["wireless", "bluetooth", "noise", "cancellation", "audio"]
    },
    "productAttributes": {
      "category": "electronics",
      "price": 79.99,
      "keyPhrase": "High quality wireless headphones with active noise cancellation"
    },
    "similarity": {
      "totalScore": 0.82,
      "categoryMatch": true,
      "priceMatch": true,
      "descriptionMatch": true,
      "details": {
        "categoryScore": 1,
        "priceScore": 0.87,
        "descriptionScore": 0.65
      }
    },
    "interpretation": "Highly recommended"
  }
}
```

---

### 3. Get Similar Products

**Endpoint:** `GET /api/recommendations/similar/:productId`

**Purpose:** Find products similar to a specific product

**Query Parameters:**

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `limit` | 10 | 1-50 | Number of similar products |
| `excludeOriginal` | true | - | Exclude reference product |

**Example Request:**
```bash
GET /api/recommendations/similar/5?limit=15
```

**Success Response (200):**

```json
{
  "referenceProductId": 5,
  "algorithm": "Content-Based Product Similarity",
  "similarProducts": [
    {
      "productId": 12,
      "productName": "Noise-Cancelling Headphones",
      "category": "electronics",
      "price": 89.99,
      "imageUrl": "https://...",
      "rating": 4.6,
      "similarityScore": 0.89,
      "matchDetails": {
        "category": true,
        "priceRange": true
      }
    }
  ],
  "count": 1,
  "parameters": {
    "limit": 15,
    "excludeOriginal": true
  }
}
```

---

## Performance Characteristics

### Time Complexity

```
For each user recommendation:
  Time ≈ O(P)
  P = number of products in catalog

Practical:
  - 100 products: ~20-50ms
  - 1,000 products: ~50-150ms
  - 10,000 products: ~100-500ms
  - 100,000 products: ~500-2000ms
```

### Memory Usage

```
User profile storage:
  - Categories: ~100 bytes
  - Price range: ~50 bytes
  - Keywords: ~500 bytes
  - Total per user: ~1KB
```

### Optimization Tips

1. **Cache user profiles** - Regenerate daily or weekly
2. **Index product categories** - Speed up filtering
3. **Precompute keywords** - Store in product record
4. **Limit candidate pool** - Filter by category first
5. **Use batch operations** for multiple users

---

## Configuration Presets

### Balanced (Recommended)
```javascript
{
  minScore: 0.3,
  limit: 10,
  excludePurchased: true,
  excludeViewed: false
}
// Use for: General e-commerce recommendations
// Quality: Good | Coverage: Broad | Speed: 50-150ms
```

### Strict (Premium Quality)
```javascript
{
  minScore: 0.6,
  limit: 5,
  excludePurchased: true,
  excludeViewed: false
}
// Use for: High-value items, VIP customers
// Quality: Highest | Coverage: Limited | Speed: 30-80ms
```

### Generous (Broad Discovery)
```javascript
{
  minScore: 0.2,
  limit: 20,
  excludePurchased: true,
  excludeViewed: true
}
// Use for: Exploration, new user experience
// Quality: Medium | Coverage: Broad | Speed: 100-300ms
```

---

## Comparison with Other Algorithms

| Algorithm | Approach | Pros | Cons |
|-----------|----------|------|------|
| **Content-Based** | Product similarity | No cold-start | Can be repetitive |
| **Collaborative** | User similarity | Serendipitous finds | Needs data |
| **Category-Based** | Same category | Fast, simple | Low relevance |
| **Trending** | Popular items | Always relevant | Not personalized |
| **Hybrid** | Multiple methods | Best quality | More complex |

---

## Frontend Integration

### React Hook
```jsx
import { useState, useEffect } from 'react';

function useContentBasedRecommendations(userId) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchRecs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:3000/api/recommendations/${userId}/content-based-v2?minScore=0.4&limit=10`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await res.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [userId]);

  return { recommendations, loading, error };
}
```

### Component
```jsx
function ContentBasedRecommendations({ userId }) {
  const { recommendations, loading } = useContentBasedRecommendations(userId);

  if (loading) return <Spinner />;

  return (
    <div className="content-based-recs">
      <h2>Products Like Your Favorites</h2>
      <div className="product-grid">
        {recommendations.map(rec => (
          <ProductCard
            key={rec.productId}
            product={rec}
            badge={`${Math.round(rec.contentScore * 100)}% Match`}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| No recommendations | Too high score threshold | Lower `minScore` to 0.2 |
| Slow recommendations | Too many products | Limit product catalog or use caching |
| Low quality recs | Few user interactions | Use hybrid with collaborative |
| Repetitive recs | Limited product variety | Increase `minScore` to diversify |
| Empty profile | New user | Fallback to trending products |

---

## Best Practices

1. ✅ Use default parameters for general use
2. ✅ Combine with collaborative filtering for hybrid
3. ✅ Cache user profiles for performance
4. ✅ Monitor score distributions
5. ✅ Test parameter tuning with your catalog
6. ✅ Use analysis endpoint to debug
7. ✅ Combine with other algorithms for variety

---

## Files & Components

### Backend
- **Service:** `backend/services/contentBasedRecommendationService.js` (450+ lines)
- **Controller:** `backend/controllers/contentBasedRecommendationController.js` (80+ lines)
- **Routes:** Updated in `backend/routes/recommendationRoutes.js`

### Frontend
- **Hook:** Available in frontend integration files

---

## Use Cases

### E-commerce Homepage
```javascript
// Show products similar to user's favorites
GET /recommendations/1/content-based-v2?limit=10&minScore=0.4
```

### Similar Products Page
```javascript
// "Customers also viewed" section
GET /recommendations/similar/5?limit=8
```

### Product Details
```javascript
// Why this product was recommended
GET /recommendations/1/analyze/5
```

---

## Related Documentation

- [Advanced Recommendations Guide](./ADVANCED_RECOMMENDATIONS_GUIDE.md)
- [Collaborative Filtering Guide](./COLLABORATIVE_FILTERING_GUIDE.md)
- [Production Guide](./PRODUCTION_GUIDE.md)

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0  
**Last Updated:** 2024-01-XX
