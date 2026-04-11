#!/bin/bash

# ============================================================================
# CONTENT-BASED RECOMMENDATIONS - API TESTING GUIDE
# ============================================================================
# Ready-to-use cURL commands for testing content-based recommendation system
# 
# Setup:
# 1. Replace YOUR_JWT_TOKEN with actual token
# 2. Update localhost:3000 if needed
# 3. Run from the backend directory or adjust paths
# ============================================================================

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://localhost:3000/api"
USER_ID=1
PRODUCT_ID=5
JWT_TOKEN="your_jwt_token_here"

section() {
  echo -e "\n${BLUE}===============================================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}===============================================================${NC}\n"
}

instruction() {
  echo -e "${YELLOW}→ $1${NC}\n"
}

# ============================================================================
# SECTION 1: BASIC REQUESTS
# ============================================================================
section "SECTION 1: BASIC CONTENT-BASED RECOMMENDATIONS"

instruction "1.1 Default Content-Based Recommendations"
echo "Request:"
cat << 'EOF'
GET /api/recommendations/1/content-based-v2
Authorization: Bearer YOUR_JWT_TOKEN
EOF

echo -e "\ncURL Command:"
cat << 'EOF'
curl -X GET "http://localhost:3000/api/recommendations/1/content-based-v2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
EOF

echo -e "\nExpected Response (200 OK):"
cat << 'EOF'
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
    }
  ],
  "count": 1,
  "parameters": {
    "minScore": 0.3,
    "limit": 10,
    "excludePurchased": true,
    "excludeViewed": false
  }
}
EOF

echo ""

# ============================================================================
# SECTION 2: PARAMETER VARIATIONS
# ============================================================================
section "SECTION 2: PARAMETER VARIATIONS"

instruction "2.1 Strict Matching (High Quality Only)"
cat << 'EOF'
GET /api/recommendations/1/content-based-v2?minScore=0.6&limit=5
Authorization: Bearer YOUR_JWT_TOKEN

Purpose: Only show highly similar products (premium quality)
cURL:
curl -X GET "http://localhost:3000/api/recommendations/1/content-based-v2?minScore=0.6&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Use Cases: VIP customers, high-value items, curated lists
EOF

echo ""

instruction "2.2 Generous Matching (Broad Discovery)"
cat << 'EOF'
GET /api/recommendations/1/content-based-v2?minScore=0.2&limit=20&excludeViewed=true
Authorization: Bearer YOUR_JWT_TOKEN

Purpose: Show more diverse recommendations
cURL:
curl -X GET "http://localhost:3000/api/recommendations/1/content-based-v2?minScore=0.2&limit=20&excludeViewed=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Use Cases: Discovery sections, new user experience, exploration
EOF

echo ""

instruction "2.3 Balanced Approach (Recommended)"
cat << 'EOF'
GET /api/recommendations/1/content-based-v2?minScore=0.35&limit=12
Authorization: Bearer YOUR_JWT_TOKEN

Purpose: Good balance of quality and coverage
cURL:
curl -X GET "http://localhost:3000/api/recommendations/1/content-based-v2?minScore=0.35&limit=12" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

Use Cases: Homepage, default widget
EOF

echo ""

instruction "2.4 Include Viewed Products"
cat << 'EOF'
GET /api/recommendations/1/content-based-v2?excludeViewed=false
Authorization: Bearer YOUR_JWT_TOKEN

Purpose: Show similar products to items user viewed
Note: By default views are excluded, purchases always excluded
cURL:
curl -X GET "http://localhost:3000/api/recommendations/1/content-based-v2?excludeViewed=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo ""

# ============================================================================
# SECTION 3: DETAILED ANALYSIS
# ============================================================================
section "SECTION 3: ANALYZE PRODUCT RECOMMENDATION"

instruction "3.1 Get Detailed Analysis"
cat << 'EOF'
GET /api/recommendations/1/analyze/5
Authorization: Bearer YOUR_JWT_TOKEN

Purpose: Understand why a specific product is recommended
Shows: User profile, product attributes, similarity breakdown

cURL:
curl -X GET "http://localhost:3000/api/recommendations/1/analyze/5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo -e "\nExpected Response:"
cat << 'EOF'
{
  "userId": 1,
  "analysis": {
    "productId": 5,
    "productName": "Wireless Headphones",
    "userProfile": {
      "topCategories": ["electronics", "audio", "accessories"],
      "priceRange": {
        "min": 20,
        "max": 150,
        "avg": 75.50
      },
      "topKeywords": ["wireless", "bluetooth", "noise", "cancellation", "audio"]
    },
    "productAttributes": {
      "category": "electronics",
      "price": 79.99,
      "keyPhrase": "High quality wireless headphones..."
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
EOF

echo ""

# ============================================================================
# SECTION 4: SIMILAR PRODUCTS
# ============================================================================
section "SECTION 4: FIND SIMILAR PRODUCTS"

instruction "4.1 Get Similar Products"
cat << 'EOF'
GET /api/recommendations/similar/5?limit=10
Authorization: Bearer JWT_TOKEN

Purpose: Find products similar to a specific product
Use Case: "Customers also viewed...", product detail page

cURL:
curl -X GET "http://localhost:3000/api/recommendations/similar/5?limit=10" \
  -H "Authorization: Bearer JWT_TOKEN"
EOF

echo -e "\nExpected Response:"
cat << 'EOF'
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
    "limit": 10,
    "excludeOriginal": true
  }
}
EOF

echo ""

# ============================================================================
# SECTION 5: ERROR CASES
# ============================================================================
section "SECTION 5: ERROR CASES"

instruction "5.1 Invalid User ID"
cat << 'EOF'
Request:
GET /api/recommendations/invalid/content-based-v2
Authorization: Bearer YOUR_JWT_TOKEN

Response (400 Bad Request):
{
  "error": "Invalid user ID"
}
EOF

echo ""

instruction "5.2 Missing Authentication"
cat << 'EOF'
Request:
GET /api/recommendations/1/content-based-v2
(No Authorization header)

Response (401 Unauthorized):
{
  "error": "Authentication required"
}
EOF

echo ""

instruction "5.3 User Not Found"
cat << 'EOF'
Request:
GET /api/recommendations/99999/content-based-v2
Authorization: Bearer YOUR_JWT_TOKEN

Response (404 Not Found):
{
  "error": "User not found"
}
EOF

echo ""

# ============================================================================
# SECTION 6: BATCH OPERATIONS
# ============================================================================
section "SECTION 6: BATCH RECOMMENDATIONS"

instruction "6.1 Get Recommendations for Multiple Users"
cat << 'EOF'
# Sequential requests (not optimal but works)
for userId in 1 2 3 4 5; do
  echo "User $userId:"
  curl -s -X GET "http://localhost:3000/api/recommendations/$userId/content-based-v2?limit=5" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.count'
done
EOF

echo ""

instruction "6.2 Parallel Batch Requests"
cat << 'EOF'
# Using xargs for parallel processing (more efficient)
seq 1 5 | xargs -P 3 -I {} \
  curl -s -X GET "http://localhost:3000/api/recommendations/{}/content-based-v2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Parameters:
# -P 3 = 3 parallel processes (adjust for your system)
EOF

echo ""

# ============================================================================
# SECTION 7: PERFORMANCE TESTING
# ============================================================================
section "SECTION 7: PERFORMANCE BENCHMARKING"

instruction "7.1 Measure Response Time"
cat << 'EOF'
# Using curl -w option for timing
curl -X GET "http://localhost:3000/api/recommendations/1/content-based-v2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -w "\n\nResponse Time: %{time_total}s\n"

# Detailed breakdown:
curl -X GET "http://localhost:3000/api/recommendations/1/content-based-v2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -w "\nTiming Breakdown:\n" \
  -w "  DNS: %{time_namelookup}s\n" \
  -w "  Connect: %{time_connect}s\n" \
  -w "  Transfer: %{time_starttransfer}s\n" \
  -w "  Total: %{time_total}s\n"
EOF

echo ""

instruction "7.2 Load Test with Apache Bench"
cat << 'EOF'
# Simple load test: 100 requests, 10 concurrent
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/recommendations/1/content-based-v2

# Interpreting results:
# - Requests per second = throughput
# - Mean time per request = average latency
# - Failed requests = error count
# - 95% served within X ms = tail latency
EOF

echo ""

instruction "7.3 Stress Test with wrk"
cat << 'EOF'
# Run for 30 seconds with 4 threads, 10 connections
wrk -t4 -c10 -d30s \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/recommendations/1/content-based-v2

# Parameters explained:
# -t4 = 4 threads
# -c10 = 10 concurrent connections
# -d30s = run for 30 seconds
EOF

echo ""

# ============================================================================
# SECTION 8: REAL-WORLD SCENARIOS
# ============================================================================
section "SECTION 8: REAL-WORLD USE CASES"

instruction "8.1 E-commerce Homepage Widget"
cat << 'EOF'
# Show 8 recommended products, balanced quality
GET /api/recommendations/1/content-based-v2?minScore=0.35&limit=8

cURL:
curl -s -X GET "http://localhost:3000/api/recommendations/1/content-based-v2?minScore=0.35&limit=8" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.recommendations[] | {name: .productName, score: .contentScore}'
EOF

echo ""

instruction "8.2 Product Detail - Similar Products"
cat << 'EOF'
# Show 5 similar products on detail page
GET /api/recommendations/similar/5?limit=5

cURL:
curl -s -X GET "http://localhost:3000/api/recommendations/similar/5?limit=5" \
  -H "Authorization: Bearer JWT_TOKEN" | jq '.similarProducts'
EOF

echo ""

instruction "8.3 Category Page - Discovery"
cat << 'EOF'
# Broad recommendations for discovery
GET /api/recommendations/1/content-based-v2?minScore=0.2&limit=20&excludeViewed=true

cURL:
curl -s -X GET "http://localhost:3000/api/recommendations/1/content-based-v2?minScore=0.2&limit=20&excludeViewed=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo ""

instruction "8.4 Email Campaign - Premium Quality"
cat << 'EOF'
# Curated list for email (5 best matches only)
GET /api/recommendations/1/content-based-v2?minScore=0.65&limit=5

cURL:
curl -s -X GET "http://localhost:3000/api/recommendations/1/content-based-v2?minScore=0.65&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo ""

# ============================================================================
# SECTION 9: DEBUGGING & ANALYSIS
# ============================================================================
section "SECTION 9: DEBUGGING & ANALYSIS"

instruction "9.1 Check Recommendation Quality"
cat << 'EOF'
# Get recommendations with detailed scores
curl -s -X GET "http://localhost:3000/api/recommendations/1/content-based-v2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | \
  jq '.recommendations[] | {name: .productName, score: .contentScore, reason: .reason}'
EOF

echo ""

instruction "9.2 Analyze Individual Product"
cat << 'EOF'
# See why a product was/wasn't recommended
curl -s -X GET "http://localhost:3000/api/recommendations/1/analyze/5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.analysis.similarity'
EOF

echo ""

instruction "9.3 Monitor Score Distribution"
cat << 'EOF'
# Check distribution of scores
curl -s -X GET "http://localhost:3000/api/recommendations/1/content-based-v2?limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | \
  jq '.recommendations | map(.contentScore) | {min: min, max: max, avg: (add/length|round*100)/100}'
EOF

echo ""

# ============================================================================
# SECTION 10: INTEGRATION EXAMPLES
# ============================================================================
section "SECTION 10: FRONTEND INTEGRATION"

instruction "10.1 JavaScript/Fetch"
cat << 'EOF'
async function getContentBasedRecs(userId, minScore = 0.3, limit = 10) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({ minScore, limit });

  const response = await fetch(
    `http://localhost:3000/api/recommendations/${userId}/content-based-v2?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) throw new Error(`Error: ${response.status}`);
  return response.json();
}

// Usage
const recs = await getContentBasedRecs(1);
console.log(recs.recommendations);
EOF

echo ""

instruction "10.2 React Component"
cat << 'EOF'
import { useState, useEffect } from 'react';

export function ContentBasedRecs({ userId }) {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:3000/api/recommendations/${userId}/content-based-v2?limit=10`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const data = await res.json();
        setRecs(data.recommendations);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchRecs();
  }, [userId]);

  if (loading) return <Spinner />;

  return (
    <div className="recs">
      <h2>Recommended Products</h2>
      {recs.map(rec => (
        <ProductCard key={rec.productId} {...rec} />
      ))}
    </div>
  );
}
EOF

echo ""

# ============================================================================
# SECTION 11: QUICK COPY-PASTE
# ============================================================================
section "SECTION 11: QUICK COPY-PASTE REFERENCE"

echo "Default Request:"
cat << 'EOF'
curl -X GET "http://localhost:3000/api/recommendations/1/content-based-v2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo -e "\nAnalyze Specific Product:"
cat << 'EOF'
curl -X GET "http://localhost:3000/api/recommendations/1/analyze/5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo -e "\nFind Similar Products:"
cat << 'EOF'
curl -X GET "http://localhost:3000/api/recommendations/similar/5?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
EOF

echo -e "\nPretty Print JSON Result:"
cat << 'EOF'
curl -s -X GET "http://localhost:3000/api/recommendations/1/content-based-v2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.'
EOF

echo ""

echo -e "${GREEN}================ END OF TESTING GUIDE ================${NC}"
echo ""
echo "📚 Documentation:"
echo "   - Full Guide: CONTENT_BASED_GUIDE.md"
echo "   - Quick Ref: CONTENT_BASED_QUICK_REFERENCE.md"
echo "   - Service: backend/services/contentBasedRecommendationService.js"
echo "   - Controller: backend/controllers/contentBasedRecommendationController.js"
echo ""
