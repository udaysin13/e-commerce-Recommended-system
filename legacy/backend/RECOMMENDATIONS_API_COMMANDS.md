# Recommendation System - API Command Reference

## 🚀 Quick Commands

### Start Backend
```bash
cd backend
npm run dev
```

### Test in Browser (Open URL)
```
http://localhost:5000/recommendations/1
```

### Run All Tests
```bash
cd backend
bash test-recommendations.sh
```

---

## 📋 API Commands by Category

### Main Endpoint (Start Here)
```bash
# Hybrid recommendations (best of all algorithms)
curl http://localhost:5000/recommendations/1

# With options
curl "http://localhost:5000/recommendations/1?type=hybrid&limit=12"
curl "http://localhost:5000/recommendations/1?limit=20"
```

### Different Algorithm Types
```bash
# Content-based (based on browsing history)
curl "http://localhost:5000/recommendations/1?type=content&limit=8"

# Collaborative (based on similar users)
curl "http://localhost:5000/recommendations/1?type=collaborative&limit=8"

# Category-based (popular in favorite categories)
curl "http://localhost:5000/recommendations/1?type=category&limit=8"

# Popular products (highest-rated)
curl "http://localhost:5000/recommendations/1?type=popular&limit=8"

# Trending (newest high-rated)
curl "http://localhost:5000/recommendations/1?type=trending&limit=8"
```

### Direct Algorithm Endpoints
```bash
# Hybrid recommendations
curl http://localhost:5000/recommendations/1/hybrid

# Content-based
curl http://localhost:5000/recommendations/1/content-based

# Collaborative
curl http://localhost:5000/recommendations/1/collaborative

# Category-based
curl http://localhost:5000/recommendations/1/category
```

### No User ID Required
```bash
# Popular products
curl http://localhost:5000/recommendations/popular
curl "http://localhost:5000/recommendations/popular?limit=10"

# Trending products
curl http://localhost:5000/recommendations/trending
curl "http://localhost:5000/recommendations/trending?limit=10"
```

### Similar Products (Product ID)
```bash
# Products similar to product 5
curl http://localhost:5000/recommendations/similar/5
curl "http://localhost:5000/recommendations/similar/5?limit=10"

# For different products
curl http://localhost:5000/recommendations/similar/1
curl http://localhost:5000/recommendations/similar/10
```

### Different Users
```bash
# User 1 (default)
curl http://localhost:5000/recommendations/1

# User 2
curl http://localhost:5000/recommendations/2

# User 100
curl http://localhost:5000/recommendations/100
```

### Custom Limits
```bash
# Get only 5 recommendations
curl "http://localhost:5000/recommendations/1?limit=5"

# Get 20 recommendations
curl "http://localhost:5000/recommendations/1?limit=20"

# Get 50 recommendations
curl "http://localhost:5000/recommendations/1?limit=50"
```

---

## 🧪 Test Sequences

### Complete Test (All Endpoints)
```bash
# Test 1: Basic hybrid
echo "=== Test 1: Hybrid ==="
curl http://localhost:5000/recommendations/1
echo ""

# Test 2: Content-based
echo "=== Test 2: Content-Based ==="
curl "http://localhost:5000/recommendations/1?type=content&limit=5"
echo ""

# Test 3: Collaborative
echo "=== Test 3: Collaborative ==="
curl "http://localhost:5000/recommendations/1?type=collaborative&limit=5"
echo ""

# Test 4: Category
echo "=== Test 4: Category ==="
curl "http://localhost:5000/recommendations/1?type=category&limit=5"
echo ""

# Test 5: Popular
echo "=== Test 5: Popular ==="
curl http://localhost:5000/recommendations/popular
echo ""

# Test 6: Trending
echo "=== Test 6: Trending ==="
curl http://localhost:5000/recommendations/trending
echo ""

# Test 7: Similar products
echo "=== Test 7: Similar Products ==="
curl http://localhost:5000/recommendations/similar/5
echo ""
```

### Quick Performance Test
```bash
# Measure response time
time curl http://localhost:5000/recommendations/1

# Test with jq for pretty JSON
curl http://localhost:5000/recommendations/1 | jq .

# Extract just product names
curl http://localhost:5000/recommendations/1 | jq '.recommendations[].name'

# Extract count
curl http://localhost:5000/recommendations/1 | jq '.count'
```

---

## 📊 Response Inspection

### View Full Response
```bash
curl http://localhost:5000/recommendations/1 | jq .
```

### View Just Recommendations
```bash
curl http://localhost:5000/recommendations/1 | jq '.recommendations'
```

### View Single Product
```bash
curl http://localhost:5000/recommendations/1 | jq '.recommendations[0]'
```

### Count Recommendations
```bash
curl http://localhost:5000/recommendations/1 | jq '.count'
```

### View Algorithm Used
```bash
curl http://localhost:5000/recommendations/1 | jq '.algorithm'
```

### View Why Each Product Was Recommended
```bash
curl http://localhost:5000/recommendations/1 | jq '.recommendations[] | {name, recommendedBecause}'
```

---

## 🔍 Troubleshooting Commands

### Check Backend is Running
```bash
curl http://localhost:5000
```

### Test with Different User IDs
```bash
curl http://localhost:5000/recommendations/1
curl http://localhost:5000/recommendations/2
curl http://localhost:5000/recommendations/5
```

### Test Invalid User (Error Handling)
```bash
curl http://localhost:5000/recommendations/invalid
curl http://localhost:5000/recommendations/0
curl http://localhost:5000/recommendations/-1
```

### Test Empty Parameters
```bash
curl "http://localhost:5000/recommendations/1?type="
```

### Get Help from API
```bash
# Returns endpoint information
curl http://localhost:5000/recommendations/1 | jq '.queryParameters'
```

---

## 💻 Postman Collection

### Create Requests

**Request 1: Hybrid Recommendations**
```
GET http://localhost:5000/recommendations/1
```

**Request 2: Content-Based**
```
GET http://localhost:5000/recommendations/1?type=content&limit=5
```

**Request 3: Popular Products**
```
GET http://localhost:5000/recommendations/popular
```

**Request 4: Similar Products**
```
GET http://localhost:5000/recommendations/similar/5
```

### Postman Variables
```
{{baseUrl}} = http://localhost:5000
{{userId}} = 1
{{productId}} = 5
{{limit}} = 12
```

### Use Variables in Requests
```
GET {{baseUrl}}/recommendations/{{userId}}
GET {{baseUrl}}/recommendations/{{userId}}?type=content&limit={{limit}}
GET {{baseUrl}}/recommendations/popular?limit={{limit}}
GET {{baseUrl}}/recommendations/similar/{{productId}}
```

---

## 🎯 Parameter Combinations

### By Use Case

**Homepage - Show Best Recommendations**
```bash
curl "http://localhost:5000/recommendations/1?type=hybrid&limit=12"
```

**Product Page - Show Similar Items**
```bash
curl "http://localhost:5000/recommendations/similar/5?limit=8"
```

**Best Sellers Page - Show Popular**
```bash
curl "http://localhost:5000/recommendations/popular?limit=20"
```

**What's New Section - Show Trending**
```bash
curl "http://localhost:5000/recommendations/trending?limit=8"
```

**Category Page - User's Favorite Category**
```bash
curl "http://localhost:5000/recommendations/1?type=category&limit=10"
```

**Cross-sell - Similar Users Bought**
```bash
curl "http://localhost:5000/recommendations/1?type=collaborative&limit=5"
```

---

## 📈 Limits

| Limit | Use Case | Command |
|-------|----------|---------|
| 5 | "Top 5" widget | `?limit=5` |
| 8 | Standard section | `?limit=8` |
| 12 | Full homepage | `?limit=12` |
| 20 | Category page | `?limit=20` |
| 50 | Admin dashboard | `?limit=50` |
| 100 | Max (API limit) | `?limit=100` |

---

## 🔗 Frontend Integration (JavaScript)

### Import Functions
```javascript
import {
  fetchRecommendations,
  fetchHybridRecommendations,
  fetchContentBasedRecommendations,
  fetchCollaborativeRecommendations,
  fetchCategoryRecommendations,
  fetchPopularProducts,
  fetchTrendingProducts,
  fetchSimilarProducts
} from '@/lib/api';
```

### Usage Examples
```javascript
// Get hybrid recommendations
const data = await fetchRecommendations(1, 'hybrid', 12);

// Get content-based
const data = await fetchContentBasedRecommendations(1, 8);

// Get popular
const data = await fetchPopularProducts(8);

// Get similar to product 5
const data = await fetchSimilarProducts(5, 8);
```

### In Components
```javascript
useEffect(() => {
  fetchRecommendations(userId, 'hybrid', 8)
    .then(data => setProducts(data.recommendations))
    .catch(err => console.error(err));
}, [userId]);
```

---

## 📝 Response Examples

### Success Response (Populated)
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
      "inStock": true,
      "recommendedBecause": "Based on your browsing history"
    }
  ],
  "algorithm": "Hybrid (Combined)",
  "userId": 1,
  "type": "hybrid",
  "count": 1
}
```

### Error Response (Invalid User)
```json
{
  "error": "Valid userId is required"
}
```

### Popular Products Response
```json
{
  "recommendations": [
    {
      "id": 1,
      "name": "Best Seller",
      "rating": 4.8,
      "reviews": 500,
      "recommendedBecause": "Popular with all users"
    }
  ],
  "algorithm": "Popularity",
  "count": 1
}
```

---

## ⏱️ Performance Testing

### Time Single Request
```bash
time curl http://localhost:5000/recommendations/1
```

### Benchmark Multiple Requests
```bash
for i in {1..10}; do
  time curl http://localhost:5000/recommendations/1 > /dev/null
done
```

### Load Test (Install Apache Bench)
```bash
ab -n 100 -c 10 http://localhost:5000/recommendations/1
```

---

## 🎓 Learning Path

1. **Step 1**: Test simple endpoint
   ```bash
   curl http://localhost:5000/recommendations/1
   ```

2. **Step 2**: Test with different algorithms
   ```bash
   curl "http://localhost:5000/recommendations/1?type=content"
   curl "http://localhost:5000/recommendations/1?type=collaborative"
   ```

3. **Step 3**: Test no-user endpoints
   ```bash
   curl http://localhost:5000/recommendations/popular
   curl http://localhost:5000/recommendations/trending
   ```

4. **Step 4**: Test similar products
   ```bash
   curl http://localhost:5000/recommendations/similar/5
   ```

5. **Step 5**: Integrate in frontend
   ```javascript
   const recs = await fetchRecommendations(userId);
   ```

---

## 📚 More Info

- **Full Guide**: See `RECOMMENDATIONS_GUIDE.md`
- **Quick Ref**: See `RECOMMENDATIONS_QUICK_REFERENCE.md`
- **Summary**: See `RECOMMENDATION_SYSTEM_SUMMARY.md`
- **Complete**: See `RECOMMENDATIONS_IMPLEMENTATION_COMPLETE.md`

---

**Ready to test?** Pick a command above and run it! 🚀
