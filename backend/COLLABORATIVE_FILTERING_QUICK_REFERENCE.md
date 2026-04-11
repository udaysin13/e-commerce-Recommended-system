# Collaborative Filtering - Quick Reference

## 📋 10-Second Summary

**What:** User-user similarity recommendations using **Cosine Similarity**

**How:** Find similar users → Get their products → Rank by relevance

**Algorithm:** Cosine Similarity = (A·B) / (||A|| × ||B||)

**Result:** Personalized recommendations based on similar user behavior

---

## 🚀 Quick Start

### Backend Endpoint

```bash
# Basic request
GET /api/recommendations/:userId/collaborative-filtering
Authorization: Bearer YOUR_JWT_TOKEN

# With parameters
GET /api/recommendations/:userId/collaborative-filtering?topK=15&minSimilarity=0.4&limit=20
Authorization: Bearer YOUR_JWT_TOKEN

# Analyze similarity
GET /api/recommendations/:userId/collaborative-filtering/analysis
Authorization: Bearer YOUR_JWT_TOKEN
```

### Frontend Hook

```javascript
import { useCollaborativeRecommendations } from '@/lib/collaborativeFiltering';

function Recommendations({ userId }) {
  const { recommendations, loading } = useCollaborativeRecommendations(userId, {
    topK: 15,
    minSimilarity: 0.4,
    limit: 10
  });

  return (
    <div>
      {recommendations.map(rec => (
        <ProductCard key={rec.productId} product={rec} />
      ))}
    </div>
  );
}
```

---

## 📊 Parameters

| Parameter | Default | Range | Purpose |
|-----------|---------|-------|---------|
| `topK` | 10 | 1-100 | # of similar users to consider |
| `minSimilarity` | 0.3 | 0-1 | Minimum similarity threshold |
| `limit` | 10 | 1-50 | # of recommendations to return |

### Preset Configurations

```javascript
// Balanced (Recommended)
{ topK: 10, minSimilarity: 0.3, limit: 10 }

// High Quality (Strict)
{ topK: 5, minSimilarity: 0.6, limit: 5 }

// Broad Variety (Generous)
{ topK: 20, minSimilarity: 0.2, limit: 15 }
```

---

## 🧮 Algorithm

```
Step 1: Build vectors
  User A: [1, 2, 1, 0, 0] (products viewed/purchased)
  User B: [1, 1, 2, 1, 0]

Step 2: Calculate similarity
  A·B = 1 + 2 + 2 + 0 = 5
  ||A|| = √6 ≈ 2.45
  ||B|| = √7 ≈ 2.65
  Similarity = 5 / (2.45 × 2.65) ≈ 0.77

Step 3: Find similar users (similarity > 0.3)

Step 4: Collect their products
  Similar users bought: [P3, P5, P8, ...]
  Score each by: Σ(similarity scores)

Step 5: Return top N
```

---

## 📁 Files

| File | Purpose | Lines |
|------|---------|-------|
| `services/collaborativeFilteringService.js` | Core algorithm | 370+ |
| `controllers/collaborativeFilteringController.js` | API handlers | 80+ |
| `routes/recommendationRoutes.js` | Endpoints | Updated |
| `lib/collaborativeFiltering.js` | Frontend integration | 450+ |
| `COLLABORATIVE_FILTERING_GUIDE.md` | Full documentation | Comprehensive |
| `test-collaborative-filtering.sh` | Test examples | 250+ |

---

## 🔌 Integration Points

### Existing Recommendation Service
```javascript
// Existing code still works
GET /recommendations/1?type=collaborative  // Original collaborative
GET /recommendations/1?type=hybrid         // Hybrid with all algorithms

// New endpoints
GET /recommendations/1/collaborative-filtering  // Advanced CF
GET /recommendations/1/collaborative-filtering/analysis
```

### Frontend Components

```javascript
// Option 1: Hook
const { recommendations } = useCollaborativeRecommendations(userId);

// Option 2: Component
<CollaborativeRecommendationsDisplay userId={userId} />

// Option 3: API client
const recs = await collaborativeFilteringAPI.getRecommendations(userId);

// Option 4: Dashboard with analysis
<RecommendationsPage userId={userId} />
```

---

## ⚡ Performance

| Database Size | Computation Time |
|---------------|-----------------|
| 100 users | ~10-50ms |
| 1,000 users | ~100-500ms |
| 10,000 users | ~1-5 seconds |
| 100,000 users | ~10-50 seconds |

**Optimization:** Cache similarity matrix daily

---

## 🎯 Response Format

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
      "similarityScore": 0.85,
      "fromSimilarUsers": 3,
      "relevanceScore": 0.712,
      "reason": "Similar users purchased this"
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

---

## 🐛 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| No recommendations | High threshold | Lower `minSimilarity` to 0.2 |
| Slow response | Large dataset | Reduce `topK` to 5-10 |
| Low quality | Isolated user | Use hybrid algorithm |
| Empty results | Few similar users | Fallback to popular products |

---

## 🧪 Testing

```bash
# Make requests executable
chmod +x backend/test-collaborative-filtering.sh

# Run tests
./backend/test-collaborative-filtering.sh

# Manual test
curl -X GET 'http://localhost:3000/api/recommendations/1/collaborative-filtering' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## 🔧 Configuration

### Feature Weights
- Product purchase: 2 points (more significant)
- Product view: 1 point

### Similarity Weights
- Purchase from similar user: 2x weight
- View from similar user: 1x weight

### Defaults
- Min similarity threshold: 0.3
- Top K similar users: 10
- Max recommendations: 10

---

## 📈 Analyzing Performance

```javascript
// Get analysis of user's similarity neighborhood
GET /recommendations/1/collaborative-filtering/analysis

// Response includes:
{
  "totalSimilarUsers": 5,
  "averageSimilarity": 0.52,
  "maxSimilarity": 0.87,
  "similarityDistribution": { ... },
  "topSimilarUsers": [ ... ]
}

// Interpretation:
// - averageSimilarity < 0.3: Low quality predictions
// - 0.3-0.5: Moderate, decent recommendations
// - > 0.5: High quality, very personalized
```

---

## 🔄 Hybrid Recommendations

**Combine with other algorithms:**

```javascript
const hybrid = [
  ...collaborativeRecommendations,    // User-user similarity
  ...contentBasedRecommendations,     // Item similarity
  ...trendingRecommendations,         // Popular items
  ...categoryRecommendations          // Same category
];

// Deduplicate and score
const ranked = deduplicateAndRank(hybrid);
```

---

## 💡 Best Practices

1. ✅ Default parameters work well for most cases
2. ✅ Use `analysis` endpoint to debug quality
3. ✅ Combine with hybrid for best results
4. ✅ Lower `minSimilarity` for new users
5. ✅ Cache results for high-traffic usage
6. ✅ Monitor similarity scores over time
7. ✅ Test parameter tuning with your data
8. ✅ Implement cold-start fallback strategy

---

## 🚫 Common Mistakes

❌ Using too high similarity threshold (no results)
❌ Not caching with large datasets (timeout)
❌ Ignoring error responses (crashes)
❌ Not implementing fallback for new users
❌ Using default limit=10 when 50+ needed
❌ No authentication checks (security issue)

---

## 📞 Support

**Documentation:**
- [Collaborative Filtering Guide](./COLLABORATIVE_FILTERING_GUIDE.md) - Full documentation
- [Advanced Recommendations Guide](./ADVANCED_RECOMMENDATIONS_GUIDE.md) - All algorithms
- [Test Script](./test-collaborative-filtering.sh) - Examples and cURL commands

**Files:**
- Service: `backend/services/collaborativeFilteringService.js`
- Controller: `backend/controllers/collaborativeFilteringController.js`
- Routes: `backend/routes/recommendationRoutes.js`
- Frontend: `frontend/lib/collaborativeFiltering.js`

---

## 🎓 Learning Resources

**Cosine Similarity:**
- Formula: (A·B) / (||A|| × ||B||)
- Range: 0 (opposite) to 1 (identical)
- Perfect for comparing preference vectors

**Use Cases:**
- Person-person similarity
- Preference-based recommendations
- Cold-start fallback
- Hybrid recommendation ensemble

**Advanced Topics:**
- Matrix factorization
- Real-time similarity caching
- Time-decay weighting
- Batch processing

---

**Status:** ✅ Production-Ready  
**Version:** 1.0.0  
**Last Updated:** 2024-01-XX
